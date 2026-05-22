import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from "@expo/vector-icons";

const sections = [
  { title: "Hugi Safety Note", icon: "message-circle", bg: "#F0E2FF", accent: "#6F42D8", text: "Hugi is here to support you, not replace professional care. Hugi can offer gentle encouragement, calming steps, journaling prompts, and parenting support tools. Hugi is not a therapist, doctor, crisis counselor, emergency service, or medical provider." },
  { title: "Emotional Support Disclaimer", icon: "heart", bg: "#FFE6E4", accent: "#EF8F7D", text: "BitzaHugs is a support tool, not a diagnosis or treatment plan. The app is meant to help with routines, emotional check-ins, calming strategies, journaling, and family support. It should not replace medical, behavioral, mental health, therapy, or emergency advice." },
  { title: "Child & Family Data", icon: "users", bg: "#E7F4FF", accent: "#4C9ED9", text: "Your family details are sensitive. BitzaHugs may let you save information like child profiles, triggers, calming strategies, routines, support contacts, and journal entries. For this prototype, saved information is stored locally on this device." },
  { title: "Journal Privacy", icon: "book-open", bg: "#EEF7E8", accent: "#78A866", text: "Your journal is personal. Journal entries may include emotional or private thoughts. In this prototype, saved entries stay in local device storage. Before public launch, BitzaHugs will clearly explain how journal entries are stored, protected, and deleted." },
  { title: "Emergency Reminder", icon: "alert-triangle", bg: "#FFF0DF", accent: "#D99A3D", text: "BitzaHugs is not for emergencies. If there is immediate danger, abuse, severe injury, medical crisis, or risk of harm to yourself, your child, or someone else, contact emergency services immediately." },
];

// ─── Modal Content ────────────────────────────────────────────────────────────
const PRIVACY_POLICY = [
  { heading: "What we collect", body: "When you use BitzaHugs, you may choose to provide your name, your child's name and age, communication style, sensory needs, triggers, calming strategies, comfort items, meltdown notes, daily routines, mood check-ins, journal entries, appointments, and support person contact details." },
  { heading: "How we use it", body: "We use your information solely to personalize the support tools within the app. We do not sell, rent, trade, or share your personal information with third parties for marketing purposes. Ever." },
  { heading: "Where it's stored", body: "During the current prototype phase, all information is stored locally on your device using AsyncStorage. Your data does not leave your device and is not transmitted to any external server." },
  { heading: "Your rights", body: "You can view, edit, or delete any information you've entered at any time through the app's settings screen. You are in control of your data." },
  { heading: "Children's privacy (COPPA)", body: "BitzaHugs is designed for adult caregivers. Information about children is entered by adult caregivers and stored locally. We do not knowingly collect personal information directly from children under 13." },
  { heading: "Emergency disclaimer", body: "BitzaHugs is not for emergencies. If there is immediate danger, contact emergency services right away." },
  { heading: "Changes", body: "This Privacy Policy will be updated before public launch to include cloud storage practices, account security, and full legal language. A lawyer review is planned before App Store submission." },
];

const TERMS_OF_USE = [
  { heading: "Who can use this app", body: "BitzaHugs is intended for adult caregivers (18+) of children who need extra support. By using this app, you confirm you are an adult caregiver." },
  { heading: "Not medical advice", body: "BitzaHugs is a support tool, not a medical device, diagnostic tool, or treatment platform. Nothing in this app constitutes medical advice, mental health treatment, behavioral therapy, or emergency care." },
  { heading: "Not for emergencies", body: "BitzaHugs is not designed for emergency situations. If you or your child are in immediate danger, contact emergency services (911 in the US) immediately." },
  { heading: "Hugi companion", body: "The Hugi companion provides scripted supportive responses. Hugi is not a therapist, counselor, doctor, or crisis service. Hugi's responses are not a substitute for professional support." },
  { heading: "Community (future)", body: "When the community feature launches, users must follow community guidelines. Violations may result in removal from the community. All rooms are moderated." },
  { heading: "Premium subscriptions", body: "Premium features are available via monthly or annual subscription. Subscriptions auto-renew unless cancelled. Manage subscriptions in your App Store or Google Play settings." },
  { heading: "Your content", body: "Journal entries, routine notes, and profile information you enter remain yours. We do not claim ownership of your personal content." },
  { heading: "Prototype disclaimer", body: "BitzaHugs is currently in prototype/beta. Features may change, data may be reset, and the app is not yet available on the public App Store." },
];

const COMMUNITY_GUIDELINES = [
  { heading: "Be kind and supportive", body: "This is a space for caregivers who are doing their best. Judgment, shaming, or dismissive comments are not welcome here." },
  { heading: "No medical diagnosis claims", body: "Do not offer medical diagnoses, treatment advice, or present yourself as a medical or mental health professional." },
  { heading: "Respect privacy", body: "Do not share personally identifiable information about yourself or others. What is shared in community rooms stays there." },
  { heading: "No bullying or harassment", body: "Any form of bullying, harassment, targeting, or intimidation will result in immediate removal from the community." },
  { heading: "Peer support only", body: "The community is peer support from other caregivers — not professional advice, therapy, or emergency care. Always seek professional help when needed." },
  { heading: "Use the report button", body: "If you see something that feels unsafe or violates these guidelines, use the flag icon on any message to report it. All reports are reviewed." },
  { heading: "No spam or promotion", body: "Do not post promotional content, links to external products, or self-promotion of any kind." },
  { heading: "Violations", body: "Violations of these guidelines may result in message removal, temporary suspension, or permanent removal from the community." },
];

// ─── Content Modal ────────────────────────────────────────────────────────────
function ContentModal({ visible, title, icon, iconColor, iconBg, items, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          {/* Handle */}
          <View style={modal.handle} />

          {/* Header */}
          <View style={modal.header}>
            <View style={[modal.headerIcon, { backgroundColor: iconBg }]}>
              <Feather name={icon} size={18} color={iconColor} />
            </View>
            <Text style={modal.headerTitle}>{title}</Text>
            <TouchableOpacity style={modal.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Feather name="x" size={18} color="#2B2463" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={modal.scroll}
            contentContainerStyle={modal.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item, i) => (
              <View key={i} style={modal.item}>
                <View style={modal.itemDot} />
                <View style={modal.itemTextWrap}>
                  <Text style={modal.itemHeading}>{item.heading}</Text>
                  <Text style={modal.itemBody}>{item.body}</Text>
                </View>
              </View>
            ))}

            <View style={modal.noteCard}>
              <Ionicons name="information-circle-outline" size={16} color="#6F42D8" />
              <Text style={modal.noteText}>
                This is prototype wording. Full legal language will be reviewed by an attorney before public launch.
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View style={modal.footer}>
            <TouchableOpacity style={modal.closeButton} onPress={onClose} activeOpacity={0.9}>
              <Text style={modal.closeButtonText}>Got it</Text>
              <Feather name="check" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PrivacySafetyScreen({ navigation }) {
  const [activeModal, setActiveModal] = useState(null); // "privacy" | "terms" | "community"

  const legalItems = [
    {
      title: "Privacy Policy",
      subtitle: "How family information is used and protected",
      icon: "lock",
      bg: "#E7F4FF",
      accent: "#4C9ED9",
      modal: "privacy",
    },
    {
      title: "Terms of Use",
      subtitle: "Rules, disclaimers, subscriptions, and app use",
      icon: "file-text",
      bg: "#FFF0DF",
      accent: "#D99A3D",
      modal: "terms",
    },
    {
      title: "Community Guidelines",
      subtitle: "Safety rules for future caregiver community spaces",
      icon: "users",
      bg: "#EEF7E8",
      accent: "#78A866",
      modal: "community",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Privacy & Safety</Text>
          <View style={styles.circleButton}>
            <Feather name="shield" size={18} color="#2B2463" />
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require("../assets/icons/support-heart-hug.png")} style={styles.heroIcon} resizeMode="contain" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Your family's safety matters.</Text>
            <Text style={styles.heroText}>BitzaHugs is meant to support calm moments, not replace professional care or emergency help.</Text>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Feather name="alert-triangle" size={20} color="#EF8F7D" />
          </View>
          <View style={styles.noticeTextWrap}>
            <Text style={styles.noticeTitle}>Important</Text>
            <Text style={styles.noticeText}>If there is immediate danger, a medical emergency, or risk of harm, contact emergency services right away.</Text>
          </View>
        </View>

        {/* ── Legal Documents ── */}
        <Text style={styles.sectionLabel}>Legal & Guidelines</Text>
        <View style={styles.legalCard}>
          {legalItems.map((item, i) => (
            <TouchableOpacity
              key={item.title}
              style={[styles.legalRow, i === legalItems.length - 1 && styles.legalRowLast]}
              onPress={() => setActiveModal(item.modal)}
              activeOpacity={0.86}
            >
              <View style={[styles.legalIconBubble, { backgroundColor: item.bg }]}>
                <Feather name={item.icon} size={18} color={item.accent} />
              </View>
              <View style={styles.legalTextWrap}>
                <Text style={styles.legalTitle}>{item.title}</Text>
                <Text style={styles.legalSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#2B2463" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Sections */}
        <Text style={styles.sectionLabel}>Safety Notes</Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoIconBubble, { backgroundColor: section.bg }]}>
                <Feather name={section.icon} size={18} color={section.accent} strokeWidth={2.2} />
              </View>
              <Text style={styles.infoTitle}>{section.title}</Text>
            </View>
            <Text style={styles.infoText}>{section.text}</Text>
          </View>
        ))}

        {/* Launch Note */}
        <View style={styles.launchCard}>
          <Image source={require("../assets/icons/support-positive-reminder.png")} style={styles.launchIcon} resizeMode="contain" />
          <View style={styles.launchTextWrap}>
            <Text style={styles.launchTitle}>Before public launch</Text>
            <Text style={styles.launchText}>BitzaHugs will need a full Privacy Policy, Terms of Use, clear data deletion language, and stronger protections if cloud accounts or AI chat are added.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} activeOpacity={0.9} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>I Understand</Text>
          <Feather name="check" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.footerText}>This is prototype wording and should be reviewed before public launch.</Text>
      </ScrollView>

      {/* ── Modals ── */}
      <ContentModal
        visible={activeModal === "privacy"}
        title="Privacy Policy"
        icon="lock"
        iconColor="#4C9ED9"
        iconBg="#E7F4FF"
        items={PRIVACY_POLICY}
        onClose={() => setActiveModal(null)}
      />
      <ContentModal
        visible={activeModal === "terms"}
        title="Terms of Use"
        icon="file-text"
        iconColor="#D99A3D"
        iconBg="#FFF0DF"
        items={TERMS_OF_USE}
        onClose={() => setActiveModal(null)}
      />
      <ContentModal
        visible={activeModal === "community"}
        title="Community Guidelines"
        icon="users"
        iconColor="#78A866"
        iconBg="#EEF7E8"
        items={COMMUNITY_GUIDELINES}
        onClose={() => setActiveModal(null)}
      />
    </SafeAreaView>
  );
}

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFDF9", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "88%", paddingBottom: Platform.OS === "ios" ? 34 : 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD6F0", alignSelf: "center", marginTop: 10, marginBottom: 4 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFE4DC", gap: 10 },
  headerIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: "#2B2463", fontSize: 16, fontWeight: "800" },
  closeBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 16 },
  itemDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#8B5BE8", marginTop: 5, flexShrink: 0 },
  itemTextWrap: { flex: 1 },
  itemHeading: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  itemBody: { color: "#5B5672", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  noteCard: { backgroundColor: "#F6ECFF", borderRadius: 14, borderWidth: 1, borderColor: "#E3D2F8", padding: 11, flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 4, marginBottom: 4 },
  noteText: { flex: 1, color: "#6F42D8", fontSize: 11, lineHeight: 16, fontWeight: "600" },
  footer: { paddingHorizontal: 18, paddingTop: 12 },
  closeButton: { height: 48, borderRadius: 15, backgroundColor: "#8B5BE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  closeButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  topBar: { height: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  topTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  heroIcon: { width: 48, height: 48, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  noticeCard: { backgroundColor: "#FFE6E4", borderRadius: 16, borderWidth: 1, borderColor: "#FFD0C8", paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 10 },
  noticeIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  noticeTextWrap: { flex: 1 },
  noticeTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  noticeText: { color: "#2B2463", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  sectionLabel: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 8 },

  legalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, paddingVertical: 4, marginBottom: 14, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  legalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0E8E2", gap: 11 },
  legalRowLast: { borderBottomWidth: 0 },
  legalIconBubble: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  legalTextWrap: { flex: 1 },
  legalTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  legalSubtitle: { color: "#837E96", fontSize: 11, fontWeight: "600", lineHeight: 15 },

  infoCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingTop: 12, paddingBottom: 12, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  infoHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoIconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 10 },
  infoTitle: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "800" },
  infoText: { color: "#5B5672", fontSize: 12, lineHeight: 18, fontWeight: "600" },

  launchCard: { backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 11 },
  launchIcon: { width: 44, height: 44 },
  launchTextWrap: { flex: 1 },
  launchTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  launchText: { color: "#2B2463", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  doneButton: { height: 50, borderRadius: 16, backgroundColor: "#8B5BE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  doneButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});