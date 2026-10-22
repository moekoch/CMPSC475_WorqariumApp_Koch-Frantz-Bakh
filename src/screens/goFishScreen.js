import { Pressable, StyleSheet, Text, View } from 'react-native';
import WaterBackground from '../components/aquarium/WaterBackground';
import { COLORS, FONTS, RADII } from '../constants/theme';

export default function GoFishScreen({ navigation }) {
  return (
    <WaterBackground style={styles.root}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Go Fish</Text>
          <Text style={styles.description}>Your Go Fish game will appear here.</Text>
          <Pressable style={styles.button} onPress={() => navigation?.goBack()}>
            <Text style={styles.buttonText}>Back to games</Text>
          </Pressable>
        </View>
      </View>
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.pearl,
    ...RADII.organicA,
    padding: 28,
  },
  title: {
    color: COLORS.ink,
    fontFamily: FONTS.heading,
    fontSize: 28,
    marginBottom: 8,
  },
  description: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.deepWater,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: COLORS.pearl,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
  },
});
