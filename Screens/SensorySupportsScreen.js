import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

const PURPLE = "#2D246B";
const ACCENT = "#7548D8";

const TOOL_MAP = {
  "loud-noises": {
    tip: "Try calming sounds or noise-cancelling headphones during overwhelming moments.",
    tools: [{ label: "Calming Sounds", icon: "musical-notes-outline", screen: "Sounds", color: "#FFE7E0", accent: "#EF8F7D" }],
  },
  "transitions": {
    tip: "Use a visual timer before changes to help your child prepare.",
    tools: [{ label: "Transition Timer", icon: "timer-outline", screen: "Transitions", color: "#EFE2FF", accent: "#7548D8" }],
  },
  "bright-lights": {
    tip: "Dim lights before transitions and keep a quiet corner available.",
    tools: [{ label: "Calming Sounds", icon: "musical-notes-outline", screen: "Sounds", color: "#FFE7E0", accent: "#EF8F7D" }],
  },
  "textures": {
    tip: "Keep familiar clothing nearby and avoid tags or scratchy fabrics.",
    tools: [{ label: "Meltdown Plan", icon: "clipboard-outline", screen: "MeltdownPlan", color: "#FFF0DF", accent: "#D99A3D" }],
  },
  "visuals": {
    tip: "Reduce clutter in your child's space and use simple visual schedules.",
    tools: [{ label: "Routine Planner", icon: "calendar-outline", screen: "Routine", color: "#E7F4FF", accent: "#4C9ED9" }],
  },
  "timers": {
    tip: "Visual countdowns help with time blindness and unexpected endings.",
    tools: [{ label: "Transition Timer", icon: "timer-outline", screen: "Transitions", color: "#EFE2FF", accent: "#7548D8" }],
  },
  "music": {
    tip: "Soft background music can regulate and calm the nervous system.",
    tools: [{ label: "Calming Sounds", icon: "musical-notes-outline", screen: "Sounds", color: "#FFE7E0", accent: "#EF8F7D" }],
  },
  "quiet-space": {
    tip: "A designated calm corner with familiar items gives your child a reset place.",
    tools: [{ label: "Meltdown Plan", icon: "clipboard-outline", screen: "MeltdownPlan", color: "#FFF0DF", accent: "#D99A3D" }],
  },
  "pressure": {
    tip: "Deep pressure like weighted blankets or firm hugs can calm the nervous system.",
    tools: [{ label: "Grounding Steps", icon: "footsteps-outline", screen: "GroundingSteps", color: "#EEF7E8", accent: "#78A866" }],
  },
};

const ALL_SUPPORTS = [
  { id: "loud-noises", title: "Loud Noises", icon: "volume-high-outline", color: "#8C55F6" },
  { id: "transitions", title: "Transitions", icon: "sync-outline", color: "#40A99B" },
  { id: "bright-lights", title: "Bright Lights", icon: "sunny-outline", color: "#F3A63D" },
  { id: "textures", title: "Textures", icon: "hand-left-outline", color: "#F28C8C" },
  { id: "visuals", title: "Visuals", icon: "image-outline", color: "#4AA9B1" },
  { id: "timers", title: "Timers", icon: "time-outline", color: "#8C55F6" },
  { id: "music", title: "Music", icon: "musical-notes-outline", color: "#8C55F6" },
  { id: "quiet-space", title: "Quiet Space", icon: "home-outline", color: "#7BA85E" },
  { id: "pressure", title: "Deep Pressure", icon: "heart-outline", color: "#F28C8C" },
];

export default function SensorySupportsScreen({ navigation }) {
  const [savedSupports, setSavedSupports] = useState([]);
  const [childName, setChildName] = useState("your child");
  const [expandedId, setExpandedId] = useState(null);

  const nav = (screen) =>
    navigation.getParent()?.getParent()?.navigate(screen) ??
    navigation.navigate(screen);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const saved = await AsyncStorage.getItem("bitzaSensorySupports");
          setSavedSupports(saved ? JSON.parse(saved) : []);

          const profile = await AsyncStorage.getItem("bitzaChildProfile");
          if (profile) {
            const p = JSON.parse(profile);
            setChildName(p.childName?.trim() || "your child");
          }
        } catch (e) {
          console.log("Error loading sensory supports:", e);
        }
      };
      load();
    }, [])
  );

  const displaySupports = savedSupports.length > 0
    ? ALL_SUPPORTS.filter((s) => savedSupports.some((saved) => saved.id === s.id))
    : ALL_SUPPORTS;

  const hasCustomSupports = savedSupports.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color={PURPLE} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Sensory Support</Text>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate("SensorySupport")}
            activeOpacity={0.85}
          >
            <Feather name="edit-2" size={18} color={PURPLE} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image
            source={require("../assets/icons/support-heart-hug.png")}
            style={styles.heroIcon}
            resizeMode="contain"
          />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>
              {hasCustomSupports
                ? `${childName}'s sensory profile`
                : "Sensory support tools"}
            </Text>
            <Text style={styles.heroText}>
              {hasCustomSupports
                ? "Tap any support to see tips and tools that can help."
                : "Set up a sensory profile to get personalized tips for your child."}
            </Text>
          </View>
        </View>

        {/* Setup nudge if no profile */}
        {!hasCustomSupports && (
          <TouchableOpacity
            style={styles.nudgeCard}
            onPress={() => navigation.navigate("SensorySupport")}
            activeOpacity={0.88}
          >
            <Ionicons name="person-add-outline" size={20} color={ACCENT} />
            <View style={styles.nudgeTextWrap}>
              <Text style={styles.nudgeTitle}>Set up {childName}'s sensory profile</Text>
              <Text style={styles.nudgeSub}>Choose what affects your child most and get personalized tips.</Text>
            </View>
            <Feather name="chevron-right" size={16} color={ACCENT} />
          </TouchableOpacity>
        )}

        {/* Supports List */}
        <Text style={styles.sectionTitle}>
          {hasCustomSupports ? "Your child's sensory needs" : "Browse all sensory supports"}
        </Text>

        {displaySupports.map((support) => {
          const toolInfo = TOOL_MAP[support.id];
          const isExpanded = expandedId === support.id;

          return (
            <View key={support.id} style={styles.supportCard}>
              <TouchableOpacity
                style={styles.supportHeader}
                onPress={() => setExpandedId(isExpanded ? null : support.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.supportIconBubble, { backgroundColor: support.color + "22" }]}>
                  <Ionicons name={support.icon} size={22} color={support.color} />
                </View>
                <Text style={styles.supportTitle}>{support.title}</Text>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#8E87A0"
                />
              </TouchableOpacity>

              {isExpanded && toolInfo && (
                <View style={styles.supportExpanded}>
                  <View style={styles.tipCard}>
                    <Ionicons name="bulb-outline" size={16} color="#D99A3D" />
                    <Text style={styles.tipText}>{toolInfo.tip}</Text>
                  </View>

                  <Text style={styles.toolsLabel}>Helpful tools:</Text>
                  {toolInfo.tools.map((tool) => (
                    <TouchableOpacity
                      key={tool.label}
                      style={[styles.toolBtn, { backgroundColor: tool.color }]}
                      onPress={() => nav(tool.screen)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name={tool.icon} size={18} color={tool.accent} />
                      <Text style={[styles.toolBtnText, { color: tool.accent }]}>{tool.label}</Text>
                      <Feather name="chevron-right" size={14} color={tool.accent} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("SensorySupport")}
          activeOpacity={0.85}
        >
          <Feather name="edit-2" size={16} color={ACCENT} />
          <Text style={styles.editBtnText}>Update sensory profile</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerCard}>
          <Image
            source={require("../assets/icons/support-positive-reminder.png")}
            style={styles.footerIcon}
            resizeMode="contain"
          />
          <Text style={styles.footerText}>
            Every child is different. These are gentle suggestions, not rules.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  topBar: { height: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  topTitle: { color: PURPLE, fontSize: 17, fontWeight: "800" },

  heroCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 13, paddingVertical: 12, flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  heroIcon: { width: 52, height: 52 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: PURPLE, fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  nudgeCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 14,
  },
  nudgeTextWrap: { flex: 1 },
  nudgeTitle: { color: PURPLE, fontSize: 13, fontWeight: "800", marginBottom: 2 },
  nudgeSub: { color: "#5B5672", fontSize: 11, fontWeight: "600", lineHeight: 15 },

  sectionTitle: { color: PURPLE, fontSize: 15, fontWeight: "800", marginBottom: 10 },

  supportCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC",
    marginBottom: 8, overflow: "hidden", shadowColor: "#BFA99D", shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 1,
  },
  supportHeader: {
    flexDirection: "row", alignItems: "center", padding: 12, gap: 11,
  },
  supportIconBubble: {
    width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center",
  },
  supportTitle: { flex: 1, color: PURPLE, fontSize: 14, fontWeight: "800" },

  supportExpanded: {
    paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: "#F0E8E2",
  },
  tipCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "#FFF8EC", borderRadius: 12, borderWidth: 1,
    borderColor: "#FFE4B0", padding: 10, marginTop: 10, marginBottom: 10,
  },
  tipText: { flex: 1, color: "#5B5672", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  toolsLabel: { color: "#8E87A0", fontSize: 11, fontWeight: "700", marginBottom: 7 },
  toolBtn: {
    flexDirection: "row", alignItems: "center", gap: 9,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6,
  },
  toolBtnText: { flex: 1, fontSize: 13, fontWeight: "800" },

  editBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#F6ECFF", borderRadius: 14, borderWidth: 1, borderColor: "#E3D2F8",
    paddingVertical: 12, marginTop: 4, marginBottom: 12,
  },
  editBtnText: { color: ACCENT, fontSize: 13, fontWeight: "800" },

  footerCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8",
    padding: 12, flexDirection: "row", alignItems: "center", gap: 10,
  },
  footerIcon: { width: 40, height: 40 },
  footerText: { flex: 1, color: PURPLE, fontSize: 12, lineHeight: 17, fontWeight: "700" },
});