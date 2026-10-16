import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, ChevronRight } from 'lucide-react';
import { CharacterReviewTicket } from '../types';
import { useCampaignReviewTickets } from '../hooks/useReviewTickets';
import { ListRowSkeleton } from './ui/Skeleton';
import { ReviewTicketStatusBadge, formatTicketDate } from './ReviewTicketDiff';
import ReviewTicketModal from './ReviewTicketModal';

interface CampaignReviewDashboardProps {
  campaignId: string;
}

/** Central de Solicitações: moderação (PENDING) e auditoria (histórico) dos pedidos de análise da campanha. */
export default function CampaignReviewDashboard({ campaignId }: CampaignReviewDashboardProps) {
  const { data: tickets = [], isLoading, isRefetching, refetch } = useCampaignReviewTickets(campaignId, {
    refetchInterval: 10000,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;
  const pending = tickets.filter((t) => t.status === 'PENDING');
  const history = tickets.filter((t) => t.status !== 'PENDING');

  const renderRow = (ticket: CharacterReviewTicket) => (
    <button
      key={ticket.id}
      type="button"
      onClick={() => setSelectedId(ticket.id)}
      className="w-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 hover:border-primary/60 p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
    >
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-outline">#{ticket.ticketNumber}</span>
          <h4 className="font-serif text-base font-bold text-on-surface truncate">{ticket.characterName}</h4>
          <ReviewTicketStatusBadge status={ticket.status} />
        </div>
        <p className="font-sans text-xs text-on-surface-variant">
          {ticket.playerName} • {formatTicketDate(ticket.createdAt)}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-on-surface-variant shrink-0" />
    </button>
  );

  return (
    <section className="bg-surface-container border border-outline-variant/60 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 text-primary border border-primary/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-on-surface">Central de Solicitações</h3>
            <p className="font-sans text-xs text-on-surface-variant">
              Acompanhe as alterações de ficha enviadas pelos jogadores desta campanha. A aprovação é feita na própria ficha.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 px-3 py-2 border border-outline-variant/60 text-xs font-sans font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:border-primary transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <span className="px-3 py-1.5 bg-primary-container text-on-primary-container text-xs font-sans font-bold uppercase tracking-wider">
            {pending.length} Pendente{pending.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      )}

      {!isLoading && tickets.length === 0 && (
        <div className="py-12 border border-dashed border-outline-variant/40 flex flex-col items-center text-center p-6 space-y-3">
          <ShieldAlert className="w-10 h-10 text-on-surface-variant/40" />
          <h4 className="font-serif text-base font-bold text-on-surface uppercase tracking-wider">Nenhuma solicitação registrada</h4>
          <p className="font-sans text-xs text-on-surface-variant max-w-md">
            Quando os jogadores enviarem alterações de ficha, os pedidos aparecerão aqui.
          </p>
        </div>
      )}

      {pending.length > 0 && <div className="space-y-3">{pending.map(renderRow)}</div>}

      {history.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-sans text-micro text-primary tracking-widest font-bold uppercase">Histórico</h4>
          <div className="space-y-3">{history.map(renderRow)}</div>
        </div>
      )}

      <ReviewTicketModal ticket={selected} onClose={() => setSelectedId(null)} showPlayer />
    </section>
  );
}
