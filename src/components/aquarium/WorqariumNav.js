import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../constants/theme';

const TABS = [
  { key: 'Home', icon: 'waves', label: 'Reef', route: 'joinSession' },
  { key: 'Games', icon: 'gamepad-variant', label: 'Games', route: 'games' },
  { key: 'Avatar', icon: 'fish', label: 'My Fish', route: 'avatar' },
  { key: 'Store', icon: 'treasure-chest', label: 'Store', route: 'store' },
  { key: 'Settings', icon: 'cog', label: 'Settings', route: 'settings' },
];

/** Floating glass navigation with a bright, compact active-tab state. */
export default function WorqariumNav({ active, onNavigate, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                if (onNavigate) {
                  onNavigate(tab.key);
                } else {
                  navigation?.replace(tab.route);
                }
              }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              {isActive && (
                <LinearGradient colors={['#D5FAE8', '#74DDB2']} style={styles.activeTab}>
                  <MaterialCommunityIcons name={tab.icon} size={18} color={COLORS.deepWater} />
                  <Text style={styles.activeLabel}>{tab.label}</Text>
                </LinearGradient>
              )}
              {!isActive && (
                <>
                  <MaterialCommunityIcons name={tab.icon} size={20} color={COLORS.foam} />
                  <Text style={styles.label}>{tab.label}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, bottom: 14 },
  bar: {
    alignItems: 'center',
    backgroundColor: 'rgba(4,48,82,0.82)',
    borderColor: 'rgba(255,255,255,0.38)',
    borderRadius: 28,
    borderWidth: 1,
    elevation: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 8,
    shadowColor: '#002446',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  tab: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 48 },
  activeTab: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 7,
  },
  label: { color: 'rgba(255,255,255,0.94)', fontFamily: FONTS.body, fontSize: 12, marginTop: 3 },
  activeLabel: { color: COLORS.deepWater, fontFamily: FONTS.bodyBold, fontSize: 12 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
});
