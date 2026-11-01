import React from 'react';
import { useScreenNav } from '../hooks/useScreenNav';
import SpadesScreen from '../screens/spadesScreen';

export default function SpadesRoute() {
  const navigation = useScreenNav();
  return <SpadesScreen navigation={navigation} />;
}
