import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from '@firebase/firestore';
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const loadContacts = async (): Promise<SupportContact[]> => {
  const contacts: SupportContact[] = [];
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDocs(collection(getFirestore(), 'users', uid, 'contacts'));
      snap.forEach(d => contacts.push({ id: d.id, ...d.data() } as SupportContact));
    }
  } catch (e) {}
  if (contacts.length === 0) {
    const raw = await AsyncStorage.getItem('bitzaContacts');
    if (raw) return JSON.parse(raw);
    const teamRaw = await AsyncStorage.getItem('bitzaCareTeam');
    if (teamRaw) return JSON.parse(teamRaw);
  }
  return contacts;
};

const deleteContact = async (id: string, all: SupportContact[]): Promise<SupportContact[]> => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) await deleteDoc(doc(getFirestore(), 'users', uid, 'contacts', id));
  } catch (e) {}
  const updated = all.filter(c => c.id !== id);
  await AsyncStorage.setItem('bitzaContacts', JSON.stringify(updated));
  return updated;
};

const toggleEmergency = async (id: string, all: SupportContact[]): Promise<SupportContact[]> => {
  const updated = all.map(c =>
    c.id === id ? { ...c, isEmergency: !c.isEmergency } : c
  );
  const contact = updated.find(c => c.id === id)!;
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) await setDoc(doc(getFirestore(), 'users', uid, 'contacts', id), contact, { merge: true });
  } catch (e) {}
  await AsyncStorage.setItem('bitzaContacts', JSON.stringify(updated));
  return updated;
};

// ─── Contact card ─────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  onEdit,
  onToggleEmergency,
  onDelete,
}: {
  contact: SupportContact;
  onEdit: () => void;
  onToggleEmergency: () => void;
  onDelete: () => void;
}) {
  const showMenu = () => {
    Alert.alert(contact.name, undefined, [
      { text: 'Edit', onPress: onEdit },
      {
        text: contact.isEmergency ? 'Remove from emergency' : 'Mark as emergency',
        onPress: onToggleEmergency,
      },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const callContact = () => {
    Alert.alert(`Call ${contact.name}?`, contact.phone, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${contact.phone}`) },
    ]);
  };

  return (
    <View style={[s.contactCard, contact.isEmergency && s.emergencyCard]}>
      {contact.isEmergency && <View style={s.emergencyAccent} />}
      <View style={s.cardInner}>
        {/* Avatar */}
        <View style={[s.avatar, { backgroundColor: contact.avatarColor }]}>
          <Text style={s.initials}>{contact.initials}</Text>
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={s.contactName}>{contact.name}</Text>
          <Text style={s.contactRole}>{contact.role}</Text>
          {!!contact.notes && (
            <Text style={s.contactNotes} numberOfLines={2}>{contact.notes}</Text>
          )}

          {/* Action buttons */}
          <View style={s.actionRow}>
            {!!contact.phone && (
              <TouchableOpacity style={s.actionBtn} onPress={callContact} activeOpacity={0.75}>
                <Ionicons name="call-outline" size={15} color={Colors.purple} />
              </TouchableOpacity>
            )}
            {!!contact.phone && (
              <TouchableOpacity
                style={s.actionBtn}
                onPress={() => Linking.openURL(`sms:${contact.phone}`)}
                activeOpacity={0.75}
              >
                <Ionicons name="chatbubble-outline" size={15} color={Colors.purple} />
              </TouchableOpacity>
            )}
            {!!contact.email && (
              <TouchableOpacity
                style={s.actionBtn}
                onPress={() => Linking.openURL(`mailto:${contact.email}`)}
                activeOpacity={0.75}
              >
                <Ionicons name="mail-outline" size={15} color={Colors.purple} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Three-dot menu */}
        <TouchableOpacity style={s.menuBtn} onPress={showMenu} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-vertical" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AllContactsScreen() {
  const navigation = useNavigation<any>();
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadContacts()
        .then(data => { if (active) setContacts(data); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const handleEdit = (contact: SupportContact) => {
    navigation.navigate('AddContact', { contact });
  };

  const handleToggleEmergency = async (contact: SupportContact) => {
    const updated = await toggleEmergency(contact.id, contacts);
    setContacts(updated);
  };

  const handleDelete = (contact: SupportContact) => {
    Alert.alert(`Delete ${contact.name}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteContact(contact.id, contacts);
          setContacts(updated);
        },
      },
    ]);
  };

  const emergency = contacts.filter(c => c.isEmergency);
  const all = contacts;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Support Contacts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddContact')} activeOpacity={0.8}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : contacts.length === 0 ? (
        <View style={s.emptyCenter}>
          <Text style={s.emptyEmoji}>👥</Text>
          <Text style={s.emptyTitle}>No contacts yet</Text>
          <Text style={s.emptySub}>
            Add people you trust so you can reach them quickly in hard moments.
          </Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => navigation.navigate('AddContact')}
            activeOpacity={0.85}
          >
            <Text style={s.emptyBtnText}>Add your first contact</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Emergency section */}
          {emergency.length > 0 && (
            <View>
              <Text style={s.sectionHeader}>🚨 EMERGENCY CONTACTS</Text>
              {emergency.map(c => (
                <ContactCard
                  key={c.id}
                  contact={c}
                  onEdit={() => handleEdit(c)}
                  onToggleEmergency={() => handleToggleEmergency(c)}
                  onDelete={() => handleDelete(c)}
                />
              ))}
            </View>
          )}

          {/* All contacts section */}
          <Text style={[s.sectionHeader, emergency.length > 0 && { marginTop: 16 }]}>
            ALL CONTACTS
          </Text>
          {all.map(c => (
            <ContactCard
              key={c.id}
              contact={c}
              onEdit={() => handleEdit(c)}
              onToggleEmergency={() => handleToggleEmergency(c)}
              onDelete={() => handleDelete(c)}
            />
          ))}

        </ScrollView>
      )}
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
  addBtnText: { fontSize: 14, fontWeight: '600', color: Colors.purple },

  scroll: { padding: 16, paddingBottom: 40 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  emergencyCard: { borderColor: '#E24B4A40' },
  emergencyAccent: {
    width: 3,
    backgroundColor: '#E24B4A',
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initials: { fontSize: 14, fontWeight: '500', color: Colors.purple },
  info: { flex: 1, gap: 2 },
  contactName: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  contactRole: { fontSize: 11, color: Colors.textMuted },
  contactNotes: { fontSize: 11, fontStyle: 'italic', color: Colors.textMuted, marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuBtn: { paddingTop: 2 },

  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 19 },
  emptyBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
