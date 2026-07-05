import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface WellnessItem {
  emoji: string;
  label: string;
  value: string;
  highlight?: boolean;
}

interface WellnessSummaryCardProps {
  items: WellnessItem[];
  onViewFullSummary: () => void;
}

export default function WellnessSummaryCard({ items, onViewFullSummary }: WellnessSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>My wellness this week</Text>

      <View style={styles.rows}>
        {items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
            <Text style={[styles.value, item.highlight && styles.valueHighlight]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      <PressableScale style={styles.summaryBtn} onPress={onViewFullSummary}>
        <Text style={styles.summaryBtnText}>View full summary →</Text>
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
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  rows: {
    marginTop: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  emoji: {
    fontSize: 14,
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  value: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    flexShrink: 0,
  },
  valueHighlight: {
    color: Colors.green,
  },
  summaryBtn: {
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
    ...Shadows.card,
  },
  summaryBtnText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
});
