import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';

const RESOURCES = [
  { label: 'Medical emergencies', action: 'Call 911', url: 'tel:911', color: '#C03060' },
  { label: 'Mental health crisis', action: 'Call or text 988', url: 'tel:988', color: '#C06030' },
  { label: 'Crisis text support', action: 'Text HOME to 741741', url: 'sms:741741', color: Colors.textPrimary },
  { label: 'NAMI support line', action: 'Call 1-800-950-6264', url: 'tel:18009506264', color: Colors.textPrimary },
];

export default function SafetyInfoScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Safety Information</Text>
        <Text style={styles.intro}>
          BitzaHugs offers emotional and organizational support only. It is not a substitute for professional medical care, therapy, or emergency services.
        </Text>
        <View style={styles.card}>
          {RESOURCES.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.row, i < RESOURCES.length - 1 && styles.rowBorder]}
              onPress={() => Linking.openURL(r.url)}
              activeOpacity={0.8}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={[styles.rowAction, { color: r.color }]}>{r.action}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.footer}>
          If you are in immediate danger, call 911 now. BitzaHugs cannot contact emergency services on your behalf.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },
  header: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardBorder,
    backgroundColor: '#fff',
  },
  back: { fontSize: 14, color: Colors.purple },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  intro: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.cardBorder,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 2 },
  rowAction: { fontSize: 15, fontWeight: '600' },
  arrow: { fontSize: 16, color: Colors.textMuted },
  footer: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
