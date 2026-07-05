import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  AVATAR_OPTIONS,
  createCommunityProfile,
  isDisplayNameOk,
} from '../lib/communityService';
import { Colors } from '../theme/colors';
import { Fonts, Type, Shadows, Spacing, Radius } from '../theme/theme';
import Card from '../components/ui/Card';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

type RouteParams = { readOnly?: boolean };

const GUIDELINES: Array<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  text: string;
}> = [
  { icon: 'heart-outline',              text: "Be kind. We're all doing something hard." },
  { icon: 'information-circle-outline', text: 'No medical, legal, or crisis advice — share experiences, not diagnoses.' },
  { icon: 'lock-closed-outline',        text: "Protect privacy — no full names, addresses, or contact info (yours or your child's)." },
  { icon: 'ban-outline',                text: 'No harassment, hate, or graphic content.' },
  { icon: 'flag-outline',               text: 'Report anything that feels unsafe. Moderators review reports.' },
  { icon: 'eye-off-outline',            text: 'Content that breaks these rules may be hidden or removed.' },
];

export default function CommunityGuidelinesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const readOnly = route.params?.readOnly ?? false;

  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameOk = isDisplayNameOk(displayName);
  const canSubmit = nameOk && selectedAvatar !== null && agreed && !saving;

  const handleEnter = async () => {
    if (!canSubmit || !selectedAvatar) return;
    setSaving(true);
    try {
      await createCommunityProfile(displayName, selectedAvatar);
      navigation.replace('CaregiverCommunity');
    } catch {
      Alert.alert('Something went wrong', 'Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScreenHeader
        title="Community Guidelines"
        onBack={() => navigation.goBack()}
        style={s.header}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro */}
          <Card style={s.introCard}>
            <Text style={s.introText}>
              This is a space for caregivers to support each other. To keep it safe, everyone agrees to a few things. 💜
            </Text>
          </Card>

          {/* Guidelines list */}
          <Card style={s.guidelinesCard}>
            <Text style={s.cardSectionLabel}>Community Guidelines</Text>
            {GUIDELINES.map((g, i) => (
              <View key={i} style={[s.guideRow, i > 0 && s.guideRowBorder]}>
                <View style={s.guideIconCircle}>
                  <Ionicons name={g.icon} size={16} color={Colors.purple} />
                </View>
                <Text style={s.guideText}>{g.text}</Text>
              </View>
            ))}
          </Card>

          {/* Identity setup — hidden in read-only mode */}
          {!readOnly && (
            <Card style={s.setupCard}>
              <Text style={s.cardSectionLabel}>Your community identity</Text>
              <Text style={s.fieldLabel}>Choose a display name (not your real name)</Text>
              <TextInput
                style={[s.input, displayName.length > 0 && !nameOk && s.inputError]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. SunflowerMom, StarDad…"
                placeholderTextColor={Colors.textMuted}
                maxLength={24}
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="done"
              />
              {displayName.length > 0 && !nameOk && (
                <Text style={s.inputHint}>Must be 2–24 characters.</Text>
              )}

              <Text style={[s.fieldLabel, { marginTop: 16 }]}>Pick an avatar</Text>
              <View style={s.avatarGrid}>
                {AVATAR_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      s.avatarCell,
                      selectedAvatar === emoji && s.avatarSelected,
                    ]}
                    onPress={() => setSelectedAvatar(emoji)}
                    activeOpacity={0.75}
                  >
                    <Text style={s.avatarEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Agree + CTA — hidden in read-only mode */}
          {!readOnly && (
            <>
              <TouchableOpacity
                style={s.checkRow}
                onPress={() => setAgreed((v) => !v)}
                activeOpacity={0.75}
              >
                <View style={[s.checkbox, agreed && s.checkboxChecked]}>
                  {agreed && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={s.checkLabel}>I agree to the community guidelines</Text>
              </TouchableOpacity>

              <PrimaryButton
                label="Enter the community"
                onPress={handleEnter}
                loading={saving}
                disabled={!canSubmit}
                style={s.cta}
              />

              <TouchableOpacity
                style={s.laterBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={s.laterText}>Maybe later</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFC' },
  header: { backgroundColor: 'transparent' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: Spacing.lg, gap: 14, paddingBottom: 48 },

  introCard: { paddingVertical: 14 },
  introText: { ...Type.bodySmall, color: Colors.textMuted, lineHeight: 20 },

  guidelinesCard: { paddingVertical: 14, paddingHorizontal: Spacing.lg },
  setupCard: { paddingVertical: 14, paddingHorizontal: Spacing.lg },

  cardSectionLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.purple,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  guideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
  },
  guideRowBorder: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
  },
  guideIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.navActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  guideText: {
    ...Type.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 19,
  },

  fieldLabel: {
    ...Type.caption,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    ...Type.bodySmall,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.textRose,
  },
  inputHint: {
    ...Type.caption,
    color: Colors.textRose,
    marginTop: 4,
  },

  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarCell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.lavenderSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelected: {
    borderWidth: 2.5,
    borderColor: Colors.purple,
    backgroundColor: Colors.navActiveBg,
  },
  avatarEmoji: { fontSize: 24 },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  checkLabel: {
    ...Type.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
  },

  cta: { marginTop: 4 },
  laterBtn: { alignItems: 'center', paddingVertical: 8 },
  laterText: { ...Type.caption, color: Colors.textMuted },
});
