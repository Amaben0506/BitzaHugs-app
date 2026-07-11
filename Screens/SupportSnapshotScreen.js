import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Platform, Share, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../src/lib/firebase";
import { useTheme } from "../src/ThemeContext";
import { usePremium } from "../src/lib/premium";
import { syncToFirestore } from "../src/lib/syncService";

const EXPIRY_OPTIONS = [
  { label: "24 hours", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
];

const STORAGE_KEY = "bitzaChildProfile";
const EXTRA_STORAGE_KEY = "bitzaChildProfiles";

const AVATARS = [
  { id: "01", source: require("../assets/icons/child-profile-01.png") },
  { id: "02", source: require("../assets/icons/child-profile-02.png") },
  { id: "03", source: require("../assets/icons/child-profile-03.png") },
  { id: "04", source: require("../assets/icons/child-profile-04.png") },
  { id: "05", source: require("../assets/icons/child-profile-05.png") },
  { id: "06", source: require("../assets/icons/child-profile-06.png") },
  { id: "07", source: require("../assets/icons/child-profile-07.png") },
  { id: "08", source: require("../assets/icons/child-profile-08.png") },
  { id: "09", source: require("../assets/icons/child-profile-09.png") },
  { id: "10", source: require("../assets/icons/child-profile-10.png") },
  { id: "11", source: require("../assets/icons/child-profile-11.png") },
  { id: "12", source: require("../assets/icons/child-profile-12.png") },
];

// ── Snapshot Section Card ─────────────────────────────────────────────────────
function SnapshotCard({ icon, iconBg, iconColor, title, children, theme }) {
  const s = makeStyles(theme);
  if (!children) return null;
  return (
    <View style={s.snapshotCard}>
      <View style={s.snapshotCardHeader}>
        <View style={[s.snapshotCardIcon, { backgroundColor: iconBg }]}>
          <Feather name={icon} size={14} color={iconColor} />
        </View>
        <Text style={[s.snapshotCardTitle, { color: iconColor }]}>{title}</Text>
      </View>
      <Text style={s.snapshotCardText}>{children}</Text>
    </View>
  );
}

export default function SupportSnapshotScreen({ navigation, route }) {
  const theme = useTheme();
  const childIndex = route?.params?.childIndex || 0;
  const [profile, setProfile] = useState(null);
  const [shareCode, setShareCode] = useState(null);
  const [expiryDays, setExpiryDays] = useState(7);
  const [generatingCode, setGeneratingCode] = useState(false);
  const { requirePremium } = usePremium();

  useFocusEffect(useCallback(() => {
    const load = async () => {
      try {
        const saved = childIndex === 0
          ? await AsyncStorage.getItem(STORAGE_KEY)
          : await AsyncStorage.getItem(EXTRA_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const p = childIndex === 0 ? parsed : parsed[childIndex - 1];
          setProfile(p || null);
        }
      } catch (e) { console.log("Error loading snapshot:", e); }
    };
    load();

    const uid = getAuth().currentUser?.uid;

    const syncInBackground = async () => {
      try {
        if (!uid) return;
        await syncToFirestore(uid, "bitzaChildProfile");
        await syncToFirestore(uid, "bitzaRoutineItems");
      } catch (e) { console.log("Background sync error:", e); }
    };
    syncInBackground();

    const loadShareCode = async () => {
      try {
        if (!uid) { setShareCode(null); return; }
        const snap = await getDoc(doc(db, "shareCodes", uid));
        const data = snap.exists() ? snap.data() : null;
        const isValid = data?.active && data?.expires && new Date(data.expires) > new Date();
        setShareCode(isValid ? data : null);
      } catch (e) { console.log("Error loading share code:", e); }
    };
    loadShareCode();
  }, [childIndex]));

  const handleShare = async () => {
    if (!profile) return;
    try {
      const name = profile.childName || "My Child";
      const lines = [
        `💜 ${name}'s Support Snapshot`,
        `Created with BitzaHugs\n`,
        profile.communicationStyle && profile.communicationStyle !== "Not added yet" ? `📢 Communication: ${profile.communicationStyle}` : null,
        profile.sensoryNeeds ? `✨ Sensory Needs: ${profile.sensoryNeeds}` : null,
        profile.triggers ? `⚠️ Triggers: ${profile.triggers}` : null,
        profile.whatHelps ? `💚 What Helps: ${profile.whatHelps}` : null,
        profile.whatMakesItHarder ? `🚫 What Makes It Harder: ${profile.whatMakesItHarder}` : null,
        profile.transitionTips ? `⏰ Transition Tips: ${profile.transitionTips}` : null,
        profile.favoriteComforts ? `⭐ Favorite Comforts: ${profile.favoriteComforts}` : null,
        profile.meltdownRecoveryPlan ? `🌱 Meltdown Recovery: ${profile.meltdownRecoveryPlan}` : null,
        profile.emergencyNotes ? `🛡️ Emergency Notes: ${profile.emergencyNotes}` : null,
        `\nOnly share with people you trust. 💜`,
      ].filter(Boolean).join("\n");

      await Share.share({ message: lines, title: `${name}'s Support Snapshot` });
    } catch (e) { console.log("Share error:", e); }
  };

  const generateShareCode = async () => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      Alert.alert("Sign in required", "Please sign in to generate a share code.");
      return;
    }
    setGeneratingCode(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      const expires = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
      const newCode = { code, expires, uid, active: true, createdAt: now.toISOString() };
      await setDoc(doc(db, "shareCodes", uid), newCode);
      setShareCode(newCode);
    } catch (e) {
      console.log("Error generating share code:", e);
      Alert.alert("Oops", "Couldn't generate a share code. Please try again.");
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyShareCode = () => {
    if (!shareCode?.code) return;
    try {
      require("react-native").Clipboard.setString(shareCode.code);
      Alert.alert("Copied", "Share code copied to clipboard.");
    } catch (e) { console.log("Copy error:", e); }
  };

  const revokeShareCode = () => {
    Alert.alert(
      "Revoke share code?",
      "The teacher, therapist, or aide using this code will lose access immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            const uid = getAuth().currentUser?.uid;
            if (!uid) return;
            try {
              await deleteDoc(doc(db, "shareCodes", uid));
              setShareCode(null);
            } catch (e) { console.log("Error revoking share code:", e); }
          },
        },
      ]
    );
  };

  const handlePDFExport = () => {
    if (requirePremium({ feature: "pdf_exports" })) {
      Alert.alert("PDF Export", "PDF export is coming in the next update! 💜");
    }
  };

  const s = makeStyles(theme);
  const displayName = profile?.childName?.trim() || "Your Child";
  const avatarSource = AVATARS.find((a) => a.id === profile?.avatar)?.source || AVATARS[0].source;
  const updatedDate = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const shareCodeExpiresLabel = shareCode?.expires
    ? new Date(shareCode.expires).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  if (!profile) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Support Snapshot</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={s.emptyWrap}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>💜</Text>
          <Text style={s.emptyTitle}>No profile yet</Text>
          <Text style={s.emptySub}>Fill in your child's profile to generate their Support Snapshot.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.goBack()} activeOpacity={0.88}>
            <Text style={s.emptyBtnText}>Set up profile →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="chevron-left" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Support Snapshot</Text>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate("ChildProfile", { childIndex })} activeOpacity={0.85}>
          <Feather name="edit-2" size={18} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Privacy Notice */}
        <View style={s.privacyNotice}>
          <Feather name="shield" size={13} color={theme.accent} />
          <Text style={s.privacyText}>Share this profile only with people you trust. Your child's information is private by default.</Text>
        </View>

        {/* Hero Card */}
        <View style={s.heroCard}>
          <View style={s.heroCardTop}>
            <View style={s.heroAvatarWrap}>
              <Image source={avatarSource} style={s.heroAvatar} resizeMode="contain" />
            </View>
            <View style={s.heroInfo}>
              <Text style={s.heroName}>{displayName}</Text>
              {profile.nickname?.trim() && <Text style={s.heroNickname}>"{profile.nickname}"</Text>}
              {profile.age && profile.age !== "Not added yet" && <Text style={s.heroAge}>Age {profile.age}</Text>}
              {profile.dob && profile.dob !== "Not added yet" && <Text style={s.heroDob}>DOB: {profile.dob}</Text>}
            </View>
          </View>
          {profile.communicationStyle && profile.communicationStyle !== "Not added yet" && (
            <View style={s.commRow}>
              <View style={s.commIcon}><Feather name="message-circle" size={13} color={theme.accent} /></View>
              <Text style={s.commText}>{profile.communicationStyle}</Text>
            </View>
          )}
          {profile.supportNeeds?.length > 0 && (
            <View style={s.needsRow}>
              {profile.supportNeeds.map((need) => (
                <View key={need} style={s.needChip}><Text style={s.needChipText}>{need}</Text></View>
              ))}
            </View>
          )}
        </View>

        {/* Snapshot Grid */}
        <View style={s.grid}>
          <SnapshotCard theme={theme} icon="zap" iconBg={theme.isDark ? "#2A1F0A" : "#FFF0DF"} iconColor="#D99A3D" title="Sensory Needs">
            {profile.sensoryNeeds}
          </SnapshotCard>
          <SnapshotCard theme={theme} icon="alert-circle" iconBg={theme.isDark ? "#2D1510" : "#FFE6E4"} iconColor="#EF8F7D" title="Triggers">
            {profile.triggers}
          </SnapshotCard>
          <SnapshotCard theme={theme} icon="sun" iconBg={theme.greenLight} iconColor={theme.green} title="What Helps Calm Them">
            {profile.whatHelps}
          </SnapshotCard>
          <SnapshotCard theme={theme} icon="x-circle" iconBg={theme.isDark ? "#2D1510" : "#FFE6E4"} iconColor="#EF8F7D" title="What Makes It Harder">
            {profile.whatMakesItHarder}
          </SnapshotCard>
          <SnapshotCard theme={theme} icon="clock" iconBg={theme.isDark ? "#1A1428" : "#EBF0FF"} iconColor="#5B7BE8" title="Transition Tips">
            {profile.transitionTips}
          </SnapshotCard>
          <SnapshotCard theme={theme} icon="heart" iconBg={theme.isDark ? "#2D1510" : "#FFE6E4"} iconColor="#EF8F7D" title="Favorite Comforts">
            {profile.favoriteComforts}
          </SnapshotCard>
          <SnapshotCard theme={theme} icon="star" iconBg={theme.isDark ? "#2A1F0A" : "#FFF0DF"} iconColor="#D99A3D" title="Favorite Reinforcers">
            {profile.favoriteReinforcers}
          </SnapshotCard>
          <SnapshotCard theme={theme} icon="calendar" iconBg={theme.accentLight} iconColor={theme.accent} title="Daily Routines">
            {profile.supportNeeds?.includes("Routine changes") ? "Has structured daily routines — see BitzaHugs app for details." : profile.notes}
          </SnapshotCard>
        </View>

        {/* Full-width sections */}
        {profile.meltdownRecoveryPlan?.trim() && (
          <View style={s.fullCard}>
            <View style={s.fullCardHeader}>
              <View style={[s.fullCardIcon, { backgroundColor: theme.isDark ? "#2D1510" : "#FFE6E4" }]}>
                <Feather name="activity" size={15} color="#EF8F7D" />
              </View>
              <Text style={[s.fullCardTitle, { color: "#EF8F7D" }]}>Meltdown Recovery Plan</Text>
            </View>
            <Text style={s.fullCardText}>{profile.meltdownRecoveryPlan}</Text>
          </View>
        )}

        {profile.emergencyNotes?.trim() && (
          <View style={[s.fullCard, { borderColor: "#EF8F7D", borderWidth: 1.5 }]}>
            <View style={s.fullCardHeader}>
              <View style={[s.fullCardIcon, { backgroundColor: theme.isDark ? "#2D1510" : "#FFE6E4" }]}>
                <Feather name="shield" size={15} color="#EF8F7D" />
              </View>
              <Text style={[s.fullCardTitle, { color: "#EF8F7D" }]}>Emergency & Safety Notes</Text>
            </View>
            <Text style={s.fullCardText}>{profile.emergencyNotes}</Text>
          </View>
        )}

        {/* Important People */}
        {profile.importantPeople?.some((p) => p.name?.trim()) && (
          <View style={s.fullCard}>
            <View style={s.fullCardHeader}>
              <View style={[s.fullCardIcon, { backgroundColor: theme.isDark ? "#0F1E2D" : "#E7F4FF" }]}>
                <Feather name="users" size={15} color="#4C9ED9" />
              </View>
              <Text style={[s.fullCardTitle, { color: "#4C9ED9" }]}>Important People</Text>
            </View>
            {profile.importantPeople.filter((p) => p.name?.trim()).map((person, idx) => (
              <View key={idx} style={[s.personRow, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.border }]}>
                <View style={s.personAvatar}>
                  <Text style={s.personAvatarText}>{person.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.personName}>{person.name}</Text>
                  {person.relationship?.trim() && <Text style={s.personRole}>{person.relationship}</Text>}
                </View>
                {person.phone?.trim() && <Text style={s.personPhone}>{person.phone}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Additional Notes */}
        {profile.additionalNotes?.trim() && (
          <View style={s.fullCard}>
            <View style={s.fullCardHeader}>
              <View style={[s.fullCardIcon, { backgroundColor: theme.accentLight }]}>
                <Feather name="edit-3" size={15} color={theme.accent} />
              </View>
              <Text style={[s.fullCardTitle, { color: theme.accent }]}>Additional Notes</Text>
            </View>
            <Text style={s.fullCardText}>{profile.additionalNotes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footerRow}>
          {updatedDate && (
            <View style={s.footerItem}>
              <Feather name="clock" size={11} color={theme.textMuted} />
              <Text style={s.footerItemText}>Last updated {updatedDate}</Text>
            </View>
          )}
          <View style={s.footerItem}>
            <Feather name="info" size={11} color={theme.textMuted} />
            <Text style={s.footerItemText}>This profile can be updated anytime.</Text>
          </View>
          <View style={s.footerItem}>
            <Text style={{ fontSize: 11 }}>💜</Text>
            <Text style={s.footerItemText}>You're doing amazing.</Text>
          </View>
        </View>

        {/* Share with Support Team */}
        <View style={s.shareCodeCard}>
          <View style={s.shareCodeHeader}>
            <View style={s.shareCodeIcon}>
              <Feather name="users" size={16} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.shareCodeTitle}>Share with Support Team</Text>
              <Text style={s.shareCodeSubtitle}>Generate a secure code for teachers, therapists, or aides</Text>
            </View>
          </View>

          {shareCode ? (
            <View style={s.activeCodeWrap}>
              <Text style={s.activeCodeLabel}>Active share code</Text>
              <Text style={s.activeCodeValue}>{shareCode.code}</Text>
              {shareCodeExpiresLabel && (
                <Text style={s.activeCodeExpiry}>Expires {shareCodeExpiresLabel}</Text>
              )}
              <View style={s.activeCodeActions}>
                <TouchableOpacity style={s.codeActionBtn} onPress={copyShareCode} activeOpacity={0.85}>
                  <Feather name="copy" size={14} color={theme.accent} />
                  <Text style={s.codeActionBtnText}>Copy Code</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.codeActionBtn, s.revokeBtn]} onPress={revokeShareCode} activeOpacity={0.85}>
                  <Feather name="x-circle" size={14} color="#EF8F7D" />
                  <Text style={[s.codeActionBtnText, { color: "#EF8F7D" }]}>Revoke</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={s.expiryRow}>
                {EXPIRY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.days}
                    style={[s.expiryChip, expiryDays === opt.days && s.expiryChipSelected]}
                    onPress={() => setExpiryDays(opt.days)}
                    activeOpacity={0.85}
                  >
                    <Text style={[s.expiryChipText, expiryDays === opt.days && s.expiryChipTextSelected]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[s.generateBtn, generatingCode && { opacity: 0.7 }]}
                onPress={generateShareCode}
                activeOpacity={0.88}
                disabled={generatingCode}
              >
                <Feather name="key" size={16} color="#FFFFFF" />
                <Text style={s.generateBtnText}>{generatingCode ? "Generating..." : "Generate Share Code"}</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={s.shareCodeNote}>The code gives read-only access to this snapshot. You can revoke it anytime.</Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.88}>
          <Feather name="share-2" size={18} color="#FFFFFF" />
          <Text style={s.shareBtnText}>Share Snapshot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.pdfBtn} onPress={handlePDFExport} activeOpacity={0.88}>
          <Feather name="file-text" size={18} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={s.pdfBtnText}>Export as PDF</Text>
            <Text style={s.pdfBtnSub}>Coming soon · Premium feature</Text>
          </View>
          <View style={s.pdfPremiumBadge}>
            <Text style={s.pdfPremiumText}>✦ Premium</Text>
          </View>
        </TouchableOpacity>

        <View style={s.privacyFooter}>
          <Feather name="lock" size={12} color={theme.textMuted} />
          <Text style={s.privacyFooterText}>Your data is private and only shared by you.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },

    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: Platform.OS === "ios" ? 4 : 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
    headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.accentLight, alignItems: "center", justifyContent: "center" },
    headerTitle: { color: theme.textPrimary, fontSize: 17, fontWeight: "800" },

    content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100 },

    privacyNotice: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: theme.accentLight, borderRadius: 12, borderWidth: 1, borderColor: theme.accentBorder, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
    privacyText: { flex: 1, color: theme.accent, fontSize: 11, fontWeight: "600", lineHeight: 16 },

    // Hero card
    heroCard: { backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 12, shadowColor: theme.cardShadowColor, shadowOpacity: theme.cardShadowOpacity, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    heroCardTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
    heroAvatarWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.accentLight, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: theme.accentBorder, overflow: "hidden" },
    heroAvatar: { width: 66, height: 66 },
    heroInfo: { flex: 1 },
    heroName: { color: theme.textPrimary, fontSize: 24, fontWeight: "900", letterSpacing: -0.3, marginBottom: 2 },
    heroNickname: { color: theme.textMuted, fontSize: 12, fontWeight: "600", fontStyle: "italic", marginBottom: 3 },
    heroAge: { color: theme.textSecondary, fontSize: 13, fontWeight: "700" },
    heroDob: { color: theme.textMuted, fontSize: 11, fontWeight: "600", marginTop: 1 },
    commRow: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: theme.accentLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 10 },
    commIcon: { width: 22, height: 22, borderRadius: 7, backgroundColor: theme.isDark ? theme.accent + "30" : "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" },
    commText: { color: theme.accent, fontSize: 12, fontWeight: "800", flex: 1 },
    needsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    needChip: { backgroundColor: theme.isDark ? "#2A1A4A" : "#F0E2FF", borderRadius: 9, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: theme.accentBorder },
    needChipText: { color: theme.accent, fontSize: 10, fontWeight: "700" },

    // Grid
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
    snapshotCard: { width: "47.5%", backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 12, shadowColor: theme.cardShadowColor, shadowOpacity: theme.cardShadowOpacity, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    snapshotCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
    snapshotCardIcon: { width: 24, height: 24, borderRadius: 7, alignItems: "center", justifyContent: "center" },
    snapshotCardTitle: { fontSize: 11, fontWeight: "900", flex: 1 },
    snapshotCardText: { color: theme.textSecondary, fontSize: 11, lineHeight: 16, fontWeight: "600" },

    // Full width cards
    fullCard: { backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 14, marginBottom: 10, shadowColor: theme.cardShadowColor, shadowOpacity: theme.cardShadowOpacity, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    fullCardHeader: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
    fullCardIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
    fullCardTitle: { fontSize: 14, fontWeight: "900" },
    fullCardText: { color: theme.textSecondary, fontSize: 13, lineHeight: 19, fontWeight: "600" },

    // People
    personRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
    personAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.accentLight, alignItems: "center", justifyContent: "center" },
    personAvatarText: { color: theme.accent, fontSize: 13, fontWeight: "800" },
    personName: { color: theme.textPrimary, fontSize: 13, fontWeight: "800" },
    personRole: { color: theme.textMuted, fontSize: 11, fontWeight: "600" },
    personPhone: { color: theme.accent, fontSize: 12, fontWeight: "700" },

    // Footer
    footerRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 16, paddingHorizontal: 8 },
    footerItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    footerItemText: { color: theme.textMuted, fontSize: 10, fontWeight: "600" },

    // Share with Support Team
    shareCodeCard: { backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 12, shadowColor: theme.cardShadowColor, shadowOpacity: theme.cardShadowOpacity, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    shareCodeHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
    shareCodeIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: theme.accentLight, alignItems: "center", justifyContent: "center" },
    shareCodeTitle: { color: theme.textPrimary, fontSize: 14, fontWeight: "900", marginBottom: 2 },
    shareCodeSubtitle: { color: theme.textMuted, fontSize: 11, fontWeight: "600", lineHeight: 15 },

    expiryRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
    expiryChip: { flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: theme.accentBorder, paddingVertical: 9, alignItems: "center", backgroundColor: theme.accentLight },
    expiryChipSelected: { backgroundColor: "#6F42D8", borderColor: "#6F42D8" },
    expiryChipText: { color: theme.accent, fontSize: 12, fontWeight: "800" },
    expiryChipTextSelected: { color: "#FFFFFF" },

    generateBtn: { backgroundColor: "#6F42D8", borderRadius: 14, height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 },
    generateBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

    activeCodeWrap: { backgroundColor: theme.accentLight, borderRadius: 14, borderWidth: 1, borderColor: theme.accentBorder, padding: 14, alignItems: "center", marginBottom: 10 },
    activeCodeLabel: { color: theme.accent, fontSize: 11, fontWeight: "800", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
    activeCodeValue: { color: theme.textPrimary, fontSize: 30, fontWeight: "900", letterSpacing: 6, marginBottom: 4 },
    activeCodeExpiry: { color: theme.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 10 },
    activeCodeActions: { flexDirection: "row", gap: 10 },
    codeActionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.accentBorder },
    codeActionBtnText: { color: theme.accent, fontSize: 12, fontWeight: "800" },
    revokeBtn: { borderColor: "#EF8F7D" },

    shareCodeNote: { color: theme.textMuted, fontSize: 10.5, fontWeight: "600", lineHeight: 15, textAlign: "center" },

    // Buttons
    shareBtn: { backgroundColor: "#6F42D8", borderRadius: 16, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10, shadowColor: "#6F42D8", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    shareBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

    pdfBtn: { backgroundColor: theme.card, borderRadius: 16, height: 58, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12, marginBottom: 12, borderWidth: 1.5, borderColor: theme.accentBorder },
    pdfBtnText: { color: theme.textPrimary, fontSize: 14, fontWeight: "800" },
    pdfBtnSub: { color: theme.textMuted, fontSize: 10, fontWeight: "600", marginTop: 1 },
    pdfPremiumBadge: { backgroundColor: theme.accentLight, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: theme.accentBorder },
    pdfPremiumText: { color: theme.accent, fontSize: 10, fontWeight: "900" },

    privacyFooter: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 4 },
    privacyFooterText: { color: theme.textMuted, fontSize: 11, fontWeight: "600" },

    // Empty state
    emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
    emptyTitle: { fontSize: 20, fontWeight: "900", color: theme.textPrimary, marginBottom: 8 },
    emptySub: { fontSize: 14, color: theme.textMuted, fontWeight: "600", textAlign: "center", lineHeight: 20, marginBottom: 24 },
    emptyBtn: { backgroundColor: "#6F42D8", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
    emptyBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  });
}
