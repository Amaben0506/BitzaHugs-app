import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs, query, orderBy } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';
import { usePremium } from '../lib/premium';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MoodEntry {
  mood: string;
  emoji: string;
  time: string;
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = ['This week', 'This month', 'Last 3 months', 'All time'] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

const MOOD_EMOJIS: Record<string, string> = {
  Overwhelmed: '😰', Struggling: '😔', Okay: '😐', Hopeful: '😊', Good: '😄',
};
const MOOD_COLORS: Record<string, string> = {
  Overwhelmed: '#F5C8D8', Struggling: '#F5D8C8', Okay: '#F5F0C8', Hopeful: '#C8F0D8', Good: '#C8E0F5',
};
const MOOD_LABELS = ['Overwhelmed', 'Struggling', 'Okay', 'Hopeful', 'Good'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CALM_TOOLS = [
  { name: 'Deep Pressure', count: 4 },
  { name: 'Transition Timer', count: 3 },
  { name: 'Show Me', count: 2 },
  { name: 'Quiet Space', count: 1 },
];

const APPOINTMENTS = [
  { id: '1', title: 'Speech Therapy', date: 'May 14', attended: true },
  { id: '2', title: 'OT', date: 'May 7', attended: true },
  { id: '3', title: 'Speech Therapy', date: 'Apr 30', attended: true },
];

const RECENT_WINS = [
  { id: '1', emoji: '⭐', label: 'Stayed calm during transition this morning' },
  { id: '2', emoji: '🤝', label: 'Used "Show Me" to ask for a break' },
  { id: '3', emoji: '🗣️', label: 'Completed speech therapy session' },
  { id: '4', emoji: '🍽️', label: 'Tried a new food today!' },
];

// ─── Data loaders ──────────────────────────────────────────────────────────────

const loadMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDocs(query(collection(getFirestore(), 'users', uid, 'moods', 'child', 'entries')));
      const entries: MoodEntry[] = [];
      snap.forEach(d => entries.push(d.data() as MoodEntry));
      if (entries.length > 0) return entries;
    }
  } catch { /* fall through */ }
  const raw = await AsyncStorage.getItem('bitzaChildMood');
  return raw ? [JSON.parse(raw)] : [];
};

const loadNoteCount = async (): Promise<{ total: number; thisWeek: number }> => {
  const all: string[] = [];
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDocs(collection(getFirestore(), 'users', uid, 'progressNotes'));
      snap.forEach(d => all.push(d.id));
    }
  } catch { /* fall through */ }
  if (all.length === 0) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      keys.filter(k => k.startsWith('bitzaProgressNote_')).forEach(k => {
        all.push(k.replace('bitzaProgressNote_', ''));
      });
    } catch { /* ignore */ }
  }
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const thisWeek = all.filter(d => new Date(d + 'T12:00:00') >= weekAgo).length;
  return { total: all.length, thisWeek };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateKey = (d: Date) => d.toISOString().split('T')[0];

const getWeekDays = (): Date[] => {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const mostFrequent = (entries: MoodEntry[]): string | null => {
  if (!entries.length) return null;
  const counts: Record<string, number> = {};
  entries.forEach(e => { counts[e.mood] = (counts[e.mood] ?? 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, tinted }: { children: React.ReactNode; tinted?: boolean }) {
  return (
    <View style={[s.card, tinted && s.cardTinted]}>{children}</View>
  );
}

function CardTitle({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={s.cardTitleRow}>
      <Ionicons name={icon} size={16} color={Colors.purple} />
      <Text style={s.cardTitle}>{label}</Text>
    </View>
  );
}

function ProgressBar({ progress, color = Colors.green }: { progress: number; color?: string }) {
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: `${Math.min(100, Math.round(progress * 100))}%`, backgroundColor: color }]} />
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ChildProgressScreen() {
  const navigation = useNavigation<any>();
  const { requirePremium } = usePremium();

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('This week');
  const [childName, setChildName] = useState('Your Child');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [noteCount, setNoteCount] = useState({ total: 0, thisWeek: 0 });

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('bitzaChildProfile').then(raw => {
        if (raw) {
          const p = JSON.parse(raw);
          if (p.childName) setChildName(p.childName);
        }
      }).catch(() => {}),
      loadMoodEntries().then(setMoodEntries).catch(() => {}),
      loadNoteCount().then(setNoteCount).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const weekDays = getWeekDays();
  const todayKey = toDateKey(new Date());

  // Build date→entry map
  const moodByDate: Record<string, MoodEntry> = {};
  moodEntries.forEach(e => { if (!moodByDate[e.date]) moodByDate[e.date] = e; });

  const weekKeys = weekDays.map(d => toDateKey(d));
  const weekEntries = moodEntries.filter(e => weekKeys.includes(e.date));
  const topMood = mostFrequent(weekEntries);

  const moodCounts: Record<string, number> = {};
  weekEntries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1; });
  const maxMoodCount = Math.max(1, ...Object.values(moodCounts));

  const maxToolCount = Math.max(1, ...CALM_TOOLS.map(t => t.count));
  const totalToolUses = CALM_TOOLS.reduce((s, t) => s + t.count, 0);
  const mostUsedTool = CALM_TOOLS[0].name;

  const noteDaysTracked = Math.max(noteCount.total, 1);
  const noteDaysInMonth = 30;
  const noteCompletionRate = Math.min(1, noteDaysTracked / noteDaysInMonth);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{childName}'s Progress</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterContent}
        style={s.filterScroll}
      >
        {FILTER_OPTIONS.map(opt => {
          const active = filter === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[s.filterChip, active && s.filterChipActive]}
              onPress={() => setFilter(opt)}
              activeOpacity={0.8}
            >
              <Text style={[s.filterChipText, active && s.filterChipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── 1. Routine Completion ──────────────────────────────────── */}
          <Card>
            <CardTitle icon="checkmark-circle" label="Routine Completion" />
            <Text style={s.bigStat}>14 <Text style={s.bigStatOf}>/ 18</Text></Text>
            <Text style={s.bigStatLabel}>routines completed this week</Text>
            <ProgressBar progress={14 / 18} color={Colors.green} />
            <View style={s.pillRow}>
              <View style={s.infoPill}>
                <Text style={s.infoPillText}>🏅 Best day: Monday</Text>
              </View>
              <View style={s.infoPill}>
                <Text style={s.infoPillText}>🔥 Streak: 3 days</Text>
              </View>
            </View>
          </Card>

          {/* ── 2. Mood Trends ────────────────────────────────────────── */}
          <Card>
            <CardTitle icon="heart" label="Mood Trends" />
            <View style={s.weekRow}>
              {weekDays.map((day, i) => {
                const key = toDateKey(day);
                const entry = moodByDate[key];
                const isToday = key === todayKey;
                const emoji = entry ? (MOOD_EMOJIS[entry.mood] ?? entry.emoji) : null;
                return (
                  <View key={key} style={s.dayCol}>
                    <Text style={s.dayLabel}>{DAY_LABELS[i]}</Text>
                    <View style={[s.dayCircle, isToday && s.dayCircleToday, !emoji && s.dayCircleEmpty]}>
                      {emoji ? <Text style={s.dayEmoji}>{emoji}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>

            {topMood ? (
              <View style={s.topMoodRow}>
                <Text style={s.topMoodEmoji}>{MOOD_EMOJIS[topMood] ?? '😊'}</Text>
                <Text style={s.topMoodLabel}>Most frequent: <Text style={{ fontWeight: '600' }}>{topMood}</Text></Text>
              </View>
            ) : (
              <Text style={s.noDataText}>No mood check-ins this week</Text>
            )}

            <View style={s.moodBreakdown}>
              {MOOD_LABELS.map(mood => {
                const count = moodCounts[mood] ?? 0;
                if (!count) return null;
                return (
                  <View key={mood} style={s.moodRow}>
                    <Text style={s.moodRowLabel}>{mood}</Text>
                    <View style={s.moodBarTrack}>
                      <View style={[s.moodBarFill, { width: `${(count / maxMoodCount) * 100}%`, backgroundColor: MOOD_COLORS[mood] }]} />
                    </View>
                    <Text style={s.moodRowCount}>{count}×</Text>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* ── 3. Calm Tools ─────────────────────────────────────────── */}
          <Card>
            <CardTitle icon="leaf" label="Calm Tools Used" />
            <View style={s.toolsList}>
              {CALM_TOOLS.map(tool => (
                <View key={tool.name} style={s.toolRow}>
                  <Text style={s.toolName}>{tool.name}</Text>
                  <View style={s.toolBarWrap}>
                    <View style={s.toolBarTrack}>
                      <View style={[s.toolBarFill, { width: `${(tool.count / maxToolCount) * 100}%` }]} />
                    </View>
                  </View>
                  <View style={s.toolCountPill}>
                    <Text style={s.toolCountText}>{tool.count}×</Text>
                  </View>
                </View>
              ))}
            </View>
            <Text style={s.mostUsedText}>Most used: {mostUsedTool} · {totalToolUses} total uses this week</Text>
          </Card>

          {/* ── 4. Daily Notes ────────────────────────────────────────── */}
          <Card>
            <CardTitle icon="document-text" label="Daily Progress Notes" />
            <View style={s.statRow}>
              <StatBox label="this month" value={`${noteCount.total} notes`} />
              <StatBox label="this week" value={`${noteCount.thisWeek} notes`} />
            </View>
            <View style={s.completionRow}>
              <Text style={s.completionLabel}>
                {Math.round(noteCompletionRate * 100)}% of days tracked
              </Text>
            </View>
            <ProgressBar progress={noteCompletionRate} color={Colors.purple} />
            <TouchableOpacity
              style={s.viewLink}
              onPress={() => navigation.navigate('PastNotes')}
              activeOpacity={0.7}
            >
              <Text style={s.viewLinkText}>View all notes →</Text>
            </TouchableOpacity>
          </Card>

          {/* ── 5. Appointments ───────────────────────────────────────── */}
          <Card>
            <CardTitle icon="calendar" label="Appointments" />
            <Text style={s.apptStat}>2 of 3 attended this month</Text>
            <View style={s.apptList}>
              {APPOINTMENTS.map(appt => (
                <View key={appt.id} style={s.apptRow}>
                  <Text style={s.apptDate}>{appt.date}</Text>
                  <Text style={s.apptTitle}>{appt.title}</Text>
                  <Ionicons
                    name={appt.attended ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={appt.attended ? Colors.green : Colors.grayLavender}
                  />
                </View>
              ))}
            </View>
          </Card>

          {/* ── 6. Recent Wins ────────────────────────────────────────── */}
          <Card tinted>
            <CardTitle icon="star" label="Recent Wins 🌟" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.winsContent}
              style={s.winsScroll}
            >
              {RECENT_WINS.map(win => (
                <View key={win.id} style={s.winCard}>
                  <Text style={s.winEmoji}>{win.emoji}</Text>
                  <Text style={s.winLabel}>{win.label}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={s.addWinLink}
              onPress={() => navigation.navigate('AddWin')}
              activeOpacity={0.7}
            >
              <Text style={s.addWinLinkText}>+ Add win</Text>
            </TouchableOpacity>
          </Card>

          {/* ── Export button ──────────────────────────────────────────── */}
          <TouchableOpacity
            style={s.exportBtn}
            onPress={() => {
              if (requirePremium({ feature: 'pdf_exports' })) {
                Alert.alert('Export coming soon 💜');
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={s.exportBtnText}>📄 Export Progress Report</Text>
          </TouchableOpacity>

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

  filterScroll: { backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: Colors.cardBorder },
  filterContent: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.pageBg,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.navActiveBg,
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  filterChipText: { fontSize: 13, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.purple, fontWeight: '600' },

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    paddingHorizontal: 16,
  },
  cardTinted: { backgroundColor: '#FFF7FB' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  bigStat: { fontSize: 28, fontWeight: '500', color: Colors.green },
  bigStatOf: { color: Colors.textMuted, fontWeight: '400', fontSize: 20 },
  bigStatLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 10 },

  barTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: Colors.pageBg,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 99 },

  pillRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  infoPill: {
    backgroundColor: Colors.pageBg,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  infoPillText: { fontSize: 11, color: Colors.textSecondary },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dayCol: { alignItems: 'center', gap: 4 },
  dayLabel: { fontSize: 9, color: Colors.textMuted },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.pageBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: { backgroundColor: Colors.navActiveBg },
  dayCircleEmpty: {},
  dayEmoji: { fontSize: 17 },

  topMoodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  topMoodEmoji: { fontSize: 24 },
  topMoodLabel: { fontSize: 13, color: Colors.textSecondary },
  noDataText: { fontSize: 12, color: Colors.textMuted, marginBottom: 10 },

  moodBreakdown: { gap: 6, marginTop: 4 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodRowLabel: { fontSize: 11, color: Colors.textSecondary, width: 80 },
  moodBarTrack: { flex: 1, height: 7, borderRadius: 99, backgroundColor: Colors.pageBg, overflow: 'hidden' },
  moodBarFill: { height: '100%', borderRadius: 99 },
  moodRowCount: { fontSize: 11, color: Colors.textMuted, width: 24, textAlign: 'right' },

  toolsList: { gap: 8 },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolName: { fontSize: 12, color: Colors.textPrimary, width: 110 },
  toolBarWrap: { flex: 1 },
  toolBarTrack: { height: 7, borderRadius: 99, backgroundColor: Colors.pageBg, overflow: 'hidden' },
  toolBarFill: { height: '100%', borderRadius: 99, backgroundColor: Colors.purple },
  toolCountPill: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 99,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  toolCountText: { fontSize: 11, color: Colors.purple },
  mostUsedText: { fontSize: 11, color: Colors.textMuted, marginTop: 8 },

  statRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.pageBg,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

  completionRow: { marginBottom: 6 },
  completionLabel: { fontSize: 12, color: Colors.textSecondary },

  viewLink: { alignSelf: 'flex-end', marginTop: 10 },
  viewLinkText: { fontSize: 12, color: Colors.purple },

  apptStat: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  apptList: { gap: 8 },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardBorder,
    gap: 10,
  },
  apptDate: { fontSize: 11, color: Colors.textMuted, width: 48 },
  apptTitle: { flex: 1, fontSize: 13, color: Colors.textPrimary },

  winsScroll: { marginTop: 6 },
  winsContent: { gap: 8, paddingRight: 4 },
  winCard: {
    backgroundColor: '#FFFBEC',
    borderWidth: 0.5,
    borderColor: '#F5E4A0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 120,
  },
  winEmoji: { fontSize: 22 },
  winLabel: { fontSize: 11, color: Colors.textPrimary, lineHeight: 15, marginTop: 4 },

  addWinLink: { marginTop: 10 },
  addWinLinkText: { fontSize: 12, color: Colors.purple },

  exportBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  exportBtnText: { fontSize: 14, color: Colors.purple, fontWeight: '500' },
});
