import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function RoutineCard({
  icon,
  title,
  time,
  done,
  onPress,
  onDelete,
  onEdit,
}) {
  return (
    <TouchableOpacity style={styles.routineItem} onPress={onPress}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.textBox}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>

        <Text style={styles.time}>{time}</Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={20} color="#C98E8E" />
      </TouchableOpacity>

      <View style={done ? styles.doneCircle : styles.emptyCircle}>
        {done && <Text style={styles.check}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E9E2',
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F3EAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 28,
  },

  textBox: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: '#26224C',
  },

  time: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    marginTop: 4,
    color: '#6F4BCB',
  },

  deleteButton: {
    marginRight: 14,
  },

  doneCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCCBFA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  check: {
    color: '#5E38B5',
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
  },

  emptyCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#D8CDC8',
  },
});