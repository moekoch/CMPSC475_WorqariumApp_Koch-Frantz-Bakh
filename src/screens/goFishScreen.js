import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WaterBackground from '../components/aquarium/WaterBackground';
import { COLORS, FONTS, RADII } from '../constants/theme';

const CARD_BACK = require('../../assets/images/cards/gray_back.png');
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['C', 'D', 'H', 'S'];
const RANK_NAMES = { A: 'Aces', J: 'Jacks', Q: 'Queens', K: 'Kings' };
const SUIT_NAMES = { C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' };
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

function getRankName(rank) {
  return RANK_NAMES[rank] || `${rank}s`;
}

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
    <WaterBackground style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ Games</Text>
          </Pressable>
          <Text style={styles.title}>Go Fish</Text>
        </View>

        <View style={styles.table}>
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

          <View style={styles.messageBox} accessibilityLiveRegion="polite">
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
                  <Pressable
                    key={card.code}
                    accessibilityRole="button"
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
                    style={[styles.handCard, selected && styles.selectedCard]}
                  >
                    <Image
                      accessibilityIgnoresInvertColors
                      source={card.image}
                      resizeMode="stretch"
                      style={styles.cardImage}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.emptyHint}>No cards in your hand.</Text>
          )}
          <Text style={styles.handSubtitle}>
            Books: {game.playerBooks.length}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !game.selectedRank || game.gameOver || game.turn !== 'player',
            }}
            disabled={!game.selectedRank || game.gameOver || game.turn !== 'player'}
            onPress={handleAsk}
            style={[
              styles.askButton,
              (!game.selectedRank || game.gameOver) && styles.disabledButton,
            ]}
          >
            <Text style={styles.askButtonText}>
              {game.gameOver
                ? 'Round over'
                : game.selectedRank
                  ? `Ask for ${getRankName(game.selectedRank)}`
                  : 'Choose a card to ask'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
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
  },
  title: {
    color: COLORS.ink,
    fontFamily: FONTS.heading,
    fontSize: 32,
    marginTop: 2,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
  },
  table: {
    backgroundColor: 'rgba(251,253,249,0.94)',
    borderColor: COLORS.glassEdge,
    borderRadius: 28,
    borderWidth: 1,
    padding: 16,
    width: '100%',
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
    color: COLORS.ink,
    fontFamily: FONTS.heading,
    fontSize: 17,
    fontWeight: 'bold',
  },
  cardCount: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.body,
    fontSize: 13,
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
    color: COLORS.inkSoft,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    marginLeft: 8,
  },
  emptyHint: {
    color: COLORS.inkFaint,
    fontFamily: FONTS.body,
    fontSize: 14,
    paddingVertical: 8,
  },
  booksText: {
    color: COLORS.seaweed,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
  },
  handSubtitle: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
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
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 4,
  },
  messageBox: {
    backgroundColor: COLORS.skylight,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageText: {
    color: COLORS.ink,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
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
    paddingVertical: 10,
  },
  handCard: {
    borderColor: 'transparent',
    borderRadius: 9,
    borderWidth: 3,
    padding: 1,
  },
  selectedCard: {
    borderColor: COLORS.coral,
    transform: [{ translateY: -5 }],
  },
  cardImage: {
    borderRadius: 5,
    height: 96,
    width: 66,
  },
  askButton: {
    alignItems: 'center',
    backgroundColor: COLORS.deepWater,
    borderRadius: 16,
    marginTop: 4,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  disabledButton: { backgroundColor: COLORS.inkFaint },
  askButtonText: {
    color: COLORS.pearl,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    textAlign: 'center',
  },
  newGameButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  newGameText: {
    color: COLORS.deepWater,
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
  },
});
