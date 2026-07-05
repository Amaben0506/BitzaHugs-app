import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import {
  CommunityPost,
  timeAgo,
  deleteOwnPost,
  blockUser,
  togglePostReaction,
} from '../../lib/communityService';
import { Colors } from '../../theme/colors';
import { Type, Shadows, Spacing, Radius } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';
import ReportSheet from './ReportSheet';

const HEART_COLOR = '#E0729C';

interface PostCardProps {
  post: CommunityPost;
  currentUid?: string;
  reacted?: boolean;
  onBlock?: () => void;
}

export default function PostCard({ post, currentUid, reacted = false, onBlock }: PostCardProps) {
  const navigation = useNavigation<any>();
  const isOwn = !!currentUid && post.authorId === currentUid;
  const [reportVisible, setReportVisible] = useState(false);
  const [localReacted, setLocalReacted] = useState(reacted);
  const [localCount, setLocalCount] = useState(post.reactionCount);
  const inFlight = useRef(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  // Sync when parent resolves getMyReactions (don't override if we're mid-toggle)
  useEffect(() => {
    if (!inFlight.current) setLocalReacted(reacted);
  }, [reacted]);

  // Sync count from live feed snapshot when not in-flight
  useEffect(() => {
    if (!inFlight.current) setLocalCount(post.reactionCount);
  }, [post.reactionCount]);

  const handleHeart = async () => {
    if (inFlight.current) return;
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

  const handleMore = () => {
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
              } catch {
                Alert.alert('Error', 'Could not delete the post. Please try again.');
              }
            },
          },
        ],
      );
    } else {
      Alert.alert(post.displayName, undefined, [
        { text: 'Report', onPress: () => setReportVisible(true) },
        { text: `Block ${post.displayName}`, onPress: handleBlock },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleBlock = () => {
    Alert.alert(
      'Block this person?',
      `You won't see posts or comments from ${post.displayName} again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(post.authorId, post.displayName);
              onBlock?.();
            } catch {
              Alert.alert('Error', 'Could not block. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <PressableScale
        style={s.card}
        onPress={() =>
          navigation.navigate('CommunityPostDetail', {
            post,
            currentUid,
            reacted: localReacted,
          })
        }
      >
        <View style={s.header}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarEmoji}>{post.avatarEmoji}</Text>
          </View>
          <View style={s.authorBlock}>
            <Text style={s.displayName} numberOfLines={1}>{post.displayName}</Text>
            <Text style={s.time}>{timeAgo(post.createdAt)}</Text>
          </View>
          <TouchableOpacity
            style={s.moreBtn}
            onPress={handleMore}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={s.body} numberOfLines={6}>{post.body}</Text>

        <View style={s.footer}>
          {/* Heart button — stopPropagation via a wrapping TouchableOpacity outside PressableScale tap area */}
          <TouchableOpacity
            style={s.heartBtn}
            onPress={(e) => { e.stopPropagation(); handleHeart(); }}
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
            <Ionicons name="chatbubble-outline" size={14} color={Colors.textMuted} />
            <Text style={s.statText}>{post.commentCount}</Text>
          </View>
        </View>
      </PressableScale>

      {/* Rendered outside PressableScale to avoid touch conflicts */}
      <ReportSheet
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        targetType="post"
        postId={post.id}
        targetId={post.id}
        authorId={post.authorId}
        authorName={post.displayName}
        onBlock={onBlock}
      />
    </>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 10,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
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
  body: { ...Type.body, color: Colors.textPrimary, lineHeight: 21 },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
  },
  heartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { ...Type.caption, color: Colors.textMuted },
  statTextHeart: { color: HEART_COLOR },
});
