import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FadeInUp } from 'react-native-reanimated';
import { DIFFICULTY_LABELS, SUIT_NAMES } from '../constants/gameConstants';
import { formatBid } from '../logic/cardUtils';
import Card from './Card';
import { AERO, Glass, GlossButton, PlayerBadge } from './SpadesUI';

const CARD_ENTERING = FadeInUp.duration(220);
const PREVIEW_HALO = [[7, 0.1], [4, 0.18], [2, 0.3]];

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
      <Glass tint={AERO.panel} radius={24} style={styles.scoreCard} styles={styles}>
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

      <Glass tint={AERO.panel} radius={24} style={styles.table} styles={styles}>
        <Glass tint={AERO.panelSoft} radius={999} style={styles.statusPill} styles={styles}>
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

          <Glass tint={AERO.well} radius={20} gloss={false} style={styles.trickArea} styles={styles}>
            {game.trick.map(({ playerIndex, card }) => (
              <Card
                key={`${playerIndex}-${card.id}`}
                card={card}
                entering={CARD_ENTERING}
                imageStyle={{ width: sizes.trickW, height: sizes.trickH }}
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
                  <Text style={styles.bidLabel}>YOUR BID</Text>
                  <View style={styles.stepper}>
                    <GlossButton
                      label="−"
                      variant="aqua"
                      textStyle={styles.bidAdjustText}
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
                      textStyle={styles.bidAdjustText}
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
              <>
                <View pointerEvents="none" style={styles.trickDim} />
                <View style={styles.previewWrap}>
                  <View style={styles.previewCardSlot}>
                    <View style={{ width: sizes.previewW, height: sizes.previewH }}>
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
                      <Card
                        card={selectedCard}
                        imageStyle={[
                          styles.previewImage,
                          { width: sizes.previewW, height: sizes.previewH },
                        ]}
                      />
                    </View>
                  </View>
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
              </>
            )}
          </Glass>

          <View style={styles.sideWrap}>{renderBadge(3)}</View>
        </View>
        <View style={styles.southWrap}>{renderBadge(0, true)}</View>

        {game.phase === 'roundOver' && (
          <View style={styles.resultOverlay}>
            <Glass tint={AERO.panel} radius={24} style={styles.resultCard} styles={styles}>
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
