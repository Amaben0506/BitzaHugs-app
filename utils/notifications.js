// ─── BitzaHugs Notification Service ──────────────────────────────────────────
// Safe for Expo Go on Android.
// In Expo Go Android, notifications are disabled gracefully instead of crashing.

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";

const NOTIFICATION_CATEGORY = "bitzahugs-reminders";
const NOTIFICATION_PREFS_KEY = "bitzaNotificationPreferences";

const isExpoGoAndroid =
  Platform.OS === "android" &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const AFFIRMATIONS = [
  {
    title: "You are doing better than you think. 💜",
    body: "Caring this much already says everything.",
  },
  {
    title: "Hard moments don't last forever.",
    body: "You've made it through every difficult day so far.",
  },
  {
    title: "You are not failing. 🌱",
    body: "You're learning, growing, and showing up every day.",
  },
  {
    title: "Rest is not giving up.",
    body: "Taking care of yourself helps you show up for your child.",
  },
  {
    title: "You matter too. 💜",
    body: "Your needs, your feelings, your wellbeing — they all count.",
  },
];

const CAREGIVER_MESSAGES = [
  {
    title: "Caregiver encouragement 🤍",
    body: "You matter too. Pause for a second and soften your shoulders.",
  },
  {
    title: "A little reminder for you",
    body: "You do not have to do everything perfectly to be doing enough.",
  },
  {
    title: "BitzaHugs is checking in 💜",
    body: "Take one breath. You are allowed to need support too.",
  },
];

const CALM_CHECKINS = [
  {
    title: "Calm check-in",
    body: "Need a reset? Open BitzaHugs for a calming tool or support moment.",
  },
  {
    title: "Tiny reset moment",
    body: "Unclench your jaw, drop your shoulders, and take one slow breath.",
  },
];

const JOURNAL_PROMPTS = [
  {
    title: "Journal reflection",
    body: "What helped today, even a little?",
  },
  {
    title: "A gentle journal prompt",
    body: "What is one thing you handled today?",
  },
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function getNotificationsModule() {
  if (isExpoGoAndroid) {
    return null;
  }

  const Notifications = await import("expo-notifications");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return Notifications;
}

export async function setupNotificationChannel() {
  const Notifications = await getNotificationsModule();

  if (!Notifications) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("bitzahugs-reminders", {
      name: "BitzaHugs Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7548D8",
    });
  }

  return true;
}

export async function requestNotificationPermission() {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return false;
  }

  await setupNotificationChannel();

  const existing = await Notifications.getPermissionsAsync();

  if (existing.status === "granted") {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();

  return requested.status === "granted";
}

async function scheduleDailyReminder({ id, title, body, hour, minute }) {
  const Notifications = await getNotificationsModule();

  if (!Notifications) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: {
        id,
        category: NOTIFICATION_CATEGORY,
      },
    },
    trigger: {
      channelId: Platform.OS === "android" ? "bitzahugs-reminders" : undefined,
      hour,
      minute,
      repeats: true,
    },
  });

  return notificationId;
}

export async function cancelBitzaHugsNotifications() {
  try {
    const Notifications = await getNotificationsModule();

    if (!Notifications) {
      await AsyncStorage.removeItem("bitzaScheduledNotificationIds");
      return true;
    }

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    const bitzaNotifications = scheduled.filter(
      (notification) =>
        notification.content?.data?.category === NOTIFICATION_CATEGORY
    );

    await Promise.all(
      bitzaNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
    );

    await AsyncStorage.removeItem("bitzaScheduledNotificationIds");

    return true;
  } catch (error) {
    console.log("Error cancelling BitzaHugs notifications:", error);
    return false;
  }
}

export async function scheduleBitzaHugsNotifications(preferences) {
  try {
    await AsyncStorage.setItem(
      NOTIFICATION_PREFS_KEY,
      JSON.stringify(preferences)
    );

    if (isExpoGoAndroid) {
      return {
        success: false,
        message:
          "Preferences saved. Notifications need a development build on Android.",
      };
    }

    // Check permission without requesting. Permission is requested only from
    // the master toggle in NotificationPreferencesScreen, never buried here.
    const NCheck = await getNotificationsModule();
    if (!NCheck) return { success: false, message: "Preferences saved." };
    const { status } = await NCheck.getPermissionsAsync();
    if (status !== "granted") {
      return {
        success: false,
        message: "Preferences saved. Enable notifications to receive reminders.",
      };
    }

    await cancelBitzaHugsNotifications();

    const jobs = [];

    if (preferences["daily-affirmation"]) {
      const affirmation = pickRandom(AFFIRMATIONS);

      jobs.push(
        scheduleDailyReminder({
          id: "daily-affirmation",
          title: affirmation.title,
          body: affirmation.body,
          hour: 9,
          minute: 0,
        })
      );
    }

    if (preferences["caregiver-support"]) {
      const message = pickRandom(CAREGIVER_MESSAGES);

      jobs.push(
        scheduleDailyReminder({
          id: "caregiver-support",
          title: message.title,
          body: message.body,
          hour: 14,
          minute: 0,
        })
      );
    }

    if (preferences["calm-checkin"]) {
      const checkin = pickRandom(CALM_CHECKINS);

      jobs.push(
        scheduleDailyReminder({
          id: "calm-checkin",
          title: checkin.title,
          body: checkin.body,
          hour: 19,
          minute: 0,
        })
      );
    }

    if (preferences["journal-reflection"]) {
      const journalPrompt = pickRandom(JOURNAL_PROMPTS);

      jobs.push(
        scheduleDailyReminder({
          id: "journal-reflection",
          title: journalPrompt.title,
          body: journalPrompt.body,
          hour: 20,
          minute: 30,
        })
      );
    }

    const notificationIds = await Promise.all(jobs);

    await AsyncStorage.setItem(
      "bitzaScheduledNotificationIds",
      JSON.stringify(notificationIds.filter(Boolean))
    );

    return {
      success: true,
      message: `${jobs.length} reminder${jobs.length === 1 ? "" : "s"} scheduled.`,
    };
  } catch (error) {
    console.log("Error scheduling BitzaHugs notifications:", error);

    return {
      success: false,
      message: "Something went wrong scheduling reminders.",
    };
  }
}

export async function getScheduledBitzaHugsNotifications() {
  try {
    const Notifications = await getNotificationsModule();

    if (!Notifications) return [];

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    return scheduled.filter(
      (notification) =>
        notification.content?.data?.category === NOTIFICATION_CATEGORY
    );
  } catch (error) {
    console.log("Error getting scheduled notifications:", error);
    return [];
  }
}

export async function sendTestNotification() {
  try {
    if (isExpoGoAndroid) {
      console.log(
        "Test notifications need a development build on Android Expo Go."
      );
      return false;
    }

    const Notifications = await getNotificationsModule();

    if (!Notifications) return false;

    // Check only — never request. If master toggle is on, permission is already granted.
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      return false;
    }

    const affirmation = pickRandom(AFFIRMATIONS);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: affirmation.title,
        body: affirmation.body,
        sound: "default",
        data: {
          id: "test-notification",
          category: NOTIFICATION_CATEGORY,
        },
      },
      trigger: {
        seconds: 3,
      },
    });

    return true;
  } catch (error) {
    console.log("Error sending test notification:", error);
    return false;
  }
}

export async function scheduleTrialNudges() {
  if (isExpoGoAndroid) return;
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;
  const channelId = Platform.OS === "android" ? "bitzahugs-reminders" : undefined;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hugi has something for you 💜",
      body: "Open BitzaHugs to see what Hugi wants to share.",
      sound: "default",
      data: { screen: "Support" },
    },
    trigger: { channelId, seconds: 36 * 60 * 60 },
  });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your free trial ends in 2 days",
      body: "Keep access to Hugi and all premium features.",
      sound: "default",
      data: { screen: "PremiumUpgrade" },
    },
    trigger: { channelId, seconds: 5 * 24 * 60 * 60 },
  });
}

export async function scheduleStreakProtection() {
  if (isExpoGoAndroid) return null;
  const Notifications = await getNotificationsModule();
  if (!Notifications) return null;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't lose your streak 🔥",
      body: "Check in with BitzaHugs to keep your streak going.",
      sound: "default",
      data: { screen: "Home" },
    },
    trigger: {
      channelId: Platform.OS === "android" ? "bitzahugs-reminders" : undefined,
      seconds: 22 * 60 * 60,
    },
  });
}

// ─── Backward-compatible old function names ───────────────────────────────────

export async function registerForNotifications() {
  return requestNotificationPermission();
}

export async function scheduleDailyAffirmation(hour = 9, minute = 0) {
  const preferences = {
    "daily-affirmation": true,
    "routine-reminder": false,
    "calm-checkin": false,
    "caregiver-support": false,
    "journal-reflection": false,
  };

  return scheduleBitzaHugsNotifications(preferences, hour, minute);
}

export async function cancelDailyAffirmation() {
  return cancelBitzaHugsNotifications();
}

export async function cancelAllNotifications() {
  return cancelBitzaHugsNotifications();
}

export async function getNotificationStatus() {
  try {
    const preferences = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    const scheduled = await getScheduledBitzaHugsNotifications();

    if (isExpoGoAndroid) {
      return {
        enabled: false,
        permissionGranted: false,
        preferences: preferences ? JSON.parse(preferences) : null,
        scheduledCount: 0,
        expoGoAndroid: true,
      };
    }

    const Notifications = await getNotificationsModule();
    const permissions = await Notifications.getPermissionsAsync();

    return {
      enabled: scheduled.length > 0,
      permissionGranted: permissions.status === "granted",
      preferences: preferences ? JSON.parse(preferences) : null,
      scheduledCount: scheduled.length,
      expoGoAndroid: false,
    };
  } catch (error) {
    return {
      enabled: false,
      permissionGranted: false,
      preferences: null,
      scheduledCount: 0,
      expoGoAndroid: isExpoGoAndroid,
    };
  }
}