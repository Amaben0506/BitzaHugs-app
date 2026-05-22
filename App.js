import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Onboarding Screens ───────────────────────────────────────────────────────
import SplashScreen from "./Screens/SplashScreen";
import WelcomeScreen from "./Screens/WelcomeScreen";
import ChildProfileSetupScreen from "./Screens/ChildProfileSetupScreen";
import SensorySupportsScreen from "./Screens/SensorySupportScreen";
import CaregiverSupportScreen from "./Screens/CaregiverSupportScreen";
import CalmSpaceReadyScreen from "./Screens/CalmSpaceReadyScreen";

// ─── Main Tab Screens ─────────────────────────────────────────────────────────
import HomeScreen from "./Screens/Homescreen";
import RoutineScreen from "./Screens/RoutineScreen";
import SupportScreen from "./Screens/SupportScreen";
import ProgressScreen from "./Screens/ProgressScreen";
import SettingsScreen from "./Screens/SettingsScreen";

// ─── Routine Screens ──────────────────────────────────────────────────────────
import AddRoutineActivityScreen from "./Screens/AddRoutineActivityScreen";

// ─── Profile / Settings Screens ───────────────────────────────────────────────
import ChildProfileScreen from "./Screens/ChildProfileScreen";
import ChildrenListScreen from "./Screens/ChildrenListScreen";
import ParentProfileScreen from "./Screens/ParentProfileScreen";
import NotificationPreferencesScreen from "./Screens/NotificationPreferencesScreen";
import PrivacySafetyScreen from "./Screens/PrivacySafetyScreen";

// ─── Support / Calm Tool Screens ──────────────────────────────────────────────
import SupportModeScreen from "./Screens/SupportModeScreen";
import SupportPersonScreen from "./Screens/SupportPersonScreen";
import MoodCheckScreen from "./Screens/MoodCheckScreen";
import MoodSupportScreen from "./Screens/MoodSupportScreen";
import BreathingScreen from "./Screens/BreathingScreen";
import GroundingStepsScreen from "./Screens/GroundingStepsScreen";
import MovementPromptScreen from "./Screens/MovementPromptScreen";
import SoundsScreen from "./Screens/SoundsScreen";
import TransitionsScreen from "./Screens/TransitionsScreen";
import WaterReminderScreen from "./Screens/WaterReminderScreen";
import AffirmationsScreen from "./Screens/AffirmationsScreen";

// ─── Journal Screens ──────────────────────────────────────────────────────────
import CalmJournalScreen from "./Screens/CalmJournalScreen";
import JournalEntryDetailScreen from "./Screens/JournalEntryDetailScreen";
import JournalHistoryScreen from "./Screens/JournalHistoryScreen";

// ─── Other Screens ────────────────────────────────────────────────────────────
import HugiChatScreen from "./Screens/HugiChatScreen";
import MeltdownPlanScreen from "./Screens/MeltdownPlanScreen";
import OnboardingScreen from "./Screens/OnboardingScreen";
import AppointmentTrackerScreen from "./Screens/AppointmentTrackerScreen";
import CommunityScreen from "./Screens/CommunityScreen";
import PremiumUpgradeScreen from "./Screens/PremiumUpgradeScreen";

// ─── Navigators ───────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const PURPLE = "#2D246B";
const ACCENT = "#7548D8";
const BORDER = "#EFE5DD";

// ─── Custom Drawer Content ────────────────────────────────────────────────────
function CustomDrawerContent({ navigation }) {
  const [parentName, setParentName] = useState("there");
  const [children, setChildren] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Load parent name
        const parent = await AsyncStorage.getItem("bitzaParentProfile");
        if (parent) {
          const p = JSON.parse(parent);
          setParentName(p.preferredGreeting?.trim() || p.name?.trim() || "there");
        }

        // Load all children
        const primary = await AsyncStorage.getItem("bitzaChildProfile");
        const extras = await AsyncStorage.getItem("bitzaChildProfiles");
        const extraList = extras ? JSON.parse(extras) : [];
        const primaryChild = primary ? JSON.parse(primary) : null;

        const allChildren = [];
        if (primaryChild?.childName?.trim()) allChildren.push({ ...primaryChild, index: 0 });
        extraList.forEach((c, i) => { if (c?.childName?.trim()) allChildren.push({ ...c, index: i + 1 }); });
        setChildren(allChildren);

        // Check premium
        const premium = await AsyncStorage.getItem("bitzaIsPremium");
        setIsPremium(premium === "true");
      } catch (e) {
        console.log("Drawer load error:", e);
      }
    };
    load();
  }, []);

  const mainItems = [
    { label: "Home", icon: "home-outline", screen: "MainTabs" },
    { label: "Routines", icon: "calendar-outline", screen: "MainTabs" },
    { label: "Emotional Check-In", icon: "heart-outline", screen: "MoodSupport" },
    { label: "Emergency / Support Mode", icon: "alert-circle-outline", screen: "SupportMode" },
    { label: "Progress", icon: "bar-chart-outline", screen: "MainTabs" },
    { label: "Community", icon: "chatbubble-outline", screen: "Community" },
  ];

  const toolItems = [
    { label: "Transition Timer", icon: "timer-outline", screen: "Transitions" },
    { label: "Breathing Exercises", icon: "partly-sunny-outline", screen: "Breathing" },
    { label: "Calming Sounds", icon: "musical-notes-outline", screen: "Sounds" },
    { label: "Calm Journal", icon: "book-outline", screen: "CalmJournal" },
    { label: "Appointment Tracker", icon: "calendar-outline", screen: "AppointmentTracker" },
    { label: "Affirmations", icon: "star-outline", screen: "Affirmations" },
  ];

  const settingsItems = [
    { label: "Profile & Settings", icon: "person-outline", screen: "ParentProfile" },
    { label: "Notifications", icon: "notifications-outline", screen: "NotificationPreferences" },
    { label: "Privacy & Safety", icon: "shield-outline", screen: "PrivacySafety" },
    { label: "Upgrade to Premium", icon: "sparkles-outline", screen: "PremiumUpgrade" },
  ];

  const navigate = (screen, params) => {
    navigation.closeDrawer();
    navigation.navigate(screen, params);
  };

  const handleAddChild = () => {
    if (!isPremium) {
      navigation.closeDrawer();
      Alert.alert(
        "Premium Feature",
        "Adding more than one child is a Premium feature. Upgrade to support your whole family!",
        [
          { text: "Not now", style: "cancel" },
          { text: "Upgrade", onPress: () => navigation.navigate("PremiumUpgrade") },
        ]
      );
      return;
    }
    navigate("ChildProfileSetup", { childIndex: children.length });
  };

  return (
    <DrawerContentScrollView
      style={styles.drawerContainer}
      contentContainerStyle={styles.drawerContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Close */}
      <TouchableOpacity style={styles.drawerClose} onPress={() => navigation.closeDrawer()}>
        <Ionicons name="close" size={24} color={PURPLE} />
      </TouchableOpacity>

      {/* Profile */}
      <View style={styles.drawerProfile}>
        <View style={styles.drawerAvatar}>
          <Ionicons name="person-outline" size={24} color={ACCENT} />
        </View>
        <View>
          <Text style={styles.drawerProfileName}>Hi, {parentName} 👋</Text>
          <Text style={styles.drawerProfileSub}>You're doing great. 🤍</Text>
        </View>
      </View>

      <View style={styles.drawerDivider} />

      {/* My Children — dynamic */}
      <Text style={styles.drawerSectionLabel}>MY CHILD(REN)</Text>

      {children.length === 0 ? (
        <DrawerRow
          label="Set up child profile"
          icon="person-outline"
          onPress={() => navigate("ChildProfileSetup")}
        />
      ) : (
        children.map((child, i) => (
          <DrawerRow
            key={i}
            label={child.childName || `Child ${i + 1}`}
            icon="person-outline"
            onPress={() => navigate("ChildProfile", { childIndex: child.index })}
          />
        ))
      )}

      {/* Add Another Child — free users see Premium gate */}
      <DrawerRow
        label="Add Another Child"
        icon="add-circle-outline"
        dashed
        badge={!isPremium ? "Premium" : null}
        onPress={handleAddChild}
      />

      {/* Manage Children (only show if more than 1) */}
      {children.length > 1 && (
        <DrawerRow
          label="Manage Children"
          icon="people-outline"
          onPress={() => navigate("ChildrenList")}
        />
      )}

      <View style={styles.drawerDivider} />

      {/* Main */}
      <Text style={styles.drawerSectionLabel}>MAIN</Text>
      {mainItems.map((item) => (
        <DrawerRow key={item.label} label={item.label} icon={item.icon} onPress={() => navigate(item.screen)} />
      ))}

      <View style={styles.drawerDivider} />

      {/* Tools */}
      <Text style={styles.drawerSectionLabel}>TOOLS</Text>
      {toolItems.map((item) => (
        <DrawerRow key={item.label} label={item.label} icon={item.icon} onPress={() => navigate(item.screen)} />
      ))}

      <View style={styles.drawerDivider} />

      {/* Settings */}
      <Text style={styles.drawerSectionLabel}>SETTINGS</Text>
      {settingsItems.map((item) => (
        <DrawerRow key={item.label} label={item.label} icon={item.icon} onPress={() => navigate(item.screen)} />
      ))}

      <View style={styles.drawerDivider} />

      {/* Log Out */}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#D86A5B" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

function DrawerRow({ label, icon, onPress, badge, dashed }) {
  return (
    <TouchableOpacity style={styles.drawerRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.drawerRowIcon, dashed && styles.drawerRowIconDashed]}>
        <Ionicons name={icon} size={18} color={ACCENT} />
      </View>
      <Text style={styles.drawerRowLabel}>{label}</Text>
      <View style={styles.drawerRowRight}>
        {badge ? (
          <View style={styles.drawerBadge}>
            <Text style={styles.drawerBadgeText}>{badge}</Text>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={15} color={PURPLE} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: "#8E87A0",
        tabBarStyle: {
          height: 82, paddingTop: 8, paddingBottom: 16,
          backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: BORDER,
          borderTopLeftRadius: 26, borderTopRightRadius: 26, position: "absolute",
          shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10,
          shadowOffset: { width: 0, height: -3 }, elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "HomeTab") iconName = focused ? "home" : "home-outline";
          else if (route.name === "RoutineTab") iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "SupportTab") iconName = focused ? "heart" : "heart-outline";
          else if (route.name === "ProgressTab") iconName = focused ? "bar-chart" : "bar-chart-outline";
          else if (route.name === "SettingsTab") iconName = focused ? "settings" : "settings-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="RoutineTab" component={RoutineScreen} options={{ tabBarLabel: "Routines" }} />
      <Tab.Screen name="SupportTab" component={SupportScreen} options={{ tabBarLabel: "Support" }} />
      <Tab.Screen name="ProgressTab" component={ProgressScreen} options={{ tabBarLabel: "Progress" }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: "Settings" }} />
    </Tab.Navigator>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: "78%", backgroundColor: "#FFFDF9" },
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen name="DrawerHome" component={MainTabs} />
      <Drawer.Screen name="SupportMode" component={SupportModeScreen} />
      <Drawer.Screen name="HugiChat" component={HugiChatScreen} />
    </Drawer.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────
const DEV_MODE = false;

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={DEV_MODE ? "MainTabs" : "Splash"}
          screenOptions={{ headerShown: false }}
        >
          {/* Onboarding */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="ChildProfileSetup" component={ChildProfileSetupScreen} />
          <Stack.Screen name="SensorySupport" component={SensorySupportsScreen} />
          <Stack.Screen name="CaregiverSupport" component={CaregiverSupportScreen} />
          <Stack.Screen name="CalmSpaceReady" component={CalmSpaceReadyScreen} />

          {/* Main App */}
          <Stack.Screen name="MainTabs" component={DrawerNavigator} />

          {/* Routine */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Routine" component={RoutineScreen} />
          <Stack.Screen name="AddRoutineActivity" component={AddRoutineActivityScreen} />

          {/* Main Screens */}
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />

          {/* Profiles */}
          <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
          <Stack.Screen name="ChildrenList" component={ChildrenListScreen} />
          <Stack.Screen name="ParentProfile" component={ParentProfileScreen} />
          <Stack.Screen name="Notifications" component={NotificationPreferencesScreen} />
          <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
          <Stack.Screen name="PrivacySafety" component={PrivacySafetyScreen} />

          {/* Support Tools */}
          <Stack.Screen name="SupportMode" component={SupportModeScreen} />
          <Stack.Screen name="SupportPerson" component={SupportPersonScreen} />
          <Stack.Screen name="MoodCheck" component={MoodCheckScreen} />
          <Stack.Screen name="MoodSupport" component={MoodSupportScreen} />
          <Stack.Screen name="Breathing" component={BreathingScreen} />
          <Stack.Screen name="GroundingSteps" component={GroundingStepsScreen} />
          <Stack.Screen name="MovementPrompt" component={MovementPromptScreen} />
          <Stack.Screen name="Sounds" component={SoundsScreen} />
          <Stack.Screen name="CalmingSounds" component={SoundsScreen} />
          <Stack.Screen name="Transitions" component={TransitionsScreen} />
          <Stack.Screen name="WaterReminder" component={WaterReminderScreen} />
          <Stack.Screen name="Affirmations" component={AffirmationsScreen} />

          {/* Journal */}
          <Stack.Screen name="CalmJournal" component={CalmJournalScreen} />
          <Stack.Screen name="JournalEntryDetail" component={JournalEntryDetailScreen} />
          <Stack.Screen name="JournalHistory" component={JournalHistoryScreen} />

          {/* Other */}
          <Stack.Screen name="HugiChat" component={HugiChatScreen} />
          <Stack.Screen name="MeltdownPlan" component={MeltdownPlanScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="AppointmentTracker" component={AppointmentTrackerScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: "#FFFDF9" },
  drawerContent: { paddingBottom: 40 },
  drawerClose: { alignSelf: "flex-end", padding: 14, paddingBottom: 2 },
  drawerProfile: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  drawerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EFE1FF", alignItems: "center", justifyContent: "center" },
  drawerProfileName: { color: PURPLE, fontSize: 15, fontWeight: "800" },
  drawerProfileSub: { color: "#837E96", fontSize: 11, fontWeight: "600", marginTop: 2 },
  drawerDivider: { height: 1, backgroundColor: BORDER, marginHorizontal: 16, marginVertical: 8 },
  drawerSectionLabel: { color: "#8E87A0", fontSize: 10, fontWeight: "700", letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 3, marginTop: 3 },
  drawerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 11 },
  drawerRowIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: "#F0E6FF", alignItems: "center", justifyContent: "center" },
  drawerRowIconDashed: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: ACCENT, borderStyle: "dashed" },
  drawerRowLabel: { flex: 1, color: PURPLE, fontSize: 13, fontWeight: "700" },
  drawerRowRight: { flexDirection: "row", alignItems: "center", gap: 5 },
  drawerBadge: { backgroundColor: ACCENT, borderRadius: 9, paddingHorizontal: 6, paddingVertical: 2 },
  drawerBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  logoutButton: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 6, padding: 11, borderRadius: 13, backgroundColor: "#FFF0EE", borderWidth: 1, borderColor: "#FFD5D0", gap: 9 },
  logoutText: { color: "#D86A5B", fontSize: 13, fontWeight: "800" },
});