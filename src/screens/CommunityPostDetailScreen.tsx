import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  CommunityPost,
  CommunityComment,
  subscribeToComments,
  getPost,
  timeAgo,
  addComment,
  deleteOwnPost,
  blockUser,
  togglePostReaction,
  getMyReactions,
} from '../lib/communityService';

const HEART_COLOR = '#E0729C';
import { Colors } from '../theme/colors';
import { Fonts, Type, Shadows, Spacing, Radius } from '../theme/theme';
import ScreenHeader from '../components/ui/ScreenHeader';
import Card from '../components/ui/Card';
import ReportSheet from '../components/community/ReportSheet';

type RouteParams = {
  post?: CommunityPost;
  postId?: string;
  currentUid?: string;
  reacted?: boolean; // passed by PostCard so the heart is correct before getMyReactions
};

type ReportTarget = {
  targetType: 'post' | 'comment';
  postId: string;
  targetId: string;
  authorId: string;
  authorName: string;
};

export default function CommunityPostDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { post: routePost, postId: routePostId, currentUid, reacted: routeReacted } = route.params ?? {};

  const [post, setPost] = useState<CommunityPost | null>(routePost ?? null);
  const [postLoading, setPostLoading] = useState(!routePost);
  const [allComments, setAllComments] = useState<CommunityComment[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [localReacted, setLocalReacted] = useState<boolean>(routeReacted ?? false);
  const [localCount, setLocalCount] = useState<number>(routePost?.reactionCount ?? 0);
  const inFlight = useRef(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  // Load post if not passed via params
  useEffect(() => {
    if (routePost) return;
    const id = routePostId;
    if (!id) { setPostLoading(false); return; }
    getPost(id)
      .then((p) => {
        setPost(p);
        if (p) setLocalCount(p.reactionCount);
        setPostLoading(false);
      })
      .catch(() => setPostLoading(false));
  }, [routePost, routePostId]);

  // Load reaction state if not passed via route params (e.g., deep link)
  useEffect(() => {
    if (routeReacted !== undefined || !post?.id) return;
    getMyReactions([post.id]).then((set) => {
      if (!inFlight.current) setLocalReacted(set.has(post.id));
    }).catch(() => {});
  }, [post?.id, routeReacted]);

  const handleHeart = async () => {
    if (inFlight.current || !post) return;
    inFlight.current = true;

    const wasReacted = localReacted;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLocalReacted(!wasReacted);
    setLocalCount((c) => c + (wasReacted ? -1 : 1));

    if (!wasReacted) {
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 50,
          bounciness: 6,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 4,
        }),
      ]).start();
    }

    const result = await togglePostReaction(post.id, wasReacted);
    inFlight.current = false;

    if (!result.ok) {
      setLocalReacted(wasReacted);
      setLocalCount((c) => c + (wasReacted ? 1 : -1));
    }
  };

  // Subscribe to comments — delivers all active comments, filtered at render
  useEffect(() => {
    if (!post?.id) return;
    setCommentsLoading(true);
    const unsub = subscribeToComments(
      post.id,
      (c) => { setAllComments(c); setCommentsLoading(false); },
      () => setCommentsLoading(false),
    );
    return () => unsub();
  }, [post?.id]);

  // Filter comments by blocked authors at render time
  const visibleComments = allComments.filter(
    (c) => !blockedUsers.includes(c.authorId),
  );

  const handleSend = async () => {
    if (!post?.id || !commentText.trim() || sending) return;
    setSending(true);
    try {
      const result = await addComment(post.id, commentText);
      if (result.ok) {
        setCommentText('');
        inputRef.current?.blur();
      } else {
        Alert.alert('Please revise', result.reason ?? 'Something went wrong.');
      }
    } catch {
      Alert.alert('Error', 'Could not post the comment. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // After a block from this screen: update local blockedUsers and go back
  const handleBlockComplete = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePostMore = () => {
    if (!post) return;
    const isOwn = !!currentUid && post.authorId === currentUid;
    if (isOwn) {
      Alert.alert(
        'Delete this post?',
        'This will remove your post from the community.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteOwnPost(post.id);
                navigation.goBack();
              } catch {
                Alert.alert('Error', 'Could not delete the post. Please try again.');
              }
            },
          },
        ],
      );
    } else {
      Alert.alert(
        post.displayName,
        undefined,
        [
          {
            text: 'Report',
            onPress: () =>
              setReportTarget({
                targetType: 'post',
                postId: post.id,
                targetId: post.id,
                authorId: post.authorId,
                authorName: post.displayName,
              }),
          },
          {
            text: `Block ${post.displayName}`,
            onPress: () => confirmBlock(post.authorId, post.displayName),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    }
  };

  const handleCommentMore = (comment: CommunityComment) => {
    const isOwn = !!currentUid && comment.authorId === currentUid;
    if (isOwn) return; // own comments: no action for now (delete comment in Phase 6)
    Alert.alert(
      comment.displayName,
      undefined,
      [
        {
          text: 'Report',
          onPress: () =>
            setReportTarget({
              targetType: 'comment',
              postId: post!.id,
              targetId: comment.id,
              authorId: comment.authorId,
              authorName: comment.displayName,
            }),
        },
        {
          text: `Block ${comment.displayName}`,
          onPress: () => confirmBlock(comment.authorId, comment.displayName),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const confirmBlock = (uid: string, name: string) => {
    Alert.alert(
      'Block this person?',
      `You won't see posts or comments from ${name} again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(uid, name);
              // Add to local blocked list so comments disappear immediately,
              // then navigate back so the feed re-filters on focus.
              setBlockedUsers((prev) => [...prev, uid]);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Could not block. Please try again.');
            }
          },
        },
      ],
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (postLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient
          colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScreenHeader title="Post" onBack={() => navigation.goBack()} style={s.transparentHdr} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient
          colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScreenHeader title="Post" onBack={() => navigation.goBack()} style={s.transparentHdr} />
        <View style={s.center}>
          <Text style={s.notFound}>Post not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnPost = !!currentUid && post.authorId === currentUid;

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderComment = ({ item }: { item: CommunityComment }) => (
    <View style={s.commentRow}>
      <View style={s.commentAvatar}>
        <Text style={s.commentAvatarEmoji}>{item.avatarEmoji}</Text>
      </View>
      <View style={s.commentBody}>
        <View style={s.commentMeta}>
          <Text style={s.commentName}>{item.displayName}</Text>
          <Text style={s.commentTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={s.commentText}>{item.body}</Text>
      </View>
      <TouchableOpacity
        style={s.commentMore}
        onPress={() => handleCommentMore(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const listHeader = (
    <>
      {/* Full post */}
      <Card style={s.postCard}>
        <View style={s.postHeader}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarEmoji}>{post.avatarEmoji}</Text>
          </View>
          <View style={s.authorBlock}>
            <Text style={s.displayName}>{post.displayName}</Text>
            <Text style={s.time}>{timeAgo(post.createdAt)}</Text>
          </View>
          <TouchableOpacity
            style={s.moreBtn}
            onPress={handlePostMore}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Hidden-post banner — only visible to the author */}
        {post.status === 'hidden' && isOwnPost && (
          <View style={s.hiddenBanner}>
            <Ionicons name="time-outline" size={14} color={Colors.secondaryPlum} style={{ marginTop: 1 }} />
            <Text style={s.hiddenBannerText}>
              This post is under review and is hidden from the community while our team looks into it.
            </Text>
          </View>
        )}

        <Text style={s.postBody}>{post.body}</Text>
        <View style={s.reactionRow}>
          <TouchableOpacity
            style={s.heartBtn}
            onPress={handleHeart}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={localReacted ? 'heart' : 'heart-outline'}
                size={15}
                color={localReacted ? HEART_COLOR : Colors.textMuted}
              />
            </Animated.View>
            <Text style={[s.statText, localReacted && s.statTextHeart]}>
              {localCount}
            </Text>
          </TouchableOpacity>
          <View style={s.stat}>
            <Ionicons name="chatbubble-outline" size={15} color={Colors.textMuted} />
            <Text style={s.statText}>{post.commentCount}</Text>
          </View>
        </View>
      </Card>

      {/* Comments section label */}
      <View style={s.commentsHeader}>
        <Text style={s.commentsLabel}>Comments</Text>
        {commentsLoading && <ActivityIndicator size="small" color={Colors.purple} />}
      </View>
    </>
  );

  const canSend = commentText.trim().length > 0 && !sending;

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScreenHeader
        title="Post"
        onBack={() => navigation.goBack()}
        style={s.transparentHdr}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={visibleComments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            commentsLoading ? null : (
              <Text style={s.emptyComments}>No comments yet.</Text>
            )
          }
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          style={s.list}
          keyboardShouldPersistTaps="handled"
        />

        {/* Comment composer */}
        <View style={s.composerBar}>
          <TextInput
            ref={inputRef}
            style={s.composerInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!sending}
            maxLength={1000}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Single ReportSheet for all report targets on this screen */}
      {reportTarget && (
        <ReportSheet
          visible={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetType={reportTarget.targetType}
          postId={reportTarget.postId}
          targetId={reportTarget.targetId}
          authorId={reportTarget.authorId}
          authorName={reportTarget.authorName}
          onBlock={handleBlockComplete}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFC' },
  transparentHdr: { backgroundColor: 'transparent' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { ...Type.body, color: Colors.textMuted },

  list: { flex: 1, backgroundColor: 'transparent' },
  listContent: { padding: Spacing.lg, paddingBottom: 16 },

  // Post card
  postCard: { gap: 10, marginBottom: 6 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lavenderSurface,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 20 },
  authorBlock: { flex: 1 },
  displayName: { ...Type.cardTitle, color: Colors.textPrimary },
  time: { ...Type.caption, color: Colors.textMuted, marginTop: 1 },
  moreBtn: { padding: 4 },

  hiddenBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  hiddenBannerText: {
    ...Type.caption,
    color: Colors.secondaryPlum,
    flex: 1,
    lineHeight: 17,
  },

  postBody: { ...Type.body, color: Colors.textPrimary, lineHeight: 22 },
  reactionRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
  },
  heartBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { ...Type.caption, color: Colors.textMuted },
  statTextHeart: { color: HEART_COLOR },

  // Comments section
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  commentsLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.purple,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadows.card,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lavenderSurface,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  commentAvatarEmoji: { fontSize: 16 },
  commentBody: { flex: 1 },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  commentName: { ...Type.cardTitle, color: Colors.textPrimary },
  commentTime: { ...Type.caption, color: Colors.textMuted },
  commentText: { ...Type.bodySmall, color: Colors.textPrimary, lineHeight: 18 },
  commentMore: { padding: 2, marginTop: 2 },

  emptyComments: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Comment composer
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.lg,
    marginVertical: 8,
    paddingLeft: Spacing.lg,
    paddingRight: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.pill,
    ...Shadows.card,
  },
  composerInput: {
    flex: 1,
    ...Type.bodySmall,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: Colors.grayLavender },
});
