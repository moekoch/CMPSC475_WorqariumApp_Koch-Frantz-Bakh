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
import { COLORS, FONTS } from '../constants/theme';
import {
  DIFFICULTIES,
  HAND_SIZE,
  PLAYER_NAMES,
  RULES_SECTIONS,
  SUIT_NAMES,
  TRICKS_PER_HAND,
} from '../constants/gameConstants';
import GameTable from '../components/GameTable';
import PlayerHand from '../components/PlayerHand';
import { Glass, GlossButton, InfoModal } from '../components/SpadesUI';
import WaterBackground from '../components/aquarium/WaterBackground';
import { chooseBotBid, chooseBotCard } from '../logic/botLogic';
import {
  applyBid,
  createGame,
  createRound,
  dealHand,
  finishTrick,
  playCard,
} from '../logic/gameLogic';
import { legalCards } from '../logic/cardUtils';
import { getGameStatus } from '../logic/scoring';

const TOP_INSET = Platform.OS === 'android' ? StatusBar.currentHeight || 28 : 54;
const SIDE_W = 72;

export default function SpadesScreen({ navigation }) {
  const [game, setGame] = useState(() => createGame());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const sizes = useMemo(() => {
    const availW = windowWidth - 24;
    const handCardW = Math.max(
      36,
      Math.min(64, Math.floor(availW * 0.165), Math.floor(windowHeight * 0.075))
    );
    const handCardH = Math.round(handCardW * 1.49);
    const step = Math.min(handCardW + 4, (availW - 16 - handCardW) / (HAND_SIZE - 1));
    const trickW = Math.max(
      30,
      Math.min(
        54,
        Math.floor((windowWidth - 24 - 16 - 2 * SIDE_W - 8) / 3.3),
        Math.floor(windowHeight * 0.075)
      )
    );
    return {
      handCardW,
      handCardH,
      step,
      trickW,
      trickH: Math.round(trickW * 1.49),
      restTop: 20,
      playableTop: 12,
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

  const onHandCardPress = useCallback(
    (card) => {
      if (!playableIds.has(card.id)) return;
      if (selectedCardId === card.id) {
        setSelectedCardId(null);
        setGame((current) => {
          if (current.phase !== 'playing' || current.turn !== 0 || current.trick.length >= 4) {
            return current;
          }
          const currentCard = current.players[0].hand.find((handCard) => handCard.id === card.id);
          if (!currentCard) return current;
          const currentPlayableCards = legalCards(
            current.players[0].hand,
            current.trick,
            current.spadesBroken
          );
          if (!currentPlayableCards.some((playableCard) => playableCard.id === card.id)) {
            return current;
          }
          return playCard(current, 0, currentCard);
        });
      } else {
        setSelectedCardId(card.id);
      }
    },
    [playableIds, selectedCardId]
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
      ? `Selected ${selectedCard.rank} of ${SUIT_NAMES[selectedCard.suit]} · tap again to play`
      : game.leadSuit
        ? `Lead: ${SUIT_NAMES[game.leadSuit]} · follow suit or trump with a spade`
        : 'You lead · tap a glowing card to select it'
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Games"
            onPress={() => navigation?.goBack()}
            hitSlop={8}
            style={({ pressed }) => [styles.topPill, pressed && styles.pressed]}
          >
            <Text style={styles.topPillText}>‹  Games</Text>
          </Pressable>
          <Text style={styles.title}>Spades</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Rules and how to play"
            onPress={() => setRulesOpen(true)}
            hitSlop={8}
            style={({ pressed }) => [styles.topPill, pressed && styles.pressed]}
          >
            <Text style={styles.topPillText}>Rules  ?</Text>
          </Pressable>
        </View>

        <GameTable
          game={game}
          yourScore={yourScore}
          botScore={botScore}
          turnLabel={turnLabel}
          hint={hint}
          sizes={sizes}
          gameOver={gameOver}
          youWon={youWon}
          onDeal={onDeal}
          adjustBid={adjustBid}
          submitBid={submitBid}
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
          <Glass tint={COLORS.modalGlass} radius={28} style={styles.modalCard} styles={styles}>
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
                  { backgroundColor: level.bg, borderColor: level.rim },
                  pressed && styles.pressed,
                ]}
              >
                <View pointerEvents="none" style={styles.glossButtonShine} />
                <Text style={styles.diffTitle}>{level.label}</Text>
                <Text style={styles.diffBlurb}>{level.blurb}</Text>
              </Pressable>
            ))}
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
            tint={COLORS.modalGlass}
            radius={28}
            style={[styles.modalCard, styles.rulesCard]}
            styles={styles}
          >
            <Text accessibilityRole="header" style={styles.modalTitle}>
              Rules &amp; how to play
            </Text>
            <ScrollView style={styles.rulesScroll} showsVerticalScrollIndicator>
              {RULES_SECTIONS.map((section) => (
                <View key={section.title} style={styles.ruleBlock}>
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
  textShadowColor: COLORS.textGlow,
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    gap: 10,
    paddingBottom: 24,
    paddingHorizontal: 12,
    paddingTop: TOP_INSET + 8,
  },

  /* glass + gloss */
  glass: {
    borderColor: COLORS.glassRim,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  gloss: {
    backgroundColor: COLORS.glassLight,
    height: '46%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  glossButton: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 42,
    overflow: 'hidden',
    paddingHorizontal: 22,
  },
  glossButtonSmall: { borderRadius: 16, minHeight: 32, paddingHorizontal: 12 },
  glossButtonShine: {
    backgroundColor: COLORS.glassShine,
    height: '50%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  glossButtonText: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 16, ...textGlow },
  glossButtonTextSmall: { fontSize: 13 },
  disabledButton: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  /* top bar */
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  topPill: {
    alignItems: 'center',
    backgroundColor: COLORS.glassControl,
    borderColor: COLORS.glassRim,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 88,
    paddingHorizontal: 12,
  },
  topPillText: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 14, ...textGlow },
  title: { color: COLORS.pearl, fontFamily: FONTS.heading, fontSize: 28, ...textGlow },

  /* score strip */
  scoreCard: { alignItems: 'center', flexDirection: 'row', paddingVertical: 4 },
  scoreTeam: { alignItems: 'center', flex: 1 },
  scoreMiddle: { alignItems: 'center', width: 110 },
  scoreLabel: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 12, ...textGlow },
  score: { color: COLORS.pearl, fontFamily: FONTS.heading, fontSize: 24, lineHeight: 28, ...textGlow },
  scoreDetail: { color: COLORS.glassText, fontFamily: FONTS.body, fontSize: 11, ...textGlow },
  overtime: { color: COLORS.sunYellow, fontFamily: FONTS.bodyBold, fontSize: 11, ...textGlow },

  /* table */
  table: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  statusPill: {
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  statusTitle: { color: COLORS.pearl, fontFamily: FONTS.heading, fontSize: 16, ...textGlow },
  statusHint: { color: COLORS.glassTextMuted, fontFamily: FONTS.body, fontSize: 11, ...textGlow },
  northWrap: { alignSelf: 'center', marginTop: 8 },
  southWrap: { alignSelf: 'center', marginTop: 2 },
  middleRow: { alignItems: 'stretch', flex: 1, flexDirection: 'row', marginVertical: 8 },
  sideWrap: { justifyContent: 'center', width: SIDE_W },
  trickArea: { alignItems: 'center', flex: 1, justifyContent: 'center', marginHorizontal: 4 },
  trickImage: {
    position: 'absolute',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  centerText: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 13, textAlign: 'center', ...textGlow },

  /* bidding */
  bidPanel: { alignItems: 'center', gap: 8 },
  bidLabel: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 13, ...textGlow },
  bidRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  bidAdjust: { borderRadius: 20, height: 40, minHeight: 40, paddingHorizontal: 0, width: 40 },
  bidNumber: {
    color: COLORS.pearl,
    fontFamily: FONTS.heading,
    fontSize: 26,
    minWidth: 54,
    textAlign: 'center',
    ...textGlow,
  },
  bidConfirm: { minWidth: 96 },

  /* badges */
  badge: {
    alignItems: 'center',
    backgroundColor: COLORS.glassSubtle,
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  badgeH: { flexDirection: 'row', gap: 6 },
  badgeV: { paddingVertical: 6, width: '100%' },
  badgeActive: {
    backgroundColor: COLORS.activeGlowFill,
    borderColor: COLORS.limeGlow,
    shadowColor: COLORS.limeGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  fishFrame: { alignItems: 'center', height: 30, justifyContent: 'center', width: 44 },
  fish: { position: 'relative' },
  badgeTextH: { alignItems: 'flex-start' },
  badgeTextV: { alignItems: 'center' },
  playerName: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 11, ...textGlow },
  playerStats: { color: COLORS.glassTextMuted, fontFamily: FONTS.body, fontSize: 10, ...textGlow },
  dealerChip: {
    alignItems: 'center',
    backgroundColor: COLORS.coral,
    borderColor: COLORS.glassRim,
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -6,
    width: 20,
  },
  dealerChipText: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 11 },

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
  resultCard: { alignItems: 'center', gap: 3, maxWidth: 360, paddingHorizontal: 20, paddingVertical: 16, width: '100%' },
  handOutcome: { fontFamily: FONTS.heading, fontSize: 22, marginBottom: 4, textAlign: 'center', ...textGlow },
  handWon: { color: COLORS.sunYellow },
  handMissed: { color: COLORS.pearl },
  resultText: { color: COLORS.pearl, fontFamily: FONTS.body, fontSize: 13, textAlign: 'center', ...textGlow },
  resultButton: { marginTop: 10 },

  /* hand */
  handShelf: { alignItems: 'center', paddingBottom: 10, paddingHorizontal: 8, paddingTop: 8 },
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
    borderColor: COLORS.limeGlow,
    borderWidth: 2,
    shadowColor: COLORS.limeGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 7,
  },
  selectedHandCard: {
    borderColor: COLORS.sunYellow,
    borderWidth: 3,
    elevation: 12,
    shadowColor: COLORS.sunYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  // A tint instead of opacity, so overlapped cards stay solid instead of showing through.
  dimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 40, 70, 0.4)' },
  handImage: { height: '100%', width: '100%' },
  emptyHand: { color: COLORS.pearl, fontFamily: FONTS.body, fontSize: 13, textAlign: 'center', ...textGlow },

  /* difficulty picker */
  diffOption: {
    alignSelf: 'stretch',
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 2,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  diffTitle: { color: COLORS.pearl, fontFamily: FONTS.heading, fontSize: 20, ...textGlow },
  diffBlurb: {
    color: COLORS.glassTextStrong,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    ...textGlow,
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
    gap: 8,
    maxWidth: 420,
    padding: 22,
    width: '100%',
  },
  rulesCard: { alignItems: 'stretch', maxHeight: '85%' },
  rulesScroll: { flexGrow: 0, flexShrink: 1, marginVertical: 6 },
  modalTitle: { color: COLORS.aeroInk, fontFamily: FONTS.heading, fontSize: 26, textAlign: 'center' },
  modalWinner: { color: COLORS.aeroInk, fontFamily: FONTS.heading, fontSize: 22, textAlign: 'center' },
  modalBody: { color: COLORS.aeroInkSoft, fontFamily: FONTS.body, fontSize: 15, textAlign: 'center' },
  modalButton: { alignSelf: 'center', marginTop: 8 },
  ruleBlock: { marginBottom: 12 },
  ruleHeading: { color: COLORS.aeroInk, fontFamily: FONTS.bodyBold, fontSize: 15 },
  ruleBody: { color: COLORS.aeroInkSoft, fontFamily: FONTS.body, fontSize: 14, lineHeight: 20 },
});