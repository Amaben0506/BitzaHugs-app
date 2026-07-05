import React from 'react';
import { Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Type, Radius, Shadows } from '../../theme/theme';
import PressableScale from './PressableScale';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function SecondaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: SecondaryButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[s.btn, (disabled || loading) && s.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.purple} />
      ) : (
        <Text style={s.label}>{label}</Text>
      )}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  disabled: { opacity: 0.5 },
  label: { ...Type.button, color: Colors.purple },
});
