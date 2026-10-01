import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './services/api';
import { Character, Note, ActiveScreen, Campaign } from './types';
import { useAppStore } from './store/useAppStore';
import { useNavigationRouting } from './hooks/useNavigationRouting';
import { useCharacterMutations } from './hooks/useCharacterMutations';
import { useNoteMutations } from './hooks/useNoteMutations';
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
import ViewRoleToggle from './components/ViewRoleToggle';
import ToastProvider from './components/ui/ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background text-on-surface">
          <div className="p-6 bg-surface-container-high border border-red-500/30 rounded-lg max-w-lg shadow-xl">
            <h2 className="text-xl font-bold text-red-400 mb-2 font-serif">Ocorreu um erro ao renderizar este módulo</h2>
            <p className="text-xs text-on-surface-variant mb-4 font-mono">
              {this.state.error?.message || 'Erro inesperado'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Recarregar Módulo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { user, token, logout, setUser: setStoreUser, viewRole, toggleViewRole, characterUnderEditId, setCharacterUnderEditId } = useAppStore();
  const { activeScreen, setActiveScreen } = useNavigationRouting();
  const userRole: 'player' | 'dm' = viewRole;

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

  const queryClient = useQueryClient();

  // Campaign State fetched from backend REST API
  const { data: serverCampaigns } = useQuery<Campaign[]>({
    queryKey: ['campaigns', userRole],
    queryFn: async () => {
      const response = await api.get<any[]>('/campaigns', {
        params: { role: userRole }
      });
      return response.data.map(c => ({
        id: String(c.id),
        name: c.name,
        dmEmail: c.dmEmail || '',
        players: c.players || [],
        subtitulo: c.subtitulo,
        universo: c.universo,
        lore: c.lore,
        ilustracao: c.ilustracao,
        inviteCode: c.inviteCode,
        isDm: c.isDm,
      }));
    },
    enabled: !!token && !!user,
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (serverCampaigns !== undefined) {
      setCampaigns(serverCampaigns);
    }
  }, [serverCampaigns]);

  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('daemon_active_campaign_id');
      if (saved && saved !== '1' && saved !== '2') return saved;
    } catch (e) {}
    return '';
  });

  const {
    characters,
    isLoadingCharacters,
    fieldErrors,
    handleSaveCharacter: saveCharacterWithApi,
    handleSilentUpdateCharacter,
    handleDeleteCharacter,
    handleApproveCharacter,
    handleRejectCharacter,
    handleLevelUpCharacter,
    levelUpCharacterMutation,
    handleImportCharacters,
  } = useCharacterMutations(user, token, activeCampaignId, userRole);

  const {
    notes,
    handleSaveNote,
    handleAddNote,
    handleDeleteNote,
    handleImportNotes,
  } = useNoteMutations(user, token);

  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<string[]>([]);

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
        setRegisteredPlayers(Array.from(new Set(emails.filter(e => !e.includes('teste_')))));
      } else {
        setRegisteredPlayers([]);
      }
    } catch (e) {
      setRegisteredPlayers([]);
    }
  }, [showCreateCampaignModal]);

  // Campaign dropdown visibility filter
  const visibleCampaigns = campaigns.filter(c => {
    if (!user) return false;
    const userName = (user.name || user.username || '').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    const isDM = userRole === 'dm';
    if (isDM) {
      return (c.isDm === true) || (!!c.dmEmail && (c.dmEmail.toLowerCase() === userEmail || c.dmEmail.toLowerCase() === userName));
    } else {
      return (c.players || []).some(p => p && (p.toLowerCase() === userEmail || p.toLowerCase() === userName));
    }
  });

  useEffect(() => {
    if (visibleCampaigns.length > 0) {
      const exists = visibleCampaigns.some(c => c.id === activeCampaignId);
      if (!exists) {
        setActiveCampaignId(visibleCampaigns[0].id);
        localStorage.setItem('daemon_active_campaign_id', visibleCampaigns[0].id);
      }
    } else {
      setActiveCampaignId('');
      localStorage.removeItem('daemon_active_campaign_id');
    }
  }, [campaigns, user, activeCampaignId, userRole]);

  const createCampaignModalMutation = useMutation({
    mutationFn: async (payload: { name: string; subtitulo?: string; universo?: string }) => {
      const response = await api.post<any>('/campaigns', payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (data?.id) {
        const idStr = String(data.id);
        setActiveCampaignId(idStr);
        localStorage.setItem('daemon_active_campaign_id', idStr);
      }
    },
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    createCampaignModalMutation.mutate({
      name: newCampaignName.trim(),
      subtitulo: '',
      universo: 'Medieval',
    });

    setNewCampaignName('');
    setSelectedPlayers([]);
    setShowCreateCampaignModal(false);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSaveCharacter = (updatedChar: Character) => {
    saveCharacterWithApi(updatedChar, () => {
      setActiveScreen('characters');
    });
  };

  // JSON settings restore/import
  const handleImportCampaignData = (data: { characters: Character[]; notes: Note[] }) => {
    if (data.characters) handleImportCharacters(data.characters);
    if (data.notes) handleImportNotes(data.notes);
  };

  // Filter components based on overall top-search and active view role
  const filteredCharacters = characters.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.classKit.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (userRole === 'player') {
      // In player mode, only show characters owned by current user (or fallback to true if no userId assigned)
      return !c.userId || c.userId === user?.id;
    } else {
      // In DM mode, show campaign characters and NEVER DM's own characters
      return !c.userId || c.userId !== user?.id;
    }
  });

  const handleToggleRole = () => {
    toggleViewRole();
    if (activeScreen === 'character_editor') {
      setActiveScreen('characters');
    }
  };

  const filteredNotes = notes.filter((n) =>
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUserSafe = user ? {
    id: user.id,
    name: user.name || user.username || 'Usuário',
    email: user.email || '',
    role: userRole,
  } : null;

  // If unauthorized, showcase Login/Signup
  if (!user || !currentUserSafe) {
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
        user={currentUserSafe}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleRole={handleToggleRole}
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
            <span>{userRole === 'dm' ? 'Personagens' : 'Meus Personagens'}</span>
          </button>
          {userRole === 'dm' && (
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
                <ViewRoleToggle />

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
                userRole={userRole}
                onApproveCharacter={handleApproveCharacter}
                activeCampaign={campaigns.find(c => c.id === activeCampaignId)}
              />
            )}

            {activeScreen === 'characters' && (
              <CharactersListView
                characters={filteredCharacters}
                isLoading={isLoadingCharacters}
                setActiveScreen={setActiveScreen}
                setCharacterUnderEditId={setCharacterUnderEditId}
                onDeleteCharacter={handleDeleteCharacter}
                userRole={userRole}
                onApproveCharacter={handleApproveCharacter}
                onRejectCharacter={handleRejectCharacter}
                campaigns={visibleCampaigns}
              />
            )}

            {activeScreen === 'character_editor' && (
              <ErrorBoundary>
                <CharacterEditorView
                  characterId={characterUnderEditId}
                  characters={characters}
                  fieldErrors={fieldErrors}
                  onSave={handleSaveCharacter}
                  onSilentUpdate={handleSilentUpdateCharacter}
                  setActiveScreen={setActiveScreen}
                  onDelete={handleDeleteCharacter}
                  userRole={userRole}
                  onApprove={handleApproveCharacter}
                  onReject={handleRejectCharacter}
                  onLevelUp={handleLevelUpCharacter}
                  isLevelingUp={levelUpCharacterMutation.isPending}
                  campaigns={campaigns}
                />
              </ErrorBoundary>
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
                userRole={userRole}
                campaignId={activeCampaignId}
                onNavigateToHistory={() => setActiveScreen('campaign_history')}
              />
            )}

            {activeScreen === 'campaign_history' && (
              <CampaignHistoryView
                onBack={() => setActiveScreen('chronicles')}
                userRole={userRole}
                campaignId={activeCampaignId}
              />
            )}

            {activeScreen === 'campaigns' && (
              <CampaignsView
                campaigns={visibleCampaigns}
                setCampaigns={setCampaigns}
                user={currentUserSafe}
                activeCampaignId={activeCampaignId}
                setActiveCampaignId={setActiveCampaignId}
              />
            )}

            {activeScreen === 'npcs' && (
              <NPCsView activeCampaignId={activeCampaignId} campaigns={visibleCampaigns} />
            )}

            {activeScreen === 'bestiary' && (
              <BestiaryView activeCampaignId={activeCampaignId} campaigns={visibleCampaigns} />
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
      <ToastProvider />
    </QueryClientProvider>
  );
}
