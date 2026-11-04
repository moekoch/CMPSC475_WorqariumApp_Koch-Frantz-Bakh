import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import FishSprite from '../components/aquarium/FishSprite';
import WaterBackground from '../components/aquarium/WaterBackground';
import { COLORS, FONTS } from '../constants/theme';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const SUITS = ['C', 'D', 'H', 'S'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = Object.fromEntries(RANKS.map((rank, index) => [rank, index + 2]));
const SUIT_NAMES = { C: 'Clubs', D: 'Diamonds', H: 'Hearts', S: 'Spades' };
const PLAYER_NAMES = ['You', 'Left Bot', 'Partner', 'Right Bot'];
const PLAYER_FISH = ['orangeClownfish', 'blueTang', 'moorishIdol', 'linedButterflyfish'];
const WINNING_SCORE = 500;
const HAND_SIZE = 13;
const TRICKS_PER_HAND = 13;

const CARD_IMAGES = {
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
  AC: require('../../assets/images/cards/AC.png'),
  AD: require('../../assets/images/cards/AD.png'),
  AH: require('../../assets/images/cards/AH.png'),
  AS: require('../../assets/images/cards/AS.png'),
  JC: require('../../assets/images/cards/JC.png'),
  JD: require('../../assets/images/cards/JD.png'),
  JH: require('../../assets/images/cards/JH.png'),
  JS: require('../../assets/images/cards/JS.png'),
  KC: require('../../assets/images/cards/KC.png'),
  KD: require('../../assets/images/cards/KD.png'),
  KH: require('../../assets/images/cards/KH.png'),
  KS: require('../../assets/images/cards/KS.png'),
  QC: require('../../assets/images/cards/QC.png'),
  QD: require('../../assets/images/cards/QD.png'),
  QH: require('../../assets/images/cards/QH.png'),
  QS: require('../../assets/images/cards/QS.png'),
};

/* ------------------------------------------------------------------ */
/* Pure game logic                                                     */
/* ------------------------------------------------------------------ */

function createDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ id: `${rank}${suit}`, rank, suit })));
}

function shuffle(deck) {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function estimateBid(hand) {
  const suitCounts = SUITS.map((suit) => hand.filter((card) => card.suit === suit).length);
  const spadeCount = suitCounts[SUITS.indexOf('S')];
  let points = Math.max(0, spadeCount - 3);

  for (const card of hand) {
    if (card.rank === 'A') points += 1;
    else if (card.rank === 'K') points += suitCounts[SUITS.indexOf(card.suit)] > 1 ? 0.75 : 0.5;
    else if (card.rank === 'Q') points += suitCounts[SUITS.indexOf(card.suit)] > 2 ? 0.4 : 0.15;
  }
  return Math.min(13, Math.round(points));
}

function sortedHand(hand) {
  return [...hand].sort((a, b) => {
    const suitOrder = SUITS.indexOf(b.suit) - SUITS.indexOf(a.suit);
    return suitOrder || RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
  });
}

function createRound(scores = [0, 0], bags = [0, 0], roundNumber = 1) {
  const deck = shuffle(createDeck());
  const players = [0, 1, 2, 3].map((playerIndex) => {
    const hand = sortedHand(deck.slice(playerIndex * HAND_SIZE, (playerIndex + 1) * HAND_SIZE));
    return {
      hand,
      bid: playerIndex === 0 ? null : estimateBid(hand),
      tricks: 0,
    };
  });

  return {
    players,
    scores,
    bags,
    roundNumber,
    phase: 'bidding',
    bidSelection: Math.max(0, Math.min(13, estimateBid(players[0].hand))),
    trick: [],
    trickNumber: 0,
    leadSuit: null,
    turn: 0,
    spadesBroken: false,
    message: 'Place your bid to begin the hand.',
    handResult: '',
    yourTeamMadeBid: false,
  };
}

function legalCards(hand, trick, spadesBroken) {
  if (trick.length > 0) {
    const ledSuit = trick[0].card.suit;
    const followingSuit = hand.filter((card) => card.suit === ledSuit);
    return followingSuit.length ? followingSuit : hand;
  }
  if (!spadesBroken) {
    const nonSpades = hand.filter((card) => card.suit !== 'S');
    return nonSpades.length ? nonSpades : hand;
  }
  return hand;
}

function chooseBotCard(player, trick, spadesBroken) {
  const choices = legalCards(player.hand, trick, spadesBroken);
  return choices[Math.floor(Math.random() * choices.length)];
}

function playCard(game, playerIndex, card) {
  const players = game.players.map((player, index) =>
    index === playerIndex
      ? { ...player, hand: player.hand.filter((handCard) => handCard.id !== card.id) }
      : player
  );
  const trick = [...game.trick, { playerIndex, card }];
  const nextTurn = (playerIndex + 1) % players.length;

  return {
    ...game,
    players,
    trick,
    turn: nextTurn,
    leadSuit: game.leadSuit || card.suit,
    spadesBroken: game.spadesBroken || card.suit === 'S',
    message:
      trick.length === 4
        ? 'Trick complete — determining the winner...'
        : `${PLAYER_NAMES[nextTurn]} to play.`,
  };
}

function getTrickWinner(trick, leadSuit) {
  const strength = (play) =>
    play.card.suit === 'S' ? 2 : play.card.suit === leadSuit ? 1 : 0;

  return trick.reduce((winner, play) => {
    const s = strength(play);
    const w = strength(winner);
    if (s > w) return play;
    if (s === w && RANK_VALUES[play.card.rank] > RANK_VALUES[winner.card.rank]) return play;
    return winner;
  }).playerIndex;
}

function scoreHand(game) {
  const nextScores = [...game.scores];
  const nextBags = [...game.bags];
  const results = [];
  let yourTeamMadeBid = false;

  [0, 1].forEach((team) => {
    const teamPlayers = team === 0 ? [0, 2] : [1, 3];
    const previousScore = nextScores[team];
    const teamBids = teamPlayers.reduce((sum, i) => sum + (game.players[i].bid || 0), 0);
    const teamTricks = teamPlayers.reduce((sum, i) => sum + game.players[i].tricks, 0);
    const nilPlayers = teamPlayers.filter((i) => game.players[i].bid === 0);
    const nilTricks = nilPlayers.reduce((sum, i) => sum + game.players[i].tricks, 0);
    const regularBid = teamBids;
    const regularTricks = Math.max(0, teamTricks - nilTricks);
    const madeBid = regularTricks >= regularBid;
    if (team === 0) yourTeamMadeBid = madeBid;

    if (madeBid) {
      nextScores[team] += regularBid * 10 + Math.max(0, regularTricks - regularBid);
      nextBags[team] += Math.max(0, regularTricks - regularBid);
    } else {
      nextScores[team] -= regularBid * 10;
    }

    nilPlayers.forEach((i) => {
      nextScores[team] += game.players[i].tricks === 0 ? 100 : -100;
    });

    if (nextBags[team] >= 10) {
      const penalties = Math.floor(nextBags[team] / 10);
      nextScores[team] -= penalties * 100;
      nextBags[team] -= penalties * 10;
    }

    const delta = nextScores[team] - previousScore;
    results.push(
      `${team === 0 ? 'Your team' : 'Bots'} ${delta >= 0 ? '+' : '−'}${Math.abs(delta)}`
    );
  });

  return {
    scores: nextScores,
    bags: nextBags,
    result: results.join('  ·  '),
    yourTeamMadeBid,
  };
}

function finishTrick(game) {
  const winner = getTrickWinner(game.trick, game.leadSuit);
  const players = game.players.map((player, index) =>
    index === winner ? { ...player, tricks: player.tricks + 1 } : player
  );
  const trickNumber = game.trickNumber + 1;

  if (trickNumber === TRICKS_PER_HAND) {
    const scored = scoreHand({ ...game, players });
    return {
      ...game,
      players,
      ...scored,
      phase: 'roundOver',
      trick: [],
      trickNumber,
      leadSuit: null,
      turn: winner,
      message: `Hand complete. ${PLAYER_NAMES[winner]} won the last trick.`,
      handResult: scored.result,
    };
  }

  return {
    ...game,
    players,
    phase: 'playing',
    trick: [],
    trickNumber,
    leadSuit: null,
    turn: winner,
    message: `${PLAYER_NAMES[winner]} won the trick and leads.`,
  };
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function PlayerBadge({ player, playerIndex, isTurn, bidding }) {
  const isYou = playerIndex === 0;
  return (
    <View style={[styles.playerBadge, isTurn && styles.activePlayerBadge]}>
      <View style={styles.fishFrame}>
        <FishSprite
          fishKey={PLAYER_FISH[playerIndex]}
          width={48}
          mirror={playerIndex === 3}
          style={styles.fish}
        />
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {PLAYER_NAMES[playerIndex]}
      </Text>
      <Text style={styles.playerStats} numberOfLines={1}>
        {bidding && isYou ? 'Your bid: —' : `Bid ${player.bid ?? '—'} · ${player.tricks} won`}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function SpadesScreen({ navigation }) {
  const [game, setGame] = useState(() => createRound());
  const { width: windowWidth } = useWindowDimensions();

  const handCardWidth = useMemo(
    () => Math.max(28, Math.min(50, Math.floor((windowWidth - 32 - 6 * 6) / 7))),
    [windowWidth]
  );

  /* ----- bot turn driver ----- */
  useEffect(() => {
    if (game.phase !== 'playing') return undefined;

    if (game.trick.length === 4) {
      const timer = setTimeout(
        () => setGame((current) => (current.trick.length === 4 ? finishTrick(current) : current)),
        900
      );
      return () => clearTimeout(timer);
    }

    if (game.turn === 0) return undefined;

    const timer = setTimeout(() => {
      setGame((current) => {
        if (current.phase !== 'playing' || current.turn === 0 || current.trick.length === 4) {
          return current;
        }
        const player = current.players[current.turn];
        return playCard(
          current,
          current.turn,
          chooseBotCard(player, current.trick, current.spadesBroken)
        );
      });
    }, 550);
    return () => clearTimeout(timer);
  }, [game]);

  /* ----- actions ----- */
  const submitBid = useCallback(() => {
    setGame((current) => ({
      ...current,
      phase: 'playing',
      players: current.players.map((player, index) =>
        index === 0 ? { ...player, bid: current.bidSelection } : player
      ),
      message: 'Bids are in. Play a legal card when it is your turn.',
    }));
  }, []);

  const adjustBid = useCallback((delta) => {
    setGame((current) => ({
      ...current,
      bidSelection: Math.max(0, Math.min(13, current.bidSelection + delta)),
    }));
  }, []);

  const onPlayCard = useCallback((card) => {
    setGame((current) => {
      if (current.phase !== 'playing' || current.turn !== 0) return current;
      return playCard(current, 0, card);
    });
  }, []);

  const nextHand = useCallback(() => {
    setGame((current) =>
      createRound(current.scores, current.bags, current.roundNumber + 1)
    );
  }, []);

  /* ----- derived state ----- */
  const playerHand = game.players[0].hand;
  const playable = useMemo(() => {
    if (game.phase !== 'playing' || game.turn !== 0 || game.trick.length >= 4) return [];
    return legalCards(playerHand, game.trick, game.spadesBroken);
  }, [game.phase, game.turn, game.trick, game.spadesBroken, playerHand]);

  const playableIds = useMemo(() => new Set(playable.map((c) => c.id)), [playable]);

  const yourScore = game.scores[0];
  const botScore = game.scores[1];
  const gameWon = yourScore >= WINNING_SCORE && yourScore > botScore;
  const gameLost = botScore >= WINNING_SCORE && botScore >= yourScore;
  const gameOver = gameWon || gameLost;

  const turnLabel = useMemo(() => {
    if (game.phase === 'bidding') return 'Set your bid';
    if (game.phase === 'roundOver') {
      if (gameOver) return gameWon ? 'You win the game!' : 'Bots win the game';
      return 'Hand complete';
    }
    if (game.turn === 0) return `Your turn · Trick ${game.trickNumber + 1}/${TRICKS_PER_HAND}`;
    return `${PLAYER_NAMES[game.turn]} is playing`;
  }, [game.phase, game.turn, game.trickNumber, gameOver, gameWon]);

  return (
    <WaterBackground style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* top bar */}
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Games"
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Text style={styles.backText}>‹ Games</Text>
          </Pressable>
          <Text style={styles.title}>Spades</Text>
          <View style={styles.backButton} />
        </View>

        {/* score card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreTeam}>
            <Text style={styles.scoreLabel}>YOUR TEAM</Text>
            <Text style={styles.score}>{yourScore}</Text>
            <Text style={styles.scoreDetail}>{game.bags[0]} bags</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreTeam}>
            <Text style={styles.scoreLabel}>BOTS</Text>
            <Text style={styles.score}>{botScore}</Text>
            <Text style={styles.scoreDetail}>{game.bags[1]} bags</Text>
          </View>
        </View>

        {/* table */}
        <View style={styles.table}>
          <Text style={styles.tableHeading}>{turnLabel}</Text>

          <View style={styles.playerRow}>
            {[1, 2, 3].map((playerIndex) => (
              <PlayerBadge
                key={PLAYER_NAMES[playerIndex]}
                player={game.players[playerIndex]}
                playerIndex={playerIndex}
                isTurn={game.phase === 'playing' && game.turn === playerIndex}
                bidding={game.phase === 'bidding'}
              />
            ))}
          </View>

          <View style={styles.trickArea}>
            {game.trick.length === 0 ? (
              <Text style={styles.trickPlaceholder}>
                {game.phase === 'playing' && game.turn === 0 ? 'Play a card' : 'Waiting for a card'}
              </Text>
            ) : (
              game.trick.map(({ playerIndex, card }) => (
                <View key={`${playerIndex}-${card.id}`} style={styles.trickCard}>
                  <Image source={CARD_IMAGES[card.id]} resizeMode="contain" style={styles.trickImage} />
                  <Text style={styles.trickPlayer}>{PLAYER_NAMES[playerIndex]}</Text>
                </View>
              ))
            )}
          </View>

          {game.leadSuit && game.trick.length > 0 && (
            <Text style={styles.leadSuit}>Lead: {SUIT_NAMES[game.leadSuit]}</Text>
          )}

          <View style={styles.userBadgeWrap}>
            <PlayerBadge
              player={game.players[0]}
              playerIndex={0}
              isTurn={game.phase === 'playing' && game.turn === 0}
              bidding={game.phase === 'bidding'}
            />
          </View>

          {game.phase === 'bidding' && (
            <View style={styles.bidControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lower bid"
                disabled={game.bidSelection === 0}
                onPress={() => adjustBid(-1)}
                style={[styles.bidAdjust, game.bidSelection === 0 && styles.disabledButton]}
              >
                <Text style={styles.bidAdjustText}>−</Text>
              </Pressable>
              <Text style={styles.bidNumber}>{game.bidSelection}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Raise bid"
                disabled={game.bidSelection === 13}
                onPress={() => adjustBid(1)}
                style={[styles.bidAdjust, game.bidSelection === 13 && styles.disabledButton]}
              >
                <Text style={styles.bidAdjustText}>+</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Confirm bid of ${game.bidSelection}`}
                onPress={submitBid}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Bid {game.bidSelection}</Text>
              </Pressable>
            </View>
          )}

          {game.phase === 'roundOver' && (
            <View style={styles.resultCard}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.handOutcome,
                  game.yourTeamMadeBid ? styles.handWon : styles.handMissed,
                ]}
              >
                {game.yourTeamMadeBid ? 'You won this hand!' : 'You missed your bid'}
              </Text>
              <Text style={styles.resultText}>{game.handResult}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={gameOver ? nextHand : nextHand}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>{gameOver ? 'Play again' : 'Next hand'}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* hand */}
        <View style={styles.handHeader}>
          <Text style={styles.handTitle}>Your cards</Text>
          <Text style={styles.handHint}>
            {game.phase === 'bidding'
              ? 'Choose your bid'
              : game.phase === 'playing' && game.turn === 0
                ? 'Tap a card · Follow suit'
                : 'Waiting for your turn'}
          </Text>
        </View>

        <View style={styles.hand}>
          {playerHand.map((card) => {
            const canPlay = playableIds.has(card.id);
            return (
              <Pressable
                key={card.id}
                accessibilityRole="button"
                accessibilityLabel={`${card.rank} of ${SUIT_NAMES[card.suit]}${canPlay ? ', playable' : ''}`}
                disabled={!canPlay}
                onPress={() => onPlayCard(card)}
                style={[
                  styles.handCard,
                  { width: handCardWidth, height: handCardWidth * 1.49 },
                  game.phase === 'playing' && !canPlay && styles.unplayableCard,
                ]}
              >
                <Image source={CARD_IMAGES[card.id]} resizeMode="contain" style={styles.handImage} />
              </Pressable>
            );
          })}
          {playerHand.length === 0 && <Text style={styles.emptyHand}>Your hand is empty.</Text>}
        </View>
      </ScrollView>

    </WaterBackground>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 76 },
  backText: {
    color: COLORS.pearl,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
  },
  title: {
    color: COLORS.pearl,
    fontFamily: FONTS.heading,
    fontSize: 30,
  },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: COLORS.pearl,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  scoreTeam: { alignItems: 'center', flex: 1 },
  scoreLabel: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  score: {
    color: COLORS.deepWater,
    fontFamily: FONTS.heading,
    fontSize: 26,
    lineHeight: 30,
  },
  scoreDetail: { color: COLORS.inkFaint, fontFamily: FONTS.body, fontSize: 12 },
  scoreDivider: { backgroundColor: COLORS.skylight, height: 48, width: 1 },
  table: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 93, 140, 0.84)',
    borderRadius: 24,
    minHeight: 310,
    padding: 12,
  },
  tableHeading: {
    color: COLORS.pearl,
    fontFamily: FONTS.heading,
    fontSize: 20,
    textAlign: 'center',
  },
  bidControls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 16,
  },
  bidAdjust: {
    alignItems: 'center',
    backgroundColor: COLORS.pearl,
    borderRadius: 22,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  bidAdjustText: { color: COLORS.deepWater, fontFamily: FONTS.heading, fontSize: 24, lineHeight: 28 },
  disabledButton: { opacity: 0.45 },
  bidNumber: {
    color: COLORS.pearl,
    fontFamily: FONTS.heading,
    fontSize: 30,
    minWidth: 32,
    textAlign: 'center',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.reefGreen,
    borderRadius: 20,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 20,
  },
  actionText: { color: COLORS.foam, fontFamily: FONTS.bodyBold, fontSize: 15 },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    width: '100%',
  },
  playerBadge: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 88,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  activePlayerBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: COLORS.coral,
  },
  fishFrame: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 52,
  },
  fish: { position: 'relative' },
  playerName: {
    color: COLORS.pearl,
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    marginTop: 1,
    textAlign: 'center',
  },
  playerStats: {
    color: COLORS.foam,
    fontFamily: FONTS.body,
    fontSize: 9,
    textAlign: 'center',
  },
  trickArea: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 8,
    minHeight: 104,
    padding: 8,
    width: '78%',
  },
  trickPlaceholder: { color: COLORS.foam, fontFamily: FONTS.bodyBold, fontSize: 12 },
  leadSuit: { color: COLORS.foam, fontFamily: FONTS.body, fontSize: 11, marginTop: -4 },
  trickCard: { alignItems: 'center' },
  trickImage: { height: 62, width: 43 },
  trickPlayer: { color: COLORS.pearl, fontFamily: FONTS.body, fontSize: 10 },
  userBadgeWrap: { alignSelf: 'center', width: '48%' },
  resultCard: { alignItems: 'center', gap: 10, marginTop: 10 },
  resultText: { color: COLORS.pearl, fontFamily: FONTS.body, fontSize: 13, textAlign: 'center' },
  handHeader: { alignItems: 'center', gap: 2, marginTop: 8 },
  handTitle: { color: COLORS.pearl, fontFamily: FONTS.heading, fontSize: 20 },
  handHint: { color: COLORS.foam, fontFamily: FONTS.body, fontSize: 12, textAlign: 'center' },
  hand: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    paddingBottom: 8,
    width: '100%',
  },
  handCard: {
    backgroundColor: COLORS.pearl,
    borderRadius: 8,
    elevation: 3,
    justifyContent: 'center',
    padding: 2,
    shadowColor: COLORS.abyss,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
  },
  unplayableCard: { opacity: 0.56 },
  handImage: { height: '100%', width: '100%' },
  emptyHand: {
    color: COLORS.pearl,
    fontFamily: FONTS.body,
    padding: 16,
  },
  handOutcome: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    textAlign: 'center',
  },
  handWon: { color: COLORS.sunYellow },
  handMissed: { color: COLORS.foam },
});
