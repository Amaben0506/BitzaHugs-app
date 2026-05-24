import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const SENSORY_SUPPORTS_KEY = "bitzaSensorySupports";

const sensoryHeader = require("../assets/icons/support-heart-hug.png");

const sensoryOptions = [
  {
    id: "loud-noises",
    title: "Loud Noises",
    subtitle: "Sounds, crowds, yelling, sudden noise",
    icon: "volume-high-outline",
    color: "#F28C8C",
    bg: "#FFE6E4",
  },
  {
    id: "transitions",
    title: "Transitions",
    subtitle: "Switching activities or leaving places",
    icon: "sync-outline",
    color: "#40A99B",
    bg: "#E7F7F4",
  },
  {
    id: "bright-lights",
    title: "Bright Lights",
    subtitle: "Harsh lights, screens, sunlight, flashing",
    icon: "sunny-outline",
    color: "#F3A63D",
    bg: "#FFF0DF",
  },
  {
    id: "textures",
    title: "Textures",
    subtitle: "Clothes, food textures, tags, touch",
    icon: "hand-left-outline",
    color: "#F28C8C",
    bg: "#FFE8DC",
  },
  {
    id: "visuals",
    title: "Visuals",
    subtitle: "Clutter, busy spaces, visual overload",
    icon: "image-outline",
    color: "#4AA9B1",
    bg: "#E7F4FF",
  },
  {
    id: "timers",
    title: "Timers",
    subtitle: "Time warnings, countdowns, endings",
    icon: "time-outline",
    color: "#8C55F6",
    bg: "#F0E2FF",
  },
  {
    id: "music",
    title: "Music",
    subtitle: "Soft sound, rhythm, calming audio",
    icon: "musical-notes-outline",
    color: "#8C55F6",
    bg: "#F6ECFF",
  },
  {
    id: "quiet-space",
    title: "Quiet Space",
    subtitle: "A calm place to reset safely",
    icon: "home-outline",
    color: "#7BA85E",
    bg: "#EEF7E8",
  },
  {
    id: "pressure",
    title: "Deep Pressure",
    subtitle: "Firm hugs, weighted blankets, compression",
    icon: "heart-outline",
    color: "#F1768E",
    bg: "#FFE6EF",
  },
];

export default function SensorySupportScreen({ navigation }) {
  const [selectedSupports, setSelectedSupports] = useState([]);

  const toggleSupport = (item) => {
    setSelectedSupports((prev) => {
      const alreadySelected = prev.some((support) => support.id === item.id);

      if (alreadySelected) {
        return prev.filter((support) => support.id !== item.id);
      }

      return [
        ...prev,
        {
          id: item.id,
          title: item.title,
        },
      ];
    });
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem(
        SENSORY_SUPPORTS_KEY,
        JSON.stringify(selectedSupports)
      );

      navigation.navigate("CaregiverSupport");
    } catch (error) {
      console.log("Error saving sensory supports:", error);
      Alert.alert("Oops", "Something went wrong. Please try again.");
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem(SENSORY_SUPPORTS_KEY, JSON.stringify([]));
      navigation.navigate("CaregiverSupport");
    } catch (error) {
      console.log("Error skipping sensory supports:", error);
      navigation.navigate("CaregiverSupport");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F3" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#2D2357" />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <Ionicons name="heart" size={24} color="#8C35F6" />
            <Text style={styles.brandText}>
              Bitza<Text style={styles.brandAccent}>Hugs</Text>
            </Text>
          </View>

          <View style={styles.topSpacer} />
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.stepLabel}>Step 2 of 4</Text>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image
            source={sensoryHeader}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <View style={styles.heroTextWrap}>
            <Text style={styles.title}>What helps your child feel supported?</Text>

            <Text style={styles.subtitle}>
              Choose anything that affects your child. This helps BitzaHugs suggest the right calming tools.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select all that apply</Text>

        {/* Options */}
        <View style={styles.optionsWrap}>
          {sensoryOptions.map((item) => {
            const isSelected = selectedSupports.some(
              (support) => support.id === item.id
            );

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: item.bg },
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => toggleSupport(item)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View
                  style={[
                    styles.iconBubble,
                    { backgroundColor: `${item.color}22` },
                  ]}
                >
                  <Ionicons name={item.icon} size={23} color={item.color} />
                </View>

                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    isSelected && styles.checkCircleSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Gentle Note */}
        <View style={styles.noteCard}>
          <Ionicons name="heart-outline" size={20} color="#8C55F6" />
          <Text style={styles.noteText}>
            You can update these anytime as your child’s needs change.
          </Text>
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.86}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.buttonText}>
            {selectedSupports.length > 0 ? "Save & Continue" : "Continue"}
          </Text>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.75}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip for now"
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF9F3",
  },

  scroll: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 44,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1E5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  brandText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#20204F",
  },

  brandAccent: {
    color: "#F1768E",
  },

  topSpacer: {
    width: 44,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },

  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D9D4D0",
  },

  progressActive: {
    backgroundColor: "#8C55F6",
    width: 24,
  },

  stepLabel: {
    textAlign: "center",
    color: "#837E96",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1E7DF",
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#D8C6B8",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  heroImage: {
    width: 74,
    height: 74,
    marginRight: 12,
  },

  heroTextWrap: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
    color: "#111A4D",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#5B5672",
    fontWeight: "600",
  },

  sectionTitle: {
    color: "#111A4D",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },

  optionsWrap: {
    gap: 9,
    marginBottom: 14,
  },

  optionCard: {
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  optionCardSelected: {
    borderColor: "#8C35F6",
    borderWidth: 2,
  },

  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  optionTextWrap: {
    flex: 1,
  },

  optionTitle: {
    color: "#111A4D",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 2,
  },

  optionSubtitle: {
    color: "#5B5672",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "600",
  },

  checkCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#D8CFF0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  checkCircleSelected: {
    backgroundColor: "#8C35F6",
    borderColor: "#8C35F6",
  },

  noteCard: {
    borderRadius: 16,
    backgroundColor: "#F5E9FF",
    borderWidth: 1,
    borderColor: "#E4CFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 10,
  },

  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#3C365F",
    fontWeight: "600",
    lineHeight: 18,
  },

  button: {
    width: "100%",
    height: 58,
    borderRadius: 22,
    backgroundColor: "#8C35F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#8C55F6",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  skipButton: {
    alignItems: "center",
    paddingVertical: 8,
  },

  skipText: {
    color: "#837E96",
    fontSize: 13,
    fontWeight: "700",
  },
});