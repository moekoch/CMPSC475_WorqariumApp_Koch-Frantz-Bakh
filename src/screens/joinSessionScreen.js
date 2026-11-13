// src/screens/joinSessionScreen.js
//
// Matches the "Join Session (Mobile)" Figma mockup: ocean background with
// fish swimming freely, floating settings + chat icons top-right, a
// centered card prompting the user to join, and the Worqarium bottom nav.
// Tap the water to drop fish food; the fish chase it.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FishFood from '../components/aquarium/FishFood';
import SwimmingFish from '../components/aquarium/SwimmingFish';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { FISH_KEYS } from '../constants/fishAssets';
import { COLORS, FONTS } from '../constants/theme';

const SCHOOL = [
  { w: 90, speed: 36 },
  { w: 60, speed: 52 },
  { w: 56, speed: 44 },
  { w: 72, speed: 40 },
  { w: 92, speed: 32 },
  { w: 40, speed: 58 },
];

const FOOD_LIFETIME = 5000; // ms before uneaten food disappears
const MAX_FOOD = 8;

export default function JoinSessionScreen({ navigation }) {
  const keyAt = (i) => (FISH_KEYS.length ? FISH_KEYS[i % FISH_KEYS.length] : null);

  const [foods, setFoods] = useState([]);
  const nextFoodId = useRef(0);

  const dropFood = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    const id = nextFoodId.current++;
    setFoods((prev) => [...prev.slice(-(MAX_FOOD - 1)), { id, x: locationX, y: locationY }]);
    setTimeout(() => setFoods((prev) => prev.filter((fd) => fd.id !== id)), FOOD_LIFETIME);
  };

  const eatFood = useCallback((id) => {
    setFoods((prev) => prev.filter((fd) => fd.id !== id));
  }, []);

  const handleDiveIn = () => navigation?.navigate('activeSession');

  return (
    <WaterBackground style={styles.root}>
      {/* Tap layer: drops fish food. Rendered first so everything else sits on top of it */}
      <Pressable style={StyleSheet.absoluteFill} onPressIn={dropFood} accessible={false} />

      {/* Swimming fish: wander the whole screen, behind the card */}
      {SCHOOL.map((s, i) => (
        <SwimmingFish
          key={i}
          fishKey={keyAt(i)}
          width={s.w}
          speed={s.speed}
          foods={foods}
          onEat={eatFood}
        />
      ))}

      {/* Fish food pellets */}
      {foods.map((fd) => (
        <FishFood key={fd.id} x={fd.x} y={fd.y} />
      ))}

      {/* Floating action icons in the top-right corner */}
      <View style={styles.iconStack}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          accessibilityHint="Opens app settings"
          onPress={() => navigation?.navigate('settings')}
          style={styles.iconBtn}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={20} color={COLORS.ink} />
        </Pressable>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.iconBtn, styles.disabledIconBtn]}
        >
          <Ionicons name="chatbubble-outline" size={18} color="rgba(255,255,255,0.64)" />
        </View>
      </View>

      {/* Central prompt card and "Dive in!" action button */}
      <View style={styles.cardWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.04)']}
            style={styles.cardShine}
          />
          <Text style={styles.eyebrow}>WELCOME TO WORQARIUM</Text>
          <Text accessibilityRole="header" style={styles.cardTitle}>Your reef is{'\n'}waiting.</Text>
          <Text style={styles.cardDescription}>Meet your friends and explore the water together.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dive in to the active session"
            style={styles.diveBtn}
            onPress={handleDiveIn}
          >
            <Text style={styles.diveBtnText}>Dive in <Text style={styles.arrow}>›</Text></Text>
          </Pressable>
        </View>
      </View>

      {/* Worqarium bottom navigation bar */}
      <WorqariumNav active="Home" navigation={navigation} />
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  iconStack: {
    position: 'absolute',
    top: 48,
    right: 20,
    gap: 10,
    alignItems: 'center',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 20,
    backgroundColor: 'rgba(4,48,82,0.74)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.56)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#002446',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  disabledIconBtn: { opacity: 0.72 },
  cardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(6,66,112,0.72)',
    borderColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#002446',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 9,
  },
  cardShine: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  eyebrow: {
    color: '#B8F4DE',
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: FONTS.heading,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    color: COLORS.pearl,
    marginBottom: 8,
    textShadowColor: 'rgba(0,36,70,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
    maxWidth: 260,
    textAlign: 'center',
  },
  diveBtn: {
    backgroundColor: '#B8F4DE',
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 34,
    borderRadius: 999,
  },
  diveBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: COLORS.deepWater,
  },
  arrow: { fontSize: 21 },
});