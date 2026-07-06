import { useCallback, useMemo, useState } from "react";
import {
  ImageSourcePropType,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "@firebase/auth";
import { getFirestore, collection, getDocs } from "@firebase/firestore";
import {
  loadCaregiverProfile,
  loadChildProfile,
  saveCaregiverMood,
} from "../lib/dataService";
import HeroHeader from "../components/home/HeroHeader";
import ChildSelector from "../components/home/ChildSelector";
import TodayOverviewCard from "../components/home/TodayOverviewCard";
import CaregiverCheckIn from "../components/home/CaregiverCheckIn";
import QuickSupportCards from "../components/home/QuickSupportCards";
import RecentProgress from "../components/home/RecentProgress";

type TimeOfDay = "morning" | "afternoon" | "evening";
type ScheduleStatus = "pending" | "completed" | "skipped" | "in-progress";
type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  type: "routine" | "appointment";
  status: ScheduleStatus;
  emoji?: string;
  date?: string;
};

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    time: "07:00",
    title: "Morning Routine",
    type: "routine",
    status: "pending",
  },
  {
    id: "2",
    time: "08:30",
    title: "School / Learning",
    type: "routine",
    status: "pending",
  },
  {
    id: "4",
    time: "12:30",
    title: "Lunch",
    type: "routine",
    status: "pending",
  },
  {
    id: "5",
    time: "15:00",
    title: "Play / Break Time",
    type: "routine",
    status: "pending",
  },
  {
    id: "6",
    time: "19:00",
    title: "Bedtime Routine",
    type: "routine",
    status: "pending",
  },
];

const AVATARS: Record<string, ImageSourcePropType> = {
  "01": require("../../assets/icons/child-profile-01.png"),
  "02": require("../../assets/icons/child-profile-02.png"),
  "03": require("../../assets/icons/child-profile-03.png"),
  "04": require("../../assets/icons/child-profile-04.png"),
  "05": require("../../assets/icons/child-profile-05.png"),
  "06": require("../../assets/icons/child-profile-06.png"),
  "07": require("../../assets/icons/child-profile-07.png"),
  "08": require("../../assets/icons/child-profile-08.png"),
  "09": require("../../assets/icons/child-profile-09.png"),
  "10": require("../../assets/icons/child-profile-10.png"),
  "11": require("../../assets/icons/child-profile-11.png"),
  "12": require("../../assets/icons/child-profile-12.png"),
};

const toDateKey = (d: Date) => d.toISOString().split("T")[0];

const loadScheduleItems = async (date: string): Promise<ScheduleItem[]> => {
  const uid = getAuth().currentUser?.uid;

  if (uid) {
    try {
      const snap = await getDocs(collection(getFirestore(), "users", uid, "schedule", date, "items"));
      const items: ScheduleItem[] = [];
      snap.forEach(d => {
        const data = d.data() as any;
        if (data.title?.trim()) {
          items.push({
            id: d.id,
            time: data.time || "00:00",
            title: data.title.trim(),
            subtitle: data.subtitle,
            type: data.type === "appointment" ? "appointment" : "routine",
            status: data.status || "pending",
            emoji: data.emoji,
            date,
          });
        }
      });
      if (items.length > 0) return items;
    } catch (error) {
      console.log("Home schedule Firestore load error:", error);
    }
  }

  const local = await AsyncStorage.getItem(`bitzaSchedule_${date}`);
  return local ? JSON.parse(local) : DEFAULT_SCHEDULE;
};

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

const firstName = (value?: string) => value?.trim().split(/\s+/)[0] || "";

const parseScheduleTime = (time: string) => {
  const today = new Date();
  const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hour = Number(ampmMatch[1]);
    const minute = Number(ampmMatch[2]);
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    today.setHours(hour, minute, 0, 0);
    return today;
  }

  const [h = "0", m = "0"] = time.split(":");
  today.setHours(Number(h), Number(m), 0, 0);
  return today;
};

const formatScheduleTime = (time: string) => {
  if (/[AP]M/i.test(time)) return time;
  const [h = 0, m = 0] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

const formatEntryTime = (iso?: string) => {
  if (!iso) return "Today";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Today";
  return `Today at ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
};

const buildRecentActivity = (
  schedule: ScheduleItem[],
  childMood: any,
  caregiverMood: any,
  wins: any[]
) => {
  const completed = [...schedule]
    .filter((item) => item.status === "completed")
    .sort(
      (a, b) =>
        parseScheduleTime(b.time).getTime() -
        parseScheduleTime(a.time).getTime()
    )[0];

  if (completed) {
    return {
      title: completed.title,
      subtitle: `${formatScheduleTime(completed.time)} · Completed`,
      status: "Completed",
      icon: completed.type === "appointment" ? "calendar-outline" : "checkmark",
    };
  }

  if (childMood?.mood) {
    return {
      title: `${childMood.mood} mood check-in`,
      subtitle: formatEntryTime(childMood.time),
      status: "Saved",
      icon: "leaf-outline",
    };
  }

  if (caregiverMood?.mood) {
    return {
      title: "Caregiver check-in",
      subtitle: caregiverMood.mood,
      status: "Saved",
      icon: "heart-outline",
    };
  }

  if (wins[0]?.label) {
    return {
      title: wins[0].label,
      subtitle: "Recent win",
      status: "Saved",
      icon: "sparkles-outline",
    };
  }

  return null;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent("RootStack") ?? navigation;
  const [caregiverName, setCaregiverName] = useState("friend");
  const [child, setChild] = useState({
    name: "Your child",
    age: "",
    avatarEmoji: "",
    avatarSource: AVATARS["01"],
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [childMood, setChildMood] = useState<any>(null);
  const [caregiverMood, setCaregiverMood] = useState<any>(null);
  const [caregiverNote, setCaregiverNote] = useState("");
  const [calmToolsUsed, setCalmToolsUsed] = useState(0);
  const [progressNoteCompleted, setProgressNoteCompleted] = useState(false);
  const [wins, setWins] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadHomeData = async () => {
        try {
          const parentProfile = await loadCaregiverProfile();
          const childProfile = await loadChildProfile();

          const today = toDateKey(new Date());
          const [
            scheduleItems,
            childMoodRaw,
            caregiverMoodRaw,
            calmToolUsesRaw,
            noteStatusRaw,
            winsRaw,
          ] = await Promise.all([
            loadScheduleItems(today),
            AsyncStorage.getItem("bitzaChildMood"),
            AsyncStorage.getItem("bitzaCaregiverMood"),
            AsyncStorage.getItem("bitzaCalmToolUses"),
            AsyncStorage.getItem(`bitzaProgressNoteStatus_${today}`),
            AsyncStorage.getItem("bitzaWins"),
          ]);

          if (!active) return;

          setCaregiverName(
            firstName(parentProfile?.preferredGreeting) ||
              firstName(parentProfile?.name) ||
              "friend"
          );

          const avatarId = String(childProfile?.avatar || "01").padStart(
            2,
            "0"
          );
          setChild({
            name: childProfile?.childName?.trim() || "Your child",
            age: childProfile?.age ? String(childProfile.age) : "",
            avatarEmoji: childProfile?.avatarEmoji || "",
            avatarSource: AVATARS[avatarId] || AVATARS["01"],
          });

          setSchedule(scheduleItems);
          setChildMood(childMoodRaw ? JSON.parse(childMoodRaw) : null);

          const parsedCaregiverMood = caregiverMoodRaw
            ? JSON.parse(caregiverMoodRaw)
            : null;
          setCaregiverMood(parsedCaregiverMood);
          setCaregiverNote(parsedCaregiverMood?.note || "");
          setCalmToolsUsed(Number(calmToolUsesRaw || 0));
          setProgressNoteCompleted(noteStatusRaw === "completed");
          setWins(winsRaw ? JSON.parse(winsRaw) : []);
        } catch (error) {
          console.log("Home data load error:", error);
        }
      };

      loadHomeData();

      return () => {
        active = false;
      };
    }, [])
  );

  const nextRoutine = useMemo(() => {
    const now = new Date();
    const routines = schedule
      .filter(
        (item) =>
          item.type === "routine" &&
          item.status !== "completed" &&
          item.status !== "skipped"
      )
      .sort(
        (a, b) =>
          parseScheduleTime(a.time).getTime() -
          parseScheduleTime(b.time).getTime()
      );

    return (
      routines.find((item) => parseScheduleTime(item.time) >= now) ||
      routines[0] ||
      null
    );
  }, [schedule]);

  const nextAppointment = useMemo(() => {
    const appointments = schedule
      .filter(
        (item) =>
          item.type === "appointment" &&
          item.status !== "completed" &&
          item.status !== "skipped"
      )
      .sort(
        (a, b) =>
          parseScheduleTime(a.time).getTime() -
          parseScheduleTime(b.time).getTime()
      );

    return appointments[0] || null;
  }, [schedule]);

  const routineCompleted = useMemo(
    () =>
      schedule.filter(
        (item) => item.type === "routine" && item.status === "completed"
      ).length,
    [schedule]
  );
  const routineTotal = useMemo(
    () =>
      Math.max(schedule.filter((item) => item.type === "routine").length, 1),
    [schedule]
  );
  const recentActivity = useMemo(
    () => buildRecentActivity(schedule, childMood, caregiverMood, wins),
    [schedule, childMood, caregiverMood, wins]
  );

  const handleCaregiverMoodSelect = useCallback(
    async (mood: string) => {
      setCaregiverMood({
        mood,
        note: caregiverNote,
        time: new Date().toISOString(),
      });
      await saveCaregiverMood(mood, caregiverNote);
    },
    [caregiverNote]
  );

  const handleCaregiverNoteChange = useCallback(
    async (note: string) => {
      setCaregiverNote(note);
      if (caregiverMood?.mood) {
        setCaregiverMood({
          ...caregiverMood,
          note,
          time: new Date().toISOString(),
        });
        await saveCaregiverMood(caregiverMood.mood, note);
      }
    },
    [caregiverMood]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#EFE7FB", "#F5F0FA", "#FAF8FC"]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader
          userName={caregiverName}
          timeOfDay={getTimeOfDay()}
          onSettingsPress={() => rootNav.navigate("Settings")}
        />
        <View style={styles.content}>
          <ChildSelector
            child={child}
            onPress={() => navigation.navigate("MyChildTab")}
          />
          <TodayOverviewCard
            nextRoutine={
              nextRoutine
                ? {
                    time: formatScheduleTime(nextRoutine.time),
                    label: nextRoutine.title,
                  }
                : null
            }
            nextAppointment={
              nextAppointment
                ? {
                    date: `Today · ${formatScheduleTime(nextAppointment.time)}`,
                    label: nextAppointment.title,
                    with:
                      nextAppointment.subtitle?.replace(/^with\s+/i, "") || "",
                  }
                : null
            }
            onViewSchedule={() => rootNav.navigate("Schedule")}
          />
          <QuickSupportCards
            mode="hugi"
            onHugiPress={() => rootNav.navigate("HugiChat")}
            onSupportPress={() => rootNav.navigate("CalmingSounds")}
          />
          <View style={styles.moodStack}>
            <View style={styles.moodCardFullWidth}>
              <RecentProgress
                mode="mood"
                childName={child.name}
                childMood={{
                  label: childMood?.mood || "Not checked in",
                  time: childMood?.time
                    ? formatEntryTime(childMood.time)
                    : "Tap to add today",
                }}
                onViewAll={() => rootNav.navigate("MoodHistory")}
              />
            </View>
            <View style={styles.moodCardFullWidth}>
              <CaregiverCheckIn
                selectedMood={caregiverMood?.mood}
                noteValue={caregiverNote}
                onMoodSelect={handleCaregiverMoodSelect}
                onNoteChange={handleCaregiverNoteChange}
              />
            </View>
          </View>
          <QuickSupportCards
            mode="access"
            onRoutinesPress={() => rootNav.navigate("Schedule")}
            onCalmingPress={() => rootNav.navigate("CalmingSounds")}
            onTransitionsPress={() => rootNav.navigate("TransitionTimer")}
            onJournalPress={() => rootNav.navigate("JournalPrompt")}
            onMeltdownPress={() => rootNav.navigate("MeltdownPlan")}
          />
          <RecentProgress
            mode="activity"
            routineCompletion={{
              completed: routineCompleted,
              total: routineTotal,
            }}
            calmToolsUsed={{ used: calmToolsUsed, total: 4 }}
            progressNoteCompleted={progressNoteCompleted}
            activity={recentActivity}
            onViewAll={() => rootNav.navigate("ChildProgress")}
            onStartNote={() => rootNav.navigate("DailyNote")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAF8FC",
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 112,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  moodStack: {
    flexDirection: "column",
    gap: 12,
  },
  moodCardFullWidth: {
    width: "100%",
  },
});
