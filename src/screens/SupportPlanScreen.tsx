import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, getDoc, setDoc } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import '../lib/firebase';
import { usePremium } from '../lib/premium';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupportPlan {
  calmingSteps: string[];
  trustedContacts: string;
  childCalmingStrategies: string;
  importantMedicalInfo: string;
  safePlaces: string;
  reminders: string;
  whatNotToDo: string;
  customInstructions: string;
  lastUpdated: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const loadPlan = async (): Promise<SupportPlan | null> => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const snap = await getDoc(doc(getFirestore(), 'users', uid, 'supportPlan', 'main'));
      if (snap.exists()) return snap.data() as SupportPlan;
    }
  } catch (e) {}
  const raw = await AsyncStorage.getItem('bitzaSupportPlan');
  return raw ? JSON.parse(raw) : null;
};

const savePlan = async (plan: SupportPlan) => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (uid) await setDoc(doc(getFirestore(), 'users', uid, 'supportPlan', 'main'), plan);
    await AsyncStorage.setItem('bitzaSupportPlan', JSON.stringify(plan));
  } catch (e) {
    await AsyncStorage.setItem('bitzaSupportPlan', JSON.stringify(plan));
  }
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
};

// ─── Section card wrapper ─────────────────────────────────────────────────────

function SectionCard({
  title, subtitle, style, children,
}: {
  title: string;
  subtitle?: string;
  style?: object;
  children: React.ReactNode;
}) {
  return (
    <View style={[s.card, style]}>
      <Text style={s.cardTitle}>{title}</Text>
      {subtitle ? <Text style={s.cardSub}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SupportPlanScreen() {
  const navigation = useNavigation<any>();
  const { requirePremium } = usePremium();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [calmingSteps, setCalmingSteps] = useState<string[]>(['', '', '']);
  const [trustedContacts, setTrustedContacts] = useState('');
  const [childCalmingStrategies, setChildCalmingStrategies] = useState('');
  const [importantMedicalInfo, setImportantMedicalInfo] = useState('');
  const [safePlaces, setSafePlaces] = useState('');
  const [whatNotToDo, setWhatNotToDo] = useState('');
  const [reminders, setReminders] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    const load = async () => {
      const [plan, childRaw] = await Promise.all([
        loadPlan(),
        AsyncStorage.getItem('bitzaChildProfile'),
      ]);

      if (plan) {
        setCalmingSteps(
          (plan.calmingSteps?.length ? plan.calmingSteps : ['', '', '']).slice(0, 5)
        );
        setTrustedContacts(plan.trustedContacts ?? '');
        setChildCalmingStrategies(plan.childCalmingStrategies ?? '');
        setImportantMedicalInfo(plan.importantMedicalInfo ?? '');
        setSafePlaces(plan.safePlaces ?? '');
        setWhatNotToDo(plan.whatNotToDo ?? '');
        setReminders(plan.reminders ?? '');
        setCustomInstructions(plan.customInstructions ?? '');
        setLastUpdated(plan.lastUpdated ?? null);

        // Pre-fill child strategies from profile only if plan section is empty
        if (!plan.childCalmingStrategies && childRaw) {
          const cp = JSON.parse(childRaw);
          if (cp.calmingStrategies) setChildCalmingStrategies(cp.calmingStrategies);
        }
      } else if (childRaw) {
        const cp = JSON.parse(childRaw);
        if (cp.calmingStrategies) setChildCalmingStrategies(cp.calmingStrategies);
      }

      setLoading(false);
    };
    load();
  }, []);

  // ── Calming steps helpers ──────────────────────────────────────────────────

  const updateStep = (index: number, value: string) => {
    setCalmingSteps(prev => prev.map((s, i) => (i === index ? value : s)));
  };

  const clearStep = (index: number) => updateStep(index, '');

  const addStep = () => {
    if (calmingSteps.length < 5) setCalmingSteps(prev => [...prev, '']);
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    const today = new Date().toISOString();
    const plan: SupportPlan = {
      calmingSteps: calmingSteps.filter(s => s.trim()),
      trustedContacts,
      childCalmingStrategies,
      importantMedicalInfo,
      safePlaces,
      whatNotToDo,
      reminders,
      customInstructions,
      lastUpdated: today,
    };
    await savePlan(plan);
    setLastUpdated(today);
    setSaving(false);
    Alert.alert('Plan saved 💜', 'It will be here when you need it.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Support Plan</Text>
        <TouchableOpacity
          style={[s.saveHeaderBtn, saving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.saveHeaderBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Intro banner */}
          <View style={s.introBanner}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.purple} />
            <View style={{ flex: 1 }}>
              <Text style={s.introText}>
                Prepare your plan now, so it's ready when you need it.
              </Text>
              <Text style={s.introDate}>
                {lastUpdated ? `Last updated: ${formatDate(lastUpdated)}` : 'Not yet saved'}
              </Text>
            </View>
          </View>

          {/* ── Section 1: Calming steps ─────────────────────────────────── */}
          <SectionCard
            title="My calming steps"
            subtitle="What helps you reset in a hard moment?"
          >
            <View style={s.stepsContainer}>
              {calmingSteps.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepNum}>
                    <Text style={s.stepNumText}>{i + 1}</Text>
                  </View>
                  <TextInput
                    style={s.stepInput}
                    value={step}
                    onChangeText={v => updateStep(i, v)}
                    placeholder="e.g. Put both feet on the floor"
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType="next"
                  />
                  {!!step && (
                    <TouchableOpacity onPress={() => clearStep(i)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={18} color={Colors.grayLavender} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            {calmingSteps.length < 5 && (
              <TouchableOpacity onPress={addStep} activeOpacity={0.7} style={s.addStepBtn}>
                <Text style={s.addStepText}>+ Add a step</Text>
              </TouchableOpacity>
            )}
          </SectionCard>

          {/* ── Section 2: Trusted contacts ──────────────────────────────── */}
          <SectionCard title="Trusted contacts">
            <TextInput
              style={[s.textArea]}
              value={trustedContacts}
              onChangeText={setTrustedContacts}
              placeholder={"e.g. Bret (partner) — 555-0100\nMom — 555-0200\nSarah T. (speech therapist) — 555-0300"}
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
            <Text style={s.fieldNote}>
              These are for your reference. Tap Contact in the Support tab to reach them quickly.
            </Text>
          </SectionCard>

          {/* ── Section 3: Child calming ─────────────────────────────────── */}
          <SectionCard title="Child calming strategies">
            <TextInput
              style={s.textArea}
              value={childCalmingStrategies}
              onChangeText={setChildCalmingStrategies}
              placeholder="e.g. Deep pressure, quiet space, visual schedule..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </SectionCard>

          {/* ── Section 4: Medical info ──────────────────────────────────── */}
          <SectionCard
            title="Medical and safety info"
            subtitle="Allergies, medications, emergency instructions"
          >
            <TextInput
              style={s.textArea}
              value={importantMedicalInfo}
              onChangeText={setImportantMedicalInfo}
              placeholder="e.g. No known allergies. Takes melatonin at bedtime. In case of seizure: do not restrain..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </SectionCard>

          {/* ── Section 5: Safe places ───────────────────────────────────── */}
          <SectionCard
            title="Safe places"
            subtitle="Where can you or your child go to feel safer?"
          >
            <TextInput
              style={s.textArea}
              value={safePlaces}
              onChangeText={setSafePlaces}
              placeholder="e.g. Child's calm corner (bedroom), backyard, car with music..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </SectionCard>

          {/* ── Section 6: What NOT to do ────────────────────────────────── */}
          <SectionCard
            title="What not to do when overwhelmed"
            subtitle="Things that make it harder — good to know in advance"
            style={s.blushCard}
          >
            <TextInput
              style={[s.textArea, s.blushInput]}
              value={whatNotToDo}
              onChangeText={setWhatNotToDo}
              placeholder="e.g. Don't raise my voice. Don't try to reason during meltdown. Don't isolate myself..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </SectionCard>

          {/* ── Section 7: Reminders ─────────────────────────────────────── */}
          <SectionCard title="Reminders 💜" style={s.lavCard}>
            <TextInput
              style={[s.textArea, s.lavInput]}
              value={reminders}
              onChangeText={setReminders}
              placeholder="e.g. I am not failing. This is hard for everyone. One breath at a time. I can do this."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </SectionCard>

          {/* ── Bottom buttons ───────────────────────────────────────────── */}
          <TouchableOpacity
            style={[s.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.saveBtnText}>Save plan</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.exportBtn}
            onPress={() => {
              if (requirePremium({ feature: 'support_plans' })) {
                Alert.alert('Export coming soon 💜');
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={s.exportBtnText}>Print / export</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  saveHeaderBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveHeaderBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  scroll: { padding: 16, paddingBottom: 48, gap: 12 },

  // ── Intro banner ──────────────────────────────────────────────────────────
  introBanner: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  introText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  introDate: { fontSize: 10, color: Colors.textMuted, marginTop: 3 },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 16,
    gap: 8,
  },
  blushCard: { backgroundColor: '#FFF7FB', borderColor: '#F0D0E8' },
  lavCard: { backgroundColor: '#EDE0FF', borderColor: Colors.cardBorder },

  cardTitle: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textMuted, marginTop: -4 },

  // ── Calming steps ─────────────────────────────────────────────────────────
  stepsContainer: { gap: 8 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { fontSize: 11, fontWeight: '600', color: Colors.purple },
  stepInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: Colors.pageBg,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  addStepBtn: { paddingTop: 2 },
  addStepText: { fontSize: 11, color: Colors.purple, fontWeight: '500' },

  // ── Text areas ────────────────────────────────────────────────────────────
  textArea: {
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: Colors.pageBg,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    minHeight: 80,
    lineHeight: 20,
  },
  blushInput: { backgroundColor: '#FFF0F4', borderColor: '#F0D0E8' },
  lavInput: { backgroundColor: '#F5EEFF', borderColor: Colors.cardBorder },

  fieldNote: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: -2,
  },

  // ── Bottom buttons ────────────────────────────────────────────────────────
  saveBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  exportBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  exportBtnText: { fontSize: 13, fontWeight: '500', color: Colors.purple },
});
