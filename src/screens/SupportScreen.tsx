import { Alert, Linking } from 'react-native';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
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

function confirmCall(phone: string) {
  Alert.alert('Call', 'This will call your support person. Continue?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
  ]);
}

function confirmMessage(phone: string) {
  Alert.alert('Message', 'This will open a text message to your support person. Continue?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Message', onPress: () => Linking.openURL(`sms:${phone}`) },
  ]);
}

function confirmEmail(email: string) {
  Alert.alert('Email', 'This will open an email to your support person. Continue?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Email', onPress: () => Linking.openURL(`mailto:${email}`) },
  ]);
}

export default function SupportScreen() {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent('RootStack') ?? navigation;

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
            contacts={[
              { id: '1', name: 'Bret', role: 'Partner', initials: 'BR', hasPhone: true, hasMessage: true, hasEmail: false, isOnline: true },
              { id: '2', name: 'Mom', role: 'Family', initials: 'MO', hasPhone: true, hasMessage: true, hasEmail: false },
              { id: '3', name: 'Mrs. Lopez', role: 'Teacher', initials: 'ML', hasPhone: true, hasMessage: false, hasEmail: true },
              { id: '4', name: 'Sarah T.', role: 'Speech Therapist', initials: 'ST', hasPhone: true, hasMessage: true, hasEmail: false },
            ]}
            onCall={() => confirmCall('+15550000000')}
            onMessage={() => confirmMessage('+15550000000')}
            onEmail={() => confirmEmail('support@example.com')}
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
              { id: '5', emoji: '📞', label: 'Contacted Bret', sublabel: 'May 11', backgroundColor: '#EEF4FF' },
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
