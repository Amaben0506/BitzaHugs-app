import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { usePremium } from '../lib/premium';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WellnessData {
  moodEntries: any[];
  journalEntries: any[];
  savedAffirmations: string[];
}

type DateRange = 'week' | 'month' | 'all';

// ─── Data ─────────────────────────────────────────────────────────────────────

const loadWellnessData = async (): Promise<WellnessData> => {
  const caregiverMood = await AsyncStorage.getItem('bitzaCaregiverMood');
  const journal = await AsyncStorage.getItem('bitzaJournal');
  const savedAffirmations = await AsyncStorage.getItem('bitzaSavedAffirmations');
  return {
    moodEntries: caregiverMood ? [JSON.parse(caregiverMood)] : [],
    journalEntries: journal ? JSON.parse(journal) : [],
    savedAffirmations: savedAffirmations ? JSON.parse(savedAffirmations) : [],
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const weekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const last7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const MOOD_EMOJI: Record<string, string> = {
  Overwhelmed: '😰',
  Struggling: '😔',
  Okay: '😐',
  Hopeful: '🌿',
  Good: '☀️',
};

const todayKey = () => new Date().toISOString().split('T')[0];

const entryDate = (e: any): Date =>
  new Date(e.createdAt ?? ((e.date ?? '') + 'T12:00:00'));

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WellnessSummaryScreen() {
  const navigation = useNavigation<any>();
  const { requirePremium } = usePremium();
  const [data, setData] = useState<WellnessData>({
    moodEntries: [],
    journalEntries: [],
    savedAffirmations: [],
  });
  const [range, setRange] = useState<DateRange>('week');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadWellnessData().then(d => { if (active) setData(d); });
      return () => { active = false; };
    }, [])
  );

  const cutoff =
    range === 'week' ? weekStart() :
    range === 'month' ? monthStart() :
    new Date(0);

  const filteredJournal = data.journalEntries.filter(e => entryDate(e) >= cutoff);
  const filteredMood = data.moodEntries.filter(e => entryDate(e) >= cutoff);
  const weekJournalCount = data.journalEntries.filter(e => entryDate(e) >= weekStart()).length;

  const days7 = last7Days();
  const moodByDate: Record<string, string> = {};
  data.moodEntries.forEach(e => {
    const key = e.date ?? (e.createdAt ? e.createdAt.split('T')[0] : null);
    if (key && e.mood) moodByDate[key] = e.mood;
  });

  const mostCommonMood = (() => {
    const counts: Record<string, number> = {};
    data.moodEntries.forEach(e => { if (e.mood) counts[e.mood] = (counts[e.mood] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  })();

  const recentJournal = data.journalEntries[0];
  const recentAffirmation = data.savedAffirmations[0];

  const insights: string[] = [];
  if (data.journalEntries.length > 3)
    insights.push("You've been writing consistently — that's a form of self-care.");
  if (filteredMood.length > 0)
    insights.push(`You checked in with yourself ${filteredMood.length} time${filteredMood.length !== 1 ? 's' : ''} this week.`);
  insights.push('Every tool you use is an act of love for yourself and your family. 💜');

  const RANGE_CHIPS: { label: string; value: DateRange }[] = [
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'All time', value: 'all' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Wellness</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Range filter chips */}
        <View style={s.chipRow}>
          {RANGE_CHIPS.map(c => (
            <TouchableOpacity
              key={c.value}
              style={[s.chip, range === c.value && s.chipActive]}
              onPress={() => setRange(c.value)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, range === c.value && s.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Section 1: Overview ──────────────────────────────────────────── */}
        <View style={[s.card, s.blushCard]}>
          <Text style={s.cardTitle}>Your wellness at a glance</Text>
          <View style={s.statRows}>
            {([
              { emoji: '😊', label: 'Mood check-ins', value: String(filteredMood.length) },
              { emoji: '📓', label: 'Journal entries', value: String(filteredJournal.length) },
              { emoji: '✨', label: 'Affirmations saved', value: String(data.savedAffirmations.length) },
              { emoji: '💜', label: 'Tools used', value: '6 this week' },
            ] as const).map(row => (
              <View key={row.label} style={s.statRow}>
                <Text style={s.statEmoji}>{row.emoji}</Text>
                <Text style={s.statLabel}>{row.label}</Text>
                <Text style={s.statValue}>{row.value}</Text>
              </View>
            ))}
          </View>
          <Text style={s.blushFooter}>You are showing up for yourself. That matters. 💜</Text>
        </View>

        {/* ── Section 2: Mood Trends ───────────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Your mood this week</Text>
          {data.moodEntries.length === 0 ? (
            <Text style={s.emptyHint}>Start checking in daily to see your trends</Text>
          ) : (
            <>
              <View style={s.dayRow}>
                {days7.map(dayKey => {
                  const label = DAY_LABELS[new Date(dayKey + 'T12:00:00').getDay()];
                  const emoji = moodByDate[dayKey];
                  const isToday = dayKey === todayKey();
                  return (
                    <View key={dayKey} style={s.dayCol}>
                      <View style={[
                        s.dayCircle,
                        isToday && s.dayCircleToday,
                        emoji ? s.dayCircleFilled : undefined,
                      ]}>
                        <Text style={s.dayEmoji}>{emoji ?? ''}</Text>
                      </View>
                      <Text style={[s.dayLabel, isToday && s.dayLabelToday]}>{label}</Text>
                    </View>
                  );
                })}
              </View>
              {mostCommonMood && (
                <Text style={s.moodInsight}>
                  Most common: {MOOD_EMOJI[mostCommonMood] ?? ''} {mostCommonMood}
                </Text>
              )}
            </>
          )}
        </View>

        {/* ── Section 3: Journal Insights ──────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Your journal</Text>
          <View style={s.statRows}>
            <View style={s.statRow}>
              <Text style={s.statLabel}>Total entries</Text>
              <Text style={s.statValue}>{data.journalEntries.length}</Text>
            </View>
            <View style={s.statRow}>
              <Text style={s.statLabel}>This week</Text>
              <Text style={s.statValue}>{weekJournalCount}</Text>
            </View>
          </View>
          {recentJournal ? (
            <Text style={s.journalPreview} numberOfLines={3}>
              "{recentJournal.content?.slice(0, 80)}{(recentJournal.content?.length ?? 0) > 80 ? '…' : ''}"
            </Text>
          ) : (
            <Text style={s.emptyHint}>No journal entries yet</Text>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('JournalHistory')} activeOpacity={0.7}>
            <Text style={s.linkText}>View all entries →</Text>
          </TouchableOpacity>
        </View>

        {/* ── Section 4: Affirmations ──────────────────────────────────────── */}
        <View style={[s.card, s.lavCard]}>
          <Text style={s.cardTitle}>Saved affirmations</Text>
          <Text style={s.affirmCount}>
            {data.savedAffirmations.length} affirmation{data.savedAffirmations.length !== 1 ? 's' : ''} saved
          </Text>
          {recentAffirmation ? (
            <Text style={s.affirmPreview} numberOfLines={3}>"{recentAffirmation}"</Text>
          ) : (
            <Text style={s.emptyHint}>Save an affirmation to see it here</Text>
          )}
          <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
            <Text style={s.linkText}>View saved →</Text>
          </TouchableOpacity>
        </View>

        {/* ── Section 5: Gentle insight ────────────────────────────────────── */}
        <View style={[s.card, s.lavCard]}>
          <Text style={s.cardTitle}>A gentle look back ✨</Text>
          {insights.map((line, i) => (
            <View key={i} style={s.insightRow}>
              <Text style={s.insightDot}>·</Text>
              <Text style={s.insightText}>{line}</Text>
            </View>
          ))}
        </View>

        {/* Export */}
        <TouchableOpacity
          style={s.exportBtn}
          onPress={() => {
            if (requirePremium({ feature: 'pdf_exports' })) {
              Alert.alert('Export coming soon 💜');
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={s.exportBtnText}>📄 Export Wellness Summary</Text>
        </TouchableOpacity>

      </ScrollView>
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

  scroll: { padding: 16, paddingBottom: 48, gap: 12 },

  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  chipActive: { backgroundColor: Colors.navActiveBg, borderColor: Colors.purple },
  chipText: { fontSize: 12, color: Colors.textMuted },
  chipTextActive: { color: Colors.purple, fontWeight: '500' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 16,
    gap: 10,
  },
  blushCard: { backgroundColor: '#FFF7FB', borderColor: '#F0D0E8' },
  lavCard: { backgroundColor: '#EDE3FF', borderColor: '#D0B8F8' },

  cardTitle: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  statRows: { gap: 8 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statEmoji: { fontSize: 15, marginRight: 8, flexShrink: 0 },
  statLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  statValue: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary, flexShrink: 0 },

  blushFooter: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingTop: 2,
  },

  emptyHint: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },

  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 4 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.pageBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: { borderColor: Colors.purple, borderWidth: 1.5 },
  dayCircleFilled: { backgroundColor: Colors.navActiveBg },
  dayEmoji: { fontSize: 16 },
  dayLabel: { fontSize: 9, color: Colors.textMuted },
  dayLabelToday: { color: Colors.purple, fontWeight: '500' },
  moodInsight: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },

  journalPreview: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  linkText: { fontSize: 12, color: Colors.purple, fontWeight: '500' },

  affirmCount: { fontSize: 12, color: Colors.textSecondary },
  affirmPreview: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  insightRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  insightDot: { fontSize: 16, color: Colors.purple, lineHeight: 20, marginTop: -1 },
  insightText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 19 },

  exportBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  exportBtnText: { fontSize: 13, fontWeight: '500', color: Colors.purple },
});
