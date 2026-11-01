import { Pressable, StyleSheet, Text, View } from 'react-native';
import WaterBackground from '../components/aquarium/WaterBackground';
import { SCREEN_STYLES } from '../constants/theme';

export default function BlackjackScreen({ navigation }) {
  return (
    <WaterBackground style={styles.root}>
      <View style={styles.content}>
        <View style={SCREEN_STYLES.gamePlaceholderCard}>
          <Text style={SCREEN_STYLES.placeholderTitle}>Blackjack</Text>
          <Text style={SCREEN_STYLES.placeholderDescription}>Your Blackjack game will appear here.</Text>
          <Pressable style={SCREEN_STYLES.placeholderButton} onPress={() => navigation?.goBack()}>
            <Text style={SCREEN_STYLES.placeholderButtonText}>Back to games</Text>
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
});