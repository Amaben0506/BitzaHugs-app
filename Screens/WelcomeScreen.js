import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Platform,
  View,
} from "react-native";

const welcomeHugiScreen = require("../assets/icons/hugi-welcome-hero.png");

export default function WelcomeScreen({ navigation }) {
  const handleBegin = () => {
    navigation.navigate("ChildProfileSetup");
  };

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

      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.beginButton}
          activeOpacity={0.85}
          onPress={handleBegin}
          accessibilityRole="button"
          accessibilityLabel="Let's begin"
          accessibilityHint="Starts the BitzaHugs setup"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  buttonArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "ios" ? 94 : 76,
    alignItems: "center",
  },

  beginButton: {
    width: "88%",
    height: 62,
    borderRadius: 31,

    // Turn this on only if you need to check button placement:
    // backgroundColor: "rgba(255,0,0,0.25)",
  },
});