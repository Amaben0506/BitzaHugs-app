import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection, addDoc, onSnapshot, query,
  orderBy, serverTimestamp, limit, doc, updateDoc, increment,
} from "firebase/firestore";
import { db, auth, signInUser } from "../src/lib/firebase";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../src/ThemeContext";

const ROOMS = [
  { id: "morning", label: "Morning Routines", emoji: "🌅", color: "#D99A3D", bg: "#FFF0DF", border: "#FFD99A", desc: "Share what's working (and what isn't) to start the day." },
  { id: "meltdown", label: "Meltdown Support", emoji: "💜", color: "#EF8F7D", bg: "#FFE6E4", border: "#FFB8B0", desc: "A safe space to talk through hard moments, no judgment." },
  { id: "autism", label: "Autism Parenting", emoji: "🧩", color: "#6F42D8", bg: "#F0E2FF", border: "#D8B9F7", desc: "Lived experience, tips, and understanding from other parents." },
  { id: "burnout", label: "Caregiver Burnout", emoji: "🔋", color: "#4C9ED9", bg: "#E7F4FF", border: "#A8D4F5", desc: "You matter too. Talk about exhaustion, rest, and recovery." },
  { id: "school", label: "School & IEP Support", emoji: "📚", color: "#78A866", bg: "#EEF7E8", border: "#B8DFA8", desc: "Navigate meetings, accommodations, and advocacy together." },
  { id: "wins", label: "Wins of the Day", emoji: "🎉", color: "#D99A3D", bg: "#FFF0DF", border: "#FFD99A", desc: "Celebrate small and big victories — they all count here." },
  { id: "encouragement", label: "Gentle Encouragement", emoji: "🌸", color: "#EF8F7D", bg: "#FFE6E4", border: "#FFB8B0", desc: "Kind words, soft reminders, and you-are-not-alone moments." },
  { id: "sensory", label: "Sensory Needs", emoji: "🎧", color: "#4C9ED9", bg: "#E7F4FF", border: "#A8D4F5", desc: "Discuss tools, strategies, and what helps your child feel safe." },
];

const GUIDELINES = [
  "Be kind and supportive — no judgment here.",
  "No medical diagnosis claims or treatment advice.",
  "Respect privacy — don't share others' personal info.",
  "No bullying, shaming, or dismissive comments.",
  "This is peer support, not professional care.",
];

const USERNAME_KEY = "bitzaCommunityUsername";

function getInitials(name) { return name?.slice(0, 2).toUpperCase() || "??"; }

function formatTime(timestamp) {
  try {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  } catch (e) {
    return "";
  }
}

function MessageBubble({ msg, currentUserId, onLike, onReport, theme }) {
  const isOwn = msg.userId && currentUserId && msg.userId === currentUserId;
  return (
    <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
      {!isOwn && (
        <View style={[styles.avatarCircle, { backgroundColor: theme.accentLight }]}>
          <Text style={[styles.avatarText, { color: theme.accent }]}>{getInitials(msg.username)}</Text>
        </View>
      )}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : [styles.bubbleOther, { backgroundColor: theme.card, borderColor: theme.border }]]}>
        {!isOwn && <Text style={[styles.bubbleUsername, { color: theme.accent }]}>{msg.username}</Text>}
        <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn, !isOwn && { color: theme.textPrimary }]}>{msg.text}</Text>
        <View style={styles.bubbleFooter}>
          <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn, !isOwn && { color: theme.textMuted }]}>{formatTime(msg.createdAt)}</Text>
          {!isOwn && (
            <View style={styles.bubbleActions}>
              <TouchableOpacity onPress={() => onLike(msg.id)} style={styles.likeBtn} activeOpacity={0.7}>
                <Feather name="heart" size={12} color={msg.liked > 0 ? "#EF8F7D" : theme.textMuted} />
                {msg.liked > 0 && <Text style={styles.likeCount}>{msg.liked}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onReport(msg)} style={styles.reportBtn} activeOpacity={0.7}>
                <Feather name="flag" size={11} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function CommunityScreen({ navigation }) {
  const theme = useTheme();
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useFocusEffect(useCallback(() => {
    const init = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem(USERNAME_KEY);
        if (savedUsername) setUsername(savedUsername);
        if (!auth.currentUser) { const user = await signInUser(); if (user) setUserId(user.uid); }
        else setUserId(auth.currentUser.uid);
      } catch (e) { console.log("Init error:", e); }
    };
    init();
  }, []));

  useEffect(() => {
    if (!activeRoom) return;
    setIsLoading(true); setMessages([]);
    const q = query(collection(db, "rooms", activeRoom.id, "messages"), orderBy("createdAt", "asc"), limit(50));
    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs); setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, (error) => { console.log("Snapshot error:", error); setIsLoading(false); });
    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, [activeRoom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    if (!username) { setShowUsernameModal(true); return; }
    // Ensure we have a userId before sending
    let senderId = userId;
    if (!senderId) {
      const user = await signInUser();
      if (user) { setUserId(user.uid); senderId = user.uid; }
    }
    setIsSending(true); setInput("");
    try {
      await addDoc(collection(db, "rooms", activeRoom.id, "messages"), { text: trimmed, username, userId: senderId || "anonymous", createdAt: serverTimestamp(), liked: 0 });
    } catch (e) { console.log("Send error:", e); Alert.alert("Couldn't send", "Something went wrong. Please try again."); setInput(trimmed); }
    finally { setIsSending(false); }
  };

  const handleLike = async (messageId) => {
    try { const msgRef = doc(db, "rooms", activeRoom.id, "messages", messageId); await updateDoc(msgRef, { liked: increment(1) }); }
    catch (e) { console.log("Like error:", e); }
  };

  const handleReport = (msg) => {
    Alert.alert("Report message?", "Thank you for helping keep BitzaHugs safe. This message will be reviewed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Report", style: "destructive", onPress: () => Alert.alert("Reported", "Thank you. We'll review this message. 💜") },
    ]);
  };

  const handleSaveUsername = async () => {
    const trimmed = usernameInput.trim();
    if (!trimmed || trimmed.length < 2) { Alert.alert("Too short", "Please enter at least 2 characters."); return; }
    if (trimmed.length > 20) { Alert.alert("Too long", "Username must be 20 characters or less."); return; }
    await AsyncStorage.setItem(USERNAME_KEY, trimmed);
    setUsername(trimmed); setShowUsernameModal(false); setUsernameInput("");
  };

  const handleRoomPress = (room) => {
    if (!username) { setShowUsernameModal(true); return; }
    setActiveRoom(room);
  };

  const room = activeRoom ? ROOMS.find(r => r.id === activeRoom.id) : null;
  const s = makeStyles(theme);

  // ── ROOM CHAT VIEW ──
  if (activeRoom) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.chatHeader}>
          <TouchableOpacity style={s.chatBackBtn} onPress={() => setActiveRoom(null)} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={s.chatHeaderCenter}>
            <Text style={s.chatRoomEmoji}>{room?.emoji}</Text>
            <View>
              <Text style={s.chatRoomTitle}>{room?.label}</Text>
              <Text style={s.chatRoomSub}>Peer support community</Text>
            </View>
          </View>
          <TouchableOpacity style={s.chatBackBtn} onPress={() => setShowGuidelines(true)} activeOpacity={0.85}>
            <Feather name="info" size={18} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={s.safetyBanner}>
          <Feather name="shield" size={12} color={theme.accent} />
          <Text style={s.safetyText}>Peer support only. Not therapy or emergency care.</Text>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
          {isLoading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="small" color={theme.accent} />
              <Text style={s.loadingText}>Loading messages...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              contentContainerStyle={s.messagesList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={s.emptyChat}>
                  <Text style={s.emptyChatEmoji}>{room?.emoji}</Text>
                  <Text style={s.emptyChatTitle}>Be the first to share.</Text>
                  <Text style={s.emptyChatText}>This room is quiet. Start the conversation — someone needs to hear what you have to say. 💜</Text>
                </View>
              }
              renderItem={({ item }) => {
                try {
                  return <MessageBubble msg={item} currentUserId={userId} onLike={handleLike} onReport={handleReport} theme={theme} />;
                } catch (e) {
                  console.log("Message render error:", e);
                  return null;
                }
              }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}

          <View style={s.inputBar}>
            <View style={s.inputAvatarCircle}>
              <Text style={s.inputAvatarText}>{getInitials(username)}</Text>
            </View>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder="Share something kind..."
              placeholderTextColor={theme.textPlaceholder}
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[s.sendBtn, (!input.trim() || isSending) && s.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isSending}
              activeOpacity={0.88}
            >
              {isSending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Feather name="send" size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {showGuidelines && (
          <View style={s.modalOverlay}>
            <View style={s.guidelinesModal}>
              <Text style={s.guidelinesTitle}>Community Guidelines 💜</Text>
              {GUIDELINES.map((g, i) => (
                <View key={i} style={s.guidelineRow}>
                  <Text style={s.guidelineDot}>•</Text>
                  <Text style={s.guidelineText}>{g}</Text>
                </View>
              ))}
              <TouchableOpacity style={s.guidelinesCloseBtn} onPress={() => setShowGuidelines(false)} activeOpacity={0.88}>
                <Text style={s.guidelinesCloseBtnText}>Got it 💜</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ── ROOMS LIST VIEW ──
  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header with back button */}
<View style={s.headerRow}>
  <TouchableOpacity
    style={s.headerBackBtn}
    onPress={() =>
      navigation.navigate("MainTabs", {
        screen: "DrawerHome",
        params: {
          screen: "SupportTab",
        },
      })
    }
    activeOpacity={0.85}
  >
    <Feather name="chevron-left" size={22} color={theme.accent} />
  </TouchableOpacity>

  <View style={{ flex: 1 }}>
    <Text style={s.headerTitle}>Community</Text>
    <Text style={s.headerSub}>You are not alone in this.</Text>
  </View>
</View>

        {username ? (
          <TouchableOpacity style={s.usernameBanner} onPress={() => setShowUsernameModal(true)} activeOpacity={0.85}>
            <View style={s.usernameAvatar}><Text style={s.usernameAvatarText}>{getInitials(username)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.usernameLabel}>Posting as</Text>
              <Text style={s.usernameValue}>{username}</Text>
            </View>
            <Feather name="edit-2" size={14} color={theme.accent} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.setUsernameBanner} onPress={() => setShowUsernameModal(true)} activeOpacity={0.88}>
            <Feather name="user" size={16} color={theme.accent} />
            <Text style={s.setUsernameText}>Set a display name to join the conversation</Text>
            <Feather name="chevron-right" size={16} color={theme.accent} />
          </TouchableOpacity>
        )}

        <View style={s.disclaimerCard}>
          <Feather name="shield" size={14} color={theme.accent} />
          <Text style={s.disclaimerText}>This is a peer support community. Not therapy, not emergency care. Be kind. Be real.</Text>
        </View>

        <Text style={s.sectionTitle}>Choose a room</Text>
        {ROOMS.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[s.roomCard, { borderColor: theme.isDark ? room.color + "40" : room.border }]}
            onPress={() => handleRoomPress(room)}
            activeOpacity={0.88}
          >
            <View style={[s.roomEmojiBubble, { backgroundColor: theme.isDark ? room.color + "20" : room.bg }]}>
              <Text style={s.roomEmoji}>{room.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.roomLabel, { color: room.color }]}>{room.label}</Text>
              <Text style={s.roomDesc}>{room.desc}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={s.guidelinesBtn} onPress={() => setShowGuidelines(true)} activeOpacity={0.85}>
          <Feather name="info" size={14} color={theme.accent} />
          <Text style={s.guidelinesBtnText}>Community Guidelines</Text>
        </TouchableOpacity>

        <Text style={s.footerText}>BitzaHugs community is moderated. Messages that violate guidelines will be removed.</Text>
      </ScrollView>

      {showUsernameModal && (
        <View style={s.modalOverlay}>
          <View style={s.usernameModal}>
            <Text style={s.usernameModalTitle}>Choose a display name</Text>
            <Text style={s.usernameModalSub}>This is how others will see you. Use a nickname — no real name needed.</Text>
            <TextInput
              style={s.usernameModalInput}
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="e.g. TiredButTrying, MomOf3, DadStrong"
              placeholderTextColor={theme.textPlaceholder}
              maxLength={20}
              autoFocus
            />
            <Text style={s.usernameCharCount}>{usernameInput.length}/20</Text>
            <TouchableOpacity style={[s.usernameModalBtn, usernameInput.trim().length < 2 && { opacity: 0.4 }]} onPress={handleSaveUsername} disabled={usernameInput.trim().length < 2} activeOpacity={0.88}>
              <Text style={s.usernameModalBtnText}>Save & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.usernameModalCancel} onPress={() => setShowUsernameModal(false)} activeOpacity={0.75}>
              <Text style={s.usernameModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showGuidelines && (
        <View style={s.modalOverlay}>
          <View style={s.guidelinesModal}>
            <Text style={s.guidelinesTitle}>Community Guidelines 💜</Text>
            {GUIDELINES.map((g, i) => (
              <View key={i} style={s.guidelineRow}>
                <Text style={s.guidelineDot}>•</Text>
                <Text style={s.guidelineText}>{g}</Text>
              </View>
            ))}
            <TouchableOpacity style={s.guidelinesCloseBtn} onPress={() => setShowGuidelines(false)} activeOpacity={0.88}>
              <Text style={s.guidelinesCloseBtnText}>Got it 💜</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

    headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    headerBackBtn: { width: 38, height: 38, borderRadius: 13, backgroundColor: theme.accentLight, alignItems: "center", justifyContent: "center" },
    headerTitle: { color: theme.textPrimary, fontSize: 24, fontWeight: "900", marginBottom: 2 },
    headerSub: { color: theme.textMuted, fontSize: 13, fontWeight: "600" },

    usernameBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: theme.accentLight, borderRadius: 14, borderWidth: 1, borderColor: theme.accentBorder, padding: 12, marginBottom: 10 },
    usernameAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center" },
    usernameAvatarText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
    usernameLabel: { color: theme.textMuted, fontSize: 10, fontWeight: "700" },
    usernameValue: { color: theme.textPrimary, fontSize: 14, fontWeight: "800" },

    setUsernameBanner: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: theme.accentLight, borderRadius: 14, borderWidth: 1, borderColor: theme.accentBorder, padding: 12, marginBottom: 10 },
    setUsernameText: { flex: 1, color: theme.accent, fontSize: 13, fontWeight: "700" },

    disclaimerCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 14 },
    disclaimerText: { flex: 1, color: theme.textSecondary, fontSize: 11, lineHeight: 16, fontWeight: "600" },

    sectionTitle: { color: theme.textPrimary, fontSize: 15, fontWeight: "800", marginBottom: 10 },

    roomCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 8, shadowColor: theme.cardShadowColor, shadowOpacity: theme.cardShadowOpacity, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
    roomEmojiBubble: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    roomEmoji: { fontSize: 24 },
    roomLabel: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
    roomDesc: { color: theme.textMuted, fontSize: 11, lineHeight: 15, fontWeight: "600" },

    guidelinesBtn: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 12, justifyContent: "center" },
    guidelinesBtnText: { color: theme.accent, fontSize: 13, fontWeight: "700" },
    footerText: { color: theme.textMuted, fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center", marginTop: 4 },

    // Chat
    chatHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
    chatBackBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.accentLight, alignItems: "center", justifyContent: "center" },
    chatHeaderCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
    chatRoomEmoji: { fontSize: 24 },
    chatRoomTitle: { color: theme.textPrimary, fontSize: 15, fontWeight: "800" },
    chatRoomSub: { color: theme.textMuted, fontSize: 10, fontWeight: "600" },

    safetyBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: theme.accentLight, paddingHorizontal: 14, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.accentBorder },
    safetyText: { color: theme.textSecondary, fontSize: 10, fontWeight: "600" },

    loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
    loadingText: { color: theme.textMuted, fontSize: 13, fontWeight: "600" },
    messagesList: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },

    emptyChat: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 24 },
    emptyChatEmoji: { fontSize: 48, marginBottom: 12 },
    emptyChatTitle: { color: theme.textPrimary, fontSize: 16, fontWeight: "800", marginBottom: 8 },
    emptyChatText: { color: theme.textMuted, fontSize: 13, fontWeight: "600", textAlign: "center", lineHeight: 20 },

    msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 8, gap: 8 },
    msgRowOwn: { flexDirection: "row-reverse" },
    avatarCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarText: { fontSize: 11, fontWeight: "800" },
    bubble: { maxWidth: "75%", borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 },
    bubbleOther: { borderWidth: 1, borderBottomLeftRadius: 4 },
    bubbleOwn: { backgroundColor: "#7548D8", borderBottomRightRadius: 4 },
    bubbleUsername: { fontSize: 10, fontWeight: "800", marginBottom: 3 },
    bubbleText: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
    bubbleTextOwn: { color: "#FFFFFF" },
    bubbleFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
    bubbleTime: { fontSize: 10, fontWeight: "600" },
    bubbleTimeOwn: { color: "rgba(255,255,255,0.6)" },
    bubbleActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    likeBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
    likeCount: { color: "#EF8F7D", fontSize: 10, fontWeight: "700" },
    reportBtn: { padding: 2 },

    inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 24 : 12, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, gap: 8 },
    inputAvatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    inputAvatarText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
    input: { flex: 1, backgroundColor: theme.accentLight, borderRadius: 22, borderWidth: 1, borderColor: theme.accentBorder, paddingHorizontal: 14, paddingVertical: 10, color: theme.textPrimary, fontSize: 14, fontWeight: "600", maxHeight: 80 },
    sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    sendBtnDisabled: { backgroundColor: theme.isDark ? "#3A2A5A" : "#C9B8E8" },

    modalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 20 },
    usernameModal: { backgroundColor: theme.card, borderRadius: 22, padding: 22 },
    usernameModalTitle: { color: theme.textPrimary, fontSize: 18, fontWeight: "900", marginBottom: 6 },
    usernameModalSub: { color: theme.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19, marginBottom: 16 },
    usernameModalInput: { backgroundColor: theme.inputBg, borderRadius: 14, borderWidth: 1.5, borderColor: theme.accent, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: theme.textPrimary, fontWeight: "700", marginBottom: 4 },
    usernameCharCount: { color: theme.textMuted, fontSize: 11, fontWeight: "600", textAlign: "right", marginBottom: 14 },
    usernameModalBtn: { backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 13, alignItems: "center", marginBottom: 10 },
    usernameModalBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
    usernameModalCancel: { alignItems: "center", paddingVertical: 8 },
    usernameModalCancelText: { color: theme.textMuted, fontSize: 14, fontWeight: "700" },

    guidelinesModal: { backgroundColor: theme.card, borderRadius: 22, padding: 22 },
    guidelinesTitle: { color: theme.textPrimary, fontSize: 18, fontWeight: "900", marginBottom: 14 },
    guidelineRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    guidelineDot: { color: theme.accent, fontSize: 16, fontWeight: "800" },
    guidelineText: { flex: 1, color: theme.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
    guidelinesCloseBtn: { backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 8 },
    guidelinesCloseBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  });
}