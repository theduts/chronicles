import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert, Check, X, User, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Character } from '../types';

interface CampaignDMReviewProps {
  campaignId: string;
  onApproveSuccess?: (charId: string) => void;
  onRejectSuccess?: (charId: string) => void;
}

export default function CampaignDMReview({
  campaignId,
  onApproveSuccess,
  onRejectSuccess,
}: CampaignDMReviewProps) {
  const queryClient = useQueryClient();
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Poll characters periodically so the DM gets real-time submissions
  const { data: characters = [], isLoading, isRefetching, refetch } = useQuery<Character[]>({
    queryKey: ['campaign-characters', campaignId],
    queryFn: async () => {
      // In Spring Boot, characters can be fetched from /characters
      const response = await api.get<Character[]>('/characters');
      return response.data;
    },
    refetchInterval: 10000,
  });

  const pendingCharacters = characters.filter((c) => !!c.isPendingDMReview);

  const approveMutation = useMutation({
    mutationFn: async (characterId: string) => {
      const response = await api.post(`/campaigns/${campaignId}/approve-character/${characterId}`);
      return response.data;
    },
    onSuccess: (_, characterId) => {
      setFeedbackMessage({ text: 'Evolução da ficha aprovada com sucesso!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      onApproveSuccess?.(characterId);
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Falha ao aprovar ficha.';
      setFeedbackMessage({ text: msg, type: 'error' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
  });

  const handleApprove = (characterId: string) => {
    approveMutation.mutate(characterId);
  };

  const handleReject = (characterId: string) => {
    setFeedbackMessage({ text: 'Alterações pendentes recusadas.', type: 'success' });
    onRejectSuccess?.(characterId);
    queryClient.invalidateQueries({ queryKey: ['campaign-characters', campaignId] });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="bg-surface-container border border-outline-variant/60 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 text-primary border border-primary/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-on-surface">
              Painel de Aprovação do Mestre
            </h3>
            <p className="font-sans text-xs text-on-surface-variant">
              Revise e autorize as solicitações de evolução de fichas enviadas pelos jogadores.
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
            <span>Atualizar</span>
          </button>
          <span className="px-3 py-1.5 bg-primary-container text-on-primary-container text-xs font-sans font-bold uppercase tracking-wider">
            {pendingCharacters.length} Pendente{pendingCharacters.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div
          className={`p-4 text-xs font-sans tracking-wide rounded-none border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
              : 'bg-red-950/40 border-primary text-red-200'
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 text-center font-sans text-xs uppercase tracking-widest text-on-surface-variant">
          Carregando fichas pendentes da campanha...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pendingCharacters.length === 0 && (
        <div className="py-12 border border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <ShieldAlert className="w-10 h-10 text-on-surface-variant/40" />
          <h4 className="font-serif text-base font-bold text-on-surface uppercase tracking-wider">
            Nenhuma ficha aguardando revisão
          </h4>
          <p className="font-sans text-xs text-on-surface-variant max-w-md">
            Quando os jogadores realizarem evoluções de atributos, perícias ou pontos de status, as propostas aparecerão aqui para sua validação.
          </p>
        </div>
      )}

      {/* List of pending characters */}
      {!isLoading && pendingCharacters.length > 0 && (
        <div className="space-y-4">
          {pendingCharacters.map((char) => (
            <div
              key={char.id}
              className="bg-surface-container-low border border-amber-500/50 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-surface-container border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                  {char.portraitUrl ? (
                    <img src={char.portraitUrl} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-on-surface-variant/40" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-serif text-lg font-bold text-on-surface">{char.name}</h4>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-sans font-bold uppercase tracking-wider">
                      Evolução Pendente
                    </span>
                  </div>

                  <p className="font-sans text-xs text-on-surface-variant">
                    {char.race || 'Sem Raça'} • {char.classKit || 'Aventureiro'} • Nível {char.level || 1} ({char.xp || 0} XP)
                  </p>

                  {char.pendingChanges && (
                    <p className="font-sans text-[11px] text-on-surface-variant/80 italic">
                      Modificações propostas registradas pelo jogador aguardando consolidação.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  disabled={approveMutation.isPending}
                  onClick={() => handleReject(char.id)}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-white transition-all text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Recusar</span>
                </button>

                <button
                  type="button"
                  disabled={approveMutation.isPending}
                  onClick={() => handleApprove(char.id)}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all text-xs font-sans font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
