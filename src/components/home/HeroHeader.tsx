import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts, Shadows } from "../../theme/theme";

interface HeroHeaderProps {
  userName: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  onSettingsPress: () => void;
}

export default function HeroHeader({
  userName,
  timeOfDay,
  onSettingsPress,
}: HeroHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.greeting}>Good {timeOfDay},</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
            {userName}
          </Text>
          <Ionicons name="heart" size={26} color={Colors.purple} />
        </View>
      </View>
      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={onSettingsPress}
        activeOpacity={0.75}
        accessibilityLabel="Open settings"
      >
        <Ionicons name="settings-outline" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: "transparent",
  },
  copy: {
    flex: 1,
    paddingRight: 10,
  },
  greeting: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 1,
  },
  name: {
    flexShrink: 1,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.extrabold,
    color: Colors.textPrimary,
  },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cardBg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    ...Shadows.card,
  },
});
