import React from 'react';
import { useScreenNav } from '@/hooks/useScreenNav';
import SettingsScreen from '@/screens/settingsScreen';

export default function SettingsRoute() {
  const navigation = useScreenNav();
  return <SettingsScreen navigation={navigation} />;
}
