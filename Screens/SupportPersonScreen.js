import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "bitzaSupportPerson";
const DEFAULT_MESSAGE = "Hey, I'm having a hard moment and could use support. Can you check in with me?";

const BLANK_CONTACT = { name: "", relationship: "", phone: "" };
const BLANK = {
  contact1: { ...BLANK_CONTACT },
  contact2: { ...BLANK_CONTACT },
  message: DEFAULT_MESSAGE,
};

// ─── Contact Card (view mode) ─────────────────────────────────────────────────
function ContactViewCard({ contact, number, onEdit }) {
  const hasData = contact.name?.trim();
  return (
    <View style={[styles.contactViewCard, number === 1 && styles.contactViewCardPrimary]}>
      <View style={styles.contactViewLeft}>
        <View style={[styles.contactAvatar, number === 1 ? styles.contactAvatarPrimary : styles.contactAvatarSecondary]}>
          <Text style={[styles.contactAvatarNum, number === 1 ? styles.contactAvatarNumPrimary : styles.contactAvatarNumSecondary]}>
            {number}
          </Text>
        </View>
        <View style={styles.contactViewInfo}>
          <View style={styles.contactViewTitleRow}>
            <Text style={styles.contactViewLabel}>
              {number === 1 ? "Primary Contact" : "Secondary Contact"}
            </Text>
            {number === 1 && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            )}
          </View>
          {hasData ? (
            <>
              <Text style={styles.contactViewName}>{contact.name}</Text>
              {contact.relationship?.trim() ? (
                <Text style={styles.contactViewRelationship}>{contact.relationship}</Text>
              ) : null}
              {contact.phone?.trim() ? (
                <View style={styles.contactViewPhoneRow}>
                  <Feather name="phone" size={11} color="#6F42D8" />
                  <Text style={styles.contactViewPhone}>{contact.phone}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.contactViewEmpty}>Not set up yet</Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.contactEditBtn} onPress={onEdit} activeOpacity={0.85}>
        <Feather name="edit-2" size={14} color="#6F42D8" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Contact Form (edit mode) ─────────────────────────────────────────────────
function ContactForm({ contact, number, onChange }) {
  return (
    <View style={[styles.card, number === 1 && { borderColor: "#D8C3F7", borderWidth: 1.5 }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBubble, { backgroundColor: number === 1 ? "#F0E2FF" : "#EEF7E8" }]}>
          <Feather name="user-plus" size={16} color={number === 1 ? "#6F42D8" : "#78A866"} />
        </View>
        <View style={styles.contactFormTitleWrap}>
          <Text style={styles.cardTitle}>
            {number === 1 ? "Primary Contact" : "Secondary Contact"}
          </Text>
          {number === 1 && <Text style={styles.contactFormSubtitle}>Your first call in a hard moment</Text>}
          {number === 2 && <Text style={styles.contactFormSubtitle}>Backup — if your primary isn't available</Text>}
        </View>
        {number === 1 && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>Primary</Text>
          </View>
        )}
      </View>
      <Text style={styles.inputLabel}>Name</Text>
      <TextInput
        style={styles.input}
        value={contact.name}
        onChangeText={(v) => onChange("name", v)}
        placeholder={number === 1 ? "Example: Bret" : "Example: Mom"}
        placeholderTextColor="#A8A0A5"
      />
      <Text style={styles.inputLabel}>Relationship</Text>
      <TextInput
        style={styles.input}
        value={contact.relationship}
        onChangeText={(v) => onChange("relationship", v)}
        placeholder="Example: spouse, mom, sister, friend"
        placeholderTextColor="#A8A0A5"
      />
      <Text style={styles.inputLabel}>Phone number</Text>
      <TextInput
        style={[styles.input, { marginBottom: 0 }]}
        value={contact.phone}
        onChangeText={(v) => onChange("phone", v)}
        placeholder="Example: 555-555-5555"
        placeholderTextColor="#A8A0A5"
        keyboardType="phone-pad"
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupportPersonScreen({ navigation }) {
  const [data, setData] = useState(BLANK);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [savedMessage, setSavedMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved) {
            const p = JSON.parse(saved);
            // Handle old single-contact format
            if (p.name && !p.contact1) {
              const migrated = {
                contact1: { name: p.name || "", relationship: p.relationship || "", phone: p.phone || "" },
                contact2: { ...BLANK_CONTACT },
                message: p.message || DEFAULT_MESSAGE,
              };
              setData(migrated);
              setDraft(migrated);
            } else {
              const loaded = { ...BLANK, ...p };
              setData(loaded);
              setDraft(loaded);
            }
          }
        } catch (e) {
          console.log("Error loading:", e);
        }
      };
      load();
    }, [])
  );

  const showStatus = (msg) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 2200);
  };

  const handleSave = async () => {
    try {
      const updated = { ...draft, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setData(updated);
      setEditing(false);
      showStatus("Support contacts saved 💜");
    } catch (e) {
      console.log("Error saving:", e);
    }
  };

  const handleCancel = () => {
    setDraft({ ...data });
    setEditing(false);
  };

  const handleClear = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setData(BLANK);
      setDraft(BLANK);
      setEditing(false);
      showStatus("Contacts cleared");
    } catch (e) {
      console.log("Error clearing:", e);
    }
  };

  const setContact = (num, key, val) => {
    setDraft((prev) => ({
      ...prev,
      [`contact${num}`]: { ...prev[`contact${num}`], [key]: val },
    }));
  };

  const hasContact1 = data.contact1?.name?.trim();
  const hasContact2 = data.contact2?.name?.trim();
  const hasAnyContact = hasContact1 || hasContact2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Support Contacts</Text>
          {editing ? (
            <TouchableOpacity style={styles.circleButton} onPress={handleSave} activeOpacity={0.85}>
              <Feather name="save" size={18} color="#2B2463" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.circleButton} onPress={() => setEditing(true)} activeOpacity={0.85}>
              <Feather name="edit-2" size={18} color="#2B2463" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Banner */}
        {savedMessage ? (
          <View style={styles.statusBanner}>
            <Feather name="check-circle" size={16} color="#6F42D8" />
            <Text style={styles.statusText}>{savedMessage}</Text>
          </View>
        ) : null}

        {/* ── VIEW MODE ── */}
        {!editing ? (
          <>
            {/* Hero */}
            <View style={styles.heroCard}>
              <Image source={require("../assets/icons/support-chat-heart.png")} style={styles.heroIcon} resizeMode="contain" />
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>You don't have to do this alone.</Text>
                <Text style={styles.heroText}>Save two people you trust — a primary and a backup — for hard moments.</Text>
              </View>
            </View>

            {/* No contacts nudge */}
            {!hasAnyContact && (
              <TouchableOpacity style={styles.nudgeCard} onPress={() => setEditing(true)} activeOpacity={0.88}>
                <Ionicons name="person-add-outline" size={20} color="#6F42D8" />
                <View style={styles.nudgeTextWrap}>
                  <Text style={styles.nudgeTitle}>No support contacts added yet</Text>
                  <Text style={styles.nudgeText}>Add someone safe to reach out to when things feel heavy.</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6F42D8" />
              </TouchableOpacity>
            )}

            {/* Contact Cards */}
            <ContactViewCard contact={data.contact1} number={1} onEdit={() => setEditing(true)} />
            <ContactViewCard contact={data.contact2} number={2} onEdit={() => setEditing(true)} />

            {/* Quick Message */}
            {hasAnyContact && data.message?.trim() && (
              <View style={styles.messageViewCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBubble, { backgroundColor: "#FFE3DA" }]}>
                    <Feather name="message-circle" size={16} color="#EF8F7D" />
                  </View>
                  <Text style={styles.cardTitle}>Quick Message</Text>
                  <TouchableOpacity onPress={() => setEditing(true)} activeOpacity={0.85}>
                    <Text style={styles.editLinkText}>Edit ›</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.messageViewBubble}>
                  <Text style={styles.messageViewText}>{data.message}</Text>
                </View>
                <Text style={styles.messageViewHint}>This is the message you'd send in a hard moment.</Text>
              </View>
            )}

            {/* Why Two Contacts Card */}
            <View style={styles.whyCard}>
              <View style={styles.whyIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#6F42D8" />
              </View>
              <View style={styles.whyTextWrap}>
                <Text style={styles.whyTitle}>Why two contacts?</Text>
                <Text style={styles.whyText}>Hard moments don't wait. Having a backup means you're never stuck alone if your first contact isn't available.</Text>
              </View>
            </View>

            {/* Edit Button */}
            <TouchableOpacity style={styles.editFullBtn} onPress={() => setEditing(true)} activeOpacity={0.88}>
              <Feather name="edit-2" size={16} color="#6F42D8" />
              <Text style={styles.editFullBtnText}>Edit Support Contacts</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── EDIT MODE ── */
          <>
            {/* Edit Banner */}
            <View style={styles.editModeBanner}>
              <Feather name="edit-2" size={14} color="#6F42D8" />
              <Text style={styles.editModeBannerText}>Editing support contacts</Text>
            </View>

            {/* Why Two Contacts (compact) */}
            <View style={styles.editHintCard}>
              <Ionicons name="information-circle-outline" size={16} color="#4C9ED9" />
              <Text style={styles.editHintText}>Add a primary contact and a backup. Save one message you can send when you need help but don't have the energy to explain.</Text>
            </View>

            {/* Contact Forms */}
            <ContactForm
              contact={draft.contact1}
              number={1}
              onChange={(key, val) => setContact(1, key, val)}
            />
            <ContactForm
              contact={draft.contact2}
              number={2}
              onChange={(key, val) => setContact(2, key, val)}
            />

            {/* Quick Message */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBubble, { backgroundColor: "#FFE3DA" }]}>
                  <Feather name="message-circle" size={16} color="#EF8F7D" />
                </View>
                <Text style={styles.cardTitle}>Quick Message</Text>
              </View>
              <Text style={styles.helperText}>
                Write a message you could send when you need help but don't have the energy to explain everything.
              </Text>
              <TextInput
                style={styles.textArea}
                value={draft.message}
                onChangeText={(v) => setDraft((prev) => ({ ...prev, message: v }))}
                placeholder="Write a quick support message..."
                placeholderTextColor="#A8A0A5"
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Launch Note */}
            <View style={styles.launchCard}>
              <Image source={require("../assets/icons/support-heart-hug.png")} style={styles.launchIcon} resizeMode="contain" />
              <View style={styles.launchTextWrap}>
                <Text style={styles.launchTitle}>In a real launch</Text>
                <Text style={styles.launchText}>Tapping a contact card will open a text or call option directly. For now, contacts and message are saved for the prototype.</Text>
              </View>
            </View>

            {/* Buttons */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
              <Text style={styles.saveButtonText}>Save Support Contacts</Text>
              <Feather name="check" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.85}>
              <Feather name="trash-2" size={15} color="#D86A5B" />
              <Text style={styles.clearButtonText}>Clear All Contacts</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footerText}>
          {editing ? "Reaching out is not weakness. It is support." : "Tap Edit to update your contacts anytime."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 6 : 16, paddingBottom: 100 },

  topBar: { height: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  topTitle: { color: "#2B2463", fontSize: 17, fontWeight: "800" },

  statusBanner: { height: 40, borderRadius: 13, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, marginBottom: 10 },
  statusText: { color: "#6F42D8", fontSize: 13, fontWeight: "800" },

  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 12, flexDirection: "row", alignItems: "center", marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  heroIcon: { width: 52, height: 52, marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  heroText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  nudgeCard: { backgroundColor: "#F6ECFF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  nudgeTextWrap: { flex: 1 },
  nudgeTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  nudgeText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  // Contact view cards
  contactViewCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 13, flexDirection: "row", alignItems: "center", marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  contactViewCardPrimary: { borderColor: "#D8C3F7", borderWidth: 1.5, backgroundColor: "#FDFAFF" },
  contactViewLeft: { flex: 1, flexDirection: "row", alignItems: "flex-start" },
  contactAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginRight: 11 },
  contactAvatarPrimary: { backgroundColor: "#F0E2FF" },
  contactAvatarSecondary: { backgroundColor: "#EEF7E8" },
  contactAvatarNum: { fontSize: 16, fontWeight: "800" },
  contactAvatarNumPrimary: { color: "#6F42D8" },
  contactAvatarNumSecondary: { color: "#78A866" },
  contactViewInfo: { flex: 1 },
  contactViewTitleRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 3 },
  contactViewLabel: { color: "#837E96", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  contactViewName: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginBottom: 2 },
  contactViewRelationship: { color: "#6F42D8", fontSize: 12, fontWeight: "700", marginBottom: 3 },
  contactViewPhoneRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  contactViewPhone: { color: "#5B5672", fontSize: 12, fontWeight: "600" },
  contactViewEmpty: { color: "#A8A0A5", fontSize: 12, fontWeight: "600", fontStyle: "italic" },
  contactEditBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center" },

  primaryBadge: { backgroundColor: "#F0E2FF", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  primaryBadgeText: { color: "#6F42D8", fontSize: 9, fontWeight: "800" },

  // Message view
  messageViewCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingTop: 13, paddingBottom: 13, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  messageViewBubble: { backgroundColor: "#F6ECFF", borderRadius: 14, padding: 12, marginBottom: 6 },
  messageViewText: { color: "#2B2463", fontSize: 13, lineHeight: 19, fontWeight: "600" },
  messageViewHint: { color: "#837E96", fontSize: 10, fontWeight: "600" },
  editLinkText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },

  // Why card
  whyCard: { backgroundColor: "#F0E2FF", borderRadius: 16, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  whyIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  whyTextWrap: { flex: 1 },
  whyTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 3 },
  whyText: { color: "#5B5672", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  editFullBtn: { height: 48, borderRadius: 15, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  editFullBtnText: { color: "#6F42D8", fontSize: 14, fontWeight: "800" },

  // Edit mode
  editModeBanner: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#F0E2FF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, borderWidth: 1, borderColor: "#E3D2F8" },
  editModeBannerText: { color: "#6F42D8", fontSize: 12, fontWeight: "800" },
  editHintCard: { backgroundColor: "#E7F4FF", borderRadius: 14, borderWidth: 1, borderColor: "#C8E3F5", paddingHorizontal: 12, paddingVertical: 9, flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 10 },
  editHintText: { flex: 1, color: "#2B2463", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingTop: 13, paddingBottom: 13, marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconBubble: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardTitle: { flex: 1, color: "#2B2463", fontSize: 14, fontWeight: "800" },
  contactFormTitleWrap: { flex: 1 },
  contactFormSubtitle: { color: "#837E96", fontSize: 10, fontWeight: "600", marginTop: 1 },

  inputLabel: { color: "#2B2463", fontSize: 12, fontWeight: "800", marginBottom: 6, marginTop: 2 },
  input: { height: 42, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, color: "#2B2463", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  helperText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", marginBottom: 8 },
  textArea: { minHeight: 80, borderRadius: 13, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 12, paddingVertical: 10, color: "#2B2463", fontSize: 13, lineHeight: 18, fontWeight: "600" },

  launchCard: { backgroundColor: "#FFE8DC", borderRadius: 14, borderWidth: 1, borderColor: "#FFD0C0", paddingHorizontal: 13, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 12 },
  launchIcon: { width: 40, height: 40 },
  launchTextWrap: { flex: 1 },
  launchTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800", marginBottom: 2 },
  launchText: { color: "#2B2463", fontSize: 11, lineHeight: 16, fontWeight: "600" },

  saveButton: { height: 50, borderRadius: 16, backgroundColor: "#8B5BE8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  cancelButton: { height: 44, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  cancelButtonText: { color: "#6F42D8", fontSize: 14, fontWeight: "800" },
  clearButton: { height: 42, borderRadius: 13, backgroundColor: "#FFE7E1", borderWidth: 1, borderColor: "#FFD0C0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 12 },
  clearButtonText: { color: "#D86A5B", fontSize: 13, fontWeight: "800" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});

