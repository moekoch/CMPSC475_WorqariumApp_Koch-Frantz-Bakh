import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
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

// Index order is clockwise: 0 South (you), 1 West, 2 North (partner), 3 East.
const SEATS = ['South', 'West', 'North', 'East'];
const SEAT_TAGS = ['You', 'Bot', 'Partner', 'Bot'];
const PLAYER_NAMES = ['You', 'West', 'Partner', 'East'];
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

const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    orb: ['#B4F5D5', '#22B07E'],
    wash: '#DDF7EC',
    rim: '#A6E3C8',
    blurb: 'Relaxed bots. They bid roughly and play most cards at random.',
  },
  {
    key: 'medium',
    label: 'Medium',
    orb: ['#FFE9A3', '#EDA311'],
    wash: '#FFF1D0',
    rim: '#F2D88F',
    blurb: 'Solid bots. They bid carefully, win tricks cheaply, and never overtake their partner.',
  },
  {
    key: 'hard',
    label: 'Hard',
    orb: ['#FFC4B6', '#E2573F'],
    wash: '#FFE3DD',
    rim: '#F3B8AB',
    blurb: 'Sharp bots. They count cards, track voids, defend nil bids, and manage bags.',
  },
];
const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

const RULES_SECTIONS = [
  {
    title: 'The table',
    body:
      'Four players, two teams. You (South) and your partner (North) play against West and East, who are the bots. Play moves clockwise.',
  },
  {
    title: 'Dealing',
    body:
      'The first dealer is picked at random, then the deal passes clockwise every hand. Winning tricks never changes the dealer. Only the dealer gets the Deal button; everyone else sees "Waiting for dealer".',
  },
  {
    title: 'Bidding',
    body:
      'Starting with the player left of the dealer and going clockwise, each player bids how many tricks they expect to take (0-13). A bid of 0 is called NIL. Tap − or + to set your bid, then tap Bid to confirm. When all four players have bid, play begins and the dealer leads the first trick.',
  },
  {
    title: 'Playing',
    body:
      'You must follow the suit that was led if you can. If you cannot, you may play any card. Spades are always trump, so any spade beats any card of another suit. The highest card of the winning suit takes the trick, and the trick winner leads next. Spades cannot be led until a spade has been played (unless a hand is all spades).',
  },
  {
    title: 'Scoring',
    body:
      'Your team adds your two bids together. If your team takes at least that many tricks, you score 10 points per bid trick. Each extra trick is a bag and is worth 1 point. If you miss your bid, you lose 10 points per bid trick.',
  },
  {
    title: 'Nil',
    body:
      'A player who bids NIL promises to take no tricks. NIL SUCCESS: +100 points. NIL FAILURE (they take any trick): −100 points. A nil bidder\'s tricks do not count toward their partner\'s bid.',
  },
  {
    title: 'Bags',
    body:
      'Bags are bad. Every time a team collects 10 bags it takes a BAG PENALTY of −100 points.',
  },
  {
    title: 'Boston',
    body:
      'If one team takes all 13 tricks in a hand, that is a BOSTON. They score +100 and the other team scores 0 for the hand.',
  },
  {
    title: 'Bot difficulty',
    body:
      'Your partner and both opponents are bots, and you pick their skill level when a game starts. Easy bots play mostly at random. Medium bots follow sensible trick-taking habits. Hard bots count cards, remember who is out of a suit, try to bust nil bids, and avoid collecting bags. Start a new game to change the level.',
  },
  {
    title: 'Winning',
    body:
      'The first team to reach 500 points wins. If both teams reach 500 in the same hand, the higher score wins. If they are tied at 500 or more, the game goes to OVERTIME and continues until one team is ahead after a hand.',
  },
];

/* ------------------------------------------------------------------ */
/* Pure game logic                                                     */
/* ------------------------------------------------------------------ */

const teamOf = (playerIndex) => playerIndex % 2; // 0 = you + partner, 1 = bots
const teamLabel = (team) => (team === 0 ? 'Your team' : 'Them');
const signed = (n) => `${n >= 0 ? '+' : '−'}${Math.abs(n)}`;
const formatBid = (bid) => (bid === null || bid === undefined ? '—' : bid === 0 ? 'NIL' : String(bid));

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

/** Creates the state for the start of a hand: waiting for the dealer to deal. */
function createRound({
  scores = [0, 0],
  bags = [0, 0],
  roundNumber = 1,
  dealer,
  overtime = false,
  difficulty = null,
}) {
  return {
    players: [0, 1, 2, 3].map(() => ({ hand: [], bid: null, tricks: 0 })),
    scores,
    bags,
    roundNumber,
    dealer,
    overtime,
    difficulty,
    history: [],
    phase: 'dealing',
    bidSelection: 3,
    trick: [],
    trickNumber: 0,
    leadSuit: null,
    turn: dealer,
    spadesBroken: false,
    message: `${PLAYER_NAMES[dealer]} deals.`,
    handResult: [],
    yourTeamMadeBid: false,
    popups: [],
  };
}

/** Random dealer, zeroed scores. */
function createGame(difficulty = null) {
  return createRound({ dealer: Math.floor(Math.random() * 4), difficulty });
}

/** Shuffles and deals 13 cards to each player, then opens bidding left of the dealer. */
function dealHand(game) {
  const deck = shuffle(createDeck());
  const players = [0, 1, 2, 3].map((i) => ({
    hand: sortedHand(deck.slice(i * HAND_SIZE, (i + 1) * HAND_SIZE)),
    bid: null,
    tricks: 0,
  }));
  const first = (game.dealer + 1) % 4;
  return {
    ...game,
    players,
    phase: 'bidding',
    bidSelection: estimateBid(players[0].hand),
    trick: [],
    trickNumber: 0,
    leadSuit: null,
    spadesBroken: false,
    history: [],
    turn: first,
    message: `Bidding starts with ${PLAYER_NAMES[first]}.`,
  };
}

/** Records a bid and moves to the next bidder, or starts play once everyone has bid. */
function applyBid(game, playerIndex, bid) {
  const players = game.players.map((player, index) =>
    index === playerIndex ? { ...player, bid } : player
  );
  const allBid = players.every((p) => p.bid !== null);

  if (allBid) {
    // Dealer leads the first trick.
    return {
      ...game,
      players,
      phase: 'playing',
      turn: game.dealer,
      message: `Bids are in. ${PLAYER_NAMES[game.dealer]} leads.`,
    };
  }
  const next = (playerIndex + 1) % 4;
  return { ...game, players, turn: next, message: `${PLAYER_NAMES[next]} to bid.` };
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

/* ------------------------------------------------------------------ */
/* Bot strategy                                                        */
/*   easy   - rough bids, random legal cards (ducks when bid nil)      */
/*   medium - sensible bids, wins cheaply, never overtakes partner     */
/*   hard   - card counting, void tracking, nil defence, bag control   */
/* Bots only use their own hand plus cards already played (no peeking).*/
/* ------------------------------------------------------------------ */

const cardCost = (card) => RANK_VALUES[card.rank] + (card.suit === 'S' ? 20 : 0);
const lowestCard = (cards) => [...cards].sort((a, b) => cardCost(a) - cardCost(b))[0];
const highestCard = (cards) => [...cards].sort((a, b) => cardCost(b) - cardCost(a))[0];
const highestRank = (cards) =>
  [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])[0];

function trumpStrength(card, leadSuit) {
  return card.suit === 'S' ? 2 : card.suit === leadSuit ? 1 : 0;
}

function winningPlay(trick) {
  const leadSuit = trick[0].card.suit;
  return trick.reduce((winner, play) => {
    const s = trumpStrength(play.card, leadSuit);
    const w = trumpStrength(winner.card, leadSuit);
    if (s > w) return play;
    if (s === w && RANK_VALUES[play.card.rank] > RANK_VALUES[winner.card.rank]) return play;
    return winner;
  });
}

function beats(card, play, leadSuit) {
  const c = trumpStrength(card, leadSuit);
  const w = trumpStrength(play.card, leadSuit);
  return c > w || (c === w && c > 0 && RANK_VALUES[card.rank] > RANK_VALUES[play.card.rank]);
}

/** How many tricks a hand is likely to take, with suit length and ruffing value. */
function handPoints(hand) {
  const bySuit = Object.fromEntries(SUITS.map((suit) => [suit, hand.filter((c) => c.suit === suit)]));
  const spadeCount = bySuit.S.length;
  let points = 0;

  bySuit.S.forEach((card) => {
    const v = RANK_VALUES[card.rank];
    if (v === 14) points += 1;
    else if (v === 13) points += spadeCount >= 2 ? 0.9 : 0.4;
    else if (v === 12) points += spadeCount >= 3 ? 0.6 : 0.2;
    else if (v === 11) points += spadeCount >= 4 ? 0.3 : 0;
  });
  points += Math.max(0, spadeCount - 3) * 0.8; // long spades turn into winners

  SUITS.filter((suit) => suit !== 'S').forEach((suit) => {
    const cards = bySuit[suit];
    const n = cards.length;
    cards.forEach((card) => {
      const v = RANK_VALUES[card.rank];
      if (v === 14) points += n <= 5 ? 1 : 0.7;
      else if (v === 13) points += n >= 3 ? 0.7 : n === 2 ? 0.45 : 0.15;
      else if (v === 12) points += n >= 4 ? 0.3 : 0.1;
    });
    if (n === 0 && spadeCount >= 3) points += 1; // can ruff
    else if (n === 1 && spadeCount >= 4) points += 0.5;
  });
  return points;
}

/** How likely a hand is to be forced to win tricks (low = good nil candidate). */
function nilDanger(hand) {
  return hand.reduce((sum, card) => {
    const v = RANK_VALUES[card.rank];
    let d = v === 14 ? 3 : v === 13 ? 2 : v === 12 ? 1.2 : v === 11 ? 0.6 : v === 10 ? 0.25 : 0;
    if (card.suit === 'S' && v >= 9) d += 1.5;
    return sum + d;
  }, 0);
}

function chooseBotBid(game, playerIndex) {
  const hand = game.players[playerIndex].hand;
  const level = game.difficulty;
  const base = estimateBid(hand);

  if (level === 'easy') {
    const noise = Math.floor(Math.random() * 3) - 1;
    return Math.max(0, Math.min(13, base + noise));
  }

  const danger = nilDanger(hand);
  const spades = hand.filter((c) => c.suit === 'S').length;
  if (level === 'hard') {
    if (danger < 3.5 && spades <= 3) return 0;
  } else if (danger < 4.5) {
    return 0;
  }

  let bid = level === 'hard' ? Math.round(handPoints(hand)) : base;
  if (level === 'hard') {
    // Everyone bidding more than 13 tricks in total means somebody will miss.
    const others = game.players.reduce(
      (sum, p, i) => (i === playerIndex || p.bid === null ? sum : sum + p.bid),
      0
    );
    if (others + bid > 13 && bid > 1) bid -= 1;
  }
  return Math.max(1, Math.min(13, bid));
}

/** What a careful player knows: cards seen so far and which suits each seat has shown void in. */
function getKnowledge(game, me) {
  const seen = new Set(game.players[me].hand.map((c) => c.id));
  const voids = [new Set(), new Set(), new Set(), new Set()];
  const record = (trick, leadSuit) =>
    trick.forEach(({ playerIndex, card }) => {
      seen.add(card.id);
      if (card.suit !== leadSuit) voids[playerIndex].add(leadSuit);
    });
  game.history.forEach((h) => record(h.trick, h.leadSuit));
  if (game.trick.length) record(game.trick, game.trick[0].card.suit);
  return { seen, voids };
}

/** A card nobody can beat: no higher card left in the suit and no opponent able to trump it. */
function isSafeMaster(card, knowledge, me) {
  const higherUnseen = RANKS.some(
    (r) => RANK_VALUES[r] > RANK_VALUES[card.rank] && !knowledge.seen.has(`${r}${card.suit}`)
  );
  if (higherUnseen) return false;
  if (card.suit === 'S') return true;
  const spadesLeft = RANKS.some((r) => !knowledge.seen.has(`${r}S`));
  if (!spadesLeft) return true;
  return [0, 1, 2, 3]
    .filter((p) => teamOf(p) !== teamOf(me))
    .every((p) => !knowledge.voids[p].has(card.suit));
}

/** Tricks the team still needs to make its (non-nil) bid. */
function tricksNeeded(game, me) {
  const mates = teamOf(me) === 0 ? [0, 2] : [1, 3];
  const bid = mates.reduce((sum, i) => sum + (game.players[i].bid || 0), 0);
  const tricks = mates.reduce(
    (sum, i) => sum + (game.players[i].bid === 0 ? 0 : game.players[i].tricks),
    0
  );
  return bid - tricks;
}

function mediumCard(game, me, choices) {
  const trick = game.trick;
  if (trick.length === 0) {
    const nonSpades = choices.filter((c) => c.suit !== 'S');
    const aces = nonSpades.filter((c) => c.rank === 'A');
    if (aces.length) return aces[0];
    return lowestCard(nonSpades.length ? nonSpades : choices);
  }
  const leadSuit = trick[0].card.suit;
  const winner = winningPlay(trick);
  if (teamOf(winner.playerIndex) === teamOf(me)) return lowestCard(choices); // partner has it
  const winners = choices.filter((c) => beats(c, winner, leadSuit));
  return winners.length ? lowestCard(winners) : lowestCard(choices);
}

function hardCard(game, me, choices) {
  const knowledge = getKnowledge(game, me);
  const partner = (me + 2) % 4;
  const opponents = [(me + 1) % 4, (me + 3) % 4];
  const nilAlive = (p) => game.players[p].bid === 0 && game.players[p].tricks === 0;
  const partnerNil = nilAlive(partner);
  const oppNil = opponents.filter(nilAlive);
  const need = tricksNeeded(game, me);
  const bagAvoid = need <= 0 && !partnerNil;
  const trick = game.trick;

  /* ----- leading ----- */
  if (trick.length === 0) {
    const nonSpades = choices.filter((c) => c.suit !== 'S');
    const lowLead = lowestCard(nonSpades.length ? nonSpades : choices);
    if (oppNil.length || bagAvoid) return lowLead; // lead low to bust nil / avoid bags
    const masters = nonSpades.filter((c) => isSafeMaster(c, knowledge, me));
    if (masters.length) return highestCard(masters);
    const spadeMasters = choices.filter((c) => c.suit === 'S' && isSafeMaster(c, knowledge, me));
    if (spadeMasters.length && game.spadesBroken && need > 0) return spadeMasters[0];
    return lowLead;
  }

  /* ----- following ----- */
  const leadSuit = trick[0].card.suit;
  const winner = winningPlay(trick);
  const partnerWinning = teamOf(winner.playerIndex) === teamOf(me);
  const winners = choices.filter((c) => beats(c, winner, leadSuit));
  const losers = choices.filter((c) => !beats(c, winner, leadSuit));
  const after = 3 - trick.length; // seats still to play after me
  const hasPlayed = (p) => trick.some((t) => t.playerIndex === p);

  // Protect a partner's nil: take the trick away from them, or set a high card for them to duck under.
  if (partnerNil) {
    if (winner.playerIndex === partner) return winners.length ? lowestCard(winners) : lowestCard(choices);
    if (!hasPlayed(partner) && winners.length) return highestCard(winners);
  }

  // Bust an opponent's nil: keep the trick low so they cannot duck, and never take it from them.
  if (oppNil.length) {
    const nilStillToPlay = oppNil.some((p) => !hasPlayed(p));
    const nilWinning = oppNil.includes(winner.playerIndex);
    if (nilStillToPlay || nilWinning) return lowestCard(choices);
  }

  // Already made the bid: avoid bags by dumping the highest card that loses.
  if (bagAvoid) {
    if (losers.length) {
      const sideLosers = losers.filter((c) => c.suit !== 'S');
      return highestCard(sideLosers.length ? sideLosers : losers);
    }
    return lowestCard(winners);
  }

  if (partnerWinning) return lowestCard(choices);

  if (winners.length) {
    if (after === 0) return lowestCard(winners);
    const ledWinners = winners.filter((c) => c.suit === leadSuit);
    if (ledWinners.length) {
      const secure = ledWinners.filter((c) => isSafeMaster(c, knowledge, me));
      return secure.length ? lowestCard(secure) : highestCard(ledWinners);
    }
    return lowestCard(winners); // cheapest trump
  }
  return lowestCard(choices);
}

function chooseBotCard(game, me) {
  const player = game.players[me];
  const level = game.difficulty;
  const choices = legalCards(player.hand, game.trick, game.spadesBroken);
  if (choices.length === 1) return choices[0];

  // A bot that bid NIL ducks every trick it can.
  if (player.bid === 0 && player.tricks === 0) {
    if (game.trick.length === 0 || level === 'easy') return lowestCard(choices);
    const leadSuit = game.trick[0].card.suit;
    const winner = winningPlay(game.trick);
    const losers = choices.filter((c) => !beats(c, winner, leadSuit));
    if (!losers.length) return lowestCard(choices);
    return level === 'hard' ? highestRank(losers) : lowestCard(losers);
  }

  if (level === 'easy') return choices[Math.floor(Math.random() * choices.length)];
  return level === 'hard' ? hardCard(game, me, choices) : mediumCard(game, me, choices);
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

/**
 * 500+ ends the game. Higher score wins. Tied at 500+ means overtime (keep playing).
 */
function getGameStatus(scores) {
  const [you, bots] = scores;
  if (Math.max(you, bots) < WINNING_SCORE) return { over: false, overtime: false, winner: null };
  if (you === bots) return { over: false, overtime: true, winner: null };
  return { over: true, overtime: false, winner: you > bots ? 0 : 1 };
}

function scoreHand(game) {
  const nextScores = [...game.scores];
  const nextBags = [...game.bags];
  const lines = [];
  const popups = [];

  const teamPlayers = (team) => (team === 0 ? [0, 2] : [1, 3]);
  const teamTricks = [0, 1].map((team) =>
    teamPlayers(team).reduce((sum, i) => sum + game.players[i].tricks, 0)
  );

  /* ----- Boston: one team took all 13 tricks ----- */
  const bostonTeam = teamTricks.findIndex((t) => t === TRICKS_PER_HAND);
  if (bostonTeam !== -1) {
    nextScores[bostonTeam] += 100;
    popups.push({
      title: 'BOSTON!',
      body: `${teamLabel(bostonTeam)} took all 13 tricks and scores +100. The other team scores 0 this hand.`,
    });
    lines.push(`BOSTON! ${teamLabel(bostonTeam)} ${signed(100)}`);
    lines.push(`${teamLabel(1 - bostonTeam)} +0`);
    return {
      scores: nextScores,
      bags: nextBags,
      lines,
      popups,
      yourTeamMadeBid: bostonTeam === 0,
    };
  }

  /* ----- Normal scoring ----- */
  let yourTeamMadeBid = false;

  [0, 1].forEach((team) => {
    const players = teamPlayers(team);
    const previousScore = nextScores[team];
    const regularBid = players.reduce((sum, i) => sum + (game.players[i].bid || 0), 0);
    const nilPlayers = players.filter((i) => game.players[i].bid === 0);
    const nilTricks = nilPlayers.reduce((sum, i) => sum + game.players[i].tricks, 0);
    const regularTricks = Math.max(0, teamTricks[team] - nilTricks);
    const madeBid = regularTricks >= regularBid;
    if (team === 0) yourTeamMadeBid = madeBid;

    const details = [];
    const overtricks = Math.max(0, regularTricks - regularBid);

    if (madeBid) {
      nextScores[team] += regularBid * 10 + overtricks;
      nextBags[team] += overtricks;
      if (regularBid > 0 || overtricks > 0) {
        details.push(
          `Bid ${regularBid}, took ${regularTricks}${overtricks ? ` (${overtricks} ${overtricks === 1 ? 'bag' : 'bags'})` : ''}`
        );
      }
    } else {
      nextScores[team] -= regularBid * 10;
      details.push(`Bid ${regularBid}, took ${regularTricks} — missed`);
    }

    nilPlayers.forEach((i) => {
      const success = game.players[i].tricks === 0;
      nextScores[team] += success ? 100 : -100;
      details.push(`${SEATS[i]}: ${success ? 'NIL SUCCESS +100' : 'NIL FAILURE −100'}`);
    });

    if (nextBags[team] >= 10) {
      const penalties = Math.floor(nextBags[team] / 10);
      nextScores[team] -= penalties * 100;
      nextBags[team] -= penalties * 10;
      details.push(`BAG PENALTY −${penalties * 100}`);
      popups.push({
        title: 'BAG PENALTY',
        body: `${teamLabel(team)} collected 10 bags and lose ${penalties * 100} points.`,
      });
    }

    const delta = nextScores[team] - previousScore;
    lines.push(`${teamLabel(team)} ${signed(delta)}`);
    details.forEach((d) => lines.push(`   ${d}`));
  });

  return { scores: nextScores, bags: nextBags, lines, popups, yourTeamMadeBid };
}

function finishTrick(game) {
  const winner = getTrickWinner(game.trick, game.leadSuit);
  const players = game.players.map((player, index) =>
    index === winner ? { ...player, tricks: player.tricks + 1 } : player
  );
  const trickNumber = game.trickNumber + 1;
  const history = [...game.history, { trick: game.trick, leadSuit: game.leadSuit }];

  if (trickNumber === TRICKS_PER_HAND) {
    const scored = scoreHand({ ...game, players });
    const status = getGameStatus(scored.scores);
    const popups = [...scored.popups];
    if (status.overtime && !game.overtime) {
      popups.push({
        title: 'OVERTIME',
        body: `Both teams are tied at ${scored.scores[0]}. Play continues until one team is ahead after a hand.`,
      });
    }
    return {
      ...game,
      players,
      history,
      scores: scored.scores,
      bags: scored.bags,
      handResult: scored.lines,
      yourTeamMadeBid: scored.yourTeamMadeBid,
      popups,
      overtime: status.overtime || (game.overtime && !status.over),
      phase: 'roundOver',
      trick: [],
      trickNumber,
      leadSuit: null,
      turn: winner,
      message: `Hand complete. ${PLAYER_NAMES[winner]} won the last trick.`,
    };
  }

  return {
    ...game,
    players,
    history,
    phase: 'playing',
    trick: [],
    trickNumber,
    leadSuit: null,
    turn: winner,
    message: `${PLAYER_NAMES[winner]} won the trick and leads.`,
  };
}

/* ------------------------------------------------------------------ */
/* Frutiger Aero primitives: glass and gloss buttons                     */
/* ------------------------------------------------------------------ */

const SIDE_W = 72; // width of the West / East badges
const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 54;
const LIFT = 12; // how far playable cards rise above the rest of the hand
const PREVIEW_HALO = [[7, 0.1], [4, 0.18], [2, 0.3]]; // [spread px, opacity] tight white rim glow
const SELECT_RISE = 14; // extra rise for the card you've tapped (waiting for confirm)

// Local design tokens for this screen. The rule of thumb: white text only ever
// sits on DEEP glass (panel), and anything on LIGHT glass (modal) uses dark ink.
const AERO = {
  panel: 'rgba(6,66,112,0.56)', // deep glass: white text stays readable on any water
  panelSoft: 'rgba(255,255,255,0.16)',
  well: 'rgba(3,48,88,0.22)', // recessed area (the trick pool)
  modal: 'rgba(244,251,255,0.97)',
  rim: 'rgba(255,255,255,0.5)',
  rimSoft: 'rgba(255,255,255,0.26)',
  textMuted: 'rgba(255,255,255,0.86)',
  ink: '#0B4A74',
  inkSoft: '#2E6283',
  shadow: 'rgba(0,36,70,0.55)',
  mint: '#A8F7CF',
  gold: '#FFCC4D',
  goldInk: '#4A3300',
};

// Soft, glossy buttons with dark text (no flat neon fills).
const BUTTON_VARIANTS = {
  green: { colors: ['#D5FAE8', '#74DDB2'], rim: 'rgba(255,255,255,0.9)', text: '#0A5A45' },
  aqua: { colors: ['#E6F9FF', '#8FD9F3'], rim: 'rgba(255,255,255,0.9)', text: AERO.ink },
};

function Glass({ children, style, tint = AERO.panel, radius = 24, gloss = true }) {
  return (
    <View style={[styles.glass, { backgroundColor: tint, borderRadius: radius }, style]}>
      {gloss && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
          locations={[0, 0.4, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </View>
  );
}

function GlossButton({
  label,
  onPress,
  variant = 'green',
  small = false,
  disabled = false,
  accessibilityLabel,
  style,
  textStyle,
}) {
  const v = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.green;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.glossButton,
        small && styles.glossButtonSmall,
        { backgroundColor: v.colors[1], borderColor: v.rim },
        disabled && styles.disabledButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      <LinearGradient pointerEvents="none" colors={v.colors} style={StyleSheet.absoluteFill} />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.05)']}
        style={styles.glossButtonShine}
      />
      <Text
        style={[
          styles.glossButtonText,
          small && styles.glossButtonTextSmall,
          { color: v.text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TopPill({ label, onPress, accessibilityLabel }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.topPill, pressed && styles.pressed]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.topPillText}>{label}</Text>
    </Pressable>
  );
}

/** Glossy little sphere used as the difficulty marker. */
function Orb({ colors, size = 36 }) {
  return (
    <LinearGradient
      colors={colors}
      style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']}
        style={{
          borderRadius: size,
          height: size * 0.42,
          left: size * 0.16,
          position: 'absolute',
          right: size * 0.16,
          top: 3,
        }}
      />
    </LinearGradient>
  );
}

function PlayerBadge({ player, playerIndex, isTurn, isDealer, horizontal }) {
  const bid = formatBid(player.bid);
  return (
    <View
      style={[
        styles.badge,
        horizontal ? styles.badgeH : styles.badgeV,
        isTurn && styles.badgeActive,
      ]}
    >
      <View style={styles.fishFrame}>
        <FishSprite
          fishKey={PLAYER_FISH[playerIndex]}
          width={40}
          mirror={playerIndex === 3}
          style={styles.fish}
        />
      </View>
      <View style={horizontal ? styles.badgeTextH : styles.badgeTextV}>
        <Text
          style={styles.playerName}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {SEATS[playerIndex]} · {SEAT_TAGS[playerIndex]}
        </Text>
        {horizontal ? (
          <Text style={styles.playerStats} numberOfLines={1}>
            Bid {bid} · {player.tricks} won
          </Text>
        ) : (
          <>
            <Text style={styles.playerStats} numberOfLines={1}>
              Bid {bid}
            </Text>
            <Text style={styles.playerStats} numberOfLines={1}>
              {player.tricks} won
            </Text>
          </>
        )}
        {isDealer && (
          <View style={styles.dealerChip}>
            <Text style={styles.dealerChipText}>Dealer</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/** Compass positions for the cards in the middle of the table. */
function trickSeatStyle(seat, w, h) {
  switch (seat) {
    case 0:
      return { bottom: 8, left: '50%', marginLeft: -w / 2 };
    case 1:
      return { left: 6, top: '50%', marginTop: -h / 2 };
    case 2:
      return { top: 8, left: '50%', marginLeft: -w / 2 };
    default:
      return { right: 6, top: '50%', marginTop: -h / 2 };
  }
}

function InfoModal({ visible, title, children, buttonLabel, onPress }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onPress}>
      <View style={styles.modalBackdrop}>
        <Glass tint={AERO.modal} radius={28} style={styles.modalCard}>
          <Text accessibilityRole="header" style={styles.modalTitle}>
            {title}
          </Text>
          {children}
          <GlossButton label={buttonLabel} onPress={onPress} style={styles.modalButton} />
        </Glass>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function SpadesScreen({ navigation }) {
  const [game, setGame] = useState(() => createGame());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // tapped card awaiting confirmation
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  /* ----- responsive sizing: everything must fit one screen, no scrolling ----- */
  const sizes = useMemo(() => {
    const availW = windowWidth - 24;
    const handCardW = Math.max(
      36,
      Math.min(64, Math.floor(availW * 0.165), Math.floor(windowHeight * 0.075))
    );
    const handCardH = Math.round(handCardW * 1.49);
    // 13 cards overlap in a single fanned row sized to the screen width.
    const step = Math.min(handCardW + 4, (availW - 16 - handCardW) / (HAND_SIZE - 1));
    const trickW = Math.max(
      30,
      Math.min(
        54,
        Math.floor((windowWidth - 24 - 16 - 2 * SIDE_W - 8) / 3.3),
        Math.floor(windowHeight * 0.075)
      )
    );
    return { handCardW, handCardH, step, trickW, trickH: Math.round(trickW * 1.49) };
  }, [windowWidth, windowHeight]);

  /* ----- bot driver: dealing, bidding, and playing ----- */
  useEffect(() => {
    if (!game.difficulty) return undefined; // wait for the player to choose a level

    if (game.phase === 'dealing') {
      if (game.dealer === 0) return undefined; // the user deals with the Deal button
      const timer = setTimeout(
        () => setGame((current) => (current.phase === 'dealing' ? dealHand(current) : current)),
        1000
      );
      return () => clearTimeout(timer);
    }

    if (game.phase === 'bidding') {
      if (game.turn === 0) return undefined;
      const timer = setTimeout(() => {
        setGame((current) => {
          if (current.phase !== 'bidding' || current.turn === 0) return current;
          return applyBid(current, current.turn, chooseBotBid(current, current.turn));
        });
      }, 700);
      return () => clearTimeout(timer);
    }

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
        return playCard(current, current.turn, chooseBotCard(current, current.turn));
      });
    }, 550);
    return () => clearTimeout(timer);
  }, [game]);

  /* ----- actions ----- */
  const onDeal = useCallback(() => {
    setGame((current) =>
      current.phase === 'dealing' && current.dealer === 0 ? dealHand(current) : current
    );
  }, []);

  const submitBid = useCallback(() => {
    setGame((current) =>
      current.phase === 'bidding' && current.turn === 0
        ? applyBid(current, 0, current.bidSelection)
        : current
    );
  }, []);

  const adjustBid = useCallback((delta) => {
    setGame((current) => ({
      ...current,
      bidSelection: Math.max(0, Math.min(13, current.bidSelection + delta)),
    }));
  }, []);

  const onPlayCard = useCallback((card) => {
    setSelectedId(null);
    setGame((current) => {
      if (current.phase !== 'playing' || current.turn !== 0) return current;
      return playCard(current, 0, card);
    });
  }, []);

  // Tapping a card only selects it (preview). Tapping it again cancels.
  // The play itself happens from the Play button, so a stray tap can't burn a card.
  const onTapCard = useCallback((card) => {
    setSelectedId((current) => (current === card.id ? null : card.id));
  }, []);

  // Dealer rotates clockwise after every hand, regardless of who won tricks.
  const nextHand = useCallback(() => {
    setGame((current) =>
      createRound({
        scores: current.scores,
        bags: current.bags,
        roundNumber: current.roundNumber + 1,
        dealer: (current.dealer + 1) % 4,
        overtime: current.overtime,
        difficulty: current.difficulty,
      })
    );
  }, []);

  // A new game goes back to the difficulty picker.
  const newGame = useCallback(() => setGame(createGame()), []);

  const chooseDifficulty = useCallback((level) => {
    setGame((current) => ({ ...current, difficulty: level }));
  }, []);

  const dismissPopup = useCallback(() => {
    setGame((current) => ({ ...current, popups: current.popups.slice(1) }));
  }, []);

  /* ----- derived state ----- */
  const playerHand = game.players[0].hand;
  const myTurnToPlay = game.phase === 'playing' && game.turn === 0 && game.trick.length < 4;
  const playable = useMemo(() => {
    if (!myTurnToPlay) return [];
    return legalCards(playerHand, game.trick, game.spadesBroken);
  }, [myTurnToPlay, game.trick, game.spadesBroken, playerHand]);

  const playableIds = useMemo(() => new Set(playable.map((c) => c.id)), [playable]);

  // Only valid while it's your turn and the card is still legal to play.
  const selectedCard = useMemo(
    () => (myTurnToPlay ? playable.find((c) => c.id === selectedId) ?? null : null),
    [myTurnToPlay, playable, selectedId]
  );

  const yourScore = game.scores[0];
  const botScore = game.scores[1];
  const status = getGameStatus(game.scores);
  const gameOver = game.phase === 'roundOver' && status.over;
  const youWon = status.winner === 0;

  const turnLabel = useMemo(() => {
    if (game.phase === 'dealing') {
      return game.dealer === 0 ? 'Your deal' : 'Waiting for dealer';
    }
    if (game.phase === 'bidding') {
      return game.turn === 0 ? 'Set your bid' : `${PLAYER_NAMES[game.turn]} is bidding`;
    }
    if (game.phase === 'roundOver') {
      if (gameOver) return youWon ? 'You win the game!' : 'Them wins the game';
      return 'Hand complete';
    }
    if (game.turn === 0) return `Your turn · Trick ${game.trickNumber + 1}/${TRICKS_PER_HAND}`;
    return `${PLAYER_NAMES[game.turn]} is playing`;
  }, [game.phase, game.turn, game.dealer, game.trickNumber, gameOver, youWon]);

  const hint = selectedCard
    ? 'Tap Play to confirm · tap the card again to cancel'
    : myTurnToPlay
    ? game.leadSuit
      ? `Lead: ${SUIT_NAMES[game.leadSuit]} · follow suit if you can`
      : 'You lead · tap a glowing card'
    : game.message;

  const previewW = sizes.trickW * 1.5;
  const previewH = sizes.trickH * 1.5;

  const currentPopup = game.popups[0];
  const showGameOver = gameOver && game.popups.length === 0;

  const renderBadge = (playerIndex, horizontal = false) => (
    <PlayerBadge
      player={game.players[playerIndex]}
      playerIndex={playerIndex}
      horizontal={horizontal}
      isTurn={
        (game.phase === 'playing' || game.phase === 'bidding') && game.turn === playerIndex
      }
      isDealer={game.dealer === playerIndex}
    />
  );

  const handWidth =
    playerHand.length > 0 ? sizes.step * (playerHand.length - 1) + sizes.handCardW : 0;

  return (
    <WaterBackground
      style={styles.root}
      imageSource={require('../../assets/images/backgrounds/gameOcean.jpg')}
    >
      <View style={styles.content}>
        {/* top bar */}
        <View style={styles.topBar}>
          <TopPill
            label="‹  Games"
            accessibilityLabel="Back to Games"
            onPress={() => navigation?.goBack()}
          />
          <Text style={styles.title}>Spades</Text>
          <TopPill
            label="Rules  ?"
            accessibilityLabel="Rules and how to play"
            onPress={() => setRulesOpen(true)}
          />
        </View>

        {/* score strip */}
        <Glass tint={AERO.panel} radius={24} style={styles.scoreCard}>
          <View style={styles.scoreTeam}>
            <Text style={styles.scoreLabel}>Your team</Text>
            <Text style={styles.score}>{yourScore}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{game.bags[0]} bags</Text>
            </View>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreMiddle}>
            <Text style={styles.handLabel}>Hand {game.roundNumber}</Text>
            {game.difficulty && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{DIFFICULTY_LABELS[game.difficulty]}</Text>
              </View>
            )}
            {game.overtime && !gameOver && <Text style={styles.overtime}>OVERTIME</Text>}
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreTeam}>
            <Text style={styles.scoreLabel}>Them</Text>
            <Text style={styles.score}>{botScore}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{game.bags[1]} bags</Text>
            </View>
          </View>
        </Glass>

        {/* table */}
        <Glass tint={AERO.panel} radius={24} style={styles.table}>
          <Glass tint={AERO.panelSoft} radius={999} style={styles.statusPill}>
            <Text style={styles.statusTitle} numberOfLines={1}>
              {turnLabel}
            </Text>
            <Text style={styles.statusHint} numberOfLines={1}>
              {hint}
            </Text>
          </Glass>

          <View style={styles.northWrap}>{renderBadge(2, true)}</View>

          <View style={styles.middleRow}>
            <View style={styles.sideWrap}>{renderBadge(1)}</View>

            <Glass tint={AERO.well} radius={20} gloss={false} style={styles.trickArea}>
              {game.trick.map(({ playerIndex, card }) => (
                <Image
                  key={`${playerIndex}-${card.id}`}
                  source={CARD_IMAGES[card.id]}
                  resizeMode="contain"
                  style={[
                    styles.trickImage,
                    { width: sizes.trickW, height: sizes.trickH },
                    trickSeatStyle(playerIndex, sizes.trickW, sizes.trickH),
                  ]}
                />
              ))}

              {game.trick.length === 0 && game.phase === 'dealing' &&
                (game.dealer === 0 ? (
                  <GlossButton label="Deal" onPress={onDeal} accessibilityLabel="Deal the cards" />
                ) : (
                  <Text style={styles.centerText}>Waiting for dealer</Text>
                ))}

              {game.phase === 'bidding' &&
                (game.turn === 0 ? (
                  <View style={styles.bidPanel}>
                    <Text style={styles.bidLabel}>YOUR BID</Text>
                    <View style={styles.stepper}>
                      <GlossButton
                        label="−"
                        textStyle={styles.bidAdjustText}
                        variant="aqua"
                        accessibilityLabel="Lower bid"
                        disabled={game.bidSelection === 0}
                        onPress={() => adjustBid(-1)}
                        style={styles.bidAdjust}
                      />
                      <Text style={styles.bidNumber}>{formatBid(game.bidSelection)}</Text>
                      <GlossButton
                        label="+"
                        textStyle={styles.bidAdjustText}
                        variant="aqua"
                        accessibilityLabel="Raise bid"
                        disabled={game.bidSelection === 13}
                        onPress={() => adjustBid(1)}
                        style={styles.bidAdjust}
                      />
                    </View>
                    <GlossButton
                      label="Bid"
                      accessibilityLabel={`Confirm bid of ${formatBid(game.bidSelection)}`}
                      onPress={submitBid}
                      style={styles.bidConfirm}
                    />
                  </View>
                ) : (
                  <Text style={styles.centerText}>Bidding…</Text>
                ))}

              {game.phase === 'playing' && game.trick.length === 0 && !selectedCard && (
                <Text style={styles.centerText}>
                  {game.turn === 0 ? 'Play a card' : 'Waiting for a card'}
                </Text>
              )}

              {/* dim everything already on the table so the previewed card stands out */}
              {selectedCard && <View pointerEvents="none" style={styles.trickDim} />}

              {selectedCard && (
                <View style={styles.previewWrap}>
                  <View style={styles.previewCardSlot}>
                  <View style={{ width: previewW, height: previewH }}>
                    {/* soft halo: stacked translucent rings fake a glow on iOS and Android */}
                    {PREVIEW_HALO.map(([spread, alpha]) => (
                      <View
                        key={spread}
                        pointerEvents="none"
                        style={[
                          styles.halo,
                          {
                            backgroundColor: `rgba(255,255,255,${alpha})`,
                            bottom: -spread,
                            left: -spread,
                            right: -spread,
                            top: -spread,
                          },
                        ]}
                      />
                    ))}
                    <Image
                      source={CARD_IMAGES[selectedCard.id]}
                      resizeMode="contain"
                      style={[styles.previewImage, { width: previewW, height: previewH }]}
                    />
                  </View>
                  </View>
                  <View style={styles.previewActions}>
                  <GlossButton
                    label="Play"
                    small
                    accessibilityLabel={`Play ${selectedCard.rank} of ${SUIT_NAMES[selectedCard.suit]}`}
                    onPress={() => onPlayCard(selectedCard)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel card selection"
                    onPress={() => setSelectedId(null)}
                    hitSlop={8}
                  >
                    <Text style={styles.previewCancel}>Cancel</Text>
                  </Pressable>
                  </View>
                </View>
              )}
            </Glass>

            <View style={styles.sideWrap}>{renderBadge(3)}</View>
          </View>

          <View style={styles.southWrap}>{renderBadge(0, true)}</View>

          {/* hand result, laid over the table so the layout never grows */}
          {game.phase === 'roundOver' && (
            <View style={styles.resultOverlay}>
              <Glass tint={COLORS.resultGlass} radius={24} style={styles.resultCard}>
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.handOutcome,
                    game.yourTeamMadeBid ? styles.handWon : styles.handMissed,
                  ]}
                >
                  {game.yourTeamMadeBid ? 'You won this hand!' : 'You missed your bid'}
                </Text>
                {game.handResult.map((line, i) => (
                  <Text key={`${i}-${line}`} style={styles.resultText}>
                    {line}
                  </Text>
                ))}
                <GlossButton
                  label={gameOver ? 'New game' : 'Next hand'}
                  onPress={gameOver ? newGame : nextHand}
                  style={styles.resultButton}
                />
              </Glass>
            </View>
          )}
        </Glass>

        {/* hand: one fanned row, sized to fit the screen width */}
        <Glass tint={AERO.panel} radius={24} style={styles.handShelf}>
          <View
            style={{
              height: sizes.handCardH + LIFT + SELECT_RISE,
              width: Math.max(handWidth, 1),
              justifyContent: 'center',
            }}
          >
            {playerHand.map((card, index) => {
              const canPlay = playableIds.has(card.id);
              const dimmed = myTurnToPlay && !canPlay;
              const isSelected = selectedCard?.id === card.id;
              return (
                <Pressable
                  key={card.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${card.rank} of ${SUIT_NAMES[card.suit]}${canPlay ? (isSelected ? ', selected, tap to cancel' : ', playable, tap to preview') : ''}`}
                  disabled={!canPlay}
                  onPress={() => onTapCard(card)}
                  style={[
                    styles.handCard,
                    {
                      width: sizes.handCardW,
                      height: sizes.handCardH,
                      left: index * sizes.step,
                      top: isSelected ? 0 : canPlay ? SELECT_RISE : LIFT + SELECT_RISE,
                    },
                    canPlay && styles.playableCard,
                    isSelected && styles.selectedCard,
                    dimmed && styles.unplayableCard,
                  ]}
                >
                  <Image source={CARD_IMAGES[card.id]} resizeMode="contain" style={styles.handImage} />
                </Pressable>
              );
            })}
            {playerHand.length === 0 && (
              <Text style={styles.emptyHand}>
                {game.phase === 'dealing' ? 'Cards appear after the deal' : 'Your hand is empty'}
              </Text>
            )}
          </View>
        </Glass>
      </View>

      {/* Difficulty picker: shown when the screen opens and before every new game */}
      <Modal visible={!game.difficulty} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <Glass tint={AERO.modal} radius={28} style={styles.modalCard}>
            <Text accessibilityRole="header" style={styles.modalTitle}>
              Choose difficulty
            </Text>
            <Text style={styles.modalBody}>Your partner and both opponents are bots.</Text>
            {DIFFICULTIES.map((level) => (
              <Pressable
                key={level.key}
                accessibilityRole="button"
                accessibilityLabel={`${level.label} difficulty`}
                onPress={() => chooseDifficulty(level.key)}
                style={({ pressed }) => [
                  styles.diffOption,
                  { backgroundColor: level.wash, borderColor: level.rim },
                  pressed && styles.pressed,
                ]}
              >
                <LinearGradient
                  pointerEvents="none"
                  colors={['#FFFFFF', level.wash]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.diffRow}>
                  <Orb colors={level.orb} />
                  <View style={styles.diffText}>
                    <Text style={styles.diffTitle}>{level.label}</Text>
                    <Text style={styles.diffBlurb}>{level.blurb}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </Glass>
        </View>
      </Modal>

      {/* Rules / tutorial */}
      <Modal
        visible={rulesOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRulesOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Glass tint={AERO.modal} radius={28} style={[styles.modalCard, styles.rulesCard]}>
            <Text accessibilityRole="header" style={styles.modalTitle}>
              Rules &amp; how to play
            </Text>
            <ScrollView style={styles.rulesScroll} showsVerticalScrollIndicator>
              {RULES_SECTIONS.map((section, index) => (
                <View
                  key={section.title}
                  style={[styles.ruleBlock, index === RULES_SECTIONS.length - 1 && styles.ruleBlockLast]}
                >
                  <Text style={styles.ruleHeading}>{section.title}</Text>
                  <Text style={styles.ruleBody}>{section.body}</Text>
                </View>
              ))}
            </ScrollView>
            <GlossButton label="Got it" onPress={() => setRulesOpen(false)} style={styles.modalButton} />
          </Glass>
        </View>
      </Modal>

      {/* Boston / bag penalty / overtime popups, shown one at a time */}
      <InfoModal
        visible={Boolean(currentPopup)}
        title={currentPopup?.title ?? ''}
        buttonLabel="OK"
        onPress={dismissPopup}
      >
        <Text style={styles.modalBody}>{currentPopup?.body}</Text>
      </InfoModal>

      {/* Game over */}
      <InfoModal visible={showGameOver} title="Game over" buttonLabel="New game" onPress={newGame}>
        <Text style={styles.modalWinner}>{youWon ? 'Your team wins!' : 'Them wins'}</Text>
        <Text style={styles.modalBody}>
          Winning score: {status.winner === null ? '' : game.scores[status.winner]}
        </Text>
        <Text style={styles.modalBody}>
          Final: Your team {yourScore} · Them {botScore}
        </Text>
      </InfoModal>
    </WaterBackground>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const textGlow = {
  textShadowColor: AERO.shadow,
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
};

// Stronger halo for the title, which sits directly on open water.
const titleGlow = {
  textShadowColor: 'rgba(0,36,70,0.7)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 8,
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    gap: 10,
    paddingBottom: 18,
    paddingHorizontal: 12,
    paddingTop: TOP_INSET + 8,
  },

  /* glass + gloss */
  glass: {
    borderColor: AERO.rim,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glossButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 44,
    overflow: 'hidden',
    paddingHorizontal: 26,
  },
  glossButtonSmall: { minHeight: 34, paddingHorizontal: 14 },
  glossButtonShine: {
    borderRadius: 999,
    height: '46%',
    left: 10,
    position: 'absolute',
    right: 10,
    top: 2,
  },
  glossButtonText: { fontFamily: FONTS.bodyBold, fontSize: 16, letterSpacing: 0.3 },
  glossButtonTextSmall: { fontSize: 13 },
  disabledButton: { opacity: 0.4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  orb: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5,
    justifyContent: 'center',
  },

  /* top bar */
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  topPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(6,66,112,0.5)',
    borderColor: AERO.rim,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    overflow: 'hidden',
    width: 96,
  },
  topPillText: { color: '#FFFFFF', fontFamily: FONTS.bodyBold, fontSize: 14, ...textGlow },
  title: { color: '#FFFFFF', fontFamily: FONTS.heading, fontSize: 30, ...titleGlow },

  /* score strip */
  scoreCard: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 6, paddingVertical: 10 },
  scoreTeam: { alignItems: 'center', flex: 1, gap: 2 },
  scoreMiddle: { alignItems: 'center', gap: 6, width: 96 },
  scoreDivider: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: 4,
    width: 1,
  },
  scoreLabel: { color: AERO.textMuted, fontFamily: FONTS.bodyBold, fontSize: 12, letterSpacing: 0.4, ...textGlow },
  score: { color: '#FFFFFF', fontFamily: FONTS.heading, fontSize: 34, lineHeight: 38, ...textGlow },
  handLabel: { color: '#FFFFFF', fontFamily: FONTS.bodyBold, fontSize: 13, ...textGlow },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  chipText: { color: '#FFFFFF', fontFamily: FONTS.bodyBold, fontSize: 11 },
  overtime: { color: AERO.gold, fontFamily: FONTS.bodyBold, fontSize: 11, letterSpacing: 1, ...textGlow },

  /* table */
  table: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  statusPill: {
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  statusTitle: { color: '#FFFFFF', fontFamily: FONTS.heading, fontSize: 17, ...textGlow },
  statusHint: { color: AERO.textMuted, fontFamily: FONTS.body, fontSize: 12, ...textGlow },
  northWrap: { alignSelf: 'center', marginTop: 8 },
  southWrap: { alignSelf: 'center', marginTop: 2 },
  middleRow: { alignItems: 'stretch', flex: 1, flexDirection: 'row', marginVertical: 8 },
  sideWrap: { justifyContent: 'center', width: SIDE_W },
  trickArea: {
    alignItems: 'center',
    borderColor: AERO.rimSoft,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  trickImage: {
    position: 'absolute',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  trickDim: {
    backgroundColor: 'rgba(2,28,54,0.62)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  halo: { borderRadius: 12, position: 'absolute' },
  previewWrap: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    paddingBottom: 14,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  previewCardSlot: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  previewActions: { alignItems: 'center', gap: 10 },
  previewImage: {
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  previewCancel: { color: AERO.textMuted, fontFamily: FONTS.bodyBold, fontSize: 13, ...textGlow },
  centerText: { color: '#FFFFFF', fontFamily: FONTS.bodyBold, fontSize: 14, textAlign: 'center', ...textGlow },

  /* bidding */
  bidPanel: { alignItems: 'center', gap: 12 },
  bidLabel: { color: AERO.textMuted, fontFamily: FONTS.bodyBold, fontSize: 12, letterSpacing: 1.2, ...textGlow },
  stepper: {
    alignItems: 'center',
    backgroundColor: 'rgba(3,48,88,0.32)',
    borderColor: AERO.rimSoft,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    padding: 5,
  },
  bidAdjust: { borderRadius: 20, height: 40, minHeight: 40, paddingHorizontal: 0, width: 40 },
  bidAdjustText: { fontSize: 24, lineHeight: 28 },
  bidNumber: {
    color: '#FFFFFF',
    fontFamily: FONTS.heading,
    fontSize: 30,
    minWidth: 52,
    textAlign: 'center',
    ...textGlow,
  },
  bidConfirm: { minWidth: 120 },

  /* badges */
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(3,48,88,0.34)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  badgeH: { flexDirection: 'row', gap: 8, paddingHorizontal: 12 },
  badgeV: { gap: 2, paddingVertical: 8, width: '100%' },
  badgeActive: {
    backgroundColor: 'rgba(120,240,190,0.2)',
    borderColor: AERO.mint,
    shadowColor: AERO.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  fishFrame: { alignItems: 'center', height: 30, justifyContent: 'center', width: 44 },
  fish: { position: 'relative' },
  badgeTextH: { alignItems: 'flex-start' },
  badgeTextV: { alignItems: 'center', alignSelf: 'stretch' },
  playerName: { color: '#FFFFFF', fontFamily: FONTS.bodyBold, fontSize: 12, ...textGlow },
  playerStats: { color: AERO.textMuted, fontFamily: FONTS.body, fontSize: 11, ...textGlow },
  dealerChip: {
    backgroundColor: AERO.gold,
    borderRadius: 999,
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  dealerChipText: { color: AERO.goldInk, fontFamily: FONTS.bodyBold, fontSize: 10, letterSpacing: 0.3 },

  /* result overlay */
  resultOverlay: {
    alignItems: 'center',
    backgroundColor: COLORS.resultOverlay,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 14,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  resultCard: { alignItems: 'center', gap: 4, maxWidth: 360, paddingHorizontal: 20, paddingVertical: 18, width: '100%' },
  handOutcome: { fontFamily: FONTS.heading, fontSize: 24, marginBottom: 4, textAlign: 'center', ...textGlow },
  handWon: { color: AERO.gold },
  handMissed: { color: '#FFFFFF' },
  resultText: { color: '#FFFFFF', fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', ...textGlow },
  resultButton: { marginTop: 12 },

  /* hand */
  handShelf: { alignItems: 'center', paddingBottom: 8, paddingHorizontal: 8, paddingTop: 8 },
  handCard: {
    backgroundColor: COLORS.pearl,
    borderColor: COLORS.cardRim,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 1,
    position: 'absolute',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  playableCard: {
    borderColor: AERO.mint,
    borderWidth: 2,
    shadowColor: AERO.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 6,
  },
  selectedCard: {
    elevation: 10,
    shadowOpacity: 1,
    shadowRadius: 9,
    transform: [{ scale: 1.08 }],
    zIndex: 10,
  },
  unplayableCard: { opacity: 0.5 },
  handImage: { height: '100%', width: '100%' },
  emptyHand: { color: '#FFFFFF', fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', ...textGlow },

  /* difficulty picker */
  diffOption: {
    alignSelf: 'stretch',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  diffRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  diffText: { flex: 1, gap: 2 },
  diffTitle: { color: AERO.ink, fontFamily: FONTS.heading, fontSize: 19 },
  diffBlurb: { color: AERO.inkSoft, fontFamily: FONTS.body, fontSize: 13, lineHeight: 18 },

  /* modals */
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: COLORS.modalOverlay,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    alignItems: 'center',
    borderColor: COLORS.aquaRim,
    gap: 10,
    maxWidth: 420,
    padding: 22,
    width: '100%',
  },
  rulesCard: { alignItems: 'stretch', maxHeight: '85%' },
  rulesScroll: { flexGrow: 0, flexShrink: 1, marginVertical: 6 },
  modalTitle: { color: AERO.ink, fontFamily: FONTS.heading, fontSize: 26, textAlign: 'center' },
  modalWinner: { color: AERO.ink, fontFamily: FONTS.heading, fontSize: 22, textAlign: 'center' },
  modalBody: { color: AERO.inkSoft, fontFamily: FONTS.body, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  modalButton: { alignSelf: 'center', marginTop: 8 },
  ruleBlock: {
    borderBottomColor: 'rgba(11,74,116,0.12)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    paddingBottom: 12,
  },
  ruleBlockLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  ruleHeading: { color: AERO.ink, fontFamily: FONTS.bodyBold, fontSize: 15, marginBottom: 2 },
  ruleBody: { color: AERO.inkSoft, fontFamily: FONTS.body, fontSize: 14, lineHeight: 21 },
});