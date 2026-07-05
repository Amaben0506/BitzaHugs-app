import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

type Path = 'calm' | 'child' | 'meltdown' | 'contact' | 'emergency' | null;
type CalmTool = 'breathing' | 'cold_water' | 'outside' | 'hugi' | null;
type ChildSit = 'meltdown' | 'shutdown' | 'aggression' | 'anxiety' | null;

// ─── Shared ──────────────────────────────────────────────────────────────────

function PrimaryBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.primaryBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={s.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.secondaryBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={s.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function StepCard({ children }: { children: React.ReactNode }) {
  return <View style={s.stepCard}>{children}</View>;
}

// ─── Step 0: Choose path ─────────────────────────────────────────────────────

const PATH_OPTIONS: Array<{
  id: Path;
  emoji: string;
  label: string;
  sub: string;
  bg: string;
  border: string;
}> = [
  { id: 'calm', emoji: '🧘', label: 'Help me calm down', sub: 'Quick grounding tools for you', bg: '#EDE3FF', border: '#D4BEFF' },
  { id: 'child', emoji: '🫂', label: 'Help me support my child', sub: 'Step-by-step guidance for right now', bg: '#FFF0F6', border: '#F0D0E8' },
  { id: 'meltdown', emoji: '📋', label: 'Open our meltdown plan', sub: 'Your saved strategies, ready to use', bg: '#F0F8FF', border: '#C8D8F0' },
  { id: 'contact', emoji: '👥', label: 'Contact my support person', sub: 'Reach someone on your team', bg: '#F0F8F0', border: '#B8D8B8' },
  { id: 'emergency', emoji: '🚨', label: 'This is an emergency', sub: 'Safety resources and crisis lines', bg: '#FFF5F5', border: '#F5C8C8' },
];

function StepChoosePath({ onSelect }: { onSelect: (p: Path) => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>What do you need right now?</Text>
      <Text style={s.stepSub}>We'll guide you through it step by step.</Text>
      <View style={s.optionList}>
        {PATH_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.id}
            style={[s.pathCard, { backgroundColor: opt.bg, borderColor: opt.border }]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.85}
          >
            <Text style={s.pathEmoji}>{opt.emoji}</Text>
            <View style={s.pathText}>
              <Text style={s.pathLabel}>{opt.label}</Text>
              <Text style={s.pathSub}>{opt.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Path: calm ──────────────────────────────────────────────────────────────

const CALM_OPTIONS: Array<{ id: CalmTool; emoji: string; label: string; sub: string }> = [
  { id: 'breathing', emoji: '💨', label: 'Box breathing', sub: '~2 minutes' },
  { id: 'cold_water', emoji: '💧', label: 'Cold water reset', sub: '30 seconds' },
  { id: 'outside', emoji: '🌿', label: 'Step outside', sub: '2 minutes' },
  { id: 'hugi', emoji: '💬', label: 'I need to talk to someone', sub: 'Hugi is here' },
];

function StepCalmChoose({ onSelect }: { onSelect: (tool: CalmTool) => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>Let's steady you first</Text>
      <Text style={s.stepSub}>Before you can help anyone else, you need to be grounded. Choose what feels right:</Text>
      <View style={s.optionList}>
        {CALM_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.id}
            style={[s.pathCard, { backgroundColor: '#EDE3FF', borderColor: '#D4BEFF' }]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.85}
          >
            <Text style={s.pathEmoji}>{opt.emoji}</Text>
            <View style={s.pathText}>
              <Text style={s.pathLabel}>{opt.label}</Text>
              <Text style={s.pathSub}>{opt.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const BREATH_PHASES = [
  { phase: 'Breathe IN', count: '4 counts', color: Colors.purple },
  { phase: 'Hold', count: '4 counts', color: Colors.textMuted },
  { phase: 'Breathe OUT', count: '4 counts', color: Colors.textSecondary },
  { phase: 'Hold', count: '4 counts', color: Colors.textMuted },
];

function StepBreathing({ onNext }: { onNext: () => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>Box Breathing</Text>
      <Text style={s.stepSub}>You don't have to fix anything in the next 2 minutes. Just breathe.</Text>
      <StepCard>
        {BREATH_PHASES.map((row, i) => (
          <View key={i} style={[s.breathRow, i < BREATH_PHASES.length - 1 && s.breathRowBorder]}>
            <View style={[s.breathDot, { backgroundColor: row.color }]} />
            <Text style={s.breathPhase}>{row.phase}</Text>
            <Text style={s.breathCount}>{row.count}</Text>
          </View>
        ))}
        <Text style={s.breathNote}>Repeat 4 times. Go slower than you think you need to.</Text>
      </StepCard>
      <PrimaryBtn label="I finished 4 rounds ✓" onPress={onNext} />
    </View>
  );
}

function StepColdWater({ onNext }: { onNext: () => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>Cold Water Reset</Text>
      <Text style={s.stepSub}>30 seconds is all it takes.</Text>
      <StepCard>
        <Text style={s.guideBody}>
          Splash cold water on your face, or hold your wrists under cold running water for 30 seconds.
        </Text>
        <Text style={[s.guideBody, { marginTop: 12 }]}>
          This activates your diving reflex — a real physiological calming response your body is built with.
        </Text>
      </StepCard>
      <PrimaryBtn label="Done ✓" onPress={onNext} />
    </View>
  );
}

function StepOutside({ onNext }: { onNext: () => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>Step Outside</Text>
      <Text style={s.stepSub}>Two minutes. That's it.</Text>
      <StepCard>
        {[
          'Look at 5 things you can see',
          'Name 4 things you can touch',
          'Take 3 deep, slow breaths',
          'Let your body reset before going back in',
        ].map((item, i) => (
          <View key={i} style={[s.numRow, i > 0 && { marginTop: 12 }]}>
            <View style={s.numCircle}>
              <Text style={s.numText}>{i + 1}</Text>
            </View>
            <Text style={s.bulletText}>{item}</Text>
          </View>
        ))}
      </StepCard>
      <PrimaryBtn label="Back inside ✓" onPress={onNext} />
    </View>
  );
}

function StepCalmCheck({ onDone, onContact }: { onDone: () => void; onContact: () => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>How are you feeling?</Text>
      <Text style={s.stepSub}>It's okay if you're not 100%. You just did something good for yourself.</Text>
      <PrimaryBtn label="Better — I'm ready" onPress={onDone} />
      <View style={{ height: 10 }} />
      <SecondaryBtn label="Still struggling — contact my support person" onPress={onContact} />
    </View>
  );
}

// ─── Path: child ─────────────────────────────────────────────────────────────

const CHILD_OPTIONS: Array<{ id: ChildSit; emoji: string; label: string; sub: string }> = [
  { id: 'meltdown', emoji: '🌊', label: 'Meltdown or sensory overload', sub: 'Overwhelmed, screaming, or crying' },
  { id: 'shutdown', emoji: '🔇', label: 'Shutting down or refusing', sub: 'Withdrawn, not responding, frozen' },
  { id: 'aggression', emoji: '🫂', label: 'Hitting, biting, or self-harm', sub: 'Aggression toward self or others' },
  { id: 'anxiety', emoji: '💨', label: 'Anxiety or panic', sub: 'Scared, hyperventilating, or fixating' },
];

function StepChildChoose({ onSelect }: { onSelect: (s: ChildSit) => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>What's happening right now?</Text>
      <Text style={s.stepSub}>Choose what's closest to what you're seeing.</Text>
      <View style={s.optionList}>
        {CHILD_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.id}
            style={[s.pathCard, { backgroundColor: '#FFF0F6', borderColor: '#F0D0E8' }]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.85}
          >
            <Text style={s.pathEmoji}>{opt.emoji}</Text>
            <View style={s.pathText}>
              <Text style={s.pathLabel}>{opt.label}</Text>
              <Text style={s.pathSub}>{opt.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const CHILD_GUIDANCE: Record<string, { title: string; steps: string[] }> = {
  meltdown: {
    title: 'During a Meltdown',
    steps: [
      'Create space — step back and give them room to move',
      'Lower stimulation — dim lights or reduce noise if you can',
      'Use fewer words — short phrases or silence is better right now',
      'Stay calm and nearby — your regulated nervous system helps regulate theirs',
      "Don't try to reason yet — wait for the wave to pass",
    ],
  },
  shutdown: {
    title: "When They're Shutting Down",
    steps: [
      "Don't push — pressure makes a shutdown worse",
      'Sit nearby without talking or making eye contact',
      'Offer something sensory — weighted blanket, fidget, or a favorite snack',
      'Keep the environment quiet and low-demand',
      'Wait for them to come to you — they will when they are ready',
    ],
  },
  aggression: {
    title: 'Keep Everyone Safe First',
    steps: [
      'Stay calm — your regulated nervous system is the most powerful tool you have',
      'Remove hard objects from reach if you safely can',
      "Give 6 feet of space — don't grab unless there's immediate danger",
      'Block softly rather than restraining if you need to protect them',
      "After it passes: reconnect gently — don't punish or debrief yet",
    ],
  },
  anxiety: {
    title: 'During Anxiety or Panic',
    steps: [
      "Validate first — \"I see you're scared. I'm right here.\"",
      'Anchor them — name things together: "Can you see the blue chair?"',
      'Breathe loudly and slowly yourself — they will unconsciously follow',
      'Offer physical comfort only if they want it — ask before touching',
      'Stay steady — your calm tells their nervous system it is safe',
    ],
  },
};

function StepChildGuidance({ situation, onNext }: { situation: ChildSit; onNext: () => void }) {
  const guide = situation ? CHILD_GUIDANCE[situation] : null;
  if (!guide) return null;
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>{guide.title}</Text>
      <StepCard>
        {guide.steps.map((step, i) => (
          <View key={i} style={[s.numRow, i > 0 && { marginTop: 14 }]}>
            <View style={s.numCircle}>
              <Text style={s.numText}>{i + 1}</Text>
            </View>
            <Text style={s.bulletText}>{step}</Text>
          </View>
        ))}
      </StepCard>
      <PrimaryBtn label="Got it — what's next?" onPress={onNext} />
    </View>
  );
}

function StepChildCheck({ onDone, onMore }: { onDone: () => void; onMore: () => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>How is it going?</Text>
      <Text style={s.stepSub}>There's no wrong answer. You're doing your best in a hard moment.</Text>
      <PrimaryBtn label="Getting better — thank you" onPress={onDone} />
      <View style={{ height: 10 }} />
      <SecondaryBtn label="Still need help — open our plan" onPress={onMore} />
    </View>
  );
}

// ─── Path: meltdown plan ─────────────────────────────────────────────────────

const PLAN_PHASES = [
  {
    phase: 'Early Warning Signs',
    bg: '#FFF8E0',
    border: '#F0D8A0',
    dot: '#D4A800',
    items: ['Stimming increases', 'Getting louder or quieter than usual', 'Avoiding eye contact', 'Rigid posture or clenching'],
  },
  {
    phase: 'During — What Helps',
    bg: '#EDE3FF',
    border: '#D4BEFF',
    dot: Colors.purple,
    items: ['Space + silence', 'Remove demands completely', 'Weighted blanket', 'Preferred music at low volume'],
  },
  {
    phase: 'Recovery — Reconnecting',
    bg: '#E8F6EC',
    border: '#B8D8B8',
    dot: Colors.green,
    items: ['Wait for them to initiate contact', 'Offer a preferred snack', 'Low-key activity together', 'No debriefing for at least 30 min'],
  },
];

function StepMeltdownPlan({ onDone }: { onDone: () => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>Meltdown Plan</Text>
      <Text style={s.stepSub}>Your saved strategies for each phase. Update these anytime in My Child.</Text>
      {PLAN_PHASES.map((phase, pi) => (
        <View key={pi} style={[s.phaseCard, { backgroundColor: phase.bg, borderColor: phase.border }]}>
          <View style={s.phaseHeader}>
            <View style={[s.phaseDot, { backgroundColor: phase.dot }]} />
            <Text style={s.phaseTitle}>{phase.phase}</Text>
          </View>
          {phase.items.map((item, ii) => (
            <View key={ii} style={s.phaseRow}>
              <Text style={s.phaseBullet}>·</Text>
              <Text style={s.phaseItem}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
      <PrimaryBtn label="Got it" onPress={onDone} />
    </View>
  );
}

// ─── Path: contact ───────────────────────────────────────────────────────────

const PLACEHOLDER_CONTACTS = [
  { id: '1', name: 'Bret', role: 'Partner', initials: 'BR', phone: '+15555550001', isOnline: true },
  { id: '2', name: 'Mom', role: 'Family', initials: 'MO', phone: '+15555550002' },
  { id: '3', name: 'Mrs. Lopez', role: 'Teacher', initials: 'ML', phone: '+15555550003' },
  { id: '4', name: 'Sarah T.', role: 'Speech Therapist', initials: 'ST', phone: '+15555550004' },
];

function StepContact({ onDone }: { onDone: () => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>Contact Your Support Person</Text>
      <Text style={s.stepSub}>Reach out to someone on your team. You don't have to do this alone.</Text>
      <View style={s.optionList}>
        {PLACEHOLDER_CONTACTS.map(c => (
          <View key={c.id} style={s.contactCard}>
            <View style={s.contactLeft}>
              <View style={s.initialsCircle}>
                <Text style={s.initialsText}>{c.initials}</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={s.contactName}>{c.name}</Text>
                  {c.isOnline && <View style={s.onlineDot} />}
                </View>
                <Text style={s.contactRole}>{c.role}</Text>
              </View>
            </View>
            <View style={s.contactActions}>
              <TouchableOpacity
                style={s.contactBtn}
                onPress={() => Linking.openURL(`tel:${c.phone}`)}
                activeOpacity={0.85}
              >
                <Ionicons name="call-outline" size={16} color={Colors.purple} />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.contactBtn}
                onPress={() => Linking.openURL(`sms:${c.phone}`)}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubble-outline" size={16} color={Colors.purple} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      <View style={{ height: 16 }} />
      <SecondaryBtn label="I'm okay — go back" onPress={onDone} />
    </View>
  );
}

// ─── Path: emergency ─────────────────────────────────────────────────────────

const CRISIS_RESOURCES = [
  {
    label: 'Call 911',
    sub: 'Immediate danger or emergency',
    action: 'tel:911',
    bg: '#FFF0F0',
    border: '#F5C8C8',
    labelColor: '#C03060',
    icon: 'call-outline' as const,
  },
  {
    label: '988 Suicide & Crisis Lifeline',
    sub: 'Call or text 988 (US)',
    action: 'tel:988',
    bg: '#FFF5F0',
    border: '#F5D8C8',
    labelColor: '#C06030',
    icon: 'heart-outline' as const,
  },
  {
    label: 'Crisis Text Line',
    sub: 'Text HOME to 741741',
    action: 'sms:741741',
    bg: '#F5F0FF',
    border: '#D4BEFF',
    labelColor: Colors.textPrimary,
    icon: 'chatbubble-outline' as const,
  },
  {
    label: 'NAMI Helpline',
    sub: '1-800-950-6264 · Mon–Fri 10am–10pm ET',
    action: 'tel:18009506264',
    bg: '#F0F5FF',
    border: '#C8D8F0',
    labelColor: Colors.textPrimary,
    icon: 'people-outline' as const,
  },
];

function StepEmergency({ onDone }: { onDone: () => void }) {
  return (
    <View style={s.stepRoot}>
      <Text style={s.stepHeading}>You're not alone</Text>
      <Text style={s.stepSub}>
        BitzaHugs is not a crisis service. If there is immediate danger, call 911 now.
      </Text>
      <View style={s.optionList}>
        {CRISIS_RESOURCES.map((r, i) => (
          <TouchableOpacity
            key={i}
            style={[s.crisisCard, { backgroundColor: r.bg, borderColor: r.border }]}
            onPress={() => Linking.openURL(r.action)}
            activeOpacity={0.85}
          >
            <Ionicons name={r.icon} size={22} color={r.labelColor} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[s.crisisLabel, { color: r.labelColor }]}>{r.label}</Text>
              <Text style={s.crisisSub}>{r.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 16 }} />
      <SecondaryBtn label="I'm safe — go back" onPress={onDone} />
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const PATH_TITLES: Record<string, string> = {
  calm: 'Calm Down',
  child: 'Support My Child',
  meltdown: 'Meltdown Plan',
  contact: 'Contact Someone',
  emergency: 'Emergency Resources',
};

const PATH_STEP_COUNTS: Record<string, number> = {
  calm: 3,
  child: 3,
  meltdown: 1,
  contact: 1,
  emergency: 1,
};

export default function ImmediateSupportScreen() {
  const navigation = useNavigation<any>();
  const [path, setPath] = useState<Path>(null);
  const [step, setStep] = useState(0);
  const [calmTool, setCalmTool] = useState<CalmTool>(null);
  const [childSit, setChildSit] = useState<ChildSit>(null);

  const goToPath = (p: Path) => {
    setPath(p);
    setStep(1);
    setCalmTool(null);
    setChildSit(null);
  };

  const goToRoot = () => {
    setPath(null);
    setStep(0);
    setCalmTool(null);
    setChildSit(null);
  };

  const next = () => setStep(prev => prev + 1);

  const goBack = () => {
    if (!path) {
      navigation.goBack();
    } else if (step <= 1) {
      goToRoot();
    } else {
      setStep(prev => prev - 1);
      if (step === 2) {
        setCalmTool(null);
        setChildSit(null);
      }
    }
  };

  const selectCalmTool = (tool: CalmTool) => {
    if (tool === 'hugi') {
      const rootNav = navigation.getParent('RootStack') ?? navigation;
      rootNav.navigate('HugiChat');
      return;
    }
    setCalmTool(tool);
    setStep(2);
  };

  const selectChildSit = (sit: ChildSit) => {
    setChildSit(sit);
    setStep(2);
  };

  const renderContent = () => {
    if (!path) return <StepChoosePath onSelect={goToPath} />;

    if (path === 'calm') {
      if (step === 1) return <StepCalmChoose onSelect={selectCalmTool} />;
      if (step === 2 && calmTool === 'breathing') return <StepBreathing onNext={next} />;
      if (step === 2 && calmTool === 'cold_water') return <StepColdWater onNext={next} />;
      if (step === 2 && calmTool === 'outside') return <StepOutside onNext={next} />;
      if (step === 3) return <StepCalmCheck onDone={goToRoot} onContact={() => goToPath('contact')} />;
    }

    if (path === 'child') {
      if (step === 1) return <StepChildChoose onSelect={selectChildSit} />;
      if (step === 2) return <StepChildGuidance situation={childSit} onNext={next} />;
      if (step === 3) return <StepChildCheck onDone={goToRoot} onMore={() => goToPath('meltdown')} />;
    }

    if (path === 'meltdown' && step === 1) return <StepMeltdownPlan onDone={goToRoot} />;
    if (path === 'contact' && step === 1) return <StepContact onDone={goToRoot} />;
    if (path === 'emergency' && step === 1) return <StepEmergency onDone={goToRoot} />;

    return null;
  };

  const totalSteps = path ? (PATH_STEP_COUNTS[path] ?? 1) : 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={goBack} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {path ? PATH_TITLES[path] : 'I Need Support'}
        </Text>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Ionicons name="close" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {path && totalSteps > 1 && (
        <View style={s.progressRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[s.progressBar, i < step && s.progressBarActive]}
            />
          ))}
        </View>
      )}

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
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

  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0D8F0',
  },
  progressBarActive: {
    backgroundColor: Colors.purple,
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
  },

  stepRoot: {
    flex: 1,
  },
  stepHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  stepSub: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 4,
  },
  optionList: {
    gap: 10,
    marginTop: 16,
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pathEmoji: {
    fontSize: 26,
    marginRight: 14,
  },
  pathText: {
    flex: 1,
  },
  pathLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  pathSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginTop: 16,
    marginBottom: 4,
  },

  breathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  breathRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0EAF8',
  },
  breathDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breathPhase: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  breathCount: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  breathNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  guideBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  numRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.navActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
    flexShrink: 0,
  },
  numText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  phaseCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginTop: 10,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  phaseRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  phaseBullet: {
    fontSize: 18,
    color: Colors.textMuted,
    marginRight: 8,
    lineHeight: 20,
  },
  phaseItem: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  contactRole: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.navActiveBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  crisisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
  },
  crisisLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  crisisSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  primaryBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});
