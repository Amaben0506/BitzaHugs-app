import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ReportReason,
  reportContent,
  blockUser,
} from '../../lib/communityService';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Spacing, Radius, Shadows } from '../../theme/theme';
import PrimaryButton from '../ui/PrimaryButton';

interface ReportSheetProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment';
  postId: string;
  targetId: string;
  authorId: string;
  authorName: string;
  onBlock?: () => void;
}

const REASONS: { label: string; value: ReportReason }[] = [
  { label: 'Harassment or bullying',      value: 'harassment' },
  { label: 'Hate speech',                  value: 'hate' },
  { label: 'Graphic or disturbing content', value: 'graphic' },
  { label: 'Shares private information',   value: 'privacy' },
  { label: 'Spam',                          value: 'spam' },
  { label: 'Dangerous or harmful advice',  value: 'dangerous' },
  { label: 'Something else',               value: 'other' },
];

export default function ReportSheet({
  visible,
  onClose,
  targetType,
  postId,
  targetId,
  authorId,
  authorName,
  onBlock,
}: ReportSheetProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setReason(null);
    setDetail('');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      const result = await reportContent(
        targetType, postId, targetId, reason, detail,
      );
      if (!result.ok) {
        Alert.alert('Error', result.reason ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      handleClose();
      Alert.alert(
        'Thank you',
        `Our team will review this within 24 hours.\n\nWould you also like to block ${authorName}?`,
        [
          {
            text: 'Block',
            onPress: async () => {
              try {
                await blockUser(authorId, authorName);
                onBlock?.();
              } catch {
                Alert.alert('Error', 'Could not block. Please try again.');
              }
            },
          },
          { text: 'Not now', style: 'cancel' },
        ],
      );
    } catch {
      Alert.alert('Error', 'Could not submit report. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        {/* Dark backdrop — tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Sheet */}
        <View style={s.sheet}>
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Report content</Text>
            <TouchableOpacity
              style={s.closeBtn}
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.scrollContent}
          >
            <Text style={s.intro}>
              Reports are reviewed by moderators. Thank you for helping keep this space safe.
            </Text>

            {/* Reason rows */}
            <View style={s.reasonList}>
              {REASONS.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={s.reasonRow}
                  onPress={() => setReason(r.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      s.radio,
                      reason === r.value && s.radioSelected,
                    ]}
                  >
                    {reason === r.value && <View style={s.radioDot} />}
                  </View>
                  <Text
                    style={[
                      s.reasonLabel,
                      reason === r.value && s.reasonLabelSelected,
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Optional detail */}
            <TextInput
              style={s.detailInput}
              value={detail}
              onChangeText={setDetail}
              placeholder="Add any detail (optional)"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            <PrimaryButton
              label="Submit report"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!reason || submitting}
              style={s.submitBtn}
            />

            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    ...Shadows.raised,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lavenderSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flexGrow: 0 },
  scrollContent: { padding: Spacing.lg, paddingTop: 4, gap: 12 },

  intro: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    lineHeight: 19,
  },

  reasonList: {
    backgroundColor: '#FAFAFA',
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.divider,
    overflow: 'hidden',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.grayLavender,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: Colors.purple,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.purple,
  },
  reasonLabel: {
    ...Type.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
  },
  reasonLabelSelected: {
    fontFamily: Fonts.semibold,
    color: Colors.purple,
  },

  detailInput: {
    height: 80,
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Type.bodySmall,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },

  submitBtn: { marginTop: 4 },
});
