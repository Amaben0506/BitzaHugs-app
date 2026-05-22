import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Platform,
} from "react-native";

const welcomeHugiScreen = require("../assets/icons/hugi-welcome-hero.png");

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={welcomeHugiScreen}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Let's Begin button */}
      <TouchableOpacity
        style={styles.beginButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("ChildProfileSetup")}
      />

      {/* Sign In link */}
      <TouchableOpacity
        style={styles.signInButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("ChildProfileSetup")}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  // Sits over the Let's Begin button in the image
  // bottom % based on where button appears in the 9:16 image
  beginButton: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: Platform.OS === "ios" ? 100 : 80,
    height: 62,
    borderRadius: 31,
    // backgroundColor: "rgba(255,0,0,0.3)", // uncomment to debug position
  },

  // Sits over the "Sign in" text
  signInButton: {
    position: "absolute",
    left: 80,
    right: 80,
    bottom: Platform.OS === "ios" ? 56 : 38,
    height: 36,
    borderRadius: 18,
    // backgroundColor: "rgba(0,255,0,0.3)", // uncomment to debug position
  },
});