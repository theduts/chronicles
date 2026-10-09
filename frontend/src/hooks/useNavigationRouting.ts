import { useEffect } from 'react';
import { ActiveScreen, User } from '../types';
import { useAppStore } from '../store/useAppStore';

export const ROUTE_MAP: Record<string, ActiveScreen> = {
  '/login': 'login',
  '/cadastro': 'signup',
  '/signup': 'signup',
  '/historia': 'dashboard',
  '/dashboard': 'dashboard',
  '/cronicas': 'chronicles',
  '/cronicas/historia_campanha': 'campaign_history',
  '/cronicas/historia-campanha': 'campaign_history',
  '/historia_campanha': 'campaign_history',
  '/historia-campanha': 'campaign_history',
  '/campanhas': 'campaigns',
  '/personagens': 'characters',
  '/personagens/editar': 'character_editor',
  '/npcs': 'npcs',
  '/bestiario': 'bestiary',
  '/anotacoes': 'notes',
  '/configuracoes': 'settings',
};

export const SCREEN_TO_ROUTE: Record<ActiveScreen, string> = {
  login: '/login',
  signup: '/cadastro',
  dashboard: '/historia',
  chronicles: '/cronicas',
  campaign_history: '/cronicas/historia_campanha',
  campaigns: '/campanhas',
  characters: '/personagens',
  character_editor: '/personagens/editar',
  npcs: '/npcs',
  bestiary: '/bestiario',
  notes: '/anotacoes',
  settings: '/configuracoes',
};

export function useNavigationRouting() {
  const { user, token, activeScreen, setActiveScreen: setStoreScreen } = useAppStore();

  const setActiveScreen = (screen: ActiveScreen, pushHistory = true) => {
    setStoreScreen(screen);
    const route = SCREEN_TO_ROUTE[screen] || '/historia';
    if (pushHistory && window.location.pathname !== route) {
      window.history.pushState({ screen }, '', route);
    }
  };

  // Sync initial route path on mount or user state change
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (!token || !user) {
      const targetScreen = path === '/cadastro' || path === '/signup' ? 'signup' : 'login';
      const targetRoute = SCREEN_TO_ROUTE[targetScreen];
      if (window.location.pathname !== targetRoute) {
        window.history.replaceState({ screen: targetScreen }, '', targetRoute);
      }
      if (activeScreen !== targetScreen) {
        setStoreScreen(targetScreen);
      }
    } else {
      if (path === '/' || path === '/login' || path === '/cadastro' || path === '/signup' || !ROUTE_MAP[path]) {
        window.history.replaceState({ screen: 'dashboard' }, '', '/historia');
        setStoreScreen('dashboard');
      } else {
        const screenFromPath = ROUTE_MAP[path];
        if (screenFromPath && screenFromPath !== activeScreen) {
          setStoreScreen(screenFromPath);
        }
      }
    }
  }, [user, token]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const mappedScreen = ROUTE_MAP[path];
      if (mappedScreen) {
        setStoreScreen(mappedScreen);
      } else {
        setStoreScreen(user && token ? 'dashboard' : 'login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, token]);

  return {
    activeScreen,
    setActiveScreen,
  };
}
