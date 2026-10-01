import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

export function useViewModeMutation() {
  const { viewRole, setViewRole } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const toggleViewMode = useCallback(() => {
    // 1. Optimistic UI update
    const previousMode = viewRole;
    const nextMode = viewRole === 'player' ? 'dm' : 'player';
    
    setViewRole(nextMode);
    console.debug(`[ViewMode] Optimistic update: ${previousMode} -> ${nextMode}. Queuing PATCH /api/users/me/view-mode (300ms debounce)`);

    // 2. Clear pending timeout and abort previous request if any
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 3. Setup new AbortController
    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    // 4. Debounce the API call
    debounceRef.current = setTimeout(async () => {
      const payload = {
        mode: nextMode.toUpperCase(), // 'PLAYER' or 'DM'
      };

      try {
        console.debug('[ViewMode] Dispatching PATCH /api/users/me/view-mode:', payload);

        await api.patch('/users/me/view-mode', payload, {
          signal: currentAbortController.signal,
        });

        console.debug('[ViewMode] PATCH /api/users/me/view-mode completed successfully:', payload);
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.message === 'canceled') {
          console.debug('[ViewMode] Request aborted by subsequent toggle, ignoring error.');
          return;
        }

        console.error('[ViewMode] Request failed:', error);

        // Revert the state
        setViewRole(previousMode);

        if (error.response?.status === 429) {
          toast.error("Calma ae! Que indecisão é essa? Esperar esfriar primeiro!");
        } else {
          toast.error("Erro ao atualizar o modo de visualização.");
        }
      }
    }, 300);
  }, [viewRole, setViewRole]);

  return { toggleViewMode, currentRole: viewRole };
}
