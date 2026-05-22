// ─── BitzaHugs Notification Service ──────────────────────────────────────────
// notifications.js — place this in your Screens/ folder or a utils/ folder
// Usage: import { registerForNotifications, scheduleDailyAffirmation, cancelAllNotifications } from "../utils/notifications";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Affirmations List ────────────────────────────────────────────────────────
const AFFIRMATIONS = [
  { title: "You are doing better than you think. 💜", body: "Caring this much already says everything." },
  { title: "Hard moments don't last forever.", body: "You've made it through every difficult day so far." },
  { title: "You are not failing. 🌱", body: "You're learning, growing, and showing up every day." },
  { title: "Rest is not giving up.", body: "Taking care of yourself helps you show up for your child." },
  { title: "You are exactly the caregiver your child needs.", body: "Not perfect — just present. That's everything." },
  { title: "One small step still counts. 💜", body: "Progress doesn't have to be big to be real." },
  { title: "It's okay to ask for help.", body: "Strength looks like reaching out, not going it alone." },
  { title: "Your child is lucky to have you.", body: "The fact that you care this deeply matters more than you know." },
  { title: "You survived yesterday. 🌟", body: "That means you can get through today too." },
  { title: "Breathe. You've got this.", body: "One moment, one breath, one step at a time." },
  { title: "Your love is your child's safe place.", body: "Even on hard days, your presence is their comfort." },
  { title: "Imperfect days are still good days.", body: "You don't have to do everything right to do something right." },
  { title: "You matter too. 💜", body: "Your needs, your feelings, your wellbeing — they all count." },
  { title: "This is hard. You're doing it anyway.", body: "That's not just strength — that's extraordinary." },
  { title: "You are not alone in this. 🤍", body: "There are others who understand exactly what you're carrying." },
  { title: "Every routine you build is an act of love.", body: "Structure feels like safety to a child who needs it." },
  { title: "Be gentle with yourself today.", body: "You'd show grace to others — you deserve it too." },
  { title: "Something good is coming. 🌅", body: "Even the hardest seasons have moments of light." },
  { title: "You noticed what your child needed.", body: "That kind of awareness is a superpower." },
  { title: "Today you showed up. That's enough. 💜", body: "Showing up, even imperfectly, is everything." },
];

// ─── Configure how notifications appear when app is foregrounded ──────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Request permission ───────────────────────────────────────────────────────
export async function registerForNotifications() {
  if (!Device.isDevice) {
    console.log("Notifications only work on physical devices.");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission not granted.");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("bitzahugs-daily", {
      name: "Daily Affirmations",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7548D8",
    });
  }

  return true;
}

// ─── Schedule daily affirmation ───────────────────────────────────────────────
export async function scheduleDailyAffirmation(hour = 8, minute = 0) {
  try {
    // Cancel any existing affirmation notifications
    await cancelDailyAffirmation();

    const granted = await registerForNotifications();
    if (!granted) return false;

    // Pick a random affirmation
    const affirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];

    // Schedule repeating daily notification
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: affirmation.title,
        body: affirmation.body,
        sound: false,
        data: { type: "daily_affirmation" },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: Platform.OS === "android" ? "bitzahugs-daily" : undefined,
      },
    });

    // Save the notification ID and time so we can cancel/update it
    await AsyncStorage.setItem("bitzaDailyNotifId", id);
    await AsyncStorage.setItem("bitzaDailyNotifTime", JSON.stringify({ hour, minute }));
    await AsyncStorage.setItem("bitzaNotificationsEnabled", "true");

    console.log("Daily affirmation scheduled at", `${hour}:${minute < 10 ? "0" + minute : minute}`);
    return true;
  } catch (e) {
    console.log("Error scheduling notification:", e);
    return false;
  }
}

// ─── Cancel daily affirmation ─────────────────────────────────────────────────
export async function cancelDailyAffirmation() {
  try {
    const savedId = await AsyncStorage.getItem("bitzaDailyNotifId");
    if (savedId) {
      await Notifications.cancelScheduledNotificationAsync(savedId);
      await AsyncStorage.removeItem("bitzaDailyNotifId");
    }
    await AsyncStorage.setItem("bitzaNotificationsEnabled", "false");
    return true;
  } catch (e) {
    console.log("Error cancelling notification:", e);
    return false;
  }
}

// ─── Cancel all notifications ─────────────────────────────────────────────────
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem("bitzaDailyNotifId");
  await AsyncStorage.setItem("bitzaNotificationsEnabled", "false");
}

// ─── Get current notification status ─────────────────────────────────────────
export async function getNotificationStatus() {
  try {
    const enabled = await AsyncStorage.getItem("bitzaNotificationsEnabled");
    const time = await AsyncStorage.getItem("bitzaDailyNotifTime");
    const { status } = await Notifications.getPermissionsAsync();
    return {
      enabled: enabled === "true",
      permissionGranted: status === "granted",
      time: time ? JSON.parse(time) : { hour: 8, minute: 0 },
    };
  } catch (e) {
    return { enabled: false, permissionGranted: false, time: { hour: 8, minute: 0 } };
  }
}

// ─── Send an immediate test notification ─────────────────────────────────────
export async function sendTestNotification() {
  const granted = await registerForNotifications();
  if (!granted) return false;

  const affirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: affirmation.title,
      body: affirmation.body,
      sound: false,
      data: { type: "test" },
    },
    trigger: { seconds: 3 },
  });

  return true;
}