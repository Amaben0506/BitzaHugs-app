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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
      <View style={s.labelRow}>
        <Text style={s.label}>{label}</Text>
        {hint ? <Text style={s.labelHint}>{hint}</Text> : null}
      </View>
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

export default function ChildSetupScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const caregiverData = route.params?.caregiverData ?? {};

  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [triggers, setTriggers] = useState('');
  const [calmingStrategies, setCalmingStrategies] = useState('');
  const [communication, setCommunication] = useState('');
  const [todaysFocus, setTodaysFocus] = useState('');

  const handleContinue = () => {
    navigation.navigate('SupportSetup', {
      caregiverData,
      childData: { childName, age, diagnosis, triggers, calmingStrategies, communication, todaysFocus },
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
          <ProgressDots total={4} active={2} />
          <View style={s.backBtn} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>Now, tell me about your child.</Text>
          <Text style={s.subtitle}>The more Hugi knows, the more helpful she can be.</Text>

          <View style={s.card}>
            <Field
              label="Child's name"
              value={childName}
              onChangeText={setChildName}
              placeholder="Zachariah"
            />

            <View style={s.divider} />

            <Field
              label="Age"
              value={age}
              onChangeText={setAge}
              placeholder="5"
              keyboardType="numeric"
            />

            <View style={s.divider} />

            <Field
              label="Diagnosis or profile"
              hint="Optional — only share what feels right"
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="e.g. Autism, ADHD, sensory processing differences..."
              multiline
            />

            <View style={s.divider} />

            <Field
              label="What tends to trigger difficult moments?"
              value={triggers}
              onChangeText={setTriggers}
              placeholder="e.g. transitions, loud noises, changes in routine..."
              multiline
            />

            <View style={s.divider} />

            <Field
              label="What helps your child calm down?"
              value={calmingStrategies}
              onChangeText={setCalmingStrategies}
              placeholder="e.g. deep pressure, quiet space, visual schedules..."
              multiline
            />

            <View style={s.divider} />

            <Field
              label="How does your child communicate?"
              value={communication}
              onChangeText={setCommunication}
              placeholder="e.g. verbal, gestures, PECS, AAC device..."
            />

            <View style={s.divider} />

            <Field
              label="Anything important about today?"
              hint="Optional"
              value={todaysFocus}
              onChangeText={setTodaysFocus}
              placeholder="e.g. big transition today, therapy appointment..."
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
  fieldBlock: { paddingVertical: 4 },
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
