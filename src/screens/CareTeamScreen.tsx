import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Linking, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc, getDocs, deleteDoc, collection } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
  initials: string;
  avatarColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#EDE0FF', '#FFE8EE', '#E8F5E9', '#EEF4FF', '#FFF8EC', '#F0F8F0'
];

// ─── Firestore + AsyncStorage helpers ─────────────────────────────────────────

const getUid = () => getAuth().currentUser?.uid;
const db = getFirestore();

const getDefaultTeam = (): CareTeamMember[] => [
  { id: '1', name: 'You', role: 'Parent', initials: 'ME', avatarColor: '#EDE0FF' },
];

const loadTeam = async (): Promise<CareTeamMember[]> => {
  try {
    const uid = getUid();
    if (uid) {
      const snap = await getDocs(collection(db, 'users', uid, 'careTeam'));
      const members: CareTeamMember[] = [];
      snap.forEach(d => members.push({ id: d.id, ...d.data() } as CareTeamMember));
      if (members.length > 0) return members;
    }
  } catch (e) {}
  const raw = await AsyncStorage.getItem('bitzaCareTeam');
  return raw ? JSON.parse(raw) : getDefaultTeam();
};

const saveMember = async (member: CareTeamMember) => {
  try {
    const uid = getUid();
    if (uid) await setDoc(doc(db, 'users', uid, 'careTeam', member.id), member);
    const existing = await loadTeam();
    const updated = existing.filter(m => m.id !== member.id).concat(member);
    await AsyncStorage.setItem('bitzaCareTeam', JSON.stringify(updated));
  } catch (e) {
    console.log('saveMember error:', e);
  }
};

const deleteMember = async (id: string) => {
  try {
    const uid = getUid();
    if (uid) await deleteDoc(doc(db, 'users', uid, 'careTeam', id));
    const existing = await loadTeam();
    await AsyncStorage.setItem('bitzaCareTeam', JSON.stringify(existing.filter(m => m.id !== id)));
  } catch (e) {}
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Sub-components ───────────────────────────────────────────────────────────

function ContactButton({
  iconName,
  onPress,
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.contactBtn} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={iconName} size={16} color={Colors.purple} />
    </TouchableOpacity>
  );
}

function MemberCard({
  member,
  onEdit,
  onDelete,
}: {
  member: CareTeamMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isYou = member.name === 'You';

  const handleMenu = () => {
    Alert.alert(member.name, undefined, [
      { text: 'Edit', onPress: onEdit },
      ...(isYou ? [] : [{ text: 'Delete', style: 'destructive' as const, onPress: onDelete }]),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <View style={s.card}>
      <View style={s.cardTopRow}>
        <View style={[s.avatarCircle, { backgroundColor: member.avatarColor }]}>
          <Text style={s.avatarInitials}>{member.initials}</Text>
        </View>
        <Text style={s.memberName}>{member.name}</Text>
        <View style={s.rolePill}>
          <Text style={s.rolePillText}>{member.role}</Text>
        </View>
        <TouchableOpacity style={s.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {!isYou && (member.phone || member.email || member.notes) && (
        <View style={s.contactRow}>
          {member.phone && (
            <ContactButton
              iconName="call"
              onPress={() =>
                Alert.alert('Call', member.name + '?', [
                  { text: 'Cancel' },
                  { text: 'Call', onPress: () => Linking.openURL('tel:' + member.phone) },
                ])
              }
            />
          )}
          {member.phone && (
            <ContactButton
              iconName="chatbubble"
              onPress={() => Linking.openURL('sms:' + member.phone)}
            />
          )}
          {member.email && (
            <ContactButton
              iconName="mail"
              onPress={() => Linking.openURL('mailto:' + member.email)}
            />
          )}
          {member.notes && <Text style={s.noteText}>{member.notes}</Text>}
        </View>
      )}
    </View>
  );
}

interface MemberFormState {
  name: string;
  role: string;
  phone: string;
  email: string;
  notes: string;
}

const EMPTY_FORM: MemberFormState = { name: '', role: '', phone: '', email: '', notes: '' };

function MemberModal({
  visible,
  editing,
  onClose,
  onSave,
}: {
  visible: boolean;
  editing: CareTeamMember | null;
  onClose: () => void;
  onSave: (form: MemberFormState) => void;
}) {
  const [form, setForm] = useState<MemberFormState>(EMPTY_FORM);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        role: editing.role,
        phone: editing.phone ?? '',
        email: editing.email ?? '',
        notes: editing.notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing, visible]);

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert('Name required', "Please enter the team member's name.");
      return;
    }
    onSave(form);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.modalCard} activeOpacity={1} onPress={() => {}}>
          <Text style={s.modalTitle}>{editing ? 'Edit Team Member' : 'Add Team Member'}</Text>

          <TextInput
            style={s.input}
            value={form.name}
            onChangeText={t => setForm(f => ({ ...f, name: t }))}
            placeholder="Name"
            placeholderTextColor={Colors.textMuted}
          />
          <TextInput
            style={[s.input, { marginTop: 10 }]}
            value={form.role}
            onChangeText={t => setForm(f => ({ ...f, role: t }))}
            placeholder="e.g. Teacher, Speech Therapist, Doctor..."
            placeholderTextColor={Colors.textMuted}
          />
          <TextInput
            style={[s.input, { marginTop: 10 }]}
            value={form.phone}
            onChangeText={t => setForm(f => ({ ...f, phone: t }))}
            placeholder="Phone (optional)"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[s.input, { marginTop: 10 }]}
            value={form.email}
            onChangeText={t => setForm(f => ({ ...f, email: t }))}
            placeholder="Email (optional)"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[s.input, s.inputMulti, { marginTop: 10 }]}
            value={form.notes}
            onChangeText={t => setForm(f => ({ ...f, notes: t }))}
            placeholder="e.g. Available Mon-Fri, prefers email..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelLink} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CareTeamScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<CareTeamMember[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<CareTeamMember | null>(null);

  const refresh = () => {
    loadTeam()
      .then(setTeam)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const openAdd = () => {
    setEditingMember(null);
    setModalVisible(true);
  };

  const openEdit = (member: CareTeamMember) => {
    setEditingMember(member);
    setModalVisible(true);
  };

  const handleSaveMember = async (form: MemberFormState) => {
    const id = editingMember?.id ?? Date.now().toString();
    const avatarColor =
      editingMember?.avatarColor ?? AVATAR_COLORS[team.length % AVATAR_COLORS.length];

    const member: CareTeamMember = {
      id,
      name: form.name.trim(),
      role: form.role.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      notes: form.notes.trim() || undefined,
      initials: getInitials(form.name.trim()),
      avatarColor,
    };

    await saveMember(member);
    setModalVisible(false);
    setEditingMember(null);
    refresh();
  };

  const handleDelete = (member: CareTeamMember) => {
    Alert.alert('Remove', `Remove ${member.name} from care team?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteMember(member.id);
          refresh();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Care Team</Text>
        <TouchableOpacity style={s.addBtn} onPress={openAdd} activeOpacity={0.8}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.banner}>
            <Ionicons name="information-circle" size={16} color={Colors.textSecondary} />
            <Text style={s.bannerText}>
              Your care team can be shared selected progress notes and reports from the app.
            </Text>
          </View>

          {team.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={() => openEdit(member)}
              onDelete={() => handleDelete(member)}
            />
          ))}
        </ScrollView>
      )}

      <MemberModal
        visible={modalVisible}
        editing={editingMember}
        onClose={() => { setModalVisible(false); setEditingMember(null); }}
        onSave={handleSaveMember}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },

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
  addBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: Colors.purple },

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 16, paddingBottom: 40 },

  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.heroBg,
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bannerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 16, fontWeight: '500', color: Colors.purple },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginLeft: 12,
    flexShrink: 1,
  },
  rolePill: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  rolePillText: { fontSize: 11, color: Colors.purple },
  menuBtn: {
    marginLeft: 'auto',
    padding: 4,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginLeft: 4,
    flex: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 14,
    textAlign: 'center',
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
  inputMulti: { minHeight: 72 },

  saveBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelLink: { alignItems: 'center', marginTop: 12 },
  cancelLinkText: { fontSize: 13, color: Colors.purple },
});
