import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Platform, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

const PARENT_PROFILE_KEY = "bitzaParentProfile";

const TONE_OPTIONS = [
  { label: "Gentle", value: "gentle", icon: "heart", grad: ["#F0E4FF", "#FAF0FF"], color: "#7548D8", desc: "Soft and warm" },
  { label: "Practical", value: "practical", icon: "check-circle", grad: ["#E8F7EE", "#F5FFF9"], color: "#4A9E5C", desc: "Clear and actionable" },
  { label: "Direct", value: "direct", icon: "zap", grad: ["#E8F3FF", "#F0F8FF"], color: "#4C9ED9", desc: "No fluff, just facts" },
  { label: "Encouraging", value: "encouraging", icon: "sun", grad: ["#FFF5E8", "#FFFCF0"], color: "#C8872A", desc: "Uplifting and warm" },
];

const BLANK = {
  name: "", relationship: "", preferredGreeting: "",
  stressSupport: "", wordsThatHelp: "", wordsThatDontHelp: "",
  calmingStrategies: "", hugiTone: "gentle", photoUri: "",
};

function InfoRow({ label, value, last }) {
  if (!value?.trim()) return null;
  return (
    <View style={[ir.row, last && { borderBottomWidth: 0 }]}>
      <Text style={ir.label}>{label}</Text>
      <Text style={ir.value}>{value}</Text>
    </View>
  );
}
const ir = StyleSheet.create({
  row: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F5F0FA" },
  label: { color: "#8B7BAA", fontSize: 10, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 3 },
  value: { color: "#2B1D5E", fontSize: 13, fontWeight: "700", lineHeight: 19 },
});

// ── Card ──────────────────────────────────────────────────────────────────────
function SectionCard({ iconName, iconBg, iconColor, title, gradColors, children }) {
  return (
    <View style={cs.card}>
      <LinearGradient colors={gradColors || ["#F8F0FF", "#FFF9F2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cs.hdr}>
        <View style={[cs.iconWrap, { backgroundColor: iconBg || "rgba(255,255,255,0.7)" }]}>
          <Feather name={iconName} size={18} color={iconColor || "#7548D8"} />
        </View>
        <Text style={cs.title}>{title}</Text>
      </LinearGradient>
      <View style={cs.body}>{children}</View>
    </View>
  );
}
const cs = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: 1.5, borderColor: "#EDE4F5", marginBottom: 12, overflow: "hidden", backgroundColor: "#FFFFFF", shadowColor: "#7548D8", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 3 },
  hdr: { padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" },
  title: { color: "#2B1D5E", fontSize: 14, fontWeight: "900", letterSpacing: -0.2, flex: 1 },
  body: { padding: 16, gap: 12 },
});

// ── Field helpers ─────────────────────────────────────────────────────────────
const FL = ({ label }) => (
  <Text style={{ color: "#7B5EA7", fontSize: 10, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>{label}</Text>
);
const FI = ({ value, onChangeText, placeholder }) => (
  <TextInput
    style={{ backgroundColor: "#FDFAFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#EDE4F5", paddingHorizontal: 14, paddingVertical: 11, fontSize: 13, color: "#2B2463", fontWeight: "600" }}
    value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#C0B8D0"
  />
);
const TA = ({ value, onChangeText, placeholder, rows = 3 }) => (
  <TextInput
    style={{ backgroundColor: "#FDFAFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#EDE4F5", paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontSize: 13, color: "#2B2463", fontWeight: "600", minHeight: rows * 26, textAlignVertical: "top" }}
    value={value} onChangeText={onChangeText} placeholder={placeholder}
    placeholderTextColor="#C0B8D0" multiline numberOfLines={rows}
  />
);
const Helper = ({ text }) => (
  <Text style={{ color: "#8B7BAA", fontSize: 11, fontWeight: "600", lineHeight: 17, marginBottom: 2 }}>{text}</Text>
);

export default function ParentProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(BLANK);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [savedMsg, setSavedMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(PARENT_PROFILE_KEY).then(raw => {
      if (!raw) return;
      const p = JSON.parse(raw);
      setProfile({ ...BLANK, ...p });
      setDraft({ ...BLANK, ...p });
    }).catch(console.log);
  }, []));

  const showStatus = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = { ...draft, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(PARENT_PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated); setEditing(false);
      showStatus("Profile saved! 💜");
    } catch (e) { console.log(e); }
    finally { setIsSaving(false); }
  };

  const handleCancel = () => { setDraft({ ...profile }); setEditing(false); };

  const handleClear = () => {
    Alert.alert("Clear Profile?", "This will remove your saved profile details.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        try {
          await AsyncStorage.removeItem(PARENT_PROFILE_KEY);
          setProfile(BLANK); setDraft(BLANK); setEditing(false);
          showStatus("Profile cleared");
        } catch (e) { console.log(e); }
      }}
    ]);
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "Please allow photo access to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const updated = { ...profile, photoUri: uri };
      await AsyncStorage.setItem(PARENT_PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated);
      setDraft(p => ({ ...p, photoUri: uri }));
      showStatus("Photo updated! 💜");
    }
  };

  const set = (key, val) => setDraft(p => ({ ...p, [key]: val }));

  const currentTone = TONE_OPTIONS.find(t => t.value === (editing ? draft.hugiTone : profile.hugiTone)) || TONE_OPTIONS[0];
  const displayName = profile.preferredGreeting?.trim() || profile.name?.trim() || "Caregiver";
  const hasProfile = !!(profile.name?.trim() || profile.relationship?.trim());

  const SUPPORT_SECTIONS = [
    { title: "When I'm Overwhelmed", icon: "heart", iconBg: "#FFE3DA", iconColor: "#EF8F7D", key: "stressSupport", gradColors: ["#FFF0EB", "#FFF8F5"], helper: "What do you want BitzaHugs to remind you of during hard moments?", placeholder: "e.g. Remind me to breathe first, lower my voice..." },
    { title: "Words That Help", icon: "sun", iconBg: "#EEF7E8", iconColor: "#4A9E5C", key: "wordsThatHelp", gradColors: ["#EAF7EE", "#F5FFF9"], helper: "Save phrases that feel comforting or grounding.", placeholder: "e.g. You are not failing. One small step..." },
    { title: "Words That Don't Help", icon: "x-circle", iconBg: "#FFE7E1", iconColor: "#D86A5B", key: "wordsThatDontHelp", gradColors: ["#FFF0EC", "#FFF8F6"], helper: "Phrases that feel too harsh or dismissive.", placeholder: "e.g. Calm down, just relax..." },
    { title: "My Calming Strategies", icon: "wind", iconBg: "#F0E2FF", iconColor: "#7548D8", key: "calmingStrategies", gradColors: ["#F0E4FF", "#FAF6FF"], helper: "What helps you personally reset, even a little?", placeholder: "e.g. Stepping outside, music, journaling..." },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <LinearGradient colors={["#EFE0FF", "#FFF9F2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroGrad}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#7548D8" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.screenTitle}>Parent Profile</Text>
            <Text style={s.screenSub}>Your preferences and support style.</Text>
          </View>
          {editing ? (
            <TouchableOpacity style={[s.backBtn, { backgroundColor: "#7548D8" }]} onPress={handleSave} disabled={isSaving} activeOpacity={0.85}>
              {isSaving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.backBtn} onPress={() => setEditing(true)} activeOpacity={0.85}>
              <Feather name="edit-2" size={17} color="#7548D8" />
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Status */}
        {savedMsg ? (
          <View style={s.statusBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#4A9E5C" />
            <Text style={s.statusTxt}>{savedMsg}</Text>
          </View>
        ) : null}

        {editing && (
          <View style={s.editBanner}>
            <Feather name="edit-2" size={13} color="#7548D8" />
            <Text style={s.editBannerTxt}>Editing your profile</Text>
          </View>
        )}

        {/* ── VIEW MODE ──────────────────────────────────────────────── */}
        {!editing && (
          <>
            {/* Hero Profile Card */}
            <View style={s.heroCard}>
              <LinearGradient colors={["#F0E4FF", "#FFF9F2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroCardGrad}>
                <TouchableOpacity style={s.avatarWrap} onPress={handlePickPhoto} activeOpacity={0.85}>
                  {profile.photoUri ? (
                    <Image source={{ uri: profile.photoUri }} style={s.avatarCircle} />
                  ) : (
                    <View style={s.avatarCircle}>
                      <Ionicons name="person" size={38} color="#7548D8" />
                    </View>
                  )}
                  <View style={s.avatarCamBadge}>
                    <Feather name="camera" size={11} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>

                <Text style={s.heroName}>{displayName}</Text>
                {profile.relationship?.trim() ? (
                  <Text style={s.heroRole}>{profile.relationship}</Text>
                ) : null}

                {/* Tone Badge */}
                <LinearGradient colors={currentTone.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.toneBadge}>
                  <Feather name={currentTone.icon} size={13} color={currentTone.color} />
                  <Text style={[s.toneBadgeTxt, { color: currentTone.color }]}>Hugi tone: {currentTone.label}</Text>
                </LinearGradient>

                <View style={s.heroActions}>
                  <TouchableOpacity style={s.heroEditBtn} onPress={() => setEditing(true)} activeOpacity={0.88}>
                    <Feather name="edit-2" size={14} color="#7548D8" />
                    <Text style={s.heroEditTxt}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.heroPhotoBtn} onPress={handlePickPhoto} activeOpacity={0.88}>
                    <Feather name="camera" size={14} color="#4C9ED9" />
                    <Text style={s.heroPhotoTxt}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {!hasProfile && (
              <TouchableOpacity style={s.nudgeCard} onPress={() => setEditing(true)} activeOpacity={0.88}>
                <View style={s.nudgeIcon}>
                  <Ionicons name="person-add-outline" size={20} color="#7548D8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.nudgeTitle}>Your profile is empty</Text>
                  <Text style={s.nudgeSub}>Add your name and preferences so Hugi can support you personally.</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#7548D8" />
              </TouchableOpacity>
            )}

            {hasProfile && (
              <>
                <View style={s.viewCard}>
                  <View style={s.viewCardHdr}>
                    <View style={[s.viewCardIcon, { backgroundColor: "#F0E2FF" }]}>
                      <Feather name="user" size={15} color="#7548D8" />
                    </View>
                    <Text style={s.viewCardTitle}>Caregiver Details</Text>
                  </View>
                  <InfoRow label="Name" value={profile.name} />
                  <InfoRow label="Relationship" value={profile.relationship} />
                  <InfoRow label="Preferred greeting" value={profile.preferredGreeting} last />
                </View>

                {(profile.stressSupport || profile.wordsThatHelp || profile.wordsThatDontHelp || profile.calmingStrategies) ? (
                  <View style={s.viewCard}>
                    <View style={s.viewCardHdr}>
                      <View style={[s.viewCardIcon, { backgroundColor: "#FFE3DA" }]}>
                        <Feather name="heart" size={15} color="#EF8F7D" />
                      </View>
                      <Text style={s.viewCardTitle}>Support Preferences</Text>
                    </View>
                    <InfoRow label="When overwhelmed" value={profile.stressSupport} />
                    <InfoRow label="Words that help" value={profile.wordsThatHelp} />
                    <InfoRow label="Words that don't help" value={profile.wordsThatDontHelp} />
                    <InfoRow label="Calming strategies" value={profile.calmingStrategies} last />
                  </View>
                ) : null}
              </>
            )}
          </>
        )}

        {/* ── EDIT MODE ──────────────────────────────────────────────── */}
        {editing && (
          <>
            {/* Photo Picker */}
            <View style={s.editPhotoCard}>
              <TouchableOpacity style={s.editAvatarWrap} onPress={handlePickPhoto} activeOpacity={0.85}>
                {draft.photoUri ? (
                  <Image source={{ uri: draft.photoUri }} style={s.editAvatar} />
                ) : (
                  <View style={s.editAvatar}>
                    <Ionicons name="person" size={36} color="#7548D8" />
                  </View>
                )}
                <View style={s.editAvatarOverlay}>
                  <Feather name="camera" size={16} color="#FFFFFF" />
                  <Text style={s.editAvatarOverlayTxt}>Tap to change</Text>
                </View>
              </TouchableOpacity>
              <Text style={s.editPhotoHint}>Update your profile photo from your library</Text>
            </View>

            {/* Caregiver Details */}
            <SectionCard iconName="user" iconBg="#EDE0FF" iconColor="#7548D8" title="Caregiver Details" gradColors={["#F0E4FF", "#FAF6FF"]}>
              <View>
                <FL label="Your Name" />
                <FI value={draft.name} onChangeText={v => set("name", v)} placeholder="e.g. Mandy" />
              </View>
              <View>
                <FL label="Relationship to Child" />
                <FI value={draft.relationship} onChangeText={v => set("relationship", v)} placeholder="e.g. Mom, Dad, Guardian" />
              </View>
              <View>
                <FL label="Preferred Greeting Name" />
                <FI value={draft.preferredGreeting} onChangeText={v => set("preferredGreeting", v)} placeholder="e.g. Mandy" />
              </View>
            </SectionCard>

            {/* Hugi Tone */}
            <SectionCard iconName="message-circle" iconBg="#DCF0FF" iconColor="#4C9ED9" title="How should Hugi support you?" gradColors={["#E8F3FF", "#F5FAFF"]}>
              <Helper text="Choose the tone that feels best when you're overwhelmed." />
              <View style={s.toneGrid}>
                {TONE_OPTIONS.map(tone => {
                  const sel = draft.hugiTone === tone.value;
                  return (
                    <TouchableOpacity
                      key={tone.value}
                      style={[s.toneCard, sel && s.toneCardSel]}
                      onPress={() => set("hugiTone", tone.value)}
                      activeOpacity={0.85}
                    >
                      {sel ? (
                        <LinearGradient colors={tone.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                      ) : null}
                      <Feather name={tone.icon} size={17} color={sel ? tone.color : "#9B8BAB"} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.toneTxt, sel && { color: tone.color }]}>{tone.label}</Text>
                        <Text style={s.toneDesc}>{tone.desc}</Text>
                      </View>
                      {sel && (
                        <View style={[s.toneCheck, { backgroundColor: tone.color }]}>
                          <Feather name="check" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </SectionCard>

            {/* Support Sections */}
            {SUPPORT_SECTIONS.map(sec => (
              <SectionCard key={sec.key} iconName={sec.icon} iconBg={sec.iconBg} iconColor={sec.iconColor} title={sec.title} gradColors={sec.gradColors}>
                <Helper text={sec.helper} />
                <TA value={draft[sec.key]} onChangeText={v => set(sec.key, v)} placeholder={sec.placeholder} rows={3} />
              </SectionCard>
            ))}

            {/* Save */}
            <TouchableOpacity style={[s.saveBtn, isSaving && { opacity: 0.7 }]} onPress={handleSave} disabled={isSaving} activeOpacity={0.88}>
              <LinearGradient colors={["#9B6DE8", "#7548D8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtnGrad}>
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={s.saveBtnTxt}>Save Profile</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.clearBtn} onPress={handleClear} activeOpacity={0.85}>
              <Feather name="trash-2" size={15} color="#D86A5B" />
              <Text style={s.clearTxt}>Clear Profile</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={s.footer}>
          {editing ? "Hugi uses this to support you in a way that feels personal. 💜" : "Tap Edit Profile to update your details anytime."}
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FBF7FF" },
  content: { paddingBottom: 100 },

  heroGrad: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 8 : 16, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.8)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(117,72,216,0.15)" },
  screenTitle: { color: "#2B1D5E", fontSize: 22, fontWeight: "900", letterSpacing: -0.4 },
  screenSub: { color: "#8B7BAA", fontSize: 12, fontWeight: "600", marginTop: 2 },

  statusBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EAF7EE", borderRadius: 14, padding: 12, marginHorizontal: 16, marginBottom: 12, borderWidth: 1.5, borderColor: "#B8E8C8" },
  statusTxt: { color: "#3A8A52", fontSize: 13, fontWeight: "800" },
  editBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#F0E8FF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#D8C3F7" },
  editBannerTxt: { color: "#7548D8", fontSize: 12, fontWeight: "800" },

  // Hero card
  heroCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 24, overflow: "hidden", borderWidth: 1.5, borderColor: "#EDE4F5", shadowColor: "#7548D8", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 4 },
  heroCardGrad: { padding: 24, alignItems: "center" },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#EDE0FF", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF", overflow: "hidden", shadowColor: "#7548D8", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  avatarCamBadge: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: "#7548D8", alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: "#FFFFFF" },
  heroName: { color: "#2B1D5E", fontSize: 24, fontWeight: "900", letterSpacing: -0.4, marginBottom: 4 },
  heroRole: { color: "#8B7BAA", fontSize: 13, fontWeight: "600", marginBottom: 14 },
  toneBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)" },
  toneBadgeTxt: { fontSize: 12, fontWeight: "800" },
  heroActions: { flexDirection: "row", gap: 10 },
  heroEditBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#DEC9F7" },
  heroEditTxt: { color: "#7548D8", fontSize: 13, fontWeight: "800" },
  heroPhotoBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#BCD9F5" },
  heroPhotoTxt: { color: "#4C9ED9", fontSize: 13, fontWeight: "800" },

  nudgeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F6ECFF", borderRadius: 18, borderWidth: 1.5, borderColor: "#DEC9F7", padding: 14, marginHorizontal: 16, marginBottom: 12 },
  nudgeIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center" },
  nudgeTitle: { color: "#2B1D5E", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  nudgeSub: { color: "#8B7BAA", fontSize: 11, fontWeight: "600", lineHeight: 16 },

  viewCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1.5, borderColor: "#EDE4F5", paddingHorizontal: 14, paddingTop: 14, paddingBottom: 2, marginHorizontal: 16, marginBottom: 10, shadowColor: "#7548D8", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  viewCardHdr: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  viewCardIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  viewCardTitle: { color: "#2B1D5E", fontSize: 13, fontWeight: "900" },

  // Edit photo
  editPhotoCard: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.5, borderColor: "#EDE4F5", padding: 20, marginHorizontal: 16, marginBottom: 12, alignItems: "center", shadowColor: "#7548D8", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 2 },
  editAvatarWrap: { position: "relative", marginBottom: 10 },
  editAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#EDE0FF", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#E3D2F8", overflow: "hidden" },
  editAvatarOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 34, backgroundColor: "rgba(30,20,60,0.5)", borderBottomLeftRadius: 48, borderBottomRightRadius: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  editAvatarOverlayTxt: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  editPhotoHint: { color: "#8B7BAA", fontSize: 11, fontWeight: "600", textAlign: "center" },

  // Tone grid
  toneGrid: { gap: 8 },
  toneCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1.5, borderColor: "#EDE4F5", padding: 14, backgroundColor: "#FDFAFF", overflow: "hidden", position: "relative" },
  toneCardSel: { borderColor: "transparent", borderWidth: 0 },
  toneTxt: { color: "#4A3B6B", fontSize: 13, fontWeight: "800" },
  toneDesc: { color: "#9B8BAB", fontSize: 11, fontWeight: "600", marginTop: 1 },
  toneCheck: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  // Save / Cancel / Clear
  saveBtn: { marginHorizontal: 16, marginTop: 4, marginBottom: 10, borderRadius: 18, overflow: "hidden", shadowColor: "#7548D8", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 7 },
  saveBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  saveBtnTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  cancelBtn: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#EDE4F5", alignItems: "center", justifyContent: "center", marginHorizontal: 16, marginBottom: 10 },
  cancelTxt: { color: "#7548D8", fontSize: 14, fontWeight: "800" },
  clearBtn: { height: 46, borderRadius: 16, backgroundColor: "#FFF1EC", borderWidth: 1, borderColor: "#FFD0C0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginBottom: 16 },
  clearTxt: { color: "#D86A5B", fontSize: 13, fontWeight: "800" },

  footer: { color: "#B0A4C8", fontSize: 11, textAlign: "center", lineHeight: 17, paddingHorizontal: 24, marginBottom: 8 },
});