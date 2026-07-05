import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

const RATING_EMOJIS: Record<number, string> = { 1: '😰', 2: '😔', 3: '😐', 4: '😊', 5: '🌟' };
const RATING_COLORS: Record<number, string> = {
  1: '#F5C8D8',
  2: '#F5D8C8',
  3: '#F5F0C8',
  4: '#C8F0D8',
  5: '#C8E0F5',
};

// ─── Data loader ─────────────────────────────────────────────────────────────

const loadAllNotes = async (): Promise<DailyNote[]> => {
  const byDate: Record<string, DailyNote> = {};

  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDocs(collection(getFirestore(), 'users', uid, 'progressNotes'));
      snap.forEach(d => {
        const data = d.data() as DailyNote;
        byDate[d.id] = data;
      });
    }
  } catch {
    // fall through to AsyncStorage
  }

  try {
    const keys = await AsyncStorage.getAllKeys();
    const noteKeys = keys.filter(k => k.startsWith('bitzaProgressNote_'));
    const pairs = await AsyncStorage.multiGet(noteKeys);
    pairs.forEach(([key, value]) => {
      if (!value) return;
      const dateKey = key.replace('bitzaProgressNote_', '');
      if (!byDate[dateKey]) {
        byDate[dateKey] = JSON.parse(value);
      }
    });
  } catch {
    // ignore
  }

  return Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date));
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatNoteDate = (dateKey: string) => {
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatMonthHeader = (dateKey: string) => {
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const routinePillColor = (status: DailyNote['routinesCompleted']) =>
  status === 'yes' ? Colors.green : status === 'mostly' ? '#E0C84A' : Colors.grayLavender;

const transitionPillColor = (status: DailyNote['transitionsDifficult']) =>
  status === 'yes' ? '#E0708A' : status === 'some' ? '#E0C84A' : Colors.green;

const showNoteDetail = (note: DailyNote) => {
  const lines = [
    `Overall: ${RATING_EMOJIS[note.overallRating] ?? ''} (${note.overallRating}/5)`,
    `Routines completed: ${note.routinesCompleted ?? '—'}`,
    `Transitions difficult: ${note.transitionsDifficult ?? '—'}`,
    note.sensoryChallenges ? `Sensory challenges: ${note.sensoryNote || 'yes'}` : null,
    note.calmToolsUsed?.length ? `Calm tools used: ${note.calmToolsUsed.join(', ')}` : null,
    note.whatHelpedMost ? `What helped most: ${note.whatHelpedMost}` : null,
    note.difficultMoments ? `Difficult moments: ${note.difficultNote || 'yes'}` : null,
    note.winsToday ? `Wins: ${note.winsToday}` : null,
    note.careTeamNote ? `Care team note: ${note.careTeamNote}` : null,
  ].filter(Boolean);

  Alert.alert(formatNoteDate(note.date), lines.join('\n\n'), [{ text: 'Close' }]);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NoteCard({ note, onPress }: { note: DailyNote; onPress: () => void }) {
  const emoji = RATING_EMOJIS[note.overallRating] ?? '😐';
  const bg = RATING_COLORS[note.overallRating] ?? Colors.navActiveBg;

  return (
    <TouchableOpacity style={s.noteCard} onPress={onPress} activeOpacity={0.85}>
      <Text style={s.noteDate}>{formatNoteDate(note.date)}</Text>
      <View style={[s.ratingCircle, { backgroundColor: bg }]}>
        <Text style={s.ratingEmoji}>{emoji}</Text>
      </View>
      <View style={s.pillsCol}>
        <View style={[s.pill, { backgroundColor: routinePillColor(note.routinesCompleted) }]} />
        <View style={[s.pill, { backgroundColor: transitionPillColor(note.transitionsDifficult) }]} />
        {note.winsToday ? <Text style={s.winStar}>⭐</Text> : <View style={s.pillSpacer} />}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PastNotesScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<DailyNote[]>([]);

  useEffect(() => {
    loadAllNotes()
      .then(setNotes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group by month
  const groups: { monthKey: string; items: DailyNote[] }[] = [];
  notes.forEach(note => {
    const monthKey = note.date.slice(0, 7); // YYYY-MM
    let group = groups.find(g => g.monthKey === monthKey);
    if (!group) {
      group = { monthKey, items: [] };
      groups.push(group);
    }
    group.items.push(note);
  });

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Past Progress Notes</Text>
        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : notes.length === 0 ? (
        <View style={s.emptyCenter}>
          <Text style={s.emptyEmoji}>📓</Text>
          <Text style={s.emptyTitle}>No past notes yet</Text>
          <Text style={s.emptySub}>Complete today's note to get started</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {groups.map(group => (
            <View key={group.monthKey}>
              <Text style={s.monthHeader}>{formatMonthHeader(group.items[0].date)}</Text>
              {group.items.map(note => (
                <NoteCard key={note.date} note={note} onPress={() => showNoteDetail(note)} />
              ))}
            </View>
          ))}
        </ScrollView>
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

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  scroll: { padding: 16, paddingBottom: 40 },

  monthHeader: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
    width: 64,
  },
  ratingCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingEmoji: { fontSize: 18 },
  pillsCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  pill: {
    width: 18,
    height: 8,
    borderRadius: 4,
  },
  pillSpacer: { width: 14, height: 8 },
  winStar: { fontSize: 13 },
});
