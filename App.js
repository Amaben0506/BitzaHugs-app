import React, { useEffect, useRef, useState } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
StatusBar,
LogBox,
} from "react-native";
import * as Notifications from "expo-notifications";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView, } from "@react-navigation/drawer";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FREE_LIMITS, PremiumProvider, usePremium } from "./src/lib/premium";


// ─── Onboarding Screens ───────────────────────────────────────────────────────
import SplashScreen from "./Screens/SplashScreen";
import WelcomeScreen from "./Screens/WelcomeScreen";
import ChildProfileSetupScreen from "./Screens/ChildProfileSetupScreen";
import SensorySupportScreen from "./Screens/SensorySupportScreen";
import SensorySupportsScreen from "./Screens/SensorySupportsScreen";
import CaregiverSupportScreen from "./Screens/CaregiverSupportScreen";
import CalmSpaceReadyScreen from "./Screens/CalmSpaceReadyScreen";
import CreateAccountScreen from "./Screens/CreateAccountScreen";

// ─── Main Tab Screens ─────────────────────────────────────────────────────────
import HomeScreen from "./src/screens/HomeScreen";
import MyChildScreen from "./src/screens/MyChildScreen";

// ─── Onboarding ───────────────────────────────────────────────────────────────
import OnboardingNavigator from "./src/screens/onboarding/OnboardingNavigator";

// ─── Support Placeholder Screens ─────────────────────────────────────────────
import AddContactScreen from "./src/screens/AddContactScreen";
import AllContactsScreen from "./src/screens/AllContactsScreen";
import PrintableResourcesScreen from "./src/screens/PrintableResourcesScreen";
import CaregiverCommunityScreen from "./src/screens/CaregiverCommunityScreen";
import CommunityGuidelinesScreen from "./src/screens/CommunityGuidelinesScreen";
import CommunityPostDetailScreen from "./src/screens/CommunityPostDetailScreen";
import CommunityComposerScreen from "./src/screens/CommunityComposerScreen";
import BlockedUsersScreen from "./src/screens/BlockedUsersScreen";
import ModerationScreen from "./src/screens/ModerationScreen";
import SupportPlanScreen from "./src/screens/SupportPlanScreen";
import HelpfulResourcesScreen from "./src/screens/HelpfulResourcesScreen";
import SupportActivityScreen from "./src/screens/SupportActivityScreen";
import SafetyInfoScreen from "./src/screens/SafetyInfoScreen";

// ─── MyCare Placeholder Screens ──────────────────────────────────────────────
import EditCaregiverProfileScreen from "./src/screens/EditCaregiverProfileScreen";
import CaregiverMoodHistoryScreen from "./src/screens/CaregiverMoodHistoryScreen";
import JournalWriteScreen from "./src/screens/JournalWriteScreen";
import JournalPromptScreen from "./src/screens/JournalPromptScreen";
import ToolsActivityScreen from "./src/screens/ToolsActivityScreen";
import WellnessSummaryScreen from "./src/screens/WellnessSummaryScreen";

// ─── MyChild Placeholder Screens ─────────────────────────────────────────────
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ScheduleScreen from "./src/screens/ScheduleScreen";
import AddActivityScreen from "./src/screens/AddActivityScreen";
import MoodHistoryScreen from "./src/screens/MoodHistoryScreen";
import DailyNoteScreen from "./src/screens/DailyNoteScreen";
import PastNotesScreen from "./src/screens/PastNotesScreen";
import TransitionTimerScreen from "./src/screens/TransitionTimerScreen";
import CareTeamScreen from "./src/screens/CareTeamScreen";
import AddCareTeamMemberScreen from "./src/screens/AddCareTeamMemberScreen";
import AddWinScreen from "./src/screens/AddWinScreen";
import ChildProgressScreen from "./src/screens/ChildProgressScreen";
import WinsScreen from "./src/screens/WinsScreen";
import MyCareScreen from "./src/screens/MyCareScreen";
import NewHugiChatScreen from "./src/screens/HugiChatScreen";
import NewImmediateSupportScreen from "./src/screens/ImmediateSupportScreen";
import RoutineScreen from "./Screens/RoutineScreen";
import LegacySupportScreen from "./Screens/SupportScreen";
import NewSupportScreen from "./src/screens/SupportScreen";
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
import SupportSnapshotScreen from "./Screens/SupportSnapshotScreen";
import BehavioralDataExportScreen from "./Screens/BehavioralDataExportScreen";
import AccountScreen from "./Screens/AccountScreen";
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
import JournalHistoryScreen from "./src/screens/JournalHistoryScreen";

// ─── Other Screens ────────────────────────────────────────────────────────────
import MeltdownPlanScreen from "./Screens/MeltdownPlanScreen";
import OnboardingScreen from "./Screens/OnboardingScreen";
import AppointmentTrackerScreen from "./Screens/AppointmentTrackerScreen";
import PremiumUpgradeScreen from "./Screens/PremiumUpgradeScreen";
import ResourcesScreen from "./Screens/ResourcesScreen";
import ReturningUserScreen from "./Screens/ReturningUserScreen";
import RecoveryRoutineScreen from "./Screens/RecoveryRoutineScreen";
import ShowMeScreen from "./Screens/ShowMeScreen";
import PauseWithMeScreen from "./Screens/PauseWithMeScreen";

import {
  setupNotificationChannel,
  scheduleBitzaHugsNotifications,
} from "./utils/notifications";

LogBox.ignoreLogs([
"[Reanimated] The `isReanimated3` function is deprecated.",
]);

// ─── Navigators ───────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const PURPLE = "#2D246B";
const ACCENT = "#7548D8";
const BORDER = "#EFE5DD";

const DEV_MODE = false;

// ─── Drawer Row ───────────────────────────────────────────────────────────────
function DrawerRow({ label, icon, onPress, badge, dashed }) {
return ( <TouchableOpacity
   style={styles.drawerRow}
   onPress={onPress}
   activeOpacity={0.75}
   accessibilityRole="button"
   accessibilityLabel={label}
 >
<View style={[styles.drawerRowIcon, dashed && styles.drawerRowIconDashed]}><Ionicons name={icon} size={18} color={ACCENT} /></View>

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

// ─── Custom Drawer Content ────────────────────────────────────────────────────
function CustomDrawerContent({ navigation }) {
const [parentName, setParentName] = useState("there");
const [children, setChildren] = useState([]);
const { isPremium, isLoading: premiumLoading, showPremiumUpgrade } = usePremium();

useEffect(() => {
const loadDrawerData = async () => {
try {
const parent = await AsyncStorage.getItem("bitzaParentProfile");


    if (parent) {
      const parsedParent = JSON.parse(parent);
      setParentName(
        parsedParent.preferredGreeting?.trim() ||
          parsedParent.name?.trim() ||
          "there"
      );
    }

    const primary = await AsyncStorage.getItem("bitzaChildProfile");
    const extras = await AsyncStorage.getItem("bitzaChildProfiles");

    const primaryChild = primary ? JSON.parse(primary) : null;
    const extraList = extras ? JSON.parse(extras) : [];

    const allChildren = [];

    if (primaryChild?.childName?.trim()) {
      allChildren.push({ ...primaryChild, index: 0 });
    }

    extraList.forEach((child, index) => {
      if (child?.childName?.trim()) {
        allChildren.push({ ...child, index: index + 1 });
      }
    });

    setChildren(allChildren);

  } catch (error) {
    console.log("Drawer load error:", error);
  }
};

loadDrawerData();

}, []);

const mainItems = [
{
label: "Home",
icon: "home-outline",
screen: "DrawerHome",
params: { screen: "HomeTab" },
drawerRoute: true,
},
{
label: "Routines",
icon: "calendar-outline",
screen: "DrawerHome",
params: { screen: "RoutineTab" },
drawerRoute: true,
},
{
label: "Emotional Check-In",
icon: "heart-outline",
screen: "MoodSupport",
},
{
label: "Support Right Now",
icon: "alert-circle-outline",
screen: "SupportMode",
},
{
label: "Progress",
icon: "bar-chart-outline",
screen: "DrawerHome",
params: { screen: "ProgressTab" },
drawerRoute: true,
},
];

const toolItems = [
{ label: "Transition Timer", icon: "timer-outline", screen: "Transitions" },
{ label: "Breathing Exercises", icon: "partly-sunny-outline", screen: "Breathing" },
{ label: "Calming Sounds", icon: "musical-notes-outline", screen: "Sounds" },
{ label: "Calm Journal", icon: "book-outline", screen: "CalmJournal" },
{ label: "Appointment Tracker", icon: "calendar-outline", screen: "AppointmentTracker" },
{ label: "Affirmations", icon: "star-outline", screen: "Affirmations" },
{ label: "Printable Resources", icon: "print-outline", screen: "Resources" },
{ label: "Water Reset", icon: "water-outline", screen: "WaterReminder" },
{ label: "Sensory Support", icon: "hand-left-outline", screen: "SensorySupports" },
];

const settingsItems = [
{ label: "Profile & Settings", icon: "person-outline", screen: "ParentProfile" },
{ label: "Notifications", icon: "notifications-outline", screen: "NotificationPreferences" },
{ label: "Privacy & Safety", icon: "shield-outline", screen: "PrivacySafety" },
{ label: "Upgrade to Premium", icon: "sparkles-outline", screen: "PremiumUpgrade" },
];

const navigate = (screen, params, drawerRoute = false) => {
navigation.closeDrawer();


if (drawerRoute) {
  navigation.navigate(screen, params);
  return;
}

const parentNav = navigation.getParent();

if (parentNav) {
  parentNav.navigate(screen, params);
} else {
  navigation.navigate(screen, params);
}


};

const handleAddChild = () => {
if (premiumLoading) {
  navigation.closeDrawer();
  showPremiumUpgrade({ feature: "multiple_children", isChecking: true });
  return;
}

if (!isPremium && children.length >= FREE_LIMITS.childProfiles) {
  navigation.closeDrawer();
  showPremiumUpgrade({ feature: "multiple_children" });
  return;
}

navigate("ChildProfileSetup", { childIndex: children.length });

};

return ( <DrawerContentScrollView
   style={styles.drawerContainer}
   contentContainerStyle={styles.drawerContent}
   showsVerticalScrollIndicator={false}
 >
<TouchableOpacity
style={styles.drawerClose}
onPress={() => navigation.closeDrawer()}
activeOpacity={0.8}
accessibilityRole="button"
accessibilityLabel="Close menu"
><Ionicons name="close" size={24} color={PURPLE} /></TouchableOpacity>


  <View style={styles.drawerProfile}>
    <View style={styles.drawerAvatar}>
      <Ionicons name="person-outline" size={24} color={ACCENT} />
    </View>

    <View style={styles.drawerProfileTextWrap}>
      <Text style={styles.drawerProfileName}>Hi, {parentName} 👋</Text>
      <Text style={styles.drawerProfileSub}>You're doing great. 🤍</Text>
    </View>
  </View>

  <View style={styles.drawerDivider} />

  <Text style={styles.drawerSectionLabel}>MY CHILD(REN)</Text>

  {children.length === 0 ? (
    <DrawerRow
      label="Set up child profile"
      icon="person-outline"
      onPress={() => navigate("ChildProfileSetup")}
    />
  ) : (
    children.map((child, index) => (
      <DrawerRow
        key={`${child.childName}-${index}`}
        label={child.childName || `Child ${index + 1}`}
        icon="person-outline"
        onPress={() => navigate("ChildProfile", { childIndex: child.index })}
      />
    ))
  )}

  <DrawerRow
    label="Add Another Child"
    icon="add-circle-outline"
    dashed
    badge={!isPremium ? "Premium" : null}
    onPress={handleAddChild}
  />

  {children.length > 1 && (
    <DrawerRow
      label="Manage Children"
      icon="people-outline"
      onPress={() => navigate("ChildrenList")}
    />
  )}

  <View style={styles.drawerDivider} />

  <Text style={styles.drawerSectionLabel}>MAIN</Text>

  {mainItems.map((item) => (
    <DrawerRow
      key={item.label}
      label={item.label}
      icon={item.icon}
      onPress={() => navigate(item.screen, item.params, item.drawerRoute)}
    />
  ))}

  <View style={styles.drawerDivider} />

  <Text style={styles.drawerSectionLabel}>TOOLS</Text>

  {toolItems.map((item) => (
    <DrawerRow
      key={item.label}
      label={item.label}
      icon={item.icon}
      onPress={() => navigate(item.screen)}
    />
  ))}

  <View style={styles.drawerDivider} />

  <Text style={styles.drawerSectionLabel}>SETTINGS</Text>

  {settingsItems.map((item) => (
    <DrawerRow
      key={item.label}
      label={item.label}
      icon={item.icon}
      onPress={() => navigate(item.screen)}
    />
  ))}

  <View style={styles.drawerDivider} />

  <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
    <Ionicons name="log-out-outline" size={20} color="#D86A5B" />
    <Text style={styles.logoutText}>Log Out</Text>
  </TouchableOpacity>
</DrawerContentScrollView>

);
}

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
const TAB_ACTIVE_COLOR = "#7B3DC8";
const TAB_INACTIVE_COLOR = "#C8B8E0";
const TAB_ACTIVE_BG = "#EDE0FF";

const TAB_ICONS = {
  HomeTab:     { focused: "home",   outline: "home-outline" },
  MyChildTab:  { focused: "person", outline: "person-outline" },
  MyCareTab:   { focused: "heart",  outline: "heart-outline" },
  SupportTab:  { focused: "people", outline: "people-outline" },
};

function MainTabs() {
return (
<Tab.Navigator
screenOptions={({ route }) => ({
  headerShown: false,
  tabBarShowLabel: true,
  tabBarActiveTintColor: TAB_ACTIVE_COLOR,
  tabBarInactiveTintColor: TAB_INACTIVE_COLOR,
  tabBarStyle: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    height: 72,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    shadowColor: "#7B5EA7",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tabBarLabelStyle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    marginTop: 1,
    marginBottom: 4,
  },
  tabBarIcon: ({ focused }) => {
    const icons = TAB_ICONS[route.name] || { focused: "ellipse", outline: "ellipse-outline" };
    const iconName = focused ? icons.focused : icons.outline;
    const color = focused ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR;
    if (focused) {
      return (
        <View style={{
          width: 48,
          height: 32,
          backgroundColor: TAB_ACTIVE_BG,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 6,
        }}>
          <Ionicons name={iconName} size={20} color={color} />
        </View>
      );
    }
    return <Ionicons name={iconName} size={20} color={color} style={{ marginTop: 6 }} />;
  },
})}
>
  <Tab.Screen
    name="HomeTab"
    component={HomeScreen}
    options={{ tabBarLabel: "Home" }}
  />
  <Tab.Screen
    name="MyChildTab"
    component={MyChildScreen}
    options={{ tabBarLabel: "My Child" }}
  />
  <Tab.Screen
    name="MyCareTab"
    component={MyCareScreen}
    options={{ tabBarLabel: "My Care" }}
  />
  <Tab.Screen
    name="SupportTab"
    component={NewSupportScreen}
    options={{ tabBarLabel: "Support" }}
  />
</Tab.Navigator>

);
}

// ─── Drawer Navigator ─────────────────────────────────────────────────────────
function DrawerNavigator() {
return (
<Drawer.Navigator
drawerContent={(props) => <CustomDrawerContent {...props} />}
screenOptions={{
headerShown: false,
drawerStyle: {
width: "78%",
backgroundColor: "#FFFDF9",
},
swipeEnabled: true,
}}
>
<Drawer.Screen name="DrawerHome" component={MainTabs} />
<Drawer.Screen name="SupportMode" component={SupportModeScreen} />
<Drawer.Screen name="HugiChat" component={NewHugiChatScreen} />

</Drawer.Navigator>
);
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
const [iconsReady, setIconsReady] = useState(false);
const navigationRef = useRef(null);
const [fontsLoaded] = useFonts({
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
});

// One-time migration: remove the obsolete bitzaCommunityUsername key that was
// written by the retired Screens/CommunityScreen.js room-based chat. The flag
// bitzaCleanedOldCommunity ensures this runs exactly once per device.
useEffect(() => {
  AsyncStorage.getItem('bitzaCleanedOldCommunity').then((done) => {
    if (!done) {
      AsyncStorage.removeItem('bitzaCommunityUsername');
      AsyncStorage.setItem('bitzaCleanedOldCommunity', 'true');
    }
  });
}, []);

useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const screen = response.notification.request.content.data?.screen;
    if (screen && navigationRef.current?.isReady()) {
      navigationRef.current.navigate(screen);
    }
  });
  return () => subscription.remove();
}, []);

useEffect(() => {
const loadIconFonts = async () => {
  try {
    await Font.loadAsync({
      ...Ionicons.font,
      ...Feather.font,
    });
  } catch (error) {
    console.log("Error loading icon fonts:", error);
  } finally {
    setIconsReady(true);
  }
};

loadIconFonts();

const setupNotifications = async () => {
  try {
    // Set up Android channel — no permission needed, safe on cold launch.
    await setupNotificationChannel();
    // If the user already granted permission, re-apply their saved schedule.
    // Never call requestPermissionsAsync() here.
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") {
      const raw = await AsyncStorage.getItem("bitzaNotificationPreferences");
      if (raw) await scheduleBitzaHugsNotifications(JSON.parse(raw));
    }
  } catch (e) {
    console.log("Notification setup error:", e);
  }
};
setupNotifications();

}, []);

if (!iconsReady || !fontsLoaded) return null;

return (<SafeAreaProvider><PremiumProvider><StatusBar
     barStyle="dark-content"
     backgroundColor="transparent"
     translucent
   />

  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator
      id="RootStack"
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      {/* Onboarding */}
      <Stack.Screen name="OnboardingFlow" component={OnboardingNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="ChildProfileSetup"
        component={ChildProfileSetupScreen}
      />
      <Stack.Screen
        name="SensorySupport"
        component={SensorySupportScreen}
      />
      <Stack.Screen
        name="CaregiverSupport"
        component={CaregiverSupportScreen}
      />
      <Stack.Screen
        name="CalmSpaceReady"
        component={CalmSpaceReadyScreen}
      />
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
      />

      {/* Main App */}
      <Stack.Screen name="MainTabs" component={DrawerNavigator} />
      <Stack.Screen name="ReturningUser" component={ReturningUserScreen} />

      {/* Main Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Routine" component={RoutineScreen} />
      <Stack.Screen name="Support" component={LegacySupportScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* Routine */}
      <Stack.Screen
        name="AddRoutineActivity"
        component={AddRoutineActivityScreen}
      />

      {/* Profiles */}
      <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
      <Stack.Screen name="ChildrenList" component={ChildrenListScreen} />
      <Stack.Screen name="ParentProfile" component={ParentProfileScreen} />
      <Stack.Screen
        name="Notifications"
        component={NotificationPreferencesScreen}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
      />
      <Stack.Screen
        name="PrivacySafety"
        component={PrivacySafetyScreen}
      />

      {/* Support Tools */}
      <Stack.Screen name="SupportMode" component={SupportModeScreen} />
      <Stack.Screen name="SupportPerson" component={SupportPersonScreen} />
<Stack.Screen name="SupportSnapshot" component={SupportSnapshotScreen} />
<Stack.Screen name="BehavioralDataExport" component={BehavioralDataExportScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="MoodCheck" component={MoodCheckScreen} />
      <Stack.Screen name="MoodSupport" component={MoodSupportScreen} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen
        name="GroundingSteps"
        component={GroundingStepsScreen}
      />
      <Stack.Screen
        name="MovementPrompt"
        component={MovementPromptScreen}
      />
      <Stack.Screen name="Sounds" component={SoundsScreen} />
      <Stack.Screen name="CalmingSounds" component={SoundsScreen} />
      <Stack.Screen name="Transitions" component={TransitionsScreen} />
      <Stack.Screen
        name="WaterReminder"
        component={WaterReminderScreen}
      />
      <Stack.Screen name="Affirmations" component={AffirmationsScreen} />
      <Stack.Screen
        name="SensorySupports"
        component={SensorySupportsScreen}
      />

      {/* Journal */}
      <Stack.Screen name="CalmJournal" component={CalmJournalScreen} />
      <Stack.Screen
        name="JournalEntryDetail"
        component={JournalEntryDetailScreen}
      />
      <Stack.Screen
        name="JournalHistory"
        component={JournalHistoryScreen}
      />

      {/* Other */}
      <Stack.Screen name="RecoveryRoutine" component={RecoveryRoutineScreen} />
      <Stack.Screen name="HugiChat" component={NewHugiChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ImmediateSupport" component={NewImmediateSupportScreen} options={{ headerShown: false }} />

      {/* Support Screens */}
      <Stack.Screen name="AddContact" component={AddContactScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="AllContacts" component={AllContactsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrintableResources" component={PrintableResourcesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CaregiverCommunity" component={CaregiverCommunityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CommunityGuidelines" component={CommunityGuidelinesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CommunityPostDetail" component={CommunityPostDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CommunityComposer" component={CommunityComposerScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Moderation" component={ModerationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SupportPlan" component={SupportPlanScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HelpfulResources" component={HelpfulResourcesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SupportActivity" component={SupportActivityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SafetyInfo" component={SafetyInfoScreen} options={{ headerShown: false }} />

      {/* MyCare Screens */}
      <Stack.Screen name="EditCaregiverProfile" component={EditCaregiverProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CaregiverMoodHistory" component={CaregiverMoodHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JournalWrite" component={JournalWriteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JournalPrompt" component={JournalPromptScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ToolsActivity" component={ToolsActivityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WellnessSummary" component={WellnessSummaryScreen} options={{ headerShown: false }} />

      {/* MyChild Screens */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddActivity" component={AddActivityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DailyNote" component={DailyNoteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PastNotes" component={PastNotesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TransitionTimer" component={TransitionTimerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CareTeam" component={CareTeamScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddCareTeamMember" component={AddCareTeamMemberScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddWin" component={AddWinScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="Wins" component={WinsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChildProgress" component={ChildProgressScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MeltdownPlan" component={MeltdownPlanScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen
        name="AppointmentTracker"
        component={AppointmentTrackerScreen}
      />
      <Stack.Screen
        name="PremiumUpgrade"
        component={PremiumUpgradeScreen}
      />
      <Stack.Screen name="Resources" component={ResourcesScreen} />
          <Stack.Screen name="ShowMe" component={ShowMeScreen} />
          <Stack.Screen name="PauseWithMe" component={PauseWithMeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
</PremiumProvider></SafeAreaProvider>

);
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
drawerContainer: {
flex: 1,
backgroundColor: "#FFFDF9",
},
drawerContent: {
paddingBottom: 40,
},
drawerClose: {
alignSelf: "flex-end",
padding: 14,
paddingBottom: 2,
},
drawerProfile: {
flexDirection: "row",
alignItems: "center",
paddingHorizontal: 16,
paddingBottom: 14,
gap: 12,
},
drawerAvatar: {
width: 44,
height: 44,
borderRadius: 22,
backgroundColor: "#EFE1FF",
alignItems: "center",
justifyContent: "center",
},
drawerProfileTextWrap: {
flex: 1,
},
drawerProfileName: {
color: PURPLE,
fontSize: 15,
fontWeight: "800",
},
drawerProfileSub: {
color: "#837E96",
fontSize: 11,
fontWeight: "600",
marginTop: 2,
},
drawerDivider: {
height: 1,
backgroundColor: BORDER,
marginHorizontal: 16,
marginVertical: 8,
},
drawerSectionLabel: {
color: "#8E87A0",
fontSize: 10,
fontWeight: "700",
letterSpacing: 0.8,
paddingHorizontal: 16,
marginBottom: 3,
marginTop: 3,
},
drawerRow: {
flexDirection: "row",
alignItems: "center",
paddingHorizontal: 16,
paddingVertical: 8,
gap: 11,
},
drawerRowIcon: {
width: 28,
height: 28,
borderRadius: 9,
backgroundColor: "#F0E6FF",
alignItems: "center",
justifyContent: "center",
},
drawerRowIconDashed: {
backgroundColor: "transparent",
borderWidth: 1.5,
borderColor: ACCENT,
borderStyle: "dashed",
},
drawerRowLabel: {
flex: 1,
color: PURPLE,
fontSize: 13,
fontWeight: "700",
},
drawerRowRight: {
flexDirection: "row",
alignItems: "center",
gap: 5,
},
drawerBadge: {
backgroundColor: ACCENT,
borderRadius: 9,
paddingHorizontal: 6,
paddingVertical: 2,
},
drawerBadgeText: {
color: "#FFFFFF",
fontSize: 10,
fontWeight: "800",
},
logoutButton: {
flexDirection: "row",
alignItems: "center",
marginHorizontal: 16,
marginTop: 6,
padding: 11,
borderRadius: 13,
backgroundColor: "#FFF0EE",
borderWidth: 1,
borderColor: "#FFD5D0",
gap: 9,
},
logoutText: {
color: "#D86A5B",
fontSize: 13,
fontWeight: "800",
},
});
