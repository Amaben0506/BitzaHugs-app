import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  urgent?: boolean;
}

interface Category {
  title: string;
  color: string;
  bgTint: string;
  resources: Resource[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    title: 'Crisis Support',
    color: '#E24B4A',
    bgTint: '#FFF0F0',
    resources: [
      { id: '1', title: '988 Suicide & Crisis Lifeline', description: 'Call or text 988 — free, confidential crisis support 24/7', url: 'tel:988', icon: '🆘', urgent: true },
      { id: '2', title: 'Crisis Text Line', description: 'Text HOME to 741741 — free crisis counseling by text', url: 'sms:741741', icon: '💬', urgent: true },
      { id: '3', title: 'NAMI Helpline', description: '1-800-950-6264 — mental health support and information', url: 'tel:18009506264', icon: '🧠', urgent: true },
    ],
  },
  {
    title: 'Autism & Special Needs',
    color: Colors.purple,
    bgTint: Colors.navActiveBg,
    resources: [
      { id: '4', title: 'Autism Society of America', description: 'Support, resources, and community for autism families', url: 'https://autismsociety.org', icon: '🧩' },
      { id: '5', title: 'Autism Speaks', description: 'Tools, resources, and advocacy for autism families', url: 'https://autismspeaks.org', icon: '💙' },
      { id: '6', title: 'ASAN — Autistic Self Advocacy Network', description: 'Nothing about us without us — autistic-led advocacy', url: 'https://autisticadvocacy.org', icon: '✊' },
    ],
  },
  {
    title: 'Caregiver Support',
    color: Colors.textRose,
    bgTint: '#FFF0F4',
    resources: [
      { id: '7', title: 'Family Caregiver Alliance', description: 'Resources, education, and support for family caregivers', url: 'https://caregiver.org', icon: '🤝' },
      { id: '8', title: 'ARCH National Respite Network', description: 'Find respite care and caregiver support near you', url: 'https://archrespite.org', icon: '🏠' },
      { id: '9', title: 'Caregiver Action Network', description: 'Community and resources for family caregivers', url: 'https://caregiveraction.org', icon: '💪' },
    ],
  },
  {
    title: 'School & IEP Support',
    color: '#3A8A3A',
    bgTint: '#F0F8F0',
    resources: [
      { id: '10', title: 'Wrightslaw', description: 'Special education law and advocacy information', url: 'https://wrightslaw.com', icon: '⚖️' },
      { id: '11', title: 'Understood.org', description: 'Resources for learning and thinking differences', url: 'https://understood.org', icon: '📚' },
      { id: '12', title: 'Parent Training Centers (PTI)', description: 'Free training and information for families of children with disabilities', url: 'https://www.parentcenterhub.org', icon: '🎓' },
    ],
  },
  {
    title: 'Mental Health',
    color: Colors.textSecondary,
    bgTint: '#EDE3FF',
    resources: [
      { id: '13', title: 'Psychology Today — Find a Therapist', description: 'Search for therapists, psychiatrists, and support groups near you', url: 'https://psychologytoday.com/us/therapists', icon: '🧘' },
      { id: '14', title: 'Open Path Collective', description: 'Affordable therapy sessions for individuals and families', url: 'https://openpathcollective.org', icon: '🌿' },
      { id: '15', title: 'SAMHSA Treatment Locator', description: 'Find mental health and substance use treatment near you', url: 'https://findtreatment.samhsa.gov', icon: '🏥' },
    ],
  },
];

// ─── Open helper ─────────────────────────────────────────────────────────────

const openResource = (resource: Resource) => {
  const isDirectLink = resource.url.startsWith('tel:') || resource.url.startsWith('sms:');
  Alert.alert(
    resource.title,
    isDirectLink ? resource.description : `This will open ${resource.title} in your browser.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => Linking.openURL(resource.url) },
    ]
  );
};

// ─── Resource card ────────────────────────────────────────────────────────────

function ResourceCard({ resource, bgTint }: { resource: Resource; bgTint: string }) {
  return (
    <TouchableOpacity
      style={[s.resourceCard, resource.urgent && s.urgentCard]}
      onPress={() => openResource(resource)}
      activeOpacity={0.85}
    >
      {resource.urgent && <View style={s.urgentAccent} />}
      <View style={s.resourceInner}>
        <View style={[s.iconCircle, { backgroundColor: bgTint }]}>
          <Text style={s.iconEmoji}>{resource.icon}</Text>
        </View>
        <View style={s.resourceText}>
          <Text style={[s.resourceTitle, resource.urgent && s.urgentTitle]}>{resource.title}</Text>
          <Text style={s.resourceDesc}>{resource.description}</Text>
        </View>
        <Ionicons name="open-outline" size={14} color={Colors.grayLavender} style={s.externalIcon} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────

function CategorySection({ category, first }: { category: Category; first?: boolean }) {
  return (
    <View style={[s.categoryBlock, !first && s.categoryBlockSpaced]}>
      {/* Header */}
      <View style={s.categoryHeader}>
        <Text style={[s.categoryTitle, { color: category.color }]}>{category.title.toUpperCase()}</Text>
        <View style={[s.categoryLine, { backgroundColor: category.color + '30' }]} />
      </View>
      {/* Cards */}
      {category.resources.map(r => (
        <ResourceCard key={r.id} resource={r} bgTint={category.bgTint} />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HelpfulResourcesScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Helpful Resources</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Intro card */}
        <View style={s.introCard}>
          <Ionicons name="heart-circle-outline" size={18} color="#3A6BC8" style={{ flexShrink: 0 }} />
          <Text style={s.introText}>
            Carefully selected resources for caregivers. Tap any resource to open it.
          </Text>
        </View>

        {/* Categories */}
        {CATEGORIES.map((cat, i) => (
          <CategorySection key={cat.title} category={cat} first={i === 0} />
        ))}

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.textMuted} style={{ flexShrink: 0, marginTop: 1 }} />
          <Text style={s.disclaimerText}>
            BitzaHugs does not endorse any specific organization. These resources are provided for informational purposes only. Always seek professional guidance for medical, legal, or crisis situations.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardBorder,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.navActiveBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },

  scroll: { padding: 16, paddingBottom: 48 },

  introCard: {
    backgroundColor: '#EEF4FF',
    borderWidth: 0.5,
    borderColor: '#C0D4F8',
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 4,
  },
  introText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  categoryBlock: {},
  categoryBlockSpaced: { marginTop: 20 },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
    flexShrink: 0,
  },
  categoryLine: {
    flex: 1,
    height: 1,
    borderRadius: 1,
  },

  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  urgentCard: { borderColor: '#E24B4A40' },
  urgentAccent: {
    width: 3,
    backgroundColor: '#E24B4A',
  },
  resourceInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 20 },
  resourceText: { flex: 1 },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  urgentTitle: { color: '#C03060' },
  resourceDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  externalIcon: { flexShrink: 0 },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginTop: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
