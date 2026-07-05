import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface MyChildHeaderProps {
  child: { name: string; age: number; avatarEmoji: string };
  onSettingsPress: () => void;
  onChildSelectorPress: () => void;
}

export default function MyChildHeader({
  child,
  onSettingsPress,
  onChildSelectorPress,
}: MyChildHeaderProps) {
  return (
    <View>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>My Child</Text>
          <Text style={styles.subtitle}>
            Everything for {child.name}'s day, all in one place.
          </Text>
        </View>
        <PressableScale
          style={styles.settingsBtn}
          onPress={onSettingsPress}
        >
          <Ionicons name="settings-outline" size={18} color={Colors.textMuted} />
        </PressableScale>
      </View>

      <PressableScale
        style={styles.selectorPill}
        onPress={onChildSelectorPress}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{child.avatarEmoji}</Text>
        </View>
        <View style={styles.pillInfo}>
          <Text style={styles.pillName}>{child.name}</Text>
          <Text style={styles.pillAge}>Age {child.age}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={Colors.grayLavender} style={styles.chevron} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: Fonts.extrabold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    ...Shadows.card,
  },
  selectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    ...Shadows.card,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.navActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  pillInfo: {
    flex: 1,
  },
  pillName: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  pillAge: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
