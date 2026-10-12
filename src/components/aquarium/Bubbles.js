import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

function Bubble({ size, left, duration, delay }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -420] });
  const translateX = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, size * 0.6, 0] });
  const opacity = progress.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.9, 0.7, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.bubbleFill,
        borderWidth: 1,
        borderColor: COLORS.bubbleEdge,
        opacity,
        transform: [{ translateY }, { translateX }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: size * 0.18,
          left: size * 0.22,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: size * 0.14,
          backgroundColor: 'rgba(255,255,255,0.8)',
        }}
      />
    </Animated.View>
  );
}

/** Ambient rising bubbles. Keep `count` low (6-12) — this is atmosphere, not confetti. */
export default function Bubbles({ count = 8, region = SCREEN_W }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        key: i,
        size: 6 + Math.random() * 14,
        left: Math.random() * (region - 20),
        duration: 4500 + Math.random() * 3500,
        delay: Math.random() * 4000,
      })),
    [count, region]
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bubbles.map(({key, ...props}) => (
        <Bubble key={key} {...props} />
      ))}
    </View>
  );
}
