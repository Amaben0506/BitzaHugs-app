import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, ScrollView, Platform, KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import Constants from "expo-constants";
import { createAccount, signInWithApple } from "../src/lib/firebase";

export default function CreateAccountScreen({ navigation }) {
  const [mode, setMode] = useState("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSkip = async () => {
    await AsyncStorage.setItem("bitzaAccountPromptSeen", "true");
    navigation.replace("MainTabs");
  };

  const handleEmailSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Please enter your email and a password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const { user, error } = await createAccount(email.trim(), password, name.trim());
      if (error) { Alert.alert("Couldn't create account", error); return; }
      await AsyncStorage.setItem("bitzaAccountCreated", "true");
      await AsyncStorage.setItem("bitzaAccountPromptSeen", "true");
      navigation.replace("MainTabs");
    } catch (e) {
      Alert.alert("Something went wrong", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString()
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });
      const { user, error } = await signInWithApple(credential.identityToken, nonce);
      if (error) { Alert.alert("Apple sign-in failed", error); return; }
      await AsyncStorage.setItem("bitzaAccountCreated", "true");
      await AsyncStorage.setItem("bitzaAccountPromptSeen", "true");
      navigation.replace("MainTabs");
    } catch (e) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Something went wrong", "Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#F0E2FF", "#FFF9F2"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoWrap}>
              <Text style={styles.logoText}>
                <Text style={styles.logoBitza}>Bitza</Text>
                <Text style={styles.logoHugs}>Hugs</Text>
              </Text>
            </View>

            <View style={styles.iconWrap}>
              <Text style={styles.iconEmoji}>🔐</Text>
            </View>

            <Text style={styles.headline}>Save your progress</Text>
            <Text style={styles.subtext}>
              Create a free account to keep your data safe across devices and protect your Premium access if you ever upgrade.
            </Text>

            <View style={styles.benefitsCard}>
              {[
                { icon: "cloud", text: "Your data syncs across all your devices" },
                { icon: "shield", text: "Premium access stays with your account — never lost on reinstall" },
                { icon: "users", text: "Share your child's profile with teachers & therapists" },
                { icon: "lock", text: "Your data is private and never sold" },
              ].map((b, i) => (
                <View key={i} style={[styles.benefitRow, i === 3 && { borderBottomWidth: 0 }]}>
                  <View style={styles.benefitIcon}>
                    <Feather name={b.icon} size={15} color="#7548D8" />
                  </View>
                  <Text style={styles.benefitText}>{b.text}</Text>
                </View>
              ))}
            </View>

            {mode === "options" ? (
              <>
                {Platform.OS === "ios" && !Constants.appOwnership && (
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={16}
                    style={styles.appleBtn}
                    onPress={handleAppleSignIn}
                  />
                )}
                <TouchableOpacity
                  style={styles.emailBtn}
                  onPress={() => setMode("email")}
                  activeOpacity={0.88}
                  disabled={isLoading}
                >
                  <Feather name="mail" size={18} color="#FFFFFF" />
                  <Text style={styles.emailBtnText}>Sign up with Email</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.backBtn} onPress={() => setMode("options")} activeOpacity={0.85}>
                  <Feather name="arrow-left" size={16} color="#7548D8" />
                  <Text style={styles.backBtnText}>Other options</Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Your name (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Sarah"
                  placeholderTextColor="#B0A8C8"
                  autoCapitalize="words"
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#B0A8C8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#B0A8C8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#837E96" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.emailBtn, isLoading && { opacity: 0.6 }]}
                  onPress={handleEmailSignUp}
                  activeOpacity={0.88}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.emailBtnText}>Create Free Account</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.75}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              By creating an account you agree to our{" "}
              <Text style={styles.footerLink}>Privacy Policy</Text>.{"\n"}Your data is never sold. Ever.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60, alignItems: "center" },
  logoWrap: { marginBottom: 8 },
  logoText: { fontSize: 28, fontWeight: "900" },
  logoBitza: { color: "#2B2463" },
  logoHugs: { color: "#7548D8" },
  iconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 1.5, borderColor: "#E3D2F8" },
  iconEmoji: { fontSize: 40 },
  headline: { fontSize: 28, fontWeight: "900", color: "#2B2463", textAlign: "center", marginBottom: 8 },
  subtext: { fontSize: 14, color: "#5B5672", textAlign: "center", lineHeight: 22, fontWeight: "500", marginBottom: 20 },
  benefitsCard: { width: "100%", backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 14, paddingVertical: 4, marginBottom: 22 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F0E8E2" },
  benefitIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  benefitText: { flex: 1, color: "#2B2463", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  appleBtn: { width: "100%", height: 52, marginBottom: 10 },
  emailBtn: { width: "100%", height: 52, borderRadius: 16, backgroundColor: "#7548D8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 },
  emailBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginBottom: 16, paddingVertical: 4 },
  backBtnText: { color: "#7548D8", fontSize: 13, fontWeight: "700" },
  inputLabel: { alignSelf: "flex-start", color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 6 },
  input: { width: "100%", height: 50, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E3D2F8", paddingHorizontal: 14, fontSize: 15, color: "#2B2463", fontWeight: "600", marginBottom: 14 },
  passwordWrap: { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E3D2F8", marginBottom: 20 },
  passwordInput: { flex: 1, height: 50, paddingHorizontal: 14, fontSize: 15, color: "#2B2463", fontWeight: "600" },
  eyeBtn: { paddingHorizontal: 14 },
  skipBtn: { paddingVertical: 14, marginTop: 4 },
  skipText: { color: "#837E96", fontSize: 13, fontWeight: "700" },
  footerText: { color: "#A0A0C0", fontSize: 11, textAlign: "center", lineHeight: 17, marginTop: 8 },
  footerLink: { color: "#7548D8", fontWeight: "700" },
});
