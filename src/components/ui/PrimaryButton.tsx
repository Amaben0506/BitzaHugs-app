import React from 'react';
import { Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Type, Radius, Shadows } from '../../theme/theme';
import PressableScale from './PressableScale';
import { Ionicons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: ViewStyle;
}

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  style,
}: PrimaryButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[s.btn, (disabled || loading) && s.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color="#fff" style={s.icon} />}
          <Text style={s.label}>{label}</Text>
        </>
      )}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: Colors.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  disabled: { opacity: 0.5 },
  icon: { marginRight: 8 },
  label: { ...Type.button, color: '#fff' },
});
