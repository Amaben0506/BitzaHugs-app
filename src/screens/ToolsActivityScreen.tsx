import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 'pause',        emoji: '🐰', label: 'Pause With Me',   color: Colors.purple, bgColor: '#EDE0FF', count: 3 },
  { id: 'sounds',       emoji: '🎵', label: 'Calming Sounds',  color: '#3A6BC8',     bgColor: '#EEF4FF', count: 2 },
  { id: 'affirmations', emoji: '✨', label: 'Affirmations',    color: '#C4800A',     bgColor: '#FFF8EC', count: 4 },
  { id: 'grounding',    emoji: '🌿', label: 'Grounding Steps', color: '#3A8A3A',     bgColor: '#F0F8F0', count: 1 },
  { id: 'hugi',         emoji: '💜', label: 'Talk to Hugi',    color: Colors.purple, bgColor: '#EDE0FF', count: 5 },
  { id: 'journal',      emoji: '📓', label: 'Journal',         color: Colors.purple, bgColor: '#EDE0FF', count: 2 },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ToolsActivityScreen() {
  const navigation = useNavigation<any>();

  const maxCount = Math.max(...TOOLS.map(t => t.count), 1);
  const mostUsed = TOOLS.reduce((a, b) => b.count > a.count ? b : a);
  const leastUsed = TOOLS.reduce((a, b) => b.count < a.count ? b : a);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>What Has Helped Me</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Intro card */}
        <View style={[s.card, s.lavCard]}>
          <Text style={s.introText}>
            Tracking what helps you is a form of self-knowledge. Over time, patterns emerge.
          </Text>
        </View>

        {/* Tools list */}
        {TOOLS.map(tool => {
          const fillPct = Math.round((tool.count / maxCount) * 100);
          const usageLabel = `Used ${tool.count} time${tool.count !== 1 ? 's' : ''} this week`;
          return (
            <View key={tool.id} style={s.toolCard}>
              <View style={s.toolRow}>
                {/* Emoji circle */}
                <View style={[s.emojiCircle, { backgroundColor: tool.bgColor }]}>
                  <Text style={s.emojiText}>{tool.emoji}</Text>
                </View>
                {/* Label + usage */}
                <View style={s.toolMid}>
                  <Text style={s.toolLabel}>{tool.label}</Text>
                  <Text style={s.toolUsage}>{usageLabel}</Text>
                </View>
                {/* Count */}
                <Text style={[s.toolCount, { color: tool.color }]}>{tool.count}</Text>
              </View>
              {/* Progress bar */}
              <View style={[s.track, { backgroundColor: tool.bgColor }]}>
                <View style={[s.fill, { width: `${fillPct}%`, backgroundColor: tool.color }]} />
              </View>
            </View>
          );
        })}

        {/* Bottom insight card */}
        <View style={[s.card, { gap: 10 }]}>
          <View style={s.insightRow}>
            <Text style={s.insightEmoji}>{mostUsed.emoji}</Text>
            <View style={s.insightTextCol}>
              <Text style={s.insightLabel}>Most used this week</Text>
              <Text style={s.insightValue}>{mostUsed.label} 💜</Text>
            </View>
          </View>
          <View style={[s.insightRow, { paddingTop: 10, borderTopWidth: 0.5, borderTopColor: Colors.cardBorder }]}>
            <Text style={s.insightEmoji}>{leastUsed.emoji}</Text>
            <View style={s.insightTextCol}>
              <Text style={s.insightLabel}>Try something new</Text>
              <Text style={s.insightValue}>{leastUsed.label}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardBorder,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.navActiveBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },

  scroll: { padding: 16, paddingBottom: 48, gap: 10 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  lavCard: { backgroundColor: '#EDE3FF', borderColor: '#D0B8F8' },

  introText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },

  toolCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emojiText: { fontSize: 22 },
  toolMid: { flex: 1, gap: 2 },
  toolLabel: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  toolUsage: { fontSize: 11, color: Colors.textMuted },
  toolCount: { fontSize: 20, fontWeight: '500', flexShrink: 0 },

  track: {
    height: 4,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 99,
  },

  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightEmoji: { fontSize: 24, flexShrink: 0 },
  insightTextCol: { flex: 1, gap: 2 },
  insightLabel: { fontSize: 11, color: Colors.textMuted },
  insightValue: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
});
