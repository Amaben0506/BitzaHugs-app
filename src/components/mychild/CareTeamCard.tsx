import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  avatarEmoji?: string;
  initials: string;
}

interface CareTeamCardProps {
  members: CareTeamMember[];
  onViewAll: () => void;
  onAddMember: () => void;
}

export default function CareTeamCard({ members, onViewAll, onAddMember }: CareTeamCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Care Team</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.headerLink}>View all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.members}>
        {members.map((member) => (
          <View key={member.id} style={styles.memberItem}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{member.initials}</Text>
            </View>
            <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
            <Text style={styles.memberRole} numberOfLines={1}>{member.role}</Text>
          </View>
        ))}

        <PressableScale style={styles.memberItem} onPress={onAddMember}>
          <View style={styles.addCircle}>
            <Text style={styles.addPlus}>+</Text>
          </View>
          <Text style={styles.memberName} numberOfLines={1}> </Text>
          <Text style={styles.memberRole} numberOfLines={1}> </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...Type.cardTitle,
    color: Colors.textPrimary,
  },
  headerLink: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
  members: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  memberItem: {
    alignItems: 'center',
    width: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.purple,
  },
  memberName: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 3,
  },
  memberRole: {
    fontSize: 8,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  addCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.grayLavender,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlus: {
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: Colors.grayLavender,
    lineHeight: 22,
  },
});
