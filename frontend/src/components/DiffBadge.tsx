import React from 'react';

export type DiffBadgeStatus = 'added' | 'modified' | 'removed' | 'moved';

interface DiffBadgeProps {
  status: DiffBadgeStatus;
  /**
   * Etiqueta de canto para cartões (posição absoluta no topo direito; o cartão precisa ser `relative`).
   * Sem isso, a etiqueta fica em linha própria abaixo do nome.
   */
  floating?: boolean;
}

const LABELS: Record<DiffBadgeStatus, string> = {
  added: 'Novo',
  modified: 'Editado',
  removed: 'Removido',
  moved: 'Movido',
};

// Novo = verde, Removido = vermelho, Editado/Movido = dourado.
const STYLES: Record<DiffBadgeStatus, string> = {
  added: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  modified: 'bg-amber-500/20 text-secondary border-amber-500/30',
  removed: 'bg-red-500/20 text-red-400 border-red-500/30',
  moved: 'bg-amber-500/20 text-secondary border-amber-500/30',
};

const BADGE_CLASS =
  'inline-block border rounded-sm px-1 py-px text-[7px] leading-tight font-sans font-bold uppercase tracking-wider no-underline whitespace-nowrap';

/**
 * Etiqueta de alteração (Novo / Editado / Removido / Movido).
 * Em linha própria, o contêiner ocupa a linha inteira (`basis-full` em flex-wrap), então a
 * etiqueta nunca quebra nem deforma a coluna do nome.
 */
export default function DiffBadge({ status, floating = false }: DiffBadgeProps) {
  if (floating) {
    return <span className={`absolute top-2 right-2 ${BADGE_CLASS} ${STYLES[status]}`}>{LABELS[status]}</span>;
  }
  return (
    <span className="flex w-full basis-full mt-0.5">
      <span className={`${BADGE_CLASS} ${STYLES[status]}`}>{LABELS[status]}</span>
    </span>
  );
}
