import React, { useState } from "react";
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
  const [isStarting, setIsStarting] = useState(false);

  const handleBegin = async () => {
    if (isStarting) return;

    setIsStarting(true);

    try {
      await AsyncStorage.setItem("bitzaOnboardingComplete", "true");
    } catch (e) {
      console.log("Error saving onboarding state:", e);
    }

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
        <TouchableOpacity
          style={styles.invisibleButton}
          activeOpacity={1}
          onPress={handleBegin}
          disabled={isStarting}
          accessibilityRole="button"
          accessibilityLabel="Enter BitzaHugs"
          accessibilityHint="Finishes setup and opens the app"
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

  invisibleButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? "6%" : "4%",
    left: "6%",
    right: "6%",
    height: "9%",
    borderRadius: 30,

    // Turn this on only when checking button placement:
    // backgroundColor: "rgba(255,0,0,0.3)",
  },
});