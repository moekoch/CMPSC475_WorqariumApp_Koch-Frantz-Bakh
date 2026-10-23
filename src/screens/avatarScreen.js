import { StyleSheet, Text, View } from 'react-native';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { COLORS, FONTS } from '../constants/theme';

export default function AvatarScreen({ navigation }) {
  return (
    <WaterBackground style={styles.root}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>My Fish</Text>
          <Text style={styles.description}>
            Your fish collection and avatar will appear here.
          </Text>
        </View>
      </View>
      <WorqariumNav active="Avatar" navigation={navigation} />
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 90,
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.pearl,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
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
    textAlign: 'center',
  },
});
