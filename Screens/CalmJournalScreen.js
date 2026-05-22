import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from "@expo/vector-icons";

const moods = [
  { label: "Overwhelmed", value: "overwhelmed", icon: require("../assets/icons/emotion-overwhelmed-face.png"), bg: "#FFE6E4" },
  { label: "Struggling", value: "struggling", icon: require("../assets/icons/emotion-struggling-face.png"), bg: "#FFF0DF" },
  { label: "Okay", value: "okay", icon: require("../assets/icons/emotion-okay-face.png"), bg: "#FFF7DF" },
  { label: "Hopeful", value: "hopeful", icon: require("../assets/icons/emotion-happy-face.png"), bg: "#EEF7E8" },
  { label: "Good", value: "good", icon: require("../assets/icons/emotion-good-face.png"), bg: "#E7F7F4" },
];

const prompts = [
  "What feels heavy right now?",
  "What do I need most in this moment?",
  "What is one tiny thing I handled today?",
  "What helped me feel even a little better?",
  "What would I say to a friend feeling this way?",
];

export default function CalmJournalScreen({ navigation, route }) {
  const startingMood = route?.params?.mood || null;
  const [entry, setEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState(startingMood);

  const addPrompt = () => {
    const p = prompts[Math.floor(Math.random() * prompts.length)];
    setEntry((prev) => prev.trim().length > 0 ? `${prev}\n\n${p}\n` : `${p}\n`);
  };

  const saveEntry = async () => {
    if (!entry.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      text: entry.trim(),
      mood: selectedMood || "not selected",
      createdAt: new Date().toISOString(),
    };
    try {
      const existing = await AsyncStorage.getItem("calmJournalEntries");
      const parsed = existing ? JSON.parse(existing) : [];
      await AsyncStorage.setItem("calmJournalEntries", JSON.stringify([newEntry, ...parsed]));
      navigation.navigate("JournalHistory");
    } catch (e) {
      console.log("Error saving entry:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Calm Journal</Text>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
            <Feather name="heart" size={20} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require("../assets/icons/hugi-writing-journal.png")} style={styles.hugiImage} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>This is your safe space.</Text>
            <Text style={styles.heroText}>There's no right or wrong way to write. Just be real with you.</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What's on your mind today?</Text>
          <TouchableOpacity style={styles.promptButton} onPress={addPrompt} activeOpacity={0.85}>
            <Feather name="zap" size={14} color="#6F42D8" />
            <Text style={styles.promptButtonText}>Prompt</Text>
          </TouchableOpacity>
        </View>

        {/* Text Box */}
        <View style={styles.textBoxWrap}>
          <TextInput
            style={styles.textBox}
            value={entry}
            onChangeText={setEntry}
            placeholder="Write whatever you're feeling..."
            placeholderTextColor="#A8A0A5"
            multiline
            textAlignVertical="top"
          />
          <Image source={require("../assets/icons/decor-leaves.png")} style={styles.textBoxLeaves} resizeMode="contain" />
        </View>

        {/* Mood Picker */}
        <Text style={styles.moodTitle}>How are you feeling as you write?</Text>
        <View style={styles.moodRow}>
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.value;
            return (
              <TouchableOpacity
                key={mood.value}
                style={[styles.moodCard, { backgroundColor: mood.bg }, isSelected && styles.moodCardSelected]}
                activeOpacity={0.85}
                onPress={() => setSelectedMood(mood.value)}
              >
                <Image source={mood.icon} style={styles.moodIcon} resizeMode="contain" />
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>{mood.label}</Text>
                {isSelected && (
                  <View style={styles.selectedCheck}>
                    <Feather name="check" size={10} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reminder */}
        <View style={styles.reminderCard}>
          <Image source={require("../assets/icons/support-positive-reminder.png")} style={styles.reminderIcon} resizeMode="contain" />
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderTitle}>Small reminder 💜</Text>
            <Text style={styles.reminderText}>
              You are allowed to feel.{"\n"}You are allowed to heal.{"\n"}You are enough, always.
            </Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveEntry} activeOpacity={0.88}>
            <Feather name="star" size={15} color="#6F42D8" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Done Card */}
        <View style={styles.doneCard}>
          <Image source={require("../assets/icons/hugi-writing-journal.png")} style={styles.doneHugi} resizeMode="contain" />
          <View style={styles.doneTextWrap}>
            <Text style={styles.doneText}>You showed up for yourself today.{"\n"}That's something to be proud of.</Text>
          </View>
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()} activeOpacity={0.9}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

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
    backgroundColor: "#F6ECFF", borderRadius: 18, borderWidth: 1, borderColor: "#E3D2F8",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    marginBottom: 12, overflow: "hidden",
  },
  hugiImage: { width: 64, height: 64, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 10 },
  sectionTitle: { flex: 1, color: "#2B2463", fontSize: 15, fontWeight: "800" },
  promptButton: {
    height: 34, borderRadius: 12, backgroundColor: "#F0E2FF", borderWidth: 1,
    borderColor: "#D8C3F7", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 5,
  },
  promptButtonText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },

  textBoxWrap: {
    minHeight: 180, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1,
    borderColor: "#EFE4DC", marginBottom: 14, padding: 13,
    shadowColor: "#BFA99D", shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8, elevation: 2, position: "relative", overflow: "hidden",
  },
  textBox: {
    flex: 1, minHeight: 150, color: "#2B2463", fontSize: 14, lineHeight: 21,
    fontWeight: "600", padding: 0, zIndex: 2,
  },
  textBoxLeaves: { width: 40, height: 50, position: "absolute", right: 10, bottom: 8, opacity: 0.45 },

  moodTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  moodRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  moodCard: {
    width: "19%", minHeight: 78, borderRadius: 16, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.75)", position: "relative",
  },
  moodCardSelected: { borderColor: "#8B5BE8", borderWidth: 2 },
  moodIcon: { width: 34, height: 34, marginBottom: 4 },
  moodLabel: { color: "#2B2463", fontSize: 9.5, lineHeight: 12, fontWeight: "700", textAlign: "center" },
  moodLabelSelected: { color: "#6F42D8" },
  selectedCheck: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: "#8B5BE8",
    alignItems: "center", justifyContent: "center", position: "absolute", top: 4, right: 4,
  },

  reminderCard: {
    backgroundColor: "#FFE8DC", borderRadius: 18, borderWidth: 1, borderColor: "#FFD0C0",
    paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", marginBottom: 10,
  },
  reminderIcon: { width: 48, height: 48, marginRight: 10 },
  reminderTextWrap: { flex: 1 },
  reminderTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  reminderText: { color: "#2B2463", fontSize: 11, lineHeight: 16, fontWeight: "600" },
  saveButton: {
    height: 40, borderRadius: 14, borderWidth: 1.5, borderColor: "#8B5BE8",
    backgroundColor: "#FFF9F2", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 5, marginLeft: 8,
  },
  saveButtonText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },

  doneCard: {
    backgroundColor: "#F0E2FF", borderRadius: 18, borderWidth: 1, borderColor: "#E3D2F8",
    paddingHorizontal: 12, paddingVertical: 11, flexDirection: "row", alignItems: "center",
  },
  doneHugi: { width: 48, height: 48, marginRight: 10 },
  doneTextWrap: { flex: 1 },
  doneText: { color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "700" },
  doneButton: {
    width: 72, height: 38, borderRadius: 14, backgroundColor: "#8B5BE8",
    alignItems: "center", justifyContent: "center", marginLeft: 8,
  },
  doneButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});