import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';

interface Insight {
  id: string;
  text: string;
}

interface GentleInsightsCardProps {
  insights: Insight[];
}

export default function GentleInsightsCard({ insights }: GentleInsightsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>A gentle look back</Text>

      <View style={styles.insights}>
        {insights.map((insight) => (
          <View key={insight.id} style={styles.insightRow}>
            <Text style={styles.insightIcon}>💗</Text>
            <Text style={styles.insightText}>{insight.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plantRow}>
        <View style={styles.plantCircle}>
          <Text style={styles.plantEmoji}>🌱</Text>
        </View>
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
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  insights: {
    marginTop: 10,
    gap: 8,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  insightIcon: {
    fontSize: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  insightText: {
    flex: 1,
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 16.5,
  },
  plantRow: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  plantCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E4D8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantEmoji: {
    fontSize: 18,
  },
});
