import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// ✅ Fixed: matches key convention used throughout the app
const SENSORY_SUPPORTS_KEY = "bitzaSensorySupports";

const supports = [
  { id: "loud-noises", title: "Loud Noises", description: "Unexpected sounds", icon: "volume-high-outline", color: "#8C55F6" },
  { id: "transitions", title: "Transitions", description: "Changes in routine", icon: "sync-outline", color: "#40A99B" },
  { id: "bright-lights", title: "Bright Lights", description: "Strong lights", icon: "sunny-outline", color: "#F3A63D" },
  { id: "textures", title: "Textures", description: "Tags or fabrics", icon: "hand-left-outline", color: "#F28C8C" },
  { id: "visuals", title: "Visuals", description: "Busy spaces", icon: "image-outline", color: "#4AA9B1" },
  { id: "timers", title: "Timers", description: "Countdown support", icon: "time-outline", color: "#8C55F6" },
  { id: "music", title: "Music", description: "Soft sounds", icon: "musical-notes-outline", color: "#8C55F6" },
  { id: "quiet-space", title: "Quiet Space", description: "A reset place", icon: "home-outline", color: "#7BA85E" },
  { id: "pressure", title: "Deep Pressure", description: "Hugs or blankets", icon: "heart-outline", color: "#F28C8C" },
];

export default function SensorySupportsScreen({ navigation }) {
  const [selectedSupports, setSelectedSupports] = useState(
    supports.reduce((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {})
  );

  const toggleSupport = (id) => {
    setSelectedSupports((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveSensorySupports = async () => {
    const selectedList = supports
      .filter((item) => selectedSupports[item.id])
      .map((item) => ({ id: item.id, title: item.title, description: item.description }));

    try {
      await AsyncStorage.setItem(SENSORY_SUPPORTS_KEY, JSON.stringify(selectedList));
      // ✅ Fixed: correct route name matching App.js
      navigation.navigate("CaregiverSupport");
    } catch (error) {
      console.log("Error saving sensory supports:", error);
      Alert.alert("Oops", "Something went wrong saving these supports.");
    }
  };

  const selectedCount = Object.values(selectedSupports).filter(Boolean).length;

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
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.stepLabel}>Step 2 of 4</Text>

        {/* Title */}
        <Text style={styles.title}>What sensory supports{"\n"}help most?</Text>
        <Text style={styles.subtitle}>
          Choose anything that applies.{"\n"}You can change this anytime.
        </Text>

        {/* Selected count */}
        {selectedCount > 0 && (
          <View style={styles.countBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#8C35F6" />
            <Text style={styles.countText}>{selectedCount} selected</Text>
          </View>
        )}

        {/* Grid */}
        <View style={styles.grid}>
          {supports.map((item) => {
            const isSelected = selectedSupports[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => toggleSupport(item.id)}
                style={[styles.supportCard, isSelected && styles.supportCardSelected]}
              >
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
                <Ionicons name={item.icon} size={26} color={item.color} style={styles.cardIcon} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note Card */}
        <View style={styles.noteCard}>
          <View style={styles.noteIconCircle}>
            <Ionicons name="heart-outline" size={22} color="#8C55F6" />
          </View>
          <View style={styles.noteTextWrap}>
            <Text style={styles.noteTitle}>There's no right or wrong.</Text>
            <Text style={styles.noteText}>We'll tailor support to what helps your child feel regulated.</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.button} activeOpacity={0.86} onPress={saveSensorySupports}>
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.75}
          onPress={() => navigation.navigate("CaregiverSupport")}
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

  title: { fontSize: 26, lineHeight: 32, fontWeight: "900", color: "#111A4D", textAlign: "center", letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, color: "#5F567A", textAlign: "center", fontWeight: "600", marginBottom: 12 },

  countBadge: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", backgroundColor: "#F3EAFE", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: "center", marginBottom: 10 },
  countText: { color: "#8C35F6", fontSize: 13, fontWeight: "800" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, marginBottom: 12 },
  supportCard: { width: "31%", height: 106, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "#EFE6DE", alignItems: "center", justifyContent: "center", paddingHorizontal: 6, paddingVertical: 8, position: "relative", shadowColor: "#D8C6B8", shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  supportCardSelected: { backgroundColor: "#FBF6FF", borderColor: "#9A67F6", borderWidth: 1.5 },
  checkBadge: { position: "absolute", top: 7, right: 7, width: 20, height: 20, borderRadius: 10, backgroundColor: "#8C55F6", alignItems: "center", justifyContent: "center" },
  cardIcon: { marginBottom: 7 },
  cardTitle: { fontSize: 12, fontWeight: "900", color: "#111A4D", textAlign: "center", marginBottom: 2 },
  cardDescription: { fontSize: 10, lineHeight: 13, color: "#6C6284", textAlign: "center", fontWeight: "600" },

  noteCard: { height: 62, borderRadius: 18, backgroundColor: "#F5E9FF", borderWidth: 1, borderColor: "#E4CFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 13, marginBottom: 12, gap: 10 },
  noteIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" },
  noteTextWrap: { flex: 1 },
  noteTitle: { fontSize: 13, fontWeight: "900", color: "#4F3B68", marginBottom: 1 },
  noteText: { fontSize: 11, lineHeight: 15, color: "#675A81", fontWeight: "600" },

  button: { width: "100%", height: 56, borderRadius: 22, backgroundColor: "#8C35F6", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, shadowColor: "#8C55F6", shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4, marginBottom: 10 },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },

  skipButton: { alignItems: "center", paddingVertical: 6 },
  skipText: { color: "#837E96", fontSize: 13, fontWeight: "700" },
});

