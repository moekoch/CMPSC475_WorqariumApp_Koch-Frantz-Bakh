import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FadeInUp } from 'react-native-reanimated';
import { DIFFICULTY_LABELS, SUIT_NAMES } from '../constants/gameConstants';
import { COLORS } from '../constants/theme';
import { formatBid } from '../logic/cardUtils';
import Card from './Card';
import { Glass, GlossButton, PlayerBadge } from './SpadesUI';

const CARD_ENTERING = FadeInUp.duration(220);

function trickSeatStyle(seat, width, height) {
  switch (seat) {
    case 0:
      return { bottom: 8, left: '50%', marginLeft: -width / 2 };
    case 1:
      return { left: 6, top: '50%', marginTop: -height / 2 };
    case 2:
      return { top: 8, left: '50%', marginLeft: -width / 2 };
    default:
      return { right: 6, top: '50%', marginTop: -height / 2 };
  }
}

export default function GameTable({
  game,
  yourScore,
  botScore,
  turnLabel,
  hint,
  sizes,
  selectedCard,
  gameOver,
  youWon,
  onDeal,
  adjustBid,
  submitBid,
  onPlayCard,
  onCancelCard,
  newGame,
  nextHand,
  styles,
}) {
  const renderBadge = (playerIndex, horizontal = false) => (
    <PlayerBadge
      player={game.players[playerIndex]}
      playerIndex={playerIndex}
      horizontal={horizontal}
      isTurn={(game.phase === 'playing' || game.phase === 'bidding') && game.turn === playerIndex}
      isDealer={game.dealer === playerIndex}
      styles={styles}
    />
  );

  return (
    <>
      <Glass tint={COLORS.glassStrong} radius={20} gloss={false} style={styles.scoreCard} styles={styles}>
        <View style={styles.scoreTeam}>
          <Text style={styles.scoreLabel}>Your team</Text>
          <Text style={styles.score}>{yourScore}</Text>
          <Text style={styles.scoreDetail}>{game.bags[0]} bags</Text>
        </View>
        <View style={styles.scoreMiddle}>
          <Text style={styles.scoreDetail}>
            Hand {game.roundNumber}
            {game.difficulty ? ` · ${DIFFICULTY_LABELS[game.difficulty]}` : ''}
          </Text>
          {game.overtime && !gameOver && <Text style={styles.overtime}>OVERTIME</Text>}
        </View>
        <View style={styles.scoreTeam}>
          <Text style={styles.scoreLabel}>Them</Text>
          <Text style={styles.score}>{botScore}</Text>
          <Text style={styles.scoreDetail}>{game.bags[1]} bags</Text>
        </View>
      </Glass>

      <Glass tint={COLORS.glassDeep} radius={28} gloss={false} style={styles.table} styles={styles}>
        <Glass tint={COLORS.glassStrong} radius={16} gloss={false} style={styles.statusPill} styles={styles}>
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

          <Glass tint={COLORS.glassSubtle} radius={22} gloss={false} style={styles.trickArea} styles={styles}>
            {game.trick.map(({ playerIndex, card }) => (
              <Card
                key={`${playerIndex}-${card.id}`}
                card={card}
                entering={CARD_ENTERING}
                imageStyle={StyleSheet.absoluteFill}
                style={[
                  styles.trickImage,
                  { width: sizes.trickW, height: sizes.trickH },
                  trickSeatStyle(playerIndex, sizes.trickW, sizes.trickH),
                ]}
              />
            ))}

            {game.trick.length === 0 && game.phase === 'dealing' &&
              (game.dealer === 0 ? (
                <GlossButton
                  label="Deal"
                  onPress={onDeal}
                  accessibilityLabel="Deal the cards"
                  styles={styles}
                />
              ) : (
                <Text style={styles.centerText}>Waiting for dealer</Text>
              ))}

            {game.phase === 'bidding' &&
              (game.turn === 0 ? (
                <View style={styles.bidPanel}>
                  <Text style={styles.bidLabel}>Your bid</Text>
                  <View style={styles.bidRow}>
                    <GlossButton
                      label="-"
                      variant="aqua"
                      accessibilityLabel="Lower bid"
                      disabled={game.bidSelection === 0}
                      onPress={() => adjustBid(-1)}
                      style={styles.bidAdjust}
                      styles={styles}
                    />
                    <Text style={styles.bidNumber}>{formatBid(game.bidSelection)}</Text>
                    <GlossButton
                      label="+"
                      variant="aqua"
                      accessibilityLabel="Raise bid"
                      disabled={game.bidSelection === 13}
                      onPress={() => adjustBid(1)}
                      style={styles.bidAdjust}
                      styles={styles}
                    />
                  </View>
                  <GlossButton
                    label="Bid"
                    accessibilityLabel={`Confirm bid of ${formatBid(game.bidSelection)}`}
                    onPress={submitBid}
                    style={styles.bidConfirm}
                    styles={styles}
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

            {selectedCard && (
              <View style={styles.previewOverlay}>
                <View pointerEvents="none" style={styles.previewDim} />
                <Card
                  card={selectedCard}
                  imageStyle={StyleSheet.absoluteFill}
                  style={[
                    styles.previewCard,
                    { width: sizes.trickW * 1.5, height: sizes.trickH * 1.5 },
                  ]}
                />
                <View style={styles.previewActions}>
                  <GlossButton
                    label="Play"
                    small
                    accessibilityLabel={`Play ${selectedCard.rank} of ${SUIT_NAMES[selectedCard.suit]}`}
                    onPress={() => onPlayCard(selectedCard)}
                    styles={styles}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel card selection"
                    onPress={onCancelCard}
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

        {game.phase === 'roundOver' && (
          <View style={styles.resultOverlay}>
            <Glass tint={COLORS.resultGlass} radius={24} style={styles.resultCard} styles={styles}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.handOutcome,
                  game.yourTeamMadeBid ? styles.handWon : styles.handMissed,
                ]}
              >
                {game.yourTeamMadeBid ? 'You won this hand!' : 'You missed your bid'}
              </Text>
              {game.handResult.map((line, index) => (
                <Text key={`${index}-${line}`} style={styles.resultText}>
                  {line}
                </Text>
              ))}
              <GlossButton
                label={gameOver ? 'New game' : 'Next hand'}
                onPress={gameOver ? newGame : nextHand}
                style={styles.resultButton}
                styles={styles}
              />
            </Glass>
          </View>
        )}
      </Glass>
    </>
  );
}
