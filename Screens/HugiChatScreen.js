import React, { useCallback, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, Image,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const CHILD_PROFILE_KEY = "bitzaChildProfile";
const PARENT_PROFILE_KEY = "bitzaParentProfile";

const quickReplies = [
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

const getHugiResponse = (text, childName, childProfile) => {
  const lower = text.toLowerCase();
  const name = childName || "your child";

  const profileLine = (() => {
    if (!childProfile) return "";
    if (childProfile.calmingStrategies?.trim())
      return `Based on what you saved, these calming strategies may help: ${childProfile.calmingStrategies}`;
    if (childProfile.triggers?.trim())
      return `You noted that triggers can include: ${childProfile.triggers}. Let's lower demands where we can.`;
    return "";
  })();

  if (lower.includes("meltdown") || lower.includes("melting"))
    return `Okay. Let's focus on safety first. Move anything unsafe away, soften your voice, and give ${name} some space. You don't have to fix the whole moment at once.${profileLine ? `\n\n${profileLine}` : ""}`;
  if (lower.includes("overwhelm") || lower.includes("too much"))
    return "I hear you. Take one breath. You don't have to fix everything right now. What's one small thing that could make this moment feel a little safer?";
  if (lower.includes("don't know") || lower.includes("no idea"))
    return "That's okay. Not knowing is part of this. You're still showing up. Let's slow it down — what does this moment need most right now?";
  if (lower.includes("exhaust") || lower.includes("tired"))
    return "You are carrying a lot. Exhaustion is a real signal that you need some support too. Is there one thing you could put down — even for five minutes?";
  if (lower.includes("calm") || lower.includes("breathe") || lower.includes("slow"))
    return "Good. Let's breathe together. In through the nose for 4 counts... hold for 2... out slowly for 6. You can do this as many times as you need.";
  if (lower.includes("step") || lower.includes("help") || lower.includes("what do i"))
    return `Here's one step: lower the pressure. No new demands, no extra questions, no rushing. Just presence. Be with ${name} without trying to fix the moment yet.`;
  if (lower.includes("angry") || lower.includes("frustrat"))
    return "Frustration makes sense. This is hard. Can you find a moment to step away for 60 seconds? Even a bathroom break gives your nervous system a tiny reset.";
  if (lower.includes("cry") || lower.includes("sad") || lower.includes("broke"))
    return "It's okay to feel broken sometimes. This doesn't make you a bad caregiver. It makes you human. You're still here, and that matters more than you know.";
  if (lower.includes("thank") || lower.includes("better") || lower.includes("good"))
    return "I'm really glad. You did the hard thing by reaching out. Even small moments of calm matter. I'm here whenever you need me. 💜";
  return "I hear you. You're not alone in this. Can you tell me a little more about what's happening right now? I want to make sure I give you something actually helpful.";
};

export default function HugiChatScreen({ navigation }) {
  const [childProfile, setChildProfile] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
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
          const name = child?.childName?.trim() || "your child";
          const greeting = parent?.preferredGreeting?.trim() || parent?.name?.trim() || null;
          setMessages([
            { id: "1", from: "hugi", text: greeting ? `Hi ${greeting}. I'm Hugi. I'm here with you. 💜` : "Hi. I'm Hugi. I'm here with you. 💜" },
            { id: "2", from: "hugi", text: `What's happening right now with ${name}?` },
          ]);
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

  const sendMessage = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    const childName = childProfile?.childName?.trim() || "your child";
    const userMsg = { id: Date.now().toString(), from: "user", text: trimmed };
    const hugiMsg = { id: (Date.now() + 1).toString(), from: "hugi", text: getHugiResponse(trimmed, childName, childProfile) };
    setMessages((prev) => [...prev, userMsg, hugiMsg]);
    setInput("");
    scrollToBottom();
  };

  const parentName = parentProfile?.preferredGreeting?.trim() || parentProfile?.name?.trim() || "You";

  const go = (screen) => navigation.getParent()?.navigate(screen) ?? navigation.navigate(screen);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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
              <Text style={styles.headerStatus}>AI Calm Companion</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="x" size={20} color="#2B2463" />
        </TouchableOpacity>
      </View>

      {/* Safety Banner */}
      <View style={styles.safetyBanner}>
        <Feather name="shield" size={13} color="#6F42D8" />
        <Text style={styles.safetyText}>Hugi offers gentle support, not medical, therapy, or emergency care.</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {/* Profile nudge */}
          {!childProfile && (
            <TouchableOpacity style={styles.profileNudge} onPress={() => navigation.navigate("ChildProfile")} activeOpacity={0.88}>
              <Feather name="user-plus" size={14} color="#6F42D8" />
              <Text style={styles.profileNudgeText}>Add a child profile to make Hugi more personal.</Text>
              <Feather name="chevron-right" size={14} color="#6F42D8" />
            </TouchableOpacity>
          )}

          {/* Message Bubbles */}
          {messages.map((msg, index) => {
            const isHugi = msg.from === "hugi";
            const prevMsg = messages[index - 1];
            const showHugiAvatar = isHugi && (index === 0 || prevMsg?.from !== "hugi");
            const showUserAvatar = !isHugi && (index === messages.length - 1 || messages[index + 1]?.from !== "user");

            return (
              <View key={msg.id} style={[styles.msgRow, !isHugi && styles.msgRowUser]}>
                {/* Hugi avatar */}
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

                {/* Bubble */}
                <View style={[
                  styles.bubble,
                  isHugi ? styles.bubbleHugi : styles.bubbleUser,
                  index > 0 && prevMsg?.from === msg.from && (isHugi ? styles.bubbleHugiChain : styles.bubbleUserChain),
                ]}>
                  {isHugi && showHugiAvatar && <Text style={styles.bubbleSenderName}>Hugi</Text>}
                  {!isHugi && showUserAvatar && <Text style={styles.bubbleSenderNameUser}>{parentName}</Text>}
                  <Text style={[styles.bubbleText, !isHugi && styles.bubbleTextUser]}>{msg.text}</Text>
                </View>

                {/* User avatar */}
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
        </ScrollView>

        {/* Quick Replies */}
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

        {/* Gentle Tools */}
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

        {/* Input Bar */}
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
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            activeOpacity={0.88}
            disabled={!input.trim()}
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