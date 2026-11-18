// src/app/spades-friend.tsx
// New route: /spades-friend — reached via navigation from the games page.
import React from 'react';
import { useScreenNav } from '../hooks/useScreenNav';
import SpadesXScreen from '../screens/spadesXScreen';

export default function SpadesXRoute() {
  const navigation = useScreenNav();
  return <SpadesXScreen navigation={navigation} multiplayer />;
}