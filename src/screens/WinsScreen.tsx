import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs, deleteDoc, doc } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = ['All', 'This week', 'This month'] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

// ─── Data helpers ─────────────────────────────────────────────────────────────

const loadWins = async (): Promise<Win[]> => {
  const wins: Win[] = [];
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDocs(collection(getFirestore(), 'users', uid, 'wins'));
      snap.forEach(d => wins.push({ id: d.id, ...d.data() } as Win));
    }
  } catch (e) {}
  if (wins.length === 0) {
    const raw = await AsyncStorage.getItem('bitzaWins');
    if (raw) return JSON.parse(raw);
  }
  return wins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateKey = (d: Date) => d.toISOString().split('T')[0];

const startOfWeek = (offset = 0): Date => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
};

const weekLabel = (dateKey: string): string => {
  const now = new Date();
  const thisMonday = startOfWeek(0);
  const lastMonday = startOfWeek(1);
  const winDate = new Date(dateKey + 'T12:00:00');

  if (winDate >= thisMonday) return 'This week';
  if (winDate >= lastMonday) return 'Last week';

  const weekOf = new Date(winDate);
  weekOf.setDate(winDate.getDate() - ((winDate.getDay() + 6) % 7));
  return 'Week of ' + weekOf.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDate = (dateKey: string) => {
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const thisWeekStart = startOfWeek(0);
const thisMonthStart = (() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; })();

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function WinsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [wins, setWins] = useState<Win[]>([]);
  const [filter, setFilter] = useState<FilterOption>('All');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadWins()
        .then(data => { if (active) setWins(data); })
        .catch(() => { if (active) setWins([]); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const deleteWin = async (id: string) => {
    try {
      const uid = getAuth().currentUser?.uid;
      if (uid) await deleteDoc(doc(getFirestore(), 'users', uid, 'wins', id));
      const existing = await loadWins();
      const updated = existing.filter(w => w.id !== id);
      await AsyncStorage.setItem('bitzaWins', JSON.stringify(updated));
      setWins(updated);
    } catch (e) {}
  };

  const handleLongPress = (win: Win) => {
    Alert.alert(win.label, undefined, [
      { text: 'Edit', onPress: () => navigation.navigate('AddWin', { win }) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete win?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteWin(win.id) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Filter
  const filtered = wins.filter(w => {
    if (filter === 'This week') return new Date(w.date + 'T12:00:00') >= thisWeekStart;
    if (filter === 'This month') return new Date(w.date + 'T12:00:00') >= thisMonthStart;
    return true;
  });

  // Stats
  const totalWins = wins.length;
  const winsThisWeek = wins.filter(w => new Date(w.date + 'T12:00:00') >= thisWeekStart).length;

  // Group by week
  const groups: { weekLabel: string; wins: Win[] }[] = [];
  filtered.forEach(win => {
    const label = weekLabel(win.date);
    const existing = groups.find(g => g.weekLabel === label);
    if (existing) { existing.wins.push(win); }
    else { groups.push({ weekLabel: label, wins: [win] }); }
  });

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Recent Wins</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddWin')} activeOpacity={0.8}>
          <Text style={s.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Stats banner */}
          <View style={s.statsBanner}>
            <Text style={s.statsBannerMain}>⭐ {totalWins} wins recorded</Text>
            <Text style={s.statsBannerSub}>{winsThisWeek} this week</Text>
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

          {/* Empty state */}
          {filtered.length === 0 ? (
            <View style={s.emptyCenter}>
              <Text style={s.emptyEmoji}>⭐</Text>
              <Text style={s.emptyTitle}>No wins recorded yet</Text>
              <Text style={s.emptySub}>Every small step counts. Tap + Add to record your first win.</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate('AddWin')}
                activeOpacity={0.85}
              >
                <Text style={s.emptyBtnText}>Add your first win</Text>
              </TouchableOpacity>
            </View>
          ) : (
            groups.map(group => (
              <View key={group.weekLabel}>
                <Text style={s.weekHeader}>{group.weekLabel.toUpperCase()}</Text>
                {group.wins.map(win => (
                  <TouchableOpacity
                    key={win.id}
                    style={s.winCard}
                    onLongPress={() => handleLongPress(win)}
                    activeOpacity={0.85}
                    delayLongPress={350}
                  >
                    <View style={s.winEmojiBg}>
                      <Text style={s.winEmojiText}>{win.emoji}</Text>
                    </View>
                    <Text style={s.winLabel} numberOfLines={2}>{win.label}</Text>
                    <Text style={s.winDate}>{formatDate(win.date)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
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
  addText: { fontSize: 14, fontWeight: '600', color: Colors.purple },

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 16, paddingBottom: 40 },

  statsBanner: {
    backgroundColor: '#FFFBEC',
    borderWidth: 0.5,
    borderColor: '#F5E4A0',
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsBannerMain: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  statsBannerSub: { fontSize: 12, color: Colors.textMuted },

  filterScroll: { marginBottom: 4 },
  filterContent: { gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.navActiveBg,
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  filterChipText: { fontSize: 13, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.purple, fontWeight: '600' },

  weekHeader: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },

  winCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    gap: 12,
  },
  winEmojiBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEC',
    borderWidth: 0.5,
    borderColor: '#F5E4A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winEmojiText: { fontSize: 22 },
  winLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary, lineHeight: 19 },
  winDate: { fontSize: 10, color: Colors.textMuted },

  emptyCenter: { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 19 },
  emptyBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
