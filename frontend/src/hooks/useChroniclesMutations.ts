import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../services/api';

export interface CampaignChronicleItem {
  id: string;
  campaignId: string;
  authorId: string;
  authorName: string;
  sessionNumber: number;
  title: string;
  sessionDate: string;
  location?: string;
  mission?: string;
  illustrationUrl?: string;
  narrative: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignChronicleCreateInput {
  sessionNumber: number;
  title: string;
  sessionDate?: string;
  location?: string;
  mission?: string;
  illustrationUrl?: string;
  narrative: string;
}

export function useChroniclesQuery(campaignId?: string) {
  return useQuery<CampaignChronicleItem[]>({
    queryKey: ['chronicles', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const response = await api.get<CampaignChronicleItem[]>(`/campaigns/${campaignId}/chronicles`);
      return response.data;
    },
    enabled: !!campaignId,
  });
}

export function useCreateChronicleMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CampaignChronicleCreateInput) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      const response = await api.post<CampaignChronicleItem>(`/campaigns/${campaignId}/chronicles`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chronicles', campaignId] });
      toast.success(`Crônica da Sessão ${data.sessionNumber} criada com sucesso!`);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicles', campaignId] });
    },
  });
}

export function useUpdateChronicleMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chronicleId, payload }: { chronicleId: string; payload: CampaignChronicleCreateInput }) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      const response = await api.put<CampaignChronicleItem>(`/campaigns/${campaignId}/chronicles/${chronicleId}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chronicles', campaignId] });
      toast.success(`Crônica "${data.title}" atualizada com sucesso!`);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicles', campaignId] });
    },
  });
}

export function useDeleteChronicleMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chronicleId: string) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      await api.delete(`/campaigns/${campaignId}/chronicles/${chronicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicles', campaignId] });
      toast.success('Crônica excluída com sucesso!');
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicles', campaignId] });
    },
  });
}
