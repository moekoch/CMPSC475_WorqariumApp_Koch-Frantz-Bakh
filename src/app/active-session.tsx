import { useScreenNav } from '@/hooks/useScreenNav';
import ActiveSessionScreen from '@/screens/activeSessionScreen';
import React from 'react';

export default function ActiveSession() {
  const navigation = useScreenNav();
  return <ActiveSessionScreen navigation={navigation} />;
}