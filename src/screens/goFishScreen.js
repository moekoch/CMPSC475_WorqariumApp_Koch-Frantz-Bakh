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
import Card from '../components/Card';
import { AERO, Glass, GlossButton, TopPill } from '../components/GoFishUI';
import WaterBackground from '../components/aquarium/WaterBackground';
import {
  CARD_BACK,
  RANKS,
  SUITS,
  SUIT_NAMES,
} from '../constants/gameConstants';
import { COLORS, FONTS, RADII } from '../constants/theme';

const RANK_NAMES = { A: 'Aces', J: 'Jacks', Q: 'Queens', K: 'Kings' };

function getRankName(rank) {
  return RANK_NAMES[rank] || `${rank}s`;
}

function createDeck() {
  const deck = RANKS.flatMap((rank) =>
    SUITS.map((suit) => {
      const code = `${rank}${suit}`;
      return { id: code, code, rank };
    }),
  );

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  return deck
}

function collectBooks(hand, existingBooks) {
  const counts = hand.reduce((result, card) => {
    result[card.rank] = (result[card.rank] ?? 0) + 1
    return result
  }, {})
  const completedRanks = Object.keys(counts).filter((rank) => counts[rank] === 4)

  return {
    hand: hand.filter((card) => !completedRanks.includes(card.rank)),
    books: [...existingBooks, ...completedRanks],
  }
}

function createGame() {
  const deck = createDeck()
  const playerHand = deck.splice(0, 7)
  const computerHand = deck.splice(0, 7)
  const player = collectBooks(playerHand, [])
  const computer = collectBooks(computerHand, [])

  return {
    deck,
    playerHand: player.hand,
    computerHand: computer.hand,
    playerBooks: player.books,
    computerBooks: computer.books,
    turn: "player",
    selectedRank: null,
    message: "Your turn: choose a card rank to ask for.",
    gameOver: false,
  }
}

function finishIfNeeded(game) {
  const computerRanks = new Set(game.computerHand.map((card) => card.rank));
  const hasPossibleMatch = game.playerHand.some((card) => computerRanks.has(card.rank));
  const gameOver =
    game.playerBooks.length + game.computerBooks.length === 13 ||
    (game.deck.length === 0 &&
      (game.playerHand.length === 0 ||
        game.computerHand.length === 0 ||
        !hasPossibleMatch));

  if (!gameOver) return game

  const message =
    game.playerBooks.length > game.computerBooks.length
      ? "You win! You collected the most books."
      : game.playerBooks.length < game.computerBooks.length
        ? "The Shark wins this round."
        : "It’s a tie!"

  return { ...game, gameOver: true, turn: 'finished', selectedRank: null, message }
}

function replenishPlayerHand(game) {
  let next = game;

  while (next.playerHand.length === 0 && next.deck.length > 0) {
    const [drawnCard, ...deck] = next.deck;
    const player = collectBooks([drawnCard], next.playerBooks);
    next = {
      ...next,
      deck,
      playerHand: player.hand,
      playerBooks: player.books,
      message: 'You drew a card because your hand was empty. Your turn.',
    };
  }

  return next;
}

function askForRank(game, rank) {
  if (
    game.gameOver ||
    game.turn !== 'player' ||
    !game.playerHand.some((card) => card.rank === rank)
  ) {
    return game;
  }

  const matches = game.computerHand.filter((card) => card.rank === rank)

  if (matches.length > 0) {
    const player = collectBooks(
      [...game.playerHand, ...matches],
      game.playerBooks,
    )
    return finishIfNeeded(replenishPlayerHand({
      ...game,
      playerHand: player.hand,
      computerHand: game.computerHand.filter((card) => card.rank !== rank),
      playerBooks: player.books,
      turn: 'player',
      selectedRank: null,
      message: `The Shark had ${matches.length} ${getRankName(rank)}! Ask again.`,
    }))
  }

  if (game.deck.length === 0) {
    return finishIfNeeded({
      ...game,
      turn: 'computer',
      selectedRank: null,
      message: "Go Fish! The deck is empty. The Shark’s turn.",
    })
  }

  const [drawnCard, ...deck] = game.deck
  const player = collectBooks([...game.playerHand, drawnCard], game.playerBooks)
  const drewRequestedRank = drawnCard.rank === rank

  const updatedGame = {
    ...game,
    deck,
    playerHand: player.hand,
    playerBooks: player.books,
    turn: drewRequestedRank ? 'player' : 'computer',
    selectedRank: null,
    message: drewRequestedRank
      ? `Go Fish! You drew the ${getRankName(rank).replace(/s$/, '')} you asked for. Ask again.`
      : 'Go Fish! You drew a card. The Shark’s turn.',
  };
  return finishIfNeeded(
    drewRequestedRank ? replenishPlayerHand(updatedGame) : updatedGame,
  );
}

function playComputerTurn(game) {
  let next = game;

  while (next.turn === 'computer' && !next.gameOver) {
    if (next.computerHand.length === 0) {
      if (next.deck.length === 0) {
        return finishIfNeeded(next);
      }

      const [drawnCard, ...deck] = next.deck;
      const computer = collectBooks([drawnCard], next.computerBooks);
      next = {
        ...next,
        deck,
        computerHand: computer.hand,
        computerBooks: computer.books,
        turn: 'player',
        message: 'The Shark drew a card because its hand was empty. Your turn.',
      };
      break;
    }

    const rank = next.computerHand[
      Math.floor(Math.random() * next.computerHand.length)
    ].rank;
    const matches = next.playerHand.filter((card) => card.rank === rank);

    if (matches.length > 0) {
      const computer = collectBooks(
        [...next.computerHand, ...matches],
        next.computerBooks,
      );
      next = finishIfNeeded({
        ...next,
        computerHand: computer.hand,
        playerHand: next.playerHand.filter((card) => card.rank !== rank),
        computerBooks: computer.books,
        message: `The Shark asked for ${getRankName(rank)} and got them. It asks again.`,
      });
      continue;
    }

    if (next.deck.length === 0) {
      next = {
        ...next,
        turn: 'player',
        message: 'The Shark went fish, but the deck is empty. Your turn.',
      };
      break;
    }

    const [drawnCard, ...deck] = next.deck;
    const computer = collectBooks(
      [...next.computerHand, drawnCard],
      next.computerBooks,
    );
    const drewRequestedRank = drawnCard.rank === rank;
    next = finishIfNeeded({
      ...next,
      deck,
      computerHand: computer.hand,
      computerBooks: computer.books,
      turn: drewRequestedRank ? 'computer' : 'player',
      message: drewRequestedRank
        ? 'The Shark went fish and drew the rank it asked for. It asks again.'
        : 'The Shark went fish. Your turn.',
    });
  }

  if (next.turn === 'player' && next.playerHand.length === 0 && next.deck.length > 0) {
    next = replenishPlayerHand(next);
  }

  return finishIfNeeded(next);
}

export default function GoFishScreen({ navigation }) {
  const [game, setGame] = useState(createGame);
  const insets = useSafeAreaInsets();

  const newGame = () => setGame(createGame());
  const handleAsk = () => {
    const playerTurn = askForRank(game, game.selectedRank);
    setGame(playerTurn.turn === 'computer' ? playComputerTurn(playerTurn) : playerTurn);
  };
  const sortedHand = [...game.playerHand].sort(
    (a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank) || a.code.localeCompare(b.code),
  );

  return (
    <WaterBackground
      style={styles.root}
      imageSource={require('../../assets/images/backgrounds/gameOcean.jpg')}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TopPill
            label="‹ Games"
            accessibilityLabel="Back to Games"
            onPress={() => navigation?.goBack()}
            styles={styles}
          />
          <Text accessibilityRole="header" style={styles.title}>Go Fish</Text>
        </View>

        <Glass
          tint={AERO.panel}
          radius={28}
          style={styles.table}
          styles={styles}
        >
          <View style={styles.opponentArea}>
            <Image
              accessibilityLabel="Shark"
              source={require('../../assets/images/fish/shark.png')}
              resizeMode="contain"
              style={styles.sharkImage}
            />
            <View style={styles.sharkHand}>
              <View style={styles.opponentHeading}>
                <Text style={styles.sectionTitle}>Shark&apos;s hand · {game.computerHand.length} cards</Text>
              </View>
              <View style={styles.hiddenCards}>
                {game.computerHand.length > 0 ? (
                  <>
                    {Array.from({ length: Math.min(game.computerHand.length, 4) }, (_, index) => (
                      <Image
                        key={index}
                        accessibilityLabel="Face-down card"
                        source={CARD_BACK}
                        resizeMode="stretch"
                        style={[styles.backCard, index > 0 && styles.overlapCard]}
                      />
                    ))}
                    {game.computerHand.length > 4 && (
                      <Text style={styles.extraCards}>+{game.computerHand.length - 4}</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.emptyHint}>No cards</Text>
                )}
              </View>
              <Text style={styles.handSubtitle}>
                Books: {game.computerBooks.length}
              </Text>
            </View>
          </View>

          <View style={styles.pondArea}>
            <Image
              accessibilityLabel={game.deck.length > 0 ? 'Go Fish draw pile' : 'Empty draw pile'}
              source={CARD_BACK}
              resizeMode="stretch"
              style={[styles.pondCard, game.deck.length === 0 && styles.emptyPond]}
            />
            <Text style={styles.pondCount}>{game.deck.length} cards left</Text>
          </View>

          <View style={styles.messageBox} accessibilityLiveRegion="polite" accessibilityRole="text">
            <Text style={styles.messageText}>{game.message}</Text>
          </View>

          <View style={styles.handHeader}>
            <Text style={styles.sectionTitle}>Your hand · {game.playerHand.length} cards</Text>
          </View>
          {game.playerHand.length > 0 ? (
            <ScrollView
              horizontal
              contentContainerStyle={styles.hand}
              showsHorizontalScrollIndicator={false}
            >
              {sortedHand.map((card) => {
                const rank = card.rank;
                const selected = game.selectedRank === rank;
                return (
                  <Card
                    key={card.code}
                    card={card}
                    accessibilityLabel={`${card.code.slice(0, -1)} of ${
                      SUIT_NAMES[card.code.slice(-1)]
                    }, ${
                      selected ? 'selected' : 'not selected'
                    }`}
                    accessibilityState={{ selected }}
                    onPress={() => setGame((current) => ({
                      ...current,
                      selectedRank:
                        current.gameOver || current.turn !== 'player' ? null : rank,
                    }))}
                    imageContainerStyle={styles.cardImageContainer}
                    imageStyle={styles.cardImage}
                    resizeMode="stretch"
                    style={[
                      styles.handCard,
                      selected && styles.selectedCard,
                    ]}
                  />
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.emptyHint}>No cards in your hand.</Text>
          )}
          <Text style={styles.handSubtitle}>
            Books: {game.playerBooks.length}
          </Text>

          <GlossButton
            label={
              game.gameOver
                ? 'Round over'
                : game.selectedRank
                  ? `Ask for ${getRankName(game.selectedRank)}`
                  : 'Choose a card to ask'
            }
            disabled={!game.selectedRank || game.gameOver || game.turn !== 'player'}
            onPress={handleAsk}
            styles={styles}
          />
        </Glass>
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={() => navigation?.goBack?.()}
        statusBarTranslucent
        transparent
        visible={game.gameOver}
      >
        <View style={styles.gameOverOverlay}>
          <View accessibilityViewIsModal style={styles.gameOverCard}>
            <Glass tint={AERO.modal} radius={28} styles={styles} style={styles.gameOverSurface}>
              <Text accessibilityRole="header" style={styles.gameOverMessage}>{game.message}</Text>
              <GlossButton
                label="Play again"
                onPress={newGame}
                styles={styles}
                style={styles.playAgainButton}
              />
            </Glass>
          </View>
        </View>
      </Modal>
    </WaterBackground>
  );
}

const textGlow = {
  textShadowColor: 'rgba(0,36,70,0.8)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
};

const titleGlow = {
  textShadowColor: 'rgba(0,36,70,0.7)',
  textShadowOffset: { width: 0, height: 3 },
  textShadowRadius: 6,
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    position: 'relative',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backText: {
    color: COLORS.deepWater,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    ...textGlow,
  },
  topPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(6,66,112,0.5)',
    borderColor: AERO.rim,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    left: 0,
    minHeight: 38,
    overflow: 'hidden',
    position: 'absolute',
    width: 96,
  },
  topPillText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    ...textGlow,
  },
  title: {
    color: COLORS.surfaceFoam,
    fontFamily: FONTS.heading,
    fontSize: 32,
    marginTop: 2,
    fontWeight: 'bold',
    ...titleGlow,
  },
  subtitle: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
    ...textGlow,
  },
  table: {
    borderColor: COLORS.glassEdge,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    minHeight: 520,
    overflow: 'hidden',
    padding: 16,
    width: '100%',
    ...RADII.organicA,
  },
  glass: {
    overflow: 'hidden',
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    ...RADII.organicA,
  },
  opponentArea: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    borderBottomColor: COLORS.skylight,
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  sharkImage: {
    height: 130,
    width: 130,
  },
  sharkHand: {
    alignItems: 'center',
    flex: 1,
  },
  opponentHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    color: AERO.textMuted,
    fontFamily: FONTS.heading,
    fontSize: 15,
    ...textGlow,
  },
  cardCount: {
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    ...textGlow,
  },
  hiddenCards: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 62,
    justifyContent: 'center',
  },
  backCard: {
    borderColor: COLORS.pearl,
    borderRadius: 5,
    borderWidth: 1,
    height: 58,
    width: 42,
  },
  overlapCard: { marginLeft: -20 },
  extraCards: {
    color: AERO.textMuted,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    marginLeft: 8,
    ...textGlow,
  },
  emptyHint: {
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 14,
    paddingVertical: 8,
    ...textGlow,
  },
  booksText: {
    color: AERO.mint,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
    ...textGlow,
  },
  handSubtitle: {
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    ...textGlow,
  },
  pondArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  pondCard: {
    borderColor: COLORS.pearl,
    borderRadius: 8,
    borderWidth: 2,
    height: 78,
    width: 56,
  },
  emptyPond: { opacity: 0.35 },
  pondCount: {
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 4,
    ...textGlow,
  },
  messageBox: {
    backgroundColor: AERO.panelSoft,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageText: {
    color: COLORS.pearl,
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
    ...textGlow,
  },
  handHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
  },
  hand: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 18,
  },
  handCard: {
    borderColor: 'transparent',
    borderRadius: 9,
    borderWidth: 3,
    height: 104,
    padding: 1,
    width: 74,
  },
  selectedCard: {
    borderColor: AERO.mint,
    borderWidth: 2,
    elevation: 10,
    shadowColor: AERO.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 9,
    transform: [{ translateY: -14 }, { scale: 1.08 }],
    zIndex: 10,
  },
  cardImage: {
    borderRadius: 5,
    height: 96,
    width: 66,
  },
  cardImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glossButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 4,
    minHeight: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  glossButtonShine: {
    height: '55%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  glossButtonText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    textAlign: 'center',
    ...textGlow,
  },
  disabledButton: { opacity: 0.55 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  glossButtonSmall: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
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
  gameOverSurface: {
    alignItems: 'center',
    padding: 24,
  },
  gameOverMessage: {
    color: AERO.ink,
    fontFamily: FONTS.heading,
    fontSize: 26,
    marginBottom: 16,
    textAlign: 'center',
  },
  playAgainButton: { width: '100%' },
  newGameButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  newGameText: {
    color: COLORS.deepWater,
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    ...textGlow,
  },
});
