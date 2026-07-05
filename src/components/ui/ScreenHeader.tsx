import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Type, Shadows, Spacing, Radius } from '../../theme/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenHeader({ title, onBack, rightAction, style }: ScreenHeaderProps) {
  return (
    <View style={[s.row, style]}>
      {onBack ? (
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={s.placeholder} />
      )}

      <Text style={s.title} numberOfLines={1}>{title}</Text>

      {rightAction ? (
        <View style={s.rightSlot}>{rightAction}</View>
      ) : (
        <View style={s.placeholder} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  title: {
    ...Type.heading,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  rightSlot: { minWidth: 38, alignItems: 'flex-end' },
  placeholder: { width: 38 },
});
