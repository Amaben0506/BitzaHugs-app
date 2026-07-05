import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

interface SupportReminderCardProps {
  onTalkToHugi: () => void;
  onSupportRightNow: () => void;
}

const HUGI = require("../../../assets/icons/Hugi-Bunny.png");
const SUPPORT_HANDS = require("../../../assets/icons/Support-hands.png");

export default function SupportReminderCard({
  onTalkToHugi,
  onSupportRightNow,
}: SupportReminderCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>You don't have to carry this alone.</Text>
      <Text style={styles.subtitle}>Reach out when you need support.</Text>

      <View style={styles.buttons}>
        <View style={styles.buttonSlot}>
          <PressableScale
            style={[styles.actionBtn, styles.hugiBtn]}
            onPress={onTalkToHugi}
          >
            <Image source={HUGI} style={styles.btnImage} resizeMode="contain" />
            <Text style={styles.hugiBtnText} numberOfLines={2}>
              Talk to Hugi
            </Text>
          </PressableScale>
        </View>

        <View style={styles.buttonSlot}>
          <PressableScale
            style={[styles.actionBtn, styles.supportBtn]}
            onPress={onSupportRightNow}
          >
            <Image
              source={SUPPORT_HANDS}
              style={styles.btnImage}
              resizeMode="contain"
            />
            <Text style={styles.supportBtnText} numberOfLines={2}>
              I need support right now
            </Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...Shadows.card,
  },
  title: {
    fontSize: 13,
    fontFamily: Fonts.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 3,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginTop: 10,
  },
  buttonSlot: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  actionBtn: {
    height: 82,
    width: "100%",
    backgroundColor: Colors.navActiveBg,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  hugiBtn: {
    backgroundColor: Colors.navActiveBg,
  },
  supportBtn: {
    backgroundColor: "#FFE8EE",
  },
  btnImage: {
    width: 24,
    height: 24,
  },
  hugiBtnText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.purple,
    textAlign: "center",
  },
  supportBtnText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textRose,
    textAlign: "center",
  },
});
