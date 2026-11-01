import { StyleSheet, Text, View } from 'react-native';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { SCREEN_STYLES } from '../constants/theme';

export default function StoreScreen({ navigation }) {
  return (
    <WaterBackground style={styles.root}>
      <View style={styles.content}>
        <View style={SCREEN_STYLES.placeholderCard}>
          <Text style={SCREEN_STYLES.placeholderTitle}>Store</Text>
          <Text style={SCREEN_STYLES.placeholderDescription}>
            Aquarium items and fish will be available here.
          </Text>
        </View>
      </View>
      <WorqariumNav active="Store" navigation={navigation} />
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 90,
  },
});