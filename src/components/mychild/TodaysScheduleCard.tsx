import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts, Type, Shadows } from '../../theme/theme';
import PressableScale from '../ui/PressableScale';

type ScheduleStatus = 'completed' | 'pending' | 'skipped' | 'in-progress';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  type: 'routine' | 'appointment';
  status: ScheduleStatus;
  icon: string;
}

interface TodaysScheduleCardProps {
  items: ScheduleItem[];
  onAddActivity: () => void;
  onViewSchedule: () => void;
  onToggleComplete: (id: string) => void;
}

function StatusButton({ status, onPress }: { status: ScheduleStatus; onPress: () => void }) {
  let icon: React.ComponentProps<typeof Ionicons>['name'];
  let color: string;

  switch (status) {
    case 'completed':
      icon = 'checkmark-circle';
      color = Colors.green;
      break;
    case 'in-progress':
      icon = 'time';
      color = Colors.purple;
      break;
    case 'skipped':
      icon = 'close-circle';
      color = Colors.grayLavender;
      break;
    default:
      icon = 'ellipse-outline';
      color = Colors.cardBorder;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name={icon} size={22} color={color} />
    </TouchableOpacity>
  );
}

export default function TodaysScheduleCard({
  items,
  onAddActivity,
  onViewSchedule,
  onToggleComplete,
}: TodaysScheduleCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Today's Schedule</Text>
        </View>
        <TouchableOpacity onPress={onViewSchedule} activeOpacity={0.7}>
          <Text style={styles.headerLink}>View full schedule →</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No schedule items today</Text>
          <Text style={styles.emptyText}>Add routines or appointments when you are ready.</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isDone = item.status === 'completed';

          return (
            <View key={item.id} style={styles.row}>
              <Text style={styles.time}>{item.time}</Text>

              <View style={styles.connector}>
                <View style={[styles.lineSegment, isFirst && styles.lineInvisible]} />
                <View style={styles.dot} />
                <View style={[styles.lineSegment, isLast && styles.lineInvisible]} />
              </View>

              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>

              <View style={styles.textBlock}>
                <Text style={[styles.itemTitle, isDone && styles.itemTitleDone]}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                ) : null}
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>
                    {item.type === 'appointment' ? 'Appointment' : 'Routine'}
                  </Text>
                </View>
              </View>

              <StatusButton
                status={item.status}
                onPress={() => onToggleComplete(item.id)}
              />
            </View>
          );
          })}
        </View>
      )}

      <PressableScale style={styles.addBtn} onPress={onAddActivity}>
        <Text style={styles.addBtnText}>+ Add activity</Text>
      </PressableScale>
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
    marginBottom: 14,
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
  timeline: {
    gap: 0,
  },
  emptyState: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 12,
    padding: 12,
  },
  emptyTitle: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 48,
  },
  time: {
    width: 52,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    paddingTop: 16,
  },
  connector: {
    width: 20,
    alignItems: 'center',
  },
  lineSegment: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.cardBorder,
  },
  lineInvisible: {
    backgroundColor: 'transparent',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.grayLavender,
    marginVertical: 2,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.navActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 12,
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  itemTitleDone: {
    color: Colors.textMuted,
  },
  itemSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  typePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0EAFF',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginTop: 2,
  },
  typePillText: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: Colors.purple,
  },
  addBtn: {
    backgroundColor: Colors.navActiveBg,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.purple,
  },
});
