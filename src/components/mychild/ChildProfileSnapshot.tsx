import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Shadows } from '../../theme/theme';

interface ChildProfileSnapshotProps {
  child: {
    name: string;
    age: number;
    avatarEmoji: string;
    communication: string;
    supportNeeds: string;
    sensory: string;
    todaysFocus: string;
  };
  onEditProfile: () => void;
}

function InfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.col}>
      <Text style={styles.colLabel}>{label}</Text>
      <Text style={styles.colValue}>{value}</Text>
    </View>
  );
}

export default function ChildProfileSnapshot({ child, onEditProfile }: ChildProfileSnapshotProps) {
  return (
    <View style={styles.card}>
      <View style={styles.columns}>
        <InfoColumn label="COMMUNICATION" value={child.communication} />
        <View style={styles.verticalDivider} />
        <InfoColumn label="SUPPORT NEEDS" value={child.supportNeeds} />
        <View style={styles.verticalDivider} />
        <InfoColumn label="SENSORY" value={child.sensory} />
      </View>

      <View style={styles.horizontalDivider} />

      <View style={styles.focusSection}>
        <View style={styles.focusHeader}>
          <Text style={styles.focusIcon}>💜</Text>
          <Text style={styles.focusLabel}>Today's focus</Text>
        </View>
        <Text style={styles.focusText}>{child.todaysFocus}</Text>
      </View>

      <TouchableOpacity onPress={onEditProfile} activeOpacity={0.7} style={styles.editRow}>
        <Text style={styles.editLink}>Edit profile →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3EDFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Shadows.card,
  },
  columns: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
    paddingHorizontal: 4,
  },
  colLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  colValue: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 15,
  },
  verticalDivider: {
    width: 0.5,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 8,
  },
  horizontalDivider: {
    height: 0.5,
    backgroundColor: Colors.cardBorder,
    marginTop: 10,
  },
  focusSection: {
    marginTop: 10,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  focusIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  focusLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  focusText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  editRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  editLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
});
