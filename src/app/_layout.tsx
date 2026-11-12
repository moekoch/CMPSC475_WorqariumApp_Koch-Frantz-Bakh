// src/app/_layout.tsx
// Replaces the Expo template's <Tabs> navigator
// Each screen now renders its own chrome, including the custom WorqariumNav pill bar
import { Stack } from 'expo-router';
import React from 'react';
import useAppFonts from '../hooks/useAppFonts';

export default function RootLayout() {
  useAppFonts();

  return <Stack screenOptions={{ headerShown: false }} />;
}