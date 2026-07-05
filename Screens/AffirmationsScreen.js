import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert, Animated, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/theme/colors';

const HUGI = require('../assets/icons/Hugi-Bunny.png');

const MOODS = [
  { emoji: '😰', label: 'Overwhelmed' },
  { emoji: '😔', label: 'Struggling' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🌿', label: 'Hopeful' },
  { emoji: '☀️', label: 'Good' },
];

export default function AffirmationsScreen() {
  const navigation = useNavigation();

  const [mode, setMode] = useState('mood'); // 'mood' | 'loading' | 'affirmation'
  const [selectedMood, setSelectedMood] = useState(null);
  const [affirmation, setAffirmation] = useState('');
  const [caregiverName, setCaregiverName] = useState('');
  const [childName, setChildName] = useState('');
  const [savedAffirmations, setSavedAffirmations] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadProfiles = async () => {
      const cp = await AsyncStorage.getItem('bitzaParentProfile');
      const ch = await AsyncStorage.getItem('bitzaChildProfile');
      if (cp) {
        const p = JSON.parse(cp);
        setCaregiverName(p.preferredGreeting || p.name || '');
      }
      if (ch) {
        const c = JSON.parse(ch);
        setChildName(c.childName || 'your child');
      }
      const saved = await AsyncStorage.getItem('bitzaSavedAffirmations');
      if (saved) setSavedAffirmations(JSON.parse(saved));
    };
    loadProfiles();
  }, []);

  const generateAffirmation = async (mood) => {
    setMode('loading');

    const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

    const prompt = `You are Hugi, a warm companion for caregivers of children with special needs. Generate ONE personalized affirmation for a caregiver who is feeling "${mood}" right now.

Caregiver name: ${caregiverName || 'this caregiver'}
Child name: ${childName || 'their child'}

Rules:
- Exactly 1-3 sentences
- Warm, grounded, and real — not toxic positivity
- Address the specific feeling (${mood})
- Use their name naturally if provided
- Reference their child naturally if it feels right
- Sound like a wise, caring friend — not a motivational poster
- No hashtags, no "you've got this!" clichés
- End with warmth, not pressure
- Do not use quotation marks around the affirmation
- Return ONLY the affirmation text, nothing else`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content[0].text.trim();
      setAffirmation(text);
      setMode('affirmation');
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    } catch (e) {
      const fallbacks = {
        'Overwhelmed': `${caregiverName ? caregiverName + ', you' : 'You'} are carrying more than most people will ever understand. That you are still here, still trying — that is not nothing. That is everything. 💜`,
        'Struggling': `Hard days do not erase everything you have done right. You showed up for ${childName} today, even when it was hard. That counts. 💜`,
        'Okay': `Okay is enough. Not every day has to be a breakthrough. You are steady, and steady is powerful. 💜`,
        'Hopeful': `Hold onto that feeling. Hopeful days remind you what you are working toward — and you deserve more of them. 💜`,
        'Good': `Let yourself feel this fully. Good days are not luck — they are also the result of everything you have put in. 💜`,
      };
      setAffirmation(fallbacks[mood] || `You are doing something incredibly hard with incredible love. 💜`);
      setMode('affirmation');
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }
  };

  const saveAffirmation = async () => {
    if (savedAffirmations.includes(affirmation)) {
      Alert.alert('Already saved', 'This affirmation is already in your saved list.');
      return;
    }
    const updated = [affirmation, ...savedAffirmations];
    setSavedAffirmations(updated);
    await AsyncStorage.setItem('bitzaSavedAffirmations', JSON.stringify(updated));
    Alert.alert('Saved 💜', 'This affirmation has been saved to your journal.');
  };

  const selectedMoodObj = MOODS.find(m => m.label === selectedMood);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Affirmations</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── MODE: MOOD SELECTION ──────────────────────────────────── */}
        {mode === 'mood' && (
          <View style={s.moodWrap}>
            <View style={s.hugiCircle}>
              <Image source={HUGI} style={s.hugiImg} resizeMode="contain" />
            </View>
            <Text style={s.moodTitle}>How are you feeling right now?</Text>
            <Text style={s.moodSubtitle}>Hugi will share something just for you.</Text>

            <View style={s.moodCards}>
              {MOODS.map(mood => (
                <TouchableOpacity
                  key={mood.label}
                  style={s.moodCard}
                  onPress={() => {
                    setSelectedMood(mood.label);
                    generateAffirmation(mood.label);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={s.moodEmoji}>{mood.emoji}</Text>
                  <Text style={s.moodLabel}>{mood.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.grayLavender} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── MODE: LOADING ─────────────────────────────────────────── */}
        {mode === 'loading' && (
          <View style={s.loadingWrap}>
            <Image source={HUGI} style={s.hugiLarge} resizeMode="contain" />
            <ActivityIndicator color={Colors.purple} size="large" style={{ marginTop: 16 }} />
            <Text style={s.loadingText}>Hugi is thinking of something just for you...</Text>
          </View>
        )}

        {/* ── MODE: AFFIRMATION ─────────────────────────────────────── */}
        {mode === 'affirmation' && (
          <Animated.View style={[s.affirmWrap, { opacity: fadeAnim }]}>
            <View style={s.hugiCircle}>
              <Image source={HUGI} style={s.hugiImg} resizeMode="contain" />
            </View>

            {selectedMoodObj && (
              <View style={s.moodChip}>
                <Text style={s.moodChipText}>{selectedMoodObj.emoji} {selectedMoodObj.label}</Text>
              </View>
            )}

            <View style={s.affirmCard}>
              <Text style={s.quoteMark}>"</Text>
              <Text style={s.affirmText}>{affirmation}</Text>
              <Text style={s.hugiSig}>— Hugi 💜</Text>
            </View>

            <Text style={s.breatheText}>Read it once. Breathe. Let it be enough.</Text>

            <View style={s.actionBtns}>
              <TouchableOpacity style={s.saveBtn} onPress={saveAffirmation} activeOpacity={0.85}>
                <Text style={s.saveBtnText}>Save this one 💜</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.anotherBtn}
                onPress={() => generateAffirmation(selectedMood)}
                activeOpacity={0.85}
              >
                <Text style={s.anotherBtnText}>Give me another</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.changeMoodLink} onPress={() => setMode('mood')} activeOpacity={0.7}>
              <Text style={s.changeMoodText}>Choose a different mood</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

      </ScrollView>
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

  scroll: { padding: 20, paddingBottom: 48 },

  // ── Mood mode ──────────────────────────────────────────────────────
  moodWrap: { alignItems: 'center' },
  hugiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.purple,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  hugiImg: { width: 80, height: 80 },
  moodTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
  },
  moodSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  moodCards: { width: '100%', marginTop: 24, gap: 10 },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  moodEmoji: { fontSize: 24 },
  moodLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },

  // ── Loading mode ────────────────────────────────────────────────────
  loadingWrap: { alignItems: 'center', paddingTop: 48 },
  hugiLarge: { width: 100, height: 100 },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },

  // ── Affirmation mode ────────────────────────────────────────────────
  affirmWrap: { alignItems: 'center' },
  moodChip: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  moodChipText: { fontSize: 12, color: Colors.purple, fontWeight: '500' },

  affirmCard: {
    width: '100%',
    backgroundColor: '#EDE3FF',
    borderWidth: 0.5,
    borderColor: '#D0B8F8',
    borderRadius: 24,
    padding: 28,
    paddingHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  quoteMark: {
    fontSize: 48,
    color: Colors.purple,
    opacity: 0.3,
    lineHeight: 44,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  affirmText: {
    fontSize: 20,
    color: Colors.textPrimary,
    lineHeight: 30,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hugiSig: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },

  breatheText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },

  actionBtns: { width: '100%', marginTop: 24, gap: 10 },
  saveBtn: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '500', color: Colors.purple },
  anotherBtn: {
    width: '100%',
    backgroundColor: Colors.navActiveBg,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  anotherBtnText: { fontSize: 13, fontWeight: '500', color: Colors.purple },

  changeMoodLink: { marginTop: 16 },
  changeMoodText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
});
