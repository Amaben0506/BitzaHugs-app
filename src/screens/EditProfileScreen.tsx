import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { saveChildProfile, loadChildProfile } from '../lib/dataService';

const AVATAR_OPTIONS = [
  '🦕', '🦖', '🐉', '🦄', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐸', '🐧', '🦊', '🐺', '🐮', '🐷', '🦋',
  '🐬', '🦈', '🐙', '🦀', '🌟', '🌈', '🎨', '🚀', '⚡️',
];

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

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [avatarEmoji, setAvatarEmoji] = useState('🦕');
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [triggers, setTriggers] = useState('');
  const [calmingStrategies, setCalmingStrategies] = useState('');
  const [communication, setCommunication] = useState('');
  const [todaysFocus, setTodaysFocus] = useState('');

  useEffect(() => {
    loadChildProfile()
      .then(profile => {
        if (profile) {
          setAvatarEmoji(profile.avatarEmoji ?? '🦕');
          setChildName(profile.childName ?? '');
          setAge(profile.age ?? '');
          setDiagnosis(profile.diagnosis ?? '');
          setTriggers(profile.triggers ?? '');
          setCalmingStrategies(profile.calmingStrategies ?? '');
          setCommunication(profile.communication ?? '');
          setTodaysFocus(profile.todaysFocus ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!childName.trim()) {
      Alert.alert('Name required', "Please enter your child's name.");
      return;
    }
    setSaving(true);
    try {
      await saveChildProfile({
        avatarEmoji,
        childName: childName.trim(),
        age,
        diagnosis,
        triggers,
        calmingStrategies,
        communication,
        todaysFocus,
      });
      Alert.alert('Saved', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Child Profile</Text>
        <TouchableOpacity
          style={[s.saveBtn, saving && s.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.card}>
              {/* Avatar picker */}
              <View style={s.avatarSection}>
                <View style={s.avatarCircle}>
                  <Text style={s.avatarEmoji}>{avatarEmoji}</Text>
                </View>
                <TouchableOpacity onPress={() => setPickerVisible(true)} activeOpacity={0.7}>
                  <Text style={s.changeAvatarText}>Change avatar</Text>
                </TouchableOpacity>
              </View>

              <View style={s.divider} />

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

            <TouchableOpacity
              style={[s.primaryBtn, saving && s.primaryBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text style={s.primaryBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Emoji picker modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={s.pickerCard} onPress={() => {}}>
            <Text style={s.pickerTitle}>Choose an avatar</Text>
            <View style={s.emojiGrid}>
              {AVATAR_OPTIONS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    s.emojiOption,
                    avatarEmoji === emoji && s.emojiOptionSelected,
                  ]}
                  onPress={() => {
                    setAvatarEmoji(emoji);
                    setPickerVisible(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={s.emojiOptionText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={s.cancelRow}
              onPress={() => setPickerVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardBorder,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.navActiveBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  saveBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 16,
  },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarEmoji: { fontSize: 36 },
  changeAvatarText: {
    fontSize: 11,
    color: Colors.purple,
    fontWeight: '500',
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
  labelHint: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic' },
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
  inputMulti: { minHeight: 80, paddingTop: 11 },
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
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: 400,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  emojiOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: Colors.purple,
  },
  emojiOptionText: { fontSize: 24 },
  cancelRow: {
    alignItems: 'center',
    paddingTop: 16,
  },
  cancelText: { fontSize: 13, color: Colors.textMuted },
});
