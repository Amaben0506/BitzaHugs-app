import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BehavioralDataExportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Behavioral Data Export</Text>
      <Text style={styles.text}>
        This feature is coming soon.
      </Text>
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
  },
});