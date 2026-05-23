import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AFFIRMATIONS = [
  { text: "I am not failing. I am having a hard moment, and I can take one small step.", tag: "Hard moment", color: "#F6ECFF", accent: "#6F42D8" },
  { text: "My child's big feelings do not mean I am a bad parent.", tag: "Parent guilt", color: "#FFE6E4", accent: "#EF8F7D" },
  { text: "I can pause before I react. Softness is still strength.", tag: "Regulation", color: "#E7F4FF", accent: "#4C9ED9" },
  { text: "I do not have to fix the whole day. I can help this moment feel safer.", tag: "Overwhelm", color: "#FFF0DF", accent: "#D99A3D" },
  { text: "Routines can bend. Progress does not have to look perfect.", tag: "Routine", color: "#EEF7E8", accent: "#78A866" },
  { text: "My needs matter too. I am allowed to need support.", tag: "Self-support", color: "#F6ECFF", accent: "#6F42D8" },
  { text: "I can lower the pressure. I can choose calm over control.", tag: "Meltdown support", color: "#FFE6E4", accent: "#EF8F7D" },
  { text: "One breath. One choice. One tiny step.", tag: "Grounding", color: "#E7F4FF", accent: "#4C9ED9" },
  { text: "I am doing the best I can with what I have right now. That is enough.", tag: "Self-compassion", color: "#F6ECFF", accent: "#6F42D8" },
  { text: "Hard days do not erase all the good I have done. I am still showing up.", tag: "Hard day", color: "#FFF0DF", accent: "#D99A3D" },
  { text: "My child needs connection more than correction right now.", tag: "Connection", color: "#EEF7E8", accent: "#78A866" },
  { text: "I am allowed to feel tired. Rest is not failure.", tag: "Burnout", color: "#FFE6E4", accent: "#EF8F7D" },
  { text: "Every time I repair after a hard moment, I am teaching my child something powerful.", tag: "Repair", color: "#E7F4FF", accent: "#4C9ED9" },
  { text: "I do not have to be calm perfectly. I just have to keep trying.", tag: "Regulation", color: "#F6ECFF", accent: "#6F42D8" },
  { text: "This moment will pass. I can ride it out without making it worse.", tag: "Waiting it out", color: "#EEF7E8", accent: "#78A866" },
  { text: "Asking for help is one of the bravest things a caregiver can do.", tag: "Asking for help", color: "#FFF0DF", accent: "#D99A3D" },
  { text: "I am not alone in this. Other parents are in the trenches too.", tag: "Community", color: "#E7F4FF", accent: "#4C9ED9" },
  { text: "My child is not giving me a hard time. They are having a hard time.", tag: "Perspective", color: "#F6ECFF", accent: "#6F42D8" },
  { text: "I can set a boundary with love. Firm and gentle can coexist.", tag: "Boundaries", color: "#FFE6E4", accent: "#EF8F7D" },
  { text: "Survival mode is still mode. I am still here.", tag: "Hard season", color: "#EEF7E8", accent: "#78A866" },
  { text: "I am allowed to grieve the hard parts while still loving my child fiercely.", tag: "Grief", color: "#FFF0DF", accent: "#D99A3D" },
  { text: "Small wins count. Getting through the day is a win.", tag: "Small wins", color: "#F6ECFF", accent: "#6F42D8" },
  { text: "I know my child better than anyone. I can trust my instincts.", tag: "Trust yourself", color: "#E7F4FF", accent: "#4C9ED9" },
];

// Get today's affirmation based on day of year
const getDailyIndex = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear % AFFIRMATIONS.length;
};

const CATEGORIES = ["All", "Hard moment", "Parent guilt", "Regulation", "Overwhelm", "Self-compassion", "Grounding", "Burnout", "Connection"];

export default function AffirmationsScreen({ navigation }) {
  const dailyIndex = getDailyIndex();
  const dailyAffirmation = AFFIRMATIONS[dailyIndex];

  const [savedDaily, setSavedDaily] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedList, setSavedList] = useState([]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const nav = (screen) =>
    navigation.getParent()?.getParent()?.navigate(screen) ??
    navigation.navigate(screen);

  const toggleSaveDaily = () => setSavedDaily((s) => !s);

  const filteredAffirmations = selectedCategory === "All"
    ? AFFIRMATIONS
    : AFFIRMATIONS.filter((a) => a.tag === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Daily Affirmation</Text>
          <TouchableOpacity style={styles.circleButton} onPress={toggleSaveDaily} activeOpacity={0.85}>
            <Ionicons
              name={savedDaily ? "heart" : "heart-outline"}
              size={20}
              color={savedDaily ? "#EF8F7D" : "#2B2463"}
            />
          </TouchableOpacity>
        </View>

        {/* Date */}
        <Text style={styles.dateText}>{today}</Text>

        {/* Daily Affirmation Card */}
        <View style={[styles.dailyCard, { backgroundColor: dailyAffirmation.color, borderColor: dailyAffirmation.accent + "44" }]}>
          <View style={styles.dailyBadge}>
            <Ionicons name="sunny" size={12} color={dailyAffirmation.accent} />
            <Text style={[styles.dailyBadgeText, { color: dailyAffirmation.accent }]}>Today's Affirmation</Text>
          </View>

          <Image
            source={require("../assets/icons/decor-little-purple-heart.png")}
            style={styles.cardHeart}
            resizeMode="contain"
          />

          <Text style={styles.dailyText}>{dailyAffirmation.text}</Text>

          <View style={[styles.tagPill, { backgroundColor: dailyAffirmation.accent + "22" }]}>
            <Text style={[styles.tagText, { color: dailyAffirmation.accent }]}>{dailyAffirmation.tag}</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { borderColor: dailyAffirmation.accent }]}
            onPress={toggleSaveDaily}
            activeOpacity={0.85}
          >
            <Ionicons
              name={savedDaily ? "heart" : "heart-outline"}
              size={16}
              color={dailyAffirmation.accent}
            />
            <Text style={[styles.saveBtnText, { color: dailyAffirmation.accent }]}>
              {savedDaily ? "Saved to favorites" : "Save this affirmation"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Encouragement */}
        <View style={styles.encourageCard}>
          <Image
            source={require("../assets/icons/support-positive-reminder.png")}
            style={styles.encourageIcon}
            resizeMode="contain"
          />
          <View style={styles.encourageTextWrap}>
            <Text style={styles.encourageTitle}>A new affirmation every day.</Text>
            <Text style={styles.encourageText}>Read it once. Breathe. Let it be enough for right now.</Text>
          </View>
        </View>

        {/* Browse More */}
        <Text style={styles.sectionTitle}>Browse all affirmations</Text>
        <Text style={styles.sectionSub}>Filter by what you need most right now.</Text>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Affirmation List */}
        <View style={styles.listCard}>
          {filteredAffirmations.map((item, index) => {
            const isDaily = AFFIRMATIONS.indexOf(item) === dailyIndex;
            return (
              <View
                key={index}
                style={[
                  styles.listRow,
                  index === filteredAffirmations.length - 1 && styles.listRowLast,
                  isDaily && { backgroundColor: item.color },
                ]}
              >
                <View style={[styles.listDot, { backgroundColor: item.accent }]} />
                <View style={styles.listTextWrap}>
                  <View style={styles.listTagRow}>
                    <Text style={[styles.listTag, { color: item.accent }]}>{item.tag}</Text>
                    {isDaily && (
                      <View style={[styles.todayBadge, { backgroundColor: item.accent }]}>
                        <Text style={styles.todayBadgeText}>Today</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.listText}>{item.text}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Need More Support */}
        <View style={styles.toolsCard}>
          <Text style={styles.toolsTitle}>Need more support?</Text>
          {[
            { label: "Talk to Hugi", icon: "message-circle", bg: "#F0E2FF", color: "#6F42D8", route: "HugiChat" },
            { label: "Try a breathing exercise", icon: "wind", bg: "#E7F4FF", color: "#4C9ED9", route: "Breathing" },
            { label: "Write this feeling out", icon: "edit-3", bg: "#FFE3DA", color: "#EF8F7D", route: "CalmJournal" },
          ].map((tool, i, arr) => (
            <TouchableOpacity
              key={tool.label}
              style={[styles.toolRow, i === arr.length - 1 && styles.toolRowLast]}
              onPress={() => nav(tool.route)}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBubble, { backgroundColor: tool.bg }]}>
                <Feather name={tool.icon} size={18} color={tool.color} />
              </View>
              <Text style={styles.toolRowText}>{tool.label}</Text>
              <Feather name="chevron-right" size={17} color="#2B2463" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>You deserve support in the middle of the hard stuff too.</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  topBar: { height: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  topTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  dateText: { color: "#837E96", fontSize: 12, fontWeight: "700", textAlign: "center", marginBottom: 14 },

  dailyCard: {
    borderRadius: 24, borderWidth: 1, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 20, marginBottom: 12, alignItems: "center",
  },
  dailyBadge: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 14 },
  dailyBadgeText: { fontSize: 12, fontWeight: "800" },
  cardHeart: { width: 48, height: 48, marginBottom: 12 },
  dailyText: { color: "#2B2463", fontSize: 20, lineHeight: 29, fontWeight: "800", textAlign: "center", letterSpacing: -0.3, marginBottom: 14 },
  tagPill: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14 },
  tagText: { fontSize: 11, fontWeight: "800" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  saveBtnText: { fontSize: 12, fontWeight: "800" },

  encourageCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    gap: 11, marginBottom: 18, shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  encourageIcon: { width: 46, height: 46 },
  encourageTextWrap: { flex: 1 },
  encourageTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  encourageText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  sectionTitle: { color: "#2B2463", fontSize: 16, fontWeight: "800", marginBottom: 3 },
  sectionSub: { color: "#837E96", fontSize: 11, fontWeight: "600", marginBottom: 10 },

  categoryScroll: { paddingBottom: 12, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#F0E2FF", borderWidth: 1.5, borderColor: "#E3D2F8",
  },
  categoryChipActive: { backgroundColor: "#7548D8", borderColor: "#7548D8" },
  categoryText: { color: "#7548D8", fontSize: 12, fontWeight: "700" },
  categoryTextActive: { color: "#FFFFFF" },

  listCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12,
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  listRow: {
    flexDirection: "row", alignItems: "flex-start", paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: "#F0E8E2", gap: 10, borderRadius: 10,
    paddingHorizontal: 6,
  },
  listRowLast: { borderBottomWidth: 0 },
  listDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  listTextWrap: { flex: 1 },
  listTagRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 3 },
  listTag: { fontSize: 10, fontWeight: "800" },
  todayBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  todayBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  listText: { color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "600" },

  toolsCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12,
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  toolsTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 8 },
  toolRow: { minHeight: 46, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F0E8E2", gap: 10 },
  toolRowLast: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10 },
  toolIconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toolRowText: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "700" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});