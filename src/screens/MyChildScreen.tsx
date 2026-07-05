import { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveChildMood } from '../lib/dataService';
import { Colors } from '../theme/colors';
import MyChildHeader from '../components/mychild/MyChildHeader';
import ChildProfileSnapshot from '../components/mychild/ChildProfileSnapshot';
import TodaysScheduleCard from '../components/mychild/TodaysScheduleCard';
import ChildMoodTracker from '../components/mychild/ChildMoodTracker';
import DailyProgressNote from '../components/mychild/DailyProgressNote';
import HelpfulToolsCard from '../components/mychild/HelpfulToolsCard';
import CareTeamCard from '../components/mychild/CareTeamCard';
import ProgressSummaryCard from '../components/mychild/ProgressSummaryCard';
import RecentWinsCard from '../components/mychild/RecentWinsCard';

type ScheduleStatus = 'completed' | 'pending' | 'skipped' | 'in-progress';
type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  type: 'routine' | 'appointment';
  status: ScheduleStatus;
  icon: string;
};

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: '1', time: '7:00 AM', title: 'Morning Routine', type: 'routine', status: 'completed', icon: '🌅' },
  { id: '2', time: '8:30 AM', title: 'School / Learning', type: 'routine', status: 'completed', icon: '📚' },
  { id: '3', time: '10:00 AM', title: 'Speech Therapy', subtitle: 'with Sarah T.', type: 'appointment', status: 'pending', icon: '🗣️' },
  { id: '4', time: '12:30 PM', title: 'Lunch', type: 'routine', status: 'pending', icon: '🍽️' },
  { id: '5', time: '3:00 PM', title: 'Play / Break Time', type: 'routine', status: 'pending', icon: '☀️' },
  { id: '6', time: '7:00 PM', title: 'Bedtime Routine', type: 'routine', status: 'pending', icon: '🌙' },
];

export default function MyChildScreen() {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent('RootStack') ?? navigation;

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [moodNote, setMoodNote] = useState('');

  const toggleComplete = useCallback((id: string) => {
    setScheduleItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'completed' ? ('pending' as const) : ('completed' as const) }
          : item
      )
    );
  }, []);

  const handleMoodSelect = useCallback(async (mood: string) => {
    setSelectedMood(mood);
    await saveChildMood(mood, '');
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#EAE9FB', '#F3F1FB', '#FAF9FC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <MyChildHeader
            child={{ name: 'Zachariah', age: 5, avatarEmoji: '🦕' }}
            onSettingsPress={() => rootNav.navigate('Settings')}
            onChildSelectorPress={() => console.log('child selector')}
          />
          <ChildProfileSnapshot
            child={{
              name: 'Zachariah',
              age: 5,
              avatarEmoji: '🦕',
              communication: 'Gestures, PECS, Single words',
              supportNeeds: 'Transitions, Loud noises, Change',
              sensory: 'Deep pressure, Visual supports',
              todaysFocus: 'Transitions may be difficult today. Visual supports and extra warning time may help.',
            }}
            onEditProfile={() => rootNav.navigate('EditProfile')}
          />
          <TodaysScheduleCard
            items={scheduleItems}
            onAddActivity={() => rootNav.navigate('Schedule', { openAddModal: true })}
            onViewSchedule={() => rootNav.navigate('Schedule')}
            onToggleComplete={toggleComplete}
          />
          <ChildMoodTracker
            childName="Zachariah"
            selectedMood={selectedMood}
            lastMood={{
              mood: 'Hopeful',
              emoji: '😊',
              time: 'Today at 8:30 AM',
              note: 'Had some trouble with the morning transition but did great after using the timer and deep pressure.',
            }}
            onMoodSelect={handleMoodSelect}
            onViewHistory={() => rootNav.navigate('MoodHistory')}
            onNoteChange={setMoodNote}
          />
          <DailyProgressNote
            status="not-started"
            childName="Zachariah"
            onStartNote={() => rootNav.navigate('DailyNote')}
            onContinueNote={() => rootNav.navigate('DailyNote')}
            onViewPastNotes={() => rootNav.navigate('PastNotes')}
          />
          <HelpfulToolsCard
            childName="Zachariah"
            onTransitionTimer={() => rootNav.navigate('TransitionTimer')}
            onShowMe={() => rootNav.navigate('ShowMe')}
            onMeltdownSupport={() => rootNav.navigate('ImmediateSupport')}
          />
          <CareTeamCard
            members={[
              { id: '1', name: 'You', role: 'Parent', initials: 'ME' },
              { id: '2', name: 'Mrs. Lopez', role: 'Teacher', initials: 'ML' },
              { id: '3', name: 'Sarah T.', role: 'Speech', initials: 'ST' },
            ]}
            onViewAll={() => rootNav.navigate('CareTeam')}
            onAddMember={() => rootNav.navigate('AddCareTeamMember')}
          />
          <ProgressSummaryCard
            items={[
              { label: 'Routine completion', value: '14/18', color: Colors.green, progress: 0.78 },
              { label: 'Mood check-ins', value: '4 this week', color: Colors.purple, progress: 0.57 },
              { label: 'Appointments attended', value: '2/3', color: Colors.purple, progress: 0.67 },
              { label: 'Calm tools used', value: '3 times', color: Colors.purple, progress: 0.5 },
              { label: 'Daily notes completed', value: '2 this week', color: '#E07090', progress: 0.4 },
            ]}
            onViewFullProgress={() => rootNav.navigate('ChildProgress')}
          />
          <RecentWinsCard
            wins={[
              { id: '1', emoji: '⭐', label: 'Stayed calm during transition this morning' },
              { id: '2', emoji: '🤝', label: 'Used "Show Me" to ask for a break' },
              { id: '3', emoji: '🗣️', label: 'Completed speech therapy session' },
              { id: '4', emoji: '🍽️', label: 'Tried a new food today!' },
            ]}
            onAddWin={() => rootNav.navigate('AddWin')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9FC' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, gap: 12, paddingBottom: 112 },
});
