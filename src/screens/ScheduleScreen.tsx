import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../theme/colors';
import '../lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  type: 'routine' | 'appointment';
  status: 'pending' | 'completed' | 'skipped';
  emoji: string;
  notes?: string;
  date: string;
}

// ─── Firestore helpers ────────────────────────────────────────────────────────

const getUid = () => getAuth().currentUser?.uid;
const db = getFirestore();

const getDefaultItems = (date: string): ScheduleItem[] => [
  { id: '1', time: '07:00', title: 'Morning Routine', type: 'routine', status: 'pending', emoji: '🌅', date },
  { id: '2', time: '08:30', title: 'School / Learning', type: 'routine', status: 'pending', emoji: '📚', date },
  { id: '3', time: '12:30', title: 'Lunch', type: 'routine', status: 'pending', emoji: '🍽️', date },
  { id: '4', time: '15:00', title: 'Play / Break Time', type: 'routine', status: 'pending', emoji: '☀️', date },
  { id: '5', time: '19:00', title: 'Bedtime Routine', type: 'routine', status: 'pending', emoji: '🌙', date },
];

const getLocalItems = async (date: string): Promise<ScheduleItem[]> => {
  const raw = await AsyncStorage.getItem(`bitzaSchedule_${date}`);
  return raw ? JSON.parse(raw) : getDefaultItems(date);
};

const loadScheduleItems = async (date: string): Promise<ScheduleItem[]> => {
  try {
    const uid = getUid();
    if (!uid) return getLocalItems(date);
    const snap = await getDocs(collection(db, 'users', uid, 'schedule', date, 'items'));
    const items: ScheduleItem[] = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() } as ScheduleItem));
    if (items.length === 0) return getLocalItems(date);
    return items.sort((a, b) => a.time.localeCompare(b.time));
  } catch {
    return getLocalItems(date);
  }
};

const saveItem = async (item: ScheduleItem) => {
  try {
    const uid = getUid();
    if (uid) {
      await setDoc(doc(db, 'users', uid, 'schedule', item.date, 'items', item.id), item);
    }
    const existing = await getLocalItems(item.date);
    const updated = existing.filter(i => i.id !== item.id).concat(item);
    await AsyncStorage.setItem(`bitzaSchedule_${item.date}`, JSON.stringify(updated));
  } catch (e) {
    console.log('saveItem error:', e);
  }
};

const deleteItem = async (item: ScheduleItem) => {
  try {
    const uid = getUid();
    if (uid) {
      await deleteDoc(doc(db, 'users', uid, 'schedule', item.date, 'items', item.id));
    }
    const existing = await getLocalItems(item.date);
    const updated = existing.filter(i => i.id !== item.id);
    await AsyncStorage.setItem(`bitzaSchedule_${item.date}`, JSON.stringify(updated));
  } catch (e) {
    console.log('deleteItem error:', e);
  }
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

const toDateKey = (d: Date) => d.toISOString().split('T')[0];

const toDisplayDate = (d: Date) => {
  const today = toDateKey(new Date());
  const key = toDateKey(d);
  if (key === today) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const parseTimeString = (t: string): Date => {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const timeToString = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

const defaultTimeDate = () => {
  const d = new Date();
  d.setHours(7, 0, 0, 0);
  return d;
};

const nextStatus = (s: ScheduleItem['status']): ScheduleItem['status'] =>
  s === 'pending' ? 'completed' : s === 'completed' ? 'skipped' : 'pending';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = ['🌅', '📚', '🍽️', '☀️', '🌙', '🏥', '🚗', '💊', '🎨', '🎯'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusButton({ status, onPress }: { status: ScheduleItem['status']; onPress: () => void }) {
  if (status === 'completed') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[s.statusCircle, s.statusCompleted]}>
        <Ionicons name="checkmark" size={14} color="#fff" />
      </TouchableOpacity>
    );
  }
  if (status === 'skipped') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[s.statusCircle, s.statusSkipped]}>
        <Ionicons name="close" size={14} color="#fff" />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[s.statusCircle, s.statusPending]} />
  );
}

function TimelineItem({
  item,
  isLast,
  onToggle,
  onPress,
  onLongPress,
}: {
  item: ScheduleItem;
  isLast: boolean;
  onToggle: () => void;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const muted = item.status !== 'pending';
  return (
    <TouchableOpacity
      style={s.timelineRow}
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      {/* Time column */}
      <Text style={[s.timeText, muted && s.mutedText]}>{formatTime(item.time)}</Text>

      {/* Connector column */}
      <View style={s.connectorCol}>
        <View style={s.dot} />
        {!isLast && <View style={s.line} />}
      </View>

      {/* Content */}
      <View style={s.itemContent}>
        <View style={[s.emojiCircle]}>
          <Text style={s.emojiText}>{item.emoji}</Text>
        </View>
        <View style={s.itemText}>
          <Text style={[s.itemTitle, muted && s.mutedText]} numberOfLines={1}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={[s.itemSubtitle, muted && s.mutedText]} numberOfLines={1}>{item.subtitle}</Text>
          ) : null}
          <View style={s.typePill}>
            <Text style={s.typePillText}>{item.type === 'appointment' ? 'Appointment' : 'Routine'}</Text>
          </View>
        </View>
        <StatusButton status={item.status} onPress={onToggle} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Add Activity Modal ───────────────────────────────────────────────────────

function AddModal({
  visible,
  date,
  onClose,
  onSaved,
}: {
  visible: boolean;
  date: string;
  onClose: () => void;
  onSaved: (item: ScheduleItem) => void;
}) {
  const [selectedTime, setSelectedTime] = useState<Date>(defaultTimeDate);
  const [showPicker, setShowPicker] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<'routine' | 'appointment'>('routine');
  const [emoji, setEmoji] = useState('🌅');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSelectedTime(defaultTimeDate()); setShowPicker(false);
    setTitle(''); setSubtitle('');
    setType('routine'); setEmoji('🌅'); setSaving(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleAdd = async () => {
    if (!title.trim()) { Alert.alert('Title required', 'Please enter an activity name.'); return; }
    setSaving(true);
    const item: ScheduleItem = {
      id: Date.now().toString(),
      time: timeToString(selectedTime),
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      type,
      status: 'pending',
      emoji,
      date,
    };
    await saveItem(item);
    onSaved(item);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity activeOpacity={1} style={s.modalCard} onPress={() => {}}>
          <Text style={s.modalTitle}>Add Activity</Text>

          <Text style={s.fieldLabel}>Time</Text>
          <TouchableOpacity
            style={s.timeRow}
            onPress={() => setShowPicker(p => !p)}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={16} color={Colors.purple} />
            <Text style={s.timeRowText}>{formatTime(timeToString(selectedTime))}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={(_e: unknown, date?: Date) => { if (date) setSelectedTime(date); }}
              textColor={Colors.textPrimary}
            />
          )}

          <Text style={s.fieldLabel}>Activity name</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Activity name"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={s.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={s.input}
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder="e.g. with Sarah T."
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={s.fieldLabel}>Type</Text>
          <View style={s.chipRow}>
            {(['routine', 'appointment'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.chip, type === t && s.chipSelected]}
                onPress={() => setType(t)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, type === t && s.chipTextSelected]}>
                  {t === 'routine' ? 'Routine' : 'Appointment'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.fieldLabel}>Emoji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.emojiScroll} contentContainerStyle={s.emojiScrollContent}>
            {EMOJI_OPTIONS.map(e => (
              <TouchableOpacity
                key={e}
                style={[s.emojiPickerCircle, emoji === e && s.emojiPickerSelected]}
                onPress={() => setEmoji(e)}
                activeOpacity={0.8}
              >
                <Text style={s.emojiPickerText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[s.primaryBtn, saving && s.primaryBtnDisabled]}
            onPress={handleAdd}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>{saving ? 'Adding…' : 'Add Activity'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelRow} onPress={handleClose} activeOpacity={0.7}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Edit Activity Modal ──────────────────────────────────────────────────────

function EditModal({
  visible,
  item,
  onClose,
  onSaved,
}: {
  visible: boolean;
  item: ScheduleItem | null;
  onClose: () => void;
  onSaved: (updated: ScheduleItem) => void;
}) {
  const [selectedTime, setSelectedTime] = useState<Date>(defaultTimeDate);
  const [showPicker, setShowPicker] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<'routine' | 'appointment'>('routine');
  const [emoji, setEmoji] = useState('🌅');
  const [saving, setSaving] = useState(false);

  // Sync fields whenever a different item is opened
  useEffect(() => {
    if (item) {
      setSelectedTime(parseTimeString(item.time));
      setShowPicker(false);
      setTitle(item.title);
      setSubtitle(item.subtitle ?? '');
      setType(item.type);
      setEmoji(item.emoji);
      setSaving(false);
    }
  }, [item]);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Title required', 'Please enter an activity name.'); return; }
    if (!item) return;
    setSaving(true);
    const updated: ScheduleItem = {
      ...item,
      time: timeToString(selectedTime),
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      type,
      emoji,
    };
    await saveItem(updated);
    onSaved(updated);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={s.modalCard} onPress={() => {}}>
          <Text style={s.modalTitle}>Edit Activity</Text>

          <Text style={s.fieldLabel}>Time</Text>
          <TouchableOpacity
            style={s.timeRow}
            onPress={() => setShowPicker(p => !p)}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={16} color={Colors.purple} />
            <Text style={s.timeRowText}>{formatTime(timeToString(selectedTime))}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={(_e: unknown, date?: Date) => { if (date) setSelectedTime(date); }}
              textColor={Colors.textPrimary}
            />
          )}

          <Text style={s.fieldLabel}>Activity name</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Activity name"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={s.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={s.input}
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder="e.g. with Sarah T."
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={s.fieldLabel}>Type</Text>
          <View style={s.chipRow}>
            {(['routine', 'appointment'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.chip, type === t && s.chipSelected]}
                onPress={() => setType(t)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, type === t && s.chipTextSelected]}>
                  {t === 'routine' ? 'Routine' : 'Appointment'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.fieldLabel}>Emoji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.emojiScroll} contentContainerStyle={s.emojiScrollContent}>
            {EMOJI_OPTIONS.map(e => (
              <TouchableOpacity
                key={e}
                style={[s.emojiPickerCircle, emoji === e && s.emojiPickerSelected]}
                onPress={() => setEmoji(e)}
                activeOpacity={0.8}
              >
                <Text style={s.emojiPickerText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[s.primaryBtn, saving && s.primaryBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelRow} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addVisible, setAddVisible] = useState(false);
  const [editItem, setEditItem] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    if (route.params?.openAddModal) {
      setAddVisible(true);
    }
  }, []);

  const dateKey = toDateKey(currentDate);
  const isToday = dateKey === toDateKey(new Date());

  const load = useCallback(async (date: string) => {
    setLoading(true);
    const loaded = await loadScheduleItems(date);
    setItems(loaded);
    setLoading(false);
  }, []);

  useEffect(() => { load(dateKey); }, [dateKey, load]);

  const shiftDay = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    setCurrentDate(d);
  };

  const toggleStatus = async (item: ScheduleItem) => {
    const updated = { ...item, status: nextStatus(item.status) };
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    await saveItem(updated);
  };

  const confirmDelete = (item: ScheduleItem) => {
    Alert.alert('Delete activity', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setItems(prev => prev.filter(i => i.id !== item.id));
          await deleteItem(item);
        },
      },
    ]);
  };

  const handleLongPress = (item: ScheduleItem) => {
    Alert.alert(item.title, undefined, [
      {
        text: 'Skip this activity',
        onPress: async () => {
          const updated = { ...item, status: 'skipped' as const };
          setItems(prev => prev.map(i => i.id === item.id ? updated : i));
          await saveItem(updated);
        },
      },
      { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(item) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const completed = items.filter(i => i.status === 'completed').length;
  const total = items.length;
  const progress = total > 0 ? completed / total : 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Today's Schedule</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setAddVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Date navigator */}
      <View style={s.dateNav}>
        <TouchableOpacity onPress={() => shiftDay(-1)} activeOpacity={0.7} style={s.dateNavArrow}>
          <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={s.dateCenter}>
          <Text style={[s.dateText, isToday && s.dateTodayText]}>{toDisplayDate(currentDate)}</Text>
          {!isToday && (
            <TouchableOpacity
              style={s.todayPill}
              onPress={() => setCurrentDate(new Date())}
              activeOpacity={0.8}
            >
              <Text style={s.todayPillText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => shiftDay(1)} activeOpacity={0.7} style={s.dateNavArrow}>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      {loading ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      ) : items.length === 0 ? (
        <View style={s.emptyCenter}>
          <Text style={s.emptyEmoji}>🐰</Text>
          <Text style={s.emptyTitle}>No activities scheduled</Text>
          <Text style={s.emptySub}>Tap + Add to add your first activity</Text>
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item, idx) => (
            <TimelineItem
              key={item.id}
              item={item}
              isLast={idx === items.length - 1}
              onToggle={() => toggleStatus(item)}
              onPress={() => setEditItem(item)}
              onLongPress={() => handleLongPress(item)}
            />
          ))}
        </ScrollView>
      )}

      {/* Bottom summary bar */}
      <SafeAreaView edges={['bottom']} style={s.summaryBar}>
        <View style={s.summaryRow}>
          <Text style={s.summaryText}>
            <Text style={s.summaryCount}>{completed}</Text>
            <Text style={s.summaryOf}> of {total} completed</Text>
          </Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </SafeAreaView>

      <AddModal
        visible={addVisible}
        date={dateKey}
        onClose={() => setAddVisible(false)}
        onSaved={item => {
          setItems(prev =>
            [...prev, item].sort((a, b) => a.time.localeCompare(b.time))
          );
        }}
      />

      <EditModal
        visible={editItem !== null}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSaved={updated => {
          setItems(prev =>
            prev.map(i => i.id === updated.id ? updated : i)
               .sort((a, b) => a.time.localeCompare(b.time))
          );
          setEditItem(null);
        }}
      />
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.purple,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardBorder,
  },
  dateNavArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  dateTodayText: { color: Colors.purple },
  todayPill: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: Colors.purple,
  },
  todayPillText: { fontSize: 11, color: Colors.purple, fontWeight: '600' },

  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },

  // Timeline row
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 72,
  },
  timeText: {
    width: 60,
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    paddingTop: 8,
    textAlign: 'right',
    paddingRight: 10,
  },
  connectorCol: {
    width: 20,
    alignItems: 'center',
    paddingTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grayLavender,
  },
  line: {
    flex: 1,
    width: 1.5,
    backgroundColor: Colors.cardBorder,
    marginTop: 2,
    minHeight: 52,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 10,
    paddingBottom: 16,
  },
  emojiCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 16 },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  itemSubtitle: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  typePill: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.pageBg,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  typePillText: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  mutedText: { color: Colors.textMuted },

  // Status circles
  statusCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPending: {
    borderWidth: 1.5,
    borderColor: Colors.grayLavender,
    backgroundColor: 'transparent',
  },
  statusCompleted: { backgroundColor: Colors.green },
  statusSkipped: { backgroundColor: Colors.grayLavender },

  // Summary bar
  summaryBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  summaryRow: { marginBottom: 6 },
  summaryText: { fontSize: 12 },
  summaryCount: { color: Colors.green, fontWeight: '600', fontSize: 13 },
  summaryOf: { color: Colors.textMuted },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.navActiveBg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.green,
    borderRadius: 2,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
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
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.navActiveBg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  chipSelected: { borderColor: Colors.purple },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextSelected: { color: Colors.textPrimary, fontWeight: '600' },
  emojiScroll: { marginTop: 2 },
  emojiScrollContent: { gap: 8, paddingVertical: 4 },
  emojiPickerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiPickerSelected: { borderColor: Colors.purple },
  emojiPickerText: { fontSize: 22 },
  primaryBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelRow: { alignItems: 'center', paddingTop: 14 },
  cancelText: { fontSize: 13, color: Colors.textMuted },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.navActiveBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  timeRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.purple,
  },
});
