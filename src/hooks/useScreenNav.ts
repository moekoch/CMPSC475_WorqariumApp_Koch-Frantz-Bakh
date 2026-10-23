// src/hooks/useScreenNav.ts
//
// Adapter so the existing screens/*.js files (which expect a
// `navigation={{ navigate, goBack, replace }}` prop, written before
// expo-router was wired in) can run unmodified on top of expo-router.
//
// Add new entries to ROUTES as you create route files in src/app/.
//
// Use `replace` instead of `navigate` when a screen should NOT remain in
// history (e.g. loadingScreen -> joinSession, so swiping back or pressing
// the hardware back button can't return to the loader).

import { useRouter } from 'expo-router';

const ROUTES: Record<string, string> = {
  loading: '/',
  login: '/login',
  register: '/register',
  joinSession: '/join-session',
  activeSession: '/active-session',
  games: '/games',
  blackjack: '/blackjack',
  goFish: '/go-fish',
  tictactoe: '/tictactoe',
  avatar: '/avatar',
  store: '/store',
  settings: '/settings',
  botQuery: '/bot-query',
};

export function useScreenNav() {
  const router = useRouter();

  const resolvePath = (screenName: string, params?: Record<string, string>) => {
    const path = ROUTES[screenName];
    if (!path) {
      console.warn(`useScreenNav: no route mapped for "${screenName}"`);
      return null;
    }
    return params ? { pathname: path, params } : path;
  };

  return {
    navigate: (screenName: string, params?: Record<string, string>) => {
      const target = resolvePath(screenName, params);
      if (target) router.push(target as any);
    },
    replace: (screenName: string, params?: Record<string, string>) => {
      const target = resolvePath(screenName, params);
      if (target) router.replace(target as any);
    },
    goBack: () => router.back(),
  };
}
