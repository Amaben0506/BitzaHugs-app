import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  View,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const calmSpaceBg = require("../assets/icons/calm-space-ready.png");

export default function CalmSpaceReadyScreen({ navigation }) {

  const handleBegin = async () => {
    try {
      // Mark onboarding as complete so app skips it next time
      await AsyncStorage.setItem("bitzaOnboardingComplete", "true");
    } catch (e) {
      console.log("Error saving onboarding state:", e);
    }
    // ✅ replace so user can't go back to onboarding
    navigation.replace("MainTabs");
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={calmSpaceBg}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Invisible tap zone over the button in the image */}
        <TouchableOpacity
          style={styles.invisibleButton}
          activeOpacity={0.0}
          onPress={handleBegin}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5E9FF",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  // Sits over the "Let's Begin" or "Enter" button in the calm-space-ready.png image
  // Adjust bottom/height if button position differs on your device
  invisibleButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? "6%" : "4%",
    left: "6%",
    right: "6%",
    height: "9%",
    // backgroundColor: "rgba(255,0,0,0.3)", // uncomment to debug position
  },
});