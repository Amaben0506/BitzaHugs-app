import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CommunityProfile, createPost } from '../lib/communityService';
import {
  FREE_LIMITS,
  getCommunityPostUsage,
  recordCommunityPostCreated,
  usePremium,
} from '../lib/premium';
import { Colors } from '../theme/colors';
import { Fonts, Type, Spacing, Radius } from '../theme/theme';
import ScreenHeader from '../components/ui/ScreenHeader';
import CrisisResourceCard from '../components/community/CrisisResourceCard';

type RouteParams = { profile: CommunityProfile };

const MAX_BODY = 2000;
const CHAR_WARN = 1800;

export default function CommunityComposerScreen() {
  const navigation = useNavigation<any>();
  const { isPremium, showPremiumUpgrade } = usePremium();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { profile } = route.params;

  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const canPost = body.trim().length > 0 && !saving;

  const handlePost = async () => {
    if (!canPost) return;
    setSaving(true);
    try {
      if (!isPremium) {
        const usage = await getCommunityPostUsage();
        if (usage.count >= FREE_LIMITS.communityPostsPerMonth) {
          showPremiumUpgrade({ feature: 'community' });
          return;
        }
      }
      const result = await createPost(body);
      if (result.ok) {
        if (!isPremium) await recordCommunityPostCreated();
        if (result.crisisFlagged) {
          setShowCrisisResources(true);
        } else {
          navigation.goBack();
        }
      } else {
        Alert.alert(
          'Please revise',
          result.reason ?? 'Something went wrong. Please try again.',
        );
      }
    } catch {
      Alert.alert('Error', 'Could not post right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const postBtn = (
    <TouchableOpacity
      onPress={handlePost}
      disabled={!canPost}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {saving ? (
        <ActivityIndicator size="small" color={Colors.purple} />
      ) : (
        <Text style={[s.postBtnText, !canPost && s.postBtnDisabled]}>Post</Text>
      )}
    </TouchableOpacity>
  );

  const charCount = body.length;
  const charOverWarn = charCount >= CHAR_WARN;

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScreenHeader
        title="New Post"
        onBack={() => navigation.goBack()}
        rightAction={postBtn}
        style={s.transparentHdr}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identity row */}
          <View style={s.identityRow}>
            <View style={s.identityAvatar}>
              <Text style={s.identityEmoji}>{profile.avatarEmoji}</Text>
            </View>
            <Text style={s.identityLabel}>
              Posting as{' '}
              <Text style={s.identityName}>{profile.displayName}</Text>
            </Text>
          </View>

          {/* Compose area */}
          <TextInput
            ref={inputRef}
            style={s.input}
            value={body}
            onChangeText={setBody}
            placeholder="Share what's on your mind. You're among people who get it. 💜"
            placeholderTextColor={Colors.textMuted}
            multiline
            autoFocus
            maxLength={MAX_BODY}
            textAlignVertical="top"
            returnKeyType="default"
            blurOnSubmit={false}
            editable={!saving}
          />

          {/* Character count */}
          <Text style={[s.charCount, charOverWarn && s.charCountWarn]}>
            {charCount}/{MAX_BODY}
          </Text>

          {/* Privacy reminder */}
          <View style={s.privacyCard}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={Colors.purple}
              style={{ marginTop: 1 }}
            />
            <Text style={s.privacyText}>
              Please don't share full names, addresses, or contact info — yours or your child's.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CrisisResourceCard
        visible={showCrisisResources}
        onClose={() => {
          setShowCrisisResources(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFC' },
  transparentHdr: { backgroundColor: 'transparent' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: Spacing.lg, paddingTop: 8, gap: 14, paddingBottom: 32 },

  postBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.purple,
  },
  postBtnDisabled: { color: Colors.grayLavender },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  identityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lavenderSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityEmoji: { fontSize: 16 },
  identityLabel: {
    ...Type.caption,
    color: Colors.textMuted,
  },
  identityName: {
    fontFamily: Fonts.semibold,
    color: Colors.textPrimary,
  },

  input: {
    minHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Type.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  charCount: {
    ...Type.caption,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: -6,
  },
  charCountWarn: { color: Colors.textRose },

  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  privacyText: {
    ...Type.caption,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 17,
  },
});
