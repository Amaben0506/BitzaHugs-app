import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MESSAGES = [
  "You are not failing.",
  "This moment will pass.",
  "You are doing hard things.",
  "One breath at a time.",
  "You are not alone in this.",
  "It's okay to not be okay right now.",
  "You are enough, exactly as you are.",
];

export default function PauseWithMeScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState("inhale"); // inhale | hold | exhale

  // Breathing animation loop
  useEffect(() => {
    let isMounted = true;

    const breathCycle = () => {
      if (!isMounted) return;

      // Inhale — 4 seconds
      setPhase("inhale");
      Animated.timing(scaleAnim, {
        toValue: 1.35,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) return;

        // Hold — 2 seconds
        setPhase("hold");
        setTimeout(() => {
          if (!isMounted) return;

          // Exhale — 4 seconds
          setPhase("exhale");
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            if (!isMounted) return;
            setTimeout(() => breathCycle(), 500);
          });
        }, 2000);
      });
    };

    breathCycle();
    return () => { isMounted = false; };
  }, []);

  // Fade in on mount
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Rotate through messages every 8 seconds
  useEffect(() => {
    // Fade in first message
    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        // Fade in
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const phaseText = {
    inhale: "Breathe in...",
    hold: "Hold...",
    exhale: "Breathe out...",
  }[phase];

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDE3FF" />
      <SafeAreaView style={styles.safeArea}>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.closeText}>✕  I'm ready</Text>
        </TouchableOpacity>

        {/* Top message */}
        <View style={styles.topSection}>
          <Text style={styles.titleText}>Pause With Me</Text>
          <Text style={styles.subtitleText}>Just breathe. Nothing else right now.</Text>
        </View>

        {/* Breathing orb */}
        <View style={styles.orbContainer}>
          {/* Outer glow rings */}
          <Animated.View style={[
            styles.orbRing3,
            { transform: [{ scale: scaleAnim }], opacity: 0.15 }
          ]} />
          <Animated.View style={[
            styles.orbRing2,
            { transform: [{ scale: scaleAnim }], opacity: 0.25 }
          ]} />
          <Animated.View style={[
            styles.orbRing1,
            { transform: [{ scale: scaleAnim }], opacity: 0.4 }
          ]} />

          {/* Main orb */}
          <Animated.View style={[
            styles.orb,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <Text style={styles.orbEmoji}>💜</Text>
          </Animated.View>

          {/* Phase text below orb */}
          <Text style={styles.phaseText}>{phaseText}</Text>
        </View>

        {/* Rotating affirmation message */}
        <Animated.View style={[styles.messageContainer, { opacity: messageOpacity }]}>
          <Text style={styles.messageText}>{MESSAGES[messageIndex]}</Text>
        </Animated.View>

        {/* Bottom grounding note */}
        <View style={styles.bottomSection}>
          <Text style={styles.groundingText}>
            You opened this app because you care.{"\n"}That already means something. 💜
          </Text>
        </View>

      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE3FF",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 40,
  },

  closeButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#9B7ACC",
  },
  closeText: {
    color: "#9B7ACC",
    fontSize: 13,
    fontWeight: "700",
  },

  topSection: {
    alignItems: "center",
    marginTop: 8,
  },
  titleText: {
    color: "#3D2B6B",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  subtitleText: {
    color: "#7B5EA7",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  orbRing3: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(155, 122, 204, 0.15)",
  },
  orbRing2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(155, 122, 204, 0.25)",
  },
  orbRing1: {
    position: "absolute",
    width: 165,
    height: 165,
    borderRadius: 82,
    backgroundColor: "rgba(155, 122, 204, 0.4)",
  },
  orb: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#9B7ACC",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9B7ACC",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  orbEmoji: {
    fontSize: 42,
  },
  phaseText: {
    position: "absolute",
    bottom: 10,
    color: "#7B5EA7",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  messageContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  messageText: {
    color: "#3D2B6B",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 32,
    letterSpacing: 0.2,
  },

  bottomSection: {
    alignItems: "center",
  },
  groundingText: {
    color: "#9B8AB8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
});