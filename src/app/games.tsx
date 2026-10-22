// src/app/games.tsx
// New route: /games — reached via router.push from the bottom navigation.

import { useScreenNav } from '../hooks/useScreenNav';
import GamesScreen from '../screens/gamesScreen';

export default function GamesRoute() {
  const navigation = useScreenNav();
  return <GamesScreen navigation={navigation} />;
}
