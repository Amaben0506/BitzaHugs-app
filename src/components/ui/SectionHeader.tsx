import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Spacing } from '../../theme/theme';

interface SectionHeaderProps {
  title: string;
  linkLabel?: string;
  onLinkPress?: () => void;
}

export default function SectionHeader({ title, linkLabel, onLinkPress }: SectionHeaderProps) {
  return (
    <View style={s.row}>
      <Text style={s.title}>{title}</Text>
      {linkLabel && onLinkPress && (
        <TouchableOpacity onPress={onLinkPress} activeOpacity={0.7}>
          <Text style={s.link}>{linkLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: { ...Type.cardTitle, color: Colors.textPrimary },
  link: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.purple },
});
