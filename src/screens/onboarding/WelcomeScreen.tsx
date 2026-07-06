import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme/colors';

function Sparkle({ size, color, style }: { size: number; color: string; style: object }) {
  return (
    <View style={[{ position: 'absolute', width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

function ProgressDots({ total, active }: { total: number; active: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[s.dot, i === active ? s.dotActive : s.dotInactive]}
        />
      ))}
    </View>
  );
}

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const rootNavigation = navigation.getParent('RootStack') ?? navigation;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Sparkles */}
      <Sparkle size={14} color="#B8A0E0" style={{ top: 52, left: 32, opacity: 0.7 }} />
      <Sparkle size={10} color="#C8B0F0" style={{ top: 90, right: 44, opacity: 0.5 }} />
      <Sparkle size={8}  color="#A090D0" style={{ top: 180, left: 24, opacity: 0.4 }} />
      <Sparkle size={16} color="#D0C0F0" style={{ top: 220, right: 36, opacity: 0.55 }} />
      <Sparkle size={10} color="#C0B0E8" style={{ top: 320, left: 56, opacity: 0.35 }} />
      <Sparkle size={12} color="#B8A8E8" style={{ top: 360, right: 28, opacity: 0.45 }} />
      <Sparkle size={8}  color="#C8B8F0" style={{ bottom: 240, left: 40, opacity: 0.4 }} />
      <Sparkle size={14} color="#A8A0D8" style={{ bottom: 180, right: 50, opacity: 0.35 }} />

      {/* Center: illustration + copy */}
      <View style={s.center}>
        <View style={s.glowCircle}>
          <Image
            source={require('../../../assets/icons/Hugi-Bunny.png')}
            style={s.hugi}
            resizeMode="contain"
          />
        </View>
        <Text style={s.title}>Hi, I'm Hugi.</Text>
        <Text style={s.subtitle}>
          I'm here to support you and your family — through the hard moments and the small wins.
        </Text>
      </View>

      {/* Bottom: progress + CTA */}
      <View style={s.bottom}>
        <ProgressDots total={4} active={0} />
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => navigation.navigate('CaregiverSetup')}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnText}>Let's get started</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.linkRow}
          onPress={() => rootNavigation.navigate('Account', { initialMode: 'signin' })}
          activeOpacity={0.7}
        >
          <Text style={s.link}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.heroBg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  glowCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B7ACC',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  hugi: {
    width: 110,
    height: 110,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.purple,
    width: 22,
  },
  dotInactive: {
    backgroundColor: Colors.grayLavender,
  },
  primaryBtn: {
    backgroundColor: Colors.primaryPlum,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  linkRow: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  link: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
