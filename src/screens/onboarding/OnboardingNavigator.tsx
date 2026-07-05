import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './WelcomeScreen';
import CaregiverSetupScreen from './CaregiverSetupScreen';
import ChildSetupScreen from './ChildSetupScreen';
import SupportSetupScreen from './SupportSetupScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  const navigation = useNavigation<any>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = async () => {
      const val = await AsyncStorage.getItem('bitzaOnboardingComplete');
      if (val === 'true') {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        setReady(true);
      }
    };
    check().catch(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
      <Stack.Screen name="CaregiverSetup" component={CaregiverSetupScreen} />
      <Stack.Screen name="ChildSetup" component={ChildSetupScreen} />
      <Stack.Screen name="SupportSetup" component={SupportSetupScreen} />
    </Stack.Navigator>
  );
}
