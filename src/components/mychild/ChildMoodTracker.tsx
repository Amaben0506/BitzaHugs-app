import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface MoodEntry {
  mood: string;
  emoji: string;
  time: string;
  note?: string;
}

interface ChildMoodTrackerProps {
  childName: string;
  lastMood?: MoodEntry;
  onMoodSelect: (mood: string) => void;
  onViewHistory: () => void;
  onNoteChange: (text: string) => void;
  selectedMood?: string;
}

const MOODS = [
  { emoji: '😰', label: 'Overwhelmed' },
  { emoji: '😔', label: 'Struggling' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🌿', label: 'Hopeful' },
  { emoji: '☀️', label: 'Good' },
];

export default function ChildMoodTracker({
  childName,
  lastMood,
  onMoodSelect,
  onViewHistory,
  onNoteChange,
  selectedMood,
}: ChildMoodTrackerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How is {childName} feeling?</Text>
        {lastMood ? (
          <Text style={styles.headerSub}>Last check-in: {lastMood.time}</Text>
        ) : null}
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

      {lastMood ? (
        <View style={styles.lastMoodBanner}>
          <View style={styles.lastMoodRow}>
            <Text style={styles.lastMoodEmoji}>{lastMood.emoji}</Text>
            <Text style={styles.lastMoodLabel}>{lastMood.mood}</Text>
            <Text style={styles.lastMoodTime}>{lastMood.time}</Text>
          </View>
          {lastMood.note ? (
            <>
              <Text style={styles.lastMoodNote}>{lastMood.note}</Text>
              <Text style={styles.lastMoodHeart}>💜</Text>
            </>
          ) : null}
        </View>
      ) : null}

      <TextInput
        style={styles.noteInput}
        placeholder="Add a note, trigger, or what helped…"
        placeholderTextColor={Colors.textMuted}
        onChangeText={onNoteChange}
        multiline
        numberOfLines={2}
      />

      <PressableScale onPress={onViewHistory} style={styles.historyRow} haptic={false}>
        <Text style={styles.historyLink}>View mood history</Text>
      </PressableScale>
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
    ...Type.cardTitle,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  headerSub: {
    ...Type.caption,
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
    borderWidth: 1.5,
    borderColor: Colors.purple,
    backgroundColor: '#F0EAFF',
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
  lastMoodBanner: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.divider,
  },
  lastMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMoodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  lastMoodLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  lastMoodTime: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  lastMoodNote: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  lastMoodHeart: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  noteInput: {
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    maxHeight: 72,
    textAlignVertical: 'top',
    borderWidth: 0.5,
    borderColor: Colors.divider,
  },
  historyRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  historyLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
});
