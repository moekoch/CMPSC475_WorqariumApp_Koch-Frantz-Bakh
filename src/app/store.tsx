import React from 'react';
import { useScreenNav } from '@/hooks/useScreenNav';
import StoreScreen from '@/screens/storeScreen';

export default function StoreRoute() {
  const navigation = useScreenNav();
  return <StoreScreen navigation={navigation} />;
}
