/**
 * Expo router template theme tokens (Colors / Fonts / Spacing / layout)
 * — required by app-tabs, themed-text, themed-view, use-theme, index/explore screens.
 * Do not remove these; the generated app shell depends on them directly.
 */
import { Platform, StyleSheet } from 'react-native';

export const Colors = {
  light: {
    text: '#0d2b36',
    textSecondary: '#3c5a63',
    background: '#eef9fb',
    backgroundElement: '#dff3f8',
    backgroundSelected: '#c9eef7',
    tint: '#2f9fcf',
    icon: '#3c5a63',
  },
  dark: {
    text: '#eef6f3',
    textSecondary: '#9fb9c0',
    background: '#0a3a5c',
    backgroundElement: '#0f4a71',
    backgroundSelected: '#115d8c',
    tint: '#7ed2ec',
    icon: '#9fb9c0',
  },
};

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Consolas, monospace",
  },
});

// Base spacing scale used by the Expo template components (half-step grid).
export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
};

export const BottomTabInset = 56;
export const MaxContentWidth = 960;

// ---------------------------------------------------------------------------
// Worqarium aquarium design system — used by src/screens/* and
// src/components/aquarium/*. Kept separate from the template tokens above
// so both can be imported from '@/constants/theme' without collisions.
// ---------------------------------------------------------------------------

export const COLORS = {
  // Water depths (used for gradients: surface -> deep)
  surfaceFoam: '#eef9fb',
  skylight: '#c9eef7',
  shallow: '#7ed2ec',
  midWater: '#2f9fcf',
  deepWater: '#115d8c',
  abyss: '#0a3a5c',

  // Exact 2-stop gradient supplied from Figma (loader / default scene bg):
  // white 0% -> held flat to 16% -> blends to #80C0E0 at 100%.
  gradientWhite: '#ffffff',
  gradientBlue: '#80C0E0',

  // Life & accents
  coral: '#ff7a59',
  coralDeep: '#e2572f',
  sunYellow: '#ffcc4d',
  seaweed: '#1f9d75',
  reefGreen: '#2bb088',
  sand: '#e8d6a6',
  sandDeep: '#c9ab6f',
  shell: '#ffe3ec',

  // Neutrals (never pure white / pure black — keep it warm & underwater)
  pearl: '#fbfdf9',
  foam: '#eef6f3',
  ink: '#0d2b36',
  inkSoft: '#3c5a63',
  inkFaint: '#6c868d',
  glassEdge: 'rgba(255,255,255,0.55)',
  glassFill: 'rgba(236,250,253,0.22)',
  bubbleFill: 'rgba(255,255,255,0.38)',
  bubbleEdge: 'rgba(255,255,255,0.75)',
};

export const GRADIENTS = {
  // Exact match to the Figma "Custom" gradient panel supplied:
  // stop 1: #ffffff at 16%, stop 2: #80C0E0 at 100%, linear/vertical.
  loader: {
    colors: [COLORS.gradientWhite, COLORS.gradientBlue],
    locations: [0.16, 1],
  },
  shallowDive: [COLORS.surfaceFoam, COLORS.skylight, COLORS.shallow],
  midDive: [COLORS.shallow, COLORS.midWater, COLORS.deepWater],
  deepDive: [COLORS.midWater, COLORS.deepWater, COLORS.abyss],
  reefFloor: [COLORS.sand, COLORS.sandDeep],
};

// Fonts loaded via hooks/useAppFonts.js (@expo-google-fonts/baloo-2 + quicksand)
export const FONTS = {
  display: 'Baloo2_700Bold',
  heading: 'Baloo2_600SemiBold',
  body: 'Quicksand_500Medium',
  bodyBold: 'Quicksand_700Bold',
  bodyRegular: 'Quicksand_400Regular',
};

// Fallback stack used before fonts finish loading
export const FONT_FALLBACK = {
  display: undefined,
  heading: undefined,
  body: undefined,
  bodyBold: undefined,
  bodyRegular: undefined,
};

export const RADII = {
  organicA: { borderTopLeftRadius: 32, borderTopRightRadius: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 32 },
  organicB: { borderTopLeftRadius: 8, borderTopRightRadius: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 8 },
  pebble: { borderRadius: 999 },
  tag: { borderTopLeftRadius: 6, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 6 },
};

export const SPACING = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 48 };

export const SCREEN_STYLES = StyleSheet.create({
  placeholderCard: {
    alignItems: 'center',
    backgroundColor: COLORS.pearl,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  gamePlaceholderCard: {
    alignItems: 'center',
    backgroundColor: COLORS.pearl,
    ...RADII.organicA,
    padding: 28,
  },
  placeholderTitle: {
    color: COLORS.ink,
    fontFamily: FONTS.heading,
    fontSize: 28,
    marginBottom: 8,
  },
  placeholderDescription: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 16,
    textAlign: 'center',
  },
  placeholderButton: {
    backgroundColor: COLORS.deepWater,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  placeholderButtonText: {
    color: COLORS.pearl,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
  },
});

export default { Colors, Fonts, Spacing, BottomTabInset, MaxContentWidth, COLORS, GRADIENTS, FONTS, FONT_FALLBACK, RADII, SPACING, SCREEN_STYLES };
