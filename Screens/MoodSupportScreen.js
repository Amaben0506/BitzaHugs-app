import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MOOD_HISTORY_KEY = "familyAppMoodHistory";

const moodContent = {
  overwhelmed: {
    title: "You're overwhelmed.",
    subtitle: "Let's slow everything down.",
    message: "It's okay to feel this way. You are not alone.",
    image: require("../assets/icons/emotion-overwhelmed-face.png"),
    bg: "#FFF3F0",
    accent: "#EF8F7D",
    options: [
      { label: "Breathing Exercise", icon: "wind" },
      { label: "Grounding Steps", icon: "anchor" },
      { label: "Calming Sounds", icon: "volume-2" },
      { label: "Talk to Hugi", icon: "message-circle" },
      { label: "My Meltdown Plan", icon: "clipboard" },
    ],
  },
  struggling: {
    title: "You're struggling.",
    subtitle: "You don't have to face this alone.",
    message: "Let's try something gentle that might help.",
    image: require("../assets/icons/emotion-struggling-face.png"),
    bg: "#FFF5EA",
    accent: "#E5A86D",
    options: [
      { label: "Breathing Exercise", icon: "wind" },
      { label: "Grounding Steps", icon: "anchor" },
      { label: "Calming Sounds", icon: "volume-2" },
      { label: "Talk to Hugi", icon: "message-circle" },
      { label: "My Support Plan", icon: "heart" },
    ],
  },
  okay: {
    title: "You're doing okay.",
    subtitle: "Nice job checking in.",
    message: "Want to keep building on this feeling?",
    image: require("../assets/icons/emotion-okay-face.png"),
    bg: "#FFF9EA",
    accent: "#E7C45F",
    options: [
      { label: "Positive Affirmations", icon: "star" },
      { label: "Calming Sounds", icon: "volume-2" },
      { label: "What Helped Today?", icon: "edit-3" },
      { label: "Continue My Routine", icon: "calendar" },
    ],
  },
  hopeful: {
    title: "You're feeling hopeful!",
    subtitle: "That's wonderful.",
    message: "Let's keep that positive energy going.",
    image: require("../assets/icons/emotion-happy-face.png"),
    bg: "#F4FAF0",
    accent: "#83B87A",
    options: [
      { label: "Gratitude Journal", icon: "book-open" },
      { label: "Positive Affirmations", icon: "star" },
      { label: "Calming Sounds", icon: "volume-2" },
      { label: "Continue My Routine", icon: "calendar" },
    ],
  },
  good: {
    title: "You're feeling good!",
    subtitle: "So happy for you.",
    message: "Let's celebrate this good moment.",
    image: require("../assets/icons/emotion-good-face.png"),
    bg: "#F1FBF7",
    accent: "#6EB8A3",
    options: [
      { label: "Share a Win", icon: "star" },
      { label: "Gratitude Journal", icon: "book-open" },
      { label: "Positive Affirmations", icon: "star" },
      { label: "Calming Sounds", icon: "volume-2" },
      { label: "Continue My Routine", icon: "calendar" },
    ],
  },
};

const focusContent = {
  water: {
    title: "Let's start small.",
    subtitle: "Take a sip of water.",
    message: "Your body may be asking for a tiny reset. Take one slow sip, unclench your jaw, and breathe out gently.",
    options: [
      { label: "Talk to Hugi", icon: "message-circle" },
      { label: "Breathing Exercise", icon: "wind" },
      { label: "Grounding Steps", icon: "anchor" },
      { label: "Continue My Routine", icon: "calendar" },
    ],
  },
  encouragement: {
    title: "You are not failing.",
    subtitle: "This moment is hard.",
    message: "You are doing your best in a real, difficult moment. You deserve support too.",
    options: [
      { label: "Talk to Hugi", icon: "message-circle" },
      { label: "Positive Affirmations", icon: "star" },
      { label: "Breathing Exercise", icon: "wind" },
      { label: "What Helped Today?", icon: "edit-3" },
    ],
  },
  movement: {
    title: "Let's move gently.",
    subtitle: "Nothing big. Just a reset.",
    message: "Roll your shoulders, stretch your hands, or take a few slow steps. Your body can help your mind soften.",
    options: [
      { label: "Talk to Hugi", icon: "message-circle" },
      { label: "Grounding Steps", icon: "anchor" },
      { label: "Breathing Exercise", icon: "wind" },
      { label: "Continue My Routine", icon: "calendar" },
    ],
  },
};

// ✅ Save mood check-in to AsyncStorage for Progress screen
const saveMoodEntry = async (mood) => {
  try {
    const existing = await AsyncStorage.getItem(MOOD_HISTORY_KEY);
    const history = existing ? JSON.parse(existing) : [];
    const entry = {
      mood: mood.toLowerCase(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };
    // Add to front of array, keep last 90 entries
    const updated = [entry, ...history].slice(0, 90);
    await AsyncStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.log("Error saving mood entry:", e);
  }
};

export default function MoodSupportScreen({ route, navigation }) {
  const selectedMood = route?.params?.mood || "okay";
  const focus = route?.params?.focus || null;

  const baseContent = moodContent[selectedMood] || moodContent.okay;
  const content = focus
    ? { ...baseContent, ...focusContent[focus], image: baseContent.image, bg: baseContent.bg, accent: baseContent.accent }
    : baseContent;

  // ✅ Save mood entry when screen loads
  useEffect(() => {
    saveMoodEntry(selectedMood);
  }, [selectedMood]);

  const handleOptionPress = (label) => {
    const nav = (screen, params) =>
      navigation.navigate(screen, params);

    if (label === "Talk to Hugi") nav("HugiChat");
    else if (label === "Breathing Exercise") nav("Breathing");
    else if (label === "Grounding Steps") nav("GroundingSteps");
    else if (label === "Calming Sounds") nav("Sounds");
    else if (label === "Positive Affirmations" || label === "Share a Win") nav("Affirmations");
    else if (label === "Move My Body" || label === "Movement Reset") nav("MovementPrompt");
    else if (label === "My Meltdown Plan" || label === "My Support Plan") nav("MeltdownPlan");
    else if (label === "Gratitude Journal" || label === "What Helped Today?" || label === "Write This Out") nav("CalmJournal");
    else if (label === "Continue My Routine") {
      navigation.navigate("MainTabs", {
        screen: "DrawerHome",
        params: { screen: "RoutineTab" },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: content.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={30} color="#2B2463" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Feather name="x" size={24} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.imageGlow, { backgroundColor: content.bg }]}>
            <Image source={content.image} style={styles.moodImage} resizeMode="contain" />
          </View>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>
          <Text style={styles.message}>{content.message}</Text>

          {/* ✅ Saved indicator */}
          <View style={styles.savedBadge}>
            <Feather name="check-circle" size={13} color="#78A866" />
            <Text style={styles.savedBadgeText}>Mood saved to your progress</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsCard}>
          {content.options.map((option, i) => (
            <TouchableOpacity
              key={option.label}
              style={[styles.optionRow, i === content.options.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => handleOptionPress(option.label)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIconBubble, { backgroundColor: `${content.accent}22` }]}>
                <Feather name={option.icon} size={21} color={content.accent} strokeWidth={2.2} />
              </View>
              <Text style={styles.optionText}>{option.label}</Text>
              <Feather name="chevron-right" size={22} color="#2B2463" strokeWidth={2.4} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.backToCheckInButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backToCheckInText}>Back to Check-In</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>One small step is still a step. 💜</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: Platform.OS === "ios" ? 8 : 22, paddingBottom: 40 },

  topBar: { height: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "flex-start" },
  closeButton: { width: 44, height: 44, justifyContent: "center", alignItems: "flex-end" },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 30, paddingHorizontal: 22, paddingTop: 28, paddingBottom: 22, alignItems: "center", borderWidth: 1, borderColor: "#EFE4DC", shadowColor: "#BFA99D", shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 3, marginBottom: 18 },
  imageGlow: { width: 130, height: 130, borderRadius: 65, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  moodImage: { width: 105, height: 105 },
  title: { color: "#2B2463", fontSize: 28, lineHeight: 34, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
  subtitle: { color: "#2B2463", fontSize: 20, lineHeight: 26, fontWeight: "700", textAlign: "center", marginTop: 6 },
  message: { color: "#5B5672", fontSize: 16, lineHeight: 23, fontWeight: "500", textAlign: "center", marginTop: 14, marginBottom: 12 },

  savedBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EEF7E8", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#C8E6B8" },
  savedBadgeText: { color: "#78A866", fontSize: 11, fontWeight: "800" },

  optionsCard: { backgroundColor: "#FFFFFF", borderRadius: 26, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#EFE4DC", shadowColor: "#BFA99D", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 5 }, shadowRadius: 14, elevation: 2, marginBottom: 18 },
  optionRow: { minHeight: 62, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F0E8E2" },
  optionIconBubble: { width: 40, height: 40, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 13 },
  optionText: { flex: 1, color: "#2B2463", fontSize: 16, fontWeight: "700" },

  backToCheckInButton: { height: 54, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E7D9CF", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  backToCheckInText: { color: "#6F42D8", fontSize: 16, fontWeight: "800" },
  footerText: { color: "#837E96", fontSize: 15, fontWeight: "600", textAlign: "center" },
});
