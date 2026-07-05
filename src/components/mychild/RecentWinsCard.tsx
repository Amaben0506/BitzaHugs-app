import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';

interface Win {
  id: string;
  emoji: string;
  label: string;
}

interface RecentWinsCardProps {
  wins: Win[];
  onAddWin: () => void;
}

export default function RecentWinsCard({ wins, onAddWin }: RecentWinsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Wins</Text>
        <TouchableOpacity onPress={onAddWin} activeOpacity={0.7}>
          <Text style={styles.headerLink}>+ Add win</Text>
        </TouchableOpacity>
      </View>

      {wins.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStar}>⭐</Text>
          <Text style={styles.emptyTitle}>No wins recorded yet</Text>
          <Text style={styles.emptySub}>Tap + Add win to record your first one</Text>
        </View>
      ) : (
        <View style={styles.winList}>
          {wins.map((win) => (
            <View key={win.id} style={styles.winRow}>
              <View style={styles.winIconCircle}>
                <Text style={styles.winEmoji}>{win.emoji}</Text>
              </View>
              <Text style={styles.winLabel} numberOfLines={1}>{win.label}</Text>
            </View>
          ))}
        </View>
      )}
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
  },
  headerLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
  winList: {
    marginTop: 8,
    gap: 6,
  },
  winRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  winIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBF2',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  winEmoji: {
    fontSize: 20,
  },
  winLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 10,
  },
  emptyStar: {
    fontSize: 24,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  emptySub: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
