import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface MoodEntry {
  mood: string;
  emoji: string;
  note: string;
  time: string;
}

interface CaregiverMoodTrackerProps {
  selectedMood?: string;
  lastEntry?: MoodEntry;
  onMoodSelect: (mood: string) => void;
  onNoteChange: (text: string) => void;
  onViewHistory: () => void;
}

const MOODS = [
  { emoji: '😰', label: 'Overwhelmed' },
  { emoji: '😔', label: 'Struggling' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🌿', label: 'Hopeful' },
  { emoji: '☀️', label: 'Good' },
];

export default function CaregiverMoodTracker({
  selectedMood,
  lastEntry,
  onMoodSelect,
  onNoteChange,
  onViewHistory,
}: CaregiverMoodTrackerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How are you feeling today?</Text>
        <Text style={styles.headerPrivate}>This is private 🔒</Text>
      </View>

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
              <Text style={styles.chipLabel} numberOfLines={1} adjustsFontSizeToFit>
                {mood.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {lastEntry ? (
        <View style={styles.entryBanner}>
          <View style={styles.entryTopRow}>
            <View style={styles.entryLeft}>
              <Text style={styles.entryIcon}>💗</Text>
              <Text style={styles.entryTitle}>Your check-in</Text>
            </View>
            <Text style={styles.entryTime}>{lastEntry.time}</Text>
          </View>
          <Text style={styles.entryNote}>{lastEntry.note}</Text>
        </View>
      ) : null}

      <TextInput
        style={styles.noteInput}
        placeholder="What's weighing on you, or what do you need right now…"
        placeholderTextColor={Colors.textMuted}
        onChangeText={onNoteChange}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity onPress={onViewHistory} activeOpacity={0.7} style={styles.historyRow}>
        <Text style={styles.historyLink}>View mood history</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  headerPrivate: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    flexShrink: 0,
  },
  chips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  chip: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    ...Shadows.card,
  },
  chipSelected: {
    backgroundColor: '#FFF0F4',
    borderWidth: 1.5,
    borderColor: '#E07090',
  },
  chipEmoji: {
    fontSize: 20,
    marginBottom: 3,
  },
  chipLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  entryBanner: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  entryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  entryTitle: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  entryTime: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  entryNote: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  noteInput: {
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    minHeight: 64,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  historyRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  historyLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
});
