import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

const DROP_COUNT = 7;
const LOOP_MS = 1500;

function Bubble({ delay }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: LOOP_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, progress]);

  const rise = progress.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [48, 8, -30, -30],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 1, 1, 0.25],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.2, 0.6, 0.7, 1],
    outputRange: [0, 1, 1, 0, 0],
  });
  const dropScale = progress.interpolate({
    inputRange: [0, 0.64, 0.8, 1],
    outputRange: [0, 0, 1, 0],
  });
  const dropOpacity = progress.interpolate({
    inputRange: [0, 0.64, 0.8, 1],
    outputRange: [0, 0, 1, 0],
  });
  const dropFall = progress.interpolate({
    inputRange: [0, 0.64, 0.8, 1],
    outputRange: [0, 0, 8, 19],
  });

  return (
    <View style={styles.bubbleTrack}>
      {Array.from({ length: DROP_COUNT }, (_, index) => {
        const angle = `${(360 / DROP_COUNT) * index}deg`;
        return (
          <View key={index} style={[styles.dropTrack, { transform: [{ rotate: angle }] }]}>
            <Animated.View
              style={[
                styles.drop,
                {
                  opacity: dropOpacity,
                  transform: [{ translateY: dropFall }, { scaleY: dropScale }],
                },
              ]}
            />
          </View>
        );
      })}
      <Animated.View
        style={[
          styles.bubble,
          {
            opacity,
            transform: [{ translateY: rise }, { scale }],
          },
        ]}
      >
        <View style={styles.bubbleShine} />
      </Animated.View>
    </View>
  );
}

export default function BubbleLoader({ label = 'Loading', style }) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={[styles.container, style]}
    >
      <View style={styles.bubbles}>
        <Bubble delay={0} />
        <Bubble delay={150} />
        <Bubble delay={300} />
      </View>
      <Text accessibilityElementsHidden style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  bubbles: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 144,
    height: 92,
  },
  bubbleTrack: {
    alignItems: 'center',
    height: 84,
    justifyContent: 'flex-end',
    width: 36,
  },
  dropTrack: {
    height: 10,
    left: '50%',
    position: 'absolute',
    top: 40,
    width: 2,
  },
  drop: {
    backgroundColor: COLORS.pearl,
    borderRadius: 2,
    height: 9,
    width: 2,
  },
  bubble: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.shallow,
    borderColor: COLORS.pearl,
    borderRadius: 18,
    borderWidth: 2,
    height: 34,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    width: 34,
  },
  bubbleShine: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 3,
    height: 3,
    marginLeft: 9,
    marginTop: 5,
    transform: [{ rotate: '-35deg' }],
    width: 10,
  },
  label: {
    color: COLORS.pearl,
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0,36,70,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
