import { SEATS, TRICKS_PER_HAND, WINNING_SCORE } from '../constants/gameConstants';

export const teamOf = (playerIndex) => playerIndex % 2;
const teamLabel = (team) => (team === 0 ? 'Your team' : 'Them');
const signed = (value) => `${value >= 0 ? '+' : '−'}${Math.abs(value)}`;

export function getGameStatus(scores) {
  const [you, bots] = scores;
  if (Math.max(you, bots) < WINNING_SCORE) return { over: false, overtime: false, winner: null };
  if (you === bots) return { over: false, overtime: true, winner: null };
  return { over: true, overtime: false, winner: you > bots ? 0 : 1 };
}

export function scoreHand(game) {
  const nextScores = [...game.scores];
  const nextBags = [...game.bags];
  const lines = [];
  const popups = [];

  const teamPlayers = (team) => (team === 0 ? [0, 2] : [1, 3]);
  const teamTricks = [0, 1].map((team) =>
    teamPlayers(team).reduce((sum, i) => sum + game.players[i].tricks, 0)
  );

  const bostonTeam = teamTricks.findIndex((tricks) => tricks === TRICKS_PER_HAND);
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

    lines.push(`${teamLabel(team)} ${signed(nextScores[team] - previousScore)}`);
    details.forEach((detail) => lines.push(`   ${detail}`));
  });

  return { scores: nextScores, bags: nextBags, lines, popups, yourTeamMadeBid };
}
