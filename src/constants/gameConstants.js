import { COLORS } from './theme';

export const SUITS = ['C', 'D', 'H', 'S'];
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const RANK_VALUES = Object.fromEntries(RANKS.map((rank, index) => [rank, index + 2]));
export const SUIT_NAMES = { C: 'Clubs', D: 'Diamonds', H: 'Hearts', S: 'Spades' };

// Index order is clockwise: 0 South (you), 1 West, 2 North (partner), 3 East.
export const SEATS = ['South', 'West', 'North', 'East'];
export const SEAT_TAGS = ['You', 'Bot', 'Partner', 'Bot'];
export const PLAYER_NAMES = ['You', 'West', 'Partner', 'East'];
export const PLAYER_FISH = ['orangeClownfish', 'blueTang', 'moorishIdol', 'linedButterflyfish'];
export const WINNING_SCORE = 500;
export const HAND_SIZE = 13;
export const TRICKS_PER_HAND = 13;

export const CARD_IMAGES = {
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

export const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    bg: COLORS.limeDark,
    rim: COLORS.limeGlow,
    blurb: 'Relaxed bots. They bid roughly and play most cards at random.',
  },
  {
    key: 'medium',
    label: 'Medium',
    bg: COLORS.difficultyMedium,
    rim: COLORS.difficultyMediumRim,
    blurb: 'Solid bots. They bid carefully, win tricks cheaply, and never overtake their partner.',
  },
  {
    key: 'hard',
    label: 'Hard',
    bg: COLORS.difficultyHard,
    rim: COLORS.difficultyHardRim,
    blurb: 'Sharp bots. They count cards, track voids, defend nil bids, and manage bags.',
  },
];

export const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export const RULES_SECTIONS = [
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
      'Follow the suit that was led if you can, or play a spade to trump another suit at any time. If you cannot follow suit, you may play any card. Spades are always trump, so any spade beats any card of another suit. The highest card of the winning suit takes the trick, and the trick winner leads next. Spades cannot be led until a spade has been played (unless a hand is all spades).',
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
    body: 'Bags are bad. Every time a team collects 10 bags it takes a BAG PENALTY of −100 points.',
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
