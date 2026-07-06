import { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadCaregiverProfile, saveCaregiverMood } from '../lib/dataService';
import { Colors } from '../theme/colors';
import MyCareHeader from '../components/mycare/MyCareHeader';
import CaregiverProfileCard from '../components/mycare/CaregiverProfileCard';
import CaregiverMoodTracker from '../components/mycare/CaregiverMoodTracker';
import ToolsForMeCard from '../components/mycare/ToolsForMeCard';
import MyJournalCard from '../components/mycare/MyJournalCard';
import WhatHasHelpedCard from '../components/mycare/WhatHasHelpedCard';
import WellnessSummaryCard from '../components/mycare/WellnessSummaryCard';
import GentleInsightsCard from '../components/mycare/GentleInsightsCard';
import SupportReminderCard from '../components/mycare/SupportReminderCard';

const TOOL_ROUTES: Record<string, string> = {
  pause: 'PauseWithMe',
  sounds: 'CalmingSounds',
  affirmations: 'Affirmations',
  grounding: 'GroundingSteps',
};

type CaregiverProfile = {
  name?: string;
  preferredGreeting?: string;
  focusNote?: string;
  calmingStrategies?: string;
  photoUri?: string | null;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatEntryTime = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export default function MyCareScreen() {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent('RootStack') ?? navigation;

  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [moodNote, setMoodNote] = useState('');
  const [caregiverProfile, setCaregiverProfile] = useState<CaregiverProfile | null>(null);
  const [caregiverMood, setCaregiverMood] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadScreenData = async () => {
        const [profile, moodRaw] = await Promise.all([
          loadCaregiverProfile(),
          AsyncStorage.getItem('bitzaCaregiverMood'),
        ]);

        if (!active) return;
        setCaregiverProfile(profile as CaregiverProfile | null);
        const mood = moodRaw ? JSON.parse(moodRaw) : null;
        setCaregiverMood(mood);
        setSelectedMood(mood?.mood);
        setMoodNote(mood?.note || '');
      };

      loadScreenData().catch(e => console.log('MyCare data load error:', e));
      return () => {
        active = false;
      };
    }, [])
  );

  const handleMoodSelect = useCallback(async (mood: string) => {
    setSelectedMood(mood);
    const nextMood = { mood, note: moodNote, time: new Date().toISOString() };
    setCaregiverMood(nextMood);
    await saveCaregiverMood(mood, moodNote);
  }, [moodNote]);

  const handleToolPress = useCallback((toolId: string) => {
    const route = TOOL_ROUTES[toolId];
    if (route) rootNav.navigate(route);
  }, [rootNav]);

  const displayName =
    caregiverProfile?.preferredGreeting?.trim() ||
    caregiverProfile?.name?.trim() ||
    'friend';
  const initials = getInitials(displayName);
  const currentMood = caregiverMood?.mood || 'Not checked in';
  const lastCheckin = formatEntryTime(caregiverMood?.time);
  const focusNote =
    caregiverProfile?.focusNote?.trim() ||
    caregiverProfile?.calmingStrategies?.trim() ||
    'Add a focus note in your profile.';

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#FCEEF3', '#FBF3F7', '#FDF9F9']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <MyCareHeader
          onSettingsPress={() => rootNav.navigate('Settings')}
        />
        <View style={styles.content}>
          <CaregiverProfileCard
            name={displayName}
            initials={initials}
            photoUri={caregiverProfile?.photoUri}
            currentMood={currentMood}
            moodEmoji={caregiverMood?.mood ? '🌿' : '♡'}
            lastCheckin={lastCheckin}
            weeklyCheckins={caregiverMood?.mood ? 1 : 0}
            focusNote={focusNote}
            onEditProfile={() => rootNav.navigate('EditCaregiverProfile')}
          />
          <CaregiverMoodTracker
            selectedMood={selectedMood}
            lastEntry={caregiverMood?.mood ? {
              mood: caregiverMood.mood,
              emoji: '🌿',
              note: caregiverMood.note,
              time: lastCheckin ? `Today at ${lastCheckin}` : 'Today',
            } : undefined}
            onMoodSelect={handleMoodSelect}
            onNoteChange={setMoodNote}
            onViewHistory={() => rootNav.navigate('CaregiverMoodHistory')}
          />
          <ToolsForMeCard
            onToolPress={handleToolPress}
            onSeeAllTools={() => console.log('see all tools')}
          />
          <MyJournalCard
            recentEntry={{
              date: 'May 13, 7:45 PM',
              preview: 'Some days feel heavier than others, but I keep showing up. That counts.',
            }}
            onWriteFreely={() => rootNav.navigate('JournalWrite')}
            onUsePrompt={() => rootNav.navigate('JournalPrompt')}
            onViewPastEntries={() => rootNav.navigate('JournalHistory')}
          />
          <WhatHasHelpedCard
            items={[
              { id: '1', emoji: '🐰', label: 'Pause With Me', count: 3, total: 5, color: Colors.purple },
              { id: '2', emoji: '💜', label: 'Affirmations', count: 4, total: 5, color: Colors.purple },
              { id: '3', emoji: '🎵', label: 'Calming Sounds', count: 2, total: 5, color: '#3A6BC8' },
              { id: '4', emoji: '🌿', label: 'Grounding Steps', count: 1, total: 5, color: Colors.green },
            ]}
            onViewAll={() => rootNav.navigate('ToolsActivity')}
          />
          <WellnessSummaryCard
            items={[
              { emoji: '😊', label: 'Mood check-ins', value: '4' },
              { emoji: '📓', label: 'Journal entries', value: '3' },
              { emoji: '💜', label: 'Tools used', value: '6' },
              { emoji: '🐰', label: 'Pauses taken', value: '4' },
              { emoji: '🌿', label: 'Average mood', value: 'Okay', highlight: true },
            ]}
            onViewFullSummary={() => rootNav.navigate('WellnessSummary')}
          />
          <GentleInsightsCard
            insights={[
              { id: '1', text: 'You used Affirmations most this week.' },
              { id: '2', text: 'Pausing even a few minutes can make a big difference.' },
              { id: '3', text: "You've been showing up for yourself. You're doing better than you think." },
            ]}
          />
          <SupportReminderCard
            onTalkToHugi={() => rootNav.navigate('HugiChat')}
            onSupportRightNow={() => rootNav.navigate('ImmediateSupport')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF9F9' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, gap: 12, paddingBottom: 112 },
});
