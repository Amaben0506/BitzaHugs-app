import React, { useCallback, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../theme/colors";
import {
  FREE_LIMITS,
  getRemainingHugiMessages,
  recordHugiMessageUsed,
  usePremium,
} from "../lib/premium";

const HUGI = require("../../assets/icons/Hugi-Bunny.png");

const CHILD_PROFILE_KEY = "bitzaChildProfile";
const PARENT_PROFILE_KEY = "bitzaParentProfile";

interface ChildProfile {
  childName?: string;
  age?: string;
  diagnosis?: string;
  triggers?: string;
  calmingStrategies?: string;
}

interface ParentProfile {
  name?: string;
  preferredGreeting?: string;
  hugiTone?: 'gentle' | 'practical' | 'direct' | 'encouraging';
  stressSupport?: string;
  calmingStrategies?: string;
}

interface Message {
  id: string;
  from: 'hugi' | 'user';
  text: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_QUICK_REPLIES = [
  "My child is melting down",
  "I feel overwhelmed",
  "I don't know what to do",
  "I'm exhausted",
  "Help me calm down first",
  "Give me one small step",
];

const calmActions: Array<{ label: string; icon: React.ComponentProps<typeof Feather>['name']; route: string }> = [
  { label: "Breathing", icon: "wind", route: "Breathing" },
  { label: "Sounds", icon: "volume-2", route: "Sounds" },
  { label: "Journal", icon: "edit-3", route: "CalmJournal" },
];

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

const EMERGENCY_PATTERN = /(911|emergency|danger|unsafe|hurt|injur|bleeding|can't breathe|cannot breathe|chok|suicide|self harm|kill|abuse|weapon|overdose)/i;

const resolveChildName = (childProfile: ChildProfile | null): string => {
  const raw = childProfile?.childName?.trim();
  if (!raw || /^child\s*\d*$/i.test(raw)) return 'your child';
  return raw;
};

const buildQuickReplies = (childProfile: ChildProfile | null): string[] => {
  const childName = resolveChildName(childProfile);
  const replies: string[] = [];

  if (childProfile?.childName?.trim()) {
    replies.push(`${childName} is having a hard morning`);
    replies.push(`I don't know how to help ${childName}`);
  } else {
    replies.push('My child is having a hard morning');
    replies.push("I don't know how to help my child");
  }

  replies.push('I feel completely overwhelmed');
  replies.push('Help me calm down');
  replies.push("I'm exhausted");
  replies.push('Give me one small step');

  return [...new Set(replies)].slice(0, 6);
};

const buildGreetingMessages = (childProfile: ChildProfile | null, parentProfile: ParentProfile | null): Message[] => {
  const childName = resolveChildName(childProfile);
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

const buildLocalHugiResponse = (text: string, childProfile: ChildProfile | null): string => {
  const lower = text.toLowerCase();
  const childName = resolveChildName(childProfile);

  if (EMERGENCY_PATTERN.test(text)) {
    return "Please call 911 or your local emergency services right now if there is immediate danger. I'm here with you, but this needs real help immediately.";
  }

  if (lower.includes("meltdown") || lower.includes("trigger") || lower.includes("overwhelmed")) {
    return `That is so hard in the moment. What's happening right now — is ${childName} still in it or starting to come down? 💜`;
  }

  if (lower.includes("exhausted") || lower.includes("tired") || lower.includes("burnout")) {
    return "I hear you. That kind of tired goes deeper than sleep can fix. What's feeling heaviest right now? 💜";
  }

  if (lower.includes("don't know") || lower.includes("what do i do") || lower.includes("help")) {
    return "That feeling of not knowing what to do is awful. Tell me a little more about what's happening and we'll figure out a next step together. 💜";
  }

  if (lower.includes("calm") || lower.includes("breathe")) {
    return "Let's do that together. In through your nose slowly, then out through your mouth. You don't have to fix anything in this breath. 💜";
  }

  return "I'm here. Tell me more about what's going on. 💜";
};

const buildSystemPrompt = (childProfile: ChildProfile | null, parentProfile: ParentProfile | null): string => {
  const childName = resolveChildName(childProfile);
  const childAge = childProfile?.age?.trim() || '';
  const diagnosis = childProfile?.diagnosis?.trim() || '';
  const triggers = childProfile?.triggers?.trim() || '';
  const childCalming = childProfile?.calmingStrategies?.trim() || '';
  const parentName = parentProfile?.preferredGreeting?.trim() || parentProfile?.name?.trim() || '';
  const parentCalming = parentProfile?.calmingStrategies?.trim() || '';

  let prompt = `You are Hugi, a warm and caring support companion inside the BitzaHugs app for caregivers of children with special needs. You are not a therapist or doctor — you are more like a deeply understanding friend who has been through hard things too.

Your personality: You are real, warm, and present. You listen first. You never give generic advice or scripted responses. You respond to exactly what this person said — not a template version of it. You use natural, conversational language like you are texting a close friend. You are not overly positive or cheerful. You meet the caregiver where they are emotionally.

Your response style:
- Keep responses to 2-3 sentences maximum
- Sound human and warm, not like a support bot
- Respond directly to what they actually said
- Ask one genuine follow-up question when it feels natural
- Never use phrases like "one gentle next step" or "you are doing hard things with care" — these sound scripted
- Never start your response with "That sounds like..." — find a more natural opening
- End most messages with 💜 but not every single one
- Use the child's name naturally if you know it, but never robotically

Your role: emotional support, grounding, and gentle practical suggestions when asked. If someone is in immediate danger, always direct them to emergency services first.`;

  if (childName !== 'your child' || childAge || diagnosis || triggers || childCalming) {
    prompt += `\n\nContext about their child:`;
    if (childName !== 'your child') prompt += `\n- Name: ${childName}`;
    if (childAge) prompt += `\n- Age: ${childAge}`;
    if (diagnosis) prompt += `\n- Diagnosis: ${diagnosis}`;
    if (triggers) prompt += `\n- Known triggers: ${triggers}`;
    if (childCalming) prompt += `\n- What helps them calm down: ${childCalming}`;
  }

  if (parentName || parentCalming) {
    prompt += `\n\nContext about the caregiver:`;
    if (parentName) prompt += `\n- Name: ${parentName}`;
    if (parentCalming) prompt += `\n- Their own calming strategies: ${parentCalming}`;
  }

  prompt += `\n\nSafety: If there is any mention of immediate danger, self-harm, or emergency, always tell them to call 911 or their local emergency services immediately.`;

  return prompt;
};

const callHugiAI = async (userMessage: string, history: ConversationMessage[], childProfile: ChildProfile | null, parentProfile: ParentProfile | null): Promise<string> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: buildSystemPrompt(childProfile, parentProfile),
      messages: [...history, { role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

export default function HugiChatScreen({ navigation }: { navigation: any }) {
  const { isPremium, showPremiumUpgrade } = usePremium();
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState(DEFAULT_QUICK_REPLIES);
  const [remainingFreeMessages, setRemainingFreeMessages] = useState<number>(FREE_LIMITS.hugiMessagesPerDay);

  // Self-check premium — guard against direct navigation bypassing gate
  // useFocusEffect(useCallback(() => {
  //   const checkPremium = async () => {
  //     const premium = await AsyncStorage.getItem("bitzaIsPremium");
  //     if (premium !== "true") {
  //       navigation.replace("PremiumUpgrade");
  //     }
  //   };
  //   checkPremium();
  // }, []));
  const [showReminderBanner, setShowReminderBanner] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

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

          setQuickReplies(buildQuickReplies(child));

          if (parent?.stressSupport?.trim()) {
            setReminderText(parent.stressSupport.trim());
            setShowReminderBanner(true);
          } else {
            setShowReminderBanner(false);
          }

          setMessages(buildGreetingMessages(child, parent));
          setConversationHistory([]);
          setRemainingFreeMessages(await getRemainingHugiMessages());
        } catch (e) {
          setMessages([
            { id: "1", from: "hugi" as const, text: "Hi. I'm Hugi. I'm here with you. 💜" },
            { id: "2", from: "hugi" as const, text: "What's happening right now?" },
          ]);
        }
      };
      load();
    }, [])
  );

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const isEmergency = EMERGENCY_PATTERN.test(trimmed);
    if (!isPremium && !isEmergency) {
      const remaining = await getRemainingHugiMessages();
      setRemainingFreeMessages(remaining);
      if (remaining <= 0) {
        showPremiumUpgrade({ feature: "hugi_limit" });
        return;
      }
    }

    const userMsg: Message = { id: Date.now().toString(), from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    if (isEmergency) {
      const emergencyText = "This may be more than BitzaHugs can safely support. If there is immediate danger, risk of harm, or a medical emergency, contact emergency services now. Stay as close to safety as you can — you are not alone. 💜";
      const hugiMsg: Message = { id: (Date.now() + 1).toString(), from: "hugi", text: emergencyText };
      setMessages((prev) => [...prev, hugiMsg]);
      setConversationHistory((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: emergencyText }]);
      setIsLoading(false);
      scrollToBottom();
      return;
    }

    try {
      const hugiText = ANTHROPIC_API_KEY
        ? await callHugiAI(trimmed, conversationHistory, childProfile, parentProfile)
        : buildLocalHugiResponse(trimmed, childProfile);
      const hugiMsg: Message = { id: (Date.now() + 1).toString(), from: "hugi", text: hugiText };
      setMessages((prev) => [...prev, hugiMsg]);
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: hugiText },
      ]);
      if (!isPremium) {
        const usage = await recordHugiMessageUsed();
        setRemainingFreeMessages(Math.max(FREE_LIMITS.hugiMessagesPerDay - usage.count, 0));
      }
    } catch (e) {
      console.log("Hugi API error:", e);
      const fallbackText = buildLocalHugiResponse(trimmed, childProfile);
      const fallbackMsg: Message = { id: (Date.now() + 1).toString(), from: "hugi", text: fallbackText };
      setMessages((prev) => [...prev, fallbackMsg]);
      setConversationHistory((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: fallbackText }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const parentName = parentProfile?.preferredGreeting?.trim() || parentProfile?.name?.trim() || "You";
  const go = (screen: string) => navigation.getParent()?.navigate(screen) ?? navigation.navigate(screen);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="chevron-left" size={22} color={Colors.purple} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={HUGI} style={styles.headerAvatar} resizeMode="contain" />
          <View>
            <Text style={styles.headerName}>Talk to Hugi</Text>
            <View style={styles.headerStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerStatus}>Here for you</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="x" size={20} color={Colors.purple} />
        </TouchableOpacity>
      </View>

      <View style={styles.safetyBanner}>
        <Feather name="shield" size={13} color={Colors.purple} />
        <Text style={styles.safetyText}>Hugi offers gentle support, not medical, therapy, or emergency care.</Text>
      </View>

      {showReminderBanner && (
        <View style={styles.reminderBanner}>
          <View style={styles.reminderLeft}>
            <Feather name="heart" size={14} color={Colors.textRose} />
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

      {!isPremium && (
        <View style={styles.freeUsageBanner}>
          <Ionicons name="chatbubble-ellipses-outline" size={13} color={Colors.purple} />
          <Text style={styles.freeUsageText}>
            {remainingFreeMessages} free Hugi {remainingFreeMessages === 1 ? "message" : "messages"} left today.
          </Text>
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
          {/* profile nudge hidden for now */}

          {messages.map((msg, index) => {
            const isHugi = msg.from === "hugi";
            const prevMsg = messages[index - 1];
            const showHugiAvatar = isHugi && (index === 0 || prevMsg?.from !== "hugi");
            const showUserAvatar = !isHugi && (index === messages.length - 1 || messages[index + 1]?.from !== "user");

            return (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  !isHugi && styles.msgRowUser,
                  index < messages.length - 1 && messages[index + 1]?.from !== msg.from && styles.msgRowSpacing,
                ]}
              >
                {isHugi && (
                  <View style={styles.msgAvatarWrap}>
                    {showHugiAvatar ? (
                      <View style={styles.hugiAvatarCircle}>
                        <Image source={HUGI} style={styles.hugiAvatarImg} resizeMode="contain" />
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
                  <Text style={[styles.bubbleText, !isHugi && styles.bubbleTextUser]}>{msg.text}</Text>
                </View>
                {!isHugi && (
                  <View style={styles.msgAvatarWrap}>
                    {showUserAvatar ? (
                      <View style={styles.userAvatarCircle}>
                        <Ionicons name="person" size={14} color={Colors.purple} />
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
                  <Image source={HUGI} style={styles.hugiAvatarImg} resizeMode="contain" />
                </View>
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={Colors.purple} />
                <Text style={styles.typingText}>Hugi is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.quickSection}>
          <View style={styles.divider} />
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 4 }}
          >
            {quickReplies.map((reply) => (
              <TouchableOpacity key={reply} style={styles.quickChip} onPress={() => sendMessage(reply)} activeOpacity={0.85}>
                <Text style={styles.quickChipText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.toolsSection}>
          <View style={styles.toolsRow}>
            {calmActions.map((action) => (
              <TouchableOpacity key={action.label} style={styles.toolCard} onPress={() => go(action.route)} activeOpacity={0.85}>
                <View style={styles.toolIconBubble}>
                  <Feather name={action.icon} size={18} color={Colors.purple} />
                </View>
                <Text style={styles.toolLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputBar}>
          <View style={styles.inputAvatarCircle}>
            <Ionicons name="person" size={14} color={Colors.purple} />
          </View>
          <TextInput
            style={[styles.input, { maxHeight: 80 }]}
            value={input}
            onChangeText={setInput}
            placeholder="Tell Hugi what's going on..."
            placeholderTextColor="#A8A0A5"
            multiline
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
  safeArea: { flex: 1, backgroundColor: "#F5F0FA" },
  // ── Header ──
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#FFFFFF", borderBottomWidth: 0.5, borderBottomColor: "#DDD0F0" },
  headerBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EDE0FF", borderWidth: 0.5, borderColor: "#D0B8F8", alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerName: { color: "#3D2B6B", fontSize: 15, fontWeight: "500" },
  headerStatusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#5BAD6F" },
  headerStatus: { color: "#9B8AB8", fontSize: 10 },
  // ── Safety banner ──
  safetyBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#F0EAFF", paddingHorizontal: 14, paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: "#DDD0F0" },
  safetyText: { flex: 1, color: "#7B5EA7", fontSize: 10 },
  // ── Reminder banner ──
  reminderBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF7FB", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#F0D0E8", gap: 10 },
  reminderLeft: { flexDirection: "row", alignItems: "flex-start", gap: 8, flex: 1 },
  reminderTextWrap: { flex: 1 },
  reminderLabel: { color: "#C07090", fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  reminderText: { color: "#3D2B6B", fontSize: 12, lineHeight: 17 },
  freeUsageBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#FFFDF9", paddingHorizontal: 14, paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: "#DDD0F0" },
  freeUsageText: { flex: 1, color: "#7B5EA7", fontSize: 10, fontWeight: "600" },
  // ── Messages ──
  messagesArea: { flex: 1, backgroundColor: "#F5F0FA" },
  messagesContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 4, gap: 8 },
  msgRowUser: { flexDirection: "row-reverse" },
  msgRowSpacing: { marginBottom: 10 },
  msgAvatarWrap: { width: 32, alignItems: "center" },
  hugiAvatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 0.5, borderColor: "#DDD0F0", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  hugiAvatarImg: { width: 28, height: 28 },
  userAvatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EDE0FF", alignItems: "center", justifyContent: "center" },
  msgAvatarSpacer: { width: 32, height: 32 },
  bubble: { maxWidth: "72%", borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 },
  bubbleHugi: { backgroundColor: "#FFFFFF", borderWidth: 0.5, borderColor: "#DDD0F0", borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: "#9B7ACC", borderBottomRightRadius: 4 },
  bubbleHugiChain: { borderTopLeftRadius: 4, borderBottomLeftRadius: 18 },
  bubbleUserChain: { borderTopRightRadius: 4, borderBottomRightRadius: 18 },
  bubbleText: { color: "#3D2B6B", fontSize: 14, lineHeight: 22, fontWeight: "400" },
  bubbleTextUser: { color: "#FFFFFF" },
  // ── Typing indicator ──
  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 13, paddingVertical: 10, borderWidth: 0.5, borderColor: "#DDD0F0" },
  typingText: { color: "#9B8AB8", fontSize: 12 },
  // ── Quick replies ──
  quickSection: { paddingTop: 6, paddingBottom: 4, backgroundColor: "#F5F0FA" },
  divider: { height: 0.5, backgroundColor: "#DDD0F0", marginBottom: 8, marginHorizontal: 16 },
  quickRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 6 },
  quickChip: { backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 0.5, borderColor: "#DDD0F0" },
  quickChipText: { color: "#7B5EA7", fontSize: 12 },
  // ── Gentle tools ──
  toolsSection: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8, backgroundColor: "#F5F0FA" },
  toolsRow: { flexDirection: "row", gap: 10 },
  toolCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 0.5, borderColor: "#DDD0F0", paddingVertical: 10, alignItems: "center", gap: 5 },
  toolIconBubble: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#EDE0FF", alignItems: "center", justifyContent: "center" },
  toolLabel: { color: "#3D2B6B", fontSize: 11, fontWeight: "500" },
  // ── Input bar ──
  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 24 : 12, backgroundColor: "#FFFFFF", borderTopWidth: 0.5, borderTopColor: "#DDD0F0", gap: 8 },
  inputAvatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EDE0FF", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  input: { flex: 1, backgroundColor: "#F5F0FA", borderRadius: 22, borderWidth: 0.5, borderColor: "#DDD0F0", paddingHorizontal: 14, paddingVertical: 10, color: "#3D2B6B", fontSize: 14 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#9B7ACC", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  sendBtnDisabled: { backgroundColor: "#C8B8E0" },
});
