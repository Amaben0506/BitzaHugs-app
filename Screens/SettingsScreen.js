import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import { isModerator } from "../src/lib/moderation";
import Card from "../src/components/ui/Card";
import PressableScale from "../src/components/ui/PressableScale";
import ScreenHeader from "../src/components/ui/ScreenHeader";
import { Colors, Type, Spacing, Radius } from "../src/theme/theme";

const appVersion =
  Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0";

// ─── Section overline label ───────────────────────────────────────────────────
function SectionLabel({ title }) {
  return <Text style={s.overline}>{title}</Text>;
}

// ─── Premium pill ─────────────────────────────────────────────────────────────
function PremiumPill({ onPress }) {
  return (
    <TouchableOpacity style={s.premiumPill} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="sparkles" size={9} color="#fff" />
      <Text style={s.premiumPillText}>Premium</Text>
    </TouchableOpacity>
  );
}

// ─── Settings row ─────────────────────────────────────────────────────────────
function SettingsRow({ row, last, onPremiumPress, isPremium }) {
  const isLocked = row.premium && !isPremium;
  const isDestructive = !!row.destructive;

  const inner = (
    <View style={[s.row, last && s.rowLast]}>
      <View style={[s.iconBubble, { backgroundColor: row.bg }]}>
        <Feather name={row.icon} size={17} color={row.accent || Colors.purple} />
      </View>
      <View style={s.rowText}>
        <Text style={[s.rowTitle, isDestructive && s.rowTitleDestructive]}>
          {row.title}
        </Text>
        {row.subtitle ? (
          <Text style={s.rowSubtitle} numberOfLines={2}>{row.subtitle}</Text>
        ) : null}
      </View>
      {isLocked ? (
        <PremiumPill onPress={onPremiumPress} />
      ) : row.pill ? (
        <View style={s.pill}>
          <Text style={s.pillText}>{row.pill}</Text>
        </View>
      ) : row.soon ? (
        <View style={s.pillAmber}>
          <Text style={s.pillAmberText}>Soon</Text>
        </View>
      ) : !isDestructive && row.onPress ? (
        <Feather name="chevron-right" size={16} color={Colors.grayLavender} />
      ) : null}
    </View>
  );

  const handlePress = isLocked ? onPremiumPress : row.onPress;
  if (!handlePress) return inner;

  return <PressableScale onPress={handlePress}>{inner}</PressableScale>;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }) {
  const [childProfile, setChildProfile] = useState(null);
  const [supportPerson, setSupportPerson] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const cp = await AsyncStorage.getItem("bitzaChildProfile");
          const sp = await AsyncStorage.getItem("bitzaSupportPerson");
          const premium = await AsyncStorage.getItem("bitzaIsPremium");
          setChildProfile(cp ? JSON.parse(cp) : null);
          setSupportPerson(sp ? JSON.parse(sp) : null);
          setIsPremium(premium === "true");
        } catch (e) {}
      };
      load();
    }, [])
  );

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 2300);
  };

  const nav = (screen) =>
    navigation.getParent()?.navigate(screen) ?? navigation.navigate(screen);

  const goToPremium = () => nav("PremiumUpgrade");

  const childName = childProfile?.childName?.trim() || "Not set";
  const supportName = supportPerson?.name?.trim() || "Not set";

  // ─── Tint shorthands ──────────────────────────────────────────────────────
  const LAV   = { bg: Colors.lavenderSurface, accent: Colors.purple };
  const BLUSH = { bg: Colors.blushSurface,    accent: Colors.blushText };
  const SAGE  = { bg: Colors.sageSurface,     accent: Colors.sageText };
  const GOLD  = { bg: "#FFF8EC",              accent: Colors.mutedGold };
  const DEST  = { bg: "#FFF1F3",              accent: "#C03060" };

  // ─── Row definitions — routing and logic unchanged ─────────────────────────

  const profileRows = [
    {
      title: "Parent Profile",
      subtitle: "Caregiver details and preferences",
      icon: "user-check",
      ...LAV,
      onPress: () => nav("EditCaregiverProfile"),
    },
    {
      title: "Child Profile",
      subtitle: childName,
      icon: "user",
      ...LAV,
      onPress: () => nav("EditProfile"),
    },
    {
      title: "Support Contacts",
      subtitle: supportName || "Manage your support network",
      icon: "phone-call",
      ...BLUSH,
      onPress: () => nav("AllContacts"),
    },
    {
      title: "Appointment Tracker",
      subtitle: "Therapy, doctors, school & more",
      icon: "calendar",
      ...LAV,
      premium: true,
      onPress: () => nav("AppointmentTracker"),
    },
    {
      title: "Journal History",
      subtitle: "View saved calm journal entries",
      icon: "book-open",
      ...SAGE,
      premium: true,
      onPress: () => nav("JournalHistory"),
    },
    {
      title: "Talk to Hugi",
      subtitle: "Your AI calm companion",
      icon: "message-circle",
      ...LAV,
      premium: true,
      onPress: () => nav("HugiChat"),
    },
  ];

  const preferenceRows = [
    {
      title: "Notification Preferences",
      subtitle: "Choose gentle reminders",
      icon: "bell",
      ...GOLD,
      onPress: () => nav("NotificationPreferences"),
    },
    {
      title: "Calm Theme",
      subtitle: "Soft cream and lavender active",
      icon: "moon",
      ...SAGE,
      pill: "On",
    },
  ];

  const accountRows = [
    {
      title: "Account Settings",
      subtitle: "Sign in, create account, or manage your profile",
      icon: "user",
      ...LAV,
      onPress: () => nav("Account"),
    },
    {
      title: "Delete Account",
      subtitle: "Permanently remove your account and data",
      icon: "trash-2",
      ...DEST,
      destructive: true,
      onPress: () => nav("Account"),
    },
    {
      title: "Log Out",
      subtitle: "Sign out of your account",
      icon: "log-out",
      ...DEST,
      destructive: true,
      onPress: () =>
        Alert.alert("Log Out", "Are you sure you want to log out?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log Out",
            style: "destructive",
            onPress: async () => {
              const { signOutUser } = require("../src/lib/firebase");
              await signOutUser();
              await AsyncStorage.multiRemove([
                "bitzaIsPremium",
                "bitzaAccountCreated",
                "bitzaAccountPromptSeen",
              ]);
              showStatus("Logged out successfully");
            },
          },
        ]),
    },
    ...(isModerator()
      ? [
          {
            title: "Moderation",
            subtitle: "Review reports and moderate community content",
            icon: "shield",
            ...LAV,
            onPress: () => nav("Moderation"),
          },
        ]
      : []),
  ];

  const safetyRows = [
    {
      title: "About Hugi",
      subtitle: "Hugi is supportive, not therapy or emergency care",
      icon: "alert-circle",
      ...LAV,
      onPress: () =>
        Alert.alert(
          "About Hugi 💜",
          "Hugi is an AI companion designed to offer emotional support and gentle guidance to caregivers.\n\nHugi is NOT a therapist, crisis counselor, or medical professional. If you or someone you care for is in crisis, please contact a licensed professional or emergency services.",
          [{ text: "Got it" }]
        ),
    },
    {
      title: "Privacy Policy",
      subtitle: "How we protect your family's data",
      icon: "lock",
      ...LAV,
      onPress: () => nav("PrivacySafety"),
    },
    {
      title: "Terms of Use",
      subtitle: "Rules and guidelines for using BitzaHugs",
      icon: "file-text",
      ...GOLD,
      onPress: () => Linking.openURL("https://bitzahugs.com/terms"),
    },
    {
      title: "Emergency Reminder",
      subtitle: "If there is danger, contact emergency services",
      icon: "alert-triangle",
      ...BLUSH,
      onPress: () =>
        Alert.alert(
          "⚠️ Emergency",
          "BitzaHugs is not an emergency service.\n\nIf you or your child are in immediate danger, please call 911 or your local emergency services right away.\n\nFor mental health crises, call or text 988 (Suicide & Crisis Lifeline).",
          [{ text: "Understood" }]
        ),
    },
    {
      title: "Report a Problem",
      subtitle: "Contact us at hello@bitzahugs.com",
      icon: "mail",
      ...LAV,
      onPress: () =>
        Linking.openURL(
          "mailto:hello@bitzahugs.com?subject=BitzaHugs%20Support"
        ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={["#EEE8F5", "#F5F0FA", "#FDFBFF"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} style={s.headerBg} />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Premium upgrade banner */}
        <PressableScale onPress={goToPremium}>
          <Card tint="lavender" style={s.upgradeCard}>
            <View style={s.upgradeIconWrap}>
              <Ionicons name="sparkles" size={18} color={Colors.purple} />
            </View>
            <View style={s.upgradeText}>
              <Text style={s.upgradeTitle}>Unlock BitzaHugs Premium</Text>
              <Text style={s.upgradeSub}>
                Appointments, insights, unlimited journaling & more.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.grayLavender} />
          </Card>
        </PressableScale>

        {/* Status flash */}
        {statusMessage ? (
          <View style={s.statusBanner}>
            <Feather name="check-circle" size={15} color={Colors.purple} />
            <Text style={s.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        <SectionLabel title="Profile & Support" />
        <Card>
          {profileRows.map((row, i) => (
            <SettingsRow
              key={row.title}
              row={row}
              last={i === profileRows.length - 1}
              onPremiumPress={goToPremium}
              isPremium={isPremium}
            />
          ))}
        </Card>

        <SectionLabel title="App Preferences" />
        <Card>
          {preferenceRows.map((row, i) => (
            <SettingsRow
              key={row.title}
              row={row}
              last={i === preferenceRows.length - 1}
              onPremiumPress={goToPremium}
              isPremium={isPremium}
            />
          ))}
        </Card>

        <SectionLabel title="Account" />
        <Card>
          {accountRows.map((row, i) => (
            <SettingsRow
              key={row.title}
              row={row}
              last={i === accountRows.length - 1}
              onPremiumPress={goToPremium}
              isPremium={isPremium}
            />
          ))}
        </Card>

        <SectionLabel title="Safety & Privacy" />
        <Card>
          {safetyRows.map((row, i) => (
            <SettingsRow
              key={row.title}
              row={row}
              last={i === safetyRows.length - 1}
              onPremiumPress={goToPremium}
              isPremium={isPremium}
            />
          ))}
        </Card>

        {/* About footer */}
        <View style={s.footer}>
          <Text style={s.footerVersion}>BitzaHugs v{appVersion}</Text>
          <Text style={s.footerTagline}>Made with 💜 for caregivers</Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "mailto:hello@bitzahugs.com?subject=BitzaHugs%20Support"
              )
            }
            activeOpacity={0.7}
          >
            <Text style={s.footerContact}>hello@bitzahugs.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: "#FDFBFF" },
  headerBg: { backgroundColor: "transparent" },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 112,
    gap: Spacing.sm,
  },

  // Overline section label
  overline: {
    ...Type.overline,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    marginBottom: 2,
    marginLeft: 4,
  },

  // Upgrade banner (inside Card)
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  upgradeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lavenderBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeText:  { flex: 1 },
  upgradeTitle: { ...Type.cardTitle, color: Colors.primaryPlum, marginBottom: 2 },
  upgradeSub:   { ...Type.bodySmall, color: Colors.textMuted },

  // Status flash
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  statusText: { ...Type.caption, color: Colors.purple, fontWeight: "700" },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    paddingVertical: 6,
    gap: Spacing.md,
  },
  rowLast:            { borderBottomWidth: 0 },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText:            { flex: 1 },
  rowTitle:           { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 2 },
  rowTitleDestructive:{ color: "#C03060" },
  rowSubtitle:        { ...Type.bodySmall, color: Colors.textMuted },

  // Premium pill
  premiumPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.purple,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumPillText: { ...Type.caption, color: "#fff", fontWeight: "700" },

  // Status pills
  pill: {
    backgroundColor: Colors.sageSurface,
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  pillText: { ...Type.caption, color: Colors.sageText, fontWeight: "700" },
  pillAmber: {
    backgroundColor: "#FFF8EC",
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  pillAmberText: { ...Type.caption, color: Colors.mutedGold, fontWeight: "700" },

  // About footer
  footer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: 5,
  },
  footerVersion: { ...Type.caption, color: Colors.textMuted },
  footerTagline: { ...Type.caption, color: Colors.textMuted },
  footerContact: {
    ...Type.caption,
    color: Colors.purple,
    textDecorationLine: "underline",
    marginTop: 4,
  },
});
