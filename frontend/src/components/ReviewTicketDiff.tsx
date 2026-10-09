import React from 'react';
import { ReviewTicketChanges, ReviewTicketStatus } from '../types';

const isLeaf = (node: unknown): node is { last: unknown; new: unknown } =>
  !!node && typeof node === 'object' && 'last' in node && 'new' in node;

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

interface DiffRow {
  path: string;
  last: unknown;
  next: unknown;
}

function flatten(changes: ReviewTicketChanges | undefined, prefix: string[] = []): DiffRow[] {
  if (!changes) return [];
  return Object.entries(changes).flatMap(([key, node]) => {
    const path = [...prefix, key];
    if (isLeaf(node)) return [{ path: path.join(' › '), last: node.last, next: node.new }];
    return flatten(node as ReviewTicketChanges, path);
  });
}

export function ReviewTicketDiff({ changes }: { changes?: ReviewTicketChanges }) {
  const rows = flatten(changes);

  if (rows.length === 0) {
    return <p className="text-caption text-on-surface-variant italic">Nenhuma alteração registrada neste pedido.</p>;
  }

  return (
    <div className="border border-outline-variant/30 divide-y divide-outline-variant/20 max-h-64 overflow-y-auto custom-scrollbar">
      {rows.map((row) => (
        <div key={row.path} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-1 px-3 py-2 text-xs">
          <span className="font-sans font-bold text-on-surface-variant break-words">{row.path}</span>
          <span className="text-red-300/90 line-through decoration-red-300/40 break-words">{formatValue(row.last)}</span>
          <span className="text-emerald-300 font-semibold break-words">{formatValue(row.next)}</span>
        </div>
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<ReviewTicketStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-secondary-container text-on-secondary-container border-secondary' },
  APPROVED: { label: 'Aprovada', className: 'bg-tertiary-container text-on-tertiary-container border-tertiary' },
  REJECTED: { label: 'Rejeitada', className: 'bg-red-950/60 text-red-200 border-red-500/60' },
};

export function ReviewTicketStatusBadge({ status }: { status: ReviewTicketStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span className={`text-micro font-bold font-sans uppercase px-2 py-0.5 tracking-wider border ${className}`}>
      {label}
    </span>
  );
}

export const formatTicketDate = (iso?: string | null): string =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
