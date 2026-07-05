import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Animated, Easing, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const HUGI = require('../../assets/icons/Hugi-Bunny.png');

const DURATIONS = [1, 2, 3, 5, 10, 15];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const RADIUS = 96;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TransitionTimerScreen() {
  const navigation = useNavigation<any>();

  const [mode, setMode] = useState<'setup' | 'timer' | 'complete'>('setup');
  const [selectedDuration, setSelectedDuration] = useState(5); // minutes
  const [isCustom, setIsCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [currentActivity, setCurrentActivity] = useState('');
  const [nextActivity, setNextActivity] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  // Timer countdown
  useEffect(() => {
    if (mode !== 'timer' || isPaused) return;
    if (timeLeft <= 0) {
      setMode('complete');
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, timeLeft, isPaused]);

  // Progress ring animation
  useEffect(() => {
    if (mode !== 'timer') return;
    const progress = totalTime > 0 ? timeLeft / totalTime : 1;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 900,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, mode, totalTime]);

  // Gentle pulse loop while timer is running
  useEffect(() => {
    if (mode !== 'timer') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [mode]);

  // Sparkle fade-in on complete
  useEffect(() => {
    if (mode !== 'complete') return;
    sparkleAnims.forEach(v => v.setValue(0));
    const anims = sparkleAnims.map((v, i) =>
      Animated.timing(v, { toValue: 1, duration: 600, delay: i * 220, useNativeDriver: true })
    );
    Animated.stagger(150, anims).start();
  }, [mode]);

  const handleStart = () => {
    if (!currentActivity.trim() || !nextActivity.trim()) {
      Alert.alert('Almost ready', 'Please fill in both activities before starting the timer.');
      return;
    }
    let minutes = selectedDuration;
    if (isCustom) {
      const parsed = parseInt(customMinutes, 10);
      if (!parsed || parsed <= 0) {
        Alert.alert('Invalid time', 'Please enter a custom time in minutes.');
        return;
      }
      minutes = parsed;
    }
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setIsPaused(false);
    progressAnim.setValue(1);
    setMode('timer');
  };

  const handleExit = () => {
    setMode('setup');
    setIsPaused(false);
  };

  const handleStartAnother = () => {
    setCurrentActivity('');
    setNextActivity('');
    setIsCustom(false);
    setCustomMinutes('');
    setMode('setup');
  };

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  // ─── SETUP MODE ─────────────────────────────────────────────────────────────
  if (mode === 'setup') {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.header}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Transition Timer</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={s.hugiWrap}>
            <View style={s.hugiCircle}>
              <Image source={HUGI} style={s.hugiImg} resizeMode="contain" />
            </View>
          </View>
          <Text style={s.setupTitle}>Let's get ready for what's next</Text>

          <View style={s.card}>
            <Text style={s.cardLabel}>How much time?</Text>
            <View style={s.durationRow}>
              {DURATIONS.map(min => {
                const active = !isCustom && selectedDuration === min;
                return (
                  <TouchableOpacity
                    key={min}
                    style={[s.durationChip, active && s.durationChipActive]}
                    onPress={() => { setSelectedDuration(min); setIsCustom(false); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.durationChipText, active && s.durationChipTextActive]}>{min} min</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[s.durationChip, s.customChip, isCustom && s.durationChipActive]}
                onPress={() => setIsCustom(true)}
                activeOpacity={0.8}
              >
                <Text style={[s.durationChipText, isCustom && s.durationChipTextActive]}>Custom</Text>
              </TouchableOpacity>
            </View>
            {isCustom && (
              <TextInput
                style={[s.input, { marginTop: 10 }]}
                value={customMinutes}
                onChangeText={text => setCustomMinutes(text.replace(/[^0-9]/g, ''))}
                placeholder="Enter minutes"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
              />
            )}
          </View>

          <View style={s.card}>
            <Text style={s.fieldLabel}>WE ARE FINISHING:</Text>
            <TextInput
              style={s.input}
              value={currentActivity}
              onChangeText={setCurrentActivity}
              placeholder="e.g. playing outside"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={s.divider} />
            <Text style={s.fieldLabel}>NEXT WE WILL:</Text>
            <TextInput
              style={s.input}
              value={nextActivity}
              onChangeText={setNextActivity}
              placeholder="e.g. eating lunch"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={s.startBtnText}>Start Timer ▶</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── TIMER MODE ─────────────────────────────────────────────────────────────
  if (mode === 'timer') {
    return (
      <SafeAreaView style={s.timerSafe} edges={['top', 'bottom']}>
        <View style={s.timerTopBar}>
          <TouchableOpacity style={s.exitBtn} onPress={handleExit} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={Colors.purple} />
          </TouchableOpacity>
          <TouchableOpacity style={s.pauseBtn} onPress={() => setIsPaused(p => !p)} activeOpacity={0.7}>
            <Ionicons name={isPaused ? 'play' : 'pause'} size={18} color={Colors.purple} />
          </TouchableOpacity>
        </View>

        <Text style={s.timerLabel}>Now finishing:</Text>
        <Text style={s.timerActivity}>{currentActivity}</Text>

        <Animated.View style={[s.ringWrap, { transform: [{ scale: pulseAnim }] }]}>
          <Svg width={220} height={220}>
            <Circle
              cx={110}
              cy={110}
              r={RADIUS}
              stroke="#D8C8F0"
              strokeWidth={12}
              fill="none"
            />
            <AnimatedCircle
              cx={110}
              cy={110}
              r={RADIUS}
              stroke={Colors.purple}
              strokeWidth={12}
              fill="none"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation={-90}
              originX={110}
              originY={110}
            />
          </Svg>
          <View style={s.ringCenter}>
            <Image source={HUGI} style={s.ringHugi} resizeMode="contain" />
            <Text style={s.ringTime}>{formatTime(timeLeft)}</Text>
          </View>
        </Animated.View>

        <Text style={s.timerLabel}>Getting ready for:</Text>
        <Text style={s.timerActivityNext}>{nextActivity}</Text>
      </SafeAreaView>
    );
  }

  // ─── COMPLETE MODE ──────────────────────────────────────────────────────────
  const sparklePositions = [
    { top: 40, left: 40 },
    { top: 60, left: '75%' as any },
    { top: 140, left: 30 },
  ];

  return (
    <SafeAreaView style={s.timerSafe} edges={['top', 'bottom']}>
      <View style={s.completeWrap}>
        {sparkleAnims.map((anim, i) => (
          <Animated.Text
            key={i}
            style={[
              s.sparkle,
              sparklePositions[i],
              { opacity: anim, transform: [{ scale: anim }] },
            ]}
          >
            ✨
          </Animated.Text>
        ))}

        <Text style={s.celebrateEmoji}>🌟</Text>
        <Text style={s.completeTitle}>All done!</Text>
        <Text style={s.completeNext}>Time for {nextActivity}!</Text>
        <Image source={HUGI} style={s.completeHugi} resizeMode="contain" />

        <TouchableOpacity style={s.startBtn} onPress={handleStartAnother} activeOpacity={0.85}>
          <Text style={s.startBtnText}>Start another timer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={s.secondaryBtnText}>All done, go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

  scroll: { padding: 16, paddingBottom: 40, gap: 12 },

  hugiWrap: { alignItems: 'center', marginTop: 8 },
  hugiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hugiImg: { width: 80, height: 80 },

  setupTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    paddingHorizontal: 16,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 10,
  },

  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationChip: {
    width: 50,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: Colors.navActiveBg,
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  durationChipText: { fontSize: 13, color: Colors.textSecondary },
  durationChipTextActive: { color: Colors.purple, fontWeight: '600' },
  customChip: { width: 66 },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.pageBg,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.cardBorder,
    marginVertical: 14,
  },

  startBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '500' },

  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  secondaryBtnText: { color: Colors.purple, fontSize: 16, fontWeight: '500' },

  // Timer mode
  timerSafe: { flex: 1, backgroundColor: '#EDE3FF' },
  timerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  exitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  timerActivity: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
  timerActivityNext: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
  ringWrap: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ringHugi: { width: 80, height: 80 },
  ringTime: {
    fontSize: 32,
    fontWeight: '500',
    color: Colors.textPrimary,
  },

  // Complete mode
  completeWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 4,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 28,
  },
  celebrateEmoji: { fontSize: 64 },
  completeTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  completeNext: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  completeHugi: {
    width: 100,
    height: 100,
    marginTop: 20,
    marginBottom: 12,
  },
});
