import React, { useEffect } from "react";
import {
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

const splashScreen = require("../assets/icons/splash-background.png");

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigation]);

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

      {/* Optional: lets you tap anywhere to skip to welcome */}
      <TouchableOpacity
        style={styles.tapArea}
        activeOpacity={1}
        onPress={() => navigation.replace("Welcome")}
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