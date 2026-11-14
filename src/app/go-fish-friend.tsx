// src/app/go-fish-friend.tsx
// New route: /go-fish-friend — reached via navigation from the games page.
import React from 'react';
import { useScreenNav } from '../hooks/useScreenNav';
import GoFishXScreen from '../screens/goFishXScreen';

export default function GoFishXRoute() {
  const navigation = useScreenNav();
  return <GoFishXScreen navigation={navigation} />;
}