import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';

export default function AddActivityScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>Add Activity</Text>
        <Text style={styles.sub}>Coming soon 💜</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.pageBg },
  header: { padding: 16, borderBottomWidth: 0.5, borderBottomColor: Colors.cardBorder, backgroundColor: '#fff' },
  back: { fontSize: 14, color: Colors.purple },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '500', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textMuted },
});
