import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const AVATARS = {
  "01": require("../assets/icons/child-profile-01.png"),
  "02": require("../assets/icons/child-profile-02.png"),
  "03": require("../assets/icons/child-profile-03.png"),
  "04": require("../assets/icons/child-profile-04.png"),
  "05": require("../assets/icons/child-profile-05.png"),
  "06": require("../assets/icons/child-profile-06.png"),
  "07": require("../assets/icons/child-profile-07.png"),
  "08": require("../assets/icons/child-profile-08.png"),
  "09": require("../assets/icons/child-profile-09.png"),
  "10": require("../assets/icons/child-profile-10.png"),
  "11": require("../assets/icons/child-profile-11.png"),
  "12": require("../assets/icons/child-profile-12.png"),
};

export default function ChildrenListScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const primary = await AsyncStorage.getItem("bitzaChildProfile");
          const extras = await AsyncStorage.getItem("bitzaChildProfiles");
          const extraList = extras ? JSON.parse(extras) : [];
          const primaryChild = primary ? JSON.parse(primary) : null;

          const all = [];
          if (primaryChild) all.push({ ...primaryChild, index: 0, isPrimary: true });
          extraList.forEach((c, i) => all.push({ ...c, index: i + 1, isPrimary: false }));
          setChildren(all);

          const premium = await AsyncStorage.getItem("bitzaIsPremium");
          setIsPremium(premium === "true");
        } catch (e) {
          console.log("Error loading children:", e);
        }
      };
      load();
    }, [])
  );

  const handleAddChild = () => {
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "Adding more than one child requires a Premium subscription. Upgrade to support your whole family!",
        [
          { text: "Not now", style: "cancel" },
          { text: "Upgrade", onPress: () => navigation.navigate("PremiumUpgrade") },
        ]
      );
      return;
    }
    navigation.navigate("ChildProfileSetup", { childIndex: children.length });
  };

  const handleDeleteChild = (child) => {
    if (child.isPrimary) {
      Alert.alert("Can't delete primary child", "To reset the primary child profile, go to Child Profile and use Clear Profile.");
      return;
    }
    Alert.alert(
      `Remove ${child.childName || "this child"}?`,
      "This will permanently delete their profile. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove", style: "destructive", onPress: async () => {
            try {
              const extras = await AsyncStorage.getItem("bitzaChildProfiles");
              const extraList = extras ? JSON.parse(extras) : [];
              const updated = extraList.filter((_, i) => i !== child.index - 1);
              await AsyncStorage.setItem("bitzaChildProfiles", JSON.stringify(updated));
              setChildren((prev) => prev.filter((c) => c.index !== child.index));
            } catch (e) {
              console.log("Error deleting child:", e);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Feather name="chevron-left" size={22} color="#2B2463" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.screenTitle}>My Children</Text>
            <Text style={styles.screenSubtitle}>Manage profiles for each child.</Text>
          </View>
        </View>

        {/* Premium note for free users */}
        {!isPremium && (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => navigation.navigate("PremiumUpgrade")} activeOpacity={0.88}>
            <Ionicons name="sparkles" size={16} color="#7548D8" />
            <View style={styles.premiumBannerText}>
              <Text style={styles.premiumBannerTitle}>1 child profile included free</Text>
              <Text style={styles.premiumBannerSub}>Upgrade to Premium to add more children</Text>
            </View>
            <Feather name="chevron-right" size={14} color="#7548D8" />
          </TouchableOpacity>
        )}

        {/* Children list */}
        {children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="person-add-outline" size={32} color="#6F42D8" />
            <Text style={styles.emptyTitle}>No children added yet</Text>
            <Text style={styles.emptyText}>Set up your first child profile to get started.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate("ChildProfileSetup")} activeOpacity={0.88}>
              <Text style={styles.emptyButtonText}>Set up Child Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          children.map((child, i) => (
            <View key={i} style={styles.childCard}>
              <View style={styles.childAvatarWrap}>
                {child.avatar && AVATARS[child.avatar]
                  ? <Image source={AVATARS[child.avatar]} style={styles.childAvatar} resizeMode="contain" />
                  : <Ionicons name="person-outline" size={22} color="#6F42D8" />
                }
              </View>
              <View style={styles.childInfo}>
                <View style={styles.childNameRow}>
                  <Text style={styles.childName}>{child.childName || `Child ${i + 1}`}</Text>
                  {child.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
                {child.age && child.age !== "Not added yet" && (
                  <Text style={styles.childAge}>{child.age} years old</Text>
                )}
                {child.communicationStyle && child.communicationStyle !== "Not added yet" && (
                  <Text style={styles.childComm}>{child.communicationStyle}</Text>
                )}
              </View>
              <View style={styles.childActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate("ChildProfile", { childIndex: child.index })}
                  activeOpacity={0.85}
                >
                  <Feather name="edit-2" size={15} color="#6F42D8" />
                </TouchableOpacity>
                {!child.isPrimary && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteChild(child)} activeOpacity={0.85}>
                    <Feather name="trash-2" size={15} color="#D86A5B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {/* Add Another Child */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddChild} activeOpacity={0.88}>
          <View style={styles.addIconWrap}>
            <Feather name="plus" size={20} color="#6F42D8" />
          </View>
          <View style={styles.addTextWrap}>
            <Text style={styles.addTitle}>Add Another Child</Text>
            <Text style={styles.addSubtitle}>{isPremium ? "Add a new child profile" : "Premium feature"}</Text>
          </View>
          {!isPremium && (
            <View style={styles.premiumTag}>
              <Ionicons name="sparkles" size={10} color="#7548D8" />
              <Text style={styles.premiumTagText}>Premium</Text>
            </View>
          )}
          <Feather name="chevron-right" size={16} color="#2B2463" />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Each child has their own profile, routines, and support plan.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F2" },
  content: { paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 8 : 14, paddingBottom: 100 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  circleButton: { width: 42, height: 42, borderRadius: 16, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1, marginLeft: 12 },
  screenTitle: { color: "#2B2463", fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  screenSubtitle: { color: "#837E96", fontSize: 12, fontWeight: "700", marginTop: 2 },

  premiumBanner: { backgroundColor: "#F0E2FF", borderRadius: 14, borderWidth: 1, borderColor: "#E3D2F8", paddingHorizontal: 13, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  premiumBannerText: { flex: 1 },
  premiumBannerTitle: { color: "#2B2463", fontSize: 13, fontWeight: "800" },
  premiumBannerSub: { color: "#6F42D8", fontSize: 11, fontWeight: "600", marginTop: 1 },

  childCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 12, flexDirection: "row", alignItems: "center", marginBottom: 10, shadowColor: "#BFA99D", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  childAvatarWrap: { width: 52, height: 52, borderRadius: 17, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", marginRight: 12 },
  childAvatar: { width: 48, height: 48 },
  childInfo: { flex: 1 },
  childNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  childName: { color: "#2B2463", fontSize: 15, fontWeight: "900" },
  primaryBadge: { backgroundColor: "#EEF7E8", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: "#C8E6B8" },
  primaryBadgeText: { color: "#78A866", fontSize: 10, fontWeight: "800" },
  childAge: { color: "#6F42D8", fontSize: 12, fontWeight: "700", marginBottom: 2 },
  childComm: { color: "#837E96", fontSize: 11, fontWeight: "600" },
  childActions: { flexDirection: "row", gap: 8 },
  editBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#F0E2FF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E3D2F8" },
  deleteBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#FFE7E1", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFD0C0" },

  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", padding: 24, alignItems: "center", marginBottom: 14 },
  emptyTitle: { color: "#2B2463", fontSize: 15, fontWeight: "800", marginTop: 10, marginBottom: 4 },
  emptyText: { color: "#837E96", fontSize: 12, lineHeight: 17, textAlign: "center", marginBottom: 14 },
  emptyButton: { backgroundColor: "#8B5BE8", borderRadius: 12, paddingHorizontal: 18, paddingVertical: 9 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },

  addButton: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#EFE4DC", paddingHorizontal: 13, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  addIconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F0E2FF", borderWidth: 1, borderColor: "#E3D2F8", borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  addTextWrap: { flex: 1 },
  addTitle: { color: "#2B2463", fontSize: 14, fontWeight: "800" },
  addSubtitle: { color: "#837E96", fontSize: 11, fontWeight: "600", marginTop: 1 },
  premiumTag: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#EFE1FF", borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "#D8C3F7" },
  premiumTagText: { color: "#7548D8", fontSize: 10, fontWeight: "900" },

  footerText: { color: "#837E96", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
});