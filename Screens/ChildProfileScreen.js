import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Platform, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

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

const PRONOUNS = ["He / Him", "She / Her", "They / Them", "He / They", "She / They", "Prefer not to say"];
const COMM_OPTIONS = [
  "Verbal", "Verbal with support", "Mostly verbal", "Uses short phrases",
  "Minimally speaking", "Nonverbal", "Uses gestures", "Uses pointing",
  "Uses PECS / picture cards", "Uses AAC device", "Uses sign language",
  "Uses sounds / vocalizations", "Mixed communication style", "Not added yet",
];
const GRADE_OPTIONS = [
  "Not in school yet", "Early intervention", "Pre-K", "Kindergarten",
  "1st grade", "2nd grade", "3rd grade", "4th grade", "5th grade",
  "6th grade", "7th grade", "8th grade", "9th grade", "10th grade",
  "11th grade", "12th grade", "Homeschooled", "Post-secondary",
];

const BLANK = {
  avatar: "01", childName: "", nickname: "", age: "", dob: "", pronouns: "", grade: "",
  diagnosis: "", additionalSupport: "", supportSummary: "",
  communicationStyle: "Not added yet", commMethod: "",
  helpfulPhrases: [], whatNotToDo: [],
  sensoryNeeds: "", sensorySensitivities: "",
  comfortItems: [], favoriteReinforcers: [], whatHelpsRegulate: [],
  knownTriggers: [], earlyWarningSigns: [],
  whatMakesWorse: "", meltdownRecoveryNotes: "",
  whatHelps: "", calmCornerTools: "", transitionTips: "", meltdownRecoveryPlan: "",
  strengths: [], thingsTheyLove: [], encouragementNotes: [], caregiverNotes: "",
};

// ── Tag Input ─────────────────────────────────────────────────────────────────
function TagInput({ tags, onAdd, onRemove, placeholder, accentColor = "#7548D8", bgColor = "#F0E2FF" }) {
  const [val, setVal] = useState("");
  const submit = () => {
    const t = val.trim().replace(/,$/, "");
    if (!t || tags.includes(t)) { setVal(""); return; }
    onAdd(t); setVal("");
  };
  return (
    <View style={ts.wrap}>
      <View style={ts.row}>
        {tags.map(tag => (
          <View key={tag} style={[ts.tag, { backgroundColor: bgColor, borderColor: accentColor + "33" }]}>
            <Text style={[ts.tagTxt, { color: accentColor }]}>{tag}</Text>
            <TouchableOpacity onPress={() => onRemove(tag)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={14} color={accentColor + "99"} />
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={ts.input}
          value={val}
          onChangeText={v => { setVal(v); if (v.endsWith(",")) submit(); }}
          onSubmitEditing={submit}
          placeholder={placeholder}
          placeholderTextColor="#C0B8D0"
          returnKeyType="done"
          blurOnSubmit={false}
        />
      </View>
      <Text style={ts.hint}>Tap Enter or comma to add</Text>
    </View>
  );
}
const ts = StyleSheet.create({
  wrap: { gap: 5 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 7, alignItems: "center", minHeight: 42, backgroundColor: "#FDFAFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#EDE4F5", padding: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  tagTxt: { fontSize: 12, fontWeight: "700" },
  input: { flex: 1, minWidth: 80, fontSize: 13, color: "#2B2463", fontWeight: "600", paddingVertical: 2 },
  hint: { color: "#C0B8D0", fontSize: 10, fontWeight: "600", paddingLeft: 2 },
});

// ── Dropdown ──────────────────────────────────────────────────────────────────
function Dropdown({ value, options, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: open ? 100 : 1 }}>
      <TouchableOpacity style={[dd.btn, open && dd.btnOpen]} onPress={() => setOpen(!open)} activeOpacity={0.85}>
        <Text style={[dd.txt, !value && dd.ph]} numberOfLines={1}>{value || placeholder}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#9B7EC8" />
      </TouchableOpacity>
      {open && (
        <View style={dd.menu}>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt}
                style={[dd.opt, value === opt && dd.optSel, i === options.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[dd.optTxt, value === opt && dd.optTxtSel]}>{opt}</Text>
                {value === opt && <Ionicons name="checkmark-circle" size={16} color="#7548D8" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
const dd = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FDFAFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#EDE4F5", paddingHorizontal: 14, paddingVertical: 11 },
  btnOpen: { borderColor: "#7548D8", backgroundColor: "#F8F0FF" },
  txt: { fontSize: 13, fontWeight: "700", color: "#2B2463", flex: 1, marginRight: 6 },
  ph: { color: "#C0B8D0" },
  menu: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#EDE4F5", shadowColor: "#7548D8", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 12, zIndex: 999 },
  opt: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#F5F0FA" },
  optSel: { backgroundColor: "#F8F0FF" },
  optTxt: { fontSize: 13, fontWeight: "600", color: "#4A3B6B", flex: 1 },
  optTxtSel: { fontWeight: "800", color: "#7548D8" },
});

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ emoji, title, subtitle, gradColors, children }) {
  return (
    <View style={sc.card}>
      <LinearGradient colors={gradColors || ["#F8F0FF", "#FFF9F2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sc.hdr}>
        <View style={sc.iconWrap}>
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={sc.title}>{title}</Text>
          <Text style={sc.sub}>{subtitle}</Text>
        </View>
      </LinearGradient>
      <View style={sc.body}>{children}</View>
    </View>
  );
}
const sc = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: 1.5, borderColor: "#EDE4F5", marginBottom: 14, overflow: "hidden", backgroundColor: "#FFFFFF", shadowColor: "#7548D8", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 3 },
  hdr: { padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 46, height: 46, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" },
  title: { color: "#2B1D5E", fontSize: 15, fontWeight: "900", letterSpacing: -0.2 },
  sub: { color: "#8B7BAA", fontSize: 11, fontWeight: "600", marginTop: 1 },
  body: { padding: 16, gap: 14 },
});

// ── Field helpers ─────────────────────────────────────────────────────────────
const FL = ({ label }) => (
  <Text style={{ color: "#7B5EA7", fontSize: 10, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>{label}</Text>
);
const FI = ({ value, onChangeText, placeholder, keyboardType = "default" }) => (
  <TextInput
    style={{ backgroundColor: "#FDFAFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#EDE4F5", paddingHorizontal: 14, paddingVertical: 11, fontSize: 13, color: "#2B2463", fontWeight: "600" }}
    value={value} onChangeText={onChangeText} placeholder={placeholder}
    placeholderTextColor="#C0B8D0" keyboardType={keyboardType}
  />
);
const TA = ({ value, onChangeText, placeholder, rows = 3 }) => (
  <TextInput
    style={{ backgroundColor: "#FDFAFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#EDE4F5", paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontSize: 13, color: "#2B2463", fontWeight: "600", minHeight: rows * 26, textAlignVertical: "top" }}
    value={value} onChangeText={onChangeText} placeholder={placeholder}
    placeholderTextColor="#C0B8D0" multiline numberOfLines={rows}
  />
);
const Row = ({ children }) => <View style={{ flexDirection: "row", gap: 10 }}>{children}</View>;
const Col = ({ children, flex = 1 }) => <View style={{ flex }}>{children}</View>;

// ── View row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, last }) {
  if (!value?.trim() || value === "Not added yet") return null;
  return (
    <View style={[vr.row, last && { borderBottomWidth: 0 }]}>
      <Text style={vr.label}>{label}</Text>
      <Text style={vr.value}>{value}</Text>
    </View>
  );
}
function TagRow({ label, tags, color = "#7548D8", bg = "#F0E2FF", last }) {
  if (!tags?.length) return null;
  return (
    <View style={[vr.row, last && { borderBottomWidth: 0 }]}>
      <Text style={vr.label}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
        {tags.map(t => (
          <View key={t} style={{ backgroundColor: bg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: color + "30" }}>
            <Text style={{ color, fontSize: 11, fontWeight: "700" }}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const vr = StyleSheet.create({
  row: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F5F0FA" },
  label: { color: "#8B7BAA", fontSize: 10, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3 },
  value: { color: "#2B2463", fontSize: 13, fontWeight: "700", lineHeight: 19 },
});

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChildProfileScreen({ navigation, route }) {
  const childIndex = route?.params?.childIndex || 0;
  const [profile, setProfile] = useState(BLANK);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [savedMsg, setSavedMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      try {
        const raw = childIndex === 0
          ? await AsyncStorage.getItem(STORAGE_KEY)
          : await AsyncStorage.getItem(EXTRA_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const p = childIndex === 0 ? parsed : parsed[childIndex - 1];
        if (!p) return;
        const loaded = { ...BLANK, ...p };
        setProfile(loaded); setDraft(loaded);
      } catch (e) { console.log("Load error:", e); }
    };
    load();
  }, [childIndex]));

  const showStatus = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2500); };

  const set = (key, val) => setDraft(p => ({ ...p, [key]: val }));
  const addTag = (key) => (t) => setDraft(p => ({ ...p, [key]: [...(p[key] || []), t] }));
  const removeTag = (key) => (t) => setDraft(p => ({ ...p, [key]: (p[key] || []).filter(x => x !== t) }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = { ...draft, updatedAt: new Date().toISOString() };
      if (childIndex === 0) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } else {
        const raw = await AsyncStorage.getItem(EXTRA_STORAGE_KEY);
        const extras = raw ? JSON.parse(raw) : [];
        extras[childIndex - 1] = updated;
        await AsyncStorage.setItem(EXTRA_STORAGE_KEY, JSON.stringify(extras.filter(Boolean)));
      }
      setProfile(updated); setEditing(false);
      showStatus("Child profile saved! 💜");
    } catch (e) {
      Alert.alert("Error", "Couldn't save. Please try again.");
    } finally { setIsSaving(false); }
  };

  const handleCancel = () => { setDraft({ ...profile }); setEditing(false); };

  const handleClear = () => {
    Alert.alert("Clear Child Profile?", "This will remove all saved profile data.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        try {
          if (childIndex === 0) await AsyncStorage.removeItem(STORAGE_KEY);
          else {
            const raw = await AsyncStorage.getItem(EXTRA_STORAGE_KEY);
            const extras = raw ? JSON.parse(raw) : [];
            await AsyncStorage.setItem(EXTRA_STORAGE_KEY, JSON.stringify(extras.filter((_, i) => i !== childIndex - 1)));
          }
          setProfile(BLANK); setDraft(BLANK); setEditing(false);
          showStatus("Profile cleared");
        } catch (e) { console.log(e); }
      }}
    ]);
  };

  const avatarId = editing ? draft.avatar : profile.avatar;
  const avatarSource = AVATARS.find(a => a.id === avatarId)?.source || AVATARS[0].source;
  const displayName = profile.childName?.trim() || "Your child";
  const hasProfile = !!profile.childName?.trim();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <LinearGradient colors={["#EFE0FF", "#FFF9F2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroGrad}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#7548D8" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Child Profile</Text>
            <Text style={s.subtitle}>Keep important support details in one calm place.</Text>
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

        {/* Status banner */}
        {savedMsg ? (
          <View style={s.statusBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#4A9E5C" />
            <Text style={s.statusTxt}>{savedMsg}</Text>
          </View>
        ) : null}

        {editing && (
          <View style={s.editBanner}>
            <Feather name="edit-2" size={13} color="#7548D8" />
            <Text style={s.editBannerTxt}>Editing child profile</Text>
          </View>
        )}

        {/* ── VIEW MODE ──────────────────────────────────────────────── */}
        {!editing && (
          <>
            <View style={s.heroCard}>
              <View style={s.avatarWrap}>
                <Image source={avatarSource} style={s.avatarImg} resizeMode="contain" />
                <TouchableOpacity style={s.avatarEditBadge} onPress={() => setEditing(true)} activeOpacity={0.85}>
                  <Feather name="edit-2" size={10} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.heroName}>{displayName}</Text>
                <Text style={s.heroAge}>
                  {profile.age?.trim() && profile.age !== "Not added yet" ? `${profile.age} years old` : "Age not added yet"}
                </Text>
                {profile.pronouns ? <Text style={s.heroPronoun}>{profile.pronouns}</Text> : null}
              </View>
            </View>

            {!hasProfile && (
              <TouchableOpacity style={s.nudgeCard} onPress={() => setEditing(true)} activeOpacity={0.88}>
                <Ionicons name="person-add-outline" size={20} color="#7548D8" />
                <View style={{ flex: 1 }}>
                  <Text style={s.nudgeTitle}>No profile set up yet</Text>
                  <Text style={s.nudgeSub}>Tap to add your child's details.</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#7548D8" />
              </TouchableOpacity>
            )}

            {hasProfile && (
              <>
                {/* Basic */}
                <View style={s.viewCard}>
                  <Text style={s.viewCardTitle}>📋 Basic Info</Text>
                  <InfoRow label="Name" value={profile.childName} />
                  <InfoRow label="Nickname" value={profile.nickname} />
                  <InfoRow label="Date of Birth" value={profile.dob} />
                  <InfoRow label="Grade" value={profile.grade} last />
                </View>

                {/* Diagnosis */}
                {(profile.diagnosis || profile.supportSummary) ? (
                  <View style={s.viewCard}>
                    <Text style={s.viewCardTitle}>📋 Diagnosis & Support</Text>
                    <InfoRow label="Diagnosis" value={profile.diagnosis} />
                    <InfoRow label="Additional Notes" value={profile.additionalSupport} />
                    <InfoRow label="Support Summary" value={profile.supportSummary} last />
                  </View>
                ) : null}

                {/* Communication */}
                <View style={s.viewCard}>
                  <Text style={s.viewCardTitle}>💬 Communication</Text>
                  <InfoRow label="Style" value={profile.communicationStyle !== "Not added yet" ? profile.communicationStyle : ""} />
                  <InfoRow label="Preferred Method" value={profile.commMethod} />
                  <TagRow label="Helpful Phrases" tags={profile.helpfulPhrases} color="#4A9E5C" bg="#EEF7E9" />
                  <TagRow label="What NOT to Do" tags={profile.whatNotToDo} color="#D86A5B" bg="#FFE6E4" last />
                </View>

                {/* Sensory */}
                {(profile.sensoryNeeds || profile.comfortItems?.length) ? (
                  <View style={s.viewCard}>
                    <Text style={s.viewCardTitle}>🌿 Sensory Profile</Text>
                    <InfoRow label="Sensory Needs" value={profile.sensoryNeeds} />
                    <InfoRow label="Sensory Sensitivities" value={profile.sensorySensitivities} />
                    <TagRow label="Comfort Items" tags={profile.comfortItems} color="#7548D8" bg="#F0E2FF" />
                    <TagRow label="Favorite Reinforcers" tags={profile.favoriteReinforcers} color="#C8872A" bg="#FFF0DF" />
                    <TagRow label="What Helps Regulate" tags={profile.whatHelpsRegulate} color="#4C9ED9" bg="#E7F4FF" last />
                  </View>
                ) : null}

                {/* Triggers */}
                {profile.knownTriggers?.length ? (
                  <View style={s.viewCard}>
                    <Text style={s.viewCardTitle}>⚠️ Triggers & Hard Moments</Text>
                    <TagRow label="Known Triggers" tags={profile.knownTriggers} color="#D86A5B" bg="#FFE6E4" />
                    <TagRow label="Early Warning Signs" tags={profile.earlyWarningSigns} color="#C8872A" bg="#FFF0DF" />
                    <InfoRow label="What Makes It Worse" value={profile.whatMakesWorse} />
                    <InfoRow label="Recovery Notes" value={profile.meltdownRecoveryNotes} last />
                  </View>
                ) : null}

                {/* Calming */}
                {(profile.whatHelps || profile.meltdownRecoveryPlan) ? (
                  <View style={s.viewCard}>
                    <Text style={s.viewCardTitle}>🧘 Calming Strategies</Text>
                    <InfoRow label="What Helps" value={profile.whatHelps} />
                    <InfoRow label="Calm Corner / Tools" value={profile.calmCornerTools} />
                    <InfoRow label="Transition Tips" value={profile.transitionTips} />
                    <InfoRow label="Meltdown Recovery Plan" value={profile.meltdownRecoveryPlan} last />
                  </View>
                ) : null}

                {/* Strengths */}
                {(profile.strengths?.length || profile.caregiverNotes) ? (
                  <View style={s.viewCard}>
                    <Text style={s.viewCardTitle}>⭐ Strengths & What They Love</Text>
                    <TagRow label="Strengths" tags={profile.strengths} color="#7548D8" bg="#F0E2FF" />
                    <TagRow label="Things They Love" tags={profile.thingsTheyLove} color="#C8872A" bg="#FFF0DF" />
                    <TagRow label="Encouragement Notes" tags={profile.encouragementNotes} color="#4A9E5C" bg="#EEF7E9" />
                    <InfoRow label="Caregiver Notes" value={profile.caregiverNotes} last />
                  </View>
                ) : null}
              </>
            )}

            <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)} activeOpacity={0.88}>
              <Feather name="edit-2" size={16} color="#7548D8" />
              <Text style={s.editBtnTxt}>Edit Child Profile</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── EDIT MODE ──────────────────────────────────────────────── */}
        {editing && (
          <>
            {/* ── SECTION 1: BASIC INFO ─────────────────────────────── */}
            <SectionCard emoji="👤" title="Basic Information" subtitle="Your child's name, age, and identity."
              gradColors={["#F0E4FF", "#FAF6FF"]}>

              {/* Avatar */}
              <View>
                <FL label="Avatar" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
                  {AVATARS.map(a => (
                    <TouchableOpacity key={a.id}
                      style={[s.avOpt, draft.avatar === a.id && s.avOptSel]}
                      onPress={() => set("avatar", a.id)} activeOpacity={0.85}>
                      <Image source={a.source} style={s.avImg} resizeMode="contain" />
                      {draft.avatar === a.id && (
                        <View style={s.avCheck}>
                          <Feather name="check" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Row>
                <Col flex={2}>
                  <FL label="Child's Name" />
                  <FI value={draft.childName} onChangeText={v => set("childName", v)} placeholder="Full name" />
                </Col>
                <Col flex={1.4}>
                  <FL label="Nickname" />
                  <FI value={draft.nickname} onChangeText={v => set("nickname", v)} placeholder="Nickname" />
                </Col>
                <Col flex={0.7}>
                  <FL label="Age" />
                  <FI value={draft.age} onChangeText={v => set("age", v)} placeholder="5" keyboardType="number-pad" />
                </Col>
              </Row>

              <Row>
                <Col>
                  <FL label="Date of Birth" />
                  <FI value={draft.dob} onChangeText={v => set("dob", v)} placeholder="MM/DD/YYYY" />
                </Col>
                <Col>
                  <FL label="Pronouns" />
                  <Dropdown value={draft.pronouns} options={PRONOUNS} onSelect={v => set("pronouns", v)} placeholder="Select..." />
                </Col>
              </Row>

              <View>
                <FL label="Grade / School Level" />
                <Dropdown value={draft.grade} options={GRADE_OPTIONS} onSelect={v => set("grade", v)} placeholder="Select grade..." />
              </View>
            </SectionCard>

            {/* ── SECTION 2: DIAGNOSIS ──────────────────────────────── */}
            <SectionCard emoji="📋" title="Diagnosis & Support Notes" subtitle="For your reference — only shared when you choose."
              gradColors={["#E8F3FF", "#F5FAFF"]}>
              <View>
                <FL label="Primary Diagnosis / Support Area" />
                <FI value={draft.diagnosis} onChangeText={v => set("diagnosis", v)} placeholder="e.g. Autism Spectrum Disorder (ASD)" />
              </View>
              <View>
                <FL label="Additional Support Notes" />
                <FI value={draft.additionalSupport} onChangeText={v => set("additionalSupport", v)} placeholder="e.g. ADHD, Sensory Processing" />
              </View>
              <View>
                <FL label="Support Summary for Care Team" />
                <TA value={draft.supportSummary} onChangeText={v => set("supportSummary", v)}
                  placeholder="Describe what your child needs and how they do best..." rows={4} />
              </View>
              <View style={s.privNote}>
                <Ionicons name="lock-closed" size={13} color="#4C9ED9" />
                <Text style={s.privTxt}>This profile is private by default. It powers your Support Snapshot, PDF exports, and care-team sharing.</Text>
              </View>
            </SectionCard>

            {/* ── SECTION 3: COMMUNICATION ──────────────────────────── */}
            <SectionCard emoji="💬" title="Communication" subtitle="How your child communicates and what helps."
              gradColors={["#E8F7EE", "#F5FFF9"]}>
              <View>
                <FL label="Communication Style" />
                <Dropdown value={draft.communicationStyle} options={COMM_OPTIONS} onSelect={v => set("communicationStyle", v)} placeholder="Select..." />
              </View>
              <View>
                <FL label="Preferred Communication Method" />
                <FI value={draft.commMethod} onChangeText={v => set("commMethod", v)} placeholder="e.g. Spoken language + visual schedule" />
              </View>
              <View>
                <FL label="Helpful Phrases & Approaches" />
                <TagInput tags={draft.helpfulPhrases} onAdd={addTag("helpfulPhrases")} onRemove={removeTag("helpfulPhrases")}
                  placeholder="Type and press Enter..." accentColor="#4A9E5C" bgColor="#EEF7E9" />
              </View>
              <View>
                <FL label="What NOT to Do During Hard Moments" />
                <TagInput tags={draft.whatNotToDo} onAdd={addTag("whatNotToDo")} onRemove={removeTag("whatNotToDo")}
                  placeholder="Type and press Enter..." accentColor="#D86A5B" bgColor="#FFE6E4" />
              </View>
            </SectionCard>

            {/* ── SECTION 4: SENSORY ────────────────────────────────── */}
            <SectionCard emoji="🌿" title="Sensory Profile" subtitle="What helps your child feel safe and regulated."
              gradColors={["#EDF7EE", "#F8FFF9"]}>
              <Row>
                <Col>
                  <FL label="Sensory Needs" />
                  <TA value={draft.sensoryNeeds} onChangeText={v => set("sensoryNeeds", v)}
                    placeholder="e.g. Deep pressure, movement breaks..." rows={3} />
                </Col>
                <Col>
                  <FL label="Sensory Sensitivities" />
                  <TA value={draft.sensorySensitivities} onChangeText={v => set("sensorySensitivities", v)}
                    placeholder="e.g. Loud noises, bright lights..." rows={3} />
                </Col>
              </Row>
              <View>
                <FL label="Comfort Items" />
                <TagInput tags={draft.comfortItems} onAdd={addTag("comfortItems")} onRemove={removeTag("comfortItems")}
                  placeholder="Type and press Enter..." accentColor="#7548D8" bgColor="#F0E2FF" />
              </View>
              <View>
                <FL label="Favorite Reinforcers" />
                <TagInput tags={draft.favoriteReinforcers} onAdd={addTag("favoriteReinforcers")} onRemove={removeTag("favoriteReinforcers")}
                  placeholder="Type and press Enter..." accentColor="#C8872A" bgColor="#FFF0DF" />
              </View>
              <View>
                <FL label="What Helps Regulate" />
                <TagInput tags={draft.whatHelpsRegulate} onAdd={addTag("whatHelpsRegulate")} onRemove={removeTag("whatHelpsRegulate")}
                  placeholder="Type and press Enter..." accentColor="#4C9ED9" bgColor="#E7F4FF" />
              </View>
            </SectionCard>

            {/* ── SECTION 5: TRIGGERS ───────────────────────────────── */}
            <SectionCard emoji="⚠️" title="Triggers & Hard Moments" subtitle="What to watch for and how to help."
              gradColors={["#FFF5E8", "#FFFAF5"]}>
              <View>
                <FL label="Known Triggers" />
                <TagInput tags={draft.knownTriggers} onAdd={addTag("knownTriggers")} onRemove={removeTag("knownTriggers")}
                  placeholder="Type and press Enter..." accentColor="#D86A5B" bgColor="#FFE6E4" />
              </View>
              <View>
                <FL label="Early Warning Signs" />
                <TagInput tags={draft.earlyWarningSigns} onAdd={addTag("earlyWarningSigns")} onRemove={removeTag("earlyWarningSigns")}
                  placeholder="Type and press Enter..." accentColor="#C8872A" bgColor="#FFF0DF" />
              </View>
              <Row>
                <Col>
                  <FL label="What Makes Hard Moments Worse" />
                  <TA value={draft.whatMakesWorse} onChangeText={v => set("whatMakesWorse", v)}
                    placeholder="e.g. Rushing, raised voices..." rows={3} />
                </Col>
                <Col>
                  <FL label="Meltdown / Recovery Notes" />
                  <TA value={draft.meltdownRecoveryNotes} onChangeText={v => set("meltdownRecoveryNotes", v)}
                    placeholder="e.g. Needs 5-10 min alone..." rows={3} />
                </Col>
              </Row>
            </SectionCard>

            {/* ── SECTION 6: CALMING ────────────────────────────────── */}
            <SectionCard emoji="🧘" title="Calming Strategies" subtitle="What works when things get hard."
              gradColors={["#E8F3FF", "#F0F7FF"]}>
              <Row>
                <Col>
                  <FL label="What Helps" />
                  <TA value={draft.whatHelps} onChangeText={v => set("whatHelps", v)}
                    placeholder="e.g. Offer blanket, gentle touch..." rows={3} />
                </Col>
                <Col>
                  <FL label="Calm Corner / Tools" />
                  <TA value={draft.calmCornerTools} onChangeText={v => set("calmCornerTools", v)}
                    placeholder="e.g. Blanket, toy, iPad..." rows={3} />
                </Col>
              </Row>
              <Row>
                <Col>
                  <FL label="Transition Tips" />
                  <TA value={draft.transitionTips} onChangeText={v => set("transitionTips", v)}
                    placeholder="e.g. 10 and 5 min warnings..." rows={3} />
                </Col>
                <Col>
                  <FL label="Meltdown Recovery Plan" />
                  <TA value={draft.meltdownRecoveryPlan} onChangeText={v => set("meltdownRecoveryPlan", v)}
                    placeholder="Step 1: Create safety..." rows={3} />
                </Col>
              </Row>
            </SectionCard>

            {/* ── SECTION 7: STRENGTHS ──────────────────────────────── */}
            <SectionCard emoji="⭐" title="Strengths & What They Love" subtitle="The things that make your child uniquely them."
              gradColors={["#FFF8E8", "#FFFDF5"]}>
              <View>
                <FL label="Strengths" />
                <TagInput tags={draft.strengths} onAdd={addTag("strengths")} onRemove={removeTag("strengths")}
                  placeholder="Type and press Enter..." accentColor="#7548D8" bgColor="#F0E2FF" />
              </View>
              <View>
                <FL label="Things They Love" />
                <TagInput tags={draft.thingsTheyLove} onAdd={addTag("thingsTheyLove")} onRemove={removeTag("thingsTheyLove")}
                  placeholder="Type and press Enter..." accentColor="#C8872A" bgColor="#FFF0DF" />
              </View>
              <View>
                <FL label="Encouragement Notes" />
                <TagInput tags={draft.encouragementNotes} onAdd={addTag("encouragementNotes")} onRemove={removeTag("encouragementNotes")}
                  placeholder="Type and press Enter..." accentColor="#4A9E5C" bgColor="#EEF7E9" />
              </View>
              <View>
                <FL label="Caregiver Notes Visible on Snapshot" />
                <TA value={draft.caregiverNotes} onChangeText={v => set("caregiverNotes", v)}
                  placeholder="What do you want teachers and therapists to know about your child?" rows={4} />
              </View>
            </SectionCard>

            {/* Buttons */}
            <TouchableOpacity style={[s.saveBtn, isSaving && { opacity: 0.7 }]} onPress={handleSave} disabled={isSaving} activeOpacity={0.88}>
              <LinearGradient colors={["#9B6DE8", "#7548D8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtnGrad}>
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={s.saveBtnTxt}>Save Child Profile</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.clearBtn} onPress={handleClear} activeOpacity={0.86}>
              <Feather name="trash-2" size={15} color="#D86A5B" />
              <Text style={s.clearTxt}>Clear Child Profile</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={s.footer}>
          {editing ? "Changes save to this device." : "Tap Edit Child Profile to update details anytime."}
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
  title: { color: "#2B1D5E", fontSize: 22, fontWeight: "900", letterSpacing: -0.4 },
  subtitle: { color: "#8B7BAA", fontSize: 12, fontWeight: "600", marginTop: 2 },

  statusBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EAF7EE", borderRadius: 14, padding: 12, marginHorizontal: 16, marginBottom: 12, borderWidth: 1.5, borderColor: "#B8E8C8" },
  statusTxt: { color: "#3A8A52", fontSize: 13, fontWeight: "800" },
  editBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#F0E8FF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#D8C3F7" },
  editBannerTxt: { color: "#7548D8", fontSize: 12, fontWeight: "800" },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.5, borderColor: "#EDE4F5", padding: 16, flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12, shadowColor: "#7548D8", shadowOpacity: 0.07, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 3 },
  avatarWrap: { width: 84, height: 84, borderRadius: 26, backgroundColor: "#F4EAFE", alignItems: "center", justifyContent: "center", marginRight: 14, position: "relative", borderWidth: 2, borderColor: "#E3D2F8" },
  avatarImg: { width: 74, height: 74 },
  avatarEditBadge: { position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: "#7548D8", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  heroName: { color: "#2B1D5E", fontSize: 20, fontWeight: "900", marginBottom: 3 },
  heroAge: { color: "#7548D8", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  heroPronoun: { color: "#8B7BAA", fontSize: 12, fontWeight: "600" },

  nudgeCard: { backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1.5, borderColor: "#DEC9F7", paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 12 },
  nudgeTitle: { color: "#2B1D5E", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  nudgeSub: { color: "#8B7BAA", fontSize: 11, fontWeight: "600" },

  viewCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1.5, borderColor: "#EDE4F5", paddingHorizontal: 14, paddingTop: 12, paddingBottom: 2, marginHorizontal: 16, marginBottom: 10, shadowColor: "#7548D8", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  viewCardTitle: { color: "#2B1D5E", fontSize: 13, fontWeight: "900", marginBottom: 8 },

  editBtn: { height: 50, borderRadius: 16, backgroundColor: "#F0E8FF", borderWidth: 1.5, borderColor: "#D8C3F7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginBottom: 12 },
  editBtnTxt: { color: "#7548D8", fontSize: 14, fontWeight: "800" },

  // Avatar in edit
  avOpt: { width: 68, height: 68, borderRadius: 22, backgroundColor: "#F4EAFE", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#E3D2F8", position: "relative" },
  avOptSel: { borderWidth: 2.5, borderColor: "#7548D8", backgroundColor: "#ECE0FF" },
  avImg: { width: 58, height: 58 },
  avCheck: { position: "absolute", right: -4, top: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: "#7548D8", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF" },

  privNote: { flexDirection: "row", gap: 8, backgroundColor: "#EEF6FF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#BCD9F5", alignItems: "flex-start" },
  privTxt: { flex: 1, color: "#3A7DB5", fontSize: 11, fontWeight: "600", lineHeight: 17 },

  saveBtn: { marginHorizontal: 16, marginTop: 4, marginBottom: 10, borderRadius: 18, overflow: "hidden", shadowColor: "#7548D8", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 7 },
  saveBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  saveBtnTxt: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  cancelBtn: { height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#EDE4F5", alignItems: "center", justifyContent: "center", marginHorizontal: 16, marginBottom: 10 },
  cancelTxt: { color: "#7548D8", fontSize: 14, fontWeight: "800" },
  clearBtn: { height: 46, borderRadius: 16, backgroundColor: "#FFF1EC", borderWidth: 1, borderColor: "#FFD0C0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginBottom: 16 },
  clearTxt: { color: "#D86A5B", fontSize: 13, fontWeight: "800" },

  footer: { color: "#B0A4C8", fontSize: 11, textAlign: "center", lineHeight: 17, paddingHorizontal: 24, marginBottom: 8 },
});