// src/screens/joinSessionScreen.js
//
// Matches the "Join Session (Mobile)" Figma mockup: ocean background with
// fish swimming freely, floating settings + chat icons top-right, a
// centered card prompting the user to join, and the Worqarium bottom nav.

import { Ionicons } from '@expo/vector-icons';
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
        <Pressable style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="settings-outline" size={20} color={COLORS.ink} />
        </Pressable>
        <Pressable style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="chatbubble-outline" size={18} color={COLORS.ink} />
        </Pressable>
      </View>

      {/* Central prompt card and "Dive in!" action button[cite: 3] */}
      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ready to join{'\n'}a session?</Text>
          <Pressable style={styles.diveBtn} onPress={handleDiveIn}>
            <Text style={styles.diveBtnText}>Dive in!</Text>
          </Pressable>
        </View>
      </View>

      {/* Worqarium bottom navigation bar */}
      <WorqariumNav active="home" navigation={navigation} />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 290,
    backgroundColor: COLORS.pearl || '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardTitle: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    color: COLORS.ink,
    marginBottom: 20,
  },
  diveBtn: {
    backgroundColor: COLORS.deepWater,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  diveBtnText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: COLORS.pearl || '#FFFFFF',
  },
});