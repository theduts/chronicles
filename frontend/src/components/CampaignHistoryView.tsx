import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  Shield,
  Globe,
  Map as MapIcon,
  Users,
  Search,
  Plus,
  Eye,
  EyeOff,
  X,
  Upload,
  Maximize2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Compass,
  Zap,
  Bookmark,
  Edit3,
  Save,
  Trash2,
  Download,
  AlertTriangle
} from 'lucide-react';
import Modal from './Modal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ActionButton, SaveButton, AddButton, EditButton, DeleteButton } from './ActionButtons';
import { toast } from 'sonner';
import ImageWithFallback from './ImageWithFallback';
import {
  useLoreQuery,
  useCreateLoreMutation,
  useUpdateLoreMutation,
  useToggleLoreVisibilityMutation,
  useDeleteLoreMutation,
} from '../hooks/useLoreMutations';
import { useChroniclesQuery } from '../hooks/useChroniclesMutations';
import { useCampaignNpcs } from '../hooks/useNpcMutations';
import { toRoman, formatDisplayDate } from './ChroniclesView';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { uploadImage } from '../services/api/upload';

interface CampaignHistoryViewProps {
  onBack: () => void;
  userRole?: 'player' | 'dm';
  campaignId?: string;
  activeCampaign?: any;
  onNavigateToCampaigns?: () => void;
}

type TabType = 'panteao' | 'faccoes' | 'geografia' | 'mapas' | 'personas';

const DEFAULT_STORY_TEXT = '';

interface PhotoItem {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  date?: string;
  sourceType?: 'lore' | 'chronicle' | 'photo';
  createdAt?: string;
}

interface PantheonItem {
  id: string;
  name: string;
  title: string;
  type: 'Divindade Maior' | 'Divindade Menor' | 'Entidade Profana' | 'Arquidemônio';
  domains: string[];
  symbol: string;
  description: string;
  worshippers: string;
  alignment: string;
  image?: string;
  isVisible?: boolean;
}

interface FactionItem {
  id: string;
  name: string;
  leader: string;
  headquarters: string;
  alignment: string;
  influence: number; // 0 - 100
  description: string;
  allies: string[];
  enemies: string[];
  image?: string;
  isVisible?: boolean;
}

interface GeoItem {
  id: string;
  name: string;
  region: string;
  dangerLevel: 'Baixo' | 'Médio' | 'Alto' | 'Extremo';
  climate: string;
  population: string;
  description: string;
  secrets: string;
  image?: string;
  isVisible?: boolean;
}

interface MapItem {
  id: string;
  title: string;
  scale: string;
  url: string;
  description: string;
  poiCount: number;
  isVisible?: boolean;
}

interface PersonaItem {
  id: string;
  name: string;
  title: string;
  role?: string;
  description: string;
  image?: string;
  isVisible?: boolean;
  npcId?: string;
}

// Initial Data (Empty for precise testing)
const INITIAL_PHOTOS: PhotoItem[] = [];
const INITIAL_PANTHEON: PantheonItem[] = [];
const INITIAL_FACTIONS: FactionItem[] = [];
const INITIAL_GEO: GeoItem[] = [];
const INITIAL_MAPS: MapItem[] = [];
const INITIAL_PERSONAS: PersonaItem[] = [];

export default function CampaignHistoryView({ onBack, userRole = 'player', campaignId, activeCampaign, onNavigateToCampaigns }: CampaignHistoryViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('panteao');
  const [searchTerm, setSearchTerm] = useState('');

  // Server state via React Query
  const { data: dbLore = [], isLoading: isLoadingLore } = useLoreQuery(campaignId);
  const { data: dbChronicles = [] } = useChroniclesQuery(campaignId);
  const { data: personaNpcs = [] } = useCampaignNpcs(campaignId, { personaOnly: true });
  const createLoreMutation = useCreateLoreMutation(campaignId);
  const updateLoreMutation = useUpdateLoreMutation(campaignId);
  const toggleLoreVisibilityMutation = useToggleLoreVisibilityMutation(campaignId);
  const deleteLoreMutation = useDeleteLoreMutation(campaignId);

  // Helper to filter legacy mock items
  const parseCleanStorage = <T extends { id: string }>(key: string, prefix: string): T[] => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.id && !item.id.startsWith(prefix));
      }
    } catch {}
    return [];
  };

  const isDmUser = userRole === 'dm' || activeCampaign?.isDm === true;
  const queryClient = useQueryClient();

  // Story state initialized from activeCampaign?.lore or localStorage fallback
  const [storyText, setStoryText] = useState<string>(() => {
    if (activeCampaign?.lore) return activeCampaign.lore;
    try {
      const saved = localStorage.getItem('daemon_campaign_story');
      if (saved && (saved.includes('Occultus') || saved.includes('Aethelgard'))) {
        localStorage.removeItem('daemon_campaign_story');
        return '';
      }
      return saved || DEFAULT_STORY_TEXT;
    } catch {
      return DEFAULT_STORY_TEXT;
    }
  });

  useEffect(() => {
    if (activeCampaign?.lore !== undefined && activeCampaign?.lore !== null) {
      setStoryText(activeCampaign.lore);
    }
  }, [activeCampaign?.lore]);

  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editedStory, setEditedStory] = useState(storyText);
  const [isSavingStory, setIsSavingStory] = useState(false);

  const handleOpenStoryModal = () => {
    setEditedStory(storyText);
    setIsEditingStory(false);
    setShowStoryModal(true);
  };

  const handleSaveStory = async () => {
    setIsSavingStory(true);
    setStoryText(editedStory);
    if (campaignId) {
      try {
        await api.patch(`/campaigns/${campaignId}/lore`, { lore: editedStory });
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        toast.success('História da campanha salva com sucesso!');
      } catch (err) {
        // Fallback to full update
        try {
          await api.put(`/campaigns/${campaignId}`, {
            name: activeCampaign?.name,
            subtitulo: activeCampaign?.subtitulo,
            universo: activeCampaign?.universo,
            currentAct: activeCampaign?.currentAct,
            ilustracao: activeCampaign?.ilustracao || activeCampaign?.illustrationUrl,
            lore: editedStory,
          });
          queryClient.invalidateQueries({ queryKey: ['campaigns'] });
          toast.success('História da campanha salva com sucesso!');
        } catch (fallbackErr) {
          console.error('Erro ao salvar história da campanha:', fallbackErr);
          toast.error('Erro ao persistir história da campanha.');
        }
      }
    } else {
      localStorage.setItem('daemon_campaign_story', editedStory);
      toast.success('História salva localmente!');
    }
    setIsSavingStory(false);
    setIsEditingStory(false);
  };

  const getStoryPreview = (text: string, maxLength = 800) => {
    const clean = text.replace(/\n+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    return clean.slice(0, maxLength).trim() + '...';
  };

  // Local fallback states persisted in localStorage (used if no campaignId is active)
  const [localPhotos, setLocalPhotos] = useState<PhotoItem[]>(() => parseCleanStorage<PhotoItem>('daemon_history_photos', 'photo-'));
  const [localPantheon, setLocalPantheon] = useState<PantheonItem[]>(() => parseCleanStorage<PantheonItem>('daemon_history_pantheon', 'pan-'));
  const [localFactions, setLocalFactions] = useState<FactionItem[]>(() => parseCleanStorage<FactionItem>('daemon_history_factions', 'fac-'));
  const [localGeo, setLocalGeo] = useState<GeoItem[]>(() => parseCleanStorage<GeoItem>('daemon_history_geo', 'geo-'));
  const [localMaps, setLocalMaps] = useState<MapItem[]>(() => parseCleanStorage<MapItem>('daemon_history_maps', 'map-'));
  const [localPersonas, setLocalPersonas] = useState<PersonaItem[]>(() => parseCleanStorage<PersonaItem>('daemon_history_personas', 'per-'));

  // Unified getters: React Query server state when campaignId is present, local state otherwise
  const pantheon: PantheonItem[] = React.useMemo(() => {
    if (campaignId) {
      return dbLore.filter((l) => l.category === 'deidade').map((l) => ({
        id: l.id,
        name: l.title,
        title: (l.data?.title as string) || '',
        type: ((l.data?.type as string) || 'Divindade Maior') as PantheonItem['type'],
        domains: (l.data?.domains as string[]) || [],
        symbol: (l.data?.symbol as string) || '',
        description: l.description || '',
        worshippers: (l.data?.worshippers as string) || '',
        alignment: (l.data?.alignment as string) || '',
        image: l.imageUrl || '',
        isVisible: l.isVisible !== false,
      }));
    }
    return localPantheon;
  }, [campaignId, dbLore, localPantheon]);

  const factions: FactionItem[] = React.useMemo(() => {
    if (campaignId) {
      return dbLore.filter((l) => l.category === 'faccao').map((l) => ({
        id: l.id,
        name: l.title,
        leader: (l.data?.leader as string) || '',
        headquarters: (l.data?.headquarters as string) || '',
        alignment: (l.data?.alignment as string) || '',
        influence: typeof l.data?.influence === 'number' ? l.data.influence : 50,
        description: l.description || '',
        allies: (l.data?.allies as string[]) || [],
        enemies: (l.data?.enemies as string[]) || [],
        image: l.imageUrl || '',
        isVisible: l.isVisible !== false,
      }));
    }
    return localFactions;
  }, [campaignId, dbLore, localFactions]);

  const geo: GeoItem[] = React.useMemo(() => {
    if (campaignId) {
      return dbLore.filter((l) => l.category === 'geografia' || l.category === 'local').map((l) => ({
        id: l.id,
        name: l.title,
        region: (l.data?.region as string) || '',
        dangerLevel: ((l.data?.dangerLevel as string) || 'Médio') as GeoItem['dangerLevel'],
        climate: (l.data?.climate as string) || '',
        population: (l.data?.population as string) || '',
        description: l.description || '',
        secrets: (l.data?.secrets as string) || '',
        image: l.imageUrl || '',
        isVisible: l.isVisible !== false,
      }));
    }
    return localGeo;
  }, [campaignId, dbLore, localGeo]);

  const maps: MapItem[] = React.useMemo(() => {
    if (campaignId) {
      return dbLore.filter((l) => l.category === 'mapa').map((l) => ({
        id: l.id,
        title: l.title,
        scale: (l.data?.scale as string) || '1:1000',
        url: l.imageUrl || '',
        description: l.description || '',
        poiCount: typeof l.data?.poiCount === 'number' ? l.data.poiCount : 0,
        isVisible: l.isVisible !== false,
      }));
    }
    return localMaps;
  }, [campaignId, dbLore, localMaps]);

  const personas: PersonaItem[] = React.useMemo(() => {
    if (campaignId) {
      const lorePersonas: PersonaItem[] = dbLore
        .filter((l) => l.category === 'persona')
        .map((l) => ({
          id: l.id,
          name: l.title,
          title: (l.data?.title as string) || '',
          role: (l.data?.role as string) || '',
          description: l.description || '',
          image: l.imageUrl || '',
          isVisible: l.isVisible !== false,
          npcId: (l.data?.npcId as string) || undefined,
        }));

      const existingNpcIds = new Set(lorePersonas.map((p) => p.npcId).filter(Boolean));
      const existingNames = new Set(lorePersonas.map((p) => p.name.trim().toLowerCase()));

      const directPersonas: PersonaItem[] = personaNpcs
        .filter((npc) => !existingNpcIds.has(npc.id) && !existingNames.has(npc.name.trim().toLowerCase()))
        .map((npc) => ({
          id: npc.id,
          name: npc.name,
          title: [npc.race, npc.occupation].filter(Boolean).join(' • '),
          role: npc.occupation || '',
          description: npc.description || '',
          image: npc.portraitUrl || npc.image || '',
          isVisible: true,
          npcId: npc.id,
        }));

      return [...lorePersonas, ...directPersonas];
    }
    return localPersonas;
  }, [campaignId, dbLore, personaNpcs, localPersonas]);

  const photos: PhotoItem[] = React.useMemo(() => {
    if (campaignId) {
      const items: PhotoItem[] = [];

      // 1. Fotos adicionadas diretamente à Galeria
      dbLore
        .filter((l) => (l.category === 'galeria' || l.category === 'photo') && !!l.imageUrl)
        .forEach((l) => {
          items.push({
            id: l.id,
            title: l.title || 'Sem título',
            category: 'Galeria',
            url: l.imageUrl || '',
            description: l.description || '',
            date: (l.data?.date as string) || '',
            sourceType: 'photo',
            createdAt: l.createdAt || l.updatedAt || '',
          });
        });

      // 2. Crônicas com ilustração
      dbChronicles
        .filter((c) => !!(c.illustrationUrl || (c as any).ilustration_url))
        .forEach((c) => {
          items.push({
            id: `chronicle-${c.id}`,
            title: c.title ? `Sessão ${toRoman(c.sessionNumber)}: ${c.title}` : `Sessão ${toRoman(c.sessionNumber)}`,
            category: 'Crônica',
            url: c.illustrationUrl || (c as any).ilustration_url || '',
            description: c.narrative || c.mission || '',
            date: formatDisplayDate(c.sessionDate),
            sourceType: 'chronicle',
            createdAt: c.createdAt || c.updatedAt || c.sessionDate || '',
          });
        });

      // 3. Panteão / Divindades com imagem
      dbLore
        .filter((l) => l.category === 'deidade' && !!l.imageUrl)
        .forEach((l) => {
          items.push({
            id: `deidade-${l.id}`,
            title: l.title,
            category: 'Panteão',
            url: l.imageUrl || '',
            description: l.description || '',
            date: (l.data?.domains as string[])?.join(', ') || '',
            sourceType: 'lore',
            createdAt: l.createdAt || l.updatedAt || '',
          });
        });

      // 4. Facções com imagem
      dbLore
        .filter((l) => l.category === 'faccao' && !!l.imageUrl)
        .forEach((l) => {
          items.push({
            id: `faccao-${l.id}`,
            title: l.title,
            category: 'Facção',
            url: l.imageUrl || '',
            description: l.description || '',
            date: (l.data?.leader as string) ? `Líder: ${l.data.leader}` : '',
            sourceType: 'lore',
            createdAt: l.createdAt || l.updatedAt || '',
          });
        });

      // 5. Geografia / Locais com imagem
      dbLore
        .filter((l) => (l.category === 'geografia' || l.category === 'local') && !!l.imageUrl)
        .forEach((l) => {
          items.push({
            id: `geo-${l.id}`,
            title: l.title,
            category: 'Geografia',
            url: l.imageUrl || '',
            description: l.description || '',
            date: (l.data?.region as string) ? `Região: ${l.data.region}` : '',
            sourceType: 'lore',
            createdAt: l.createdAt || l.updatedAt || '',
          });
        });

      // 6. Mapas com imagem
      dbLore
        .filter((l) => l.category === 'mapa' && !!l.imageUrl)
        .forEach((l) => {
          items.push({
            id: `mapa-${l.id}`,
            title: l.title,
            category: 'Mapa',
            url: l.imageUrl || '',
            description: l.description || '',
            date: (l.data?.scale as string) ? `Escala: ${l.data.scale}` : '',
            sourceType: 'lore',
            createdAt: l.createdAt || l.updatedAt || '',
          });
        });

      // 7. Personas com imagem
      dbLore
        .filter((l) => l.category === 'persona' && !!l.imageUrl)
        .forEach((l) => {
          items.push({
            id: `persona-${l.id}`,
            title: l.title,
            category: 'Persona',
            url: l.imageUrl || '',
            description: l.description || '',
            date: (l.data?.role as string) || '',
            sourceType: 'lore',
            createdAt: l.createdAt || l.updatedAt || '',
          });
        });

      // Ordenar pelas fotos mais recentes primeiro
      items.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      return items;
    }

    // Local / Offline fallback
    const items: PhotoItem[] = localPhotos.map((p) => ({ ...p, sourceType: 'photo' as const }));
    localPantheon.filter((p) => !!p.image).forEach((p) => {
      items.push({
        id: `pan-${p.id}`,
        title: p.name,
        category: 'Panteão',
        url: p.image || '',
        description: p.description,
        sourceType: 'lore',
      });
    });
    localFactions.filter((f) => !!f.image).forEach((f) => {
      items.push({
        id: `fac-${f.id}`,
        title: f.name,
        category: 'Facção',
        url: f.image || '',
        description: f.description,
        sourceType: 'lore',
      });
    });
    localGeo.filter((g) => !!g.image).forEach((g) => {
      items.push({
        id: `geo-${g.id}`,
        title: g.name,
        category: 'Geografia',
        url: g.image || '',
        description: g.description,
        sourceType: 'lore',
      });
    });
    localMaps.filter((m) => !!m.url).forEach((m) => {
      items.push({
        id: `map-${m.id}`,
        title: m.title,
        category: 'Mapa',
        url: m.url || '',
        description: m.description,
        sourceType: 'lore',
      });
    });
    localPersonas.filter((per) => !!per.image).forEach((per) => {
      items.push({
        id: `per-${per.id}`,
        title: per.name,
        category: 'Persona',
        url: per.image || '',
        description: per.description,
        sourceType: 'lore',
      });
    });
    return items;
  }, [campaignId, dbLore, dbChronicles, localPhotos, localPantheon, localFactions, localGeo, localMaps, localPersonas]);

  // Modal inspection / add states
  const [selectedGod, setSelectedGod] = useState<PantheonItem | null>(null);
  const [showDeleteGodConfirm, setShowDeleteGodConfirm] = useState(false);
  const [editGodName, setEditGodName] = useState('');
  const [editGodTitle, setEditGodTitle] = useState('');
  const [editGodAlignment, setEditGodAlignment] = useState('');
  const [editGodDescription, setEditGodDescription] = useState('');
  const [editGodDomains, setEditGodDomains] = useState('');
  const [editGodSymbol, setEditGodSymbol] = useState('');
  const [editGodWorshippers, setEditGodWorshippers] = useState('');
  const [editGodImage, setEditGodImage] = useState('');

  // Faction modal / add states
  const [selectedFaction, setSelectedFaction] = useState<FactionItem | null>(null);
  const [showDeleteFactionConfirm, setShowDeleteFactionConfirm] = useState(false);
  const [editFactionName, setEditFactionName] = useState('');
  const [editFactionLeader, setEditFactionLeader] = useState('');
  const [editFactionHeadquarters, setEditFactionHeadquarters] = useState('');
  const [editFactionDescription, setEditFactionDescription] = useState('');
  const [editFactionAllies, setEditFactionAllies] = useState('');
  const [editFactionEnemies, setEditFactionEnemies] = useState('');
  const [editFactionImage, setEditFactionImage] = useState('');

  // Geography modal / add states
  const [selectedGeo, setSelectedGeo] = useState<GeoItem | null>(null);
  const [showDeleteGeoConfirm, setShowDeleteGeoConfirm] = useState(false);
  const [editGeoName, setEditGeoName] = useState('');
  const [editGeoRegion, setEditGeoRegion] = useState('');
  const [editGeoClimate, setEditGeoClimate] = useState('');
  const [editGeoPopulation, setEditGeoPopulation] = useState('');
  const [editGeoDescription, setEditGeoDescription] = useState('');
  const [editGeoSecrets, setEditGeoSecrets] = useState('');
  const [editGeoImage, setEditGeoImage] = useState('');

  // Helper for generic file upload (MinIO with base64 fallback)
  const handleGenericFileUpload = async (file: File, onUrl: (url: string) => void) => {
    try {
      const res = await uploadImage(file);
      if (res && res.url) {
        onUrl(res.url);
        toast.success('Imagem enviada com sucesso!');
        return;
      }
    } catch {
      // Fallback to FileReader Data URL
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Map modal / edit states
  const [selectedMap, setSelectedMap] = useState<MapItem | null>(null);
  const [showDeleteMapConfirm, setShowDeleteMapConfirm] = useState(false);
  const [editMapTitle, setEditMapTitle] = useState('');
  const [editMapUrl, setEditMapUrl] = useState('');
  const [editMapDescription, setEditMapDescription] = useState('');
  const mapDescRef = useRef<HTMLTextAreaElement>(null);

  // Persona modal / edit states
  const [selectedPersona, setSelectedPersona] = useState<PersonaItem | null>(null);
  const [showDeletePersonaConfirm, setShowDeletePersonaConfirm] = useState(false);
  const [editPersonaName, setEditPersonaName] = useState('');
  const [editPersonaTitle, setEditPersonaTitle] = useState('');
  const [editPersonaImage, setEditPersonaImage] = useState('');
  const [editPersonaDescription, setEditPersonaDescription] = useState('');

  // Import NPC states
  const [showImportNpcModal, setShowImportNpcModal] = useState(false);
  const [availableNpcs, setAvailableNpcs] = useState<any[]>([]);

  const handleOpenImportNpcModal = async () => {
    if (campaignId) {
      try {
        const res = await api.get<any[]>(`/campaigns/${campaignId}/npcs`);
        const serverList = (res.data || []).map((npc) => ({
          ...npc,
          image: npc.portraitUrl || npc.image || '',
        }));
        setAvailableNpcs(serverList);
        setShowImportNpcModal(true);
        return;
      } catch (err) {
        console.error('Erro ao buscar NPCs da campanha:', err);
      }
    }
    try {
      const saved = localStorage.getItem('daemon_npcs');
      if (saved) {
        setAvailableNpcs(JSON.parse(saved));
      } else {
        setAvailableNpcs([]);
      }
    } catch {
      setAvailableNpcs([]);
    }
    setShowImportNpcModal(true);
  };

  const handleImportNpcAsPersona = async (npc: any) => {
    if (campaignId) {
      try {
        if (npc.id && !String(npc.id).startsWith('npc_')) {
          await api.post(`/campaigns/${campaignId}/npcs/${npc.id}/promote`);
          queryClient.invalidateQueries({ queryKey: ['lore', campaignId] });
          queryClient.invalidateQueries({ queryKey: ['campaign-npcs', campaignId] });
          toast.success(`"${npc.name}" promovido(a) a Persona com sucesso!`);
          setShowImportNpcModal(false);
          return;
        }
      } catch (err) {
        console.warn('Tentando criar artigo de lore diretamente para o NPC importado...', err);
      }

      // Fallback create directly in Lore
      const payload = {
        category: 'persona',
        title: npc.name,
        description: npc.description || '',
        imageUrl: npc.portraitUrl || npc.image || '',
        isVisible: true,
        data: {
          title: `${npc.race || 'Desconhecido'} • ${npc.occupation || 'Sem papel'}`,
          role: npc.occupation || '',
          race: npc.race || '',
          notes: npc.notes || '',
          npcId: String(npc.id || ''),
        },
      };
      await createLoreMutation.mutateAsync(payload);
      setShowImportNpcModal(false);
      return;
    }

    const newPersona: PersonaItem = {
      id: `per-npc-${npc.id}-${Date.now()}`,
      name: npc.name,
      title: `${npc.race || 'Desconhecido'} • ${npc.occupation || 'Sem papel'}`,
      role: npc.occupation || '',
      description: `${npc.description || ''}${npc.notes ? `\n\nSegredos & Anotações: ${npc.notes}` : ''}`,
      image: npc.image || npc.portraitUrl || '',
      isVisible: true,
    };
    savePersonas([newPersona, ...personas]);
    setShowImportNpcModal(false);
  };

  useEffect(() => {
    if (mapDescRef.current) {
      mapDescRef.current.style.height = 'auto';
      const scrollH = mapDescRef.current.scrollHeight;
      mapDescRef.current.style.height = `${Math.min(scrollH, 80)}px`;
    }
  }, [editMapDescription, selectedMap]);

  useEffect(() => {
    if (selectedGod) {
      setEditGodName(selectedGod.name || '');
      setEditGodTitle(selectedGod.title || '');
      setEditGodAlignment(selectedGod.alignment || '');
      setEditGodDescription(selectedGod.description || '');
      setEditGodDomains((selectedGod.domains || []).join(', '));
      setEditGodSymbol(selectedGod.symbol || '');
      setEditGodWorshippers(selectedGod.worshippers || '');
      setEditGodImage(selectedGod.image || '');
    }
  }, [selectedGod]);

  useEffect(() => {
    if (selectedFaction) {
      setEditFactionName(selectedFaction.name || '');
      setEditFactionLeader(selectedFaction.leader || '');
      setEditFactionHeadquarters(selectedFaction.headquarters || '');
      setEditFactionDescription(selectedFaction.description || '');
      setEditFactionAllies((selectedFaction.allies || []).join(', '));
      setEditFactionEnemies((selectedFaction.enemies || []).join(', '));
      setEditFactionImage(selectedFaction.image || '');
    }
  }, [selectedFaction]);

  useEffect(() => {
    if (selectedGeo) {
      setEditGeoName(selectedGeo.name || '');
      setEditGeoRegion(selectedGeo.region || '');
      setEditGeoClimate(selectedGeo.climate || '');
      setEditGeoPopulation(selectedGeo.population || '');
      setEditGeoDescription(selectedGeo.description || '');
      setEditGeoSecrets(selectedGeo.secrets || '');
      setEditGeoImage(selectedGeo.image || '');
    }
  }, [selectedGeo]);

  useEffect(() => {
    if (selectedMap) {
      setEditMapTitle(selectedMap.title || '');
      setEditMapUrl(selectedMap.url || '');
      setEditMapDescription(selectedMap.description || '');
    }
  }, [selectedMap]);

  useEffect(() => {
    if (selectedPersona) {
      setEditPersonaName(selectedPersona.name || '');
      setEditPersonaTitle(selectedPersona.title || '');
      setEditPersonaImage(selectedPersona.image || '');
      setEditPersonaDescription(selectedPersona.description || '');
    }
  }, [selectedPersona]);

  const savePersonas = (updated: PersonaItem[]) => {
    setLocalPersonas(updated);
    if (!campaignId) {
      localStorage.setItem('daemon_history_personas', JSON.stringify(updated));
    }
  };

  const togglePersonaVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = personas.find((p) => p.id === id);
    const newVis = target?.isVisible === false;
    if (campaignId && id && !id.startsWith('per-')) {
      toggleLoreVisibilityMutation.mutate({ loreId: id, isVisible: newVis });
    } else {
      const updated = personas.map((p) =>
        p.id === id ? { ...p, isVisible: newVis } : p
      );
      savePersonas(updated);
    }
  };

  const handleCreateNewPersona = () => {
    if (!campaignId) {
      toast.error('Crie uma campanha antes para vincular esta persona!');
      return;
    }
    const newPersona: PersonaItem = {
      id: `per-${Date.now()}`,
      name: '',
      title: '',
      role: '',
      description: '',
      image: '',
      isVisible: true,
    };
    setSelectedPersona(newPersona);
  };

  const handleSavePersona = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPersona) return;

    const updatedPersonaItem: PersonaItem = {
      ...selectedPersona,
      name: editPersonaName.trim() || selectedPersona.name || 'Nova Persona',
      title: editPersonaTitle.trim(),
      image: editPersonaImage.trim() || selectedPersona.image,
      description: editPersonaDescription.trim(),
    };

    if (campaignId) {
      const isExisting = selectedPersona.id && !selectedPersona.id.startsWith('per-');
      const payload = {
        category: 'persona',
        title: updatedPersonaItem.name,
        description: updatedPersonaItem.description,
        imageUrl: updatedPersonaItem.image,
        isVisible: updatedPersonaItem.isVisible !== false,
        data: {
          title: updatedPersonaItem.title,
          role: updatedPersonaItem.role,
        },
      };
      if (isExisting) {
        updateLoreMutation.mutate({ loreId: selectedPersona.id, payload });
      } else {
        createLoreMutation.mutate(payload);
      }
    } else {
      const exists = personas.some((p) => p.id === selectedPersona.id);
      const updatedList = exists
        ? personas.map((p) => (p.id === selectedPersona.id ? updatedPersonaItem : p))
        : [...personas, updatedPersonaItem];
      savePersonas(updatedList);
    }
    setSelectedPersona(null);
  };

  const handleDeletePersona = () => {
    if (!selectedPersona) return;
    if (campaignId && selectedPersona.id && !selectedPersona.id.startsWith('per-')) {
      deleteLoreMutation.mutate(selectedPersona.id);
    } else {
      const updatedList = personas.filter((p) => p.id !== selectedPersona.id);
      savePersonas(updatedList);
    }
    setSelectedPersona(null);
    setShowDeletePersonaConfirm(false);
  };

  const handlePersonaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditPersonaImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMaps = (updated: MapItem[]) => {
    setLocalMaps(updated);
    if (!campaignId) {
      localStorage.setItem('daemon_history_maps', JSON.stringify(updated));
    }
  };

  const toggleMapVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = maps.find((m) => m.id === id);
    const newVis = target?.isVisible === false;
    if (campaignId && id && !id.startsWith('map-')) {
      toggleLoreVisibilityMutation.mutate({ loreId: id, isVisible: newVis });
    } else {
      const updated = maps.map((m) =>
        m.id === id ? { ...m, isVisible: newVis } : m
      );
      saveMaps(updated);
    }
  };

  const handleCreateNewMap = () => {
    if (!campaignId) {
      toast.error('Crie uma campanha antes para vincular este mapa!');
      return;
    }
    const newMap: MapItem = {
      id: `map-${Date.now()}`,
      title: '',
      url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200',
      scale: '1:1000',
      poiCount: 0,
      description: '',
      isVisible: true,
    };
    setSelectedMap(newMap);
  };

  const handleSaveMap = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedMap) return;

    const updatedMapItem: MapItem = {
      ...selectedMap,
      title: editMapTitle.trim() || selectedMap.title || 'Novo Mapa',
      url: editMapUrl.trim() || selectedMap.url,
      description: editMapDescription.trim(),
    };

    if (campaignId) {
      const isExisting = selectedMap.id && !selectedMap.id.startsWith('map-');
      const payload = {
        category: 'mapa',
        title: updatedMapItem.title,
        description: updatedMapItem.description,
        imageUrl: updatedMapItem.url,
        isVisible: updatedMapItem.isVisible !== false,
        data: {
          scale: updatedMapItem.scale,
          poiCount: updatedMapItem.poiCount,
        },
      };
      if (isExisting) {
        updateLoreMutation.mutate({ loreId: selectedMap.id, payload });
      } else {
        createLoreMutation.mutate(payload);
      }
    } else {
      const exists = maps.some((m) => m.id === selectedMap.id);
      const updatedList = exists
        ? maps.map((m) => (m.id === selectedMap.id ? updatedMapItem : m))
        : [...maps, updatedMapItem];
      saveMaps(updatedList);
    }
    setSelectedMap(null);
  };

  const handleDeleteMap = () => {
    if (!selectedMap) return;
    if (campaignId && selectedMap.id && !selectedMap.id.startsWith('map-')) {
      deleteLoreMutation.mutate(selectedMap.id);
    } else {
      const updatedList = maps.filter((m) => m.id !== selectedMap.id);
      saveMaps(updatedList);
    }
    setSelectedMap(null);
    setShowDeleteMapConfirm(false);
  };

  const handleMapFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditMapUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveFactions = (updated: FactionItem[]) => {
    setLocalFactions(updated);
    if (!campaignId) {
      localStorage.setItem('daemon_history_factions', JSON.stringify(updated));
    }
  };

  const toggleFactionVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = factions.find((f) => f.id === id);
    const newVis = target?.isVisible === false;
    if (campaignId && id && !id.startsWith('fac-')) {
      toggleLoreVisibilityMutation.mutate({ loreId: id, isVisible: newVis });
    } else {
      const updated = factions.map((f) =>
        f.id === id ? { ...f, isVisible: newVis } : f
      );
      saveFactions(updated);
    }
  };

  const saveGeo = (updated: GeoItem[]) => {
    setLocalGeo(updated);
    if (!campaignId) {
      localStorage.setItem('daemon_history_geo', JSON.stringify(updated));
    }
  };

  const toggleGeoVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = geo.find((g) => g.id === id);
    const newVis = target?.isVisible === false;
    if (campaignId && id && !id.startsWith('geo-')) {
      toggleLoreVisibilityMutation.mutate({ loreId: id, isVisible: newVis });
    } else {
      const updated = geo.map((g) =>
        g.id === id ? { ...g, isVisible: newVis } : g
      );
      saveGeo(updated);
    }
  };

  const handleCreateNewGeo = () => {
    if (!campaignId) {
      toast.error('Crie uma campanha antes para vincular este local!');
      return;
    }
    setEditGeoImage('');
    const newLoc: GeoItem = {
      id: `geo-${Date.now()}`,
      name: '',
      region: '',
      dangerLevel: 'Baixo',
      climate: '',
      population: '',
      description: '',
      secrets: '',
      image: '',
      isVisible: true,
    };
    setSelectedGeo(newLoc);
  };

  const handleSaveGeo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGeo) return;

    const updatedGeo: GeoItem = {
      ...selectedGeo,
      name: editGeoName.trim() || selectedGeo.name || 'Novo Local',
      region: editGeoRegion.trim(),
      climate: editGeoClimate.trim(),
      population: editGeoPopulation.trim(),
      description: editGeoDescription.trim(),
      secrets: editGeoSecrets.trim(),
      image: editGeoImage.trim(),
    };

    if (campaignId) {
      const isExisting = selectedGeo.id && !selectedGeo.id.startsWith('geo-');
      const payload = {
        category: 'geografia',
        title: updatedGeo.name,
        description: updatedGeo.description,
        imageUrl: updatedGeo.image,
        isVisible: updatedGeo.isVisible !== false,
        data: {
          region: updatedGeo.region,
          climate: updatedGeo.climate,
          population: updatedGeo.population,
          secrets: updatedGeo.secrets,
          dangerLevel: updatedGeo.dangerLevel,
        },
      };
      if (isExisting) {
        updateLoreMutation.mutate({ loreId: selectedGeo.id, payload });
      } else {
        createLoreMutation.mutate(payload);
      }
    } else {
      const exists = geo.some((g) => g.id === selectedGeo.id);
      const updatedList = exists
        ? geo.map((g) => (g.id === selectedGeo.id ? updatedGeo : g))
        : [...geo, updatedGeo];
      saveGeo(updatedList);
    }
    setSelectedGeo(null);
  };

  const handleDeleteGeo = () => {
    if (!selectedGeo) return;
    if (campaignId && selectedGeo.id && !selectedGeo.id.startsWith('geo-')) {
      deleteLoreMutation.mutate(selectedGeo.id);
    } else {
      const updatedList = geo.filter((g) => g.id !== selectedGeo.id);
      saveGeo(updatedList);
    }
    setSelectedGeo(null);
    setShowDeleteGeoConfirm(false);
  };

  const handleCreateNewFaction = () => {
    if (!campaignId) {
      toast.error('Crie uma campanha antes para vincular esta facção!');
      return;
    }
    setEditFactionImage('');
    const newFac: FactionItem = {
      id: `fac-${Date.now()}`,
      name: '',
      leader: '',
      headquarters: '',
      alignment: 'Neutro',
      influence: 50,
      description: '',
      allies: [],
      enemies: [],
      image: '',
      isVisible: true,
    };
    setSelectedFaction(newFac);
  };

  const handleSaveFaction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFaction) return;
    const parsedAllies = editFactionAllies
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const parsedEnemies = editFactionEnemies
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const updatedFaction: FactionItem = {
      ...selectedFaction,
      name: editFactionName.trim() || selectedFaction.name || 'Nova Facção',
      leader: editFactionLeader.trim(),
      headquarters: editFactionHeadquarters.trim(),
      description: editFactionDescription.trim(),
      allies: parsedAllies,
      enemies: parsedEnemies,
      image: editFactionImage.trim(),
    };

    if (campaignId) {
      const isExisting = selectedFaction.id && !selectedFaction.id.startsWith('fac-');
      const payload = {
        category: 'faccao',
        title: updatedFaction.name,
        description: updatedFaction.description,
        imageUrl: updatedFaction.image,
        isVisible: updatedFaction.isVisible !== false,
        data: {
          leader: updatedFaction.leader,
          headquarters: updatedFaction.headquarters,
          alignment: updatedFaction.alignment,
          influence: updatedFaction.influence,
          allies: updatedFaction.allies,
          enemies: updatedFaction.enemies,
        },
      };
      if (isExisting) {
        updateLoreMutation.mutate({ loreId: selectedFaction.id, payload });
      } else {
        createLoreMutation.mutate(payload);
      }
    } else {
      const exists = factions.some((f) => f.id === selectedFaction.id);
      const updatedList = exists
        ? factions.map((f) => (f.id === selectedFaction.id ? updatedFaction : f))
        : [...factions, updatedFaction];
      saveFactions(updatedList);
    }
    setSelectedFaction(null);
  };

  const handleDeleteFaction = () => {
    if (!selectedFaction) return;
    if (campaignId && selectedFaction.id && !selectedFaction.id.startsWith('fac-')) {
      deleteLoreMutation.mutate(selectedFaction.id);
    } else {
      const updatedList = factions.filter((f) => f.id !== selectedFaction.id);
      saveFactions(updatedList);
    }
    setSelectedFaction(null);
    setShowDeleteFactionConfirm(false);
  };

  const savePantheon = (updated: PantheonItem[]) => {
    setLocalPantheon(updated);
    if (!campaignId) {
      localStorage.setItem('daemon_history_pantheon', JSON.stringify(updated));
    }
  };

  const togglePantheonVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = pantheon.find((p) => p.id === id);
    const newVis = target?.isVisible === false;
    if (campaignId && id && !id.startsWith('pan-') && !id.startsWith('god-')) {
      toggleLoreVisibilityMutation.mutate({ loreId: id, isVisible: newVis });
    } else {
      const updated = pantheon.map((p) =>
        p.id === id ? { ...p, isVisible: newVis } : p
      );
      savePantheon(updated);
    }
  };

  const handleCreateNewGod = () => {
    if (!campaignId) {
      toast.error('Crie uma campanha antes para vincular esta deidade!');
      return;
    }
    setEditGodImage('');
    const newGod: PantheonItem = {
      id: `god-${Date.now()}`,
      name: '',
      title: '',
      type: 'Divindade Maior',
      alignment: '',
      description: '',
      domains: [],
      symbol: '',
      worshippers: '',
      image: '',
      isVisible: true,
    };
    setSelectedGod(newGod);
  };

  const handleSaveGod = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGod) return;
    const parsedDomains = editGodDomains
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const updatedGod: PantheonItem = {
      ...selectedGod,
      name: editGodName.trim() || selectedGod.name || 'Nova Deidade',
      title: editGodTitle.trim(),
      alignment: editGodAlignment.trim(),
      description: editGodDescription.trim(),
      domains: parsedDomains.length > 0 ? parsedDomains : ['Geral'],
      symbol: editGodSymbol.trim(),
      worshippers: editGodWorshippers.trim(),
      image: editGodImage.trim(),
    };

    if (campaignId) {
      const isExisting = selectedGod.id && !selectedGod.id.startsWith('pan-') && !selectedGod.id.startsWith('god-');
      const payload = {
        category: 'deidade',
        title: updatedGod.name,
        description: updatedGod.description,
        imageUrl: updatedGod.image,
        isVisible: updatedGod.isVisible !== false,
        data: {
          title: updatedGod.title,
          alignment: updatedGod.alignment,
          domains: updatedGod.domains,
          symbol: updatedGod.symbol,
          worshippers: updatedGod.worshippers,
          type: updatedGod.type,
        },
      };
      if (isExisting) {
        updateLoreMutation.mutate({ loreId: selectedGod.id, payload });
      } else {
        createLoreMutation.mutate(payload);
      }
    } else {
      const exists = pantheon.some((g) => g.id === selectedGod.id);
      const updatedList = exists
        ? pantheon.map((g) => (g.id === selectedGod.id ? updatedGod : g))
        : [...pantheon, updatedGod];
      savePantheon(updatedList);
    }
    setSelectedGod(null);
  };

  const handleDeleteGod = () => {
    if (!selectedGod) return;
    if (campaignId && selectedGod.id && !selectedGod.id.startsWith('pan-') && !selectedGod.id.startsWith('god-')) {
      deleteLoreMutation.mutate(selectedGod.id);
    } else {
      const updatedList = pantheon.filter((g) => g.id !== selectedGod.id);
      savePantheon(updatedList);
    }
    setSelectedGod(null);
    setShowDeleteGodConfirm(false);
  };

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [showFullGalleryModal, setShowFullGalleryModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('Todas');

  const galleryCategories = React.useMemo(() => {
    const cats = new Set(photos.map((p) => p.category).filter(Boolean));
    return ['Todas', ...Array.from(cats)];
  }, [photos]);

  const filteredPhotos = React.useMemo(() => {
    if (galleryCategoryFilter === 'Todas') return photos;
    return photos.filter((p) => p.category === galleryCategoryFilter);
  }, [photos, galleryCategoryFilter]);

  const activePhotoList = galleryCategoryFilter === 'Todas' ? photos : filteredPhotos;

  const savePhotos = (updated: PhotoItem[]) => {
    setLocalPhotos(updated);
    if (!campaignId) {
      localStorage.setItem('daemon_history_photos', JSON.stringify(updated));
    }
  };

  const handleDeletePhoto = () => {
    if (!photoToDelete) return;
    if (photoToDelete.sourceType === 'photo' || (!photoToDelete.sourceType && !photoToDelete.id.startsWith('photo-'))) {
      if (campaignId && photoToDelete.id && !photoToDelete.id.startsWith('photo-')) {
        deleteLoreMutation.mutate(photoToDelete.id);
      } else {
        const updatedList = localPhotos.filter((p) => p.id !== photoToDelete.id);
        savePhotos(updatedList);
      }
    } else {
      toast.info(`Esta imagem pertence a ${photoToDelete.category} e deve ser gerenciada em seu respectivo card.`);
    }
    setPhotoToDelete(null);
    setShowDeletePhotoConfirm(false);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedPhoto || activePhotoList.length === 0) return;
    const currentIndex = activePhotoList.findIndex((p) => p.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + activePhotoList.length) % activePhotoList.length;
    setSelectedPhoto(activePhotoList[prevIndex]);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedPhoto || activePhotoList.length === 0) return;
    const currentIndex = activePhotoList.findIndex((p) => p.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % activePhotoList.length;
    setSelectedPhoto(activePhotoList[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, activePhotoList]);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || newPhotoDesc.length > 300) return;
    const item: PhotoItem = {
      id: `photo-${Date.now()}`,
      title: newPhotoTitle.trim() || 'Sem título',
      category: 'Galeria',
      url: newPhotoUrl.trim(),
      description: newPhotoDesc.trim() || '',
      date: 'Ato Ativo',
    };
    if (campaignId) {
      createLoreMutation.mutate({
        category: 'galeria',
        title: item.title,
        description: item.description,
        imageUrl: item.url,
        isVisible: true,
        data: {
          category: item.category,
          date: item.date,
        },
      });
    } else {
      savePhotos([item, ...photos]);
      toast.success('Imagem adicionada à galeria!');
    }
    setShowAddPhotoModal(false);
    setNewPhotoTitle('');
    setNewPhotoUrl('');
    setNewPhotoDesc('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-0 sm:px-1 p-0 sm:p-4 md:p-8 bg-transparent sm:bg-surface-container-lowest text-on-surface animate-fadeIn">
      {/* Top Header Bar */}
      <div className="border-b border-outline-variant/40 pb-6">
        <h1 className="font-serif text-3xl md:text-4xl text-on-surface font-medium">
          {activeCampaign?.name || 'História & Enciclopédia da Campanha'}
        </h1>
        <p className="font-sans text-xs text-on-surface-variant max-w-3xl leading-relaxed mt-1">
          {activeCampaign?.description || 'Explore a enciclopédia completa do mundo e os registros desta campanha.'}
        </p>
      </div>

      {/* Main Campaign Hero Story Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleOpenStoryModal}
        className="bg-surface-container border border-outline-variant hover:border-primary/80 transition-all cursor-pointer parchment-texture p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 relative overflow-hidden shadow-2xl group min-h-[220px] sm:min-h-[250px]"
      >
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-stretch">
          {/* Banner cover */}
          <div className="w-full lg:w-1/3 min-h-[180px] sm:min-h-[220px] lg:min-h-[250px] relative overflow-hidden border border-outline-variant/60 shrink-0">
            <ImageWithFallback
              src={activeCampaign?.ilustracao || activeCampaign?.illustrationUrl || activeCampaign?.ilustration_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600"}
              alt={activeCampaign?.name || "Lore Banner"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Full History Lore text */}
          <div className="flex-1 space-y-4 flex flex-col justify-between min-h-[180px] sm:min-h-[220px]">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-3 mb-3">
                <div className="flex items-center gap-2 text-primary">
                  <BookOpen className="w-5 h-5" />
                  <h2 className="font-serif text-xl sm:text-2xl text-on-surface font-medium group-hover:text-primary transition-colors">
                    A História
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-primary text-micro font-mono font-bold tracking-wider group-hover:underline">
                  <span>EXPANDIR</span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-xs text-on-surface-variant leading-relaxed font-sans text-justify">
                {storyText ? (
                  <p className="line-clamp-4 sm:line-clamp-6 lg:line-clamp-8">
                    {getStoryPreview(storyText, 800)}
                  </p>
                ) : (
                  <p className="line-clamp-4 italic text-on-surface-variant/60">
                    Nenhuma história registrada ainda para esta campanha. Clique para adicionar a narrativa principal.
                  </p>
                )}
              </div>
            </div>

            {/* Lore key facts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-outline-variant/30 text-caption font-mono">
              <div className="bg-surface-container-low p-2.5 border border-outline-variant/40">
                <span className="text-on-surface-variant/60 block text-micro uppercase">SISTEMA / UNIVERSO</span>
                <span className="text-primary font-bold">{activeCampaign?.universo || activeCampaign?.system || 'Daemon'}</span>
              </div>
              <div className="bg-surface-container-low p-2.5 border border-outline-variant/40">
                <span className="text-on-surface-variant/60 block text-micro uppercase">STATUS</span>
                <span className="text-on-surface font-bold">Campanha Ativa</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Photo Gallery Section (Galeria de Fotos with Horizontal Scroll) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-xl text-on-surface font-medium">Galeria</h3>
          </div>
          {(isDmUser || !!campaignId) && (
            <AddButton
              onClick={() => {
                if (!campaignId) {
                  toast.error('Crie uma campanha antes para vincular esta imagem!');
                  return;
                }
                setNewPhotoTitle('');
                setNewPhotoUrl('');
                setNewPhotoDesc('');
                setShowAddPhotoModal(true);
              }}
              label="Adicionar"
              hideLabelOnMobile={true}
            />
          )}
        </div>

        {/* Photos Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-3 snap-x">
          {photos.slice(0, 4).map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              className="w-64 shrink-0 snap-start bg-surface-container border border-outline-variant group relative overflow-hidden flex flex-col justify-between cursor-pointer"
              onClick={() => setSelectedPhoto(item)}
            >
              <div className="relative h-40 w-full overflow-hidden dark:bg-black/60 bg-surface-container-low">
                <ImageWithFallback
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  fallbackText={item.title}
                />
                {/* Category Badge */}
                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                  <span className="text-micro font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-black/75 border border-outline-variant/60 text-primary backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
                <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-black/80 dark:via-transparent dark:to-transparent opacity-60 group-hover:opacity-30 transition-opacity"></div>
                <button
                  className="absolute bottom-2 right-2 p-1.5 bg-black/80 border border-outline-variant/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-on-primary"
                  title="Expandir foto"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-surface-container-high space-y-1">
                <div className="font-serif text-sm text-on-surface font-medium truncate group-hover:text-primary transition-colors">
                  {item.title}
                </div>
                <p className="font-sans text-caption text-on-surface-variant/80 line-clamp-2">
                  {item.description}
                </p>
                {item.date && (
                  <div className="text-micro font-mono text-on-surface-variant/50 pt-1 truncate">
                    {item.date}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Card Visitar Galeria */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setShowFullGalleryModal(true)}
            className="w-64 shrink-0 snap-start bg-surface-container border border-outline-variant hover:border-primary p-4 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all group"
          >
            <div className="p-3 rounded-full bg-surface-container border border-outline-variant group-hover:border-primary text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="font-serif text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
              Visitar Galeria
            </span>
            <span className="font-sans text-micro text-on-surface-variant/70">
              Ver todos os registros ({photos.length})
            </span>
          </motion.div>
        </div>
      </div>

      {/* Interactive Tabs Navigation (Abas: Panteão, Facções, Geografia, Mapas, Personas) */}
      <div className="space-y-4 pt-4">
        {/* Tab Navigation Buttons - Side by Side Row */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 border-b border-outline-variant/60 w-full">
          {[
            { id: 'panteao', label: 'Panteão', icon: Shield, count: pantheon.length },
            { id: 'faccoes', label: 'Facções', icon: Users, count: factions.length },
            { id: 'geografia', label: 'Geografia', icon: Globe, count: geo.length },
            { id: 'mapas', label: 'Mapas', icon: MapIcon, count: maps.length },
            { id: 'personas', label: 'Personas', icon: Award, count: personas.length }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer rounded-none border border-transparent whitespace-nowrap
                  ${isActive
                    ? 'bg-primary text-on-primary border-primary font-extrabold shadow-md'
                    : 'bg-surface-container/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-outline-variant/40'
                  }
                `}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-on-primary' : 'text-primary'}`} />
                <span>{tab.label}</span>
                <span className={`text-micro px-1.5 py-0.2 font-mono ${isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Search Filter Input & Add Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center bg-surface-container border border-outline-variant px-3 py-2 focus-within:border-primary transition-all w-full max-w-md relative">
            <Search className="w-4 h-4 text-on-surface-variant/70 mr-2 shrink-0" />
            <input
              type="text"
              maxLength={50}
              placeholder={`Filtrar ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="`${editGodName.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} bg-transparent border-none outline-none text-xs w-full  placeholder:-variant/50 font-sans pr-12`"
            />
            <div className={`absolute right-8 text-micro font-mono ${searchTerm.length >= 50 ? 'text-red-500' : 'text-on-surface-variant/50'}`}>
              {searchTerm.length}/50
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-on-surface-variant hover:text-on-surface text-xs font-bold ml-1 cursor-pointer z-10">
                ✕
              </button>
            )}
          </div>

          {activeTab === 'panteao' && isDmUser && (
            <AddButton
              onClick={handleCreateNewGod}
              label="Deidade"
              hideLabelOnMobile={false}
            />
          )}

          {activeTab === 'faccoes' && isDmUser && (
            <AddButton
              onClick={handleCreateNewFaction}
              label="Facção"
              hideLabelOnMobile={false}
            />
          )}

          {activeTab === 'geografia' && isDmUser && (
            <AddButton
              onClick={handleCreateNewGeo}
              label="Local"
              hideLabelOnMobile={false}
            />
          )}

          {activeTab === 'mapas' && isDmUser && (
            <AddButton
              onClick={handleCreateNewMap}
              label="Mapa"
              hideLabelOnMobile={false}
            />
          )}

          {activeTab === 'personas' && isDmUser && (
            <div className="flex gap-2">
              <ActionButton
                onClick={handleOpenImportNpcModal}
                icon={Download}
                variant="secondary"
                label="Importar NPC"
                hideLabelOnMobile={false}
              />
              <AddButton
                onClick={handleCreateNewPersona}
                label="Persona"
                hideLabelOnMobile={false}
              />
            </div>
          )}
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {/* TAB 1: PANTEÃO */}
          {activeTab === 'panteao' && (
            <motion.div
              key="panteao"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {pantheon
                .filter((p) => isDmUser || p.isVisible !== false)
                .filter((p) =>
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.domains.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((god) => (
                  <div
                    key={god.id}
                    onClick={() => setSelectedGod(god)}
                    className={`bg-surface-container border p-4 sm:p-6 parchment-texture flex flex-col justify-between space-y-4 hover:border-primary transition-all cursor-pointer group relative ${
                      god.isVisible === false ? 'border-dashed border-error/50 opacity-70' : 'border-outline-variant'
                    }`}
                  >
                    {isDmUser && (
                      <button
                        type="button"
                        title={god.isVisible !== false ? 'Visível para os jogadores' : 'Oculto dos jogadores'}
                        onClick={(e) => togglePantheonVisibility(e, god.id)}
                        className={`absolute top-3 right-3 z-10 p-1.5 transition-all cursor-pointer border rounded-none flex items-center justify-center ${
                          god.isVisible !== false
                            ? 'bg-black/80 border-primary/40 text-white hover:bg-primary hover:text-on-primary'
                            : 'bg-black/90 border-error/50 text-white hover:bg-error hover:text-on-error'
                        }`}
                      >
                        {god.isVisible !== false ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <div className="space-y-3">
                      {god.image && (
                        <div className="relative h-40 w-full -mt-2 mb-2 overflow-hidden border border-outline-variant/60">
                          <ImageWithFallback
                            src={god.image}
                            alt={god.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            fallbackText={god.name}
                          />
                        </div>
                      )}
                      <div className="border-b border-outline-variant/40 pb-3 pr-8">
                        <h4 className="font-serif text-lg text-on-surface font-medium group-hover:text-primary transition-colors">
                          {god.name}
                        </h4>
                        <p className="font-sans text-caption text-on-surface-variant/70 italic mt-0.5">
                          {god.title}
                        </p>
                      </div>

                      <p className="font-sans text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                        {god.description}
                      </p>

                      <div className="space-y-2 text-caption font-sans pt-2">
                        <div>
                          <span className="font-bold text-on-surface uppercase text-micro block">Domínios:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {god.domains.map((dom, idx) => (
                              <span key={idx} className="bg-surface-container border border-outline-variant px-2 py-0.5 text-micro font-mono text-primary">
                                {dom}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center text-micro font-mono text-on-surface-variant/60">
                      <span>Alinhamento: {god.alignment}</span>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}

          {/* TAB 2: FACÇÕES */}
          {activeTab === 'faccoes' && (
            <motion.div
              key="faccoes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
            >
              {factions
                .filter((f) => isDmUser || f.isVisible !== false)
                .filter((f) =>
                  f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  f.leader.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((fac) => (
                  <div
                    key={fac.id}
                    onClick={() => setSelectedFaction(fac)}
                    className={`bg-surface-container border p-4 sm:p-6 parchment-texture space-y-4 hover:border-primary transition-all cursor-pointer group flex flex-col justify-between relative ${
                      fac.isVisible === false ? 'border-dashed border-error/50 opacity-70' : 'border-outline-variant'
                    }`}
                  >
                    {isDmUser && (
                      <button
                        type="button"
                        title={fac.isVisible !== false ? 'Visível para os jogadores' : 'Oculto dos jogadores'}
                        onClick={(e) => toggleFactionVisibility(e, fac.id)}
                        className={`absolute top-3 right-3 z-10 p-1.5 transition-all cursor-pointer border rounded-none flex items-center justify-center ${
                          fac.isVisible !== false
                            ? 'bg-black/80 border-primary/40 text-white hover:bg-primary hover:text-on-primary'
                            : 'bg-black/90 border-error/50 text-white hover:bg-error hover:text-on-error'
                        }`}
                      >
                        {fac.isVisible !== false ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <div className="space-y-3">
                      {fac.image && (
                        <div className="relative h-40 w-full -mt-2 mb-2 overflow-hidden border border-outline-variant/60">
                          <ImageWithFallback
                            src={fac.image}
                            alt={fac.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            fallbackText={fac.name}
                          />
                        </div>
                      )}
                      <div className="border-b border-outline-variant/40 pb-3 pr-8">
                        <h4 className="font-serif text-lg text-on-surface font-medium group-hover:text-primary transition-colors">
                          {fac.name}
                        </h4>
                      </div>

                      <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                        {fac.description}
                      </p>

                      <div className="space-y-1.5 text-caption font-sans pt-2 border-t border-outline-variant/30">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant/70 uppercase text-micro font-bold">Líder Supremo:</span>
                          <span className="text-on-surface font-bold">{fac.leader}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant/70 uppercase text-micro font-bold">Sede / Quartel:</span>
                          <span className="text-on-surface">{fac.headquarters}</span>
                        </div>
                      </div>

                      <div className="pt-2 grid grid-cols-2 gap-2 text-micro font-mono">
                        <div className="bg-surface-container p-2 border border-outline-variant/40">
                          <span className="text-primary block font-bold mb-1">Aliados:</span>
                          <ul className="list-disc list-inside text-on-surface-variant space-y-0.5">
                            {fac.allies.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-surface-container p-2 border border-outline-variant/40">
                          <span className="text-error block font-bold mb-1">Inimigos:</span>
                          <ul className="list-disc list-inside text-on-surface-variant space-y-0.5">
                            {fac.enemies.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}

          {/* TAB 3: GEOGRAFIA */}
          {activeTab === 'geografia' && (
            <motion.div
              key="geografia"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
            >
              {geo
                .filter((g) => isDmUser || g.isVisible !== false)
                .filter((g) =>
                  g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  g.region.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedGeo(loc)}
                    className={`bg-surface-container border p-4 sm:p-6 parchment-texture space-y-4 hover:border-primary transition-all cursor-pointer group flex flex-col justify-between relative ${
                      loc.isVisible === false ? 'border-dashed border-error/50 opacity-70' : 'border-outline-variant'
                    }`}
                  >
                    {isDmUser && (
                      <button
                        type="button"
                        title={loc.isVisible !== false ? 'Visível para os jogadores' : 'Oculto dos jogadores'}
                        onClick={(e) => toggleGeoVisibility(e, loc.id)}
                        className={`absolute top-3 right-3 z-10 p-1.5 transition-all cursor-pointer border rounded-none flex items-center justify-center ${
                          loc.isVisible !== false
                            ? 'bg-black/80 border-primary/40 text-white hover:bg-primary hover:text-on-primary'
                            : 'bg-black/90 border-error/50 text-white hover:bg-error hover:text-on-error'
                        }`}
                      >
                        {loc.isVisible !== false ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <div className="space-y-3">
                      {loc.image && (
                        <div className="relative h-40 w-full -mt-2 mb-2 overflow-hidden border border-outline-variant/60">
                          <ImageWithFallback
                            src={loc.image}
                            alt={loc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            fallbackText={loc.name}
                          />
                        </div>
                      )}
                      <div className="border-b border-outline-variant/40 pb-3 pr-8">
                        <span className="text-micro font-mono text-on-surface-variant/70 uppercase tracking-widest block">
                          {loc.region}
                        </span>
                        <h4 className="font-serif text-lg text-on-surface font-medium mt-1 group-hover:text-primary transition-colors">
                          {loc.name}
                        </h4>
                      </div>

                      <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                        {loc.description}
                      </p>

                      <div className="bg-surface-container p-3 border border-outline-variant/40 space-y-1.5 text-caption font-sans">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant/70 font-bold uppercase text-micro">Clima Dominante:</span>
                          <span className="text-on-surface">{loc.climate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant/70 font-bold uppercase text-micro">População Estimada:</span>
                          <span className="text-primary">{loc.population}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}

          {/* TAB 4: MAPAS */}
          {activeTab === 'mapas' && (
            <motion.div
              key="mapas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
            >
              {maps
                .filter((m) => isDmUser || m.isVisible !== false)
                .filter((m) =>
                  m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((mapItem) => (
                  <div
                    key={mapItem.id}
                    onClick={() => setSelectedMap(mapItem)}
                    className={`bg-surface-container border p-6 parchment-texture space-y-4 hover:border-primary transition-all cursor-pointer group flex flex-col justify-between relative ${
                      mapItem.isVisible === false ? 'border-dashed border-error/50 opacity-70' : 'border-outline-variant'
                    }`}
                  >
                    {isDmUser && (
                      <button
                        type="button"
                        title={mapItem.isVisible !== false ? 'Visível para os jogadores' : 'Oculto dos jogadores'}
                        onClick={(e) => toggleMapVisibility(e, mapItem.id)}
                        className={`absolute top-3 right-3 z-10 p-1.5 transition-all cursor-pointer border rounded-none flex items-center justify-center ${
                          mapItem.isVisible !== false
                            ? 'bg-black/80 border-primary/40 text-white hover:bg-primary hover:text-on-primary'
                            : 'bg-black/90 border-error/50 text-white hover:bg-error hover:text-on-error'
                        }`}
                      >
                        {mapItem.isVisible !== false ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <div className="space-y-3">
                      <div className="border-b border-outline-variant/40 pb-3 pr-8">
                        <h4 className="font-serif text-xl text-on-surface font-medium group-hover:text-primary transition-colors">
                          {mapItem.title}
                        </h4>
                      </div>

                      <div className="relative h-44 sm:h-64 w-full border border-outline-variant overflow-hidden bg-black/80">
                        <ImageWithFallback
                          src={mapItem.url}
                          alt={mapItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          referrerPolicy="no-referrer"
                          fallbackText={mapItem.title}
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute bottom-3 right-3 bg-black/80 border border-outline-variant p-2 text-white flex items-center justify-center">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>

                      <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                        {mapItem.description}
                      </p>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}

          {/* TAB 5: PERSONAS */}
          {activeTab === 'personas' && (
            <motion.div
              key="personas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
            >
              {personas
                .filter((per) => isDmUser || per.isVisible !== false)
                .filter((per) =>
                  per.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  per.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  per.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((person) => (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPersona(person)}
                    className={`bg-surface-container border p-4 sm:p-5 parchment-texture space-y-3 hover:border-primary transition-all cursor-pointer group flex flex-col justify-between relative ${
                      person.isVisible === false ? 'border-dashed border-error/50 opacity-70' : 'border-outline-variant'
                    }`}
                  >
                    {isDmUser && (
                      <button
                        type="button"
                        title={person.isVisible !== false ? 'Visível para os jogadores' : 'Oculto dos jogadores'}
                        onClick={(e) => togglePersonaVisibility(e, person.id)}
                        className={`absolute top-3 right-3 z-10 p-1.5 transition-all cursor-pointer border rounded-none flex items-center justify-center ${
                          person.isVisible !== false
                            ? 'bg-black/80 border-primary/40 text-white hover:bg-primary hover:text-on-primary'
                            : 'bg-black/90 border-error/50 text-white hover:bg-error hover:text-on-error'
                        }`}
                      >
                        {person.isVisible !== false ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <div className="space-y-3">
                      {/* CONDITIONAL IMAGE DISPLAY */}
                      {person.image && person.image.trim() !== '' && (
                        <div className="relative h-48 w-full border border-outline-variant overflow-hidden bg-black/60">
                          <ImageWithFallback
                            src={person.image}
                            alt={person.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            referrerPolicy="no-referrer"
                            fallbackText={person.name}
                          />
                        </div>
                      )}

                      <div className="pr-6">
                        <h4 className="font-serif text-lg text-on-surface font-medium group-hover:text-primary transition-colors">
                          {person.name}
                        </h4>
                        {person.title && (
                          <p className="font-sans text-caption text-on-surface-variant/70 italic mt-0.5">
                            {person.title}
                          </p>
                        )}
                      </div>

                      <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                        {person.description}
                      </p>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Deity Detail / Edit Modal */}
      <Modal
        isOpen={!!selectedGod}
        onClose={() => setSelectedGod(null)}
        title={
          isDmUser
            ? pantheon.some((g) => g.id === selectedGod?.id)
              ? 'Editar Deidade'
              : 'Nova Deidade'
            : selectedGod?.name || 'Detalhes da Divindade'
        }
        icon={<Shield className="w-5 h-5 text-primary" />}
        maxWidth="max-w-2xl"
        onSubmit={isDmUser ? handleSaveGod : undefined}
        footer={
          isDmUser ? (
            <div className={`flex items-center w-full ${pantheon.some((g) => g.id === selectedGod?.id) ? 'justify-between' : 'justify-end'}`}>
              {pantheon.some((g) => g.id === selectedGod?.id) && (
                <DeleteButton
                  onClick={() => setShowDeleteGodConfirm(true)}
                  label="Remover"
                  variant="danger-ghost"
                />
              )}
              <SaveButton
                type="submit"
                label="Salvar"
                variant="primary-ghost"
              />
            </div>
          ) : null
        }
      >
        {selectedGod && !isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            {selectedGod.image && selectedGod.image.trim() !== '' && (
              <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[44vh]">
                <ImageWithFallback
                  src={selectedGod.image}
                  alt={selectedGod.name}
                  className="max-w-full max-h-[40vh] object-contain mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Header info */}
            <div className="bg-surface-container border border-outline-variant/60 p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-on-surface-variant">
                  Alinhamento: <strong className="text-on-surface">{selectedGod.alignment}</strong>
                </span>
              </div>
              {selectedGod.title && (
                <p className="font-serif text-sm text-primary italic">
                  "{selectedGod.title}"
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h5 className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição
              </h5>
              <p className="font-sans text-xs text-on-surface leading-relaxed bg-surface-container border border-outline-variant/40 p-3.5 rounded-none select-text whitespace-pre-line">
                {selectedGod.description}
              </p>
            </div>

            {/* Domains, Symbol & Worshippers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-surface-container border border-outline-variant/40 p-3 space-y-1.5">
                <span className="font-bold text-on-surface uppercase text-micro block">Domínios</span>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {selectedGod.domains.map((dom, idx) => (
                    <span key={idx} className="bg-surface-container border border-outline-variant px-2 py-0.5 text-micro font-mono text-primary">
                      {dom}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container border border-outline-variant/40 p-3 space-y-1">
                <span className="font-bold text-on-surface uppercase text-micro block">Simbologia</span>
                <p className="text-on-surface-variant text-xs">{selectedGod.symbol}</p>
              </div>

              <div className="sm:col-span-2 bg-surface-container border border-outline-variant/40 p-3 space-y-1">
                <span className="font-bold text-on-surface uppercase text-micro block">Cultos</span>
                <p className="text-on-surface-variant text-xs">{selectedGod.worshippers}</p>
              </div>
            </div>
          </div>
        )}

        {selectedGod && isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            {(editGodImage?.trim() || selectedGod.image?.trim()) ? (
              <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[36vh]">
                <ImageWithFallback
                  src={editGodImage.trim() || selectedGod.image}
                  alt={editGodName || 'Prévia da Deidade'}
                  className="max-w-full max-h-[32vh] object-contain mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : null}

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Nome
              </label>
              <div className="w-full">
              <input
                  type="text"
                  required
                  maxLength={50}
                  value={editGodName}
                  onChange={(e) => setEditGodName(e.target.value)}
                  placeholder="Nome da deidade"
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
              {editGodName.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Subtítulo
                </label>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={50}
                    value={editGodTitle}
                    onChange={(e) => setEditGodTitle(e.target.value)}
                    placeholder="Ex: A Deusa da Luz Divina"
                    className="`${editGodTitle.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editGodTitle.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Alinhamento
                </label>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={50}
                    value={editGodAlignment}
                    onChange={(e) => setEditGodAlignment(e.target.value)}
                    placeholder="Ex: Leal e Bom"
                    className="`${editGodAlignment.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editGodAlignment.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>

            {/* God Image Field */}
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Imagem da Deidade (URL ou Upload)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="https://... ou faça upload"
                  value={editGodImage.startsWith('data:image') ? '[Imagem carregada via upload]' : editGodImage}
                  onChange={(e) => setEditGodImage(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
                <label className="px-3 py-2.5 bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGenericFileUpload(file, setEditGodImage);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição
              </label>
              <div className="w-full">
              <textarea
                  rows={3}
                  maxLength={300}
                  value={editGodDescription}
                  onChange={(e) => setEditGodDescription(e.target.value)}
                  placeholder="História e detalhes da divindade..."
                  className="`${editGodDescription.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none custom-scrollbar`"
                />
              {editGodDescription.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest block">
                  Domínios
                </label>
                <span className="text-micro font-mono text-on-surface-variant/70">
                  Separe por vírgula (Ex: Luz, Ordem, Justiça)
                </span>
              </div>
              <div className="w-full">
              <input
                  type="text"
                  maxLength={300}
                  value={editGodDomains}
                  onChange={(e) => setEditGodDomains(e.target.value)}
                  placeholder="Luz, Ordem, Justiça..."
                  className="`${editGodDomains.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {editGodDomains.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
              {editGodDomains.trim() && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {editGodDomains
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean)
                    .map((dom, idx) => (
                      <span key={idx} className="bg-surface-container border border-outline-variant px-2 py-0.5 text-micro font-mono text-primary">
                        {dom}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Simbologia
              </label>
              <div className="w-full">
              <input
                  type="text"
                  maxLength={50}
                  value={editGodSymbol}
                  onChange={(e) => setEditGodSymbol(e.target.value)}
                  placeholder="Ex: Bigorna Prateada sob Martelo de Fogo"
                  className="`${editGodSymbol.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {editGodSymbol.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
            </div>

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Cultos
              </label>
              <div className="w-full">
              <input
                  type="text"
                  maxLength={300}
                  value={editGodWorshippers}
                  onChange={(e) => setEditGodWorshippers(e.target.value)}
                  placeholder="Ex: Anões Paladinos, Clérigos da Ordem Orichalcum"
                  className="`${editGodWorshippers.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {editGodWorshippers.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete God Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteGodConfirm}
        onClose={() => setShowDeleteGodConfirm(false)}
        onConfirm={handleDeleteGod}
        title="Confirmar Remoção"
        description="Tem certeza de que deseja remover a deidade? Esta ação removerá permanentemente o registro do Panteão e não pode ser desfeita."
        itemPreview={
          <span className="font-serif text-sm text-on-surface font-bold">
            {selectedGod?.name || 'esta deidade'}
          </span>
        }
      />

      {/* Faction Detail / Edit Modal */}
      <Modal
        isOpen={!!selectedFaction}
        onClose={() => setSelectedFaction(null)}
        title={
          isDmUser
            ? factions.some((f) => f.id === selectedFaction?.id)
              ? 'Editar Facção'
              : 'Nova Facção'
            : selectedFaction?.name || 'Detalhes da Facção'
        }
        icon={<Users className="w-5 h-5 text-primary" />}
        maxWidth="max-w-2xl"
        onSubmit={isDmUser ? handleSaveFaction : undefined}
        footer={
          isDmUser ? (
            <div className={`flex items-center w-full ${factions.some((f) => f.id === selectedFaction?.id) ? 'justify-between' : 'justify-end'}`}>
              {factions.some((f) => f.id === selectedFaction?.id) && (
                <DeleteButton
                  onClick={() => setShowDeleteFactionConfirm(true)}
                  label="Remover"
                  variant="danger-ghost"
                />
              )}
              <SaveButton
                type="submit"
                label="Salvar"
                variant="primary-ghost"
              />
            </div>
          ) : null
        }
      >
        {selectedFaction && !isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            {selectedFaction.image?.trim() && (
              <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[44vh]">
                <ImageWithFallback
                  src={selectedFaction.image}
                  alt={selectedFaction.name}
                  className="max-w-full max-h-[40vh] object-contain mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div>
              <h5 className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição
              </h5>
              <p className="font-sans text-xs text-on-surface leading-relaxed bg-surface-container border border-outline-variant/40 p-3.5 rounded-none select-text whitespace-pre-line">
                {selectedFaction.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-surface-container border border-outline-variant/40 p-3 space-y-1">
                <span className="font-bold text-on-surface uppercase text-micro block">Líder Supremo</span>
                <p className="text-primary font-bold text-xs">{selectedFaction.leader || 'Não informado'}</p>
              </div>

              <div className="bg-surface-container border border-outline-variant/40 p-3 space-y-1">
                <span className="font-bold text-on-surface uppercase text-micro block">Sede / Quartel</span>
                <p className="text-on-surface-variant text-xs">{selectedFaction.headquarters || 'Não informado'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-surface-container border border-outline-variant/40 p-3 space-y-1.5">
                <span className="font-bold text-primary uppercase text-micro block">Aliados</span>
                {selectedFaction.allies && selectedFaction.allies.length > 0 ? (
                  <ul className="list-disc list-inside text-on-surface-variant space-y-0.5 text-xs">
                    {selectedFaction.allies.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-on-surface-variant/60 text-xs italic">Nenhum registrado</p>
                )}
              </div>

              <div className="bg-surface-container border border-outline-variant/40 p-3 space-y-1.5">
                <span className="font-bold text-error uppercase text-micro block">Inimigos</span>
                {selectedFaction.enemies && selectedFaction.enemies.length > 0 ? (
                  <ul className="list-disc list-inside text-on-surface-variant space-y-0.5 text-xs">
                    {selectedFaction.enemies.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-on-surface-variant/60 text-xs italic">Nenhum registrado</p>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedFaction && isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            {(editFactionImage?.trim() || selectedFaction.image?.trim()) ? (
              <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[36vh]">
                <ImageWithFallback
                  src={editFactionImage.trim() || selectedFaction.image}
                  alt={editFactionName || 'Prévia da Facção'}
                  className="max-w-full max-h-[32vh] object-contain mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : null}

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Nome da Facção
              </label>
              <div className="w-full">
              <input
                  type="text"
                  required
                  maxLength={50}
                  value={editFactionName}
                  onChange={(e) => setEditFactionName(e.target.value)}
                  placeholder="Nome da facção"
                  className={`${editFactionName.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`}
                />
              {editFactionName.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
            </div>

            {/* Faction Image Field */}
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Brasão / Imagem da Facção (URL ou Upload)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="https://... ou faça upload"
                  value={editFactionImage.startsWith('data:image') ? '[Imagem carregada via upload]' : editFactionImage}
                  onChange={(e) => setEditFactionImage(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
                <label className="px-3 py-2.5 bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGenericFileUpload(file, setEditFactionImage);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Líder Supremo
                </label>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={50}
                    value={editFactionLeader}
                    onChange={(e) => setEditFactionLeader(e.target.value)}
                    placeholder="Ex: Alto Inquisidor Vane"
                    className="`${editFactionLeader.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editFactionLeader.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Sede / Quartel
                </label>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={50}
                    value={editFactionHeadquarters}
                    onChange={(e) => setEditFactionHeadquarters(e.target.value)}
                    placeholder="Ex: Catedral Solar de Aethelgard"
                    className="`${editFactionHeadquarters.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editFactionHeadquarters.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição
              </label>
              <div className="w-full">
              <textarea
                  rows={3}
                  maxLength={300}
                  value={editFactionDescription}
                  onChange={(e) => setEditFactionDescription(e.target.value)}
                  placeholder="História, objetivos e atuação da facção..."
                  className="`${editFactionDescription.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none custom-scrollbar`"
                />
              {editFactionDescription.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest block">
                    Aliados
                  </label>
                  <span className="text-micro font-mono text-on-surface-variant/70">
                    Separe por vírgula
                  </span>
                </div>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={300}
                    value={editFactionAllies}
                    onChange={(e) => setEditFactionAllies(e.target.value)}
                    placeholder="Ex: Guarda Imperial, Ordem dos Clérigos"
                    className="`${editFactionAllies.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editFactionAllies.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest block">
                    Inimigos
                  </label>
                  <span className="text-micro font-mono text-on-surface-variant/70">
                    Separe por vírgula
                  </span>
                </div>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={300}
                    value={editFactionEnemies}
                    onChange={(e) => setEditFactionEnemies(e.target.value)}
                    placeholder="Ex: Culto da Serpente, Aliança dos Renegados"
                    className="`${editFactionEnemies.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editFactionEnemies.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Faction Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteFactionConfirm}
        onClose={() => setShowDeleteFactionConfirm(false)}
        onConfirm={handleDeleteFaction}
        title="Confirmar Remoção de Facção"
        description="Tem certeza de que deseja remover a facção? Esta ação removerá permanentemente o registro de Facções e não pode ser desfeita."
        itemPreview={
          <span className="font-serif text-sm text-on-surface font-bold">
            {selectedFaction?.name || 'esta facção'}
          </span>
        }
      />

      {/* Geography Detail / Edit Modal */}
      <Modal
        isOpen={!!selectedGeo}
        onClose={() => setSelectedGeo(null)}
        title={
          isDmUser
            ? geo.some((g) => g.id === selectedGeo?.id)
              ? 'Editar Local'
              : 'Novo Local'
            : selectedGeo?.name || 'Detalhes do Local'
        }
        icon={<Globe className="w-5 h-5 text-primary" />}
        maxWidth="max-w-2xl"
        onSubmit={isDmUser ? handleSaveGeo : undefined}
        footer={
          isDmUser ? (
            <div className={`flex items-center w-full ${geo.some((g) => g.id === selectedGeo?.id) ? 'justify-between' : 'justify-end'}`}>
              {geo.some((g) => g.id === selectedGeo?.id) && (
                <DeleteButton
                  onClick={() => setShowDeleteGeoConfirm(true)}
                  label="Remover"
                  variant="danger-ghost"
                />
              )}
              <SaveButton
                type="submit"
                label="Salvar"
                variant="primary-ghost"
              />
            </div>
          ) : null
        }
      >
        {selectedGeo && !isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            {selectedGeo.image?.trim() && (
              <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[44vh]">
                <ImageWithFallback
                  src={selectedGeo.image}
                  alt={selectedGeo.name}
                  className="max-w-full max-h-[40vh] object-contain mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {selectedGeo.region && (
              <span className="text-micro font-mono text-primary uppercase tracking-widest block font-bold">
                Região: {selectedGeo.region}
              </span>
            )}

            <div>
              <h5 className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição
              </h5>
              <p className="font-sans text-xs text-on-surface leading-relaxed bg-surface-container border border-outline-variant/40 p-3.5 rounded-none select-text whitespace-pre-line">
                {selectedGeo.description || 'Nenhuma descrição informada.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-surface-container border border-outline-variant/40 p-3 space-y-1">
                <span className="font-bold text-on-surface uppercase text-micro block">Clima Dominante</span>
                <p className="text-on-surface-variant text-xs">{selectedGeo.climate || 'Não informado'}</p>
              </div>

              <div className="bg-surface-container border border-outline-variant/40 p-3 space-y-1">
                <span className="font-bold text-on-surface uppercase text-micro block">População Estimada</span>
                <p className="text-primary font-bold text-xs">{selectedGeo.population || 'Não informada'}</p>
              </div>
            </div>
          </div>
        )}

        {selectedGeo && isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            {(editGeoImage?.trim() || selectedGeo.image?.trim()) ? (
              <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[36vh]">
                <ImageWithFallback
                  src={editGeoImage.trim() || selectedGeo.image}
                  alt={editGeoName || 'Prévia do Local'}
                  className="max-w-full max-h-[32vh] object-contain mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Nome do Local
                </label>
                <div className="w-full">
              <input
                    type="text"
                    required
                    maxLength={50}
                    value={editGeoName}
                    onChange={(e) => setEditGeoName(e.target.value)}
                    placeholder="Ex: Vale dos Sussurros"
                    className={`${editGeoName.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`}
                  />
              {editGeoName.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Região / Continente
                </label>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={50}
                    value={editGeoRegion}
                    onChange={(e) => setEditGeoRegion(e.target.value)}
                    placeholder="Ex: Fronteira Leste"
                    className={`${editGeoRegion.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`}
                  />
              {editGeoRegion.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>

            {/* Geo Image Field */}
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Ilustração / Foto do Local (URL ou Upload)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="https://... ou faça upload"
                  value={editGeoImage.startsWith('data:image') ? '[Imagem carregada via upload]' : editGeoImage}
                  onChange={(e) => setEditGeoImage(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
                <label className="px-3 py-2.5 bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGenericFileUpload(file, setEditGeoImage);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição
              </label>
              <div className="w-full">
              <textarea
                  rows={3}
                  maxLength={300}
                  value={editGeoDescription}
                  onChange={(e) => setEditGeoDescription(e.target.value)}
                  placeholder="Geografia, vegetação, construções e história..."
                  className="`${editGeoDescription.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none custom-scrollbar`"
                />
              {editGeoDescription.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Clima Dominante
                </label>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={50}
                    value={editGeoClimate}
                    onChange={(e) => setEditGeoClimate(e.target.value)}
                    placeholder="Ex: Frio e Nevoeiro Constante"
                    className="`${editGeoClimate.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editGeoClimate.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  População Estimada
                </label>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={50}
                    value={editGeoPopulation}
                    onChange={(e) => setEditGeoPopulation(e.target.value)}
                    placeholder="Ex: ~12.000 habitantes"
                    className="`${editGeoPopulation.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editGeoPopulation.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Geo Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteGeoConfirm}
        onClose={() => setShowDeleteGeoConfirm(false)}
        onConfirm={handleDeleteGeo}
        title="Confirmar Remoção de Local"
        description="Tem certeza de que deseja remover o local? Esta ação removerá permanentemente o registro de Geografia e não pode ser desfeita."
        itemPreview={
          <span className="font-serif text-sm text-on-surface font-bold">
            {selectedGeo?.name || 'este local'}
          </span>
        }
      />

      {/* Map Detail / Edit Modal */}
      <Modal
        isOpen={!!selectedMap}
        onClose={() => setSelectedMap(null)}
        hideHeader={!isDmUser}
        title={
          isDmUser
            ? maps.some((m) => m.id === selectedMap?.id)
              ? 'Editar Mapa'
              : 'Novo Mapa'
            : selectedMap?.title || 'Visualizar Mapa'
        }
        icon={isDmUser ? <MapIcon className="w-5 h-5 text-primary" /> : undefined}
        maxWidth="max-w-4xl"
        zIndex="z-[1050]"
        bodyClassName={
          !isDmUser
            ? 'overflow-hidden p-0 flex items-center justify-center min-h-[50vh] max-h-[75vh] relative group'
            : 'space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2'
        }
        onSubmit={isDmUser ? handleSaveMap : undefined}
        footer={
          selectedMap ? (
            !isDmUser ? (
              (selectedMap.title || selectedMap.description) ? (
                <div className="w-full space-y-1 text-left">
                  {selectedMap.title && (
                    <h4 className="font-serif text-lg text-on-surface font-medium">
                      {selectedMap.title}
                    </h4>
                  )}
                  {selectedMap.description && (
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed select-text">
                      {selectedMap.description}
                    </p>
                  )}
                </div>
              ) : undefined
            ) : (
              <div className={`flex items-center w-full ${maps.some((m) => m.id === selectedMap.id) ? 'justify-between' : 'justify-end'}`}>
                {maps.some((m) => m.id === selectedMap.id) && (
                  <DeleteButton
                    onClick={() => setShowDeleteMapConfirm(true)}
                    label="Remover"
                    variant="danger-ghost"
                  />
                )}
                <SaveButton
                  type="submit"
                  label="Salvar"
                  variant="primary-ghost"
                />
              </div>
            )
          ) : undefined
        }
      >
        {selectedMap && !isDmUser && (
          <div className="w-full h-full bg-black/95 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
            <ImageWithFallback
              src={selectedMap.url}
              alt={selectedMap.title || 'Mapa Ampliado'}
              className="max-w-full max-h-[72vh] object-contain mx-auto select-none"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {selectedMap && isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[44vh]">
              <ImageWithFallback
                src={editMapUrl || selectedMap.url}
                alt={editMapTitle || 'Prévia do Mapa'}
                className="max-w-full max-h-[40vh] object-contain mx-auto select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Título do Mapa
                </label>
                <div className="w-full">
              <input
                    type="text"
                    required
                    maxLength={50}
                    value={editMapTitle}
                    onChange={(e) => setEditMapTitle(e.target.value)}
                    placeholder="Ex: Mapa do Vale Prateado"
                    className={`w-full bg-surface-container border border-outline-variant text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none ${editMapTitle.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'}`}
                  />
                  {editMapTitle.length >= 50 && (
                    <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                      Limite atingido (50)
                    </div>
                  )}
                </div>
              </div>

              {/* Map Image Field */}
              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Imagem do Mapa (URL ou Upload)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="https://... ou faça upload"
                    value={editMapUrl.startsWith('data:image') ? '[Imagem carregada via upload]' : editMapUrl}
                    onChange={(e) => setEditMapUrl(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                  />
                  <label className="px-3 py-2.5 bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleGenericFileUpload(file, setEditMapUrl);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição do Mapa
              </label>
              <div className="w-full">
              <textarea
                  ref={mapDescRef}
                  rows={1}
                  maxLength={300}
                  value={editMapDescription}
                  onChange={(e) => setEditMapDescription(e.target.value)}
                  placeholder="Detalhes geográficos, rotas ou pontos marcantes..."
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none custom-scrollbar min-h-[38px] max-h-[80px] overflow-y-auto"
                />
              {editMapDescription.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Map Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteMapConfirm}
        onClose={() => setShowDeleteMapConfirm(false)}
        onConfirm={handleDeleteMap}
        title="Confirmar Remoção de Mapa"
        description="Tem certeza de que deseja remover o mapa? Esta ação removerá permanentemente o mapa e não pode ser desfeita."
        itemPreview={
          <span className="font-serif text-sm text-on-surface font-bold">
            {selectedMap?.title || 'este mapa'}
          </span>
        }
      />

      {/* Expanded Photo Detail Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        hideHeader={true}
        maxWidth="max-w-6xl"
        zIndex="z-[1050]"
        bodyClassName="overflow-hidden p-0 flex items-center justify-center min-h-[50vh] max-h-[75vh] relative group"
        footer={
          selectedPhoto && (selectedPhoto.title || selectedPhoto.description) ? (
            <div className="w-full space-y-1.5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                {selectedPhoto.title && (
                  <h4 className="font-serif text-lg text-on-surface font-medium">
                    {selectedPhoto.title}
                  </h4>
                )}
                {selectedPhoto.category && (
                  <span className="text-micro font-mono font-bold uppercase tracking-wider px-2 py-0.5 border border-primary/40 text-primary bg-primary/10">
                    {selectedPhoto.category}
                  </span>
                )}
              </div>
              {selectedPhoto.date && (
                <span className="text-micro font-mono text-on-surface-variant/60 block">
                  {selectedPhoto.date}
                </span>
              )}
              {selectedPhoto.description && (
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed select-text">
                  {selectedPhoto.description}
                </p>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedPhoto && (
          <div className="w-full h-full bg-black/95 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
            {activePhotoList.length > 1 && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 z-20 text-on-surface bg-black/60 hover:bg-black/90 p-2 sm:p-3 rounded-full transition-all cursor-pointer border border-outline-variant/40 hover:scale-110"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-on-surface" />
              </button>
            )}

            <ImageWithFallback
              src={selectedPhoto.url}
              alt={selectedPhoto.title || 'Imagem da Galeria'}
              className="max-w-full max-h-[72vh] object-contain mx-auto select-none"
              referrerPolicy="no-referrer"
            />

            {activePhotoList.length > 1 && (
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 z-20 text-on-surface bg-black/60 hover:bg-black/90 p-2 sm:p-3 rounded-full transition-all cursor-pointer border border-outline-variant/40 hover:scale-110"
                aria-label="Próxima"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-on-surface" />
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Full Gallery Modal */}
      <Modal
        isOpen={showFullGalleryModal}
        onClose={() => {
          setShowFullGalleryModal(false);
          setGalleryCategoryFilter('Todas');
        }}
        title="Galeria Visual da Campanha"
        maxWidth="max-w-5xl"
        bodyClassName="space-y-4 flex-1 overflow-y-auto custom-scrollbar p-1 sm:p-2"
        footer={
          (isDmUser || !!campaignId) ? (
            <div className="flex justify-end items-center w-full">
              <AddButton
                onClick={() => {
                  setShowFullGalleryModal(false);
                  setShowAddPhotoModal(true);
                }}
                label="Nova Foto"
                variant="secondary"
              />
            </div>
          ) : undefined
        }
      >
        {/* Category Filter Tabs */}
        {galleryCategories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 border-b border-outline-variant/40">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGalleryCategoryFilter(cat)}
                className={`px-3 py-1 font-mono text-caption uppercase tracking-wider font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  galleryCategoryFilter === cat
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/50'
                }`}
              >
                {cat} {cat !== 'Todas' ? `(${photos.filter(p => p.category === cat).length})` : `(${photos.length})`}
              </button>
            ))}
          </div>
        )}

        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-outline-variant bg-surface-container">
            <ImageIcon className="w-10 h-10 text-outline-variant mb-2" />
            <p className="font-serif text-base text-on-surface">Nenhuma imagem nesta categoria</p>
            <p className="font-sans text-xs text-on-surface-variant/70 mt-1">Imagens inseridas em crônicas, deuses, facções, locais ou mapas aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPhotos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="bg-surface-container border border-outline-variant hover:border-primary group relative overflow-hidden aspect-video sm:aspect-4/3 cursor-pointer transition-all"
              >
                <ImageWithFallback
                  src={item.url}
                  alt={item.title || 'Foto da Galeria'}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  fallbackText={item.title}
                />

                {/* Category Badge */}
                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                  <span className="text-micro font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-black/75 border border-outline-variant/60 text-primary backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <span className="font-serif text-sm text-white font-medium truncate">
                    {item.title}
                  </span>
                  {item.description && (
                    <p className="font-sans text-micro text-white/80 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>

                {isDmUser && item.sourceType === 'photo' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoToDelete(item);
                      setShowDeletePhotoConfirm(true);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-error/90 text-on-surface border border-outline-variant hover:border-error opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-full z-20"
                    title="Remover Imagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Photo Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={showDeletePhotoConfirm}
        onClose={() => {
          setShowDeletePhotoConfirm(false);
          setPhotoToDelete(null);
        }}
        onConfirm={handleDeletePhoto}
        title="Remover Imagem"
        description="Tem certeza que deseja remover esta imagem da galeria? Esta ação não poderá ser desfeita."
        itemPreview={
          photoToDelete?.title ? (
            <span className="font-serif text-sm text-on-surface font-bold">
              {photoToDelete.title}
            </span>
          ) : undefined
        }
      />

      {/* Add Photo Modal */}
      <Modal
        isOpen={showAddPhotoModal}
        onClose={() => setShowAddPhotoModal(false)}
        title="Adicionar Imagem"
        icon={<ImageIcon className="w-5 h-5 text-primary" />}
        maxWidth="max-w-lg"
        onSubmit={handleAddPhoto}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <SaveButton
              type="submit"
              label={isUploadingPhoto ? 'Enviando...' : 'Salvar'}
              variant="primary-ghost"
              disabled={isUploadingPhoto || !newPhotoUrl.trim() || newPhotoDesc.length > 300}
            />
          </div>
        }
      >
        <div className="space-y-4 text-xs font-sans">
          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Imagem (Upload ou Link) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cole o link da imagem (https://...) ou faça upload"
                value={newPhotoUrl.startsWith('data:image') ? '[Imagem carregada via upload]' : newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
              />
              <label className="bg-surface-container border border-outline-variant hover:border-primary text-on-surface-variant hover:text-on-surface px-3.5 py-2.5 flex items-center gap-1.5 cursor-pointer text-xs font-bold uppercase shrink-0">
                <Upload className="w-4 h-4 text-primary" />
                <span>{isUploadingPhoto ? 'Enviando...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingPhoto}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploadingPhoto(true);
                      handleGenericFileUpload(file, (url) => {
                        setNewPhotoUrl(url);
                        setIsUploadingPhoto(false);
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            {newPhotoUrl && (
              <div className="mt-2 h-44 w-full bg-black/60 border border-outline-variant/40 overflow-hidden flex items-center justify-center relative p-1 group">
                <ImageWithFallback
                  src={newPhotoUrl}
                  alt="Pré-visualização"
                  className="h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setNewPhotoUrl('')}
                  className="absolute top-2 right-2 bg-black/80 hover:bg-red-950 text-white/80 hover:text-red-400 p-1.5 rounded-none text-xs border border-white/20 transition-all cursor-pointer"
                  title="Remover imagem"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Título
            </label>
            <div className="w-full">
              <input
                type="text"
                maxLength={50}
                placeholder="Digite o título..."
                value={newPhotoTitle}
                onChange={(e) => setNewPhotoTitle(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
              />
              {newPhotoTitle.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest block">
                Legenda
              </label>

            </div>
            <div className="w-full">
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Digite a legenda (máx. 300 caracteres)..."
                value={newPhotoDesc}
                onChange={(e) => setNewPhotoDesc(e.target.value)}
                className="`${newPhotoDesc.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none custom-scrollbar`"
              />
              {newPhotoDesc.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>

          </div>
        </div>
      </Modal>

      {/* Campaign Story Modal */}
      <Modal
        isOpen={showStoryModal}
        onClose={() => {
          setShowStoryModal(false);
          setIsEditingStory(false);
        }}
        title="A História"
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        maxWidth="max-w-5xl"
        footer={
          isDmUser ? (
            <div className="flex justify-end gap-3 w-full">
              <EditButton
                onClick={() => setIsEditingStory(!isEditingStory)}
                label="Editar"
                variant={isEditingStory ? "primary-ghost" : "secondary"}
              />
              {isEditingStory && editedStory !== storyText && (
                <SaveButton
                  onClick={handleSaveStory}
                  label="Salvar"
                  variant="primary-ghost"
                />
              )}
            </div>
          ) : undefined
        }
      >
        <div className="space-y-4 font-sans text-xs">
          {isDmUser && isEditingStory ? (
            <div className="space-y-2">
              <label className="block font-mono text-micro text-primary font-bold uppercase tracking-widest">
                Editar História da Campanha (Visível para todos)
              </label>
              <textarea
                value={editedStory}
                onChange={(e) => setEditedStory(e.target.value)}
                rows={16}
                className="w-full bg-surface-container border border-outline-variant p-4 font-sans text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-primary custom-scrollbar rounded-none text-on-surface"
                placeholder="Escreva a história completa da campanha aqui..."
              />
            </div>
          ) : (
            <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed text-on-surface select-text whitespace-pre-wrap">
              {storyText.split('\n\n').map((paragraph, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? "first-letter:text-2xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-2 text-justify"
                      : "text-justify"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Persona Detail / Edit Modal */}
      <Modal
        isOpen={!!selectedPersona}
        onClose={() => setSelectedPersona(null)}
        title={
          isDmUser
            ? personas.some((p) => p.id === selectedPersona?.id)
              ? 'Editar Persona'
              : 'Nova Persona'
            : selectedPersona?.name || 'Detalhes da Persona'
        }
        icon={<Users className="w-5 h-5 text-primary" />}
        maxWidth="max-w-2xl"
        zIndex="z-[1050]"
        bodyClassName={
          isDmUser
            ? 'space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2'
            : 'space-y-4 text-xs font-sans'
        }
        onSubmit={isDmUser ? handleSavePersona : undefined}
        footer={
          isDmUser ? (
            <div className={`flex items-center w-full ${personas.some((p) => p.id === selectedPersona?.id) ? 'justify-between' : 'justify-end'}`}>
              {personas.some((p) => p.id === selectedPersona?.id) && (
                <DeleteButton
                  onClick={() => setShowDeletePersonaConfirm(true)}
                  label="Remover"
                  variant="danger-ghost"
                />
              )}
              <SaveButton
                type="submit"
                label="Salvar"
                variant="primary-ghost"
              />
            </div>
          ) : null
        }
      >
        {selectedPersona && !isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            {selectedPersona.image && selectedPersona.image.trim() !== '' && (
              <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[44vh]">
                <ImageWithFallback
                  src={selectedPersona.image}
                  alt={selectedPersona.name}
                  className="max-w-full max-h-[40vh] object-contain mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {selectedPersona.title && (
              <div className="bg-surface-container border border-outline-variant/60 p-3.5 space-y-2">
                <p className="font-serif text-sm text-primary italic">
                  "{selectedPersona.title}"
                </p>
              </div>
            )}

            <div>
              <h5 className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição
              </h5>
              <p className="font-sans text-xs text-on-surface leading-relaxed bg-surface-container border border-outline-variant/40 p-3.5 rounded-none select-text whitespace-pre-line">
                {selectedPersona.description}
              </p>
            </div>
          </div>
        )}

        {selectedPersona && isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            {(editPersonaImage?.trim() || selectedPersona.image?.trim()) ? (
              <div className="w-full bg-black/95 flex items-center justify-center p-2 overflow-hidden relative rounded-none border border-outline-variant/40 max-h-[36vh]">
                <ImageWithFallback
                  src={editPersonaImage.trim() || selectedPersona.image}
                  alt={editPersonaName || 'Prévia da Persona'}
                  className="max-w-full max-h-[32vh] object-contain mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Nome da Persona
                </label>
                <div className="w-full">
              <input
                    type="text"
                    required
                    maxLength={50}
                    value={editPersonaName}
                    onChange={(e) => setEditPersonaName(e.target.value)}
                    placeholder="Nome da persona"
                    className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                  />
              {editPersonaName.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div>
                <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Subtítulo / Título
                </label>
                <div className="w-full">
              <input
                    type="text"
                    maxLength={50}
                    value={editPersonaTitle}
                    onChange={(e) => setEditPersonaTitle(e.target.value)}
                    placeholder="Ex: O Mestre dos Assassinos"
                    className="`${editPersonaTitle.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {editPersonaTitle.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>

            {/* Persona Image Field */}
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Imagem da Persona (URL ou Upload)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="https://... ou faça upload"
                  value={editPersonaImage.startsWith('data:image') ? '[Imagem carregada via upload]' : editPersonaImage}
                  onChange={(e) => setEditPersonaImage(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
                <label className="px-3 py-2.5 bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGenericFileUpload(file, setEditPersonaImage);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                Descrição
              </label>
              <div className="w-full">
              <textarea
                  rows={3}
                  maxLength={300}
                  value={editPersonaDescription}
                  onChange={(e) => setEditPersonaDescription(e.target.value)}
                  placeholder="História e detalhes..."
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none custom-scrollbar"
                />
              {editPersonaDescription.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Persona Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeletePersonaConfirm}
        onClose={() => setShowDeletePersonaConfirm(false)}
        onConfirm={handleDeletePersona}
        title="Confirmar Remoção de Persona"
        description="Tem certeza de que deseja remover a persona? Esta ação removerá permanentemente a persona e não pode ser desfeita."
        itemPreview={
          <span className="font-serif text-sm text-on-surface font-bold">
            {selectedPersona?.name || 'esta persona'}
          </span>
        }
      />

      {/* Import NPC Modal */}
      <Modal
        isOpen={showImportNpcModal}
        onClose={() => setShowImportNpcModal(false)}
        title="Importar NPC como Persona"
        icon={<Download className="w-5 h-5 text-primary" />}
        maxWidth="max-w-xl"
        zIndex="z-[1080]"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-on-surface-variant leading-relaxed">
            Selecione um NPC criado na página de Contatos/NPCs para promovê-lo a Persona na História da Campanha:
          </p>

          {availableNpcs.length === 0 ? (
            <div className="p-8 text-center bg-surface-container border border-outline-variant/40 space-y-2">
              <Users className="w-8 h-8 text-outline-variant mx-auto opacity-50" />
              <p className="text-on-surface font-medium">Nenhum NPC cadastrado</p>
              <p className="text-caption text-on-surface-variant">
                Vá até a aba "NPCs / Contatos" no menu principal para registrar novos NPCs.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
              {availableNpcs.map((npc) => (
                <div
                  key={npc.id}
                  className="bg-surface-container border border-outline-variant/60 p-3.5 flex items-center justify-between gap-4 hover:border-primary/60 transition-all"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {(npc.image || npc.portraitUrl) && (
                      <ImageWithFallback
                        src={npc.image || npc.portraitUrl}
                        alt={npc.name}
                        className="w-12 h-12 object-cover border border-outline-variant/60 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm text-on-surface font-medium truncate">{npc.name}</h4>
                        {npc.isPersona && (
                          <span className="text-micro font-mono px-1.5 py-0.5 bg-primary/20 text-primary border border-primary/40 uppercase">
                            Já é Persona
                          </span>
                        )}
                      </div>
                      <p className="text-micro text-primary uppercase font-mono tracking-wider truncate">
                        {npc.race || 'Sem raça'} • {npc.occupation || 'Sem ocupação'}
                      </p>
                      {npc.description && (
                        <p className="text-caption text-on-surface-variant/70 truncate mt-0.5">
                          {npc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <AddButton
                    onClick={() => handleImportNpcAsPersona(npc)}
                    label={npc.isPersona ? "Reimportar" : "Importar"}
                    hideLabelOnMobile={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
