import React from 'react';
import Toggle from './Toggle';
import { useViewModeMutation } from '../hooks/useViewModeMutation';

interface ViewRoleToggleProps {
  className?: string;
}

export default function ViewRoleToggle({ className = '' }: ViewRoleToggleProps) {
  const { currentRole, toggleViewMode } = useViewModeMutation();
  const isDM = currentRole === 'dm';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggleViewMode}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleViewMode();
        }
      }}
      className={`flex items-center justify-between gap-3 py-2 px-3 bg-surface-container-high/40 hover:bg-surface-container-high border border-outline-variant/40 transition-colors cursor-pointer select-none ${className}`}
      title={isDM ? "Alternar para visão de Jogador" : "Alternar para visão de Mestre"}
    >
      <div className="flex items-center gap-2.5 pointer-events-none">
        <span className="material-symbols-outlined text-base text-primary">
          {isDM ? 'shield_person' : 'person'}
        </span>
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-on-surface">
          {isDM ? 'Mestre' : 'Jogador'}
        </span>
      </div>

      <div className="pointer-events-none">
        <Toggle
          checked={isDM}
          onChange={() => {}}
          size="sm"
          title={isDM ? "Alternar para Jogador" : "Alternar para Mestre"}
        />
      </div>
    </div>
  );
}
