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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

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
  item: { height: 40, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  itemActive: { backgroundColor: "#EFE1FF" },
  itemText: { fontSize: 20, fontWeight: "600", color: "#837E96" },
  itemTextActive: { fontSize: 22, fontWeight: "800", color: "#2B2463" },
  colon: { fontSize: 24, fontWeight: "800", color: "#2B2463", marginHorizontal: 6 },
  ampmCol: { marginLeft: 10, gap: 8 },
  ampmItem: { width: 52, height: 40, borderRadius: 10, backgroundColor: "#F5F0FF", borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center" },
  ampmActive: { backgroundColor: "#EFE1FF", borderColor: "#8B5BE8", borderWidth: 2 },
  ampmText: { fontSize: 14, fontWeight: "700", color: "#837E96" },
  ampmTextActive: { color: "#2B2463", fontWeight: "800" },
});

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <Feather name="calendar" size={36} color="#6F42D8" />
      </View>
      <Text style={styles.emptyTitle}>No appointments yet</Text>
      <Text style={styles.emptyText}>Add therapy sessions, doctor visits, school meetings, evaluations, and more.</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAdd} activeOpacity={0.9}>
        <Feather name="plus" size={16} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Add First Appointment</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Appointment Card ─────────────────────────────────────────────────────────
function AppointmentCard({ appt, onDelete, onEdit, isPast }) {
  const type = APPOINTMENT_TYPES.find((t) => t.label === appt.type) || APPOINTMENT_TYPES[4];
  return (
    <View style={[styles.apptCard, isPast && styles.apptCardPast]}>
      <View style={styles.apptTop}>
        <View style={[styles.apptTypeBubble, { backgroundColor: type.bg }]}>
          <Feather name={type.icon} size={18} color={type.color} />
        </View>
        <View style={styles.apptTitleWrap}>
          <Text style={[styles.apptTitle, isPast && styles.apptTitlePast]}>{appt.title}</Text>
          <Text style={[styles.apptType, { color: type.color }]}>{appt.type}</Text>
        </View>
        <View style={styles.apptActions}>
          <TouchableOpacity style={styles.apptActionBtn} onPress={() => onEdit(appt)} activeOpacity={0.85}>
            <Feather name="edit-2" size={14} color="#6F42D8" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.apptActionBtn, styles.apptDeleteBtn]} onPress={() => onDelete(appt.id)} activeOpacity={0.85}>
            <Feather name="trash-2" size={14} color="#D86A5B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.apptMeta}>
        {appt.date ? (
          <View style={styles.apptMetaRow}>
            <Feather name="calendar" size={13} color="#837E96" />
            <Text style={styles.apptMetaText}>{appt.date}</Text>
          </View>
        ) : null}
        {appt.time ? (
          <View style={styles.apptMetaRow}>
            <Feather name="clock" size={13} color="#837E96" />
            <Text style={styles.apptMetaText}>{appt.time}</Text>
          </View>
        ) : null}
        {appt.provider ? (
          <View style={styles.apptMetaRow}>
            <Feather name="user" size={13} color="#837E96" />
            <Text style={styles.apptMetaText}>{appt.provider}</Text>
          </View>
        ) : null}
        {appt.location ? (
          <View style={styles.apptMetaRow}>
            <Feather name="map-pin" size={13} color="#837E96" />
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
          <Feather name="bell" size={12} color="#D99A3D" />
          <Text style={styles.apptFollowUpText}>{appt.followUp}</Text>
        </View>
      ) : null}

      {isPast && (
        <View style={styles.pastBadge}>
          <Text style={styles.pastBadgeText}>Past</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const BLANK = { id: null, title: "", type: "Therapy", provider: "", location: "", date: "", hour: "09", minute: "00", period: "AM", time: "", notes: "", followUp: "" };

export default function AppointmentTrackerScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [filter, setFilter] = useState("upcoming"); // "upcoming" | "past" | "all"
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

  const openAdd = () => { setForm(BLANK); setShowModal(true); };

  const openEdit = (appt) => {
    const [time, period] = appt.time ? appt.time.split(" ") : ["09:00", "AM"];
    const [hour, minute] = time ? time.split(":") : ["09", "00"];
    setForm({ ...appt, hour: hour || "09", minute: minute || "00", period: period || "AM" });
    setShowModal(true);
  };

  const deleteAppt = async (id) => {
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

  // Simple past detection: if date string contains a year before current
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointments</Text>
          <TouchableOpacity style={[styles.circleButton, styles.addCircle]} onPress={openAdd} activeOpacity={0.85}>
            <Feather name="plus" size={20} color="#6F42D8" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Feather name="calendar" size={28} color="#6F42D8" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Track every appointment.</Text>
            <Text style={styles.heroText}>Therapy, doctors, school meetings, evaluations — all in one calm place.</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#F0E2FF" }]}>
            <Text style={styles.statNumber}>{upcoming.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#EEF7E8" }]}>
            <Text style={styles.statNumber}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFE6E4" }]}>
            <Text style={styles.statNumber}>{past.length}</Text>
            <Text style={styles.statLabel}>Past</Text>
          </View>
        </View>

        {/* Status Banner */}
        {savedMessage ? (
          <View style={styles.statusBanner}>
            <Feather name="check-circle" size={16} color="#6F42D8" />
            <Text style={styles.statusText}>{savedMessage}</Text>
          </View>
        ) : null}

        {/* Filter Tabs */}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendScroll} contentContainerStyle={styles.legendRow}>
          {APPOINTMENT_TYPES.map((t) => (
            <View key={t.label} style={[styles.legendChip, { backgroundColor: t.bg }]}>
              <Feather name={t.icon} size={12} color={t.color} />
              <Text style={[styles.legendText, { color: t.color }]}>{t.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* List */}
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

        {/* Add Button */}
        {filtered.length > 0 && (
          <TouchableOpacity style={styles.addButton} onPress={openAdd} activeOpacity={0.9}>
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Appointment</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>Your family's schedule, all in one calm place.</Text>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{form.id ? "Edit Appointment" : "New Appointment"}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalClose}>
                <Feather name="x" size={20} color="#2B2463" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>

              {/* Type Picker */}
              <Text style={styles.modalLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
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
              <TextInput style={styles.modalInput} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Example: Speech Therapy with Dr. Kim" placeholderTextColor="#A8A0A5" />

              {/* Provider */}
              <Text style={styles.modalLabel}>Provider / Professional</Text>
              <TextInput style={styles.modalInput} value={form.provider} onChangeText={(v) => setForm({ ...form, provider: v })} placeholder="Example: Dr. Kim, Ms. Rivera" placeholderTextColor="#A8A0A5" />

              {/* Date */}
              <Text style={styles.modalLabel}>Date</Text>
              <TextInput style={styles.modalInput} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="Example: May 28, 2026" placeholderTextColor="#A8A0A5" />

              {/* Time */}
              <Text style={styles.modalLabel}>Time</Text>
              <TouchableOpacity style={styles.timePickerRow} onPress={() => setShowTimePicker(!showTimePicker)} activeOpacity={0.85}>
                <Text style={styles.timePickerValue}>{form.hour}:{form.minute} {form.period}</Text>
                <Feather name="clock" size={16} color="#6F42D8" />
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
              <TextInput style={styles.modalInput} value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} placeholder="Example: 123 Main St or Telehealth" placeholderTextColor="#A8A0A5" />

              {/* Notes */}
              <Text style={styles.modalLabel}>Notes / Questions to ask</Text>
              <TextInput style={styles.modalTextArea} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Example: Ask about sensory diet update, bring insurance card..." placeholderTextColor="#A8A0A5" multiline textAlignVertical="top" />

              {/* Follow-up */}
              <Text style={styles.modalLabel}>Follow-up reminder</Text>
              <TextInput style={styles.modalInput} value={form.followUp} onChangeText={(v) => setForm({ ...form, followUp: v })} placeholder="Example: Schedule next session within 2 weeks" placeholderTextColor="#A8A0A5" />

              {/* Save */}
              <TouchableOpacity
                style={[styles.modalSave, !form.title.trim() && styles.modalSaveDisabled]}
                onPress={saveForm}
                activeOpacity={0.9}
              >
                <Text style={styles.modalSaveText}>{form.id ? "Update Appointment" : "Save Appointment"}</Text>
                <Feather name="check" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  addCircle: { backgroundColor: "#EFE1FF" },
  headerTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  heroIconWrap: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 10, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.5)" },
  statNumber: { color: "#2B2463", fontSize: 20, fontWeight: "800", marginBottom: 2 },
  statLabel: { color: "#5B5672", fontSize: 10, fontWeight: "600" },

  statusBanner: { height: 38, borderRadius: 12, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, marginBottom: 10 },
  statusText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  filterTab: { flex: 1, height: 34, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EFE4DC", alignItems: "center", justifyContent: "center" },
  filterTabActive: { backgroundColor: "#F0E2FF", borderColor: "#8B5BE8" },
  filterTabText: { color: "#837E96", fontSize: 12, fontWeight: "700" },
  filterTabTextActive: { color: "#6F42D8", fontWeight: "800" },

  legendScroll: { marginBottom: 12 },
  legendRow: { flexDirection: "row", gap: 7, paddingRight: 16 },
  legendChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
  legendText: { fontSize: 11, fontWeight: "700" },

  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 24, alignItems: "center", shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: "#837E96", fontSize: 12, lineHeight: 17, textAlign: "center", fontWeight: "600", marginBottom: 16 },
  emptyButton: { height: 42, borderRadius: 13, backgroundColor: "#8B5BE8", paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 7 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  apptCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 13, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2, position: "relative" },
  apptCardPast: { opacity: 0.7, backgroundColor: "#FAFAFA" },
  apptTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  apptTypeBubble: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: 10 },
  apptTitleWrap: { flex: 1 },
  apptTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 2 },
  apptTitlePast: { color: "#837E96" },
  apptType: { fontSize: 11, fontWeight: "700" },
  apptActions: { flexDirection: "row", gap: 6 },
  apptActionBtn: { width: 28, height: 28, borderRadius: 9, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  apptDeleteBtn: { backgroundColor: "#FFE7E1" },
  apptMeta: { gap: 5, marginBottom: 8 },
  apptMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  apptMetaText: { color: "#5B5672", fontSize: 12, fontWeight: "600" },
  apptNotes: { backgroundColor: "#FFF9F2", borderRadius: 10, padding: 9, marginBottom: 6 },
  apptNotesLabel: { color: "#6F42D8", fontSize: 10, fontWeight: "800", marginBottom: 3 },
  apptNotesText: { color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  apptFollowUp: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFF0DF", borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6 },
  apptFollowUpText: { color: "#D99A3D", fontSize: 11, fontWeight: "700", flex: 1 },
  pastBadge: { position: "absolute", top: 10, right: 10, backgroundColor: "#E8E8E8", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  pastBadgeText: { color: "#837E96", fontSize: 10, fontWeight: "700" },

  addButton: { height: 48, borderRadius: 16, backgroundColor: "#8B5BE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  addButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFFDF9", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%", paddingBottom: Platform.OS === "ios" ? 34 : 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EFE4DC" },
  modalTitle: { color: "#2B2463", fontSize: 16, fontWeight: "800" },
  modalClose: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  modalContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 20 },
  modalLabel: { color: "#2B2463", fontSize: 12, fontWeight: "800", marginBottom: 6, marginTop: 4 },
  modalInput: { height: 42, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, color: "#2B2463", fontSize: 14, fontWeight: "600", marginBottom: 4 },
  modalTextArea: { minHeight: 80, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, paddingVertical: 10, color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "600", marginBottom: 4 },
  timePickerRow: { height: 42, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  timePickerValue: { color: "#2B2463", fontSize: 14, fontWeight: "700" },
  timePickerWrap: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#EFE4DC", marginBottom: 8 },
  typeChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, gap: 6, borderWidth: 1, borderColor: "transparent", position: "relative" },
  typeChipActive: { borderColor: "#8B5BE8", borderWidth: 1.5 },
  typeChipText: { fontSize: 12, fontWeight: "700" },
  typeChipCheck: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#8B5BE8", alignItems: "center", justifyContent: "center", position: "absolute", top: -4, right: -4 },
  modalSave: { height: 48, borderRadius: 15, backgroundColor: "#8B5BE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 },
  modalSaveDisabled: { backgroundColor: "#C9B8E8" },
  modalSaveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});