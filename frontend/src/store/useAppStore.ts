import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ActiveScreen, User } from '../types';

export interface LoginSession {
  lastViewMode?: string | null;
  lastCampaignDmSession?: string | null;
  lastCampaignPlayerSession?: string | null;
}

interface AppState {
  token: string | null;
  user: User | null;
  activeScreen: ActiveScreen;
  viewRole: 'player' | 'dm';
  lastCampaignDm: string | null;
  lastCampaignPlayer: string | null;
  // Não persistido: indica que a sessão (modo/campanhas) foi confirmada com o servidor nesta carga
  sessionSynced: boolean;
  characterUnderEditId: string | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setActiveScreen: (screen: ActiveScreen) => void;
  setViewRole: (role: 'player' | 'dm') => void;
  setCharacterUnderEditId: (id: string | null) => void;
  toggleViewRole: () => void;
  setLastCampaign: (role: 'player' | 'dm', campaignId: string | null) => void;
  syncSession: (session: LoginSession | null) => void;
  login: (token: string, user: User, session?: LoginSession) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeScreen: 'login',
      viewRole: 'player',
      lastCampaignDm: null,
      lastCampaignPlayer: null,
      sessionSynced: false,
      characterUnderEditId: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setActiveScreen: (activeScreen) => set({ activeScreen }),
      setViewRole: (viewRole) => set({ viewRole }),
      setCharacterUnderEditId: (characterUnderEditId) => set({ characterUnderEditId }),
      setLastCampaign: (role, campaignId) =>
        set(role === 'dm' ? { lastCampaignDm: campaignId } : { lastCampaignPlayer: campaignId }),
      syncSession: (session) =>
        set(session ? {
          viewRole: session.lastViewMode?.toUpperCase() === 'DM' ? 'dm' : 'player',
          lastCampaignDm: session.lastCampaignDmSession ?? null,
          lastCampaignPlayer: session.lastCampaignPlayerSession ?? null,
          sessionSynced: true,
        } : { sessionSynced: true }),
      toggleViewRole: () => set((state) => ({ viewRole: state.viewRole === 'dm' ? 'player' : 'dm' })),
      login: (token, user, session) =>
        set({
          token,
          user,
          viewRole: session?.lastViewMode
            ? (session.lastViewMode.toUpperCase() === 'DM' ? 'dm' : 'player')
            : (user.role === 'ROLE_ADMIN' || user.role === 'dm') ? 'dm' : 'player',
          lastCampaignDm: session?.lastCampaignDmSession ?? null,
          lastCampaignPlayer: session?.lastCampaignPlayerSession ?? null,
          sessionSynced: true,
          activeScreen: 'dashboard',
          characterUnderEditId: null,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          viewRole: 'player',
          lastCampaignDm: null,
          lastCampaignPlayer: null,
          sessionSynced: false,
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
        lastCampaignDm: state.lastCampaignDm,
        lastCampaignPlayer: state.lastCampaignPlayer,
        characterUnderEditId: state.token ? state.characterUnderEditId : null,
      }),
    }
  )
);
