import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';

interface ProgressItem {
  label: string;
  value: string;
  color: string;
  progress: number;
}

interface ProgressSummaryCardProps {
  items: ProgressItem[];
  onViewFullProgress: () => void;
}

export default function ProgressSummaryCard({ items, onViewFullProgress }: ProgressSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Progress Summary</Text>
        </View>
        <TouchableOpacity onPress={onViewFullProgress} activeOpacity={0.7}>
          <Text style={styles.headerLink}>View full progress →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rows}>
        {items.map((item, index) => (
          <View key={index}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.rowLabel} numberOfLines={1}>{item.label}</Text>
              <Text style={[styles.rowValue, { color: item.color }]}>{item.value}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(item.progress * 100, 100)}%`, backgroundColor: item.color }]} />
            </View>
          </View>
        ))}
      </View>
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
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  headerLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
    textAlign: 'right',
    lineHeight: 15,
  },
  rows: {
    marginTop: 8,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    marginRight: 4,
  },
  rowValue: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    flexShrink: 0,
  },
  track: {
    height: 3,
    borderRadius: 99,
    backgroundColor: '#F0EAFF',
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    borderRadius: 99,
  },
});
