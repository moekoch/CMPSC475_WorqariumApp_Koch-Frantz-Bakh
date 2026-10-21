// src/screens/loadingScreen.js
//
// Matches the "Loading On Startup (Mobile)" mockup: white-to-blue vertical
// ocean gradient, a centered inspirational quote, a large clownfish below
// it, and ambient rising bubbles scattered across the whole scene.
//
// Uses navigation.replace() (not navigate) so this screen is removed from
// history once it advances — the user can't swipe back or hardware-back
// into the loader from Login.

import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Bubbles from '../components/aquarium/Bubbles';
import FishSprite from '../components/aquarium/FishSprite';
import WaterBackground from '../components/aquarium/WaterBackground';
import { COLORS, FONTS } from '../constants/theme';

const AUTO_ADVANCE_MS = 1800;

const QUOTE = `"Believe you can and you're\nhalfway there."`;
const ATTRIBUTION = '\u2013 Theodore Roosevelt';

export default function LoadingScreen({ navigation }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      navigation?.replace('login');
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [navigation]);

  return (
    <WaterBackground style={styles.root}>
      <Bubbles count={10} />

      <View style={styles.content}>
        <Text style={styles.quote}>{QUOTE}</Text>
        <Text style={styles.attribution}>{ATTRIBUTION}</Text>

        <FishSprite
          fishKey="orangeClownfish"
          width={230}
          style={styles.fish}
        />
      </View>
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  quote: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: COLORS.ink,
    marginBottom: 10,
  },
  attribution: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.inkSoft,
    marginBottom: 36,
  },
  fish: {
    position: 'relative',
    top: 0,
    left: 0,
  },
});