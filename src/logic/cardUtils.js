import { RANKS, RANK_VALUES, SUITS } from '../constants/gameConstants';

export function createDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ id: `${rank}${suit}`, rank, suit })));
}

export function shuffle(deck) {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sortedHand(hand) {
  return [...hand].sort((a, b) => {
    const suitOrder = SUITS.indexOf(b.suit) - SUITS.indexOf(a.suit);
    return suitOrder || RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
  });
}

export function formatBid(bid) {
  return bid === null || bid === undefined ? '—' : bid === 0 ? 'NIL' : String(bid);
}

export function legalCards(hand, trick, spadesBroken) {
  if (trick.length > 0) {
    const ledSuit = trick[0].card.suit;
    const followingSuit = hand.filter((card) => card.suit === ledSuit);
    if (!followingSuit.length) return hand;
    if (ledSuit === 'S') return followingSuit;
    // When void in the led suit, allow either an off-suit discard or a trump.
    return [...followingSuit, ...hand.filter((card) => card.suit === 'S')];
  }
  // Spades cannot be led until broken, unless the player's hand is all spades.
  if (!spadesBroken) {
    const nonSpades = hand.filter((card) => card.suit !== 'S');
    return nonSpades.length ? nonSpades : hand;
  }
  return hand;
}

export function trumpStrength(card, leadSuit) {
  return card.suit === 'S' ? 2 : card.suit === leadSuit ? 1 : 0;
}

export function winningPlay(trick) {
  // Trump outranks the led suit; otherwise the highest card of the led suit wins.
  const leadSuit = trick[0].card.suit;
  return trick.reduce((winner, play) => {
    const strength = trumpStrength(play.card, leadSuit);
    const winnerStrength = trumpStrength(winner.card, leadSuit);
    if (strength > winnerStrength) return play;
    if (
      strength === winnerStrength &&
      RANK_VALUES[play.card.rank] > RANK_VALUES[winner.card.rank]
    ) {
      return play;
    }
    return winner;
  });
}

export function beats(card, play, leadSuit) {
  const strength = trumpStrength(card, leadSuit);
  const playStrength = trumpStrength(play.card, leadSuit);
  return (
    strength > playStrength ||
    (strength === playStrength &&
      strength > 0 &&
      RANK_VALUES[card.rank] > RANK_VALUES[play.card.rank])
  );
}

export function getTrickWinner(trick, leadSuit) {
  const strength = (play) =>
    play.card.suit === 'S' ? 2 : play.card.suit === leadSuit ? 1 : 0;

  return trick.reduce((winner, play) => {
    const currentStrength = strength(play);
    const winnerStrength = strength(winner);
    if (currentStrength > winnerStrength) return play;
    if (
      currentStrength === winnerStrength &&
      RANK_VALUES[play.card.rank] > RANK_VALUES[winner.card.rank]
    ) {
      return play;
    }
    return winner;
  }).playerIndex;
}

export const cardCost = (card) => RANK_VALUES[card.rank] + (card.suit === 'S' ? 20 : 0);
export const lowestCard = (cards) => [...cards].sort((a, b) => cardCost(a) - cardCost(b))[0];
export const highestCard = (cards) => [...cards].sort((a, b) => cardCost(b) - cardCost(a))[0];
export const highestRank = (cards) =>
  [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])[0];
