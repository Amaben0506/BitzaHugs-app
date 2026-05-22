import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const sounds = [
  { id: 1, title: "Soft Rain", icon: "rainy-outline", color: "#60A5FA", bg: "#E7F4FF", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Forest Calm", icon: "leaf-outline", color: "#78A866", bg: "#EEF7E8", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Ocean Waves", icon: "water-outline", color: "#4C9ED9", bg: "#E7F4FF", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 4, title: "Night Wind", icon: "moon-outline", color: "#8B5BE8", bg: "#F0E2FF", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 5, title: "Campfire", icon: "bonfire-outline", color: "#D99A3D", bg: "#FFF0DF", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id: 6, title: "White Noise", icon: "radio-outline", color: "#837E96", bg: "#F5F0FF", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
];

export default function SoundsScreen({ navigation }) {
  const soundRef = useRef(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ Track calm tool use for Calm Champion badge
  useEffect(() => {
    const track = async () => {
      try {
        const current = await AsyncStorage.getItem("bitzaCalmToolUses");
        const count = current ? parseInt(current) : 0;
        await AsyncStorage.setItem("bitzaCalmToolUses", String(count + 1));
      } catch (e) { console.log("Error tracking calm tool:", e); }
    };
    track();
  }, []);

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    };
    setupAudio();
    return () => { stopSound(); };
  }, []);

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
  };

  const playSound = async () => {
    if (!selectedSound) return;
    try {
      await stopSound();
      const chosen = sounds.find((s) => s.id === selectedSound);
      const { sound } = await Audio.Sound.createAsync(
        { uri: chosen.url },
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (e) {
      console.log("Error playing sound:", e);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) await stopSound();
    else await playSound();
  };

  const handleSelect = (id) => {
    stopSound();
    setSelectedSound(id);
  };

  const currentSound = sounds.find((s) => s.id === selectedSound);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calming Sounds</Text>
          <View style={styles.circleButton}>
            <Ionicons name="headset-outline" size={20} color="#2B2463" />
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Ionicons name="musical-notes-outline" size={36} color="#7548D8" />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Choose a calming sound</Text>
            <Text style={styles.heroSubtitle}>Gentle sounds can help create a softer space during stressful moments.</Text>
          </View>
        </View>

        {/* Sound Grid */}
        <View style={styles.soundGrid}>
          {sounds.map((sound) => {
            const active = selectedSound === sound.id;
            return (
              <TouchableOpacity
                key={sound.id}
                style={[styles.soundCard, { backgroundColor: sound.bg }, active && styles.activeSoundCard]}
                onPress={() => handleSelect(sound.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.soundIconCircle, { backgroundColor: `${sound.color}22` }]}>
                  <Ionicons name={sound.icon} size={26} color={sound.color} />
                </View>
                <Text style={styles.soundTitle}>{sound.title}</Text>
                <Text style={[styles.soundStatus, active && styles.soundStatusActive]}>
                  {active ? "Selected ✓" : "Tap to select"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Player Card */}
        <View style={styles.playerCard}>
          <View style={styles.playerTop}>
            <View style={styles.playerIconBubble}>
              <Ionicons
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={40}
                color={isPlaying ? "#8B5BE8" : "#C5B8E8"}
              />
            </View>
            <View style={styles.playerTextWrap}>
              <Text style={styles.playerTitle}>
                {currentSound ? currentSound.title : "No sound selected"}
              </Text>
              <Text style={styles.playerSubtitle}>
                {currentSound
                  ? isPlaying
                    ? "Playing now — let it create a softer space."
                    : "Tap play when you're ready."
                  : "Choose a sound above to begin."}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, !selectedSound && styles.disabledButton]}
            onPress={handlePlayPause}
            disabled={!selectedSound}
            activeOpacity={0.88}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{isPlaying ? "Stop Sound" : "Play Sound"}</Text>
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="heart-outline" size={20} color="#6F42D8" />
          <Text style={styles.tipText}>
            Even 2–3 minutes of calming sound can help your nervous system soften.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 16,
    paddingBottom: 100,
  },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  circleButton: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E3D2F8",
  },
  headerTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  heroCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 12, shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroSubtitle: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  soundGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginBottom: 12 },
  soundCard: {
    width: "47%", padding: 14, borderRadius: 18, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
  },
  activeSoundCard: { borderWidth: 2, borderColor: "#8B5BE8" },
  soundIconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  soundTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", textAlign: "center", marginBottom: 3 },
  soundStatus: { color: "#837E96", fontSize: 10, fontWeight: "600" },
  soundStatusActive: { color: "#6F42D8", fontWeight: "800" },

  playerCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC",
    padding: 14, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  playerTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  playerIconBubble: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  playerTextWrap: { flex: 1 },
  playerTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 3 },
  playerSubtitle: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  primaryButton: {
    height: 46, borderRadius: 14, backgroundColor: "#7548D8",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  disabledButton: { backgroundColor: "#C9C2E8" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  tipCard: {
    backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1,
    borderColor: "#E3D2F8", padding: 12, flexDirection: "row", alignItems: "center", gap: 10,
  },
  tipText: { flex: 1, color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "600" },
});
