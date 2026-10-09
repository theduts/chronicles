import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from './common/PageHeader';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Calendar, MapPin, Eye, BookOpen, Clock, Heart, Edit3, Trash2, Upload } from 'lucide-react';
import CustomSelect from './CustomSelect';
import Modal from './Modal';
import { AddButton, SaveButton } from './ActionButtons';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ImageWithFallback from './ImageWithFallback';
import {
  useChroniclesQuery,
  useCreateChronicleMutation,
  useUpdateChronicleMutation,
  useDeleteChronicleMutation,
} from '../hooks/useChroniclesMutations';

export const toRoman = (num: number): string => {
  const lookup: [string, number][] = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let roman = '';
  let n = num;
  for (const [letter, value] of lookup) {
    while (n >= value) {
      roman += letter;
      n -= value;
    }
  }
  return roman || 'I';
};

function toIsoDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }
  return undefined;
}

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${parseInt(day, 10)} de ${monthName}, ${year}`;
  }
  return dateStr;
}

export interface ChronicleSession {
  id: string;
  session: string; // e.g. "SESSÃO I"
  rawSessionNumber?: number;
  title: string;
  location: string;
  date: string;
  desc: string;
  fullText: string;
  image: string;
  danger: 'Baixo' | 'Médio' | 'Alto' | 'Extremo';
  majorEvent: string;
}

const INITIAL_CHRONICLES: ChronicleSession[] = [];

interface ChroniclesViewProps {
  userRole?: 'player' | 'dm';
  onNavigateToHistory?: () => void;
  onNavigateToCampaigns?: () => void;
  campaignId?: string;
  activeCampaign?: any;
}

export default function ChroniclesView({ userRole = 'player', onNavigateToHistory, onNavigateToCampaigns, campaignId, activeCampaign }: ChroniclesViewProps) {
  // Server-state queries & mutations (React Query)
  const { data: dbChronicles = [], isLoading } = useChroniclesQuery(campaignId);
  const createMutation = useCreateChronicleMutation(campaignId);
  const updateMutation = useUpdateChronicleMutation(campaignId);
  const deleteMutation = useDeleteChronicleMutation(campaignId);

  // Local fallback state (used when offline or without active campaignId)
  const [localChronicles, setLocalChronicles] = useState<ChronicleSession[]>(() => {
    try {
      const saved = localStorage.getItem('daemon_chronicles_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && c.id && !c.id.startsWith('chronicle-'));
        }
      }
      return INITIAL_CHRONICLES;
    } catch (e) {
      console.error('Error parsing chronicles from localStorage:', e);
      return INITIAL_CHRONICLES;
    }
  });

  // Source of truth: Server state when campaignId is present, otherwise local state (Learned Rule 9)
  const chronicles: ChronicleSession[] = useMemo(() => {
    if (!campaignId) return localChronicles;
    return dbChronicles.map((c) => ({
      id: c.id,
      session: `SESSÃO ${toRoman(c.sessionNumber)}`,
      rawSessionNumber: c.sessionNumber,
      title: c.title,
      location: c.location || '',
      date: formatDisplayDate(c.sessionDate),
      desc: c.narrative && c.narrative.length > 200 ? `${c.narrative.slice(0, 197)}...` : c.narrative,
      fullText: c.narrative,
      image: c.illustrationUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E',
      danger: 'Médio',
      majorEvent: c.mission || 'Relato de aventura'
    }));
  }, [campaignId, dbChronicles, localChronicles]);

  const [search, setSearch] = useState('');
  const [selectedChronicle, setSelectedChronicle] = useState<ChronicleSession | null>(null);
  const [showLoreModal, setShowLoreModal] = useState(false);
  
  // New Chronicle Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newFullText, setNewFullText] = useState('');
  const [newImage, setNewImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E');

  // Edit/Delete State
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<Partial<ChronicleSession>>({});
  const [chronicleToDelete, setChronicleToDelete] = useState<ChronicleSession | null>(null);

  // Sync local fallback only when !campaignId
  useEffect(() => {
    if (!campaignId) {
      localStorage.setItem('daemon_chronicles_list', JSON.stringify(localChronicles));
    }
  }, [localChronicles, campaignId]);

  const hasChanges = isEditing && selectedChronicle && (
    (editingData.title !== undefined && editingData.title !== selectedChronicle.title) ||
    (editingData.location !== undefined && editingData.location !== selectedChronicle.location) ||
    (editingData.date !== undefined && editingData.date !== selectedChronicle.date) ||
    (editingData.majorEvent !== undefined && editingData.majorEvent !== selectedChronicle.majorEvent) ||
    (editingData.fullText !== undefined && editingData.fullText !== selectedChronicle.fullText) ||
    (editingData.image !== undefined && editingData.image !== selectedChronicle.image)
  );

  // Live preview representation (D-02)
  const displayChronicle: ChronicleSession | null = useMemo(() => {
    if (!selectedChronicle) return null;
    if (!isEditing) return selectedChronicle;
    return {
      ...selectedChronicle,
      title: editingData.title !== undefined ? editingData.title : selectedChronicle.title,
      location: editingData.location !== undefined ? editingData.location : selectedChronicle.location,
      date: editingData.date !== undefined ? editingData.date : selectedChronicle.date,
      majorEvent: editingData.majorEvent !== undefined ? editingData.majorEvent : selectedChronicle.majorEvent,
      fullText: editingData.fullText !== undefined ? editingData.fullText : selectedChronicle.fullText,
      image: editingData.image !== undefined ? editingData.image : selectedChronicle.image,
      desc: editingData.fullText && editingData.fullText.length > 200 
        ? `${editingData.fullText.slice(0, 197)}...` 
        : (editingData.fullText || selectedChronicle.desc)
    };
  }, [selectedChronicle, isEditing, editingData]);

  const handleSaveEdit = () => {
    if (!selectedChronicle || !hasChanges) return;
    
    const derivedDesc = editingData.fullText && editingData.fullText.length > 200 
      ? `${editingData.fullText.slice(0, 197)}...` 
      : (editingData.fullText || selectedChronicle.desc);

    const updatedSessionNumber = selectedChronicle.rawSessionNumber ?? 1;

    if (campaignId) {
      updateMutation.mutate({
        chronicleId: selectedChronicle.id,
        payload: {
          sessionNumber: updatedSessionNumber,
          title: (editingData.title ?? selectedChronicle.title ?? '').trim(),
          location: editingData.location ?? selectedChronicle.location,
          sessionDate: toIsoDate(editingData.date ?? selectedChronicle.date),
          mission: editingData.majorEvent ?? selectedChronicle.majorEvent,
          illustrationUrl: editingData.image ?? selectedChronicle.image,
          narrative: editingData.fullText ?? selectedChronicle.fullText,
        }
      }, {
        onSuccess: () => {
          setSelectedChronicle(prev => prev ? {
            ...prev,
            ...editingData,
            desc: derivedDesc
          } : null);
          setIsEditing(false);
        }
      });
    } else {
      const updated = {
        ...selectedChronicle,
        ...editingData,
        desc: derivedDesc
      } as ChronicleSession;

      setLocalChronicles(prev => prev.map(c => c.id === updated.id ? updated : c));
      setSelectedChronicle(updated);
      setIsEditing(false);
      toast.success(`A crônica "${updated.title}" foi atualizada.`);
    }
  };

  const [pendingMoveDirection, setPendingMoveDirection] = useState<'forward' | 'backward' | null>(null);

  const handleMoveChronicle = (direction: 'forward' | 'backward') => {
    if (!selectedChronicle) return;
    setPendingMoveDirection(direction);
  };

  const confirmMoveChronicle = () => {
    if (!selectedChronicle || !pendingMoveDirection) return;
    
    setLocalChronicles(prev => {
      const idx = prev.findIndex(c => c.id === selectedChronicle.id);
      if (idx === -1) return prev;
      
      const newArr = [...prev];
      if (pendingMoveDirection === 'forward' && idx < prev.length - 1) { 
        const temp = newArr[idx];
        newArr[idx] = newArr[idx + 1];
        newArr[idx + 1] = temp;
      } else if (pendingMoveDirection === 'backward' && idx > 0) { 
        const temp = newArr[idx];
        newArr[idx] = newArr[idx - 1];
        newArr[idx - 1] = temp;
      } else {
        return prev;
      }

      const reindexed = newArr.map((c, i) => ({ ...c, session: `SESSÃO ${toRoman(i + 1)}`, rawSessionNumber: i + 1 }));
      
      const updatedItem = reindexed.find(c => c.id === selectedChronicle.id);
      if (updatedItem) {
        setTimeout(() => {
          setSelectedChronicle(updatedItem);
          if (isEditing) {
            setEditingData(prevData => ({ ...prevData, session: updatedItem.session }));
          }
        }, 0);
      }

      return reindexed;
    });
    setPendingMoveDirection(null);
  };

  const handleDeleteConfirm = () => {
    if (chronicleToDelete) {
      if (campaignId) {
        deleteMutation.mutate(chronicleToDelete.id, {
          onSuccess: () => {
            if (selectedChronicle?.id === chronicleToDelete.id) {
              setSelectedChronicle(null);
              setIsEditing(false);
            }
            setChronicleToDelete(null);
          }
        });
      } else {
        setLocalChronicles(prev => {
          const filtered = prev.filter(c => c.id !== chronicleToDelete.id);
          return filtered.map((c, idx) => ({ ...c, session: `SESSÃO ${toRoman(idx + 1)}`, rawSessionNumber: idx + 1 }));
        });
        toast.success(`A crônica "${chronicleToDelete.title}" foi apagada dos registros.`);
        if (selectedChronicle?.id === chronicleToDelete.id) {
          setSelectedChronicle(null);
          setIsEditing(false);
        }
        setChronicleToDelete(null);
      }
    }
  };

  const nextSessionNumber = chronicles.length > 0 
    ? Math.max(...chronicles.map(c => c.rawSessionNumber ?? 0)) + 1 
    : 1;
  const autoSessionLabel = `SESSÃO ${toRoman(nextSessionNumber)}`;

  const handleCreateChronicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) {
      toast.error('Crie uma campanha antes para vincular esta crônica!');
      return;
    }
    if (!newTitle || !newLocation || !newDate || !newFullText) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const derivedDesc = newFullText.length > 200 ? `${newFullText.slice(0, 197)}...` : newFullText;

    if (campaignId) {
      createMutation.mutate({
        sessionNumber: nextSessionNumber,
        title: newTitle.trim(),
        location: newLocation.toUpperCase(),
        sessionDate: toIsoDate(newDate),
        mission: 'Relato de aventura',
        illustrationUrl: newImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E',
        narrative: newFullText
      }, {
        onSuccess: () => {
          setShowCreateModal(false);
          setNewTitle('');
          setNewLocation('');
          setNewDate('');
          setNewFullText('');
        }
      });
    } else {
      const newChronicle: ChronicleSession = {
        id: `chronicle-${Date.now()}`,
        session: autoSessionLabel,
        rawSessionNumber: nextSessionNumber,
        title: newTitle,
        location: newLocation.toUpperCase(),
        date: newDate,
        desc: derivedDesc,
        fullText: newFullText,
        image: newImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E',
        danger: 'Médio',
        majorEvent: 'Relato de aventura'
      };

      setLocalChronicles((prev) => [...prev, newChronicle]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewLocation('');
      setNewDate('');
      setNewFullText('');
      toast.success(`A crônica "${newTitle}" foi registrada nos tomos.`);
    }
  };

  // Filter implementation
  const filteredChronicles = chronicles.filter((chronicle) => {
    const matchesSearch = 
      chronicle.title.toLowerCase().includes(search.toLowerCase()) ||
      chronicle.desc.toLowerCase().includes(search.toLowerCase()) ||
      chronicle.session.toLowerCase().includes(search.toLowerCase()) ||
      chronicle.location.toLowerCase().includes(search.toLowerCase()) ||
      chronicle.fullText.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  const reversedChronicles = [...filteredChronicles].reverse();

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-1 animate-fadeIn text-on-surface relative font-sans">
      {/* Visual background overlays */}
      <div className="absolute right-10 top-20 w-80 h-80 bg-primary-container/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <PageHeader
        title="Crônicas"
        subtitle={
          activeCampaign?.name ? (
            <>Crônicas registradas para a campanha ativa: <strong className="text-primary">{activeCampaign.name}</strong></>
          ) : (
            'Os registros de sua mesa de jogo, acompanhando a evolução dos atos, combates e perigos que forjaram o destino de sua party.'
          )
        }
        actions={
          userRole === 'dm' && (
            <div className="hidden md:block">
              <AddButton
                onClick={() => {
                  if (!campaignId) {
                    toast.error('Crie uma campanha antes para vincular esta crônica!');
                    return;
                  }
                  setShowCreateModal(true);
                }}
                label="Registrar Crônica"
              />
            </div>
          )
        }
      />

      {/* Floating Add Button for Mobile */}
      {userRole === 'dm' && (
        <button
          type="button"
          onClick={() => {
            if (!campaignId) {
              toast.error('Crie uma campanha antes para vincular esta crônica!');
              return;
            }
            setShowCreateModal(true);
          }}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center shadow-2xl border border-primary/50 z-40 cursor-pointer"
          title="Registrar Crônica"
          aria-label="Registrar Crônica"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      )}

      {/* História - Lore Card */}
      <div 
        id="campaign-lore-card" 
        onClick={() => {
          if (onNavigateToHistory) {
            onNavigateToHistory();
          } else {
            setShowLoreModal(true);
          }
        }}
        className="relative w-full bg-surface-container border border-outline-variant parchment-texture shadow-2xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:border-primary/60 hover:bg-surface-container relative z-10 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] cursor-pointer items-stretch"
      >
        {/* Lore Cover Illustration banner */}
        <div className="w-full md:w-1/3 min-h-[160px] sm:min-h-[190px] md:min-h-[220px] relative overflow-hidden shrink-0">
          <ImageWithFallback
            src={activeCampaign?.ilustracao || activeCampaign?.illustrationUrl || activeCampaign?.ilustration_url || "/images/history.webp"}
            alt={activeCampaign?.name || "Lore da Campanha"}
            className="w-full h-full object-cover dark:brightness-75 transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Lore Text Content */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-5 h-5 text-primary animate-pulse shrink-0" />
                <h4 className="font-serif text-lg sm:text-xl md:text-2xl text-on-surface font-medium tracking-wider group-hover:text-primary transition-colors truncate">
                  {activeCampaign?.name || 'História da Campanha'}
                </h4>
              </div>
              
              <div className="flex items-center gap-1.5 text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-micro font-mono font-bold tracking-widest shrink-0">
                <span>LER MAIS</span>
                <span className="material-symbols-outlined text-micro animate-bounce-horizontal">arrow_forward</span>
              </div>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed text-justify line-clamp-3 md:line-clamp-6">
              {activeCampaign?.lore || activeCampaign?.subtitulo || activeCampaign?.description || 'Explore e documente os contos, segredos e a narrativa ancestral que forjam esta jornada.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-micro font-mono text-on-surface-variant/60">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              Cenário: {activeCampaign?.universo || activeCampaign?.system || 'Daemon'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Campanha Ativa</span>
          </div>
        </div>
      </div>

      {/* Search and Filters utility bar */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        {/* Search Input */}
        <div className="flex-1 flex items-center bg-surface-container-low border border-outline-variant px-3.5 sm:px-4 py-2.5 focus-within:border-primary transition-all relative">
          <Search className="w-4 h-4 text-on-surface-variant/70 mr-2.5 shrink-0" />
          <input
            type="text"
            maxLength={50}
            placeholder="Pesquisar crônicas por título, local, relatos, segredos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-on-surface placeholder:text-on-surface-variant/40 font-sans min-w-0 pr-12"
          />
          <div className={`absolute right-8 text-micro font-mono ${search.length >= 50 ? 'text-red-500' : 'text-on-surface-variant/50'}`}>
            {search.length}/50
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-on-surface-variant/60 hover:text-on-surface text-xs font-bold ml-2 cursor-pointer shrink-0"
            >
              LIMPAR
            </button>
          )}
        </div>
      </div>

      {/* Grid containing Cards layout matching the design patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        {reversedChronicles.length === 0 ? (
          <div className="col-span-full text-center py-16 sm:py-24 bg-surface-container-low border border-dashed border-outline-variant parchment-texture flex flex-col items-center justify-center p-6">
            <span className="material-symbols-outlined text-5xl sm:text-6xl text-on-surface-variant opacity-30 mb-4 animate-pulse">
              auto_stories
            </span>
            {!campaignId ? (
              <>
                <h4 className="font-serif text-xl sm:text-2xl text-on-surface font-semibold">Não há campanha pra criar crônicas!</h4>
                <p className="font-sans text-xs text-on-surface-variant max-w-md mt-2 leading-relaxed">
                  Selecione ou crie uma campanha ativa para poder registrar e visualizar as crônicas de sessão.
                </p>
                <button
                  onClick={() => onNavigateToCampaigns?.()}
                  className="mt-6 px-6 py-3 bg-primary text-on-primary font-sans text-xs font-bold uppercase tracking-wider transition-all hover:bg-primary/90 active:scale-95 duration-150 cursor-pointer shadow-md"
                >
                  IR PARA CAMPANHAS
                </button>
              </>
            ) : (
              <>
                <h4 className="font-serif text-lg sm:text-xl text-on-surface">Nenhum Registro Encontrado</h4>
                <p className="font-sans text-xs text-on-surface-variant max-w-sm mt-2 leading-relaxed">
                  Esta campanha ainda não possui crônicas de sessão registradas.
                </p>
              </>
            )}
          </div>
        ) : (
          reversedChronicles.map((chronicle) => {
            return (
              <div
                key={chronicle.id}
                onClick={() => setSelectedChronicle(chronicle)}
                className="group relative bg-surface-container border border-outline-variant hover:border-primary/60 transition-all duration-300 flex flex-col justify-between parchment-texture shadow-2xl overflow-hidden cursor-pointer h-auto min-h-[400px] sm:h-[440px]"
              >
                {/* Banner Thumbnail Treatment */}
                <div className="h-36 sm:h-40 relative overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={chronicle.image}
                    alt={chronicle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    fallbackText={chronicle.title}
                  />
                  
                  {/* Absolute Badge Session Overlays */}
                  <div className="absolute top-3 left-3 bg-black/70 border border-[#dd9281]/40 px-2 py-1">
                    <span className="font-mono text-micro font-bold text-[#dd9281] tracking-widest">{chronicle.session}</span>
                  </div>

                  {/* Hover book read symbol indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 border border-[#fbb1a9]/40 p-2 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#fbb1a9] text-sm">auto_stories</span>
                  </div>
                </div>

                {/* Content body layout */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Location line header */}
                    <div className="flex items-center gap-1.5 text-on-surface-variant/60 text-micro font-bold tracking-widest uppercase mb-1.5">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{chronicle.location}</span>
                    </div>

                    <h4 className="font-serif text-base sm:text-lg text-on-surface font-bold tracking-wider group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {chronicle.title}
                    </h4>

                    {/* Brief description */}
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                      {chronicle.desc}
                    </p>
                  </div>

                  {/* Highlights section inside card */}
                  <div className="border-t border-outline-variant/30 pt-3 mt-auto space-y-2">
                    <div className="flex items-start gap-1.5 justify-start text-left">
                      <span className="font-sans text-micro font-bold text-primary tracking-widest uppercase shrink-0 mt-0.5">Missão:</span>
                      <span className="font-sans text-micro text-on-surface-variant/80 italic line-clamp-1">{chronicle.majorEvent}</span>
                    </div>

                    {/* Footer specs of card list */}
                    <div className="flex justify-between items-center text-micro font-mono text-on-surface-variant/50 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary/70 shrink-0" />
                        <span>{chronicle.date}</span>
                      </div>

                      <div className="flex items-center gap-1 text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                        <span className="font-sans text-micro font-bold tracking-widest uppercase">LER MAIS</span>
                        <BookOpen className="w-3 h-3 shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Reader Detail Modal & Desktop Live Preview Drawer (D-02) */}
      <AnimatePresence>
        {selectedChronicle && displayChronicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => {
              setSelectedChronicle(null);
              setIsEditing(false);
            }}
          >
            {/* Desktop Sliding Drawer for Live Preview Editing (D-02) */}
            {isEditing && (
              <motion.div
                initial={{ x: -480, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -480, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="hidden md:flex fixed top-0 left-0 bottom-0 w-[420px] lg:w-[480px] bg-surface-container border-r border-outline-variant z-[1000] flex-col shadow-2xl overflow-y-auto custom-scrollbar p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-serif text-lg text-on-surface font-bold">Editar Crônica</h4>
                      <p className="font-sans text-micro text-on-surface-variant/70">Visualização ao vivo à direita</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-on-surface-variant hover:text-on-surface px-2.5 py-1 text-xs uppercase font-mono cursor-pointer"
                      title="Cancelar"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={!hasChanges || updateMutation.isPending}
                      className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        !hasChanges 
                          ? 'bg-primary/20 text-on-surface-variant/40 cursor-not-allowed' 
                          : 'bg-primary text-on-primary hover:bg-primary/90 shadow'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      SALVAR
                    </button>
                  </div>
                </div>

                {/* Session Number (Read-only) */}
                <div>
                  <label className="text-micro font-mono text-on-surface-variant font-bold uppercase tracking-wider block mb-1">
                    Sessão
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={displayChronicle.session}
                    className="w-full bg-surface-container-low border border-outline-variant/40 text-primary font-mono font-bold text-xs px-3 py-2 cursor-not-allowed"
                  />
                </div>

                {/* Title */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-micro font-mono text-on-surface-variant font-bold uppercase tracking-wider">
                      Título da Sessão *
                    </label>
                    <span className={`text-micro font-mono ${String(editingData.title ?? displayChronicle.title ?? '').length >= 50 ? 'text-red-500' : 'text-on-surface-variant/60'}`}>
                      {String(editingData.title ?? displayChronicle.title ?? '').length}/50
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={50}
                    value={editingData.title ?? displayChronicle.title ?? ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título da Sessão"
                    className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Location and Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-micro font-mono text-on-surface-variant font-bold uppercase tracking-wider">
                        Localização
                      </label>
                      <span className={`text-micro font-mono ${String(editingData.location ?? displayChronicle.location ?? '').length >= 50 ? 'text-red-500' : 'text-on-surface-variant/60'}`}>
                        {String(editingData.location ?? displayChronicle.location ?? '').length}/50
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      value={editingData.location ?? displayChronicle.location ?? ''}
                      onChange={(e) => setEditingData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="LOCALIZAÇÃO"
                      className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs px-3 py-2 focus:border-primary focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-micro font-mono text-on-surface-variant font-bold uppercase tracking-wider">
                        Data
                      </label>
                      <span className={`text-micro font-mono ${String(editingData.date ?? displayChronicle.date ?? '').length >= 50 ? 'text-red-500' : 'text-on-surface-variant/60'}`}>
                        {String(editingData.date ?? displayChronicle.date ?? '').length}/50
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      value={editingData.date ?? displayChronicle.date ?? ''}
                      onChange={(e) => setEditingData(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="Data"
                      className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs px-3 py-2 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Major Event / Mission */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-micro font-mono text-on-surface-variant font-bold uppercase tracking-wider">
                      Missão / Evento Principal
                    </label>
                    <span className={`text-micro font-mono ${String(editingData.majorEvent ?? displayChronicle.majorEvent ?? '').length >= 50 ? 'text-red-500' : 'text-on-surface-variant/60'}`}>
                      {String(editingData.majorEvent ?? displayChronicle.majorEvent ?? '').length}/50
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={50}
                    value={editingData.majorEvent ?? displayChronicle.majorEvent ?? ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev, majorEvent: e.target.value }))}
                    placeholder="Missão / Evento Principal"
                    className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Cover Image Upload / URL */}
                <div>
                  <label className="text-micro font-mono text-on-surface-variant font-bold uppercase tracking-wider block mb-1">
                    Ilustração da Capa
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={500}
                      placeholder="URL da imagem..."
                      value={(editingData.image ?? displayChronicle.image)?.startsWith('data:') ? '' : (editingData.image ?? displayChronicle.image)}
                      onChange={(e) => setEditingData(prev => ({ ...prev, image: e.target.value }))}
                      className="flex-1 bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs px-3 py-2 focus:border-primary focus:outline-none"
                    />
                    <label className="bg-surface-container-low border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-on-surface px-3 py-2 flex items-center gap-1.5 cursor-pointer text-xs font-mono font-bold uppercase transition-all shrink-0">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setEditingData(prev => ({ ...prev, image: reader.result as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Narrative text */}
                <div className="flex-1 flex flex-col min-h-[220px]">
                  <label className="text-micro font-mono text-on-surface-variant font-bold uppercase tracking-wider block mb-1">
                    Diário de Relato Detalhado *
                  </label>
                  <textarea
                    value={editingData.fullText ?? displayChronicle.fullText ?? ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev, fullText: e.target.value }))}
                    placeholder="Diário de relato detalhado..."
                    className="w-full flex-1 font-serif text-xs leading-relaxed text-on-surface bg-surface-container-low border border-outline-variant/40 p-3 custom-scrollbar focus:border-primary focus:outline-none resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Reader Modal (Pushed right on desktop when drawer is active - D-02) */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`bg-surface-container border border-outline-variant max-w-2xl w-full max-h-[85vh] flex flex-col justify-start relative select-text shadow-2xl transition-all duration-300 ${
                isEditing ? 'md:translate-x-[210px] lg:translate-x-[240px]' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedChronicle(null);
                    setIsEditing(false);
                  }}
                  className="text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9]"
                  title="Fechar"
                >
                  <span className="material-symbols-outlined text-sm text-[#fbb1a9]">close</span>
                </button>

                {userRole === 'dm' && (
                  <>
                    {/* Mobile Only: Save button inside modal when editing */}
                    {isEditing && (
                      <button
                        onClick={handleSaveEdit}
                        disabled={!hasChanges || updateMutation.isPending}
                        className={`md:hidden transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/50 hover:border-[#fbb1a9] ${
                          !hasChanges ? 'text-[#fbb1a9]/40 opacity-50 cursor-not-allowed' : 'text-[#fbb1a9] hover:text-[#fbb1a9]'
                        }`}
                        title="Salvar Alterações"
                      >
                        <span className="material-symbols-outlined text-sm text-[#fbb1a9]">save</span>
                      </button>
                    )}

                    {isEditing && !campaignId && (
                      <>
                        <button
                          onClick={() => handleMoveChronicle('backward')}
                          className="text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9]"
                          title="Mover para trás no tempo"
                        >
                          <span className="material-symbols-outlined text-sm text-[#fbb1a9]">arrow_back</span>
                        </button>
                        <button
                          onClick={() => handleMoveChronicle('forward')}
                          className="text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9]"
                          title="Mover para frente no tempo"
                        >
                          <span className="material-symbols-outlined text-sm text-[#fbb1a9]">arrow_forward</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                        } else {
                          setEditingData(selectedChronicle);
                          setIsEditing(true);
                        }
                      }}
                      className={`text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border ${
                        isEditing ? 'border-[#fbb1a9] bg-black/60' : 'border-[#fbb1a9]/30 hover:border-[#fbb1a9]'
                      }`}
                      title={isEditing ? 'Fechar Edição' : 'Editar'}
                    >
                      <span className="material-symbols-outlined text-sm text-[#fbb1a9]">edit</span>
                    </button>

                    <button
                      onClick={() => setChronicleToDelete(selectedChronicle)}
                      className="text-[#fbb1a9] hover:text-red-400 transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-red-400"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-sm text-[#fbb1a9]">delete</span>
                    </button>
                  </>
                )}
              </div>

              {/* Cover Banner inside reader detail modal */}
              <div className="h-44 shrink-0 relative overflow-hidden">
                <ImageWithFallback
                  src={displayChronicle.image}
                  alt={displayChronicle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  fallbackText={displayChronicle.title}
                />
                <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-surface-container dark:via-surface-container/40 to-transparent"></div>
                
                {/* Mobile Inline Edit: Cover Image Input */}
                {isEditing && (
                  <div className="md:hidden absolute top-4 left-6 flex items-center gap-2 bg-black/60 border border-outline-variant/30 backdrop-blur-sm px-3 py-1.5 rounded-sm max-w-[calc(100%-80px)]">
                    <span className="text-micro font-bold text-primary uppercase tracking-widest shrink-0">CAPA:</span>
                    <label className="text-on-surface-variant hover:text-on-surface flex items-center cursor-pointer transition-colors shrink-0 px-2 border-r border-outline-variant/30" title="Upload Imagem">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setEditingData(prev => ({ ...prev, image: reader.result as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      maxLength={500}
                      placeholder="URL da imagem..."
                      value={editingData.image?.startsWith('data:') ? '' : (editingData.image || '')}
                      onChange={(e) => setEditingData(prev => ({ ...prev, image: e.target.value }))}
                      className="bg-white/95 text-zinc-900 placeholder:text-zinc-500 font-sans text-xs border border-zinc-300 rounded px-2 py-0.5 focus:outline-none w-32 min-w-0"
                    />
                  </div>
                )}

                {/* Banner Header Info */}
                <div className="absolute bottom-4 left-6 right-20">
                  {isEditing ? (
                    <>
                      {/* Mobile Inline Title Form */}
                      <div className="md:hidden space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={50}
                            value={editingData.location ?? displayChronicle.location ?? ''}
                            onChange={(e) => setEditingData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="LOCALIZAÇÃO"
                            className="font-mono text-micro tracking-widest text-on-surface font-bold block uppercase bg-black/40 border border-outline-variant/30 px-2 py-1 w-32"
                          />
                          <span className="font-mono text-micro tracking-widest text-on-surface font-bold block uppercase">• {displayChronicle.session}</span>
                        </div>
                        <input
                          type="text"
                          maxLength={50}
                          value={editingData.title ?? displayChronicle.title ?? ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Título da Sessão"
                          className="font-serif text-xl text-on-surface font-bold leading-tight bg-black/40 border border-outline-variant/30 px-2 py-1 w-full"
                        />
                      </div>

                      {/* Desktop Live Preview Title */}
                      <div className="hidden md:block">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-micro tracking-widest text-on-surface font-bold block uppercase">
                            {displayChronicle.location || 'LOCAL'} • {displayChronicle.session}
                          </span>
                          <span className="bg-primary/20 text-primary text-micro font-mono font-bold px-1.5 py-0.5 border border-primary/30 uppercase tracking-widest">
                            Live Preview
                          </span>
                        </div>
                        <h4 className="font-serif text-2xl md:text-3xl text-on-surface font-bold leading-tight mt-1">
                          {displayChronicle.title || 'Título da Sessão'}
                        </h4>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-micro tracking-widest text-on-surface font-bold block uppercase">
                        {displayChronicle.location} • {displayChronicle.session}
                      </span>
                      <h4 className="font-serif text-2xl md:text-3xl text-on-surface font-bold leading-tight mt-1">
                        {displayChronicle.title}
                      </h4>
                    </>
                  )}
                </div>
              </div>

              {/* Reader detailed text area */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pb-2 border-b border-outline-variant/30">
                  <span className="text-primary font-bold tracking-widest">RELATO COMPLETO DE SESSÃO</span>
                  {isEditing ? (
                    <>
                      {/* Mobile Inline Date input */}
                      <div className="md:hidden mr-12 relative">
                        <input
                          type="text"
                          maxLength={50}
                          value={editingData.date ?? displayChronicle.date ?? ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, date: e.target.value }))}
                          placeholder="Data"
                          className="bg-surface-container border border-outline-variant/30 px-2 py-1 text-right w-28 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>
                      {/* Desktop Live Preview Date */}
                      <div className="hidden md:block">
                        <span>{displayChronicle.date || 'Data não definida'}</span>
                      </div>
                    </>
                  ) : (
                    <span>{displayChronicle.date}</span>
                  )}
                </div>
                
                {/* Visual metadata breakdown stats */}
                <div className="bg-surface-container px-4 py-3 border border-outline-variant/20 text-left flex flex-col gap-1">
                  <span className="block font-sans text-micro text-on-surface-variant/50 font-bold tracking-widest uppercase">Missão</span>
                  {isEditing ? (
                    <>
                      {/* Mobile Inline Mission Input */}
                      <div className="md:hidden relative w-full">
                        <input
                          type="text"
                          maxLength={50}
                          value={editingData.majorEvent ?? displayChronicle.majorEvent ?? ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, majorEvent: e.target.value }))}
                          placeholder="Missão / Evento Principal"
                          className="font-sans text-xs text-on-surface font-bold mt-0.5 block bg-black/40 border border-outline-variant/30 px-3 py-1.5 w-full focus:border-primary focus:outline-none"
                        />
                      </div>
                      {/* Desktop Live Preview Mission */}
                      <span className="hidden md:block font-sans text-xs text-on-surface font-bold mt-0.5">
                        {displayChronicle.majorEvent || 'Relato de aventura'}
                      </span>
                    </>
                  ) : (
                    <span className="font-sans text-xs text-on-surface font-bold mt-0.5 block">{displayChronicle.majorEvent}</span>
                  )}
                </div>

                {/* Dropcap paragraph story text styled beautifully */}
                {isEditing ? (
                  <>
                    {/* Mobile Inline Narrative textarea */}
                    <div className="md:hidden">
                      <textarea
                        value={editingData.fullText ?? displayChronicle.fullText ?? ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev, fullText: e.target.value }))}
                        placeholder="Diário de relato detalhado..."
                        className="w-full font-serif text-sm leading-relaxed text-on-surface bg-surface-container border border-outline-variant/30 p-4 min-h-[200px] custom-scrollbar focus:border-primary focus:outline-none resize-y"
                      />
                    </div>
                    {/* Desktop Live Preview Narrative */}
                    <div className="hidden md:block">
                      <p className="font-serif text-base leading-relaxed text-on-surface select-text first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-2">
                        {displayChronicle.fullText || 'Nenhuma narrativa registrada ainda.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="font-serif text-base leading-relaxed text-on-surface select-text first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-2">
                    {displayChronicle.fullText}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lore Detail Modal */}
      <AnimatePresence>
        {showLoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowLoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface-container border border-outline-variant max-w-2xl w-full max-h-[85vh] flex flex-col justify-start relative select-text shadow-2xl parchment-texture"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoreModal(false)}
                className="absolute top-4 right-4 text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9] z-10"
              >
                <span className="material-symbols-outlined text-sm text-[#fbb1a9]">close</span>
              </button>

              {/* Cover Banner */}
              <div className="h-44 shrink-0 relative overflow-hidden">
                <ImageWithFallback
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E"
                  alt="Lore de Occultus"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-surface-container via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 pl-6 bg-[#F5F2EB]/20 dark:bg-transparent backdrop-blur-sm dark:backdrop-blur-none">
                  <span className="font-mono text-micro tracking-widest text-primary font-bold block uppercase">
                    CODEX ANCESTRAL • LORE DA CAMPANHA
                  </span>
                  <h4 className="font-serif text-2xl md:text-3xl text-on-surface font-bold leading-tight mt-1">
                    O Crepúsculo de Occultus
                  </h4>
                </div>
              </div>

              {/* Reader detailed text area */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-left">
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pb-2 border-b border-outline-variant/30">
                  <span className="text-primary font-bold tracking-widest">COSMOLOGIA & MITOLOGIA</span>
                  <span className="text-amber-500/80 font-bold">DAEMON RPG</span>
                </div>
                
                {/* Visual metadata breakdown stats */}
                <div className="grid grid-cols-2 gap-4 bg-surface-container px-4 py-3 border border-outline-variant/20 text-left">
                  <div>
                    <span className="block font-sans text-micro text-on-surface-variant/50 font-bold tracking-widest uppercase">Nome da Campanha</span>
                    <span className="font-sans text-xs text-on-surface font-bold mt-0.5 block">O Crepúsculo de Occultus</span>
                  </div>
                  <div>
                    <span className="block font-sans text-micro text-on-surface-variant/50 font-bold tracking-widest uppercase">Mestre do Jogo (DM)</span>
                    <span className="font-sans text-xs text-on-surface font-bold mt-0.5 block">Mestre Murilo Dutra</span>
                  </div>
                </div>

                {/* Full history text */}
                <div className="space-y-4 font-serif text-sm md:text-base leading-relaxed text-on-surface select-text">
                  <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-2 text-justify">
                    O continente de <strong>Occultus</strong>, outrora banhado pela pálida luz divina e protegido por imponentes e inquebráveis muralhas rúnicas, agora amarga sob a sombra enigmática e insidiosa do <strong>Pacto da Serpente de Sangue</strong>. Desde a fatídica queda de <em>Aethelgard</em> — o bastião oriental da humanidade que ruiu sob catapultas de chamas mágicas e ritos profanos —, as forças do abismo rastejam livremente através de florestas eternas de névoa, pântanos ácidos e criptas outrora esquecidas pela civilização.
                  </p>
                  <p className="text-justify">
                    Diários perdidos de antigos sacerdotes revelam rituais sombrios, infecções arcanas que pulsam lentamente nos poços das vilas sob a pálida luz rúnica do céu noturno, e grimórios banidos de necromancia que clamam e sussurram por libertação nos sonhos dos mortais. No limiar da loucura que assola a mente de quem adentra estas terras, guerreiros honrados, patrulheiros da névoa e sacerdotes das sombras se unem em uma resistência desesperada. Eles enfrentam não apenas as bestas abomináveis do submundo, mas também o declínio inexorável de sua própria sanidade.
                  </p>
                  <p className="text-justify">
                    Dizem os rumores antigos que o Pacto foi selado nos salões inferiores da fortaleza de <em>Obsidian</em>, onde o sangue de reis traidores foi derramado para despertar uma divindade primordial adormecida nas entranhas da terra. Agora, os deuses parecem surdos às preces rúnicas, e o destino deste mundo jaz escrito em pergaminhos de cinza e brasa. O futuro aguarda que a fagulha derradeira da força de vontade de bravos aventureiros resista ao juízo final, selando as fendas abissais ou sucumbindo de vez à corrupção eterna.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creation/Registration Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Registrar Nova Crônica"
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        maxWidth="max-w-xl"
        onSubmit={handleCreateChronicle}
        footer={
          <div className="flex justify-end w-full">
            <SaveButton
              type="submit"
              label="Salvar"
              variant="primary-ghost"
              disabled={createMutation.isPending}
            />
          </div>
        }
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Registre uma nova sessão da crônica para o diário da campanha.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto-incremental Session field */}
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Sessão</label>
              <input
                type="text"
                readOnly
                disabled
                value={autoSessionLabel}
                className="w-full bg-surface-container/50 border border-outline-variant text-primary font-bold text-sm px-3.5 py-2.5 opacity-80 cursor-not-allowed rounded-none"
              />
            </div>

            {/* Title */}
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Título da Sessão *</label>
              <div className="w-full">
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. O Guardião das Trevas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
                {newTitle.length >= 50 && (
                  <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                    Limite atingido (50)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Localização *</label>
              <div className="w-full">
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. CATACUMBAS DE ARKANUN"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
                {newLocation.length >= 50 && (
                  <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                    Limite atingido (50)
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Data de Aventura *</label>
              <div className="w-full">
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. 10 de Maio, 1542"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
                {newDate.length >= 50 && (
                  <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                    Limite atingido (50)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Banner Image URL + Upload */}
          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Ilustração da Crônica
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="w-full">
                  <input
                    type="text"
                    maxLength={500}
                    placeholder="https://exemplo.com/imagem.jpg ou faça upload"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                  />
                  {newImage.length >= 500 && (
                    <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                      Limite atingido (500)
                    </div>
                  )}
                </div>
                <label className="bg-surface-container border border-outline-variant hover:border-primary text-on-surface-variant hover:text-on-surface px-4 py-2.5 flex items-center gap-2 cursor-pointer text-xs font-bold uppercase transition-all shrink-0">
                  <Upload className="w-4 h-4 text-primary" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setNewImage(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {newImage && (
                <div className="relative w-full h-28 border border-outline-variant overflow-hidden bg-black/40">
                  <ImageWithFallback
                    src={newImage}
                    alt="Pré-visualização da Ilustração"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 border border-outline-variant px-2 py-0.5 text-micro font-mono font-bold text-primary">
                    Pré-visualização
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Text area */}
          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Diário de Relato Detalhado *</label>
            <textarea
              required
              rows={6}
              placeholder="e.g. Diário completo documentando toda a jornada detalhada para o mestre e os jogadores..."
              value={newFullText}
              onChange={(e) => setNewFullText(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none custom-scrollbar"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!chronicleToDelete}
        onClose={() => setChronicleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Apagar Crônica"
        description="Tem certeza que deseja apagar este relato dos tomos? Esta ação não poderá ser desfeita."
        itemPreview={chronicleToDelete ? `${chronicleToDelete.session}: ${chronicleToDelete.title}` : undefined}
      />

      <ConfirmDeleteModal
        isOpen={!!pendingMoveDirection}
        onClose={() => setPendingMoveDirection(null)}
        onConfirm={confirmMoveChronicle}
        title="Alterar Cronologia"
        description="Isso vai mexer na cronologia das sessões! Tem certeza que deseja continuar?"
        cancelText="Cancelar"
        confirmText="Confirmar"
      />
    </div>
  );
}
