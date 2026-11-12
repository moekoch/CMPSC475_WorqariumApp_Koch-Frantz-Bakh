// src/app/blackjack.tsx
// New route: /blackjack — opened from the games page.
import React from 'react';
import { useScreenNav } from '../hooks/useScreenNav';
import BlackJackScreen from '../screens/blackjackScreen';

export default function BlackjackRoute() {
  const navigation = useScreenNav();
  return <BlackJackScreen navigation={navigation} />;
}