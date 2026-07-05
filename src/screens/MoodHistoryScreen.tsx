import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';
import { FREE_LIMITS, isWithinHistoryWindow, usePremium } from '../lib/premium';

// ─── Types & constants ────────────────────────────────────────────────────────

interface MoodEntry {
  mood: string;
  emoji: string;
  note?: string;
  time: string;
  date: string;
}

const MOOD_EMOJIS: Record<string, string> = {
  Overwhelmed: '😰',
  Struggling: '😔',
  Okay: '😐',
  Hopeful: '😊',
  Good: '😄',
};

const MOOD_COLORS: Record<string, string> = {
  Overwhelmed: '#F5C8D8',
  Struggling: '#F5D8C8',
  Okay: '#F5F0C8',
  Hopeful: '#C8F0D8',
  Good: '#C8E0F5',
};

const FILTER_OPTIONS = ['All', 'Overwhelmed', 'Struggling', 'Okay', 'Hopeful', 'Good'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Data loader ─────────────────────────────────────────────────────────────

const loadMoodHistory = async (): Promise<MoodEntry[]> => {
  const entries: MoodEntry[] = [];
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const db = getFirestore();
      const snap = await getDocs(
        query(collection(db, 'users', uid, 'moods', 'child', 'entries'))
      );
      snap.forEach(d => entries.push(d.data() as MoodEntry));
    }
  } catch {
    // fall through to AsyncStorage
  }
  if (entries.length === 0) {
    const raw = await AsyncStorage.getItem('bitzaChildMood');
    if (raw) {
      const parsed = JSON.parse(raw);
      entries.push(parsed);
    }
  }
  return entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateKey = (d: Date) => d.toISOString().split('T')[0];

const getWeekDays = (): Date[] => {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7)); // Monday of current week
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const formatEntryTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatGroupDate = (dateKey: string): string => {
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const mostFrequent = (entries: MoodEntry[]): string | null => {
  if (entries.length === 0) return null;
  const counts: Record<string, number> = {};
  entries.forEach(e => { counts[e.mood] = (counts[e.mood] ?? 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function WeekSummary({ entries }: { entries: MoodEntry[] }) {
  const weekDays = getWeekDays();
  const todayKey = toDateKey(new Date());

  // Build a map: dateKey → last entry
  const byDate: Record<string, MoodEntry> = {};
  entries.forEach(e => { if (!byDate[e.date]) byDate[e.date] = e; });

  // Only week entries for "most frequent"
  const weekKeys = weekDays.map(d => toDateKey(d));
  const weekEntries = entries.filter(e => weekKeys.includes(e.date));
  const top = mostFrequent(weekEntries);

  return (
    <View style={s.summaryCard}>
      <Text style={s.summaryTitle}>This week</Text>
      <View style={s.weekRow}>
        {weekDays.map(day => {
          const key = toDateKey(day);
          const entry = byDate[key];
          const isToday = key === todayKey;
          const emoji = entry ? (MOOD_EMOJIS[entry.mood] ?? entry.emoji) : null;
          return (
            <View key={key} style={s.dayCol}>
              <Text style={s.dayLabel}>{DAY_LABELS[day.getDay()]}</Text>
              <View style={[s.dayCircle, isToday && s.dayCircleToday, !emoji && s.dayCircleEmpty]}>
                {emoji ? <Text style={s.dayEmoji}>{emoji}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
      {top ? (
        <Text style={s.summaryFreq}>
          Most frequent: {top} {MOOD_EMOJIS[top] ?? ''}
        </Text>
      ) : (
        <Text style={s.summaryFreq}>No check-ins recorded this week</Text>
      )}
    </View>
  );
}

function FilterChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (f: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filtersContent}
      style={s.filtersScroll}
    >
      {FILTER_OPTIONS.map(f => {
        const active = selected === f;
        return (
          <TouchableOpacity
            key={f}
            style={[s.chip, active && s.chipActive]}
            onPress={() => onSelect(f)}
            activeOpacity={0.75}
          >
            <Text style={[s.chipText, active && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function EntryCard({ entry, locked, onPress }: { entry: MoodEntry; locked?: boolean; onPress?: () => void }) {
  const bg = MOOD_COLORS[entry.mood] ?? Colors.navActiveBg;
  const emoji = MOOD_EMOJIS[entry.mood] ?? entry.emoji ?? '😐';
  return (
    <TouchableOpacity style={[s.entryCard, locked && s.entryCardLocked]} onPress={onPress} activeOpacity={locked ? 0.85 : 1}>
      <View style={[s.entryEmojiCircle, { backgroundColor: bg }]}>
        <Text style={s.entryEmoji}>{locked ? '🔒' : emoji}</Text>
      </View>
      <View style={s.entryBody}>
        <Text style={s.entryMood}>{locked ? 'Older mood check-in' : entry.mood}</Text>
        <Text style={s.entryTime}>{formatEntryTime(entry.time)}</Text>
        {locked ? (
          <Text style={s.entryNote}>Saved privately. Premium unlocks complete mood history and patterns.</Text>
        ) : entry.note ? <Text style={s.entryNote}>{entry.note}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MoodHistoryScreen() {
  const navigation = useNavigation<any>();
  const { isPremium, showPremiumUpgrade } = usePremium();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [filter, setFilter] = useState('All');
  const [childName, setChildName] = useState('Your Child');

  useEffect(() => {
    AsyncStorage.getItem('bitzaChildProfile')
      .then(raw => {
        if (raw) {
          const profile = JSON.parse(raw);
          if (profile.childName) setChildName(profile.childName);
        }
      })
      .catch(() => {});

    loadMoodHistory()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibleWindowEntries = isPremium ? entries : entries.filter(e => isWithinHistoryWindow(e.date ?? e.time, FREE_LIMITS.moodHistoryDays));
  const lockedEntries = isPremium ? [] : entries.filter(e => !isWithinHistoryWindow(e.date ?? e.time, FREE_LIMITS.moodHistoryDays));
  const filtered = filter === 'All'
    ? visibleWindowEntries
    : visibleWindowEntries.filter(e => e.mood === filter);

  // Group by date
  const groups: { dateKey: string; items: MoodEntry[] }[] = [];
  const seen = new Set<string>();
  filtered.forEach(e => {
    const key = e.date ?? toDateKey(new Date(e.time));
    if (!seen.has(key)) {
      seen.add(key);
      groups.push({ dateKey: key, items: [] });
    }
    groups.find(g => g.dateKey === key)!.items.push(e);
  });

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{childName}'s Mood History</Text>
        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          <WeekSummary entries={visibleWindowEntries} />

          {!isPremium && (
            <TouchableOpacity style={s.historyWindowCard} onPress={() => showPremiumUpgrade({ feature: 'full_history' })} activeOpacity={0.85}>
              <Ionicons name="lock-closed-outline" size={15} color={Colors.purple} />
              <Text style={s.historyWindowText}>
                Showing the last {FREE_LIMITS.moodHistoryDays} days. {lockedEntries.length} older {lockedEntries.length === 1 ? 'check-in is' : 'check-ins are'} safely saved.
              </Text>
            </TouchableOpacity>
          )}

          <FilterChips selected={filter} onSelect={setFilter} />

          {filtered.length === 0 ? (
            <View style={s.emptyCenter}>
              <Text style={s.emptyEmoji}>😊</Text>
              <Text style={s.emptyTitle}>No mood check-ins yet</Text>
              <Text style={s.emptySub}>
                Track {childName}'s mood from the My Child page
              </Text>
            </View>
          ) : (
            groups.map(group => (
              <View key={group.dateKey}>
                <Text style={s.groupHeader}>{formatGroupDate(group.dateKey)}</Text>
                {group.items.map((entry, idx) => (
                  <EntryCard key={`${group.dateKey}-${idx}`} entry={entry} />
                ))}
              </View>
            ))
          )}
          {lockedEntries.length > 0 && (
            <View>
              <Text style={s.groupHeader}>Older History</Text>
              {lockedEntries.slice(0, 3).map((entry, idx) => (
                <EntryCard
                  key={`locked-${idx}`}
                  entry={entry}
                  locked
                  onPress={() => showPremiumUpgrade({ feature: 'full_history' })}
                />
              ))}
            </View>
          )}
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

  scroll: { padding: 16, paddingBottom: 40 },

  // Week summary card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayCol: { alignItems: 'center', gap: 4 },
  dayLabel: { fontSize: 10, color: Colors.textMuted },
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
  dayEmoji: { fontSize: 18 },
  summaryFreq: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Filter chips
  filtersScroll: { marginBottom: 4 },
  filtersContent: { gap: 8, paddingBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  chipActive: {
    backgroundColor: Colors.navActiveBg,
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.purple, fontWeight: '600' },
  historyWindowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F2EAFB',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginBottom: 12,
  },
  historyWindowText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18, fontWeight: '600' },

  // Group header
  groupHeader: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Entry card
  entryCard: {
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
  entryCardLocked: {
    backgroundColor: '#F8F3FF',
    borderColor: '#D8C7F2',
  },
  entryEmojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  entryEmoji: { fontSize: 22 },
  entryBody: { flex: 1 },
  entryMood: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  entryTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  entryNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 3,
    lineHeight: 17,
  },

  // Empty state
  emptyCenter: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});
