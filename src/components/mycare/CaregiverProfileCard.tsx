import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface CaregiverProfileCardProps {
  name: string;
  initials: string;
  currentMood: string;
  moodEmoji: string;
  lastCheckin: string;
  weeklyCheckins: number;
  focusNote: string;
  onEditProfile: () => void;
}

export default function CaregiverProfileCard({
  name,
  initials,
  currentMood,
  moodEmoji,
  lastCheckin,
  weeklyCheckins,
  focusNote,
  onEditProfile,
}: CaregiverProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera-outline" size={10} color={Colors.textRose} />
              </View>
            </View>

            <View style={styles.nameBlock}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.role}>Caregiver</Text>
            </View>
          </View>

          <View style={styles.moodRow}>
            <Text style={styles.moodEmoji}>{moodEmoji}</Text>
            <Text style={styles.moodLabel}>
              <Text style={styles.moodPrefix}>Feeling: </Text>
              <Text style={styles.moodValue}>{currentMood}</Text>
            </Text>
          </View>

          <Text style={styles.checkinTime}>Checked in today at {lastCheckin}</Text>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.weekLabel}>THIS WEEK</Text>
          <View style={styles.statRow}>
            <Text style={styles.statFlame}>🔥</Text>
            <Text style={styles.statNumber}>{weeklyCheckins}</Text>
          </View>
          <Text style={styles.statSub}>Care check-ins</Text>
          <PressableScale style={styles.editBtn} onPress={onEditProfile}>
            <Text style={styles.editBtnText}>Edit my profile</Text>
            <Ionicons name="chevron-forward" size={11} color={Colors.textRose} />
          </PressableScale>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.focusRow}>
        <Text style={styles.focusIcon}>💗</Text>
        <Text style={styles.focusText}>{focusNote}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderLeftWidth: 4,
    borderLeftColor: '#F0C8D8',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  leftCol: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  avatarWrap: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.textRose,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  role: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 1,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
  },
  moodPrefix: {
    color: Colors.textMuted,
  },
  moodValue: {
    fontFamily: Fonts.medium,
    color: Colors.green,
  },
  checkinTime: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  weekLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statFlame: {
    fontSize: 16,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  statSub: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 3,
    ...Shadows.card,
  },
  editBtnText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textRose,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.cardBorder,
    marginTop: 10,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    gap: 6,
  },
  focusIcon: {
    fontSize: 13,
    marginTop: 1,
  },
  focusText: {
    flex: 1,
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 16.5,
  },
});
