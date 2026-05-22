import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

const START_TIME = 300;

const startingSteps = [
  { id: 1, icon: "bag-outline", title: "Get Backpack", done: true },
  { id: 2, icon: "footsteps-outline", title: "Put on Shoes", done: true },
  { id: 3, icon: "shirt-outline", title: "Put on Jacket", done: false },
  { id: 4, icon: "exit-outline", title: "Head Out the Door", done: false },
];

export default function TransitionsScreen({ navigation }) {
  const [secondsLeft, setSecondsLeft] = useState(START_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(startingSteps);

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
  const strokeDashoffset = circumference * (1 - secondsLeft / START_TIME);

  const toggleStep = (id) =>
    setSteps(steps.map((s) => s.id === id ? { ...s, done: !s.done } : s));

  const resetTimer = () => {
    setSecondsLeft(START_TIME);
    setIsRunning(false);
    setSteps(startingSteps);
  };

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

        {/* Activity + Timer Card */}
        <View style={styles.mainCard}>
          {/* Activity */}
          <View style={styles.activityRow}>
            <View style={styles.activityIconBox}>
              <Ionicons name="school-outline" size={28} color="#6F42D8" />
            </View>
            <View style={styles.activityTextWrap}>
              <Text style={styles.sectionLabel}>Transitioning to:</Text>
              <Text style={styles.activityTitle}>Leaving for School</Text>
              <Text style={styles.activityText}>Get backpack, shoes, and head out the door.</Text>
            </View>
          </View>

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

        {/* Calm Tools */}
        <View style={styles.toolsCard}>
          <Text style={styles.toolsTitle}>Stay calm together</Text>
          <View style={styles.toolRow}>
            {[
              { icon: "leaf-outline", label: "Breathing" },
              { icon: "headset-outline", label: "Sounds" },
              { icon: "chatbubble-ellipses-outline", label: "Talk to Hugi" },
              { icon: "hand-left-outline", label: "Grounding" },
            ].map((tool) => (
              <View key={tool.label} style={styles.toolChip}>
                <Ionicons name={tool.icon} size={20} color="#6F42D8" />
                <Text style={styles.toolLabel}>{tool.label}</Text>
              </View>
            ))}
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

  activityRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  activityIconBox: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: "#F0E2FF",
    justifyContent: "center", alignItems: "center",
  },
  activityTextWrap: { flex: 1 },
  sectionLabel: { color: "#837E96", fontSize: 11, fontWeight: "700", marginBottom: 2 },
  activityTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 2 },
  activityText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  timerBox: { alignItems: "center", marginBottom: 16 },
  timerCircle: { width: 180, height: 180, justifyContent: "center", alignItems: "center" },
  svg: { position: "absolute" },
  timerContent: { position: "absolute", justifyContent: "center", alignItems: "center" },
  timerText: { color: "#2B2463", fontSize: 38, fontWeight: "800" },
  timerLabel: { color: "#837E96", fontSize: 12, fontWeight: "600", marginTop: 2 },

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
    alignItems: "center", gap: 5,
  },
  toolLabel: { color: "#2B2463", fontSize: 11, fontWeight: "700" },

  encouragementCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8",
    padding: 12, flexDirection: "row", alignItems: "center", gap: 11,
  },
  encouragementTextWrap: { flex: 1 },
  encouragementTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  encouragementText: { color: "#5B5672", fontSize: 11, fontWeight: "600" },
});
