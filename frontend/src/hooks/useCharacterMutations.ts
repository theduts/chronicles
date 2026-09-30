import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Character, User } from '../types';
import { api } from '../services/api';
import * as errorUtils from './useApiErrorToast';
import { toast } from 'sonner';

export function useCharacterMutations(
  user: User | null,
  token: string | null,
  activeCampaignId: string,
  userRole: 'player' | 'dm' = 'player'
) {
  const queryClient = useQueryClient();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const clearFieldErrors = () => setFieldErrors({});

  const { data: characters = [], isLoading: isLoadingCharacters, refetch: refetchCharacters } = useQuery<Character[]>({
    queryKey: ['characters', userRole],
    queryFn: async () => {
      const response = await api.get<Character[]>('/characters', {
        params: { role: userRole }
      });
      return response.data;
    },
    enabled: !!token && !!user,
  });

  const createCharacterMutation = useMutation({
    mutationFn: async (newChar: Character) => {
      const response = await api.post<Character>('/characters', newChar);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
    onError: (err: unknown) => {
      const fieldMap = errorUtils.extractFieldErrors(err);
      if (fieldMap) {
        setFieldErrors(fieldMap);
      } else {
        errorUtils.showApiErrorToast(err);
      }
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, char }: { id: string; char: Character }) => {
      const response = await api.put<Character>(`/characters/${id}`, char);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
    onError: (err: unknown) => {
      const fieldMap = errorUtils.extractFieldErrors(err);
      if (fieldMap) {
        setFieldErrors(fieldMap);
      } else {
        errorUtils.showApiErrorToast(err);
      }
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ id, char }: { id: string; char: Character }) => {
      const response = await api.post<Character>(`/characters/${id}/submit-review`, char);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
    onError: (err: unknown) => {
      const fieldMap = errorUtils.extractFieldErrors(err);
      if (fieldMap) {
        setFieldErrors(fieldMap);
      } else {
        errorUtils.showApiErrorToast(err);
      }
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/characters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  const approveCharacterMutation = useMutation({
    mutationFn: async ({ campaignId, characterId }: { campaignId: string; characterId: string }) => {
      const response = await api.post(`/campaigns/${campaignId}/approve-character/${characterId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  const rejectCharacterMutation = useMutation({
    mutationFn: async ({ campaignId, characterId }: { campaignId: string; characterId: string }) => {
      const response = await api.post(`/campaigns/${campaignId}/reject-character/${characterId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
    },
  });

  const levelUpCharacterMutation = useMutation({
    mutationFn: async ({ id, char }: { id: string; char?: Partial<Character> }) => {
      const response = await api.post(`/characters/${id}/level-up`, char);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-characters'] });
      toast.success(`Personagem evoluído com sucesso para o Nível ${data.level}!`);
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Falha ao evoluir o personagem.';
      toast.error(msg);
    },
  });

  const handleSaveCharacter = (updatedChar: Character, onSaved?: () => void) => {
    clearFieldErrors();
    const isExisting = characters.some((c) => c.id === updatedChar.id);
    const isDM = userRole === 'dm' || user?.role === 'ROLE_ADMIN';

    if (isExisting && updatedChar.id) {
      if (isDM) {
        updateCharacterMutation.mutate({ id: updatedChar.id, char: updatedChar });
      } else {
        submitReviewMutation.mutate({ id: updatedChar.id, char: updatedChar });
      }
    } else {
      createCharacterMutation.mutate(updatedChar);
    }

    // Optimistic cache update
    queryClient.setQueryData<Character[]>(['characters', userRole], (prev = []) => {
      const idx = prev.findIndex((c) => c.id === updatedChar.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...updatedChar,
          isPendingDMReview: isDM ? false : true,
        };
        return copy;
      }
      return [updatedChar, ...prev];
    });

    onSaved?.();
  };

  const handleSilentUpdateCharacter = (updatedChar: Character) => {
    queryClient.setQueryData<Character[]>(['characters', userRole], (prev = []) => {
      const idx = prev.findIndex((c) => c.id === updatedChar.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = updatedChar;
        return copy;
      }
      return prev;
    });
  };

  const handleDeleteCharacter = (id: string) => {
    deleteCharacterMutation.mutate(id);
    queryClient.setQueryData<Character[]>(['characters'], (prev = []) => prev.filter((c) => c.id !== id));
  };

  const handleApproveCharacter = (id: string) => {
    const char = characters.find((c) => c.id === id);
    const campaignId = char?.campaignId || activeCampaignId;
    if (campaignId) {
      approveCharacterMutation.mutate({ campaignId, characterId: id });
    }
  };

  const handleRejectCharacter = (id: string) => {
    const char = characters.find((c) => c.id === id);
    const campaignId = char?.campaignId || activeCampaignId;
    if (campaignId) {
      rejectCharacterMutation.mutate({ campaignId, characterId: id });
    }
  };

  const handleLevelUpCharacter = (id: string, updatedChar?: Character, onComplete?: () => void) => {
    levelUpCharacterMutation.mutate(
      { id, char: updatedChar },
      {
        onSuccess: () => {
          onComplete?.();
        },
      }
    );
  };

  const handleImportCharacters = (imported: Character[]) => {
    queryClient.setQueryData(['characters'], imported);
  };

  return {
    characters,
    isLoadingCharacters,
    fieldErrors,
    clearFieldErrors,
    refetchCharacters,
    createCharacterMutation,
    updateCharacterMutation,
    submitReviewMutation,
    deleteCharacterMutation,
    approveCharacterMutation,
    rejectCharacterMutation,
    levelUpCharacterMutation,
    handleSaveCharacter,
    handleSilentUpdateCharacter,
    handleDeleteCharacter,
    handleApproveCharacter,
    handleRejectCharacter,
    handleLevelUpCharacter,
    handleImportCharacters,
  };
}
