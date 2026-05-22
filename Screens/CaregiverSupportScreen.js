import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// ✅ Fixed: matches key convention used throughout the app
const CAREGIVER_SUPPORT_KEY = "bitzaCaregiverSupport";

const supportOptions = [
  { id: "gentle-reminders", title: "Gentle Reminders", description: "Encouraging nudges and reminders.", icon: "notifications-outline", color: "#EF7F73", bg: "#FFE9E4", enabled: true },
  { id: "emotional-checkins", title: "Emotional Check-ins", description: "Daily mood and support check-ins.", icon: "heart-outline", color: "#EF6F8D", bg: "#FFE8EF", enabled: true },
  { id: "calming-breaks", title: "Calming Breaks", description: "Quick reset ideas for hard moments.", icon: "leaf-outline", color: "#7FA66A", bg: "#EEF5E9", enabled: true },
  { id: "breathing-support", title: "Breathing Support", description: "Guided breathing and grounding.", icon: "water-outline", color: "#6B9EDB", bg: "#EAF4FF", enabled: false },
  { id: "journal-reflections", title: "Journal Reflections", description: "Prompts to process the day.", icon: "pencil-outline", color: "#8C55F6", bg: "#F3EAFE", enabled: false },
];

export default function CaregiverSupportScreen({ navigation }) {
  const [toggles, setToggles] = useState(
    supportOptions.reduce((acc, item) => {
      acc[item.id] = item.enabled;
      return acc;
    }, {})
  );

  const toggleOption = (id) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveCaregiverSupports = async () => {
    const selected = supportOptions
      .filter((item) => toggles[item.id])
      .map((item) => ({ id: item.id, title: item.title, description: item.description }));

    try {
      await AsyncStorage.setItem(CAREGIVER_SUPPORT_KEY, JSON.stringify(selected));
      // ✅ Fixed: correct route name
      navigation.navigate("CalmSpaceReady");
    } catch (error) {
      console.log("Error saving caregiver supports:", error);
      Alert.alert("Oops", "Something went wrong saving your caregiver supports.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F3" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#2D2357" />
          </TouchableOpacity>
          <View style={styles.brandRow}>
            <Ionicons name="heart" size={24} color="#8C35F6" />
            <Text style={styles.brandText}>Bitza<Text style={styles.brandAccent}>Hugs</Text></Text>
          </View>
          <View style={styles.topSpacer} />
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>

        {/* Title */}
        <Text style={styles.title}>You matter too.</Text>
        <Text style={styles.subtitle}>
          Caregiver support helps you show up{"\n"}with more calm and confidence.
        </Text>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introIconCircle}>
            <Ionicons name="heart-outline" size={24} color="#8C55F6" />
          </View>
          <Text style={styles.introText}>
            Choose the support that would feel helpful right now.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionList}>
          {supportOptions.map((item) => (
            <View key={item.id} style={styles.optionCard}>
              <View style={[styles.optionIconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </View>
              <Switch
                value={toggles[item.id]}
                onValueChange={() => toggleOption(item.id)}
                trackColor={{ false: "#D8D5D3", true: "#8C35F6" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D8D5D3"
                style={styles.switch}
              />
            </View>
          ))}
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="heart-outline" size={20} color="#8C55F6" />
          <Text style={styles.noteText}>You can change these anytime. Support for you matters too.</Text>
        </View>

        {/* Coming Soon Note */}
        <View style={styles.comingSoonCard}>
          <Ionicons name="notifications-outline" size={18} color="#4C9ED9" />
          <View style={styles.comingSoonTextWrap}>
            <Text style={styles.comingSoonTitle}>Coming in a future update</Text>
            <Text style={styles.comingSoonText}>These preferences will activate push notifications and personalized daily reminders once notifications are enabled. Your selections are saved and ready.</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.button} activeOpacity={0.86} onPress={saveCaregiverSupports}>
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.75}
          onPress={() => navigation.navigate("CalmSpaceReady")}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F3" },
  container: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F1E5FF", alignItems: "center", justifyContent: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandText: { fontSize: 22, fontWeight: "900", color: "#20204F" },
  brandAccent: { color: "#F1768E" },
  topSpacer: { width: 44 },

  progressRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 4 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#D9D4D0" },
  progressActive: { backgroundColor: "#8C55F6", width: 24 },
  stepLabel: { textAlign: "center", color: "#837E96", fontSize: 11, fontWeight: "700", marginBottom: 12 },

  title: { fontSize: 30, lineHeight: 36, fontWeight: "900", color: "#111A4D", textAlign: "center", letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, color: "#3C365F", textAlign: "center", fontWeight: "600", marginBottom: 12 },

  introCard: { borderRadius: 18, backgroundColor: "#F5E9FF", borderWidth: 1, borderColor: "#E4CFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, gap: 12 },
  introIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  introText: { flex: 1, fontSize: 14, lineHeight: 20, color: "#3C365F", fontWeight: "700" },

  optionList: { gap: 8, marginBottom: 12 },
  optionCard: { height: 68, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "#F1E7DF", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, shadowColor: "#D8C6B8", shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  optionIconBox: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 11 },
  optionTextWrap: { flex: 1, paddingRight: 6 },
  optionTitle: { fontSize: 14, fontWeight: "900", color: "#111A4D", marginBottom: 1 },
  optionDescription: { fontSize: 11, lineHeight: 15, color: "#6C6284", fontWeight: "600" },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginRight: -4 },

  noteCard: { borderRadius: 16, backgroundColor: "#F5E9FF", borderWidth: 1, borderColor: "#E4CFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, gap: 9 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17, color: "#4F3B68", fontWeight: "700" },

  button: { width: "100%", height: 56, borderRadius: 22, backgroundColor: "#8C35F6", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, shadowColor: "#8C55F6", shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4, marginBottom: 10 },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },

  comingSoonCard: { backgroundColor: "#E7F4FF", borderRadius: 14, borderWidth: 1, borderColor: "#C8E3F5", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  comingSoonTextWrap: { flex: 1 },
  comingSoonTitle: { color: "#2B2463", fontSize: 12, fontWeight: "800", marginBottom: 3 },
  comingSoonText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  skipButton: { alignItems: "center", paddingVertical: 6 },
  skipText: { color: "#837E96", fontSize: 13, fontWeight: "700" },
});