import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Trash2, Edit3, User, Shield, Compass, BookOpen, AlertTriangle, Upload, Sparkles, SquareUserRound } from 'lucide-react';
import CustomSelect from './CustomSelect';
import Modal from './Modal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ActionButton, SaveButton, AddButton, DeleteButton } from './ActionButtons';
import ImageWithFallback from './ImageWithFallback';

export interface NPC {
  id: string;
  name: string;
  race: string;
  occupation: string;
  description: string;
  notes: string;
  campaignId: string;
  image?: string;
}

interface NPCsViewProps {
  activeCampaignId: string;
  campaigns: { id: string; name: string }[];
}

export default function NPCsView({ activeCampaignId, campaigns }: NPCsViewProps) {
  const [npcs, setNpcs] = useState<NPC[]>(() => {
    try {
      const saved = localStorage.getItem('daemon_npcs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNpc, setEditingNpc] = useState<NPC | null>(null);


  // Form states
  const [npcName, setNpcName] = useState('');
  const [npcRace, setNpcRace] = useState('');
  const [npcOccupation, setNpcOccupation] = useState('');
  const [npcDescription, setNpcDescription] = useState('');
  const [npcNotes, setNpcNotes] = useState('');
  const [npcImage, setNpcImage] = useState('');
  const [npcCampaignId, setNpcCampaignId] = useState(activeCampaignId);

  const [npcToDelete, setNpcToDelete] = useState<NPC | null>(null);

  // Sync campaign field when active campaign changes
  useEffect(() => {
    setNpcCampaignId(activeCampaignId);
  }, [activeCampaignId]);

  // Save to localStorage
  const saveNpcs = (updatedList: NPC[]) => {
    setNpcs(updatedList);
    localStorage.setItem('daemon_npcs', JSON.stringify(updatedList));
  };

  const handleNpcFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNpcImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNpc(null);
    setNpcName('');
    setNpcRace('');
    setNpcOccupation('');
    setNpcDescription('');
    setNpcNotes('');
    setNpcImage('');
    setNpcCampaignId(activeCampaignId);
    setShowModal(true);
  };

  const handleOpenEditModal = (npc: NPC) => {
    setEditingNpc(npc);
    setNpcName(npc.name);
    setNpcRace(npc.race);
    setNpcOccupation(npc.occupation);
    setNpcDescription(npc.description);
    setNpcNotes(npc.notes);
    setNpcImage(npc.image || '');
    setNpcCampaignId(npc.campaignId);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!npcName.trim()) return;

    if (editingNpc) {
      // Edit existing
      const updated = npcs.map((item) =>
        item.id === editingNpc.id
          ? {
              ...item,
              name: npcName.trim(),
              race: npcRace.trim() || 'Desconhecida',
              occupation: npcOccupation.trim() || 'Desconhecida',
              description: npcDescription.trim(),
              notes: npcNotes.trim(),
              image: npcImage.trim(),
              campaignId: npcCampaignId
            }
          : item
      );
      saveNpcs(updated);
    } else {
      // Create new
      const newNpc: NPC = {
        id: `npc_${Date.now()}`,
        name: npcName.trim(),
        race: npcRace.trim() || 'Desconhecida',
        occupation: npcOccupation.trim() || 'Desconhecida',
        description: npcDescription.trim(),
        notes: npcNotes.trim(),
        image: npcImage.trim(),
        campaignId: npcCampaignId
      };
      saveNpcs([...npcs, newNpc]);
    }
    setShowModal(false);
  };

  const handlePromoteToPersona = (e: React.MouseEvent, npc: NPC) => {
    e.stopPropagation();
    try {
      const savedPersonas = localStorage.getItem('daemon_history_personas');
      const currentPersonas: any[] = savedPersonas ? JSON.parse(savedPersonas) : [];

      const newPersona = {
        id: `per-npc-${npc.id}-${Date.now()}`,
        name: npc.name,
        title: `${npc.race} • ${npc.occupation}`,
        role: npc.occupation,
        description: `${npc.description}${npc.notes ? `\n\nSegredos & Anotações: ${npc.notes}` : ''}`,
        image: npc.image || '',
        isVisible: true
      };

      const updated = [newPersona, ...currentPersonas];
      localStorage.setItem('daemon_history_personas', JSON.stringify(updated));
      toast.success(`"${npc.name}" foi promovido(a) a Persona na História da Campanha!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    const npc = npcs.find((n) => n.id === id);
    if (npc) {
      setNpcToDelete(npc);
    }
  };

  const handleConfirmDelete = () => {
    if (npcToDelete) {
      const updated = npcs.filter((n) => n.id !== npcToDelete.id);
      saveNpcs(updated);
      setNpcToDelete(null);
    }
  };

  // Filter NPCs by active campaign and search query
  const filteredNpcs = npcs.filter((n) => {
    const matchesCampaign = n.campaignId === activeCampaignId;
    const matchesSearch =
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.occupation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCampaign && matchesSearch;
  });

  const activeCampaignName = campaigns.find((c) => c.id === activeCampaignId)?.name || 'Campanha Ativa';

  return (
    <div className="space-y-8 pb-24 relative">


      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-medium flex items-center gap-2">
            <span>NPCs</span>
          </h2>
          <p className="font-sans text-xs text-on-surface-variant mt-1">
            NPCs registrados para a campanha ativa: <strong className="text-primary">{activeCampaignName}</strong>
          </p>
        </div>
        <div className="hidden md:flex justify-end shrink-0">
          <AddButton
            onClick={handleOpenCreateModal}
            label="Registrar NPC"
          />
        </div>
      </div>

      {/* Floating Add Button for Mobile */}
      <button
        onClick={handleOpenCreateModal}
        className="md:hidden fixed bottom-[-8px] right-6 w-14 h-14 bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center shadow-2xl border border-primary/50 z-40 cursor-pointer"
        title="Registrar NPC"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {/* Search and Filters */}
      <div className="bg-surface-container border border-outline-variant/30 p-4 flex gap-4 items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Buscar NPC por nome, raça ou ocupação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="`${npcName.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container-low border border-outline-variant/50  text-xs py-3 pl-10 pr-4 focus:ring-0 focus:border-primary outline-none font-sans uppercase tracking-wider`"
          />
          <Search className="w-4 h-4 text-outline-variant absolute left-3 top-3.5" />
        </div>
      </div>

      {/* NPCs List */}
      {filteredNpcs.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant/20 p-12 text-center space-y-4">
          <User className="w-12 h-12 text-outline-variant mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-on-surface-variant">Nenhum NPC Encontrado</h3>
          <p className="text-xs text-outline font-sans max-w-sm mx-auto">
            Não há NPCs cadastrados na campanha ativa <strong className="text-on-surface">{activeCampaignName}</strong> com esses termos de busca. Registre o primeiro clicando no botão acima!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNpcs.map((npc) => (
            <div
              key={npc.id}
              onClick={() => handleOpenEditModal(npc)}
              className="bg-surface-container border border-outline-variant p-6 flex flex-col justify-between hover:border-primary/50 hover:bg-surface-container-high transition-all duration-300 relative overflow-hidden cursor-pointer group"
            >
              <div className="space-y-4">
                {/* CONDITIONAL IMAGE DISPLAY */}
                {npc.image && npc.image.trim() !== '' && (
                  <div className="relative h-48 w-full border border-outline-variant overflow-hidden bg-black/60">
                    <ImageWithFallback
                      src={npc.image}
                      alt={npc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                      fallbackText={npc.name}
                    />
                  </div>
                )}

                <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
                  <div>
                    <h3 className="font-serif text-xl text-on-surface font-medium group-hover:text-primary transition-colors">{npc.name}</h3>
                    <p className="font-mono text-[9px] text-primary uppercase tracking-widest mt-1">
                      {npc.race} • {npc.occupation}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs text-on-surface-variant leading-relaxed">
                  <div>
                    <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider block mb-1">
                      Descrição & Aparência
                    </span>
                    <p className="italic text-on-surface">{npc.description || 'Nenhuma descrição fornecida.'}</p>
                  </div>

                  {npc.notes && (
                    <div>
                      <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider block mb-1">
                        Segredos & Anotações
                      </span>
                      <p className="text-primary bg-primary-container/5 border border-primary/10 p-2.5">
                        {npc.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action bar on card */}
              <div className="mt-4 pt-3 border-t border-outline-variant/30 flex justify-end">
                <ActionButton
                  type="button"
                  onClick={(e) => handlePromoteToPersona(e, npc)}
                  title="Copiar/Promover este NPC para as Personas na História da Campanha"
                  icon={SquareUserRound}
                  label="Promover a Persona"
                  variant="secondary"
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingNpc ? 'Editar NPC' : 'Registrar Novo NPC'}
        icon={<User className="w-5 h-5 text-primary" />}
        maxWidth="max-w-lg"
        borderColor="border-primary-container/50"
        onSubmit={handleSave}
        footer={
          editingNpc ? (
            <div className="flex justify-between items-center w-full">
              <DeleteButton
                type="button"
                onClick={() => {
                  setShowModal(false);
                  handleDelete(editingNpc.id);
                }}
                label="Remover NPC"
                variant="danger-ghost"
              />
              <SaveButton
                type="submit"
                label="Salvar NPC"
                variant="primary-ghost"
              />
            </div>
          ) : (
            <div className="flex justify-end items-center w-full">
              <SaveButton
                type="submit"
                label="Salvar NPC"
                variant="primary-ghost"
              />
            </div>
          )
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Nome do NPC *
            </label>
            <div className="w-full">
              <input
                type="text"
                required
                maxLength={50}
                placeholder="Ex: Padre Gregorio"
                value={npcName}
                onChange={(e) => setNpcName(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
              />
              {npcName.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
          </div>

          {/* Race and Occupation Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Raça / Espécie
              </label>
              <div className="w-full">
              <input
                  type="text"
                  maxLength={50}
                  placeholder="Ex: Humano, Vampiro, Elfo"
                  value={npcRace}
                  onChange={(e) => setNpcRace(e.target.value)}
                  className="`${npcRace.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {npcRace.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Ocupação / Papel
              </label>
              <div className="w-full">
              <input
                  type="text"
                  maxLength={50}
                  placeholder="Ex: Informante, Sacerdote"
                  value={npcOccupation}
                  onChange={(e) => setNpcOccupation(e.target.value)}
                  className="`${npcOccupation.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {npcOccupation.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Image Upload / Link */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Imagem do NPC (URL ou Upload)
            </label>
            <div className="flex gap-2 items-center">
              <div className="w-full">
              <input
                  type="text"
                  maxLength={500}
                  placeholder="Cole o link da imagem (https://...)"
                  value={npcImage}
                  onChange={(e) => setNpcImage(e.target.value)}
                  className="`${npcImage.length >= 500 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {npcImage.length >= 500 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (500)
                </div>
              )}
            </div>
              <label className="px-3.5 py-2.5 bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNpcFileUpload}
                  className="`${npcDescription.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} hidden`"
                />
              </label>
            </div>
            {npcImage && npcImage.trim() !== '' && (
              <div className="mt-2 h-32 w-full bg-black/60 border border-outline-variant/40 overflow-hidden flex items-center justify-center relative p-1">
                <ImageWithFallback
                  src={npcImage}
                  alt="Pré-visualização"
                  className="h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Campaign ID Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Vincular à Campanha
            </label>
            <CustomSelect
              value={npcCampaignId}
              onChange={(e) => setNpcCampaignId(e.target.value)}
              variant="parchment"
              options={campaigns.map((c) => ({
                value: c.id,
                label: c.name
              }))}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Descrição & História
            </label>
            <div className="w-full">
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Fale sobre a aparência física, comportamento ou história dele..."
                value={npcDescription}
                onChange={(e) => setNpcDescription(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none"
              />
              {npcDescription.length >= 300 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
          </div>

          {/* Secret Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Segredos, Notas de Campanha & Ganchos
            </label>
            <div className="w-full">
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Anotações confidenciais, ganchos de aventura ou segredos deste NPC..."
                value={npcNotes}
                onChange={(e) => setNpcNotes(e.target.value)}
                className="`${npcNotes.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none`"
              />
              {npcNotes.length >= 300 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!npcToDelete}
        onClose={() => setNpcToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Deletar NPC"
        description="Tem certeza que deseja deletar o NPC? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
