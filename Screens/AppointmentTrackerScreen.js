import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Card from "../src/components/ui/Card";
import PressableScale from "../src/components/ui/PressableScale";
import ScreenHeader from "../src/components/ui/ScreenHeader";
import PrimaryButton from "../src/components/ui/PrimaryButton";
import { Colors, Fonts, Type, Spacing, Radius, Shadows } from "../src/theme/theme";
import { usePremium } from "../src/lib/premium";

const STORAGE_KEY = "bitzaAppointments";

const APPOINTMENT_TYPES = [
  { label: "Therapy", icon: "heart", color: "#6F42D8", bg: "#F0E2FF" },
  { label: "Doctor / Medical", icon: "activity", color: "#EF8F7D", bg: "#FFE6E4" },
  { label: "School Meeting", icon: "book-open", color: "#4C9ED9", bg: "#E7F4FF" },
  { label: "Evaluation", icon: "clipboard", color: "#78A866", bg: "#EEF7E8" },
  { label: "Custom", icon: "calendar", color: "#D99A3D", bg: "#FFF0DF" },
];

// ─── Time Picker ──────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

function TimePicker({ hour, minute, period, onHour, onMinute, onPeriod }) {
  return (
    <View style={tp.row}>
      <ScrollView style={tp.col} showsVerticalScrollIndicator={false} snapToInterval={40} decelerationRate="fast" contentContainerStyle={{ paddingVertical: 40 }}>
        {HOURS.map((h) => (
          <TouchableOpacity key={h} style={[tp.item, hour === h && tp.itemActive]} onPress={() => onHour(h)}>
            <Text style={[tp.itemText, hour === h && tp.itemTextActive]}>{h}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={tp.colon}>:</Text>
      <ScrollView style={tp.col} showsVerticalScrollIndicator={false} snapToInterval={40} decelerationRate="fast" contentContainerStyle={{ paddingVertical: 40 }}>
        {MINUTES.map((m) => (
          <TouchableOpacity key={m} style={[tp.item, minute === m && tp.itemActive]} onPress={() => onMinute(m)}>
            <Text style={[tp.itemText, minute === m && tp.itemTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={tp.ampmCol}>
        {PERIODS.map((p) => (
          <TouchableOpacity key={p} style={[tp.ampmItem, period === p && tp.ampmActive]} onPress={() => onPeriod(p)}>
            <Text style={[tp.ampmText, period === p && tp.ampmTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const tp = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  col: { width: 64, height: 120, overflow: "hidden" },
  item: { height: 40, alignItems: "center", justifyContent: "center", borderRadius: Radius.sm },
  itemActive: { backgroundColor: Colors.lavenderSurface },
  itemText: { fontSize: 20, fontWeight: "600", color: Colors.grayLavender },
  itemTextActive: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary },
  colon: { fontSize: 24, fontWeight: "800", color: Colors.textPrimary, marginHorizontal: 6 },
  ampmCol: { marginLeft: 10, gap: 8 },
  ampmItem: { width: 52, height: 40, borderRadius: Radius.sm, backgroundColor: Colors.lavenderSurface, borderWidth: 1, borderColor: Colors.lavenderBorder, alignItems: "center", justifyContent: "center" },
  ampmActive: { backgroundColor: Colors.lavenderSurface, borderColor: Colors.purple, borderWidth: 2 },
  ampmText: { fontSize: 14, fontWeight: "700", color: Colors.grayLavender },
  ampmTextActive: { color: Colors.textPrimary, fontWeight: "800" },
});

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <Feather name="calendar" size={36} color={Colors.purple} />
      </View>
      <Text style={styles.emptyTitle}>No appointments yet</Text>
      <Text style={styles.emptyText}>
        Add therapy sessions, doctor visits, school meetings, evaluations, and more.
      </Text>
      <PrimaryButton label="Add First Appointment" onPress={onAdd} icon="add" style={styles.emptyBtn} />
    </Card>
  );
}

// ─── Appointment Card ─────────────────────────────────────────────────────────
function AppointmentCard({ appt, onDelete, onEdit, isPast, readOnly }) {
  const type = APPOINTMENT_TYPES.find((t) => t.label === appt.type) || APPOINTMENT_TYPES[4];
  return (
    <Card style={[styles.apptCard, isPast && styles.apptCardPast]}>
      <View style={styles.apptTop}>
        <View style={[styles.apptTypeBubble, { backgroundColor: type.bg }]}>
          <Feather name={type.icon} size={18} color={type.color} />
        </View>
        <View style={styles.apptTitleWrap}>
          <Text style={[styles.apptTitle, isPast && styles.apptTitlePast]}>{appt.title}</Text>
          <Text style={[styles.apptType, { color: type.color }]}>{appt.type}</Text>
        </View>
        {!readOnly && (
          <View style={styles.apptActions}>
            <PressableScale style={styles.apptActionBtn} onPress={() => onEdit(appt)}>
              <Feather name="edit-2" size={14} color={Colors.purple} />
            </PressableScale>
            <PressableScale style={[styles.apptActionBtn, styles.apptDeleteBtn]} onPress={() => onDelete(appt.id)}>
              <Feather name="trash-2" size={14} color="#D86A5B" />
            </PressableScale>
          </View>
        )}
      </View>

      <View style={styles.apptMeta}>
        {appt.date ? (
          <View style={styles.apptMetaRow}>
            <Feather name="calendar" size={13} color={Colors.textMuted} />
            <Text style={styles.apptMetaText}>{appt.date}</Text>
          </View>
        ) : null}
        {appt.time ? (
          <View style={styles.apptMetaRow}>
            <Feather name="clock" size={13} color={Colors.textMuted} />
            <Text style={styles.apptMetaText}>{appt.time}</Text>
          </View>
        ) : null}
        {appt.provider ? (
          <View style={styles.apptMetaRow}>
            <Feather name="user" size={13} color={Colors.textMuted} />
            <Text style={styles.apptMetaText}>{appt.provider}</Text>
          </View>
        ) : null}
        {appt.location ? (
          <View style={styles.apptMetaRow}>
            <Feather name="map-pin" size={13} color={Colors.textMuted} />
            <Text style={styles.apptMetaText}>{appt.location}</Text>
          </View>
        ) : null}
      </View>

      {appt.notes ? (
        <View style={styles.apptNotes}>
          <Text style={styles.apptNotesLabel}>Notes / Questions</Text>
          <Text style={styles.apptNotesText}>{appt.notes}</Text>
        </View>
      ) : null}

      {appt.followUp ? (
        <View style={styles.apptFollowUp}>
          <Feather name="bell" size={12} color={Colors.mutedGold} />
          <Text style={styles.apptFollowUpText}>{appt.followUp}</Text>
        </View>
      ) : null}

      {isPast && (
        <View style={styles.pastBadge}>
          <Text style={styles.pastBadgeText}>Past</Text>
        </View>
      )}
    </Card>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const BLANK = { id: null, title: "", type: "Therapy", provider: "", location: "", date: "", hour: "09", minute: "00", period: "AM", time: "", notes: "", followUp: "" };

export default function AppointmentTrackerScreen({ navigation }) {
  const { isPremium, isLoading: premiumLoading, showPremiumUpgrade } = usePremium();
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [filter, setFilter] = useState("upcoming");
  const [savedMessage, setSavedMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved) setAppointments(JSON.parse(saved));
        } catch (e) {
          console.log("Error loading appointments:", e);
        }
      };
      load();
    }, [])
  );

  const save = async (updated) => {
    setAppointments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const showStatus = (msg) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const openAdd = () => {
    if (premiumLoading || !isPremium) {
      showPremiumUpgrade({ feature: "appointments", isChecking: premiumLoading });
      return;
    }
    setForm(BLANK);
    setShowModal(true);
  };

  const openEdit = (appt) => {
    if (premiumLoading || !isPremium) {
      showPremiumUpgrade({ feature: "appointments", isChecking: premiumLoading });
      return;
    }
    const [time, period] = appt.time ? appt.time.split(" ") : ["09:00", "AM"];
    const [hour, minute] = time ? time.split(":") : ["09", "00"];
    setForm({ ...appt, hour: hour || "09", minute: minute || "00", period: period || "AM" });
    setShowModal(true);
  };

  const deleteAppt = async (id) => {
    if (premiumLoading || !isPremium) {
      showPremiumUpgrade({ feature: "appointments", isChecking: premiumLoading });
      return;
    }
    await save(appointments.filter((a) => a.id !== id));
    showStatus("Appointment removed");
  };

  const saveForm = async () => {
    if (!form.title.trim()) return;
    const timeStr = `${form.hour}:${form.minute} ${form.period}`;
    const appt = {
      ...form,
      id: form.id || Date.now().toString(),
      title: form.title.trim(),
      provider: form.provider.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
      followUp: form.followUp.trim(),
      time: timeStr,
    };
    const updated = form.id
      ? appointments.map((a) => a.id === form.id ? appt : a)
      : [appt, ...appointments];
    await save(updated);
    setShowModal(false);
    showStatus(form.id ? "Appointment updated 💜" : "Appointment saved 💜");
  };

  // Simple past detection: if date string resolves to before today
  const isPast = (appt) => {
    if (!appt.date) return false;
    try {
      return new Date(appt.date) < new Date(new Date().toDateString());
    } catch { return false; }
  };

  const filtered = appointments.filter((a) => {
    if (filter === "upcoming") return !isPast(a);
    if (filter === "past") return isPast(a);
    return true;
  });

  const upcoming = appointments.filter((a) => !isPast(a));
  const past = appointments.filter((a) => isPast(a));

  const sectionLabel = filter === "upcoming" ? "Upcoming" : filter === "past" ? "Past" : "All Appointments";

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safe}>
        <LinearGradient
          colors={["#EEE8F5", "#F5F0FA", "#FDFBFF"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScreenHeader
          title="Appointments"
          onBack={() => navigation.goBack()}
          style={styles.headerBg}
          rightAction={
            <PressableScale style={styles.headerAddBtn} onPress={openAdd}>
              <Feather name="lock" size={16} color={Colors.purple} />
            </PressableScale>
          }
        />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
          <Card style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <Feather name="calendar" size={28} color={Colors.purple} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Keep every appointment in one place.</Text>
              <Text style={styles.heroText}>
                Premium includes appointment tracking, reminders, notes, preparation checklists, and follow-ups.
              </Text>
            </View>
          </Card>

          <PrimaryButton
            label="View Premium"
            onPress={() => showPremiumUpgrade({ feature: "appointments" })}
            icon="lock-closed"
            style={styles.addButton}
          />

          {appointments.length > 0 && (
            <>
              <Text style={styles.overline}>Saved Read-Only</Text>
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  isPast={isPast(appt)}
                  onDelete={deleteAppt}
                  onEdit={openEdit}
                  readOnly
                />
              ))}
              <Text style={styles.footerText}>Renew Premium to edit, add reminders, or create new appointments.</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#EEE8F5", "#F5F0FA", "#FDFBFF"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScreenHeader
        title="Appointments"
        onBack={() => navigation.goBack()}
        style={styles.headerBg}
        rightAction={
          <PressableScale style={styles.headerAddBtn} onPress={openAdd}>
            <Feather name="plus" size={18} color={Colors.purple} />
          </PressableScale>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {/* Status banner */}
        {savedMessage ? (
          <View style={styles.statusBanner}>
            <Feather name="check-circle" size={16} color={Colors.purple} />
            <Text style={styles.statusText}>{savedMessage}</Text>
          </View>
        ) : null}

        {/* Hero */}
        <Card style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Feather name="calendar" size={28} color={Colors.purple} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Track every appointment.</Text>
            <Text style={styles.heroText}>
              Therapy, doctors, school meetings, evaluations — all in one calm place.
            </Text>
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.lavenderSurface }]}>
            <Text style={styles.statNumber}>{upcoming.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.sageSurface }]}>
            <Text style={styles.statNumber}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.blushSurface }]}>
            <Text style={styles.statNumber}>{past.length}</Text>
            <Text style={styles.statLabel}>Past</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <Text style={styles.overline}>Filter</Text>
        <View style={styles.filterRow}>
          {["upcoming", "all", "past"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Type Legend */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.legendScroll}
          contentContainerStyle={styles.legendRow}
        >
          {APPOINTMENT_TYPES.map((t) => (
            <View key={t.label} style={[styles.legendChip, { backgroundColor: t.bg }]}>
              <Feather name={t.icon} size={12} color={t.color} />
              <Text style={[styles.legendText, { color: t.color }]}>{t.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Appointment List */}
        <Text style={styles.overline}>{sectionLabel}</Text>
        {filtered.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              isPast={isPast(appt)}
              onDelete={deleteAppt}
              onEdit={openEdit}
            />
          ))
        )}

        {/* Add Button (shown when list is non-empty) */}
        {filtered.length > 0 && (
          <PrimaryButton
            label="Add Appointment"
            onPress={openAdd}
            icon="add"
            style={styles.addButton}
          />
        )}

        <Text style={styles.footerText}>Your family's schedule, all in one calm place.</Text>
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{form.id ? "Edit Appointment" : "New Appointment"}</Text>
              <PressableScale onPress={() => setShowModal(false)} style={styles.modalClose}>
                <Feather name="x" size={20} color={Colors.textPrimary} />
              </PressableScale>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>

              {/* Type Picker */}
              <Text style={styles.modalLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                  {APPOINTMENT_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.label}
                      style={[styles.typeChip, { backgroundColor: t.bg }, form.type === t.label && styles.typeChipActive]}
                      onPress={() => setForm({ ...form, type: t.label })}
                      activeOpacity={0.85}
                    >
                      <Feather name={t.icon} size={14} color={t.color} />
                      <Text style={[styles.typeChipText, { color: t.color }]}>{t.label}</Text>
                      {form.type === t.label && (
                        <View style={styles.typeChipCheck}>
                          <Feather name="check" size={9} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Title */}
              <Text style={styles.modalLabel}>Appointment title *</Text>
              <TextInput
                style={styles.modalInput}
                value={form.title}
                onChangeText={(v) => setForm({ ...form, title: v })}
                placeholder="Example: Speech Therapy with Dr. Kim"
                placeholderTextColor={Colors.grayLavender}
              />

              {/* Provider */}
              <Text style={styles.modalLabel}>Provider / Professional</Text>
              <TextInput
                style={styles.modalInput}
                value={form.provider}
                onChangeText={(v) => setForm({ ...form, provider: v })}
                placeholder="Example: Dr. Kim, Ms. Rivera"
                placeholderTextColor={Colors.grayLavender}
              />

              {/* Date */}
              <Text style={styles.modalLabel}>Date</Text>
              <TextInput
                style={styles.modalInput}
                value={form.date}
                onChangeText={(v) => setForm({ ...form, date: v })}
                placeholder="Example: May 28, 2026"
                placeholderTextColor={Colors.grayLavender}
              />

              {/* Time */}
              <Text style={styles.modalLabel}>Time</Text>
              <TouchableOpacity
                style={styles.timePickerRow}
                onPress={() => setShowTimePicker(!showTimePicker)}
                activeOpacity={0.85}
              >
                <Text style={styles.timePickerValue}>{form.hour}:{form.minute} {form.period}</Text>
                <Feather name="clock" size={16} color={Colors.purple} />
              </TouchableOpacity>
              {showTimePicker && (
                <View style={styles.timePickerWrap}>
                  <TimePicker
                    hour={form.hour} minute={form.minute} period={form.period}
                    onHour={(h) => setForm({ ...form, hour: h })}
                    onMinute={(m) => setForm({ ...form, minute: m })}
                    onPeriod={(p) => setForm({ ...form, period: p })}
                  />
                </View>
              )}

              {/* Location */}
              <Text style={styles.modalLabel}>Location</Text>
              <TextInput
                style={styles.modalInput}
                value={form.location}
                onChangeText={(v) => setForm({ ...form, location: v })}
                placeholder="Example: 123 Main St or Telehealth"
                placeholderTextColor={Colors.grayLavender}
              />

              {/* Notes */}
              <Text style={styles.modalLabel}>Notes / Questions to ask</Text>
              <TextInput
                style={styles.modalTextArea}
                value={form.notes}
                onChangeText={(v) => setForm({ ...form, notes: v })}
                placeholder="Example: Ask about sensory diet update, bring insurance card..."
                placeholderTextColor={Colors.grayLavender}
                multiline
                textAlignVertical="top"
              />

              {/* Follow-up */}
              <Text style={styles.modalLabel}>Follow-up reminder</Text>
              <TextInput
                style={styles.modalInput}
                value={form.followUp}
                onChangeText={(v) => setForm({ ...form, followUp: v })}
                placeholder="Example: Schedule next session within 2 weeks"
                placeholderTextColor={Colors.grayLavender}
              />

              {/* Save */}
              <PrimaryButton
                label={form.id ? "Update Appointment" : "Save Appointment"}
                onPress={saveForm}
                disabled={!form.title.trim()}
                style={styles.modalSave}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  headerBg: { backgroundColor: "transparent" },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
    gap: Spacing.sm,
  },

  headerAddBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
  },

  // Status banner
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  statusText: { ...Type.caption, color: Colors.purple, fontFamily: Fonts.bold },

  // Hero
  heroCard: { flexDirection: "row", alignItems: "center" },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  heroTextWrap: { flex: 1 },
  heroTitle: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 3 },
  heroText: { ...Type.caption, color: Colors.textSecondary, lineHeight: 16 },

  // Stats
  statsRow: { flexDirection: "row", gap: Spacing.sm },
  statCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.card,
  },
  statNumber: { ...Type.heading, color: Colors.textPrimary, marginBottom: 2 },
  statLabel: { ...Type.caption, color: Colors.textMuted },

  // Section overlines
  overline: {
    ...Type.overline,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginBottom: 2,
    marginLeft: 4,
  },

  // Filter tabs
  filterRow: { flexDirection: "row", gap: Spacing.sm },
  filterTab: {
    flex: 1,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },
  filterTabActive: { backgroundColor: Colors.lavenderSurface },
  filterTabText: { ...Type.caption, color: Colors.textMuted, fontFamily: Fonts.bold },
  filterTabTextActive: { color: Colors.purple },

  // Type legend
  legendScroll: {},
  legendRow: { flexDirection: "row", gap: 7, paddingRight: Spacing.lg },
  legendChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    gap: 5,
  },
  legendText: { ...Type.caption, fontFamily: Fonts.bold },

  // Empty state
  emptyCard: { alignItems: "center", paddingVertical: Spacing.xxl },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 6 },
  emptyText: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  emptyBtn: { alignSelf: "stretch" },

  // Appointment cards
  apptCard: { position: "relative" },
  apptCardPast: { opacity: 0.65 },
  apptTop: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
  apptTypeBubble: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  apptTitleWrap: { flex: 1 },
  apptTitle: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 2 },
  apptTitlePast: { color: Colors.textMuted },
  apptType: { ...Type.caption, fontFamily: Fonts.bold },
  apptActions: { flexDirection: "row", gap: Spacing.sm },
  apptActionBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  apptDeleteBtn: { backgroundColor: "#FFE7E1" },
  apptMeta: { gap: 5, marginBottom: Spacing.sm },
  apptMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  apptMetaText: { ...Type.caption, color: Colors.textSecondary },
  apptNotes: {
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: 6,
  },
  apptNotesLabel: { ...Type.overline, color: Colors.purple, marginBottom: 3 },
  apptNotesText: { ...Type.bodySmall, color: Colors.textPrimary },
  apptFollowUp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF8EC",
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  apptFollowUpText: { ...Type.caption, color: Colors.mutedGold, fontFamily: Fonts.bold, flex: 1 },
  pastBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.divider,
    borderRadius: Radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  pastBadgeText: { ...Type.caption, color: Colors.textMuted, fontFamily: Fonts.bold },

  // Bottom add button
  addButton: { marginTop: Spacing.xs },

  // Footer
  footerText: { ...Type.caption, color: Colors.textMuted, textAlign: "center" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: "92%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    ...Shadows.raised,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  modalTitle: { ...Type.heading, color: Colors.textPrimary },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalLabel: {
    fontFamily: Fonts.extrabold,
    fontSize: 11.5,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  modalInput: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.lavenderSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lavenderBorder,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  modalTextArea: {
    minHeight: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.lavenderSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lavenderBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.xs,
  },
  timePickerRow: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.lavenderSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lavenderBorder,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  timePickerValue: { ...Type.cardTitle, color: Colors.textPrimary },
  timePickerWrap: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.divider,
    marginBottom: Spacing.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: 6,
    borderWidth: 1,
    borderColor: "transparent",
    position: "relative",
  },
  typeChipActive: { borderColor: Colors.purple, borderWidth: 1.5 },
  typeChipText: { ...Type.caption, fontFamily: Fonts.bold },
  typeChipCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -4,
    right: -4,
  },
  modalSave: { marginTop: Spacing.md },
});
