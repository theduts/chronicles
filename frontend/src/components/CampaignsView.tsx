import React, { useState, useRef } from 'react';
import PageHeader from './common/PageHeader';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Map, Plus, Trash2, X, Link, Image as ImageIcon, Save, Sparkles, BookOpen, AlertTriangle, UserPlus, Copy, Check, Users } from 'lucide-react';
import { Campaign } from '../types';
import CustomSelect from './CustomSelect';
import Modal from './Modal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Toggle from './Toggle';
import { ActionButton, SaveButton, AddButton, DeleteButton } from './ActionButtons';
import ImageWithFallback from './ImageWithFallback';

interface CampaignsViewProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  user: { name: string; email: string; role: 'player' | 'dm' };
  activeCampaignId: string;
  setActiveCampaignId: (id: string) => void;
}

const DEFAULT_IMAGES = {
  Medieval: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800",
  Cyberpunk: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=800",
  Cthullu: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800",
  Outro: "https://images.unsplash.com/photo-1519074069444-1ba4e6664104?q=80&w=800"
};

export default function CampaignsView({
  campaigns,
  setCampaigns,
  user,
  activeCampaignId,
  setActiveCampaignId
}: CampaignsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  // DM Invite Modal states
  const [campaignForInvite, setCampaignForInvite] = useState<Campaign | null>(null);
  const [playerEmailToInvite, setPlayerEmailToInvite] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Player Join Modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for creation
  const [newCampName, setNewCampName] = useState('');
  const [newCampSubtitle, setNewCampSubtitle] = useState('');
  const [newCampUniverse, setNewCampUniverse] = useState<'Medieval' | 'Cyberpunk' | 'Cthullu' | 'Outro'>('Medieval');
  const [newCampLore, setNewCampLore] = useState('');
  const [newCampIlustracaoType, setNewCampIlustracaoType] = useState<'link' | 'upload'>('link');
  const [newCampIlustracaoLink, setNewCampIlustracaoLink] = useState('');
  const [newCampIlustracaoBase64, setNewCampIlustracaoBase64] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for editing
  const [editCampName, setEditCampName] = useState('');
  const [editCampSubtitle, setEditCampSubtitle] = useState('');
  const [editCampUniverse, setEditCampUniverse] = useState<'Medieval' | 'Cyberpunk' | 'Cthullu' | 'Outro'>('Medieval');
  const [editCampLore, setEditCampLore] = useState('');
  const [editCampIlustracaoType, setEditCampIlustracaoType] = useState<'link' | 'upload'>('link');
  const [editCampIlustracaoLink, setEditCampIlustracaoLink] = useState('');
  const [editCampIlustracaoBase64, setEditCampIlustracaoBase64] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditCampIlustracaoBase64(reader.result as string);
        } else {
          setNewCampIlustracaoBase64(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const queryClient = useQueryClient();

  const createCampaignMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      subtitulo?: string;
      universo?: string;
      lore?: string;
      ilustracao?: string;
    }) => {
      const response = await api.post<Campaign>('/campaigns', payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (data?.id) {
        setActiveCampaignId(data.id);
        localStorage.setItem('daemon_active_campaign_id', data.id);
      }
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const response = await api.put<Campaign>(`/campaigns/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: async ({ campaignId, email }: { campaignId: string; email: string }) => {
      const response = await api.post<Campaign>(`/campaigns/${campaignId}/players`, { email });
      return response.data;
    },
    onSuccess: (updatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? { ...c, ...updatedCampaign } : c));
      if (campaignForInvite && campaignForInvite.id === updatedCampaign.id) {
        setCampaignForInvite(prev => prev ? { ...prev, players: updatedCampaign.players } : null);
      }
      setInviteFeedback({ type: 'success', message: 'Jogador vinculado com sucesso!' });
      setPlayerEmailToInvite('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erro ao vincular jogador por e-mail.';
      setInviteFeedback({ type: 'error', message: msg });
    },
  });

  const joinCampaignMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const response = await api.post<Campaign>('/campaigns/join', { inviteCode });
      return response.data;
    },
    onSuccess: (joinedCamp) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (joinedCamp?.id) {
        setCampaigns(prev => {
          const exists = prev.some(c => c.id === joinedCamp.id);
          return exists ? prev.map(c => c.id === joinedCamp.id ? joinedCamp : c) : [...prev, joinedCamp];
        });
        setActiveCampaignId(joinedCamp.id);
        localStorage.setItem('daemon_active_campaign_id', joinedCamp.id);
      }
      setShowJoinModal(false);
      setJoinCode('');
      setJoinFeedback(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Código de convite inválido ou erro ao ingressar.';
      setJoinFeedback({ type: 'error', message: msg });
    },
  });

  const handleCopyCode = async () => {
    if (!campaignForInvite?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(campaignForInvite.inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleInvitePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForInvite || !playerEmailToInvite.trim()) return;
    setInviteFeedback(null);
    addPlayerMutation.mutate({
      campaignId: campaignForInvite.id,
      email: playerEmailToInvite.trim()
    });
  };

  const handleJoinCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinFeedback(null);
    joinCampaignMutation.mutate(joinCode.trim().toUpperCase());
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;

    const ilustracao = newCampIlustracaoType === 'upload' 
      ? (newCampIlustracaoBase64 || DEFAULT_IMAGES[newCampUniverse]) 
      : (newCampIlustracaoLink.trim() || DEFAULT_IMAGES[newCampUniverse]);

    const payload = {
      name: newCampName.trim(),
      subtitulo: newCampSubtitle.trim(),
      universo: newCampUniverse,
      lore: newCampLore.trim(),
      ilustracao,
    };

    createCampaignMutation.mutate(payload, {
      onSuccess: (createdCamp) => {
        if (createdCamp?.id) {
          setCampaigns(prev => [...prev, createdCamp]);
          setActiveCampaignId(createdCamp.id);
          localStorage.setItem('daemon_active_campaign_id', createdCamp.id);
        }
      }
    });

    // Reset fields
    setNewCampName('');
    setNewCampSubtitle('');
    setNewCampUniverse('Medieval');
    setNewCampLore('');
    setNewCampIlustracaoLink('');
    setNewCampIlustracaoBase64('');
    setShowCreateModal(false);
  };

  const handleOpenEdit = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setEditCampName(camp.name);
    setEditCampSubtitle(camp.subtitulo || '');
    setEditCampUniverse(camp.universo || 'Medieval');
    setEditCampLore(camp.lore || '');
    if (camp.ilustracao?.startsWith('data:image')) {
      setEditCampIlustracaoType('upload');
      setEditCampIlustracaoBase64(camp.ilustracao);
      setEditCampIlustracaoLink('');
    } else {
      setEditCampIlustracaoType('link');
      setEditCampIlustracaoLink(camp.ilustracao || '');
      setEditCampIlustracaoBase64('');
    }
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !editCampName.trim()) return;

    const ilustracao = editCampIlustracaoType === 'upload'
      ? (editCampIlustracaoBase64 || DEFAULT_IMAGES[editCampUniverse])
      : (editCampIlustracaoLink.trim() || DEFAULT_IMAGES[editCampUniverse]);

    const payload = {
      name: editCampName.trim(),
      subtitulo: editCampSubtitle.trim(),
      universo: editCampUniverse,
      lore: editCampLore.trim(),
      ilustracao,
    };

    if (selectedCampaign.id && !selectedCampaign.id.startsWith('camp_')) {
      updateCampaignMutation.mutate({ id: selectedCampaign.id, payload });
    }

    setCampaigns(prev => prev.map(c => {
      if (c.id === selectedCampaign.id) {
        return {
          ...c,
          name: editCampName.trim(),
          subtitulo: editCampSubtitle.trim(),
          universo: editCampUniverse,
          lore: editCampLore.trim(),
          ilustracao
        };
      }
      return c;
    }));

    setSelectedCampaign(null);
  };

  const handleRemoveCampaign = (id: string) => {
    if (id && !id.startsWith('camp_')) {
      deleteCampaignMutation.mutate(id);
    }
    setCampaigns(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (remaining.length > 0 && activeCampaignId === id) {
        setActiveCampaignId(remaining[0].id);
        localStorage.setItem('daemon_active_campaign_id', remaining[0].id);
      } else if (remaining.length === 0 && activeCampaignId === id) {
        setActiveCampaignId('');
        localStorage.removeItem('daemon_active_campaign_id');
      }
      return remaining;
    });
    setCampaignToDelete(null);
    setSelectedCampaign(null);
  };

  const enrichedCampaigns = campaigns.map(camp => {
    const universo = camp.universo || 'Medieval';
    return {
      ...camp,
      universo,
      ilustracao: camp.ilustracao || DEFAULT_IMAGES[universo]
    };
  });

  const activeCampaignObj = campaigns.find((c) => c.id === activeCampaignId);

  return (
    <div id="campaigns-container" className="space-y-8 animate-fadeIn pb-24 relative font-sans">
      <PageHeader
        title="Campanhas"
        subtitle={
          activeCampaignObj ? (
            <>Campanha ativa no momento: <strong className="text-primary">{activeCampaignObj.name}</strong></>
          ) : (
            'Crie e gerencie suas campanhas'
          )
        }
        actions={
          user.role === 'dm' ? (
            <div className="hidden md:block">
              <AddButton
                id="btn-new-campaign"
                onClick={() => setShowCreateModal(true)}
                label="Nova Campanha"
              />
            </div>
          ) : (
            <div className="hidden md:block">
              <AddButton
                id="btn-join-campaign"
                onClick={() => {
                  setJoinFeedback(null);
                  setJoinCode('');
                  setShowJoinModal(true);
                }}
                label="Entrar em Campanha"
                icon={UserPlus}
              />
            </div>
          )
        }
      />

      {/* Floating Add / Join Button for Mobile */}
      <button
        type="button"
        onClick={() => {
          if (user.role === 'dm') {
            setShowCreateModal(true);
          } else {
            setJoinFeedback(null);
            setJoinCode('');
            setShowJoinModal(true);
          }
        }}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center shadow-2xl border border-primary/50 z-40 cursor-pointer"
        title={user.role === 'dm' ? "Nova Campanha" : "Entrar em Campanha"}
        aria-label={user.role === 'dm' ? "Nova Campanha" : "Entrar em Campanha"}
      >
        <span className="material-symbols-outlined text-2xl">{user.role === 'dm' ? 'add' : 'group_add'}</span>
      </button>

      {/* Campaigns Grid */}
      <div id="campaigns-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedCampaigns.map((camp) => (
          <motion.div
            key={camp.id}
            onClick={() => handleOpenEdit(camp)}
            whileHover={{ y: -6, borderColor: 'var(--color-primary)' }}
            className={`group bg-surface-container-high border ${activeCampaignId === camp.id ? 'border-primary/80 shadow-[0_0_15px_rgba(255,107,107,0.15)]' : 'border-outline-variant/40'} p-5 flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden`}
          >
            {/* Top Glowing Edge */}
            {activeCampaignId === camp.id && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary animate-pulse" />
            )}

            {/* Background Cover Overlay */}
            <div className="relative h-44 mb-4 overflow-hidden bg-surface-container-lowest border border-outline-variant/20">
              <ImageWithFallback
                src={camp.ilustracao}
                alt={camp.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                fallbackIcon={<Map className="w-12 h-12 stroke-[1.5]" />}
              />
              {/* Badge Universe */}
              <span className="absolute top-3 right-3 bg-black/80 border border-[#fbb1a9]/40 text-micro font-sans font-bold uppercase tracking-wider px-2 py-0.5 text-[#fbb1a9]">
                {camp.universo || 'Medieval'}
              </span>
              <div className="absolute bottom-3 left-3 flex items-center">
                <Toggle
                  checked={activeCampaignId === camp.id}
                  onChange={(checked) => {
                    if (checked) {
                      setActiveCampaignId(camp.id);
                      localStorage.setItem('daemon_active_campaign_id', camp.id);
                    }
                  }}
                  title={activeCampaignId === camp.id ? "Campanha Ativa" : "Ativar Campanha"}
                  size="sm"
                  activeBgClass="bg-[#fbb1a9]"
                  activeCircleTextClass="text-[#fbb1a9]"
                />
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg text-on-surface font-bold group-hover:text-primary transition-colors leading-snug">
                {camp.name}
              </h3>
              {camp.subtitulo && (
                <p className="font-sans text-xs text-on-surface-variant font-medium mt-1 leading-relaxed line-clamp-1">
                  {camp.subtitulo}
                </p>
              )}
              <p className="font-sans text-xs text-on-surface-variant/70 mt-3 leading-relaxed line-clamp-3">
                {camp.lore || 'Nenhuma descrição detalhada da crônica foi registrada.'}
              </p>
            </div>

            <div className="border-t border-outline-variant/20 mt-5 pt-4 flex items-center justify-between">
              <span className="font-sans text-micro text-on-surface-variant/50 uppercase tracking-wider">
                Mestre: <strong className="text-on-surface-variant">{camp.dmEmail === user.email ? 'Você' : camp.dmEmail}</strong>
              </span>
              <div className="flex items-center gap-2">
                {(user.role === 'dm' || camp.isDm || camp.dmEmail === user.email) && (
                  <button
                    type="button"
                    title="Vincular Jogadores à Campanha"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInviteFeedback(null);
                      setPlayerEmailToInvite('');
                      setCodeCopied(false);
                      setCampaignForInvite(camp);
                    }}
                    className="p-1.5 text-primary hover:text-on-primary hover:bg-primary/20 border border-primary/30 rounded-none transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
                <span className="font-sans text-micro text-primary group-hover:underline font-bold uppercase tracking-widest flex items-center gap-1">
                  {user.role === 'dm' ? 'Editar' : 'Ver Detalhes'} →
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {enrichedCampaigns.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-outline-variant/40 bg-surface-container-lowest/20">
            <Map className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3 stroke-[1.2]" />
            <p className="font-serif text-base text-on-surface-variant font-medium">Nenhuma campanha registrada.</p>
            <div className="mt-4 flex justify-center">
              {user.role === 'dm' ? (
                <AddButton
                  onClick={() => setShowCreateModal(true)}
                  label="Criar Nova Campanha"
                  variant="secondary"
                />
              ) : (
                <AddButton
                  id="btn-join-campaign-empty"
                  onClick={() => {
                    setJoinFeedback(null);
                    setJoinCode('');
                    setShowJoinModal(true);
                  }}
                  label="Entrar em Campanha"
                  variant="secondary"
                  icon={UserPlus}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Nova Campanha */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Nova Campanha"
        icon={<Map className="w-5 h-5 text-primary" />}
        maxWidth="max-w-lg"
        onSubmit={handleCreateCampaign}
        footer={
          <div className="flex justify-end w-full">
            <SaveButton
              type="submit"
              label="Criar Campanha"
              variant="primary-ghost"
            />
          </div>
        }
      >
        <div className="space-y-4 font-sans text-xs">
          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Nome da Campanha <span className="text-primary">*</span>
            </label>
            <div className="w-full">
              <input
                type="text"
                required
                maxLength={50}
                value={newCampName}
                onChange={(e) => setNewCampName(e.target.value)}
                placeholder="Ex: Tormenta de Cinzas"
                className="`${newCampName.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary placeholder-on-surface-variant/40 rounded-none`"
              />
              {newCampName.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Subtítulo
            </label>
            <div className="w-full">
              <input
                type="text"
                maxLength={50}
                value={newCampSubtitle}
                onChange={(e) => setNewCampSubtitle(e.target.value)}
                placeholder="Ex: A Última Aliança Rúnica"
                className="`${newCampSubtitle.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary placeholder-on-surface-variant/40 rounded-none`"
              />
              {newCampSubtitle.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Universo
            </label>
            <CustomSelect
              value={newCampUniverse}
              onChange={(e) => setNewCampUniverse(e.target.value as any)}
              variant="parchment"
              options={[
                { value: "Medieval", label: "Medieval" },
                { value: "Cyberpunk", label: "Cyberpunk" },
                { value: "Cthullu", label: "Cthullu" },
                { value: "Outro", label: "Outro" },
              ]}
            />
          </div>

          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Ilustração (Imagem de Capa)
            </label>
            <div className="flex gap-4 mb-3">
              <button
                type="button"
                onClick={() => setNewCampIlustracaoType('link')}
                className={`flex-1 py-2 border text-micro font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${newCampIlustracaoType === 'link' ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant/40 text-on-surface-variant'}`}
              >
                <Link className="w-3 h-3" />
                Link da Imagem
              </button>
              <button
                type="button"
                onClick={() => setNewCampIlustracaoType('upload')}
                className={`flex-1 py-2 border text-micro font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${newCampIlustracaoType === 'upload' ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant/40 text-on-surface-variant'}`}
              >
                <ImageIcon className="w-3 h-3" />
                Fazer Upload
              </button>
            </div>

            {newCampIlustracaoType === 'link' ? (
              <div className="w-full">
              <input
                  type="url"
                  maxLength={500}
                  value={newCampIlustracaoLink}
                  onChange={(e) => setNewCampIlustracaoLink(e.target.value)}
                  placeholder="Ex: https://imagens.com/minha-arte.jpg"
                  className="`${newCampIlustracaoLink.length >= 500 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary placeholder-on-surface-variant/40 rounded-none`"
                />
              {newCampIlustracaoLink.length >= 500 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (500)
                </div>
              )}
            </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-surface-container-high border border-outline-variant/60 text-xs font-sans font-bold uppercase tracking-widest hover:bg-surface-container-high text-on-surface cursor-pointer"
                >
                  Selecionar Arquivo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                  className="`${editCampName.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} hidden`"
                />
                {newCampIlustracaoBase64 ? (
                  <div className="flex items-center gap-2">
                    <ImageWithFallback
                      src={newCampIlustracaoBase64}
                      alt="Preview"
                      className="w-10 h-10 object-cover border border-outline-variant"
                    />
                    <span className="text-micro text-green-400 font-sans font-bold uppercase">Pronto!</span>
                  </div>
                ) : (
                  <span className="text-micro text-on-surface-variant uppercase font-bold tracking-wider">Nenhum arquivo selecionado</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: Visualizar / Editar Campanha */}
      <Modal
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        title={user.role === 'dm' ? 'Editar Campanha' : 'Detalhes da Campanha'}
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        maxWidth="max-w-lg"
        onSubmit={user.role === 'dm' ? handleSaveCampaign : undefined}
        footer={
          user.role === 'dm' ? (
            <div className="flex items-center justify-between w-full">
              <DeleteButton
                type="button"
                onClick={() => setCampaignToDelete(selectedCampaign)}
                label="Remover"
                variant="danger-ghost"
              />
              <SaveButton
                type="submit"
                label="Salvar"
                variant="primary-ghost"
              />
            </div>
          ) : undefined
        }
      >
        <div className="space-y-4 font-sans text-xs">
          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Nome da Campanha <span className="text-primary">*</span>
            </label>
            <div className="w-full">
              <input
                type="text"
                required
                maxLength={50}
                disabled={user.role !== 'dm'}
                value={editCampName}
                onChange={(e) => setEditCampName(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary disabled:opacity-50 rounded-none"
              />
              {editCampName.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Subtítulo
            </label>
            <div className="w-full">
              <input
                type="text"
                maxLength={50}
                disabled={user.role !== 'dm'}
                value={editCampSubtitle}
                onChange={(e) => setEditCampSubtitle(e.target.value)}
                className="`${editCampSubtitle.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary disabled:opacity-50 rounded-none`"
              />
              {editCampSubtitle.length >= 50 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Universo
            </label>
            <CustomSelect
              disabled={user.role !== 'dm'}
              value={editCampUniverse}
              onChange={(e) => setEditCampUniverse(e.target.value as any)}
              variant="parchment"
              options={[
                { value: "Medieval", label: "Medieval" },
                { value: "Cyberpunk", label: "Cyberpunk" },
                { value: "Cthullu", label: "Cthullu" },
                { value: "Outro", label: "Outro" },
              ]}
            />
          </div>

          {user.role === 'dm' && (
            <div>
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                Ilustração (Imagem de Capa)
              </label>
              <div className="flex gap-4 mb-3">
                <button
                  type="button"
                  onClick={() => setEditCampIlustracaoType('link')}
                  className={`flex-1 py-2 border text-micro font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${editCampIlustracaoType === 'link' ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant/40 text-on-surface-variant'}`}
                >
                  <Link className="w-3 h-3" />
                  Link da Imagem
                </button>
                <button
                  type="button"
                  onClick={() => setEditCampIlustracaoType('upload')}
                  className={`flex-1 py-2 border text-micro font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${editCampIlustracaoType === 'upload' ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant/40 text-on-surface-variant'}`}
                >
                  <ImageIcon className="w-3 h-3" />
                  Fazer Upload
                </button>
              </div>

              {editCampIlustracaoType === 'link' ? (
                <div className="w-full">
              <input
                    type="url"
                    maxLength={500}
                    value={editCampIlustracaoLink}
                    onChange={(e) => setEditCampIlustracaoLink(e.target.value)}
                    placeholder="Ex: https://imagens.com/minha-arte.jpg"
                    className="`${editCampIlustracaoLink.length >= 500 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary placeholder-on-surface-variant/40 rounded-none`"
                  />
              {editCampIlustracaoLink.length >= 500 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (500)
                </div>
              )}
            </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-4 py-2 bg-surface-container-high border border-outline-variant/60 text-xs font-sans font-bold uppercase tracking-widest hover:bg-surface-container-high text-on-surface cursor-pointer"
                  >
                    Selecionar Arquivo
                  </button>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, true)}
                    className="hidden"
                  />
                  {editCampIlustracaoBase64 ? (
                    <div className="flex items-center gap-2">
                      <ImageWithFallback
                        src={editCampIlustracaoBase64}
                        alt="Preview"
                        className="w-10 h-10 object-cover border border-outline-variant"
                      />
                      <span className="text-micro text-green-400 font-sans font-bold uppercase">Pronto!</span>
                    </div>
                  ) : (
                    <span className="text-micro text-on-surface-variant uppercase font-bold tracking-wider">Nenhum arquivo selecionado</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cover Preview during editing */}
          {(editCampIlustracaoType === 'link' ? editCampIlustracaoLink : editCampIlustracaoBase64) && (
            <div className="mt-2 border border-outline-variant/30 h-28 overflow-hidden bg-black/40">
              <ImageWithFallback
                src={editCampIlustracaoType === 'link' ? editCampIlustracaoLink : editCampIlustracaoBase64}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-75"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* SUBMODAL: Confirmar Remoção de Campanha */}
      <ConfirmDeleteModal
        isOpen={!!campaignToDelete}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={() => campaignToDelete && handleRemoveCampaign(campaignToDelete.id)}
        title="Remover Campanha"
        description={
          <>
            Você tem certeza de que deseja remover permanentemente a campanha <strong className="text-on-surface">"{campaignToDelete?.name}"</strong>? Esta ação é irreversível e excluirá todos os dados associados a esta crônica.
          </>
        }
      />

      {/* MODAL: Vincular Jogadores à Campanha (Visão do Mestre) */}
      <Modal
        isOpen={!!campaignForInvite}
        onClose={() => setCampaignForInvite(null)}
        title={`Vincular Jogador • ${campaignForInvite?.name || ''}`}
        icon={<UserPlus className="w-5 h-5 text-primary" />}
        maxWidth="max-w-lg"
      >
        <div className="space-y-6 font-sans text-xs">
          {/* 1. Código da Campanha */}
          <div className="bg-surface-container p-4 border border-outline-variant/50 space-y-2">
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest block">
              Código da Campanha
            </label>
            <p className="text-caption text-on-surface-variant/80 leading-relaxed">
              Compartilhe este código com os jogadores para que eles possam ingressar através do botão <strong>"+ Entrar em campanha"</strong>:
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-surface-container-highest px-3 py-2 border border-outline-variant font-mono text-sm tracking-widest font-bold text-primary select-all">
                {campaignForInvite?.inviteCode || 'NÃO GERADO'}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-2 border border-primary/50 bg-primary/10 hover:bg-primary hover:text-on-primary text-primary text-micro font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                title="Copiar Código"
              >
                {codeCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Email do Jogador */}
          <form onSubmit={handleInvitePlayerSubmit} className="space-y-3">
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest block">
              Email do Jogador
            </label>
            <p className="text-caption text-on-surface-variant/80 leading-relaxed">
              Ou inclua diretamente um jogador informando o e-mail cadastrado dele:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={playerEmailToInvite}
                onChange={(e) => setPlayerEmailToInvite(e.target.value)}
                placeholder="jogador@email.com"
                className="flex-1 bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary placeholder-on-surface-variant/40 rounded-none"
              />
              <button
                type="submit"
                disabled={addPlayerMutation.isPending || !playerEmailToInvite.trim()}
                className="px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-sans text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {addPlayerMutation.isPending ? 'Vinculando...' : 'Adicionar'}
              </button>
            </div>

            {/* Feedback message */}
            {inviteFeedback && (
              <div
                className={`p-2.5 text-xs border ${
                  inviteFeedback.type === 'success'
                    ? 'bg-green-950/40 border-green-500/50 text-green-300'
                    : 'bg-red-950/40 border-red-500/50 text-red-300'
                }`}
              >
                {inviteFeedback.message}
              </div>
            )}
          </form>

          {/* 3. Jogadores Atuais */}
          <div className="border-t border-outline-variant/30 pt-4">
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Jogadores na Campanha ({campaignForInvite?.players?.length || 0})
            </label>
            {campaignForInvite?.players && campaignForInvite.players.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {campaignForInvite.players.map((email, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 bg-surface-container border border-outline-variant/30 text-xs"
                  >
                    <span className="text-on-surface font-medium truncate">{email}</span>
                    <span className="text-micro uppercase font-bold text-on-surface-variant/60 tracking-wider">Jogador</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-caption text-on-surface-variant/60 italic">Nenhum jogador vinculado ainda.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: Entrar em Campanha (Visão do Jogador) */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinFeedback(null);
          setJoinCode('');
        }}
        title="Entrar em Campanha"
        icon={<UserPlus className="w-5 h-5 text-primary" />}
        maxWidth="max-w-md"
        onSubmit={handleJoinCampaignSubmit}
        footer={
          <div className="flex justify-end w-full">
            <SaveButton
              type="submit"
              disabled={joinCampaignMutation.isPending || !joinCode.trim()}
              label={joinCampaignMutation.isPending ? "Ingressando..." : "Ingressar na Mesa"}
              variant="primary-ghost"
            />
          </div>
        }
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Digite o código de convite fornecido pelo Mestre da crônica para ingressar no grupo de aventureiros.
          </p>

          <div>
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Código da Campanha <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setJoinFeedback(null);
              }}
              placeholder="Ex: 8E54BC71"
              className="w-full bg-surface-container border border-outline-variant text-on-surface font-mono tracking-widest text-base px-3.5 py-2.5 focus:outline-none focus:border-primary placeholder-on-surface-variant/40 uppercase rounded-none"
            />
          </div>

          {joinFeedback && (
            <div
              className={`p-2.5 text-xs border ${
                joinFeedback.type === 'success'
                  ? 'bg-green-950/40 border-green-500/50 text-green-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}
            >
              {joinFeedback.message}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
