import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

interface HugiSupportCardsProps {
  onTalkToHugi: () => void;
  onContinueChat: () => void;
  onGetHelpNow: () => void;
  onViewSupportOptions: () => void;
}

const HUGI = require("../../../assets/icons/Hugi-Bunny.png");
const SUPPORT_HANDS = require("../../../assets/icons/Support-hands.png");

export default function HugiSupportCards({
  onTalkToHugi,
  onContinueChat,
  onGetHelpNow,
  onViewSupportOptions,
}: HugiSupportCardsProps) {
  return (
    <View style={styles.row}>
      <View style={styles.hugiCard}>
        <Image source={HUGI} style={styles.cardImage} resizeMode="contain" />
        <Text style={styles.hugiTitle}>Chat with Hugi ✨</Text>
        <Text style={styles.cardDescription}>
          Share what's happening and get gentle, practical support from Hugi.
        </Text>
        <PressableScale style={styles.hugiBtn} onPress={onTalkToHugi}>
          <View style={styles.primaryBtnContent}>
            <Ionicons name="chatbubble-outline" size={14} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Chat with Hugi</Text>
          </View>
        </PressableScale>
        <PressableScale
          onPress={onContinueChat}
          style={styles.secondaryRow}
          haptic={false}
        >
          <Text style={styles.hugiSecondaryLink}>Continue last chat →</Text>
        </PressableScale>
      </View>

      <View style={styles.supportCard}>
        <Image
          source={SUPPORT_HANDS}
          style={styles.cardImage}
          resizeMode="contain"
        />
        <Text style={styles.supportTitle}>I need support right now</Text>
        <Text style={styles.cardDescription}>
          Get help through this moment.
        </Text>
        <PressableScale style={styles.supportBtn} onPress={onGetHelpNow}>
          <View style={styles.primaryBtnContent}>
            <Ionicons name="radio-button-on-outline" size={14} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Get help now</Text>
          </View>
        </PressableScale>
        <PressableScale
          onPress={onViewSupportOptions}
          style={styles.secondaryRow}
          haptic={false}
        >
          <Text style={styles.supportSecondaryLink}>
            View support options →
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    width: "100%",
  },
  hugiCard: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    backgroundColor: "#EDE0FF",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    ...Shadows.card,
  },
  supportCard: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    backgroundColor: "#FFF0F4",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    ...Shadows.card,
  },
  cardImage: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  hugiTitle: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
    width: "100%",
  },
  supportTitle: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    color: "#C03060",
    textAlign: "center",
    width: "100%",
  },
  cardDescription: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 15.5,
    marginTop: 4,
    minHeight: 47,
    width: "100%",
  },
  hugiBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryPlum,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 14,
    marginTop: 10,
    width: "100%",
  },
  supportBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C03060",
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 14,
    marginTop: 10,
    width: "100%",
  },
  primaryBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: 6,
  },
  primaryBtnText: {
    fontSize: 12,
    fontFamily: Fonts.semibold,
    color: "#FFFFFF",
    flexShrink: 1,
    textAlign: "center",
  },
  secondaryRow: {
    marginTop: 6,
  },
  hugiSecondaryLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
    textAlign: "center",
  },
  supportSecondaryLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#C03060",
    textAlign: "center",
  },
});
