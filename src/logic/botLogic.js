import { RANKS, RANK_VALUES, SUITS } from '../constants/gameConstants';
import {
  beats,
  highestCard,
  highestRank,
  legalCards,
  lowestCard,
  winningPlay,
} from './cardUtils';
import { teamOf } from './scoring';

export function estimateBid(hand) {
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

function handPoints(hand) {
  const bySuit = Object.fromEntries(SUITS.map((suit) => [suit, hand.filter((card) => card.suit === suit)]));
  const spadeCount = bySuit.S.length;
  let points = 0;

  bySuit.S.forEach((card) => {
    const value = RANK_VALUES[card.rank];
    if (value === 14) points += 1;
    else if (value === 13) points += spadeCount >= 2 ? 0.9 : 0.4;
    else if (value === 12) points += spadeCount >= 3 ? 0.6 : 0.2;
    else if (value === 11) points += spadeCount >= 4 ? 0.3 : 0;
  });
  points += Math.max(0, spadeCount - 3) * 0.8;

  SUITS.filter((suit) => suit !== 'S').forEach((suit) => {
    const cards = bySuit[suit];
    const count = cards.length;
    cards.forEach((card) => {
      const value = RANK_VALUES[card.rank];
      if (value === 14) points += count <= 5 ? 1 : 0.7;
      else if (value === 13) points += count >= 3 ? 0.7 : count === 2 ? 0.45 : 0.15;
      else if (value === 12) points += count >= 4 ? 0.3 : 0.1;
    });
    if (count === 0 && spadeCount >= 3) points += 1;
    else if (count === 1 && spadeCount >= 4) points += 0.5;
  });
  return points;
}

function nilDanger(hand) {
  return hand.reduce((sum, card) => {
    const value = RANK_VALUES[card.rank];
    let danger =
      value === 14 ? 3 : value === 13 ? 2 : value === 12 ? 1.2 : value === 11 ? 0.6 : value === 10 ? 0.25 : 0;
    if (card.suit === 'S' && value >= 9) danger += 1.5;
    return sum + danger;
  }, 0);
}

export function chooseBotBid(game, playerIndex) {
  const hand = game.players[playerIndex].hand;
  const level = game.difficulty;
  const base = estimateBid(hand);

  if (level === 'easy') {
    const noise = Math.floor(Math.random() * 3) - 1;
    return Math.max(0, Math.min(13, base + noise));
  }

  const danger = nilDanger(hand);
  const spades = hand.filter((card) => card.suit === 'S').length;
  if (level === 'hard') {
    if (danger < 3.5 && spades <= 3) return 0;
  } else if (danger < 4.5) {
    return 0;
  }

  let bid = level === 'hard' ? Math.round(handPoints(hand)) : base;
  if (level === 'hard') {
    const others = game.players.reduce(
      (sum, player, index) =>
        index === playerIndex || player.bid === null ? sum : sum + player.bid,
      0
    );
    if (others + bid > 13 && bid > 1) bid -= 1;
  }
  return Math.max(1, Math.min(13, bid));
}

function getKnowledge(game, me) {
  const seen = new Set(game.players[me].hand.map((card) => card.id));
  const voids = [new Set(), new Set(), new Set(), new Set()];
  const record = (trick, leadSuit) =>
    trick.forEach(({ playerIndex, card }) => {
      seen.add(card.id);
      if (card.suit !== leadSuit) voids[playerIndex].add(leadSuit);
    });
  game.history.forEach((hand) => record(hand.trick, hand.leadSuit));
  if (game.trick.length) record(game.trick, game.trick[0].card.suit);
  return { seen, voids };
}

function isSafeMaster(card, knowledge, me) {
  const higherUnseen = RANKS.some(
    (rank) =>
      RANK_VALUES[rank] > RANK_VALUES[card.rank] &&
      !knowledge.seen.has(`${rank}${card.suit}`)
  );
  if (higherUnseen) return false;
  if (card.suit === 'S') return true;
  const spadesLeft = RANKS.some((rank) => !knowledge.seen.has(`${rank}S`));
  if (!spadesLeft) return true;
  return [0, 1, 2, 3]
    .filter((playerIndex) => teamOf(playerIndex) !== teamOf(me))
    .every((playerIndex) => !knowledge.voids[playerIndex].has(card.suit));
}

function tricksNeeded(game, me) {
  const mates = teamOf(me) === 0 ? [0, 2] : [1, 3];
  const bid = mates.reduce((sum, index) => sum + (game.players[index].bid || 0), 0);
  const tricks = mates.reduce(
    (sum, index) =>
      sum + (game.players[index].bid === 0 ? 0 : game.players[index].tricks),
    0
  );
  return bid - tricks;
}

function mediumCard(game, me, choices) {
  if (game.trick.length === 0) {
    const nonSpades = choices.filter((card) => card.suit !== 'S');
    const aces = nonSpades.filter((card) => card.rank === 'A');
    if (aces.length) return aces[0];
    return lowestCard(nonSpades.length ? nonSpades : choices);
  }
  const leadSuit = game.trick[0].card.suit;
  const winner = winningPlay(game.trick);
  if (teamOf(winner.playerIndex) === teamOf(me)) return lowestCard(choices);
  const winners = choices.filter((card) => beats(card, winner, leadSuit));
  return winners.length ? lowestCard(winners) : lowestCard(choices);
}

function hardCard(game, me, choices) {
  const knowledge = getKnowledge(game, me);
  const partner = (me + 2) % 4;
  const opponents = [(me + 1) % 4, (me + 3) % 4];
  const nilAlive = (playerIndex) =>
    game.players[playerIndex].bid === 0 && game.players[playerIndex].tricks === 0;
  const partnerNil = nilAlive(partner);
  const oppNil = opponents.filter(nilAlive);
  const need = tricksNeeded(game, me);
  const bagAvoid = need <= 0 && !partnerNil;
  const trick = game.trick;

  if (trick.length === 0) {
    const nonSpades = choices.filter((card) => card.suit !== 'S');
    const lowLead = lowestCard(nonSpades.length ? nonSpades : choices);
    if (oppNil.length || bagAvoid) return lowLead;
    const masters = nonSpades.filter((card) => isSafeMaster(card, knowledge, me));
    if (masters.length) return highestCard(masters);
    const spadeMasters = choices.filter(
      (card) => card.suit === 'S' && isSafeMaster(card, knowledge, me)
    );
    if (spadeMasters.length && game.spadesBroken && need > 0) return spadeMasters[0];
    return lowLead;
  }

  const leadSuit = trick[0].card.suit;
  const winner = winningPlay(trick);
  const partnerWinning = teamOf(winner.playerIndex) === teamOf(me);
  const winners = choices.filter((card) => beats(card, winner, leadSuit));
  const losers = choices.filter((card) => !beats(card, winner, leadSuit));
  const after = 3 - trick.length;
  const hasPlayed = (playerIndex) => trick.some((play) => play.playerIndex === playerIndex);

  if (partnerNil) {
    if (winner.playerIndex === partner) {
      return winners.length ? lowestCard(winners) : lowestCard(choices);
    }
    if (!hasPlayed(partner) && winners.length) return highestCard(winners);
  }

  if (oppNil.length) {
    const nilStillToPlay = oppNil.some((playerIndex) => !hasPlayed(playerIndex));
    const nilWinning = oppNil.includes(winner.playerIndex);
    if (nilStillToPlay || nilWinning) return lowestCard(choices);
  }

  if (bagAvoid) {
    if (losers.length) {
      const sideLosers = losers.filter((card) => card.suit !== 'S');
      return highestCard(sideLosers.length ? sideLosers : losers);
    }
    return lowestCard(winners);
  }

  if (partnerWinning) return lowestCard(choices);
  if (winners.length) {
    if (after === 0) return lowestCard(winners);
    const ledWinners = winners.filter((card) => card.suit === leadSuit);
    if (ledWinners.length) {
      const secure = ledWinners.filter((card) => isSafeMaster(card, knowledge, me));
      return secure.length ? lowestCard(secure) : highestCard(ledWinners);
    }
    return lowestCard(winners);
  }
  return lowestCard(choices);
}

export function chooseBotCard(game, me) {
  const player = game.players[me];
  const level = game.difficulty;
  const choices = legalCards(player.hand, game.trick, game.spadesBroken);
  if (choices.length === 1) return choices[0];

  if (player.bid === 0 && player.tricks === 0) {
    if (game.trick.length === 0 || level === 'easy') return lowestCard(choices);
    const leadSuit = game.trick[0].card.suit;
    const winner = winningPlay(game.trick);
    const losers = choices.filter((card) => !beats(card, winner, leadSuit));
    if (!losers.length) return lowestCard(choices);
    return level === 'hard' ? highestRank(losers) : lowestCard(losers);
  }

  if (level === 'easy') return choices[Math.floor(Math.random() * choices.length)];
  return level === 'hard' ? hardCard(game, me, choices) : mediumCard(game, me, choices);
}
