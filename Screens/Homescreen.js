import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const PURPLE = "#2D246B";
const ACCENT = "#7548D8";
const CARD = "#FFFFFF";
const BORDER = "#EFE5DD";
const SOFT_TEXT = "#8E87A0";
const BACKGROUND = "#FFF9F2";
const IS_PREMIUM = false;

// ─── Daily Affirmation Logic ──────────────────────────────────────────────────
const AFFIRMATIONS = [
  { text: "I am not failing. I am having a hard moment, and I can take one small step.", tag: "Hard moment" },
  { text: "My child's big feelings do not mean I am a bad parent.", tag: "Parent guilt" },
  { text: "I can pause before I react. Softness is still strength.", tag: "Regulation" },
  { text: "I do not have to fix the whole day. I can help this moment feel safer.", tag: "Overwhelm" },
  { text: "Routines can bend. Progress does not have to look perfect.", tag: "Routine" },
  { text: "My needs matter too. I am allowed to need support.", tag: "Self-support" },
  { text: "I can lower the pressure. I can choose calm over control.", tag: "Meltdown support" },
  { text: "One breath. One choice. One tiny step.", tag: "Grounding" },
  { text: "I am doing the best I can with what I have right now. That is enough.", tag: "Self-compassion" },
  { text: "Hard days do not erase all the good I have done. I am still showing up.", tag: "Hard day" },
  { text: "My child needs connection more than correction right now.", tag: "Connection" },
  { text: "I am allowed to feel tired. Rest is not failure.", tag: "Burnout" },
  { text: "Every time I repair after a hard moment, I am teaching my child something powerful.", tag: "Repair" },
  { text: "I do not have to be calm perfectly. I just have to keep trying.", tag: "Regulation" },
  { text: "This moment will pass. I can ride it out without making it worse.", tag: "Waiting it out" },
  { text: "Asking for help is one of the bravest things a caregiver can do.", tag: "Asking for help" },
  { text: "I am not alone in this. Other parents are in the trenches too.", tag: "Community" },
  { text: "My child is not giving me a hard time. They are having a hard time.", tag: "Perspective" },
  { text: "I can set a boundary with love. Firm and gentle can coexist.", tag: "Boundaries" },
  { text: "Survival mode is still mode. I am still here.", tag: "Hard season" },
  { text: "I am allowed to grieve the hard parts while still loving my child fiercely.", tag: "Grief" },
  { text: "Small wins count. Getting through the day is a win.", tag: "Small wins" },
  { text: "I know my child better than anyone. I can trust my instincts.", tag: "Trust yourself" },
];

const getDailyAffirmation = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
};

// ─── Personalization Logic ────────────────────────────────────────────────────
const getPersonalizedSuggestions = (profile) => {
  if (!profile) return null;
  const suggestions = [];
  const triggers = profile.triggers?.toLowerCase() || "";
  const sensory = profile.sensoryNeeds?.toLowerCase() || "";
  const calming = profile.calmingStrategies?.toLowerCase() || "";
  const comm = profile.communicationStyle?.toLowerCase() || "";

  if (triggers.includes("transit") || triggers.includes("change") || triggers.includes("wait")) {
    suggestions.push({ title: "Transition Timer", reason: "Transitions can be hard — a timer can help prepare.", icon: require("../assets/icons/tool-transition-hourglass.png"), screen: "Transitions", color: "#EFE2FF" });
  }
  if (sensory.includes("noise") || sensory.includes("sound") || sensory.includes("loud")) {
    suggestions.push({ title: "Calming Sounds", reason: "Soft sounds may help with noise sensitivity.", icon: require("../assets/icons/tool-calming-sounds-headphones.png"), screen: "CalmingSounds", color: "#FFE7E0" });
  }
  if (sensory.includes("overwhelm") || sensory.includes("light") || sensory.includes("crowd")) {
    suggestions.push({ title: "Grounding Steps", reason: "Grounding can help when the world feels like too much.", icon: require("../assets/icons/support-grounding-feet.png"), screen: "GroundingSteps", color: "#EEF7E9" });
  }
  if (calming.includes("breath") || calming.includes("calm") || calming.includes("quiet")) {
    suggestions.push({ title: "Breathing Exercise", reason: "A quick breathing reset based on what helps your child.", icon: require("../assets/icons/support-breathing.png"), screen: "Breathing", color: "#E3F2FF" });
  }
  if (comm.includes("nonverbal") || comm.includes("aac") || comm.includes("limited")) {
    suggestions.push({ title: "Talk to Hugi", reason: "Hugi can help you think through what your child needs.", icon: require("../assets/icons/support-heart-hug.png"), screen: "HugiChat", color: "#F6ECFF" });
  }
  if (profile.meltdownNotes?.trim()) {
    suggestions.push({ title: "Meltdown Plan", reason: "You have a saved plan — keep it nearby for hard moments.", icon: require("../assets/icons/support-heart-hands.png"), screen: "MeltdownPlan", color: "#FFE7E0" });
  }
  if (calming.length > 10) {
    suggestions.push({ title: "Calm Journal", reason: "Writing what helped can build patterns over time.", icon: require("../assets/icons/support-calm-journal.png"), screen: "CalmJournal", color: "#EEF7E9" });
  }

  const seen = new Set();
  return suggestions.filter((item) => {
    if (seen.has(item.screen)) return false;
    seen.add(item.screen);
    return true;
  }).slice(0, 3);
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [childProfile, setChildProfile] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  const dailyAffirmation = getDailyAffirmation();

  useFocusEffect(
    useCallback(() => {
      const loadProfiles = async () => {
        try {
          const savedChild = await AsyncStorage.getItem("bitzaChildProfile");
          const savedParent = await AsyncStorage.getItem("bitzaParentProfile");
          const premium = await AsyncStorage.getItem("bitzaIsPremium");

          if (savedChild) {
            const profile = JSON.parse(savedChild);
            setChildProfile(profile);
            setSuggestions(getPersonalizedSuggestions(profile));
          } else {
            setChildProfile(null);
            setSuggestions(null);
          }
          if (savedParent) setParentProfile(JSON.parse(savedParent));
          setIsPremium(premium === "true");
        } catch (error) {
          console.log("Error loading profiles:", error);
        }
      };
      loadProfiles();
    }, [])
  );

  const routineItems = [
    { title: "Morning Routine", time: "7:00 AM", icon: require("../assets/icons/routine-morning-sun.png"), complete: true },
    { title: "School / Learning", time: "8:30 AM", icon: require("../assets/icons/routine-school-book.png"), complete: true },
    { title: "Lunch", time: "12:30 PM", icon: require("../assets/icons/routine-lunch-meal.png"), complete: false },
    { title: "Play / Break", time: "2:00 PM", icon: require("../assets/icons/support-fidget-spinner.png"), complete: false },
  ];

  const moodItems = [
    { label: "Overwhelmed", icon: require("../assets/icons/emotion-overwhelmed-face.png") },
    { label: "Struggling", icon: require("../assets/icons/emotion-struggling-face.png") },
    { label: "Okay", icon: require("../assets/icons/emotion-okay-face.png") },
    { label: "Hopeful", icon: require("../assets/icons/emotion-happy-face.png") },
    { label: "Good", icon: require("../assets/icons/emotion-good-face.png") },
  ];

  const tools = [
    { title: "Transition", text: "Timer", icon: require("../assets/icons/tool-transition-hourglass.png"), screen: "Transitions", color: "#EFE2FF" },
    { title: "Breathing", text: "Exercise", icon: require("../assets/icons/support-breathing.png"), screen: "Breathing", color: "#E3F2FF" },
    { title: "Calm", text: "Journal", icon: require("../assets/icons/support-calm-journal.png"), screen: "CalmJournal", color: "#EEF7E9", premium: true },
    { title: "Calming", text: "Sounds", icon: require("../assets/icons/tool-calming-sounds-headphones.png"), screen: "CalmingSounds", color: "#FFE7E0" },
  ];

  const childName = childProfile?.childName?.trim() || null;
  const parentName = parentProfile?.preferredGreeting?.trim() || parentProfile?.name?.trim() || "Caregiver";

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const goToScreen = (screenName, params) => {
    navigation.getParent()?.getParent()?.navigate(screenName, params) ??
      navigation.navigate(screenName, params);
  };

  const goToAddActivity = () => {
    navigation.getParent()?.getParent()?.navigate("AddRoutineActivity") ??
      navigation.navigate("AddRoutineActivity");
  };

  return (
    <ImageBackground
      source={require("../assets/icons/sunrise-background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Row */}
          <View style={styles.topRow}>
            <View style={styles.topIcons}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => goToScreen("Notifications")}
                style={styles.bellWrapper}
              >
                <Ionicons name="notifications-outline" size={22} color={PURPLE} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate("ParentProfile")}>
                <Image source={require("../assets/icons/profile-flower-heart-icon.png")} style={styles.profileIcon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <View style={styles.greetingArea}>
            <Text style={styles.greeting}>{greeting}, {parentName}</Text>
            <View style={styles.greetingSubRow}>
              <Text style={styles.subGreeting}>You're doing your best, and that is enough. ✨</Text>
              <Image source={require("../assets/icons/header-sunrise-clouds.png")} style={styles.sunrise} resizeMode="contain" />
            </View>
          </View>

          {/* Daily Affirmation Card */}
          <TouchableOpacity
            style={styles.affirmationCard}
            onPress={() => goToScreen("Affirmations")}
            activeOpacity={0.88}
          >
            <View style={styles.affirmationLeft}>
              <View style={styles.affirmationBadge}>
                <Ionicons name="sunny" size={11} color={ACCENT} />
                <Text style={styles.affirmationBadgeText}>Today's reminder</Text>
              </View>
              <Text style={styles.affirmationText} numberOfLines={2}>
                {dailyAffirmation.text}
              </Text>
              <Text style={styles.affirmationTag}>{dailyAffirmation.tag}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={ACCENT} />
          </TouchableOpacity>

          {/* Personalized Suggestions */}
          {suggestions && suggestions.length > 0 ? (
            <View style={styles.suggestCard}>
              <View style={styles.suggestHeader}>
                <View style={styles.suggestIconBubble}>
                  <Ionicons name="sparkles" size={14} color={ACCENT} />
                </View>
                <Text style={styles.suggestTitle}>Suggested for {childName || "your child"} today</Text>
              </View>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={item.screen}
                  style={[styles.suggestRow, index === suggestions.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => goToScreen(item.screen)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.suggestToolIcon, { backgroundColor: item.color }]}>
                    <Image source={item.icon} style={styles.suggestImage} />
                  </View>
                  <View style={styles.suggestTextWrap}>
                    <Text style={styles.suggestToolTitle}>{item.title}</Text>
                    <Text style={styles.suggestReason}>{item.reason}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={ACCENT} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity style={styles.profileNudgeCard} onPress={() => goToScreen("ChildProfile")} activeOpacity={0.88}>
              <View style={styles.profileNudgeIcon}>
                <Ionicons name="person-add-outline" size={20} color={ACCENT} />
              </View>
              <View style={styles.profileNudgeText}>
                <Text style={styles.profileNudgeTitle}>Set up a child profile</Text>
                <Text style={styles.profileNudgeSub}>Get personalized tool suggestions based on your child's needs.</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={ACCENT} />
            </TouchableOpacity>
          )}

          {/* Today's Routine */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleGroup}>
                <View style={styles.iconBubble}>
                  <Ionicons name="calendar-outline" size={16} color={ACCENT} />
                </View>
                <Text style={styles.cardTitle}>Today's Routine</Text>
              </View>
            </View>
            {routineItems.map((item, index) => (
              <View key={item.title}>
                <View style={styles.routineRow}>
                  <Image source={item.icon} style={styles.routineIcon} />
                  <View style={styles.routineTextBox}>
                    <Text style={styles.routineTitle}>{item.title}</Text>
                    <Text style={styles.routineTime}>{item.time}</Text>
                  </View>
                  <View style={[styles.checkCircle, item.complete && styles.checkCircleComplete]}>
                    {item.complete && <Ionicons name="checkmark" size={14} color={PURPLE} />}
                  </View>
                </View>
                {index !== routineItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
            <TouchableOpacity activeOpacity={0.75} style={styles.addButton} onPress={goToAddActivity}>
              <Ionicons name="add" size={16} color={ACCENT} />
              <Text style={styles.addButtonText}>Add Activity</Text>
            </TouchableOpacity>
          </View>

          {/* Mood */}
          <View style={styles.card}>
            <View style={styles.moodHeader}>
              <View style={styles.moodTitleGroup}>
                <Ionicons name="heart-outline" size={18} color={ACCENT} />
                <Text style={styles.moodTitle}>How are you feeling?</Text>
              </View>
              <TouchableOpacity onPress={() => goToScreen("MoodSupport")}>
                <Text style={styles.linkText}>Safe check-in</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.moodRow}>
              {moodItems.map((mood) => (
                <TouchableOpacity
                  key={mood.label}
                  activeOpacity={0.75}
                  style={styles.moodItem}
                  onPress={() => goToScreen("MoodSupport", { mood: mood.label.toLowerCase() })}
                >
                  <Image source={mood.icon} style={styles.moodIcon} />
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.moodFooter}>Your feelings matter too. 💜</Text>
          </View>

          {/* Support Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.supportCard}
            onPress={() => navigation.getParent()?.getParent()?.navigate("SupportMode") ?? navigation.navigate("SupportMode")}
          >
            <Image source={require("../assets/icons/support-heart-hands.png")} style={styles.supportIcon} />
            <View style={styles.supportTextBox}>
              <Text style={styles.supportTitle}>I Need Support Right Now</Text>
              <Text style={styles.supportText}>Get immediate calming support and guidance.</Text>
            </View>
            <View style={styles.arrowBox}>
              <Ionicons name="chevron-forward" size={20} color={PURPLE} />
            </View>
          </TouchableOpacity>

          {/* Quick Tools */}
          <View style={styles.quickHeader}>
            <Text style={styles.sectionTitle}>Quick Tools</Text>
          </View>

          <View style={styles.toolsRow}>
            {tools.map((tool) => (
              <TouchableOpacity
                key={tool.title}
                activeOpacity={0.75}
                style={[styles.toolCard, { backgroundColor: tool.color }]}
                onPress={() => {
                  if (tool.premium && !isPremium) {
                    goToScreen("PremiumUpgrade");
                  } else {
                    goToScreen(tool.screen);
                  }
                }}
              >
                <Image source={tool.icon} style={styles.toolIcon} />
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolText}>{tool.text}</Text>
                {tool.premium && !isPremium && (
                  <View style={styles.toolPremiumBadge}>
                    <Text style={styles.toolPremiumText}>✦ Premium</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: BACKGROUND },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 2 : 8, paddingBottom: Platform.OS === "ios" ? 100 : 120 },

  topRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginBottom: 8 },
  topIcons: { flexDirection: "row", alignItems: "center", gap: 10 },
  bellWrapper: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", top: 2, right: 2, width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF9BB7" },
  profileIcon: { width: 32, height: 32, resizeMode: "contain" },

  greetingArea: { marginBottom: 10 },
  greeting: { fontSize: 20, lineHeight: 24, fontWeight: "800", color: PURPLE, marginBottom: 2 },
  greetingSubRow: { minHeight: 38, justifyContent: "center" },
  subGreeting: { fontSize: 13, lineHeight: 18, fontWeight: "600", color: PURPLE, width: "68%" },
  sunrise: { position: "absolute", right: 0, bottom: 0, width: 90, height: 38 },

  affirmationCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1,
    borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 11,
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  affirmationLeft: { flex: 1 },
  affirmationBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginBottom: 5,
  },
  affirmationBadgeText: { color: ACCENT, fontSize: 10, fontWeight: "800" },
  affirmationText: { color: PURPLE, fontSize: 12, lineHeight: 17, fontWeight: "700", marginBottom: 4 },
  affirmationTag: { color: SOFT_TEXT, fontSize: 10, fontWeight: "700" },

  suggestCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 10, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  suggestHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  suggestIconBubble: { width: 24, height: 24, borderRadius: 8, backgroundColor: "#EFE1FF", alignItems: "center", justifyContent: "center" },
  suggestTitle: { color: PURPLE, fontSize: 13, fontWeight: "800" },
  suggestRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: BORDER, gap: 10 },
  suggestToolIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  suggestImage: { width: 26, height: 26, resizeMode: "contain" },
  suggestTextWrap: { flex: 1 },
  suggestToolTitle: { color: PURPLE, fontSize: 13, fontWeight: "800", marginBottom: 1 },
  suggestReason: { color: SOFT_TEXT, fontSize: 10.5, lineHeight: 14, fontWeight: "600" },

  profileNudgeCard: { backgroundColor: "#F6ECFF", borderRadius: 14, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  profileNudgeIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#EFE1FF", alignItems: "center", justifyContent: "center" },
  profileNudgeText: { flex: 1 },
  profileNudgeTitle: { color: PURPLE, fontSize: 13, fontWeight: "800", marginBottom: 2 },
  profileNudgeSub: { color: SOFT_TEXT, fontSize: 10.5, lineHeight: 14, fontWeight: "600" },

  card: { backgroundColor: "rgba(255, 255, 255, 0.94)", borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 10, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 },
  cardTitleGroup: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBubble: { width: 30, height: 30, borderRadius: 10, backgroundColor: "#EFE1FF", alignItems: "center", justifyContent: "center", marginRight: 7 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: PURPLE },
  linkText: { fontSize: 12, fontWeight: "700", color: ACCENT },

  routineRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  routineIcon: { width: 30, height: 30, resizeMode: "contain", marginRight: 9 },
  routineTextBox: { flex: 1 },
  routineTitle: { fontSize: 13, lineHeight: 17, fontWeight: "800", color: PURPLE },
  routineTime: { fontSize: 12, lineHeight: 15, fontWeight: "700", color: ACCENT },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "#DDD6D1", alignItems: "center", justifyContent: "center" },
  checkCircleComplete: { backgroundColor: "#D8B9F7", borderColor: "#D8B9F7" },
  divider: { height: 1, backgroundColor: BORDER, marginLeft: 39 },
  addButton: { marginTop: 5, height: 32, borderRadius: 10, backgroundColor: "#EFE1F7", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 4 },
  addButtonText: { fontSize: 13, color: ACCENT, fontWeight: "800" },

  moodHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  moodTitleGroup: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  moodTitle: { fontSize: 13, fontWeight: "800", color: PURPLE },
  moodRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  moodItem: { width: "19%", alignItems: "center" },
  moodIcon: { width: 28, height: 28, resizeMode: "contain", marginBottom: 2 },
  moodLabel: { fontSize: 9.5, lineHeight: 11, fontWeight: "700", color: PURPLE, textAlign: "center" },
  moodFooter: { marginTop: 6, fontSize: 12, fontWeight: "600", color: SOFT_TEXT, textAlign: "center" },

  supportCard: { backgroundColor: "rgba(255, 218, 211, 0.96)", borderColor: "#FFC4BC", borderWidth: 1, borderRadius: 16, padding: 9, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  supportIcon: { width: 34, height: 34, resizeMode: "contain", marginRight: 9 },
  supportTextBox: { flex: 1 },
  supportTitle: { fontSize: 14, lineHeight: 18, fontWeight: "800", color: PURPLE, marginBottom: 1 },
  supportText: { fontSize: 11, lineHeight: 15, fontWeight: "600", color: PURPLE },
  arrowBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginLeft: 6 },

  quickHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: PURPLE },

  toolsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  toolCard: { width: "23%", borderRadius: 12, paddingVertical: 7, paddingHorizontal: 4, alignItems: "center", minHeight: 85 },
  toolIcon: { width: 28, height: 28, resizeMode: "contain", marginBottom: 3 },
  toolTitle: { fontSize: 10.5, lineHeight: 12, fontWeight: "800", color: PURPLE, textAlign: "center", marginBottom: 1 },
  toolText: { fontSize: 9.5, lineHeight: 11, fontWeight: "500", color: "#4D4662", textAlign: "center" },
  toolPremiumBadge: { backgroundColor: "#EFE1FF", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, marginTop: 2 },
  toolPremiumText: { color: "#7548D8", fontSize: 8, fontWeight: "900" },
});