import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';

interface JournalEntry {
  id: string;
  type: 'free' | 'prompt';
  content: string;
  prompt?: string;
  date: string;
  createdAt: string;
  mood?: string;
}

const saveEntry = async (entry: JournalEntry) => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      await setDoc(doc(getFirestore(), 'users', uid, 'journal', entry.id), entry);
    }
    const raw = await AsyncStorage.getItem('bitzaJournal');
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [entry, ...existing.filter((e: JournalEntry) => e.id !== entry.id)];
    await AsyncStorage.setItem('bitzaJournal', JSON.stringify(updated));
  } catch (e) {
    console.log('saveEntry error:', e);
  }
};

const todayFormatted = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const todayKey = () => new Date().toISOString().split('T')[0];

const wordCount = (text: string) =>
  text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

export default function JournalWriteScreen() {
  const navigation = useNavigation<any>();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Nothing to save yet.', 'Write something first.');
      return;
    }
    setSaving(true);
    const entry: JournalEntry = {
      id: Date.now().toString(),
      type: 'free',
      content: content.trim(),
      date: todayKey(),
      createdAt: new Date().toISOString(),
    };
    await saveEntry(entry);
    setSaving(false);
    Alert.alert('Saved 💜', undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Journal</Text>
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.dateText}>{todayFormatted()}</Text>
      <View style={s.privacyPill}>
        <Ionicons name="lock-closed" size={10} color={Colors.textMuted} />
        <Text style={s.privacyText}>Private — only you can see this</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TextInput
          style={s.input}
          value={content}
          onChangeText={setContent}
          placeholder="What's on your mind today? This space is just for you..."
          placeholderTextColor={Colors.textMuted}
          multiline
          autoFocus
          textAlignVertical="top"
        />
        <View style={s.wordCountBar}>
          <Text style={s.wordCountText}>{wordCount(content)} words</Text>
        </View>
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
  saveBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingTop: 10,
    backgroundColor: Colors.pageBg,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'center',
    backgroundColor: Colors.navActiveBg,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 99,
    marginTop: 6,
    marginBottom: 4,
  },
  privacyText: { fontSize: 10, color: Colors.textMuted },

  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 26,
    backgroundColor: Colors.pageBg,
  },
  wordCountBar: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  wordCountText: { fontSize: 11, color: Colors.textMuted },
});
