import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface ToolsForMeCardProps {
  onToolPress: (toolId: string) => void;
  onSeeAllTools: () => void;
}

const HUGI = require('../../../assets/icons/Hugi-Bunny.png');

const TOOLS: Array<{
  id: string;
  title: string;
  description: string;
  bg: string;
  accentColor: string;
  type: 'hugi' | 'emoji';
  emoji?: string;
}> = [
  {
    id: 'pause',
    title: 'Pause With Me',
    description: 'Take a mindful pause. Even one minute helps.',
    bg: '#EDE0FF',
    accentColor: Colors.purple,
    type: 'hugi',
  },
  {
    id: 'sounds',
    title: 'Calming Sounds',
    description: 'Soothing sounds to help you reset and relax.',
    bg: '#EEF4FF',
    accentColor: '#3A6BC8',
    type: 'emoji',
    emoji: '🎵',
  },
  {
    id: 'affirmations',
    title: 'Affirmations',
    description: 'Gentle words to remind you of your strength.',
    bg: '#FFF8EC',
    accentColor: '#C4800A',
    type: 'emoji',
    emoji: '💗',
  },
  {
    id: 'grounding',
    title: 'Grounding Steps',
    description: 'Simple exercises to help you feel more centered.',
    bg: '#F0F8F0',
    accentColor: '#3A8A3A',
    type: 'emoji',
    emoji: '🌿',
  },
];

export default function ToolsForMeCard({ onToolPress, onSeeAllTools }: ToolsForMeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tools for me</Text>
        <TouchableOpacity onPress={onSeeAllTools} activeOpacity={0.7}>
          <Text style={styles.headerLink}>See all tools →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {TOOLS.map((tool) => (
          <PressableScale
            key={tool.id}
            style={[styles.toolCard, { backgroundColor: tool.bg }]}
            onPress={() => onToolPress(tool.id)}
          >
            {tool.type === 'hugi' ? (
              <Image source={HUGI} style={styles.hugiImage} resizeMode="contain" />
            ) : (
              <View style={styles.toolIconCircle}>
                <Text style={styles.toolIconEmoji}>{tool.emoji}</Text>
              </View>
            )}
            <Text style={[styles.toolTitle, { color: tool.accentColor }]}>{tool.title}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
          </PressableScale>
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
  },
  headerLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
  scroll: {
    marginTop: 10,
  },
  scrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  toolCard: {
    width: 140,
    borderRadius: 16,
    padding: 12,
    ...Shadows.card,
  },
  hugiImage: {
    width: 44,
    height: 44,
  },
  toolIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolIconEmoji: {
    fontSize: 22,
  },
  toolTitle: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    marginTop: 6,
  },
  toolDescription: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 14,
    flex: 1,
  },
});
