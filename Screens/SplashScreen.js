import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const splashScreen = require("../assets/icons/splash-background.png");

export default function SplashScreen({ navigation }) {
  const hasNavigated = useRef(false);

  const goToNextScreen = async () => {
    if (hasNavigated.current) return;

    hasNavigated.current = true;

    try {
      const complete = await AsyncStorage.getItem("bitzaOnboardingComplete");

      const accountSeen = await AsyncStorage.getItem("bitzaAccountPromptSeen");
      const accountCreated = await AsyncStorage.getItem("bitzaAccountCreated");
      if (complete === "true" && !accountCreated && !accountSeen) {
        navigation.replace("CreateAccount");
      } else {
        navigation.replace(complete === "true" ? "ReturningUser" : "Welcome");
      }
    } catch (e) {
      console.log("Error checking onboarding:", e);
      navigation.replace("Welcome");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      goToNextScreen();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={splashScreen}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <TouchableOpacity
        style={styles.tapArea}
        activeOpacity={1}
        onPress={goToNextScreen}
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

  tapArea: {
    ...StyleSheet.absoluteFillObject,
  },
});