import React from 'react';
import { ClipboardList } from 'lucide-react';
import Modal from './Modal';
import { CharacterReviewTicket } from '../types';
import { ReviewTicketDiff, ReviewTicketStatusBadge, formatTicketDate } from './ReviewTicketDiff';

interface ReviewTicketModalProps {
  ticket: CharacterReviewTicket | null;
  onClose: () => void;
  /** Conteúdo extra abaixo do diff (ex.: campo de justificativa do Mestre). */
  children?: React.ReactNode;
  /** Rodapé fixo (ex.: botões Aprovar / Recusar). */
  footer?: React.ReactNode;
  /** Exibe o nome do jogador (visão do Mestre). */
  showPlayer?: boolean;
}

/** Detalhe de um pedido de análise: metadados, retorno do Mestre e tabela de alterações. */
export default function ReviewTicketModal({ ticket, onClose, children, footer, showPlayer = false }: ReviewTicketModalProps) {
  return (
    <Modal
      isOpen={!!ticket}
      onClose={onClose}
      title={ticket ? `Pedido #${ticket.ticketNumber} • ${ticket.characterName}` : ''}
      icon={<ClipboardList className="w-5 h-5 text-primary" />}
      maxWidth="max-w-4xl"
      className="max-sm:h-[96dvh]! max-sm:max-h-[96dvh]!"
      bodyClassName="space-y-4 flex-1 overflow-y-auto custom-scrollbar px-1 sm:px-2"
      footer={footer}
    >
      {ticket && (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-sans text-on-surface-variant">
            <ReviewTicketStatusBadge status={ticket.status} />
            {showPlayer && <span>Jogador: <strong className="text-on-surface">{ticket.playerName}</strong></span>}
            <span>Enviado em {formatTicketDate(ticket.createdAt)}</span>
            {ticket.reviewedAt && (
              <span>Resolvido por {ticket.reviewerName || 'Mestre'} em {formatTicketDate(ticket.reviewedAt)}</span>
            )}
          </div>

          {ticket.dmFeedback && (
            <p className="text-sm font-sans text-on-surface-variant border-l-2 border-primary/60 pl-3 italic">
              Mestre: “{ticket.dmFeedback}”
            </p>
          )}

          <ReviewTicketDiff changes={ticket.changes} />

          {children}
        </>
      )}
    </Modal>
  );
}
