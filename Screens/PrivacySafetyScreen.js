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
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import Card from "../src/components/ui/Card";
import PressableScale from "../src/components/ui/PressableScale";
import ScreenHeader from "../src/components/ui/ScreenHeader";
import PrimaryButton from "../src/components/ui/PrimaryButton";
import { Colors, Fonts, Type, Spacing, Radius, Shadows } from "../src/theme/theme";

// ─── Safety note sections ─────────────────────────────────────────────────────
const sections = [
  {
    title: "Hugi Safety Note",
    icon: "message-circle",
    bg: Colors.lavenderSurface,
    accent: Colors.purple,
    text: "Hugi is here to support you, not replace professional care. Hugi can offer gentle encouragement, calming steps, journaling prompts, and parenting support tools. Hugi is not a therapist, doctor, crisis counselor, emergency service, or medical provider.",
  },
  {
    title: "Emotional Support Disclaimer",
    icon: "heart",
    bg: Colors.blushSurface,
    accent: Colors.blushText,
    text: "BitzaHugs is a support tool, not a diagnosis or treatment plan. The app is meant to help with routines, emotional check-ins, calming strategies, journaling, and family support. It should not replace medical, behavioral, mental health, therapy, or emergency advice.",
  },
  {
    title: "Child & Family Data",
    icon: "users",
    bg: "#E7F4FF",
    accent: "#4C9ED9",
    text: "Your family details are sensitive. BitzaHugs may let you save information like child profiles, triggers, calming strategies, routines, support contacts, and journal entries. For this prototype, saved information is stored locally on this device.",
  },
  {
    title: "Journal Privacy",
    icon: "book-open",
    bg: Colors.sageSurface,
    accent: Colors.sageText,
    text: "Your journal is personal. Journal entries may include emotional or private thoughts. In this prototype, saved entries stay in local device storage. Before public launch, BitzaHugs will clearly explain how journal entries are stored, protected, and deleted.",
  },
  {
    title: "Emergency Reminder",
    icon: "alert-triangle",
    bg: "#FFF0DF",
    accent: Colors.mutedGold,
    text: "BitzaHugs is not for emergencies. If there is immediate danger, abuse, severe injury, medical crisis, or risk of harm to yourself, your child, or someone else, contact emergency services immediately.",
  },
];

// ─── Modal content ────────────────────────────────────────────────────────────
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
  { heading: "Community", body: "BitzaHugs includes a moderated peer-support community. To take part, you agree to community guidelines. You post under a chosen display name, not your real name. Posts and comments that violate the guidelines may be hidden or removed, and repeat violations may result in removal from the community." },
  { heading: "Premium subscriptions", body: "Premium features are available via monthly or annual subscription. Subscriptions auto-renew unless cancelled. Manage subscriptions in your App Store or Google Play settings." },
  { heading: "Your content", body: "Journal entries, routine notes, and profile information you enter remain yours. We do not claim ownership of your personal content." },
  { heading: "Prototype disclaimer", body: "BitzaHugs is currently in prototype/beta. Features may change, data may be reset, and the app is not yet available on the public App Store." },
];

const COMMUNITY_GUIDELINES = [
  { heading: "Be kind", body: "This is a space for caregivers supporting each other. Treat others with the compassion you'd want on your hardest day." },
  { heading: "Protect privacy", body: "Post under a display name, not your real name. Do not share full names, addresses, phone numbers, emails, or other identifying details — yours, your child's, or anyone else's." },
  { heading: "No harassment or hate", body: "Bullying, harassment, targeting, hate speech, or intimidation is not allowed and may result in immediate removal from the community." },
  { heading: "Peer support, not professional advice", body: "The community is peer support from other caregivers — not medical, legal, therapeutic, or crisis advice. Always seek a qualified professional when needed." },
  { heading: "No objectionable content", body: "Do not post graphic, sexual, dangerous, or illegal content. Content that breaks these rules may be filtered or removed." },
  { heading: "Report and block", body: "Every post and comment has a report option, and you can block any user so you no longer see their content. Reports are reviewed by moderators, typically within 24 hours." },
  { heading: "Consequences", body: "Content that violates these guidelines may be hidden or removed. Accounts that repeatedly or seriously violate them may lose community access." },
];

// ─── Content modal ────────────────────────────────────────────────────────────
function ContentModal({ visible, title, icon, iconColor, iconBg, items, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.handle} />

          {/* Header */}
          <View style={m.header}>
            <View style={[m.headerIcon, { backgroundColor: iconBg }]}>
              <Feather name={icon} size={17} color={iconColor} />
            </View>
            <Text style={m.headerTitle}>{title}</Text>
            <TouchableOpacity style={m.closeX} onPress={onClose} activeOpacity={0.8}>
              <Feather name="x" size={16} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={m.scroll}
            contentContainerStyle={m.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item, i) => (
              <View key={i} style={m.item}>
                <View style={m.dot} />
                <View style={m.itemText}>
                  <Text style={m.itemHeading}>{item.heading}</Text>
                  <Text style={m.itemBody}>{item.body}</Text>
                </View>
              </View>
            ))}

            <View style={m.noteCard}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.purple} />
              <Text style={m.noteText}>
                This is prototype wording. Full legal language will be reviewed by an attorney before public launch.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={m.footer}>
            <PressableScale onPress={onClose} style={m.gotItBtn}>
              <Text style={m.gotItText}>Got it</Text>
              <Feather name="check" size={15} color="#fff" />
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
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
      accent: Colors.mutedGold,
      modal: "terms",
    },
    {
      title: "Community Guidelines",
      subtitle: "How we keep the caregiver community safe and welcoming",
      icon: "users",
      bg: Colors.sageSurface,
      accent: Colors.sageText,
      modal: "community",
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={["#EEE8F5", "#F5F0FA", "#FDFBFF"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScreenHeader
        title="Privacy & Safety"
        onBack={() => navigation.goBack()}
        style={s.headerBg}
      />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Hero */}
        <Card style={s.heroCard}>
          <Image
            source={require("../assets/icons/support-heart-hug.png")}
            style={s.heroImage}
            resizeMode="contain"
          />
          <View style={s.heroText}>
            <Text style={s.heroTitle}>Your family's safety matters.</Text>
            <Text style={s.heroBody}>
              BitzaHugs is meant to support calm moments, not replace professional care or emergency help.
            </Text>
          </View>
        </Card>

        {/* Emergency notice */}
        <Card tint="blush" style={s.noticeCard}>
          <View style={s.noticeIconWrap}>
            <Feather name="alert-triangle" size={18} color={Colors.blushText} />
          </View>
          <View style={s.noticeTextWrap}>
            <Text style={s.noticeTitle}>Important</Text>
            <Text style={s.noticeBody}>
              If there is immediate danger, a medical emergency, or risk of harm, contact emergency services right away.
            </Text>
          </View>
        </Card>

        {/* Legal & Guidelines */}
        <Text style={s.overline}>Legal & Guidelines</Text>
        <Card>
          {legalItems.map((item, i) => (
            <PressableScale
              key={item.title}
              onPress={() => setActiveModal(item.modal)}
            >
              <View style={[s.row, i === legalItems.length - 1 && s.rowLast]}>
                <View style={[s.iconBubble, { backgroundColor: item.bg }]}>
                  <Feather name={item.icon} size={17} color={item.accent} />
                </View>
                <View style={s.rowText}>
                  <Text style={s.rowTitle}>{item.title}</Text>
                  <Text style={s.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={Colors.grayLavender} />
              </View>
            </PressableScale>
          ))}
        </Card>

        {/* Safety Notes */}
        <Text style={s.overline}>Safety Notes</Text>
        {sections.map((section) => (
          <Card key={section.title} style={s.infoCard}>
            <View style={s.infoHeader}>
              <View style={[s.iconBubble, { backgroundColor: section.bg }]}>
                <Feather name={section.icon} size={17} color={section.accent} />
              </View>
              <Text style={s.infoTitle}>{section.title}</Text>
            </View>
            <Text style={s.infoBody}>{section.text}</Text>
          </Card>
        ))}

        {/* Launch note */}
        <Card tint="lavender" style={s.launchCard}>
          <Image
            source={require("../assets/icons/support-positive-reminder.png")}
            style={s.launchImage}
            resizeMode="contain"
          />
          <View style={s.launchText}>
            <Text style={s.launchTitle}>Before public launch</Text>
            <Text style={s.launchBody}>
              BitzaHugs maintains a Privacy Policy and Terms of Use, provides in-app data deletion, and applies community safeguards including content moderation, reporting, and blocking for user-generated content.
            </Text>
          </View>
        </Card>

        <PrimaryButton
          label="I Understand"
          onPress={() => navigation.goBack()}
        />

        <Text style={s.footer}>
          This is prototype wording and should be reviewed before public launch.
        </Text>
      </ScrollView>

      {/* Modals */}
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
        iconColor={Colors.mutedGold}
        iconBg="#FFF0DF"
        items={TERMS_OF_USE}
        onClose={() => setActiveModal(null)}
      />
      <ContentModal
        visible={activeModal === "community"}
        title="Community Guidelines"
        icon="users"
        iconColor={Colors.sageText}
        iconBg={Colors.sageSurface}
        items={COMMUNITY_GUIDELINES}
        onClose={() => setActiveModal(null)}
      />
    </SafeAreaView>
  );
}

// ─── Modal styles ─────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(43, 30, 75, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: "88%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    ...Shadows.raised,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    gap: Spacing.sm,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...Type.heading, color: Colors.textPrimary, flex: 1 },
  closeX: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.purple,
    marginTop: 6,
    flexShrink: 0,
  },
  itemText: { flex: 1 },
  itemHeading: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 3 },
  itemBody: { ...Type.bodySmall, color: Colors.textMuted, lineHeight: 18 },
  noteCard: {
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: 4,
    marginBottom: 4,
  },
  noteText: { flex: 1, ...Type.caption, color: Colors.purple, lineHeight: 16 },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  gotItBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.purple,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    ...Shadows.button,
  },
  gotItText: { ...Type.button, color: "#fff" },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: "#FDFBFF" },
  headerBg:{ backgroundColor: "transparent" },
  scroll:  { flex: 1, backgroundColor: "transparent" },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
    gap: Spacing.sm,
  },

  overline: {
    ...Type.overline,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    marginBottom: 2,
    marginLeft: 4,
  },

  // Hero card
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  heroImage:  { width: 52, height: 52, flexShrink: 0 },
  heroText:   { flex: 1 },
  heroTitle:  { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 4 },
  heroBody:   { ...Type.bodySmall, color: Colors.textMuted, lineHeight: 17 },

  // Notice card
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  noticeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  noticeTextWrap: { flex: 1 },
  noticeTitle:    { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 3 },
  noticeBody:     { ...Type.bodySmall, color: Colors.textPrimary, lineHeight: 17 },

  // Legal rows (inside a single Card)
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    paddingVertical: 8,
    gap: Spacing.md,
  },
  rowLast:    { borderBottomWidth: 0 },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText:    { flex: 1 },
  rowTitle:   { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 2 },
  rowSubtitle:{ ...Type.bodySmall, color: Colors.textMuted },

  // Info section cards
  infoCard: { gap: Spacing.sm, paddingVertical: Spacing.md },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  infoTitle: { ...Type.cardTitle, color: Colors.textPrimary, flex: 1 },
  infoBody:  { ...Type.body, color: Colors.textSecondary, lineHeight: 21 },

  // Launch note card
  launchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  launchImage: { width: 48, height: 48, flexShrink: 0 },
  launchText:  { flex: 1 },
  launchTitle: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 4 },
  launchBody:  { ...Type.bodySmall, color: Colors.textSecondary, lineHeight: 17 },

  // Footer
  footer: {
    ...Type.caption,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
    marginTop: Spacing.sm,
  },
});
