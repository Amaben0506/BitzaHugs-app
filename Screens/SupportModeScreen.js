import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Platform, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

// ─── Situations ───────────────────────────────────────────────────────────────
const SITUATIONS = [
  {
    id: "meltdown", label: "My child is melting down", icon: "alert-circle", color: "#EF8F7D", bg: "#FFE6E4",
    hugi: "Okay. Safety first — move anything unsafe, soften your voice, and lower all demands. You don't have to fix this moment. Just be present.",
    tools: [
      { title: "Meltdown Plan", icon: "clipboard", screen: "MeltdownPlan", bg: "#FFF0DF", color: "#D99A3D" },
      { title: "Transition Timer", icon: "clock", screen: "Transitions", bg: "#EFE2FF", color: "#6F42D8" },
      { title: "Calming Sounds", icon: "volume-2", screen: "Sounds", bg: "#FFE6DF", color: "#EF8F7D" },
    ],
  },
  {
    id: "overwhelmed", label: "I feel overwhelmed", icon: "wind", color: "#6F42D8", bg: "#F0E2FF",
    hugi: "I hear you. You're carrying a lot. Take one breath — you don't have to do everything at once. What's the one smallest thing that could help right now?",
    tools: [
      { title: "Breathing Exercise", icon: "wind", screen: "Breathing", bg: "#E7F4FF", color: "#4C9ED9" },
      { title: "Affirmations", icon: "star", screen: "Affirmations", bg: "#FFF0DF", color: "#D99A3D" },
      { title: "Calm Journal", icon: "edit-3", screen: "CalmJournal", bg: "#EEF7E8", color: "#78A866" },
    ],
  },
  {
    id: "dontknow", label: "I don't know what to do", icon: "help-circle", color: "#4C9ED9", bg: "#E7F4FF",
    hugi: "Not knowing is okay. That's honest. Let's slow it all down — you don't need answers right now. You just need one small step toward calm.",
    tools: [
      { title: "Talk to Hugi", icon: "message-circle", screen: "HugiChat", bg: "#F0E2FF", color: "#6F42D8" },
      { title: "Grounding Steps", icon: "anchor", screen: "GroundingSteps", bg: "#EEF7E8", color: "#78A866" },
      { title: "Breathing Exercise", icon: "wind", screen: "Breathing", bg: "#E7F4FF", color: "#4C9ED9" },
    ],
  },
  {
    id: "needcalm", label: "I need to calm down first", icon: "heart", color: "#78A866", bg: "#EEF7E8",
    hugi: "Good — you noticed. That's the first step. Let your body slow down before anything else. You're doing the right thing by pausing.",
    tools: [
      { title: "Breathing Exercise", icon: "wind", screen: "Breathing", bg: "#E7F4FF", color: "#4C9ED9" },
      { title: "Calming Sounds", icon: "volume-2", screen: "Sounds", bg: "#FFE6DF", color: "#EF8F7D" },
      { title: "Grounding Steps", icon: "anchor", screen: "GroundingSteps", bg: "#EEF7E8", color: "#78A866" },
    ],
  },
];

// ─── Breathing Circle ─────────────────────────────────────────────────────────
function BreathingCircle() {
  const scale = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState("Breathe in...");

  useEffect(() => {
    let cancelled = false;
    const cycle = () => {
      if (cancelled) return;
      setPhase("Breathe in...");
      Animated.timing(scale, { toValue: 1.35, duration: 4000, useNativeDriver: true }).start(() => {
        if (cancelled) return;
        setPhase("Hold...");
        setTimeout(() => {
          if (cancelled) return;
          setPhase("Breathe out...");
          Animated.timing(scale, { toValue: 1, duration: 6000, useNativeDriver: true }).start(() => {
            if (cancelled) return;
            setTimeout(() => cycle(), 1000);
          });
        }, 2000);
      });
    };
    cycle();
    return () => { cancelled = true; };
  }, [scale]);

  return (
    <View style={breath.wrap}>
      <Animated.View style={[breath.outerRing, { transform: [{ scale }] }]}>
        <View style={breath.innerCircle}>
          <Text style={breath.phaseText}>{phase}</Text>
        </View>
      </Animated.View>
      <Text style={breath.hint}>Follow the circle. In for 4, hold 2, out for 6.</Text>
    </View>
  );
}

const breath = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 16 },
  outerRing: { width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(111,66,216,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  innerCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#6F42D8", alignItems: "center", justifyContent: "center" },
  phaseText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", textAlign: "center" },
  hint: { color: "#837E96", fontSize: 12, fontWeight: "600", textAlign: "center" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupportModeScreen({ navigation }) {
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [supportContacts, setSupportContacts] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("bitzaSupportPerson");
        if (saved) setSupportContacts(JSON.parse(saved));
      } catch (e) {
        console.log("Error loading:", e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const track = async () => {
      try {
        const current = await AsyncStorage.getItem("bitzaSupportModeUses");
        const count = current ? parseInt(current) : 0;
        await AsyncStorage.setItem("bitzaSupportModeUses", String(count + 1));
      } catch (e) {
        console.log("Error tracking:", e);
      }
    };
    track();
  }, []);

  const handleSituationSelect = (situation) => {
    setSelectedSituation(situation);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const go = (screen) =>
    navigation.getParent()?.navigate(screen) ??
    navigation.navigate(screen);

  const callContact = (contact) => {
    if (!contact?.phone?.trim()) {
      Alert.alert("No phone number", "Add a phone number in your Support Person settings.");
      return;
    }
    Linking.openURL(`tel:${contact.phone.replace(/\D/g, "")}`);
  };

  const textContact = (contact, message) => {
    if (!contact?.phone?.trim()) {
      Alert.alert("No phone number", "Add a phone number in your Support Person settings.");
      return;
    }
    const phone = contact.phone.replace(/\D/g, "");
    const body = encodeURIComponent(message || "Hey, I'm having a hard moment and could use support. Can you check in with me?");
    Linking.openURL(`sms:${phone}${Platform.OS === "ios" ? "&" : "?"}body=${body}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="chevron-left" size={22} color="#2B2463" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Mode</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="x" size={20} color="#2B2463" />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>You're not alone.</Text>
          <Text style={styles.heroText}>Choose one small thing that could help right now.</Text>
        </View>

        {/* Contact Card */}
        {supportContacts && (supportContacts.contact1?.name?.trim() || supportContacts.contact2?.name?.trim()) && (
          <View style={styles.contactCard}>
            <View style={styles.contactCardHeader}>
              <View style={styles.contactCardIconWrap}>
                <Feather name="phone-call" size={15} color="#EF8F7D" />
              </View>
              <Text style={styles.contactCardTitle}>Reach out to someone</Text>
            </View>
            {[supportContacts.contact1, supportContacts.contact2].map((contact, i) => {
              if (!contact?.name?.trim()) return null;
              return (
                <View key={i} style={styles.contactRow}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.relationship?.trim() ? <Text style={styles.contactRelationship}>{contact.relationship}</Text> : null}
                  </View>
                  <TouchableOpacity style={styles.contactActionBtn} onPress={() => textContact(contact, supportContacts.message)} activeOpacity={0.85}>
                    <Feather name="message-circle" size={16} color="#6F42D8" />
                    <Text style={styles.contactActionText}>Text</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.contactActionBtn, styles.contactCallBtn]} onPress={() => callContact(contact)} activeOpacity={0.85}>
                    <Feather name="phone" size={16} color="#FFFFFF" />
                    <Text style={styles.contactCallText}>Call</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* No contacts nudge */}
        {(!supportContacts || (!supportContacts.contact1?.name?.trim() && !supportContacts.contact2?.name?.trim())) && (
          <TouchableOpacity style={styles.addContactNudge} onPress={() => go("SupportPerson")} activeOpacity={0.88}>
            <Feather name="user-plus" size={16} color="#6F42D8" />
            <Text style={styles.addContactText}>Add a support person to reach out quickly</Text>
            <Feather name="chevron-right" size={14} color="#6F42D8" />
          </TouchableOpacity>
        )}

        {/* Step 1 — Breathing */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeaderRow}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
            <Text style={styles.stepTitle}>Take one breath with me</Text>
          </View>
          <Text style={styles.stepSubtitle}>Before anything else — just one breath. Let your body slow down first.</Text>
          <BreathingCircle />
        </View>

        {/* Step 2 — What's happening */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeaderRow}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
            <Text style={styles.stepTitle}>What's happening right now?</Text>
          </View>
          <Text style={styles.stepSubtitle}>Tap what feels closest. There's no wrong answer.</Text>
          <View style={styles.situationGrid}>
            {SITUATIONS.map((s) => {
              const isSelected = selectedSituation?.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.situationCard, { backgroundColor: s.bg }, isSelected && styles.situationCardSelected]}
                  onPress={() => handleSituationSelect(s)}
                  activeOpacity={0.85}
                >
                  <Feather name={s.icon} size={20} color={s.color} />
                  <Text style={[styles.situationLabel, { color: s.color }]}>{s.label}</Text>
                  {isSelected && (
                    <View style={styles.situationCheck}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 3 — Hugi + Tools */}
        {selectedSituation && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
              <Text style={styles.stepTitle}>Here's what might help</Text>
            </View>
            <View style={styles.hugiMessageCard}>
              <View style={styles.hugiAvatarWrap}>
                <Text style={styles.hugiEmoji}>🐰</Text>
              </View>
              <View style={styles.hugiTextWrap}>
                <Text style={styles.hugiName}>Hugi</Text>
                <Text style={styles.hugiMessage}>{selectedSituation.hugi}</Text>
              </View>
            </View>
            <Text style={styles.toolsLabel}>Recommended right now</Text>
            <View style={styles.toolsList}>
              {selectedSituation.tools.map((tool, i) => (
                <TouchableOpacity
                  key={tool.title}
                  style={[styles.toolRow, i === selectedSituation.tools.length - 1 && styles.toolRowLast]}
                  onPress={() => go(tool.screen)}
                  activeOpacity={0.86}
                >
                  <View style={[styles.toolIconBubble, { backgroundColor: tool.bg }]}>
                    <Feather name={tool.icon} size={18} color={tool.color} />
                  </View>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Feather name="chevron-right" size={16} color="#2B2463" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.hugiButton}
              onPress={() => go("HugiChat")}
              activeOpacity={0.9}
            >
              <Feather name="message-circle" size={18} color="#FFFFFF" />
              <Text style={styles.hugiButtonText}>Talk to Hugi for more support</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons name="heart-outline" size={18} color="#6F42D8" />
          <Text style={styles.reminderText}>This moment is hard, but you are not failing.</Text>
        </View>

        <Text style={styles.footerText}>
          If there is immediate danger or a medical emergency, contact emergency services right away.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: Platform.OS === "ios" ? 4 : 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#EFE4DC", backgroundColor: "#FFFFFF" },
  headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 16, paddingVertical: 14, alignItems: "center", marginBottom: 12, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  heroTitle: { color: "#2B2463", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  heroText: { color: "#5B5672", fontSize: 13, fontWeight: "600", textAlign: "center" },

  contactCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 12, marginBottom: 12, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  contactCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  contactCardIconWrap: { width: 28, height: 28, borderRadius: 9, backgroundColor: "#FFE6E4", alignItems: "center", justifyContent: "center" },
  contactCardTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800" },
  contactRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F0E8E2", gap: 8 },
  contactInfo: { flex: 1 },
  contactName: { color: "#2B2463", fontSize: 13, fontWeight: "800" },
  contactRelationship: { color: "#837E96", fontSize: 11, fontWeight: "600" },
  contactActionBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F0E2FF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "#E3D2F8" },
  contactActionText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },
  contactCallBtn: { backgroundColor: "#6F42D8", borderColor: "#6F42D8" },
  contactCallText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  addContactNudge: { backgroundColor: "#F6ECFF", borderRadius: 14, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 12 },
  addContactText: { flex: 1, color: "#6F42D8", fontSize: 12, fontWeight: "700" },

  stepCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 14, marginBottom: 12, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  stepHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  stepBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#6F42D8", alignItems: "center", justifyContent: "center" },
  stepBadgeText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  stepTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", flex: 1 },
  stepSubtitle: { color: "#837E96", fontSize: 12, fontWeight: "600", lineHeight: 17, marginBottom: 10 },

  situationGrid: { gap: 8 },
  situationCard: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: "transparent", position: "relative" },
  situationCardSelected: { borderColor: "#6F42D8" },
  situationLabel: { flex: 1, fontSize: 14, fontWeight: "800", lineHeight: 18 },
  situationCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#6F42D8", alignItems: "center", justifyContent: "center" },

  hugiMessageCard: { backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  hugiAvatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  hugiEmoji: { fontSize: 20 },
  hugiTextWrap: { flex: 1 },
  hugiName: { color: "#6F42D8", fontSize: 11, fontWeight: "800", marginBottom: 3 },
  hugiMessage: { color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "600" },

  toolsLabel: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 8 },
  toolsList: { backgroundColor: "#FFF9F2", borderRadius: 14, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  toolRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0E8E2", gap: 10 },
  toolRowLast: { borderBottomWidth: 0 },
  toolIconBubble: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toolTitle: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "800" },
  toolPremiumBadge: { backgroundColor: "#EFE1FF", borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2 },
  toolPremiumText: { color: "#7548D8", fontSize: 9, fontWeight: "800" },

  hugiButton: { height: 46, borderRadius: 14, backgroundColor: "#6F42D8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  hugiButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  hugiPremiumBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  hugiPremiumText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },

  reminderCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  reminderText: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "700" },
  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center", paddingHorizontal: 8 },
});
