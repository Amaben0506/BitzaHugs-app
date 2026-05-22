import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from "@expo/vector-icons";

const groundingSteps = [
  { number: "5", title: "Name 5 things you can see", prompt: "Look around slowly. Notice shapes, colors, or objects near you.", icon: "eye", color: "#F0E2FF", accent: "#6F42D8" },
  { number: "4", title: "Name 4 things you can feel", prompt: "Your feet on the floor, your clothes, your hands, or the chair under you.", icon: "hand", color: "#E7F4FF", accent: "#4C9ED9" },
  { number: "3", title: "Name 3 things you can hear", prompt: "Listen gently. Notice sounds nearby or far away.", icon: "volume-2", color: "#EEF7E8", accent: "#78A866" },
  { number: "2", title: "Name 2 things you can smell", prompt: "If you cannot smell anything, think of two smells that feel comforting.", icon: "wind", color: "#FFF0DF", accent: "#D99A3D" },
  { number: "1", title: "Name 1 thing you can say to yourself", prompt: "Try: I am here. I am safe enough right now. One step at a time.", icon: "heart", color: "#FFE6E4", accent: "#EF8F7D" },
];

export default function GroundingStepsScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = groundingSteps[currentStep];
  const progressPercent = ((currentStep + 1) / groundingSteps.length) * 100;

  // ✅ Track calm tool use for Calm Champion badge
  useEffect(() => {
    const track = async () => {
      try {
        const current = await AsyncStorage.getItem("bitzaCalmToolUses");
        const count = current ? parseInt(current) : 0;
        await AsyncStorage.setItem("bitzaCalmToolUses", String(count + 1));
      } catch (e) { console.log("Error tracking calm tool:", e); }
    };
    track();
  }, []);

  const goNext = () => { if (currentStep < groundingSteps.length - 1) setCurrentStep(currentStep + 1); };
  const goBackStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
  const restart = () => setCurrentStep(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Grounding Steps</Text>
          <TouchableOpacity style={styles.circleButton} onPress={restart} activeOpacity={0.85}>
            <Feather name="refresh-cw" size={18} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require("../assets/icons/support-heart-hug.png")} style={styles.heroIcon} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Come back to right now.</Text>
            <Text style={styles.heroText}>We'll use your senses to make this moment feel smaller and steadier.</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Step {currentStep + 1} of {groundingSteps.length}</Text>
            <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Main Step Card */}
        <View style={[styles.stepCard, { backgroundColor: step.color }]}>
          <View style={styles.stepTopRow}>
            <View style={[styles.numberCircle, { borderColor: step.accent }]}>
              <Text style={[styles.stepNumber, { color: step.accent }]}>{step.number}</Text>
            </View>
            <View style={styles.iconBubble}>
              <Feather name={step.icon} size={24} color={step.accent} strokeWidth={2.3} />
            </View>
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepPrompt}>{step.prompt}</Text>
          <View style={styles.pauseCard}>
            <Feather name="pause-circle" size={20} color="#6F42D8" />
            <Text style={styles.pauseText}>Take your time here. You do not have to rush.</Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, currentStep === 0 && styles.disabledButton]}
            onPress={goBackStep}
            activeOpacity={0.85}
            disabled={currentStep === 0}
          >
            <Feather name="chevron-left" size={18} color="#6F42D8" />
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>

          {currentStep < groundingSteps.length - 1 ? (
            <TouchableOpacity style={styles.primaryButton} onPress={goNext} activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Next Step</Text>
              <Feather name="chevron-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()} activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>I Feel More Steady</Text>
              <Feather name="heart" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Steps Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>5-4-3-2-1 grounding</Text>
          {groundingSteps.map((item, index) => (
            <TouchableOpacity
              key={item.number}
              style={[styles.previewRow, currentStep === index && styles.previewRowActive]}
              activeOpacity={0.85}
              onPress={() => setCurrentStep(index)}
            >
              <View style={[styles.previewNumber, currentStep === index && styles.previewNumberActive]}>
                <Text style={[styles.previewNumberText, currentStep === index && styles.previewNumberTextActive]}>
                  {item.number}
                </Text>
              </View>
              <Text style={[styles.previewRowText, currentStep === index && styles.previewRowTextActive]}>
                {item.title}
              </Text>
              {currentStep === index && <Feather name="check" size={15} color="#6F42D8" />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>
          Grounding is not about forcing calm. It is about finding one steady point.
        </Text>
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

  topBar: { height: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  circleButton: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8",
  },
  topTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  heroCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  heroIcon: { width: 48, height: 48, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  progressCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1,
    borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 11, marginBottom: 10,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressText: { color: "#2B2463", fontSize: 12, fontWeight: "800" },
  progressPercent: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },
  progressTrack: { height: 7, borderRadius: 7, backgroundColor: "#FFFFFF", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 7, backgroundColor: "#8B5BE8" },

  stepCard: {
    borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 16, paddingVertical: 18, marginBottom: 12,
  },
  stepTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  numberCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFFFFF",
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  stepNumber: { fontSize: 30, fontWeight: "900" },
  iconBubble: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  stepTitle: { color: "#2B2463", fontSize: 18, lineHeight: 23, fontWeight: "800", marginBottom: 7, letterSpacing: -0.3 },
  stepPrompt: { color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "600", marginBottom: 12 },
  pauseCard: {
    backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 14,
    paddingHorizontal: 11, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 8,
  },
  pauseText: { flex: 1, color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "700" },

  buttonRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  secondaryButton: {
    flex: 0.8, height: 48, borderRadius: 16, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E3D2F8", flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 4,
  },
  disabledButton: { opacity: 0.45 },
  secondaryButtonText: { color: "#6F42D8", fontSize: 14, fontWeight: "800" },
  primaryButton: {
    flex: 1.35, height: 48, borderRadius: 16, backgroundColor: "#8B5BE8",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  previewCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 12, paddingVertical: 12, marginBottom: 10,
    shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  previewTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  previewRow: { minHeight: 38, borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, marginBottom: 3 },
  previewRowActive: { backgroundColor: "#F0E2FF" },
  previewNumber: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#F8F1EC",
    alignItems: "center", justifyContent: "center", marginRight: 9,
  },
  previewNumberActive: { backgroundColor: "#8B5BE8" },
  previewNumberText: { color: "#837E96", fontSize: 11, fontWeight: "800" },
  previewNumberTextActive: { color: "#FFFFFF" },
  previewRowText: { flex: 1, color: "#2B2463", fontSize: 12, fontWeight: "700" },
  previewRowTextActive: { color: "#6F42D8", fontWeight: "800" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});