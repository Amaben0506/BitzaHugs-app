import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Colors } from '../theme/colors';
import '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Win {
  id: string;
  emoji: string;
  label: string;
  date: string;
  createdAt: string;
}

interface RouteParams {
  win?: Win;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WIN_EMOJIS = [
  '⭐', '🌟', '🏆', '💪', '🎉',
  '🌈', '🦋', '🌸', '💜', '🤝',
  '🎨', '📚', '🍽️', '🧩', '🎯',
  '🌿', '☀️', '🐾', '💫', '✨',
];

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AddWinScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const existingWin = (route.params as RouteParams)?.win;

  const [selectedEmoji, setSelectedEmoji] = useState<string>(existingWin?.emoji ?? '');
  const [label, setLabel] = useState(existingWin?.label ?? '');
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const saveWin = async () => {
    if (!selectedEmoji) {
      Alert.alert('Choose an icon', 'Pick an emoji for this win.');
      return;
    }
    if (!label.trim()) {
      Alert.alert('Add a description', 'What happened?');
      return;
    }

    setSaving(true);
    const win: Win = {
      id: existingWin?.id ?? Date.now().toString(),
      emoji: selectedEmoji,
      label: label.trim(),
      date: new Date().toISOString().split('T')[0],
      createdAt: existingWin?.createdAt ?? new Date().toISOString(),
    };

    try {
      const uid = getAuth().currentUser?.uid;
      if (uid) await setDoc(doc(getFirestore(), 'users', uid, 'wins', win.id), win);
      const raw = await AsyncStorage.getItem('bitzaWins');
      const existing: Win[] = raw ? JSON.parse(raw) : [];
      const updated = [win, ...existing.filter(w => w.id !== win.id)];
      await AsyncStorage.setItem('bitzaWins', JSON.stringify(updated));
    } catch (e) {
      console.log('saveWin error:', e);
    } finally {
      setSaving(false);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.handle} />
      <Text style={s.title}>Record a Win 🌟</Text>
      <Text style={s.subtitle}>Every small step counts.</Text>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.fieldLabel}>CHOOSE AN ICON</Text>
        <View style={s.emojiGrid}>
          {WIN_EMOJIS.map(emoji => {
            const active = selectedEmoji === emoji;
            return (
              <TouchableOpacity
                key={emoji}
                style={[s.emojiCircle, active && s.emojiCircleActive]}
                onPress={() => setSelectedEmoji(emoji)}
                activeOpacity={0.8}
              >
                <Text style={s.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[s.fieldLabel, { marginTop: 18 }]}>WHAT HAPPENED?</Text>
        <TextInput
          style={s.input}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Completed morning routine independently, tried a new food, used calm corner..."
          placeholderTextColor={Colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        <Text style={[s.fieldLabel, { marginTop: 18 }]}>WHEN?</Text>
        <View style={s.datePill}>
          <Text style={s.datePillText}>Today · {today}</Text>
        </View>

        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={saveWin}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save this win 🌟'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelLink} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.cancelLinkText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.grayLavender,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },

  scroll: { padding: 20, paddingBottom: 40 },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  emojiCircleActive: {
    backgroundColor: '#EDE0FF',
    borderColor: Colors.purple,
  },
  emojiText: { fontSize: 24 },

  input: {
    backgroundColor: '#F5F0FA',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 80,
  },

  datePill: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  datePillText: { fontSize: 13, color: Colors.purple, fontWeight: '500' },

  saveBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  cancelLink: { alignItems: 'center', marginTop: 12 },
  cancelLinkText: { fontSize: 12, color: Colors.textMuted },
});
