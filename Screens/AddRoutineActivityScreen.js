import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

// ─── Time Picker Data ─────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS = ["AM", "PM"];

// ─── Icon Options ─────────────────────────────────────────────────────────────
const iconOptions = [
  { label: "Morning", value: "routine-morning-sun.png", icon: require("../assets/icons/routine-morning-sun.png") },
  { label: "School", value: "routine-school-book.png", icon: require("../assets/icons/routine-school-book.png") },
  { label: "Lunch", value: "routine-lunch-meal.png", icon: require("../assets/icons/routine-lunch-meal.png") },
  { label: "Breakfast", value: "routine-breakfast-bowl.png", icon: require("../assets/icons/routine-breakfast-bowl.png") },
  { label: "Bedtime", value: "routine-bedtime-bed.png", icon: require("../assets/icons/routine-bedtime-bed.png") },
  { label: "Get Dressed", value: "routine-get-dressed-shirt.png", icon: require("../assets/icons/routine-get-dressed-shirt.png") },
  { label: "Head Out", value: "routine-head-out-door.png", icon: require("../assets/icons/routine-head-out-door.png") },
  { label: "Backpack", value: "routine-backpack.png", icon: require("../assets/icons/routine-backpack.png") },
  { label: "Break", value: "support-fidget-spinner.png", icon: require("../assets/icons/support-fidget-spinner.png") },
  { label: "Timer", value: "tool-transition-hourglass.png", icon: require("../assets/icons/tool-transition-hourglass.png") },
  { label: "Journal", value: "support-calm-journal.png", icon: require("../assets/icons/support-calm-journal.png") },
  { label: "Breathing", value: "support-breathing.png", icon: require("../assets/icons/support-breathing.png") },
  { label: "Water", value: "support-water-cup.png", icon: require("../assets/icons/support-water-cup.png") },
  { label: "Movement", value: "support-move-body-walk.png", icon: require("../assets/icons/support-move-body-walk.png") },
  { label: "Checklist", value: "tool-checklist-pencil.png", icon: require("../assets/icons/tool-checklist-pencil.png") },
  { label: "Quiet Time", value: "support-quiet-time-moon.png", icon: require("../assets/icons/support-quiet-time-moon.png") },
  { label: "Sounds", value: "tool-calming-sounds-headphones.png", icon: require("../assets/icons/tool-calming-sounds-headphones.png") },
  { label: "Weighted", value: "support-weighted-blanket.png", icon: require("../assets/icons/support-weighted-blanket.png") },
];

// ─── Scroll Picker Column ─────────────────────────────────────────────────────
function PickerColumn({ data, selected, onSelect }) {
  return (
    <View style={pickerStyles.column}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={44}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: 44 }}
      >
        {data.map((item) => (
          <TouchableOpacity
            key={item}
            style={[pickerStyles.item, selected === item && pickerStyles.itemSelected]}
            onPress={() => onSelect(item)}
            activeOpacity={0.8}
          >
            <Text style={[pickerStyles.itemText, selected === item && pickerStyles.itemTextSelected]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  column: { width: 72, height: 132, overflow: "hidden" },
  item: { height: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  itemSelected: { backgroundColor: "#EFE1FF" },
  itemText: { fontSize: 22, fontWeight: "600", color: "#837E96" },
  itemTextSelected: { fontSize: 24, fontWeight: "800", color: "#2B2463" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddRoutineActivityScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("tool-transition-hourglass.png");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hour, setHour] = useState("07");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const timeDisplay = `${hour}:${minute} ${period}`;

  const saveActivity = async () => {
    if (!title.trim()) return;

    const newActivity = {
      id: Date.now().toString(),
      title: title.trim(),
      time: timeDisplay,
      icon: selectedIcon,
      completed: false,
      category: "custom",
    };

    try {
      const saved = await AsyncStorage.getItem("bitzaRoutineItems");
      const parsed = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem("bitzaRoutineItems", JSON.stringify([...parsed, newActivity]));
      navigation.goBack();
    } catch (e) {
      console.log("Error saving:", e);
    }
  };

  const selectedIconData = iconOptions.find((i) => i.value === selectedIcon);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={24} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Add Activity</Text>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
            <Feather name="calendar" size={20} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require("../assets/icons/tool-checklist-pencil.png")} style={styles.heroIcon} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Add a gentle routine step.</Text>
            <Text style={styles.heroText}>Keep it simple. One clear step can help the day feel softer.</Text>
          </View>
        </View>

        {/* Activity Name */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Activity name</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Example: Brush teeth"
            placeholderTextColor="#A8A0A5"
          />
        </View>

        {/* Time Picker */}
        <TouchableOpacity style={styles.inputCard} activeOpacity={0.85} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.inputLabel}>Time</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeValue}>{timeDisplay}</Text>
            <Feather name="clock" size={18} color="#6F42D8" />
          </View>
        </TouchableOpacity>

        {/* Icon Picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose an icon</Text>
          <View style={styles.iconGrid}>
            {iconOptions.map((item) => {
              const isSelected = selectedIcon === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.iconCard, isSelected && styles.iconCardSelected]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedIcon(item.value)}
                >
                  <Image source={item.icon} style={styles.optionIcon} resizeMode="contain" />
                  <Text style={[styles.iconLabel, isSelected && styles.iconLabelSelected]}>{item.label}</Text>
                  {isSelected && (
                    <View style={styles.selectedCheck}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={styles.previewRow}>
            <Image
              source={selectedIconData?.icon || require("../assets/icons/tool-transition-hourglass.png")}
              style={styles.previewIcon}
              resizeMode="contain"
            />
            <View style={styles.previewTextWrap}>
              <Text style={styles.previewTitle}>{title.trim() || "Activity name"}</Text>
              <Text style={styles.previewTime}>{timeDisplay}</Text>
            </View>
            <View style={styles.emptyCheckCircle} />
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
          activeOpacity={0.9}
          onPress={saveActivity}
        >
          <Text style={styles.saveButtonText}>Save Activity</Text>
          <Feather name="check" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.footerText}>You can always edit this later. Routines are allowed to change.</Text>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set a time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.modalDone}>
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              {/* Hour */}
              <PickerColumn data={HOURS} selected={hour} onSelect={setHour} />
              <Text style={styles.pickerColon}>:</Text>
              {/* Minute */}
              <PickerColumn data={MINUTES} selected={minute} onSelect={setMinute} />
              {/* AM/PM */}
              <View style={styles.ampmColumn}>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.ampmItem, period === p && styles.ampmItemSelected]}
                    onPress={() => setPeriod(p)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.ampmText, period === p && styles.ampmTextSelected]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Highlight bar */}
            <View style={styles.pickerHighlight} pointerEvents="none" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 6 : 18,
    paddingBottom: 100,
  },

  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0E2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3D2F8",
  },
  topTitle: { color: "#2B2463", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },

  heroCard: {
    backgroundColor: "#F6ECFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E3D2F8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  heroIcon: { width: 56, height: 56, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 4 },
  heroText: { color: "#5B5672", fontSize: 12, lineHeight: 17, fontWeight: "600" },

  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  inputLabel: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 6 },
  input: { minHeight: 36, color: "#2B2463", fontSize: 15, fontWeight: "600" },

  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timeValue: { color: "#2B2463", fontSize: 15, fontWeight: "700" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 10 },

  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconCard: {
    width: "30%",
    minHeight: 88,
    borderRadius: 14,
    backgroundColor: "#FFF7F0",
    borderWidth: 1,
    borderColor: "#EFE4DC",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    position: "relative",
  },
  iconCardSelected: {
    backgroundColor: "#F0E2FF",
    borderColor: "#8B5BE8",
    borderWidth: 2,
  },
  optionIcon: { width: 38, height: 38, marginBottom: 5 },
  iconLabel: { color: "#2B2463", fontSize: 11, fontWeight: "700", textAlign: "center" },
  iconLabelSelected: { color: "#6F42D8" },
  selectedCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#8B5BE8",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 5,
    right: 5,
  },

  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  previewLabel: { color: "#837E96", fontSize: 12, fontWeight: "700", marginBottom: 8 },
  previewRow: { flexDirection: "row", alignItems: "center" },
  previewIcon: { width: 44, height: 44, borderRadius: 13, marginRight: 12 },
  previewTextWrap: { flex: 1 },
  previewTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 3 },
  previewTime: { color: "#6F42D8", fontSize: 13, fontWeight: "700" },
  emptyCheckCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#DED5D1",
    backgroundColor: "#FFFFFF",
  },

  saveButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#8B5BE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  saveButtonDisabled: { backgroundColor: "#C9B8E8" },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },

  footerText: {
    color: "#837E96",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFDF9",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    paddingTop: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE4DC",
  },
  modalTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },
  modalDone: {
    backgroundColor: "#8B5BE8",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modalDoneText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 4,
  },
  pickerColon: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2B2463",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  pickerHighlight: {
    position: "absolute",
    top: "50%",
    left: 40,
    right: 40,
    height: 44,
    marginTop: 30,
    backgroundColor: "#EFE1FF",
    borderRadius: 12,
    zIndex: -1,
  },
  ampmColumn: {
    marginLeft: 8,
    gap: 8,
  },
  ampmItem: {
    width: 56,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F0FF",
    borderWidth: 1,
    borderColor: "#E3D2F8",
  },
  ampmItemSelected: {
    backgroundColor: "#EFE1FF",
    borderColor: "#8B5BE8",
    borderWidth: 2,
  },
  ampmText: { fontSize: 16, fontWeight: "700", color: "#837E96" },
  ampmTextSelected: { color: "#2B2463", fontWeight: "800" },
});

