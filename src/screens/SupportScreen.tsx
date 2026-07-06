import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '@firebase/auth';
import { getFirestore, collection, getDocs } from '@firebase/firestore';
import { Colors } from '../theme/colors';
import SupportHeader from '../components/support/SupportHeader';
import HugiSupportCards from '../components/support/HugiSupportCards';
import ContactSupportPersonCard from '../components/support/ContactSupportPersonCard';
import SupportNavGrid from '../components/support/SupportNavGrid';
import RecentSupportActivity from '../components/support/RecentSupportActivity';
import SafetyCard from '../components/support/SafetyCard';

const NAV_GRID_ROUTES: Record<string, string> = {
  printables: 'PrintableResources',
  community: 'CaregiverCommunity',
  plan: 'SupportPlan',
  resources: 'HelpfulResources',
};

type SupportContact = {
  id: string;
  name: string;
  role: string;
  initials: string;
  phone?: string;
  email?: string;
  hasPhone: boolean;
  hasMessage: boolean;
  hasEmail: boolean;
  isOnline?: boolean;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const toSupportContact = (id: string, data: any): SupportContact | null => {
  const name = data.name?.trim();
  if (!name) return null;
  const phone = data.phone?.trim();
  const email = data.email?.trim();
  return {
    id,
    name,
    role: data.role?.trim() || 'Support contact',
    initials: data.initials || getInitials(name),
    phone,
    email,
    hasPhone: !!phone,
    hasMessage: !!phone,
    hasEmail: !!email,
    isOnline: false,
  };
};

const loadContacts = async (): Promise<SupportContact[]> => {
  const uid = getAuth().currentUser?.uid;

  if (uid) {
    try {
      const snap = await getDocs(collection(getFirestore(), 'users', uid, 'contacts'));
      const contacts: SupportContact[] = [];
      snap.forEach(d => {
        const contact = toSupportContact(d.id, d.data());
        if (contact) contacts.push(contact);
      });
      if (contacts.length > 0) return contacts;
    } catch (e) {
      console.log('Support contacts Firestore load error:', e);
    }
  }

  const local = await AsyncStorage.getItem('bitzaContacts');
  if (!local) return [];
  return JSON.parse(local)
    .map((contact: any) => toSupportContact(contact.id, contact))
    .filter((contact: SupportContact | null): contact is SupportContact => !!contact);
};

function confirmCall(phone?: string) {
  if (!phone) return;
  Alert.alert('Call', 'This will call your support person. Continue?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
  ]);
}

function confirmMessage(phone?: string) {
  if (!phone) return;
  Alert.alert('Message', 'This will open a text message to your support person. Continue?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Message', onPress: () => Linking.openURL(`sms:${phone}`) },
  ]);
}

function confirmEmail(email?: string) {
  if (!email) return;
  Alert.alert('Email', 'This will open an email to your support person. Continue?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Email', onPress: () => Linking.openURL(`mailto:${email}`) },
  ]);
}

export default function SupportScreen() {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent('RootStack') ?? navigation;
  const [contacts, setContacts] = useState<SupportContact[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadContacts()
        .then(data => {
          if (active) setContacts(data);
        })
        .catch(e => console.log('Support contacts load error:', e));
      return () => {
        active = false;
      };
    }, [])
  );

  const findContact = (id: string) => contacts.find(contact => contact.id === id);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#E8ECFB', '#F1F3FB', '#F9FAFC']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SupportHeader
          onSettingsPress={() => rootNav.navigate('Settings')}
        />
        <View style={styles.content}>
          <HugiSupportCards
            onTalkToHugi={() => rootNav.navigate('HugiChat')}
            onContinueChat={() => rootNav.navigate('HugiChat')}
            onGetHelpNow={() => rootNav.navigate('ImmediateSupport')}
            onViewSupportOptions={() => rootNav.navigate('ImmediateSupport')}
          />
          <ContactSupportPersonCard
            contacts={contacts}
            onCall={(id) => confirmCall(findContact(id)?.phone)}
            onMessage={(id) => confirmMessage(findContact(id)?.phone)}
            onEmail={(id) => confirmEmail(findContact(id)?.email)}
            onAddContact={() => rootNav.navigate('AddContact')}
            onViewAll={() => rootNav.navigate('AllContacts')}
          />
          <SupportNavGrid
            onItemPress={(id) => {
              const route = NAV_GRID_ROUTES[id];
              if (route) rootNav.navigate(route);
            }}
          />
          <RecentSupportActivity
            items={[
              { id: '1', emoji: '💬', label: 'Talked to Hugi', sublabel: 'Today at 8:30 AM', backgroundColor: '#EDE0FF' },
              { id: '2', emoji: '🤝', label: 'Used support', sublabel: 'Today at 7:45 AM', backgroundColor: '#FFF0F4' },
              { id: '3', emoji: '🖨️', label: 'Downloaded schedule', sublabel: 'Yesterday', backgroundColor: '#F0EAFF' },
              { id: '4', emoji: '👥', label: 'Community post', sublabel: 'May 12', backgroundColor: '#F0F8F0' },
            ]}
            onViewAll={() => rootNav.navigate('SupportActivity')}
          />
          <SafetyCard
            onSafetyInfo={() => rootNav.navigate('SafetyInfo')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFC' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, gap: 12, paddingBottom: 112 },
});
