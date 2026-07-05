import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView
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
}

const PROMPTS = [
  { id: '1', text: 'What felt hardest today?', category: 'reflection' },
  { id: '2', text: 'What did you handle better than you realize?', category: 'strength' },
  { id: '3', text: 'What do you need more of right now?', category: 'needs' },
  { id: '4', text: 'What can wait until tomorrow?', category: 'release' },
  { id: '5', text: 'What is one thing you are proud of today?', category: 'wins' },
  { id: '6', text: 'What helped you feel grounded today?', category: 'grounding' },
  { id: '7', text: 'What do you wish someone understood about your life right now?', category: 'connection' },
  { id: '8', text: 'If you could give yourself one gift today, what would it be?', category: 'self-care' },
  { id: '9', text: 'What moment today deserves to be remembered?', category: 'gratitude' },
  { id: '10', text: 'What would you tell a friend going through what you are going through?', category: 'compassion' },
];

const randomPrompt = (exclude?: string) => {
  const pool = PROMPTS.filter(p => p.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
};

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

export default function JournalPromptScreen() {
  const navigation = useNavigation<any>();
  const [selectedPrompt, setSelectedPrompt] = useState(() => randomPrompt());
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
      type: 'prompt',
      content: content.trim(),
      prompt: selectedPrompt.text,
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
        <Text style={s.headerTitle}>Journal Prompt</Text>
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          {/* Prompt card */}
          <View style={s.promptCard}>
            <View style={s.promptLabelRow}>
              <Text style={s.promptSparkle}>✨</Text>
              <Text style={s.promptLabel}>Today's prompt</Text>
            </View>
            <Text style={s.promptText}>{selectedPrompt.text}</Text>
            <TouchableOpacity
              style={s.tryAnotherLink}
              onPress={() => setSelectedPrompt(randomPrompt(selectedPrompt.id))}
              activeOpacity={0.7}
            >
              <Text style={s.tryAnotherText}>Try another prompt →</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy badge */}
          <View style={s.privacyPill}>
            <Ionicons name="lock-closed" size={10} color={Colors.textMuted} />
            <Text style={s.privacyText}>Private — only you can see this</Text>
          </View>

          {/* Writing area */}
          <TextInput
            style={s.input}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing here..."
            placeholderTextColor={Colors.textMuted}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          <View style={s.wordCountBar}>
            <Text style={s.wordCountText}>{wordCount(content)} words</Text>
          </View>
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
    paddingBottom: 4,
    backgroundColor: Colors.pageBg,
  },

  promptCard: {
    backgroundColor: '#EDE3FF',
    borderWidth: 0.5,
    borderColor: '#D0B8F8',
    borderRadius: 20,
    padding: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  promptLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  promptSparkle: { fontSize: 12 },
  promptLabel: { fontSize: 11, color: Colors.textSecondary },
  promptText: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  tryAnotherLink: { marginTop: 8 },
  tryAnotherText: { fontSize: 11, color: Colors.purple },

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
    marginBottom: 4,
  },
  privacyText: { fontSize: 10, color: Colors.textMuted },

  input: {
    flex: 1,
    minHeight: 200,
    paddingHorizontal: 20,
    paddingTop: 12,
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
