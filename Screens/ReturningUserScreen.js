import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
 
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const splashBackground = require("../assets/icons/sunrise-background.png");

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

  return (
    <ImageBackground source={splashBackground} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
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
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "ios" ? 20 : 30,
    paddingBottom: 30,
    justifyContent: "center",
  },

  greetingSection: { marginBottom: 20 },
  greeting: { fontSize: 18, fontWeight: "700", color: "#2B2463", opacity: 0.8 },
  name: { fontSize: 32, fontWeight: "900", color: "#2B2463", letterSpacing: -0.5, marginBottom: 6 },
  dayMessage: { fontSize: 14, fontWeight: "600", color: "#5B5672" },

  statsCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14,
    shadowColor: "#BFA99D", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10, elevation: 3,
  },
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11, gap: 12 },
  statRowBorder: { borderTopWidth: 1, borderTopColor: "#F0E8E2" },
  statIconBubble: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statEmoji: { fontSize: 20 },
  statTextWrap: { flex: 1 },
  statTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  statSub: { color: "#5B5672", fontSize: 11, fontWeight: "600" },

  affirmationCard: {
    backgroundColor: "rgba(246,236,255,0.95)", borderRadius: 18,
    borderWidth: 1, borderColor: "#E3D2F8", padding: 16, marginBottom: 16,
    alignItems: "center",
  },
  affirmationText: { color: "#2B2463", fontSize: 15, fontWeight: "800", textAlign: "center", lineHeight: 22 },

  enterButton: {
    height: 54, borderRadius: 18, backgroundColor: "#7548D8",
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, marginBottom: 14,
    shadowColor: "#7548D8", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10, elevation: 4,
  },
  enterButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },

  quickActions: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  quickAction: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.88)", borderRadius: 16,
    borderWidth: 1, borderColor: "#EFE4DC", paddingVertical: 10, alignItems: "center", gap: 4,
  },
  quickActionEmoji: { fontSize: 22 },
  quickActionText: { color: "#2B2463", fontSize: 10, fontWeight: "800" },
});