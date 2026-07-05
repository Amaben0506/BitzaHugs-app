import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts, Radius, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

interface QuickSupportCardsProps {
  mode?: "hugi" | "access";
  onHugiPress?: () => void;
  onSupportPress?: () => void;
  onRoutinesPress?: () => void;
  onCalmingPress?: () => void;
  onTransitionsPress?: () => void;
  onJournalPress?: () => void;
  onMeltdownPress?: () => void;
}

const HUGI_HANDS_TOGETHER = require("../../../assets/icons/hugi-hands-together.png");

const ACCESS_ITEMS = [
  { label: "Routines", icon: "calendar-outline", handler: "onRoutinesPress" },
  { label: "Calm Tools", icon: "leaf-outline", handler: "onCalmingPress" },
  { label: "Transition", icon: "timer-outline", handler: "onTransitionsPress" },
  { label: "Journal", icon: "book-outline", handler: "onJournalPress" },
  {
    label: "Meltdown",
    icon: "shield-checkmark-outline",
    handler: "onMeltdownPress",
  },
] as const;

export default function QuickSupportCards(props: QuickSupportCardsProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  if (props.mode === "access") {
    return (
      <View>
        <Text style={styles.sectionTitle}>Quick access</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accessRow}
        >
          {ACCESS_ITEMS.map((item) => (
            <PressableScale
              key={item.label}
              style={styles.accessCard}
              onPress={props[item.handler]}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={Colors.primaryPlum}
              />
              <Text
                style={styles.accessLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {item.label}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.hugiCard, compact && styles.hugiCardCompact]}>
      <Text style={styles.sparkleOne}>+</Text>
      <Text style={styles.sparkleTwo}>+</Text>
      <Image
        source={HUGI_HANDS_TOGETHER}
        style={[styles.hugiImage, compact && styles.hugiImageCompact]}
        resizeMode="contain"
      />
      <View style={styles.hugiCopy}>
        <Text style={styles.hugiTitle}>Hugi is here for you</Text>
        <Text style={styles.hugiSub}>
          Transitions can be hard. I'm here whenever you need support.
        </Text>
        <View style={styles.buttonRow}>
          <PressableScale
            style={styles.primaryAction}
            onPress={props.onHugiPress}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.primaryActionText}>Talk to Hugi</Text>
          </PressableScale>
          <PressableScale
            style={styles.secondaryAction}
            onPress={props.onSupportPress}
          >
            <Ionicons
              name="leaf-outline"
              size={18}
              color={Colors.primaryPlum}
            />
            <Text style={styles.secondaryActionText}>Calming tools</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hugiCard: {
    minHeight: 144,
    backgroundColor: "#F3EDFF",
    borderRadius: 20,
    paddingVertical: 12,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    ...Shadows.card,
  },
  hugiCardCompact: {
    minHeight: 136,
  },
  hugiImage: {
    width: 108,
    height: 128,
    alignSelf: "center",
  },
  hugiImageCompact: {
    width: 96,
    height: 116,
  },
  hugiCopy: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 10,
  },
  hugiTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Fonts.extrabold,
    color: Colors.textPrimary,
  },
  hugiSub: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.regular,
    color: Colors.secondaryPlum,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 7,
    marginTop: 7,
  },
  primaryAction: {
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryPlum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryAction: {
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cardBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...Shadows.card,
  },
  primaryActionText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: "#FFFFFF",
  },
  secondaryActionText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.primaryPlum,
  },
  sparkleOne: {
    position: "absolute",
    top: 8,
    right: 24,
    color: Colors.purple,
    fontSize: 20,
    fontFamily: Fonts.regular,
  },
  sparkleTwo: {
    position: "absolute",
    top: 30,
    right: 46,
    color: Colors.mutedGold,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: Fonts.semibold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  accessRow: {
    gap: 8,
    paddingRight: 16,
  },
  accessCard: {
    width: 82,
    height: 74,
    borderRadius: 14,
    backgroundColor: Colors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    ...Shadows.card,
  },
  accessLabel: {
    fontSize: 10.5,
    lineHeight: 13,
    fontFamily: Fonts.semibold,
    color: Colors.primaryPlum,
    textAlign: "center",
    marginTop: 6,
  },
});
