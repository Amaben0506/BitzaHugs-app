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
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// ─── Premium Badge ────────────────────────────────────────────────────────────
function PremiumBadge({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.premiumBadge}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name="sparkles" size={9} color="#7548D8" />
      <Text style={styles.premiumBadgeText}>Premium</Text>
    </TouchableOpacity>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, caption }) {
  return (
    <View style={{ marginTop: 4, marginBottom: 8 }}>
      <Text style={{ color: "#2B2463", fontSize: 15, fontWeight: "800" }}>{title}</Text>
      {caption ? <Text style={{ color: "#837E96", fontSize: 11, fontWeight: "600", marginTop: 1 }}>{caption}</Text> : null}
    </View>
  );
}

// ─── Settings Row ─────────────────────────────────────────────────────────────
function SettingsRow({ row, last, onPremiumPress }) {
  const Container = row.onPress || row.premium ? TouchableOpacity : View;
  return (
    <Container
      style={[styles.row, last && styles.rowLast]}
      onPress={row.premium ? onPremiumPress : row.onPress}
      activeOpacity={0.86}
    >
      <View style={[styles.iconBubble, { backgroundColor: row.bg }]}>
        <Feather name={row.icon} size={18} color={row.accent} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{row.title}</Text>
        <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
      </View>
      {row.premium ? (
        <PremiumBadge onPress={onPremiumPress} />
      ) : row.pill ? (
        <View style={styles.pill}><Text style={styles.pillTextGreen}>{row.pill}</Text></View>
      ) : row.onPress ? (
        <Feather name="chevron-right" size={18} color="#2B2463" />
      ) : null}
    </Container>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }) {
  const [childProfile, setChildProfile] = useState(null);
  const [supportPerson, setSupportPerson] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const cp = await AsyncStorage.getItem("bitzaChildProfile");
          const sp = await AsyncStorage.getItem("bitzaSupportPerson");
          setChildProfile(cp ? JSON.parse(cp) : null);
          setSupportPerson(sp ? JSON.parse(sp) : null);
        } catch (e) {
          console.log("Error loading settings:", e);
        }
      };
      load();
    }, [])
  );

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 2300);
  };

  const clearData = async (key, label, resetFn) => {
    try {
      await AsyncStorage.removeItem(key);
      resetFn?.();
      showStatus(`${label} cleared`);
    } catch (e) {
      console.log("Error:", e);
    }
  };

  const clearAll = async () => {
    try {
      await AsyncStorage.multiRemove([
        "calmJournalEntries",
        "bitzaRoutineItems",
        "bitzaChildProfile",
        "bitzaSupportPerson",
      ]);
      setChildProfile(null);
      setSupportPerson(null);
      showStatus("All prototype data cleared");
    } catch (e) {
      console.log("Error:", e);
    }
  };

  const childName = childProfile?.childName?.trim() || "Not set";
  const supportName = supportPerson?.name?.trim() || "Not set";

  const nav = (screen) =>
    navigation.getParent()?.navigate(screen) ?? navigation.navigate(screen);

  const goToPremium = () => nav("PremiumUpgrade");

  const profileRows = [
    { title: "Parent Profile", subtitle: "Caregiver details and preferences", icon: "user-check", bg: "#F0E2FF", accent: "#6F42D8", onPress: () => nav("ParentProfile") },
    { title: "Child Profile", subtitle: childName, icon: "user", bg: "#F0E2FF", accent: "#6F42D8", onPress: () => navigation.navigate("ChildProfile") },
    { title: "Support Person", subtitle: supportName, icon: "phone-call", bg: "#FFE6E4", accent: "#EF8F7D", onPress: () => nav("SupportPerson") },
    { title: "Appointment Tracker", subtitle: "Therapy, doctors, school & more", icon: "calendar", bg: "#E7F4FF", accent: "#4C9ED9", premium: true },
    { title: "Journal History", subtitle: "View saved calm journal entries", icon: "book-open", bg: "#EEF7E8", accent: "#78A866", premium: true, onPress: () => nav("JournalHistory") },
    { title: "Talk to Hugi", subtitle: "Your AI calm companion", icon: "message-circle", bg: "#E7F4FF", accent: "#4C9ED9", premium: true },
    { title: "Privacy & Safety", subtitle: "Hugi limits, data, and emergency info", icon: "shield", bg: "#F0E2FF", accent: "#6F42D8", onPress: () => nav("PrivacySafety") },
  ];

  const prefRows = [
    { title: "Notification Preferences", subtitle: "Choose gentle reminders", icon: "bell", bg: "#FFF0DF", accent: "#D99A3D", onPress: () => nav("NotificationPreferences") },
    { title: "Calm Theme", subtitle: "Soft cream and lavender active", icon: "moon", bg: "#EEF7E8", accent: "#78A866", pill: "On" },
  ];

  const dataRows = [
    { label: "Clear Journal Entries", icon: "book-open", onPress: () => clearData("calmJournalEntries", "Journal entries") },
    { label: "Clear Routine Data", icon: "calendar", onPress: () => clearData("bitzaRoutineItems", "Routine data") },
    { label: "Clear Child Profile", icon: "user", onPress: () => clearData("bitzaChildProfile", "Child profile", () => setChildProfile(null)) },
    { label: "Clear Support Person", icon: "phone-call", onPress: () => clearData("bitzaSupportPerson", "Support person", () => setSupportPerson(null)) },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Settings</Text>
            <Text style={styles.screenSubtitle}>Manage your support tools and saved info.</Text>
          </View>
          <View style={styles.headerIconButton}>
            <Feather name="settings" size={20} color="#6F42D8" strokeWidth={2.2} />
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require("../assets/icons/support-heart-hug.png")} style={styles.heroImage} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>BitzaHugs is here to help.</Text>
            <Text style={styles.heroText}>Keep your family support details organized in one calm place.</Text>
          </View>
        </View>

        {/* Premium Upgrade Banner */}
        <TouchableOpacity style={styles.upgradeBanner} onPress={goToPremium} activeOpacity={0.88}>
          <View style={styles.upgradeIconWrap}>
            <Ionicons name="sparkles" size={18} color="#7548D8" />
          </View>
          <View style={styles.upgradeTextWrap}>
            <Text style={styles.upgradeTitle}>Unlock BitzaHugs Premium</Text>
            <Text style={styles.upgradeSub}>Appointments, insights, unlimited journaling & more.</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#7548D8" />
        </TouchableOpacity>

        {/* Status Banner */}
        {statusMessage ? (
          <View style={styles.statusBanner}>
            <Feather name="check-circle" size={16} color="#6F42D8" />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        {/* Profile & Support */}
        <SectionHeader title="Profile & Support" caption="Quick access to important info." />
        <View style={styles.card}>
          {profileRows.map((row, i) => (
            <SettingsRow
              key={row.title}
              row={row}
              last={i === profileRows.length - 1}
              onPremiumPress={goToPremium}
            />
          ))}
        </View>

        {/* Preferences */}
        <SectionHeader title="App Preferences" caption="Customize your experience." />
        <View style={styles.card}>
          {prefRows.map((row, i) => (
            <SettingsRow
              key={row.title}
              row={row}
              last={i === prefRows.length - 1}
              onPremiumPress={goToPremium}
            />
          ))}
        </View>

        {/* Account */}
        <SectionHeader title="Account" caption="Prototype mode — no account required yet." />
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBubble, { backgroundColor: "#F0E2FF" }]}>
              <Feather name="user" size={18} color="#6F42D8" />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Prototype Mode</Text>
              <Text style={styles.rowSubtitle}>No account required while testing</Text>
            </View>
            <View style={styles.pill}><Text style={styles.pillTextGreen}>Local</Text></View>
          </View>
          <View style={styles.row}>
            <View style={[styles.iconBubble, { backgroundColor: "#E7F4FF" }]}>
              <Feather name="log-in" size={18} color="#4C9ED9" />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Sign In / Create Account</Text>
              <Text style={styles.rowSubtitle}>Coming soon for cloud sync</Text>
            </View>
            <View style={styles.pillAmber}><Text style={styles.pillTextAmber}>Soon</Text></View>
          </View>
          <TouchableOpacity
            style={[styles.row, styles.rowLast]}
            activeOpacity={0.86}
            onPress={() => showStatus("Logout coming when accounts are added")}
          >
            <View style={[styles.iconBubble, { backgroundColor: "#FFE7E1" }]}>
              <Feather name="log-out" size={18} color="#D86A5B" />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Log Out</Text>
              <Text style={styles.rowSubtitle}>Placeholder until accounts are added</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Safety & Privacy */}
        <SectionHeader title="Safety & Privacy" caption="Important notes for launch." />
        <View style={styles.card}>
          {[
            { title: "Hugi Safety Note", subtitle: "Hugi is supportive, not therapy or emergency care", icon: "shield", bg: "#F0E2FF" },
            { title: "Privacy Policy", subtitle: "Placeholder for app launch", icon: "lock", bg: "#E7F4FF" },
            { title: "Emergency Reminder", subtitle: "If there is danger, contact emergency services", icon: "alert-triangle", bg: "#FFE6E4" },
          ].map((row, i, arr) => (
            <View key={row.title} style={[styles.row, i === arr.length - 1 && styles.rowLast]}>
              <View style={[styles.iconBubble, { backgroundColor: row.bg }]}>
                <Feather name={row.icon} size={18} color="#6F42D8" />
              </View>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Prototype Data */}
        <SectionHeader title="Prototype Data" caption="Clear saved test data from this device." />
        <View style={styles.dangerCard}>
          {dataRows.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.dataRow, i === dataRows.length - 1 && styles.dataRowLast]}
              onPress={row.onPress}
              activeOpacity={0.86}
            >
              <Feather name={row.icon} size={18} color="#D86A5B" />
              <Text style={styles.dataRowText}>{row.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.clearAllButton} onPress={clearAll} activeOpacity={0.88}>
          <Feather name="trash-2" size={18} color="#FFFFFF" />
          <Text style={styles.clearAllText}>Clear All Prototype Data</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          For launch, this screen will include account, privacy policy, terms, and notification settings.
        </Text>
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

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  screenTitle: { color: "#2B2463", fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  screenSubtitle: { color: "#5B5672", fontSize: 12, fontWeight: "600", marginTop: 1 },
  headerIconButton: {
    width: 38, height: 38, borderRadius: 13, backgroundColor: "#F0E2FF",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8",
  },

  heroCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 2,
  },
  heroImage: { width: 48, height: 48, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  upgradeBanner: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 10,
  },
  upgradeIconWrap: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: "#EFE1FF",
    alignItems: "center", justifyContent: "center",
  },
  upgradeTextWrap: { flex: 1 },
  upgradeTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  upgradeSub: { color: "#5B5672", fontSize: 11, fontWeight: "600" },

  statusBanner: {
    height: 40, borderRadius: 13, backgroundColor: "#F0E2FF", borderWidth: 1,
    borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center",
    gap: 8, paddingHorizontal: 12, marginBottom: 10,
  },
  statusText: { color: "#6F42D8", fontSize: 13, fontWeight: "800" },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10,
    shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  row: {
    minHeight: 56, flexDirection: "row", alignItems: "center",
    borderBottomWidth: 1, borderBottomColor: "#F0E8E2", paddingVertical: 6,
  },
  rowLast: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  iconBubble: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: 11 },
  rowTextWrap: { flex: 1 },
  rowTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  rowSubtitle: { color: "#837E96", fontSize: 11, lineHeight: 15, fontWeight: "600" },

  premiumBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#F0E2FF", borderRadius: 8, paddingHorizontal: 6,
    paddingVertical: 3, borderWidth: 1, borderColor: "#D8C3F7",
  },
  premiumBadgeText: { color: "#7548D8", fontSize: 9, fontWeight: "800" },

  pill: { borderRadius: 10, backgroundColor: "#EEF7E8", paddingHorizontal: 8, paddingVertical: 4 },
  pillTextGreen: { color: "#78A866", fontSize: 10, fontWeight: "800" },
  pillAmber: { borderRadius: 10, backgroundColor: "#FFF0DF", paddingHorizontal: 8, paddingVertical: 4 },
  pillTextAmber: { color: "#D99A3D", fontSize: 10, fontWeight: "800" },

  dangerCard: {
    backgroundColor: "#FFF1EC", borderRadius: 18, borderWidth: 1,
    borderColor: "#FFD0C0", paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10,
  },
  dataRow: {
    minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10,
    borderBottomWidth: 1, borderBottomColor: "#FFD8CF",
  },
  dataRowLast: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10 },
  dataRowText: { color: "#D86A5B", fontSize: 13, fontWeight: "800" },

  clearAllButton: {
    height: 48, borderRadius: 16, backgroundColor: "#D86A5B",
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginBottom: 12,
  },
  clearAllText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});