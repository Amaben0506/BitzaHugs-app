import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { saveCaregiverProfile } from '../lib/dataService';

// ─── Tone options ─────────────────────────────────────────────────────────────

const TONES = [
  { value: 'gentle',      label: '💜 Gentle & warm' },
  { value: 'practical',   label: '✅ Practical & clear' },
  { value: 'direct',      label: '💪 Direct & honest' },
  { value: 'encouraging', label: '🌟 Encouraging' },
] as const;

type Tone = typeof TONES[number]['value'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EditCaregiverProfileScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [preferredGreeting, setPreferredGreeting] = useState('');
  const [hugiTone, setHugiTone] = useState<Tone>('gentle');
  const [calmingStrategies, setCalmingStrategies] = useState('');
  const [focusNote, setFocusNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem('bitzaParentProfile');
      if (raw) {
        const p = JSON.parse(raw);
        setName(p.name || '');
        setPreferredGreeting(p.preferredGreeting || '');
        setHugiTone(p.hugiTone || 'gentle');
        setCalmingStrategies(p.calmingStrategies || '');
        setFocusNote(p.focusNote || '');
        setPhotoUri(p.photoUri || null);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // ── Photo pickers ──────────────────────────────────────────────────────────

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to add a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Profile Photo', 'Choose how to add your photo', [
      { text: 'Take a photo', onPress: takePhoto },
      { text: 'Choose from library', onPress: pickPhoto },
      { text: 'Remove photo', onPress: () => setPhotoUri(null), style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setIsSaving(true);
    const profile = {
      name: name.trim(),
      preferredGreeting: preferredGreeting.trim() || name.trim(),
      hugiTone,
      calmingStrategies: calmingStrategies.trim(),
      focusNote: focusNote.trim(),
      photoUri,
    };
    await saveCaregiverProfile(profile);
    setIsSaving(false);
    Alert.alert('Saved 💜', 'Your profile has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  const initials = getInitials(name || '?');

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit My Profile</Text>
        <TouchableOpacity
          style={[s.saveHeaderBtn, isSaving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.saveHeaderBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar section */}
          <TouchableOpacity style={s.avatarSection} onPress={showPhotoOptions} activeOpacity={0.85}>
            <View style={s.avatarWrap}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={s.avatarPhoto} />
              ) : (
                <View style={s.avatarInitials}>
                  <Text style={s.initialsText}>{initials}</Text>
                </View>
              )}
              <View style={s.cameraBadge}>
                <Ionicons name="camera" size={13} color={Colors.textRose} />
              </View>
            </View>
            <Text style={s.changePhotoText}>Change photo</Text>
          </TouchableOpacity>

          {/* Fields card */}
          <View style={s.card}>

            {/* Name */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>YOUR NAME <Text style={s.required}>*</Text></Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Amanda"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={s.divider} />

            {/* Preferred greeting */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>
                WHAT SHOULD HUGI CALL YOU?{' '}
                <Text style={s.fieldHint}>(Can be a nickname)</Text>
              </Text>
              <TextInput
                style={s.input}
                value={preferredGreeting}
                onChangeText={setPreferredGreeting}
                placeholder="Amanda, Mom, Mama..."
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={s.divider} />

            {/* Hugi tone */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>HOW WOULD YOU LIKE HUGI TO SUPPORT YOU?</Text>
              <View style={s.toneGrid}>
                {TONES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[s.toneChip, hugiTone === t.value && s.toneChipActive]}
                    onPress={() => setHugiTone(t.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.toneChipText, hugiTone === t.value && s.toneChipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.divider} />

            {/* Calming strategies */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>
                WHEN YOU'RE OVERWHELMED, WHAT HELPS YOU?{' '}
                <Text style={s.fieldHint}>(Hugi will remind you)</Text>
              </Text>
              <TextInput
                style={[s.input, s.inputMulti]}
                value={calmingStrategies}
                onChangeText={setCalmingStrategies}
                placeholder="e.g. deep breaths, stepping outside, cold water..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={s.divider} />

            {/* Focus note */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>
                WHAT ARE YOU FOCUSING ON RIGHT NOW?{' '}
                <Text style={s.fieldHint}>(Optional)</Text>
              </Text>
              <TextInput
                style={[s.input, s.inputMulti]}
                value={focusNote}
                onChangeText={setFocusNote}
                placeholder="e.g. taking it one day at a time, being more patient with myself..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>

          </View>

          {/* Bottom save button */}
          <TouchableOpacity
            style={[s.saveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.saveBtnText}>Save changes</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
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
  saveHeaderBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveHeaderBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  scroll: { padding: 20, paddingBottom: 48 },

  // ── Avatar ────────────────────────────────────────────────────────────────
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: {
    width: 90,
    height: 90,
    position: 'relative',
  },
  avatarPhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#F0D0E8',
  },
  avatarInitials: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F5D0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontSize: 24, fontWeight: '500', color: '#C03060' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#F0D0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textRose,
    textAlign: 'center',
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  divider: { height: 0.5, backgroundColor: Colors.cardBorder, marginVertical: 2 },

  fieldGroup: { paddingVertical: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  required: { color: Colors.textRose },
  fieldHint: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.grayLavender,
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.pageBg,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  inputMulti: {
    minHeight: 72,
    lineHeight: 22,
  },

  // ── Tone chips ────────────────────────────────────────────────────────────
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.pageBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    minWidth: '45%',
    alignItems: 'center',
  },
  toneChipActive: {
    backgroundColor: Colors.navActiveBg,
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  toneChipText: { fontSize: 13, color: Colors.textSecondary },
  toneChipTextActive: { color: Colors.purple, fontWeight: '500' },

  // ── Save button ───────────────────────────────────────────────────────────
  saveBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
