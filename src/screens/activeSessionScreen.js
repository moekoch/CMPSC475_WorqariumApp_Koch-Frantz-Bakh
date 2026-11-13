import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import FishSprite from '../components/aquarium/FishSprite';
import SwimmingFish from '../components/aquarium/SwimmingFish';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { FISH_KEYS } from '../constants/fishAssets';
import { COLORS, FONTS } from '../constants/theme';
import { useSession } from '../hooks/useSession';
import { clearToken } from '../lib/api';

// everyone shares one session
const SESSION_ID = 'main';

// fish size on screen
const FISH_WIDTH = 72;
const FISH_HEIGHT = 44;

// time to swim to spot
const SWIM_MS = 800;

// fish image to draw for avatarKey from server
const fishKeyFor = (avatarKey) => FISH_KEYS.includes(avatarKey) ? avatarKey : (FISH_KEYS[0] ?? null);

// fish and username gliding to player
function SessionFish({ player, areaWidth, areaHeight, isSelf }) {
    // top-left corner of fish
    const position = useRef(new Animated.ValueXY({ x: 0, y: 0})).current;

    // first position set instantly, swim later
    const hasPlaced = useRef(false);
    useEffect(() => {
        // wait until water area measured
        if (!areaWidth || !areaHeight) return;

        // turn positions 0-1 to pixels
        const target = {
            x: player.x * areaWidth - FISH_WIDTH / 2,
            y: player.y * areaHeight - FISH_HEIGHT / 2
        };

        // first time place instantly
        if (!hasPlaced.current) {
            position.setValue(target);
            hasPlaced.current = true;
            return;
        }

        // swim to new position
        Animated.timing(position, {
            toValue: target,
            duration: SWIM_MS,
            useNativeDriver: true
        }).start();
    }, [player.x, player.y, areaWidth, areaHeight, position]);

    return (
        // let taps pass through to water area
        <Animated.View
            pointerEvents="none"
            style={[
                styles.fish,
                { transform: position.getTranslateTransform() }
            ]}
        >
            <FishSprite
                fishKey={fishKeyFor(player.avatarKey)}
                width={FISH_WIDTH}
                style={{ top: 0, left: 0 }}
            />

            {/* username under fish */}
            <View style={styles.nameWrap}>
                <Text style={[
                    styles.name,
                    isSelf && styles.nameSelf
                ]} numberOfLines={1}>
                    {player.username}
                </Text>
            </View>
        </Animated.View>
    );
}

const FISH_COUNT = 10;
const CLOSE_IN_FRONT = false;

// share = rough fraction of the school; size/speed are [min, max]
const LAYERS = {
  far:   { share: 0.30, size: [36, 55],   speed: [22, 32], opacity: 0.55 },
  mid:   { share: 0.42, size: [56, 80],   speed: [34, 46], opacity: 0.9 },
  close: { share: 0.28, size: [100, 150], speed: [50, 70], opacity: 1 },
};
const LAYER_RANK = { far: 0, mid: 1, close: 2 };

const rand = (min, max) => min + Math.random() * (max - min);

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function makeSchool(n) {
  const close = Math.round(n * LAYERS.close.share);
  const far = Math.round(n * LAYERS.far.share);
  const mid = n - close - far;
  const layers = shuffle([
    ...Array(close).fill('close'),
    ...Array(far).fill('far'),
    ...Array(mid).fill('mid'),
  ]);
  return layers.map((layer, id) => {
    const L = LAYERS[layer];
    return {
      id,
      layer,
      w: Math.round(rand(...L.size)),
      speed: rand(...L.speed),
      opacity: L.opacity,
    };
  });
}

export default function ActiveSessionScreen({ navigation }) {
    const keyAt = (i) => (FISH_KEYS.length ? FISH_KEYS[i % FISH_KEYS.length] : null);
    
    const [school] = useState(() => makeSchool(FISH_COUNT));

    const isFront = (s) => CLOSE_IN_FRONT && s.layer === 'close';
      const backFish = school
        .filter((s) => !isFront(s))
        .sort((a, b) => LAYER_RANK[a.layer] - LAYER_RANK[b.layer]); // far drawn first
      const frontFish = school.filter(isFront);
    
      const renderFish = (s) => (
        <SwimmingFish
          key={s.id}
          fishKey={keyAt(s.id)}
          width={s.w}
          speed={s.speed}
          opacity={s.opacity}
          elevation={isFront(s) ? 20 : 0}
        />
      );


    // join session and get all fish
    const { self, players, error, move } = useSession(SESSION_ID);

    // size of water area
    const [area, setArea] = useState({ width: 0, height: 0 });

    // server rejected token so go back to login
    useEffect(() => {
        if (error === 'unauthorized') {
            clearToken().then(() =>
                navigation?.replace?.('login')
            );
        }
    }, [error, navigation]);

    // swim where user taps
    const handlePress = (e) => {
        if (!area.width || !area.height) return;

        move(e.nativeEvent.locationX / area.width, e.nativeEvent.locationY / area.height);
    };

    // user fish plus everyone else
    const everyone = self ? [self, ...Object.values(players)] : Object.values(players);

    return (
        <WaterBackground style={styles.root}>
            {/* water area */}
            <Pressable
                style={styles.area}
                onLayout={(e) =>
                    setArea({
                        width: e.nativeEvent.layout.width,
                        height: e.nativeEvent.layout.height
                    })
                }
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={
                    self
                        ? `Active session with ${everyone.map((player) => player.username).join(', ')}`
                        : 'Connecting to the active session'
                }
                accessibilityHint="Moves your fish to the tapped location"
                accessibilityLiveRegion="polite"
            >
                {/* status message */}
                {!self && !error &&
                    <Text style={styles.message}>
                        Diving in...
                    </Text>
                }
                {!!error && error !== 'unauthorized' && (
                    <Text
                        accessibilityRole="alert"
                        style={[
                            styles.message,
                            styles.error
                        ]}
                    >
                        {error}
                    </Text>
                )}

                {/* idle fish swim around the session */}
                {backFish.map(renderFish)}

                {/* one fish per player */}
                {everyone.map((player) => (
                    <SessionFish
                        key={player.id}
                        player={player}
                        areaWidth={area.width}
                        areaHeight={area.height}
                        isSelf={player.id === self?.id}
                    />
                ))}

                {frontFish.map(renderFish)}
            </Pressable>

            {/* bottom nav bar */}
            <WorqariumNav active="Home" navigation={navigation} />
        </WaterBackground>
    );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  area: { flex: 1, overflow: 'hidden' },
  message: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: COLORS.pearl,
    textShadowColor: 'rgba(0,36,70,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  error: {
    backgroundColor: 'rgba(3,43,76,0.9)',
    borderRadius: 12,
    color: COLORS.pearl,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fish: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FISH_WIDTH,
    height: FISH_HEIGHT,
  },
  nameWrap: {
    position: 'absolute',
    top: FISH_HEIGHT + 2,
    left: -24,
    width: FISH_WIDTH + 48,
    alignItems: 'center',
  },
  name: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.ink,
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  nameSelf: { fontFamily: FONTS.bodyBold },
});