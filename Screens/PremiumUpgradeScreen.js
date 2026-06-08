import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert, ActivityIndicator, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../src/lib/firebase";
import {
  getCurrentOffering,
  purchasePackage,
  restorePurchases,
  refreshCustomerInfo,
} from "../src/lib/revenuecat";

const FREE_FEATURES = [
  { label: "Basic child profile", icon: "user" },
  { label: "Daily routines", icon: "calendar" },
  { label: "Support Right Now mode", icon: "heart" },
  { label: "Breathing & calm tools", icon: "wind" },
  { label: "Simple mood check-in", icon: "smile" },
  { label: "Limited journal entries (5)", icon: "book-open" },
  { label: "Hugi (scripted support)", icon: "message-circle" },
];

const PREMIUM_FEATURES = [
  { label: "Unlimited child profiles", icon: "users", desc: "Add every child in your family" },
  { label: "Advanced routine builder", icon: "sliders", desc: "Custom categories, reordering, scheduling" },
  { label: "Appointment Tracker", icon: "calendar", desc: "Therapy, doctors, school meetings & more" },
  { label: "Progress insights & patterns", icon: "bar-chart-2", desc: "See what helps most over time" },
  { label: "Unlimited journaling", icon: "edit-3", desc: "Write as much as you need" },
  { label: "Printable resources", icon: "printer", desc: "20+ visual tools to print and keep" },
  { label: "Caregiver support library", icon: "users", desc: "Gentle prompts and encouragement for hard moments" },
  { label: "Expanded Hugi support", icon: "message-circle", desc: "More personalized calm guidance using your saved preferences" },
  { label: "Saved sensory plans", icon: "bookmark", desc: "Keep plans ready for hard moments" },
  { label: "Desktop caregiver portal", icon: "monitor", desc: "Full access at bitzahugs.com/login" },
  { label: "Support Team Portal", icon: "share-2", desc: "Share child profile with teachers & therapists" },
];

const PLANS = [
  {
    id: "annual", label: "Annual", price: "$49.99", per: "/yr",
    note: "Billed annually · Save 40%", badge: "Best Value", saving: "Save 40%",
    productId: "com.bitzahugs.app.annual",
  },
  {
    id: "monthly", label: "Monthly", price: "$6.99", per: "/mo",
    note: "Billed monthly", badge: null, saving: null,
    productId: "com.bitzahugs.app.monthly",
  },
];

// Sync premium to Firestore so portal stays in sync
const syncPremiumToFirestore = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        isPremium: true,
        premiumActivatedAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (err) {
    console.log("Firestore premium sync error:", err);
  }
};

export default function PremiumUpgradeScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [isLoading, setIsLoading] = useState(false);
  const [offering, setOffering] = useState(null);

  useEffect(() => {
    const loadOffering = async () => {
      const current = await getCurrentOffering();
      setOffering(current);
    };
    loadOffering();
  }, []);

  const getPackageForPlan = () => {
    if (!offering) return null;
    if (selectedPlan === "annual") {
      return offering.annual || offering.availablePackages?.find(
        (p) => p.product.identifier === "com.bitzahugs.app.annual"
      );
    }
    return offering.monthly || offering.availablePackages?.find(
      (p) => p.product.identifier === "com.bitzahugs.app.monthly"
    );
  };

  const activatePremium = async () => {
    setIsLoading(true);
    try {
      const pkg = getPackageForPlan();
      if (!pkg) {
        Alert.alert("Plans Unavailable", "Premium plans couldn't be loaded. Please check your connection and try again.");
        return;
      }

      const result = await purchasePackage(pkg);

      if (result.isPremium) {
        await syncPremiumToFirestore();
        Alert.alert(
          "Welcome to Premium! 💜",
          "You now have full access to all BitzaHugs Premium features. We're so glad you're here.",
          [{ text: "Let's go!", onPress: () => navigation.goBack() }]
        );
      } else if (result.error) {
        Alert.alert("Purchase Failed", result.error);
      } else {
        // Trial started but entitlement not yet synced — refresh once
        const refreshed = await refreshCustomerInfo();
        if (refreshed.isPremium) {
          await syncPremiumToFirestore();
          Alert.alert(
            "Welcome to Premium! 💜",
            "You now have full access to all BitzaHugs Premium features.",
            [{ text: "Let's go!", onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
            "You're all set! 💜",
            "Your trial has started! Tap 'Restore Purchase' below if Premium doesn't activate in a moment."
          );
        }
      }
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Failed", "Something went wrong. Please try again or use Restore Purchase if you were already charged.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const result = await restorePurchases();
      if (result.isPremium) {
        await syncPremiumToFirestore();
        Alert.alert(
          "Welcome back! 💜",
          "Your Premium access has been restored.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          "No Active Subscription Found",
          "We couldn't find an active Premium subscription. If you believe this is an error, contact us at hello@bitzahugs.com."
        );
      }
    } catch (e) {
      Alert.alert("Restore Failed", "Something went wrong. Please try again or contact us at hello@bitzahugs.com.");
    } finally {
      setIsLoading(false);
    }
  };

  const ctaNoteText = selectedPlan === "annual"
    ? "Then $49.99/yr · Billed annually · Cancel anytime"
    : "Then $6.99/mo · Billed monthly · Cancel anytime";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="x" size={20} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>BitzaHugs Premium</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="sparkles" size={32} color="#7548D8" />
          </View>
          <Text style={styles.heroTitle}>More support.{"\n"}More calm. More you.</Text>
          <Text style={styles.heroSubtitle}>
            Premium unlocks deeper tools to help your family feel more organized, supported, and less alone.
          </Text>
          <View style={styles.trialBadge}>
            <Ionicons name="gift-outline" size={14} color="#4A9E5C" />
            <Text style={styles.trialBadgeText}>7-day free trial — no charge until trial ends</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose your plan</Text>
        <View style={styles.pricingRow}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.pricingCard, selectedPlan === plan.id && styles.pricingCardActive]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.85}
            >
              {plan.badge && (
                <View style={styles.pricingBestBadge}>
                  <Text style={styles.pricingBestText}>{plan.badge}</Text>
                </View>
              )}
              {selectedPlan === plan.id && (
                <View style={styles.selectedCheck}>
                  <Ionicons name="checkmark-circle" size={18} color="#7548D8" />
                </View>
              )}
              <Text style={[styles.pricingPeriod, selectedPlan === plan.id && styles.pricingPeriodActive]}>{plan.label}</Text>
              <Text style={styles.pricingPrice}>{plan.price}<Text style={styles.pricingPer}>{plan.per}</Text></Text>
              <Text style={styles.pricingNote}>{plan.note}</Text>
              {plan.saving && (
                <View style={styles.savingBadge}>
                  <Text style={styles.savingText}>{plan.saving}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <CTAButton isLoading={isLoading} onPress={activatePremium} label="Start Free 7-Day Trial" />
        <Text style={styles.ctaNote}>{ctaNoteText}</Text>

        <Text style={styles.sectionTitle}>Everything in Premium</Text>
        <View style={styles.featuresCard}>
          {PREMIUM_FEATURES.map((f, i) => (
            <View key={f.label} style={[styles.featureRow, i === PREMIUM_FEATURES.length - 1 && styles.featureRowLast]}>
              <View style={styles.featureIconBubble}>
                <Feather name={f.icon} size={16} color="#7548D8" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Feather name="check" size={14} color="#78A866" />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Always Free</Text>
        <View style={styles.freeCard}>
          {FREE_FEATURES.map((f, i) => (
            <View key={f.label} style={[styles.freeRow, i === FREE_FEATURES.length - 1 && styles.freeRowLast]}>
              <View style={styles.freeIconBubble}>
                <Feather name={f.icon} size={14} color="#837E96" />
              </View>
              <Text style={styles.freeLabel}>{f.label}</Text>
              <Feather name="check" size={13} color="#837E96" />
            </View>
          ))}
        </View>

        <View style={styles.promiseCard}>
          <Ionicons name="heart" size={20} color="#EF8F7D" />
          <Text style={styles.promiseText}>
            We will never put emergency support, calming tools, or the Support Right Now button behind a paywall. Ever.
          </Text>
        </View>

        <CTAButton isLoading={isLoading} onPress={activatePremium} label="Start Free 7-Day Trial" />

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} activeOpacity={0.85} disabled={isLoading}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}> · </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://bitzahugs.com/privacy")}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.
          Manage subscriptions in your App Store or Google Play settings.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

function CTAButton({ isLoading, onPress, label }) {
  return (
    <TouchableOpacity
      style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  topTitle: { color: "#2B2463", fontSize: 16, fontWeight: "800" },
  heroCard: { backgroundColor: "#F6ECFF", borderRadius: 24, borderWidth: 1, borderColor: "#E3D2F8", padding: 20, alignItems: "center", marginBottom: 18 },
  heroIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 12, borderWidth: 1, borderColor: "#E3D2F8" },
  heroTitle: { color: "#2B2463", fontSize: 24, fontWeight: "800", textAlign: "center", lineHeight: 30, marginBottom: 8, letterSpacing: -0.3 },
  heroSubtitle: { color: "#5B5672", fontSize: 13, lineHeight: 19, fontWeight: "600", textAlign: "center", marginBottom: 14 },
  trialBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EEF7E9", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#C5E3C8" },
  trialBadgeText: { color: "#4A9E5C", fontSize: 11, fontWeight: "800" },
  sectionTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 10 },
  pricingRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  pricingCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1.5, borderColor: "#EFE4DC", padding: 14, alignItems: "center", position: "relative", paddingTop: 20 },
  pricingCardActive: { borderColor: "#7548D8", borderWidth: 2, backgroundColor: "#F6ECFF" },
  pricingBestBadge: { position: "absolute", top: -11, backgroundColor: "#7548D8", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  pricingBestText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  selectedCheck: { position: "absolute", top: 8, right: 8 },
  pricingPeriod: { color: "#837E96", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  pricingPeriodActive: { color: "#7548D8" },
  pricingPrice: { color: "#2B2463", fontSize: 28, fontWeight: "800" },
  pricingPer: { fontSize: 14, fontWeight: "600", color: "#837E96" },
  pricingNote: { color: "#A0A0A0", fontSize: 9, fontWeight: "500", marginTop: 3, textAlign: "center" },
  savingBadge: { marginTop: 6, backgroundColor: "#EEF7E9", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  savingText: { color: "#4A9E5C", fontSize: 10, fontWeight: "800" },
  ctaButton: { height: 52, borderRadius: 18, backgroundColor: "#7548D8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 },
  ctaButtonDisabled: { backgroundColor: "#C9B8E8" },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  ctaNote: { color: "#837E96", fontSize: 11, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  featuresCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 4, marginBottom: 14, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  featureRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0E8E2", gap: 10 },
  featureRowLast: { borderBottomWidth: 0 },
  featureIconBubble: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  featureTextWrap: { flex: 1 },
  featureLabel: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 1 },
  featureDesc: { color: "#837E96", fontSize: 11, fontWeight: "600" },
  freeCard: { backgroundColor: "#F5F5F5", borderRadius: 18, borderWidth: 1, borderColor: "#E8E8E8", paddingHorizontal: 13, paddingVertical: 4, marginBottom: 14 },
  freeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#EEEEEE", gap: 10 },
  freeRowLast: { borderBottomWidth: 0 },
  freeIconBubble: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#EEEEEE", alignItems: "center", justifyContent: "center" },
  freeLabel: { flex: 1, color: "#5B5672", fontSize: 13, fontWeight: "600" },
  promiseCard: { backgroundColor: "#FFF0F0", borderRadius: 16, borderWidth: 1, borderColor: "#FFD5D0", padding: 13, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  promiseText: { flex: 1, color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "700" },
  restoreButton: { height: 44, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  restoreText: { color: "#7548D8", fontSize: 13, fontWeight: "700" },
  legalRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  legalLink: { color: "#7548D8", fontSize: 12, fontWeight: "700" },
  legalSeparator: { color: "#A0A0A0", fontSize: 12 },
  footerText: { color: "#A0A0A0", fontSize: 10, lineHeight: 15, fontWeight: "600", textAlign: "center" },
});
