import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// ─── Room Definitions ─────────────────────────────────────────────────────────
const ROOMS = [
  { id: "morning", label: "Morning Routines", icon: "sunrise", color: "#D99A3D", bg: "#FFF0DF", desc: "Share what's working (and what isn't) to start the day." },
  { id: "meltdown", label: "Meltdown Support", icon: "heart", color: "#EF8F7D", bg: "#FFE6E4", desc: "A safe space to talk through hard moments, no judgment." },
  { id: "autism", label: "Autism Parenting", icon: "users", color: "#6F42D8", bg: "#F0E2FF", desc: "Lived experience, tips, and understanding from other parents." },
  { id: "burnout", label: "Caregiver Burnout", icon: "battery", color: "#4C9ED9", bg: "#E7F4FF", desc: "You matter too. Talk about exhaustion, rest, and recovery." },
  { id: "school", label: "School & IEP Support", icon: "book-open", color: "#78A866", bg: "#EEF7E8", desc: "Navigate meetings, accommodations, and advocacy together." },
  { id: "wins", label: "Wins of the Day", icon: "star", color: "#D99A3D", bg: "#FFF0DF", desc: "Celebrate small and big victories — they all count here." },
  { id: "encouragement", label: "Gentle Encouragement", icon: "sun", color: "#EF8F7D", bg: "#FFE6E4", desc: "Kind words, soft reminders, and you-are-not-alone moments." },
  { id: "sensory", label: "Sensory Needs", icon: "volume-2", color: "#4C9ED9", bg: "#E7F4FF", desc: "Discuss tools, strategies, and what helps your child feel safe." },
];

// ─── Sample Messages per room (prototype) ────────────────────────────────────
const SAMPLE_MESSAGES = {
  morning: [
    { id: "1", author: "MandyMom", time: "7:42 AM", text: "Visual schedules changed everything for us. He knows what's coming and the meltdowns before school dropped so much.", liked: 8, isOwn: false },
    { id: "2", author: "DadOfTwo", time: "8:01 AM", text: "We do a 10-minute warning now before every transition. Game changer.", liked: 5, isOwn: false },
    { id: "3", author: "CaregiverSue", time: "8:15 AM", text: "Some mornings are just hard and that's okay. We survive them.", liked: 12, isOwn: false },
  ],
  meltdown: [
    { id: "1", author: "TiredButTrying", time: "Yesterday", text: "Had the hardest afternoon. Just needed somewhere to say that out loud.", liked: 14, isOwn: false },
    { id: "2", author: "MandyMom", time: "Yesterday", text: "You're not alone. Those afternoons are real and they're hard. Sending you strength 💜", liked: 9, isOwn: false },
    { id: "3", author: "DadOfTwo", time: "Yesterday", text: "We keep a calm-down kit ready. It doesn't prevent everything but it helps.", liked: 6, isOwn: false },
  ],
  wins: [
    { id: "1", author: "ProudMama", time: "Today", text: "He said 'I need a break' instead of melting down today. HUGE. 🎉", liked: 22, isOwn: false },
    { id: "2", author: "CaregiverSue", time: "Today", text: "We got through the whole morning routine without one argument. First time in weeks.", liked: 17, isOwn: false },
    { id: "3", author: "TiredButTrying", time: "Today", text: "She tried a new food. A tiny bite. But she tried.", liked: 19, isOwn: false },
  ],
};

const getMessages = (roomId) => SAMPLE_MESSAGES[roomId] || [
  { id: "1", author: "BitzaHugs", time: "Recently", text: "Welcome to this room. This is a safe, moderated space. Be kind, be real, be you. 💜", liked: 0, isOwn: false },
];

// ─── Community Guidelines ─────────────────────────────────────────────────────
const GUIDELINES = [
  "Be kind and supportive — no judgment here.",
  "No medical diagnosis claims or treatment advice.",
  "Respect privacy — don't share others' personal info.",
  "No bullying, shaming, or dismissive comments.",
  "This is peer support, not professional care.",
  "Use the report button if something feels unsafe.",
];

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onLike, onReport }) {
  return (
    <View style={[styles.bubble, msg.isOwn && styles.bubbleOwn]}>
      {!msg.isOwn && (
        <View style={styles.bubbleHeader}>
          <View style={styles.avatarDot} />
          <Text style={styles.bubbleAuthor}>{msg.author}</Text>
          <Text style={styles.bubbleTime}>{msg.time}</Text>
        </View>
      )}
      <Text style={[styles.bubbleText, msg.isOwn && styles.bubbleTextOwn]}>{msg.text}</Text>
      <View style={[styles.bubbleFooter, msg.isOwn && { justifyContent: "flex-end" }]}>
        <TouchableOpacity style={styles.likeBtn} onPress={() => onLike(msg.id)} activeOpacity={0.8}>
          <Ionicons name="heart-outline" size={13} color={msg.isOwn ? "rgba(255,255,255,0.7)" : "#EF8F7D"} />
          {msg.liked > 0 && <Text style={[styles.likeCount, msg.isOwn && { color: "rgba(255,255,255,0.8)" }]}>{msg.liked}</Text>}
        </TouchableOpacity>
        {!msg.isOwn && (
          <TouchableOpacity style={styles.reportBtn} onPress={() => onReport(msg.id)} activeOpacity={0.8}>
            <Feather name="flag" size={11} color="#C0BAD4" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Room Screen ──────────────────────────────────────────────────────────────
function RoomScreen({ room, onBack }) {
  const [messages, setMessages] = useState(getMessages(room.id));
  const [input, setInput] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      author: "You",
      time: "Just now",
      text: trimmed,
      liked: 0,
      isOwn: true,
    }]);
    setInput("");
  };

  const handleLike = (id) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, liked: m.liked + 1 } : m));
  };

  const handleReport = (id) => {
    Alert.alert(
      "Report Message",
      "Thank you for helping keep this space safe. This message will be reviewed by a moderator.",
      [{ text: "Report", style: "destructive", onPress: () => {} }, { text: "Cancel", style: "cancel" }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: room.bg }]}>
      {/* Room Header */}
      <View style={styles.roomHeader}>
        <TouchableOpacity style={styles.roomBackBtn} onPress={onBack} activeOpacity={0.85}>
          <Feather name="chevron-left" size={22} color="#2B2463" />
        </TouchableOpacity>
        <View style={styles.roomTitleWrap}>
          <Text style={styles.roomTitle}>{room.label}</Text>
          <Text style={styles.roomOnline}>🟢 Moderated · Safe space</Text>
        </View>
        <TouchableOpacity style={styles.roomGuidelinesBtn} onPress={() => setShowGuidelines(true)} activeOpacity={0.85}>
          <Feather name="info" size={18} color="#2B2463" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesArea} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
        <View style={styles.roomWelcomeBanner}>
          <Text style={styles.roomWelcomeText}>Welcome to <Text style={{ fontWeight: "800" }}>{room.label}</Text>. {room.desc}</Text>
        </View>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onLike={handleLike} onReport={handleReport} />
        ))}
        <View style={styles.safetyNote}>
          <Feather name="shield" size={12} color="#837E96" />
          <Text style={styles.safetyNoteText}>This is peer support, not professional care. In an emergency, contact emergency services.</Text>
        </View>
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.messageInput}
          value={input}
          onChangeText={setInput}
          placeholder="Share something kind..."
          placeholderTextColor="#A8A0A5"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          activeOpacity={0.88}
          disabled={!input.trim()}
        >
          <Feather name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Guidelines Modal */}
      <Modal visible={showGuidelines} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Community Guidelines</Text>
              <TouchableOpacity onPress={() => setShowGuidelines(false)} style={styles.modalClose}>
                <Feather name="x" size={18} color="#2B2463" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={styles.guidelinesIntro}>
                BitzaHugs Community is a safe, moderated space for caregivers. Please read and respect these guidelines.
              </Text>
              {GUIDELINES.map((g, i) => (
                <View key={i} style={styles.guidelineRow}>
                  <View style={styles.guidelineNumber}>
                    <Text style={styles.guidelineNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.guidelineText}>{g}</Text>
                </View>
              ))}
              <View style={styles.guidelinesDivider} />
              <Text style={styles.guidelinesFooter}>
                Violations may result in message removal or account suspension. Report concerns using the flag icon on any message.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Main Community Screen ────────────────────────────────────────────────────
export default function CommunityScreen({ navigation }) {
  const [activeRoom, setActiveRoom] = useState(null);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const check = async () => {
        const agreed = await AsyncStorage.getItem("bitzaCommunityAgreed");
        if (agreed) setAgreedToGuidelines(true);
      };
      check();
    }, [])
  );

  const handleJoin = async () => {
    await AsyncStorage.setItem("bitzaCommunityAgreed", "true");
    setAgreedToGuidelines(true);
    setShowJoinModal(false);
  };

  if (activeRoom) {
    return <RoomScreen room={activeRoom} onBack={() => setActiveRoom(null)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.screenTitle}>Community</Text>
            <Text style={styles.screenSubtitle}>You are not alone in this.</Text>
          </View>
          <View style={styles.premiumBadge}>
            <Ionicons name="sparkles" size={11} color="#7548D8" />
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="people" size={28} color="#6F42D8" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>A community that gets it.</Text>
            <Text style={styles.heroText}>
              Connect with other caregivers who understand the hard days, the wins, and everything in between.
            </Text>
          </View>
        </View>

        {/* Safety Banner */}
        <View style={styles.safetyBanner}>
          <Feather name="shield" size={16} color="#6F42D8" />
          <View style={styles.safetyBannerText}>
            <Text style={styles.safetyBannerTitle}>Moderated & Safe</Text>
            <Text style={styles.safetyBannerSub}>All rooms are monitored. Report + block available on every message.</Text>
          </View>
          <TouchableOpacity onPress={() => setShowJoinModal(true)} activeOpacity={0.85}>
            <Text style={styles.guidelinesLink}>Guidelines ›</Text>
          </TouchableOpacity>
        </View>

        {/* Join Banner (if not agreed) */}
        {!agreedToGuidelines && (
          <TouchableOpacity style={styles.joinBanner} onPress={() => setShowJoinModal(true)} activeOpacity={0.88}>
            <Ionicons name="hand-left-outline" size={20} color="#6F42D8" />
            <View style={styles.joinBannerText}>
              <Text style={styles.joinBannerTitle}>Agree to community guidelines to join</Text>
              <Text style={styles.joinBannerSub}>Takes 30 seconds — keeps everyone safe.</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#6F42D8" />
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#F0E2FF" }]}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#EEF7E8" }]}>
            <Text style={styles.statNumber}>247</Text>
            <Text style={styles.statLabel}>Caregivers</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFE6E4" }]}>
            <Text style={styles.statNumber}>1.2k</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
        </View>

        {/* Rooms */}
        <Text style={styles.roomsTitle}>Choose a room</Text>
        {ROOMS.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[styles.roomCard, { borderLeftColor: room.color, borderLeftWidth: 3 }]}
            onPress={() => {
              if (!agreedToGuidelines) {
                setShowJoinModal(true);
              } else {
                setActiveRoom(room);
              }
            }}
            activeOpacity={0.86}
          >
            <View style={[styles.roomIconBubble, { backgroundColor: room.bg }]}>
              <Feather name={room.icon} size={20} color={room.color} />
            </View>
            <View style={styles.roomTextWrap}>
              <Text style={styles.roomCardTitle}>{room.label}</Text>
              <Text style={styles.roomCardDesc}>{room.desc}</Text>
            </View>
            <View style={styles.roomChevronWrap}>
              <Feather name="chevron-right" size={16} color="#2B2463" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons name="heart-outline" size={18} color="#6F42D8" />
          <Text style={styles.reminderText}>
            This is peer support from other caregivers — not professional advice, therapy, or emergency care.
          </Text>
        </View>

      </ScrollView>

      {/* Guidelines / Join Modal */}
      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Community Guidelines</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)} style={styles.modalClose}>
                <Feather name="x" size={18} color="#2B2463" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 8 }}>
              <Text style={styles.guidelinesIntro}>
                BitzaHugs Community is a moderated, safe space for caregivers. By joining you agree to:
              </Text>
              {GUIDELINES.map((g, i) => (
                <View key={i} style={styles.guidelineRow}>
                  <View style={styles.guidelineNumber}>
                    <Text style={styles.guidelineNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.guidelineText}>{g}</Text>
                </View>
              ))}
              <View style={styles.guidelinesDivider} />
              <Text style={styles.guidelinesFooter}>
                Violations may result in message removal or account suspension.
              </Text>
            </ScrollView>
            <View style={{ paddingHorizontal: 16, paddingBottom: Platform.OS === "ios" ? 32 : 20 }}>
              <TouchableOpacity style={styles.agreeButton} onPress={handleJoin} activeOpacity={0.9}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.agreeButtonText}>I Agree — Join the Community</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  headerCenter: { flex: 1 },
  screenTitle: { color: "#2B2463", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  screenSubtitle: { color: "#5B5672", fontSize: 11, fontWeight: "600", marginTop: 1 },
  premiumBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F0E2FF", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: "#D8C3F7" },
  premiumBadgeText: { color: "#7548D8", fontSize: 11, fontWeight: "800" },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 12, flexDirection: "row", alignItems: "center", marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  heroIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  safetyBanner: { backgroundColor: "#F0E2FF", borderRadius: 14, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 12, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 },
  safetyBannerText: { flex: 1 },
  safetyBannerTitle: { color: "#2B2463", fontSize: 12, fontWeight: "800", marginBottom: 1 },
  safetyBannerSub: { color: "#5B5672", fontSize: 10, fontWeight: "600" },
  guidelinesLink: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },

  joinBanner: { backgroundColor: "#FFF9F2", borderRadius: 14, borderWidth: 1.5, borderColor: "#8B5BE8", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  joinBannerText: { flex: 1 },
  joinBannerTitle: { color: "#2B2463", fontSize: 12, fontWeight: "800", marginBottom: 1 },
  joinBannerSub: { color: "#5B5672", fontSize: 10, fontWeight: "600" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: "center" },
  statNumber: { color: "#2B2463", fontSize: 18, fontWeight: "800", marginBottom: 2 },
  statLabel: { color: "#5B5672", fontSize: 10, fontWeight: "600" },

  roomsTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 8 },
  roomCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", marginBottom: 9, shadowColor: "#BFA99D", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 6, elevation: 1 },
  roomIconBubble: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 11 },
  roomTextWrap: { flex: 1 },
  roomCardTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  roomCardDesc: { color: "#837E96", fontSize: 11, lineHeight: 15, fontWeight: "600" },
  roomChevronWrap: { paddingLeft: 6 },

  reminderCard: { backgroundColor: "#F6ECFF", borderRadius: 14, borderWidth: 1, borderColor: "#E3D2F8", padding: 12, flexDirection: "row", alignItems: "center", gap: 9, marginTop: 4 },
  reminderText: { flex: 1, color: "#2B2463", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  // Room Screen
  roomHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: Platform.OS === "ios" ? 4 : 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  roomBackBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center", marginRight: 10 },
  roomTitleWrap: { flex: 1 },
  roomTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800" },
  roomOnline: { color: "#5B5672", fontSize: 10, fontWeight: "600", marginTop: 1 },
  roomGuidelinesBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center" },

  messagesArea: { flex: 1 },
  messagesContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 16 },
  roomWelcomeBanner: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 12, padding: 10, marginBottom: 14 },
  roomWelcomeText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },

  bubble: { backgroundColor: "#FFFFFF", borderRadius: 16, borderTopLeftRadius: 4, padding: 11, marginBottom: 10, maxWidth: "88%", alignSelf: "flex-start", shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: "#EFE4DC" },
  bubbleOwn: { backgroundColor: "#6F42D8", borderRadius: 16, borderTopRightRadius: 4, alignSelf: "flex-end" },
  bubbleHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  avatarDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D8B9F7" },
  bubbleAuthor: { color: "#6F42D8", fontSize: 11, fontWeight: "800" },
  bubbleTime: { color: "#A0A0A0", fontSize: 10, fontWeight: "600" },
  bubbleText: { color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "600" },
  bubbleTextOwn: { color: "#FFFFFF" },
  bubbleFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7 },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeCount: { color: "#EF8F7D", fontSize: 11, fontWeight: "700" },
  reportBtn: { padding: 3 },

  safetyNote: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#F5F5F5", borderRadius: 10, padding: 9, marginTop: 4 },
  safetyNoteText: { flex: 1, color: "#837E96", fontSize: 10, lineHeight: 14, fontWeight: "600" },

  inputArea: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 14, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 24 : 12, backgroundColor: "#FFFDF9", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", gap: 9 },
  messageInput: { flex: 1, maxHeight: 90, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 10, color: "#2B2463", fontSize: 13, fontWeight: "600" },
  sendBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#6F42D8", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#C9B8E8" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFFDF9", borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EFE4DC" },
  modalTitle: { color: "#2B2463", fontSize: 16, fontWeight: "800" },
  modalClose: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  guidelinesIntro: { color: "#5B5672", fontSize: 12, lineHeight: 18, fontWeight: "600", marginBottom: 14 },
  guidelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  guidelineNumber: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  guidelineNumberText: { color: "#6F42D8", fontSize: 10, fontWeight: "800" },
  guidelineText: { flex: 1, color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  guidelinesDivider: { height: 1, backgroundColor: "#EFE4DC", marginVertical: 12 },
  guidelinesFooter: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600" },
  agreeButton: { height: 50, borderRadius: 16, backgroundColor: "#6F42D8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  agreeButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});