// Uses the shared ocean scene by default; light-tone screens can keep the loader gradient.

import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import { GRADIENTS } from '../../constants/theme';

export default function WaterBackground({ children, style, imageSource, tone = 'ocean' }) {
  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      {imageSource || tone === 'ocean' ? (
        <Image
          source={imageSource || require('../../../assets/images/backgrounds/gameOcean.jpg')}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <LinearGradient
          colors={GRADIENTS.loader.colors}
          locations={GRADIENTS.loader.locations}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </View>
  );
}
