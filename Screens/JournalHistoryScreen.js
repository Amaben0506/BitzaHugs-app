import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const formatDate = (ds) => {
  if (!ds) return "Saved entry";
  return new Date(ds).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (ds) => {
  if (!ds) return "";
  return new Date(ds).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const formatMood = (mood) => {
  if (!mood || mood === "not selected") return "Not selected";
  return mood.charAt(0).toUpperCase() + mood.slice(1);
};

export default function JournalHistoryScreen({ navigation }) {
  const [entries, setEntries] = useState([]);

  // Self-check premium
  useFocusEffect(useCallback(() => {
    const checkPremium = async () => {
      const premium = await AsyncStorage.getItem("bitzaIsPremium");
      if (premium !== "true") navigation.replace("PremiumUpgrade");
    };
    checkPremium();
  }, []));

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const saved = await AsyncStorage.getItem("calmJournalEntries");
          setEntries(saved ? JSON.parse(saved) : []);
        } catch (e) {
          console.log("Error loading entries:", e);
        }
      };
      load();
    }, [])
  );

  const deleteEntry = async (id) => {
    try {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      await AsyncStorage.setItem("calmJournalEntries", JSON.stringify(updated));
    } catch (e) {
      console.log("Error deleting entry:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Journal History</Text>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.navigate("CalmJournal")} activeOpacity={0.85}>
            <Feather name="plus" size={20} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require("../assets/icons/hugi-writing-journal.png")} style={styles.hugiImage} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Your calm notes live here.</Text>
            <Text style={styles.heroText}>Look back at what you felt, what helped, and how far you've come.</Text>
          </View>
        </View>

        {/* Empty State */}
        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Image source={require("../assets/icons/support-calm-journal.png")} style={styles.emptyIcon} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No journal entries yet.</Text>
            <Text style={styles.emptyText}>When you save a calm journal entry, it will show up here.</Text>
            <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate("CalmJournal")} activeOpacity={0.9}>
              <Text style={styles.startButtonText}>Write First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              activeOpacity={0.88}
              onPress={() => navigation.navigate("JournalEntryDetail", { entry })}
            >
              <View style={styles.entryHeader}>
                <View style={styles.entryDateWrap}>
                  <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
                  <Text style={styles.entryTime}>{formatTime(entry.createdAt)}</Text>
                </View>
                <View style={styles.entryRightSide}>
                  <View style={styles.savedBadge}>
                    <Feather name="heart" size={13} color="#6F42D8" />
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                    activeOpacity={0.85}
                  >
                    <Feather name="trash-2" size={14} color="#D86A5B" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.entryPreview} numberOfLines={4}>{entry.text}</Text>

              <View style={styles.entryFooter}>
                <View style={styles.moodPill}>
                  <Text style={styles.moodPillText}>Mood: {formatMood(entry.mood)}</Text>
                </View>
                <View style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>View Entry</Text>
                  <Feather name="chevron-right" size={14} color="#6F42D8" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", marginBottom: 12,
  },
  hugiImage: { width: 60, height: 60, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  emptyCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 18, paddingVertical: 22, alignItems: "center",
    shadowColor: "#BFA99D", shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 2,
  },
  emptyIcon: { width: 64, height: 64, marginBottom: 10 },
  emptyTitle: { color: "#2B2463", fontSize: 16, fontWeight: "800", marginBottom: 5 },
  emptyText: { color: "#5B5672", fontSize: 12, lineHeight: 17, fontWeight: "600", textAlign: "center", marginBottom: 14 },
  startButton: {
    height: 42, borderRadius: 14, backgroundColor: "#8B5BE8", paddingHorizontal: 18,
    alignItems: "center", justifyContent: "center",
  },
  startButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  entryCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 13, paddingVertical: 12, marginBottom: 10,
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  entryDateWrap: { flex: 1 },
  entryDate: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 1 },
  entryTime: { color: "#837E96", fontSize: 11, fontWeight: "600" },
  entryRightSide: { flexDirection: "row", alignItems: "center", gap: 7 },
  savedBadge: { width: 28, height: 28, borderRadius: 10, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  deleteButton: { width: 28, height: 28, borderRadius: 10, backgroundColor: "#FFE7E1", alignItems: "center", justifyContent: "center" },

  entryPreview: { color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "600", marginBottom: 10 },

  entryFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moodPill: { backgroundColor: "#F0E2FF", borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
  moodPillText: { color: "#6F42D8", fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
  readMoreButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  readMoreText: { color: "#6F42D8", fontSize: 11, fontWeight: "800" },
});