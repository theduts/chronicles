import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ActiveScreen, User } from '../types';

interface AppState {
  token: string | null;
  user: User | null;
  activeScreen: ActiveScreen;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setActiveScreen: (screen: ActiveScreen) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeScreen: 'login',
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setActiveScreen: (activeScreen) => set({ activeScreen }),
      login: (token, user) =>
        set({
          token,
          user,
          activeScreen: 'dashboard',
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          activeScreen: 'login',
        }),
    }),
    {
      name: 'chronicles-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeScreen: state.token ? state.activeScreen : 'login',
      }),
    }
  )
);
