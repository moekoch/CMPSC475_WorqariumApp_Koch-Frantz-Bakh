import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

const TABS = [
  { key: 'Home', icon: 'waves', label: 'Reef', route: 'joinSession' },
  { key: 'Games', icon: 'gamepad-variant', label: 'Games', route: 'games' },
  { key: 'Avatar', icon: 'fish', label: 'My Fish', route: 'avatar' },
  { key: 'Store', icon: 'treasure-chest', label: 'Store', route: 'store' },
  { key: 'Settings', icon: 'cog', label: 'Settings', route: 'settings' },
];

/**
 * App-wide bottom bar. A soft wave-top edge (instead of a hard rectangle)
 * separates it from the water above, with a small bubble marker over the
 * active tab rather than a generic highlighted pill.
 */
export default function WorqariumNav({ active, onNavigate, navigation }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.waveTop} />
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
                  navigation?.navigate(tab.route);
                }
              }}
              style={styles.tab}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              {isActive && <View style={styles.marker} />}
              <MaterialCommunityIcons
                name={tab.icon}
                size={22}
                color={isActive ? COLORS.sunYellow : COLORS.foam}
              />
              <Text style={[styles.label, isActive && { color: COLORS.sunYellow }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  waveTop: {
    height: 14,
    backgroundColor: COLORS.abyss,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: 10,
    opacity: 0.95,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.abyss,
    paddingTop: 8,
    paddingBottom: 18,
    paddingHorizontal: 6,
    justifyContent: 'space-around',
  },
  tab: { alignItems: 'center', minWidth: 56 },
  marker: {
    position: 'absolute',
    top: -12,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.sunYellow,
  },
  label: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.foam, marginTop: 2 },
});
