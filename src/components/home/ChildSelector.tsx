import React from "react";
import {
  Image,
  ImageSourcePropType,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts, Shadows } from "../../theme/theme";
import PressableScale from "../ui/PressableScale";

interface ChildSelectorProps {
  child: {
    name: string;
    age?: number | string;
    avatarEmoji?: string;
    avatarSource?: ImageSourcePropType;
  };
  onPress: () => void;
}

export default function ChildSelector({ child, onPress }: ChildSelectorProps) {
  return (
    <PressableScale style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        {child.avatarEmoji ? (
          <Text style={styles.avatarEmoji}>{child.avatarEmoji}</Text>
        ) : child.avatarSource ? (
          <Image
            source={child.avatarSource}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        ) : (
          <Ionicons
            name="person-outline"
            size={26}
            color={Colors.primaryPlum}
          />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{child.name}</Text>
        <Text style={styles.age}>
          {child.age ? `Age ${child.age}` : "Profile"}
        </Text>
      </View>
      <Ionicons
        name="chevron-down"
        size={18}
        color={Colors.grayLavender}
        style={styles.chevron}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Shadows.card,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.lavenderSurface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 36,
    height: 36,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  age: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    marginLeft: "auto",
  },
});
