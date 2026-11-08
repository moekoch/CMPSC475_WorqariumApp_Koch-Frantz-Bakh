import { Text, View } from 'react-native';
import { Easing, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { HAND_SIZE, SUIT_NAMES } from '../constants/gameConstants';
import Card from './Card';
import { AERO, Glass } from './SpadesUI';

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
  const handWidth =
    cards.length > 0 ? sizes.step * (cards.length - 1) + sizes.handCardW : 0;

  return (
    <Glass
      tint={AERO.panel}
      radius={24}
      style={[styles.handShelf, { alignItems: 'center' }]}
      styles={styles}
    >
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
                selected ? ', selected; tap Play to confirm' : canPlay ? ', tap to preview' : ''
              }`}
              disabled={!canPlay}
              onPress={() => onCardPress(card)}
              imageStyle={styles.handImage}
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
                selected && styles.selectedCard,
                dimmed && styles.unplayableCard,
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
    </Glass>
  );
}
