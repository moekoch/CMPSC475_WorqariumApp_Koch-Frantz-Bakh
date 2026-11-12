// src/app/games.tsx
// New route: /games — selected from the bottom navigation without adding history.
import React from 'react';
import { useScreenNav } from '../hooks/useScreenNav';
import GamesScreen from '../screens/gamesScreen';

export default function GamesRoute() {
  const navigation = useScreenNav();
  return <GamesScreen navigation={navigation} />;
}
