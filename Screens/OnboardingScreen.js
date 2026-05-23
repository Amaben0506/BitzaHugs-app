import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const CHILD_PROFILE_KEY = 'bitzaChildProfile';

const sensoryOptions = [
  { id: 1, label: 'Loud Noises', icon: 'volume-high-outline', color: '#6F4BCB' },
  { id: 2, label: 'Transitions', icon: 'sync-outline', color: '#2F8F83' },
  { id: 3, label: 'Bright Lights', icon: 'sunny-outline', color: '#F6A63A' },
  { id: 4, label: 'Textures', icon: 'hand-left-outline', color: '#F29C8A' },
  { id: 5, label: 'Visuals', icon: 'image-outline', color: '#4FA3B5' },
  { id: 6, label: 'Timers', icon: 'time-outline', color: '#8B7CF6' },
  { id: 7, label: 'Calming Music', icon: 'musical-notes-outline', color: '#6F4BCB' },
  { id: 8, label: 'Quiet Spaces', icon: 'home-outline', color: '#7BA05B' },
];

const caregiverOptions = [
  { id: 1, title: 'Gentle Reminders', text: 'Encouraging nudges', icon: 'notifications-outline', color: '#F29C8A' },
  { id: 2, title: 'Emotional Check-ins', text: 'Daily mood check-ins', icon: 'heart-outline', color: '#F29C8A' },
  { id: 3, title: 'Calming Breaks', text: 'Mindful moments', icon: 'leaf-outline', color: '#7BA05B' },
  { id: 4, title: 'Breathing Support', text: 'Guided breathing', icon: 'water-outline', color: '#60A5FA' },
];

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [selectedSensory, setSelectedSensory] = useState([1, 2, 5, 6]);
  const [selectedCaregiver, setSelectedCaregiver] = useState([1, 2, 3]);

  const saveOnboardingProfile = async () => {
    const sensoryLabels = sensoryOptions
      .filter((option) => selectedSensory.includes(option.id))
      .map((option) => option.label);

    const caregiverLabels = caregiverOptions
      .filter((option) => selectedCaregiver.includes(option.id))
      .map((option) => option.title);

    const profile = {
      childName: childName.trim() || 'Child 1',
      age: '',
      communication: '',
      notes: 'Created during onboarding.',
      sensoryPreferences: sensoryLabels,
      caregiverSupports: caregiverLabels,
    };

    await AsyncStorage.setItem(
      CHILD_PROFILE_KEY,
      JSON.stringify(profile)
    );
  };

  const goNext = async () => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    await saveOnboardingProfile();
    await AsyncStorage.setItem('bitzaOnboardingComplete', 'true');
    navigation.replace('MainTabs');
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const toggleSensory = (id) => {
    setSelectedSensory((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleCaregiver = (id) => {
    setSelectedCaregiver((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {step > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={22} color="#2D2357" />
        </TouchableOpacity>
      )}

      {step === 0 && (
        <View style={styles.screen}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>💜</Text>
          </View>

          <Text style={styles.logoText}>
            Bitza<Text style={styles.logoAccent}>Hugs</Text>
          </Text>

          <Text style={styles.tagline}>
            Little supports for calmer family days.
          </Text>

          <View style={styles.welcomeIllustration}>
            <Ionicons name="heart-circle" size={82} color="#8B7CF6" />
            <Ionicons name="leaf-outline" size={44} color="#7BA05B" />
          </View>

          <Text style={styles.title}>You’re not alone.</Text>

          <Text style={styles.subtitle}>
            Support for the hard moments and the small wins.
          </Text>

          <View style={styles.softCard}>
            <Ionicons name="people-outline" size={26} color="#6F4BCB" />
            <Text style={styles.softCardText}>
              Built for caregivers and families of neurodivergent children.
            </Text>
          </View>

          <PrimaryButton label="Let’s Get Started" onPress={goNext} />
        </View>
      )}

      {step === 1 && (
        <View style={styles.screen}>
          <LogoMini />

          <Text style={styles.title}>Let’s get to know your child</Text>

          <Text style={styles.subtitle}>
            This helps us personalize their experience.
          </Text>

          <View style={styles.childAvatar}>
            <Ionicons name="person-outline" size={54} color="#6F4BCB" />
          </View>

          <InputRow
            icon="person-outline"
            label="Child’s Name"
            placeholder="Enter name"
            value={childName}
            onChangeText={setChildName}
          />

          <SelectRow
            icon="calendar-outline"
            label="Age"
            value="You can add this later"
          />

          <SelectRow
            icon="chatbubble-ellipses-outline"
            label="Communication Style"
            value="You can add this later"
          />

          <View style={styles.noteCard}>
            <Ionicons name="heart-outline" size={26} color="#6F4BCB" />
            <Text style={styles.noteText}>
              You can always edit this later in settings.
            </Text>
          </View>

          <PrimaryButton label="Continue" onPress={goNext} />
        </View>
      )}

      {step === 2 && (
        <View style={styles.screen}>
          <LogoMini />

          <Text style={styles.title}>
            What sensory supports help most?
          </Text>

          <Text style={styles.subtitle}>
            Choose anything that applies. You can change this anytime.
          </Text>

          <View style={styles.optionGrid}>
            {sensoryOptions.map((option) => {
              const selected = selectedSensory.includes(option.id);

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    selected && styles.selectedOptionCard,
                  ]}
                  onPress={() => toggleSensory(option.id)}
                >
                  {selected && (
                    <View style={styles.checkBubble}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}

                  <Ionicons
                    name={option.icon}
                    size={34}
                    color={option.color}
                  />

                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <PrimaryButton label="Continue" onPress={goNext} />
        </View>
      )}

      {step === 3 && (
        <View style={styles.screen}>
          <LogoMini />

          <Text style={styles.title}>You matter too.</Text>

          <Text style={styles.heart}>💜</Text>

          <Text style={styles.subtitle}>
            Caregiver support helps you show up with more calm and confidence.
          </Text>

          <View style={styles.caregiverIllustration}>
            <Ionicons name="person-circle-outline" size={96} color="#8B7CF6" />
            <Ionicons name="leaf-outline" size={42} color="#7BA05B" />
          </View>

          <Text style={styles.questionText}>
            What kind of support would feel helpful for you?
          </Text>

          {caregiverOptions.map((option) => {
            const selected = selectedCaregiver.includes(option.id);

            return (
              <TouchableOpacity
                key={option.id}
                style={styles.supportOption}
                onPress={() => toggleCaregiver(option.id)}
              >
                <View
                  style={[
                    styles.supportIcon,
                    { backgroundColor: `${option.color}22` },
                  ]}
                >
                  <Ionicons name={option.icon} size={22} color={option.color} />
                </View>

                <View style={styles.supportTextBox}>
                  <Text style={styles.supportTitle}>{option.title}</Text>
                  <Text style={styles.supportText}>{option.text}</Text>
                </View>

                <View style={[styles.toggle, selected && styles.toggleOn]}>
                  <View
                    style={[
                      styles.toggleDot,
                      selected && styles.toggleDotOn,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}

          <PrimaryButton label="Continue" onPress={goNext} />
        </View>
      )}

      {step === 4 && (
        <View style={styles.screen}>
          <LogoMini />

          <View style={styles.finishIcon}>
            <Ionicons name="heart" size={54} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Your calm space is ready.</Text>

          <Text style={styles.subtitle}>
            You’ve taken a beautiful step toward a more supported and connected journey.
          </Text>

          <Text style={styles.finishText}>You’ve got this.</Text>

          <View style={styles.finishHouse}>
            <Ionicons name="home" size={88} color="#8B7CF6" />
            <Ionicons name="sparkles" size={32} color="#F6C96F" />
          </View>

          <PrimaryButton label="Enter My Calm Space" onPress={goNext} />
        </View>
      )}

      <View style={styles.dots}>
        {[0, 1, 2, 3, 4].map((dot) => (
          <View
            key={dot}
            style={[styles.dot, step === dot && styles.activeDot]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function LogoMini() {
  return (
    <View style={styles.logoMini}>
      <Text style={styles.logoMiniIcon}>💜</Text>
      <Text style={styles.logoMiniText}>
        Bitza<Text style={styles.logoAccent}>Hugs</Text>
      </Text>
    </View>
  );
}

function PrimaryButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function InputRow({ icon, label, placeholder, value, onChangeText }) {
  return (
    <View style={styles.inputRow}>
      <View style={styles.inputIcon}>
        <Ionicons name={icon} size={24} color="#6F4BCB" />
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#A39BBF"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

function SelectRow({ icon, label, value }) {
  return (
    <View style={styles.inputRow}>
      <View style={styles.inputIcon}>
        <Ionicons name={icon} size={24} color="#6F4BCB" />
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>{label}</Text>

        <View style={styles.selectBox}>
          <Text style={styles.selectText}>{value}</Text>
          <Ionicons name="chevron-down" size={20} color="#2D2357" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 34,
    backgroundColor: '#FFF9F4',
  },

  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 720,
  },

  backButton: {
    position: 'absolute',
    top: 28,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  logoMark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3EAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  logoIcon: {
    fontSize: 42,
  },

  logoText: {
    fontSize: 42,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#101A4D',
  },

  logoAccent: {
    color: '#F27D8B',
  },

  tagline: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: '#101A4D',
    marginTop: 4,
    textAlign: 'center',
  },

  welcomeIllustration: {
    width: '100%',
    height: 190,
    backgroundColor: '#F8F0FF',
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#101A4D',
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: '#2D2357',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
  },

  softCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },

  softCardText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#2D2357',
    lineHeight: 20,
    marginLeft: 12,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    paddingVertical: 17,
    borderRadius: 26,
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Nunito_800ExtraBold',
    marginRight: 10,
  },

  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 8,
    gap: 8,
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D8D3D0',
  },

  activeDot: {
    backgroundColor: '#8B5CF6',
  },

  logoMini: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 34,
  },

  logoMiniIcon: {
    fontSize: 24,
    marginRight: 6,
  },

  logoMiniText: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#101A4D',
  },

  childAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3EAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 24,
  },

  inputRow: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  inputIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#F3EAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  inputBox: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: '#2D2357',
    marginBottom: 6,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#EFE6FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#2D2357',
  },

  selectBox: {
    borderWidth: 1,
    borderColor: '#EFE6FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#7C7892',
  },

  noteCard: {
    width: '100%',
    backgroundColor: '#F8F0FF',
    borderRadius: 24,
    padding: 18,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#2D2357',
    marginLeft: 12,
    lineHeight: 20,
  },

  optionGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 28,
  },

  optionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFE6FF',
  },

  selectedOptionCard: {
    backgroundColor: '#F8F0FF',
    borderColor: '#8B5CF6',
  },

  checkBubble: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionText: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#101A4D',
    marginTop: 12,
  },

  heart: {
    fontSize: 26,
    marginTop: 12,
  },

  caregiverIllustration: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8F0FF',
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },

  questionText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#101A4D',
    textAlign: 'center',
    marginBottom: 12,
  },

  supportOption: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  supportIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  supportTextBox: {
    flex: 1,
  },

  supportTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#101A4D',
  },

  supportText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: '#6E6A86',
    marginTop: 2,
  },

  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D8D3D0',
    padding: 3,
    justifyContent: 'center',
  },

  toggleOn: {
    backgroundColor: '#8B5CF6',
  },

  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },

  toggleDotOn: {
    alignSelf: 'flex-end',
  },

  finishIcon: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 34,
  },

  finishText: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#101A4D',
    marginTop: 28,
  },

  finishHouse: {
    width: '100%',
    height: 200,
    borderRadius: 34,
    backgroundColor: '#F8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
});