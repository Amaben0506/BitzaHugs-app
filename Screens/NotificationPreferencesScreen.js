import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  scheduleBitzaHugsNotifications,
  cancelBitzaHugsNotifications,
  sendTestNotification,
} from "../utils/notifications";

const PURPLE = "#2D246B";
const ACCENT = "#7548D8";
const NOTIFICATION_PREFS_KEY = "bitzaNotificationPreferences";

const notificationOptions = [
  {
    id: "daily-affirmation",
    title: "Daily Affirmation",
    description: "A gentle reminder that you’re doing your best.",
    icon: "heart-outline",
    color: "#EF6F8D",
    bg: "#FFE8EF",
    enabled: true,
  },
  {
    id: "routine-reminder",
    title: "Routine Reminder",
    description: "A soft nudge to check routines during the day.",
    icon: "calendar-outline",
    color: "#4C9ED9",
    bg: "#E7F4FF",
    enabled: true,
  },
  {
    id: "calm-checkin",
    title: "Calm Check-In",
    description: "A small pause to breathe, reset, or use a calming tool.",
    icon: "leaf-outline",
    color: "#7FA66A",
    bg: "#EEF5E9",
    enabled: false,
  },
  {
    id: "caregiver-support",
    title: "Caregiver Encouragement",
    description: "Supportive reminders just for you.",
    icon: "sparkles-outline",
    color: "#8C55F6",
    bg: "#F3EAFE",
    enabled: true,
  },
  {
    id: "journal-reflection",
    title: "Journal Reflection",
    description: "A gentle prompt to write down what helped today.",
    icon: "book-outline",
    color: "#D99A3D",
    bg: "#FFF0DF",
    enabled: false,
  },
];

export default function NotificationPreferencesScreen({ navigation }) {
  const [toggles, setToggles] = useState(
    notificationOptions.reduce((acc, item) => {
      acc[item.id] = item.enabled;
      return acc;
    }, {})
  );

  const [savedMessage, setSavedMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadPreferences = async () => {
        try {
          const saved = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);

          if (saved) {
            const parsed = JSON.parse(saved);
            setToggles(parsed);
          }
        } catch (error) {
          console.log("Error loading notification preferences:", error);
        }
      };

      loadPreferences();
    }, [])
  );

  const showMessage = (message) => {
    setSavedMessage(message);

    setTimeout(() => {
      setSavedMessage("");
    }, 2600);
  };

  const toggleOption = (id) => {
    setToggles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_PREFS_KEY,
        JSON.stringify(toggles)
      );

      const result = await scheduleBitzaHugsNotifications(toggles);

      if (result?.success) {
        showMessage(result.message || "Preferences saved 💜");
      } else {
        showMessage(result?.message || "Preferences saved. Notifications not enabled.");
      }
    } catch (error) {
      console.log("Error saving notification preferences:", error);
      Alert.alert(
        "Oops",
        "Something went wrong saving your notification preferences."
      );
    }
  };

  const turnAllOff = async () => {
    const allOff = notificationOptions.reduce((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {});

    try {
      setToggles(allOff);

      await AsyncStorage.setItem(
        NOTIFICATION_PREFS_KEY,
        JSON.stringify(allOff)
      );

      await cancelBitzaHugsNotifications();

      showMessage("All reminders turned off");
    } catch (error) {
      console.log("Error turning off notifications:", error);
      Alert.alert("Oops", "Something went wrong turning reminders off.");
    }
  };

  const handleSendTestNotification = async () => {
    try {
      const sent = await sendTestNotification();

      if (sent) {
        showMessage("Test notification sent 💜");
      } else {
        Alert.alert(
          "Notifications not enabled",
          "Please allow notifications to send a test reminder."
        );
      }
    } catch (error) {
      console.log("Error sending test notification:", error);
      Alert.alert("Oops", "Something went wrong sending the test notification.");
    }
  };

  const selectedCount = Object.values(toggles).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F2" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={PURPLE} />
          </TouchableOpacity>

          <Text style={styles.title}>Notifications</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Saved Banner */}
        {savedMessage ? (
          <View style={styles.savedBanner}>
            <Feather name="check-circle" size={16} color={ACCENT} />
            <Text style={styles.savedText}>{savedMessage}</Text>
          </View>
        ) : null}

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="notifications-outline" size={28} color={ACCENT} />
          </View>

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Gentle reminders</Text>
            <Text style={styles.heroText}>
              Choose the reminders that feel helpful. When you save, BitzaHugs
              will schedule the reminders you selected.
            </Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusCard}>
          <Ionicons name="heart-outline" size={18} color={ACCENT} />
          <Text style={styles.statusText}>
            {selectedCount > 0
              ? `${selectedCount} reminder${
                  selectedCount === 1 ? "" : "s"
                } selected`
              : "All reminders are currently turned off"}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionList}>
          {notificationOptions.map((item) => {
            const isEnabled = toggles[item.id];

            return (
              <View key={item.id} style={styles.optionCard}>
                <View
                  style={[
                    styles.optionIconBox,
                    { backgroundColor: item.bg },
                  ]}
                >
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>

                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionDescription}>
                    {item.description}
                  </Text>
                </View>

                <Switch
                  value={isEnabled}
                  onValueChange={() => toggleOption(item.id)}
                  trackColor={{ false: "#D8D5D3", true: ACCENT }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#D8D5D3"
                  style={styles.switch}
                  accessibilityLabel={item.title}
                />
              </View>
            );
          })}
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#4C9ED9"
          />
          <Text style={styles.noteText}>
            Test notifications usually appear after a few seconds. Scheduled
            reminders will repeat daily based on your saved choices.
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePreferences}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Save notification preferences"
        >
          <Text style={styles.saveButtonText}>Save Preferences</Text>
          <Ionicons name="checkmark" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={handleSendTestNotification}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Send test notification"
        >
          <Ionicons name="paper-plane-outline" size={18} color={ACCENT} />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.offButton}
          onPress={turnAllOff}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Turn all reminders off"
        >
          <Text style={styles.offButtonText}>Turn all reminders off</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF9F2",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 16,
    paddingBottom: 90,
  },

  header: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0E2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3D2F8",
  },

  title: {
    fontSize: 17,
    fontWeight: "800",
    color: PURPLE,
  },

  headerSpacer: {
    width: 38,
  },

  savedBanner: {
    minHeight: 40,
    borderRadius: 13,
    backgroundColor: "#F0E2FF",
    borderWidth: 1,
    borderColor: "#E3D2F8",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  savedText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: "800",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFE4DC",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },

  heroIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F0E2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  heroTextWrap: {
    flex: 1,
  },

  heroTitle: {
    color: PURPLE,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },

  heroText: {
    color: "#5B5672",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  statusCard: {
    backgroundColor: "#F6ECFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E3D2F8",
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },

  statusText: {
    flex: 1,
    color: PURPLE,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "800",
  },

  optionList: {
    gap: 9,
    marginBottom: 12,
  },

  optionCard: {
    minHeight: 74,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE4DC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#BFA99D",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },

  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  optionTextWrap: {
    flex: 1,
    paddingRight: 6,
  },

  optionTitle: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 2,
  },

  optionDescription: {
    color: "#6C6284",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "600",
  },

  switch: {
    transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }],
    marginRight: -4,
  },

  noteCard: {
    backgroundColor: "#E7F4FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C8E3F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 14,
  },

  noteText: {
    flex: 1,
    color: "#5B5672",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },

  saveButton: {
    height: 56,
    borderRadius: 20,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: ACCENT,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    marginBottom: 10,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  testButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F0E2FF",
    borderWidth: 1,
    borderColor: "#E3D2F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },

  testButtonText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: "900",
  },

  offButton: {
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3D2F8",
    alignItems: "center",
    justifyContent: "center",
  },

  offButtonText: {
    color: "#837E96",
    fontSize: 13,
    fontWeight: "800",
  },
});