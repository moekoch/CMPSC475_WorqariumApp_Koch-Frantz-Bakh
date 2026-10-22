// src/app/blackjack.tsx
// New route: /blackjack — reached via router.push from the games page.

import { useScreenNav } from '../hooks/useScreenNav';
import BlackJackScreen from '../screens/blackjackScreen';

export default function BlackjackRoute() {
  const navigation = useScreenNav();
  return <BlackJackScreen navigation={navigation} />;
}