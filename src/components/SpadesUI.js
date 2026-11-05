import { Modal, Pressable, Text, View } from 'react-native';
import FishSprite from './aquarium/FishSprite';
import { PLAYER_FISH, SEATS, SEAT_TAGS } from '../constants/gameConstants';
import { COLORS } from '../constants/theme';
import { formatBid } from '../logic/cardUtils';

export function Glass({ children, style, tint = COLORS.glassLight, radius = 20, gloss = true, styles }) {
  return (
    <View style={[styles.glass, { backgroundColor: tint, borderRadius: radius }, style]}>
      {gloss && <View pointerEvents="none" style={styles.gloss} />}
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
  styles,
}) {
  const colors =
    variant === 'green'
      ? { bg: COLORS.limeDark, rim: COLORS.limeGlow }
      : { bg: COLORS.aquaDark, rim: COLORS.aquaRim };
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
        { backgroundColor: colors.bg, borderColor: colors.rim },
        disabled && styles.disabledButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View pointerEvents="none" style={styles.glossButtonShine} />
      <Text style={[styles.glossButtonText, small && styles.glossButtonTextSmall]}>{label}</Text>
    </Pressable>
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
        <Text style={styles.playerName} numberOfLines={1}>
          {SEATS[playerIndex]} · {SEAT_TAGS[playerIndex]}
        </Text>
        <Text style={styles.playerStats} numberOfLines={1}>
          Bid {formatBid(player.bid)} · {player.tricks} won
        </Text>
      </View>
      {isDealer && (
        <View accessibilityLabel="Dealer" style={styles.dealerChip}>
          <Text style={styles.dealerChipText}>D</Text>
        </View>
      )}
    </View>
  );
}

export function InfoModal({ visible, title, children, buttonLabel, onPress, styles }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onPress}>
      <View style={styles.modalBackdrop}>
        <Glass tint={COLORS.modalGlass} radius={28} style={styles.modalCard} styles={styles}>
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
