// Uses the shared ocean gradient by default, or an optional image for a screen.

import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import { GRADIENTS } from '../../constants/theme';

export default function WaterBackground({ children, style, imageSource }) {
  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      {imageSource ? (
        <Image
          source={imageSource}
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
