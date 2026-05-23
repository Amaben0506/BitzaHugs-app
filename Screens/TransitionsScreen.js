import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const PRESET_TIMES = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
];

const DEFAULT_TIME = 300;

const defaultSteps = [
  { id: 1, icon: "bag-outline", title: "Get Backpack", done: false },
  { id: 2, icon: "footsteps-outline", title: "Put on Shoes", done: false },
  { id: 3, icon: "shirt-outline", title: "Put on Jacket", done: false },
  { id: 4, icon: "exit-outline", title: "Head Out the Door", done: false },
];

const IS_PREMIUM = false;

export default function TransitionsScreen({ navigation }) {
  const [selectedTime, setSelectedTime] = useState(DEFAULT_TIME);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(defaultSteps);

  const [routineActivities, setRoutineActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [customActivity, setCustomActivity] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const nav = (screen, params) =>
    navigation.getParent()?.getParent()?.navigate(screen, params) ??
    navigation.navigate(screen, params);

  useFocusEffect(
    useCallback(() => {
      const loadRoutine = async () => {
        try {
          const saved = await AsyncStorage.getItem("bitzaRoutineItems");
          if (saved) {
            setRoutineActivities(JSON.parse(saved));
          }
        } catch (e) {
          console.log("Error loading routine:", e);
        }
      };
      loadRoutine();
    }, [])
  );

  useEffect(() => {
    if (!isRunning || secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const completedSteps = steps.filter((s) => s.done).length;

  const radius = 72;
  const strokeWidth = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - secondsLeft / selectedTime);

  const toggleStep = (id) =>
    setSteps(steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));

  const handlePresetSelect = (presetSeconds) => {
    setSelectedTime(presetSeconds);
    setSecondsLeft(presetSeconds);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setSecondsLeft(selectedTime);
    setIsRunning(false);
    setSteps(defaultSteps.map((s) => ({ ...s, done: false })));
  };

  const handleSelectActivity = (activity) => {
    setSelectedActivity({ title: activity.title, time: activity.time });
    setShowCustomInput(false);
    setCustomActivity("");
    setShowActivityPicker(false);
    resetTimer();
  };

  const handleCustomConfirm = () => {
    if (customActivity.trim()) {
      setSelectedActivity({ title: customActivity.trim(), time: "" });
      setShowActivityPicker(false);
      setShowCustomInput(false);
      setCustomActivity("");
      resetTimer();
    }
  };

  const activityTitle = selectedActivity?.title || "Leaving for School";
  const activityTime = selectedActivity?.time || "";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transition Timer</Text>
          <View style={styles.circleButton}>
            <Ionicons name="hourglass-outline" size={20} color="#2B2463" />
          </View>
        </View>

        {/* Note Card */}
        <View style={styles.noteCard}>
          <View style={styles.noteIconCircle}>
            <Ionicons name="heart-outline" size={20} color="#6F42D8" />
          </View>
          <View style={styles.noteTextWrap}>
            <Text style={styles.noteTitle}>Transitions can be hard.</Text>
            <Text style={styles.noteText}>This timer can help us prepare together.</Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>

          {/* Activity Picker Row */}
          <TouchableOpacity
            style={styles.activityRow}
            onPress={() => setShowActivityPicker(true)}
            activeOpacity={0.8}
          >
            <View style={styles.activityIconBox}>
              <Ionicons name="swap-horizontal-outline" size={24} color="#6F42D8" />
            </View>
            <View style={styles.activityTextWrap}>
              <Text style={styles.sectionLabel}>Transitioning to:</Text>
              <Text style={styles.activityTitle}>{activityTitle}</Text>
              {activityTime ? <Text style={styles.activityTime}>{activityTime}</Text> : null}
            </View>
            <View style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>Change</Text>
            </View>
          </TouchableOpacity>

          {/* Timer Circle */}
          <View style={styles.timerBox}>
            <View style={styles.timerCircle}>
              <Svg width={180} height={180} style={styles.svg}>
                <Circle cx="90" cy="90" r={radius} stroke="#EFE6FF" strokeWidth={strokeWidth} fill="none" />
                <Circle
                  cx="90" cy="90" r={radius}
                  stroke="#7548D8" strokeWidth={strokeWidth} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90" origin="90, 90"
                />
              </Svg>
              <View style={styles.timerContent}>
                <Text style={styles.timerText}>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</Text>
                <Text style={styles.timerLabel}>remaining</Text>
              </View>
            </View>

            {/* Preset Time Buttons */}
            <View style={styles.presetRow}>
              {PRESET_TIMES.map((preset) => (
                <TouchableOpacity
                  key={preset.seconds}
                  style={[styles.presetChip, selectedTime === preset.seconds && styles.presetChipActive]}
                  onPress={() => handlePresetSelect(preset.seconds)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetLabel, selectedTime === preset.seconds && styles.presetLabelActive]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timerButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setIsRunning(!isRunning)} activeOpacity={0.88}>
                <Ionicons name={isRunning ? "pause" : "play"} size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{isRunning ? "Pause" : "Start Timer"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetButton} onPress={resetTimer} activeOpacity={0.85}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Steps */}
          <View style={styles.stepsBox}>
            <View style={styles.stepsHeader}>
              <Text style={styles.sectionLabel}>Transition steps</Text>
              <Text style={styles.stepsDone}>{completedSteps}/{steps.length} done</Text>
            </View>
            {steps.map((step) => (
              <TouchableOpacity
                key={step.id}
                style={[styles.stepRow, step.done && styles.stepRowDone]}
                onPress={() => toggleStep(step.id)}
                activeOpacity={0.85}
              >
                <Ionicons name={step.icon} size={20} color={step.done ? "#8B5BE8" : "#837E96"} />
                <Text style={[styles.stepText, step.done && styles.stepTextDone]}>{step.title}</Text>
                <Ionicons
                  name={step.done ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={step.done ? "#8B5BE8" : "#C9C2BE"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder Card */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderIconCircle}>
            <Ionicons name="time-outline" size={20} color="#D86A5B" />
          </View>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderTitle}>First reminder in 2:00</Text>
            <Text style={styles.reminderText}>We'll remind you when it's time to start getting ready.</Text>
          </View>
        </View>

        {/* Stay Calm Together */}
        <View style={styles.toolsCard}>
          <Text style={styles.toolsTitle}>Stay calm together</Text>
          <View style={styles.toolRow}>
            <TouchableOpacity style={styles.toolChip} onPress={() => nav("Breathing")} activeOpacity={0.8}>
              <Ionicons name="leaf-outline" size={20} color="#6F42D8" />
              <Text style={styles.toolLabel}>Breathing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolChip} onPress={() => nav("Sounds")} activeOpacity={0.8}>
              <Ionicons name="headset-outline" size={20} color="#6F42D8" />
              <Text style={styles.toolLabel}>Sounds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolChip}
              onPress={() => {
                if (!IS_PREMIUM) {
                  nav("PremiumUpgrade");
                } else {
                  nav("HugiChat");
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6F42D8" />
              <Text style={styles.toolLabel}>Talk to Hugi</Text>
              <View style={styles.premiumBadge}>
                <Ionicons name="sparkles" size={8} color="#7548D8" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolChip} onPress={() => nav("GroundingSteps")} activeOpacity={0.8}>
              <Ionicons name="hand-left-outline" size={20} color="#6F42D8" />
              <Text style={styles.toolLabel}>Grounding</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="star" size={26} color="#F6C96F" />
          <View style={styles.encouragementTextWrap}>
            <Text style={styles.encouragementTitle}>You're doing a great job preparing.</Text>
            <Text style={styles.encouragementText}>Small steps make big changes.</Text>
          </View>
        </View>

      </ScrollView>

      {/* Activity Picker Modal */}
      <Modal
        visible={showActivityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActivityPicker(false)}
      >
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.handle} />

            <View style={modal.header}>
              <Text style={modal.title}>Choose Activity</Text>
              <Text style={modal.subtitle}>Pick from your routine or enter a custom one.</Text>
              <TouchableOpacity style={modal.closeBtn} onPress={() => setShowActivityPicker(false)}>
                <Ionicons name="close" size={18} color="#2B2463" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modal.scroll} contentContainerStyle={modal.scrollContent} showsVerticalScrollIndicator={false}>

              {/* Routine Activities */}
              {routineActivities.length > 0 && (
                <>
                  <Text style={modal.sectionLabel}>FROM YOUR ROUTINE</Text>
                  {routineActivities.map((activity) => (
                    <TouchableOpacity
                      key={activity.id}
                      style={modal.activityRow}
                      onPress={() => handleSelectActivity(activity)}
                      activeOpacity={0.8}
                    >
                      <View style={modal.activityIconBox}>
                        <Ionicons name="time-outline" size={18} color="#6F42D8" />
                      </View>
                      <View style={modal.activityTextWrap}>
                        <Text style={modal.activityTitle}>{activity.title}</Text>
                        {activity.time ? <Text style={modal.activityTime}>{activity.time}</Text> : null}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#8E87A0" />
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Custom Activity */}
              <Text style={[modal.sectionLabel, { marginTop: 14 }]}>CUSTOM ACTIVITY</Text>

              {!showCustomInput ? (
                <TouchableOpacity
                  style={modal.customBtn}
                  onPress={() => setShowCustomInput(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#6F42D8" />
                  <Text style={modal.customBtnText}>Enter a custom activity</Text>
                </TouchableOpacity>
              ) : (
                <View style={modal.customInputWrap}>
                  <TextInput
                    style={modal.customInput}
                    placeholder="e.g. Leaving grandma's house"
                    placeholderTextColor="#8E87A0"
                    value={customActivity}
                    onChangeText={setCustomActivity}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[modal.confirmBtn, !customActivity.trim() && { opacity: 0.4 }]}
                    onPress={handleCustomConfirm}
                    disabled={!customActivity.trim()}
                    activeOpacity={0.8}
                  >
                    <Text style={modal.confirmBtnText}>Use This</Text>
                  </TouchableOpacity>
                </View>
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 16,
    paddingBottom: 100,
  },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  circleButton: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E3D2F8",
  },
  headerTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  noteCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    marginBottom: 10, gap: 10,
  },
  noteIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  noteTextWrap: { flex: 1 },
  noteTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  noteText: { color: "#5B5672", fontSize: 11, fontWeight: "600" },

  mainCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#EFE4DC",
    padding: 14, marginBottom: 10,
    shadowColor: "#B8A9D9", shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },

  activityRow: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16,
    backgroundColor: "#F6ECFF", borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: "#E3D2F8",
  },
  activityIconBox: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
  },
  activityTextWrap: { flex: 1 },
  sectionLabel: { color: "#837E96", fontSize: 11, fontWeight: "700", marginBottom: 2 },
  activityTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800" },
  activityTime: { color: "#6F42D8", fontSize: 11, fontWeight: "700", marginTop: 1 },
  changeBtn: {
    backgroundColor: "#7548D8", borderRadius: 9,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  changeBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },

  timerBox: { alignItems: "center", marginBottom: 16 },
  timerCircle: { width: 180, height: 180, justifyContent: "center", alignItems: "center" },
  svg: { position: "absolute" },
  timerContent: { position: "absolute", justifyContent: "center", alignItems: "center" },
  timerText: { color: "#2B2463", fontSize: 38, fontWeight: "800" },
  timerLabel: { color: "#837E96", fontSize: 12, fontWeight: "600", marginTop: 2 },

  presetRow: {
    flexDirection: "row", gap: 7, marginTop: 14, marginBottom: 4,
    flexWrap: "wrap", justifyContent: "center",
  },
  presetChip: {
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#F0E2FF", borderWidth: 1.5, borderColor: "#E3D2F8",
  },
  presetChipActive: { backgroundColor: "#7548D8", borderColor: "#7548D8" },
  presetLabel: { color: "#7548D8", fontSize: 12, fontWeight: "700" },
  presetLabelActive: { color: "#FFFFFF" },

  timerButtons: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12 },
  primaryButton: {
    height: 44, paddingHorizontal: 22, borderRadius: 14, backgroundColor: "#7548D8",
    flexDirection: "row", alignItems: "center", gap: 7,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  resetButton: { height: 44, justifyContent: "center" },
  resetButtonText: { color: "#7548D8", fontSize: 14, fontWeight: "700" },

  stepsBox: { borderTopWidth: 1, borderTopColor: "#F0E8E2", paddingTop: 12 },
  stepsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  stepsDone: { color: "#6F42D8", fontSize: 12, fontWeight: "700" },
  stepRow: {
    backgroundColor: "#FFFDF9", padding: 11, borderRadius: 13, marginBottom: 7,
    flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#EFE4DC",
  },
  stepRowDone: { backgroundColor: "#F6ECFF", borderColor: "#E3D2F8" },
  stepText: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "700" },
  stepTextDone: { color: "#8B5BE8", textDecorationLine: "line-through" },

  reminderCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    gap: 11, marginBottom: 10,
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  reminderIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFE5DE", justifyContent: "center", alignItems: "center" },
  reminderTextWrap: { flex: 1 },
  reminderTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  reminderText: { color: "#5B5672", fontSize: 11, lineHeight: 15, fontWeight: "600" },

  toolsCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC",
    padding: 12, marginBottom: 10,
  },
  toolsTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 10 },
  toolRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  toolChip: {
    width: "47%", backgroundColor: "#F6ECFF", padding: 10, borderRadius: 13,
    alignItems: "center", gap: 4,
  },
  toolLabel: { color: "#2B2463", fontSize: 11, fontWeight: "700", textAlign: "center" },
  premiumBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#EFE1FF", borderRadius: 7,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: "#D8C3F7",
  },
  premiumText: { color: "#7548D8", fontSize: 9, fontWeight: "900" },

  encouragementCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8",
    padding: 12, flexDirection: "row", alignItems: "center", gap: 11,
  },
  encouragementTextWrap: { flex: 1 },
  encouragementTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  encouragementText: { color: "#5B5672", fontSize: 11, fontWeight: "600" },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#FFFDF9", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: "75%", paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD6F0",
    alignSelf: "center", marginTop: 10, marginBottom: 4,
  },
  header: { paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFE4DC" },
  title: { color: "#2B2463", fontSize: 18, fontWeight: "800", marginBottom: 3 },
  subtitle: { color: "#837E96", fontSize: 12, fontWeight: "600" },
  closeBtn: {
    position: "absolute", top: 12, right: 16, width: 30, height: 30,
    borderRadius: 9, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  sectionLabel: {
    color: "#8E87A0", fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8,
  },
  activityRow: {
    flexDirection: "row", alignItems: "center", gap: 11, padding: 11,
    backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1,
    borderColor: "#EFE4DC", marginBottom: 8,
  },
  activityIconBox: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: "#F0E2FF",
    alignItems: "center", justifyContent: "center",
  },
  activityTextWrap: { flex: 1 },
  activityTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800" },
  activityTime: { color: "#6F42D8", fontSize: 11, fontWeight: "700", marginTop: 1 },
  customBtn: {
    flexDirection: "row", alignItems: "center", gap: 9, padding: 13,
    backgroundColor: "#F6ECFF", borderRadius: 14, borderWidth: 1.5,
    borderColor: "#E3D2F8", borderStyle: "dashed",
  },
  customBtnText: { color: "#6F42D8", fontSize: 13, fontWeight: "700" },
  customInputWrap: { gap: 8 },
  customInput: {
    backgroundColor: "#FFFFFF", borderRadius: 13, borderWidth: 1.5,
    borderColor: "#7548D8", paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: "#2B2463", fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: "#7548D8", borderRadius: 13, paddingVertical: 12,
    alignItems: "center",
  },
  confirmBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});