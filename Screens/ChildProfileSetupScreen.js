import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform, KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const CHILD_PROFILE_KEY = "bitzaChildProfile";

const PRONOUNS_OPTIONS = ["He / Him", "She / Her", "They / Them", "He / They", "She / They", "Prefer not to say"];
const COMMUNICATION_OPTIONS = [
  "Verbal", "Verbal with support", "Mostly verbal", "Uses short phrases",
  "Minimally speaking", "Nonverbal", "Uses gestures", "Uses pointing",
  "Uses PECS / picture cards", "Uses AAC device", "Uses sign language",
  "Uses sounds / vocalizations", "Mixed communication style", "Other",
];
const GRADE_OPTIONS = [
  "Not in school yet", "Early intervention", "Pre-K", "Kindergarten",
  "1st grade", "2nd grade", "3rd grade", "4th grade", "5th grade",
  "6th grade", "7th grade", "8th grade", "9th grade", "10th grade",
  "11th grade", "12th grade", "Homeschooled", "Post-secondary",
];
const AVATAR_OPTIONS = ["🦕", "🐰", "🦋", "🐻", "🦊", "🐼", "🐸", "🦁", "🐳", "🌟", "🌈", "💜"];

// ── Tag Input Component ────────────────────────────────────────────────────────
function TagInput({ tags, onAdd, onRemove, placeholder, color = "#7548D8", bg = "#F0E2FF" }) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) { setInputValue(""); return; }
    onAdd(trimmed);
    setInputValue("");
  };

  return (
    <View style={tagStyles.wrap}>
      <View style={tagStyles.tagsRow}>
        {tags.map((tag) => (
          <View key={tag} style={[tagStyles.tag, { backgroundColor: bg, borderColor: color + "40" }]}>
            <Text style={[tagStyles.tagText, { color }]}>{tag}</Text>
            <TouchableOpacity onPress={() => onRemove(tag)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Feather name="x" size={11} color={color} />
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={tagStyles.input}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
          onEndEditing={handleAdd}
          placeholder={placeholder}
          placeholderTextColor="#B0A8C8"
          returnKeyType="done"
          blurOnSubmit={false}
        />
      </View>
      <Text style={tagStyles.hint}>Press Enter or comma to add</Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  wrap: { marginTop: 4 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, minHeight: 36 },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 12, fontWeight: "700" },
  input: { minWidth: 120, fontSize: 12, color: "#2B2463", fontWeight: "600", paddingVertical: 4 },
  hint: { color: "#B0A8C8", fontSize: 10, fontWeight: "600", marginTop: 4 },
});

// ── Dropdown Component ────────────────────────────────────────────────────────
function Dropdown({ value, options, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={dropStyles.btn}
        onPress={() => setOpen(!open)}
        activeOpacity={0.85}
      >
        <Text style={[dropStyles.btnText, !value && { color: "#B0A8C8" }]}>
          {value || placeholder}
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color="#7548D8" />
      </TouchableOpacity>
      {open && (
        <View style={dropStyles.menu}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[dropStyles.option, value === opt && dropStyles.optionSelected]}
                onPress={() => { onSelect(opt); setOpen(false); }}
                activeOpacity={0.85}
              >
                <Text style={[dropStyles.optionText, value === opt && dropStyles.optionTextSelected]}>{opt}</Text>
                {value === opt && <Feather name="check" size={14} color="#7548D8" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const dropStyles = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F6ECFF", borderRadius: 12, borderWidth: 1.5, borderColor: "#E3D2F8", paddingHorizontal: 12, paddingVertical: 10 },
  btnText: { fontSize: 14, fontWeight: "700", color: "#2B2463", flex: 1 },
  menu: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E3D2F8", marginTop: 4, zIndex: 999, elevation: 10, shadowColor: "#7548D8", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  option: { paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#F0E8E2" },
  optionSelected: { backgroundColor: "#F0E2FF" },
  optionText: { fontSize: 13, fontWeight: "600", color: "#2B2463" },
  optionTextSelected: { fontWeight: "800", color: "#7548D8" },
});

// ── Section Header Component ──────────────────────────────────────────────────
function SectionCard({ emoji, title, subtitle, color = "#F0E2FF", children }) {
  return (
    <View style={secStyles.card}>
      <View style={secStyles.header}>
        <View style={[secStyles.iconWrap, { backgroundColor: color }]}>
          <Text style={secStyles.emoji}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={secStyles.title}>{title}</Text>
          <Text style={secStyles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={secStyles.body}>{children}</View>
    </View>
  );
}

const secStyles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#EFE4DC", marginBottom: 14, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: "#F5F0F8" },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 22 },
  title: { color: "#2B2463", fontSize: 15, fontWeight: "900" },
  subtitle: { color: "#837E96", fontSize: 11, fontWeight: "600", marginTop: 1 },
  body: { padding: 16, gap: 14 },
});

// ── Field Label ───────────────────────────────────────────────────────────────
function FieldLabel({ label }) {
  return <Text style={{ color: "#2B2463", fontSize: 11, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{label}</Text>;
}

// ── Text Area ─────────────────────────────────────────────────────────────────
function TextArea({ value, onChangeText, placeholder, rows = 3 }) {
  return (
    <TextInput
      style={[{ backgroundColor: "#F6ECFF", borderRadius: 12, borderWidth: 1.5, borderColor: "#E3D2F8", paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: "#2B2463", fontWeight: "600", minHeight: rows * 22, textAlignVertical: "top" }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#B0A8C8"
      multiline
      numberOfLines={rows}
    />
  );
}

// ── Field Input ───────────────────────────────────────────────────────────────
function FieldInput({ value, onChangeText, placeholder, keyboardType = "default" }) {
  return (
    <TextInput
      style={{ backgroundColor: "#F6ECFF", borderRadius: 12, borderWidth: 1.5, borderColor: "#E3D2F8", paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: "#2B2463", fontWeight: "600" }}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#B0A8C8"
      keyboardType={keyboardType}
    />
  );
}

// ── Two Column Layout ─────────────────────────────────────────────────────────
function TwoCol({ children }) {
  return <View style={{ flexDirection: "row", gap: 12 }}>{children}</View>;
}

function Col({ children, flex = 1 }) {
  return <View style={{ flex }}>{children}</View>;
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ChildProfileScreen({ navigation }) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Basic Info
  const [avatar, setAvatar] = useState("🦕");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [childName, setChildName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [grade, setGrade] = useState("");

  // Diagnosis
  const [diagnosis, setDiagnosis] = useState("");
  const [additionalSupport, setAdditionalSupport] = useState("");
  const [supportSummary, setSupportSummary] = useState("");

  // Communication
  const [commStyle, setCommStyle] = useState("");
  const [commMethod, setCommMethod] = useState("");
  const [helpfulPhrases, setHelpfulPhrases] = useState([]);
  const [whatNotToDo, setWhatNotToDo] = useState([]);

  // Sensory
  const [sensoryNeeds, setSensoryNeeds] = useState("");
  const [sensorySensitivities, setSensorySensitivities] = useState("");
  const [comfortItems, setComfortItems] = useState([]);
  const [favoriteReinforcers, setFavoriteReinforcers] = useState([]);
  const [whatHelpsRegulate, setWhatHelpsRegulate] = useState([]);

  // Triggers
  const [knownTriggers, setKnownTriggers] = useState([]);
  const [earlyWarningSigns, setEarlyWarningSigns] = useState([]);
  const [whatMakesWorse, setWhatMakesWorse] = useState("");
  const [meltdownRecoveryNotes, setMeltdownRecoveryNotes] = useState("");

  // Calming
  const [whatHelps, setWhatHelps] = useState("");
  const [calmCornerTools, setCalmCornerTools] = useState("");
  const [transitionTips, setTransitionTips] = useState("");
  const [meltdownRecoveryPlan, setMeltdownRecoveryPlan] = useState("");

  // Strengths
  const [strengths, setStrengths] = useState([]);
  const [thingsTheyLove, setThingsTheyLove] = useState([]);
  const [encouragementNotes, setEncouragementNotes] = useState([]);
  const [caregiverNotes, setCaregiverNotes] = useState("");

  // ── Load ──────────────────────────────────────────────────────────────────
  useFocusEffect(useCallback(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(CHILD_PROFILE_KEY);
        if (!raw) return;
        const p = JSON.parse(raw);
        if (p.avatar) setAvatar(p.avatar);
        if (p.childName) setChildName(p.childName);
        if (p.nickname) setNickname(p.nickname);
        if (p.age) setAge(String(p.age));
        if (p.dob) setDob(p.dob);
        if (p.pronouns) setPronouns(p.pronouns);
        if (p.grade) setGrade(p.grade);
        if (p.diagnosis) setDiagnosis(p.diagnosis);
        if (p.additionalSupport) setAdditionalSupport(p.additionalSupport);
        if (p.supportSummary) setSupportSummary(p.supportSummary);
        if (p.communicationStyle) setCommStyle(p.communicationStyle);
        if (p.commMethod) setCommMethod(p.commMethod);
        if (p.helpfulPhrases) setHelpfulPhrases(p.helpfulPhrases);
        if (p.whatNotToDo) setWhatNotToDo(p.whatNotToDo);
        if (p.sensoryNeeds) setSensoryNeeds(p.sensoryNeeds);
        if (p.sensorySensitivities) setSensorySensitivities(p.sensorySensitivities);
        if (p.comfortItems) setComfortItems(p.comfortItems);
        if (p.favoriteReinforcers) setFavoriteReinforcers(p.favoriteReinforcers);
        if (p.whatHelpsRegulate) setWhatHelpsRegulate(p.whatHelpsRegulate);
        if (p.knownTriggers) setKnownTriggers(p.knownTriggers);
        if (p.earlyWarningSigns) setEarlyWarningSigns(p.earlyWarningSigns);
        if (p.whatMakesWorse) setWhatMakesWorse(p.whatMakesWorse);
        if (p.meltdownRecoveryNotes) setMeltdownRecoveryNotes(p.meltdownRecoveryNotes);
        if (p.whatHelps) setWhatHelps(p.whatHelps);
        if (p.calmCornerTools) setCalmCornerTools(p.calmCornerTools);
        if (p.transitionTips) setTransitionTips(p.transitionTips);
        if (p.meltdownRecoveryPlan) setMeltdownRecoveryPlan(p.meltdownRecoveryPlan);
        if (p.strengths) setStrengths(p.strengths);
        if (p.thingsTheyLove) setThingsTheyLove(p.thingsTheyLove);
        if (p.encouragementNotes) setEncouragementNotes(p.encouragementNotes);
        if (p.caregiverNotes) setCaregiverNotes(p.caregiverNotes);
      } catch (e) {
        console.log("Error loading child profile:", e);
      }
    };
    load();
  }, []));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!childName.trim()) {
      Alert.alert("Child's name required", "Please enter your child's name before saving.");
      return;
    }
    setIsSaving(true);
    try {
      const profile = {
        avatar, childName: childName.trim(), nickname: nickname.trim(),
        age: age.trim(), dob: dob.trim(), pronouns, grade,
        diagnosis: diagnosis.trim(), additionalSupport: additionalSupport.trim(),
        supportSummary: supportSummary.trim(),
        communicationStyle: commStyle, commMethod: commMethod.trim(),
        helpfulPhrases, whatNotToDo,
        sensoryNeeds: sensoryNeeds.trim(), sensorySensitivities: sensorySensitivities.trim(),
        comfortItems, favoriteReinforcers, whatHelpsRegulate,
        knownTriggers, earlyWarningSigns,
        whatMakesWorse: whatMakesWorse.trim(), meltdownRecoveryNotes: meltdownRecoveryNotes.trim(),
        whatHelps: whatHelps.trim(), calmCornerTools: calmCornerTools.trim(),
        transitionTips: transitionTips.trim(), meltdownRecoveryPlan: meltdownRecoveryPlan.trim(),
        strengths, thingsTheyLove, encouragementNotes,
        caregiverNotes: caregiverNotes.trim(),
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CHILD_PROFILE_KEY, JSON.stringify(profile));
      setSavedMsg("Profile saved! 💜");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (e) {
      Alert.alert("Error", "Couldn't save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = (setter) => (tag) => setter(prev => [...prev, tag]);
  const removeTag = (setter) => (tag) => setter(prev => prev.filter(t => t !== tag));

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Feather name="chevron-left" size={22} color="#7548D8" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Child Profile</Text>
              <Text style={styles.subtitle}>Edit your child's details, preferences, and support needs.</Text>
            </View>
          </View>

          {savedMsg ? (
            <View style={styles.savedBanner}>
              <Feather name="check-circle" size={16} color="#4A9E5C" />
              <Text style={styles.savedText}>{savedMsg}</Text>
            </View>
          ) : null}

          {/* ── SECTION 1: BASIC INFO ─────────────────────────────────── */}
          <SectionCard emoji="👤" title="Basic Information" subtitle="Your child's name, age, and identity." color="#F0E2FF">

            {/* Avatar */}
            <View style={styles.avatarRow}>
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => setShowAvatarPicker(!showAvatarPicker)}
                activeOpacity={0.85}
              >
                <Text style={styles.avatarEmoji}>{avatar}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAvatarPicker(!showAvatarPicker)} activeOpacity={0.75}>
                <Text style={styles.changeAvatarText}>✏️ Change avatar</Text>
              </TouchableOpacity>
            </View>

            {showAvatarPicker && (
              <View style={styles.avatarPicker}>
                {AVATAR_OPTIONS.map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.avatarOption, avatar === a && styles.avatarOptionSelected]}
                    onPress={() => { setAvatar(a); setShowAvatarPicker(false); }}
                  >
                    <Text style={{ fontSize: 24 }}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TwoCol>
              <Col flex={2}>
                <FieldLabel label="Child's Name" />
                <FieldInput value={childName} onChangeText={setChildName} placeholder="Full name" />
              </Col>
              <Col flex={1.5}>
                <FieldLabel label="Preferred / Nickname" />
                <FieldInput value={nickname} onChangeText={setNickname} placeholder="Nickname" />
              </Col>
              <Col flex={0.8}>
                <FieldLabel label="Age" />
                <FieldInput value={age} onChangeText={setAge} placeholder="5" keyboardType="number-pad" />
              </Col>
            </TwoCol>

            <TwoCol>
              <Col>
                <FieldLabel label="Date of Birth" />
                <FieldInput value={dob} onChangeText={setDob} placeholder="MM/DD/YYYY" />
              </Col>
              <Col>
                <FieldLabel label="Pronouns" />
                <Dropdown value={pronouns} options={PRONOUNS_OPTIONS} onSelect={setPronouns} placeholder="Select..." />
              </Col>
            </TwoCol>

            <View>
              <FieldLabel label="Grade / School Level" />
              <Dropdown value={grade} options={GRADE_OPTIONS} onSelect={setGrade} placeholder="Select grade..." />
            </View>
          </SectionCard>

          {/* ── SECTION 2: DIAGNOSIS ──────────────────────────────────── */}
          <SectionCard emoji="📋" title="Diagnosis & Support Notes" subtitle="For your reference — only shared when you choose." color="#E7F4FF">
            <View>
              <FieldLabel label="Primary Diagnosis / Support Area" />
              <FieldInput value={diagnosis} onChangeText={setDiagnosis} placeholder="e.g. Autism Spectrum Disorder (ASD)" />
            </View>
            <View>
              <FieldLabel label="Additional Support Notes" />
              <FieldInput value={additionalSupport} onChangeText={setAdditionalSupport} placeholder="e.g. ADHD, Sensory Processing" />
            </View>
            <View>
              <FieldLabel label="Support Summary for Care Team" />
              <TextArea value={supportSummary} onChangeText={setSupportSummary} placeholder="Describe what your child needs and how they do best..." rows={4} />
            </View>
            <View style={styles.privacyNote}>
              <Feather name="lock" size={13} color="#4C9ED9" />
              <Text style={styles.privacyNoteText}>This profile is private by default. It can later power your Support Snapshot, PDF exports, and care-team sharing.</Text>
            </View>
          </SectionCard>

          {/* ── SECTION 3: COMMUNICATION ──────────────────────────────── */}
          <SectionCard emoji="💬" title="Communication" subtitle="How your child communicates and what helps." color="#EEF7E9">
            <TwoCol>
              <Col>
                <FieldLabel label="Communication Style" />
                <Dropdown value={commStyle} options={COMMUNICATION_OPTIONS} onSelect={setCommStyle} placeholder="Select..." />
              </Col>
              <Col>
                <FieldLabel label="Preferred Communication Method" />
                <FieldInput value={commMethod} onChangeText={setCommMethod} placeholder="e.g. Visual schedule" />
              </Col>
            </TwoCol>
            <View>
              <FieldLabel label="Helpful Phrases & Approaches" />
              <TagInput
                tags={helpfulPhrases}
                onAdd={addTag(setHelpfulPhrases)}
                onRemove={removeTag(setHelpfulPhrases)}
                placeholder="Type and press Enter..."
                color="#4A9E5C"
                bg="#EEF7E9"
              />
            </View>
            <View>
              <FieldLabel label="What NOT to Do During Hard Moments" />
              <TagInput
                tags={whatNotToDo}
                onAdd={addTag(setWhatNotToDo)}
                onRemove={removeTag(setWhatNotToDo)}
                placeholder="Type and press Enter..."
                color="#EF8F7D"
                bg="#FFE6E4"
              />
            </View>
          </SectionCard>

          {/* ── SECTION 4: SENSORY ────────────────────────────────────── */}
          <SectionCard emoji="🌿" title="Sensory Profile" subtitle="What helps your child feel safe and regulated." color="#EEF7E9">
            <TwoCol>
              <Col>
                <FieldLabel label="Sensory Needs" />
                <TextArea value={sensoryNeeds} onChangeText={setSensoryNeeds} placeholder="e.g. Deep pressure, movement breaks..." rows={3} />
              </Col>
              <Col>
                <FieldLabel label="Sensory Sensitivities" />
                <TextArea value={sensorySensitivities} onChangeText={setSensorySensitivities} placeholder="e.g. Loud noises, bright lights..." rows={3} />
              </Col>
            </TwoCol>
            <View>
              <FieldLabel label="Comfort Items" />
              <TagInput
                tags={comfortItems}
                onAdd={addTag(setComfortItems)}
                onRemove={removeTag(setComfortItems)}
                placeholder="Type and press Enter..."
                color="#7548D8"
                bg="#F0E2FF"
              />
            </View>
            <View>
              <FieldLabel label="Favorite Reinforcers" />
              <TagInput
                tags={favoriteReinforcers}
                onAdd={addTag(setFavoriteReinforcers)}
                onRemove={removeTag(setFavoriteReinforcers)}
                placeholder="Type and press Enter..."
                color="#D99A3D"
                bg="#FFF0DF"
              />
            </View>
            <View>
              <FieldLabel label="What Helps Regulate" />
              <TagInput
                tags={whatHelpsRegulate}
                onAdd={addTag(setWhatHelpsRegulate)}
                onRemove={removeTag(setWhatHelpsRegulate)}
                placeholder="Type and press Enter..."
                color="#4C9ED9"
                bg="#E7F4FF"
              />
            </View>
          </SectionCard>

          {/* ── SECTION 5: TRIGGERS ───────────────────────────────────── */}
          <SectionCard emoji="⚠️" title="Triggers & Hard Moments" subtitle="What to watch for and how to help." color="#FFF0DF">
            <View>
              <FieldLabel label="Known Triggers" />
              <TagInput
                tags={knownTriggers}
                onAdd={addTag(setKnownTriggers)}
                onRemove={removeTag(setKnownTriggers)}
                placeholder="Type and press Enter..."
                color="#D86A5B"
                bg="#FFE6E4"
              />
            </View>
            <View>
              <FieldLabel label="Early Warning Signs" />
              <TagInput
                tags={earlyWarningSigns}
                onAdd={addTag(setEarlyWarningSigns)}
                onRemove={removeTag(setEarlyWarningSigns)}
                placeholder="Type and press Enter..."
                color="#D99A3D"
                bg="#FFF0DF"
              />
            </View>
            <TwoCol>
              <Col>
                <FieldLabel label="What Makes Hard Moments Worse" />
                <TextArea value={whatMakesWorse} onChangeText={setWhatMakesWorse} placeholder="e.g. Rushing, raised voices..." rows={3} />
              </Col>
              <Col>
                <FieldLabel label="Meltdown / Recovery Notes" />
                <TextArea value={meltdownRecoveryNotes} onChangeText={setMeltdownRecoveryNotes} placeholder="e.g. Needs 5-10 min alone..." rows={3} />
              </Col>
            </TwoCol>
          </SectionCard>

          {/* ── SECTION 6: CALMING ────────────────────────────────────── */}
          <SectionCard emoji="🧘" title="Calming Strategies" subtitle="What works when things get hard." color="#E7F4FF">
            <TwoCol>
              <Col>
                <FieldLabel label="What Helps" />
                <TextArea value={whatHelps} onChangeText={setWhatHelps} placeholder="e.g. Offer blanket, gentle touch..." rows={3} />
              </Col>
              <Col>
                <FieldLabel label="Calm Corner / Tools" />
                <TextArea value={calmCornerTools} onChangeText={setCalmCornerTools} placeholder="e.g. Blanket, toy, iPad..." rows={3} />
              </Col>
            </TwoCol>
            <TwoCol>
              <Col>
                <FieldLabel label="Transition Tips" />
                <TextArea value={transitionTips} onChangeText={setTransitionTips} placeholder="e.g. 10 and 5 min warnings..." rows={3} />
              </Col>
              <Col>
                <FieldLabel label="Meltdown Recovery Plan" />
                <TextArea value={meltdownRecoveryPlan} onChangeText={setMeltdownRecoveryPlan} placeholder="Step 1: Create safety..." rows={3} />
              </Col>
            </TwoCol>
          </SectionCard>

          {/* ── SECTION 7: STRENGTHS ──────────────────────────────────── */}
          <SectionCard emoji="⭐" title="Strengths & What They Love" subtitle="The things that make your child uniquely them." color="#FFF0DF">
            <View>
              <FieldLabel label="Strengths" />
              <TagInput
                tags={strengths}
                onAdd={addTag(setStrengths)}
                onRemove={removeTag(setStrengths)}
                placeholder="Type and press Enter..."
                color="#7548D8"
                bg="#F0E2FF"
              />
            </View>
            <View>
              <FieldLabel label="Things They Love" />
              <TagInput
                tags={thingsTheyLove}
                onAdd={addTag(setThingsTheyLove)}
                onRemove={removeTag(setThingsTheyLove)}
                placeholder="Type and press Enter..."
                color="#D99A3D"
                bg="#FFF0DF"
              />
            </View>
            <View>
              <FieldLabel label="Encouragement Notes" />
              <TagInput
                tags={encouragementNotes}
                onAdd={addTag(setEncouragementNotes)}
                onRemove={removeTag(setEncouragementNotes)}
                placeholder="Type and press Enter..."
                color="#4A9E5C"
                bg="#EEF7E9"
              />
            </View>
            <View>
              <FieldLabel label="Caregiver Notes Visible on Snapshot" />
              <TextArea value={caregiverNotes} onChangeText={setCaregiverNotes} placeholder="What do you want teachers and therapists to know about your child?" rows={4} />
            </View>
          </SectionCard>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.88}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Save Child Profile</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            This profile powers your Support Snapshot, Hugi AI responses, and care team sharing. 💜
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginTop: 2 },
  title: { color: "#2B2463", fontSize: 22, fontWeight: "900" },
  subtitle: { color: "#837E96", fontSize: 12, fontWeight: "600", marginTop: 2 },

  savedBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EEF7E9", borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "#C5E3C8" },
  savedText: { color: "#4A9E5C", fontSize: 13, fontWeight: "700" },

  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 },
  avatarBtn: { width: 72, height: 72, borderRadius: 22, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#E3D2F8" },
  avatarEmoji: { fontSize: 40 },
  changeAvatarText: { color: "#7548D8", fontSize: 13, fontWeight: "700" },
  avatarPicker: { flexDirection: "row", flexWrap: "wrap", gap: 10, backgroundColor: "#F6ECFF", borderRadius: 16, padding: 12, marginBottom: 8 },
  avatarOption: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#E3D2F8" },
  avatarOptionSelected: { borderColor: "#7548D8", backgroundColor: "#F0E2FF" },

  privacyNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#E7F4FF", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#A8D4F5" },
  privacyNoteText: { flex: 1, color: "#4C9ED9", fontSize: 11, fontWeight: "600", lineHeight: 16 },

  saveBtn: { height: 56, borderRadius: 18, backgroundColor: "#7548D8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12, shadowColor: "#7548D8", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 6 },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  footerText: { color: "#A0A0C0", fontSize: 11, textAlign: "center", lineHeight: 17 },
});