import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getFunctions, httpsCallable } from "firebase/functions";

import {
  app,
  auth,
  signOutUser,
  createAccount,
  signInWithEmail,
  resetPassword,
} from "../src/lib/firebase";

import Card from "../src/components/ui/Card";
import PressableScale from "../src/components/ui/PressableScale";
import ScreenHeader from "../src/components/ui/ScreenHeader";
import PrimaryButton from "../src/components/ui/PrimaryButton";
import SecondaryButton from "../src/components/ui/SecondaryButton";
import { Colors, Fonts, Type, Spacing, Radius, Shadows } from "../src/theme/theme";

// Colors that don't exist in the design system token set
const C = {
  green: "#4C9B63",
  greenSoft: "#EDF8EF",
  greenBorder: "#CBE6D0",
  blue: "#4C94C9",
  blueSoft: "#EAF5FD",
  coral: "#D96D61",
  coralSoft: "#FFF1ED",
};

const functions = getFunctions(app);

const deleteAccountAndData = async () => {
  const callable = httpsCallable(functions, "deleteAccountAndData");
  const result = await callable();
  return result.data;
};

export default function AccountScreen({ navigation }) {
  const [user, setUser] = useState(auth.currentUser);
  const [mode, setMode] = useState("main");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const statusTimerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setUser(auth.currentUser);

      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
      });

      return unsubscribe;
    }, [])
  );

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  const showStatus = (message) => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }

    setStatusMsg(message);

    statusTimerRef.current = setTimeout(() => {
      setStatusMsg("");
    }, 3500);
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setPassword("");
    setShowPassword(false);
    setStatusMsg("");
  };

  const handleSignIn = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter your email address and password."
      );
      return;
    }

    setIsLoading(true);

    try {
      const { user: signedInUser, error } = await signInWithEmail(
        cleanEmail,
        password
      );

      if (error) {
        Alert.alert("Unable to sign in", error);
        return;
      }

      await AsyncStorage.setItem("bitzaAccountCreated", "true");
      await AsyncStorage.setItem("bitzaAccountPromptSeen", "true");

      setUser(signedInUser);
      setPassword("");
      setMode("main");

      showStatus("Welcome back! You're signed in. 💜");
    } catch (error) {
      console.error("Sign-in error:", error);

      Alert.alert(
        "Unable to sign in",
        "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !password.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter your email address and create a password."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password too short",
        "Your password must contain at least 6 characters."
      );
      return;
    }

    setIsLoading(true);

    try {
      const { user: createdUser, error } = await createAccount(
        cleanEmail,
        password,
        cleanName
      );

      if (error) {
        Alert.alert("Unable to create account", error);
        return;
      }

      await AsyncStorage.setItem("bitzaAccountCreated", "true");
      await AsyncStorage.setItem("bitzaAccountPromptSeen", "true");

      setUser(createdUser);
      setPassword("");
      setMode("main");

      showStatus("Your BitzaHugs account is ready! 💜");
    } catch (error) {
      console.error("Sign-up error:", error);

      Alert.alert(
        "Unable to create account",
        "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert(
        "Enter your email",
        "Please enter the email address connected to your account."
      );
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(cleanEmail);

      if (error) {
        Alert.alert("Reset failed", error);
        return;
      }

      Alert.alert(
        "Check your inbox 💜",
        "We sent you a link to reset your password."
      );

      setMode("signin");
    } catch (error) {
      console.error("Password reset error:", error);

      Alert.alert(
        "Reset failed",
        "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign out of BitzaHugs?",
      "Your locally saved information will remain on this device.",
      [
        {
          text: "Stay Signed In",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOutUser();

              await AsyncStorage.multiRemove([
                "bitzaIsPremium",
                "bitzaAccountCreated",
                "bitzaAccountPromptSeen",
              ]);

              setUser(null);
              setMode("main");
              setEmail("");
              setPassword("");
              setName("");

              showStatus("You've been signed out.");
            } catch (error) {
              console.error("Sign-out error:", error);

              Alert.alert(
                "Unable to sign out",
                "Something went wrong. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // ─── Delete Account helpers ──────────────────────────────────────────────────

  const clearLocalData = async () => {
    await AsyncStorage.multiRemove([
      "bitzaIsPremium",
      "bitzaAccountCreated",
      "bitzaAccountPromptSeen",
      "bitzaNotificationPreferences",
      "bitzaNotificationsMaster",
      "bitzaAppointments",
    ]);
  };

  const finaliseDelete = async () => {
    await clearLocalData();
    setUser(null);
    setMode("main");
    setEmail("");
    setPassword("");
    setName("");
    showStatus("Your account has been deleted.");
  };

  const confirmDelete = async () => {
    if (!auth.currentUser?.uid) return;
    setIsDeleting(true);
    try {
      const result = await deleteAccountAndData();
      if (!result?.success) {
        Alert.alert("Unable to delete", "Something went wrong. Please try again.");
        return;
      }
      await finaliseDelete();
    } catch (e) {
      console.error("Delete error:", e);
      Alert.alert("Unable to delete", e?.message || "Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete your account?",
      "This permanently removes your BitzaHugs account and your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ]
    );
  };

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split("@")?.[0] ||
    "BitzaHugs Caregiver";

  const avatarInitial = displayName.slice(0, 1).toUpperCase();

  const screenTitle =
    mode === "signin"
      ? "Welcome Back"
      : mode === "signup"
      ? "Create Account"
      : mode === "reset"
      ? "Reset Password"
      : "Your Account";

  const formDescription =
    mode === "signin"
      ? "Sign in to continue your BitzaHugs journey."
      : mode === "signup"
      ? "Create a free account to keep your supports connected."
      : "Enter your email and we'll send you a reset link.";

  const handleBackPress = () => {
    if (mode === "main") {
      navigation.goBack();
      return;
    }

    changeMode("main");
  };

  const renderStatusBanner = () => {
    if (!statusMsg) return null;
    return (
      <View style={styles.statusBanner}>
        <View style={styles.statusIcon}>
          <Feather name="check" size={14} color="#FFFFFF" />
        </View>
        <Text style={styles.statusText}>{statusMsg}</Text>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SIGNED-IN VIEW
  // ─────────────────────────────────────────────────────────────────────────────

  if (user?.uid && !user.isAnonymous) {
    return (
      <SafeAreaView style={styles.safe}>
        <LinearGradient
          colors={["#EEE8F5", "#F5F0FA", "#FDFBFF"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ScreenHeader
          title="Your Account"
          onBack={handleBackPress}
          style={styles.headerBg}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          {renderStatusBanner()}

          {/* Profile Hero */}
          <Card tint="lavender" style={styles.profileHero}>
            <View style={styles.heroGlowLarge} />
            <View style={styles.heroGlowSmall} />

            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
              <View style={styles.onlineIndicator}>
                <Feather name="check" size={11} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.welcomeLabel}>Welcome back</Text>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.emailText}>{user.email}</Text>

            <View style={styles.accountActiveBadge}>
              <View style={styles.accountActiveDot} />
              <Text style={styles.accountActiveText}>Account active</Text>
            </View>
          </Card>

          {/* Sync Card */}
          <Card style={styles.syncCard}>
            <View style={styles.syncIconWrap}>
              <Feather name="cloud" size={21} color={C.green} />
            </View>
            <View style={styles.cardTextContainer}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Connected Care</Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Keep your routines, child supports, mood history, and caregiver
                tools connected to your BitzaHugs account.
              </Text>
            </View>
          </Card>

          <Text style={styles.sectionLabel}>Account Information</Text>

          {/* Details Card */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailsHeading}>
              <View style={styles.detailsHeadingIcon}>
                <Feather name="user" size={18} color={Colors.purple} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.detailsTitle}>Account Details</Text>
                <Text style={styles.detailsSubtitle}>
                  Your basic BitzaHugs profile information
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <DetailRow icon="smile" label="Name" value={user.displayName || "Not set"} />
            <DetailRow icon="mail" label="Email" value={user.email || "Not available"} />
            <DetailRow icon="calendar" label="Member since" value={memberSince} isLast />
          </Card>

          <Text style={styles.sectionLabel}>Your BitzaHugs Access</Text>

          {/* Desktop / Portal Card */}
          <PressableScale
            onPress={() =>
              Alert.alert(
                "Caregiver Portal 💜",
                "Visit bitzahugs.com/login from any browser to access your caregiver portal."
              )
            }
          >
            <Card style={styles.desktopCard}>
              <View style={styles.desktopIconWrap}>
                <Feather name="monitor" size={22} color={C.blue} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.desktopTitle}>Open the Caregiver Portal</Text>
                <Text style={styles.desktopDescription}>
                  Visit bitzahugs.com/login to manage supports, export
                  information, and print family resources.
                </Text>
                <View style={styles.desktopLinkRow}>
                  <Text style={styles.desktopLink}>bitzahugs.com/login</Text>
                  <Feather name="arrow-up-right" size={14} color={C.blue} />
                </View>
              </View>
              <View style={styles.chevronCircle}>
                <Feather name="chevron-right" size={17} color={C.blue} />
              </View>
            </Card>
          </PressableScale>

          {/* Privacy Note */}
          <Card tint="lavender" style={styles.privacyNote}>
            <View style={styles.privacyNoteIcon}>
              <Feather name="heart" size={16} color={Colors.purple} />
            </View>
            <Text style={styles.privacyNoteText}>
              Your family information is treated with care and is never sold.
            </Text>
          </Card>

          {/* Sign Out */}
          <PressableScale style={styles.signOutButton} onPress={handleSignOut}>
            <Feather name="log-out" size={18} color={C.coral} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </PressableScale>

          {/* Delete Account */}
          <PressableScale
            style={[styles.signOutButton, styles.deleteAccountButton]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <Feather name="trash-2" size={18} color="#C03060" />
            <Text style={styles.deleteAccountText}>
              {isDeleting ? "Deleting…" : "Delete Account"}
            </Text>
          </PressableScale>

          <Text style={styles.footerText}>
            Your locally saved information remains on this device after signing
            out.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SIGNED-OUT VIEW
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#EEE8F5", "#F5F0FA", "#FDFBFF"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScreenHeader
        title={screenTitle}
        onBack={handleBackPress}
        style={styles.headerBg}
      />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {renderStatusBanner()}

          {mode === "main" && (
            <>
              {/* Signed-out hero artwork */}
              <View style={styles.signedOutHero}>
                <View style={styles.heroArtwork}>
                  <View style={styles.heroArtworkGlow} />
                  <View style={styles.personIconCircle}>
                    <Ionicons
                      name="person-outline"
                      size={43}
                      color={Colors.purple}
                    />
                  </View>
                  <View style={styles.heroCloudBadge}>
                    <Feather name="cloud" size={15} color={C.green} />
                  </View>
                  <View style={styles.heroHeartBadge}>
                    <Feather name="heart" size={14} color={C.coral} />
                  </View>
                </View>

                <Text style={styles.signedOutHeadline}>
                  Keep your supports close
                </Text>
                <Text style={styles.signedOutSubtext}>
                  Create a free account to connect your BitzaHugs experience
                  across devices and keep Premium access linked to you.
                </Text>
              </View>

              {/* Benefits Card */}
              <Card style={styles.benefitsCard}>
                <BenefitRow
                  icon="cloud"
                  title="Stay connected"
                  description="Access your family supports across your devices."
                />
                <BenefitRow
                  icon="shield"
                  title="Protect Premium access"
                  description="Keep your subscription connected to your account."
                />
                <BenefitRow
                  icon="monitor"
                  title="Use the caregiver portal"
                  description="Sign in from your phone or computer."
                />
                <BenefitRow
                  icon="lock"
                  title="Private by design"
                  description="Your information is never sold."
                  isLast
                />
              </Card>

              <PrimaryButton
                label="Create Free Account"
                onPress={() => changeMode("signup")}
                icon="person-add-outline"
                style={styles.createAccountBtn}
              />
              <SecondaryButton
                label="I Already Have an Account"
                onPress={() => changeMode("signin")}
                style={styles.secondaryBtn}
              />

              <View style={styles.gentleNote}>
                <Feather name="heart" size={15} color={C.coral} />
                <Text style={styles.gentleNoteText}>
                  Your support tools can still be used without creating an
                  account.
                </Text>
              </View>
            </>
          )}

          {(mode === "signin" || mode === "signup" || mode === "reset") && (
            <>
              {/* Form intro icon + headline */}
              <View style={styles.formIntro}>
                <View style={styles.formIntroIcon}>
                  <Feather
                    name={
                      mode === "signin"
                        ? "log-in"
                        : mode === "signup"
                        ? "user-plus"
                        : "key"
                    }
                    size={25}
                    color={Colors.purple}
                  />
                </View>
                <Text style={styles.formHeadline}>{screenTitle}</Text>
                <Text style={styles.formDescription}>{formDescription}</Text>
              </View>

              {/* Form Card */}
              <Card style={styles.formCard}>
                {mode === "signup" && (
                  <FormField label="Your name" helper="Optional" icon="user">
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="What should we call you?"
                      placeholderTextColor={Colors.grayLavender}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </FormField>
                )}

                <FormField label="Email address" icon="mail">
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={Colors.grayLavender}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    autoComplete="email"
                    returnKeyType={mode === "reset" ? "done" : "next"}
                    onSubmitEditing={
                      mode === "reset" ? handleResetPassword : undefined
                    }
                  />
                </FormField>

                {mode !== "reset" && (
                  <FormField
                    label="Password"
                    helper={
                      mode === "signup" ? "At least 6 characters" : undefined
                    }
                    icon="lock"
                    isLast
                  >
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder={
                          mode === "signup"
                            ? "Create a password"
                            : "Enter your password"
                        }
                        placeholderTextColor={Colors.grayLavender}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        autoComplete="password"
                        returnKeyType="done"
                        onSubmitEditing={
                          mode === "signin" ? handleSignIn : handleSignUp
                        }
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword((current) => !current)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <Feather
                          name={showPassword ? "eye-off" : "eye"}
                          size={19}
                          color={Colors.grayLavender}
                        />
                      </TouchableOpacity>
                    </View>
                  </FormField>
                )}

                <PrimaryButton
                  label={
                    mode === "signin"
                      ? "Sign In"
                      : mode === "signup"
                      ? "Create My Account"
                      : "Send Reset Email"
                  }
                  onPress={
                    mode === "signin"
                      ? handleSignIn
                      : mode === "signup"
                      ? handleSignUp
                      : handleResetPassword
                  }
                  loading={isLoading}
                  disabled={isLoading}
                  style={mode === "signup" ? [styles.formSubmitButton, styles.createAccountBtn] : styles.formSubmitButton}
                />

                {mode === "signin" && (
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => changeMode("reset")}
                    activeOpacity={0.75}
                  >
                    <Feather name="key" size={14} color={Colors.purple} />
                    <Text style={styles.forgotPasswordText}>
                      Forgot your password?
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>

              {/* Account Switch Card */}
              <Card tint="lavender" style={styles.accountSwitchCard}>
                <Text style={styles.accountSwitchText}>
                  {mode === "signin"
                    ? "New to BitzaHugs?"
                    : mode === "signup"
                    ? "Already have an account?"
                    : "Remembered your password?"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    changeMode(mode === "signin" ? "signup" : "signin")
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.accountSwitchLink}>
                    {mode === "signin"
                      ? "Create a free account"
                      : "Sign in instead"}
                  </Text>
                </TouchableOpacity>
              </Card>
            </>
          )}

          <View style={styles.footerPrivacyRow}>
            <Feather name="lock" size={12} color={Colors.textMuted} />
            <Text style={styles.footerPrivacyText}>
              Private, gentle, and made with care for families.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function DetailRow({ icon, label, value, isLast = false }) {
  return (
    <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
      <View style={styles.detailLabelGroup}>
        <View style={styles.detailIcon}>
          <Feather name={icon} size={14} color={Colors.purple} />
        </View>
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function BenefitRow({ icon, title, description, isLast = false }) {
  return (
    <View style={[styles.benefitRow, isLast && styles.benefitRowLast]}>
      <View style={styles.benefitIcon}>
        <Feather name={icon} size={18} color={Colors.purple} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
      <Feather name="check-circle" size={17} color={C.green} />
    </View>
  );
}

function FormField({ label, helper, icon, children, isLast = false }) {
  return (
    <View style={[styles.fieldGroup, isLast && styles.fieldGroupLast]}>
      <View style={styles.fieldLabelRow}>
        <View style={styles.fieldLabelLeft}>
          <Feather name={icon} size={14} color={Colors.purple} />
          <Text style={styles.inputLabel}>{label}</Text>
        </View>
        {helper ? <Text style={styles.inputHelper}>{helper}</Text> : null}
      </View>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  headerBg: { backgroundColor: "transparent" },
  scroll: { flex: 1, backgroundColor: "transparent" },
  keyboardContainer: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
    gap: Spacing.sm,
  },

  // Shared
  cardTextContainer: { flex: 1 },

  // Status Banner
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  statusText: {
    flex: 1,
    ...Type.caption,
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    lineHeight: 18,
  },

  // ── Signed-in Profile Hero ───────────────────────────────────────────────────
  profileHero: {
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  heroGlowLarge: {
    position: "absolute",
    top: -60,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#E6D1FF",
    opacity: 0.8,
  },
  heroGlowSmall: {
    position: "absolute",
    bottom: -45,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE9D8",
    opacity: 0.65,
  },
  avatarOuter: { position: "relative", marginBottom: Spacing.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.purple,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.raised,
  },
  avatarText: { color: "#FFFFFF", fontSize: 34, fontFamily: Fonts.extrabold },
  onlineIndicator: {
    position: "absolute",
    right: 1,
    bottom: 5,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: C.green,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeLabel: {
    ...Type.overline,
    color: Colors.purple,
    marginBottom: 3,
  },
  displayName: {
    fontFamily: Fonts.extrabold,
    fontSize: 23,
    lineHeight: 28,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  emailText: {
    ...Type.caption,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  accountActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.greenBorder,
  },
  accountActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
    marginRight: 7,
  },
  accountActiveText: {
    ...Type.overline,
    color: C.green,
  },

  // ── Sync Card ────────────────────────────────────────────────────────────────
  syncCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.greenSoft,
  },
  syncIconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    flexShrink: 0,
    ...Shadows.card,
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  cardTitle: { flex: 1, ...Type.cardTitle, color: Colors.textPrimary },
  activePill: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.greenBorder,
  },
  activePillText: {
    ...Type.caption,
    color: C.green,
    fontFamily: Fonts.extrabold,
  },
  cardDescription: { ...Type.bodySmall, color: Colors.textSecondary },

  // ── Section Labels ───────────────────────────────────────────────────────────
  sectionLabel: {
    ...Type.overline,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginLeft: 4,
    marginBottom: 2,
  },

  // ── Details Card ─────────────────────────────────────────────────────────────
  detailsCard: {},
  detailsHeading: { flexDirection: "row", alignItems: "center" },
  detailsHeadingIcon: {
    width: 39,
    height: 39,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  detailsTitle: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 2 },
  detailsSubtitle: { ...Type.caption, color: Colors.textMuted },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginTop: Spacing.md,
  },
  detailRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabelGroup: { flexDirection: "row", alignItems: "center", flex: 1 },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  detailLabel: { ...Type.caption, color: Colors.textSecondary },
  detailValue: {
    maxWidth: "55%",
    ...Type.caption,
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    textAlign: "right",
  },

  // ── Desktop / Portal Card ────────────────────────────────────────────────────
  desktopCard: { flexDirection: "row", alignItems: "center" },
  desktopIconWrap: {
    width: 45,
    height: 45,
    borderRadius: Radius.md,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  desktopTitle: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 4 },
  desktopDescription: {
    ...Type.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 7,
  },
  desktopLinkRow: { flexDirection: "row", alignItems: "center" },
  desktopLink: {
    ...Type.caption,
    color: C.blue,
    fontFamily: Fonts.bold,
    marginRight: 4,
  },
  chevronCircle: {
    width: 29,
    height: 29,
    borderRadius: Radius.sm,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },

  // ── Privacy Note ─────────────────────────────────────────────────────────────
  privacyNote: { flexDirection: "row", alignItems: "center" },
  privacyNoteIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  privacyNoteText: { flex: 1, ...Type.caption, color: Colors.textSecondary },

  // ── Sign Out Button ──────────────────────────────────────────────────────────
  signOutButton: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: C.coralSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  signOutText: { ...Type.cardTitle, color: C.coral },
  deleteAccountButton: { backgroundColor: "#FFF1F3" },
  deleteAccountText: { ...Type.cardTitle, color: "#C03060" },

  // ── Signed-in Footer ─────────────────────────────────────────────────────────
  footerText: {
    ...Type.caption,
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },

  // ── Signed-out Hero ──────────────────────────────────────────────────────────
  signedOutHero: { alignItems: "center" },
  heroArtwork: {
    width: 116,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  heroArtworkGlow: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: Colors.lavenderSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lavenderBorder,
  },
  personIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.raised,
  },
  heroCloudBadge: {
    position: "absolute",
    top: 7,
    right: 3,
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: C.greenSoft,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroHeartBadge: {
    position: "absolute",
    bottom: 5,
    left: 6,
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: C.coralSoft,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  signedOutHeadline: {
    fontFamily: Fonts.extrabold,
    fontSize: 27,
    lineHeight: 33,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  signedOutSubtext: {
    maxWidth: 330,
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // ── Benefits Card ────────────────────────────────────────────────────────────
  benefitsCard: { padding: 0, paddingHorizontal: Spacing.md },
  benefitRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  benefitRowLast: { borderBottomWidth: 0 },
  benefitIcon: {
    width: 39,
    height: 39,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  benefitTitle: { ...Type.cardTitle, color: Colors.textPrimary, marginBottom: 3 },
  benefitDescription: {
    ...Type.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
    paddingRight: 8,
  },

  // ── Main CTA buttons ─────────────────────────────────────────────────────────
  createAccountBtn: { backgroundColor: Colors.primaryPlum },
  secondaryBtn: { marginTop: Spacing.xs },

  // ── Gentle Note ──────────────────────────────────────────────────────────────
  gentleNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },
  gentleNoteText: {
    flexShrink: 1,
    ...Type.caption,
    color: Colors.textMuted,
    textAlign: "center",
    marginLeft: 7,
  },

  // ── Form Intro ───────────────────────────────────────────────────────────────
  formIntro: { alignItems: "center" },
  formIntroIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    backgroundColor: Colors.lavenderSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  formHeadline: {
    fontFamily: Fonts.extrabold,
    fontSize: 25,
    lineHeight: 30,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  formDescription: {
    maxWidth: 300,
    ...Type.bodySmall,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // ── Form Card ────────────────────────────────────────────────────────────────
  formCard: {},
  fieldGroup: { marginBottom: Spacing.lg },
  fieldGroupLast: { marginBottom: 6 },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  fieldLabelLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  inputLabel: {
    fontFamily: Fonts.extrabold,
    fontSize: 11.5,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    marginLeft: 7,
  },
  inputHelper: { ...Type.caption, color: Colors.textMuted },
  input: {
    height: 44,
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lavenderBorder,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  passwordContainer: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lavenderSurface,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lavenderBorder,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingLeft: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  eyeButton: {
    height: "100%",
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  formSubmitButton: { marginTop: Spacing.md },
  forgotPasswordButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPasswordText: {
    ...Type.caption,
    color: Colors.purple,
    fontFamily: Fonts.extrabold,
    marginLeft: 6,
  },

  // ── Account Switch Card ──────────────────────────────────────────────────────
  accountSwitchCard: { alignItems: "center" },
  accountSwitchText: { ...Type.caption, color: Colors.textSecondary, marginBottom: 3 },
  accountSwitchLink: {
    ...Type.caption,
    color: Colors.purple,
    fontFamily: Fonts.extrabold,
  },

  // ── Footer Privacy Row ───────────────────────────────────────────────────────
  footerPrivacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },
  footerPrivacyText: {
    ...Type.caption,
    color: Colors.textMuted,
    textAlign: "center",
    marginLeft: 6,
  },
});
