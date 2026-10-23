import React from 'react';
import { useScreenNav } from '@/hooks/useScreenNav';
import AvatarScreen from '@/screens/avatarScreen';

export default function AvatarRoute() {
  const navigation = useScreenNav();
  return <AvatarScreen navigation={navigation} />;
}
