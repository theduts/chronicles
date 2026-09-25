import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, Skull, Shield, Heart, Zap, Sparkles, AlertTriangle, Languages, Briefcase, Gift, Compass, PawPrint, Ghost, UserRound, Leaf, Hammer } from 'lucide-react';
import { api } from '../services/api';
import CustomSelect from './CustomSelect';
import Modal from './Modal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ActionButton, SaveButton, AddButton, DeleteButton } from './ActionButtons';

export function CreatureIcon({ tipo, className = "w-5 h-5" }: { tipo?: string; className?: string }) {
  const t = (tipo || '').trim().toLowerCase();
  
  if (t.includes('animal')) {
    return <PawPrint className={`${className} text-emerald-400`} />;
  }
  if (t.includes('construto')) {
    return <Hammer className={`${className} text-amber-500`} />;
  }
  if (t.includes('demôn') || t.includes('demon')) {
    return (
      <img
        src="https://img.icons8.com/ios-glyphs/30/hardcore.png"
        alt="demonio"
        className={`${className} invert brightness-200 shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }
  if (t.includes('espírito') || t.includes('espirito')) {
    return <Ghost className={`${className} text-cyan-400`} />;
  }
  if (t.includes('fada')) {
    return <Sparkles className={`${className} text-pink-400`} />;
  }
  if (t.includes('humanoide') || t.includes('humanóide')) {
    return <UserRound className={`${className} text-blue-400`} />;
  }
  if (t.includes('morto') || t.includes('zumbi') || t.includes('esqueleto') || t.includes('lich')) {
    return <Skull className={`${className} text-slate-200`} />;
  }
  if (t.includes('planta') || t.includes('fungo')) {
    return <Leaf className={`${className} text-green-500`} />;
  }
  // default: Monstro or any other
  return (
    <img
      src="https://img.icons8.com/fluency-systems-regular/48/1A1A1A/orc.png"
      alt="monstro"
      className={`${className} invert brightness-200 shrink-0`}
      referrerPolicy="no-referrer"
    />
  );
}

export interface BestiaryEntry {
  id: string;
  name: string;
  hp: number;
  ip: number;
  tipo?: string;
  deslocamento?: number;
  skills: string; // legacy or fallback
  description: string;
  campaignId: string;
  attributes?: {
    CON: number;
    FR: number;
    FOR?: number;
    DEX: number;
    AGI: number;
    INT: number;
    WILL: number;
    PER: number;
    CAR: number;
  };
  habilidades?: { habilidade: string; descricao_habilidade: string }[];
  vantagens?: string[];
  desvantagens?: string[];
  idiomas?: string[];
  equipamentos?: string[];
  loot?: string[];
  resistencias?: string[];
  fraquezas?: string[];
  imunidades?: string[];
  observacoes?: string;
}

const DEFAULT_ATTRIBUTES = {
  CON: 10,
  FR: 10,
  DEX: 10,
  AGI: 10,
  INT: 10,
  WILL: 10,
  PER: 10,
  CAR: 10
};

const getSafeAttributes = (entry: BestiaryEntry) => {
  return {
    CON: entry.attributes?.CON ?? DEFAULT_ATTRIBUTES.CON,
    FR: entry.attributes?.FR ?? entry.attributes?.FOR ?? DEFAULT_ATTRIBUTES.FR,
    DEX: entry.attributes?.DEX ?? DEFAULT_ATTRIBUTES.DEX,
    AGI: entry.attributes?.AGI ?? DEFAULT_ATTRIBUTES.AGI,
    INT: entry.attributes?.INT ?? DEFAULT_ATTRIBUTES.INT,
    WILL: entry.attributes?.WILL ?? DEFAULT_ATTRIBUTES.WILL,
    PER: entry.attributes?.PER ?? DEFAULT_ATTRIBUTES.PER,
    CAR: entry.attributes?.CAR ?? DEFAULT_ATTRIBUTES.CAR,
  };
};

interface BestiaryViewProps {
  activeCampaignId: string;
  campaigns: { id: string; name: string }[];
}

export default function BestiaryView({ activeCampaignId, campaigns }: BestiaryViewProps) {
  // Clear any existing initial cards from state, start with localStorage only
  const [entries, setEntries] = useState<BestiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('daemon_bestiary');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure types are corrected if older strings existed
        return parsed.map((e: any) => ({
          ...e,
          hp: typeof e.hp === 'string' ? (parseInt(e.hp) || 0) : (e.hp ?? 0),
          ip: typeof e.ip === 'string' ? (parseInt(e.ip) || 0) : (e.ip ?? 0),
          deslocamento: typeof e.deslocamento === 'string' ? (parseInt(e.deslocamento) || 0) : (e.deslocamento ?? 0)
        }));
      }
    } catch (e) {}
    return [];
  });

  const [baseCreatures, setBaseCreatures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BestiaryEntry | null>(null);
  const [beastToDelete, setBeastToDelete] = useState<BestiaryEntry | null>(null);
  const [selectedBaseName, setSelectedBaseName] = useState('');

  // Base creature filters and search states inside the modal
  const [modalFiltersExpanded, setModalFiltersExpanded] = useState(false);
  const [modalSearchBase, setModalSearchBase] = useState('');
  const [modalSelectedType, setModalSelectedType] = useState<string>('Todos');

  // Form states
  const [name, setName] = useState('');
  const [hp, setHp] = useState<number | ''>('');
  const [ip, setIp] = useState<number | ''>('');
  const [tipo, setTipo] = useState('');
  const [deslocamento, setDeslocamento] = useState<number | ''>('');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Attributes form state
  const [con, setCon] = useState(10);
  const [fr, setFr] = useState(10);
  const [dex, setDex] = useState(10);
  const [agi, setAgi] = useState(10);
  const [int, setInt] = useState(10);
  const [will, setWill] = useState(10);
  const [per, setPer] = useState(10);
  const [car, setCar] = useState(10);

  // Sub-editor for habilidades array
  const [habilidadesList, setHabilidadesList] = useState<{ habilidade: string; descricao_habilidade: string }[]>([]);
  const [newHabilidadeNome, setNewHabilidadeNome] = useState('');
  const [newHabilidadeDesc, setNewHabilidadeDesc] = useState('');

  // Comma-separated list fields
  const [vantagens, setVantagens] = useState('');
  const [desvantagens, setDesvantagens] = useState('');
  const [idiomas, setIdiomas] = useState('');
  const [equipamentos, setEquipamentos] = useState('');
  const [loot, setLoot] = useState('');
  const [resistencias, setResistencias] = useState('');
  const [fraquezas, setFraquezas] = useState('');
  const [imunidades, setImunidades] = useState('');

  // Load baseline creatures on mount
  useEffect(() => {
    api.get<any[]>('/bestiary')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBaseCreatures(res.data);
        } else {
          return fetch('/data-mock/bestiario.json')
            .then((r) => r.json())
            .then((d) => Array.isArray(d) && setBaseCreatures(d));
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar monstros da API:', err);
        fetch('/data-mock/bestiario.json')
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setBaseCreatures(data);
          })
          .catch((e) => console.error('Fallback bestiario.json erro:', e));
      });
  }, [activeCampaignId]);

  // Save to localStorage
  const saveEntries = (updatedList: BestiaryEntry[]) => {
    setEntries(updatedList);
    localStorage.setItem('daemon_bestiary', JSON.stringify(updatedList));
  };

  const handleOpenCreateModal = () => {
    setEditingEntry(null);
    setSelectedBaseName('');
    setModalFiltersExpanded(false);
    setModalSearchBase('');
    setModalSelectedType('Todos');
    setName('');
    setHp('');
    setIp('');
    setTipo('');
    setDeslocamento('');
    setSkills('');
    setDescription('');
    setObservacoes('');
    setCon(10);
    setFr(10);
    setDex(10);
    setAgi(10);
    setInt(10);
    setWill(10);
    setPer(10);
    setCar(10);
    setHabilidadesList([]);
    setNewHabilidadeNome('');
    setNewHabilidadeDesc('');
    setVantagens('');
    setDesvantagens('');
    setIdiomas('');
    setEquipamentos('');
    setLoot('');
    setResistencias('');
    setFraquezas('');
    setImunidades('');
    setShowModal(true);
  };

  const handleOpenEditModal = (entry: BestiaryEntry) => {
    setEditingEntry(entry);
    setSelectedBaseName('');
    setName(entry.name);
    setHp(entry.hp);
    setIp(entry.ip);
    setTipo(entry.tipo ?? '');
    setDeslocamento(entry.deslocamento ?? '');
    setSkills(entry.skills ?? '');
    setDescription(entry.description);
    setObservacoes(entry.observacoes ?? '');

    const safeAttrs = getSafeAttributes(entry);
    setCon(safeAttrs.CON);
    setFr(safeAttrs.FR);
    setDex(safeAttrs.DEX);
    setAgi(safeAttrs.AGI);
    setInt(safeAttrs.INT);
    setWill(safeAttrs.WILL);
    setPer(safeAttrs.PER);
    setCar(safeAttrs.CAR);

    setHabilidadesList(entry.habilidades ?? []);
    setNewHabilidadeNome('');
    setNewHabilidadeDesc('');

    setVantagens(entry.vantagens ? entry.vantagens.join(', ') : '');
    setDesvantagens(entry.desvantagens ? entry.desvantagens.join(', ') : '');
    setIdiomas(entry.idiomas ? entry.idiomas.join(', ') : '');
    setEquipamentos(entry.equipamentos ? entry.equipamentos.join(', ') : '');
    setLoot(entry.loot ? entry.loot.join(', ') : '');
    setResistencias(entry.resistencias ? entry.resistencias.join(', ') : '');
    setFraquezas(entry.fraquezas ? entry.fraquezas.join(', ') : '');
    setImunidades(entry.imunidades ? entry.imunidades.join(', ') : '');

    setShowModal(true);
  };

  const handleLoadBaseCreature = (creatureName: string) => {
    setSelectedBaseName(creatureName);
    if (!creatureName) return;

    const creature = baseCreatures.find((c) => c.nome === creatureName);
    if (creature) {
      setName(creature.nome || '');
      setTipo(creature.tipo || '');
      setHp(typeof creature.pv === 'number' ? creature.pv : (parseInt(creature.pv) || 0));
      setIp(typeof creature.ip === 'number' ? creature.ip : (parseInt(creature.ip) || 0));
      setDeslocamento(typeof creature.deslocamento === 'number' ? creature.deslocamento : (parseInt(creature.deslocamento) || 0));
      setDescription(creature.descricao || '');
      setObservacoes(creature.observacoes || '');

      const attrs = creature.atributos || {};
      setCon(attrs.CON ?? 10);
      setFr(attrs.FR ?? attrs.FOR ?? 10);
      setDex(attrs.DEX ?? 10);
      setAgi(attrs.AGI ?? 10);
      setInt(attrs.INT ?? 10);
      setWill(attrs.WILL ?? 10);
      setPer(attrs.PER ?? 10);
      setCar(attrs.CAR ?? 10);

      setHabilidadesList(creature.habilidades ?? []);
      setVantagens(creature.vantagens ? creature.vantagens.join(', ') : '');
      setDesvantagens(creature.desvantagens ? creature.desvantagens.join(', ') : '');
      setIdiomas(creature.idiomas ? creature.idiomas.join(', ') : '');
      setEquipamentos(creature.equipamentos ? creature.equipamentos.join(', ') : '');
      setLoot(creature.loot ? creature.loot.join(', ') : '');
      setResistencias(creature.resistencias ? creature.resistencias.join(', ') : '');
      setFraquezas(creature.fraquezas ? creature.fraquezas.join(', ') : '');
      setImunidades(creature.imunidades ? creature.imunidades.join(', ') : '');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const attributesData = {
      CON: con,
      FR: fr,
      DEX: dex,
      AGI: agi,
      INT: int,
      WILL: will,
      PER: per,
      CAR: car
    };

    const parseCommaSeparated = (val: string) => {
      return val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
    };

    const updatedEntry: Partial<BestiaryEntry> = {
      name: name.trim(),
      hp: hp === '' ? 10 : Number(hp),
      ip: ip === '' ? 0 : Number(ip),
      tipo: tipo.trim() || undefined,
      deslocamento: deslocamento === '' ? undefined : Number(deslocamento),
      skills: skills.trim(),
      description: description.trim(),
      observacoes: observacoes.trim() || undefined,
      attributes: attributesData,
      habilidades: habilidadesList,
      vantagens: parseCommaSeparated(vantagens),
      desvantagens: parseCommaSeparated(desvantagens),
      idiomas: parseCommaSeparated(idiomas),
      equipamentos: parseCommaSeparated(equipamentos),
      loot: parseCommaSeparated(loot),
      resistencias: parseCommaSeparated(resistencias),
      fraquezas: parseCommaSeparated(fraquezas),
      imunidades: parseCommaSeparated(imunidades),
    };

    if (editingEntry) {
      const updated = entries.map((item) =>
        item.id === editingEntry.id
          ? {
              ...item,
              ...updatedEntry,
            }
          : item
      );
      saveEntries(updated);
    } else {
      const newEntry: BestiaryEntry = {
        id: `be_${Date.now()}`,
        campaignId: activeCampaignId,
        name: updatedEntry.name!,
        hp: updatedEntry.hp!,
        ip: updatedEntry.ip!,
        tipo: updatedEntry.tipo,
        deslocamento: updatedEntry.deslocamento,
        skills: updatedEntry.skills!,
        description: updatedEntry.description!,
        observacoes: updatedEntry.observacoes,
        attributes: updatedEntry.attributes,
        habilidades: updatedEntry.habilidades,
        vantagens: updatedEntry.vantagens,
        desvantagens: updatedEntry.desvantagens,
        idiomas: updatedEntry.idiomas,
        equipamentos: updatedEntry.equipamentos,
        loot: updatedEntry.loot,
        resistencias: updatedEntry.resistencias,
        fraquezas: updatedEntry.fraquezas,
        imunidades: updatedEntry.imunidades,
      };
      saveEntries([...entries, newEntry]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const beast = entries.find((item) => item.id === id);
    if (beast) {
      setBeastToDelete(beast);
    }
  };

  const handleConfirmDelete = () => {
    if (beastToDelete) {
      const updated = entries.filter((item) => item.id !== beastToDelete.id);
      saveEntries(updated);
      setBeastToDelete(null);
    }
  };

  // Filter entries by active campaign and search query
  const filteredEntries = entries.filter((item) => {
    const matchesCampaign = item.campaignId === activeCampaignId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tipo && item.tipo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.skills && item.skills.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.observacoes && item.observacoes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCampaign && matchesSearch;
  });

  const activeCampaignName = campaigns.find((c) => c.id === activeCampaignId)?.name || 'Campanha Ativa';

  const filteredBaseCreatures = baseCreatures.filter((item) => {
    const matchesSearch = modalSearchBase === '' || 
      item.nome.toLowerCase().includes(modalSearchBase.toLowerCase()) ||
      (item.tipo && item.tipo.toLowerCase().includes(modalSearchBase.toLowerCase())) ||
      (item.descricao && item.descricao.toLowerCase().includes(modalSearchBase.toLowerCase()));

    if (modalSelectedType === 'Todos') {
      return matchesSearch;
    }

    const t = (item.tipo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const sel = modalSelectedType.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let matchesType = false;
    if (sel === 'animal') matchesType = t.includes('animal');
    else if (sel === 'construtos') matchesType = t.includes('construt');
    else if (sel === 'demonios') matchesType = t.includes('demoni') || t.includes('demon');
    else if (sel === 'espirito') matchesType = t.includes('espirito') || t.includes('espirit');
    else if (sel === 'fada') matchesType = t.includes('fada');
    else if (sel === 'humanoide') matchesType = t.includes('humanoide');
    else if (sel === 'monstro') matchesType = t.includes('monstro');
    else if (sel === 'morto vivo') matchesType = t.includes('morto');
    else if (sel === 'planta') matchesType = t.includes('planta') || t.includes('fung');

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-medium flex items-center gap-2">
            <span>Bestiário</span>
          </h2>
          <p className="font-sans text-xs text-on-surface-variant mt-1">
            Inimigos e bosses registrados para a campanha ativa: <strong className="text-primary">{activeCampaignName}</strong>
          </p>
        </div>
        <div className="hidden md:flex justify-end shrink-0">
          <AddButton
            onClick={handleOpenCreateModal}
            label="Registrar Criatura"
            id="btn-add-beast"
          />
        </div>
      </div>

      {/* Floating Add Button for Mobile */}
      <button
        onClick={handleOpenCreateModal}
        className="md:hidden fixed bottom-[-8px] right-6 w-14 h-14 bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center shadow-2xl border border-primary/50 z-40 cursor-pointer"
        title="Registrar Criatura"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {/* Search and Filters */}
      <div className="bg-surface-container border border-outline-variant/30 p-4 flex gap-4 items-center">
        <div className="relative flex-grow">
          <input type="text"
            placeholder="Buscar ameaça por nome, tipo, habilidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="`${name.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-2.5 py-2 focus:outline-none focus:border-primary pr-12`"
            id="search-beast-input"
          />
          <Search className="w-4 h-4 text-outline-variant absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant/20 p-12 text-center space-y-4">
          <Skull className="w-12 h-12 text-outline-variant mx-auto opacity-40 animate-pulse" />
          <h3 className="font-serif text-lg text-on-surface-variant">Nenhuma Criatura Registrada</h3>
          <p className="text-xs text-outline font-sans max-w-sm mx-auto">
            Não há criaturas cadastradas na campanha ativa <strong className="text-on-surface">{activeCampaignName}</strong> com esses termos de busca. Crie uma nova ameaça clicando no botão acima!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => handleOpenEditModal(entry)}
              className="bg-surface-container border border-outline-variant p-6 flex flex-col justify-between hover:border-primary/60 hover:bg-surface-container/30 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-[0.99]"
              id={`card-beast-${entry.id}`}
            >
              {/* Sanguine skull watermark */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-4 relative z-10 w-full">
                <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
                  <div>
                    <h3 className="font-serif text-xl text-on-surface font-medium flex flex-wrap items-center gap-2">
                      <CreatureIcon tipo={entry.tipo} className="w-5 h-5 shrink-0" />
                      <span>{entry.name}</span>
                      {entry.tipo && (
                        <span className="text-[10px] bg-surface-container-high border border-outline-variant/30 px-2 py-0.5 font-sans font-medium text-on-surface-variant uppercase tracking-wider rounded-none">
                          {entry.tipo}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-emerald-100/80 text-emerald-800 border border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 fill-current text-emerald-600 dark:text-emerald-400" />
                        {entry.hp} PV
                      </span>
                      <span className="bg-blue-100/80 text-blue-800 border border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                        IP {entry.ip}
                      </span>
                      {entry.deslocamento !== undefined && (
                        <span className="bg-amber-100/80 text-amber-900 border border-amber-500 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1">
                          <Compass className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                          Desl. {entry.deslocamento} m
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attributes Table with Column style and calculation % (pts x 4) */}
                <div className="bg-surface-container/95 border border-outline-variant/30 p-4">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-[9px] text-outline uppercase tracking-wider">
                        <th className="pb-1 font-bold text-on-surface-variant">Atr.</th>
                        <th className="pb-1 font-bold text-right text-on-surface-variant">Pts</th>
                        <th className="pb-1 font-bold text-right text-on-surface-variant">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        { key: 'CON', label: 'CON' },
                        { key: 'FR', label: 'FOR' },
                        { key: 'DEX', label: 'DES' },
                        { key: 'AGI', label: 'AGI' },
                        { key: 'INT', label: 'INT' },
                        { key: 'WILL', label: 'VON' },
                        { key: 'PER', label: 'PER' },
                        { key: 'CAR', label: 'CAR' }
                      ] as const).map(({ key, label }) => {
                        const safeAttrs = getSafeAttributes(entry);
                        const val = safeAttrs[key];
                        return (
                          <tr key={key} className="border-b border-outline-variant/10 last:border-0 hover:bg-white/5 transition-colors">
                            <td className="py-1.5 font-bold text-on-surface-variant text-[11px]">{label}</td>
                            <td className="py-1.5 text-right font-mono text-on-surface font-medium">{val}</td>
                            <td className="py-1.5 text-right font-mono text-primary font-bold">{val * 4}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 font-sans text-xs text-on-surface-variant leading-relaxed">
                  {/* Render abilities/habilidades list if present */}
                  {entry.habilidades && entry.habilidades.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider block mb-1 flex items-center gap-1 text-red-400">
                        <Zap className="w-3 h-3 text-red-500 fill-current" />
                        Habilidades ({entry.habilidades.length})
                      </span>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {entry.habilidades.map((hab, idx) => (
                          <div key={idx} className="bg-red-950/10 border border-red-900/25 p-2 rounded-none">
                            <span className="text-[11px] font-bold text-red-300 block">{hab.habilidade}</span>
                            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-normal">{hab.descricao_habilidade}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : entry.skills ? (
                    <div>
                      <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider block mb-1 flex items-center gap-1 text-red-400">
                        <Zap className="w-3 h-3 text-red-500 fill-current" />
                        Habilidades & Ataques Especiais
                      </span>
                      <p className="bg-red-950/20 border border-red-900/30 p-2.5 text-primary-container">
                        {entry.skills}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEntry ? 'Editar Criatura' : 'Criatura'}
        icon={<Skull className="w-5 h-5 text-red-500" />}
        borderColor="border-primary-container/50"
        onSubmit={handleSave}
        footer={
          <div className={`flex items-center w-full ${editingEntry ? 'justify-between' : 'justify-end'}`}>
            {editingEntry && (
              <DeleteButton
                type="button"
                onClick={() => {
                  handleDelete(editingEntry.id);
                  setShowModal(false);
                }}
                label="Remover"
                variant="danger-ghost"
              />
            )}
            <SaveButton
              type="submit"
              label="Salvar"
              variant="primary-ghost"
              id="btn-save-beast"
            />
          </div>
        }
      >
        <div className="space-y-5">
          {/* Select base creature dropdown - only on create */}
          {!editingEntry && (
            <div className="bg-surface-container border border-outline-variant/30 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-sans text-[10px] font-bold text-primary uppercase tracking-widest block">
                  Criatura Base
                </label>
                <button
                  type="button"
                  onClick={() => setModalFiltersExpanded(!modalFiltersExpanded)}
                  className="text-[10px] text-primary font-bold hover:text-on-surface flex items-center gap-1 cursor-pointer uppercase tracking-wider bg-surface-container/60 border border-outline-variant/30 px-2 py-1 hover:border-primary/50 transition-colors"
                >
                  <span>{modalFiltersExpanded ? 'Ocultar Filtros' : 'Filtrar & Buscar'}</span>
                  <span className="material-symbols-outlined text-xs font-bold leading-none">
                    {modalFiltersExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>

              {modalFiltersExpanded && (
                <div className="space-y-4 pt-3 border-t border-outline-variant/10">
                  {/* Search box */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-outline uppercase tracking-wider">Buscar Modelo</label>
                    <input
                      type="text"
                      placeholder="Digite o nome, tipo, lore ou habilidade do modelo..."
                      value={modalSearchBase}
                      onChange={(e) => setModalSearchBase(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/50 text-on-surface text-xs px-3.5 py-2 focus:outline-none focus:border-primary rounded-none font-sans"
                    />
                  </div>

                  {/* Type filter buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-outline uppercase tracking-wider block">Filtrar por Tipo</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Todos', 'animal', 'construtos', 'demônios', 'espírito', 'fada', 'humanóide', 'monstro', 'morto vivo', 'planta'].map((typeOption) => {
                        const isSelected = modalSelectedType === typeOption;
                        return (
                          <button
                            key={typeOption}
                            type="button"
                            onClick={() => setModalSelectedType(typeOption)}
                            className={`text-[9px] font-bold uppercase px-2.5 py-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-on-surface border border-primary'
                                : 'bg-surface-container text-outline border border-outline-variant/30 hover:border-outline-variant hover:text-on-surface'
                            }`}
                          >
                            {typeOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Dropdown & Info */}
                  <div className="space-y-2 pt-3 border-t border-outline-variant/10">
                    <label className="text-[9px] font-bold text-primary uppercase tracking-wider block">Selecione o Modelo Encontrado</label>
                    <CustomSelect
                      value={selectedBaseName}
                      onChange={(e) => handleLoadBaseCreature(e.target.value)}
                      placeholder="-- Selecione um modelo do Bestiário --"
                      id="select-base-creature"
                      variant="parchment"
                      options={[
                        { value: "", label: "-- Selecione um modelo do Bestiário --" },
                        ...filteredBaseCreatures.map((item) => ({
                          value: item.nome,
                          label: `${item.nome} (${item.tipo || 'Sem Tipo'})`
                        }))
                      ]}
                    />
                    <p className="text-[10px] text-outline leading-tight font-sans">
                      * Selecionar uma criatura irá preencher automaticamente todos os atributos e habilidades do bestiário oficial. ({filteredBaseCreatures.length} modelos encontrados)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Character Base Fields */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
              1. Dados Principais da Criatura
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Nome da Criatura *
                </label>
                <div className="w-full">
              <input
                  type="text"
                  required
                  placeholder="Ex: Lobisomem Ancião"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none font-sans font-medium"
                  id="input-beast-name"
                />
              {name.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              {/* Tipo */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Tipo da Criatura
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Humanoide, Espírito, Inseto, Limo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="`${tipo.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none font-sans`"
                  id="input-beast-tipo"
                />
              {tipo.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* PV */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  PV *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ex: 25"
                  value={hp}
                  onChange={(e) => setHp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="`${newHabilidadeNome.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none font-sans font-mono font-bold`"
                  id="input-beast-hp"
                />
              </div>

              {/* IP */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  IP *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ex: 3"
                  value={ip}
                  onChange={(e) => setIp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none font-sans font-mono font-bold"
                  id="input-beast-ip"
                />
              </div>

              {/* Deslocamento */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Deslocamento (metros)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 12"
                  value={deslocamento}
                  onChange={(e) => setDeslocamento(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none font-sans font-mono font-bold"
                  id="input-beast-deslocamento"
                />
              </div>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
              2. Atributos Básicos
            </span>
            <div className="bg-surface-container p-4 border border-outline-variant/30">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-[9px] text-outline uppercase tracking-wider">
                    <th className="pb-1 font-bold text-on-surface-variant">Atr.</th>
                    <th className="pb-1 font-bold text-center text-on-surface-variant w-24">Pts</th>
                    <th className="pb-1 font-bold text-right text-on-surface-variant pr-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    { key: 'CON', label: 'CON', val: con, setter: setCon },
                    { key: 'FR', label: 'FOR', val: fr, setter: setFr },
                    { key: 'DEX', label: 'DES', val: dex, setter: setDex },
                    { key: 'AGI', label: 'AGI', val: agi, setter: setAgi },
                    { key: 'INT', label: 'INT', val: int, setter: setInt },
                    { key: 'WILL', label: 'VON', val: will, setter: setWill },
                    { key: 'PER', label: 'PER', val: per, setter: setPer },
                    { key: 'CAR', label: 'CAR', val: car, setter: setCar }
                  ]).map(({ key, label, val, setter }) => (
                    <tr key={key} className="border-b border-outline-variant/10 last:border-0 hover:bg-white/5 transition-colors align-middle">
                      <td className="py-1.5 font-bold text-on-surface-variant text-[11px]">{label}</td>
                      <td className="py-1.5 text-center">
                        <input
                          type="number"
                          required
                          min="0"
                          max="100"
                          value={val}
                          onChange={(e) => setter(Math.max(0, Number(e.target.value)))}
                          className="bg-surface-container border border-outline-variant/50 text-on-surface text-xs px-2 py-0.5 focus:outline-none focus:border-primary rounded-none w-16 font-mono font-bold text-center mx-auto"
                        />
                      </td>
                      <td className="py-1.5 text-right font-mono text-primary font-bold pr-2">{val * 4}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Specific habilidades list sub-editor */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
              3. Habilidades Específicas
            </span>

            {/* Added Habilidades List */}
            {habilidadesList.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto bg-surface-container/60 p-3 border border-outline-variant/30">
                <span className="text-[9px] font-bold text-outline uppercase tracking-wider block mb-1">
                  Habilidades Adicionadas
                </span>
                {habilidadesList.map((hab, idx) => (
                  <div key={idx} className="flex justify-between items-start bg-surface-container p-2 border border-outline-variant/20 gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-red-400 block">{hab.habilidade}</span>
                      <p className="text-on-surface-variant text-[11px] leading-relaxed mt-0.5">{hab.descricao_habilidade}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHabilidade(idx)}
                      className="text-red-400 hover:text-on-surface p-1 hover:bg-red-950/40 transition-colors"
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
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">
                + Nova Habilidade Específica
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-outline-variant uppercase">Nome da Habilidade</label>
                  <div className="w-full">
              <input
                    type="text"
                    placeholder="Ex: Picada Venenosa"
                    value={newHabilidadeNome}
                    onChange={(e) => setNewHabilidadeNome(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-2.5 py-2 focus:outline-none focus:border-primary"
                  />
              {newHabilidadeNome.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-outline-variant uppercase">Descrição da Habilidade</label>
                  <div className="w-full">
              <input
                    type="text"
                    placeholder="Ex: Causa 2d6 pontos de dano e exige teste de CON"
                    value={newHabilidadeDesc}
                    onChange={(e) => setNewHabilidadeDesc(e.target.value)}
                    className="`${newHabilidadeDesc.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-2.5 py-2 focus:outline-none focus:border-primary`"
                  />
              {newHabilidadeDesc.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
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

          {/* Combate / Resistências Section */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
              4. Resistências & Combate
            </span>
            <p className="text-[10px] text-primary/80 italic font-sans">* Separe cada elemento por vírgula</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Resistências
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Fogo, Frio, Magia"
                  value={resistencias}
                  onChange={(e) => setResistencias(e.target.value)}
                  className="`${resistencias.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {resistencias.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Fraquezas
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Prata, Luz, Fogo"
                  value={fraquezas}
                  onChange={(e) => setFraquezas(e.target.value)}
                  className="`${fraquezas.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {fraquezas.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Imunidades
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Veneno, Doenças"
                  value={imunidades}
                  onChange={(e) => setImunidades(e.target.value)}
                  className="`${imunidades.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {imunidades.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>
          </div>

          {/* Advantages / Disadvantages */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
              5. Vantagens & Desvantagens
            </span>
            <p className="text-[10px] text-primary/80 italic font-sans">* Separe cada elemento por vírgula</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Vantagens
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Infravisão, Levitação"
                  value={vantagens}
                  onChange={(e) => setVantagens(e.target.value)}
                  className="`${vantagens.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {vantagens.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Desvantagens
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Má-Fama, Vulnerabilidade"
                  value={desvantagens}
                  onChange={(e) => setDesvantagens(e.target.value)}
                  className="`${desvantagens.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {desvantagens.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>
          </div>

          {/* Gear, Loot & Languages */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
              6. Equipamento, Loot & Idiomas
            </span>
            <p className="text-[10px] text-primary/80 italic font-sans">* Separe cada elemento por vírgula</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Equipamentos
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Adaga Ritualística"
                  value={equipamentos}
                  onChange={(e) => setEquipamentos(e.target.value)}
                  className="`${equipamentos.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {equipamentos.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Loot / Recompensas
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Pele de Inseto, Joia Negra"
                  value={loot}
                  onChange={(e) => setLoot(e.target.value)}
                  className="`${loot.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {loot.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Idiomas
                </label>
                <div className="w-full">
              <input
                  type="text"
                  placeholder="Ex: Anão, Valkaria"
                  value={idiomas}
                  onChange={(e) => setIdiomas(e.target.value)}
                  className="`${idiomas.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {idiomas.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
              </div>
            </div>
          </div>

          {/* Description & Observações */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block border-b border-outline-variant/20 pb-1">
              7. Descrição & Observações de Combate
            </span>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Descrição Geral & Lore
              </label>
              <div className="w-full">
              <textarea
                  maxLength={300}
                rows={3}
                placeholder="Relatos, aparência física, origens profanas e história..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="`${description.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none font-sans`"
                id="input-beast-description"
              />
              {description.length >= 300 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
            </div>

            {/* Observações */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Observações
              </label>
              <div className="w-full">
              <textarea
                rows={2}
                placeholder="Estratégias de combate, gatilhos de reações, ataques opcionais..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="`${observacoes.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none resize-none font-sans`"
                id="input-beast-observacoes"
              />
              {observacoes.length >= 300 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!beastToDelete}
        onClose={() => setBeastToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Deletar Inimigo"
        description="Tem certeza que deseja deletar o inimigo? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
