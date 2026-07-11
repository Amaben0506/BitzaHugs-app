import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Spacing, Radius, Shadows } from '../../theme/theme';

interface CrisisResourceCardProps {
  visible: boolean;
  onClose: () => void;
}

export default function CrisisResourceCard({
  visible,
  onClose,
}: CrisisResourceCardProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={s.card}>
          <View style={s.iconWrap}>
            <Ionicons name="heart-outline" size={22} color={Colors.purple} />
          </View>

          <Text style={s.title}>You do not have to hold this alone</Text>
          <Text style={s.body}>
            It sounds like things are really hard right now. If you need support
            in this moment, these options are free and available anytime.
          </Text>

          <View style={s.resourceList}>
            <View style={s.resourceRow}>
              <Ionicons name="call-outline" size={16} color={Colors.purple} />
              <Text style={s.resourceText}>
                <Text style={s.resourceStrong}>988 Suicide & Crisis Lifeline</Text>
                {' — call or text 988, free and confidential, 24/7'}
              </Text>
            </View>

            <View style={s.resourceRow}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.purple} />
              <Text style={s.resourceText}>
                <Text style={s.resourceStrong}>Crisis Text Line</Text>
                {' — text HOME to 741741'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={s.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Close crisis resources"
          >
            <Text style={s.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.raised,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.lavenderSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  body: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  resourceList: {
    gap: 10,
    marginTop: Spacing.lg,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  resourceText: {
    ...Type.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 19,
  },
  resourceStrong: {
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    marginTop: Spacing.lg,
    alignSelf: 'flex-end',
    borderRadius: Radius.pill,
    backgroundColor: Colors.purple,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  closeText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
