import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePremium } from "../src/lib/premium";

const PURPLE = "#2D246B";
const ACCENT = "#7548D8";
const SOFT_TEXT = "#8E87A0";
const BORDER = "#EFE5DD";
const BACKGROUND = "#FFF9F2";
const CARD = "#FFFFFF";

const CATEGORIES = [
  {
    label: "Emotions & Feelings",
    icon: "heart-outline",
    color: "#FFE7E0",
    iconColor: "#D86A5B",
    resources: [
      { title: "Emotion Faces Chart", desc: "Visual faces for 7 core emotions", file: "resource-emotion-faces-chart.pdf", free: true },
      { title: "Feelings Thermometer", desc: "Calm to meltdown scale visual", file: "resource-feelings-thermometer.pdf", free: false },
      { title: "Feelings Check-In Sheet", desc: "Circle how you feel today", file: "resource-feelings-checkin-sheet.pdf", free: false },
    ],
  },
  {
    label: "Calm Down Tools",
    icon: "leaf-outline",
    color: "#EEF7E9",
    iconColor: "#4A9E5C",
    resources: [
      { title: "Calm Down Choice Board", desc: "Visual strategies to pick from", file: "resource-calm-down-choice-board.pdf", free: true },
      { title: "Breathing Exercise Visual", desc: "Belly breathing steps with pictures", file: "resource-breathing-exercise-visual.pdf", free: false },
      { title: "5-4-3-2-1 Grounding Card", desc: "Senses checklist for grounding", file: "resource-grounding-5-4-3-2-1.pdf", free: false },
      { title: "My Calm Down Kit List", desc: "Fillable — what helps ME calm down", file: "resource-calm-down-kit-list.pdf", free: false },
    ],
  },
  {
    label: "Routines & Schedules",
    icon: "calendar-outline",
    color: "#E3F2FF",
    iconColor: "#3B82C4",
    resources: [
      { title: "Morning Routine Chart", desc: "Visual step-by-step morning guide", file: "resource-morning-routine-chart.pdf", free: false },
      { title: "Bedtime Routine Chart", desc: "Visual step-by-step bedtime guide", file: "resource-bedtime-routine-chart.pdf", free: false },
      { title: "School Day Schedule", desc: "Customizable daily schedule template", file: "resource-school-day-schedule.pdf", free: false },
      { title: "First / Then Board", desc: "First we do this, then we do that", file: "resource-first-then-board.pdf", free: false },
    ],
  },
  {
    label: "Behavior & Communication",
    icon: "chatbubble-outline",
    color: "#FFF4E0",
    iconColor: "#D4920A",
    resources: [
      { title: "Yes / No Choice Card", desc: "Simple visual choice support", file: "resource-yes-no-choice-card.pdf", free: false },
      { title: "I Need a Break Card", desc: "Child hands to adult when overwhelmed", file: "resource-i-need-a-break-card.pdf", free: false },
      { title: "How My Body Feels", desc: "Connect emotions to body sensations", file: "resource-how-my-body-feels.pdf", free: false },
      { title: "My Triggers Worksheet", desc: "For parents to map child's triggers", file: "resource-my-triggers-worksheet.pdf", free: false },
    ],
  },
  {
    label: "For Hard Moments",
    icon: "alert-circle-outline",
    color: "#F6ECFF",
    iconColor: "#7548D8",
    resources: [
      { title: "Meltdown Recovery Steps", desc: "What to do after a hard moment", file: "resource-meltdown-recovery-steps.pdf", free: false },
      { title: "Safe Space Checklist", desc: "Set up a calming space at home", file: "resource-safe-space-checklist.pdf", free: false },
      { title: "Overwhelmed Visual Steps", desc: "Step-by-step visual for overwhelm", file: "resource-overwhelmed-visual-steps.pdf", free: false },
    ],
  },
  {
    label: "Parent Support",
    icon: "person-outline",
    color: "#FFF0F5",
    iconColor: "#C2456A",
    resources: [
      { title: "Caregiver Self-Care Checklist", desc: "Daily check-in for caregivers", file: "resource-caregiver-self-care.pdf", free: false },
      { title: "Emergency Calm Plan", desc: "One-page fillable calm plan", file: "resource-emergency-calm-plan.pdf", free: false },
    ],
  },
];

export default function ResourcesScreen({ navigation }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const { isPremium, showPremiumUpgrade } = usePremium();

  const handleDownload = (resource) => {
    if (!resource.free && !isPremium) {
      showPremiumUpgrade({ feature: "resources" });
      return;
    }
    // TODO: implement actual PDF open/download
    Alert.alert("Coming Soon", `"${resource.title}" will be available to print shortly.`);
  };

  const toggleCategory = (label) => {
    setExpandedCategory(expandedCategory === label ? null : label);
  };

  const totalFree = CATEGORIES.flatMap((c) => c.resources).filter((r) => r.free).length;
  const totalPremium = CATEGORIES.flatMap((c) => c.resources).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color={PURPLE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Printable Resources</Text>
          <View style={styles.circleButton}>
            <Ionicons name="download-outline" size={20} color={PURPLE} />
          </View>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introIconCircle}>
            <Ionicons name="print-outline" size={22} color={ACCENT} />
          </View>
          <View style={styles.introTextWrap}>
            <Text style={styles.introTitle}>Tangible tools for real moments.</Text>
            <Text style={styles.introText}>
              Print these visual supports and keep them at home, in a backpack, or on the fridge.
            </Text>
          </View>
        </View>

        {/* Premium Banner (if not premium) */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => showPremiumUpgrade({ feature: "resources" })}
            activeOpacity={0.88}
          >
            <View style={styles.premiumBannerLeft}>
              <Ionicons name="sparkles" size={18} color="#F6C96F" />
              <View>
                <Text style={styles.premiumBannerTitle}>Unlock all {totalPremium} resources</Text>
                <Text style={styles.premiumBannerSub}>{totalFree} free · {totalPremium - totalFree} with Premium</Text>
              </View>
            </View>
            <View style={styles.premiumBannerBadge}>
              <Text style={styles.premiumBannerBadgeText}>Upgrade</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Categories */}
        {CATEGORIES.map((category) => {
          const isExpanded = expandedCategory === category.label;
          const freeCount = category.resources.filter((r) => r.free).length;

          return (
            <View key={category.label} style={styles.categoryCard}>
              {/* Category Header */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.label)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIconBox, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon} size={20} color={category.iconColor} />
                </View>
                <View style={styles.categoryTitleWrap}>
                  <Text style={styles.categoryTitle}>{category.label}</Text>
                  <Text style={styles.categoryCount}>
                    {category.resources.length} resources
                    {freeCount > 0 && !isPremium ? ` · ${freeCount} free` : ""}
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={SOFT_TEXT}
                />
              </TouchableOpacity>

              {/* Resources List */}
              {isExpanded && (
                <View style={styles.resourcesList}>
                  {category.resources.map((resource, index) => {
                    const locked = !resource.free && !isPremium;
                    return (
                      <TouchableOpacity
                        key={resource.file}
                        style={[
                          styles.resourceRow,
                          index === category.resources.length - 1 && { borderBottomWidth: 0 },
                          locked && styles.resourceRowLocked,
                        ]}
                        onPress={() => handleDownload(resource)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.resourceTextWrap}>
                          <View style={styles.resourceTitleRow}>
                            <Text style={[styles.resourceTitle, locked && styles.resourceTitleLocked]}>
                              {resource.title}
                            </Text>
                            {resource.free && (
                              <View style={styles.freeBadge}>
                                <Text style={styles.freeBadgeText}>FREE</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.resourceDesc}>{resource.desc}</Text>
                        </View>

                        <View style={[styles.downloadBtn, locked && styles.downloadBtnLocked]}>
                          <Ionicons
                            name={locked ? "lock-closed" : "download-outline"}
                            size={16}
                            color={locked ? SOFT_TEXT : ACCENT}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* Bottom encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart" size={22} color="#D86A5B" />
          <Text style={styles.encouragementText}>
            Every tool you use is an act of love for your child.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 16,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  circleButton: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#E3D2F8",
  },
  headerTitle: { color: PURPLE, fontSize: 17, fontWeight: "800" },

  introCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1,
    borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 12,
    flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10,
  },
  introIconCircle: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
  },
  introTextWrap: { flex: 1 },
  introTitle: { color: PURPLE, fontSize: 13, fontWeight: "800", marginBottom: 3 },
  introText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  premiumBanner: {
    backgroundColor: PURPLE, borderRadius: 16, paddingHorizontal: 14,
    paddingVertical: 12, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 12,
  },
  premiumBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  premiumBannerTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  premiumBannerSub: { color: "#C8C0F0", fontSize: 11, fontWeight: "600" },
  premiumBannerBadge: {
    backgroundColor: "#F6C96F", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  premiumBannerBadgeText: { color: "#2D246B", fontSize: 12, fontWeight: "800" },

  categoryCard: {
    backgroundColor: CARD, borderRadius: 16, borderWidth: 1,
    borderColor: BORDER, marginBottom: 8, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row", alignItems: "center",
    padding: 12, gap: 11,
  },
  categoryIconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  categoryTitleWrap: { flex: 1 },
  categoryTitle: { color: PURPLE, fontSize: 13, fontWeight: "800", marginBottom: 2 },
  categoryCount: { color: SOFT_TEXT, fontSize: 11, fontWeight: "600" },

  resourcesList: {
    borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 12,
  },
  resourceRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: BORDER, gap: 10,
  },
  resourceRowLocked: { opacity: 0.7 },
  resourceTextWrap: { flex: 1 },
  resourceTitleRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 2 },
  resourceTitle: { color: PURPLE, fontSize: 13, fontWeight: "700" },
  resourceTitleLocked: { color: SOFT_TEXT },
  resourceDesc: { color: SOFT_TEXT, fontSize: 11, fontWeight: "600" },
  freeBadge: {
    backgroundColor: "#EEF7E9", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  freeBadgeText: { color: "#4A9E5C", fontSize: 9, fontWeight: "800" },
  downloadBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#F0E2FF", justifyContent: "center", alignItems: "center",
  },
  downloadBtnLocked: { backgroundColor: "#F5F5F5" },

  encouragementCard: {
    backgroundColor: "#FFF0F0", borderRadius: 16, borderWidth: 1,
    borderColor: "#FFD5D0", padding: 14, flexDirection: "row",
    alignItems: "center", gap: 10, marginTop: 4,
  },
  encouragementText: {
    flex: 1, color: PURPLE, fontSize: 13,
    fontWeight: "700", lineHeight: 18,
  },
});
