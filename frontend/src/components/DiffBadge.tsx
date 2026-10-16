import React from 'react';

export type DiffBadgeStatus = 'added' | 'modified' | 'removed' | 'moved';

interface DiffBadgeProps {
  status: DiffBadgeStatus;
  /** "review": visão do Mestre analisando um pedido (tom dourado em vez de verde para itens novos/movidos). */
  tone?: 'default' | 'review';
}

const LABELS: Record<DiffBadgeStatus, string> = {
  added: 'Novo',
  modified: 'Editado',
  removed: 'Removido',
  moved: 'Movido',
};

const STYLES: Record<DiffBadgeStatus, string> = {
  added: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  modified: 'bg-amber-500/20 text-secondary border-amber-500/30',
  removed: 'bg-surface-container/40 text-red-400 border-red-500/30',
  moved: 'bg-amber-500/20 text-secondary border-amber-500/30',
};

const REVIEW_STYLE = 'bg-amber-500/20 text-secondary border-amber-500/30';

/**
 * Etiqueta de alteração (Novo / Editado / Removido / Movido) em linha própria, abaixo do nome.
 * O contêiner ocupa a linha inteira (`basis-full` em flex-wrap), então a etiqueta nunca quebra
 * nem deforma a coluna do nome.
 */
export default function DiffBadge({ status, tone = 'default' }: DiffBadgeProps) {
  const style = tone === 'review' && (status === 'added' || status === 'moved') ? REVIEW_STYLE : STYLES[status];
  return (
    <span className="flex w-full basis-full mt-0.5">
      <span
        className={`inline-block border rounded-sm px-1 py-px text-[7px] leading-tight font-sans font-bold uppercase tracking-wider no-underline whitespace-nowrap ${style}`}
      >
        {LABELS[status]}
      </span>
    </span>
  );
}
