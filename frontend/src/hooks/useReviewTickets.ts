import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { CharacterReviewTicket } from '../types';

export const REVIEW_TICKETS_KEY = ['review-tickets'] as const;

/** Histórico de pedidos de análise do jogador logado. */
export function useMyReviewTickets(enabled = true) {
  return useQuery<CharacterReviewTicket[]>({
    queryKey: [...REVIEW_TICKETS_KEY, 'mine'],
    queryFn: async () => {
      const response = await api.get<CharacterReviewTicket[]>('/users/me/review-tickets');
      return response.data;
    },
    enabled,
  });
}

/** Central de solicitações da campanha (somente Mestre). */
export function useCampaignReviewTickets(
  campaignId: string | null | undefined,
  options: { enabled?: boolean; refetchInterval?: number } = {}
) {
  const { enabled = true, refetchInterval } = options;
  return useQuery<CharacterReviewTicket[]>({
    queryKey: [...REVIEW_TICKETS_KEY, 'campaign', campaignId],
    queryFn: async () => {
      const response = await api.get<CharacterReviewTicket[]>(`/campaigns/${campaignId}/review-tickets`);
      return response.data;
    },
    enabled: enabled && !!campaignId && !campaignId.startsWith('camp_'),
    refetchInterval,
  });
}
