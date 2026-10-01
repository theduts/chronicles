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
      onClick={toggleViewMode}
      className={`flex items-center justify-between gap-3 py-2 px-3 bg-surface-container-high/40 hover:bg-surface-container-high border border-outline-variant/40 transition-colors cursor-pointer select-none ${className}`}
      title="Alternar entre visão de Mestre e visão de Jogador"
    >
      <div className="flex items-center gap-2.5">
        <span className="material-symbols-outlined text-base text-primary">
          {isDM ? 'shield_person' : 'person'}
        </span>
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-on-surface">
          {isDM ? 'Mestre' : 'Jogador'}
        </span>
      </div>

      <Toggle
        checked={isDM}
        onChange={() => toggleViewMode()}
        size="sm"
        title={isDM ? "Alternar para Jogador" : "Alternar para Mestre"}
      />
    </div>
  );
}
