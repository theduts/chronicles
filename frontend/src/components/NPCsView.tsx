import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import PageHeader from './common/PageHeader';
import { toast } from 'sonner';
import {
  Search,
  User,
  Upload,
  SquareUserRound,
  ChevronDown,
  Trash2,
  Heart,
  Shield,
  Compass,
  Zap,
  Swords,
  ScrollText,
  Save,
  SlidersHorizontal,
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import Modal from './Modal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ActionButton, SaveButton, AddButton, DeleteButton } from './ActionButtons';
import ImageWithFallback from './ImageWithFallback';
import {
  useCampaignNpcs,
  useSystemNpcTemplates,
  useCreateNpcMutation,
  useUpdateNpcMutation,
  useDeleteNpcMutation,
  useBulkDeleteNpcsMutation,
  usePromoteNpcMutation,
  type CampaignNpcItem,
  type CampaignNpcInput,
  type SystemNpcTemplate,
} from '../hooks/useNpcMutations';

export type NPC = CampaignNpcItem;

function npcHasCombat(npc: CampaignNpcItem): boolean {
  if (!npc.data || typeof npc.data !== 'object') return false;
  const d = npc.data as Record<string, any>;
  return Boolean(
    d.hasCombat ||
    d.pv !== undefined ||
    d.ip !== undefined ||
    d.deslocamento !== undefined ||
    d.atributos ||
    d.attributes ||
    (Array.isArray(d.habilidades) && d.habilidades.length > 0) ||
    (Array.isArray(d.abilities) && d.abilities.length > 0)
  );
}

function getNpcCombatData(npc: CampaignNpcItem) {
  const d = (npc.data || {}) as Record<string, any>;
  const pv = d.pv !== undefined ? d.pv : 10;
  const ip = d.ip !== undefined ? d.ip : 0;
  const rawDesl = d.deslocamento !== undefined ? d.deslocamento : 4;
  const deslocamentoStr = String(rawDesl).replace(/m$/i, '').trim();

  const attrs = d.atributos || d.attributes || {};
  const atributos = [
    { key: 'CON', label: 'CON', val: attrs.CON ?? 10 },
    { key: 'FOR', label: 'FOR', val: attrs.FOR ?? attrs.FR ?? 10 },
    { key: 'DES', label: 'DES', val: attrs.DES ?? attrs.DEX ?? 10 },
    { key: 'AGI', label: 'AGI', val: attrs.AGI ?? 10 },
    { key: 'INT', label: 'INT', val: attrs.INT ?? 10 },
    { key: 'VON', label: 'VON', val: attrs.VON ?? attrs.WILL ?? 10 },
    { key: 'PER', label: 'PER', val: attrs.PER ?? 10 },
    { key: 'CAR', label: 'CAR', val: attrs.CAR ?? 10 },
  ];

  const rawHabs = d.habilidades || d.abilities || [];
  const habilidades = Array.isArray(rawHabs)
    ? rawHabs
        .map((h: any) => ({
          nome: h.habilidade || h.nome || h.name || '',
          desc: h.descricao_habilidade || h.descricao || h.description || '',
        }))
        .filter((h: any) => h.nome)
    : [];

  const parseList = (val: any): string[] => {
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  return {
    pv,
    ip,
    deslocamentoStr,
    atributos,
    habilidades,
    resistencias: parseList(d.resistencias),
    fraquezas: parseList(d.fraquezas),
    imunidades: parseList(d.imunidades),
    vantagens: parseList(d.vantagens),
    desvantagens: parseList(d.desvantagens),
    equipamentos: parseList(d.equipamentos),
    loot: parseList(d.loot),
    idiomas: parseList(d.idiomas),
  };
}

interface NpcMasonryCardProps {
  npc: CampaignNpcItem;
  onEdit: (npc: CampaignNpcItem) => void;
  onPromote: (e: React.MouseEvent, npc: CampaignNpcItem) => void;
  isPromotePending: boolean;
}

function NpcMasonryCard({ npc, onEdit, onPromote, isPromotePending }: NpcMasonryCardProps) {
  const hasCombat = npcHasCombat(npc);
  const [mode, setMode] = useState<'story' | 'combat'>(hasCombat ? 'combat' : 'story');

  const cardRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number | null>(null);

  const handleToggleMode = (e: React.MouseEvent, targetMode: 'story' | 'combat') => {
    e.stopPropagation();
    if (mode === targetMode) return;
    if (cardRef.current) {
      prevHeightRef.current = cardRef.current.offsetHeight;
    }
    setMode(targetMode);
  };

  useLayoutEffect(() => {
    if (prevHeightRef.current !== null && cardRef.current) {
      const card = cardRef.current;
      const startHeight = prevHeightRef.current;
      const targetHeight = card.offsetHeight;
      prevHeightRef.current = null;

      if (startHeight !== targetHeight) {
        card.style.height = `${startHeight}px`;
        card.style.overflow = 'hidden';

        requestAnimationFrame(() => {
          card.style.transition = 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
          card.style.height = `${targetHeight}px`;
        });

        const timer = setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.height = '';
            cardRef.current.style.transition = '';
            cardRef.current.style.overflow = '';
          }
        }, 360);

        return () => clearTimeout(timer);
      }
    }
  }, [mode]);

  const combat = getNpcCombatData(npc);

  return (
    <div
      ref={cardRef}
      onClick={() => onEdit(npc)}
      className="break-inside-avoid bg-surface-container border border-outline-variant p-6 flex flex-col justify-between hover:border-primary/50 hover:bg-surface-container-high transition-colors duration-300 relative overflow-hidden cursor-pointer group mb-6"
    >
      <div>
        {/* Header com Toggle Arredondado (apenas ícones ScrollText & Swords, adaptável claro/escuro) */}
        {hasCombat && (
          <div className="flex items-center justify-end pb-3 mb-3 border-b border-outline-variant/30">
            <div className="flex items-center bg-surface-container-high border border-outline-variant/60 p-0.5 rounded-lg shadow-inner">
              <button
                type="button"
                onClick={(e) => handleToggleMode(e, 'story')}
                className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  mode === 'story'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/60'
                }`}
                title="Visão Narrativa"
                aria-label="Visão Narrativa"
              >
                <ScrollText className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => handleToggleMode(e, 'combat')}
                className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  mode === 'combat'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/60'
                }`}
                title="Ficha de Combate"
                aria-label="Ficha de Combate"
              >
                <Swords className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo com fade rápido animado */}
        <div key={mode} className="card-fade-fast">
          {mode === 'combat' && hasCombat ? (
            /* Bloco de Combate (Ficha de Criatura com dados reais) */
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
                <div>
                  <h3 className="font-serif text-xl text-on-surface font-medium group-hover:text-primary transition-colors">
                    {npc.name}
                  </h3>
                  <p className="font-mono text-micro text-primary uppercase tracking-widest mt-1">
                    {npc.race || 'Desconhecida'} • {npc.occupation || 'Desconhecida'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-emerald-100/80 text-emerald-800 border border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 text-micro font-mono font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5 fill-current text-emerald-600 dark:text-emerald-400" />
                      {combat.pv} PV
                    </span>
                    <span className="bg-blue-100/80 text-blue-800 border border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 text-micro font-mono font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                      IP {combat.ip}
                    </span>
                    <span className="bg-amber-100/80 text-amber-900 border border-amber-500 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 text-micro font-mono font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                      <Compass className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                      Desl. {combat.deslocamentoStr} m
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabela de 8 Atributos (CON, FOR, DES, AGI, INT, VON, PER, CAR) */}
              <div className="bg-surface-container/95 border border-outline-variant/30 p-3.5">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-micro text-outline uppercase tracking-wider">
                      <th className="pb-1 font-bold text-on-surface-variant">Atr.</th>
                      <th className="pb-1 font-bold text-right text-on-surface-variant">Pts</th>
                      <th className="pb-1 font-bold text-right text-on-surface-variant pr-1">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combat.atributos.map(({ key, label, val }) => (
                      <tr
                        key={key}
                        className="border-b border-outline-variant/10 last:border-0 hover:bg-on-surface/5 transition-colors"
                      >
                        <td className="py-1 font-bold text-on-surface-variant text-caption">{label}</td>
                        <td className="py-1 text-right font-mono text-on-surface font-medium">{val}</td>
                        <td className="py-1 text-right font-mono text-primary font-bold pr-1">
                          {Number(val) * 4}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Habilidades */}
              {combat.habilidades.length > 0 && (
                <div className="space-y-2 font-sans">
                  <span className="text-micro font-bold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-red-700 dark:text-red-400 fill-current" />
                    Habilidades ({combat.habilidades.length})
                  </span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {combat.habilidades.map((hab, idx) => (
                      <div key={idx} className="bg-red-500/10 border border-red-500/20 dark:bg-red-950/20 dark:border-red-900/40 p-2.5">
                        <span className="text-caption font-bold text-red-800 dark:text-red-300 block">{hab.nome}</span>
                        {hab.desc && (
                          <p className="text-micro text-on-surface-variant mt-0.5 leading-relaxed">
                            {hab.desc}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações adicionais se existirem */}
              {(combat.resistencias.length > 0 || combat.fraquezas.length > 0 || combat.imunidades.length > 0) && (
                <div className="space-y-1 text-caption font-sans pt-1 border-t border-outline-variant/20">
                  {combat.resistencias.length > 0 && (
                    <p className="text-emerald-700 dark:text-emerald-400">
                      <strong className="text-on-surface-variant">Resistências:</strong> {combat.resistencias.join(', ')}
                    </p>
                  )}
                  {combat.fraquezas.length > 0 && (
                    <p className="text-amber-700 dark:text-amber-400">
                      <strong className="text-on-surface-variant">Fraquezas:</strong> {combat.fraquezas.join(', ')}
                    </p>
                  )}
                  {combat.imunidades.length > 0 && (
                    <p className="text-blue-700 dark:text-blue-400">
                      <strong className="text-on-surface-variant">Imunidades:</strong> {combat.imunidades.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Bloco Narrativo (Layout Padrão) */
            <div className="space-y-4">
              {(npc.image || npc.portraitUrl) && (
                <div className="relative h-48 w-full border border-outline-variant overflow-hidden bg-surface-container-high">
                  <ImageWithFallback
                    src={npc.image || npc.portraitUrl}
                    alt={npc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    referrerPolicy="no-referrer"
                    fallbackText={npc.name}
                  />
                </div>
              )}

              <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
                <div>
                  <h3 className="font-serif text-xl text-on-surface font-medium group-hover:text-primary transition-colors">
                    {npc.name}
                  </h3>
                  <p className="font-mono text-micro text-primary uppercase tracking-widest mt-1">
                    {npc.race || 'Desconhecida'} • {npc.occupation || 'Desconhecida'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 font-sans text-xs text-on-surface-variant leading-relaxed">
                <div>
                  <span className="text-micro font-bold text-outline-variant uppercase tracking-wider block mb-1">
                    Descrição & Aparência
                  </span>
                  <p className="italic text-on-surface">{npc.description || 'Nenhuma descrição fornecida.'}</p>
                </div>

                {npc.notes && (
                  <div>
                    <span className="text-micro font-bold text-outline-variant uppercase tracking-wider block mb-1">
                      Segredos & Anotações
                    </span>
                    <p className="text-primary bg-primary/10 border border-primary/20 p-2.5">
                      {npc.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action bar on card */}
      <div className="mt-4 pt-3 border-t border-outline-variant/30 flex justify-end">
        <ActionButton
          type="button"
          onClick={(e) => onPromote(e, npc)}
          title="Copiar/Promover este NPC para as Personas na História da Campanha"
          icon={SquareUserRound}
          label={npc.isPersona ? 'Já é Persona' : 'Promover a Persona'}
          variant="secondary"
          size="sm"
          disabled={npc.isPersona || isPromotePending}
        />
      </div>
    </div>
  );
}

interface NPCsViewProps {
  activeCampaignId: string;
  campaigns: { id: string; name: string }[];
}

export default function NPCsView({ activeCampaignId, campaigns }: NPCsViewProps) {
  const {
    data: npcs = [],
    isLoading,
  } = useCampaignNpcs(activeCampaignId);

  const {
    data: systemTemplates = [],
    isLoading: isLoadingTemplates,
  } = useSystemNpcTemplates();

  const {
    data: customTemplates = [],
    isLoading: isLoadingCustomTemplates,
  } = useCampaignNpcs(activeCampaignId, { templateOnly: true });

  const createMutation = useCreateNpcMutation(activeCampaignId);
  const updateMutation = useUpdateNpcMutation(activeCampaignId);
  const deleteMutation = useDeleteNpcMutation(activeCampaignId);
  const bulkDeleteMutation = useBulkDeleteNpcsMutation(activeCampaignId);
  const promoteMutation = usePromoteNpcMutation(activeCampaignId);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNpc, setEditingNpc] = useState<CampaignNpcItem | null>(null);

  // Form states
  const [npcName, setNpcName] = useState('');
  const [npcRace, setNpcRace] = useState('');
  const [npcOccupation, setNpcOccupation] = useState('');
  const [npcDescription, setNpcDescription] = useState('');
  const [npcNotes, setNpcNotes] = useState('');
  const [npcImage, setNpcImage] = useState('');
  const [npcCampaignId, setNpcCampaignId] = useState(activeCampaignId);
  const [hasCombatStats, setHasCombatStats] = useState(false);
  const [isStatusAccordionOpen, setIsStatusAccordionOpen] = useState(true);
  const [selectedBaseTemplate, setSelectedBaseTemplate] = useState('');

  // Template Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Manage Templates Modal states
  const [showManageTemplatesModal, setShowManageTemplatesModal] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [showConfirmDeleteTemplates, setShowConfirmDeleteTemplates] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<CampaignNpcItem | null>(null);

  // Combat states (baseados na modal Editar Criatura)
  const [hp, setHp] = useState<number | ''>('');
  const [ip, setIp] = useState<number | ''>('');
  const [deslocamento, setDeslocamento] = useState<number | ''>('');
  const [con, setCon] = useState<number>(10);
  const [fr, setFr] = useState<number>(10);
  const [dex, setDex] = useState<number>(10);
  const [agi, setAgi] = useState<number>(10);
  const [intVal, setIntVal] = useState<number>(10);
  const [will, setWill] = useState<number>(10);
  const [per, setPer] = useState<number>(10);
  const [car, setCar] = useState<number>(10);
  const [habilidadesList, setHabilidadesList] = useState<{ habilidade: string; descricao_habilidade: string }[]>([]);
  const [newHabilidadeNome, setNewHabilidadeNome] = useState('');
  const [newHabilidadeDesc, setNewHabilidadeDesc] = useState('');
  const [resistencias, setResistencias] = useState('');
  const [fraquezas, setFraquezas] = useState('');
  const [imunidades, setImunidades] = useState('');
  const [vantagens, setVantagens] = useState('');
  const [desvantagens, setDesvantagens] = useState('');
  const [equipamentos, setEquipamentos] = useState('');
  const [loot, setLoot] = useState('');
  const [idiomas, setIdiomas] = useState('');

  const [npcToDelete, setNpcToDelete] = useState<CampaignNpcItem | null>(null);

  // Sync campaign field when active campaign changes
  useEffect(() => {
    setNpcCampaignId(activeCampaignId);
  }, [activeCampaignId]);

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

  const handleAddHabilidade = () => {
    if (!newHabilidadeNome.trim()) return;
    setHabilidadesList([
      ...habilidadesList,
      {
        habilidade: newHabilidadeNome.trim(),
        descricao_habilidade: newHabilidadeDesc.trim(),
      },
    ]);
    setNewHabilidadeNome('');
    setNewHabilidadeDesc('');
  };

  const handleRemoveHabilidade = (index: number) => {
    setHabilidadesList(habilidadesList.filter((_, i) => i !== index));
  };

  const handleSelectBaseTemplate = (templateId: string) => {
    setSelectedBaseTemplate(templateId);
    if (!templateId) return;

    // 1. Verificar se é um template personalizado da campanha
    if (templateId.startsWith('custom_')) {
      const actualId = templateId.replace('custom_', '');
      const customTpl = (Array.isArray(customTemplates) ? customTemplates : []).find(
        (t) => t.id === actualId
      );
      if (customTpl && customTpl.data) {
        const d = customTpl.data;
        setHp(d.pv !== undefined && d.pv !== null ? Number(d.pv) : '');
        setIp(d.ip !== undefined && d.ip !== null ? Number(d.ip) : '');
        setDeslocamento(d.deslocamento !== undefined && d.deslocamento !== null && d.deslocamento !== '' ? Number(d.deslocamento) : '');

        const attrs = (d.atributos || d.attributes || {}) as Record<string, any>;
        setCon(attrs.CON ?? 10);
        setFr(attrs.FOR ?? attrs.FR ?? 10);
        setDex(attrs.DEX ?? attrs.DES ?? 10);
        setAgi(attrs.AGI ?? 10);
        setIntVal(attrs.INT ?? 10);
        setWill(attrs.WILL ?? attrs.VON ?? 10);
        setPer(attrs.PER ?? 10);
        setCar(attrs.CAR ?? 10);

        const habs = (d.habilidades || d.abilities || []).map((h: any) => ({
          habilidade: h.habilidade || h.nome || h.name || '',
          descricao_habilidade: h.descricao_habilidade || h.descricao || h.description || '',
        }));
        setHabilidadesList(habs);

        const formatList = (val: any) => {
          if (Array.isArray(val)) return val.join(', ');
          if (typeof val === 'string') return val;
          return '';
        };

        setResistencias(formatList(d.resistencias));
        setFraquezas(formatList(d.fraquezas));
        setImunidades(formatList(d.imunidades));
        setVantagens(formatList(d.vantagens));
        setDesvantagens(formatList(d.desvantagens));
        setEquipamentos(formatList(d.equipamentos));
        setLoot(formatList(d.loot));
        setIdiomas(formatList(d.idiomas));
        toast.success(`Template "${customTpl.name}" carregado com sucesso!`);
        return;
      }
    }

    // 2. Verificar templates oficiais do sistema
    const tpl = (Array.isArray(systemTemplates) ? systemTemplates : []).find(
      (t) => t.id === templateId || t.nome_template === templateId
    );
    if (tpl) {
      setHp(tpl.pv !== undefined ? tpl.pv : '');
      setIp(tpl.ip !== undefined ? tpl.ip : '');
      setDeslocamento(tpl.deslocamento !== undefined ? tpl.deslocamento : '');

      const attrs = tpl.atributos || {};
      setCon(attrs.CON ?? 10);
      setFr(attrs.FOR ?? attrs.FR ?? 10);
      setDex(attrs.DEX ?? attrs.DES ?? 10);
      setAgi(attrs.AGI ?? 10);
      setIntVal(attrs.INT ?? 10);
      setWill(attrs.WILL ?? attrs.VON ?? 10);
      setPer(attrs.PER ?? 10);
      setCar(attrs.CAR ?? 10);

      const habs = (tpl.habilidades || []).map((h: any) => ({
        habilidade: h.habilidade || h.nome || h.name || '',
        descricao_habilidade: h.descricao_habilidade || h.descricao || h.description || '',
      }));
      setHabilidadesList(habs);

      const formatList = (val: any) => {
        if (Array.isArray(val)) return val.join(', ');
        if (typeof val === 'string') return val;
        return '';
      };

      setResistencias('');
      setFraquezas('');
      setImunidades('');
      setVantagens(formatList(tpl.vantagens));
      setDesvantagens(formatList(tpl.desvantagens));
      setEquipamentos(formatList(tpl.equipamentos));
      setLoot(formatList((tpl as any).loot));
      setIdiomas(formatList((tpl as any).idiomas));
      toast.success(`Template "${tpl.nome_template}" carregado com sucesso!`);
    }
  };

  const handleOpenSaveTemplateModal = () => {
    setTemplateName(npcName.trim() ? `${npcName.trim()} (Template)` : '');
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Informe o nome do template.');
      return;
    }

    const targetCampaignId = npcCampaignId || activeCampaignId;
    if (!targetCampaignId) {
      toast.error('Selecione uma campanha antes de salvar um template.');
      return;
    }

    const combatData: Record<string, any> = {
      hasCombat: true,
      nome_template: templateName.trim(),
      pv: hp !== '' ? Number(hp) : 0,
      ip: ip !== '' ? Number(ip) : 0,
      deslocamento: deslocamento !== '' ? Number(deslocamento) : 0,
      atributos: {
        CON: con,
        FOR: fr,
        FR: fr,
        DEX: dex,
        AGI: agi,
        INT: intVal,
        WILL: will,
        PER: per,
        CAR: car,
      },
      habilidades: habilidadesList,
      resistencias: resistencias.trim() ? resistencias.split(',').map((s) => s.trim()).filter(Boolean) : [],
      fraquezas: fraquezas.trim() ? fraquezas.split(',').map((s) => s.trim()).filter(Boolean) : [],
      imunidades: imunidades.trim() ? imunidades.split(',').map((s) => s.trim()).filter(Boolean) : [],
      vantagens: vantagens.trim() ? vantagens.split(',').map((s) => s.trim()).filter(Boolean) : [],
      desvantagens: desvantagens.trim() ? desvantagens.split(',').map((s) => s.trim()).filter(Boolean) : [],
      equipamentos: equipamentos.trim() ? equipamentos.split(',').map((s) => s.trim()).filter(Boolean) : [],
      loot: loot.trim() ? loot.split(',').map((s) => s.trim()).filter(Boolean) : [],
      idiomas: idiomas.trim() ? idiomas.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    setIsSavingTemplate(true);
    try {
      await createMutation.mutateAsync({
        name: templateName.trim(),
        race: npcRace.trim() || 'Template',
        occupation: npcOccupation.trim() || 'Modelo',
        description: npcDescription.trim() || `Template personalizado: ${templateName.trim()}`,
        notes: npcNotes.trim(),
        portraitUrl: npcImage.trim() || undefined,
        isTemplate: true,
        data: combatData,
      });

      setShowTemplateModal(false);
      setTemplateName('');
    } catch (err) {
      console.error('Erro ao salvar template:', err);
      toast.error('Falha ao salvar template. Tente novamente.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleToggleSelectTemplate = (id: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllTemplates = () => {
    if (selectedTemplateIds.length === customTemplates.length) {
      setSelectedTemplateIds([]);
    } else {
      setSelectedTemplateIds(customTemplates.map((t) => t.id));
    }
  };

  const handleConfirmDeleteTemplates = async () => {
    if (selectedTemplateIds.length === 0) return;
    try {
      await bulkDeleteMutation.mutateAsync(selectedTemplateIds);
      const remainingCount = customTemplates.length - selectedTemplateIds.length;
      setSelectedTemplateIds([]);
      setShowConfirmDeleteTemplates(false);
      if (remainingCount <= 0) {
        setShowManageTemplatesModal(false);
      }
    } catch (err) {
      console.error('Erro ao deletar templates:', err);
    }
  };

  const handleConfirmDeleteSingleTemplate = async () => {
    if (!templateToDelete) return;
    try {
      await deleteMutation.mutateAsync(templateToDelete.id);
      setSelectedTemplateIds((prev) => prev.filter((id) => id !== templateToDelete.id));
      if (customTemplates.length <= 1) {
        setShowManageTemplatesModal(false);
      }
    } catch (err) {
      console.error('Erro ao deletar template:', err);
    } finally {
      setTemplateToDelete(null);
    }
  };

  const handleOpenCreateModal = () => {
    if (!activeCampaignId) {
      toast.error('Selecione ou crie uma campanha antes de registrar um NPC!');
      return;
    }
    setEditingNpc(null);
    setNpcName('');
    setNpcRace('');
    setNpcOccupation('');
    setNpcDescription('');
    setNpcNotes('');
    setNpcImage('');
    setNpcCampaignId(activeCampaignId);
    setHasCombatStats(false);
    setIsStatusAccordionOpen(true);
    setSelectedBaseTemplate('');
    setHp('');
    setIp('');
    setDeslocamento('');
    setCon(10);
    setFr(10);
    setDex(10);
    setAgi(10);
    setIntVal(10);
    setWill(10);
    setPer(10);
    setCar(10);
    setHabilidadesList([]);
    setNewHabilidadeNome('');
    setNewHabilidadeDesc('');
    setResistencias('');
    setFraquezas('');
    setImunidades('');
    setVantagens('');
    setDesvantagens('');
    setEquipamentos('');
    setLoot('');
    setIdiomas('');
    setShowModal(true);
  };

  const handleOpenEditModal = (npc: CampaignNpcItem) => {
    setEditingNpc(npc);
    setNpcName(npc.name);
    setNpcRace(npc.race || '');
    setNpcOccupation(npc.occupation || '');
    setNpcDescription(npc.description || '');
    setNpcNotes(npc.notes || '');
    setNpcImage(npc.image || npc.portraitUrl || '');
    setNpcCampaignId(npc.campaignId || activeCampaignId);
    const hasCombat = !!(
      npc.data &&
      (npc.data.hasCombat === true ||
        npc.data.pv !== undefined ||
        npc.data.ip !== undefined ||
        (npc.data.atributos && Object.keys(npc.data.atributos).length > 0) ||
        (npc.data.attributes && Object.keys(npc.data.attributes).length > 0))
    );
    setHasCombatStats(hasCombat);
    setIsStatusAccordionOpen(true);
    setSelectedBaseTemplate('');

    const d = npc.data || {};
    setHp(d.pv !== undefined ? d.pv : '');
    setIp(d.ip !== undefined ? d.ip : '');
    setDeslocamento(d.deslocamento !== undefined && d.deslocamento !== '' ? Number(d.deslocamento) : '');

    const attrs = d.atributos || d.attributes || {};
    setCon(attrs.CON ?? 10);
    setFr(attrs.FOR ?? attrs.FR ?? 10);
    setDex(attrs.DEX ?? attrs.DES ?? 10);
    setAgi(attrs.AGI ?? 10);
    setIntVal(attrs.INT ?? 10);
    setWill(attrs.WILL ?? attrs.VON ?? 10);
    setPer(attrs.PER ?? 10);
    setCar(attrs.CAR ?? 10);

    const habs = (d.habilidades || d.abilities || []).map((h: any) => ({
      habilidade: h.habilidade || h.nome || h.name || '',
      descricao_habilidade: h.descricao_habilidade || h.descricao || h.description || '',
    }));
    setHabilidadesList(habs);
    setNewHabilidadeNome('');
    setNewHabilidadeDesc('');

    const formatList = (val: any) => {
      if (Array.isArray(val)) return val.join(', ');
      if (typeof val === 'string') return val;
      return '';
    };

    setResistencias(formatList(d.resistencias));
    setFraquezas(formatList(d.fraquezas));
    setImunidades(formatList(d.imunidades));
    setVantagens(formatList(d.vantagens));
    setDesvantagens(formatList(d.desvantagens));
    setEquipamentos(formatList(d.equipamentos));
    setLoot(formatList(d.loot));
    setIdiomas(formatList(d.idiomas));
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!npcName.trim()) return;

    const targetCampaignId = npcCampaignId || activeCampaignId;
    if (!targetCampaignId) {
      toast.error('Selecione uma campanha para salvar o NPC.');
      return;
    }

    const combatData: Record<string, any> = hasCombatStats
      ? {
          hasCombat: true,
          pv: hp !== '' ? Number(hp) : undefined,
          ip: ip !== '' ? Number(ip) : undefined,
          deslocamento: deslocamento !== '' ? Number(deslocamento) : undefined,
          atributos: {
            CON: con,
            FOR: fr,
            FR: fr,
            DEX: dex,
            AGI: agi,
            INT: intVal,
            WILL: will,
            PER: per,
            CAR: car,
          },
          habilidades: habilidadesList,
          resistencias: resistencias.trim() ? resistencias.split(',').map((s) => s.trim()).filter(Boolean) : [],
          fraquezas: fraquezas.trim() ? fraquezas.split(',').map((s) => s.trim()).filter(Boolean) : [],
          imunidades: imunidades.trim() ? imunidades.split(',').map((s) => s.trim()).filter(Boolean) : [],
          vantagens: vantagens.trim() ? vantagens.split(',').map((s) => s.trim()).filter(Boolean) : [],
          desvantagens: desvantagens.trim() ? desvantagens.split(',').map((s) => s.trim()).filter(Boolean) : [],
          equipamentos: equipamentos.trim() ? equipamentos.split(',').map((s) => s.trim()).filter(Boolean) : [],
          loot: loot.trim() ? loot.split(',').map((s) => s.trim()).filter(Boolean) : [],
          idiomas: idiomas.trim() ? idiomas.split(',').map((s) => s.trim()).filter(Boolean) : [],
        }
      : {};

    const payload: CampaignNpcInput = {
      name: npcName.trim(),
      race: npcRace.trim() || 'Desconhecida',
      occupation: npcOccupation.trim() || 'Desconhecida',
      description: npcDescription.trim(),
      notes: npcNotes.trim(),
      portraitUrl: npcImage.trim() || undefined,
      data: combatData,
    };

    try {
      if (editingNpc) {
        await updateMutation.mutateAsync({
          npcId: editingNpc.id,
          payload: {
            ...payload,
            isPersona: editingNpc.isPersona,
            isTemplate: editingNpc.isTemplate,
          },
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao salvar NPC:', err);
    }
  };

  const handlePromoteToPersona = async (e: React.MouseEvent, npc: CampaignNpcItem) => {
    e.stopPropagation();
    try {
      await promoteMutation.mutateAsync(npc.id);

      // Sincroniza também no cache local legado de personas se existir
      try {
        const savedPersonas = localStorage.getItem('daemon_history_personas');
        const currentPersonas: any[] = savedPersonas ? JSON.parse(savedPersonas) : [];
        const newPersona = {
          id: `per-npc-${npc.id}-${Date.now()}`,
          name: npc.name,
          title: `${npc.race || 'Desconhecida'} • ${npc.occupation || 'Desconhecida'}`,
          role: npc.occupation || 'Desconhecida',
          description: `${npc.description || ''}${npc.notes ? `\n\nSegredos & Anotações: ${npc.notes}` : ''}`,
          image: npc.image || npc.portraitUrl || '',
          isVisible: true,
        };
        localStorage.setItem('daemon_history_personas', JSON.stringify([newPersona, ...currentPersonas]));
      } catch (errLocal) {
        // ignora erro de localStorage
      }
    } catch (err) {
      console.error('Erro ao promover NPC:', err);
    }
  };

  const handleDelete = (npc: CampaignNpcItem) => {
    setNpcToDelete(npc);
  };

  const handleConfirmDelete = async () => {
    if (npcToDelete) {
      try {
        await deleteMutation.mutateAsync(npcToDelete.id);
      } catch (err) {
        console.error('Erro ao excluir NPC:', err);
      } finally {
        setNpcToDelete(null);
      }
    }
  };

  // Filter NPCs by search query (ignora templates para não poluir os cards da campanha)
  const filteredNpcs = npcs.filter((n) => {
    if (n.isTemplate) return false;
    const matchesSearch =
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.race && n.race.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.occupation && n.occupation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.description && n.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const activeCampaignName = campaigns.find((c) => c.id === activeCampaignId)?.name || 'Campanha Ativa';

  return (
    <div className="space-y-8 pb-24 relative font-sans">
      <PageHeader
        title="NPCs"
        subtitle={<>NPCs registrados para a campanha ativa: <strong className="text-primary">{activeCampaignName}</strong></>}
        actions={
          <>
            {customTemplates.length > 0 && (
              <ActionButton
                type="button"
                onClick={() => {
                  setSelectedTemplateIds([]);
                  setShowManageTemplatesModal(true);
                }}
                label="Gerenciar templates"
                icon={SlidersHorizontal}
                variant="secondary"
                hideLabelOnMobile={false}
              />
            )}
            <div className="hidden md:block">
              <AddButton
                onClick={handleOpenCreateModal}
                label="Registrar NPC"
              />
            </div>
          </>
        }
      />

      {/* Floating Add Button for Mobile */}
      <button
        type="button"
        onClick={handleOpenCreateModal}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center shadow-2xl border border-primary/50 z-40 cursor-pointer"
        title="Registrar NPC"
        aria-label="Registrar NPC"
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
            className="w-full bg-surface-container-low border border-outline-variant/50 text-xs py-3 pl-10 pr-4 focus:ring-0 focus:border-primary outline-none font-sans tracking-wider text-on-surface"
          />
          <Search className="w-4 h-4 text-outline-variant absolute left-3 top-3.5" />
        </div>
      </div>

      {/* NPCs List */}
      {isLoading ? (
        <div className="bg-surface-container border border-outline-variant/20 p-12 text-center space-y-4">
          <div className="inline-block animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          <p className="text-xs text-outline font-sans">Carregando NPCs...</p>
        </div>
      ) : filteredNpcs.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant/20 p-12 text-center space-y-4">
          <User className="w-12 h-12 text-outline-variant mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-on-surface-variant">Nenhum NPC Encontrado</h3>
          <p className="text-xs text-outline font-sans max-w-sm mx-auto">
            Não há NPCs cadastrados na campanha ativa <strong className="text-on-surface">{activeCampaignName}</strong> com esses termos de busca. Registre o primeiro clicando no botão acima!
          </p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {filteredNpcs.map((npc) => (
            <NpcMasonryCard
              key={npc.id}
              npc={npc}
              onEdit={handleOpenEditModal}
              onPromote={handlePromoteToPersona}
              isPromotePending={promoteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingNpc ? 'Editar NPC' : 'Registrar Novo NPC'}
        icon={<User className="w-5 h-5 text-primary" />}
        maxWidth="max-w-2xl"
        borderColor="border-primary-container/50"
        onSubmit={handleSave}
        footer={
          editingNpc ? (
            <div className="flex justify-between items-center w-full">
              <DeleteButton
                type="button"
                onClick={() => {
                  setShowModal(false);
                  handleDelete(editingNpc);
                }}
                label="Remover NPC"
                variant="danger-ghost"
              />
              <SaveButton
                type="submit"
                label={updateMutation.isPending ? 'Salvando...' : 'Salvar NPC'}
                variant="primary-ghost"
                disabled={updateMutation.isPending}
              />
            </div>
          ) : (
            <div className="flex justify-end items-center w-full">
              <SaveButton
                type="submit"
                label={createMutation.isPending ? 'Salvando...' : 'Salvar NPC'}
                variant="primary-ghost"
                disabled={createMutation.isPending}
              />
            </div>
          )
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
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
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
          </div>

          {/* Race and Occupation Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                Raça / Espécie
              </label>
              <div className="w-full">
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Ex: Humano, Vampiro, Elfo"
                  value={npcRace}
                  onChange={(e) => setNpcRace(e.target.value)}
                  className={`${npcRace.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`}
                />
                {npcRace.length >= 50 && (
                  <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                    Limite atingido (50)
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                Ocupação / Papel
              </label>
              <div className="w-full">
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Ex: Informante, Sacerdote"
                  value={npcOccupation}
                  onChange={(e) => setNpcOccupation(e.target.value)}
                  className={`${npcOccupation.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`}
                />
                {npcOccupation.length >= 50 && (
                  <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                    Limite atingido (50)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload / Link */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
              Imagem do NPC (URL ou Upload)
            </label>
            <div className="flex gap-2 items-center">
              <div className="w-full">
                <input
                  type="text"
                  maxLength={500}
                  placeholder="Cole o link da imagem (https://...)"
                  value={npcImage.startsWith('data:image') ? '[Imagem carregada via upload]' : npcImage}
                  onChange={(e) => setNpcImage(e.target.value)}
                  className={`${!npcImage.startsWith('data:image') && npcImage.length >= 500 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`}
                />
                {!npcImage.startsWith('data:image') && npcImage.length >= 500 && (
                  <div className="text-right mt-1 text-micro font-medium text-red-500/80">
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
                  className="hidden"
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
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
              Vincular à Campanha
            </label>
            <CustomSelect
              value={npcCampaignId}
              onChange={(e) => setNpcCampaignId(e.target.value)}
              variant="parchment"
              options={campaigns.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
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
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
          </div>

          {/* Secret Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
              Segredos, Notas de Campanha & Ganchos
            </label>
            <div className="w-full">
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Anotações confidenciais, ganchos de aventura ou segredos deste NPC..."
                value={npcNotes}
                onChange={(e) => setNpcNotes(e.target.value)}
                className={`${npcNotes.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none`}
              />
              {npcNotes.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
          </div>

          {/* Checkbox Status de combate & Botão Salvar como template */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  checked={hasCombatStats}
                  onChange={(e) => setHasCombatStats(e.target.checked)}
                  className="w-4 h-4 rounded-none border border-outline-variant bg-surface-container text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
                />
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface">
                  Status de combate
                </span>
              </label>

              {editingNpc && hasCombatStats && (
                <button
                  type="button"
                  onClick={handleOpenSaveTemplateModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-sans font-bold uppercase tracking-wider border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary transition-colors cursor-pointer shadow-sm"
                  title="Salvar status como template"
                >
                  <Save className="w-3.5 h-3.5 text-primary" />
                  <span>Salvar como template</span>
                </button>
              )}
            </div>

            {/* Accordion Status */}
            {hasCombatStats && (
              <div className="border border-outline-variant overflow-hidden mt-1">
                <button
                  type="button"
                  onClick={() => setIsStatusAccordionOpen(!isStatusAccordionOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer text-left"
                >
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface">
                    Status
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 ${
                      isStatusAccordionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isStatusAccordionOpen && (
                  <div className="p-4 bg-surface-container-low border-t border-outline-variant/40 space-y-5">
                    {/* NPC base */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                        NPC base
                      </label>
                      <CustomSelect
                        value={selectedBaseTemplate}
                        onChange={(e) => handleSelectBaseTemplate(e.target.value)}
                        placeholder="-- Selecione um NPC base --"
                        variant="parchment"
                        disabled={isLoadingTemplates || isLoadingCustomTemplates}
                        options={[
                          { value: '', label: (isLoadingTemplates || isLoadingCustomTemplates) ? 'Carregando templates...' : '-- Selecione um NPC base --' },
                          ...(Array.isArray(customTemplates) && customTemplates.length > 0
                            ? customTemplates.map((tpl: CampaignNpcItem) => ({
                                value: `custom_${tpl.id}`,
                                label: tpl.name,
                              }))
                            : []),
                          ...(Array.isArray(systemTemplates) ? systemTemplates : []).map((tpl: SystemNpcTemplate) => ({
                            value: tpl.id || tpl.nome_template,
                            label: tpl.nome_template,
                          })),
                        ]}
                      />
                    </div>

                    {/* PV, IP, Deslocamento */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* PV */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                          PV *
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Ex: 25"
                          value={hp}
                          onChange={(e) => setHp(e.target.value === '' ? '' : Number(e.target.value))}
                          className="bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none font-sans font-bold"
                        />
                      </div>

                      {/* IP */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                          IP *
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Ex: 3"
                          value={ip}
                          onChange={(e) => setIp(e.target.value === '' ? '' : Number(e.target.value))}
                          className="bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none font-sans font-bold"
                        />
                      </div>

                      {/* Deslocamento */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                          Deslocamento (metros)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Ex: 12"
                          value={deslocamento}
                          onChange={(e) => setDeslocamento(e.target.value === '' ? '' : Number(e.target.value))}
                          className="bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none font-sans font-bold"
                        />
                      </div>
                    </div>

                    {/* Tabela de Atributos Básicos */}
                    <div className="space-y-2">
                      <span className="text-micro font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
                        Atributos Básicos
                      </span>
                      <div className="bg-surface-container p-4 border border-outline-variant/30">
                        <table className="w-full text-left text-xs font-sans border-collapse">
                          <thead>
                            <tr className="border-b border-outline-variant/30 text-micro text-outline uppercase tracking-wider">
                              <th className="pb-1 font-bold text-on-surface-variant">Atr.</th>
                              <th className="pb-1 font-bold text-center text-on-surface-variant w-24">Pts</th>
                              <th className="pb-1 font-bold text-right text-on-surface-variant pr-2">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { key: 'CON', label: 'CON', val: con, setter: setCon },
                              { key: 'FR', label: 'FOR', val: fr, setter: setFr },
                              { key: 'DEX', label: 'DES', val: dex, setter: setDex },
                              { key: 'AGI', label: 'AGI', val: agi, setter: setAgi },
                              { key: 'INT', label: 'INT', val: intVal, setter: setIntVal },
                              { key: 'WILL', label: 'VON', val: will, setter: setWill },
                              { key: 'PER', label: 'PER', val: per, setter: setPer },
                              { key: 'CAR', label: 'CAR', val: car, setter: setCar },
                            ].map(({ key, label, val, setter }) => (
                              <tr
                                key={key}
                                className="border-b border-outline-variant/10 last:border-0 hover:bg-white/5 transition-colors align-middle"
                              >
                                <td className="py-1.5 font-bold text-on-surface-variant text-caption">{label}</td>
                                <td className="py-1.5 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={val}
                                    onChange={(e) => setter(Math.max(0, Number(e.target.value)))}
                                    className="bg-surface-container border border-outline-variant/50 text-on-surface text-xs px-2 py-0.5 focus:outline-none focus:border-primary rounded-none w-16 font-mono font-bold text-center mx-auto"
                                  />
                                </td>
                                <td className="py-1.5 text-right font-mono text-primary font-bold pr-2">
                                  {val * 4}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Habilidades Específicas */}
                    <div className="space-y-3">
                      <span className="text-micro font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
                        Habilidades Específicas
                      </span>

                      {/* Added Habilidades List */}
                      {habilidadesList.length > 0 && (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto bg-surface-container/60 p-3 border border-outline-variant/30">
                          <span className="text-micro font-bold text-outline uppercase tracking-wider block mb-1">
                            Habilidades Adicionadas
                          </span>
                          {habilidadesList.map((hab, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-start bg-surface-container p-2 border border-outline-variant/20 gap-2"
                            >
                              <div className="text-xs">
                                <span className="font-bold text-primary block">{hab.habilidade}</span>
                                <p className="text-on-surface-variant text-caption leading-relaxed mt-0.5">
                                  {hab.descricao_habilidade}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveHabilidade(idx)}
                                className="text-red-400 hover:text-on-surface p-1 hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Remover habilidade"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Subform to add single habilidad */}
                      <div className="bg-surface-container border border-outline-variant/20 p-3 space-y-3">
                        <span className="text-micro font-bold text-primary uppercase tracking-wider block">
                          + Nova Habilidade Específica
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1 flex flex-col gap-1">
                            <label className="text-micro font-bold text-outline-variant uppercase">
                              Nome da Habilidade
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: Picada Venenosa"
                              value={newHabilidadeNome}
                              onChange={(e) => setNewHabilidadeNome(e.target.value)}
                              className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-2.5 py-2 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="sm:col-span-2 flex flex-col gap-1">
                            <label className="text-micro font-bold text-outline-variant uppercase">
                              Descrição da Habilidade
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: Causa 2d6 pontos de dano e exige teste de CON"
                              value={newHabilidadeDesc}
                              onChange={(e) => setNewHabilidadeDesc(e.target.value)}
                              className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-2.5 py-2 focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <AddButton
                          type="button"
                          onClick={handleAddHabilidade}
                          label="Adicionar Habilidade à Lista"
                          variant="secondary"
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Resistências, Fraquezas e Imunidades */}
                    <div className="space-y-3">
                      <span className="text-micro font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
                        Resistências & Fraquezas
                      </span>
                      <p className="text-micro text-primary/80 italic font-sans">* Separe cada elemento por vírgula</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                            Resistências
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Fogo, Frio, Magia"
                            value={resistencias}
                            onChange={(e) => setResistencias(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                            Fraquezas
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Prata, Luz, Fogo"
                            value={fraquezas}
                            onChange={(e) => setFraquezas(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                            Imunidades
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Veneno, Doenças"
                            value={imunidades}
                            onChange={(e) => setImunidades(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vantagens & Desvantagens */}
                    <div className="space-y-3">
                      <span className="text-micro font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
                        Vantagens & Desvantagens
                      </span>
                      <p className="text-micro text-primary/80 italic font-sans">* Separe cada elemento por vírgula</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                            Vantagens
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Infravisão, Eloquente"
                            value={vantagens}
                            onChange={(e) => setVantagens(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                            Desvantagens
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Curioso, Código de Honra"
                            value={desvantagens}
                            onChange={(e) => setDesvantagens(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Equipamento, Loot & Idiomas */}
                    <div className="space-y-3">
                      <span className="text-micro font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
                        Equipamento, Loot & Idiomas
                      </span>
                      <p className="text-micro text-primary/80 italic font-sans">* Separe cada elemento por vírgula</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                            Equipamentos
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Armadura de Couro, Adaga"
                            value={equipamentos}
                            onChange={(e) => setEquipamentos(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                            Loot / Recompensas
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 35 PP, Chave antiga"
                            value={loot}
                            onChange={(e) => setLoot(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest">
                            Idiomas
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Comum, Élfico"
                            value={idiomas}
                            onChange={(e) => setIdiomas(e.target.value)}
                            className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Small Modal: Salvar como Template */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => {
          if (!isSavingTemplate) setShowTemplateModal(false);
        }}
        title="Salvar como Template"
        icon={<Save className="w-5 h-5 text-primary" />}
        maxWidth="max-w-md"
        zIndex="z-[1050]"
        footer={
          <div className="flex justify-end items-center gap-2.5 w-full">
            <ActionButton
              type="button"
              onClick={() => setShowTemplateModal(false)}
              label="Cancelar"
              variant="secondary"
              size="sm"
              hideLabelOnMobile={false}
              disabled={isSavingTemplate}
            />
            <SaveButton
              type="button"
              onClick={handleSaveTemplate}
              label={isSavingTemplate ? 'Salvando...' : 'Salvar'}
              variant="primary"
              size="sm"
              hideLabelOnMobile={false}
              disabled={isSavingTemplate}
            />
          </div>
        }
      >
        <div className="space-y-3 py-1 font-sans">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Nome do template *
          </label>
          <input
            type="text"
            placeholder="Ex: Guarda Veterano, Taverneiro Hostil..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveTemplate();
              }
            }}
            autoFocus
            className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
          />
          <p className="text-caption text-on-surface-variant leading-relaxed">
            Os dados de combate atuais (atributos, PV, perícias, habilidades e equipamentos) serão armazenados como um modelo base reutilizável nesta campanha.
          </p>
        </div>
      </Modal>

      {/* Manage Templates Modal */}
      <Modal
        isOpen={showManageTemplatesModal}
        onClose={() => {
          if (!bulkDeleteMutation.isPending && !deleteMutation.isPending) {
            setShowManageTemplatesModal(false);
            setSelectedTemplateIds([]);
          }
        }}
        title="Gerenciar Templates"
        icon={<SlidersHorizontal className="w-5 h-5 text-primary" />}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 font-sans py-1">
          {customTemplates.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-sm">
              Nenhum template salvo nesta campanha.
            </div>
          ) : (
            <>
              {/* Select All bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container border border-outline-variant/60 text-xs text-on-surface-variant">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      customTemplates.length > 0 &&
                      selectedTemplateIds.length === customTemplates.length
                    }
                    onChange={handleToggleSelectAllTemplates}
                    className="w-4 h-4 rounded-none border border-outline-variant bg-surface-container text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
                  />
                  <span className="font-bold uppercase tracking-wider text-caption text-on-surface">
                    Selecionar todos
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-caption font-medium">
                    {selectedTemplateIds.length} de {customTemplates.length} selecionado(s)
                  </span>
                  {selectedTemplateIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmDeleteTemplates(true)}
                      className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer rounded-none flex items-center justify-center"
                      title={`Remover ${selectedTemplateIds.length} templates selecionados`}
                      aria-label="Remover templates selecionados"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Template Items List */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {customTemplates.map((tpl) => {
                  const isSelected = selectedTemplateIds.includes(tpl.id);
                  const d = (tpl.data || {}) as Record<string, any>;
                  const pv = d.pv ?? '-';
                  const ipVal = d.ip ?? '-';
                  const desloc = d.deslocamento ?? '-';

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleToggleSelectTemplate(tpl.id)}
                      className={`flex items-center gap-3 p-3.5 border transition-colors cursor-pointer select-none ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant/60 bg-surface-container hover:bg-surface-container-high'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectTemplate(tpl.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded-none border border-outline-variant bg-surface-container text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="font-serif text-sm font-semibold text-on-surface truncate">
                            {tpl.name}
                          </h4>
                          <div className="flex items-center gap-2 text-micro font-mono font-bold text-on-surface-variant">
                            <span className="px-1.5 py-0.5 bg-surface-container-highest border border-outline-variant/40">
                              PV: <span className="text-primary">{pv}</span>
                            </span>
                            <span className="px-1.5 py-0.5 bg-surface-container-highest border border-outline-variant/40">
                              IP: <span className="text-secondary">{ipVal}</span>
                            </span>
                            <span className="px-1.5 py-0.5 bg-surface-container-highest border border-outline-variant/40">
                              Desloc: <span>{desloc}</span>
                            </span>
                          </div>
                        </div>
                        {tpl.description && (
                          <p className="text-xs text-on-surface-variant line-clamp-1 mt-1 font-sans">
                            {tpl.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateToDelete(tpl);
                        }}
                        className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer rounded-none shrink-0"
                        title={`Remover template "${tpl.name}"`}
                        aria-label={`Remover template ${tpl.name}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Confirm Single Delete Template Modal */}
      <ConfirmDeleteModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={handleConfirmDeleteSingleTemplate}
        title="Remover Template"
        description={`Tem certeza que deseja remover o template "${templateToDelete?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Confirm Bulk Delete Templates Modal */}
      <ConfirmDeleteModal
        isOpen={showConfirmDeleteTemplates}
        onClose={() => setShowConfirmDeleteTemplates(false)}
        onConfirm={handleConfirmDeleteTemplates}
        title="Remover Templates"
        description={`Tem certeza que deseja remover ${selectedTemplateIds.length} template(s) selecionado(s)? Esta ação não pode ser desfeita.`}
        isLoading={bulkDeleteMutation.isPending}
      />

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
