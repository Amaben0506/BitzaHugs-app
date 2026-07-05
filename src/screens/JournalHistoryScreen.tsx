import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';
import { FREE_LIMITS, isWithinHistoryWindow, usePremium } from '../lib/premium';

// ─── Types ───────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  type: 'free' | 'prompt';
  content: string;
  prompt?: string;
  date: string;
  createdAt: string;
  mood?: string;
}

// ─── Data loader ─────────────────────────────────────────────────────────────

const loadEntries = async (): Promise<JournalEntry[]> => {
  const entries: JournalEntry[] = [];
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDocs(collection(getFirestore(), 'users', uid, 'journal'));
      snap.forEach(d => entries.push({ id: d.id, ...d.data() } as JournalEntry));
    }
  } catch (e) {}
  if (entries.length === 0) {
    const raw = await AsyncStorage.getItem('bitzaJournal');
    if (raw) return JSON.parse(raw);
  }
  return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const deleteEntry = async (id: string, all: JournalEntry[]): Promise<JournalEntry[]> => {
  const updated = all.filter(e => e.id !== id);
  await AsyncStorage.setItem('bitzaJournal', JSON.stringify(updated));
  return updated;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCardDate = (dateKey: string) => {
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatMonthHeader = (dateKey: string) => {
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const thisMonthStart = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── Full entry modal ─────────────────────────────────────────────────────────

function EntryModal({ entry, onClose }: { entry: JournalEntry | null; onClose: () => void }) {
  if (!entry) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={m.card} activeOpacity={1} onPress={() => {}}>
          <View style={m.topRow}>
            <Text style={m.cardDate}>{formatCardDate(entry.date)}</Text>
            <View style={m.typePill}>
              <Text style={m.typePillText}>{entry.type === 'prompt' ? 'Prompted' : 'Free write'}</Text>
            </View>
          </View>

          {entry.prompt && (
            <View style={m.promptBox}>
              <Text style={m.promptBoxText}>{entry.prompt}</Text>
            </View>
          )}

          <ScrollView style={m.entryScroll} showsVerticalScrollIndicator={false}>
            <Text style={m.entryText}>{entry.content}</Text>
          </ScrollView>

          <TouchableOpacity style={m.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={m.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function JournalHistoryScreen() {
  const navigation = useNavigation<any>();
  const { isPremium, showPremiumUpgrade } = usePremium();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadEntries()
        .then(data => { if (active) setEntries(data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const handleLongPress = (entry: JournalEntry) => {
    Alert.alert(formatCardDate(entry.date), undefined, [
      { text: 'View', onPress: () => setViewEntry(entry) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete entry?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                const updated = await deleteEntry(entry.id, entries);
                setEntries(updated);
              },
            },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const monthStart = thisMonthStart();
  const thisMonthCount = entries.filter(e => new Date(e.date + 'T12:00:00') >= monthStart).length;

  // Group by month
  const groups: { monthKey: string; items: JournalEntry[] }[] = [];
  entries.forEach(e => {
    const key = e.date.slice(0, 7);
    const g = groups.find(g => g.monthKey === key);
    if (g) { g.items.push(e); }
    else { groups.push({ monthKey: key, items: [e] }); }
  });
  const lockedCount = isPremium
    ? 0
    : entries.filter(e => !isWithinHistoryWindow(e.date, FREE_LIMITS.journalHistoryDays)).length;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Journal</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JournalWrite')} activeOpacity={0.8}>
          <Text style={s.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : entries.length === 0 ? (
        <View style={s.emptyCenter}>
          <Text style={s.emptyEmoji}>📓</Text>
          <Text style={s.emptyTitle}>No journal entries yet</Text>
          <Text style={s.emptySub}>This is your private space to write freely or follow a prompt.</Text>
          <View style={s.emptyBtns}>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('JournalWrite')} activeOpacity={0.85}>
              <Text style={s.emptyBtnText}>Write freely</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.emptyBtn, s.emptyBtnSecondary]} onPress={() => navigation.navigate('JournalPrompt')} activeOpacity={0.85}>
              <Text style={[s.emptyBtnText, { color: Colors.purple }]}>Use a prompt</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Stats banner */}
          <View style={s.statsBanner}>
            <Text style={s.statsMain}>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</Text>
            <Text style={s.statsSub}>{isPremium ? `${thisMonthCount} this month` : `Last ${FREE_LIMITS.journalHistoryDays} days shown`}</Text>
          </View>

          {groups.map(group => (
            <View key={group.monthKey}>
              <Text style={s.monthHeader}>{formatMonthHeader(group.items[0].date)}</Text>
              {group.items.map(entry => {
                const locked = !isPremium && !isWithinHistoryWindow(entry.date, FREE_LIMITS.journalHistoryDays);
                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={[s.entryCard, locked && s.entryCardLocked]}
                    onPress={() => locked ? showPremiumUpgrade({ feature: 'full_history' }) : setViewEntry(entry)}
                    onLongPress={() => locked ? showPremiumUpgrade({ feature: 'full_history' }) : handleLongPress(entry)}
                    activeOpacity={0.85}
                    delayLongPress={350}
                    accessibilityLabel={locked ? 'Premium journal history entry' : 'Journal entry'}
                  >
                    <View style={s.entryTopRow}>
                      <Text style={s.entryDate}>{formatCardDate(entry.date)}</Text>
                      <View style={locked ? s.lockedPill : s.typePill}>
                        <Text style={locked ? s.lockedPillText : s.typePillText}>{locked ? 'Premium History' : entry.type === 'prompt' ? 'Prompted' : 'Free write'}</Text>
                      </View>
                    </View>
                    {locked ? (
                      <Text style={s.entryPreview}>Older entry saved privately. Premium unlocks your complete journal history.</Text>
                    ) : (
                      <>
                        {entry.prompt && (
                          <Text style={s.entryPrompt} numberOfLines={1}>{entry.prompt}</Text>
                        )}
                        <Text style={s.entryPreview} numberOfLines={2}>{entry.content}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          {lockedCount > 0 && (
            <TouchableOpacity style={s.historyLockCard} onPress={() => showPremiumUpgrade({ feature: 'full_history' })} activeOpacity={0.85}>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.purple} />
              <Text style={s.historyLockText}>{lockedCount} older {lockedCount === 1 ? 'entry is' : 'entries are'} safely saved. Premium unlocks the full journal history.</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <EntryModal entry={viewEntry} onClose={() => setViewEntry(null)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SCREEN_H = Dimensions.get('window').height;

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
  newBtnText: { fontSize: 14, fontWeight: '600', color: Colors.purple },

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 19 },
  emptyBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  emptyBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  emptyBtnSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.purple },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  scroll: { padding: 16, paddingBottom: 40 },

  statsBanner: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statsMain: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  statsSub: { fontSize: 12, color: Colors.textMuted },

  monthHeader: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },

  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 8,
  },
  entryCardLocked: {
    backgroundColor: '#F8F3FF',
    borderColor: '#D8C7F2',
  },
  entryTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  entryDate: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  typePill: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  typePillText: { fontSize: 10, color: Colors.purple },
  lockedPill: {
    backgroundColor: '#EDE3FF',
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  lockedPillText: { fontSize: 10, color: Colors.purple, fontWeight: '600' },
  entryPrompt: { fontSize: 11, color: Colors.purple, marginBottom: 4 },
  entryPreview: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', lineHeight: 19 },
  historyLockCard: {
    backgroundColor: '#F2EAFB',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  historyLockText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18, fontWeight: '600' },
});

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxHeight: SCREEN_H * 0.7,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardDate: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  typePill: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  typePillText: { fontSize: 10, color: Colors.purple },
  promptBox: {
    backgroundColor: '#EDE3FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  promptBoxText: { fontSize: 13, color: Colors.purple, fontStyle: 'italic' },
  entryScroll: { flex: 1, marginBottom: 16 },
  entryText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },
  closeBtn: {
    backgroundColor: Colors.pageBg,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
});
