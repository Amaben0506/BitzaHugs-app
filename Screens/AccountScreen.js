import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import {
  auth,
  signOutUser,
  createAccount,
  signInWithEmail,
  resetPassword,
} from "../src/lib/firebase";

const COLORS = {
  background: "#FFF9F3",
  surface: "#FFFFFF",
  text: "#2B2463",
  textSoft: "#625D78",
  textMuted: "#928CA5",

  purple: "#7548D8",
  purpleDark: "#6034BF",
  purpleSoft: "#F1E7FF",
  purpleLight: "#F8F2FF",
  purpleBorder: "#E4D4F8",

  green: "#4C9B63",
  greenSoft: "#EDF8EF",
  greenBorder: "#CBE6D0",

  blue: "#4C94C9",
  blueSoft: "#EAF5FD",
  blueBorder: "#C8E3F6",

  coral: "#D96D61",
  coralSoft: "#FFF1ED",
  coralBorder: "#F7CDC5",

  peach: "#FFE9D8",
  border: "#EFE5DE",
  divider: "#F2EBE6",
};

export default function AccountScreen({ navigation }) {
  const [user, setUser] = useState(auth.currentUser);
  const [mode, setMode] = useState("main");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

      showStatus("Welcome back! You’re signed in. 💜");
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

              showStatus("You’ve been signed out.");
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
      : "Enter your email and we’ll send you a reset link.";

  const handleBackPress = () => {
    if (mode === "main") {
      navigation.goBack();
      return;
    }

    changeMode("main");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather name="chevron-left" size={22} color={COLORS.purple} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerEyebrow}>BITZAHUGS</Text>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
      </View>

      <View style={styles.headerSpacer} />
    </View>
  );

  const renderStatusBanner = () => {
    if (!statusMsg) {
      return null;
    }

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backgroundDecorationOne} />
        <View style={styles.backgroundDecorationTwo} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderStatusBanner()}

          <View style={styles.profileHero}>
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
          </View>

          <View style={styles.syncCard}>
            <View style={styles.syncIconWrap}>
              <Feather name="cloud" size={21} color={COLORS.green} />
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
          </View>

          <Text style={styles.sectionLabel}>ACCOUNT INFORMATION</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailsHeading}>
              <View style={styles.detailsHeadingIcon}>
                <Feather name="user" size={18} color={COLORS.purple} />
              </View>

              <View style={styles.cardTextContainer}>
                <Text style={styles.detailsTitle}>Account Details</Text>
                <Text style={styles.detailsSubtitle}>
                  Your basic BitzaHugs profile information
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <DetailRow
              icon="smile"
              label="Name"
              value={user.displayName || "Not set"}
            />

            <DetailRow
              icon="mail"
              label="Email"
              value={user.email || "Not available"}
            />

            <DetailRow
              icon="calendar"
              label="Member since"
              value={memberSince}
              isLast
            />
          </View>

          <Text style={styles.sectionLabel}>YOUR BITZAHUGS ACCESS</Text>

          <TouchableOpacity
            style={styles.desktopCard}
            activeOpacity={0.86}
            onPress={() =>
              Alert.alert(
                "Caregiver Portal 💜",
                "Visit bitzahugs.com/login from any browser to access your caregiver portal."
              )
            }
          >
            <View style={styles.desktopIconWrap}>
              <Feather name="monitor" size={22} color={COLORS.blue} />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.desktopTitle}>Open the Caregiver Portal</Text>

              <Text style={styles.desktopDescription}>
                Visit bitzahugs.com/login to manage supports, export
                information, and print family resources.
              </Text>

              <View style={styles.desktopLinkRow}>
                <Text style={styles.desktopLink}>bitzahugs.com/login</Text>
                <Feather
                  name="arrow-up-right"
                  size={14}
                  color={COLORS.blue}
                />
              </View>
            </View>

            <View style={styles.chevronCircle}>
              <Feather name="chevron-right" size={17} color={COLORS.blue} />
            </View>
          </TouchableOpacity>

          <View style={styles.privacyNote}>
            <View style={styles.privacyNoteIcon}>
              <Feather name="heart" size={16} color={COLORS.purple} />
            </View>

            <Text style={styles.privacyNoteText}>
              Your family information is treated with care and is never sold.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Feather name="log-out" size={18} color={COLORS.coral} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundDecorationOne} />
      <View style={styles.backgroundDecorationTwo} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderHeader()}
          {renderStatusBanner()}

          {mode === "main" && (
            <>
              <View style={styles.signedOutHero}>
                <View style={styles.heroArtwork}>
                  <View style={styles.heroArtworkGlow} />

                  <View style={styles.personIconCircle}>
                    <Ionicons
                      name="person-outline"
                      size={43}
                      color={COLORS.purple}
                    />
                  </View>

                  <View style={styles.heroCloudBadge}>
                    <Feather name="cloud" size={15} color={COLORS.green} />
                  </View>

                  <View style={styles.heroHeartBadge}>
                    <Feather name="heart" size={14} color={COLORS.coral} />
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

              <View style={styles.benefitsCard}>
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
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => changeMode("signup")}
                activeOpacity={0.88}
              >
                <View style={styles.primaryButtonIcon}>
                  <Feather name="user-plus" size={17} color="#FFFFFF" />
                </View>

                <Text style={styles.primaryButtonText}>
                  Create Free Account
                </Text>

                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => changeMode("signin")}
                activeOpacity={0.86}
              >
                <Feather name="log-in" size={18} color={COLORS.purple} />
                <Text style={styles.secondaryButtonText}>
                  I Already Have an Account
                </Text>
              </TouchableOpacity>

              <View style={styles.gentleNote}>
                <Feather name="heart" size={15} color={COLORS.coral} />

                <Text style={styles.gentleNoteText}>
                  Your support tools can still be used without creating an
                  account.
                </Text>
              </View>
            </>
          )}

          {(mode === "signin" ||
            mode === "signup" ||
            mode === "reset") && (
            <>
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
                    color={COLORS.purple}
                  />
                </View>

                <Text style={styles.formHeadline}>{screenTitle}</Text>
                <Text style={styles.formDescription}>{formDescription}</Text>
              </View>

              <View style={styles.formCard}>
                {mode === "signup" && (
                  <FormField
                    label="Your name"
                    helper="Optional"
                    icon="user"
                  >
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="What should we call you?"
                      placeholderTextColor="#ACA5BD"
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
                    placeholderTextColor="#ACA5BD"
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
                        placeholderTextColor="#ACA5BD"
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
                          color={COLORS.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  </FormField>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    styles.formSubmitButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={
                    mode === "signin"
                      ? handleSignIn
                      : mode === "signup"
                      ? handleSignUp
                      : handleResetPassword
                  }
                  disabled={isLoading}
                  activeOpacity={0.88}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        {mode === "signin"
                          ? "Sign In"
                          : mode === "signup"
                          ? "Create My Account"
                          : "Send Reset Email"}
                      </Text>

                      <Feather
                        name={
                          mode === "reset" ? "send" : "arrow-right"
                        }
                        size={18}
                        color="#FFFFFF"
                      />
                    </>
                  )}
                </TouchableOpacity>

                {mode === "signin" && (
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => changeMode("reset")}
                    activeOpacity={0.75}
                  >
                    <Feather
                      name="key"
                      size={14}
                      color={COLORS.purple}
                    />

                    <Text style={styles.forgotPasswordText}>
                      Forgot your password?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.accountSwitchCard}>
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
              </View>
            </>
          )}

          <View style={styles.footerPrivacyRow}>
            <Feather name="lock" size={12} color={COLORS.textMuted} />
            <Text style={styles.footerPrivacyText}>
              Private, gentle, and made with care for families.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value, isLast = false }) {
  return (
    <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
      <View style={styles.detailLabelGroup}>
        <View style={styles.detailIcon}>
          <Feather name={icon} size={14} color={COLORS.purple} />
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
        <Feather name={icon} size={18} color={COLORS.purple} />
      </View>

      <View style={styles.cardTextContainer}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>

      <Feather name="check-circle" size={17} color={COLORS.green} />
    </View>
  );
}

function FormField({
  label,
  helper,
  icon,
  children,
  isLast = false,
}) {
  return (
    <View style={[styles.fieldGroup, isLast && styles.fieldGroupLast]}>
      <View style={styles.fieldLabelRow}>
        <View style={styles.fieldLabelLeft}>
          <Feather name={icon} size={14} color={COLORS.purple} />
          <Text style={styles.inputLabel}>{label}</Text>
        </View>

        {helper ? <Text style={styles.inputHelper}>{helper}</Text> : null}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  backgroundDecorationOne: {
    position: "absolute",
    top: -95,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#F2E4FF",
    opacity: 0.72,
  },

  backgroundDecorationTwo: {
    position: "absolute",
    bottom: 50,
    left: -95,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#FFEBD9",
    opacity: 0.45,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 70,
  },

  cardTextContainer: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#5B398F",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerEyebrow: {
    color: COLORS.purple,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 2,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 42,
  },

  // Status
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purpleSoft,
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },

  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  statusText: {
    flex: 1,
    color: COLORS.purpleDark,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  // Signed-in profile hero
  profileHero: {
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: COLORS.purpleSoft,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 24,
    marginBottom: 15,

    shadowColor: "#6841A6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
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
    backgroundColor: COLORS.peach,
    opacity: 0.65,
  },

  avatarOuter: {
    position: "relative",
    marginBottom: 13,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.purple,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#4A267F",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },

  onlineIndicator: {
    position: "absolute",
    right: 1,
    bottom: 5,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: COLORS.green,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  welcomeLabel: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 3,
  },

  displayName: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },

  emailText: {
    color: COLORS.textSoft,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 13,
  },

  accountActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
  },

  accountActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 7,
  },

  accountActiveText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "900",
  },

  // Sync card
  syncCard: {
    flexDirection: "row",
    backgroundColor: COLORS.greenSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    padding: 15,
    marginBottom: 22,
  },

  syncIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,

    shadowColor: "#487B55",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  cardTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  activePill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
  },

  activePillText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "900",
  },

  cardDescription: {
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },

  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginLeft: 3,
    marginBottom: 9,
  },

  // Details
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 22,

    shadowColor: "#4B3A56",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  detailsHeading: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailsHeadingIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: COLORS.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  detailsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 2,
  },

  detailsSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },

  detailDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginTop: 14,
  },

  detailRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  detailRowLast: {
    borderBottomWidth: 0,
  },

  detailLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  detailIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: COLORS.purpleLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  detailLabel: {
    color: COLORS.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },

  detailValue: {
    maxWidth: "55%",
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },

  // Desktop card
  desktopCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.blueBorder,
    padding: 15,
    marginBottom: 13,

    shadowColor: "#3978A6",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },

  desktopIconWrap: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  desktopTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  desktopDescription: {
    color: COLORS.textSoft,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    marginBottom: 7,
  },

  desktopLinkRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  desktopLink: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "800",
    marginRight: 4,
  },

  chevronCircle: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purpleLight,
    borderRadius: 16,
    padding: 12,
    marginBottom: 17,
  },

  privacyNoteIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  privacyNoteText: {
    flex: 1,
    color: COLORS.textSoft,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },

  signOutButton: {
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.coralSoft,
    borderWidth: 1,
    borderColor: COLORS.coralBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  signOutText: {
    color: COLORS.coral,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 9,
  },

  footerText: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Signed-out hero
  signedOutHero: {
    alignItems: "center",
    marginBottom: 21,
  },

  heroArtwork: {
    width: 116,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  heroArtworkGlow: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: COLORS.purpleSoft,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },

  personIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#5E3B91",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.12,
    shadowRadius: 13,
    elevation: 4,
  },

  heroCloudBadge: {
    position: "absolute",
    top: 7,
    right: 3,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.greenSoft,
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
    backgroundColor: COLORS.coralSoft,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  signedOutHeadline: {
    color: COLORS.text,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 9,
  },

  signedOutSubtext: {
    maxWidth: 330,
    color: COLORS.textSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },

  benefitsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 19,

    shadowColor: "#4B3A56",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },

  benefitRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingVertical: 10,
  },

  benefitRowLast: {
    borderBottomWidth: 0,
  },

  benefitIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: COLORS.purpleLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  benefitTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 3,
  },

  benefitDescription: {
    color: COLORS.textSoft,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    paddingRight: 8,
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: COLORS.purple,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginBottom: 11,

    shadowColor: COLORS.purpleDark,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },

  primaryButtonIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  primaryButtonText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    marginRight: 10,
  },

  secondaryButton: {
    minHeight: 53,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.purpleBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 13,
  },

  secondaryButtonText: {
    color: COLORS.purple,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 9,
  },

  gentleNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginTop: 1,
  },

  gentleNoteText: {
    flexShrink: 1,
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    textAlign: "center",
    marginLeft: 7,
  },

  // Form
  formIntro: {
    alignItems: "center",
    marginBottom: 19,
  },

  formIntroIcon: {
    width: 59,
    height: 59,
    borderRadius: 20,
    backgroundColor: COLORS.purpleSoft,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  formHeadline: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },

  formDescription: {
    maxWidth: 300,
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
  },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginBottom: 13,

    shadowColor: "#4B3A56",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },

  fieldGroup: {
    marginBottom: 16,
  },

  fieldGroupLast: {
    marginBottom: 6,
  },

  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  fieldLabelLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  inputLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  inputHelper: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },

  input: {
    height: 52,
    backgroundColor: COLORS.purpleLight,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: COLORS.purpleBorder,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  passwordContainer: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.purpleLight,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: COLORS.purpleBorder,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingLeft: 14,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  eyeButton: {
    height: "100%",
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  formSubmitButton: {
    marginTop: 13,
    marginBottom: 8,
  },

  buttonDisabled: {
    opacity: 0.62,
    shadowOpacity: 0,
    elevation: 0,
  },

  forgotPasswordButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  forgotPasswordText: {
    color: COLORS.purple,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },

  accountSwitchCard: {
    backgroundColor: COLORS.purpleLight,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    paddingHorizontal: 15,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 8,
  },

  accountSwitchText: {
    color: COLORS.textSoft,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 3,
  },

  accountSwitchLink: {
    color: COLORS.purple,
    fontSize: 12,
    fontWeight: "900",
  },

  footerPrivacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingHorizontal: 15,
  },

  footerPrivacyText: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    textAlign: "center",
    marginLeft: 6,
  },
});