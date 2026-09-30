import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ActiveScreen, User } from '../types';

interface AppState {
  token: string | null;
  user: User | null;
  activeScreen: ActiveScreen;
  viewRole: 'player' | 'dm';
  characterUnderEditId: string | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setActiveScreen: (screen: ActiveScreen) => void;
  setViewRole: (role: 'player' | 'dm') => void;
  setCharacterUnderEditId: (id: string | null) => void;
  toggleViewRole: () => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeScreen: 'login',
      viewRole: 'player',
      characterUnderEditId: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setActiveScreen: (activeScreen) => set({ activeScreen }),
      setViewRole: (viewRole) => set({ viewRole }),
      setCharacterUnderEditId: (characterUnderEditId) => set({ characterUnderEditId }),
      toggleViewRole: () => set((state) => ({ viewRole: state.viewRole === 'dm' ? 'player' : 'dm' })),
      login: (token, user) =>
        set({
          token,
          user,
          viewRole: (user.role === 'ROLE_ADMIN' || user.role === 'dm') ? 'dm' : 'player',
          activeScreen: 'dashboard',
          characterUnderEditId: null,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          viewRole: 'player',
          activeScreen: 'login',
          characterUnderEditId: null,
        }),
    }),
    {
      name: 'chronicles-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeScreen: state.token ? state.activeScreen : 'login',
        viewRole: state.viewRole,
        characterUnderEditId: state.token ? state.characterUnderEditId : null,
      }),
    }
  )
);
