import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts, Type, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

interface RecentProgressProps {
  mode?: "mood" | "activity";
  childName?: string;
  childMood?: { label: string; time: string };
  routineCompletion?: { completed: number; total: number };
  calmToolsUsed?: { used: number; total: number };
  progressNoteCompleted?: boolean;
  activity?: {
    title: string;
    subtitle: string;
    status: string;
    icon: string;
  } | null;
  onViewAll: () => void;
  onStartNote?: () => void;
}

export default function RecentProgress({
  mode = "activity",
  childName = "Your child",
  childMood,
  routineCompletion = { completed: 0, total: 1 },
  calmToolsUsed = { used: 0, total: 4 },
  progressNoteCompleted = false,
  activity,
  onViewAll,
  onStartNote,
}: RecentProgressProps) {
  if (mode === "mood") {
    const hasMood = !!childMood?.label && childMood.label !== "Not checked in";
    return (
      <PressableScale style={styles.moodCard} onPress={onViewAll}>
        <Text style={styles.moodHeading}>{childName}'s mood</Text>
        <View style={styles.moodBody}>
          <View style={styles.moodIcon}>
            <Ionicons name="leaf-outline" size={20} color={Colors.purple} />
          </View>
          <View style={styles.moodText}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: hasMood
                      ? Colors.green
                      : Colors.grayLavender,
                  },
                ]}
              />
              <Text
                style={[styles.moodValue, !hasMood && styles.moodValueMuted]}
              >
                {childMood?.label || "Not checked in"}
              </Text>
            </View>
            <View style={styles.moodTimeRow}>
              <Text style={styles.moodTime}>
                {childMood?.time || "Tap to add today"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={Colors.grayLavender}
              />
            </View>
          </View>
        </View>
      </PressableScale>
    );
  }

  const routinePct = Math.round(
    (routineCompletion.completed / routineCompletion.total) * 100
  );

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <PressableScale onPress={onViewAll} haptic={false}>
          <View style={styles.viewAll}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.purple} />
          </View>
        </PressableScale>
      </View>

      <PressableScale
        style={styles.activityCard}
        onPress={activity ? onViewAll : onStartNote}
      >
        <View style={styles.activityIcon}>
          <Ionicons
            name={(activity?.icon || "calendar-outline") as any}
            size={18}
            color={Colors.purple}
          />
        </View>
        <View style={styles.activityCopy}>
          <Text style={styles.activityTitle}>
            {activity?.title || "No recent activity yet"}
          </Text>
          <Text style={styles.activitySub}>
            {activity?.subtitle ||
              `Routine completion ${routinePct}% · ${calmToolsUsed.used}/${calmToolsUsed.total} calm tools`}
          </Text>
        </View>
        {activity?.status ? (
          <Text style={styles.status} numberOfLines={1}>
            {activity.status}
          </Text>
        ) : null}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.grayLavender}
        />
      </PressableScale>

      {!progressNoteCompleted && onStartNote ? (
        <PressableScale style={styles.noteNudge} onPress={onStartNote}>
          <Ionicons
            name="create-outline"
            size={16}
            color={Colors.primaryPlum}
          />
          <Text style={styles.noteNudgeText}>Start today's progress note</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  moodCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    ...Shadows.card,
  },
  moodHeading: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  moodBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  moodIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  moodText: {
    flex: 1,
    minWidth: 0,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  moodValue: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  moodValueMuted: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
  },
  moodTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  moodTime: {
    flex: 1,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
  activityCard: {
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...Shadows.card,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  activityTitle: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  activitySub: {
    fontSize: 10.5,
    lineHeight: 14,
    fontFamily: Fonts.regular,
    color: Colors.secondaryPlum,
    marginTop: 4,
  },
  status: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: Colors.green,
    flexShrink: 0,
    textAlign: "right",
  },
  noteNudge: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: Colors.lavenderSurface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...Shadows.card,
  },
  noteNudgeText: {
    color: Colors.primaryPlum,
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
});
