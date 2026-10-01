import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../services/api';

export interface CampaignLoreItem {
  id: string;
  campaignId: string;
  category: 'deidade' | 'faccao' | 'geografia' | 'mapa' | 'galeria' | 'persona' | string;
  title: string;
  description?: string;
  imageUrl?: string;
  isVisible: boolean;
  data: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignLoreCreateInput {
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isVisible?: boolean;
  data?: Record<string, any>;
}

export function useLoreQuery(campaignId?: string) {
  return useQuery<CampaignLoreItem[]>({
    queryKey: ['lore', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const response = await api.get<CampaignLoreItem[]>(`/campaigns/${campaignId}/lore`);
      return response.data;
    },
    enabled: !!campaignId,
  });
}

export function useCreateLoreMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CampaignLoreCreateInput) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      const response = await api.post<CampaignLoreItem>(`/campaigns/${campaignId}/lore`, payload);
      return response.data;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
      toast.success(`Artigo "${newItem.title}" criado com sucesso!`);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
    },
  });
}

export function useUpdateLoreMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loreId, payload }: { loreId: string; payload: CampaignLoreCreateInput }) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      const response = await api.put<CampaignLoreItem>(`/campaigns/${campaignId}/lore/${loreId}`, payload);
      return response.data;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
      toast.success(`Artigo "${updatedItem.title}" atualizado com sucesso!`);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
    },
  });
}

export function useToggleLoreVisibilityMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loreId, isVisible }: { loreId: string; isVisible: boolean }) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      const response = await api.patch<CampaignLoreItem>(
        `/campaigns/${campaignId}/lore/${loreId}/visibility`,
        null,
        { params: { isVisible } }
      );
      return response.data;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
      toast.success(`Artigo "${item.title}" agora está ${item.isVisible ? 'visível para jogadores' : 'oculto (apenas Mestre)'}.`);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
    },
  });
}

export function useDeleteLoreMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loreId: string) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      await api.delete(`/campaigns/${campaignId}/lore/${loreId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
      toast.success('Artigo excluído com sucesso!');
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
    },
  });
}
