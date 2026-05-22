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

const movementOptions = [
  {
    title: "Shoulder Rolls",
    description: "Slowly roll your shoulders back 5 times. Then forward 5 times.",
    icon: "rotate-cw",
    bg: "#F0E2FF",
    accent: "#6F42D8",
  },
  {
    title: "Hand Stretch",
    description: "Open and close your hands. Stretch your fingers gently.",
    icon: "hand",
    bg: "#E7F4FF",
    accent: "#4C9ED9",
  },
  {
    title: "Slow Walk",
    description: "Take 10 slow steps. Notice your feet touching the ground.",
    icon: "activity",
    bg: "#EEF7E8",
    accent: "#78A866",
  },
  {
    title: "Wall Push",
    description: "Place your hands on a wall and gently push for 10 seconds.",
    icon: "square",
    bg: "#FFF0DF",
    accent: "#D99A3D",
  },
  {
    title: "Shake It Out",
    description: "Shake your hands, arms, or legs for a few seconds.",
    icon: "zap",
    bg: "#FFE6E4",
    accent: "#EF8F7D",
  },
];

export default function MovementPromptScreen({ navigation }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = movementOptions[selectedIndex];

  const nextMovement = () => {
    if (selectedIndex < movementOptions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else {
      setSelectedIndex(0);
    }
  };

  const previousMovement = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else {
      setSelectedIndex(movementOptions.length - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Feather name="chevron-left" size={28} color="#2B2463" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>Move My Body</Text>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => setSelectedIndex(0)}
            activeOpacity={0.85}
          >
            <Feather name="refresh-cw" size={21} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image
            source={require("../assets/icons/support-move-body-walk.png")}
            style={styles.heroIcon}
            resizeMode="contain"
          />

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Tiny movement can help.</Text>
            <Text style={styles.heroText}>
              Nothing big. Just a gentle reset to help your body release some pressure.
            </Text>
          </View>
        </View>

        {/* Main Movement Card */}
        <View style={[styles.movementCard, { backgroundColor: selected.bg }]}>
          <View style={styles.movementTopRow}>
            <View style={[styles.iconBubble, { backgroundColor: "#FFFFFF" }]}>
              <Feather
                name={selected.icon}
                size={32}
                color={selected.accent}
                strokeWidth={2.3}
              />
            </View>

            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>
                {selectedIndex + 1} / {movementOptions.length}
              </Text>
            </View>
          </View>

          <Text style={styles.movementTitle}>{selected.title}</Text>
          <Text style={styles.movementDescription}>{selected.description}</Text>

          <View style={styles.pauseCard}>
            <Feather name="heart" size={22} color="#6F42D8" />
            <Text style={styles.pauseText}>
              Go slow. Stop anytime. This is about feeling steadier, not doing it perfectly.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={previousMovement}
            activeOpacity={0.85}
          >
            <Feather name="chevron-left" size={21} color="#6F42D8" />
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={nextMovement}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Next Movement</Text>
            <Feather name="chevron-right" size={21} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Movement List */}
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Choose a gentle movement</Text>

          {movementOptions.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.listRow,
                selectedIndex === index && styles.listRowActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setSelectedIndex(index)}
            >
              <View
                style={[
                  styles.listIconBubble,
                  selectedIndex === index && styles.listIconBubbleActive,
                ]}
              >
                <Feather
                  name={item.icon}
                  size={18}
                  color={selectedIndex === index ? "#FFFFFF" : "#6F42D8"}
                />
              </View>

              <View style={styles.listTextWrap}>
                <Text
                  style={[
                    styles.listRowTitle,
                    selectedIndex === index && styles.listRowTitleActive,
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.listRowText} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>

              {selectedIndex === index && (
                <Feather name="check" size={18} color="#6F42D8" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Actions */}
        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneButtonText}>I Feel a Little More Steady</Text>
          <Feather name="heart" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hugiButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("HugiChat")}
        >
          <Feather name="message-circle" size={20} color="#6F42D8" />
          <Text style={styles.hugiButtonText}>Talk to Hugi instead</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Even a tiny reset can help your nervous system feel less stuck.
        </Text>
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
    marginBottom: 14,
  },

  circleButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0E2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3D2F8",
  },

  topTitle: {
    color: "#2B2463",
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "850",
    letterSpacing: -0.5,
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },

  heroIcon: {
    width: 78,
    height: 78,
    marginRight: 14,
  },

  heroTextWrap: {
    flex: 1,
  },

  heroTitle: {
    color: "#2B2463",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "850",
    marginBottom: 5,
  },

  heroText: {
    color: "#5B5672",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "650",
  },

  movementCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 22,
    paddingVertical: 24,
    marginBottom: 15,
  },

  movementTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  iconBubble: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  stepPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },

  stepPillText: {
    color: "#6F42D8",
    fontSize: 13,
    fontWeight: "850",
  },

  movementTitle: {
    color: "#2B2463",
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "850",
    letterSpacing: -0.4,
    marginBottom: 9,
  },

  movementDescription: {
    color: "#2B2463",
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "650",
    marginBottom: 18,
  },

  pauseCard: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  pauseText: {
    flex: 1,
    color: "#2B2463",
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "700",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 11,
    marginBottom: 16,
  },

  secondaryButton: {
    flex: 0.85,
    minHeight: 56,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3D2F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  secondaryButtonText: {
    color: "#6F42D8",
    fontSize: 14.5,
    fontWeight: "850",
  },

  primaryButton: {
    flex: 1.25,
    minHeight: 56,
    borderRadius: 21,
    backgroundColor: "#8B5BE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "850",
  },

  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },

  listTitle: {
    color: "#2B2463",
    fontSize: 17,
    fontWeight: "850",
    marginBottom: 10,
  },

  listRow: {
    minHeight: 56,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 6,
  },

  listRowActive: {
    backgroundColor: "#F0E2FF",
  },

  listIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#F0E2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  listIconBubbleActive: {
    backgroundColor: "#8B5BE8",
  },

  listTextWrap: {
    flex: 1,
  },

  listRowTitle: {
    color: "#2B2463",
    fontSize: 14.5,
    fontWeight: "850",
    marginBottom: 2,
  },

  listRowTitleActive: {
    color: "#6F42D8",
  },

  listRowText: {
    color: "#837E96",
    fontSize: 12.2,
    fontWeight: "650",
  },

  doneButton: {
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: "#8B5BE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "850",
  },

  hugiButton: {
    minHeight: 54,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3D2F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },

  hugiButtonText: {
    color: "#6F42D8",
    fontSize: 15,
    fontWeight: "850",
  },

  footerText: {
    color: "#837E96",
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "650",
    textAlign: "center",
  },
});