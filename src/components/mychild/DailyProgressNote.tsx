import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts, Type, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

type NoteStatus = "not-started" | "in-progress" | "completed";

interface DailyProgressNoteProps {
  status: NoteStatus;
  childName: string;
  onStartNote: () => void;
  onContinueNote: () => void;
  onViewPastNotes: () => void;
}

const STATUS_CONFIG = {
  "not-started": {
    label: "Not started",
    badgeBg: "#F0F0F0",
    badgeColor: Colors.textMuted,
    btnLabel: "✏️  Start today's note",
    btnBg: Colors.primaryPlum,
  },
  "in-progress": {
    label: "In progress",
    badgeBg: Colors.navActiveBg,
    badgeColor: Colors.purple,
    btnLabel: "✏️  Continue today's note",
    btnBg: Colors.primaryPlum,
  },
  completed: {
    label: "Completed ✓",
    badgeBg: "#E8F5E9",
    badgeColor: Colors.green,
    btnLabel: "✓  View today's note",
    btnBg: Colors.green,
  },
};

export default function DailyProgressNote({
  status,
  childName,
  onStartNote,
  onContinueNote,
  onViewPastNotes,
}: DailyProgressNoteProps) {
  const config = STATUS_CONFIG[status];

  const handlePrimary = () => {
    if (status === "not-started") onStartNote();
    else if (status === "in-progress") onContinueNote();
    else onViewPastNotes();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Daily Progress Note</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: config.badgeBg }]}>
          <Text style={[styles.badgeText, { color: config.badgeColor }]}>
            {config.label}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        A quick record of how today went for {childName}.
      </Text>

      <View style={styles.divider} />

      <PressableScale
        style={[styles.primaryBtn, { backgroundColor: config.btnBg }]}
        onPress={handlePrimary}
      >
        <Text style={styles.primaryBtnText}>{config.btnLabel}</Text>
      </PressableScale>

      <TouchableOpacity
        onPress={onViewPastNotes}
        activeOpacity={0.7}
        style={styles.secondaryRow}
      >
        <Text style={styles.secondaryLink}>View past notes →</Text>
      </TouchableOpacity>
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
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  badge: {
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: Fonts.regular,
  },
  description: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    marginTop: 6,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.cardBorder,
    marginTop: 10,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  primaryBtnText: {
    fontSize: 13,
    fontFamily: Fonts.semibold,
    color: "#FFFFFF",
  },
  secondaryRow: {
    alignItems: "center",
    marginTop: 8,
  },
  secondaryLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
});
