import { useEffect, useRef, useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { AERO, Glass, GlossButton, TopPill } from '../components/GoFishUI';
import WaterBackground from '../components/aquarium/WaterBackground';
import {
    CARD_BACK,
    RANKS,
    SUIT_NAMES,
} from '../constants/gameConstants';
import { COLORS, FONTS, RADII } from '../constants/theme';
import { connectSocket, disconnectSocket } from '../lib/socket';

const RANK_NAMES = { A: 'Aces', J: 'Jacks', Q: 'Queens', K: 'Kings' };

function getRankName(rank) {
  return RANK_NAMES[rank] || `${rank}s`;
}

function clearQueueAckTimer(timerRef) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function requestMatchmaking(socket, timerRef, setError, setIsConnected, setIsSearching) {
  clearQueueAckTimer(timerRef);
  setIsConnected(true);
  setError('');
  setIsSearching(true);
  timerRef.current = setTimeout(() => {
    setError(
      'The game server did not acknowledge Go Fish matchmaking.',
    );
  }, 8000);
  socket.emit('gofish:queue:join', (result) => {
    clearQueueAckTimer(timerRef);
    if (!result?.ok) {
      setError(result?.message || 'The game server rejected matchmaking.');
    }
  });
}

export default function GoFishScreen({ navigation }) {
  const [game, setGame] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const queueAckTimerRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    const joinQueue = () => {
      requestMatchmaking(
        socket,
        queueAckTimerRef,
        setError,
        setIsConnected,
        setIsSearching,
      );
    };
    const handleWaiting = () => {
      clearQueueAckTimer(queueAckTimerRef);
      setIsSearching(true);
      setGame(null);
    };
    const handleState = (nextGame) => {
      clearQueueAckTimer(queueAckTimerRef);
      setGame(nextGame);
      setIsSearching(false);
      setSelectedRank(null);
      setError('');
    };
    const handleError = (payload) => {
      setError(payload?.message || 'The Go Fish server rejected that action.');
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      setError('Connection lost. Reconnecting…');
      clearQueueAckTimer(queueAckTimerRef);
    };
    const handleConnectError = (connectionError) => {
      setIsConnected(false);
      clearQueueAckTimer(queueAckTimerRef);
      setError(connectionError.message === 'unauthorized'
        ? 'Your session expired. Please sign in again.'
        : 'Could not reach the game server. Retrying…');
    };

    socket.on('connect', joinQueue);
    socket.on('gofish:waiting', handleWaiting);
    socket.on('gofish:state', handleState);
    socket.on('gofish:error', handleError);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    if (socket.connected) joinQueue();

    return () => {
      clearQueueAckTimer(queueAckTimerRef);
      socket.emit('gofish:leave');
      socket.off('connect', joinQueue);
      socket.off('gofish:waiting', handleWaiting);
      socket.off('gofish:state', handleState);
      socket.off('gofish:error', handleError);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      disconnectSocket();
      socketRef.current = null;
    };
  }, []);

  const sortedHand = [...(game?.hand ?? [])].sort(
    (a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank) || a.code.localeCompare(b.code),
  );
  const isYourTurn = game?.isYourTurn === true;
  const isGameOver = game?.status === 'finished';

  const handleAsk = () => {
    if (!selectedRank || !isYourTurn) return;
    socketRef.current?.emit('gofish:ask', { rank: selectedRank });
    setSelectedRank(null);
  };

  const findAnotherPlayer = () => {
    const socket = socketRef.current;
    setGame(null);
    setSelectedRank(null);
    setError('');
    setIsSearching(true);

    if (socket?.connected) {
      socket.emit('gofish:leave');
      requestMatchmaking(
        socket,
        queueAckTimerRef,
        setError,
        setIsConnected,
        setIsSearching,
      );
    } else {
      socket?.connect();
    }
  };

  const cancelSearch = () => {
    socketRef.current?.emit('gofish:leave');
    navigation?.goBack?.();
  };

  const retryConnection = () => {
    if (socketRef.current?.connected) {
      requestMatchmaking(
        socketRef.current,
        queueAckTimerRef,
        setError,
        setIsConnected,
        setIsSearching,
      );
      return;
    }
    socketRef.current?.connect();
  };

  return (
    <WaterBackground
      style={styles.root}
      imageSource={require('../../assets/images/backgrounds/gameOcean.jpg')}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TopPill
            label="‹ Games"
            accessibilityLabel="Back to Games"
            onPress={() => navigation?.goBack()}
            styles={styles}
          />
          <Text accessibilityRole="header" style={styles.title}>Go Fish</Text>
        </View>

        <Glass
          tint={AERO.panel}
          radius={28}
          style={styles.table}
          styles={styles}
        >
          {game ? (
            <>
              <View style={styles.opponentArea}>
                <Image
                  accessibilityLabel={`${game.opponent.username}'s fish`}
                  source={require('../../assets/images/fish/blueTang.png')}
                  resizeMode="contain"
                  style={styles.sharkImage}
                />
                <View style={styles.sharkHand}>
                  <View style={styles.opponentHeading}>
                    <Text style={styles.sectionTitle}>
                      {game.opponent.username}&apos;s hand · {game.opponent.cardCount} cards
                    </Text>
                  </View>
                  <View style={styles.hiddenCards}>
                    {game.opponent.cardCount > 0 ? (
                      <>
                        {Array.from({ length: Math.min(game.opponent.cardCount, 4) }, (_, index) => (
                          <Image
                            key={index}
                            accessibilityLabel="Face-down card"
                            source={CARD_BACK}
                            resizeMode="stretch"
                            style={[styles.backCard, index > 0 && styles.overlapCard]}
                          />
                        ))}
                        {game.opponent.cardCount > 4 && (
                          <Text style={styles.extraCards}>+{game.opponent.cardCount - 4}</Text>
                        )}
                      </>
                    ) : (
                      <Text style={styles.emptyHint}>No cards</Text>
                    )}
                  </View>
                  <Text style={styles.handSubtitle}>Books: {game.opponent.books}</Text>
                  {!game.opponent.connected && game.status === 'playing' && (
                    <Text style={styles.connectionHint}>Reconnecting…</Text>
                  )}
                </View>
              </View>

              <View style={styles.pondArea}>
                <Image
                  accessibilityLabel={game.deckCount > 0 ? 'Go Fish draw pile' : 'Empty draw pile'}
                  source={CARD_BACK}
                  resizeMode="stretch"
                  style={[styles.pondCard, game.deckCount === 0 && styles.emptyPond]}
                />
                <Text style={styles.pondCount}>{game.deckCount} cards left</Text>
              </View>

              <View style={styles.messageBox} accessibilityLiveRegion="polite" accessibilityRole="text">
                <Text style={styles.messageText}>{error || game.message}</Text>
              </View>

              <View style={styles.handHeader}>
                <Text style={styles.sectionTitle}>Your hand · {game.hand.length} cards</Text>
              </View>
              {game.hand.length > 0 ? (
                <ScrollView
                  horizontal
                  contentContainerStyle={styles.hand}
                  showsHorizontalScrollIndicator={false}
                >
                  {sortedHand.map((card) => {
                    const selected = selectedRank === card.rank;
                    return (
                      <Card
                        key={card.code}
                        card={card}
                        accessibilityLabel={`${card.code.slice(0, -1)} of ${
                          SUIT_NAMES[card.code.slice(-1)]
                        }, ${selected ? 'selected' : 'not selected'}`}
                        accessibilityState={{ selected }}
                        onPress={() => setSelectedRank((current) =>
                          isYourTurn ? (current === card.rank ? null : card.rank) : null,
                        )}
                        imageContainerStyle={styles.cardImageContainer}
                        imageStyle={styles.cardImage}
                        resizeMode="stretch"
                        style={[
                          styles.handCard,
                          selected && styles.selectedCard,
                        ]}
                      />
                    );
                  })}
                </ScrollView>
              ) : (
                <Text style={styles.emptyHint}>No cards in your hand.</Text>
              )}
              <Text style={styles.handSubtitle}>Books: {game.books.length}</Text>

              <GlossButton
                label={
                  selectedRank
                    ? `Ask for ${getRankName(selectedRank)}`
                    : isYourTurn
                      ? 'Choose a card to ask'
                      : `Waiting for ${game.opponent.username}`
                }
                disabled={!selectedRank || !isYourTurn || game.status !== 'playing'}
                onPress={handleAsk}
                styles={styles}
              />
            </>
          ) : (
            <View style={styles.waitingArea}>
              <Text style={styles.messageText} accessibilityLiveRegion="polite">
                {error || (isConnected
                  ? isSearching
                    ? 'Looking for another player…'
                    : 'Waiting to join the game…'
                  : 'Connecting to the game server…')}
              </Text>
              <GlossButton
                label={isConnected ? 'Cancel search' : 'Try again'}
                onPress={isConnected ? cancelSearch : retryConnection}
                styles={styles}
              />
            </View>
          )}
        </Glass>
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={() => navigation?.goBack?.()}
        statusBarTranslucent
        transparent
        visible={isGameOver}
      >
        <View style={styles.gameOverOverlay}>
          <View accessibilityViewIsModal style={styles.gameOverCard}>
            <Glass tint={AERO.modal} radius={28} styles={styles} style={styles.gameOverSurface}>
              <Text accessibilityRole="header" style={styles.gameOverMessage}>
                {game?.message || 'The game is over.'}
              </Text>
              <GlossButton
                label="Find another player"
                onPress={findAnotherPlayer}
                styles={styles}
                style={styles.playAgainButton}
              />
              <GlossButton
                label="Back to Games"
                onPress={cancelSearch}
                styles={styles}
                style={styles.playAgainButton}
              />
            </Glass>
          </View>
        </View>
      </Modal>
    </WaterBackground>
  );
}

const textGlow = {
  textShadowColor: 'rgba(0,36,70,0.8)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
};

const titleGlow = {
  textShadowColor: 'rgba(0,36,70,0.7)',
  textShadowOffset: { width: 0, height: 3 },
  textShadowRadius: 6,
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    position: 'relative',
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
    ...textGlow,
  },
  topPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(6,66,112,0.5)',
    borderColor: AERO.rim,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    left: 0,
    minHeight: 38,
    overflow: 'hidden',
    position: 'absolute',
    width: 96,
  },
  topPillText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    ...textGlow,
  },
  title: {
    color: COLORS.surfaceFoam,
    fontFamily: FONTS.heading,
    fontSize: 32,
    marginTop: 2,
    fontWeight: 'bold',
    ...titleGlow,
  },
  subtitle: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
    ...textGlow,
  },
  table: {
    borderColor: COLORS.glassEdge,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    minHeight: 520,
    overflow: 'hidden',
    padding: 16,
    width: '100%',
    ...RADII.organicA,
  },
  glass: {
    overflow: 'hidden',
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
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
    color: AERO.textMuted,
    fontFamily: FONTS.heading,
    fontSize: 15,
    ...textGlow,
  },
  cardCount: {
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    ...textGlow,
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
    color: AERO.textMuted,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    marginLeft: 8,
    ...textGlow,
  },
  emptyHint: {
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 14,
    paddingVertical: 8,
    ...textGlow,
  },
  connectionHint: {
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 4,
    ...textGlow,
  },
  booksText: {
    color: AERO.mint,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
    ...textGlow,
  },
  handSubtitle: {
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    ...textGlow,
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
    color: AERO.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 4,
    ...textGlow,
  },
  messageBox: {
    backgroundColor: AERO.panelSoft,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageText: {
    color: COLORS.pearl,
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
    ...textGlow,
  },
  waitingArea: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 36,
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
    paddingVertical: 18,
  },
  handCard: {
    borderColor: 'transparent',
    borderRadius: 9,
    borderWidth: 3,
    height: 104,
    padding: 1,
    width: 74,
  },
  selectedCard: {
    borderColor: AERO.mint,
    borderWidth: 2,
    elevation: 10,
    shadowColor: AERO.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 9,
    transform: [{ translateY: -14 }, { scale: 1.08 }],
    zIndex: 10,
  },
  cardImage: {
    borderRadius: 5,
    height: 96,
    width: 66,
  },
  cardImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glossButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 4,
    minHeight: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  glossButtonShine: {
    height: '55%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  glossButtonText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    textAlign: 'center',
    ...textGlow,
  },
  disabledButton: { opacity: 0.55 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  glossButtonSmall: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  gameOverOverlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(3,40,70,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gameOverCard: {
    maxWidth: 420,
    width: '100%',
  },
  gameOverSurface: {
    alignItems: 'center',
    padding: 24,
  },
  gameOverMessage: {
    color: AERO.ink,
    fontFamily: FONTS.heading,
    fontSize: 26,
    marginBottom: 16,
    textAlign: 'center',
  },
  playAgainButton: { width: '100%' },
  newGameButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  newGameText: {
    color: COLORS.deepWater,
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    ...textGlow,
  },
});
