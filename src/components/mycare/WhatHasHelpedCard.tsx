import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';

interface HelpedItem {
  id: string;
  label: string;
  emoji: string;
  count: number;
  total: number;
  color: string;
}

interface WhatHasHelpedCardProps {
  items: HelpedItem[];
  onViewAll: () => void;
}

export default function WhatHasHelpedCard({ items, onViewAll }: WhatHasHelpedCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What has helped me</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.headerLink}>This week →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rows}>
        {items.map((item) => (
          <View key={item.id}>
            <View style={styles.row}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
              <Text style={[styles.count, { color: item.color }]}>{item.count}×</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min((item.count / item.total) * 100, 100)}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAllRow}>
        <Text style={styles.viewAllLink}>View all tools activity →</Text>
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
  },
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  headerLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
    flexShrink: 0,
  },
  rows: {
    marginTop: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 5,
  },
  emoji: {
    fontSize: 14,
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },
  count: {
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
  viewAllRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
});
