import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePremium } from "../src/lib/premium";

export default function BehavioralDataExportScreen() {
  const { showPremiumUpgrade } = usePremium();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="document-text-outline" size={34} color="#7548D8" />
      </View>
      <Text style={styles.title}>Behavioral Data Export</Text>
      <Text style={styles.text}>
        Premium unlocks shareable reports, PDF exports, support snapshots, and longer-term patterns for care-team conversations.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => showPremiumUpgrade({ feature: "pdf_exports" })}
        activeOpacity={0.86}
      >
        <Text style={styles.buttonText}>View Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F2",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#F0E2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D246B",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#6B5F7A",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#7548D8",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
