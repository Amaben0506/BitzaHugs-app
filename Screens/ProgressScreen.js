import React, { useState, useCallback } from "react";
import {
  ScrollView, View, Text, StyleSheet,
  Image, ImageBackground, Platform, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const MOOD_COLORS = {
  overwhelmed: "#F59E8B", struggling: "#F4A84A",
  okay: "#F5D060", hopeful: "#83B87A", good: "#6EB8A3",
};
const MOOD_LABELS = {
  overwhelmed: "Overwhelmed", struggling: "Struggling",
  okay: "Okay", hopeful: "Hopeful", good: "Good",
};
const MOOD_SCORE = { overwhelmed: 1, struggling: 2, okay: 3, hopeful: 4, good: 5 };

const BADGE_DEFS = [
  { label: "First Check-In", icon: require("../assets/icons/badge-star.png"), desc: "Completed your first mood check-in" },
  { label: "3-Day Streak", icon: require("../assets/icons/badge-heart-hug.png"), desc: "Checked in 3 days in a row" },
  { label: "Routine Hero", icon: require("../assets/icons/badge-flower.png"), desc: "Complete a full routine 5 days" },
  { label: "Calm Champion", icon: require("../assets/icons/badge-small-wins-star.png"), desc: "Use a calm tool 10 times" },
  { label: "Journal Starter", icon: require("../assets/icons/badge-star.png"), desc: "Write 3 journal entries" },
  { label: "Support Seeker", icon: require("../assets/icons/badge-small-wins-star.png"), desc: "Use Support Mode 3 times" },
];

const progressBackground = require("../assets/icons/progress-background.png");

const calculateStreak = (moodHistory) => {
  if (!moodHistory || moodHistory.length === 0) return 0;
  const days = [...new Set(moodHistory.map((e) => new Date(e.date).toDateString()))];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    if ((prev - curr) / 86400000 === 1) streak++;
    else break;
  }
  return streak;
};

const calculateBadges = (moodHistory, journalEntries, calmToolUses, supportModeUses, routineCompleteDays) => {
  const earned = new Set();
  if (moodHistory.length >= 1) earned.add("First Check-In");
  if (moodHistory.length >= 3) {
    const days = [...new Set(moodHistory.map((e) => new Date(e.date).toDateString()))];
    if (days.length >= 3) {
      let streak = 1;
      for (let i = 1; i < days.length; i++) {
        const prev = new Date(days[i - 1]);
        const curr = new Date(days[i]);
        const diff = (prev - curr) / (1000 * 60 * 60 * 24);
        if (diff === 1) { streak++; if (streak >= 3) { earned.add("3-Day Streak"); break; } }
        else streak = 1;
      }
    }
  }
  if (journalEntries.length >= 3) earned.add("Journal Starter");
  if (calmToolUses >= 10) earned.add("Calm Champion");
  if (supportModeUses >= 3) earned.add("Support Seeker");
  if (routineCompleteDays >= 5) earned.add("Routine Hero");
  return BADGE_DEFS.map((b) => ({ ...b, earned: earned.has(b.label) }));
};

const generateInsights = (moodHistory, routineItems, journalEntries) => {
  const insights = [];
  if (!moodHistory || moodHistory.length === 0) return insights;

  const moodCounts = moodHistory.reduce((acc, e) => {
    const k = e.mood?.toLowerCase();
    if (k) acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  if (topMood) {
    insights.push({
      icon: "bar-chart-2", color: "#6F42D8", bg: "#F0E2FF",
      title: `Most frequent mood: ${MOOD_LABELS[topMood[0]] || topMood[0]}`,
      text: `You've checked in as "${MOOD_LABELS[topMood[0]] || topMood[0]}" ${topMood[1]} time${topMood[1] > 1 ? "s" : ""}.`,
    });
  }

  if (moodHistory.length >= 6) {
    const recent = moodHistory.slice(0, 5);
    const older = moodHistory.slice(5, 10);
    const recentAvg = recent.reduce((s, e) => s + (MOOD_SCORE[e.mood?.toLowerCase()] || 3), 0) / recent.length;
    const olderAvg = older.reduce((s, e) => s + (MOOD_SCORE[e.mood?.toLowerCase()] || 3), 0) / older.length;
    if (recentAvg > olderAvg + 0.3) {
      insights.push({ icon: "trending-up", color: "#78A866", bg: "#EEF7E8", title: "Your mood is trending up 🌱", text: "Your recent check-ins have been more positive than before. Keep going." });
    } else if (recentAvg < olderAvg - 0.3) {
      insights.push({ icon: "trending-down", color: "#EF8F7D", bg: "#FFE6E4", title: "Hard stretch recently", text: "Your recent check-ins have been harder. That's okay — you're still showing up." });
    }
  }

  const overwhelmedCount = moodCounts["overwhelmed"] || 0;
  if (overwhelmedCount >= 3) {
    insights.push({
      icon: "alert-circle", color: "#EF8F7D", bg: "#FFE6E4",
      title: `Overwhelm shows up often (${overwhelmedCount}x)`,
      text: "Consider having your Meltdown Plan and Transition Timer ready before hard moments.",
      action: { label: "Open Meltdown Plan", screen: "MeltdownPlan" },
    });
  }

  if (routineItems.length > 0) {
    const done = routineItems.filter((i) => i.completed).length;
    const pct = Math.round((done / routineItems.length) * 100);
    if (pct === 100) {
      insights.push({ icon: "check-circle", color: "#78A866", bg: "#EEF7E8", title: "Full routine complete today! 🎉", text: "Every activity done. That's a real win worth celebrating." });
    } else if (pct >= 50) {
      insights.push({ icon: "calendar", color: "#4C9ED9", bg: "#E7F4FF", title: `Routine ${pct}% complete today`, text: `${done} of ${routineItems.length} activities done. You're building rhythm.` });
    }
  }

  if (journalEntries && journalEntries.length >= 3) {
    insights.push({ icon: "book-open", color: "#78A866", bg: "#EEF7E8", title: `${journalEntries.length} journal entries saved`, text: "Writing things out is one of the most powerful tools you have." });
  }

  const positiveStreak = (() => {
    let count = 0;
    for (const e of moodHistory) {
      if (e.mood === "hopeful" || e.mood === "good") count++;
      else break;
    }
    return count;
  })();
  if (positiveStreak >= 3) {
    insights.push({ icon: "sun", color: "#D99A3D", bg: "#FFF0DF", title: `${positiveStreak} positive check-ins in a row ✨`, text: "You've been feeling hopeful or good consistently. Notice what's been helping." });
  }

  return insights.slice(0, 5);
};

function MoodChart({ moodHistory }) {
  const last7 = moodHistory.slice(0, 7).reverse();
  if (last7.length === 0) return null;
  return (
    <View style={chartStyles.wrap}>
      <Text style={chartStyles.label}>Last {last7.length} check-ins</Text>
      <View style={chartStyles.bars}>
        {last7.map((e, i) => {
          const score = MOOD_SCORE[e.mood?.toLowerCase()] || 3;
          const height = (score / 5) * 48;
          const color = MOOD_COLORS[e.mood?.toLowerCase()] || "#ccc";
          return (
            <View key={i} style={chartStyles.barWrap}>
              <View style={[chartStyles.bar, { height, backgroundColor: color }]} />
              <Text style={chartStyles.barLabel}>{(MOOD_LABELS[e.mood?.toLowerCase()] || "?").slice(0, 3)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: { marginTop: 4 },
  label: { color: "#837E96", fontSize: 10, fontWeight: "600", marginBottom: 8 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 56 },
  barWrap: { flex: 1, alignItems: "center" },
  bar: { width: "100%", borderRadius: 5, minHeight: 4 },
  barLabel: { color: "#837E96", fontSize: 8, fontWeight: "600", marginTop: 3 },
});

export default function ProgressScreen({ navigation }) {
  const [moodHistory, setMoodHistory] = useState([]);
  const [routineItems, setRoutineItems] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [insights, setInsights] = useState([]);
  const [badges, setBadges] = useState(BADGE_DEFS.map((b) => ({ ...b, earned: false })));
  const [streak, setStreak] = useState(0);
  const [hardDays, setHardDays] = useState(0);
  const [calmToolUses, setCalmToolUses] = useState(0);
  const [supportModeUses, setSupportModeUses] = useState(0);
  const [moodChartRange, setMoodChartRange] = useState("7d");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const moods = await AsyncStorage.getItem("familyAppMoodHistory");
          const parsedMoods = moods ? JSON.parse(moods) : [];
          setMoodHistory(parsedMoods.slice(0, 20));
          setStreak(calculateStreak(parsedMoods));

          const routine = await AsyncStorage.getItem("bitzaRoutineItems");
          const parsedRoutine = routine ? JSON.parse(routine) : [];
          setRoutineItems(parsedRoutine);

          const journal = await AsyncStorage.getItem("calmJournalEntries");
          const parsedJournal = journal ? JSON.parse(journal) : [];
          setJournalEntries(parsedJournal);

          const calm = await AsyncStorage.getItem("bitzaCalmToolUses");
          const calmUses = calm ? parseInt(calm) : 0;

          const support = await AsyncStorage.getItem("bitzaSupportModeUses");
          const supportUses = support ? parseInt(support) : 0;

          const routineDays = await AsyncStorage.getItem("bitzaRoutineCompleteDays");
          const completeDays = routineDays ? parseInt(routineDays) : 0;

          setCalmToolUses(calmUses);
          setSupportModeUses(supportUses);
          const hardDaysRaw = await AsyncStorage.getItem("bitzaHardDays");
          const hardDaysParsed = hardDaysRaw ? JSON.parse(hardDaysRaw) : [];
          const thisMonth = new Date().getMonth();
          const thisYear = new Date().getFullYear();
          const thisMonthHardDays = hardDaysParsed.filter(d => {
            const date = new Date(d.date);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
          }).length;
          setHardDays(thisMonthHardDays);
          setBadges(calculateBadges(parsedMoods, parsedJournal, calmUses, supportUses, completeDays));
          setInsights(generateInsights(parsedMoods.slice(0, 20), parsedRoutine, parsedJournal));
        } catch (e) {
          console.log("Error loading progress:", e);
        }
      };
      load();
    }, [])
  );

  const completedCount = routineItems.filter((i) => i.completed).length;
  const totalCount = routineItems.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const moodCounts = moodHistory.reduce((acc, e) => {
    const k = e.mood?.toLowerCase();
    if (k) acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const earnedCount = badges.filter((b) => b.earned).length;
  const isNewUser = moodHistory.length === 0 && journalEntries.length === 0;

  return (
    <ImageBackground source={progressBackground} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.screenTitle}>Progress</Text>
              <Text style={styles.screenSubtitle}>Your family's journey, one step at a time.</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="bar-chart-outline" size={20} color="#6F42D8" />
            </View>
          </View>

          {/* Streak Card */}
          <View style={styles.streakCard}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Day Streak 🔥</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakRight}>
              <Text style={styles.streakTip}>
                {streak === 0
                  ? "Start your first check-in today to begin your streak!"
                  : streak === 1
                  ? "Great start! Check in tomorrow to keep it going."
                  : `${streak} days in a row — you're building something real. 💜`}
              </Text>
              {streak === 0 && (
                <TouchableOpacity
                  style={styles.streakBtn}
                  onPress={() => navigation.navigate("MoodSupport")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.streakBtnText}>Check in now →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#F0E8FF" }]}>
              <Text style={styles.statNumber}>{moodHistory.length}</Text>
              <Text style={styles.statLabel}>Mood{"\n"}Check-ins</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#E8F4FF" }]}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Activities{"\n"}Done Today</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#EEF7E9" }]}>
              <Text style={styles.statNumber}>{journalEntries.length}</Text>
              <Text style={styles.statLabel}>Journal{" "}Entries</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#FFE6E4" }]}>
              <Text style={[styles.statNumber, { color: hardDays > 0 ? "#D86A5B" : "#2B2463" }]}>{hardDays}</Text>
              <Text style={styles.statLabel}>Hard{" "}Days</Text>
            </View>
          </View>

          {/* New User Empty State */}
          {isNewUser && (
            <View style={styles.newUserCard}>
              <Image
                source={require("../assets/icons/progress-plant-growth.png")}
                style={styles.newUserIcon}
                resizeMode="contain"
              />
              <Text style={styles.newUserTitle}>Your progress starts here 🌱</Text>
              <Text style={styles.newUserText}>
                As you use the app — check in moods, complete routines, and journal — your progress will show up here.
              </Text>
              <View style={styles.newUserActions}>
                <TouchableOpacity
                  style={styles.newUserBtn}
                  onPress={() => navigation.navigate("MoodSupport")}
                  activeOpacity={0.85}
                >
                  <Feather name="heart" size={14} color="#FFFFFF" />
                  <Text style={styles.newUserBtnText}>First Check-In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.newUserBtn, { backgroundColor: "#EEF7E8" }]}
                  onPress={() => navigation.getParent()?.navigate("RoutineTab")}
                  activeOpacity={0.85}
                >
                  <Feather name="calendar" size={14} color="#78A866" />
                  <Text style={[styles.newUserBtnText, { color: "#78A866" }]}>View Routine</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Week at a Glance */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBubble}>
                <Ionicons name="grid-outline" size={16} color="#6F42D8" />
              </View>
              <Text style={styles.cardTitle}>Week at a Glance</Text>
            </View>
            {(() => {
              const today = new Date();
              const dayOfWeek = today.getDay();
              const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
              const checkedDays = new Set(moodHistory.map(e => new Date(e.date).toDateString()));
              return (
                <View>
                  <View style={styles.weekHeaderRow}>
                    <Text style={styles.weekSubLabel}>This Week</Text>
                    <Text style={styles.weekSubLabel}>{checkedDays.size}/7 days</Text>
                  </View>
                  <View style={styles.weekDaysRow}>
                    {weekDays.map((day, i) => {
                      const date = new Date(today);
                      date.setDate(today.getDate() - dayOfWeek + i);
                      const isToday = i === dayOfWeek;
                      const checked = checkedDays.has(date.toDateString());
                      return (
                        <View key={day} style={styles.weekDayWrap}>
                          <Text style={[styles.weekDayLabel, isToday && styles.weekDayLabelToday]}>{day}</Text>
                          <View style={[styles.weekDayCircle, checked && styles.weekDayCircleChecked, isToday && styles.weekDayCircleToday]}>
                            {checked && <Feather name="check" size={12} color={checked ? "#FFFFFF" : "#ccc"} />}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  {topMood && (
                    <View style={styles.weekCompareWrap}>
                      <Text style={styles.weekCompareLabel}>This week</Text>
                      <View style={[styles.weekMoodBadge, { backgroundColor: MOOD_COLORS[topMood] + "30" }]}>
                        <Text style={[styles.weekMoodBadgeTxt, { color: MOOD_COLORS[topMood] }]}>
                          {MOOD_LABELS[topMood]}
                        </Text>
                      </View>
                      <Text style={styles.weekScoreLabel}>
                        {moodHistory.length > 0
                          ? (moodHistory.reduce((s,e) => s + (MOOD_SCORE[e.mood?.toLowerCase()] || 3), 0) / moodHistory.length).toFixed(1)
                          : "—"} / 5
                      </Text>
                    </View>
                  )}
                </View>
              );
            })()}
          </View>

          {/* Insights */}
          {insights.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBubble}>
                  <Ionicons name="sparkles" size={13} color="#6F42D8" />
                </View>
                <Text style={styles.sectionTitle}>Insights for your family</Text>
              </View>
              {insights.map((insight, i) => (
                <View key={i} style={[styles.insightCard, { borderLeftColor: insight.color }]}>
                  <View style={[styles.insightIconBubble, { backgroundColor: insight.bg }]}>
                    <Feather name={insight.icon} size={16} color={insight.color} />
                  </View>
                  <View style={styles.insightTextWrap}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightText}>{insight.text}</Text>
                    {insight.action && (
                      <TouchableOpacity
                        style={[styles.insightAction, { backgroundColor: insight.bg }]}
                        onPress={() => navigation.navigate(insight.action.screen)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.insightActionText, { color: insight.color }]}>
                          {insight.action.label} →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Routine Progress */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBubble}>
                <Ionicons name="calendar-outline" size={16} color="#6F42D8" />
              </View>
              <Text style={styles.cardTitle}>Today's Routine</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate("RoutineTab") ?? navigation?.navigate("RoutineTab")}>
                <Text style={styles.linkText}>View ›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressSubtext}>{completedCount} of {totalCount} activities complete · {progressPercent}%</Text>
          </View>

          {/* Mood Chart */}
          {moodHistory.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBubble}>
                  <Ionicons name="heart-outline" size={16} color="#6F42D8" />
                </View>
                <Text style={styles.cardTitle}>Mood over time</Text>
              </View>
              <MoodChart moodHistory={moodHistory} />
              {topMood && (
                <View style={styles.moodSummaryRow}>
                  <View style={[styles.moodDot, { backgroundColor: MOOD_COLORS[topMood] || "#ccc" }]} />
                  <Text style={styles.moodSummaryText}>
                    Most frequent: <Text style={{ fontWeight: "800" }}>{MOOD_LABELS[topMood] || topMood}</Text>
                  </Text>
                  <Text style={styles.moodSummaryCount}>{moodCounts[topMood]}×</Text>
                </View>
              )}
            </View>
          )}

          {/* Calm & Support Tools Used */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBubble}>
                <Ionicons name="heart-outline" size={16} color="#6F42D8" />
              </View>
              <Text style={styles.cardTitle}>Calm & Support Tools Used</Text>
            </View>
            <View style={styles.toolsStatsRow}>
              <View style={styles.toolStatCol}>
                <Text style={styles.toolStatNumber}>{calmToolUses}</Text>
                <Text style={styles.toolStatLabel}>Calm Moments</Text>
                <View style={styles.toolStatTrack}>
                  <View style={[styles.toolStatFill, { width: `${Math.min((calmToolUses / 10) * 100, 100)}%`, backgroundColor: "#7548D8" }]} />
                </View>
                <Text style={styles.toolStatGoal}>Goal: 10</Text>
              </View>
              <View style={styles.toolStatDivider} />
              <View style={styles.toolStatCol}>
                <Text style={styles.toolStatNumber}>{supportModeUses}</Text>
                <Text style={styles.toolStatLabel}>Support Sessions</Text>
                <View style={styles.toolStatTrack}>
                  <View style={[styles.toolStatFill, { width: `${Math.min((supportModeUses / 3) * 100, 100)}%`, backgroundColor: "#4A9E5C" }]} />
                </View>
                <Text style={styles.toolStatGoal}>Goal: 3</Text>
              </View>
            </View>
          </View>

          {/* Hard Day Log */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBubble, { backgroundColor: "#FFE6E4" }]}>
                <Ionicons name="cloud-outline" size={16} color="#D86A5B" />
              </View>
              <Text style={styles.cardTitle}>Hard Day Log</Text>
            </View>
            <Text style={styles.hardDayDesc}>Track difficult days to spot patterns and share with your child's care team.</Text>
            <View style={styles.hardDayCountRow}>
              <View style={styles.hardDayCountBox}>
                <Text style={styles.hardDayCountNum}>{hardDays}</Text>
              </View>
              <Text style={styles.hardDayCountLabel}>hard days logged in {new Date().toLocaleDateString("en-US", { month: "long" })}</Text>
            </View>
            <TouchableOpacity
              style={styles.logHardDayBtn}
              onPress={() => navigation.navigate("MoodSupport", { mood: "overwhelmed" })}
              activeOpacity={0.88}
            >
              <Ionicons name="add-circle-outline" size={16} color="#D86A5B" />
              <Text style={styles.logHardDayTxt}>Log a Hard Day</Text>
            </TouchableOpacity>
            <Text style={styles.hardDayReset}>Logging resets at the start of each month.</Text>
          </View>

          {/* Badges */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBubble}>
                <Ionicons name="star-outline" size={16} color="#6F42D8" />
              </View>
              <Text style={styles.cardTitle}>Badges & Wins</Text>
              <Text style={styles.linkText}>{earnedCount}/{badges.length} earned</Text>
            </View>
            <View style={styles.badgesRow}>
              {badges.map((badge) => (
                <View key={badge.label} style={[styles.badgeItem, !badge.earned && styles.badgeItemLocked]}>
                  <Image source={badge.icon} style={styles.badgeIcon} resizeMode="contain" />
                  <Text style={[styles.badgeLabel, !badge.earned && styles.badgeLabelLocked]}>{badge.label}</Text>
                  {badge.earned
                    ? <Text style={styles.badgeEarnedDot}>✓</Text>
                    : <View style={styles.lockOverlay}><Feather name="lock" size={10} color="#837E96" /></View>
                  }
                </View>
              ))}
            </View>
            <View style={styles.badgeHints}>
              {badges.filter((b) => !b.earned).slice(0, 2).map((b) => (
                <View key={b.label} style={styles.badgeHintRow}>
                  <Feather name="lock" size={11} color="#837E96" />
                  <Text style={styles.badgeHintText}>
                    <Text style={{ fontWeight: "800", color: "#2B2463" }}>{b.label}:</Text> {b.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Check-ins */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>Recent Check-ins</Text>
          </View>

          {moodHistory.length === 0 ? (
            <View style={styles.emptyCard}>
              <Image source={require("../assets/icons/progress-plant-growth.png")} style={styles.emptyIcon} resizeMode="contain" />
              <Text style={styles.emptyTitle}>No mood entries yet</Text>
              <Text style={styles.emptyText}>Mood check-ins from the home screen will appear here over time.</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => navigation?.navigate("MoodSupport")}>
                <Text style={styles.emptyButtonText}>Do a check-in now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            moodHistory.slice(0, 8).map((entry, index) => (
              <View key={index} style={styles.moodCard}>
                <View style={[styles.moodBubble, { backgroundColor: MOOD_COLORS[entry.mood?.toLowerCase()] || "#E5E5E5" }]} />
                <View style={styles.moodTextBox}>
                  <Text style={styles.moodTitle}>{MOOD_LABELS[entry.mood?.toLowerCase()] || entry.mood}</Text>
                  <Text style={styles.moodDate}>
                    {entry.date ? new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                  </Text>
                  {entry.note ? <Text style={styles.noteText}>"{entry.note}"</Text> : null}
                </View>
              </View>
            ))
          )}

          {/* Copy Progress Summary */}
          <TouchableOpacity
            style={styles.copyProgressCard}
            onPress={() => {
              const summary = `BitzaHugs Progress Summary\n\nStreak: ${streak} days\nMood check-ins: ${moodHistory.length}\nJournal entries: ${journalEntries.length}\nCalm moments: ${calmToolUses}\nSupport sessions: ${supportModeUses}\nBadges earned: ${earnedCount}/${badges.length}\n\nShared from BitzaHugs`;
              require("react-native").Clipboard.setString(summary);
            }}
            activeOpacity={0.88}
          >
            <View style={styles.copyProgressIcon}>
              <Feather name="share" size={18} color="#7548D8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.copyProgressTitle}>Copy Progress Summary</Text>
              <Text style={styles.copyProgressSub}>Share with your child's doctor, therapist, or school.</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#7548D8" />
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerCard}>
            <Image source={require("../assets/icons/progress-mountain-flag.png")} style={styles.footerIcon} resizeMode="contain" />
            <Text style={styles.footerText}>Every small step counts. You're doing better than you think.</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  screenTitle: { color: "#2B2463", fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  screenSubtitle: { color: "#5B5672", fontSize: 12, fontWeight: "600", marginTop: 1 },
  headerIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },

  streakCard: {
    backgroundColor: "#2B2463", borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", marginBottom: 12,
    shadowColor: "#2B2463", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10, elevation: 4,
  },
  streakLeft: { alignItems: "center", paddingRight: 16, minWidth: 70 },
  streakNumber: { color: "#FFFFFF", fontSize: 40, fontWeight: "800", lineHeight: 44 },
  streakLabel: { color: "#C8C0F0", fontSize: 11, fontWeight: "700", marginTop: 2 },
  streakDivider: { width: 1, height: 44, backgroundColor: "rgba(255,255,255,0.2)", marginRight: 16 },
  streakRight: { flex: 1 },
  streakTip: { color: "#E0DAFF", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  streakBtn: {
    marginTop: 8, alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  streakBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },

  statsRow: { flexDirection: "row", gap: 7, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 14, padding: 10, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.6)" },
  statNumber: { color: "#2B2463", fontSize: 19, fontWeight: "800", marginBottom: 2 },
  statLabel: { color: "#5B5672", fontSize: 9.5, fontWeight: "600", textAlign: "center", lineHeight: 13 },

  newUserCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1,
    borderColor: "#EFE4DC", padding: 20, alignItems: "center", marginBottom: 12,
    shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 2,
  },
  newUserIcon: { width: 70, height: 70, marginBottom: 12 },
  newUserTitle: { color: "#2B2463", fontSize: 16, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  newUserText: { color: "#5B5672", fontSize: 12, lineHeight: 18, fontWeight: "600", textAlign: "center", marginBottom: 14 },
  newUserActions: { flexDirection: "row", gap: 10 },
  newUserBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#8B5BE8", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  newUserBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8, marginTop: 4 },
  sectionIconBubble: { width: 22, height: 22, borderRadius: 7, backgroundColor: "#EFE1FF", alignItems: "center", justifyContent: "center" },
  sectionTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800" },

  insightCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC", borderLeftWidth: 3, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, flexDirection: "row", alignItems: "flex-start", gap: 10, shadowColor: "#BFA99D", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 1 },
  insightIconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  insightTextWrap: { flex: 1 },
  insightTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  insightText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },
  insightAction: { marginTop: 7, alignSelf: "flex-start", borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5 },
  insightActionText: { fontSize: 11, fontWeight: "800" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 12, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardIconBubble: { width: 28, height: 28, borderRadius: 9, backgroundColor: "#EFE1FF", alignItems: "center", justifyContent: "center", marginRight: 8 },
  cardTitle: { flex: 1, color: "#2B2463", fontSize: 14, fontWeight: "800" },
  linkText: { color: "#6F42D8", fontSize: 12, fontWeight: "700" },

  progressTrack: { height: 8, borderRadius: 8, backgroundColor: "#EDE3FB", overflow: "hidden", marginBottom: 5 },
  progressFill: { height: "100%", borderRadius: 8, backgroundColor: "#8B5BE8" },
  progressSubtext: { color: "#837E96", fontSize: 11, fontWeight: "600" },

  moodSummaryRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  moodDot: { width: 10, height: 10, borderRadius: 5 },
  moodSummaryText: { flex: 1, color: "#2B2463", fontSize: 12, fontWeight: "600" },
  moodSummaryCount: { color: "#837E96", fontSize: 11, fontWeight: "600" },

  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  badgeItem: { width: "22%", alignItems: "center", padding: 8, borderRadius: 12, backgroundColor: "#F6ECFF", borderWidth: 1, borderColor: "#E3D2F8", position: "relative" },
  badgeItemLocked: { backgroundColor: "#F5F5F5", borderColor: "#E8E8E8" },
  badgeIcon: { width: 28, height: 28, marginBottom: 4 },
  badgeLabel: { color: "#2B2463", fontSize: 9, fontWeight: "700", textAlign: "center" },
  badgeLabelLocked: { color: "#A0A0A0" },
  badgeEarnedDot: { position: "absolute", top: 4, right: 6, color: "#78A866", fontSize: 10, fontWeight: "800" },
  lockOverlay: { position: "absolute", top: 4, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: "#E8E8E8", alignItems: "center", justifyContent: "center" },

  badgeHints: { gap: 5, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#F0E8E2" },
  badgeHintRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  badgeHintText: { flex: 1, color: "#837E96", fontSize: 10, lineHeight: 15, fontWeight: "600" },

  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 22, alignItems: "center", marginBottom: 10 },
  emptyIcon: { width: 56, height: 56, marginBottom: 10 },
  emptyTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 4 },
  emptyText: { color: "#837E96", fontSize: 11, lineHeight: 16, textAlign: "center", marginBottom: 12 },
  emptyButton: { backgroundColor: "#8B5BE8", borderRadius: 11, paddingHorizontal: 16, paddingVertical: 8 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  moodCard: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#EFE4DC", padding: 11, marginBottom: 7, flexDirection: "row", alignItems: "flex-start", shadowColor: "#BFA99D", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1 },
  moodBubble: { width: 10, height: 10, borderRadius: 5, marginTop: 3, marginRight: 10 },
  moodTextBox: { flex: 1 },
  moodTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800" },
  moodDate: { color: "#8E88A7", fontSize: 10, fontWeight: "600", marginTop: 1 },
  noteText: { color: "#5E5873", fontSize: 11, lineHeight: 15, marginTop: 4, fontStyle: "italic" },

  footerCard: { backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", padding: 12, flexDirection: "row", alignItems: "center", marginTop: 4 },
  footerIcon: { width: 36, height: 36, marginRight: 11 },
  footerText: { flex: 1, color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "700" },

  // Week at a Glance
  weekHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  weekSubLabel: { color: "#837E96", fontSize: 11, fontWeight: "700" },
  weekDaysRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  weekDayWrap: { alignItems: "center", gap: 5 },
  weekDayLabel: { color: "#837E96", fontSize: 10, fontWeight: "700" },
  weekDayLabelToday: { color: "#7548D8", fontWeight: "900" },
  weekDayCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: "#EDE4F5", alignItems: "center", justifyContent: "center", backgroundColor: "#FDFAFF" },
  weekDayCircleChecked: { backgroundColor: "#4A9E5C", borderColor: "#4A9E5C" },
  weekDayCircleToday: { borderColor: "#7548D8", borderWidth: 2 },
  weekCompareWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F5F0FA" },
  weekCompareLabel: { color: "#837E96", fontSize: 11, fontWeight: "700" },
  weekMoodBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  weekMoodBadgeTxt: { fontSize: 12, fontWeight: "800" },
  weekScoreLabel: { color: "#837E96", fontSize: 11, fontWeight: "600", marginLeft: "auto" },

  // Calm & Support Tools
  toolsStatsRow: { flexDirection: "row", alignItems: "flex-start" },
  toolStatCol: { flex: 1, alignItems: "center", gap: 4 },
  toolStatDivider: { width: 1, backgroundColor: "#F0E8E2", marginHorizontal: 12 },
  toolStatNumber: { color: "#2B2463", fontSize: 36, fontWeight: "900", lineHeight: 42 },
  toolStatLabel: { color: "#837E96", fontSize: 12, fontWeight: "700", textAlign: "center", lineHeight: 17 },
  toolStatTrack: { width: "80%", height: 4, borderRadius: 2, backgroundColor: "#EDE3FB", overflow: "hidden" },
  toolStatFill: { height: "100%", borderRadius: 2 },
  toolStatGoal: { color: "#B0A8C8", fontSize: 10, fontWeight: "600" },

  // Hard Day Log
  hardDayDesc: { color: "#5B5672", fontSize: 12, lineHeight: 18, fontWeight: "600", marginBottom: 12 },
  hardDayCountRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  hardDayCountBox: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#FFE6E4", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFD0C0" },
  hardDayCountNum: { color: "#D86A5B", fontSize: 24, fontWeight: "900" },
  hardDayCountLabel: { color: "#5B5672", fontSize: 13, fontWeight: "700", flex: 1 },
  logHardDayBtn: { height: 48, borderRadius: 14, backgroundColor: "#FFE6E4", borderWidth: 1, borderColor: "#FFD0C0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 },
  logHardDayTxt: { color: "#D86A5B", fontSize: 14, fontWeight: "800" },
  hardDayReset: { color: "#B0A8C8", fontSize: 10, fontWeight: "600", textAlign: "center" },

  // Copy Progress Summary
  copyProgressCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#EDE4F5", padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  copyProgressIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  copyProgressTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  copyProgressSub: { color: "#837E96", fontSize: 11, fontWeight: "600" },
});