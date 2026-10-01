import React, { useState, useEffect, useRef } from 'react';
import { ActiveScreen } from '../types';
import ViewRoleToggle from './ViewRoleToggle';

interface SidebarProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  user: { name: string; email: string; role?: 'player' | 'dm' };
  onOpenSettings: () => void;
  onToggleRole?: () => void;
}

export default function Sidebar({
  activeScreen,
  setActiveScreen,
  collapsed,
  setCollapsed,
  onLogout,
  user,
  onOpenSettings,
  onToggleRole,
}: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems: { id: ActiveScreen; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'História', icon: 'history_edu' },
    { id: 'chronicles', label: 'Crônicas', icon: 'auto_stories' },
    { id: 'campaigns', label: 'Campanhas', icon: 'map' },
    { id: 'characters', label: user.role === 'dm' ? 'Personagens' : 'Meus Personagens', icon: 'groups' },
    ...(user.role === 'dm' ? [
      { id: 'npcs' as ActiveScreen, label: 'NPCs', icon: 'assignment_ind' },
      { id: 'bestiary' as ActiveScreen, label: 'Bestiário', icon: 'skull' },
    ] : []),
    { id: 'notes', label: 'Anotações', icon: 'description' },
  ];

  return (
    <aside
      className={`
        hidden md:flex flex-col h-screen py-8 bg-surface-container-lowest border-r border-outline-variant
        transition-all duration-300 ease-in-out shrink-0 z-40 relative
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Sidebar Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-8 -right-3 w-6 h-6 bg-surface border border-outline-variant text-primary hover:text-on-surface rounded-none flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        <span className="material-symbols-outlined text-xs">
          {collapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      {/* Brand Header */}
      <div className={`px-4 mb-8 transition-opacity duration-200 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          {/* Sanguine Icon Box */}
          <div className="w-10 h-10 bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>
              book
            </span>
          </div>

          {!collapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <h1 className="font-serif text-xl text-primary font-bold tracking-widest leading-none">
                CHRONICLES
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeScreen === item.id || (item.id === 'characters' && activeScreen === 'character_editor') || (item.id === 'chronicles' && activeScreen === 'campaign_history');
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 cursor-pointer
                ${collapsed ? 'justify-center rounded-none' : 'rounded-none'}
                ${
                  isActive
                    ? 'bg-primary-container bg-opacity-15 text-primary border-l-2 border-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-l-2 border-transparent'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <span 
                className="material-symbols-outlined text-xl shrink-0"
                style={{ fontVariationSettings: isActive ? '"FILL" 1' : undefined }}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="font-sans text-xs font-bold tracking-wider uppercase">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div ref={containerRef} className="px-3 pt-6 border-t border-outline-variant/30 relative">
        {/* Rising Mini Modal */}
        {menuOpen && (
          <div className={collapsed 
            ? "absolute left-full bottom-2 ml-2 w-48 bg-surface-container border border-outline-variant shadow-2xl p-2 flex flex-col gap-1 z-50 rounded-none animate-fadeIn"
            : "absolute bottom-full left-3 right-3 mb-2 bg-surface-container border border-outline-variant shadow-2xl p-2 flex flex-col gap-1 z-50 rounded-none animate-fadeIn"
          }>
            {/* Switch Role View Toggle */}
            {onToggleRole && (
              <div className="border-b border-outline-variant/30 pb-3 mb-2">
                <ViewRoleToggle />
              </div>
            )}

            {/* Set active screen to settings and close menu */}
            <button
              onClick={() => {
                onOpenSettings();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer rounded-none"
            >
              <span className="material-symbols-outlined text-sm shrink-0">settings</span>
              <span>Configurações</span>
            </button>
            
            {/* Trigger logout and close menu */}
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold font-sans uppercase tracking-wider text-red-400 hover:bg-surface-container-high hover:text-red-300 transition-colors cursor-pointer border-t border-outline-variant/30 pt-2 rounded-none"
            >
              <span className="material-symbols-outlined text-sm shrink-0 text-red-500">logout</span>
              <span>Deslogar</span>
            </button>
          </div>
        )}

        {/* User Profile Item Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 cursor-pointer
            ${collapsed ? 'justify-center rounded-none' : 'rounded-none'}
            ${menuOpen ? 'bg-surface-container-high text-primary border-l-2 border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-l-2 border-transparent'}
          `}
          title={collapsed ? `${user.name} (${user.role === 'dm' ? 'Mestre' : 'Jogador'})` : undefined}
        >
          <span className="material-symbols-outlined text-xl shrink-0">
            account_circle
          </span>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-sans text-xs font-bold tracking-wider uppercase truncate max-w-[140px]">
                {user.name}
              </span>
              <span className="font-sans text-[8px] text-primary font-bold uppercase tracking-widest">
                {user.role === 'dm' ? 'Mestre' : 'Jogador'}
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
