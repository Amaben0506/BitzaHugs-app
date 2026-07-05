import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Switch,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupportContact {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
  initials: string;
  avatarColor: string;
  isEmergency?: boolean;
}

type RouteParams = {
  AddContact: { contact?: SupportContact };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#EDE0FF', '#FFE8EE', '#E8F5E9', '#EEF4FF', '#FFF8EC', '#F0F8F0',
];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const saveContact = async (contact: SupportContact) => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) await setDoc(doc(getFirestore(), 'users', uid, 'contacts', contact.id), contact);
    const raw = await AsyncStorage.getItem('bitzaContacts');
    const existing: SupportContact[] = raw ? JSON.parse(raw) : [];
    const updated = [contact, ...existing.filter(c => c.id !== contact.id)];
    await AsyncStorage.setItem('bitzaContacts', JSON.stringify(updated));
  } catch (e) {}
};

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={f.row}>
      <Text style={f.label}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddContactScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'AddContact'>>();
  const editing = route.params?.contact;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name ?? '');
      setRole(editing.role ?? '');
      setPhone(editing.phone ?? '');
      setEmail(editing.email ?? '');
      setNotes(editing.notes ?? '');
      setIsEmergency(editing.isEmergency ?? false);
    }
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this contact.');
      return;
    }
    setSaving(true);

    const existing = await AsyncStorage.getItem('bitzaContacts');
    const all: SupportContact[] = existing ? JSON.parse(existing) : [];
    const colorIndex = editing
      ? AVATAR_COLORS.indexOf(editing.avatarColor) >= 0
        ? AVATAR_COLORS.indexOf(editing.avatarColor)
        : all.length % AVATAR_COLORS.length
      : all.length % AVATAR_COLORS.length;

    const contact: SupportContact = {
      id: editing?.id ?? Date.now().toString(),
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      initials: getInitials(name),
      avatarColor: AVATAR_COLORS[colorIndex],
      isEmergency,
    };

    await saveContact(contact);
    setSaving(false);
    navigation.goBack();
  };

  return (
    <View style={s.root}>
      {/* Handle bar */}
      <View style={s.handle} />

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <Text style={s.title}>{editing ? 'Edit Contact' : 'Add Support Contact'}</Text>

            {/* Fields card */}
            <View style={s.card}>

              <FieldRow label="Name *">
                <TextInput
                  style={f.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Bret, Mom, Dr. Smith"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  returnKeyType="next"
                  autoFocus
                />
              </FieldRow>

              <View style={s.divider} />

              <FieldRow label="Role">
                <TextInput
                  style={f.input}
                  value={role}
                  onChangeText={setRole}
                  placeholder="e.g. Partner, Teacher, Pediatrician"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </FieldRow>

              <View style={s.divider} />

              <FieldRow label="Phone">
                <TextInput
                  style={f.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="555-0100"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </FieldRow>

              <View style={s.divider} />

              <FieldRow label="Email">
                <TextInput
                  style={f.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@email.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </FieldRow>

              <View style={s.divider} />

              <FieldRow label="Notes">
                <TextInput
                  style={[f.input, f.inputMulti]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Available weekdays, prefers text messages..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </FieldRow>

              <View style={s.divider} />

              {/* Emergency switch */}
              <View style={s.switchRow}>
                <View style={s.switchLabelCol}>
                  <Text style={s.switchLabel}>Emergency contact</Text>
                  <Text style={s.switchSub}>Show at top with red accent</Text>
                </View>
                <Switch
                  value={isEmergency}
                  onValueChange={setIsEmergency}
                  trackColor={{ false: Colors.grayLavender, true: '#E24B4A' }}
                  thumbColor="#fff"
                />
              </View>

            </View>

            {/* Save button */}
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveBtnText}>Save contact</Text>}
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.grayLavender,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  scroll: { padding: 20, paddingBottom: 48 },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
    overflow: 'hidden',
  },
  divider: { height: 0.5, backgroundColor: Colors.cardBorder },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  switchLabelCol: { flex: 1 },
  switchLabel: { fontSize: 14, color: Colors.textPrimary },
  switchSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  saveBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 13, color: Colors.textMuted },
});

const f = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 12 },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  input: {
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.pageBg,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  inputMulti: { minHeight: 68, lineHeight: 20 },
});
