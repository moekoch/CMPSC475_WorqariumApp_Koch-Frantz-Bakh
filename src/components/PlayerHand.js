import { Text, View } from 'react-native';
import { Easing, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { HAND_SIZE, SUIT_NAMES } from '../constants/gameConstants';
import Card from './Card';

const CARD_ENTERING = FadeInUp.duration(220);
const HAND_LAYOUT = LinearTransition.duration(220).easing(Easing.inOut(Easing.quad));

export default function PlayerHand({
  cards,
  selectedCardId,
  playableIds,
  isTurn,
  phase,
  sizes,
  onCardPress,
  styles,
}) {
  const handWidth = sizes.step * (HAND_SIZE - 1) + sizes.handCardW;

  return (
    <View style={[styles.handShelf, { alignItems: 'center' }]}>
      <View
        style={{
          width: Math.max(handWidth, 1),
          height: sizes.handCardH + sizes.restTop,
          justifyContent: 'center',
        }}
      >
        {cards.map((card, index) => {
          const canPlay = playableIds.has(card.id);
          const selected = canPlay && selectedCardId === card.id;
          const dimmed = isTurn && !canPlay;
          return (
            <Card
              key={card.id}
              card={card}
              entering={CARD_ENTERING}
              layout={HAND_LAYOUT}
              accessibilityLabel={`${card.rank} of ${SUIT_NAMES[card.suit]}${
                selected ? ', selected; tap again to play' : canPlay ? ', tap to select' : ''
              }`}
              disabled={!canPlay}
              onPress={() => onCardPress(card)}
              imageStyle={styles.handImage}
              overlayStyle={dimmed ? styles.dimOverlay : undefined}
              style={[
                styles.handCard,
                {
                  width: sizes.handCardW,
                  height: sizes.handCardH,
                  left: index * sizes.step,
                  top: selected
                    ? sizes.selectedTop
                    : canPlay
                      ? sizes.playableTop
                      : sizes.restTop,
                  zIndex: selected ? HAND_SIZE + 1 : index,
                },
                canPlay && styles.playableCard,
                selected && styles.selectedHandCard,
              ]}
            />
          );
        })}
        {cards.length === 0 && (
          <Text style={styles.emptyHand}>
            {phase === 'dealing' ? 'Cards appear after the deal' : 'Your hand is empty'}
          </Text>
        )}
      </View>
    </View>
  );
}
