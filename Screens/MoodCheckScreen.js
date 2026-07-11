import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { scheduleStreakProtection } from "../utils/notifications";

export default function MoodCheckScreen({ navigation, route }) {
  const startingMood = route?.params?.mood || null;
  const [selectedMood, setSelectedMood] = useState(startingMood);
  const [selectedHelps, setSelectedHelps] = useState([]);
  const [intensity, setIntensity] = useState(5);

  const moods = [
    {
      label: "Overwhelmed",
      value: "overwhelmed",
      icon: require("../assets/icons/emotion-overwhelmed-face.png"),
    },
    {
      label: "Struggling",
      value: "struggling",
      icon: require("../assets/icons/emotion-struggling-face.png"),
    },
    {
      label: "Okay",
      value: "okay",
      icon: require("../assets/icons/emotion-okay-face.png"),
    },
    {
      label: "Hopeful",
      value: "hopeful",
      icon: require("../assets/icons/emotion-happy-face.png"),
    },
    {
      label: "Good",
      value: "good",
      icon: require("../assets/icons/emotion-good-face.png"),
    },
  ];

  const helpOptions = [
    {
      label: "A few\ndeep breaths",
      value: "breathing",
      icon: require("../assets/icons/support-breathing.png"),
      bg: "#F0E4FF",
    },
    {
      label: "Drink some\nwater",
      value: "water",
      icon: require("../assets/icons/support-water-cup.png"),
      bg: "#E7F4FF",
    },
    {
      label: "Encouragement",
      value: "encouragement",
      icon: require("../assets/icons/support-positive-reminder.png"),
      bg: "#F4F7E8",
    },
    {
      label: "Write it out",
      value: "write",
      icon: require("../assets/icons/tool-checklist-pencil.png"),
      bg: "#FFF0DE",
    },
    {
      label: "Quiet time",
      value: "quiet",
      icon: require("../assets/icons/support-quiet-time-moon.png"),
      bg: "#FFF4DF",
    },
    {
      label: "Move\nmy body",
      value: "move",
      icon: require("../assets/icons/support-move-body-walk.png"),
      bg: "#EEF7E8",
    },
    {
      label: "Talk to\nsomeone",
      value: "talk",
      icon: require("../assets/icons/support-chat-heart.png"),
      bg: "#FFE6E4",
    },
    {
      label: "Something\nelse",
      value: "else",
      icon: require("../assets/icons/support-question-help.png"),
      bg: "#FFF1DC",
    },
  ];

  const toggleHelp = (value) => {
    setSelectedHelps((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleHelpPress = (value) => {
    toggleHelp(value);

    if (value === "breathing") {
      navigation.navigate("Breathing");
      return;
    }

    if (value === "talk" || value === "else") {
      navigation.getParent()?.navigate("HugiChat");
      return;
    }

    if (value === "water") {
  navigation.getParent()?.navigate("WaterReminder");
  return;
}

    if (value === "encouragement") {
      navigation.getParent()?.navigate("Affirmations");
      return;
    }

    if (value === "write") {
      navigation.getParent()?.navigate("CalmJournal", {
        mood: selectedMood || "okay",
      });
      return;
    }

    if (value === "quiet") {
      navigation.navigate("Sounds");
      return;
    }

    if (value === "move") {
      navigation.getParent()?.navigate("MovementPrompt");
      return;
    }
  };

  const goToHelpfulSupport = () => {
    scheduleStreakProtection().catch(() => {});
    navigation.getParent()?.navigate("MoodSupport", {
      mood: selectedMood || "okay",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Feather name="chevron-left" size={27} color="#2B2463" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>Caregiver Check-In</Text>

          <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
            <Feather name="info" size={21} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.introHeartCircle}>
            <Image
              source={require("../assets/icons/decor-little-purple-heart.png")}
              style={styles.introHeart}
              resizeMode="contain"
            />
          </View>

          <View style={styles.introTextWrap}>
            <Text style={styles.introTitle}>It’s okay to check in.</Text>
            <Text style={styles.introText}>
              How are you feeling right now?{"\n"}There’s no right or wrong
              answer.
            </Text>
          </View>

          <Image
            source={require("../assets/icons/header-sunrise-clouds.png")}
            style={styles.introClouds}
            resizeMode="contain"
          />
        </View>

        {/* Mood Picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Choose how you’re feeling right now.
          </Text>

          <View style={styles.moodRow}>
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.value;

              return (
                <TouchableOpacity
                  key={mood.value}
                  style={styles.moodItem}
                  activeOpacity={0.85}
                  onPress={() => setSelectedMood(mood.value)}
                >
                  <View
                    style={[
                      styles.moodCircle,
                      isSelected && styles.moodCircleSelected,
                    ]}
                  >
                    <Image
                      source={mood.icon}
                      style={styles.moodIcon}
                      resizeMode="contain"
                    />

                    {isSelected && (
                      <View style={styles.moodCheck}>
                        <Feather name="check" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.moodLabel,
                      isSelected && styles.moodLabelSelected,
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Intensity */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitleNoMargin}>
              How intense does it feel?
            </Text>
            <View style={styles.intensityPill}>
              <Text style={styles.intensityPillText}>{intensity}/10</Text>
            </View>
          </View>

          <View style={styles.sliderArea}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${intensity * 10}%` }]} />
              <View
                style={[
                  styles.sliderThumb,
                  { left: `${Math.min(intensity * 10, 96)}%` },
                ]}
              />
            </View>

            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Soft</Text>
              <Text style={styles.sliderLabel}>Heavy</Text>
            </View>

            <View style={styles.intensityButtons}>
              {[1, 3, 5, 7, 10].map((number) => (
                <TouchableOpacity
                  key={number}
                  style={[
                    styles.intensityDot,
                    intensity === number && styles.intensityDotSelected,
                  ]}
                  onPress={() => setIntensity(number)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.intensityText,
                      intensity === number && styles.intensityTextSelected,
                    ]}
                  >
                    {number}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Help Options */}
        <View style={styles.card}>
          <Text style={styles.cardTitleSmallGap}>
            What would help you right now?
          </Text>
          <Text style={styles.cardSubtitle}>You can pick more than one.</Text>

          <View style={styles.helpGrid}>
            {helpOptions.map((option) => {
              const isSelected = selectedHelps.includes(option.value);

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.helpCard,
                    { backgroundColor: option.bg },
                    isSelected && styles.helpCardSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleHelpPress(option.value)}
                >
                  <Image
                    source={option.icon}
                    style={styles.helpIcon}
                    resizeMode="contain"
                  />

                  <Text style={styles.helpLabel}>{option.label}</Text>

                  {isSelected && (
                    <View style={styles.selectedCheck}>
                      <Feather name="check" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Journal */}
        <TouchableOpacity
          style={styles.journalCard}
          activeOpacity={0.88}
          onPress={() =>
            navigation.getParent()?.navigate("CalmJournal", {
              mood: selectedMood || "okay",
            })
          }
        >
          <View style={styles.journalIconBubble}>
            <Image
              source={require("../assets/icons/support-calm-journal.png")}
              style={styles.journalIcon}
              resizeMode="contain"
            />
          </View>

          <View style={styles.journalTextWrap}>
            <Text style={styles.journalTitle}>
              Want to write a few thoughts?
            </Text>
            <Text style={styles.journalText}>This is a safe space.</Text>
          </View>

          <View style={styles.journalButton}>
            <Text style={styles.journalButtonText}>Open</Text>
          </View>
        </TouchableOpacity>

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Image
            source={require("../assets/icons/decor-little-purple-heart.png")}
            style={styles.encourageHeart}
            resizeMode="contain"
          />

          <View style={styles.encourageTextWrap}>
            <Text style={styles.encourageTitle}>
              You’re doing more than you think.
            </Text>
            <Text style={styles.encourageText}>
              Every small step matters. You are not alone.
            </Text>

            <TouchableOpacity
              style={styles.helpfulButton}
              activeOpacity={0.9}
              onPress={goToHelpfulSupport}
            >
              <Text style={styles.helpfulButtonText}>
                Show Me Something Helpful
              </Text>
              <Feather name="chevron-right" size={20} color="#2B2463" />
            </TouchableOpacity>
          </View>

          <Image
            source={require("../assets/icons/decor-leaves.png")}
            style={styles.encourageLeaves}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF9F2",
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "ios" ? 8 : 22,
    paddingBottom: 116,
  },

  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  circleButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#F3EAFB",
    alignItems: "center",
    justifyContent: "center",
  },

  topTitle: {
    color: "#2B2463",
    fontSize: 18.5,
    fontWeight: "850",
    letterSpacing: -0.2,
  },

  introCard: {
    minHeight: 124,
    backgroundColor: "#FFF7F0",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#EFE1D8",
    paddingHorizontal: 17,
    paddingVertical: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },

  introHeartCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F1E2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    zIndex: 2,
  },

  introHeart: {
    width: 54,
    height: 54,
  },

  introTextWrap: {
    flex: 1,
    zIndex: 2,
  },

  introTitle: {
    color: "#2B2463",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "850",
    marginBottom: 4,
    letterSpacing: -0.3,
  },

  introText: {
    color: "#5B5672",
    fontSize: 14,
    lineHeight: 19.5,
    fontWeight: "600",
  },

  introClouds: {
    width: 132,
    height: 84,
    position: "absolute",
    right: -10,
    bottom: -5,
    opacity: 0.72,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 17,
    marginBottom: 14,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 2,
  },

  cardTitle: {
    color: "#2B2463",
    fontSize: 16.5,
    lineHeight: 21,
    fontWeight: "850",
    marginBottom: 15,
  },

  cardTitleNoMargin: {
    color: "#2B2463",
    fontSize: 16.5,
    lineHeight: 21,
    fontWeight: "850",
  },

  cardTitleSmallGap: {
    color: "#2B2463",
    fontSize: 16.5,
    lineHeight: 21,
    fontWeight: "850",
    marginBottom: 4,
  },

  cardSubtitle: {
    color: "#837E96",
    fontSize: 13,
    fontWeight: "650",
    marginBottom: 14,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  intensityPill: {
    backgroundColor: "#F0E2FF",
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  intensityPillText: {
    color: "#6F42D8",
    fontSize: 12,
    fontWeight: "850",
  },

  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  moodItem: {
    width: "19%",
    alignItems: "center",
  },

  moodCircle: {
    width: 61,
    height: 61,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    position: "relative",
  },

  moodCircleSelected: {
    backgroundColor: "#F0E2FF",
    borderWidth: 2,
    borderColor: "#8B5BE8",
  },

  moodIcon: {
    width: 54,
    height: 54,
  },

  moodCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#8B5BE8",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -1,
    right: -1,
  },

  moodLabel: {
    color: "#2B2463",
    fontSize: 11,
    lineHeight: 13.5,
    fontWeight: "700",
    textAlign: "center",
  },

  moodLabelSelected: {
    color: "#6F42D8",
    fontWeight: "850",
  },

  sliderArea: {
    paddingTop: 2,
  },

  sliderTrack: {
    height: 7,
    borderRadius: 7,
    backgroundColor: "#F6D7C4",
    position: "relative",
    marginHorizontal: 5,
    marginBottom: 15,
  },

  sliderFill: {
    height: 7,
    borderRadius: 7,
    backgroundColor: "#A883F0",
  },

  sliderThumb: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#D9C3FB",
    borderWidth: 2,
    borderColor: "#8B5BE8",
    position: "absolute",
    top: -9,
    marginLeft: -12,
  },

  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sliderLabel: {
    color: "#837E96",
    fontSize: 12.5,
    fontWeight: "650",
  },

  intensityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  intensityDot: {
    width: 38,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F8F1EC",
    alignItems: "center",
    justifyContent: "center",
  },

  intensityDotSelected: {
    backgroundColor: "#F0E2FF",
    borderWidth: 1,
    borderColor: "#8B5BE8",
  },

  intensityText: {
    color: "#837E96",
    fontSize: 13,
    fontWeight: "750",
  },

  intensityTextSelected: {
    color: "#6F42D8",
    fontWeight: "850",
  },

  helpGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  helpCard: {
    width: "23.5%",
    minHeight: 88,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    position: "relative",
  },

  helpCardSelected: {
    borderColor: "#8B5BE8",
    borderWidth: 1.6,
    transform: [{ scale: 0.98 }],
  },

  helpIcon: {
    width: 35,
    height: 35,
    marginBottom: 6,
  },

  helpLabel: {
    color: "#2B2463",
    fontSize: 9.6,
    lineHeight: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  selectedCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#8B5BE8",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 5,
    right: 5,
  },

  journalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#BFA99D",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },

  journalIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F3EAFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  journalIcon: {
    width: 38,
    height: 38,
  },

  journalTextWrap: {
    flex: 1,
  },

  journalTitle: {
    color: "#2B2463",
    fontSize: 15.2,
    fontWeight: "850",
    marginBottom: 3,
  },

  journalText: {
    color: "#837E96",
    fontSize: 12.8,
    fontWeight: "650",
  },

  journalButton: {
    backgroundColor: "#F0E2FF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  journalButtonText: {
    color: "#6F42D8",
    fontSize: 12.5,
    fontWeight: "850",
  },

  encouragementCard: {
    backgroundColor: "#F6ECFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EADAFB",
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 17,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  encourageHeart: {
    width: 76,
    height: 76,
    marginRight: 13,
    zIndex: 2,
  },

  encourageTextWrap: {
    flex: 1,
    zIndex: 2,
  },

  encourageTitle: {
    color: "#2B2463",
    fontSize: 16.5,
    lineHeight: 21,
    fontWeight: "850",
    marginBottom: 5,
  },

  encourageText: {
    color: "#5B5672",
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "650",
    marginBottom: 12,
  },

  helpfulButton: {
    minHeight: 42,
    borderRadius: 18,
    backgroundColor: "#E6D5FF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    alignSelf: "flex-start",
  },

  helpfulButtonText: {
    color: "#2B2463",
    fontSize: 12.8,
    fontWeight: "850",
  },

  encourageLeaves: {
    width: 62,
    height: 76,
    position: "absolute",
    right: 8,
    bottom: 5,
    opacity: 0.78,
  },
});
