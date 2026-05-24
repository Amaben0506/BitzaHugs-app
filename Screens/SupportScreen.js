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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";

const supportHeartHug = require("../assets/icons/support-heart-hug.png");
const supportBackground = require("../assets/icons/support-background.png");

function PremiumBadge() {
  return (
    <View style={styles.premiumBadge}>
      <Ionicons name="sparkles" size={10} color="#7548D8" />
      <Text style={styles.premiumText}>Premium</Text>
    </View>
  );
}

function BigSupportRow({ title, subtitle, icon, bg, accent, premium, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.bigRow, { backgroundColor: bg }]}
      activeOpacity={0.86}
      onPress={onPress}
    >
      <View style={[styles.bigIconBox, { backgroundColor: "rgba(255,255,255,0.45)" }]}>
        <Feather name={icon} size={22} color={accent} />
      </View>
      <View style={styles.bigRowTextWrap}>
        <View style={styles.rowTitleLine}>
          <Text style={styles.bigRowTitle}>{title}</Text>
          {premium ? <PremiumBadge /> : null}
        </View>
        <Text style={styles.bigRowSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={21} color="#2B2463" />
    </TouchableOpacity>
  );
}

function ToolCard({ title, subtitle, icon, bg, accent, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.toolCard, { backgroundColor: bg }]}
      activeOpacity={0.86}
      onPress={onPress}
    >
      <View style={styles.toolTopRow}>
        <Feather name={icon} size={23} color={accent} />
        <Feather name="chevron-right" size={19} color="#2B2463" />
      </View>
      <View>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SupportScreen({ navigation }) {
  const [isPremium, setIsPremium] = useState(false);

  // ✅ Fixed: getParent().getParent() reaches Drawer level where HugiChat + SupportMode live
  const nav = (screen, params) =>
    navigation.getParent()?.getParent()?.navigate(screen, params) ??
    navigation.navigate(screen, params);

  useFocusEffect(
    useCallback(() => {
      const loadPremium = async () => {
        try {
          const premium = await AsyncStorage.getItem("bitzaIsPremium");
          setIsPremium(premium === "true");
        } catch (e) {
          console.log("Error loading premium state:", e);
        }
      };
      loadPremium();
    }, [])
  );

  const handleNav = (screen, params = {}, premiumOnly = false) => {
    if (premiumOnly && !isPremium) {
      nav("PremiumUpgrade");
      return;
    }
    nav(screen, params);
  };

  return (
    <ImageBackground
      source={supportBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Support</Text>
            <Text style={styles.screenSubtitle}>Gentle tools for hard moments.</Text>
          </View>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.85}
            onPress={() => nav("PrivacySafety")}
          >
            <Ionicons name="heart-outline" size={24} color="#7548D8" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={supportHeartHug} style={styles.heroImage} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>You're not alone.</Text>
            <Text style={styles.heroText}>Choose one small thing that could help right now.</Text>
          </View>
        </View>

        {/* ✅ Talk to Hugi — navigates to HugiChat */}
        <BigSupportRow
          title="Talk to Hugi"
          subtitle="Your AI calm companion"
          icon="message-circle"
          bg="#F0E7FF"
          accent="#8B5BE8"
          premium
          onPress={() => handleNav("HugiChat", {}, true)}
        />

        {/* Printable Resources */}
        <BigSupportRow
          title="Printable Resources"
          subtitle="Visual tools you can print & keep"
          icon="printer"
          bg="#EEF7E9"
          accent="#4A9E5C"
          premium
          onPress={() => handleNav("Resources", {}, true)}
        />

        {/* ✅ Support Right Now — navigates to SupportMode */}
        <BigSupportRow
          title="I Need Support Right Now"
          subtitle="Open calming support mode"
          icon="heart"
          bg="#FFE7E1"
          accent="#EF8F7D"
          onPress={() => nav("SupportMode")}
        />

        {/* Community */}
        <BigSupportRow
          title="Caregiver Community"
          subtitle="Connect with caregivers who understand. 8 rooms."
          icon="users"
          bg="#F0E7FF"
          accent="#8B5BE8"
          premium
          onPress={() => handleNav("Community", {}, true)}
        />

        {/* Support Tools */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support Tools</Text>
          <Text style={styles.sectionCaption}>Pick what feels doable.</Text>
        </View>

        <View style={styles.toolsGrid}>
          <ToolCard
            title="Breathing Exercise"
            subtitle="Slow your body down"
            icon="wind"
            bg="#E7F4FF"
            accent="#4C9ED9"
            onPress={() => nav("Breathing")}
          />
          <ToolCard
            title="Calming Sounds"
            subtitle="Play soft sounds"
            icon="volume-2"
            bg="#FFE6DF"
            accent="#EF8F7D"
            onPress={() => nav("Sounds")}
          />
          <ToolCard
            title="Grounding Steps"
            subtitle="Come back to the moment"
            icon="anchor"
            bg="#EEF7E8"
            accent="#78A866"
            onPress={() => nav("GroundingSteps")}
          />
          <ToolCard
            title="Sensory Support"
            subtitle="Tools for your child's sensory needs"
            icon="hand-left-outline"
            bg="#F6ECFF"
            accent="#7548D8"
            onPress={() => nav("SensorySupports")}
          />
          <ToolCard
            title="Meltdown Plan"
            subtitle="View saved support steps"
            icon="clipboard"
            bg="#FFF0DF"
            accent="#D99A3D"
            onPress={() => nav("MeltdownPlan")}
          />
          <ToolCard
            title="Contact Support Person"
            subtitle="Reach someone you trust"
            icon="phone-call"
            bg="#F3EAFE"
            accent="#8B5BE8"
            onPress={() => nav("SupportPerson")}
          />
          <ToolCard
            title="Affirmations"
            subtitle="Gentle reminders for hard moments"
            icon="star"
            bg="#FFF3DC"
            accent="#D99A3D"
            onPress={() => nav("Affirmations")}
          />
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart-outline" size={24} color="#7548D8" />
          <Text style={styles.encouragementText}>This moment is hard, but you are not failing.</Text>
        </View>

        <Text style={styles.emergencyText}>
          If there is immediate danger or a medical emergency, contact emergency services right away.
        </Text>
      </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 22 : 8, paddingBottom: 120 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  screenTitle: { color: "#2B2463", fontSize: 26, fontWeight: "900", letterSpacing: -0.4 },
  screenSubtitle: { color: "#5B5672", fontSize: 13, fontWeight: "700", marginTop: 2 },
  headerIconButton: { width: 46, height: 46, borderRadius: 17, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 16, paddingVertical: 15, flexDirection: "row", alignItems: "center", marginBottom: 14, shadowColor: "#BFA99D", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 2 },
  heroImage: { width: 58, height: 58, marginRight: 14 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 17, fontWeight: "900", marginBottom: 4 },
  heroText: { color: "#5B5672", fontSize: 13, lineHeight: 18, fontWeight: "700" },

  bigRow: { minHeight: 72, borderRadius: 20, borderWidth: 1, borderColor: "rgba(120, 90, 160, 0.13)", paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  bigIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 13 },
  bigRowTextWrap: { flex: 1 },
  rowTitleLine: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  bigRowTitle: { color: "#2B2463", fontSize: 15, fontWeight: "900", flexShrink: 1 },
  bigRowSubtitle: { color: "#5B5672", fontSize: 12, fontWeight: "700" },

  premiumBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#EFE1FF", borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "#D8C3F7" },
  premiumText: { color: "#7548D8", fontSize: 10, fontWeight: "900" },

  sectionHeader: { marginTop: 12, marginBottom: 10 },
  sectionTitle: { color: "#2B2463", fontSize: 18, fontWeight: "900" },
  sectionCaption: { color: "#837E96", fontSize: 13, fontWeight: "700", marginTop: 2 },

  toolsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14, marginBottom: 16 },
  toolCard: { width: "48%", minHeight: 120, borderRadius: 20, padding: 15, justifyContent: "space-between" },
  toolTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toolTitle: { color: "#2B2463", fontSize: 14, fontWeight: "900", marginBottom: 4 },
  toolSubtitle: { color: "#5B5672", fontSize: 12, lineHeight: 16, fontWeight: "700" },

  encouragementCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  encouragementText: { color: "#2B2463", fontSize: 14, lineHeight: 19, fontWeight: "900", flex: 1 },
  emergencyText: { color: "#9A8EA7", fontSize: 12, lineHeight: 18, textAlign: "center", fontWeight: "700", paddingHorizontal: 18 },
});