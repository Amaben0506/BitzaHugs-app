import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Animated, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isIpad = width >= 768;

const EMOTION_CARDS = [
  {
    id: "hungry",
    emoji: "🍽️",
    label: "Hungry",
    color: "#D99A3D",
    bg: "#FFF0DF",
    border: "#FFD9A0",
    response: {
      emoji: "🍎",
      title: "Let's get some food.",
      message: "It's okay to be hungry. Let's find something to eat together.",
      suggestion: "Try offering a snack or asking what sounds good.",
    },
  },
  {
    id: "hurt",
    emoji: "🩹",
    label: "Hurt",
    color: "#EF8F7D",
    bg: "#FFE6E4",
    border: "#FFBDB6",
    response: {
      emoji: "💜",
      title: "You're hurting.",
      message: "I see you. Let me help. Can you show me where it hurts?",
      suggestion: "Check for physical injury. Offer comfort and gentle touch if welcome.",
    },
  },
  {
    id: "scared",
    emoji: "😨",
    label: "Scared",
    color: "#4C9ED9",
    bg: "#E7F4FF",
    border: "#B8D9F5",
    response: {
      emoji: "🤗",
      title: "You're safe.",
      message: "I'm right here. Nothing will hurt you. You are safe.",
      suggestion: "Stay close. Lower your voice. Remove any overwhelming stimuli.",
    },
  },
  {
    id: "quiet",
    emoji: "🤫",
    label: "Need Quiet",
    color: "#6F42D8",
    bg: "#F0E2FF",
    border: "#D4B8F5",
    response: {
      emoji: "🌙",
      title: "Let's find quiet.",
      message: "Quiet is okay. We can find a calm, soft space together.",
      suggestion: "Move to a quieter room. Reduce sound and light. Give space.",
    },
  },
  {
    id: "pressure",
    emoji: "🫂",
    label: "Need a Hug",
    color: "#EF8F7D",
    bg: "#FFE6E4",
    border: "#FFBDB6",
    response: {
      emoji: "💜",
      title: "Hugs are coming.",
      message: "I'm here. A big warm hug is ready whenever you want it.",
      suggestion: "Offer a hug, weighted blanket, or gentle pressure if they seek it.",
    },
  },
  {
    id: "break",
    emoji: "⏸️",
    label: "Need a Break",
    color: "#78A866",
    bg: "#EEF7E8",
    border: "#B8E6A0",
    response: {
      emoji: "🌿",
      title: "Break time.",
      message: "Breaks are important. Let's stop for a moment. You don't have to do anything right now.",
      suggestion: "Pause all demands. Offer a quiet activity or just sit together.",
    },
  },
  {
    id: "loud",
    emoji: "🔊",
    label: "Too Loud",
    color: "#D99A3D",
    bg: "#FFF0DF",
    border: "#FFD9A0",
    response: {
      emoji: "🎧",
      title: "Let's make it quieter.",
      message: "That sound is too much. Let's find somewhere quieter or get your headphones.",
      suggestion: "Offer noise-canceling headphones. Move away from the noise source.",
    },
  },
  {
    id: "mad",
    emoji: "😤",
    label: "Mad",
    color: "#EF8F7D",
    bg: "#FFE6E4",
    border: "#FFBDB6",
    response: {
      emoji: "💜",
      title: "Big feelings are okay.",
      message: "It's okay to feel mad. Your feelings make sense. I'm not going anywhere.",
      suggestion: "Don't try to fix it. Stay calm. Lower demands. Give space to feel.",
    },
  },
  {
    id: "sad",
    emoji: "😢",
    label: "Sad",
    color: "#4C9ED9",
    bg: "#E7F4FF",
    border: "#B8D9F5",
    response: {
      emoji: "🤍",
      title: "Sad is okay.",
      message: "It's okay to feel sad. I love you even when things feel hard.",
      suggestion: "Sit close. Don't try to cheer them up. Just be present with them.",
    },
  },
  {
    id: "needparent",
    emoji: "👨‍👩‍👧",
    label: "Need Mom/Dad",
    color: "#6F42D8",
    bg: "#F0E2FF",
    border: "#D4B8F5",
    response: {
      emoji: "💜",
      title: "I'm right here.",
      message: "I'm here. I'm not going anywhere. You have me.",
      suggestion: "Make eye contact. Get down to their level. Stay close.",
    },
  },
];

export default function ShowMeScreen({ navigation }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const responseAnim = useRef(new Animated.Value(0)).current;
  const cardScales = useRef(EMOTION_CARDS.map(() => new Animated.Value(1))).current;

  const handleCardPress = (card, index) => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(cardScales[index], { toValue: 0.93, duration: 100, useNativeDriver: true }),
      Animated.timing(cardScales[index], { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    setSelectedCard(card);

    // Fade in response
    responseAnim.setValue(0);
    Animated.timing(responseAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(responseAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedCard(null));
  };

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color="#2B2463" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Show Me</Text>
          <Text style={s.headerSub}>How are you feeling?</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Response overlay */}
      {selectedCard && (
        <Animated.View style={[s.responseCard, { opacity: responseAnim, backgroundColor: selectedCard.bg, borderColor: selectedCard.border }]}>
          <View style={s.responseTop}>
            <Text style={s.responseEmoji}>{selectedCard.response.emoji}</Text>
            <View style={s.responseTextWrap}>
              <Text style={[s.responseTitle, { color: selectedCard.color }]}>{selectedCard.response.title}</Text>
              <Text style={s.responseMessage}>{selectedCard.response.message}</Text>
            </View>
            <TouchableOpacity style={s.responseClose} onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name="close" size={16} color="#837E96" />
            </TouchableOpacity>
          </View>
          <View style={[s.responseTip, { borderTopColor: selectedCard.border }]}>
            <Ionicons name="bulb-outline" size={13} color={selectedCard.color} />
            <Text style={[s.responseTipText, { color: selectedCard.color }]}>{selectedCard.response.suggestion}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Intro */}
        {!selectedCard && (
          <View style={s.introCard}>
            <Text style={s.introEmoji}>👆</Text>
            <Text style={s.introText}>
              Tap a card to show how you feel.
            </Text>
          </View>
        )}

        {/* Emotion Cards Grid */}
        <View style={s.grid}>
          {EMOTION_CARDS.map((card, index) => (
            <Animated.View
              key={card.id}
              style={[
                s.cardWrap,
                { transform: [{ scale: cardScales[index] }] },
                selectedCard?.id === card.id && { borderWidth: 3, borderColor: card.color },
              ]}
            >
              <TouchableOpacity
                style={[s.card, { backgroundColor: card.bg }]}
                onPress={() => handleCardPress(card, index)}
                activeOpacity={0.85}
              >
                <Text style={s.cardEmoji}>{card.emoji}</Text>
                <Text style={[s.cardLabel, { color: card.color }]}>{card.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Footer note */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            💜 Every feeling is valid. You're doing great by asking.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_SIZE = (width - 48) / 2;

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 12, backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#EFE4DC",
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  headerCenter: { alignItems: "center" },
  headerTitle: { color: "#2B2463", fontSize: 18, fontWeight: "900" },
  headerSub: { color: "#837E96", fontSize: 11, fontWeight: "600", marginTop: 1 },

  responseCard: {
    marginHorizontal: 16, marginTop: 12, borderRadius: 18,
    borderWidth: 1.5, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 3,
  },
  responseTop: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  responseEmoji: { fontSize: 36 },
  responseTextWrap: { flex: 1 },
  responseTitle: { fontSize: 16, fontWeight: "900", marginBottom: 4 },
  responseMessage: { color: "#2B2463", fontSize: 13, fontWeight: "600", lineHeight: 19 },
  responseClose: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(0,0,0,0.07)", alignItems: "center", justifyContent: "center" },
  responseTip: { flexDirection: "row", alignItems: "flex-start", gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  responseTipText: { flex: 1, fontSize: 11, fontWeight: "700", lineHeight: 16 },

  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },

  introCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F6ECFF", borderRadius: 14, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  introEmoji: { fontSize: 22 },
  introText: { flex: 1, color: "#6F42D8", fontSize: 13, fontWeight: "700" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  cardWrap: { width: isIpad ? (width - 64) / 3 : CARD_SIZE, borderRadius: 20, overflow: "hidden" },
  card: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  cardEmoji: { fontSize: isIpad ? 64 : 52 },
  cardLabel: { fontSize: isIpad ? 18 : 15, fontWeight: "900", textAlign: "center" },

  footer: { marginTop: 20, alignItems: "center" },
  footerText: { color: "#837E96", fontSize: 12, fontWeight: "600", textAlign: "center", lineHeight: 18 },
});