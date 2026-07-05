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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DailyNote {
  date: string;
  overallRating: number;
  routinesCompleted: 'yes' | 'mostly' | 'no' | null;
  transitionsDifficult: 'yes' | 'some' | 'no' | null;
  sensoryChallenges: boolean | null;
  sensoryNote: string;
  calmToolsUsed: string[];
  whatHelpedMost: string;
  difficultMoments: boolean | null;
  difficultNote: string;
  winsToday: string;
  careTeamNote: string;
  savedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

const RATING_OPTIONS = [
  { value: 1, emoji: '😰', label: 'Really hard' },
  { value: 2, emoji: '😔', label: 'Tough' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🌟', label: 'Great' },
];

const ROUTINE_OPTIONS = [
  { value: 'yes' as const, label: 'Yes ✓' },
  { value: 'mostly' as const, label: 'Mostly' },
  { value: 'no' as const, label: 'Not really' },
];

const TRANSITION_OPTIONS = [
  { value: 'yes' as const, label: 'Yes' },
  { value: 'some' as const, label: 'Some' },
  { value: 'no' as const, label: 'No' },
];

const CALM_TOOLS = ['Transition Timer', 'Show Me', 'Deep Pressure', 'Quiet Space', 'Calming Sounds', 'Other'];

// ─── Firestore helpers ────────────────────────────────────────────────────────

const loadNote = async (): Promise<DailyNote | null> => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDoc(doc(getFirestore(), 'users', uid, 'progressNotes', today));
      if (snap.exists()) return snap.data() as DailyNote;
    }
  } catch {
    // fall through to AsyncStorage
  }
  const raw = await AsyncStorage.getItem(`bitzaProgressNote_${today}`);
  return raw ? JSON.parse(raw) : null;
};

const saveNote = async (note: DailyNote) => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      await setDoc(doc(getFirestore(), 'users', uid, 'progressNotes', today), note);
    }
    await AsyncStorage.setItem(`bitzaProgressNote_${today}`, JSON.stringify(note));
  } catch {
    await AsyncStorage.setItem(`bitzaProgressNote_${today}`, JSON.stringify(note));
  }
};

const formatToday = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

function ChipGroup<T extends string | boolean>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={s.chipRow}>
      {options.map(opt => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            style={[s.chip, active && s.chipActive]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={[s.chipText, active && s.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DailyNoteScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [overallRating, setOverallRating] = useState<number>(0);
  const [routinesCompleted, setRoutinesCompleted] = useState<'yes' | 'mostly' | 'no' | null>(null);
  const [transitionsDifficult, setTransitionsDifficult] = useState<'yes' | 'some' | 'no' | null>(null);
  const [sensoryChallenges, setSensoryChallenges] = useState<boolean | null>(null);
  const [sensoryNote, setSensoryNote] = useState('');
  const [calmToolsUsed, setCalmToolsUsed] = useState<string[]>([]);
  const [whatHelpedMost, setWhatHelpedMost] = useState('');
  const [difficultMoments, setDifficultMoments] = useState<boolean | null>(null);
  const [difficultNote, setDifficultNote] = useState('');
  const [winsToday, setWinsToday] = useState('');
  const [careTeamNote, setCareTeamNote] = useState('');

  useEffect(() => {
    loadNote()
      .then(note => {
        if (note) {
          setOverallRating(note.overallRating ?? 0);
          setRoutinesCompleted(note.routinesCompleted ?? null);
          setTransitionsDifficult(note.transitionsDifficult ?? null);
          setSensoryChallenges(note.sensoryChallenges ?? null);
          setSensoryNote(note.sensoryNote ?? '');
          setCalmToolsUsed(note.calmToolsUsed ?? []);
          setWhatHelpedMost(note.whatHelpedMost ?? '');
          setDifficultMoments(note.difficultMoments ?? null);
          setDifficultNote(note.difficultNote ?? '');
          setWinsToday(note.winsToday ?? '');
          setCareTeamNote(note.careTeamNote ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCalmTool = (tool: string) => {
    setCalmToolsUsed(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const handleSave = async () => {
    if (!overallRating) {
      Alert.alert('Rating required', 'Please select how today went overall.');
      return;
    }
    setSaving(true);
    const note: DailyNote = {
      date: today,
      overallRating,
      routinesCompleted,
      transitionsDifficult,
      sensoryChallenges,
      sensoryNote,
      calmToolsUsed,
      whatHelpedMost,
      difficultMoments,
      difficultNote,
      winsToday,
      careTeamNote,
      savedAt: new Date().toISOString(),
    };
    try {
      await saveNote(note);
      await AsyncStorage.setItem(`bitzaProgressNoteStatus_${today}`, 'completed');
      Alert.alert('Note saved! 💜', undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch {
      Alert.alert('Error', 'Could not save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Today's Progress Note</Text>
        <TouchableOpacity
          style={[s.saveBtn, saving && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.dateSubtitle}>{formatToday()}</Text>

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
            {/* 1. Overall rating */}
            <Card>
              <SectionTitle>How did today go overall?</SectionTitle>
              <View style={s.ratingRow}>
                {RATING_OPTIONS.map(opt => {
                  const active = overallRating === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={s.ratingCol}
                      onPress={() => setOverallRating(opt.value)}
                      activeOpacity={0.8}
                    >
                      <View style={[s.ratingCircle, active && s.ratingCircleActive]}>
                        <Text style={s.ratingEmoji}>{opt.emoji}</Text>
                      </View>
                      {active && <Text style={s.ratingLabel}>{opt.label}</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* 2. Routines */}
            <Card>
              <SectionTitle>Were routines completed?</SectionTitle>
              <ChipGroup options={ROUTINE_OPTIONS} selected={routinesCompleted} onSelect={setRoutinesCompleted} />
            </Card>

            {/* 3. Transitions */}
            <Card>
              <SectionTitle>Were transitions difficult?</SectionTitle>
              <ChipGroup options={TRANSITION_OPTIONS} selected={transitionsDifficult} onSelect={setTransitionsDifficult} />
            </Card>

            {/* 4. Sensory */}
            <Card>
              <SectionTitle>Any sensory challenges today?</SectionTitle>
              <ChipGroup<boolean>
                options={[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]}
                selected={sensoryChallenges}
                onSelect={setSensoryChallenges}
              />
              {sensoryChallenges === true && (
                <TextInput
                  style={[s.input, s.inputMulti, { marginTop: 10 }]}
                  value={sensoryNote}
                  onChangeText={setSensoryNote}
                  placeholder="What happened? What helped?"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              )}
            </Card>

            {/* 5. Calm tools */}
            <Card>
              <SectionTitle>Which calm tools were used?</SectionTitle>
              <View style={s.chipRow}>
                {CALM_TOOLS.map(tool => {
                  const active = calmToolsUsed.includes(tool);
                  return (
                    <TouchableOpacity
                      key={tool}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => toggleCalmTool(tool)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.chipText, active && s.chipTextActive]}>{tool}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* 6. What helped most */}
            <Card>
              <SectionTitle>What helped the most today?</SectionTitle>
              <TextInput
                style={[s.input, s.inputMulti, { marginTop: 10 }]}
                value={whatHelpedMost}
                onChangeText={setWhatHelpedMost}
                placeholder="e.g. extra warning time, visual schedule, quiet corner..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </Card>

            {/* 7. Difficult moments */}
            <Card>
              <SectionTitle>Were there any difficult moments?</SectionTitle>
              <ChipGroup<boolean>
                options={[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]}
                selected={difficultMoments}
                onSelect={setDifficultMoments}
              />
              {difficultMoments === true && (
                <TextInput
                  style={[s.input, s.inputMulti, { marginTop: 10 }]}
                  value={difficultNote}
                  onChangeText={setDifficultNote}
                  placeholder="Briefly describe what happened..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              )}
            </Card>

            {/* 8. Wins */}
            <Card>
              <SectionTitle>What were today's wins? 🌟</SectionTitle>
              <Text style={s.sectionSubtitle}>Even small ones count.</Text>
              <TextInput
                style={[s.input, s.inputMulti, { marginTop: 10 }]}
                value={winsToday}
                onChangeText={setWinsToday}
                placeholder="e.g. completed morning routine, tried a new food, used calm corner independently..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </Card>

            {/* 9. Care team note */}
            <Card>
              <SectionTitle>Anything the care team should know?</SectionTitle>
              <Text style={s.sectionSubtitle}>This can be shared with teachers, therapists, or doctors.</Text>
              <TextInput
                style={[s.input, s.inputMulti, { marginTop: 10 }]}
                value={careTeamNote}
                onChangeText={setCareTeamNote}
                placeholder="Optional note for the care team..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </Card>

            <TouchableOpacity
              style={[s.primaryBtn, saving && s.primaryBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={s.primaryBtnText}>{saving ? 'Saving…' : "Save today's note"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  saveBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  dateSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    backgroundColor: '#fff',
    paddingBottom: 10,
  },

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Rating row
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  ratingCol: { alignItems: 'center', gap: 4, flex: 1 },
  ratingCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.pageBg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCircleActive: {
    backgroundColor: Colors.navActiveBg,
    borderColor: Colors.purple,
  },
  ratingEmoji: { fontSize: 22 },
  ratingLabel: {
    fontSize: 9,
    color: Colors.purple,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.pageBg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.navActiveBg,
    borderColor: Colors.purple,
  },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.purple, fontWeight: '600' },

  // Inputs
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

  primaryBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
