import { Image } from 'react-native';
import { ITEM_ASSETS, ITEM_KEYS } from '../../constants/itemAssets';

// draws an item's image
export default function ItemSprite({ itemKey, width, style }) {
  const source = ITEM_ASSETS[itemKey] ?? ITEM_ASSETS[ITEM_KEYS[0]];

  return (
    <Image
      source={source}
      style={[{ width, height: width * 0.62 }, style]}
      resizeMode="contain"
      accessible={false}
    />
  );
}