import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Character, User } from '../types';
import { api } from '../services/api';

export function useCharacterMutations(user: User | null, token: string | null, activeCampaignId: string) {
  const queryClient = useQueryClient();

  const { data: characters = [], isLoading: isLoadingCharacters, refetch: refetchCharacters } = useQuery<Character[]>({
    queryKey: ['characters'],
    queryFn: async () => {
      const response = await api.get<Character[]>('/characters');
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

  const handleSaveCharacter = (updatedChar: Character, onSaved?: () => void) => {
    const isExisting = characters.some((c) => c.id === updatedChar.id);
    const isDM = user?.role === 'dm' || user?.role === 'ROLE_ADMIN';

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
    queryClient.setQueryData<Character[]>(['characters'], (prev = []) => {
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
    queryClient.setQueryData<Character[]>(['characters'], (prev = []) => {
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

  const handleImportCharacters = (imported: Character[]) => {
    queryClient.setQueryData(['characters'], imported);
  };

  return {
    characters,
    isLoadingCharacters,
    refetchCharacters,
    createCharacterMutation,
    updateCharacterMutation,
    submitReviewMutation,
    deleteCharacterMutation,
    approveCharacterMutation,
    rejectCharacterMutation,
    handleSaveCharacter,
    handleSilentUpdateCharacter,
    handleDeleteCharacter,
    handleApproveCharacter,
    handleRejectCharacter,
    handleImportCharacters,
  };
}
