import { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AERO, Glass, GlossButton, TopPill } from '../components/SpadesUI';
import WaterBackground from '../components/aquarium/WaterBackground';
import { COLORS, FONTS } from '../constants/theme';

const CARD_BACK = require('../../assets/images/cards/gray_back.png');
const SHARK = require('../../assets/images/fish/shark.png');
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['C', 'D', 'H', 'S'];
const CARD_IMAGES = {
  AC: require('../../assets/images/cards/AC.png'),
  AD: require('../../assets/images/cards/AD.png'),
  AH: require('../../assets/images/cards/AH.png'),
  AS: require('../../assets/images/cards/AS.png'),
  '2C': require('../../assets/images/cards/2C.png'),
  '2D': require('../../assets/images/cards/2D.png'),
  '2H': require('../../assets/images/cards/2H.png'),
  '2S': require('../../assets/images/cards/2S.png'),
  '3C': require('../../assets/images/cards/3C.png'),
  '3D': require('../../assets/images/cards/3D.png'),
  '3H': require('../../assets/images/cards/3H.png'),
  '3S': require('../../assets/images/cards/3S.png'),
  '4C': require('../../assets/images/cards/4C.png'),
  '4D': require('../../assets/images/cards/4D.png'),
  '4H': require('../../assets/images/cards/4H.png'),
  '4S': require('../../assets/images/cards/4S.png'),
  '5C': require('../../assets/images/cards/5C.png'),
  '5D': require('../../assets/images/cards/5D.png'),
  '5H': require('../../assets/images/cards/5H.png'),
  '5S': require('../../assets/images/cards/5S.png'),
  '6C': require('../../assets/images/cards/6C.png'),
  '6D': require('../../assets/images/cards/6D.png'),
  '6H': require('../../assets/images/cards/6H.png'),
  '6S': require('../../assets/images/cards/6S.png'),
  '7C': require('../../assets/images/cards/7C.png'),
  '7D': require('../../assets/images/cards/7D.png'),
  '7H': require('../../assets/images/cards/7H.png'),
  '7S': require('../../assets/images/cards/7S.png'),
  '8C': require('../../assets/images/cards/8C.png'),
  '8D': require('../../assets/images/cards/8D.png'),
  '8H': require('../../assets/images/cards/8H.png'),
  '8S': require('../../assets/images/cards/8S.png'),
  '9C': require('../../assets/images/cards/9C.png'),
  '9D': require('../../assets/images/cards/9D.png'),
  '9H': require('../../assets/images/cards/9H.png'),
  '9S': require('../../assets/images/cards/9S.png'),
  '10C': require('../../assets/images/cards/10C.png'),
  '10D': require('../../assets/images/cards/10D.png'),
  '10H': require('../../assets/images/cards/10H.png'),
  '10S': require('../../assets/images/cards/10S.png'),
  JC: require('../../assets/images/cards/JC.png'),
  JD: require('../../assets/images/cards/JD.png'),
  JH: require('../../assets/images/cards/JH.png'),
  JS: require('../../assets/images/cards/JS.png'),
  QC: require('../../assets/images/cards/QC.png'),
  QD: require('../../assets/images/cards/QD.png'),
  QH: require('../../assets/images/cards/QH.png'),
  QS: require('../../assets/images/cards/QS.png'),
  KC: require('../../assets/images/cards/KC.png'),
  KD: require('../../assets/images/cards/KD.png'),
  KH: require('../../assets/images/cards/KH.png'),
  KS: require('../../assets/images/cards/KS.png'),
};

function createDeck() {
  const deck = RANKS.flatMap((rank) =>
    SUITS.map((suit) => {
      const code = `${rank}${suit}`;
      return { code, rank, image: CARD_IMAGES[code] };
    }),
  );

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  return deck;
}

function getScore(hand) {
  let score = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      score += 11;
      aces += 1;
    } else {
      score += ['J', 'Q', 'K'].includes(card.rank) ? 10 : Number(card.rank);
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
}

function settleHand(playerHand, dealerHand) {
  const playerScore = getScore(playerHand);
  const dealerScore = getScore(dealerHand);
  let message;

  if (playerScore > 21) {
    message = 'Bust! The dealer wins.';
  } else if (dealerScore > 21) {
    message = 'The dealer busts! You win.';
  } else if (playerScore > dealerScore) {
    message = 'You win!';
  } else if (playerScore < dealerScore) {
    message = 'The dealer wins.';
  } else {
    message = 'It’s a tie.';
  }

  return { playerHand, dealerHand, phase: 'finished', message };
}

function createGame() {
  const deck = createDeck();
  const playerHand = [deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop()];
  const playerNatural = getScore(playerHand) === 21;
  const dealerNatural = getScore(dealerHand) === 21;

  if (playerNatural || dealerNatural) {
    return {
      deck,
      ...settleHand(playerHand, dealerHand),
      message:
        playerNatural && dealerNatural
          ? 'Both have Blackjack. It’s a tie.'
          : playerNatural
            ? 'Blackjack! You win.'
            : 'The dealer has Blackjack.',
    };
  }

  return {
    deck,
    playerHand,
    dealerHand,
    phase: 'player',
    message: 'Your turn. Hit or stand?',
  };
}

function stand(game) {
  if (game.phase !== 'player') return game;

  const deck = [...game.deck];
  const dealerHand = [...game.dealerHand];

  while (getScore(dealerHand) < 17 && deck.length > 0) {
    dealerHand.push(deck.pop());
  }

  return { ...game, ...settleHand(game.playerHand, dealerHand), deck };
}

function hit(game) {
  if (game.phase !== 'player' || game.deck.length === 0) return game;

  const deck = [...game.deck];
  const playerHand = [...game.playerHand, deck.pop()];
  const playerScore = getScore(playerHand);

  if (playerScore > 21) {
    return { ...game, ...settleHand(playerHand, game.dealerHand), deck };
  }

  const nextGame = {
    ...game,
    deck,
    playerHand,
    message: 'Your turn. Hit or stand?',
  };

  if (playerScore === 21 || deck.length === 0) {
    const settled = stand(nextGame);
    return {
      ...settled,
      message:
        playerScore === 21
          ? `21! ${settled.message}`
          : `No cards remain. ${settled.message}`,
    };
  }

  return nextGame;
}

function PlayingCards({ cards, hideSecondCard = false }) {
  return (
    <View style={styles.cardRow}>
      {cards.map((card, index) => {
        const hidden = hideSecondCard && index === 1;
        return (
          <Image
            key={card.code}
            accessibilityLabel={hidden ? 'Face-down card' : `${card.rank} playing card`}
            source={hidden ? CARD_BACK : card.image}
            resizeMode="stretch"
            style={styles.card}
          />
        );
      })}
    </View>
  );
}

export default function BlackjackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [game, setGame] = useState(createGame);
  const playerScore = getScore(game.playerHand);
  const showDealerScore = game.phase === 'finished';

  return (
    <WaterBackground style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TopPill
            label="‹ Games"
            accessibilityLabel="Back to Games"
            onPress={() => navigation?.goBack?.()}
            styles={styles}
          />
          <Text accessibilityRole="header" style={styles.title}>Blackjack</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Glass tint={AERO.panel} radius={18} style={styles.messageBox} styles={styles}>
          <Text style={styles.message} accessibilityRole="text" accessibilityLiveRegion="polite">
            {game.message}
          </Text>
        </Glass>
        <Glass tint={AERO.panel} radius={28} style={styles.table} styles={styles}>
          <View style={styles.dealerArea}>
            <Image
              accessibilityLabel="Shark dealer"
              source={SHARK}
              resizeMode="contain"
              style={styles.shark}
            />
            <View style={styles.handContent}>
              <View style={styles.handHeading}>
                <Text style={styles.handTitle}>Dealer</Text>
                {showDealerScore && (
                  <Text style={styles.score}>Score: {getScore(game.dealerHand)}</Text>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <PlayingCards
                  cards={game.dealerHand}
                  hideSecondCard={game.phase === 'player'}
                />
              </ScrollView>
            </View>
          </View>

          <View style={styles.playerArea}>
            <View style={styles.handHeading}>
              <Text style={styles.handTitle}>Your hand</Text>
              <Text style={styles.score}>Score: {playerScore}</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={styles.playerCards}
              showsHorizontalScrollIndicator={false}
            >
              <PlayingCards cards={game.playerHand} />
            </ScrollView>

            {game.phase === 'player' ? (
              <View style={styles.actions}>
                <GlossButton
                  label="Hit"
                  onPress={() => setGame((current) => hit(current))}
                  style={styles.actionButton}
                  styles={styles}
                />
                <GlossButton
                  label="Stand"
                  variant="aqua"
                  onPress={() => setGame((current) => stand(current))}
                  style={styles.actionButton}
                  styles={styles}
                />
              </View>
            ) : null}
          </View>
        </Glass>
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={() => navigation?.goBack?.()}
        statusBarTranslucent
        transparent
        visible={game.phase === 'finished'}
      >
        <View style={styles.gameOverOverlay}>
          <View accessibilityViewIsModal style={styles.gameOverCard}>
            <Glass tint={AERO.modal} radius={28} style={styles.gameOverSurface} styles={styles}>
              <Text accessibilityRole="header" style={styles.gameOverMessage}>{game.message}</Text>
              <GlossButton
                label="Play again"
                onPress={() => setGame(createGame())}
                style={styles.playAgainButton}
                styles={styles}
              />
            </Glass>
          </View>
        </View>
      </Modal>
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 14,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  headerSpacer: {
    position: 'absolute',
    right: 0,
    width: 96,
  },
  title: {
    color: COLORS.pearl,
    fontFamily: FONTS.heading,
    fontSize: 30,
    textShadowColor: AERO.shadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  topPill: {
    alignItems: 'center',
    backgroundColor: AERO.panel,
    borderColor: AERO.rim,
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    width: 96,
  },
  topPillText: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 13 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  glass: {
    borderColor: AERO.rim,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gloss: { ...StyleSheet.absoluteFillObject },
  buttonGradient: { ...StyleSheet.absoluteFillObject },
  messageBox: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 8 },
  table: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 360,
    padding: 14,
    width: '100%',
  },
  message: {
    color: COLORS.pearl,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: AERO.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dealerArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 124,
    marginBottom: 12,
  },
  shark: { width: 86, height: 100, marginRight: 10 },
  handContent: { flex: 1, minWidth: 0 },
  handHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  handTitle: { color: COLORS.pearl, fontFamily: FONTS.heading, fontSize: 18 },
  score: { color: AERO.mint, fontFamily: FONTS.bodyBold, fontSize: 13 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  card: { width: 56, height: 82, borderRadius: 7, marginRight: 7 },
  playerArea: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(3,48,88,0.3)',
    borderColor: AERO.rimSoft,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  playerCards: { minHeight: 90, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionButton: {
    flex: 1,
    minHeight: 46,
  },
  glossButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 44,
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  glossButtonText: { fontFamily: FONTS.bodyBold, fontSize: 16, letterSpacing: 0.3 },
  glossButtonSmall: { minHeight: 34, paddingHorizontal: 14 },
  glossButtonTextSmall: { fontSize: 13 },
  glossButtonShine: {
    borderRadius: 999,
    height: '46%',
    left: 10,
    position: 'absolute',
    right: 10,
    top: 2,
  },
  disabledButton: { opacity: 0.4 },
  gameOverOverlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(3,40,70,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gameOverCard: {
    maxWidth: 420,
    width: '100%',
  },
  gameOverSurface: { alignItems: 'center', padding: 24 },
  gameOverMessage: {
    color: AERO.ink,
    fontFamily: FONTS.heading,
    fontSize: 26,
    marginBottom: 16,
    textAlign: 'center',
  },
  playAgainButton: { width: '100%' },
});
