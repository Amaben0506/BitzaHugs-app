import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from "@expo/vector-icons";

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
  { label: "Saved sensory plans", icon: "bookmark", desc: "Keep plans ready for hard moments" },
  { label: "Printable & exportable plans", icon: "printer", desc: "Share with teachers, therapists & doctors" },
  { label: "Caregiver community", icon: "users", desc: "Moderated support spaces for families" },
  { label: "Hugi AI companion", icon: "cpu", desc: "Real AI support coming soon" },
];

export default function PremiumUpgradeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="x" size={20} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>BitzaHugs Premium</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="sparkles" size={32} color="#7548D8" />
          </View>
          <Text style={styles.heroTitle}>More support.{"\n"}More calm. More you.</Text>
          <Text style={styles.heroSubtitle}>
            Premium unlocks deeper tools to help your family feel more organized, supported, and less alone.
          </Text>
          <View style={styles.premiumBadgeRow}>
            <View style={styles.premiumBadge}>
              <Ionicons name="sparkles" size={11} color="#7548D8" />
              <Text style={styles.premiumBadgeText}>BitzaHugs Premium</Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingRow}>
          <View style={[styles.pricingCard, styles.pricingCardActive]}>
            <View style={styles.pricingBestBadge}>
              <Text style={styles.pricingBestText}>Best Value</Text>
            </View>
            <Text style={styles.pricingPeriod}>Annual</Text>
            <Text style={styles.pricingPrice}>$3.99<Text style={styles.pricingPer}>/mo</Text></Text>
            <Text style={styles.pricingNote}>Billed $47.99/year</Text>
          </View>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingPeriod}>Monthly</Text>
            <Text style={styles.pricingPrice}>$6.99<Text style={styles.pricingPer}>/mo</Text></Text>
            <Text style={styles.pricingNote}>Billed monthly</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.9}>
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>Start Free 7-Day Trial</Text>
        </TouchableOpacity>
        <Text style={styles.ctaNote}>No charge until trial ends. Cancel anytime.</Text>

        {/* Premium Features */}
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

        {/* Free Features */}
        <Text style={styles.sectionTitle}>Always Free</Text>
        <View style={styles.freeCard}>
          {FREE_FEATURES.map((f, i) => (
            <View key={f.label} style={[styles.freeRow, i === FREE_FEATURES.length - 1 && styles.featureRowLast]}>
              <View style={styles.freeIconBubble}>
                <Feather name={f.icon} size={14} color="#837E96" />
              </View>
              <Text style={styles.freeLabel}>{f.label}</Text>
              <Feather name="check" size={13} color="#837E96" />
            </View>
          ))}
        </View>

        {/* Promise */}
        <View style={styles.promiseCard}>
          <Ionicons name="heart-outline" size={20} color="#7548D8" />
          <Text style={styles.promiseText}>
            We will never put emergency support, calming tools, or the Support Right Now button behind a paywall. Ever.
          </Text>
        </View>

        {/* Secondary CTA */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.9}>
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>Start Free 7-Day Trial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} activeOpacity={0.85}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Subscriptions auto-renew unless cancelled. Manage in App Store / Google Play settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  topTitle: { color: "#2B2463", fontSize: 16, fontWeight: "800" },

  heroCard: {
    backgroundColor: "#F6ECFF", borderRadius: 24, borderWidth: 1, borderColor: "#E3D2F8",
    padding: 20, alignItems: "center", marginBottom: 14,
  },
  heroIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 12, borderWidth: 1, borderColor: "#E3D2F8" },
  heroTitle: { color: "#2B2463", fontSize: 24, fontWeight: "800", textAlign: "center", lineHeight: 30, marginBottom: 8, letterSpacing: -0.3 },
  heroSubtitle: { color: "#5B5672", fontSize: 13, lineHeight: 19, fontWeight: "600", textAlign: "center", marginBottom: 12 },
  premiumBadgeRow: { alignItems: "center" },
  premiumBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "#E3D2F8" },
  premiumBadgeText: { color: "#7548D8", fontSize: 11, fontWeight: "800" },

  pricingRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  pricingCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 14, alignItems: "center", position: "relative" },
  pricingCardActive: { borderColor: "#7548D8", borderWidth: 2, backgroundColor: "#F6ECFF" },
  pricingBestBadge: { position: "absolute", top: -10, backgroundColor: "#7548D8", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  pricingBestText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  pricingPeriod: { color: "#837E96", fontSize: 12, fontWeight: "700", marginBottom: 4, marginTop: 6 },
  pricingPrice: { color: "#2B2463", fontSize: 28, fontWeight: "800" },
  pricingPer: { fontSize: 14, fontWeight: "600", color: "#837E96" },
  pricingNote: { color: "#837E96", fontSize: 10, fontWeight: "600", marginTop: 3 },

  ctaButton: { height: 52, borderRadius: 18, backgroundColor: "#7548D8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  ctaNote: { color: "#837E96", fontSize: 11, fontWeight: "600", textAlign: "center", marginBottom: 18 },

  sectionTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 8 },

  featuresCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 4, marginBottom: 14, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  featureRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0E8E2", gap: 10 },
  featureRowLast: { borderBottomWidth: 0 },
  featureIconBubble: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },
  featureTextWrap: { flex: 1 },
  featureLabel: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 1 },
  featureDesc: { color: "#837E96", fontSize: 11, fontWeight: "600" },

  freeCard: { backgroundColor: "#F5F5F5", borderRadius: 18, borderWidth: 1, borderColor: "#E8E8E8", paddingHorizontal: 13, paddingVertical: 4, marginBottom: 14 },
  freeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#EEEEEE", gap: 10 },
  freeIconBubble: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#EEEEEE", alignItems: "center", justifyContent: "center" },
  freeLabel: { flex: 1, color: "#5B5672", fontSize: 13, fontWeight: "600" },

  promiseCard: { backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", padding: 13, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  promiseText: { flex: 1, color: "#2B2463", fontSize: 12, lineHeight: 17, fontWeight: "700" },

  restoreButton: { height: 44, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  restoreText: { color: "#7548D8", fontSize: 13, fontWeight: "700" },

  footerText: { color: "#A0A0A0", fontSize: 10, lineHeight: 15, fontWeight: "600", textAlign: "center" },
});