import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#2D246B";
const ACCENT = "#7548D8";

export default function NotificationPreferencesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PURPLE} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <Ionicons name="notifications-outline" size={48} color={ACCENT} />
        <Text style={styles.heading}>Notification Preferences</Text>
        <Text style={styles.sub}>Notification settings coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF9F2" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  title: { fontSize: 17, fontWeight: "800", color: PURPLE },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  heading: { fontSize: 20, fontWeight: "800", color: PURPLE },
  sub: { fontSize: 14, color: "#8E87A0", textAlign: "center" },
});