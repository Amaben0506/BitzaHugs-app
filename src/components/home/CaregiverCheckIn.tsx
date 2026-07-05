import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts, Type, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

interface CaregiverCheckInProps {
  onMoodSelect: (mood: string) => void;
  onNoteChange: (text: string) => void;
  selectedMood?: string;
  noteValue?: string;
}

const MOODS = [
  { emoji: "😰", label: "Overwhelmed" },
  { emoji: "😔", label: "Struggling" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🌿", label: "Hopeful" },
  { emoji: "☀️", label: "Good" },
];

export default function CaregiverCheckIn({
  onMoodSelect,
  onNoteChange,
  selectedMood,
  noteValue,
}: CaregiverCheckInProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="heart"
            size={14}
            color={Colors.textRose}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Caregiver check-in</Text>
        </View>
      </View>

      <Text style={styles.prompt}>How are you holding up today?</Text>

      <View style={styles.chips}>
        {MOODS.map((mood) => {
          const selected = selectedMood === mood.label;
          return (
            <PressableScale
              key={mood.label}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onMoodSelect(mood.label)}
            >
              <Text style={styles.chipEmoji}>{mood.emoji}</Text>
              <Text
                style={styles.chipLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {mood.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <View style={styles.noteRow}>
        <Ionicons
          name="pencil-outline"
          size={12}
          color={Colors.grayLavender}
          style={styles.noteIcon}
        />
        <TextInput
          style={styles.noteInput}
          placeholder="Add a private note..."
          placeholderTextColor={Colors.textMuted}
          value={noteValue}
          onChangeText={onNoteChange}
          multiline={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderLeftWidth: 4,
    borderLeftColor: "#F0D0E8",
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
  headerIcon: {
    marginRight: 5,
  },
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textRose,
  },
  prompt: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 7,
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 2,
  },
  chip: {
    flex: 1,
    marginHorizontal: 3,
    minHeight: 50,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },
  chipSelected: {
    borderWidth: 1.5,
    borderColor: Colors.textRose,
    backgroundColor: "#FFE7EC",
  },
  chipEmoji: {
    fontSize: 20,
    marginBottom: 3,
  },
  chipLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 8,
    ...Shadows.card,
  },
  noteIcon: {
    flexShrink: 0,
  },
  noteInput: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    padding: 0,
  },
});
