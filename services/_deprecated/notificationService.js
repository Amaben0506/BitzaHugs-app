import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

const isExpoGoAndroid =
  Platform.OS === "android" &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const CHANNEL_ID = "bitzahugs-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AFFIRMATIONS = [
  "You are doing better than you think. 💜",
  "Hard moments don't last forever. You've made it through every difficult day so far.",
  "You are not failing. You're learning, growing, and showing up every day.",
  "Rest is not giving up. Taking care of yourself helps you show up for your child.",
  "You matter too. Your needs, your feelings, your wellbeing — they all count.",
];

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "BitzaHugs Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#7548D8",
  });
}

const androidChannel = Platform.OS === "android" ? CHANNEL_ID : undefined;

/** Requests permission and returns the Expo push token, or null if unavailable. */
export async function registerForPushNotifications() {
  if (isExpoGoAndroid || !Device.isDevice) return null;

  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  return token.data;
}

/** Schedules a repeating daily check-in at the given hour. */
export async function scheduleDailyCheckIn(hour = 9) {
  if (isExpoGoAndroid) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Good morning 💜",
      body: "How are you and your little one doing today?",
      sound: "default",
      data: { screen: "Home" },
    },
    trigger: { channelId: androidChannel, hour, minute: 0, repeats: true },
  });
}

/** Schedules a one-time streak protection nudge 22 hours from now. */
export async function scheduleStreakProtection() {
  if (isExpoGoAndroid) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't lose your streak 🔥",
      body: "Check in with BitzaHugs to keep your streak going.",
      sound: "default",
      data: { screen: "Home" },
    },
    trigger: { channelId: androidChannel, seconds: 22 * 60 * 60 },
  });
}

/** Schedules a repeating daily affirmation at hour:15. Rotates through 5 messages. */
export async function scheduleMorningAffirmation(hour = 8) {
  if (isExpoGoAndroid) return null;
  const body = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "A gentle reminder for you 💜",
      body,
      sound: "default",
      data: { screen: "Home" },
    },
    trigger: { channelId: androidChannel, hour, minute: 15, repeats: true },
  });
}

/**
 * Schedules two trial nudges:
 * - 36 h → Support screen
 * - 5 days → PremiumUpgrade screen
 */
export async function scheduleTrialNudges() {
  if (isExpoGoAndroid) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hugi has something for you 💜",
      body: "Open BitzaHugs to see what Hugi wants to share.",
      sound: "default",
      data: { screen: "Support" },
    },
    trigger: { channelId: androidChannel, seconds: 36 * 60 * 60 },
  });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your free trial ends in 2 days",
      body: "Keep access to Hugi and all premium features.",
      sound: "default",
      data: { screen: "PremiumUpgrade" },
    },
    trigger: { channelId: androidChannel, seconds: 5 * 24 * 60 * 60 },
  });
}
