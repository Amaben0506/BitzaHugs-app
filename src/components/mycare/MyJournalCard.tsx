import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface JournalEntry {
  date: string;
  preview: string;
}

interface MyJournalCardProps {
  recentEntry?: JournalEntry;
  onWriteFreely: () => void;
  onUsePrompt: () => void;
  onViewPastEntries: () => void;
}

export default function MyJournalCard({
  recentEntry,
  onWriteFreely,
  onUsePrompt,
  onViewPastEntries,
}: MyJournalCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Journal</Text>
        <View style={styles.privateBadge}>
          <Text style={styles.privateBadgeText}>Private 🔒</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>A safe space for your thoughts.</Text>

      <View style={styles.actions}>
        <PressableScale style={styles.writeBtn} onPress={onWriteFreely}>
          <Ionicons name="pencil-outline" size={15} color={Colors.textRose} />
          <Text style={styles.writeBtnText}>Write freely</Text>
        </PressableScale>
        <PressableScale style={styles.promptBtn} onPress={onUsePrompt}>
          <Ionicons name="sparkles-outline" size={15} color={Colors.purple} />
          <Text style={styles.promptBtnText}>Use a prompt</Text>
        </PressableScale>
      </View>

      <View style={styles.divider} />

      {recentEntry ? (
        <View style={styles.recentSection}>
          <View style={styles.recentRow}>
            <View style={styles.recentText}>
              <Text style={styles.recentLabel}>RECENT ENTRY</Text>
              <Text style={styles.recentPreview} numberOfLines={3}>{recentEntry.preview}</Text>
              <Text style={styles.recentDate}>{recentEntry.date}</Text>
            </View>
            <View style={styles.journalIllustration}>
              <Text style={styles.journalEmoji}>💗</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onViewPastEntries} activeOpacity={0.7} style={styles.pastRow}>
            <Text style={styles.pastLink}>View past entries →</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  privateBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  privateBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  writeBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF0F4',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  writeBtnText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textRose,
  },
  promptBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.navActiveBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  promptBtnText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.purple,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.cardBorder,
    marginTop: 12,
  },
  recentSection: {
    paddingTop: 10,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recentText: {
    flex: 1,
  },
  recentLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  recentPreview: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  recentDate: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 4,
  },
  journalIllustration: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  journalEmoji: {
    fontSize: 22,
  },
  pastRow: {
    marginTop: 8,
  },
  pastLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
});
