import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { createAccount, signInWithEmail, signOutUser, resetPassword, subscribeToAuthState, getCurrentUser } from "../src/lib/firebase";
import { useTheme } from "../src/ThemeContext";

export default function AccountScreen({ navigation }) {
  const theme = useTheme();
  const [tab, setTab] = useState("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => setUser(firebaseUser));
    return unsubscribe;
  }, []);

  const showStatus = (msg, error = false) => {
    setStatusMessage(msg); setIsError(error);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) { showStatus("Please enter your email and password.", true); return; }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) { showStatus(error, true); return; }
    showStatus("Welcome back! 💜");
  };

  const handleCreateAccount = async () => {
    if (!name.trim()) { showStatus("Please enter your name.", true); return; }
    if (!email.trim()) { showStatus("Please enter your email.", true); return; }
    if (password.length < 6) { showStatus("Password must be at least 6 characters.", true); return; }
    if (password !== confirmPassword) { showStatus("Passwords do not match.", true); return; }
    setLoading(true);
    const { error } = await createAccount(email.trim(), password, name.trim());
    setLoading(false);
    if (error) { showStatus(error, true); return; }
    showStatus("Account created! 💜");
  };

  const handleResetPassword = async () => {
    if (!email.trim()) { showStatus("Enter your email above first.", true); return; }
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) { showStatus(error, true); return; }
    showStatus("Reset email sent! Check your inbox.");
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure? Your data will remain on this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await signOutUser(); showStatus("Signed out."); } },
    ]);
  };

  const s = makeStyles(theme);

  if (user && !user.isAnonymous) {
    return (
      <SafeAreaView style={s.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Feather name="chevron-left" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Account</Text>
            <View style={s.headerSpacer} />
          </View>

          <View style={s.loggedInHero}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarInitial}>{(user.displayName || user.email || "U").charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={s.loggedInName}>{user.displayName || "BitzaHugs Member"}</Text>
            <Text style={s.loggedInEmail}>{user.email}</Text>
            <View style={s.activeBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#78A866" />
              <Text style={s.activeBadgeText}>Account Active</Text>
            </View>
          </View>

          <View style={s.syncCard}>
            <View style={s.syncCardHeader}>
              <View style={[s.iconBubble, { backgroundColor: theme.accentLight }]}>
                <Feather name="smartphone" size={15} color={theme.accent} />
              </View>
              <Text style={s.syncCardTitle}>Save Across Devices</Text>
              <View style={[s.syncBadge, { backgroundColor: theme.isDark ? "#1A2D18" : "#EEF7E8" }]}>
                <Text style={[s.syncBadgeText, { color: "#78A866" }]}>Active</Text>
              </View>
            </View>
            <Text style={s.syncCardBody}>Your routines, child profile, Support Snapshot, and mood history are being backed up securely. Access BitzaHugs from your phone or computer anytime.</Text>
          </View>

          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.iconBubble, { backgroundColor: theme.accentLight }]}>
                <Feather name="user" size={15} color={theme.accent} />
              </View>
              <Text style={s.cardTitle}>Account Details</Text>
            </View>
            <View style={s.detailRow}><Text style={s.detailLabel}>Name</Text><Text style={s.detailValue}>{user.displayName || "Not set"}</Text></View>
            <View style={s.detailRow}><Text style={s.detailLabel}>Email</Text><Text style={s.detailValue}>{user.email}</Text></View>
            <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={s.detailLabel}>Member Since</Text>
              <Text style={s.detailValue}>{user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</Text>
            </View>
          </View>

          <TouchableOpacity style={s.desktopCard} activeOpacity={0.88} onPress={() => Alert.alert("Desktop Portal", "Log into bitzahugs.com/login on your computer to access your Child Support Snapshot, PDF export, and printable resources from a full keyboard and screen.")}>
            <View style={[s.iconBubble, { backgroundColor: theme.blueLight }]}>
              <Feather name="monitor" size={15} color={theme.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.desktopTitle}>Access on Desktop</Text>
              <Text style={s.desktopSub}>Log in at bitzahugs.com/login to edit your Support Snapshot, export PDFs, and print resources.</Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.blue} />
          </TouchableOpacity>

          {statusMessage ? (
            <View style={[s.statusBanner, { backgroundColor: isError ? theme.isDark ? "#2D1510" : "#FFE6E4" : theme.accentLight, borderColor: isError ? "#D86A5B" : theme.accentBorder }]}>
              <Feather name={isError ? "alert-circle" : "check-circle"} size={15} color={isError ? "#D86A5B" : theme.accent} />
              <Text style={[s.statusText, { color: isError ? "#D86A5B" : theme.accent }]}>{statusMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
            <Feather name="log-out" size={16} color="#D86A5B" />
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={s.footerNote}>Your data stays on your device even after signing out.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Feather name="chevron-left" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Save Across Devices</Text>
            <View style={s.headerSpacer} />
          </View>

          <View style={s.heroCard}>
            <View style={s.heroIconCircle}>
              <Feather name="smartphone" size={26} color={theme.accent} />
            </View>
            <Text style={s.heroTitle}>Access BitzaHugs anywhere.</Text>
            <Text style={s.heroSub}>Create a free account to safely back up your routines, child profile, Support Snapshot, and mood history — and access them from your phone or computer.</Text>
          </View>

          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.iconBubble, { backgroundColor: theme.accentLight }]}>
                <Feather name="save" size={14} color={theme.accent} />
              </View>
              <Text style={s.cardTitle}>What gets backed up</Text>
            </View>
            {[
              { icon: "user", label: "Child profile & Support Snapshot", bg: theme.accentLight, color: theme.accent },
              { icon: "calendar", label: "Routines and progress", bg: theme.blueLight, color: theme.blue },
              { icon: "heart", label: "Mood history and check-ins", bg: "#FFE6E4", color: "#EF8F7D" },
              { icon: "book-open", label: "Journal entries (with your consent)", bg: theme.isDark ? "#1A2D18" : "#EEF7E8", color: "#78A866" },
              { icon: "calendar", label: "Appointments", bg: theme.isDark ? "#1A3D38" : "#E7F7F4", color: "#40A99B" },
            ].map((item, i) => (
              <View key={i} style={s.saveRow}>
                <View style={[s.saveIcon, { backgroundColor: item.bg }]}>
                  <Feather name={item.icon} size={13} color={item.color} />
                </View>
                <Text style={s.saveLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={s.consentCard}>
            <Feather name="lock" size={14} color={theme.blue} />
            <Text style={s.consentText}>By creating an account and turning on Backup & Sync, your saved BitzaHugs information may be stored securely in the cloud so you can access it across devices. You can choose what you share and delete your information at any time.</Text>
          </View>

          <View style={s.tabRow}>
            {[{ key: "sign_in", label: "Sign In" }, { key: "create_account", label: "Create Account" }].map((t) => (
              <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]} onPress={() => { setTab(t.key); setStatusMessage(""); }} activeOpacity={0.85}>
                <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.formCard}>
            {tab === "create_account" && (
              <>
                <Text style={s.inputLabel}>Your name</Text>
                <TextInput style={s.input} value={name} onChangeText={setName} placeholder="First name" placeholderTextColor={theme.textPlaceholder} autoCapitalize="words" />
              </>
            )}
            <Text style={s.inputLabel}>Email address</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={theme.textPlaceholder} keyboardType="email-address" autoCapitalize="none" />
            <Text style={s.inputLabel}>Password</Text>
            <View style={s.passwordWrap}>
              <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={password} onChangeText={setPassword} placeholder={tab === "create_account" ? "At least 6 characters" : "Your password"} placeholderTextColor={theme.textPlaceholder} secureTextEntry={!showPassword} />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            {tab === "create_account" && (
              <>
                <Text style={s.inputLabel}>Confirm password</Text>
                <TextInput style={s.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat your password" placeholderTextColor={theme.textPlaceholder} secureTextEntry={!showPassword} />
              </>
            )}

            {statusMessage ? (
              <View style={[s.statusBanner, { backgroundColor: isError ? theme.isDark ? "#2D1510" : "#FFE6E4" : theme.accentLight, borderColor: isError ? "#D86A5B" : theme.accentBorder }]}>
                <Feather name={isError ? "alert-circle" : "check-circle"} size={15} color={isError ? "#D86A5B" : theme.accent} />
                <Text style={[s.statusText, { color: isError ? "#D86A5B" : theme.accent }]}>{statusMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={[s.primaryBtn, loading && { opacity: 0.7 }]} onPress={tab === "sign_in" ? handleSignIn : handleCreateAccount} activeOpacity={0.88} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Feather name={tab === "sign_in" ? "log-in" : "user-plus"} size={17} color="#FFFFFF" />}
              <Text style={s.primaryBtnText}>{loading ? "Please wait..." : tab === "sign_in" ? "Sign In" : "Create Account"}</Text>
            </TouchableOpacity>

            {tab === "sign_in" && (
              <TouchableOpacity style={s.forgotBtn} onPress={handleResetPassword} activeOpacity={0.7} disabled={loading}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity style={s.skipBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Text style={s.skipText}>Maybe later — keep data local only</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.footerNote}>No account required. BitzaHugs works fully without one.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.accentLight, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.accentBorder },
    headerTitle: { color: theme.textPrimary, fontSize: 17, fontWeight: "800" },
    headerSpacer: { width: 38 },
    heroCard: { backgroundColor: theme.accentLight, borderRadius: 20, borderWidth: 1, borderColor: theme.accentBorder, padding: 20, alignItems: "center", marginBottom: 12 },
    heroIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.accentBorder, marginBottom: 14 },
    heroTitle: { color: theme.textPrimary, fontSize: 18, fontWeight: "800", marginBottom: 8, textAlign: "center" },
    heroSub: { color: theme.textSecondary, fontSize: 12, lineHeight: 18, textAlign: "center", fontWeight: "500" },
    card: { backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 14, marginBottom: 10, shadowColor: theme.cardShadowColor, shadowOpacity: theme.cardShadowOpacity, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
    iconBubble: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
    cardTitle: { flex: 1, color: theme.textPrimary, fontSize: 13, fontWeight: "800" },
    saveRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    saveIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    saveLabel: { flex: 1, color: theme.textSecondary, fontSize: 12, fontWeight: "500" },
    consentCard: { backgroundColor: theme.blueLight, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 16, borderWidth: 1, borderColor: theme.isDark ? "#1A2D3D" : "#B8D9F0" },
    consentText: { flex: 1, color: theme.blue, fontSize: 11, fontWeight: "600", lineHeight: 16 },
    tabRow: { flexDirection: "row", backgroundColor: theme.isDark ? "#1A1428" : "#F0EBF8", borderRadius: 14, padding: 4, marginBottom: 12 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center" },
    tabActive: { backgroundColor: theme.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    tabText: { color: theme.textMuted, fontSize: 13, fontWeight: "600" },
    tabTextActive: { color: theme.textPrimary, fontWeight: "800" },
    formCard: { backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 12 },
    inputLabel: { color: theme.textPrimary, fontSize: 12, fontWeight: "700", marginBottom: 6, marginTop: 4 },
    input: { height: 46, borderRadius: 12, backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, paddingHorizontal: 14, color: theme.textPrimary, fontSize: 14, fontWeight: "500", marginBottom: 10 },
    passwordWrap: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
    eyeBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, alignItems: "center", justifyContent: "center" },
    statusBanner: { borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, borderWidth: 1 },
    statusText: { flex: 1, fontSize: 12, fontWeight: "700" },
    primaryBtn: { height: 50, borderRadius: 14, backgroundColor: theme.accent, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8, shadowColor: theme.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
    primaryBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
    forgotBtn: { alignItems: "center", paddingVertical: 8 },
    forgotText: { color: theme.accent, fontSize: 13, fontWeight: "600" },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: theme.border },
    dividerText: { color: theme.textMuted, fontSize: 12, fontWeight: "600" },
    skipBtn: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center" },
    skipText: { color: theme.textMuted, fontSize: 13, fontWeight: "600" },
    loggedInHero: { backgroundColor: theme.accentLight, borderRadius: 20, borderWidth: 1, borderColor: theme.accentBorder, padding: 24, alignItems: "center", marginBottom: 12 },
    avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    avatarInitial: { color: "#FFFFFF", fontSize: 30, fontWeight: "800" },
    loggedInName: { color: theme.textPrimary, fontSize: 20, fontWeight: "800", marginBottom: 4 },
    loggedInEmail: { color: theme.textMuted, fontSize: 13, fontWeight: "600", marginBottom: 10 },
    activeBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: theme.isDark ? "#1A2D18" : "#EEF7E8", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
    activeBadgeText: { color: "#78A866", fontSize: 12, fontWeight: "700" },
    syncCard: { backgroundColor: theme.isDark ? "#1A2D18" : "#EEF7E8", borderRadius: 16, borderWidth: 1, borderColor: theme.isDark ? "#2A4A28" : "#C8E8B8", padding: 14, marginBottom: 10 },
    syncCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    syncCardTitle: { flex: 1, color: theme.textPrimary, fontSize: 13, fontWeight: "800" },
    syncBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    syncBadgeText: { fontSize: 10, fontWeight: "700" },
    syncCardBody: { color: theme.textSecondary, fontSize: 12, lineHeight: 17, fontWeight: "500" },
    detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
    detailLabel: { width: 110, color: theme.textMuted, fontSize: 12, fontWeight: "600" },
    detailValue: { flex: 1, color: theme.textPrimary, fontSize: 12, fontWeight: "700" },
    desktopCard: { backgroundColor: theme.blueLight, borderRadius: 16, borderWidth: 1, borderColor: theme.isDark ? "#1A2D3D" : "#B8D9F0", padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    desktopTitle: { color: theme.textPrimary, fontSize: 13, fontWeight: "800", marginBottom: 3 },
    desktopSub: { color: theme.textSecondary, fontSize: 11, lineHeight: 16, fontWeight: "500" },
    signOutBtn: { height: 48, borderRadius: 13, backgroundColor: theme.isDark ? "#2D1510" : "#FFF0EE", borderWidth: 1, borderColor: theme.isDark ? "#5A2820" : "#FFD0C0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 },
    signOutText: { color: "#D86A5B", fontSize: 14, fontWeight: "800" },
    footerNote: { color: theme.textMuted, fontSize: 11, fontWeight: "600", textAlign: "center", marginTop: 4 },
  });
}
