import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const PARENT_PROFILE_KEY = "bitzaParentProfile";

const TONE_OPTIONS = [
  { label: "Gentle", value: "gentle", icon: "heart" },
  { label: "Practical", value: "practical", icon: "check-circle" },
  { label: "Direct", value: "direct", icon: "zap" },
  { label: "Encouraging", value: "encouraging", icon: "sun" },
];

const TONE_COLORS = {
  gentle: { bg: "#F0E2FF", color: "#6F42D8" },
  practical: { bg: "#EEF7E8", color: "#78A866" },
  direct: { bg: "#E7F4FF", color: "#4C9ED9" },
  encouraging: { bg: "#FFF0DF", color: "#D99A3D" },
};

const BLANK = {
  name: "", relationship: "", preferredGreeting: "",
  stressSupport: "", wordsThatHelp: "", wordsThatDontHelp: "",
  calmingStrategies: "", hugiTone: "gentle", photoUri: "",
};

function InfoRow({ label, value, last }) {
  if (!value?.trim()) return null;
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ParentProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(BLANK);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [savedMessage, setSavedMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const saved = await AsyncStorage.getItem(PARENT_PROFILE_KEY);
          if (saved) {
            const p = JSON.parse(saved);
            setProfile({ ...BLANK, ...p });
            setDraft({ ...BLANK, ...p });
          }
        } catch (e) {
          console.log("Error loading parent profile:", e);
        }
      };
      load();
    }, [])
  );

  const showStatus = (msg) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 2200);
  };

  const handleSave = async () => {
    try {
      const updated = { ...draft, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(PARENT_PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated);
      setEditing(false);
      showStatus("Profile saved 💜");
    } catch (e) {
      console.log("Error saving:", e);
    }
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  const handleClear = async () => {
    Alert.alert(
      "Clear Profile",
      "Are you sure you want to clear your profile? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PARENT_PROFILE_KEY);
              setProfile(BLANK);
              setDraft(BLANK);
              setEditing(false);
              showStatus("Profile cleared");
            } catch (e) {
              console.log("Error clearing:", e);
            }
          },
        },
      ]
    );
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "Please allow access to your photos to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const updated = { ...profile, photoUri: uri };
      await AsyncStorage.setItem(PARENT_PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated);
      setDraft((prev) => ({ ...prev, photoUri: uri }));
      showStatus("Photo updated 💜");
    }
  };

  const set = (key, val) => setDraft((prev) => ({ ...prev, [key]: val }));

  const displayName = profile.preferredGreeting?.trim() || profile.name?.trim() || "Caregiver";
  const toneColor = TONE_COLORS[profile.hugiTone] || TONE_COLORS.gentle;
  const toneLabel = TONE_OPTIONS.find((t) => t.value === profile.hugiTone)?.label || "Gentle";
  const toneIcon = TONE_OPTIONS.find((t) => t.value === profile.hugiTone)?.icon || "heart";
  const hasProfile = profile.name?.trim() || profile.relationship?.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Parent Profile</Text>
          {editing ? (
            <TouchableOpacity style={styles.circleButton} onPress={handleSave} activeOpacity={0.85}>
              <Feather name="save" size={18} color="#2B2463" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.circleButton} onPress={() => setEditing(true)} activeOpacity={0.85}>
              <Feather name="edit-2" size={18} color="#2B2463" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Banner */}
        {savedMessage ? (
          <View style={styles.statusBanner}>
            <Feather name="check-circle" size={16} color="#6F42D8" />
            <Text style={styles.statusText}>{savedMessage}</Text>
          </View>
        ) : null}

        {/* ── VIEW MODE ── */}
        {!editing ? (
          <>
            {/* Profile Hero Card */}
            <View style={styles.profileHeroCard}>
              <View style={styles.avatarWrap}>
                <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.85}>
                  {profile.photoUri ? (
                    <Image source={{ uri: profile.photoUri }} style={styles.avatarCircle} />
                  ) : (
                    <View style={styles.avatarCircle}>
                      <Ionicons name="person" size={36} color="#6F42D8" />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.avatarEditBtn} onPress={handlePickPhoto} activeOpacity={0.85}>
                  <Feather name="camera" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.profileDisplayName}>{displayName}</Text>
              {profile.relationship?.trim() ? (
                <Text style={styles.profileRelationship}>{profile.relationship}</Text>
              ) : null}

              <View style={[styles.toneBadge, { backgroundColor: toneColor.bg }]}>
                <Feather name={toneIcon} size={13} color={toneColor.color} />
                <Text style={[styles.toneBadgeText, { color: toneColor.color }]}>
                  Hugi tone: {toneLabel}
                </Text>
              </View>

              <View style={styles.heroButtonRow}>
                <TouchableOpacity style={styles.editProfileBtn} onPress={() => setEditing(true)} activeOpacity={0.88}>
                  <Feather name="edit-2" size={15} color="#6F42D8" />
                  <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto} activeOpacity={0.88}>
                  <Feather name="camera" size={15} color="#4C9ED9" />
                  <Text style={styles.photoBtnText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* No profile nudge */}
            {!hasProfile && (
              <View style={styles.nudgeCard}>
                <Ionicons name="person-add-outline" size={20} color="#6F42D8" />
                <View style={styles.nudgeTextWrap}>
                  <Text style={styles.nudgeTitle}>Your profile is empty</Text>
                  <Text style={styles.nudgeText}>
                    Add your name and preferences so Hugi can support you in a way that feels personal.
                  </Text>
                </View>
              </View>
            )}

            {/* Saved Details */}
            {hasProfile && (
              <>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBubble, { backgroundColor: "#F0E2FF" }]}>
                      <Feather name="user" size={16} color="#6F42D8" />
                    </View>
                    <Text style={styles.cardTitle}>Caregiver Details</Text>
                  </View>
                  <InfoRow label="Name" value={profile.name} />
                  <InfoRow label="Relationship" value={profile.relationship} />
                  <InfoRow label="Preferred greeting" value={profile.preferredGreeting} last />
                </View>

                {(profile.stressSupport?.trim() || profile.wordsThatHelp?.trim() ||
                  profile.wordsThatDontHelp?.trim() || profile.calmingStrategies?.trim()) && (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconBubble, { backgroundColor: "#FFE3DA" }]}>
                        <Feather name="heart" size={16} color="#EF8F7D" />
                      </View>
                      <Text style={styles.cardTitle}>Support Preferences</Text>
                    </View>
                    <InfoRow label="When overwhelmed" value={profile.stressSupport} />
                    <InfoRow label="Words that help" value={profile.wordsThatHelp} />
                    <InfoRow label="Words that don't help" value={profile.wordsThatDontHelp} />
                    <InfoRow label="Calming strategies" value={profile.calmingStrategies} last />
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          /* ── EDIT MODE ── */
          <>
            <View style={styles.editModeBanner}>
              <Feather name="edit-2" size={14} color="#6F42D8" />
              <Text style={styles.editModeBannerText}>Editing your profile</Text>
            </View>

            {/* Photo picker in edit mode */}
            <View style={styles.editPhotoCard}>
              <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.85} style={styles.editAvatarWrap}>
                {draft.photoUri ? (
                  <Image source={{ uri: draft.photoUri }} style={styles.editAvatarCircle} />
                ) : (
                  <View style={styles.editAvatarCircle}>
                    <Ionicons name="person" size={32} color="#6F42D8" />
                  </View>
                )}
                <View style={styles.editAvatarOverlay}>
                  <Feather name="camera" size={18} color="#FFFFFF" />
                  <Text style={styles.editAvatarOverlayText}>Tap to change</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.editPhotoHint}>Tap your photo to update it from your library</Text>
            </View>

            {/* Basic Info */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBubble, { backgroundColor: "#F0E2FF" }]}>
                  <Feather name="user" size={16} color="#6F42D8" />
                </View>
                <Text style={styles.cardTitle}>Caregiver Details</Text>
              </View>
              <Text style={styles.inputLabel}>Your name</Text>
              <TextInput style={styles.input} value={draft.name} onChangeText={(v) => set("name", v)} placeholder="Example: Mandy" placeholderTextColor="#A8A0A5" />
              <Text style={styles.inputLabel}>Relationship to child</Text>
              <TextInput style={styles.input} value={draft.relationship} onChangeText={(v) => set("relationship", v)} placeholder="Example: mom, dad, guardian" placeholderTextColor="#A8A0A5" />
              <Text style={styles.inputLabel}>Preferred greeting name</Text>
              <TextInput style={[styles.input, { marginBottom: 0 }]} value={draft.preferredGreeting} onChangeText={(v) => set("preferredGreeting", v)} placeholder="Example: Mandy" placeholderTextColor="#A8A0A5" />
            </View>

            {/* Hugi Tone */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBubble, { backgroundColor: "#E7F4FF" }]}>
                  <Feather name="message-circle" size={16} color="#4C9ED9" />
                </View>
                <Text style={styles.cardTitle}>How should Hugi support you?</Text>
              </View>
              <Text style={styles.helperText}>Choose the tone that feels best when you're overwhelmed.</Text>
              <View style={styles.toneGrid}>
                {TONE_OPTIONS.map((tone) => {
                  const isSelected = draft.hugiTone === tone.value;
                  return (
                    <TouchableOpacity
                      key={tone.value}
                      style={[styles.toneCard, isSelected && styles.toneCardSelected]}
                      onPress={() => set("hugiTone", tone.value)}
                      activeOpacity={0.85}
                    >
                      <Feather name={tone.icon} size={16} color={isSelected ? "#6F42D8" : "#837E96"} />
                      <Text style={[styles.toneText, isSelected && styles.toneTextSelected]}>{tone.label}</Text>
                      {isSelected && (
                        <View style={styles.toneCheck}>
                          <Feather name="check" size={9} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Support Sections */}
            {[
              { title: "When I'm Overwhelmed", icon: "heart", bg: "#FFE3DA", accent: "#EF8F7D", key: "stressSupport", helper: "What do you want BitzaHugs to remind you of during hard moments?", placeholder: "Example: remind me to breathe first, lower my voice..." },
              { title: "Words That Help", icon: "sun", bg: "#EEF7E8", accent: "#78A866", key: "wordsThatHelp", helper: "Save phrases that feel comforting or grounding.", placeholder: "Example: You are not failing. One small step..." },
              { title: "Words That Don't Help", icon: "x-circle", bg: "#FFE7E1", accent: "#D86A5B", key: "wordsThatDontHelp", helper: "Phrases that feel too harsh, dismissive, or stressful.", placeholder: "Example: calm down, just relax..." },
              { title: "My Calming Strategies", icon: "wind", bg: "#F0E2FF", accent: "#6F42D8", key: "calmingStrategies", helper: "What helps you personally reset, even a little?", placeholder: "Example: stepping outside, music, journaling..." },
            ].map((section) => (
              <View key={section.title} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBubble, { backgroundColor: section.bg }]}>
                    <Feather name={section.icon} size={16} color={section.accent} />
                  </View>
                  <Text style={styles.cardTitle}>{section.title}</Text>
                </View>
                <Text style={styles.helperText}>{section.helper}</Text>
                <TextInput
                  style={styles.textArea}
                  value={draft[section.key]}
                  onChangeText={(v) => set(section.key, v)}
                  placeholder={section.placeholder}
                  placeholderTextColor="#A8A0A5"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ))}

            {/* Save / Cancel */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
              <Feather name="check" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.85}>
              <Feather name="trash-2" size={15} color="#D86A5B" />
              <Text style={styles.clearButtonText}>Clear Profile</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footerText}>
          {editing
            ? "Later, Hugi can use this to support you in a way that feels more personal."
            : "Tap Edit Profile to update your details anytime."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  topBar: { height: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  topTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  statusBanner: { height: 40, borderRadius: 13, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, marginBottom: 10 },
  statusText: { color: "#6F42D8", fontSize: 13, fontWeight: "800" },

  profileHeroCard: {
    backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 1, borderColor: "#EFE4DC",
    paddingVertical: 24, paddingHorizontal: 16, alignItems: "center", marginBottom: 12,
    shadowColor: "#BFA99D", shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 2,
  },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: "#F0E2FF",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#E3D2F8",
    overflow: "hidden",
  },
  avatarEditBtn: {
    position: "absolute", bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13, backgroundColor: "#6F42D8",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF",
  },
  profileDisplayName: { color: "#2B2463", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  profileRelationship: { color: "#837E96", fontSize: 13, fontWeight: "600", marginBottom: 12 },
  toneBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16 },
  toneBadgeText: { fontSize: 12, fontWeight: "800" },
  heroButtonRow: { flexDirection: "row", gap: 10 },
  editProfileBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "#F0E2FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "#E3D2F8",
  },
  editProfileBtnText: { color: "#6F42D8", fontSize: 13, fontWeight: "800" },
  photoBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "#E7F4FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "#C5DFF5",
  },
  photoBtnText: { color: "#4C9ED9", fontSize: 13, fontWeight: "800" },

  nudgeCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 10,
  },
  nudgeTextWrap: { flex: 1 },
  nudgeTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  nudgeText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  infoRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0E8E2" },
  infoRowLast: { paddingVertical: 10, borderBottomWidth: 0 },
  infoLabel: { color: "#837E96", fontSize: 10, fontWeight: "700", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { color: "#2B2463", fontSize: 13, fontWeight: "700", lineHeight: 18 },

  editModeBanner: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "#F0E2FF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 10, borderWidth: 1, borderColor: "#E3D2F8",
  },
  editModeBannerText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },

  editPhotoCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    padding: 16, marginBottom: 10, alignItems: "center",
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  editAvatarWrap: { position: "relative", marginBottom: 8 },
  editAvatarCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: "#F0E2FF",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#E3D2F8",
    overflow: "hidden",
  },
  editAvatarOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 32,
    backgroundColor: "rgba(0,0,0,0.45)", borderBottomLeftRadius: 45, borderBottomRightRadius: 45,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 4,
  },
  editAvatarOverlayText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  editPhotoHint: { color: "#837E96", fontSize: 11, fontWeight: "600", textAlign: "center" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingTop: 13, paddingBottom: 13, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardTitle: { flex: 1, color: "#2B2463", fontSize: 14, fontWeight: "800" },

  inputLabel: { color: "#2B2463", fontSize: 12, fontWeight: "800", marginBottom: 6, marginTop: 2 },
  input: { height: 42, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, color: "#2B2463", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  helperText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", marginBottom: 8 },
  textArea: { minHeight: 80, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, paddingVertical: 10, color: "#2B2463", fontSize: 13, lineHeight: 18, fontWeight: "600" },

  toneGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  toneCard: { width: "48%", height: 48, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, position: "relative" },
  toneCardSelected: { backgroundColor: "#F0E2FF", borderColor: "#8B5BE8", borderWidth: 2 },
  toneText: { color: "#837E96", fontSize: 13, fontWeight: "700" },
  toneTextSelected: { color: "#6F42D8", fontWeight: "800" },
  toneCheck: { width: 15, height: 15, borderRadius: 8, backgroundColor: "#8B5BE8", alignItems: "center", justifyContent: "center", position: "absolute", top: 5, right: 5 },

  saveButton: { height: 50, borderRadius: 16, backgroundColor: "#8B5BE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  cancelButton: { height: 44, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  cancelButtonText: { color: "#6F42D8", fontSize: 14, fontWeight: "800" },
  clearButton: { height: 42, borderRadius: 13, backgroundColor: "#FFE7E1", borderWidth: 1, borderColor: "#FFD0C0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 12 },
  clearButtonText: { color: "#D86A5B", fontSize: 13, fontWeight: "800" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});