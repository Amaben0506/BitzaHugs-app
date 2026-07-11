import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MoodEntry {
  mood: string;
  note?: string;
  time?: string | Date | { toDate?: () => Date; seconds?: number };
  date?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MOOD_CONFIG: Record<string, { emoji: string; color: string; bgColor: string }> = {
  Overwhelmed: { emoji: '😰', color: '#C03060', bgColor: '#FFE8EE' },
  Struggling:  { emoji: '😔', color: '#C4800A', bgColor: '#FFF8EC' },
  Okay:        { emoji: '😐', color: '#888780', bgColor: '#F1EFE8' },
  Hopeful:     { emoji: '🌿', color: '#3A8A3A', bgColor: '#F0F8F0' },
  Good:        { emoji: '☀️', color: '#3A6BC8', bgColor: '#EEF4FF' },
};

const FILTER_OPTIONS = ['All', 'Overwhelmed', 'Struggling', 'Okay', 'Hopeful', 'Good'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Data ─────────────────────────────────────────────────────────────────────

const loadMoodHistory = async (): Promise<MoodEntry[]> => {
  const entries: MoodEntry[] = [];
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDocs(
        collection(getFirestore(), 'users', uid, 'moods', 'caregiver', 'entries')
      );
      snap.forEach(d => {
        const data = d.data() as MoodEntry;
        entries.push({ ...data, date: data.date ?? d.id });
      });
    }
  } catch (e) {}
  if (entries.length === 0) {
    const raw = await AsyncStorage.getItem('bitzaCaregiverMood');
    if (raw) entries.push(JSON.parse(raw));
  }
  return entries.sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayKey = () => new Date().toISOString().split('T')[0];
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const last7DayKeys = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const weekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDateHeader = (dateKey: string): string => {
  if (dateKey === 'unknown') return 'Date unavailable';
  const today = todayKey();
  const yesterday = yesterdayKey();
  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';
  return new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
};

const getEntryDate = (entry: MoodEntry): Date | null => {
  const raw = entry.time;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'string') {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (raw?.toDate) return raw.toDate();
  if (typeof raw?.seconds === 'number') return new Date(raw.seconds * 1000);
  if (entry.date) {
    const parsed = new Date(entry.date + 'T12:00:00');
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const getEntryTimestamp = (entry: MoodEntry): number => getEntryDate(entry)?.getTime() ?? 0;

const getEntryDateKey = (entry: MoodEntry, fallback = 'unknown'): string => {
  if (typeof entry.date === 'string' && entry.date.trim()) return entry.date;
  const date = getEntryDate(entry);
  return date ? date.toISOString().split('T')[0] : fallback;
};

const formatTime = (entry: MoodEntry): string => {
  try {
    const date = getEntryDate(entry);
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch {
    return '';
  }
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CaregiverMoodHistoryScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadMoodHistory()
      .then(data => setEntries(data))
      .finally(() => setLoading(false));
  }, []);

  // ── Trend data (last 7 days) ───────────────────────────────────────────────
  const days7 = last7DayKeys();
  const wkStart = weekStart();

  const moodByDate: Record<string, string> = {};
  entries.forEach(e => {
    const key = getEntryDateKey(e, '');
    if (key && e.mood && !moodByDate[key]) moodByDate[key] = e.mood;
  });

  const weekEntries = entries.filter(e => {
    const key = getEntryDateKey(e, '');
    return new Date(key + 'T12:00:00') >= wkStart;
  });

  const mostCommonMood = (() => {
    const counts: Record<string, number> = {};
    weekEntries.forEach(e => { if (e.mood) counts[e.mood] = (counts[e.mood] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  })();

  // ── Filtered + grouped entries ────────────────────────────────────────────
  const filtered = filter === 'All' ? entries : entries.filter(e => e.mood === filter);

  const groups: { dateKey: string; items: MoodEntry[] }[] = [];
  filtered.forEach(e => {
    const key = getEntryDateKey(e);
    const g = groups.find(g => g.dateKey === key);
    if (g) { g.items.push(e); }
    else { groups.push({ dateKey: key, items: [e] }); }
  });

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color="#E07090" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Mood History</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Trend summary card ─────────────────────────────────────────── */}
        <View style={s.trendCard}>
          <Text style={s.trendTitle}>This week</Text>

          {entries.length === 0 ? (
            <Text style={s.trendEmpty}>No check-ins recorded this week</Text>
          ) : (
            <>
              <View style={s.dayRow}>
                {days7.map(dayKey => {
                  const mood = moodByDate[dayKey];
                  const cfg = mood ? MOOD_CONFIG[mood] : null;
                  const isToday = dayKey === todayKey();
                  const label = DAY_LABELS[new Date(dayKey + 'T12:00:00').getDay()];
                  return (
                    <View key={dayKey} style={s.dayCol}>
                      <View style={[
                        s.dayCircle,
                        cfg ? { backgroundColor: cfg.bgColor, borderColor: cfg.color + '60' } : undefined,
                        isToday && !cfg ? s.dayCircleToday : undefined,
                      ]}>
                        {cfg
                          ? <Text style={s.dayEmoji}>{cfg.emoji}</Text>
                          : <View style={s.dayEmpty} />}
                      </View>
                      <Text style={[s.dayLabel, isToday && s.dayLabelToday]}>{label}</Text>
                    </View>
                  );
                })}
              </View>

              {mostCommonMood && MOOD_CONFIG[mostCommonMood] && (
                <Text style={s.trendInsight}>
                  Most frequent this week: {mostCommonMood} {MOOD_CONFIG[mostCommonMood].emoji}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Privacy note */}
        <View style={s.privacyRow}>
          <Ionicons name="lock-closed" size={10} color={Colors.textMuted} />
          <Text style={s.privacyText}>Your mood history is private.</Text>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterScroll}
        >
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[s.filterChip, filter === opt && s.filterChipActive]}
              onPress={() => setFilter(opt)}
              activeOpacity={0.8}
            >
              <Text style={[s.filterChipText, filter === opt && s.filterChipTextActive]}>
                {opt === 'All' ? 'All' : `${MOOD_CONFIG[opt]?.emoji ?? ''} ${opt}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Entries or empty state ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <View style={s.emptyCenter}>
            <Text style={s.emptyEmoji}>🌸</Text>
            <Text style={s.emptyTitle}>No mood check-ins yet</Text>
            <Text style={s.emptySub}>
              Start checking in from the My Care page to see your history here.
            </Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Text style={s.emptyBtnText}>Go check in now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.dateKey}>
              <Text style={s.dateHeader}>{formatDateHeader(group.dateKey)}</Text>
              {group.items.map((entry, idx) => {
                const cfg = MOOD_CONFIG[entry.mood] ?? { emoji: '😶', color: Colors.textMuted, bgColor: Colors.pageBg };
                return (
                  <View key={idx} style={s.entryCard}>
                    <View style={[s.entryEmojiCircle, { backgroundColor: cfg.bgColor }]}>
                      <Text style={s.entryEmoji}>{cfg.emoji}</Text>
                    </View>
                    <View style={s.entryMid}>
                      <Text style={s.entryMoodLabel}>{entry.mood}</Text>
                      <Text style={s.entryTime}>{formatTime(entry)}</Text>
                      {!!entry.note && (
                        <Text style={s.entryNote}>{entry.note}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF5F7' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0D0E8',
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF0F4',
    borderWidth: 0.5,
    borderColor: '#F0D0E8',
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

  scroll: { padding: 16, paddingBottom: 48 },

  // ── Trend card ────────────────────────────────────────────────────────────
  trendCard: {
    backgroundColor: '#FFF7FB',
    borderWidth: 0.5,
    borderColor: '#F0D0E8',
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  trendTitle: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  trendEmpty: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', paddingVertical: 8 },

  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 4 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EFF5',
    borderWidth: 0.5,
    borderColor: '#F0D0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: { borderColor: '#E07090', borderWidth: 1.5 },
  dayEmpty: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#F0D0E8', opacity: 0.5 },
  dayEmoji: { fontSize: 18 },
  dayLabel: { fontSize: 9, color: Colors.textMuted },
  dayLabelToday: { color: '#C03060', fontWeight: '500' },
  trendInsight: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },

  // ── Privacy row ───────────────────────────────────────────────────────────
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  privacyText: { fontSize: 10, color: Colors.textMuted },

  // ── Filter chips ──────────────────────────────────────────────────────────
  filterScroll: { paddingVertical: 8, paddingHorizontal: 2, gap: 8 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#F0D0E8',
  },
  filterChipActive: {
    backgroundColor: '#FFF0F4',
    borderWidth: 1.5,
    borderColor: '#E07090',
  },
  filterChipText: { fontSize: 12, color: Colors.textMuted },
  filterChipTextActive: { color: '#C03060', fontWeight: '500' },

  // ── Date headers ──────────────────────────────────────────────────────────
  dateHeader: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },

  // ── Entry cards ───────────────────────────────────────────────────────────
  entryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#F0D0E8',
    padding: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 12,
  },
  entryEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  entryEmoji: { fontSize: 22 },
  entryMid: { flex: 1, gap: 2 },
  entryMoodLabel: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  entryTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  entryNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyCenter: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#E07090',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '500', color: '#C03060' },
});
