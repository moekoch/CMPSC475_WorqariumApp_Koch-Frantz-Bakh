import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BlackjackImage from '../../assets/images/games/Blackjack.png';
import GoFishImage from '../../assets/images/games/GoFish.png';
import SpadesImage from '../../assets/images/games/Spades.png';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { COLORS, FONTS } from '../constants/theme';

const GAMES = [
  {
    title: 'Go Fish',
    subtitle: 'Make a match, build a book.',
    detail: 'A quick, cheerful game of memory and timing.',
    image: GoFishImage,
    route: 'goFish',
    accent: ['#C4F5DE', '#70D9AE'],
    mark: '01',
  },
  {
    title: 'Blackjack',
    subtitle: 'Get close to 21.',
    detail: 'Read the table and know when to hold.',
    image: BlackjackImage,
    route: 'blackjack',
    accent: ['#D7F2FF', '#83D4EF'],
    mark: '02',
  },
  {
    title: 'Spades',
    subtitle: 'Bid smart. Win the trick.',
    detail: 'A four-player classic, with your team against theirs.',
    image: SpadesImage,
    route: 'spades',
    accent: ['#FFE9A3', '#F6BD4A'],
    mark: '03',
  },
];

export default function GamesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const compact = height < 800;
  const short = height < 680;

  return (
    <WaterBackground style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: compact ? 12 : 16,
            paddingBottom: insets.bottom + 96,
            paddingTop: insets.top + (compact ? 8 : 14),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heading, compact && styles.headingCompact]}>
          {!short && <Text style={styles.eyebrow}>THE REEF ARCADE</Text>}
          <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact]}>
            Pick your game
          </Text>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.headingAccent} />
          {!short && (
            <Text style={styles.description}>
              Three ways to make a splash. Choose a table and dive in.
            </Text>
          )}
        </View>

        <View style={[styles.gameList, { gap: compact ? 9 : 12 }]}>
          {GAMES.map((game, index) => (
            <Pressable
              key={game.route}
              accessibilityRole="button"
              accessibilityLabel={`${game.title}. ${game.subtitle} ${game.detail} Play now`}
              accessibilityHint={`Opens the ${game.title} game`}
              onPress={() => navigation.navigate(game.route)}
              style={({ pressed }) => [
                styles.gameCard,
                { minHeight: short ? 112 : compact ? 150 : 164 },
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={['rgba(10,83,127,0.88)', 'rgba(3,43,76,0.92)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {!compact && (
                <View style={styles.cardTop}>
                  <View style={[styles.numberBadge, { backgroundColor: game.accent[0] }]}>
                    <Text style={styles.numberText}>{game.mark}</Text>
                  </View>
                  <Text style={styles.cardCategory}>{index === 2 ? 'TEAM PLAY' : 'QUICK PLAY'}</Text>
                </View>
              )}

              <View style={styles.cardBody}>
                <View style={styles.gameCopy}>
                  <Text style={[styles.gameTitle, compact && styles.gameTitleCompact]}>
                    {game.title}
                  </Text>
                  <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
                  {!compact && <Text style={styles.gameDetail}>{game.detail}</Text>}
                  <View style={[styles.playButton, compact && styles.playButtonCompact]}>
                    <Text style={styles.playText}>Play now</Text>
                    <Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.playArrow}>›</Text>
                  </View>
                </View>
                <Image
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  source={game.image}
                  resizeMode="contain"
                  style={[styles.gameImage, compact && styles.gameImageCompact]}
                />
              </View>
              <View pointerEvents="none" style={styles.cardShine} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <WorqariumNav active="Games" navigation={navigation} />
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: 16,
    maxWidth: 760,
    paddingHorizontal: 16,
    width: '100%',
  },
  heading: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headingCompact: { paddingVertical: 2 },
  eyebrow: {
    color: COLORS.deepWater,
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 1,
  },
  title: {
    color: COLORS.abyss,
    fontFamily: FONTS.display,
    fontSize: 36,
    lineHeight: 42,
    textAlign: 'center',
  },
  titleCompact: { fontSize: 32, lineHeight: 37 },
  headingAccent: {
    backgroundColor: COLORS.deepWater,
    borderRadius: 999,
    height: 4,
    marginTop: 3,
    width: 48,
  },
  description: {
    color: COLORS.deepWater,
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 5,
    maxWidth: 440,
    textAlign: 'center',
  },
  gameList: { gap: 12 },
  gameCard: {
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#002446',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 7,
  },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  numberBadge: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: 14,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 34,
  },
  numberText: { color: '#0B4A74', fontFamily: FONTS.bodyBold, fontSize: 12 },
  cardCategory: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  cardBody: { alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  gameCopy: { flex: 1, paddingRight: 4 },
  gameTitle: {
    color: COLORS.pearl,
    fontFamily: FONTS.heading,
    fontSize: 25,
    lineHeight: 28,
    marginTop: 4,
    textShadowColor: 'rgba(0,36,70,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  gameTitleCompact: { fontSize: 21, lineHeight: 25, marginTop: 1 },
  gameSubtitle: { color: '#B8F4DE', fontFamily: FONTS.bodyBold, fontSize: 14, marginTop: 1 },
  gameDetail: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
    maxWidth: 230,
  },
  gameImageCompact: { height: 82, width: 82 },
  playButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#B8F4DE',
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 5,
    minHeight: 40,
    paddingHorizontal: 15,
  },
  playButtonCompact: { marginTop: 5, minHeight: 44 },
  playText: { color: '#0B4A74', fontFamily: FONTS.bodyBold, fontSize: 14 },
  playArrow: { color: '#0B4A74', fontFamily: FONTS.bodyBold, fontSize: 20, lineHeight: 22 },
  gameImage: { height: 100, width: 100 },
  cardShine: {
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 200,
    borderWidth: 22,
    height: 210,
    position: 'absolute',
    right: -120,
    top: -135,
    width: 260,
  },
  pressed: { opacity: 0.87, transform: [{ scale: 0.985 }] },
});
