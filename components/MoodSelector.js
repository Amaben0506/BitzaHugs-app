import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const MOOD_HISTORY_KEY = 'familyAppMoodHistory';
const TODAY_MOOD_KEY = 'familyAppTodayMood';

const moods = [
  { emoji: '☹️', label: 'Overwhelmed' },
  { emoji: '😔', label: 'Exhausted' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Hopeful' },
  { emoji: '😊', label: 'Good' },
];

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    loadTodayMood();
  }, []);

  const loadTodayMood = async () => {
    try {
      const savedMood = await AsyncStorage.getItem(TODAY_MOOD_KEY);

      if (savedMood) {
        setSelectedMood(savedMood);
      }
    } catch (error) {
      console.log('Error loading mood:', error);
    }
  };

  const saveMood = async (moodLabel) => {
    try {
      setSelectedMood(moodLabel);

      const moodEntry = {
        id: Date.now(),
        mood: moodLabel,
        date: new Date().toISOString(),
      };

      const existingHistory = await AsyncStorage.getItem(MOOD_HISTORY_KEY);
      const parsedHistory = existingHistory ? JSON.parse(existingHistory) : [];

      const updatedHistory = [moodEntry, ...parsedHistory];

      await AsyncStorage.setItem(TODAY_MOOD_KEY, moodLabel);
      await AsyncStorage.setItem(
        MOOD_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.log('Error saving mood:', error);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>♡ How are you feeling right now?</Text>

      <View style={styles.row}>
        {moods.map((mood) => {
          const active = selectedMood === mood.label;

          return (
            <TouchableOpacity
              key={mood.label}
              style={[styles.moodItem, active && styles.activeMood]}
              onPress={() => saveMood(mood.label)}
            >
              <Text style={styles.emoji}>{mood.emoji}</Text>

              <Text style={[styles.label, active && styles.activeLabel]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.subtext}>
        {selectedMood
          ? `Logged: ${selectedMood}. Your feelings matter too. 💜`
          : 'Your feelings matter too. 💜'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: 18,
    padding: 18,
    borderRadius: 28,
    shadowColor: '#B8A9D9',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#2D2357',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  moodItem: {
    alignItems: 'center',
    width: '19%',
    paddingVertical: 10,
    borderRadius: 18,
  },

  activeMood: {
    backgroundColor: '#F3EAFE',
  },

  emoji: {
    fontSize: 30,
  },

  label: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: '#2D2357',
    marginTop: 6,
    textAlign: 'center',
  },

  activeLabel: {
    color: '#6F4BCB',
  },

  subtext: {
    marginTop: 14,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#7C7892',
    textAlign: 'center',
  },
});