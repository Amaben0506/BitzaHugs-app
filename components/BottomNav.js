import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BottomNav({ currentScreen, setScreen }) {
  const tabs = [
    { name: 'Home', icon: '⌂' },
    { name: 'Routines', icon: '□' },
    { name: 'Support', icon: '♡' },
    { name: 'Progress', icon: '↗' },
    { name: 'Settings', icon: '⚙' },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = currentScreen === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => setScreen(tab.name)}
          >
            <View style={active ? styles.activeCircle : null}>
              <Text style={active ? styles.activeIcon : styles.icon}>
                {tab.icon}
              </Text>
            </View>

            <Text style={active ? styles.activeText : styles.text}>
              {tab.name}
            </Text>

            {active && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFDF9',
    paddingTop: 12,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderColor: '#F1E9E2',
  },

  navItem: {
    alignItems: 'center',
    width: 70,
  },

  activeCircle: {
    backgroundColor: '#EFE6FF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  icon: {
    fontSize: 24,
    color: '#8A86A0',
  },

  activeIcon: {
    fontSize: 24,
    color: '#6F4BCB',
    fontWeight: '700',
  },

  text: {
    marginTop: 4,
    color: '#8A86A0',
    fontSize: 12,
    fontWeight: '600',
  },

  activeText: {
    marginTop: 4,
    color: '#6F4BCB',
    fontSize: 12,
    fontWeight: '700',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6F4BCB',
    marginTop: 4,
  },
});
