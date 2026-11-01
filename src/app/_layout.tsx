// src/app/_layout.tsx
//
// Replaces the Expo template's <Tabs> navigator (the native "Home | Explore"
// bar you saw at the bottom of the device screenshot). Each screen now
// renders its own chrome, including the custom WorqariumNav pill bar, so a
// second, native tab bar underneath it would be redundant.
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}