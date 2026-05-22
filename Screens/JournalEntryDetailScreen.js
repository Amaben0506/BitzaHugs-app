import React from "react";
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
import { Feather } from "@expo/vector-icons";

const moodIcons = {
  overwhelmed: require("../assets/icons/emotion-overwhelmed-face.png"),
  struggling: require("../assets/icons/emotion-struggling-face.png"),
  okay: require("../assets/icons/emotion-okay-face.png"),
  hopeful: require("../assets/icons/emotion-happy-face.png"),
  good: require("../assets/icons/emotion-good-face.png"),
};

const formatDate = (ds) => {
  if (!ds) return "Saved entry";
  return new Date(ds).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
};

const formatTime = (ds) => {
  if (!ds) return "";
  return new Date(ds).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export default function JournalEntryDetailScreen({ navigation, route }) {
  const entry = route?.params?.entry;

  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Journal entry not found.</Text>
          <TouchableOpacity style={styles.backHomeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backHomeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const moodIcon = entry?.mood ? moodIcons[entry.mood] : null;
  const moodLabel = entry?.mood && entry.mood !== "not selected"
    ? entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)
    : "Not selected";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Journal Entry</Text>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
            <Feather name="heart" size={18} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require("../assets/icons/hugi-writing-journal.png")} style={styles.hugiImage} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>You saved this moment.</Text>
            <Text style={styles.heroText}>Looking back can help you notice what you felt, what helped, and how far you've come.</Text>
          </View>
        </View>

        {/* Meta Card */}
        <View style={styles.metaCard}>
          <View style={styles.metaLeft}>
            <Text style={styles.dateText}>{formatDate(entry.createdAt)}</Text>
            <Text style={styles.timeText}>{formatTime(entry.createdAt)}</Text>
          </View>
          <View style={styles.moodWrap}>
            {moodIcon && <Image source={moodIcon} style={styles.moodIcon} resizeMode="contain" />}
            <Text style={styles.moodText}>{moodLabel}</Text>
          </View>
        </View>

        {/* Entry Text */}
        <View style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Feather name="edit-3" size={18} color="#6F42D8" />
            <Text style={styles.entryHeaderText}>What you wrote</Text>
          </View>
          <Text style={styles.entryText}>{entry.text}</Text>
          <Image source={require("../assets/icons/decor-leaves.png")} style={styles.leaves} resizeMode="contain" />
        </View>

        {/* Reflection */}
        <View style={styles.reflectionCard}>
          <Image source={require("../assets/icons/decor-little-purple-heart.png")} style={styles.heartIcon} resizeMode="contain" />
          <View style={styles.reflectionTextWrap}>
            <Text style={styles.reflectionTitle}>Gentle reflection</Text>
            <Text style={styles.reflectionText}>This entry is proof that you paused and checked in with yourself. That matters.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()} activeOpacity={0.9}>
          <Text style={styles.doneButtonText}>Back to Journal History</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", marginBottom: 10,
  },
  hugiImage: { width: 60, height: 60, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  metaCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 13, paddingVertical: 12, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 10,
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  metaLeft: { flex: 1 },
  dateText: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  timeText: { color: "#837E96", fontSize: 11, fontWeight: "600" },
  moodWrap: { alignItems: "center", marginLeft: 10 },
  moodIcon: { width: 34, height: 34, marginBottom: 3 },
  moodText: { color: "#6F42D8", fontSize: 10, fontWeight: "800", textTransform: "capitalize" },

  entryCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 20, marginBottom: 10, minHeight: 180,
    shadowColor: "#BFA99D", shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 2,
    overflow: "hidden",
  },
  entryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  entryHeaderText: { color: "#2B2463", fontSize: 13, fontWeight: "800" },
  entryText: { color: "#2B2463", fontSize: 14, lineHeight: 21, fontWeight: "600", zIndex: 2 },
  leaves: { width: 44, height: 56, position: "absolute", right: 12, bottom: 10, opacity: 0.3 },

  reflectionCard: {
    backgroundColor: "#FFE8DC", borderRadius: 16, borderWidth: 1, borderColor: "#FFD0C0",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    marginBottom: 12, gap: 11,
  },
  heartIcon: { width: 40, height: 40 },
  reflectionTextWrap: { flex: 1 },
  reflectionTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  reflectionText: { color: "#2B2463", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  doneButton: {
    height: 50, borderRadius: 16, backgroundColor: "#8B5BE8", alignItems: "center", justifyContent: "center",
  },
  doneButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  errorWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  errorTitle: { color: "#2B2463", fontSize: 18, fontWeight: "800", marginBottom: 14 },
  backHomeButton: {
    height: 46, borderRadius: 14, backgroundColor: "#8B5BE8", paddingHorizontal: 20,
    alignItems: "center", justifyContent: "center",
  },
  backHomeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});