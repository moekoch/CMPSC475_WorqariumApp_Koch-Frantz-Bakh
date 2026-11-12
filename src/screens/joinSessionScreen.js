// src/screens/joinSessionScreen.js
//
// Matches the "Join Session (Mobile)" Figma mockup: ocean background with
// fish swimming freely, floating settings + chat icons top-right, a
// centered card prompting the user to join, and the Worqarium bottom nav.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FishSprite from '../components/aquarium/FishSprite';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { FISH_KEYS } from '../constants/fishAssets';
import { COLORS, FONTS } from '../constants/theme';

export default function JoinSessionScreen({ navigation }) {
  const keyAt = (i) => (FISH_KEYS.length ? FISH_KEYS[i % FISH_KEYS.length] : null);

  const handleDiveIn = () => navigation?.navigate('activeSession');

  return (
    <WaterBackground style={styles.root}>
      {/* Swimming fish scattered around the card, matching the mockup atmosphere */}
      <FishSprite fishKey={keyAt(0)} width={90} style={{ top: 90, left: 20 }} />
      <FishSprite fishKey={keyAt(1)} width={60} style={{ top: 64, left: -8 }} mirror />
      <FishSprite fishKey={keyAt(2)} width={56} style={{ top: 220, right: 12 }} />
      <FishSprite fishKey={keyAt(3)} width={72} style={{ bottom: 170, left: 8 }} />
      <FishSprite fishKey={keyAt(4)} width={92} style={{ bottom: 200, right: -6 }} mirror />
      <FishSprite fishKey={keyAt(5)} width={40} style={{ bottom: 110, left: 120 }} />

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

      {/* Central prompt card and "Dive in!" action button[cite: 3] */}
      <View style={styles.cardWrap}>
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