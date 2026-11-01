import { useScreenNav } from '@/hooks/useScreenNav';
import SettingsScreen from '@/screens/settingsScreen';
import React from 'react';

export default function SettingsRoute() {
  const navigation = useScreenNav();
  return <SettingsScreen navigation={navigation} />;
}
