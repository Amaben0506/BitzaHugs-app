import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Platform, Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const CHILD_PROFILE_KEY = "bitzaChildProfile";
const PLAN_KEY = "bitzaMeltdownPlan";

const DEFAULT_STEPS = [
  { id: "1", title: "Check safety first", text: "Move anything unsafe out of reach. Lower the pressure. You do not have to fix everything right now.", icon: "shield", bg: "#FFE6E4", accent: "#EF8F7D" },
  { id: "2", title: "Lower demands", text: "Pause instructions, questions, and corrections. Give space if space is safe.", icon: "pause-circle", bg: "#F0E2FF", accent: "#6F42D8" },
  { id: "3", title: "Reduce sensory input", text: "Dim lights, lower noise, reduce crowding, and create a calmer space.", icon: "volume-x", bg: "#E7F4FF", accent: "#4C9ED9" },
  { id: "4", title: "Use known calming supports", text: "Try a comfort item, quiet space, soft voice, or whatever usually helps them feel safe.", icon: "heart", bg: "#EEF7E8", accent: "#78A866" },
  { id: "5", title: "Support recovery after", text: "Keep things gentle. Offer water, quiet time, comfort, and time to reconnect.", icon: "sunrise", bg: "#FFF0DF", accent: "#D99A3D" },
];

export default function MeltdownPlanScreen({ navigation }) {
  const [childProfile, setChildProfile] = useState(null);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_STEPS);
  const [savedMessage, setSavedMessage] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [draftNote, setDraftNote] = useState("");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const saved = await AsyncStorage.getItem(CHILD_PROFILE_KEY);
          const child = saved ? JSON.parse(saved) : null;
          setChildProfile(child);

          // Load saved plan or build from child profile
          const savedPlan = await AsyncStorage.getItem(PLAN_KEY);
          if (savedPlan) {
            const plan = JSON.parse(savedPlan);
            setSteps(plan.steps || DEFAULT_STEPS);
            setDraft(plan.steps || DEFAULT_STEPS);
            setCustomNote(plan.customNote || "");
            setDraftNote(plan.customNote || "");
          } else if (child) {
            // Pre-fill step 4 with child's calming strategies
            const prefilled = DEFAULT_STEPS.map((s) =>
              s.id === "4" && child.calmingStrategies?.trim()
                ? { ...s, text: child.calmingStrategies.trim() }
                : s
            );
            setSteps(prefilled);
            setDraft(prefilled);
            setCustomNote(child.meltdownNotes?.trim() || "");
            setDraftNote(child.meltdownNotes?.trim() || "");
          }
        } catch (e) {
          console.log("Error loading meltdown plan:", e);
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
      const plan = { steps: draft, customNote: draftNote, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan));
      setSteps(draft);
      setCustomNote(draftNote);
      setEditing(false);
      showStatus("Plan saved 💜");
    } catch (e) {
      Alert.alert("Oops", "Something went wrong saving the plan.");
    }
  };

  const handleCancel = () => {
    setDraft([...steps]);
    setDraftNote(customNote);
    setEditing(false);
  };

  const handleReset = async () => {
    Alert.alert("Reset to defaults?", "This will restore the default meltdown plan steps.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: async () => {
        const prefilled = DEFAULT_STEPS.map((s) =>
          s.id === "4" && childProfile?.calmingStrategies?.trim()
            ? { ...s, text: childProfile.calmingStrategies.trim() }
            : s
        );
        setDraft(prefilled);
        setDraftNote("");
      }},
    ]);
  };

  const updateDraftStep = (id, field, value) => {
    setDraft((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const childName = childProfile?.childName?.trim() || "your child";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Meltdown Plan</Text>
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

        {/* Status */}
        {savedMessage ? (
          <View style={styles.statusBanner}>
            <Feather name="check-circle" size={16} color="#6F42D8" />
            <Text style={styles.statusText}>{savedMessage}</Text>
          </View>
        ) : null}

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="heart" size={24} color="#EF8F7D" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Support plan for {childName}</Text>
            <Text style={styles.heroText}>Keep this nearby for hard moments. Read it before you need it.</Text>
          </View>
        </View>

        {/* Edit banner */}
        {editing && (
          <View style={styles.editBanner}>
            <Feather name="edit-2" size={14} color="#6F42D8" />
            <Text style={styles.editBannerText}>Editing your meltdown plan — tap any step to customize it</Text>
          </View>
        )}

        {/* Steps */}
        {(editing ? draft : steps).map((step, index) => (
          <View key={step.id} style={[styles.stepCard, { borderLeftColor: step.accent, borderLeftWidth: 3 }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconBubble, { backgroundColor: step.bg }]}>
                <Feather name={step.icon} size={18} color={step.accent} />
              </View>
              <View style={styles.stepNumberWrap}>
                <Text style={styles.stepNumber}>Step {index + 1}</Text>
                {editing ? (
                  <TextInput
                    style={styles.stepTitleInput}
                    value={step.title}
                    onChangeText={(v) => updateDraftStep(step.id, "title", v)}
                    placeholderTextColor="#A8A0A5"
                  />
                ) : (
                  <Text style={styles.stepTitle}>{step.title}</Text>
                )}
              </View>
            </View>
            {editing ? (
              <TextInput
                style={styles.stepTextInput}
                value={step.text}
                onChangeText={(v) => updateDraftStep(step.id, "text", v)}
                multiline
                textAlignVertical="top"
                placeholderTextColor="#A8A0A5"
              />
            ) : (
              <Text style={styles.stepText}>{step.text}</Text>
            )}
          </View>
        ))}

        {/* Custom note */}
        <View style={[styles.stepCard, { borderLeftColor: "#6F42D8", borderLeftWidth: 3 }]}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepIconBubble, { backgroundColor: "#F0E2FF" }]}>
              <Feather name="file-text" size={18} color="#6F42D8" />
            </View>
            <View style={styles.stepNumberWrap}>
              <Text style={styles.stepNumber}>Personal Notes</Text>
              <Text style={styles.stepTitle}>Your own reminders</Text>
            </View>
          </View>
          {editing ? (
            <TextInput
              style={styles.stepTextInput}
              value={draftNote}
              onChangeText={setDraftNote}
              multiline
              textAlignVertical="top"
              placeholder="Add anything personal — reminders to yourself, what works for your child..."
              placeholderTextColor="#A8A0A5"
            />
          ) : (
            <Text style={[styles.stepText, !customNote && { color: "#A8A0A5", fontStyle: "italic" }]}>
              {customNote || "Tap Edit to add personal notes..."}
            </Text>
          )}
        </View>

        {/* Reminder card */}
        {!editing && (
          <View style={styles.reminderCard}>
            <Ionicons name="heart-outline" size={18} color="#6F42D8" />
            <Text style={styles.reminderText}>You are not failing. You are doing your best in a hard moment. That matters.</Text>
          </View>
        )}

        {/* Buttons */}
        {editing ? (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
              <Text style={styles.saveButtonText}>Save Plan</Text>
              <Feather name="check" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.85}>
              <Feather name="refresh-cw" size={15} color="#837E96" />
              <Text style={styles.resetButtonText}>Reset to defaults</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.editFullBtn} onPress={() => setEditing(true)} activeOpacity={0.88}>
            <Feather name="edit-2" size={16} color="#6F42D8" />
            <Text style={styles.editFullBtnText}>Edit Plan</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
          {editing ? "Changes are saved locally on this device." : "Tap Edit Plan to customize each step for your child."}
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

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 12, flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  heroIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#FFE6E4", alignItems: "center", justifyContent: "center" },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  editBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#F0E2FF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, borderWidth: 1, borderColor: "#E3D2F8" },
  editBannerText: { flex: 1, color: "#6F42D8", fontSize: 11, fontWeight: "700" },

  stepCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 13, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  stepHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  stepIconBubble: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNumberWrap: { flex: 1 },
  stepNumber: { color: "#837E96", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  stepTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800" },
  stepTitleInput: { color: "#2B2463", fontSize: 14, fontWeight: "800", borderBottomWidth: 1, borderBottomColor: "#E3D2F8", paddingBottom: 2 },
  stepText: { color: "#5B5672", fontSize: 13, lineHeight: 19, fontWeight: "600" },
  stepTextInput: { color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "600", backgroundColor: "#FFF9F2", borderRadius: 11, borderWidth: 1, borderColor: "#EFE4DC", padding: 10, minHeight: 70 },

  reminderCard: { backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  reminderText: { flex: 1, color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "700" },

  editFullBtn: { height: 50, borderRadius: 16, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  editFullBtnText: { color: "#6F42D8", fontSize: 14, fontWeight: "800" },

  saveButton: { height: 50, borderRadius: 16, backgroundColor: "#8B5BE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  cancelButton: { height: 44, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  cancelButtonText: { color: "#6F42D8", fontSize: 14, fontWeight: "800" },
  resetButton: { height: 42, borderRadius: 13, backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: "#E8E8E8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 12 },
  resetButtonText: { color: "#837E96", fontSize: 13, fontWeight: "700" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});