import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STEPS = [
  {
    id: "safety",
    step: 1,
    emoji: "🛡️",
    title: "Everyone is safe.",
    subtitle: "The hard moment is over. Take one slow breath.",
    color: "#4C9ED9",
    bg: "#E7F4FF",
    border: "#B8D9F5",
    affirmation: "You got through it. That took everything you had. And you're still here.",
    actions: [
      { id: "breath", label: "I took a breath", icon: "wind" },
      { id: "safe", label: "Everyone is physically safe", icon: "shield" },
      { id: "space", label: "We have a calm space", icon: "home" },
    ],
  },
  {
    id: "body",
    step: 2,
    emoji: "💧",
    title: "Reset your body.",
    subtitle: "Meltdowns are physically exhausting for everyone. Small things help.",
    color: "#78A866",
    bg: "#EEF7E8",
    border: "#B8DFA8",
    affirmation: "Your body just went through something hard. Be gentle with it.",
    actions: [
      { id: "water", label: "Offered water or a snack", icon: "droplet" },
      { id: "movement", label: "Gentle movement or stretch", icon: "activity" },
      { id: "sensory", label: "Comfort item or soft blanket", icon: "heart" },
    ],
  },
  {
    id: "connection",
    step: 3,
    emoji: "🤝",
    title: "Reconnect gently.",
    subtitle: "No words needed yet. Just presence. You don't have to fix anything.",
    color: "#D99A3D",
    bg: "#FFF0DF",
    border: "#FFD9A0",
    affirmation: "Connection doesn't require words. Sitting nearby is enough right now.",
    actions: [
      { id: "nearby", label: "I'm sitting nearby", icon: "user" },
      { id: "calm", label: "My voice is soft and calm", icon: "volume-1" },
      { id: "demands", label: "All demands are off for now", icon: "x-circle" },
    ],
  },
  {
    id: "repair",
    step: 4,
    emoji: "🌱",
    title: "Gentle repair.",
    subtitle: "When everyone is ready — not now, maybe later. No rush.",
    color: "#6F42D8",
    bg: "#F0E2FF",
    border: "#D4B8F5",
    affirmation: "Repair doesn't mean fixing everything. It just means showing up again. You already are.",
    actions: [
      { id: "present", label: "I'm present, not perfect", icon: "heart" },
      { id: "later", label: "We can talk when ready", icon: "clock" },
      { id: "love", label: "My child knows I love them", icon: "sun" },
    ],
  },
];

const CLOSING_MESSAGES = [
  "You showed up. Even when it was hard. That is what love looks like.",
  "Hard moments don't erase all the good. You are still a good caregiver.",
  "Getting through this together is its own kind of healing.",
  "Recovery isn't linear. Neither is parenting. You're doing both.",
];

export default function RecoveryRoutineScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedActions, setCheckedActions] = useState({});
  const [done, setDone] = useState(false);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const closingMessage = CLOSING_MESSAGES[Math.floor(Math.random() * CLOSING_MESSAGES.length)];

  const toggleAction = (actionId) => {
    setCheckedActions(prev => ({
      ...prev,
      [`${step.id}-${actionId}`]: !prev[`${step.id}-${actionId}`],
    }));
  };

  const isChecked = (actionId) => !!checkedActions[`${step.id}-${actionId}`];

  const handleNext = () => {
    if (isLastStep) {
      setDone(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const go = (screen) =>
    navigation.getParent()?.navigate(screen) ??
    navigation.navigate(screen);

  if (done) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="x" size={20} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recovery Routine</Text>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView contentContainerStyle={styles.doneContent} showsVerticalScrollIndicator={false}>
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>💜</Text>
            <Text style={styles.doneTitle}>You made it through.</Text>
            <Text style={styles.doneMessage}>{closingMessage}</Text>
          </View>

          <View style={styles.doneStepsRow}>
            {STEPS.map((s, i) => (
              <View key={s.id} style={[styles.doneStepDot, { backgroundColor: s.color }]}>
                <Text style={styles.doneStepEmoji}>{s.emoji}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.doneSubtext}>
            All 4 steps complete. That took courage.
          </Text>

          <View style={styles.doneTools}>
            <Text style={styles.doneToolsTitle}>When you're ready:</Text>

            <TouchableOpacity style={styles.doneToolRow} onPress={() => go("CalmJournal")} activeOpacity={0.85}>
              <View style={[styles.doneToolIcon, { backgroundColor: "#EEF7E8" }]}>
                <Feather name="edit-3" size={18} color="#78A866" />
              </View>
              <Text style={styles.doneToolText}>Write about this moment</Text>
              <Feather name="chevron-right" size={16} color="#2B2463" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneToolRow} onPress={() => go("Affirmations")} activeOpacity={0.85}>
              <View style={[styles.doneToolIcon, { backgroundColor: "#FFF0DF" }]}>
                <Feather name="star" size={18} color="#D99A3D" />
              </View>
              <Text style={styles.doneToolText}>Read an affirmation</Text>
              <Feather name="chevron-right" size={16} color="#2B2463" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneToolRow} onPress={() => go("Breathing")} activeOpacity={0.85}>
              <View style={[styles.doneToolIcon, { backgroundColor: "#E7F4FF" }]}>
                <Feather name="wind" size={18} color="#4C9ED9" />
              </View>
              <Text style={styles.doneToolText}>One more breathing reset</Text>
              <Feather name="chevron-right" size={16} color="#2B2463" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.doneHomeBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.88}
          >
            <Text style={styles.doneHomeBtnText}>I'm okay for now 💜</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="chevron-left" size={22} color="#2B2463" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recovery Routine</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="x" size={20} color="#2B2463" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Intro card */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🌿</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>The hard part is over.</Text>
            <Text style={styles.introSub}>Let's come back together, one gentle step at a time.</Text>
          </View>
        </View>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View
              key={s.id}
              style={[
                styles.progressDot,
                i === currentStep && [styles.progressDotActive, { backgroundColor: step.color }],
                i < currentStep && styles.progressDotDone,
              ]}
            />
          ))}
        </View>

        {/* Step Card */}
        <View style={[styles.stepCard, { borderColor: step.border }]}>
          {/* Step emoji and badge */}
          <View style={[styles.stepEmojiWrap, { backgroundColor: step.bg }]}>
            <Text style={styles.stepEmoji}>{step.emoji}</Text>
          </View>
          <View style={[styles.stepBadge, { backgroundColor: step.color }]}>
            <Text style={styles.stepBadgeText}>Step {step.step} of {STEPS.length}</Text>
          </View>

          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

          {/* Affirmation */}
          <View style={[styles.affirmationCard, { backgroundColor: step.bg, borderColor: step.border }]}>
            <Ionicons name="heart-outline" size={14} color={step.color} />
            <Text style={[styles.affirmationText, { color: step.color }]}>{step.affirmation}</Text>
          </View>

          {/* Actions checklist */}
          <Text style={styles.actionsLabel}>When you're ready, check off what feels true:</Text>
          {step.actions.map((action) => {
            const checked = isChecked(action.id);
            return (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionRow,
                  checked && { backgroundColor: step.bg, borderColor: step.border },
                ]}
                onPress={() => toggleAction(action.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.actionCheck,
                  checked && { backgroundColor: step.color, borderColor: step.color },
                ]}>
                  {checked && <Feather name="check" size={12} color="#FFFFFF" />}
                </View>
                <View style={[styles.actionIconWrap, { backgroundColor: checked ? step.bg : "#F5F5F5" }]}>
                  <Feather name={action.icon} size={16} color={checked ? step.color : "#837E96"} />
                </View>
                <Text style={[styles.actionText, checked && { color: step.color }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Feather name="info" size={13} color="#837E96" />
          <Text style={styles.noteText}>
            None of these steps are required. Check what feels true, skip what doesn't. There's no wrong way to recover.
          </Text>
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: step.color }]}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.nextBtnText}>
            {isLastStep ? "Complete recovery routine 💜" : `Next step →`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          If there is immediate danger, contact emergency services.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingTop: Platform.OS === "ios" ? 4 : 12,
    paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#EFE4DC",
    backgroundColor: "#FFFFFF",
  },
  headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },

  introCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC", padding: 14, marginBottom: 14 },
  introEmoji: { fontSize: 28 },
  introTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 3 },
  introSub: { color: "#837E96", fontSize: 12, fontWeight: "600", lineHeight: 17 },

  progressRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E3D2F8" },
  progressDotActive: { width: 28 },
  progressDotDone: { backgroundColor: "#78A866" },

  stepCard: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.5, padding: 20, marginBottom: 12, shadowColor: "#BFA99D", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 3 },
  stepEmojiWrap: { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  stepEmoji: { fontSize: 32 },
  stepBadge: { alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  stepBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  stepTitle: { color: "#2B2463", fontSize: 22, fontWeight: "900", marginBottom: 6, lineHeight: 28 },
  stepSubtitle: { color: "#837E96", fontSize: 13, fontWeight: "600", lineHeight: 19, marginBottom: 14 },

  affirmationCard: { borderRadius: 14, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 16 },
  affirmationText: { flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 19 },

  actionsLabel: { color: "#2B2463", fontSize: 12, fontWeight: "700", marginBottom: 10 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FAFAFA", borderRadius: 14, borderWidth: 1, borderColor: "#EFE4DC", padding: 12, marginBottom: 8 },
  actionCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#D5CDE8", alignItems: "center", justifyContent: "center" },
  actionIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionText: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "700" },

  noteCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#EFE4DC", padding: 12, marginBottom: 14 },
  noteText: { flex: 1, color: "#837E96", fontSize: 11, fontWeight: "600", lineHeight: 16 },

  nextBtn: { borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 12 },
  nextBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },

  // Done screen
  doneContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100 },
  doneCard: { backgroundColor: "#2B2463", borderRadius: 24, padding: 28, alignItems: "center", marginBottom: 20 },
  doneEmoji: { fontSize: 52, marginBottom: 12 },
  doneTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginBottom: 10 },
  doneMessage: { color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: "600", textAlign: "center", lineHeight: 24 },

  doneStepsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 10 },
  doneStepDot: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  doneStepEmoji: { fontSize: 22 },
  doneSubtext: { color: "#837E96", fontSize: 13, fontWeight: "600", textAlign: "center", marginBottom: 24 },

  doneTools: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#EFE4DC", padding: 16, marginBottom: 16 },
  doneToolsTitle: { color: "#837E96", fontSize: 12, fontWeight: "700", marginBottom: 12 },
  doneToolRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0E8E2" },
  doneToolIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  doneToolText: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "800" },

  doneHomeBtn: { backgroundColor: "#2B2463", borderRadius: 16, padding: 16, alignItems: "center" },
  doneHomeBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});