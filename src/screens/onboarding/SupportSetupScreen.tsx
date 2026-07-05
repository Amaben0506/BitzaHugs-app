import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveCaregiverProfile, saveChildProfile, saveSupportPrefs } from '../../lib/dataService';
import { Colors } from '../../theme/colors';

function ProgressDots({ total, active }: { total: number; active: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.dot, i === active ? s.dotActive : s.dotInactive]} />
      ))}
    </View>
  );
}

const SUPPORT_OPTIONS = [
  { id: 'gentleReminders', emoji: '💜', label: 'Gentle reminders on hard days' },
  { id: 'emotionalCheckins', emoji: '🧘', label: 'Emotional check-in prompts' },
  { id: 'calmingBreaks', emoji: '🌿', label: 'Calming break suggestions' },
  { id: 'hugiCheckins', emoji: '💬', label: 'Hugi check-ins' },
  { id: 'affirmations', emoji: '✨', label: 'Daily affirmations' },
  { id: 'journalPrompts', emoji: '📓', label: 'Journal reflection prompts' },
];

type PrefsState = Record<string, boolean>;

export default function SupportSetupScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { caregiverData = {}, childData = {} } = route.params ?? {};

  const initialPrefs: PrefsState = Object.fromEntries(SUPPORT_OPTIONS.map(o => [o.id, true]));
  const [prefs, setPrefs] = useState<PrefsState>(initialPrefs);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => setPrefs(prev => ({ ...prev, [id]: !prev[id] }));

  const handleFinish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveCaregiverProfile(caregiverData);
      console.log('✅ caregiver saved');
      await saveChildProfile(childData);
      console.log('✅ child saved');
      await saveSupportPrefs(prefs);
      console.log('✅ prefs saved');
      await AsyncStorage.setItem('bitzaOnboardingComplete', 'true');
      const rootNav = navigation.getParent('RootStack') ?? navigation;
      rootNav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e) {
      console.log('❌ save error:', e);
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <ProgressDots total={4} active={3} />
          <View style={s.backBtn} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>You matter here too.</Text>
          <Text style={s.subtitle}>
            BitzaHugs is here for your child, but it's also here for you.
          </Text>

          <View style={s.card}>
            <Text style={s.cardLabel}>What kind of support feels most helpful to you?</Text>
            {SUPPORT_OPTIONS.map((opt, i) => (
              <View key={opt.id}>
                {i > 0 && <View style={s.divider} />}
                <View style={s.toggleRow}>
                  <Text style={s.toggleEmoji}>{opt.emoji}</Text>
                  <Text style={s.toggleLabel}>{opt.label}</Text>
                  <Switch
                    value={prefs[opt.id]}
                    onValueChange={() => toggle(opt.id)}
                    trackColor={{ false: Colors.grayLavender, true: Colors.purple }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={s.infoBanner}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.textSecondary} />
            <Text style={s.infoText}>You can change these anytime in My Care settings.</Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, saving && s.primaryBtnDisabled]}
            onPress={handleFinish}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={s.primaryBtnText}>{saving ? 'Setting up...' : 'Finish setup'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.navActiveBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.purple, width: 22 },
  dotInactive: { backgroundColor: Colors.grayLavender },
  scroll: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginTop: 20,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 14,
    lineHeight: 20,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.cardBorder,
    marginVertical: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleEmoji: {
    fontSize: 18,
    width: 28,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.navActiveBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
