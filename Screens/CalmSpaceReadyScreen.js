import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  View,
  Text,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isIpad = width >= 768;

const checkItems = [
  {
    icon: "person-outline",
    iconColor: "#7548D8",
    bg: "#F0E2FF",
    title: "Child Profile",
    subtitle: "Personalized to support your child.",
  },
  {
    icon: "happy-outline",
    iconColor: "#4A9E5C",
    bg: "#EEF7E9",
    title: "Sensory Supports",
    subtitle: "Chosen to help them feel regulated.",
  },
  {
    icon: "heart-outline",
    iconColor: "#EF8F7D",
    bg: "#FFE7E0",
    title: "Caregiver Support",
    subtitle: "Tools to help you feel supported.",
  },
  {
    icon: "home-outline",
    iconColor: "#D99A3D",
    bg: "#FFF0DF",
    title: "Calm Space",
    subtitle: "Your safe place, all in one app.",
  },
];

export default function CalmSpaceReadyScreen({ navigation }) {
  const [isStarting, setIsStarting] = useState(false);

  const handleBegin = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      await AsyncStorage.setItem("bitzaOnboardingComplete", "true");
    } catch (e) {
      console.log("Error saving onboarding state:", e);
    }
    navigation.replace("CreateAccount");
  };

  return (
    <LinearGradient
      colors={["#F0E2FF", "#FFF9F2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Top emoji decorations */}
          <View style={styles.decorRow}>
            <Text style={styles.decorEmoji}>💜</Text>
            <Text style={styles.decorEmoji}>✨</Text>
            <Text style={styles.decorEmoji}>🤍</Text>
          </View>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>
              <Text style={styles.logoBitza}>Bitza</Text>
              <Text style={styles.logoHugs}>Hugs</Text>
            </Text>
          </View>

          {/* Bunny */}
          <View style={styles.bunnyWrap}>
            <Text style={styles.bunnyEmoji}>🐰</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Your calm space{"\n"}is ready!</Text>
          <Text style={styles.subtext}>
            You've taken an important step toward more peaceful days for you and your child.
          </Text>

          {/* Checklist */}
          <View style={styles.checklistCard}>
            {checkItems.map((item, index) => (
              <View
                key={item.title}
                style={[
                  styles.checkRow,
                  index === checkItems.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={[styles.checkIconBubble, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.checkTextWrap}>
                  <Text style={styles.checkTitle}>{item.title}</Text>
                  <Text style={styles.checkSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.checkCircle}>
                  <Feather name="check" size={14} color="#FFFFFF" />
                </View>
              </View>
            ))}
          </View>

          {/* Encouragement card */}
          <View style={styles.encourageCard}>
            <Text style={styles.encourageEmoji}>💜</Text>
            <View style={styles.encourageTextWrap}>
              <Text style={styles.encourageTitle}>You're doing something amazing.</Text>
              <Text style={styles.encourageText}>
                You don't have to do it all alone. We're here for you — every step of the way. 💜
              </Text>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.beginButton, isStarting && styles.beginButtonDisabled]}
            activeOpacity={0.86}
            onPress={handleBegin}
            disabled={isStarting}
            accessibilityRole="button"
            accessibilityLabel="Let's Go to My Calm Space"
          >
            <Text style={styles.beginButtonText}>
              {isStarting ? "Loading..." : "Let's Go to My Calm Space →"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: isIpad ? "12%" : "6%",
    paddingTop: isIpad ? 50 : 20,
    paddingBottom: 40,
  },

  decorRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  decorEmoji: {
    fontSize: isIpad ? 28 : 22,
    opacity: 0.8,
  },

  logoWrap: { alignItems: "center", marginBottom: 8 },
  logoText: {
    fontSize: isIpad ? 48 : 36,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  logoBitza: { color: "#2B2463" },
  logoHugs: { color: "#7548D8" },

  bunnyWrap: {
    width: isIpad ? 120 : 90,
    height: isIpad ? 120 : 90,
    borderRadius: isIpad ? 60 : 45,
    backgroundColor: "#F0E2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E3D2F8",
    shadowColor: "#7548D8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  bunnyEmoji: { fontSize: isIpad ? 60 : 46 },

  headline: {
    fontSize: isIpad ? 44 : 32,
    fontWeight: "900",
    color: "#2B2463",
    textAlign: "center",
    lineHeight: isIpad ? 54 : 40,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtext: {
    fontSize: isIpad ? 18 : 14,
    color: "#5B5672",
    textAlign: "center",
    lineHeight: isIpad ? 28 : 22,
    maxWidth: isIpad ? "80%" : "90%",
    fontWeight: "500",
    marginBottom: 22,
  },

  checklistCard: {
    width: "100%",
    maxWidth: isIpad ? 560 : 999,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
    shadowColor: "#BFA99D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8E2",
    gap: 12,
  },
  checkIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  checkTextWrap: { flex: 1 },
  checkTitle: {
    color: "#2B2463",
    fontSize: isIpad ? 16 : 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  checkSubtitle: {
    color: "#837E96",
    fontSize: isIpad ? 13 : 11,
    fontWeight: "600",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#7548D8",
    alignItems: "center",
    justifyContent: "center",
  },

  encourageCard: {
    width: "100%",
    maxWidth: isIpad ? 560 : 999,
    backgroundColor: "#F6ECFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3D2F8",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  encourageEmoji: { fontSize: isIpad ? 36 : 28 },
  encourageTextWrap: { flex: 1 },
  encourageTitle: {
    color: "#7548D8",
    fontSize: isIpad ? 15 : 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  encourageText: {
    color: "#5B5672",
    fontSize: isIpad ? 13 : 11,
    lineHeight: isIpad ? 20 : 16,
    fontWeight: "600",
  },

  beginButton: {
    width: "100%",
    maxWidth: isIpad ? 520 : 999,
    backgroundColor: "#7548D8",
    paddingVertical: isIpad ? 22 : 17,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7548D8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
  },
  beginButtonDisabled: { opacity: 0.7 },
  beginButtonText: {
    color: "#FFFFFF",
    fontSize: isIpad ? 20 : 16,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
});