import React, { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
StatusBar,
Alert,
LogBox,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView, } from "@react-navigation/drawer";
import Purchases from "react-native-purchases";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";


// ─── Onboarding Screens ───────────────────────────────────────────────────────
import SplashScreen from "./Screens/SplashScreen";
import WelcomeScreen from "./Screens/WelcomeScreen";
import ChildProfileSetupScreen from "./Screens/ChildProfileSetupScreen";
import SensorySupportScreen from "./Screens/SensorySupportScreen";
import SensorySupportsScreen from "./Screens/SensorySupportsScreen";
import CaregiverSupportScreen from "./Screens/CaregiverSupportScreen";
import CalmSpaceReadyScreen from "./Screens/CalmSpaceReadyScreen";
import CreateAccountScreen from "./Screens/CreateAccountScreen";
import CommunityScreen from "./Screens/CommunityScreen";


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
import JournalHistoryScreen from "./Screens/JournalHistoryScreen";

// ─── Other Screens ────────────────────────────────────────────────────────────
import HugiChatScreen from "./Screens/HugiChatScreen";
import MeltdownPlanScreen from "./Screens/MeltdownPlanScreen";
import OnboardingScreen from "./Screens/OnboardingScreen";
import AppointmentTrackerScreen from "./Screens/AppointmentTrackerScreen";
import PremiumUpgradeScreen from "./Screens/PremiumUpgradeScreen";
import ResourcesScreen from "./Screens/ResourcesScreen";
import ReturningUserScreen from "./Screens/ReturningUserScreen";
import RecoveryRoutineScreen from "./Screens/RecoveryRoutineScreen";
import ShowMeScreen from "./Screens/ShowMeScreen";
import PauseWithMeScreen from "./Screens/PauseWithMeScreen";

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
const [isPremium, setIsPremium] = useState(false);

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

    const premium = await AsyncStorage.getItem("bitzaIsPremium");
    setIsPremium(premium === "true");
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
{ label: "Community", icon: "people-outline", screen: "Community" },
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
if (!isPremium) {
navigation.closeDrawer();

  Alert.alert(
    "Premium Feature",
    "Adding more than one child is a Premium feature. Upgrade to support your whole family!",
    [
      { text: "Not now", style: "cancel" },
      {
        text: "Upgrade",
        onPress: () => {
          const parentNav = navigation.getParent();

          if (parentNav) {
            parentNav.navigate("PremiumUpgrade");
          } else {
            navigation.navigate("PremiumUpgrade");
          }
        },
      },
    ]
  );

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
function MainTabs() {
return (
<Tab.Navigator
screenOptions={({ route }) => ({
headerShown: false,
tabBarShowLabel: true,
tabBarActiveTintColor: ACCENT,
tabBarInactiveTintColor: "#8E87A0",
tabBarStyle: {
height: 82,
paddingTop: 8,
paddingBottom: 16,
backgroundColor: "#FFFFFF",
borderTopWidth: 1,
borderTopColor: BORDER,
borderTopLeftRadius: 26,
borderTopRightRadius: 26,
position: "absolute",
shadowColor: "#000",
shadowOpacity: 0.07,
shadowRadius: 10,
shadowOffset: { width: 0, height: -3 },
elevation: 8,
},
tabBarLabelStyle: {
fontSize: 11,
fontWeight: "700",
marginTop: 2,
},
tabBarIcon: ({ focused, color }) => {
let iconName = "ellipse-outline";

      if (route.name === "HomeTab") {
        iconName = focused ? "home" : "home-outline";
      } else if (route.name === "RoutineTab") {
        iconName = focused ? "calendar" : "calendar-outline";
      } else if (route.name === "SupportTab") {
        iconName = focused ? "heart" : "heart-outline";
      } else if (route.name === "ProgressTab") {
        iconName = focused ? "bar-chart" : "bar-chart-outline";
      } else if (route.name === "SettingsTab") {
        iconName = focused ? "settings" : "settings-outline";
      }

      return <Ionicons name={iconName} size={24} color={color} />;
    },
  })}
>
  <Tab.Screen
    name="HomeTab"
    component={HomeScreen}
    options={{ tabBarLabel: "Home" }}
  />
  <Tab.Screen
    name="RoutineTab"
    component={RoutineScreen}
    options={{ tabBarLabel: "Routines" }}
  />
  <Tab.Screen
    name="SupportTab"
    component={SupportScreen}
    options={{ tabBarLabel: "Support" }}
  />
  <Tab.Screen
    name="ProgressTab"
    component={ProgressScreen}
    options={{ tabBarLabel: "Progress" }}
  />
  <Tab.Screen
    name="SettingsTab"
    component={SettingsScreen}
    options={{ tabBarLabel: "Settings" }}
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
<Drawer.Screen name="HugiChat" component={HugiChatScreen} />
<Drawer.Screen name="Community" component={CommunityScreen} />
</Drawer.Navigator>
);
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
const [iconsReady, setIconsReady] = useState(false);

useEffect(() => {
const setupRevenueCat = async () => {
  try {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    Purchases.configure({
      apiKey: "appl_nrdgYpwvNLPBLEIWXHsUpdPYFqy",
    });

    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlements = customerInfo?.entitlements?.active || {};
    const isPremium = activeEntitlements["BitzaHugs Pro"] != null;

    await AsyncStorage.setItem("bitzaIsPremium", isPremium ? "true" : "false");

    console.log("RevenueCat ready. Premium:", isPremium);
  } catch (error) {
    console.log("RevenueCat setup error:", error);
    // Don't overwrite premium on error — keep existing stored value
  }
};

setupRevenueCat();

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

}, []);

if (!iconsReady) return null;

return (<SafeAreaProvider><StatusBar
     barStyle="dark-content"
     backgroundColor="transparent"
     translucent
   />

  <NavigationContainer>
    <Stack.Navigator
      initialRouteName={DEV_MODE ? "MainTabs" : "Splash"}
      screenOptions={{ headerShown: false }}
    >
      {/* Onboarding */}
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
      <Stack.Screen name="Support" component={SupportScreen} />
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
      <Stack.Screen name="HugiChat" component={HugiChatScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
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
</SafeAreaProvider>

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
