import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// ─── Routine Templates ────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "morning", name: "Morning Routine", emoji: "🌅", desc: "A gentle start to the day", color: "#FFF0DF", accent: "#D99A3D",
    items: [
      { title: "Wake Up & Stretch", time: "7:00 AM", icon: "routine-morning-sun.png" },
      { title: "Get Dressed", time: "7:15 AM", icon: "tool-checklist-pencil.png" },
      { title: "Breakfast", time: "7:30 AM", icon: "routine-lunch-meal.png" },
      { title: "Brush Teeth", time: "7:50 AM", icon: "support-water-cup.png" },
      { title: "Pack Bag", time: "8:00 AM", icon: "routine-school-book.png" },
    ],
  },
  {
    id: "afterschool", name: "After School", emoji: "🏠", desc: "Wind down after a busy day", color: "#E7F4FF", accent: "#4C9ED9",
    items: [
      { title: "Arrive Home", time: "3:30 PM", icon: "tool-transition-hourglass.png" },
      { title: "Snack Time", time: "3:45 PM", icon: "routine-lunch-meal.png" },
      { title: "Quiet Break", time: "4:00 PM", icon: "support-breathing.png" },
      { title: "Homework / Learning", time: "4:30 PM", icon: "routine-school-book.png" },
      { title: "Free Play", time: "5:15 PM", icon: "support-fidget-spinner.png" },
    ],
  },
  {
    id: "bedtime", name: "Bedtime Routine", emoji: "🌙", desc: "Calm steps toward sleep", color: "#F0E2FF", accent: "#6F42D8",
    items: [
      { title: "Bath / Wash Up", time: "7:00 PM", icon: "support-water-cup.png" },
      { title: "Pajamas On", time: "7:20 PM", icon: "tool-checklist-pencil.png" },
      { title: "Calm Activity", time: "7:30 PM", icon: "support-calm-journal.png" },
      { title: "Brush Teeth", time: "7:50 PM", icon: "support-water-cup.png" },
      { title: "Lights Out", time: "8:00 PM", icon: "routine-morning-sun.png" },
    ],
  },
  {
    id: "weekend", name: "Weekend Calm", emoji: "☀️", desc: "A relaxed weekend structure", color: "#EEF7E8", accent: "#78A866",
    items: [
      { title: "Morning Routine", time: "8:00 AM", icon: "routine-morning-sun.png" },
      { title: "Family Time", time: "9:30 AM", icon: "support-fidget-spinner.png" },
      { title: "Lunch", time: "12:00 PM", icon: "routine-lunch-meal.png" },
      { title: "Quiet Time / Nap", time: "1:30 PM", icon: "support-breathing.png" },
      { title: "Outdoor Play", time: "3:00 PM", icon: "support-fidget-spinner.png" },
      { title: "Dinner & Wind Down", time: "5:30 PM", icon: "routine-lunch-meal.png" },
    ],
  },
];

// ─── Default Routine ──────────────────────────────────────────────────────────
const defaultRoutine = [
  { id: "1", title: "Morning Routine", time: "7:00 AM", icon: "routine-morning-sun.png", completed: true, category: "morning" },
  { id: "2", title: "School / Learning", time: "8:30 AM", icon: "routine-school-book.png", completed: true, category: "learning" },
  { id: "3", title: "Lunch", time: "12:30 PM", icon: "routine-lunch-meal.png", completed: false, category: "meal" },
  { id: "4", title: "Play / Break Time", time: "2:00 PM", icon: "support-fidget-spinner.png", completed: false, category: "break" },
];

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const getIconSource = (iconName) => {
  const icons = {
    "routine-morning-sun.png": require("../assets/icons/routine-morning-sun.png"),
    "routine-school-book.png": require("../assets/icons/routine-school-book.png"),
    "routine-lunch-meal.png": require("../assets/icons/routine-lunch-meal.png"),
    "support-fidget-spinner.png": require("../assets/icons/support-fidget-spinner.png"),
    "tool-transition-hourglass.png": require("../assets/icons/tool-transition-hourglass.png"),
    "support-calm-journal.png": require("../assets/icons/support-calm-journal.png"),
    "support-breathing.png": require("../assets/icons/support-breathing.png"),
    "support-water-cup.png": require("../assets/icons/support-water-cup.png"),
    "tool-checklist-pencil.png": require("../assets/icons/tool-checklist-pencil.png"),
  };
  return icons[iconName] || icons["tool-transition-hourglass.png"];
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RoutineScreen({ navigation }) {
  const [routineItems, setRoutineItems] = useState([]);
  const [childName, setChildName] = useState("Child 1");
  const [childAvatar, setChildAvatar] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const saved = await AsyncStorage.getItem("bitzaRoutineItems");
          if (saved) {
            setRoutineItems(JSON.parse(saved));
          } else {
            setRoutineItems(defaultRoutine);
            await AsyncStorage.setItem("bitzaRoutineItems", JSON.stringify(defaultRoutine));
          }
          const profile = await AsyncStorage.getItem("bitzaChildProfile");
          if (profile) {
            const parsed = JSON.parse(profile);
            setChildName(parsed.childName?.trim() || "Child 1");
            setChildAvatar(parsed.avatar || null);
          }
        } catch {
          setRoutineItems(defaultRoutine);
        }
      };
      load();
    }, [])
  );

  const saveRoutine = async (updated) => {
    try {
      setRoutineItems(updated);
      await AsyncStorage.setItem("bitzaRoutineItems", JSON.stringify(updated));
      const allDone = updated.length > 0 && updated.every((item) => item.completed);
      if (allDone) {
        const today = new Date().toDateString();
        const lastComplete = await AsyncStorage.getItem("bitzaRoutineLastCompleteDay");
        if (lastComplete !== today) {
          await AsyncStorage.setItem("bitzaRoutineLastCompleteDay", today);
          const current = await AsyncStorage.getItem("bitzaRoutineCompleteDays");
          const count = current ? parseInt(current) : 0;
          await AsyncStorage.setItem("bitzaRoutineCompleteDays", String(count + 1));
        }
      }
    } catch (e) {
      console.log("Error saving:", e);
    }
  };

  const toggleCompleted = (id) => saveRoutine(routineItems.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  const deleteActivity = (id) => saveRoutine(routineItems.filter((item) => item.id !== id));
  const resetToday = () => saveRoutine(routineItems.map((item) => ({ ...item, completed: false })));
  const resetToDefault = async () => { setRoutineItems(defaultRoutine); await AsyncStorage.setItem("bitzaRoutineItems", JSON.stringify(defaultRoutine)); };

  const applyTemplate = async (template) => {
    const newItems = template.items.map((item, index) => ({
      id: String(Date.now() + index), title: item.title, time: item.time, icon: item.icon, completed: false, category: template.id,
    }));
    await saveRoutine(newItems);
    setShowTemplates(false);
  };

  const completedCount = routineItems.filter((i) => i.completed).length;
  const totalCount = routineItems.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const avatarSources = {
    "01": require("../assets/icons/child-profile-01.png"),
    "02": require("../assets/icons/child-profile-02.png"),
    "03": require("../assets/icons/child-profile-03.png"),
    "04": require("../assets/icons/child-profile-04.png"),
    "05": require("../assets/icons/child-profile-05.png"),
    "06": require("../assets/icons/child-profile-06.png"),
    "07": require("../assets/icons/child-profile-07.png"),
    "08": require("../assets/icons/child-profile-08.png"),
    "09": require("../assets/icons/child-profile-09.png"),
    "10": require("../assets/icons/child-profile-10.png"),
    "11": require("../assets/icons/child-profile-11.png"),
    "12": require("../assets/icons/child-profile-12.png"),
  };
  const avatarSource = childAvatar && avatarSources[childAvatar] ? avatarSources[childAvatar] : null;

  return (
    <ImageBackground source={require("../assets/icons/sunrise-background.png")} style={styles.background} imageStyle={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.screenTitle}>Routines</Text>
              <Text style={styles.screenSubtitle}>{today}</Text>
            </View>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.85} onPress={() => setShowTemplates(true)}>
              <Feather name="layout" size={20} color="#6F42D8" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Child + Progress Row */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.childCard} activeOpacity={0.9} onPress={() => navigation.getParent()?.navigate("ChildProfile") ?? navigation.navigate("ChildProfile")}>
              <View style={styles.childAvatarWrap}>
                {avatarSource ? <Image source={avatarSource} style={styles.childAvatarImg} resizeMode="contain" /> : <Feather name="user" size={18} color="#6F42D8" strokeWidth={2.1} />}
              </View>
              <View style={styles.childTextWrap}>
                <Text style={styles.childLabel}>Routine for</Text>
                <Text style={styles.childName}>{childName}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#2B2463" />
            </TouchableOpacity>
            <View style={styles.progressCircleCard}>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
              <Text style={styles.progressDone}>{completedCount}/{totalCount}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrackWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{completedCount} of {totalCount} activities complete</Text>
          </View>

          {/* Gentle Note */}
          <View style={styles.noteCard}>
            <Image source={require("../assets/icons/support-positive-reminder.png")} style={styles.noteIcon} resizeMode="contain" />
            <View style={styles.noteTextWrap}>
              <Text style={styles.noteTitle}>Gentle reminder</Text>
              <Text style={styles.noteText}>Routines can bend. Missing a step doesn't ruin the day.</Text>
            </View>
          </View>

          {/* Routine List Header */}
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Today's Routine</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={resetToday} activeOpacity={0.85}><Text style={styles.resetText}>Reset</Text></TouchableOpacity>
              <TouchableOpacity onPress={resetToDefault} activeOpacity={0.85}><Text style={styles.defaultText}>Default</Text></TouchableOpacity>
            </View>
          </View>

          {/* Routine Items */}
          <View style={styles.routineListCard}>
            {routineItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Image source={require("../assets/icons/tool-checklist-pencil.png")} style={styles.emptyIcon} resizeMode="contain" />
                <Text style={styles.emptyTitle}>No activities yet</Text>
                <Text style={styles.emptyText}>Add your first routine step below.</Text>
              </View>
            ) : (
              routineItems.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.routineRow}>
                    <Image source={getIconSource(item.icon)} style={styles.routineIcon} resizeMode="contain" />
                    <View style={styles.routineTextWrap}>
                      <Text style={[styles.routineTitle, item.completed && styles.routineTitleDone]}>{item.title}</Text>
                      <Text style={styles.routineTime}>{item.time}</Text>
                    </View>
                    <View style={styles.routineActions}>
                      <TouchableOpacity style={[styles.checkCircle, item.completed && styles.checkCircleDone]} onPress={() => toggleCompleted(item.id)} activeOpacity={0.85}>
                        {item.completed && <Feather name="check" size={15} color="#2B2463" strokeWidth={2.4} />}
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteActivity(item.id)} activeOpacity={0.85}>
                        <Feather name="trash-2" size={13} color="#D86A5B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index !== routineItems.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            )}
          </View>

          {/* Add Activity */}
          <TouchableOpacity style={styles.addButton} activeOpacity={0.9} onPress={() => navigation.getParent()?.navigate("AddRoutineActivity")}>
            <View style={styles.addIconCircle}>
              <Feather name="plus" size={20} color="#6F42D8" strokeWidth={2.4} />
            </View>
            <View style={styles.addTextWrap}>
              <Text style={styles.addTitle}>Add Activity</Text>
              <Text style={styles.addSubtitle}>Meals, breaks, school tasks, bedtime & more.</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#2B2463" />
          </TouchableOpacity>

          {/* Encouragement */}
          <View style={styles.encouragementCard}>
            <Image source={require("../assets/icons/decor-little-purple-heart.png")} style={styles.encourageIcon} resizeMode="contain" />
            <Text style={styles.encouragementText}>You're building rhythm, not perfection.</Text>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Templates Modal */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <View style={tmpl.overlay}>
          <View style={tmpl.sheet}>
            <View style={tmpl.handle} />
            <View style={tmpl.header}>
              <Text style={tmpl.title}>Routine Templates</Text>
              <Text style={tmpl.subtitle}>Choose a starting point — you can edit it after.</Text>
              <TouchableOpacity style={tmpl.closeBtn} onPress={() => setShowTemplates(false)} activeOpacity={0.85}>
                <Feather name="x" size={18} color="#2B2463" />
              </TouchableOpacity>
            </View>
            <ScrollView style={tmpl.scroll} contentContainerStyle={tmpl.scrollContent} showsVerticalScrollIndicator={false}>
              {TEMPLATES.map((template) => (
                <TouchableOpacity key={template.id} style={[tmpl.templateCard, { backgroundColor: template.color, borderColor: template.accent + "44" }]} onPress={() => applyTemplate(template)} activeOpacity={0.86}>
                  <Text style={tmpl.templateEmoji}>{template.emoji}</Text>
                  <View style={tmpl.templateTextWrap}>
                    <Text style={[tmpl.templateName, { color: template.accent }]}>{template.name}</Text>
                    <Text style={tmpl.templateDesc}>{template.desc}</Text>
                    <Text style={tmpl.templateCount}>{template.items.length} activities</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={template.accent} />
                </TouchableOpacity>
              ))}
              <View style={tmpl.noteCard}>
                <Feather name="info" size={14} color="#6F42D8" />
                <Text style={tmpl.noteText}>Applying a template will replace your current routine. Your progress will reset.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { width: "100%", height: "100%" },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, backgroundColor: "transparent" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  screenTitle: { color: "#2B2463", fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  screenSubtitle: { color: "#5B5672", fontSize: 12, fontWeight: "600", marginTop: 1 },
  headerButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },

  topRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  childCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 11, paddingVertical: 10, flexDirection: "row", alignItems: "center", shadowColor: "#BFA99D", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  childAvatarWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginRight: 9, overflow: "hidden" },
  childAvatarImg: { width: 36, height: 36 },
  childTextWrap: { flex: 1 },
  childLabel: { color: "#837E96", fontSize: 11, fontWeight: "600", marginBottom: 1 },
  childName: { color: "#2B2463", fontSize: 14, fontWeight: "800" },
  progressCircleCard: { width: 64, backgroundColor: "rgba(246,236,255,0.95)", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  progressPercent: { color: "#6F42D8", fontSize: 15, fontWeight: "800" },
  progressDone: { color: "#837E96", fontSize: 10, fontWeight: "600", marginTop: 1 },

  progressTrackWrap: { marginBottom: 8 },
  progressTrack: { height: 7, borderRadius: 7, backgroundColor: "rgba(237,227,251,0.95)", overflow: "hidden", marginBottom: 4 },
  progressFill: { height: "100%", borderRadius: 7, backgroundColor: "#8B5BE8" },
  progressLabel: { color: "#837E96", fontSize: 11, fontWeight: "600" },

  noteCard: { backgroundColor: "rgba(255,232,220,0.95)", borderRadius: 16, borderWidth: 1, borderColor: "#FFD0C0", paddingHorizontal: 11, paddingVertical: 9, flexDirection: "row", alignItems: "center", marginBottom: 10 },
  noteIcon: { width: 38, height: 38, marginRight: 10 },
  noteTextWrap: { flex: 1 },
  noteTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  noteText: { color: "#2B2463", fontSize: 11, lineHeight: 15, fontWeight: "600" },

  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  sectionTitle: { color: "#2B2463", fontSize: 16, fontWeight: "800" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  resetText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },
  defaultText: { color: "#837E96", fontSize: 12, fontWeight: "800" },

  routineListCard: { backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 11, paddingVertical: 4, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  emptyCard: { minHeight: 120, alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  emptyIcon: { width: 46, height: 46, marginBottom: 7 },
  emptyTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  emptyText: { color: "#837E96", fontSize: 11, fontWeight: "600", textAlign: "center" },

  routineRow: { minHeight: 56, flexDirection: "row", alignItems: "center" },
  routineIcon: { width: 36, height: 36, borderRadius: 11, marginRight: 10 },
  routineTextWrap: { flex: 1, paddingRight: 6 },
  routineTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  routineTitleDone: { color: "#837E96", textDecorationLine: "line-through" },
  routineTime: { color: "#6F42D8", fontSize: 12, fontWeight: "700" },
  routineActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: "#DED5D1", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  checkCircleDone: { backgroundColor: "#DCC2FB", borderColor: "#DCC2FB" },
  deleteButton: { width: 26, height: 26, borderRadius: 9, backgroundColor: "#FFE7E1", alignItems: "center", justifyContent: "center" },
  divider: { height: 1, backgroundColor: "#EEE7E2", marginLeft: 46 },

  addButton: { backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 16, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, paddingVertical: 11, flexDirection: "row", alignItems: "center", marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  addIconCircle: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginRight: 11 },
  addTextWrap: { flex: 1 },
  addTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 2 },
  addSubtitle: { color: "#5B5672", fontSize: 11, lineHeight: 15, fontWeight: "600" },

  encouragementCard: { backgroundColor: "rgba(246,236,255,0.95)", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  encourageIcon: { width: 34, height: 34, marginRight: 10 },
  encouragementText: { flex: 1, color: "#2B2463", fontSize: 13, lineHeight: 17, fontWeight: "700" },
});

const tmpl = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFDF9", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "80%", paddingBottom: Platform.OS === "ios" ? 34 : 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD6F0", alignSelf: "center", marginTop: 10, marginBottom: 4 },
  header: { paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EFE4DC" },
  title: { color: "#2B2463", fontSize: 18, fontWeight: "800", marginBottom: 3 },
  subtitle: { color: "#837E96", fontSize: 12, fontWeight: "600" },
  closeBtn: { position: "absolute", top: 12, right: 16, width: 30, height: 30, borderRadius: 9, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  templateCard: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 12 },
  templateEmoji: { fontSize: 28 },
  templateTextWrap: { flex: 1 },
  templateName: { fontSize: 15, fontWeight: "900", marginBottom: 2 },
  templateDesc: { color: "#5B5672", fontSize: 12, fontWeight: "600", marginBottom: 2 },
  templateCount: { color: "#837E96", fontSize: 11, fontWeight: "600" },
  noteCard: { backgroundColor: "#F6ECFF", borderRadius: 12, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 12, paddingVertical: 9, flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 4 },
  noteText: { flex: 1, color: "#6F42D8", fontSize: 11, lineHeight: 16, fontWeight: "600" },
});
