import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getCommunityProfile,
  CommunityProfile,
  CommunityPost,
  subscribeToFeed,
  getMyReactions,
} from '../lib/communityService';
import { Colors } from '../theme/colors';
import { Type, Shadows, Spacing, Radius } from '../theme/theme';
import ScreenHeader from '../components/ui/ScreenHeader';
import PostCard from '../components/community/PostCard';

export default function CaregiverCommunityScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reactedSet, setReactedSet] = useState<Set<string>>(new Set());
  const loadedPostIdsRef = useRef<Set<string>>(new Set());

  // Gate: check profile on every focus; also refreshes blockedUsers after block/unblock
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const check = async () => {
        setProfileLoading(true);
        try {
          const p = await getCommunityProfile();
          if (!active) return;
          if (!p || !p.agreedToGuidelines) {
            navigation.replace('CommunityGuidelines');
            return;
          }
          setProfile(p);
        } catch {
          setProfile(null);
        } finally {
          if (active) setProfileLoading(false);
        }
      };
      check();
      return () => { active = false; };
    }, [navigation]),
  );

  // Feed subscription — delivers all active posts; render filters by blockedUsers
  // so new blocks take effect immediately without restarting the subscription.
  useEffect(() => {
    if (!profile) return;
    setFeedLoading(true);
    // Reset reaction tracking so getMyReactions re-runs for incoming posts
    loadedPostIdsRef.current = new Set();
    setReactedSet(new Set());
    const unsub = subscribeToFeed(
      (newPosts) => {
        setAllPosts(newPosts);
        setFeedLoading(false);
      },
      () => setFeedLoading(false),
    );
    return () => unsub();
  }, [profile?.uid]);

  // Incrementally load which posts the current user has reacted to
  useEffect(() => {
    if (!profile || allPosts.length === 0) return;
    const newIds = allPosts
      .map((p) => p.id)
      .filter((id) => !loadedPostIdsRef.current.has(id));
    if (newIds.length === 0) return;
    newIds.forEach((id) => loadedPostIdsRef.current.add(id));
    getMyReactions(newIds).then((freshReacted) => {
      setReactedSet((prev) => {
        const next = new Set(prev);
        freshReacted.forEach((id) => next.add(id));
        return next;
      });
    }).catch(() => {});
  }, [allPosts, profile?.uid]);

  // Refresh profile from AsyncStorage (updated by blockUser/unblockUser)
  const handleBlock = useCallback(async () => {
    try {
      const fresh = await getCommunityProfile();
      if (fresh) setProfile(fresh);
    } catch {}
  }, []);

  // Filter blocked authors at render time — instant effect when profile.blockedUsers changes
  const visiblePosts = profile
    ? allPosts.filter((p) => !profile.blockedUsers.includes(p.authorId))
    : allPosts;

  // ── Loading / gate ─────────────────────────────────────────────────────────
  if (profileLoading || !profile) {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient
          colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Banned ─────────────────────────────────────────────────────────────────
  if (profile.isBanned) {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient
          colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScreenHeader
          title="Caregiver Community"
          onBack={() => navigation.goBack()}
          style={s.transparentHdr}
        />
        <View style={s.center}>
          <View style={s.bannedCard}>
            <Ionicons name="shield-outline" size={32} color={Colors.textMuted} />
            <Text style={s.bannedTitle}>Access suspended</Text>
            <Text style={s.bannedBody}>
              Your access has been suspended. Please contact support if you believe this is a mistake.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Community shell ────────────────────────────────────────────────────────

  const avatarBtn = (
    <TouchableOpacity
      style={s.avatarBtn}
      onPress={() => setMenuVisible(true)}
      activeOpacity={0.8}
    >
      <Text style={s.avatarBtnEmoji}>{profile.avatarEmoji}</Text>
    </TouchableOpacity>
  );

  const emptyState = (
    <View style={s.emptyState}>
      <Text style={s.emptyEmoji}>💜</Text>
      <Text style={s.emptyTitle}>No posts yet.</Text>
      <Text style={s.emptyBody}>
        Be the first to share something with the community.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader
        title="Caregiver Community"
        onBack={() => navigation.goBack()}
        rightAction={avatarBtn}
        style={s.transparentHdr}
      />

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUid={profile.uid}
            reacted={reactedSet.has(item.id)}
            onBlock={handleBlock}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          feedLoading ? (
            <ActivityIndicator
              size="small"
              color={Colors.purple}
              style={{ marginBottom: 16 }}
            />
          ) : null
        }
        ListEmptyComponent={feedLoading ? null : emptyState}
        contentContainerStyle={[
          s.listContent,
          visiblePosts.length === 0 && !feedLoading && s.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        style={s.list}
      />

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CommunityGuidelines', { readOnly: true })
          }
          activeOpacity={0.7}
        >
          <Text style={s.footerLink}>
            Moderators review all reports · See guidelines
          </Text>
        </TouchableOpacity>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CommunityComposer', { profile })}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Profile mini-menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={s.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={s.menuCard}>
            <View style={s.menuAvatarRow}>
              <View style={s.menuAvatarCircle}>
                <Text style={s.menuAvatarEmoji}>{profile.avatarEmoji}</Text>
              </View>
              <View>
                <Text style={s.menuDisplayName}>{profile.displayName}</Text>
                <Text style={s.menuSub}>Community member</Text>
              </View>
            </View>
            <View style={s.menuDivider} />
            <TouchableOpacity
              style={s.menuRow}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('BlockedUsers');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-remove-outline" size={16} color={Colors.textMuted} />
              <Text style={s.menuRowText}>Blocked users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.menuRow}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('CommunityGuidelines', { readOnly: true });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={16} color={Colors.purple} />
              <Text style={s.menuRowText}>View community guidelines</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFC' },
  transparentHdr: { backgroundColor: 'transparent' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },

  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.navActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  avatarBtnEmoji: { fontSize: 18 },

  list: { flex: 1, backgroundColor: 'transparent' },
  listContent: { padding: Spacing.lg, paddingBottom: 100 },
  listContentEmpty: { flex: 1 },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { ...Type.heading, color: Colors.textPrimary },
  emptyBody: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
  },
  footerLink: {
    ...Type.caption,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },

  fab: {
    position: 'absolute',
    bottom: 62,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },

  bannedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 8,
    ...Shadows.card,
  },
  bannedTitle: { ...Type.heading, color: Colors.textPrimary, marginTop: 4 },
  bannedBody: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: Spacing.lg,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    width: 240,
    paddingVertical: 14,
    ...Shadows.raised,
  },
  menuAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  menuAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lavenderSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuAvatarEmoji: { fontSize: 22 },
  menuDisplayName: { ...Type.cardTitle, color: Colors.textPrimary },
  menuSub: { ...Type.caption, color: Colors.textMuted, marginTop: 2 },
  menuDivider: {
    height: 0.5,
    backgroundColor: Colors.divider,
    marginBottom: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuRowText: { ...Type.bodySmall, color: Colors.textPrimary },
});
