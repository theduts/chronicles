import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, User } from '../types';
import { api } from '../services/api';

export function useNoteMutations(user: User | null, token: string | null) {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await api.get<any[]>('/notes');
      return response.data.map((n) => ({
        id: String(n.id),
        meta: n.meta || n.title || 'Anotação',
        content: n.content || '',
        saveBtnId: `save-${n.id}`,
      }));
    },
    enabled: !!token && !!user,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: Note) => {
      const payload = {
        title: newNote.meta || 'Nova Anotação',
        content: newNote.content || ' ',
      };
      const response = await api.post('/notes', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: Note }) => {
      const payload = {
        title: note.meta || 'Anotação',
        content: note.content || ' ',
      };
      const response = await api.put(`/notes/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleSaveNote = (updatedNote: Note) => {
    if (updatedNote.id && !updatedNote.id.startsWith('note-')) {
      updateNoteMutation.mutate({ id: updatedNote.id, note: updatedNote });
    }
    queryClient.setQueryData<Note[]>(['notes'], (prev = []) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  };

  const handleAddNote = (newNote: Note) => {
    createNoteMutation.mutate(newNote);
    queryClient.setQueryData<Note[]>(['notes'], (prev = []) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    if (id && !id.startsWith('note-')) {
      deleteNoteMutation.mutate(id);
    }
    queryClient.setQueryData<Note[]>(['notes'], (prev = []) => prev.filter((n) => n.id !== id));
  };

  const handleImportNotes = (imported: Note[]) => {
    queryClient.setQueryData(['notes'], imported);
  };

  return {
    notes,
    isLoadingNotes,
    handleSaveNote,
    handleAddNote,
    handleDeleteNote,
    handleImportNotes,
  };
}
