import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function SupportCard({ onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Ionicons name="heart" size={24} color="#FFFFFF" />
      </View>

      <View style={styles.textBox}>
        <Text style={styles.title}>
          I Need Support Right Now
        </Text>

        <Text style={styles.text}>
          Get immediate calming support and guidance.
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={26}
        color="#6F4BCB"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFE5DE',
    marginTop: 22,
    padding: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#D6AFA3',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F29C8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  textBox: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#2D2357',
  },

  text: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: '#4E4A69',
    marginTop: 4,
    lineHeight: 21,
  },
});