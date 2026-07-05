import {
  getFirestore,
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, runTransaction, increment,
  arrayUnion, arrayRemove, deleteField,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureAuth } from './dataService';
import { containsBlockedContent } from './contentFilter';
import '../lib/firebase';

const db = getFirestore();

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CommunityProfile {
  uid: string;
  displayName: string;
  avatarEmoji: string;
  agreedToGuidelines: boolean;
  agreedAt: string | null;
  blockedUsers: string[];
  blockedMeta?: Record<string, string>; // uid → displayName, populated at block time
  isBanned: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  displayName: string;
  avatarEmoji: string;
  body: string;
  createdAt: any; // Firestore Timestamp
  reactionCount: number;
  commentCount: number;
  reportCount: number;
  status: 'active' | 'hidden' | 'removed';
}

export interface CommunityComment {
  id: string;
  authorId: string;
  displayName: string;
  avatarEmoji: string;
  body: string;
  createdAt: any; // Firestore Timestamp
  reportCount: number;
  status: 'active' | 'hidden' | 'removed';
}

export interface WriteResult {
  ok: boolean;
  reason?: string;
}

export type ReportReason =
  | 'harassment'
  | 'hate'
  | 'graphic'
  | 'privacy'
  | 'spam'
  | 'dangerous'
  | 'other';

// ── Constants ──────────────────────────────────────────────────────────────────

export const AVATAR_OPTIONS = [
  '🌻', '🦋', '🌙', '⭐', '🌿', '🐢', '🦉', '🌸', '🍃', '🐝',
  '🌈', '🕊️', '🐨', '🦔', '🌷', '🐧', '🦭', '🌊', '🍀', '🐬',
];

// Post or comment auto-hides (status:'hidden') after this many reports, pending review.
export const AUTO_HIDE_THRESHOLD = 3;

// ── Profile ────────────────────────────────────────────────────────────────────

export const getCommunityProfile = async (): Promise<CommunityProfile | null> => {
  try {
    const uid = await ensureAuth();
    const snap = await getDoc(doc(db, 'users', uid, 'community', 'profile'));
    if (snap.exists()) {
      const profile = snap.data() as CommunityProfile;
      await AsyncStorage.setItem('bitzaCommunityProfile', JSON.stringify(profile));
      return profile;
    }
  } catch {
    // Fall through to AsyncStorage
  }
  const local = await AsyncStorage.getItem('bitzaCommunityProfile');
  return local ? (JSON.parse(local) as CommunityProfile) : null;
};

export const createCommunityProfile = async (
  displayName: string,
  avatarEmoji: string,
): Promise<CommunityProfile> => {
  const uid = await ensureAuth();
  const profile: CommunityProfile = {
    uid,
    displayName: displayName.trim(),
    avatarEmoji,
    agreedToGuidelines: true,
    agreedAt: new Date().toISOString(),
    blockedUsers: [],
    blockedMeta: {},
    isBanned: false,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', uid, 'community', 'profile'), profile);
  await AsyncStorage.setItem('bitzaCommunityProfile', JSON.stringify(profile));
  return profile;
};

export const isDisplayNameOk = (name: string): boolean => {
  const n = name.trim();
  return n.length >= 2 && n.length <= 24;
};

// ── Feed ───────────────────────────────────────────────────────────────────────

// The subscription delivers all active posts; the caller filters by blockedUsers
// at render time so new blocks take effect without restarting the subscription.
export const subscribeToFeed = (
  onData: (posts: CommunityPost[]) => void,
  onError: (e: unknown) => void,
): (() => void) => {
  const q = query(
    collection(db, 'communityPosts'),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  return onSnapshot(
    q,
    (snap) => {
      const posts: CommunityPost[] = [];
      snap.forEach((d) => {
        const data = { id: d.id, ...d.data() } as CommunityPost;
        if (data.status === 'active') posts.push(data);
      });
      onData(posts);
    },
    onError,
  );
};

// Comments: same pattern — delivers all active comments, caller filters by blockedUsers.
export const subscribeToComments = (
  postId: string,
  onData: (comments: CommunityComment[]) => void,
  onError: (e: unknown) => void,
): (() => void) => {
  const q = query(
    collection(db, 'communityPosts', postId, 'comments'),
    orderBy('createdAt', 'asc'),
    limit(200),
  );
  return onSnapshot(
    q,
    (snap) => {
      const comments: CommunityComment[] = [];
      snap.forEach((d) => {
        const data = { id: d.id, ...d.data() } as CommunityComment;
        if (data.status === 'active') comments.push(data);
      });
      onData(comments);
    },
    onError,
  );
};

export const getPost = async (postId: string): Promise<CommunityPost | null> => {
  const snap = await getDoc(doc(db, 'communityPosts', postId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as CommunityPost) : null;
};

// ── Post / comment writes ──────────────────────────────────────────────────────

export const createPost = async (body: string): Promise<WriteResult> => {
  const check = containsBlockedContent(body);
  if (check.blocked) return { ok: false, reason: check.reason };

  const profile = await getCommunityProfile();
  if (!profile) return { ok: false, reason: 'Please set up your community profile first.' };
  if (profile.isBanned) return { ok: false, reason: 'Your community access is suspended.' };
  if (!body.trim()) return { ok: false, reason: 'Write something first.' };
  if (body.length > 2000) return { ok: false, reason: 'Posts must be under 2 000 characters.' };

  await addDoc(collection(db, 'communityPosts'), {
    authorId: profile.uid,
    displayName: profile.displayName,
    avatarEmoji: profile.avatarEmoji,
    body: body.trim(),
    createdAt: serverTimestamp(),
    reactionCount: 0,
    commentCount: 0,
    reportCount: 0,
    status: 'active',
  });
  return { ok: true };
};

export const addComment = async (
  postId: string,
  body: string,
): Promise<WriteResult> => {
  const check = containsBlockedContent(body);
  if (check.blocked) return { ok: false, reason: check.reason };

  const profile = await getCommunityProfile();
  if (!profile) return { ok: false, reason: 'Please set up your community profile first.' };
  if (profile.isBanned) return { ok: false, reason: 'Your community access is suspended.' };
  if (!body.trim()) return { ok: false, reason: 'Write something first.' };
  if (body.length > 1000) return { ok: false, reason: 'Comments must be under 1 000 characters.' };

  const postRef = doc(db, 'communityPosts', postId);
  const newCommentRef = doc(collection(db, 'communityPosts', postId, 'comments'));

  await runTransaction(db, async (tx) => {
    const postSnap = await tx.get(postRef);
    if (!postSnap.exists()) throw new Error('Post not found.');
    tx.set(newCommentRef, {
      authorId: profile.uid,
      displayName: profile.displayName,
      avatarEmoji: profile.avatarEmoji,
      body: body.trim(),
      createdAt: serverTimestamp(),
      reportCount: 0,
      status: 'active',
    });
    tx.update(postRef, { commentCount: increment(1) });
  });

  return { ok: true };
};

// Soft-delete: keeps comment threads and pending reports intact for moderation.
export const deleteOwnPost = async (postId: string): Promise<void> => {
  await updateDoc(doc(db, 'communityPosts', postId), { status: 'removed' });
};

// ── Reporting ──────────────────────────────────────────────────────────────────

export const reportContent = async (
  targetType: 'post' | 'comment',
  postId: string,
  targetId: string,
  reason: ReportReason,
  detail: string,
): Promise<WriteResult> => {
  const profile = await getCommunityProfile();
  if (!profile) return { ok: false, reason: 'Profile required.' };

  await addDoc(collection(db, 'communityReports'), {
    targetType,
    postId,
    targetId,
    reporterId: profile.uid,
    reason,
    detail: (detail || '').slice(0, 500),
    createdAt: serverTimestamp(),
    resolved: false,
  });

  // Increment reportCount; auto-hide at threshold (pending moderator review).
  const targetRef =
    targetType === 'post'
      ? doc(db, 'communityPosts', postId)
      : doc(db, 'communityPosts', postId, 'comments', targetId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(targetRef);
    if (!snap.exists()) return;
    const current = (snap.data().reportCount ?? 0) + 1;
    const patch: Record<string, any> = { reportCount: current };
    if (current >= AUTO_HIDE_THRESHOLD && snap.data().status === 'active') {
      patch.status = 'hidden';
    }
    tx.update(targetRef, patch);
  });

  return { ok: true };
};

// ── Blocking ───────────────────────────────────────────────────────────────────

// Stores displayName in blockedMeta so BlockedUsersScreen can show names.
export const blockUser = async (
  blockedUid: string,
  displayName: string,
): Promise<void> => {
  const uid = await ensureAuth();
  await updateDoc(doc(db, 'users', uid, 'community', 'profile'), {
    blockedUsers: arrayUnion(blockedUid),
    [`blockedMeta.${blockedUid}`]: displayName,
  });
  const p = await getCommunityProfile();
  if (p) await AsyncStorage.setItem('bitzaCommunityProfile', JSON.stringify(p));
};

export const unblockUser = async (blockedUid: string): Promise<void> => {
  const uid = await ensureAuth();
  await updateDoc(doc(db, 'users', uid, 'community', 'profile'), {
    blockedUsers: arrayRemove(blockedUid),
    [`blockedMeta.${blockedUid}`]: deleteField(),
  });
  const p = await getCommunityProfile();
  if (p) await AsyncStorage.setItem('bitzaCommunityProfile', JSON.stringify(p));
};

// ── Reactions ──────────────────────────────────────────────────────────────────

// One reaction doc per user per post; doc ID = uid enforces the one-per-user limit
// structurally without needing a uniqueness constraint in the app.
export const togglePostReaction = async (
  postId: string,
  currentlyReacted: boolean,
): Promise<{ ok: boolean; reacted: boolean }> => {
  const profile = await getCommunityProfile();
  if (!profile) return { ok: false, reacted: currentlyReacted };

  const reactionRef = doc(db, 'communityPosts', postId, 'reactions', profile.uid);
  const postRef = doc(db, 'communityPosts', postId);

  try {
    await runTransaction(db, async (tx) => {
      const [rSnap, pSnap] = await Promise.all([tx.get(reactionRef), tx.get(postRef)]);
      if (!pSnap.exists()) throw new Error('Post not found.');
      if (rSnap.exists()) {
        tx.delete(reactionRef);
        tx.update(postRef, { reactionCount: increment(-1) });
      } else {
        tx.set(reactionRef, { uid: profile.uid, createdAt: serverTimestamp() });
        tx.update(postRef, { reactionCount: increment(1) });
      }
    });
    return { ok: true, reacted: !currentlyReacted };
  } catch {
    return { ok: false, reacted: currentlyReacted };
  }
};

// Batch-check which of the given post IDs the current user has reacted to.
// Called after the initial feed snapshot and incrementally as new posts arrive.
export const getMyReactions = async (postIds: string[]): Promise<Set<string>> => {
  const uid = await ensureAuth();
  const reacted = new Set<string>();
  await Promise.all(
    postIds.map(async (pid) => {
      const snap = await getDoc(doc(db, 'communityPosts', pid, 'reactions', uid));
      if (snap.exists()) reacted.add(pid);
    }),
  );
  return reacted;
};

// ── Moderation ──────────────────────────────────────────────────────────────────

export interface CommunityReport {
  id: string;
  targetType: 'post' | 'comment';
  postId: string;
  targetId: string;
  reporterId: string;
  reason: ReportReason;
  detail: string;
  createdAt: any;
  resolved: boolean;
}

export interface HiddenItem {
  id: string;
  postId: string;
  targetType: 'post' | 'comment';
  body: string;
  authorId: string;
  displayName: string;
  avatarEmoji: string;
  status: 'hidden' | 'removed';
  reportCount: number;
  createdAt: any;
}

// Returns all unresolved reports ordered newest-first.
// Filtered client-side to avoid requiring a composite Firestore index on a fresh project.
export const loadOpenReports = async (): Promise<CommunityReport[]> => {
  const snap = await getDocs(
    query(collection(db, 'communityReports'), orderBy('createdAt', 'desc'), limit(100)),
  );
  const reports: CommunityReport[] = [];
  snap.forEach((d) => {
    const data = { id: d.id, ...d.data() } as CommunityReport;
    if (!data.resolved) reports.push(data);
  });
  return reports;
};

// Returns posts currently in status:'hidden' — these auto-hid at the report threshold
// and are awaiting moderator review. Client-side filter avoids a composite index.
export const loadHiddenPosts = async (): Promise<HiddenItem[]> => {
  const snap = await getDocs(
    query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(100)),
  );
  const items: HiddenItem[] = [];
  snap.forEach((d) => {
    const data = d.data();
    if (data.status === 'hidden') {
      items.push({
        id: d.id,
        postId: d.id,
        targetType: 'post',
        body: data.body ?? '',
        authorId: data.authorId ?? '',
        displayName: data.displayName ?? '',
        avatarEmoji: data.avatarEmoji ?? '',
        status: 'hidden',
        reportCount: data.reportCount ?? 0,
        createdAt: data.createdAt,
      });
    }
  });
  return items;
};

export const getContentBody = async (
  targetType: 'post' | 'comment',
  postId: string,
  targetId: string,
): Promise<string> => {
  if (targetType === 'post') {
    const snap = await getDoc(doc(db, 'communityPosts', postId));
    return snap.exists() ? (snap.data().body ?? '') : '[Post not found]';
  }
  const snap = await getDoc(doc(db, 'communityPosts', postId, 'comments', targetId));
  return snap.exists() ? (snap.data().body ?? '') : '[Comment not found]';
};

export const moderateSetStatus = async (
  targetType: 'post' | 'comment',
  postId: string,
  targetId: string,
  status: 'active' | 'hidden' | 'removed',
): Promise<void> => {
  const ref =
    targetType === 'post'
      ? doc(db, 'communityPosts', postId)
      : doc(db, 'communityPosts', postId, 'comments', targetId);
  await updateDoc(ref, { status });
};

export const resolveReport = async (reportId: string): Promise<void> => {
  await updateDoc(doc(db, 'communityReports', reportId), { resolved: true });
};

// Hard-deletes the post document. The report is resolved separately by the caller.
export const hardDeletePost = async (postId: string): Promise<void> => {
  await deleteDoc(doc(db, 'communityPosts', postId));
};

// ── Utilities ──────────────────────────────────────────────────────────────────

export const timeAgo = (ts: any): string => {
  if (!ts) return '';
  const then: Date = ts.toDate
    ? ts.toDate()
    : ts.seconds
    ? new Date(ts.seconds * 1000)
    : new Date(ts);
  if (isNaN(then.getTime())) return '';
  const diff = Math.floor((Date.now() - then.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
};
