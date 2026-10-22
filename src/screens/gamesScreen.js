import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BlackjackImage from '../../assets/images/games/Blackjack.png';
import GoFishImage from '../../assets/images/games/GoFish.png';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { COLORS, FONTS, RADII } from '../constants/theme';

export default function GamesScreen({ navigation }) {
  return (
    <WaterBackground style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Games</Text>
          <Text style={styles.description}>Choose a game to play together.</Text>
        </View>
        <View style={styles.card}>
          <Image source={GoFishImage} resizeMode="contain" style={styles.gameImage} />
          <Pressable style={styles.button} onPress={() => navigation.navigate('goFish')}>
            <Text style={styles.BtnText}>Go Fish</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Image source={BlackjackImage} resizeMode="contain" style={styles.gameImage} />
          <Pressable style={styles.button} onPress={() => navigation.navigate('blackjack')}>
            <Text style={styles.BtnText}>Blackjack</Text>
          </Pressable>
        </View>
      </ScrollView>
      <WorqariumNav active="Games" navigation={navigation} />
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 110,
    gap: 16,
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.pearl,
    ...RADII.organicA,
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  gameImage: {
    width: 144,
    height: 110,
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
  button: {
    backgroundColor: COLORS.deepWater,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
  },
  BtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    color: COLORS.pearl,
  },
});
