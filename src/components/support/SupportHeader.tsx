import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface SupportHeaderProps {
  onSettingsPress: () => void;
}

export default function SupportHeader({ onSettingsPress }: SupportHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Support</Text>
          <Text style={styles.subtitle}>You don't have to carry everything alone. 💜</Text>
        </View>
        <PressableScale style={styles.settingsBtn} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={18} color={Colors.textMuted} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.extrabold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
});
