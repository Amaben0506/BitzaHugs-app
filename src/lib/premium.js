import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import {
  configureRevenueCatForCurrentUser,
  getCachedPremiumEntitlement,
  getCurrentOffering,
  purchasePackage,
  refreshCustomerInfo,
  restorePurchases,
} from "./revenuecat";
import { syncServerPremiumEntitlement } from "./serverEntitlements";

export const FREE_LIMITS = {
  childProfiles: 1,
  activeRoutines: 1,
  supportPlans: 1,
  hugiMessagesPerDay: 5,
  journalHistoryDays: 7,
  moodHistoryDays: 7,
  communityPostsPerMonth: 3,
  communityRooms: 2,
  activeShareCodes: 0,
  appointments: 0,
  pdfExports: 0,
};

const HUGI_USAGE_KEY = "bitzaPremiumUsage:hugiDaily";
const COMMUNITY_USAGE_KEY = "bitzaPremiumUsage:communityMonthly";

const DEFAULT_CONTEXT = {
  feature: "premium",
  title: "Unlock more support",
  description: "Premium gives your family expanded organization, insights, history, exports, and care-team tools.",
  icon: "sparkles",
  benefits: [
    "Unlimited routines, plans, and Hugi conversations",
    "Full journal, mood, progress, and report history",
    "Care-team sharing, appointments, PDFs, and exports",
  ],
};

export const PREMIUM_CONTEXTS = {
  multiple_children: {
    title: "Support every child",
    description: "Premium lets you create separate profiles, routines, plans, and insights for each child.",
    icon: "people",
    benefits: ["Multiple child profiles", "Separate routines and plans", "Individual progress insights"],
  },
  unlimited_routines: {
    title: "Create routines for every part of the day",
    description: "Premium includes unlimited routines, reusable templates, and more ways to personalize each step.",
    icon: "calendar",
    benefits: ["Unlimited routines", "Reusable templates", "More personalization for each child"],
  },
  support_plans: {
    title: "Keep every support plan ready",
    description: "Premium unlocks multiple plans, PDF exports, and support-team sharing.",
    icon: "shield-checkmark",
    benefits: ["Multiple saved plans", "Printable plans", "Care-team sharing"],
  },
  hugi_limit: {
    title: "Keep talking with Hugi",
    description: "You've used today's free Hugi messages. Premium gives you unlimited conversations and more personalized support.",
    icon: "chatbubbles",
    benefits: ["Unlimited Hugi conversations", "More personalized support", "Caregiver reflection prompts"],
  },
  full_history: {
    title: "See the full picture",
    description: "Premium unlocks your complete mood and journal history, patterns, trends, and caregiver insights.",
    icon: "analytics",
    benefits: ["Full journal history", "Full mood history", "Patterns, triggers, and trends"],
  },
  appointments: {
    title: "Keep every appointment in one place",
    description: "Premium includes appointment tracking, reminders, notes, preparation checklists, and follow-ups.",
    icon: "calendar",
    benefits: ["Appointment tracker", "Notes and prep checklists", "Follow-up reminders"],
  },
  pdf_exports: {
    title: "Create shareable reports",
    description: "Premium unlocks PDF reports, snapshots, printable support plans, and advanced exports.",
    icon: "document-text",
    benefits: ["PDF exports", "Child Support Snapshots", "Printable plans and reports"],
  },
  resources: {
    title: "Open the full resource library",
    description: "Premium includes printable visuals, care-team handouts, and resource downloads for everyday support.",
    icon: "print",
    benefits: ["Printable resource library", "Care-team documents", "Saved PDF tools"],
  },
  community: {
    title: "Join the full BitzaHugs community",
    description: "Premium unlocks all rooms, unlimited posting, saved discussions, and advanced filters.",
    icon: "people-circle",
    benefits: ["Unlimited community posts", "All community rooms", "Saved posts and advanced filters"],
  },
  portals: {
    title: "Coordinate with your support team",
    description: "Premium unlocks care-team sharing, share codes, and portal access for trusted helpers.",
    icon: "share-social",
    benefits: ["Share codes", "Support Team Portal", "Caregiver Desktop Portal"],
  },
};

const PremiumContext = createContext(null);

const localDayKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const localMonthKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const readCounter = async (storageKey, periodKey) => {
  const raw = await AsyncStorage.getItem(storageKey);
  const parsed = raw ? JSON.parse(raw) : null;
  if (!parsed || parsed.periodKey !== periodKey) return { periodKey, count: 0 };
  return { periodKey, count: Number(parsed.count) || 0 };
};

const writeCounter = async (storageKey, value) => {
  await AsyncStorage.setItem(storageKey, JSON.stringify({ ...value, updatedAt: new Date().toISOString() }));
};

export const getHugiUsage = async () => {
  return readCounter(HUGI_USAGE_KEY, localDayKey());
};

export const getRemainingHugiMessages = async () => {
  const usage = await getHugiUsage();
  return Math.max(FREE_LIMITS.hugiMessagesPerDay - usage.count, 0);
};

export const recordHugiMessageUsed = async () => {
  const usage = await getHugiUsage();
  const next = { ...usage, count: usage.count + 1 };
  await writeCounter(HUGI_USAGE_KEY, next);
  return next;
};

export const getCommunityPostUsage = async () => {
  return readCounter(COMMUNITY_USAGE_KEY, localMonthKey());
};

export const recordCommunityPostCreated = async () => {
  const usage = await getCommunityPostUsage();
  const next = { ...usage, count: usage.count + 1 };
  await writeCounter(COMMUNITY_USAGE_KEY, next);
  return next;
};

export const isWithinHistoryWindow = (dateValue, days) => {
  const date = new Date(`${String(dateValue).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return date >= cutoff;
};

const syncPremiumToFirestore = async (isPremium) => {
  if (isPremium !== undefined) {
    await syncServerPremiumEntitlement();
  }
};

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState("loading");
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const [error, setError] = useState(null);
  const [upgradeConfig, setUpgradeConfig] = useState(null);

  const refreshPremium = useCallback(async () => {
    setStatus((current) => (current === "loading" ? "loading" : "checking"));
    const result = await refreshCustomerInfo();
    setIsPremium(!!result.isPremium);
    setStatus(result.error ? "error" : result.isPremium ? "active" : "free");
    setError(result.error ?? null);
    setLastCheckedAt(new Date().toISOString());
    syncPremiumToFirestore(!!result.isPremium);
    return result;
  }, []);

  useEffect(() => {
    let active = true;
    const boot = async () => {
      await configureRevenueCatForCurrentUser();
      const cached = await getCachedPremiumEntitlement();
      if (!active) return;
      setIsPremium(!!cached.isPremium);
      setLastCheckedAt(cached.checkedAt ?? null);
      const result = await refreshCustomerInfo();
      if (!active) return;
      setIsPremium(!!result.isPremium);
      setStatus(result.error ? "error" : result.isPremium ? "active" : "free");
      setError(result.error ?? null);
      setLastCheckedAt(new Date().toISOString());
      syncPremiumToFirestore(!!result.isPremium);
    };
    boot();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.uid) return;
      await configureRevenueCatForCurrentUser();
      const result = await refreshCustomerInfo();
      setIsPremium(!!result.isPremium);
      setStatus(result.error ? "error" : result.isPremium ? "active" : "free");
      setError(result.error ?? null);
      setLastCheckedAt(new Date().toISOString());
      syncPremiumToFirestore(!!result.isPremium);
    });
    return unsubscribe;
  }, [refreshPremium]);

  const showPremiumUpgrade = useCallback((config = {}) => {
    const base = PREMIUM_CONTEXTS[config.feature] || DEFAULT_CONTEXT;
    setUpgradeConfig({ ...base, ...config });
  }, []);

  const closePremiumUpgrade = useCallback(() => setUpgradeConfig(null), []);

  const requirePremium = useCallback((config = {}) => {
    if (status === "loading" || status === "checking") {
      showPremiumUpgrade({
        ...config,
        title: "Checking Premium access",
        description: "Give us a moment while we confirm your subscription safely.",
        isChecking: true,
      });
      return false;
    }
    if (isPremium) return true;
    showPremiumUpgrade(config);
    return false;
  }, [isPremium, showPremiumUpgrade, status]);

  const value = useMemo(() => ({
    isPremium,
    status,
    isLoading: status === "loading" || status === "checking",
    error,
    lastCheckedAt,
    refreshPremium,
    showPremiumUpgrade,
    closePremiumUpgrade,
    requirePremium,
  }), [closePremiumUpgrade, error, isPremium, lastCheckedAt, refreshPremium, requirePremium, showPremiumUpgrade, status]);

  return (
    <PremiumContext.Provider value={value}>
      {children}
      <PremiumUpgradeModal
        config={upgradeConfig}
        visible={!!upgradeConfig}
        onClose={closePremiumUpgrade}
        onUnlocked={async () => {
          const result = await refreshPremium();
          if (result.isPremium && upgradeConfig?.onUnlocked) upgradeConfig.onUnlocked();
        }}
      />
    </PremiumContext.Provider>
  );
}

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used inside PremiumProvider");
  return ctx;
};

function PremiumUpgradeModal({ visible, config, onClose, onUnlocked }) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [offering, setOffering] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!visible) return;
    setMessage("");
    getCurrentOffering().then(setOffering).catch(() => setOffering(null));
  }, [visible]);

  if (!config) return null;

  const plans = [
    { id: "annual", label: "Annual", price: "$49.99", per: "/yr", note: "7-day free trial. Save 40%.", badge: "Best value" },
    { id: "monthly", label: "Monthly", price: "$6.99", per: "/mo", note: "7-day free trial.", badge: null },
  ];

  const getPackageForPlan = () => {
    if (!offering) return null;
    if (selectedPlan === "annual") {
      return offering.annual || offering.availablePackages?.find((p) => p.product.identifier === "com.bitzahugs.app.annual");
    }
    return offering.monthly || offering.availablePackages?.find((p) => p.product.identifier === "com.bitzahugs.app.monthly");
  };

  const handlePurchase = async () => {
    setLoading(true);
    setMessage("");
    try {
      const pkg = getPackageForPlan();
      if (!pkg) {
        setMessage("Plans could not be loaded. Please check your connection and try again.");
        return;
      }
      const result = await purchasePackage(pkg);
      if (result.isPremium) {
        await syncPremiumToFirestore(true);
        setMessage("Premium is active. Everything is unlocked.");
        await onUnlocked?.();
        setTimeout(onClose, 500);
      } else {
        setMessage(result.error || "Purchase did not unlock Premium yet. Try Restore Purchases if you were charged.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await restorePurchases();
      if (result.isPremium) {
        await syncPremiumToFirestore(true);
        setMessage("Premium access restored.");
        await onUnlocked?.();
        setTimeout(onClose, 500);
      } else {
        setMessage("No active Premium subscription was found for this account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Not now"
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#352846" />
            </TouchableOpacity>

            <View style={styles.iconWrap}>
              <Ionicons name={config.icon || "sparkles"} size={30} color="#6F45B8" />
            </View>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.description}>{config.description}</Text>

            {config.isChecking ? (
              <View style={styles.checkingCard}>
                <ActivityIndicator color="#6F45B8" />
                <Text style={styles.checkingText}>Checking your subscription...</Text>
              </View>
            ) : (
              <>
                <View style={styles.benefits}>
                  {(config.benefits || DEFAULT_CONTEXT.benefits).map((benefit) => (
                    <View key={benefit} style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#5BAD6F" />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.planRow}>
                  {plans.map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[styles.planCard, selectedPlan === plan.id && styles.planCardActive]}
                      onPress={() => setSelectedPlan(plan.id)}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel={`${plan.label} Premium plan ${plan.price}${plan.per}`}
                    >
                      {plan.badge ? <Text style={styles.planBadge}>{plan.badge}</Text> : null}
                      <Text style={styles.planLabel}>{plan.label}</Text>
                      <Text style={styles.planPrice}>{plan.price}<Text style={styles.planPer}>{plan.per}</Text></Text>
                      <Text style={styles.planNote}>{plan.note}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handlePurchase}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Start free trial"
                  activeOpacity={0.9}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Start Free 7-Day Trial</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.restoreButton}
                  onPress={handleRestore}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Restore purchases"
                  activeOpacity={0.8}
                >
                  <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>

                {message ? <Text style={styles.statusText}>{message}</Text> : null}

                <View style={styles.legalRow}>
                  <TouchableOpacity onPress={() => Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}>
                    <Text style={styles.legalLink}>Terms</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalSep}> / </Text>
                  <TouchableOpacity onPress={() => Linking.openURL("https://bitzahugs.com/privacy")}>
                    <Text style={styles.legalLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export const showUpgradeAlertFallback = (navigation, feature = "premium") => {
  const context = PREMIUM_CONTEXTS[feature] || DEFAULT_CONTEXT;
  Alert.alert(context.title, context.description, [
    { text: "Not Now", style: "cancel" },
    { text: "View Premium", onPress: () => navigation?.navigate?.("PremiumUpgrade", { feature }) },
  ]);
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(34, 24, 58, 0.34)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: "#FFFDF9",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: "#E4D8F2",
  },
  content: {
    padding: 20,
    paddingBottom: 34,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2EAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#F2EAFB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 2,
    marginBottom: 12,
  },
  title: {
    color: "#352846",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    color: "#6E5A8F",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  checkingCard: {
    backgroundColor: "#F2EAFB",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  checkingText: {
    color: "#6E5A8F",
    fontSize: 13,
    fontWeight: "700",
  },
  benefits: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4D8F2",
    padding: 12,
    gap: 9,
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitText: {
    flex: 1,
    color: "#352846",
    fontSize: 13,
    fontWeight: "700",
  },
  planRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  planCard: {
    flex: 1,
    minHeight: 124,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4D8F2",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  planCardActive: {
    backgroundColor: "#F2EAFB",
    borderColor: "#6F45B8",
    borderWidth: 2,
  },
  planBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#6F45B8",
    color: "#FFFFFF",
    borderRadius: 99,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: "800",
  },
  planLabel: {
    color: "#6E5A8F",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  planPrice: {
    color: "#352846",
    fontSize: 24,
    fontWeight: "900",
  },
  planPer: {
    color: "#81758F",
    fontSize: 12,
    fontWeight: "700",
  },
  planNote: {
    color: "#81758F",
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
    marginTop: 5,
    fontWeight: "600",
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#6F45B8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: "#B8A9CC",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  restoreButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  restoreText: {
    color: "#6F45B8",
    fontSize: 13,
    fontWeight: "800",
  },
  statusText: {
    color: "#6E5A8F",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 4,
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  legalLink: {
    color: "#6F45B8",
    fontSize: 12,
    fontWeight: "800",
  },
  legalSep: {
    color: "#81758F",
    fontSize: 12,
  },
});
