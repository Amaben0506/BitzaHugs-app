import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Shadows, Type } from "../src/theme/theme";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getStreakMessage = (streak) => {
  if (streak === 0) return "Ready to start a new streak today?";
  if (streak === 1) return "You checked in yesterday. Keep it going! 🔥";
  if (streak < 7) return `${streak} days in a row. You're building something real. 🔥`;
  if (streak < 30) return `${streak}-day streak! You're showing up consistently. 🔥`;
  return `${streak} days strong. That's incredible. 🔥`;
};

const getDayMessage = () => {
  const day = new Date().getDay();
  const messages = {
    0: "Sunday. A gentler pace is okay today.",
    1: "Monday. One step at a time.",
    2: "Tuesday. You've got this.",
    3: "Wednesday. Halfway through the week.",
    4: "Thursday. Almost there.",
    5: "Friday. You made it through the week.",
    6: "Saturday. Rest is okay too.",
  };
  return messages[day];
};

export default function ReturningUserScreen({ navigation }) {
  const [parentName, setParentName] = useState(null);
  const [childName, setChildName] = useState(null);
  const [streak, setStreak] = useState(0);
  const [routinePercent, setRoutinePercent] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

const fadeAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const load = async () => {
      try {
        const parent = await AsyncStorage.getItem("bitzaParentProfile");
        const child = await AsyncStorage.getItem("bitzaChildProfile");
        const routine = await AsyncStorage.getItem("bitzaRoutineItems");
        const moods = await AsyncStorage.getItem("familyAppMoodHistory");
        const premium = await AsyncStorage.getItem("bitzaIsPremium");

        if (parent) {
          const p = JSON.parse(parent);
          setParentName(p.preferredGreeting?.trim() || p.name?.trim() || null);
        }
        if (child) {
          const c = JSON.parse(child);
          setChildName(c.childName?.trim() || null);
        }
        if (routine) {
          const items = JSON.parse(routine);
          const done = items.filter((i) => i.completed).length;
          const total = items.length;
          setRoutinePercent(total === 0 ? 0 : Math.round((done / total) * 100));
        }
        if (moods) {
          const parsedMoods = JSON.parse(moods);
          const days = [...new Set(parsedMoods.map((e) => new Date(e.date).toDateString()))];
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          if (days[0] === today || days[0] === yesterday) {
            let s = 1;
            for (let i = 1; i < days.length; i++) {
              const prev = new Date(days[i - 1]);
              const curr = new Date(days[i]);
              if ((prev - curr) / 86400000 === 1) s++;
              else break;
            }
            setStreak(s);
          }
        }
        setIsPremium(premium === "true");
      } catch (e) {
        console.log("Error loading returning user data:", e);
      }
    };
    load();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const goToApp = () => navigation.replace("MainTabs");

  const greeting = getGreeting();
  const displayName = parentName || "Welcome back";
  const hasStats = streak > 0 || routinePercent > 0 || !!childName || isPremium;

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Greeting */}
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.name}>{displayName} 💜</Text>
              <Text style={styles.dayMessage}>{getDayMessage()}</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsCard}>
              {streak > 0 && (
                <View style={styles.statRow}>
                  <View style={[styles.statIconBubble, { backgroundColor: "#FFF0DF" }]}>
                    <Text style={styles.statEmoji}>🔥</Text>
                  </View>
                  <View style={styles.statTextWrap}>
                    <Text style={styles.statTitle}>{streak}-day streak</Text>
                    <Text style={styles.statSub}>{getStreakMessage(streak)}</Text>
                  </View>
                </View>
              )}

              {routinePercent > 0 && (
                <View style={[styles.statRow, streak > 0 && styles.statRowBorder]}>
                  <View style={[styles.statIconBubble, { backgroundColor: "#F0E2FF" }]}>
                    <Text style={styles.statEmoji}>📅</Text>
                  </View>
                  <View style={styles.statTextWrap}>
                    <Text style={styles.statTitle}>Today's routine</Text>
                    <Text style={styles.statSub}>{routinePercent}% complete{routinePercent === 100 ? " 🎉" : " — keep going!"}</Text>
                  </View>
                </View>
              )}

              {childName && (
                <View style={[styles.statRow, (streak > 0 || routinePercent > 0) && styles.statRowBorder]}>
                  <View style={[styles.statIconBubble, { backgroundColor: "#FFE6E4" }]}>
                    <Text style={styles.statEmoji}>💜</Text>
                  </View>
                  <View style={styles.statTextWrap}>
                    <Text style={styles.statTitle}>Supporting {childName}</Text>
                    <Text style={styles.statSub}>Your tools are ready when you need them.</Text>
                  </View>
                </View>
              )}

              {isPremium && (
                <View style={[styles.statRow, styles.statRowBorder]}>
                  <View style={[styles.statIconBubble, { backgroundColor: "#EEF7E8" }]}>
                    <Text style={styles.statEmoji}>✨</Text>
                  </View>
                  <View style={styles.statTextWrap}>
                    <Text style={styles.statTitle}>Premium active</Text>
                    <Text style={styles.statSub}>All features unlocked. Hugi is ready for you.</Text>
                  </View>
                </View>
              )}

              {!hasStats && (
                <View style={styles.statRow}>
                  <View style={[styles.statIconBubble, { backgroundColor: "#F0E2FF" }]}>
                    <Text style={styles.statEmoji}>💜</Text>
                  </View>
                  <View style={styles.statTextWrap}>
                    <Text style={styles.statTitle}>Ready when you are</Text>
                    <Text style={styles.statSub}>Your tools are here for today.</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Affirmation */}
            <View style={styles.affirmationCard}>
              <Text style={styles.affirmationText}>
                You showed up again today.{"\n"}That is not nothing. 💜
              </Text>
            </View>

            {/* Enter Button */}
            <TouchableOpacity style={styles.enterButton} onPress={goToApp} activeOpacity={0.9}>
              <Text style={styles.enterButtonText}>Open BitzaHugs</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => { goToApp(); }}
                activeOpacity={0.85}
              >
                <Text style={styles.quickActionEmoji}>🫁</Text>
                <Text style={styles.quickActionText}>Breathe</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => { goToApp(); }}
                activeOpacity={0.85}
              >
                <Text style={styles.quickActionEmoji}>📔</Text>
                <Text style={styles.quickActionText}>Journal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => { goToApp(); }}
                activeOpacity={0.85}
              >
                <Text style={styles.quickActionEmoji}>🆘</Text>
                <Text style={styles.quickActionText}>Support</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => { goToApp(); }}
                activeOpacity={0.85}
              >
                <Text style={styles.quickActionEmoji}>📅</Text>
                <Text style={styles.quickActionText}>Routine</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%", backgroundColor: Colors.pageBg },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    height: 46,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.lavenderBorder,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 64,
    paddingBottom: 88,
  },
  content: {
    paddingTop: Platform.OS === "ios" ? 0 : 4,
  },

  greetingSection: { marginBottom: 20 },
  greeting: {
    ...Type.heading,
    color: Colors.textSecondary,
  },
  name: {
    ...Type.hero,
    color: Colors.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  dayMessage: {
    ...Type.bodySmall,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
  },

  statsCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.lavenderBorder,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
    ...Shadows.card,
  },
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11, gap: 12 },
  statRowBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  statIconBubble: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  statEmoji: { fontSize: 20 },
  statTextWrap: { flex: 1 },
  statTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statSub: {
    ...Type.caption,
    color: Colors.textSecondary,
  },

  affirmationCard: {
    backgroundColor: "rgba(242,234,251,0.96)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.lavenderBorder,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    ...Shadows.card,
  },
  affirmationText: {
    ...Type.heading,
    color: Colors.textPrimary,
    textAlign: "center",
  },

  enterButton: {
    height: 54,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryPlum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
    ...Shadows.button,
  },
  enterButtonText: {
    ...Type.button,
    color: "#FFFFFF",
  },

  quickActions: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  quickAction: {
    flex: 1,
    minHeight: 74,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.lavenderBorder,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    ...Shadows.card,
  },
  quickActionEmoji: { fontSize: 22 },
  quickActionText: {
    ...Type.caption,
    fontFamily: Fonts.semibold,
    color: Colors.primaryPlum,
    textAlign: "center",
  },
});
