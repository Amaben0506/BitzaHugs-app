import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';

interface ActivityItem {
  id: string;
  emoji: string;
  label: string;
  sublabel: string;
  backgroundColor: string;
}

interface RecentSupportActivityProps {
  items: ActivityItem[];
  onViewAll: () => void;
}

export default function RecentSupportActivity({ items, onViewAll }: RecentSupportActivityProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent support activity</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.headerLink}>View all →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {items.map((item) => (
          <View key={item.id} style={[styles.activityCard, { backgroundColor: item.backgroundColor }]}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
            <Text style={styles.sublabel} numberOfLines={1}>{item.sublabel}</Text>
          </View>
        ))}
      </ScrollView>
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
    marginRight: 8,
  },
  headerLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
    flexShrink: 0,
  },
  scroll: {
    marginTop: 12,
  },
  scrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  activityCard: {
    width: 150,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  emojiCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
  },
  sublabel: {
    fontSize: 9.5,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
