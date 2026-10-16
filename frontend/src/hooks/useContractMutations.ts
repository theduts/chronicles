import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../services/api';

export type ContractStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
export type ContractCurrency = 'PO' | 'PP' | 'PB';

export interface Contract {
  id: string;
  campaignId: string;
  createdById: string;
  title: string;
  description?: string;
  status: ContractStatus;
  hasReward: boolean;
  rewardValue?: number | null;
  currency?: ContractCurrency | null;
  rewardItem?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractInput {
  title: string;
  description?: string;
  status?: ContractStatus;
  hasReward: boolean;
  rewardValue?: number | null;
  currency?: ContractCurrency | null;
  rewardItem?: string | null;
}

export function useContractsQuery(campaignId?: string) {
  return useQuery<Contract[]>({
    queryKey: ['contracts', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const response = await api.get<Contract[]>('/contracts', { params: { campaignId } });
      return response.data;
    },
    enabled: !!campaignId,
  });
}

export function useCreateContractMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ContractInput) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      const response = await api.post<Contract>('/contracts', { ...payload, campaignId });
      return response.data;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', campaignId] });
      toast.success(`Contrato "${item.title}" registrado com sucesso!`);
    },
    onError: () => {
      toast.error('Erro ao registrar contrato.');
    },
  });
}

export function useUpdateContractMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ContractInput }) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      const response = await api.put<Contract>(`/contracts/${id}`, { ...payload, campaignId });
      return response.data;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', campaignId] });
      toast.success(`Contrato "${item.title}" atualizado com sucesso!`);
    },
    onError: () => {
      toast.error('Erro ao atualizar contrato.');
    },
  });
}

export function useDeleteContractMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts', campaignId] });
      toast.success('Contrato removido com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover contrato.');
    },
  });
}
