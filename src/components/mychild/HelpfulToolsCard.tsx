import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts, Type, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

interface HelpfulToolsCardProps {
  childName: string;
  onTransitionTimer: () => void;
  onShowMe: () => void;
  onMeltdownSupport: () => void;
}

interface ToolCardProps {
  circleBg: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  title: string;
  description: string;
  accentColor: string;
  onPress: () => void;
}

function ToolCard({
  circleBg,
  iconName,
  iconColor,
  title,
  description,
  accentColor,
  onPress,
}: ToolCardProps) {
  return (
    <View style={styles.toolSlot}>
      <PressableScale style={styles.toolCard} onPress={onPress}>
        <View style={[styles.toolIconCircle, { backgroundColor: circleBg }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <Text
          style={[styles.toolTitle, { color: accentColor }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text style={styles.toolDescription} numberOfLines={3}>
          {description}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={12}
          color={accentColor}
          style={styles.toolArrow}
        />
      </PressableScale>
    </View>
  );
}

export default function HelpfulToolsCard({
  childName,
  onTransitionTimer,
  onShowMe,
  onMeltdownSupport,
}: HelpfulToolsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tools for {childName}</Text>
      </View>

      <View style={styles.row}>
        <ToolCard
          circleBg="#EDE0FF"
          iconName="timer-outline"
          iconColor={Colors.purple}
          title="Transition Timer"
          description="Prepare for what's next with visual countdowns."
          accentColor={Colors.purple}
          onPress={onTransitionTimer}
        />
        <ToolCard
          circleBg="#FFF8EC"
          iconName="images-outline"
          iconColor="#C4800A"
          title="Show Me"
          description={`Visuals to help ${childName} express needs.`}
          accentColor="#C4800A"
          onPress={onShowMe}
        />
        <ToolCard
          circleBg="#FFF0F4"
          iconName="heart-outline"
          iconColor="#C03060"
          title="Meltdown Support"
          description="Step-by-step support for hard moments."
          accentColor="#C03060"
          onPress={onMeltdownSupport}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Shadows.card,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  toolSlot: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  toolCard: {
    width: "100%",
    minHeight: 140,
    borderRadius: 14,
    padding: 10,
    backgroundColor: Colors.cardBg,
    ...Shadows.card,
  },
  toolIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 12,
    fontFamily: Fonts.semibold,
    marginTop: 2,
  },
  toolDescription: {
    fontSize: 9.5,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 13,
    flex: 1,
  },
  toolArrow: {
    marginTop: 6,
  },
});
