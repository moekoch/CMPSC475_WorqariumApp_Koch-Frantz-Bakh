import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

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