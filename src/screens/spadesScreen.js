import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import GameTable from '../components/GameTable';
import PlayerHand from '../components/PlayerHand';
import { AERO, Glass, GlossButton, InfoModal, Orb, TopPill } from '../components/SpadesUI';
import WaterBackground from '../components/aquarium/WaterBackground';
import {
  DIFFICULTIES,
  HAND_SIZE,
  PLAYER_NAMES,
  RULES_SECTIONS,
  SUIT_NAMES,
  TRICKS_PER_HAND,
} from '../constants/gameConstants';
import { COLORS, FONTS } from '../constants/theme';
import { chooseBotBid, chooseBotCard } from '../logic/botLogic';
import { legalCards } from '../logic/cardUtils';
import {
  applyBid,
  createGame,
  createRound,
  dealHand,
  finishTrick,
  playCard,
} from '../logic/gameLogic';
import { getGameStatus } from '../logic/scoring';

const TOP_INSET = Platform.OS === 'android' ? StatusBar.currentHeight || 28 : 54;
const SIDE_W = 72;
const LIFT = 12;
const SELECT_RISE = 14;
const DIFFICULTY_APPEARANCE = {
  easy: { orb: ['#B4F5D5', '#22B07E'], wash: '#DDF7EC', rim: '#A6E3C8' },
  medium: { orb: ['#FFE9A3', '#EDA311'], wash: '#FFF1D0', rim: '#F2D88F' },
  hard: { orb: ['#FFC4B6', '#E2573F'], wash: '#FFE3DD', rim: '#F3B8AB' },
};

export default function SpadesScreen({ navigation }) {
  const [game, setGame] = useState(() => createGame());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const sizes = useMemo(() => {
    const availW = windowWidth - 24;
    const handCardW = Math.max(
      32,
      Math.min(52, Math.floor(availW * 0.14), Math.floor(windowHeight * 0.065))
    );
    const handCardH = Math.round(handCardW * 1.49);
    const step = Math.min(handCardW + 4, (availW - 16 - handCardW) / (HAND_SIZE - 1));
    const trickW = Math.max(
      24,
      Math.min(
        48,
        Math.floor((windowWidth - 24 - 16 - 2 * SIDE_W - 8) / 3),
        Math.floor(windowHeight * 0.07)
      )
    );
    return {
      handCardW,
      handCardH,
      step,
      trickW,
      trickH: Math.round(trickW * 1.49),
      previewW: Math.round(trickW * 1.4),
      previewH: Math.round(trickW * 1.49 * 1.4),
      restTop: LIFT + SELECT_RISE,
      playableTop: SELECT_RISE,
      selectedTop: 0,
    };
  }, [windowWidth, windowHeight]);

  useEffect(() => {
    if (!game.difficulty) return undefined;

    if (game.phase === 'dealing') {
      if (game.dealer === 0) return undefined;
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

  const nextHand = useCallback(() => {
    setSelectedCardId(null);
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

  const newGame = useCallback(() => {
    setSelectedCardId(null);
    setGame(createGame());
  }, []);

  const chooseDifficulty = useCallback((level) => {
    setGame((current) => ({ ...current, difficulty: level }));
  }, []);

  const dismissPopup = useCallback(() => {
    setGame((current) => ({ ...current, popups: current.popups.slice(1) }));
  }, []);

  const playerHand = game.players[0].hand;
  const myTurnToPlay = game.phase === 'playing' && game.turn === 0 && game.trick.length < 4;
  const playable = useMemo(() => {
    if (!myTurnToPlay) return [];
    return legalCards(playerHand, game.trick, game.spadesBroken);
  }, [myTurnToPlay, game.trick, game.spadesBroken, playerHand]);
  const playableIds = useMemo(() => new Set(playable.map((card) => card.id)), [playable]);
  const selectedCard = playerHand.find(
    (card) => card.id === selectedCardId && playableIds.has(card.id)
  );

  const onPlayCard = useCallback((card) => {
    setSelectedCardId(null);
    setGame((current) => {
      if (current.phase !== 'playing' || current.turn !== 0 || current.trick.length >= 4) {
        return current;
      }
      const currentCard = current.players[0].hand.find((handCard) => handCard.id === card.id);
      if (!currentCard) return current;
      const currentPlayable = legalCards(
        current.players[0].hand,
        current.trick,
        current.spadesBroken
      );
      if (!currentPlayable.some((playableCard) => playableCard.id === card.id)) return current;
      return playCard(current, 0, currentCard);
    });
  }, []);

  const onHandCardPress = useCallback(
    (card) => {
      if (!playableIds.has(card.id)) return;
      setSelectedCardId((current) => (current === card.id ? null : card.id));
    },
    [playableIds]
  );

  const yourScore = game.scores[0];
  const botScore = game.scores[1];
  const status = getGameStatus(game.scores);
  const gameOver = game.phase === 'roundOver' && status.over;
  const youWon = status.winner === 0;
  const turnLabel = useMemo(() => {
    if (game.phase === 'dealing') return game.dealer === 0 ? 'Your deal' : 'Waiting for dealer';
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
  const hint = myTurnToPlay
    ? selectedCard
      ? 'Tap Play to confirm · tap the card again to cancel'
      : game.leadSuit
        ? `Lead: ${SUIT_NAMES[game.leadSuit]} · follow suit if you can`
        : 'You lead · tap a glowing card'
    : game.message;
  const currentPopup = game.popups[0];
  const showGameOver = gameOver && game.popups.length === 0;

  return (
    <WaterBackground
      style={styles.root}
      imageSource={require('../../assets/images/backgrounds/gameOcean.jpg')}
    >
      <View style={styles.content}>
        <View style={styles.topBar}>
          <TopPill
            label="‹  Games"
            accessibilityLabel="Back to Games"
            onPress={() => navigation?.goBack()}
            styles={styles}
          />
          <Text accessibilityRole="header" style={styles.title}>Spades</Text>
          <TopPill
            label="Rules  ?"
            accessibilityLabel="Rules and how to play"
            onPress={() => setRulesOpen(true)}
            styles={styles}
          />
        </View>

        <GameTable
          game={game}
          yourScore={yourScore}
          botScore={botScore}
          turnLabel={turnLabel}
          hint={hint}
          sizes={sizes}
          selectedCard={selectedCard}
          gameOver={gameOver}
          youWon={youWon}
          onDeal={onDeal}
          adjustBid={adjustBid}
          submitBid={submitBid}
          onPlayCard={onPlayCard}
          onCancelCard={() => setSelectedCardId(null)}
          newGame={newGame}
          nextHand={nextHand}
          styles={styles}
        />

        <PlayerHand
          cards={playerHand}
          selectedCardId={selectedCardId}
          playableIds={playableIds}
          isTurn={myTurnToPlay}
          phase={game.phase}
          sizes={sizes}
          onCardPress={onHandCardPress}
          styles={styles}
        />
      </View>

      <Modal visible={!game.difficulty} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <Glass tint={AERO.modal} radius={28} style={styles.modalCard} styles={styles}>
            <Text accessibilityRole="header" style={styles.modalTitle}>
              Choose difficulty
            </Text>
            <Text style={styles.modalBody}>Your partner and both opponents are bots.</Text>
            {DIFFICULTIES.map((level) => {
              const appearance = DIFFICULTY_APPEARANCE[level.key];
              return (
                <Pressable
                  key={level.key}
                  accessibilityRole="button"
                  accessibilityLabel={`${level.label} difficulty`}
                  onPress={() => chooseDifficulty(level.key)}
                  style={({ pressed }) => [
                    styles.diffOption,
                    { backgroundColor: appearance.wash, borderColor: appearance.rim },
                    pressed && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    pointerEvents="none"
                    colors={['#FFFFFF', appearance.wash]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.diffRow}>
                    <Orb colors={appearance.orb} styles={styles} />
                    <View style={styles.diffText}>
                      <Text style={styles.diffTitle}>{level.label}</Text>
                      <Text style={styles.diffBlurb}>{level.blurb}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </Glass>
        </View>
      </Modal>

      <Modal
        visible={rulesOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRulesOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Glass
            tint={AERO.modal}
            radius={28}
            style={[styles.modalCard, styles.rulesCard]}
            styles={styles}
          >
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
            <GlossButton
              label="Got it"
              onPress={() => setRulesOpen(false)}
              style={styles.modalButton}
              styles={styles}
            />
          </Glass>
        </View>
      </Modal>

      <InfoModal
        visible={Boolean(currentPopup)}
        title={currentPopup?.title ?? ''}
        buttonLabel="OK"
        onPress={dismissPopup}
        styles={styles}
      >
        <Text style={styles.modalBody}>{currentPopup?.body}</Text>
      </InfoModal>

      <InfoModal
        visible={showGameOver}
        title="Game over"
        buttonLabel="New game"
        onPress={newGame}
        styles={styles}
      >
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
  gloss: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
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
  scoreCard: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  scoreTeam: { alignItems: 'center', flex: 1, gap: 2 },
  scoreMiddle: { alignItems: 'center', gap: 6, width: 96 },
  scoreDivider: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: 4,
    width: 1,
  },
  scoreLabel: {
    color: AERO.textMuted,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    letterSpacing: 0.4,
    ...textGlow,
  },
  score: { color: '#FFFFFF', fontFamily: FONTS.heading, fontSize: 34, lineHeight: 38, ...textGlow },
  handLabel: { color: '#FFFFFF', fontFamily: FONTS.bodyBold, fontSize: 13, ...textGlow },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  chipText: { color: '#FFFFFF', fontFamily: FONTS.bodyBold, fontSize: 11 },
  overtime: {
    color: AERO.gold,
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    letterSpacing: 1,
    ...textGlow,
  },

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
    paddingBottom: 2,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  previewCardSlot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 28,
  },
  previewActions: { alignItems: 'center', gap: 8 },
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
  bidLabel: {
    color: AERO.textMuted,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    letterSpacing: 1.2,
    ...textGlow,
  },
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
  diffBlurb: {
    color: AERO.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
  },

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
  modalTitle: { color: COLORS.aeroInk, fontFamily: FONTS.heading, fontSize: 26, textAlign: 'center' },
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
