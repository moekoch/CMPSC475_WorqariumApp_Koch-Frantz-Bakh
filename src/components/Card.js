import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { CARD_IMAGES } from '../constants/gameConstants';

export default function Card({
  card,
  style,
  imageStyle,
  onPress,
  accessibilityLabel,
  disabled = false,
  overlayStyle,
  entering,
  layout,
}) {
  const image = <Image source={CARD_IMAGES[card.id]} resizeMode="contain" style={imageStyle} />;

  if (!onPress) {
    return (
      <Animated.View entering={entering} layout={layout} style={style}>
        {image}
      </Animated.View>
    );
  }

  return (
    <Animated.View layout={layout} style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={onPress}
        style={StyleSheet.absoluteFill}
      >
        {image}
        {overlayStyle && <View pointerEvents="none" style={overlayStyle} />}
      </Pressable>
    </Animated.View>
  );
}
