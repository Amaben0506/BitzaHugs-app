import React, { useCallback, useMemo, useState } from "react";
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

const STORAGE_KEY = "bitzaChildProfile";

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

const communicationOptions = [
  "Verbal", "Mostly verbal", "Uses short phrases", "Minimally speaking",
  "Nonverbal", "Uses gestures", "Uses pointing", "Uses PECS / picture cards",
  "Uses AAC device", "Uses sign language", "Uses sounds / vocalizations",
  "Uses behavior to communicate needs", "Mixed communication style", "Not added yet",
];

const supportNeeds = [
  "Transitions", "Meltdowns", "Sensory overload", "Routine changes",
  "Communication support", "Sleep", "School support", "Appointments",
];

const BLANK = {
  childName: "", age: "", dob: "",
  communicationStyle: "Not added yet",
  avatar: "01", supportNeeds: [], notes: "",
};

function SectionTitle({ title, caption }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
    </View>
  );
}

function InfoRow({ label, value, last }) {
  if (!value?.trim() || value === "Not added yet") return null;
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ChildProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(BLANK);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [savedMessage, setSavedMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved) {
            const p = JSON.parse(saved);
            const loaded = {
              childName: p.childName || p.name || "",
              age: p.age === "Not added yet" ? "" : p.age || "",
              dob: p.dob === "Not added yet" ? "" : p.dob || "",
              communicationStyle: p.communicationStyle || "Not added yet",
              avatar: p.avatar || "01",
              supportNeeds: p.supportNeeds || [],
              notes: p.notes || "",
            };
            setProfile(loaded);
            setDraft(loaded);
          }
        } catch (e) {
          console.log("Error loading child profile:", e);
        }
      };
      load();
    }, [])
  );

  const avatarSource = editing ? draft.avatar : profile.avatar;
  const showStatus = (msg) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 2200);
  };

  const handleSave = async () => {
    const updated = {
      ...draft,
      childName: draft.childName.trim() || "Child 1",
      name: draft.childName.trim() || "Child 1",
      age: draft.age.trim() || "Not added yet",
      dob: draft.dob.trim() || "Not added yet",
      updatedAt: new Date().toISOString(),
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProfile(updated);
      setEditing(false);
      showStatus("Child profile saved 💜");
    } catch (e) {
      Alert.alert("Oops", "Something went wrong saving the child profile.");
    }
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  const handleClear = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setProfile(BLANK);
      setDraft(BLANK);
      setEditing(false);
      showStatus("Child profile cleared");
    } catch (e) {
      console.log("Error clearing:", e);
    }
  };

  const set = (key, val) => setDraft((prev) => ({ ...prev, [key]: val }));

  const toggleNeed = (need) => {
    setDraft((prev) => ({
      ...prev,
      supportNeeds: prev.supportNeeds.includes(need)
        ? prev.supportNeeds.filter((n) => n !== need)
        : [...prev.supportNeeds, need],
    }));
  };

  const displayName = profile.childName?.trim() || "Your child";
  const hasProfile = profile.childName?.trim();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={24} color="#2B2463" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.screenTitle}>Child Profile</Text>
            <Text style={styles.screenSubtitle}>Keep important support details in one calm place.</Text>
          </View>
          {editing ? (
            <TouchableOpacity style={styles.circleButton} onPress={handleSave} activeOpacity={0.85}>
              <Feather name="save" size={19} color="#6F42D8" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.circleButton} onPress={() => setEditing(true)} activeOpacity={0.85}>
              <Feather name="edit-2" size={18} color="#6F42D8" />
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
            {/* Profile Hero */}
            <View style={styles.heroCard}>
              <View style={styles.avatarLargeWrap}>
                <Image source={avatarSource} style={styles.avatarLarge} resizeMode="contain" />
                <TouchableOpacity style={styles.avatarEditBtn} onPress={() => setEditing(true)} activeOpacity={0.85}>
                  <Feather name="edit-2" size={11} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>{displayName}</Text>
                <Text style={styles.heroSubtitle}>
                  {profile.age?.trim() && profile.age !== "Not added yet" ? `${profile.age} years old` : "Age not added yet"}
                </Text>
                <Text style={styles.heroText}>You can update this anytime as your family's needs change.</Text>
              </View>
            </View>

            {/* No profile nudge */}
            {!hasProfile && (
              <TouchableOpacity style={styles.nudgeCard} onPress={() => setEditing(true)} activeOpacity={0.88}>
                <Ionicons name="person-add-outline" size={20} color="#6F42D8" />
                <View style={styles.nudgeTextWrap}>
                  <Text style={styles.nudgeTitle}>No child profile set up yet</Text>
                  <Text style={styles.nudgeText}>Add your child's details so BitzaHugs can personalize support for your family.</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6F42D8" />
              </TouchableOpacity>
            )}

            {/* Saved Info */}
            {hasProfile && (
              <>
                <View style={styles.card}>
                  <InfoRow label="Name" value={profile.childName} />
                  <InfoRow label="Age" value={profile.age !== "Not added yet" ? `${profile.age} years old` : ""} />
                  <InfoRow label="Date of Birth" value={profile.dob} last />
                </View>

                {profile.communicationStyle && profile.communicationStyle !== "Not added yet" && (
                  <View style={styles.card}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Communication Style</Text>
                      <View style={styles.chipBadge}>
                        <Text style={styles.chipBadgeText}>{profile.communicationStyle}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {profile.supportNeeds?.length > 0 && (
                  <View style={[styles.card, { paddingVertical: 12 }]}>
                    <Text style={styles.infoLabel}>Support Needs</Text>
                    <View style={styles.needsGrid}>
                      {profile.supportNeeds.map((need) => (
                        <View key={need} style={styles.needChipActive}>
                          <Text style={styles.needChipTextActive}>{need}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {profile.notes?.trim() ? (
                  <View style={[styles.card, { paddingVertical: 12 }]}>
                    <Text style={styles.infoLabel}>Notes</Text>
                    <Text style={styles.notesText}>{profile.notes}</Text>
                  </View>
                ) : null}
              </>
            )}

            {/* Edit Button */}
            <TouchableOpacity style={styles.editFullBtn} onPress={() => setEditing(true)} activeOpacity={0.88}>
              <Feather name="edit-2" size={16} color="#6F42D8" />
              <Text style={styles.editFullBtnText}>Edit Child Profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── EDIT MODE ── */
          <>
            {/* Edit Banner */}
            <View style={styles.editBanner}>
              <Feather name="edit-2" size={14} color="#6F42D8" />
              <Text style={styles.editBannerText}>Editing child profile</Text>
            </View>

            {/* Basic Info */}
            <SectionTitle title="Basic Info" caption="Small details that help personalize support." />
            <View style={styles.card}>
              <ProfileInput label="Child's Name" placeholder="Enter name" value={draft.childName} onChangeText={(v) => set("childName", v)} icon="user" />
              <ProfileInput label="Age" placeholder="Example: 7" value={draft.age} onChangeText={(v) => set("age", v)} icon="calendar" keyboardType="number-pad" />
              <ProfileInput label="Date of Birth" placeholder="Example: May 28, 2018" value={draft.dob} onChangeText={(v) => set("dob", v)} icon="gift" last />
            </View>

            {/* Avatar */}
            <SectionTitle title="Avatar" caption="Choose a soft profile image for your child." />
            <View style={styles.avatarCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
                {AVATARS.map((avatar) => (
                  <TouchableOpacity
                    key={avatar.id}
                    style={[styles.avatarOption, draft.avatar === avatar.id && styles.avatarOptionActive]}
                    onPress={() => set("avatar", avatar.id)}
                    activeOpacity={0.85}
                  >
                    <Image source={avatar.source} style={styles.avatarImage} resizeMode="contain" />
                    {draft.avatar === avatar.id && (
                      <View style={styles.avatarCheck}>
                        <Feather name="check" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Communication Style */}
            <SectionTitle title="Communication Style" caption="Choose what fits best right now." />
            <View style={styles.optionCard}>
              {communicationOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.choiceChip, draft.communicationStyle === option && styles.choiceChipActive]}
                  onPress={() => set("communicationStyle", option)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.choiceChipText, draft.communicationStyle === option && styles.choiceChipTextActive]}>
                    {option}
                  </Text>
                  {draft.communicationStyle === option && <Feather name="check" size={14} color="#6F42D8" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Support Needs */}
            <SectionTitle title="Support Needs" caption="Tap any areas where extra support may help." />
            <View style={styles.needsGrid}>
              {supportNeeds.map((need) => {
                const active = draft.supportNeeds.includes(need);
                return (
                  <TouchableOpacity
                    key={need}
                    style={[styles.needChip, active && styles.needChipActive]}
                    onPress={() => toggleNeed(need)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.needChipText, active && styles.needChipTextActive]}>{need}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notes */}
            <SectionTitle title="Notes" caption="Anything helpful for routines, comfort, or support." />
            <View style={styles.notesCard}>
              <TextInput
                value={draft.notes}
                onChangeText={(v) => set("notes", v)}
                placeholder="Example: Loves deep pressure, needs warnings before transitions..."
                placeholderTextColor="#A8A0B8"
                style={styles.notesInput}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Buttons */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.88}>
              <Text style={styles.saveButtonText}>Save Child Profile</Text>
              <Feather name="check" size={19} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.86}>
              <Feather name="trash-2" size={16} color="#D86A5B" />
              <Text style={styles.clearButtonText}>Clear Child Profile</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footerText}>
          {editing ? "This information is saved locally during prototype testing." : "Tap Edit Child Profile to update details anytime."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileInput({ label, placeholder, value, onChangeText, icon, keyboardType = "default", last }) {
  return (
    <View style={[styles.inputRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.inputIconBox}>
        <Feather name={icon} size={17} color="#6F42D8" />
      </View>
      <View style={styles.inputTextWrap}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A8A0B8"
          style={styles.input}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 8 : 14, paddingBottom: 110 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  circleButton: { width: 42, height: 42, borderRadius: 16, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1, marginHorizontal: 12 },
  screenTitle: { color: "#2B2463", fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  screenSubtitle: { color: "#837E96", fontSize: 12, fontWeight: "700", marginTop: 2, lineHeight: 16 },

  statusBanner: { minHeight: 40, borderRadius: 14, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, marginBottom: 12 },
  statusText: { color: "#6F42D8", fontSize: 13, fontWeight: "900" },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 1, borderColor: "#EFE4DC", padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 12, shadowColor: "#BFA99D", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 9, elevation: 2 },
  avatarLargeWrap: { width: 88, height: 88, borderRadius: 28, backgroundColor: "#F4EAFE", alignItems: "center", justifyContent: "center", marginRight: 14, position: "relative" },
  avatarLarge: { width: 78, height: 78 },
  avatarEditBtn: { position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: "#6F42D8", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 20, fontWeight: "900", marginBottom: 3 },
  heroSubtitle: { color: "#6F42D8", fontSize: 13, fontWeight: "800", marginBottom: 6 },
  heroText: { color: "#5B5672", fontSize: 12, lineHeight: 17, fontWeight: "600" },

  nudgeCard: { backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  nudgeTextWrap: { flex: 1 },
  nudgeTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  nudgeText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 5, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },

  infoRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0E8E2" },
  infoLabel: { color: "#837E96", fontSize: 10, fontWeight: "700", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { color: "#2B2463", fontSize: 14, fontWeight: "700" },

  chipBadge: { backgroundColor: "#F0E2FF", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start", marginTop: 4 },
  chipBadgeText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },
  notesText: { color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "600", marginTop: 4 },

  editFullBtn: { height: 50, borderRadius: 16, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  editFullBtnText: { color: "#6F42D8", fontSize: 14, fontWeight: "800" },

  editBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#F0E2FF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: "#E3D2F8" },
  editBannerText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },

  sectionHeader: { marginTop: 8, marginBottom: 8 },
  sectionTitle: { color: "#2B2463", fontSize: 16, fontWeight: "900" },
  sectionCaption: { color: "#837E96", fontSize: 12, fontWeight: "700", marginTop: 2 },

  inputRow: { minHeight: 68, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F0E8E2", paddingVertical: 8 },
  inputIconBox: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginRight: 12 },
  inputTextWrap: { flex: 1 },
  inputLabel: { color: "#2B2463", fontSize: 13, fontWeight: "900", marginBottom: 4 },
  input: { height: 38, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, color: "#2B2463", fontSize: 14, fontWeight: "700" },

  avatarCard: { backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1, borderColor: "#EFE4DC", paddingVertical: 14, marginBottom: 10 },
  avatarRow: { paddingHorizontal: 12, gap: 10 },
  avatarOption: { width: 72, height: 72, borderRadius: 23, backgroundColor: "#F8F1FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8", position: "relative" },
  avatarOptionActive: { borderWidth: 2, borderColor: "#8B5BE8", backgroundColor: "#F0E2FF" },
  avatarImage: { width: 62, height: 62 },
  avatarCheck: { position: "absolute", right: -3, top: -3, width: 22, height: 22, borderRadius: 11, backgroundColor: "#8B5BE8", alignItems: "center", justifyContent: "center" },

  optionCard: { backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1, borderColor: "#EFE4DC", padding: 12, marginBottom: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choiceChip: { borderRadius: 14, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 6 },
  choiceChipActive: { backgroundColor: "#F0E2FF", borderColor: "#8B5BE8" },
  choiceChipText: { color: "#5B5672", fontSize: 12, fontWeight: "800" },
  choiceChipTextActive: { color: "#2B2463", fontWeight: "900" },

  needsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  needChip: { backgroundColor: "#FFFFFF", borderRadius: 15, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 10 },
  needChipActive: { backgroundColor: "#F0E2FF", borderColor: "#8B5BE8", borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10 },
  needChipText: { color: "#5B5672", fontSize: 12, fontWeight: "800" },
  needChipTextActive: { color: "#2B2463", fontWeight: "900", fontSize: 12 },

  notesCard: { backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1, borderColor: "#EFE4DC", padding: 13, marginBottom: 14 },
  notesInput: { minHeight: 110, color: "#2B2463", fontSize: 14, lineHeight: 20, fontWeight: "600" },

  saveButton: { height: 54, borderRadius: 18, backgroundColor: "#8B5BE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#6F42D8", shadowOpacity: 0.22, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 4, marginBottom: 10 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  cancelButton: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  cancelButtonText: { color: "#6F42D8", fontSize: 14, fontWeight: "900" },
  clearButton: { height: 48, borderRadius: 16, backgroundColor: "#FFE7E1", borderWidth: 1, borderColor: "#FFD0C0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  clearButtonText: { color: "#D86A5B", fontSize: 14, fontWeight: "900" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, textAlign: "center", fontWeight: "700" },
});