import { useFonts } from 'expo-font';
import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
} from '@expo-google-fonts/baloo-2';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';

// Worqarium's two-typeface system:
//  - Baloo 2  → headings / display: rounded, chunky, a little playful
//  - Quicksand → body copy: friendly, soft, highly legible at small sizes
// Call once near the app root so native and web routes share the same typefaces.
export default function useAppFonts() {
  const [fontsLoaded] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_700Bold,
  });
  return fontsLoaded;
}
