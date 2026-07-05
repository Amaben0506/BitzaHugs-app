import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface SupportNavGridProps {
  onItemPress: (id: string) => void;
}

const NAV_ITEMS: Array<{
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  linkLabel: string;
  circleBg: string;
  iconColor: string;
}> = [
  {
    id: 'printables',
    icon: 'print-outline',
    title: 'Printable Resources',
    description: 'Schedules, visuals, reports, and more.',
    linkLabel: 'Browse printables →',
    circleBg: '#EDE0FF',
    iconColor: Colors.purple,
  },
  {
    id: 'community',
    icon: 'people-outline',
    title: 'Caregiver Community',
    description: 'Connect with caregivers who understand.',
    linkLabel: 'Go to community →',
    circleBg: '#E8F3EC',
    iconColor: '#3A8A3A',
  },
  {
    id: 'plan',
    icon: 'clipboard-outline',
    title: 'My Support Plan',
    description: 'Your plan for difficult moments and emergencies.',
    linkLabel: 'View my plan →',
    circleBg: '#FFF0F4',
    iconColor: '#C03060',
  },
  {
    id: 'resources',
    icon: 'library-outline',
    title: 'Helpful Resources',
    description: 'Trusted articles, organizations, and crisis support.',
    linkLabel: 'Explore resources →',
    circleBg: '#EEF4FF',
    iconColor: '#3A6BC8',
  },
];

export default function SupportNavGrid({ onItemPress }: SupportNavGridProps) {
  return (
    <View style={styles.stack}>
      {NAV_ITEMS.map((item) => (
        <PressableScale
          key={item.id}
          style={styles.card}
          onPress={() => onItemPress(item.id)}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.circleBg }]}>
            <Ionicons name={item.icon} size={22} color={item.iconColor} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <Text style={[styles.link, { color: item.iconColor }]}>{item.linkLabel}</Text>
          </View>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 14,
    ...Shadows.card,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  description: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  link: {
    fontSize: 12,
    fontFamily: Fonts.semibold,
    marginTop: 6,
  },
});
