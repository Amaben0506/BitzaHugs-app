import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  requestNotificationPermission,
  scheduleBitzaHugsNotifications,
  cancelBitzaHugsNotifications,
  sendTestNotification,
} from "../utils/notifications";
import Card from "../src/components/ui/Card";
import PressableScale from "../src/components/ui/PressableScale";
import ScreenHeader from "../src/components/ui/ScreenHeader";
import { Colors, Fonts, Type, Spacing, Radius } from "../src/theme/theme";

const PREFS_KEY = "bitzaNotificationPreferences";
const MASTER_KEY = "bitzaNotificationsMaster";

// Mirrors the IDs handled by scheduleBitzaHugsNotifications in utils/notifications.js
const OPTIONS = [
  {
    id: "daily-affirmation",
    title: "Morning Affirmation",
    subtitle: "A gentle reminder that you're doing your best",
    time: "9:00 AM",
    icon: "sun",
    bg: Colors.lavenderSurface,
    accent: Colors.purple,
  },
  {
    id: "caregiver-support",
    title: "Caregiver Encouragement",
    subtitle: "Supportive reminders just for you",
    time: "2:00 PM",
    icon: "heart",
    bg: Colors.blushSurface,
    accent: Colors.blushText,
  },
  {
    id: "calm-checkin",
    title: "Daily Check-In",
    subtitle: "A small pause to breathe, reset, or use a calming tool",
    time: "7:00 PM",
    icon: "moon",
    bg: Colors.sageSurface,
    accent: Colors.sageText,
  },
  {
    id: "journal-reflection",
    title: "Journal Reflection",
    subtitle: "A gentle prompt to reflect on what helped today",
    time: "8:30 PM",
    icon: "book-open",
    bg: "#FFF8EC",
    accent: Colors.mutedGold,
  },
];

const DEFAULT_TOGGLES = OPTIONS.reduce((acc, o) => {
  acc[o.id] = false;
  return acc;
}, {});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function NotificationPreferencesScreen({ navigation }) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [masterOn, setMasterOn] = useState(false);
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const [statusMsg, setStatusMsg] = useState("");

  const showStatus = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 2500);
  };

  // On each focus: read OS permission status + saved preferences
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const { status } = await Notifications.getPermissionsAsync();
          const granted = status === "granted";
          setPermissionGranted(granted);

          const raw = await AsyncStorage.getItem(PREFS_KEY);
          if (raw) setToggles(JSON.parse(raw));

          const masterSaved = await AsyncStorage.getItem(MASTER_KEY);
          setMasterOn(granted && masterSaved === "true");
        } catch {}
      };
      load();
    }, [])
  );

  // ── Master toggle: only place requestPermissionsAsync is called ───────────
  const handleMasterToggle = async (value) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPermissionGranted(true);
        setMasterOn(true);
        await AsyncStorage.setItem(MASTER_KEY, "true");
        await scheduleBitzaHugsNotifications(toggles);
        showStatus("Notifications enabled 💜");
      } else {
        setMasterOn(false);
        Alert.alert(
          "Notifications Blocked",
          "BitzaHugs doesn't have permission to send notifications.\n\nTo enable them, go to Settings → BitzaHugs → Notifications.",
          [{ text: "OK" }]
        );
      }
    } else {
      setMasterOn(false);
      await AsyncStorage.setItem(MASTER_KEY, "false");
      await cancelBitzaHugsNotifications();
      showStatus("Notifications turned off");
    }
  };

  // ── Individual toggle: saves + reschedules immediately ────────────────────
  const handleToggle = async (id) => {
    if (!masterOn) return;
    const next = { ...toggles, [id]: !toggles[id] };
    setToggles(next);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    await scheduleBitzaHugsNotifications(next);
  };

  // ── Test notification ─────────────────────────────────────────────────────
  const handleTest = async () => {
    if (!masterOn) {
      Alert.alert(
        "Notifications off",
        "Enable notifications first with the toggle above."
      );
      return;
    }
    const sent = await sendTestNotification();
    if (sent) {
      showStatus("Test notification sent — check back in 3 seconds 💜");
    } else {
      Alert.alert(
        "Could not send",
        "Make sure notifications are enabled in iOS Settings → BitzaHugs → Notifications."
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={["#EEE8F5", "#F5F0FA", "#FDFBFF"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        style={s.headerBg}
      />
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Status flash */}
        {statusMsg ? (
          <View style={s.statusBanner}>
            <Feather name="check-circle" size={15} color={Colors.purple} />
            <Text style={s.statusText}>{statusMsg}</Text>
          </View>
        ) : null}

        {/* ── Master toggle ── */}
        <Card style={s.masterCard}>
          <View style={s.masterRow}>
            <View
              style={[
                s.iconBubble,
                { backgroundColor: Colors.lavenderSurface },
              ]}
            >
              <Feather name="bell" size={17} color={Colors.purple} />
            </View>
            <View style={s.masterTextWrap}>
              <Text style={s.masterTitle}>Allow Notifications</Text>
              <Text style={s.masterSubtitle}>
                {masterOn
                  ? "Reminders are active"
                  : "Tap to enable gentle reminders"}
              </Text>
            </View>
            <Switch
              value={masterOn}
              onValueChange={handleMasterToggle}
              trackColor={{ false: Colors.divider, true: Colors.primaryPlum }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={Colors.divider}
            />
          </View>
          {!masterOn && (
            <Text style={s.masterHint}>
              {permissionGranted
                ? "Permission is already allowed. Tap the toggle to activate reminders."
                : "You'll be asked to allow notifications when you tap the toggle."}
            </Text>
          )}
        </Card>

        {/* ── Individual reminders ── */}
        <Text style={s.overline}>Reminders</Text>
        <Card style={s.togglesCard}>
          {OPTIONS.map((opt, i) => (
            <View
              key={opt.id}
              style={[s.optRow, i === OPTIONS.length - 1 && s.optRowLast]}
            >
              <View
                style={[
                  s.iconBubble,
                  { backgroundColor: opt.bg },
                  !masterOn && s.bubbleDim,
                ]}
              >
                <Feather name={opt.icon} size={16} color={opt.accent} />
              </View>
              <View style={s.optTextWrap}>
                <Text style={[s.optTitle, !masterOn && s.dimText]}>
                  {opt.title}
                </Text>
                <Text style={s.optSubtitle}>{opt.subtitle}</Text>
              </View>
              <View style={s.optRight}>
                <Text style={[s.optTime, !masterOn && s.dimText]}>
                  {opt.time}
                </Text>
                <Switch
                  value={masterOn && !!toggles[opt.id]}
                  onValueChange={() => handleToggle(opt.id)}
                  disabled={!masterOn}
                  trackColor={{
                    false: Colors.divider,
                    true: Colors.primaryPlum,
                  }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={Colors.divider}
                  style={s.optSwitch}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* ── Test notification ── */}
        <Text style={s.overline}>Testing</Text>
        <Card>
          <PressableScale onPress={handleTest}>
            <View style={s.testRow}>
              <View
                style={[
                  s.iconBubble,
                  { backgroundColor: Colors.lavenderSurface },
                  !masterOn && s.bubbleDim,
                ]}
              >
                <Feather name="send" size={16} color={Colors.purple} />
              </View>
              <View style={s.testTextWrap}>
                <Text style={[s.optTitle, !masterOn && s.dimText]}>
                  Send a test notification
                </Text>
                <Text style={s.optSubtitle}>Arrives in about 3 seconds</Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={masterOn ? Colors.grayLavender : Colors.divider}
              />
            </View>
          </PressableScale>
        </Card>

        {/* ── Info note ── */}
        <Card tint="lavender" style={s.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={Colors.purple}
          />
          <Text style={s.noteText}>
            Reminders repeat daily at the times shown. Changes apply immediately
            — no Save button needed. Time customization is coming soon.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FDFBFF" },
  headerBg: { backgroundColor: "transparent" },
  scroll: { flex: 1, backgroundColor: "transparent" },
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

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  statusText: { ...Type.caption, color: Colors.purple, fontWeight: "700" },

  // Master toggle
  masterCard: { paddingVertical: Spacing.md, gap: Spacing.sm },
  masterRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  masterTextWrap: { flex: 1 },
  masterTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  masterSubtitle: { ...Type.bodySmall, color: Colors.textMuted },
  masterHint: {
    ...Type.caption,
    color: Colors.textMuted,
    lineHeight: 16,
    marginLeft: 36 + Spacing.md, // align with text (icon width + gap)
  },

  // Shared icon bubble
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubbleDim: { opacity: 0.45 },

  // Toggle rows (inside a shared Card with default horizontal padding)
  togglesCard: { paddingVertical: Spacing.xs },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    gap: Spacing.md,
  },
  optRowLast: { borderBottomWidth: 0 },
  optTextWrap: { flex: 1 },
  optTitle: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 2 },
  optSubtitle: { ...Type.caption, color: Colors.textMuted, lineHeight: 15 },
  optRight: { alignItems: "flex-end", gap: 2 },
  optTime: {
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  optSwitch: {
    transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }],
    marginRight: -4,
  },
  dimText: { color: Colors.grayLavender },

  // Test row
  testRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 50,
  },
  testTextWrap: { flex: 1 },

  // Info note
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  noteText: { flex: 1, ...Type.caption, color: Colors.purple, lineHeight: 16 },
});
