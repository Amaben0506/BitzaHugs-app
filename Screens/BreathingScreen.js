import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Animated,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";

const calmingMessages = [
  "You are safe in this moment.",
  "One breath at a time.",
  "You do not have to fix everything right now.",
  "Your calm matters too.",
];

export default function BreathingScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.45)).current;
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("Ready");
  const [cycleCount, setCycleCount] = useState(0);

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

  useEffect(() => {
    if (!isRunning) return;
    setPhase("Breathe In");

    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.35, duration: 4000, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0.85, duration: 4000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration: 5000, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0.45, duration: 5000, useNativeDriver: true }),
        ]),
      ])
    );
    animation.start();

    const phaseTimer = setInterval(() => {
      setPhase((cur) => cur === "Breathe In" ? "Breathe Out" : "Breathe In");
      setCycleCount((c) => c + 1);
    }, 4500);

   return () => {
  animation.stop();
  clearInterval(phaseTimer);
};
}, [isRunning, scaleAnim, fadeAnim]);

  const stopBreathing = () => {
    setIsRunning(false);
    setPhase("Ready");
    setCycleCount(0);
    scaleAnim.setValue(1);
    fadeAnim.setValue(0.45);
  };

  const message = calmingMessages[cycleCount % calmingMessages.length];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Breathing</Text>
          <View style={styles.circleButton}>
            <Ionicons name="leaf-outline" size={20} color="#2B2463" />
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Let's slow down together</Text>
          <Text style={styles.heroSubtitle}>
            Follow the circle. Breathe in as it grows, breathe out as it softens.
          </Text>
        </View>

        {/* Breathing Circle Card */}
        <View style={styles.breathingCard}>
          <View style={styles.orbitWrapper}>
            <Animated.View style={[styles.outerGlow, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]} />
            <Animated.View style={[styles.middleGlow, { transform: [{ scale: scaleAnim }] }]} />
            <Animated.View style={[styles.breathingCircle, { transform: [{ scale: scaleAnim }] }]}>
              <Ionicons name="leaf" size={38} color="#FFFFFF" />
            </Animated.View>
          </View>

          <Text style={styles.phaseText}>{phase}</Text>
          <Text style={styles.messageText}>{message}</Text>

          <View style={styles.cycleChip}>
            <Ionicons name="sync-outline" size={16} color="#6F42D8" />
            <Text style={styles.cycleText}>{cycleCount} calming moments</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setIsRunning(!isRunning)}
            activeOpacity={0.88}
          >
            <Ionicons name={isRunning ? "pause" : "play"} size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{isRunning ? "Pause" : "Start Breathing"}</Text>
          </TouchableOpacity>

          {isRunning && (
            <TouchableOpacity style={styles.resetButton} onPress={stopBreathing}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Try this gentle rhythm</Text>
          <BreathStep number="1" text="Breathe in slowly for 4 seconds." />
          <BreathStep number="2" text="Let your shoulders soften." />
          <BreathStep number="3" text="Breathe out slowly for 5 seconds." />
          <BreathStep number="4" text="Repeat until your body feels a little safer." />
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="heart-outline" size={22} color="#6F42D8" />
          <View style={styles.tipTextBox}>
            <Text style={styles.tipTitle}>Gentle reminder</Text>
            <Text style={styles.tipText}>
              Regulating your own body first can help create a calmer space for your child too.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BreathStep({ number, text }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 16,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  circleButton: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F0E2FF", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#E3D2F8",
  },
  headerTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  heroCard: {
    backgroundColor: "#F6ECFF", borderRadius: 20, borderWidth: 1,
    borderColor: "#E3D2F8", padding: 16, marginBottom: 12,
  },
  heroTitle: { color: "#2B2463", fontSize: 20, fontWeight: "800", letterSpacing: -0.3, marginBottom: 6 },
  heroSubtitle: { color: "#5B5672", fontSize: 13, lineHeight: 19, fontWeight: "600" },

  breathingCard: {
    backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 1,
    borderColor: "#EFE4DC", paddingVertical: 20, paddingHorizontal: 16,
    marginBottom: 12, alignItems: "center",
    shadowColor: "#B8A9D9", shadowOpacity: 0.1,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },

  orbitWrapper: { width: 190, height: 190, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  outerGlow: { position: "absolute", width: 175, height: 175, borderRadius: 88, backgroundColor: "#EFE6FF" },
  middleGlow: { position: "absolute", width: 145, height: 145, borderRadius: 73, backgroundColor: "#DCCBFA", opacity: 0.65 },
  breathingCircle: { width: 112, height: 112, borderRadius: 56, backgroundColor: "#7548D8", justifyContent: "center", alignItems: "center" },

  phaseText: { color: "#2B2463", fontSize: 24, fontWeight: "800", marginBottom: 4 },
  messageText: { color: "#5B5672", fontSize: 13, textAlign: "center", lineHeight: 19, fontWeight: "600", marginBottom: 12 },

  cycleChip: {
    backgroundColor: "#F3EAFE", paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14,
  },
  cycleText: { color: "#6F42D8", fontSize: 12, fontWeight: "700" },

  primaryButton: {
    backgroundColor: "#7548D8", paddingVertical: 13, paddingHorizontal: 28,
    borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 8,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  resetButton: { marginTop: 10 },
  resetButtonText: { color: "#7548D8", fontSize: 14, fontWeight: "700" },

  stepsCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1,
    borderColor: "#EFE4DC", padding: 14, marginBottom: 10,
    shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  stepsTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 10 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  stepNumber: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: "#F3EAFE",
    justifyContent: "center", alignItems: "center", marginRight: 10,
  },
  stepNumberText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },
  stepText: { flex: 1, color: "#5B5672", fontSize: 13, lineHeight: 18, fontWeight: "600" },

  tipCard: {
    backgroundColor: "#F6ECFF", borderRadius: 18, borderWidth: 1,
    borderColor: "#E3D2F8", padding: 13, flexDirection: "row", alignItems: "center", gap: 12,
  },
  tipTextBox: { flex: 1 },
  tipTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  tipText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },
});