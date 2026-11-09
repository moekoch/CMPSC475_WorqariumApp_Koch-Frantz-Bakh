import {
  HAND_SIZE,
  PLAYER_NAMES,
  TRICKS_PER_HAND,
} from '../constants/gameConstants';
import { estimateBid } from './botLogic';
import {
  createDeck,
  getTrickWinner,
  legalCards,
  shuffle,
  sortedHand,
} from './cardUtils';
import { getGameStatus, scoreHand } from './scoring';

export function createRound({
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

export function createGame(difficulty = null) {
  return createRound({ dealer: Math.floor(Math.random() * 4), difficulty });
}

export function dealHand(game) {
  const deck = shuffle(createDeck());
  const players = [0, 1, 2, 3].map((index) => ({
    hand: sortedHand(deck.slice(index * HAND_SIZE, (index + 1) * HAND_SIZE)),
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

// Bids proceed clockwise from the player left of the dealer; play starts with the dealer.
export function applyBid(game, playerIndex, bid) {
  const players = game.players.map((player, index) =>
    index === playerIndex ? { ...player, bid } : player
  );
  const allBid = players.every((player) => player.bid !== null);

  if (allBid) {
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

export function playCard(game, playerIndex, card) {
  const legal = legalCards(game.players[playerIndex].hand, game.trick, game.spadesBroken);
  if (!legal.some((legalCard) => legalCard.id === card.id)) return game;

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
    // Playing any spade breaks trump for the rest of the hand.
    spadesBroken: game.spadesBroken || card.suit === 'S',
    message:
      trick.length === 4
        ? 'Trick complete — determining the winner...'
        : `${PLAYER_NAMES[nextTurn]} to play.`,
  };
}

export function finishTrick(game) {
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
