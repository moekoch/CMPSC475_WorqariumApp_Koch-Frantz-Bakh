// src/app/go-fish.tsx
// New route: /go-fish — reached via navigation from the games page.

import { useScreenNav } from '../hooks/useScreenNav';
import GoFishScreen from '../screens/goFishScreen';

export default function GoFishRoute() {
  const navigation = useScreenNav();
  return <GoFishScreen navigation={navigation} />;
}