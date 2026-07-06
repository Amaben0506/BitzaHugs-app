import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

type Tone = 'gentle' | 'practical' | 'direct' | 'encouraging';

function ProgressDots({ total, active }: { total: number; active: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.dot, i === active ? s.dotActive : s.dotInactive]} />
      ))}
    </View>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <View style={s.labelRow}>
      <Text style={s.label}>{label}</Text>
      {hint ? <Text style={s.labelHint}>{hint}</Text> : null}
    </View>
  );
}

function Field({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={s.fieldBlock}>
      <FieldLabel label={label} hint={hint} />
      <TextInput
        style={[s.input, multiline && s.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const TONE_OPTIONS: Array<{ emoji: string; label: string; value: Tone }> = [
  { emoji: '💜', label: 'Gentle & warm', value: 'gentle' },
  { emoji: '✅', label: 'Practical & clear', value: 'practical' },
  { emoji: '💪', label: 'Direct & honest', value: 'direct' },
  { emoji: '🌟', label: 'Encouraging', value: 'encouraging' },
];

export default function CaregiverSetupScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [tone, setTone] = useState<Tone | null>(null);
  const [calmingStrategy, setCalmingStrategy] = useState('');

  const handleContinue = () => {
    navigation.navigate('ChildSetup', {
      caregiverData: { name, greeting, tone, calmingStrategy },
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <ProgressDots total={4} active={1} />
          <View style={s.backBtn} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>First, a little about you.</Text>
          <Text style={s.subtitle}>This helps Hugi support you in a way that feels right.</Text>

          <View style={s.card}>
            <Field
              label="Your name"
              value={name}
              onChangeText={setName}
              placeholder="friend"
            />

            <View style={s.divider} />

            <Field
              label="What should Hugi call you?"
              hint="Can be a nickname"
              value={greeting}
              onChangeText={setGreeting}
              placeholder="friend, Mom, Mama..."
            />

            <View style={s.divider} />

            {/* Tone chips */}
            <View style={s.fieldBlock}>
              <FieldLabel label="How would you like Hugi to support you?" />
              <View style={s.chipGrid}>
                {TONE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[s.toneChip, tone === opt.value && s.toneChipSelected]}
                    onPress={() => setTone(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.toneChipEmoji}>{opt.emoji}</Text>
                    <Text style={[s.toneChipLabel, tone === opt.value && s.toneChipLabelSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.divider} />

            <Field
              label="When you're overwhelmed, what helps you?"
              hint="Hugi will remind you"
              value={calmingStrategy}
              onChangeText={setCalmingStrategy}
              placeholder="e.g. deep breaths, stepping outside, cold water..."
              multiline
            />
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Continue</Text>
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
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.purple, width: 22 },
  dotInactive: { backgroundColor: Colors.grayLavender },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
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
  fieldBlock: {
    paddingVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelHint: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: Colors.pageBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputMulti: {
    minHeight: 72,
    paddingTop: 11,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.cardBorder,
    marginVertical: 14,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
    backgroundColor: Colors.cardBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  toneChipSelected: {
    backgroundColor: Colors.navActiveBg,
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  toneChipEmoji: { fontSize: 14 },
  toneChipLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  toneChipLabelSelected: {
    color: Colors.purple,
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
