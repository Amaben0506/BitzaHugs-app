import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
import {
  generateChildSnapshot,
  generateSchedule,
  generateProgressReport,
  generateSupportPlan,
} from '../lib/documentService';
import { Colors } from '../theme/colors';
import { Fonts, Type, Shadows } from '../theme/theme';
import PressableScale from '../components/ui/PressableScale';
import { usePremium } from '../lib/premium';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Printable {
  id: string;
  title: string;
  file: any;
  emoji: string;
}

interface Category {
  title: string;
  accent: string;
  bg: string;
  items: Printable[];
}

interface Document {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
  bg: string;
  generate: () => Promise<string>;
}

// ─── Section 1 data — generated documents ─────────────────────────────────────

const DOCUMENTS: Document[] = [
  {
    id: 'snapshot',
    title: 'Child Snapshot',
    subtitle: 'One-page overview for a new teacher or therapist',
    emoji: '📋',
    accent: '#7B3DC8',
    bg: '#EDE0FF',
    generate: generateChildSnapshot,
  },
  {
    id: 'schedule',
    title: "Today's Schedule",
    subtitle: "Printable version of today's routine",
    emoji: '🗓️',
    accent: '#3A6BC8',
    bg: '#EEF4FF',
    generate: generateSchedule,
  },
  {
    id: 'progress',
    title: 'Progress Report',
    subtitle: 'Wins, moods, and notes for doctors or IEP meetings',
    emoji: '📈',
    accent: '#3A8A3A',
    bg: '#F0F8F0',
    generate: generateProgressReport,
  },
  {
    id: 'plan',
    title: 'Support Plan',
    subtitle: 'Your plan for difficult moments and emergencies',
    emoji: '🛟',
    accent: '#C03060',
    bg: '#FFF0F4',
    generate: generateSupportPlan,
  },
];

// ─── Section 2 data — static printable tools ──────────────────────────────────

const CATEGORIES: Category[] = [
  {
    title: 'Routines & Visual Schedules',
    accent: '#7B3DC8',
    bg: '#EDE0FF',
    items: [
      { id: 'morning',   title: 'Morning Routine Chart', emoji: '🌅', file: require('../../assets/resource/resource-morning-routine-chart.pdf') },
      { id: 'bedtime',   title: 'Bedtime Routine Chart', emoji: '🌙', file: require('../../assets/resource/resource-bedtime-routine-chart.pdf') },
      { id: 'school',    title: 'School Day Schedule',   emoji: '🎒', file: require('../../assets/resource/resource-school-day-schedule.pdf') },
      { id: 'firstthen', title: 'First / Then Board',    emoji: '➡️', file: require('../../assets/resource/resource-first-then-board.pdf') },
    ],
  },
  {
    title: 'Emotions & Communication',
    accent: '#C4800A',
    bg: '#FFF8EC',
    items: [
      { id: 'faces',       title: 'Emotion Faces Chart',     emoji: '😊', file: require('../../assets/resource/resource-emotion-faces-chart.pdf') },
      { id: 'checkin',     title: 'Feelings Check-In Sheet', emoji: '📝', file: require('../../assets/resource/resource-feelings-checkin-sheet.pdf') },
      { id: 'thermometer', title: 'Feelings Thermometer',    emoji: '🌡️', file: require('../../assets/resource/resource-feelings-thermometer.pdf') },
      { id: 'body',        title: 'How My Body Feels',       emoji: '🫶', file: require('../../assets/resource/resource-how-my-body-feels.pdf') },
      { id: 'yesno',       title: 'Yes / No Choice Card',    emoji: '✅', file: require('../../assets/resource/resource-yes-no-choice-card.pdf') },
      { id: 'break',       title: 'I Need a Break Card',     emoji: '⏸️', file: require('../../assets/resource/resource-i-need-a-break-card.pdf') },
    ],
  },
  {
    title: 'Calm Down & Regulation',
    accent: '#3A8A3A',
    bg: '#F0F8F0',
    items: [
      { id: 'choiceboard', title: 'Calm Down Choice Board',    emoji: '🧩', file: require('../../assets/resource/resource-calm-down-choice-board.pdf') },
      { id: 'kitlist',     title: 'Calm Down Kit List',        emoji: '🎒', file: require('../../assets/resource/resource-calm-down-kit-list.pdf') },
      { id: 'grounding',   title: 'Grounding: 5-4-3-2-1',     emoji: '🌿', file: require('../../assets/resource/resource-grounding-5-4-3-2-1.pdf') },
      { id: 'breathing',   title: 'Breathing Exercise Visual', emoji: '🫧', file: require('../../assets/resource/resource-breathing-exercise-visual.pdf') },
      { id: 'overwhelmed', title: 'Overwhelmed: Visual Steps', emoji: '🌊', file: require('../../assets/resource/resource-overwhelmed-visual-steps.pdf') },
    ],
  },
  {
    title: 'Meltdown & Crisis Support',
    accent: '#C03060',
    bg: '#FFF0F4',
    items: [
      { id: 'meltdown',  title: 'Meltdown Recovery Steps', emoji: '💗', file: require('../../assets/resource/resource-meltdown-recovery-steps.pdf') },
      { id: 'emergency', title: 'Emergency Calm Plan',     emoji: '🆘', file: require('../../assets/resource/resource-emergency-calm-plan.pdf') },
      { id: 'safespace', title: 'Safe Space Checklist',    emoji: '🏠', file: require('../../assets/resource/resource-safe-space-checklist.pdf') },
    ],
  },
  {
    title: 'For You (Caregiver)',
    accent: '#3A6BC8',
    bg: '#EEF4FF',
    items: [
      { id: 'selfcare', title: 'Caregiver Self-Care',   emoji: '💜', file: require('../../assets/resource/resource-caregiver-self-care.pdf') },
      { id: 'triggers', title: 'My Triggers Worksheet', emoji: '🔍', file: require('../../assets/resource/resource-my-triggers-worksheet.pdf') },
    ],
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PrintableResourcesScreen() {
  const navigation = useNavigation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { requirePremium } = usePremium();

  const handleGenerate = async (doc: Document) => {
    if (loadingId) return;
    if (!requirePremium({ feature: 'pdf_exports' })) return;
    setLoadingId(doc.id);
    try {
      await doc.generate();
    } catch {
      Alert.alert('Could not generate', 'There was a problem creating this document.');
    } finally {
      setLoadingId(null);
    }
  };

  const openPrintable = async (item: Printable) => {
    if (loadingId) return;
    if (!requirePremium({ feature: 'resources' })) return;
    setLoadingId(item.id);
    try {
      const asset = Asset.fromModule(item.file);
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Not available', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: item.title,
        UTI: 'com.adobe.pdf',
      });
    } catch {
      Alert.alert('Could not open', 'There was a problem opening this printable.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Printable Resources</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Intro card */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Create personalized documents from your own information, or print ready-made visuals and tools. 💜
          </Text>
        </View>

        {/* ── Section 1: Generated documents ── */}
        <Text style={styles.sectionLabel}>DOCUMENTS FOR YOUR CARE TEAM</Text>
        <Text style={styles.sectionSubtext}>
          Filled in with your child's information — ready to hand to a doctor, teacher, or therapist.
        </Text>
        <View style={styles.itemStack}>
          {DOCUMENTS.map((doc) => {
            const isLoading = loadingId === doc.id;
            const isDimmed = loadingId !== null && !isLoading;
            return (
              <PressableScale
                key={doc.id}
                style={[styles.card, isDimmed && styles.cardDimmed]}
                onPress={() => handleGenerate(doc)}
              >
                <View style={[styles.emojiCircle, { backgroundColor: doc.bg }]}>
                  <Text style={styles.emoji}>{doc.emoji}</Text>
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{doc.title}</Text>
                  <Text style={styles.itemSubtitle} numberOfLines={2}>{doc.subtitle}</Text>
                </View>
                <View style={styles.pill}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={doc.accent} />
                  ) : (
                    <>
                      <Ionicons name="document-text-outline" size={13} color={doc.accent} />
                      <Text style={[styles.pillText, { color: doc.accent }]}>Create PDF</Text>
                    </>
                  )}
                </View>
              </PressableScale>
            );
          })}
        </View>

        {/* ── Section 2: Static printable tools ── */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>PRINTABLE TOOLS & VISUALS</Text>
        <Text style={styles.sectionSubtext}>
          Blank charts, visuals, and cards to print and use at home.
        </Text>

        {CATEGORIES.map((cat) => (
          <View key={cat.title} style={styles.categorySection}>
            <Text style={[styles.categoryLabel, { color: cat.accent }]}>{cat.title.toUpperCase()}</Text>
            <View style={styles.itemStack}>
              {cat.items.map((item) => {
                const isLoading = loadingId === item.id;
                const isDimmed = loadingId !== null && !isLoading;
                return (
                  <PressableScale
                    key={item.id}
                    style={[styles.card, isDimmed && styles.cardDimmed]}
                    onPress={() => openPrintable(item)}
                  >
                    <View style={[styles.emojiCircle, { backgroundColor: cat.bg }]}>
                      <Text style={styles.emoji}>{item.emoji}</Text>
                    </View>
                    <Text style={styles.itemTitleOnly} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.pill}>
                      {isLoading ? (
                        <ActivityIndicator size="small" color={cat.accent} />
                      ) : (
                        <>
                          <Ionicons name="print-outline" size={13} color={cat.accent} />
                          <Text style={[styles.pillText, { color: cat.accent }]}>Print / Save</Text>
                        </>
                      )}
                    </View>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        ))}

        {/* Bottom note */}
        <Text style={styles.bottomNote}>
          Your information stays private. Documents are generated on your device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  headerTitle: {
    ...Type.heading,
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  introCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    ...Shadows.card,
  },
  introText: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.purple,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  sectionLabelSpaced: {
    marginTop: 24,
  },
  sectionSubtext: {
    ...Type.caption,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  categorySection: {
    marginTop: 20,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  itemStack: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Shadows.card,
  },
  cardDimmed: {
    opacity: 0.45,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  emoji: {
    fontSize: 22,
  },
  textBlock: {
    flex: 1,
    marginHorizontal: 14,
  },
  itemTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  itemSubtitle: {
    ...Type.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemTitleOnly: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
    flex: 1,
    marginHorizontal: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
    width: 82,
  },
  pillText: {
    fontSize: 11,
    fontFamily: Fonts.semibold,
  },
  bottomNote: {
    ...Type.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 28,
  },
});
