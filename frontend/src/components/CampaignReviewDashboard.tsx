import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Check, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { CharacterReviewTicket } from '../types';
import { useCampaignReviewTickets } from '../hooks/useReviewTickets';
import { useCharacterMutations } from '../hooks/useCharacterMutations';
import { ListRowSkeleton } from './ui/Skeleton';
import { ReviewTicketDiff, ReviewTicketStatusBadge, formatTicketDate } from './ReviewTicketDiff';
import { User } from '../types';

interface CampaignReviewDashboardProps {
  campaignId: string;
  user: User | null;
  token: string | null;
}

/** Central de Solicitações: moderação (PENDING) e auditoria (histórico) dos pedidos de análise da campanha. */
export default function CampaignReviewDashboard({ campaignId, user, token }: CampaignReviewDashboardProps) {
  const { data: tickets = [], isLoading, isRefetching, refetch } = useCampaignReviewTickets(campaignId, {
    refetchInterval: 10000,
  });
  const { approveCharacterMutation, rejectCharacterMutation } = useCharacterMutations(user, token, campaignId, 'dm');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  const pending = tickets.filter((t) => t.status === 'PENDING');
  const history = tickets.filter((t) => t.status !== 'PENDING');
  const isBusy = approveCharacterMutation.isPending || rejectCharacterMutation.isPending;

  const resolve = (ticket: CharacterReviewTicket, decision: 'approve' | 'reject') => {
    const mutation = decision === 'approve' ? approveCharacterMutation : rejectCharacterMutation;
    mutation.mutate(
      { campaignId, characterId: ticket.characterId, dmFeedback: feedbacks[ticket.id]?.trim() || undefined },
      {
        onSuccess: () => toast.success(decision === 'approve' ? 'Evolução da ficha aprovada!' : 'Alterações recusadas.'),
        onError: (error: any) =>
          toast.error(error?.response?.data?.detail || error?.response?.data?.message || 'Falha ao processar solicitação.'),
      }
    );
  };

  const renderTicket = (ticket: CharacterReviewTicket) => {
    const isOpen = expandedId === ticket.id || ticket.status === 'PENDING';
    return (
      <div key={ticket.id} className="bg-surface-container-low border border-outline-variant/40 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-outline">#{ticket.ticketNumber}</span>
              <h4 className="font-serif text-base font-bold text-on-surface truncate">{ticket.characterName}</h4>
              <ReviewTicketStatusBadge status={ticket.status} />
            </div>
            <p className="font-sans text-xs text-on-surface-variant">
              Solicitado por <strong>{ticket.playerName}</strong> em {formatTicketDate(ticket.createdAt)}
              {ticket.reviewedAt && <> • Resolvido por {ticket.reviewerName || 'Mestre'} em {formatTicketDate(ticket.reviewedAt)}</>}
            </p>
          </div>
          {ticket.status !== 'PENDING' && (
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
              className="flex items-center gap-1 text-xs font-sans font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary cursor-pointer"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Alterações
            </button>
          )}
        </div>

        {isOpen && <ReviewTicketDiff changes={ticket.changes} />}

        {ticket.dmFeedback && (
          <p className="text-xs font-sans text-on-surface-variant border-l-2 border-primary/60 pl-3 italic">
            “{ticket.dmFeedback}”
          </p>
        )}

        {ticket.status === 'PENDING' && (
          <div className="space-y-3 pt-1">
            <textarea
              value={feedbacks[ticket.id] ?? ''}
              onChange={(e) => setFeedbacks((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
              maxLength={2000}
              rows={2}
              placeholder="Justificativa para o jogador (opcional)"
              className="w-full bg-background border border-outline-variant/40 focus:border-primary outline-none text-sm text-on-surface p-2 resize-y"
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => resolve(ticket, 'reject')}
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-white transition-all text-xs font-sans font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Recusar
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => resolve(ticket, 'approve')}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all text-xs font-sans font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Aprovar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

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
              Revise, aprove ou recuse as alterações de ficha enviadas pelos jogadores desta campanha.
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

      {pending.length > 0 && <div className="space-y-4">{pending.map(renderTicket)}</div>}

      {history.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-sans text-micro text-primary tracking-widest font-bold uppercase">Histórico</h4>
          <div className="space-y-3">{history.map(renderTicket)}</div>
        </div>
      )}
    </section>
  );
}
