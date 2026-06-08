import React, { useCallback, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const CHILD_PROFILE_KEY = "bitzaChildProfile";
const PARENT_PROFILE_KEY = "bitzaParentProfile";

const DEFAULT_QUICK_REPLIES = [
  "My child is melting down",
  "I feel overwhelmed",
  "I don't know what to do",
  "I'm exhausted",
  "Help me calm down first",
  "Give me one small step",
];

const calmActions = [
  { label: "Breathing", icon: "wind", route: "Breathing" },
  { label: "Sounds", icon: "volume-2", route: "Sounds" },
  { label: "Journal", icon: "edit-3", route: "CalmJournal" },
];

const EMERGENCY_PATTERN = /(911|emergency|danger|unsafe|hurt|injur|bleeding|can't breathe|cannot breathe|chok|suicide|self harm|kill|abuse|weapon|overdose)/i;

const buildQuickReplies = (childProfile, parentProfile) => {
  const replies = [];
  const childName = childProfile?.childName?.trim();

  if (childName) {
    replies.push(`${childName} is melting down`);
    replies.push(`I don't know how to help ${childName}`);
  } else {
    replies.push("My child is melting down");
    replies.push("I don't know what to do");
  }

  if (childProfile?.triggers?.trim()) {
    const trigger = childProfile.triggers.split(",")[0].trim();
    if (trigger) replies.push(`${childName || "My child"} is triggered by ${trigger}`);
  }

  if (parentProfile?.stressSupport?.trim()) {
    replies.push("Remind me what to do when I'm overwhelmed");
  } else {
    replies.push("Help me calm down first");
  }

  if (parentProfile?.calmingStrategies?.trim()) {
    replies.push("What are my calming strategies?");
  }

  replies.push("I'm exhausted");
  replies.push("Give me one small step");

  return [...new Set(replies)].slice(0, 6);
};

const buildGreetingMessages = (childProfile, parentProfile) => {
  const childName = childProfile?.childName?.trim() || "your child";
  const greeting = parentProfile?.preferredGreeting?.trim() || parentProfile?.name?.trim() || null;
  const hugiTone = parentProfile?.hugiTone || "gentle";

  const firstMessage = greeting
    ? `Hi ${greeting}. I'm Hugi. I'm here with you. 💜`
    : "Hi. I'm Hugi. I'm here with you. 💜";

  const secondMessage = {
    gentle: `Take a breath. What's happening right now with ${childName}?`,
    practical: `What's going on with ${childName} right now? Let's take it one step at a time.`,
    direct: `What's happening with ${childName}? Tell me what you need.`,
    encouraging: `You reached out — that already takes strength. What's going on with ${childName}? 💪`,
  }[hugiTone] || `What's happening right now with ${childName}?`;

  return [
    { id: "1", from: "hugi", text: firstMessage },
    { id: "2", from: "hugi", text: secondMessage },
  ];
};

const buildLocalHugiResponse = (text, childProfile, parentProfile) => {
  const lower = text.toLowerCase();
  const childName = childProfile?.childName?.trim() || "your child";
  const caregiverStrategy = parentProfile?.calmingStrategies?.trim();
  const childStrategy = childProfile?.calmingStrategies?.trim();

  if (EMERGENCY_PATTERN.test(text)) {
    return "This may be more than BitzaHugs can safely support. If there is immediate danger, risk of harm, or a medical emergency, contact emergency services now. Stay as close to safety as you can; you are not alone. 💜";
  }

  if (lower.includes("meltdown") || lower.includes("trigger") || lower.includes("overwhelmed")) {
    const strategy = childStrategy || "lower demands, reduce noise or light, and give one calm sentence";
    return `${childName} is having a hard moment, and you are not failing. Try one small step: ${strategy}. Keep your voice low and focus on safety first. 💜`;
  }

  if (lower.includes("exhausted") || lower.includes("tired") || lower.includes("burnout")) {
    const reset = caregiverStrategy || "take one slow breath and unclench your shoulders";
    return `That sounds deeply tiring. Before solving anything else, try this for you: ${reset}. One small reset counts. 💜`;
  }

  if (lower.includes("don't know") || lower.includes("what do i do") || lower.includes("help")) {
    return `Start with the smallest next step: make the space a little safer and quieter, then pause. You do not need the whole plan right now, just the next kind action. 💜`;
  }

  if (lower.includes("calm") || lower.includes("breathe")) {
    return "Try one slow inhale, then a longer exhale. If you can, put both feet on the floor and name one thing you can do in the next minute. I'm here with you. 💜";
  }

  return `That sounds like a lot to carry. Focus on one gentle next step for ${childName}, and one breath for you. You're doing hard things with care. 💜`;
};

export default function HugiChatScreen({ navigation }) {
  const [childProfile, setChildProfile] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState(DEFAULT_QUICK_REPLIES);

  // Self-check premium — guard against direct navigation bypassing gate
  useFocusEffect(useCallback(() => {
    const checkPremium = async () => {
      const premium = await AsyncStorage.getItem("bitzaIsPremium");
      if (premium !== "true") {
        navigation.replace("PremiumUpgrade");
      }
    };
    checkPremium();
  }, []));
  const [showReminderBanner, setShowReminderBanner] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const cp = await AsyncStorage.getItem(CHILD_PROFILE_KEY);
          const pp = await AsyncStorage.getItem(PARENT_PROFILE_KEY);
          const child = cp ? JSON.parse(cp) : null;
          const parent = pp ? JSON.parse(pp) : null;
          setChildProfile(child);
          setParentProfile(parent);

          setQuickReplies(buildQuickReplies(child, parent));

          if (parent?.stressSupport?.trim()) {
            setReminderText(parent.stressSupport.trim());
            setShowReminderBanner(true);
          } else {
            setShowReminderBanner(false);
          }

          setMessages(buildGreetingMessages(child, parent));
          setConversationHistory([]);
        } catch (e) {
          setMessages([
            { id: "1", from: "hugi", text: "Hi. I'm Hugi. I'm here with you. 💜" },
            { id: "2", from: "hugi", text: "What's happening right now?" },
          ]);
        }
      };
      load();
    }, [])
  );

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg = { id: Date.now().toString(), from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const hugiText = buildLocalHugiResponse(trimmed, childProfile, parentProfile);
      const hugiMsg = { id: (Date.now() + 1).toString(), from: "hugi", text: hugiText };
      setMessages((prev) => [...prev, hugiMsg]);
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: hugiText },
      ]);
    } catch (e) {
      console.log("Hugi API error:", e);
      const fallbackMsg = { id: (Date.now() + 1).toString(), from: "hugi", text: "I'm here with you. Something went a little quiet on my end — can you try again? 💜" };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const parentName = parentProfile?.preferredGreeting?.trim() || parentProfile?.name?.trim() || "You";
  const go = (screen) => navigation.getParent()?.navigate(screen) ?? navigation.navigate(screen);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="chevron-left" size={22} color="#2B2463" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarCircle}>
            <Text style={styles.headerAvatarEmoji}>🐰</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Talk to Hugi</Text>
            <View style={styles.headerStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerStatus}>Calm Support Companion</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="x" size={20} color="#2B2463" />
        </TouchableOpacity>
      </View>

      <View style={styles.safetyBanner}>
        <Feather name="shield" size={13} color="#6F42D8" />
        <Text style={styles.safetyText}>Hugi offers gentle support, not medical, therapy, or emergency care.</Text>
      </View>

      {showReminderBanner && (
        <View style={styles.reminderBanner}>
          <View style={styles.reminderLeft}>
            <Feather name="heart" size={14} color="#EF8F7D" />
            <View style={styles.reminderTextWrap}>
              <Text style={styles.reminderLabel}>Your reminder to yourself</Text>
              <Text style={styles.reminderText}>{reminderText}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowReminderBanner(false)} activeOpacity={0.7}>
            <Feather name="x" size={14} color="#837E96" />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {!childProfile && (
            <TouchableOpacity style={styles.profileNudge} onPress={() => navigation.navigate("ChildProfile")} activeOpacity={0.88}>
              <Feather name="user-plus" size={14} color="#6F42D8" />
              <Text style={styles.profileNudgeText}>Add a child profile to make Hugi more personal.</Text>
              <Feather name="chevron-right" size={14} color="#6F42D8" />
            </TouchableOpacity>
          )}

          {messages.map((msg, index) => {
            const isHugi = msg.from === "hugi";
            const prevMsg = messages[index - 1];
            const showHugiAvatar = isHugi && (index === 0 || prevMsg?.from !== "hugi");
            const showUserAvatar = !isHugi && (index === messages.length - 1 || messages[index + 1]?.from !== "user");

            return (
              <View key={msg.id} style={[styles.msgRow, !isHugi && styles.msgRowUser]}>
                {isHugi && (
                  <View style={styles.msgAvatarWrap}>
                    {showHugiAvatar ? (
                      <View style={styles.hugiAvatarCircle}>
                        <Text style={styles.hugiAvatarEmoji}>🐰</Text>
                      </View>
                    ) : (
                      <View style={styles.msgAvatarSpacer} />
                    )}
                  </View>
                )}
                <View style={[
                  styles.bubble,
                  isHugi ? styles.bubbleHugi : styles.bubbleUser,
                  index > 0 && prevMsg?.from === msg.from && (isHugi ? styles.bubbleHugiChain : styles.bubbleUserChain),
                ]}>
                  {isHugi && showHugiAvatar && <Text style={styles.bubbleSenderName}>Hugi</Text>}
                  {!isHugi && showUserAvatar && <Text style={styles.bubbleSenderNameUser}>{parentName}</Text>}
                  <Text style={[styles.bubbleText, !isHugi && styles.bubbleTextUser]}>{msg.text}</Text>
                </View>
                {!isHugi && (
                  <View style={styles.msgAvatarWrap}>
                    {showUserAvatar ? (
                      <View style={styles.userAvatarCircle}>
                        <Ionicons name="person" size={14} color="#6F42D8" />
                      </View>
                    ) : (
                      <View style={styles.msgAvatarSpacer} />
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {isLoading && (
            <View style={styles.msgRow}>
              <View style={styles.msgAvatarWrap}>
                <View style={styles.hugiAvatarCircle}>
                  <Text style={styles.hugiAvatarEmoji}>🐰</Text>
                </View>
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#7548D8" />
                <Text style={styles.typingText}>Hugi is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.quickSection}>
          <Text style={styles.quickLabel}>Quick replies</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {quickReplies.map((reply) => (
              <TouchableOpacity key={reply} style={styles.quickChip} onPress={() => sendMessage(reply)} activeOpacity={0.85}>
                <Text style={styles.quickChipText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.toolsSection}>
          <Text style={styles.quickLabel}>Gentle tools</Text>
          <View style={styles.toolsRow}>
            {calmActions.map((action) => (
              <TouchableOpacity key={action.label} style={styles.toolCard} onPress={() => go(action.route)} activeOpacity={0.85}>
                <View style={styles.toolIconBubble}>
                  <Feather name={action.icon} size={18} color="#6F42D8" />
                </View>
                <Text style={styles.toolLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputBar}>
          <View style={styles.inputAvatarCircle}>
            <Ionicons name="person" size={14} color="#6F42D8" />
          </View>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Tell Hugi what's going on..."
            placeholderTextColor="#A8A0A5"
            multiline
            maxHeight={80}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            activeOpacity={0.88}
            disabled={!input.trim() || isLoading}
          >
            <Feather name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#EFE4DC" },
  headerBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  headerAvatarEmoji: { fontSize: 22 },
  headerName: { color: "#2B2463", fontSize: 15, fontWeight: "800" },
  headerStatusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#78A866" },
  headerStatus: { color: "#837E96", fontSize: 10, fontWeight: "600" },
  safetyBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#F6ECFF", paddingHorizontal: 14, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#E3D2F8" },
  safetyText: { flex: 1, color: "#5B5672", fontSize: 10, fontWeight: "600" },
  reminderBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF0EB", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#FFD4C2", gap: 10 },
  reminderLeft: { flexDirection: "row", alignItems: "flex-start", gap: 8, flex: 1 },
  reminderTextWrap: { flex: 1 },
  reminderLabel: { color: "#EF8F7D", fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  reminderText: { color: "#2B2463", fontSize: 12, fontWeight: "600", lineHeight: 17 },
  messagesArea: { flex: 1, backgroundColor: "#FFF9F2" },
  messagesContent: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  profileNudge: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#F6ECFF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: "#E3D2F8" },
  profileNudgeText: { flex: 1, color: "#6F42D8", fontSize: 11, fontWeight: "700" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 4, gap: 7 },
  msgRowUser: { flexDirection: "row-reverse" },
  msgAvatarWrap: { width: 30, alignItems: "center" },
  hugiAvatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  hugiAvatarEmoji: { fontSize: 18 },
  userAvatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  msgAvatarSpacer: { width: 30, height: 30 },
  bubble: { maxWidth: "72%", borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 },
  bubbleHugi: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EFE4DC", borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: "#7548D8", borderBottomRightRadius: 4 },
  bubbleHugiChain: { borderTopLeftRadius: 4, borderBottomLeftRadius: 18 },
  bubbleUserChain: { borderTopRightRadius: 4, borderBottomRightRadius: 18 },
  bubbleSenderName: { color: "#6F42D8", fontSize: 10, fontWeight: "800", marginBottom: 3 },
  bubbleSenderNameUser: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "700", marginBottom: 3, textAlign: "right" },
  bubbleText: { color: "#2B2463", fontSize: 14, lineHeight: 20, fontWeight: "600" },
  bubbleTextUser: { color: "#FFFFFF" },
  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, borderColor: "#EFE4DC" },
  typingText: { color: "#837E96", fontSize: 12, fontWeight: "600" },
  quickSection: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4, backgroundColor: "#FFF9F2", borderTopWidth: 1, borderTopColor: "#EFE4DC" },
  quickLabel: { color: "#2B2463", fontSize: 11, fontWeight: "800", marginBottom: 6 },
  quickRow: { flexDirection: "row", gap: 7, paddingBottom: 2 },
  quickChip: { backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7, borderWidth: 1, borderColor: "#E3D2F8" },
  quickChipText: { color: "#6F42D8", fontSize: 12, fontWeight: "700" },
  toolsSection: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8, backgroundColor: "#FFF9F2" },
  toolsRow: { flexDirection: "row", gap: 10 },
  toolCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#EFE4DC", paddingVertical: 10, alignItems: "center", gap: 5 },
  toolIconBubble: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  toolLabel: { color: "#2B2463", fontSize: 11, fontWeight: "800" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 24 : 12, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#EFE4DC", gap: 8 },
  inputAvatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  input: { flex: 1, backgroundColor: "#F6F0FF", borderRadius: 22, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 14, paddingVertical: 10, color: "#2B2463", fontSize: 14, fontWeight: "600" },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#7548D8", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  sendBtnDisabled: { backgroundColor: "#C9B8E8" },
});
