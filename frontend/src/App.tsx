import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Character, Note, ActiveScreen, Campaign } from './types';
import { INITIAL_NOTES } from './mockData';
import { useAppStore } from './store/useAppStore';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import CharactersListView from './components/CharactersListView';
import CharacterEditorView from './components/CharacterEditorView';
import NotesView from './components/NotesView';
import SettingsView from './components/SettingsView';
import ChroniclesView from './components/ChroniclesView';
import CampaignHistoryView from './components/CampaignHistoryView';
import NPCsView from './components/NPCsView';
import BestiaryView from './components/BestiaryView';
import CampaignsView from './components/CampaignsView';

// Route mappings for each page
const ROUTE_MAP: Record<string, ActiveScreen> = {
  '/login': 'login',
  '/cadastro': 'signup',
  '/signup': 'signup',
  '/historia': 'dashboard',
  '/dashboard': 'dashboard',
  '/cronicas': 'chronicles',
  '/cronicas/historia_campanha': 'campaign_history',
  '/cronicas/historia-campanha': 'campaign_history',
  '/campanhas': 'campaigns',
  '/personagens': 'characters',
  '/personagens/editar': 'character_editor',
  '/npcs': 'npcs',
  '/bestiario': 'bestiary',
  '/anotacoes': 'notes',
  '/configuracoes': 'settings',
};

const SCREEN_TO_ROUTE: Record<ActiveScreen, string> = {
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MainApp() {
  const currentPath = window.location.pathname.toLowerCase();

  const { user, token, activeScreen, setActiveScreen: setStoreScreen, logout, setUser: setStoreUser } = useAppStore();

  // Navigate helper to keep URL and screen state in sync
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

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('daemon_theme_toggle') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('daemon_theme_toggle', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('daemon_sidebar_collapsed');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const queryClientInstance = useQueryClient();

  // Query characters from Spring Boot backend
  const { data: serverCharacters, isLoading: isLoadingCharacters } = useQuery({
    queryKey: ['characters'],
    queryFn: async () => {
      const response = await api.get<Character[]>('/characters');
      return response.data;
    },
    enabled: !!token && !!user,
  });

  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      const saved = localStorage.getItem('daemon_characters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error parsing characters from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    if (serverCharacters && Array.isArray(serverCharacters)) {
      setCharacters(serverCharacters);
      localStorage.setItem('daemon_characters', JSON.stringify(serverCharacters));
    }
  }, [serverCharacters]);

  const createCharacterMutation = useMutation({
    mutationFn: async (newChar: Character) => {
      const response = await api.post<Character>('/characters', newChar);
      return response.data;
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['characters'] });
    },
  });

  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, char }: { id: string; char: Character }) => {
      const response = await api.put<Character>(`/characters/${id}`, char);
      return response.data;
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['characters'] });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ id, char }: { id: string; char: Character }) => {
      const response = await api.post<Character>(`/characters/${id}/submit-review`, char);
      return response.data;
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['characters'] });
    },
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/characters/${id}`);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['characters'] });
    },
  });

  // Query notes from Spring Boot backend
  const { data: serverNotes } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await api.get<any[]>('/notes');
      return response.data.map((n) => ({
        id: String(n.id),
        meta: n.meta || n.title || 'Anotação',
        content: n.content || '',
        saveBtnId: `save-${n.id}`,
      }));
    },
    enabled: !!token && !!user,
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('daemon_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_NOTES;
    } catch (e) {
      console.error('Error parsing notes from localStorage:', e);
      return INITIAL_NOTES;
    }
  });

  useEffect(() => {
    if (serverNotes && Array.isArray(serverNotes) && serverNotes.length > 0) {
      setNotes(serverNotes);
      localStorage.setItem('daemon_notes', JSON.stringify(serverNotes));
    }
  }, [serverNotes]);

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: Note) => {
      const payload = {
        title: newNote.meta || 'Nova Anotação',
        content: newNote.content || ' ',
      };
      const response = await api.post('/notes', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: Note }) => {
      const payload = {
        title: note.meta || 'Anotação',
        content: note.content || ' ',
      };
      const response = await api.put(`/notes/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // Campaign State for Header Dropdown
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem('daemon_campaigns');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: "1", name: "Misericórdia Divina", dmEmail: "teste_dm@email.com", players: ["teste_pc@email.com", "MuriloDutra01@gmail.com"] },
      { id: "2", name: "Sombras de Arkanun", dmEmail: "teste_dm@email.com", players: ["teste_pc@email.com"] }
    ];
  });

  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('daemon_active_campaign_id');
      if (saved) return saved;
    } catch (e) {}
    return "1";
  });

  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('daemon_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // Load available players from system accounts
  useEffect(() => {
    try {
      const logins = localStorage.getItem('daemon_mock_logins');
      if (logins) {
        const parsed = JSON.parse(logins);
        const emails: string[] = [];
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            if (p && p.email) emails.push(p.email);
          });
        } else if (typeof parsed === 'object') {
          Object.values(parsed).forEach((p: any) => {
            if (p && p.email) emails.push(p.email);
          });
        }
        if (!emails.includes('teste_pc@email.com')) emails.push('teste_pc@email.com');
        if (!emails.includes('MuriloDutra01@gmail.com')) emails.push('MuriloDutra01@gmail.com');
        setRegisteredPlayers(Array.from(new Set(emails)));
      } else {
        setRegisteredPlayers(['teste_pc@email.com', 'MuriloDutra01@gmail.com']);
      }
    } catch (e) {
      setRegisteredPlayers(['teste_pc@email.com', 'MuriloDutra01@gmail.com']);
    }
  }, [showCreateCampaignModal]);

  // Campaign dropdown visibility filter
  const visibleCampaigns = campaigns.filter(c => {
    if (!user) return false;
    const userName = (user.name || user.username || '').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    const isDM = user.role === 'dm' || user.role === 'ROLE_ADMIN';
    if (isDM) {
      return c.dmEmail.toLowerCase() === userEmail || c.dmEmail.toLowerCase() === userName || c.dmEmail === 'teste_dm@email.com';
    } else {
      return c.players.some(p => p.toLowerCase() === userEmail || p.toLowerCase() === userName);
    }
  });

  useEffect(() => {
    if (visibleCampaigns.length > 0) {
      const exists = visibleCampaigns.some(c => c.id === activeCampaignId);
      if (!exists) {
        setActiveCampaignId(visibleCampaigns[0].id);
        localStorage.setItem('daemon_active_campaign_id', visibleCampaigns[0].id);
      }
    }
  }, [campaigns, user, activeCampaignId]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const newCampId = `camp_${Date.now()}`;
    const newCamp = {
      id: newCampId,
      name: newCampaignName.trim(),
      dmEmail: user?.email || 'teste_dm@email.com',
      players: selectedPlayers.length > 0 ? selectedPlayers : ['teste_pc@email.com', user?.email].filter(Boolean) as string[]
    };

    setCampaigns(prev => [...prev, newCamp]);
    setActiveCampaignId(newCampId);
    localStorage.setItem('daemon_active_campaign_id', newCampId);

    setNewCampaignName('');
    setSelectedPlayers([]);
    setShowCreateCampaignModal(false);
  };

  const [characterUnderEditId, setCharacterUnderEditId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Persist states to local storage
  useEffect(() => {
    localStorage.setItem('daemon_characters', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('daemon_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('daemon_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('daemon_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('daemon_active_screen', activeScreen);
  }, [activeScreen]);

  useEffect(() => {
    localStorage.setItem('daemon_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Auth actions
  const handleLoginSuccess = (_name: string, _email: string, _role: 'player' | 'dm') => {
    setActiveScreen('dashboard');
  };

  const handleLogout = () => {
    logout();
    setActiveScreen('login');
  };

  // Character modifications
  const handleSaveCharacter = (updatedChar: Character) => {
    const isExisting = characters.some((c) => c.id === updatedChar.id);
    if (isExisting && updatedChar.id) {
      if (user?.role === 'dm' || user?.role === 'ROLE_ADMIN') {
        updateCharacterMutation.mutate({ id: updatedChar.id, char: updatedChar });
      } else {
        submitReviewMutation.mutate({ id: updatedChar.id, char: updatedChar });
      }
    } else {
      createCharacterMutation.mutate(updatedChar);
    }

    setCharacters((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedChar.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...updatedChar,
          isPendingDMReview: user?.role === 'dm' || user?.role === 'ROLE_ADMIN' ? false : true,
        };
        return copy;
      }
      return [updatedChar, ...prev];
    });

    // Return to characters summary
    setActiveScreen('characters');
  };

  const handleSilentUpdateCharacter = (updatedChar: Character) => {
    setCharacters((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedChar.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = updatedChar;
        return copy;
      }
      return prev;
    });
  };

  const handleDeleteCharacter = (id: string) => {
    deleteCharacterMutation.mutate(id);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const handleApproveCharacter = (id: string) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id === id && c.isPendingDMReview && c.pendingChanges) {
          // Merge proposed edits into the main character object and clear pending review
          return {
            ...c.pendingChanges,
            isPendingDMReview: false,
            pendingChanges: undefined
          };
        }
        return c;
      })
    );
  };

  const handleRejectCharacter = (id: string) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          // Discard the proposed edits and clear pending review
          return {
            ...c,
            isPendingDMReview: false,
            pendingChanges: undefined
          };
        }
        return c;
      })
    );
  };

  // Notes modifications
  const handleSaveNote = (updatedNote: Note) => {
    if (updatedNote.id && !updatedNote.id.startsWith('note-')) {
      updateNoteMutation.mutate({ id: updatedNote.id, note: updatedNote });
    }
    setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
  };

  const handleAddNote = (newNote: Note) => {
    createNoteMutation.mutate(newNote);
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    if (id && !id.startsWith('note-')) {
      deleteNoteMutation.mutate(id);
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // JSON settings restore/import
  const handleImportCampaignData = (data: { characters: Character[]; notes: Note[] }) => {
    if (data.characters) setCharacters(data.characters);
    if (data.notes) setNotes(data.notes);
  };

  // Filter components based on overall top-search
  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.classKit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = notes.filter((n) =>
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If unauthorized, showcase Login/Signup
  if (!user) {
    return (
      <AuthView
        initialTab={activeScreen === 'signup' ? 'signup' : 'login'}
        onNavigateTab={(tab) => setActiveScreen(tab)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Absolute Film Grain overlays */}
      <div className="noise-overlay"></div>

      {/* Shared Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Column Wrapper */}
      <div className="flex flex-col flex-grow h-screen overflow-hidden relative">
        {/* TopNavBar - Hidden on PC & Tablet (md and up), visible on Mobile without title */}
        <header className="flex justify-between items-center px-6 h-16 w-full bg-background border-b border-outline-variant shrink-0 z-[100] md:hidden">
          {/* Mobile menu trigger toggle */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsMobileUserMenuOpen(false);
            }}
            className="text-primary flex items-center justify-center p-2 focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Mobile User Modal Trigger */}
          <button
            onClick={() => {
              setIsMobileUserMenuOpen(!isMobileUserMenuOpen);
              setIsMobileMenuOpen(false);
            }}
            className="text-primary flex items-center justify-center p-2 focus:outline-none cursor-pointer hover:text-on-surface transition-colors"
            title="Minha Conta"
          >
            <span className="material-symbols-outlined text-2xl">
              account_circle
            </span>
          </button>
        </header>

        {/* Mobile menu backdrop / click-outside handler */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 top-16 bg-transparent z-[90] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Global responsive mobile dropdown menu block */}
        <div
          className={`absolute top-16 left-0 right-0 bg-surface-container border-b border-outline-variant duration-300 md:hidden z-[100] flex flex-col shadow-2xl transition-all origin-top ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            isMobileMenuOpen 
              ? 'opacity-100 scale-y-100 p-4 space-y-2 pointer-events-auto' 
              : 'opacity-0 scale-y-0 p-0 h-0 pointer-events-none border-b-0'
          }`}
        >
          <button
            onClick={() => {
              setActiveScreen('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider ${activeScreen === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-lg">history_edu</span>
            <span>História</span>
          </button>
          <button
            onClick={() => {
              setActiveScreen('chronicles');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider ${activeScreen === 'chronicles' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-lg">auto_stories</span>
            <span>Crônicas</span>
          </button>
          <button
            onClick={() => {
              setActiveScreen('campaigns');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider ${activeScreen === 'campaigns' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-lg">map</span>
            <span>Campanhas</span>
          </button>
          <button
            onClick={() => {
              setActiveScreen('characters');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider ${activeScreen === 'characters' || activeScreen === 'character_editor' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-lg">groups</span>
            <span>{user.role === 'dm' ? 'Personagens' : 'Meus Personagens'}</span>
          </button>
          {user.role === 'dm' && (
            <>
              <button
                onClick={() => {
                  setActiveScreen('npcs');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider ${activeScreen === 'npcs' ? 'text-primary' : 'text-on-surface-variant'}`}
              >
                <span className="material-symbols-outlined text-lg">assignment_ind</span>
                <span>NPCs</span>
              </button>
              <button
                onClick={() => {
                  setActiveScreen('bestiary');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider ${activeScreen === 'bestiary' ? 'text-primary' : 'text-on-surface-variant'}`}
              >
                <span className="material-symbols-outlined text-lg">skull</span>
                <span>Bestiário</span>
              </button>
            </>
          )}
          <button
            onClick={() => {
              setActiveScreen('notes');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-sans font-bold uppercase tracking-wider ${activeScreen === 'notes' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-lg">description</span>
            <span>Anotações</span>
          </button>
        </div>

        {/* Mobile User Modal (Settings & Logout) */}
        {isMobileUserMenuOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:hidden">
            <div className="bg-surface-container border border-outline-variant w-full max-w-sm p-6 relative animate-fadeIn shadow-2xl">
              <button
                onClick={() => setIsMobileUserMenuOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              
              <h3 className="font-serif text-lg text-primary font-bold uppercase tracking-wider mb-6 pb-4 border-b border-outline-variant/30">
                Minha Conta
              </h3>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMobileUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-left text-xs font-bold font-sans uppercase tracking-wider text-on-surface hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg shrink-0 text-primary">settings</span>
                  <span>Configurações</span>
                </button>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 bg-surface-container hover:bg-surface-container-high border border-[#442222]/50 text-left text-xs font-bold font-sans uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg shrink-0 text-red-500">logout</span>
                  <span>Deslogar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search status summary overlay if typing in main header */}
        {searchTerm && (
          <div className="bg-surface-container border-b border-outline-variant px-6 py-2.5 z-20 flex justify-between items-center text-xs text-on-surface-variant font-medium">
            <span>
              Mostrando resultados filtrando por <strong className="text-primary">"{searchTerm}"</strong>
            </span>
            <button
              onClick={() => setSearchTerm('')}
              className="font-sans text-[10px] text-primary tracking-widest uppercase font-bold hover:underline"
            >
              Ver todas as crônicas
            </button>
          </div>
        )}

        {/* Main Scrollable Area */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative transition-colors duration-300 ${activeScreen === 'character_editor' ? 'character-editor-bg' : 'bg-background'}`}>
          {/* Main screens multiplexer */}
          <div className="max-w-7xl mx-auto">
            {activeScreen === 'dashboard' && (
              <DashboardView
                characters={characters}
                notes={notes}
                setActiveScreen={setActiveScreen}
                setCharacterUnderEditId={setCharacterUnderEditId}
                userRole={user.role}
                onApproveCharacter={handleApproveCharacter}
              />
            )}

            {activeScreen === 'characters' && (
              <CharactersListView
                characters={filteredCharacters}
                setActiveScreen={setActiveScreen}
                setCharacterUnderEditId={setCharacterUnderEditId}
                onDeleteCharacter={handleDeleteCharacter}
                userRole={user.role}
                onApproveCharacter={handleApproveCharacter}
                onRejectCharacter={handleRejectCharacter}
              />
            )}

            {activeScreen === 'character_editor' && (
              <CharacterEditorView
                characterId={characterUnderEditId}
                characters={characters}
                onSave={handleSaveCharacter}
                onSilentUpdate={handleSilentUpdateCharacter}
                setActiveScreen={setActiveScreen}
                onDelete={handleDeleteCharacter}
                userRole={user.role}
                onApprove={handleApproveCharacter}
                onReject={handleRejectCharacter}
              />
            )}

            {activeScreen === 'notes' && (
              <NotesView
                notes={filteredNotes}
                onSaveNote={handleSaveNote}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {activeScreen === 'chronicles' && (
              <ChroniclesView
                userRole={user.role}
                onNavigateToHistory={() => setActiveScreen('campaign_history')}
              />
            )}

            {activeScreen === 'campaign_history' && (
              <CampaignHistoryView
                onBack={() => setActiveScreen('chronicles')}
                userRole={user.role}
              />
            )}

            {activeScreen === 'campaigns' && (
              <CampaignsView
                campaigns={campaigns}
                setCampaigns={setCampaigns}
                user={user}
                activeCampaignId={activeCampaignId}
                setActiveCampaignId={setActiveCampaignId}
              />
            )}

            {activeScreen === 'npcs' && (
              <NPCsView activeCampaignId={activeCampaignId} campaigns={campaigns} />
            )}

            {activeScreen === 'bestiary' && (
              <BestiaryView activeCampaignId={activeCampaignId} campaigns={campaigns} />
            )}

          </div>
          
          {/* Global Footer */}
          <footer className="mt-12 pt-8 pb-4 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50 px-0 sm:px-6 max-w-7xl mx-auto w-full">
            <p className="font-sans text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-center md:text-left leading-relaxed w-full">
              <span className="block sm:inline">© {new Date().getFullYear()} CHRONICLES</span>
              <span className="hidden sm:inline"> - </span>
              <span className="block sm:inline">TODOS DIREITOS RESERVADOS</span>
            </p>
          </footer>
        </main>
      </div>

      {isSettingsOpen && (
        <SettingsView
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          characters={characters}
          notes={notes}
          user={{
            name: user?.name || user?.username || '',
            email: user?.email || '',
            role: (user?.role === 'dm' || user?.role === 'ROLE_ADMIN' ? 'dm' : 'player') as 'player' | 'dm',
          }}
          onUpdateUser={(updatedUser) => {
            if (updatedUser) {
              setStoreUser({
                id: user?.id || '1',
                username: updatedUser.name,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role || 'player',
              });
            }
          }}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      )}

      {/* Beautifully Crafted Create Campaign Modal */}
      {showCreateCampaignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant w-full max-w-md p-6 relative animate-fadeIn shadow-2xl">
            <button
              onClick={() => setShowCreateCampaignModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <h3 className="font-serif text-xl text-primary font-bold uppercase tracking-wider mb-6">
              Criar Nova Campanha
            </h3>

            <form onSubmit={handleCreateCampaign} className="space-y-5">
              <div>
                <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Ex: A Vingança de Trevas"
                  className="w-full bg-surface-container border border-outline-variant/60 text-on-surface font-sans text-xs px-4 py-3 focus:outline-none focus:border-primary placeholder-on-surface-variant/40"
                />
              </div>

              <div>
                <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Convidar Jogadores (E-mails)
                </label>
                <div className="bg-surface-container border border-outline-variant/60 max-h-40 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                  {registeredPlayers.map((playerEmail) => {
                    const isSelected = selectedPlayers.includes(playerEmail);
                    return (
                      <label key={playerEmail} className="flex items-center gap-3 cursor-pointer group text-xs font-sans text-on-surface">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedPlayers(prev => prev.filter(p => p !== playerEmail));
                            } else {
                              setSelectedPlayers(prev => [...prev, playerEmail]);
                            }
                          }}
                          className="accent-primary h-4 w-4 rounded-none cursor-pointer"
                        />
                        <span className="group-hover:text-primary transition-colors">
                          {playerEmail}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="font-sans text-[9px] text-on-surface-variant/60 mt-1.5 uppercase tracking-wider">
                  Jogadores selecionados serão capazes de ver esta campanha.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowCreateCampaignModal(false)}
                  className="flex-1 py-3 border border-outline-variant text-on-surface-variant hover:text-on-surface text-xs font-sans font-bold uppercase tracking-widest hover:border-white transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-xs font-sans font-bold uppercase tracking-widest transition-all cursor-pointer text-center"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}
