import React, { useState } from "react";
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
import { Feather } from "@expo/vector-icons";

const affirmations = [
  { text: "I am not failing. I am having a hard moment, and I can take one small step.", tag: "Hard moment" },
  { text: "My child's big feelings do not mean I am a bad parent.", tag: "Parent guilt" },
  { text: "I can pause before I react. Softness is still strength.", tag: "Regulation" },
  { text: "I do not have to fix the whole day. I can help this moment feel safer.", tag: "Overwhelm" },
  { text: "Routines can bend. Progress does not have to look perfect.", tag: "Routine" },
  { text: "My needs matter too. I am allowed to need support.", tag: "Self-support" },
  { text: "I can lower the pressure. I can choose calm over control.", tag: "Meltdown support" },
  { text: "One breath. One choice. One tiny step.", tag: "Grounding" },
  { text: "I am doing the best I can with what I have right now. That is enough.", tag: "Self-compassion" },
  { text: "Hard days do not erase all the good I have done. I am still showing up.", tag: "Hard day" },
  { text: "My child needs connection more than correction right now.", tag: "Connection" },
  { text: "I am allowed to feel tired. Rest is not failure.", tag: "Burnout" },
  { text: "Every time I repair after a hard moment, I am teaching my child something powerful.", tag: "Repair" },
  { text: "I do not have to be calm perfectly. I just have to keep trying.", tag: "Regulation" },
  { text: "This moment will pass. I can ride it out without making it worse.", tag: "Waiting it out" },
  { text: "Asking for help is one of the bravest things a caregiver can do.", tag: "Asking for help" },
  { text: "I am not alone in this. Other parents are in the trenches too.", tag: "Community" },
  { text: "My child is not giving me a hard time. They are having a hard time.", tag: "Perspective" },
  { text: "I can set a boundary with love. Firm and gentle can coexist.", tag: "Boundaries" },
  { text: "Survival mode is still mode. I am still here.", tag: "Hard season" },
  { text: "I am allowed to grieve the hard parts while still loving my child fiercely.", tag: "Grief" },
  { text: "Small wins count. Getting through the day is a win.", tag: "Small wins" },
  { text: "I know my child better than anyone. I can trust my instincts.", tag: "Trust yourself" },
];

export default function AffirmationsScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = affirmations[currentIndex];

  const nextAffirmation = () => setCurrentIndex((i) => (i < affirmations.length - 1 ? i + 1 : 0));
  const previousAffirmation = () => setCurrentIndex((i) => (i > 0 ? i - 1 : affirmations.length - 1));
  const randomAffirmation = () => {
    let next;
    do { next = Math.floor(Math.random() * affirmations.length); } while (next === currentIndex);
    setCurrentIndex(next);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Encouragement</Text>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
            <Feather name="heart" size={18} color="#2B2463" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require("../assets/icons/support-positive-reminder.png")} style={styles.heroIcon} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>A softer voice for hard moments.</Text>
            <Text style={styles.heroText}>Read one reminder. Breathe. Let it be enough for right now.</Text>
          </View>
        </View>

        {/* Main Affirmation Card */}
        <View style={styles.affirmationCard}>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>{current.tag}</Text>
          </View>

          <Image source={require("../assets/icons/decor-little-purple-heart.png")} style={styles.cardHeart} resizeMode="contain" />

          <Text style={styles.affirmationText}>{current.text}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.counterText}>{currentIndex + 1} of {affirmations.length}</Text>
            <View style={styles.dotsWrap}>
              {affirmations.map((_, index) => (
                <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
              ))}
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={previousAffirmation} activeOpacity={0.85}>
            <Feather name="chevron-left" size={18} color="#6F42D8" />
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={nextAffirmation} activeOpacity={0.9}>
            <Text style={styles.primaryButtonText}>Next</Text>
            <Feather name="chevron-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.randomButton} onPress={randomAffirmation} activeOpacity={0.85}>
            <Feather name="shuffle" size={18} color="#6F42D8" />
          </TouchableOpacity>
        </View>

        {/* All Affirmations List */}
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>All reminders</Text>
          {affirmations.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.listRow, index === affirmations.length - 1 && styles.listRowLast, currentIndex === index && styles.listRowActive]}
              onPress={() => setCurrentIndex(index)}
              activeOpacity={0.85}
            >
              <View style={[styles.listNumber, currentIndex === index && styles.listNumberActive]}>
                <Text style={[styles.listNumberText, currentIndex === index && styles.listNumberTextActive]}>{index + 1}</Text>
              </View>
              <View style={styles.listTextWrap}>
                <Text style={[styles.listItemTag, currentIndex === index && styles.listItemTagActive]}>{item.tag}</Text>
                <Text style={styles.listItemText} numberOfLines={2}>{item.text}</Text>
              </View>
              {currentIndex === index && <Feather name="check" size={14} color="#6F42D8" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tools */}
        <View style={styles.toolsCard}>
          <Text style={styles.toolsTitle}>Need more support?</Text>
          {[
            { label: "Talk to Hugi", icon: "message-circle", bg: "#F0E2FF", color: "#6F42D8", route: "HugiChat" },
            { label: "Try a breathing exercise", icon: "wind", bg: "#E7F4FF", color: "#4C9ED9", route: "Breathing" },
            { label: "Write this feeling out", icon: "edit-3", bg: "#FFE3DA", color: "#EF8F7D", route: "CalmJournal" },
          ].map((tool, i, arr) => (
            <TouchableOpacity
              key={tool.label}
              style={[styles.toolRow, i === arr.length - 1 && styles.toolRowLast]}
              onPress={() => navigation.navigate(tool.route)}
              activeOpacity={0.85}
            >
              <View style={[styles.toolIconBubble, { backgroundColor: tool.bg }]}>
                <Feather name={tool.icon} size={18} color={tool.color} />
              </View>
              <Text style={styles.toolRowText}>{tool.label}</Text>
              <Feather name="chevron-right" size={17} color="#2B2463" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>You deserve support in the middle of the hard stuff too.</Text>
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

  topBar: { height: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  circleButton: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8",
  },
  topTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  heroCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center",
    marginBottom: 12, shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  heroIcon: { width: 52, height: 52, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  affirmationCard: {
    minHeight: 260, backgroundColor: "#F6ECFF", borderRadius: 24, borderWidth: 1,
    borderColor: "#E3D2F8", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 44,
    marginBottom: 12, alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  tagPill: {
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 11, paddingVertical: 5,
    position: "absolute", top: 14, left: 14,
  },
  tagText: { color: "#6F42D8", fontSize: 11, fontWeight: "800" },
  cardHeart: { width: 52, height: 52, marginBottom: 14 },
  affirmationText: { color: "#2B2463", fontSize: 19, lineHeight: 27, fontWeight: "800", textAlign: "center", letterSpacing: -0.3 },
  cardFooter: {
    position: "absolute", bottom: 13, left: 16, right: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  counterText: { color: "#837E96", fontSize: 11, fontWeight: "700" },
  dotsWrap: { flexDirection: "row", gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#D8C8EE" },
  dotActive: { width: 12, backgroundColor: "#8B5BE8" },

  buttonRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  secondaryButton: {
    flex: 1, height: 46, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1,
    borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
  },
  secondaryButtonText: { color: "#6F42D8", fontSize: 13, fontWeight: "800" },
  primaryButton: {
    flex: 1.2, height: 46, borderRadius: 14, backgroundColor: "#8B5BE8",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  randomButton: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: "#F0E2FF",
    borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center",
  },

  listCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  listTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  listRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 6,
    borderBottomWidth: 1, borderBottomColor: "#F0E8E2", borderRadius: 10, gap: 9,
  },
  listRowLast: { borderBottomWidth: 0 },
  listRowActive: { backgroundColor: "#F6ECFF" },
  listNumber: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: "#F0E8E2",
    alignItems: "center", justifyContent: "center",
  },
  listNumberActive: { backgroundColor: "#8B5BE8" },
  listNumberText: { color: "#837E96", fontSize: 10, fontWeight: "800" },
  listNumberTextActive: { color: "#FFFFFF" },
  listTextWrap: { flex: 1 },
  listItemTag: { color: "#837E96", fontSize: 10, fontWeight: "700", marginBottom: 1 },
  listItemTagActive: { color: "#6F42D8" },
  listItemText: { color: "#2B2463", fontSize: 11, lineHeight: 15, fontWeight: "600" },

  toolsCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12,
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  toolsTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 8 },
  toolRow: {
    minHeight: 46, flexDirection: "row", alignItems: "center",
    borderBottomWidth: 1, borderBottomColor: "#F0E8E2", gap: 10,
  },
  toolRowLast: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10 },
  toolIconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toolRowText: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "700" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});