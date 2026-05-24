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

const resetSteps = [
  {
    title: "Bring your cup close",
    text: "Set it nearby so you do not have to think too hard.",
    icon: "coffee",
  },
  {
    title: "Take one small sip",
    text: "Just one sip counts. You do not need to finish the whole drink.",
    icon: "droplet",
  },
  {
    title: "Relax your jaw",
    text: "Let your shoulders drop a little. Unclench your face if you can.",
    icon: "smile",
  },
  {
    title: "Breathe out slowly",
    text: "One long breath out. Let your body know you are still here.",
    icon: "wind",
  },
];

export default function WaterReminderScreen({ navigation }) {
  const [completed, setCompleted] = useState(false);

  const nav = (screen) =>
    navigation.getParent()?.getParent()?.navigate(screen) ??
    navigation.navigate(screen);

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

          <Text style={styles.topTitle}>Water Reset</Text>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => setCompleted(false)}
            activeOpacity={0.85}
          >
            <Feather name="refresh-cw" size={21} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image
            source={require("../assets/icons/support-water-cup.png")}
            style={styles.heroIcon}
            resizeMode="contain"
          />

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Take a small sip.</Text>
            <Text style={styles.heroText}>
              This is not about fixing everything. It is just a tiny body reset.
            </Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <Image
            source={require("../assets/icons/decor-little-purple-heart.png")}
            style={styles.heartIcon}
            resizeMode="contain"
          />

          <Text style={styles.mainTitle}>
            Your body deserves care too.
          </Text>

          <Text style={styles.mainText}>
            When things feel overwhelming, a small sip of water can be one gentle
            way to come back to yourself.
          </Text>

          <TouchableOpacity
            style={[
              styles.sipButton,
              completed && styles.sipButtonDone,
            ]}
            onPress={() => setCompleted(true)}
            activeOpacity={0.9}
          >
            {completed ? (
              <>
                <Feather name="check" size={22} color="#FFFFFF" />
                <Text style={styles.sipButtonText}>I took a sip</Text>
              </>
            ) : (
              <>
                <Feather name="droplet" size={22} color="#FFFFFF" />
                <Text style={styles.sipButtonText}>I’ll take one sip</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.sectionTitle}>Tiny reset steps</Text>

          {resetSteps.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.stepIconBubble}>
                <Feather name={step.icon} size={20} color="#4C9ED9" />
              </View>

              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Completion */}
        {completed && (
          <View style={styles.completedCard}>
            <Image
              source={require("../assets/icons/support-positive-reminder.png")}
              style={styles.completedIcon}
              resizeMode="contain"
            />

            <View style={styles.completedTextWrap}>
              <Text style={styles.completedTitle}>That counts.</Text>
              <Text style={styles.completedText}>
                One small caring action still matters.
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.hugiButton}
          activeOpacity={0.9}
          onPress={() => nav("HugiChat")}
        >
          <Feather name="message-circle" size={22} color="#FFFFFF" />
          <Text style={styles.hugiButtonText}>Talk to Hugi</Text>
          <View style={styles.hugiPremiumBadge}>
            <Text style={styles.hugiPremiumText}>✦ Premium</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneButtonText}>Back to Support</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Gentle care is still care.
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
    backgroundColor: "#E7F4FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D4E9F7",
  },

  topTitle: {
    color: "#2B2463",
    fontSize: 24,
    lineHeight: 30,
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

  mainCard: {
    backgroundColor: "#E7F4FF",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#D4E9F7",
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 15,
  },

  heartIcon: {
    width: 74,
    height: 74,
    marginBottom: 12,
  },

  mainTitle: {
    color: "#2B2463",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "850",
    textAlign: "center",
    marginBottom: 9,
  },

  mainText: {
    color: "#2B2463",
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: "650",
    textAlign: "center",
    marginBottom: 20,
  },

  sipButton: {
    minHeight: 56,
    borderRadius: 22,
    backgroundColor: "#4C9ED9",
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  sipButtonDone: {
    backgroundColor: "#78A866",
  },

  sipButtonText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "850",
  },

  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },

  sectionTitle: {
    color: "#2B2463",
    fontSize: 18,
    fontWeight: "850",
    marginBottom: 12,
  },

  stepRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 11,
  },

  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E7F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    marginTop: 4,
  },

  stepNumberText: {
    color: "#4C9ED9",
    fontSize: 13,
    fontWeight: "900",
  },

  stepIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#E7F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  stepTextWrap: {
    flex: 1,
  },

  stepTitle: {
    color: "#2B2463",
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: "850",
    marginBottom: 3,
  },

  stepText: {
    color: "#5B5672",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "650",
  },

  completedCard: {
    backgroundColor: "#EEF7E8",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8EAD0",
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  completedIcon: {
    width: 62,
    height: 62,
    marginRight: 12,
  },

  completedTextWrap: {
    flex: 1,
  },

  completedTitle: {
    color: "#2B2463",
    fontSize: 17,
    fontWeight: "850",
    marginBottom: 4,
  },

  completedText: {
    color: "#2B2463",
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "650",
  },

  hugiButton: {
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: "#8B5BE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 12,
  },

  hugiButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "850",
  },

  hugiPremiumBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 8,
  },
  hugiPremiumText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  doneButton: {
    minHeight: 54,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4E9F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  doneButtonText: {
    color: "#4C9ED9",
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