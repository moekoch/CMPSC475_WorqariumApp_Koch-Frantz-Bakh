import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, Text, View } from 'react-native';
import FishSprite from './aquarium/FishSprite';
import { PLAYER_FISH, SEATS, SEAT_TAGS } from '../constants/gameConstants';
import { formatBid } from '../logic/cardUtils';

export const AERO = {
  panel: 'rgba(6,66,112,0.56)',
  panelSoft: 'rgba(255,255,255,0.16)',
  well: 'rgba(3,48,88,0.22)',
  modal: 'rgba(244,251,255,0.97)',
  rim: 'rgba(255,255,255,0.5)',
  rimSoft: 'rgba(255,255,255,0.26)',
  textMuted: 'rgba(255,255,255,0.86)',
  ink: '#0B4A74',
  inkSoft: '#2E6283',
  shadow: 'rgba(0,36,70,0.55)',
  mint: '#A8F7CF',
  gold: '#FFCC4D',
  goldInk: '#4A3300',
};

const BUTTON_VARIANTS = {
  green: { colors: ['#D5FAE8', '#74DDB2'], text: '#0A5A45' },
  aqua: { colors: ['#E6F9FF', '#8FD9F3'], text: AERO.ink },
};

export function Glass({ children, style, tint = AERO.panel, radius = 24, gloss = true, styles }) {
  return (
    <View style={[styles.glass, { backgroundColor: tint, borderRadius: radius }, style]}>
      {gloss && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
          locations={[0, 0.4, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gloss}
        />
      )}
      {children}
    </View>
  );
}

export function GlossButton({
  label,
  onPress,
  variant = 'green',
  small = false,
  disabled = false,
  accessibilityLabel,
  style,
  textStyle,
  styles,
}) {
  const colors = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.green;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.glossButton,
        small && styles.glossButtonSmall,
        { backgroundColor: colors.colors[1], borderColor: 'rgba(255,255,255,0.9)' },
        disabled && styles.disabledButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      <LinearGradient pointerEvents="none" colors={colors.colors} style={styles.buttonGradient} />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.05)']}
        style={styles.glossButtonShine}
      />
      <Text
        style={[
          styles.glossButtonText,
          small && styles.glossButtonTextSmall,
          { color: colors.text },
          textStyle,
        ]}
        allowFontScaling
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TopPill({ label, onPress, accessibilityLabel, styles }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.topPill, pressed && styles.pressed]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        style={styles.buttonGradient}
      />
      <Text style={styles.topPillText}>{label}</Text>
    </Pressable>
  );
}

export function Orb({ colors, size = 36, styles }) {
  return (
    <LinearGradient
      colors={colors}
      style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']}
        style={{
          borderRadius: size,
          height: size * 0.42,
          left: size * 0.16,
          position: 'absolute',
          right: size * 0.16,
          top: 3,
        }}
      />
    </LinearGradient>
  );
}

export function PlayerBadge({ player, playerIndex, isTurn, isDealer, horizontal, styles }) {
  return (
    <View
      style={[
        styles.badge,
        horizontal ? styles.badgeH : styles.badgeV,
        isTurn && styles.badgeActive,
      ]}
    >
      <View style={styles.fishFrame}>
        <FishSprite
          fishKey={PLAYER_FISH[playerIndex]}
          width={40}
          mirror={playerIndex === 3}
          style={styles.fish}
        />
      </View>
      <View style={horizontal ? styles.badgeTextH : styles.badgeTextV}>
        <Text style={styles.playerName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
          {SEATS[playerIndex]} · {SEAT_TAGS[playerIndex]}
        </Text>
        {horizontal ? (
          <Text style={styles.playerStats} numberOfLines={1}>
            Bid {formatBid(player.bid)} · {player.tricks} won
          </Text>
        ) : (
          <>
            <Text style={styles.playerStats} numberOfLines={1}>
              Bid {formatBid(player.bid)}
            </Text>
            <Text style={styles.playerStats} numberOfLines={1}>
              {player.tricks} won
            </Text>
          </>
        )}
      </View>
      {isDealer && (
        <View accessibilityLabel="Dealer" style={styles.dealerChip}>
          <Text style={styles.dealerChipText}>Dealer</Text>
        </View>
      )}
    </View>
  );
}

export function InfoModal({ visible, title, children, buttonLabel, onPress, styles }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onPress}>
      <View style={styles.modalBackdrop}>
        <Glass tint={AERO.modal} radius={28} style={styles.modalCard} styles={styles}>
          <Text accessibilityRole="header" style={styles.modalTitle}>
            {title}
          </Text>
          {children}
          <GlossButton
            label={buttonLabel}
            onPress={onPress}
            style={styles.modalButton}
            styles={styles}
          />
        </Glass>
      </View>
    </Modal>
  );
}
