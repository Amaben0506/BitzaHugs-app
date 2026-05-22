// components/PremiumBadge.js
// Drop this anywhere next to a feature label to mark it as Premium
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PremiumBadge({ onPress, small = false }) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      style={[styles.badge, small && styles.badgeSmall]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name="sparkles" size={small ? 9 : 11} color="#7548D8" />
      <Text style={[styles.text, small && styles.textSmall]}>Premium</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F0E2FF",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#D8C3F7",
  },
  badgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    color: "#7548D8",
    fontSize: 10,
    fontWeight: "800",
  },
  textSmall: {
    fontSize: 9,
  },
});