// app/(tabs)/layout_tsx
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Slot } from 'expo-router';
import React from 'react';

/**
 * IMPORTANT:
 * We intentionally DO NOT render expo-router <Tabs /> here because the app
 * implements its own BottomTabNavigator inside app/(tabs)/index.tsx.
 * Rendering expo-router Tabs + the custom BottomTabNavigator caused the
 * duplicate bottom bar you saw. Returning <Slot /> lets the child index.tsx
 * render full-screen without a second tab bar.
 */
export default function TabLayout() {
  // colorScheme kept in case you want to wrap/adjust in future
  const colorScheme = useColorScheme();
  return <Slot />;
}
