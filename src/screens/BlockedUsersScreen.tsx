import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  getCommunityProfile,
  unblockUser,
  CommunityProfile,
} from '../lib/communityService';
import { Colors } from '../theme/colors';
import { Fonts, Type, Shadows, Spacing, Radius } from '../theme/theme';
import ScreenHeader from '../components/ui/ScreenHeader';

type BlockedEntry = { uid: string; displayName: string };

export default function BlockedUsersScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null); // uid being unblocked

  useEffect(() => {
    getCommunityProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = (uid: string, name: string) => {
    Alert.alert(
      `Unblock ${name}?`,
      "Their posts and comments will be visible to you again.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setUnblocking(uid);
            try {
              await unblockUser(uid);
              const fresh = await getCommunityProfile();
              setProfile(fresh);
            } catch {
              Alert.alert('Error', 'Could not unblock. Please try again.');
            } finally {
              setUnblocking(null);
            }
          },
        },
      ],
    );
  };

  const blockedEntries: BlockedEntry[] = profile
    ? (profile.blockedUsers ?? []).map((uid) => ({
        uid,
        displayName: profile.blockedMeta?.[uid] ?? uid.slice(0, 8) + '...',
      }))
    : [];

  const renderItem = ({ item }: { item: BlockedEntry }) => (
    <View style={s.row}>
      <View style={s.avatarCircle}>
        <Text style={s.avatarInitial}>
          {item.displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={s.nameText} numberOfLines={1}>{item.displayName}</Text>
      <TouchableOpacity
        style={[s.unblockBtn, unblocking === item.uid && s.unblockBtnDisabled]}
        onPress={() => handleUnblock(item.uid, item.displayName)}
        disabled={unblocking === item.uid}
        activeOpacity={0.75}
      >
        {unblocking === item.uid ? (
          <ActivityIndicator size="small" color={Colors.purple} />
        ) : (
          <Text style={s.unblockText}>Unblock</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient
          colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScreenHeader
          title="Blocked Users"
          onBack={() => navigation.goBack()}
          style={s.transparentHdr}
        />
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScreenHeader
        title="Blocked Users"
        onBack={() => navigation.goBack()}
        style={s.transparentHdr}
      />

      <FlatList
        data={blockedEntries}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>🤝</Text>
            <Text style={s.emptyTitle}>No blocked users</Text>
            <Text style={s.emptyBody}>
              You haven't blocked anyone. Block someone from a post or comment to keep your feed comfortable.
            </Text>
          </View>
        }
        contentContainerStyle={[
          s.listContent,
          blockedEntries.length === 0 && s.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        style={s.list}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFC' },
  transparentHdr: { backgroundColor: 'transparent' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  list: { flex: 1, backgroundColor: 'transparent' },
  listContent: { padding: Spacing.lg, paddingBottom: 32 },
  listContentEmpty: { flex: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadows.card,
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
  avatarInitial: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.purple,
  },
  nameText: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
    flex: 1,
  },
  unblockBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.purple,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unblockBtnDisabled: {
    borderColor: Colors.grayLavender,
  },
  unblockText: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    color: Colors.purple,
  },
  separator: { height: 10 },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 4 },
  emptyTitle: { ...Type.heading, color: Colors.textPrimary },
  emptyBody: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
