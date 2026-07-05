import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: 'hugi' | 'immediate' | 'printable' | 'community' | 'contact' | 'mood' | 'journal' | 'tool' | 'plan';
  label: string;
  sublabel?: string;
  timestamp: string;
  emoji: string;
  color: string;
  bgColor: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTIVITY_CONFIG = {
  hugi:      { emoji: '💬', color: Colors.purple,     bgColor: '#EDE0FF' },
  immediate: { emoji: '🤝', color: '#C03060',         bgColor: '#FFF0F4' },
  printable: { emoji: '🖨️', color: Colors.purple,     bgColor: '#F0EAFF' },
  community: { emoji: '👥', color: '#3A8A3A',         bgColor: '#F0F8F0' },
  contact:   { emoji: '📞', color: '#3A6BC8',         bgColor: '#EEF4FF' },
  mood:      { emoji: '😊', color: '#C4800A',         bgColor: '#FFF8EC' },
  journal:   { emoji: '📓', color: Colors.purple,     bgColor: '#EDE0FF' },
  tool:      { emoji: '🌿', color: '#3A8A3A',         bgColor: '#F0F8F0' },
  plan:      { emoji: '📋', color: '#C03060',         bgColor: '#FFF0F4' },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 172800) return 'Yesterday';
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const todayKey = () => new Date().toISOString().split('T')[0];
const yesterdayKey = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const weekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const dateKey = (ts: string) => {
  try { return new Date(ts).toISOString().split('T')[0]; } catch { return ''; }
};

const formatGroupHeader = (key: string): string => {
  if (key === todayKey()) return 'Today';
  if (key === yesterdayKey()) return 'Yesterday';
  return new Date(key + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
};

// ─── Data loader ──────────────────────────────────────────────────────────────

const loadActivity = async (): Promise<ActivityItem[]> => {
  const activities: ActivityItem[] = [];

  const mood = await AsyncStorage.getItem('bitzaCaregiverMood');
  if (mood) {
    const m = JSON.parse(mood);
    activities.push({
      id: 'mood-1',
      type: 'mood',
      label: 'Checked in your mood',
      sublabel: m.mood,
      timestamp: m.time || new Date().toISOString(),
      ...ACTIVITY_CONFIG.mood,
    });
  }

  const journal = await AsyncStorage.getItem('bitzaJournal');
  if (journal) {
    const entries = JSON.parse(journal);
    (entries as any[]).slice(0, 3).forEach((e, i) => {
      const preview = e.content?.slice(0, 40);
      activities.push({
        id: `journal-${i}`,
        type: 'journal',
        label: e.type === 'prompt' ? 'Used a journal prompt' : 'Wrote in your journal',
        sublabel: preview ? preview + '…' : undefined,
        timestamp: e.createdAt,
        ...ACTIVITY_CONFIG.journal,
      });
    });
  }

  const plan = await AsyncStorage.getItem('bitzaSupportPlan');
  if (plan) {
    const p = JSON.parse(plan);
    activities.push({
      id: 'plan-1',
      type: 'plan',
      label: 'Updated support plan',
      sublabel: 'Last updated ' + new Date(p.lastUpdated).toLocaleDateString(),
      timestamp: p.lastUpdated,
      ...ACTIVITY_CONFIG.plan,
    });
  }

  const wins = await AsyncStorage.getItem('bitzaWins');
  if (wins) {
    const w = JSON.parse(wins);
    if (w.length > 0) {
      activities.push({
        id: 'wins-1',
        type: 'tool',
        label: 'Logged a win',
        sublabel: w[0].label,
        timestamp: w[0].createdAt || new Date().toISOString(),
        ...ACTIVITY_CONFIG.tool,
      });
    }
  }

  const affirmations = await AsyncStorage.getItem('bitzaSavedAffirmations');
  if (affirmations) {
    const a = JSON.parse(affirmations);
    if (a.length > 0) {
      activities.push({
        id: 'affirmation-1',
        type: 'immediate',
        label: 'Saved an affirmation',
        sublabel: typeof a[0] === 'string' ? a[0].slice(0, 40) + '…' : undefined,
        timestamp: new Date().toISOString(),
        ...ACTIVITY_CONFIG.immediate,
      });
    }
  }

  if (activities.length === 0) {
    activities.push({
      id: 'placeholder-1',
      type: 'hugi',
      label: 'No activity yet',
      sublabel: 'Your support activity will appear here',
      timestamp: new Date().toISOString(),
      ...ACTIVITY_CONFIG.hugi,
    });
  }

  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SupportActivityScreen() {
  const navigation = useNavigation<any>();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadActivity()
        .then(data => { if (active) setActivities(data); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const handleClearHistory = () => {
    Alert.alert('Clear activity history?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('bitzaActivityLog');
          setActivities([]);
        },
      },
    ]);
  };

  const isPlaceholder = activities.length === 1 && activities[0].id === 'placeholder-1';
  const wkStart = weekStart();
  const thisWeekCount = activities.filter(a => new Date(a.timestamp) >= wkStart).length;

  // Group by date
  const groups: { key: string; items: ActivityItem[] }[] = [];
  activities.forEach(a => {
    const key = dateKey(a.timestamp);
    const g = groups.find(g => g.key === key);
    if (g) { g.items.push(a); }
    else { groups.push({ key, items: [a] }); }
  });

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Recent Support Activity</Text>
        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Intro card */}
          <View style={s.introCard}>
            <Text style={s.introText}>
              A record of the support tools and resources you have used. Every action counts. 💜
            </Text>
          </View>

          {/* Privacy note */}
          <View style={s.privacyRow}>
            <Ionicons name="lock-closed" size={10} color={Colors.textMuted} />
            <Text style={s.privacyText}>This activity is private and only visible to you.</Text>
          </View>

          {/* Stats row */}
          {!isPlaceholder && (
            <View style={s.statsRow}>
              <View style={s.statBox}>
                <Text style={s.statNumber}>{activities.length}</Text>
                <Text style={s.statLabel}>total actions</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statNumber}>{thisWeekCount}</Text>
                <Text style={s.statLabel}>this week</Text>
              </View>
            </View>
          )}

          {/* Empty state */}
          {isPlaceholder ? (
            <View style={s.emptyCenter}>
              <Text style={s.emptyEmoji}>🌱</Text>
              <Text style={s.emptyTitle}>No support activity yet</Text>
              <Text style={s.emptySub}>
                As you use BitzaHugs, your activity will appear here.
              </Text>
            </View>
          ) : (
            groups.map(group => (
              <View key={group.key}>
                <Text style={s.dateHeader}>{formatGroupHeader(group.key)}</Text>
                {group.items.map(item => (
                  <View key={item.id} style={s.activityCard}>
                    <View style={[s.emojiCircle, { backgroundColor: item.bgColor }]}>
                      <Text style={s.emojiText}>{item.emoji}</Text>
                    </View>
                    <View style={s.activityMid}>
                      <Text style={s.activityLabel}>{item.label}</Text>
                      {!!item.sublabel && (
                        <Text style={s.activitySub} numberOfLines={1}>{item.sublabel}</Text>
                      )}
                    </View>
                    <Text style={s.activityTime}>{timeAgo(item.timestamp)}</Text>
                  </View>
                ))}
              </View>
            ))
          )}

          {/* Clear history */}
          {!isPlaceholder && (
            <TouchableOpacity style={s.clearBtn} onPress={handleClearHistory} activeOpacity={0.7}>
              <Text style={s.clearBtnText}>Clear activity history</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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

  scroll: { padding: 16, paddingBottom: 48 },

  introCard: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 8,
  },
  introText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
  },

  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 12,
  },
  privacyText: { fontSize: 10, color: Colors.textMuted },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: { fontSize: 24, fontWeight: '500', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textMuted },

  dateHeader: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 12,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emojiText: { fontSize: 22 },
  activityMid: { flex: 1 },
  activityLabel: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  activitySub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  activityTime: { fontSize: 10, color: Colors.textMuted, flexShrink: 0 },

  emptyCenter: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 19 },

  clearBtn: { alignItems: 'center', marginTop: 24, paddingVertical: 8 },
  clearBtnText: { fontSize: 11, color: Colors.textMuted },
});
