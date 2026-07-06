import { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '@firebase/auth';
import { getFirestore, collection, getDocs } from '@firebase/firestore';
import { loadChildProfile, saveChildMood } from '../lib/dataService';
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

type ChildProfile = {
  childName?: string;
  age?: string | number;
  avatarEmoji?: string;
  communication?: string;
  triggers?: string;
  calmingStrategies?: string;
  sensory?: string;
  todaysFocus?: string;
};

type CareTeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

const toDateKey = (d: Date) => d.toISOString().split('T')[0];

const formatScheduleTime = (time: string) => {
  if (/[AP]M/i.test(time)) return time;
  const [h = 0, m = 0] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const loadScheduleItems = async (): Promise<ScheduleItem[]> => {
  const today = toDateKey(new Date());
  const uid = getAuth().currentUser?.uid;

  if (uid) {
    try {
      const snap = await getDocs(collection(getFirestore(), 'users', uid, 'schedule', today, 'items'));
      const items: ScheduleItem[] = [];
      snap.forEach(d => {
        const data = d.data() as any;
        items.push({
          id: d.id,
          time: formatScheduleTime(data.time || ''),
          title: data.title || 'Untitled activity',
          subtitle: data.subtitle,
          type: data.type === 'appointment' ? 'appointment' : 'routine',
          status: data.status || 'pending',
          icon: data.icon || data.emoji || (data.type === 'appointment' ? '📅' : '•'),
        });
      });
      if (items.length > 0) return items.sort((a, b) => a.time.localeCompare(b.time));
    } catch (e) {
      console.log('MyChild schedule load error:', e);
    }
  }

  const local = await AsyncStorage.getItem(`bitzaSchedule_${today}`);
  if (!local) return [];
  return JSON.parse(local).map((item: any) => ({
    ...item,
    time: formatScheduleTime(item.time || ''),
    icon: item.icon || item.emoji || (item.type === 'appointment' ? '📅' : '•'),
  }));
};

const loadCareTeam = async (): Promise<CareTeamMember[]> => {
  const uid = getAuth().currentUser?.uid;

  if (uid) {
    try {
      const snap = await getDocs(collection(getFirestore(), 'users', uid, 'careTeam'));
      const members: CareTeamMember[] = [];
      snap.forEach(d => {
        const data = d.data() as any;
        if (data.name?.trim()) {
          members.push({
            id: d.id,
            name: data.name.trim(),
            role: data.role || 'Care team',
            initials: data.initials || getInitials(data.name),
          });
        }
      });
      if (members.length > 0) return members;
    } catch (e) {
      console.log('MyChild care team load error:', e);
    }
  }

  const local = await AsyncStorage.getItem('bitzaCareTeam');
  return local ? JSON.parse(local).filter((member: CareTeamMember) => member.name?.trim()) : [];
};

export default function MyChildScreen() {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent('RootStack') ?? navigation;

  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [lastMood, setLastMood] = useState<any>(null);
  const [moodNote, setMoodNote] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadScreenData = async () => {
        const [profile, schedule, team, moodRaw] = await Promise.all([
          loadChildProfile(),
          loadScheduleItems(),
          loadCareTeam(),
          AsyncStorage.getItem('bitzaChildMood'),
        ]);

        if (!active) return;
        setChildProfile(profile as ChildProfile | null);
        setScheduleItems(schedule);
        setCareTeam(team);
        setLastMood(moodRaw ? JSON.parse(moodRaw) : null);
      };

      loadScreenData().catch(e => console.log('MyChild data load error:', e));
      return () => {
        active = false;
      };
    }, [])
  );

  const childName = childProfile?.childName?.trim() || 'Your child';
  const childAge = childProfile?.age ? String(childProfile.age) : '';
  const avatarEmoji = childProfile?.avatarEmoji || '♡';

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
            child={{ name: childName, age: childAge, avatarEmoji }}
            onSettingsPress={() => rootNav.navigate('Settings')}
            onChildSelectorPress={() => console.log('child selector')}
          />
          <ChildProfileSnapshot
            child={{
              name: childName,
              age: Number(childProfile?.age) || 0,
              avatarEmoji,
              communication: childProfile?.communication?.trim() || 'Add communication style',
              supportNeeds: childProfile?.triggers?.trim() || 'Add support needs',
              sensory: childProfile?.sensory?.trim() || childProfile?.calmingStrategies?.trim() || 'Add sensory supports',
              todaysFocus: childProfile?.todaysFocus?.trim() || 'Add a focus note for today.',
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
            childName={childName}
            selectedMood={selectedMood}
            lastMood={lastMood}
            onMoodSelect={handleMoodSelect}
            onViewHistory={() => rootNav.navigate('MoodHistory')}
            onNoteChange={setMoodNote}
          />
          <DailyProgressNote
            status="not-started"
            childName={childName}
            onStartNote={() => rootNav.navigate('DailyNote')}
            onContinueNote={() => rootNav.navigate('DailyNote')}
            onViewPastNotes={() => rootNav.navigate('PastNotes')}
          />
          <HelpfulToolsCard
            childName={childName}
            onTransitionTimer={() => rootNav.navigate('TransitionTimer')}
            onShowMe={() => rootNav.navigate('ShowMe')}
            onMeltdownSupport={() => rootNav.navigate('ImmediateSupport')}
          />
          <CareTeamCard
            members={careTeam}
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
