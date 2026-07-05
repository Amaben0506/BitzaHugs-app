import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts, Type, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

interface TodayOverviewCardProps {
  nextRoutine: { time: string; label: string } | null;
  nextAppointment: { date: string; label: string; with: string } | null;
  onViewSchedule: () => void;
}

export default function TodayOverviewCard({
  nextRoutine,
  nextAppointment,
  onViewSchedule,
}: TodayOverviewCardProps) {
  const { width } = useWindowDimensions();
  const stacked = width < 375;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Right now</Text>
      <View style={[styles.columns, stacked && styles.columnsStacked]}>
        <View style={styles.col}>
          <View style={styles.iconCircle}>
            <Ionicons name="sunny-outline" size={18} color={Colors.purple} />
          </View>
          <View style={styles.colText}>
            <Text style={styles.colActivity}>
              {nextRoutine?.label || "Open schedule"}
            </Text>
            <Text style={styles.colTime}>
              {nextRoutine?.time || "No routine queued"}
            </Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Routine</Text>
            </View>
          </View>
        </View>

        <View
          style={[styles.verticalDivider, stacked && styles.horizontalDivider]}
        />

        <View style={styles.col}>
          <View style={[styles.iconCircle, styles.appointmentIcon]}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={Colors.blushText}
            />
          </View>
          <View style={styles.colText}>
            <Text style={styles.appointmentLabel}>Next appointment</Text>
            <Text style={styles.colActivity}>
              {nextAppointment?.label || "Nothing scheduled"}
            </Text>
            <Text style={styles.colSub}>
              {nextAppointment
                ? nextAppointment.date
                : "Add one when you are ready"}
            </Text>
            {!!nextAppointment?.with && (
              <Text style={styles.colSub}>with {nextAppointment.with}</Text>
            )}
          </View>
        </View>
      </View>

      <PressableScale style={styles.primaryButton} onPress={onViewSchedule}>
        <Text style={styles.primaryButtonText}>View today's schedule</Text>
        <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 16,
    ...Shadows.card,
  },
  eyebrow: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  columns: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 8,
  },
  columnsStacked: {
    flexDirection: "column",
    gap: 12,
  },
  col: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  appointmentIcon: {
    backgroundColor: "#F8E7E5",
  },
  colText: {
    flex: 1,
    minWidth: 0,
  },
  colTime: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.medium,
    color: Colors.purple,
    marginTop: 2,
  },
  colActivity: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  appointmentLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  colSub: {
    fontSize: 10.5,
    lineHeight: 14,
    fontFamily: Fonts.regular,
    color: Colors.secondaryPlum,
    marginTop: 2,
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: Colors.lavenderSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  tagText: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryPlum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
  },
  emptyText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 8,
  },
  horizontalDivider: {
    width: "100%",
    height: 1,
    marginHorizontal: 0,
  },
});
