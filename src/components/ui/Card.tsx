import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Radius, Shadows, Spacing } from '../../theme/theme';

type Tint = 'white' | 'lavender' | 'blush' | 'cream';

const TINT_COLORS: Record<Tint, string> = {
  white:   '#FFFFFF',
  lavender: '#F3EDFF',
  blush:   '#FFF7FB',
  cream:   '#FFFBF2',
};

interface CardProps {
  tint?: Tint;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  padding?: number;
}

export default function Card({ tint = 'white', style, children, padding = Spacing.lg }: CardProps) {
  return (
    <View style={[s.base, { backgroundColor: TINT_COLORS[tint], padding }, style]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    ...Shadows.card,
  },
});
