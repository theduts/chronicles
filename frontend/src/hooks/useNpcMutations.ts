import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../services/api';

export interface NpcCombatAttributes {
  CON?: number;
  FR?: number;
  FOR?: number;
  DEX?: number;
  AGI?: number;
  INT?: number;
  WILL?: number;
  PER?: number;
  CAR?: number;
  [key: string]: any;
}

export interface NpcAbility {
  habilidade?: string;
  name?: string;
  descricao_habilidade?: string;
  descricao?: string;
  description?: string;
}

export interface NpcCombatData {
  pv?: number;
  ip?: number;
  deslocamento?: number | string;
  atributos?: NpcCombatAttributes;
  attributes?: NpcCombatAttributes;
  habilidades?: NpcAbility[];
  abilities?: NpcAbility[];
  pericias?: any[];
  vantagens?: string[] | string;
  desvantagens?: string[] | string;
  equipamentos?: string[] | string;
  loot?: string[] | string;
  observacoes?: string;
  [key: string]: any;
}

export interface CampaignNpcItem {
  id: string;
  campaignId: string;
  name: string;
  race?: string;
  occupation?: string;
  description?: string;
  notes?: string;
  portraitUrl?: string;
  image?: string; // alias para compatibilidade com a UI
  isPersona?: boolean;
  isTemplate?: boolean;
  data?: NpcCombatData;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignNpcInput {
  name: string;
  race?: string;
  occupation?: string;
  description?: string;
  notes?: string;
  portraitUrl?: string;
  isPersona?: boolean;
  isTemplate?: boolean;
  data?: NpcCombatData;
}

export interface SystemNpcTemplate {
  id: string;
  nome_template: string;
  tipo?: string;
  categoria?: string;
  nivel?: number;
  pv: number;
  ip: number;
  deslocamento?: number;
  atributos: NpcCombatAttributes;
  atributos_derivados?: Record<string, any>;
  descricao?: string;
  habilidades?: NpcAbility[];
  vantagens?: string[];
  desvantagens?: string[];
  pericias?: any[];
  combate?: any;
  equipamentos?: string[];
  observacoes?: string;
}

// API functions
export async function getCampaignNpcs(
  campaignId: string,
  params?: { personaOnly?: boolean; templateOnly?: boolean }
): Promise<CampaignNpcItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.personaOnly) searchParams.set('personaOnly', 'true');
  if (params?.templateOnly) searchParams.set('templateOnly', 'true');
  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const response = await api.get<CampaignNpcItem[]>(`/campaigns/${campaignId}/npcs${queryStr}`);
  return response.data.map((npc) => ({
    ...npc,
    image: npc.portraitUrl || npc.image || '',
  }));
}

export async function createCampaignNpc(campaignId: string, payload: CampaignNpcInput): Promise<CampaignNpcItem> {
  const response = await api.post<CampaignNpcItem>(`/campaigns/${campaignId}/npcs`, payload);
  return response.data;
}

export async function updateCampaignNpc(
  campaignId: string,
  npcId: string,
  payload: CampaignNpcInput
): Promise<CampaignNpcItem> {
  const response = await api.put<CampaignNpcItem>(`/campaigns/${campaignId}/npcs/${npcId}`, payload);
  return response.data;
}

export async function deleteCampaignNpc(campaignId: string, npcId: string): Promise<string> {
  await api.delete(`/campaigns/${campaignId}/npcs/${npcId}`);
  return npcId;
}

export async function promoteCampaignNpc(campaignId: string, npcId: string): Promise<CampaignNpcItem> {
  const response = await api.post<CampaignNpcItem>(`/campaigns/${campaignId}/npcs/${npcId}/promote`);
  return response.data;
}

export async function getSystemNpcTemplates(): Promise<SystemNpcTemplate[]> {
  const response = await api.get<SystemNpcTemplate[]>('/rules/npc_templates');
  return response.data;
}

// React Query Hooks
export function useCampaignNpcs(
  campaignId?: string,
  params?: { personaOnly?: boolean; templateOnly?: boolean }
) {
  return useQuery<CampaignNpcItem[]>({
    queryKey: ['campaign-npcs', campaignId, params?.personaOnly, params?.templateOnly],
    queryFn: async () => {
      if (!campaignId) return [];
      return getCampaignNpcs(campaignId, params);
    },
    enabled: !!campaignId,
  });
}

export function useSystemNpcTemplates() {
  return useQuery<SystemNpcTemplate[]>({
    queryKey: ['system-npc-templates'],
    queryFn: getSystemNpcTemplates,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}

export function useCreateNpcMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CampaignNpcInput) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      return createCampaignNpc(campaignId, payload);
    },
    onSuccess: (newNpc) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
      if (newNpc.isPersona) {
        queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
      }
      toast.success(newNpc.isTemplate ? `Template "${newNpc.name}" salvo com sucesso!` : `NPC "${newNpc.name}" criado com sucesso!`);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
    },
  });
}

export function useUpdateNpcMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ npcId, payload }: { npcId: string; payload: CampaignNpcInput }) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      return updateCampaignNpc(campaignId, npcId, payload);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
      if (updated.isPersona) {
        queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
      }
      toast.success(`NPC "${updated.name}" atualizado com sucesso!`);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
    },
  });
}

export function useDeleteNpcMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (npcId: string) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      return deleteCampaignNpc(campaignId, npcId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
      toast.success('NPC excluído com sucesso!');
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
    },
  });
}

export function useBulkDeleteNpcsMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (npcIds: string[]) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      await Promise.all(npcIds.map((id) => deleteCampaignNpc(campaignId, id)));
      return npcIds;
    },
    onSuccess: (deletedIds) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
      toast.success(
        deletedIds.length === 1
          ? 'Template removido com sucesso!'
          : `${deletedIds.length} templates removidos com sucesso!`
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
      toast.error('Erro ao remover templates selecionados.');
    },
  });
}

export function usePromoteNpcMutation(campaignId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (npcId: string) => {
      if (!campaignId) throw new Error('ID da campanha ausente');
      return promoteCampaignNpc(campaignId, npcId);
    },
    onSuccess: (promoted) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
      toast.success(`"${promoted.name}" agora é uma Persona oficial na História da Campanha!`);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
    },
  });
}
