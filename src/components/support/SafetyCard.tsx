import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';

interface SafetyCardProps {
  onSafetyInfo: () => void;
}

export default function SafetyCard({ onSafetyInfo }: SafetyCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.purple} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Your safety matters</Text>
          <Text style={styles.body}>
            BitzaHugs offers emotional and organizational support, but it is not a substitute for medical care, therapy, crisis services, or emergency help.
          </Text>
          <TouchableOpacity onPress={onSafetyInfo} activeOpacity={0.7}>
            <Text style={styles.link}>Safety and crisis information →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0EAFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4D8FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 4,
  },
  link: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
    marginTop: 8,
  },
});
