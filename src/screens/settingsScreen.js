import { StyleSheet, Text, View } from 'react-native';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { COLORS, FONTS } from '../constants/theme';

const SETTINGS = [
  { title: 'Notifications', description: 'Notification preferences' },
  { title: 'Sound', description: 'Sound and music preferences' },
  { title: 'Privacy', description: 'Privacy preferences' },
  { title: 'Account', description: 'Account preferences' },
];

export default function SettingsScreen({ navigation }) {
  return (
    <WaterBackground style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.card}>
          {SETTINGS.map((setting) => (
            <View key={setting.title} style={styles.row}>
              <Text style={styles.rowTitle}>{setting.title}</Text>
              <Text style={styles.description}>{setting.description}</Text>
            </View>
          ))}
        </View>
      </View>
      <WorqariumNav active="Settings" navigation={navigation} />
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 90,
  },
  title: {
    color: COLORS.ink,
    fontFamily: FONTS.heading,
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.pearl,
    borderRadius: 24,
    paddingHorizontal: 20,
  },
  row: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.glassEdge,
  },
  rowTitle: {
    color: COLORS.ink,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
  },
  description: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 13,
    marginTop: 4,
  },
});
