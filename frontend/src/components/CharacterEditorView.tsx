import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Trash2, Shirt, PawPrint, TrendingUp, BookOpen, BookMarked, Download, Edit, Unlock, Lock } from 'lucide-react';
import { Character, CharacterAttributes, AttributeRow, StatPoint, SkillRow, ActiveScreen, Spell, CompanionSkill, CompanionAnimal, MontariaEspecial, Familiar, Campaign } from '../types';
import CustomSelect from './CustomSelect';
import Modal from './Modal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ActionButton, SaveButton, AddButton, EditButton, DeleteButton } from './ActionButtons';

interface AprimoramentoNivel {
  nivel: number;
  custo: number;
  descricao: string;
}

interface AprimoramentoJSONEntry {
  id: string;
  name: string;
  tipo: 'POSITIVO' | 'NEGATIVO';
  tem_niveis: boolean;
  custo?: number;
  descricao?: string;
  niveis?: AprimoramentoNivel[];
}

const getEnhancementCostUtil = (str: string, tipo: 'POSITIVO' | 'NEGATIVO', list: AprimoramentoJSONEntry[]) => {
  if (!str || typeof str !== 'string' || !str.trim()) return { cost: 0, name: '' };
  
  const sortedList = [...list].sort((a, b) => b.name.length - a.name.length);
  const cleanStr = str.trim().toLowerCase();
  
  for (const apr of sortedList) {
    if (apr.tipo !== tipo) continue;
    
    const cleanName = apr.name.toLowerCase();
    
    if (cleanStr.startsWith(cleanName) || cleanStr.includes(cleanName)) {
      if (apr.tem_niveis && apr.niveis) {
        const levelMatch = str.match(/(?:Nível|Nivel)\s*(\d+)/i);
        if (levelMatch) {
          const lvlNum = parseInt(levelMatch[1], 10);
          const levelEntry = apr.niveis.find(n => n.nivel === lvlNum);
          if (levelEntry) {
            return { cost: levelEntry.custo, name: apr.name, level: lvlNum, desc: levelEntry.descricao };
          }
        }
        return { cost: apr.niveis[0]?.custo || 0, name: apr.name, level: apr.niveis[0]?.nivel, desc: apr.niveis[0]?.descricao };
      } else {
        return { cost: apr.custo || 0, name: apr.name, desc: apr.descricao };
      }
    }
  }
  
  const ptsMatch = str.match(/[+-]?\s*(\d+)\s*(?:pts|ponto|pontos)/i);
  if (ptsMatch) {
    return { cost: parseInt(ptsMatch[1], 10), name: str };
  }
  
  return { cost: 0, name: str };
};

const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getWeaponClassification = (name: string): { tipo: string; subgrupo_arma: string } => {
  let tipo = 'corpo_a_corpo';
  let subgrupo = 'Espada Longa'; // Default fallback

  const n = name || '';
  if (n.includes('Arco Curto') && !n.includes('Composto')) {
    tipo = 'longo_alcance';
    subgrupo = 'Arco Curto';
  } else if (n.includes('Arco Longo') && !n.includes('Composto')) {
    tipo = 'longo_alcance';
    subgrupo = 'Arco Longo';
  } else if (n.includes('Composto')) {
    tipo = 'longo_alcance';
    subgrupo = 'Arco Composto';
  } else if (n.includes('Besta Leve') || n.includes('Besta de Mão') || n.includes('Virote de Besta')) {
    tipo = 'longo_alcance';
    subgrupo = 'Besta Leve';
  } else if (n.includes('Besta Pesada') || n.includes('Besta de Repetição') || n.includes('Virotes para besta de repetição') || n.includes('Arcabuz')) {
    tipo = 'longo_alcance';
    subgrupo = 'Besta Pesada';
  } else if (n.includes('Funda') || n.includes('Pedras para Funda') || n.includes('Cajado Funda')) {
    tipo = 'longo_alcance';
    subgrupo = 'Funda';
  } else if (n.includes('Azagaia') || n.includes('Arpão') || n.includes('Dardo') || n.includes('Javelin') || n.includes('Chakran') || n.includes('Rede') || n.includes('Shuriken') || n.includes('Machado de Arremesso')) {
    tipo = 'longo_alcance';
    subgrupo = 'Azagaia';
  } else if (n.includes('Zarabatana')) {
    tipo = 'longo_alcance';
    subgrupo = 'Zarabatana';
  } else {
    tipo = 'corpo_a_corpo';
    if (n.includes('Espada Curta') || n.includes('Espada de Treino') || n.includes('Espada Borboleta') || n.includes('Ninja-to') || n.includes('Wakizashi')) {
      subgrupo = 'Espada Curta';
    } else if (n.includes('Espada Longa') || n.includes('Espada Bastarda') || n.includes('Espada de duas') || n.includes('Espada Larga') || n.includes('Espada Montante') || n.includes('Cimitarra') || n.includes('Claymore') || n.includes('Falcione') || n.includes('Katana') || n.includes('Khopesh') || n.includes('Nagamaki') || n.includes('Rapier') || n.includes('Sabre') || n.includes('Terçado')) {
      subgrupo = 'Espada Longa';
    } else if (n.includes('Bastão') || n.includes('Bordão') || n.includes('Nunchaku') || n.includes('Tonfa')) {
      subgrupo = 'Bastão / Cajado';
    } else if (n.includes('Machado') || n.includes('Machadinha') || n.includes('Urgrosh')) {
      subgrupo = 'Machado de Combate';
    } else if (n.includes('Maça') || n.includes('Martelo') || n.includes('Clava') || n.includes('Malho') || n.includes('Mangual') || n.includes('Picareta') || n.includes('Morningstar') || n.includes('Bec de Corbin') || n.includes('Estrela')) {
      subgrupo = 'Maça / Martelo';
    } else if (n.includes('Adaga') || n.includes('Punhal') || n.includes('Faca') || n.includes('Main Guache') || n.includes('Manopla') || n.includes('Sai') || n.includes('Sianghan')) {
      subgrupo = 'Adaga / Faca';
    } else if (n.includes('Lança') || n.includes('Tridente') || n.includes('Pique') || n.includes('Ranseur') || n.includes('Spetum') || n.includes('Bidente') || n.includes('Naginata')) {
      subgrupo = 'Lança';
    } else {
      subgrupo = 'Alabarda / Foice';
    }
  }
  return { tipo, subgrupo_arma: subgrupo };
};

const classifyItemByName = (name: string): { categoria: string; item: string; dano?: string; penalidade?: string; alcance?: string; equipamento?: any } | null => {
  const lower = name.toLowerCase();
  
  // Armas
  const weaponKeywords = [
    { kw: "espada", dano: "1d10", penalidade: "-5", subgrupo: "Espada Longa" },
    { kw: "espadão", dano: "2d6", penalidade: "-9", subgrupo: "Espada Longa" },
    { kw: "montante", dano: "2d6+2", penalidade: "-12", subgrupo: "Espada Longa" },
    { kw: "faca", dano: "1d3+1", penalidade: "-2", subgrupo: "Adaga / Faca" },
    { kw: "adaga", dano: "1d3", penalidade: "-2", subgrupo: "Adaga / Faca" },
    { kw: "punhal", dano: "1d3", penalidade: "-2", subgrupo: "Adaga / Faca" },
    { kw: "arco", dano: "1d6", penalidade: "-10", alcance: "40-100", subgrupo: "Arco Curto" },
    { kw: "besta", dano: "1d6+2", penalidade: "-8", alcance: "40-60", subgrupo: "Besta Leve" },
    { kw: "machado", dano: "1d8", penalidade: "-5", subgrupo: "Machado de Combate" },
    { kw: "martelo", dano: "1d6", penalidade: "-4", subgrupo: "Maça / Martelo" },
    { kw: "maça", dano: "1d6", penalidade: "-4", subgrupo: "Maça / Martelo" },
    { kw: "maca", dano: "1d6", penalidade: "-4", subgrupo: "Maça / Martelo" },
    { kw: "lança", dano: "1d6", penalidade: "-7", subgrupo: "Lança" },
    { kw: "lanca", dano: "1d6", penalidade: "-7", subgrupo: "Lança" },
    { kw: "alabarda", dano: "1d6+2", penalidade: "-6", subgrupo: "Alabarda / Foice" },
    { kw: "foice", dano: "1d6", penalidade: "-4", subgrupo: "Alabarda / Foice" },
    { kw: "funda", dano: "1d3", penalidade: "-4", subgrupo: "Funda" },
    { kw: "azagaia", dano: "1d6", penalidade: "-3", subgrupo: "Azagaia" },
    { kw: "zarabatana", dano: "1", penalidade: "-1", alcance: "10-20", subgrupo: "Zarabatana" },
    { kw: "briga", dano: "1d3", penalidade: "0", subgrupo: null }
  ];
  
  for (const w of weaponKeywords) {
    if (lower.includes(w.kw)) {
      return {
        item: name,
        categoria: "armas",
        dano: w.dano,
        penalidade: w.penalidade,
        alcance: w.alcance || null,
        tipo: w.alcance ? "longo_alcance" : "corpo_a_corpo",
        subgrupo_arma: w.subgrupo
      } as any;
    }
  }
  
  // Armaduras e Escudos
  const armorKeywords = [
    { kw: "escudo", slot: "escudo", ip: 1, penalidade_dex: 0, penalidade_agi: 0 },
    { kw: "escuto", slot: "escudo", ip: 1, penalidade_dex: 0, penalidade_agi: 0 },
    { kw: "armadura", slot: "corpo", ip: 4, penalidade_dex: 1, penalidade_agi: 1 },
    { kw: "peitoral", slot: "corpo", ip: 3, penalidade_dex: 0, penalidade_agi: 1 },
    { kw: "capacete", slot: "cabeça", ip: 1, penalidade_dex: 0, penalidade_agi: 0 },
    { kw: "elmo", slot: "cabeça", ip: 1, penalidade_dex: 0, penalidade_agi: 0 },
    { kw: "gibão", slot: "corpo", ip: 2, penalidade_dex: 0, penalidade_agi: 0 },
    { kw: "gibao", slot: "corpo", ip: 2, penalidade_dex: 0, penalidade_agi: 0 },
    { kw: "brunea", slot: "corpo", ip: 3, penalidade_dex: 1, penalidade_agi: 1 },
    { kw: "cota de malha", slot: "corpo", ip: 4, penalidade_dex: 1, penalidade_agi: 2 },
    { kw: "corselete", slot: "corpo", ip: 2, penalidade_dex: 0, penalidade_agi: 0 }
  ];
  
  for (const a of armorKeywords) {
    if (lower.includes(a.kw)) {
      return {
        item: name,
        categoria: a.slot === "escudo" ? "escudo" : "armadura",
        equipamento: {
          slot: a.slot,
          ip: a.ip,
          penalidade_dex: a.penalidade_dex,
          penalidade_agi: a.penalidade_agi,
          obs: ""
        }
      } as any;
    }
  }
  
  return null;
};

const calculateObraPrimaBonusForSkill = (skillGroup: string, chosenSubgroup: string | undefined, items: any[]): number => {
  if (!skillGroup) return 0;
  
  const isMeleeSkill = skillGroup.toLowerCase().includes("armas brancas") && !skillGroup.toLowerCase().includes("longo alcance");
  const isRangeSkill = skillGroup.toLowerCase().includes("longo alcance");
  
  if (!isMeleeSkill && !isRangeSkill) return 0;
  
  const hasBonus = (items || []).some((i: any) => {
    if (!i || typeof i !== 'object') return false;
    const isWeapon = i.categoria === 'armas' || i.categoria === 'arma';
    if (!isWeapon) return false;
    const isObraPrima = i.modificador === "Arma Obra-Prima";
    if (!isObraPrima) return false;
    
    // Resolve classification
    const classification = {
      tipo: i.tipo || getWeaponClassification(i.item).tipo,
      subgrupo_arma: i.subgrupo_arma || getWeaponClassification(i.item).subgrupo_arma
    };
    
    const matchesGroup = isMeleeSkill ? (classification.tipo === "corpo_a_corpo") : (classification.tipo === "longo_alcance");
    const matchesSubgroup = chosenSubgroup && classification.subgrupo_arma && 
      chosenSubgroup.toLowerCase().trim() === classification.subgrupo_arma.toLowerCase().trim();
      
    return matchesGroup && matchesSubgroup;
  });
  
  return hasBonus ? 10 : 0;
};

const calculateMagicWeaponBonusForSkill = (skillGroup: string, chosenSubgroup: string | undefined, items: any[]): number => {
  if (!skillGroup) return 0;
  
  const skillLower = skillGroup.toLowerCase();
  const isMeleeSkill = skillLower.includes("armas brancas") && !skillLower.includes("longo alcance");
  const isRangeSkill = skillLower.includes("projetil") || skillLower.includes("projétil") || skillLower.includes("longo alcance");
  
  if (!isMeleeSkill && !isRangeSkill) return 0;
  
  let bonus = 0;
  
  (items || []).forEach((i: any) => {
    if (!i || typeof i !== 'object') return;
    const isWeapon = i.categoria === 'armas' || i.categoria === 'arma';
    if (!isWeapon) return;
    if (!i.hasArmaAmuletoMagico) return;
    
    // Resolve classification
    const classification = {
      tipo: i.tipo || getWeaponClassification(i.item).tipo,
      subgrupo_arma: i.subgrupo_arma || getWeaponClassification(i.item).subgrupo_arma
    };
    
    const matchesGroup = isMeleeSkill ? (classification.tipo === "corpo_a_corpo") : (classification.tipo === "longo_alcance");
    const matchesSubgroup = chosenSubgroup && classification.subgrupo_arma && 
      chosenSubgroup.toLowerCase().trim() === classification.subgrupo_arma.toLowerCase().trim();
      
    if (matchesGroup && matchesSubgroup) {
      const level = Number(i.armaAmuletoMagicoLevel) || 1;
      const bValue = level === 2 ? 30 : level * 10;
      bonus += bValue;
    }
  });
  
  return bonus;
};

const calculateMalditaWeaponPenaltyForSkill = (skillGroup: string, chosenSubgroup: string | undefined, items: any[]): number => {
  if (!skillGroup) return 0;
  
  const skillLower = skillGroup.toLowerCase();
  const isMeleeSkill = skillLower.includes("armas brancas") && !skillLower.includes("longo alcance") && !skillLower.includes("longa distância");
  const isRangeSkill = skillLower.includes("projetil") || skillLower.includes("projétil") || skillLower.includes("longo alcance") || skillLower.includes("longa distância");
  
  if (!isMeleeSkill && !isRangeSkill) return 0;
  
  let penalty = 0;
  
  (items || []).forEach((i: any) => {
    if (!i || typeof i !== 'object') return;
    const isWeapon = i.categoria === 'armas' || i.categoria === 'arma';
    if (!isWeapon) return;
    if (!i.hasArmaAmuletoMaldito) return;
    
    // Resolve classification
    const classification = {
      tipo: i.tipo || getWeaponClassification(i.item).tipo,
      subgrupo_arma: i.subgrupo_arma || getWeaponClassification(i.item).subgrupo_arma
    };
    
    const matchesGroup = isMeleeSkill ? (classification.tipo === "corpo_a_corpo") : (classification.tipo === "longo_alcance");
    const matchesSubgroup = chosenSubgroup && classification.subgrupo_arma && 
      chosenSubgroup.toLowerCase().trim() === classification.subgrupo_arma.toLowerCase().trim();
      
    if (matchesGroup && matchesSubgroup) {
      const level = Number(i.armaAmuletoMalditoLevel) || 1;
      const pValue = level === 2 ? 30 : level * 10;
      penalty += pValue;
    }
  });
  
  return penalty;
};

const calculateArmaPreferencialBonusForSkill = (
  skillGroup: string,
  chosenSubgroup: string | undefined,
  items: any[],
  levelPersonagem: number
): number => {
  if (!skillGroup) return 0;
  
  const skillLower = skillGroup.toLowerCase();
  const isMeleeSkill = skillLower.includes("armas brancas") && !skillLower.includes("longo alcance");
  const isRangeSkill = skillLower.includes("projetil") || skillLower.includes("projétil") || skillLower.includes("longo alcance");
  
  if (!isMeleeSkill && !isRangeSkill) return 0;
  
  let bonus = 0;
  const level = Number(levelPersonagem) || 1;
  const bonusValue = 10 + (level - 1) * 5;
  
  (items || []).forEach((i: any) => {
    if (!i || typeof i !== 'object') return;
    const isWeapon = i.categoria === 'armas' || i.categoria === 'arma';
    if (!isWeapon) return;
    if (i.isCustom) return; // Skip custom items (itens customizáveis)
    if (!i.hasArmaPreferencial) return;
    
    const classification = {
      tipo: i.tipo || getWeaponClassification(i.item).tipo,
      subgrupo_arma: i.subgrupo_arma || getWeaponClassification(i.item).subgrupo_arma
    };
    
    const matchesGroup = isMeleeSkill ? (classification.tipo === "corpo_a_corpo") : (classification.tipo === "longo_alcance");
    const matchesSubgroup = chosenSubgroup && classification.subgrupo_arma && 
      chosenSubgroup.toLowerCase().trim() === classification.subgrupo_arma.toLowerCase().trim();
      
    if (matchesGroup && matchesSubgroup) {
      bonus += bonusValue;
    }
  });
  
  return bonus;
};

const calculateCorpoMaleavelBonus = (
  skillGroup: string,
  chosenSubgroup: string | undefined,
  aprimoramentosPositivos: string[]
): number => {
  if (!skillGroup) return 0;
  const isEsportes = skillGroup.toLowerCase().trim() === "esportes";
  const isEscalada = chosenSubgroup && chosenSubgroup.toLowerCase().trim() === "escalada";
  
  if (isEsportes && isEscalada) {
    const hasCorpoMaleavel = (aprimoramentosPositivos || []).some(s =>
      s && (s.toLowerCase().includes("corpo maleável") || s.toLowerCase().includes("corpo maleavel"))
    );
    if (hasCorpoMaleavel) {
      return 10; // +10%
    }
  }
  return 0;
};

const defaultAbilities = [
  { habilidade: "Visão na Penumbra", efeito: "Arcano e Familiar recebem a habilidade de enxergar na penumbra como se estivessem sob a luz do dia." },
  { habilidade: "Furtividade Silenciosa", efeito: "Arcano recebe +10% em testes de Furtividade a menos de 1 metro de distância." },
  { habilidade: "Olhos de Águia", efeito: "Arcano recebe +10% em testes de Percepção (PER) baseados na visão a menos de 1 metro de distância." },
  { habilidade: "Olfato Aguçado", efeito: "Arcano recebe +10% em testes de Percepção (PER) baseados no olfato a menos de 1 metro de distância." },
  { habilidade: "Faro para Magia", efeito: "Arcano e Familiar podem farejar a presença de magia num raio de 10 metros." },
  { habilidade: "Escalada Fluida", efeito: "Arcano recebe +10% em testes de Escalada a menos de 1 metro de distância." },
  { habilidade: "Audição Aguçada", efeito: "Arcano recebe +10% em testes de Escutar a menos de 1 metro de distância." },
  { habilidade: "Prontidão", efeito: "Em contato físico, tanto o Arcano quanto o Familiar realizam todos os testes de Percepção (PER) como Fáceis." },
  { habilidade: "Vínculo", efeito: "Comunicação telepática e transmissão de sensações a até 1,5 km de distância (incapazes de falar mutualmente ou ver o que o outro vê)." },
  { habilidade: "Evasão", efeito: "Sempre que precisar fazer um teste de Agilidade (AGI) para reduzir o dano à metade, reduz o dano a zero se passar." },
  { habilidade: "Partilhar Magias", efeito: "Todas as magias sustentáveis lançadas sobre o Arcano afetam também o Familiar a até 1 metro de distância, sem consumir PMs extras." }
];

const isBaseFamiliarAbility = (habilidadeName: string) => {
  const norm = habilitadeNameNormalize(habilidadeName);
  return [
    "prontidao",
    "vinculo",
    "evasao",
    "partilhar magias",
    "toque",
    "falar com o arcano",
    "protecao a magia 1d6",
    "espionar familiar"
  ].includes(norm);
};

const habilitadeNameNormalize = (name: string): string => {
  return (name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const getFamiliarProgressionForLevel = (charLevel: number) => {
  let band = "1-2";
  let ip_natural_bonus = 0;
  let int_bonus = 1;
  let especiais = ["Prontidão", "Vínculo", "Evasão", "Partilhar Magias"];

  if (charLevel >= 15) {
    band = "15+";
    ip_natural_bonus = 3;
    int_bonus = 4;
    especiais = ["Prontidão", "Vínculo", "Evasão", "Partilhar Magias", "Toque", "Falar com o Arcano", "Proteção a Magia 1d6", "Espionar Familiar"];
  } else if (charLevel >= 13) {
    band = "13-14";
    ip_natural_bonus = 3;
    int_bonus = 3;
    especiais = ["Prontidão", "Vínculo", "Evasão", "Partilhar Magias", "Toque", "Falar com o Arcano", "Proteção a Magia 1d6", "Espionar Familiar"];
  } else if (charLevel >= 11) {
    band = "11-12";
    ip_natural_bonus = 2;
    int_bonus = 3;
    especiais = ["Prontidão", "Vínculo", "Evasão", "Partilhar Magias", "Toque", "Falar com o Arcano", "Proteção a Magia 1d6"];
  } else if (charLevel >= 9) {
    band = "9-10";
    ip_natural_bonus = 2;
    int_bonus = 2;
    especiais = ["Prontidão", "Vínculo", "Evasão", "Partilhar Magias", "Toque", "Falar com o Arcano"];
  } else if (charLevel >= 7) {
    band = "7-8";
    ip_natural_bonus = 1;
    int_bonus = 2;
    especiais = ["Prontidão", "Vínculo", "Evasão", "Partilhar Magias", "Toque", "Falar com o Arcano"];
  } else if (charLevel >= 5) {
    band = "5-6";
    ip_natural_bonus = 1;
    int_bonus = 2;
    especiais = ["Prontidão", "Vínculo", "Evasão", "Partilhar Magias", "Toque", "Falar com o Arcano"];
  } else if (charLevel >= 3) {
    band = "3-4";
    ip_natural_bonus = 0;
    int_bonus = 1;
    especiais = ["Prontidão", "Vínculo", "Evasão", "Partilhar Magias", "Toque"];
  }

  return { band, ip_natural_bonus, int_bonus, especiais };
};

const getFamiliarAbilityDescription = (name: string): string => {
  const norm = habilitadeNameNormalize(name);
  if (norm.includes("prontidao")) return "Em contato físico, tanto o Arcano quanto o Familiar realizam todos os testes de Percepção (PER) como Fáceis.";
  if (norm.includes("vinculo")) return "Comunicação telepática e transmissão de sensações a até 1,5 km de distância (incapazes de falar mutualmente ou ver o que o outro vê).";
  if (norm.includes("evasao")) return "Sempre que precisar fazer um teste de Agilidade (AGI) para reduzir o dano à metade, reduz o dano a zero se passar.";
  if (norm.includes("partilhar magias")) return "Todas as magias sustentáveis lançadas sobre o Arcano afetam também o Familiar a até 1 metro de distância, sem consumir PMs extras.";
  if (norm.includes("toque")) return "O familiar pode transmitir magias de toque conjuradas pelo Arcano.";
  if (norm.includes("falar com o arcano")) return "O familiar e o Arcano podem se comunicar verbalmente como se compartilhassem um idioma comum.";
  if (norm.includes("protecao a magia")) return "O familiar recebe +1d6 de bônus em todos os testes de resistência contra magias.";
  if (norm.includes("espionar familiar")) return "O Arcano pode usar os sentidos do familiar (visão, audição) como se fossem seus, desde que estejam no mesmo plano.";
  return "";
};

const getFamiliarAbilitiesForLevel = (charLevel: number) => {
  const { especiais } = getFamiliarProgressionForLevel(charLevel);
  return especiais.map(name => ({
    habilidade: name,
    efeito: getFamiliarAbilityDescription(name)
  }));
};

const getMontariaProgressionForLevel = (charLevel: number) => {
  let band = "1-3";
  let pv_bonus = 2;
  let ip_bonus = 0;
  let fr_bonus = 1;
  let int_bonus = 0;
  let especiais = ["Partilhar Magias", "Partilhar Resistência"];

  if (charLevel >= 11) {
    band = "11+";
    pv_bonus = 10;
    ip_bonus = 2;
    fr_bonus = 4;
    int_bonus = 3;
    especiais = ["Partilhar Magias", "Partilhar Resistência", "Proteção a Magia 1d6"];
  } else if (charLevel >= 7) {
    band = "7-10";
    pv_bonus = 7;
    ip_bonus = 1;
    fr_bonus = 3;
    int_bonus = 2;
    especiais = ["Partilhar Magias", "Partilhar Resistência"];
  } else if (charLevel >= 4) {
    band = "4-6";
    pv_bonus = 5;
    ip_bonus = 1;
    fr_bonus = 2;
    int_bonus = 1;
    especiais = ["Partilhar Magias", "Partilhar Resistência"];
  }

  return { band, pv_bonus, ip_bonus, fr_bonus, int_bonus, especiais };
};

const getMontariaAbilityDescription = (name: string): string => {
  const norm = habilitadeNameNormalize(name);
  if (norm.includes("partilhar magias")) {
    return "Todas as magias sustentáveis lançadas sobre o cavaleiro afetam também a montaria a até 1 metro de distância, sem consumir PMs extras.";
  }
  if (norm.includes("partilhar resistencia")) {
    return "A montaria compartilha de todos os bônus em testes de resistência e imunidades do próprio cavaleiro.";
  }
  if (norm.includes("protecao a magia")) {
    return "A montaria recebe +1d6 de bônus em todos os testes de resistência contra magias.";
  }
  return "";
};

const getMontariaAbilitiesForLevel = (charLevel: number) => {
  const { especiais } = getMontariaProgressionForLevel(charLevel);
  return especiais.map(name => ({
    habilidade: name,
    efeito: getMontariaAbilityDescription(name)
  }));
};

const calculateFamiliarSkillBonus = (
  skillGroup: string,
  chosenSubgroup: string | undefined,
  resolvedAttrKey: string | null,
  aprimoramentosPositivos: string[],
  familiar: any
): number => {
  const hasFamiliares = (aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares"));
  if (!hasFamiliares || !familiar || !familiar.animalId) return 0;
  
  // Dynamic JSON bonus matching
  if (familiar.bonus_arcano) {
    const bonus = familiar.bonus_arcano;
    const tipo = bonus.tipo;
    const chaveLower = (bonus.chave || '').toLowerCase().trim();
    const skillLower = skillGroup.toLowerCase().trim();
    const subLower = chosenSubgroup ? chosenSubgroup.toLowerCase().trim() : '';

    if (tipo === 'pericia') {
      if (bonus.campo_comparacao === 'grupo' && skillLower.includes(chaveLower)) {
        return Number(bonus.valor) || 0;
      }
      if (bonus.campo_comparacao === 'subgrupo' && subLower.includes(chaveLower)) {
        if (bonus.parent_grupo) {
          const parentLower = bonus.parent_grupo.toLowerCase().trim();
          if (skillLower === parentLower) {
            return Number(bonus.valor) || 0;
          }
        } else {
          return Number(bonus.valor) || 0;
        }
      }
    } else if (tipo === 'atributo') {
      if (resolvedAttrKey && resolvedAttrKey.toUpperCase() === bonus.chave.toUpperCase()) {
        return Number(bonus.valor) || 0;
      }
    }
  }

  // Fallback / legacy hardcoded logic
  const animalId = (familiar.animalId || '').toLowerCase().trim();
  const animalNome = (familiar.animalNome || '').toLowerCase().trim();
  const isGato = animalId === 'gato' || animalNome === 'gato';
  const isFalcao = animalId === 'falcao' || animalId === 'falcão' || animalNome === 'falcao' || animalNome === 'falcão';
  const isRato = animalId === 'rato' || animalNome === 'rato';
  const isTexugo = animalId === 'texugo' || animalNome === 'texugo';
  const isLagarto = animalId === 'lagarto' || animalNome === 'lagarto';
  const isMorcego = animalId === 'morcego' || animalNome === 'morcego';

  const skillLower = skillGroup.toLowerCase().trim();
  const subLower = chosenSubgroup ? chosenSubgroup.toLowerCase().trim() : '';

  if (isGato && skillLower.includes('furtividade')) {
    return 10;
  }
  if (isFalcao && resolvedAttrKey === 'PER') {
    return 10;
  }
  if (isRato && resolvedAttrKey === 'CON') {
    return 10;
  }
  if (isTexugo && resolvedAttrKey === 'AGI') {
    return 10;
  }
  if (isLagarto && skillLower === 'esportes' && subLower === 'escalada') {
    return 10;
  }
  if (isMorcego && skillLower.includes('escutar')) {
    return 10;
  }
  
  return 0;
};

const getRacialFreePointsForSkill = (
  skillGroup: string,
  chosenSubgroup: string | undefined,
  charRace: string | undefined,
  racasData?: Record<string, any>
): number => {
  if (!charRace || !racasData) return 0;
  const raceObj = Object.values(racasData as Record<string, any>).find(r => 
    r.nome?.toLowerCase() === charRace.toLowerCase() ||
    r.id?.toLowerCase() === charRace.toLowerCase() ||
    (charRace.toLowerCase() === 'anão' && r.id === 'anao')
  );
  if (!raceObj) return 0;

  let freePoints = 0;

  // 1. Check if it's in pericias_iniciais_obrigatorias
  if (raceObj.pericias_iniciais_obrigatorias) {
    const mandatoryKey = Object.keys(raceObj.pericias_iniciais_obrigatorias).find(k => k.toLowerCase() === skillGroup.toLowerCase());
    if (mandatoryKey) {
      const mandatory = raceObj.pericias_iniciais_obrigatorias[mandatoryKey];
      if (typeof mandatory === 'number') {
        freePoints += mandatory;
      } else if (typeof mandatory === 'object' && chosenSubgroup) {
        const subKey = Object.keys(mandatory).find(k => k.toLowerCase() === chosenSubgroup.toLowerCase());
        if (subKey) {
          freePoints += mandatory[subKey] || 0;
        }
      }
    }
  }

  // 2. Check if it's in pericias_bonus
  if (raceObj.pericias_bonus) {
    const bonusKey = Object.keys(raceObj.pericias_bonus).find(k => k.toLowerCase() === skillGroup.toLowerCase());
    if (bonusKey) {
      const bonusVal = raceObj.pericias_bonus[bonusKey];
      if (typeof bonusVal === 'number') {
        freePoints += bonusVal;
      } else if (typeof bonusVal === 'object' && chosenSubgroup) {
        const subKey = Object.keys(bonusVal).find(k => k.toLowerCase() === chosenSubgroup.toLowerCase());
        if (subKey) {
          freePoints += bonusVal[subKey] || 0;
        }
      }
    }
  }

  return freePoints;
};

const calculateRacialSkillBonus = (
  skillGroup: string,
  chosenSubgroup: string | undefined,
  charRace: string | undefined
): number => {
  return 0; // Handled directly via getRacialFreePointsForSkill under "novo valor base" rule to avoid double-counting
};

const calcularValorDeTesteFinal = (
  arma: any,
  periciaBase: SkillRow,
  nivelPersonagem: number,
  attributes?: any
): { finalAtk: number; finalDef: number; finalVal: number; bonus: number } => {
  if (!arma || !periciaBase) {
    return { finalAtk: 0, finalDef: 0, finalVal: 0, bonus: 0 };
  }
  const level = Number(nivelPersonagem) || 1;
  const bonus = level >= 2 ? (level - 1) * 5 : 0;

  let attrVal = Number(periciaBase.atributo) || 0;

  if (arma.hasAcuideArma && attributes) {
    const agiVal = attributes.agi ? (Math.round(Number(attributes.agi.valorAmpliado)) || 0) : 0;
    const desVal = attributes.des ? (Math.round(Number(attributes.des.valorAmpliado)) || 0) : 0;
    const forVal = attributes.for ? (Math.round(Number(attributes.for.valorAmpliado)) || 0) : 0;
    attrVal = Math.max(agiVal, desVal, forVal);
  }
  
  let finalAtk = Number(periciaBase.atkGasto ?? 0) + attrVal;
  let finalDef = Number(periciaBase.defGasto ?? 0) + attrVal;
  let finalVal = attrVal + (Math.round(Number(periciaBase.gasto)) || 0);

  if (arma.isCustom) {
    return { finalAtk, finalDef, finalVal, bonus: 0 };
  }

  const classification = {
    tipo: arma.tipo || getWeaponClassification(arma.item).tipo,
    subgrupo_arma: arma.subgrupo_arma || getWeaponClassification(arma.item).subgrupo_arma
  };

  const skillLower = (periciaBase.group || '').toLowerCase();
  const isMeleeSkill = skillLower.includes("armas brancas") && !skillLower.includes("longo alcance");
  const isRangeSkill = skillLower.includes("projetil") || skillLower.includes("projétil") || skillLower.includes("longo alcance");

  const matchesGroup = isMeleeSkill ? (classification.tipo === "corpo_a_corpo") : (classification.tipo === "longo_alcance");
  const matchesSubgroup = periciaBase.chosenSubgroup && classification.subgrupo_arma && 
    periciaBase.chosenSubgroup.toLowerCase().trim() === classification.subgrupo_arma.toLowerCase().trim();

  const isEligible = matchesGroup && matchesSubgroup;

  if (isEligible && arma.hasArmaPreferencial) {
    finalAtk += bonus;
    finalDef += bonus;
    finalVal += bonus;
  }

  return {
    finalAtk,
    finalDef,
    finalVal,
    bonus: isEligible && arma.hasArmaPreferencial ? bonus : 0
  };
};

interface CharacterEditorViewProps {
  characterId: string | null; // null means we are creating a new character
  characters: Character[];
  onSave: (char: Character) => void;
  onSilentUpdate?: (char: Character) => void; // New optional prop for silent saves
  setActiveScreen: (screen: ActiveScreen) => void;
  onDelete?: (id: string) => void;
  userRole?: 'player' | 'dm';
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  campaigns?: Campaign[];
  fieldErrors?: Record<string, string>;
  onClearFieldErrors?: () => void;
  onLevelUp?: (id: string, updatedChar?: Character, onComplete?: () => void) => void;
  isLevelingUp?: boolean;
}

const PORTRAIT_PRESETS = [
  { name: 'Sacerdote Profano', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlYw1vX4_5AranMXYvv7IFTlcCjHcECTgJxpa9dyfq4cr7BsXA1dp1E4Go7TucknUb7ELs7BwfJSTngw7CTVwu6n2lmYsoB5jav5E1zuD8Rh2qRmaea3IpiGZDwNcc1yz65aTQG-yX1nA3BRJo6HTD1nSeNpWqDjRsbgrnMlCFO9ktuJPkMlJEM0KzpPIffLZzWP232Q3nUic4GYpN_BX6QMql8UcQWDvspI8rsN4nMqf7Wb4lDh7naq_MQMEBK9JewB6eM9kALHA' },
  { name: 'Elfa Sombria', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7DeFgyUOnHxRZvvGfR-Y0nQkf7ElC6FCctdcWEXPd8tC20rmQcj24Y72XAT1FQW5QCQ1LRgUtpBDily2Ws3a_UZsLjXcETQfl3gzBZVQ9hzH3eUZZW1lLuw2-GERrI0iq31Thnog0iYbWIN8ANPtmviW0mXHNekdjgjxoPYuxFVkIEX8IbaWGiOc430htDKp0NFcJUMctA6faboHLViGqI3Ma6bCSa9CYQdmjVIPbBJgXyfqhHYlZ4Qb_eWlKu6L2GpurpHf1X3w' },
  { name: 'Guerreiro de Ferro', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzHV8keJSuX5E-2PZm45MdsrjIk2ywxdx55MMVbUdClYWXSr_2teV6fM1dkbMrnLisY2XJ3vsFzdHL3xoYRfe5xr9sWjzFAU9Jk-hpTWtZN7W_DaciuW0QTHe83RmVUdfI18S1cNjwgC0Y4kQCPhOxhjd9lLrnM58RNJsww5yjHEg7TepyrTSEQP3VEjOYVj7HcbOHYP0gUD3_b7Vk_oDI7m0zv4kHpP2oN-rvnzJ06leXb4JQC0zGFztIYn9Ps7UJvTbALi1ScFI' },
  { name: 'Ocultista do Vazio', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyBE-ItarA2hvl2Qjn2dNuip1dhsPXFl5v6v6k6ZU5JGixPQ3vsM8xDTAEwufHoLiy9FyHk2uJWueXaR5AzI30Gw_3U8iHpcKohjr_7jwAjl5tlSo6IXJabBuybntirharCoV8BP5QIp7kO8-yanP2crysFD1tKBsuTXxgOf-ri0ItymKUbamPg20yqBRqLOwDz4jMQUhqLC2j7G_U_PCRHmuWiO3WHUosKCn0rDRYzV-oxBcgfHwTHCpVPvreiki6lyhdy7Bk_48' },
];

const DEFAULT_NEW_CHARACTER = (): Character => ({
  id: '',
  name: '',
  sex: '',
  race: '',
  weight: '',
  height: '',
  age: '',
  classKit: '',
  level: 1,
  xp: 0,
  portraitUrl: '',
  attributes: {
    con: { natural: 0, penalidade: 0, bonusRacial: 0, pctNatural: '0%', valorAmpliado: 0, pctAmpliado: '0%', pontosGastos: 0, penalidadeManual: 0, penalidadeExtra: 0, bonusRacialManual: 0, bonusRacialExtra: 0 },
    for: { natural: 0, penalidade: 0, bonusRacial: 0, pctNatural: '0%', valorAmpliado: 0, pctAmpliado: '0%', pontosGastos: 0, penalidadeManual: 0, penalidadeExtra: 0, bonusRacialManual: 0, bonusRacialExtra: 0 },
    des: { natural: 0, penalidade: 0, bonusRacial: 0, pctNatural: '0%', valorAmpliado: 0, pctAmpliado: '0%', pontosGastos: 0, penalidadeManual: 0, penalidadeExtra: 0, bonusRacialManual: 0, bonusRacialExtra: 0 },
    agi: { natural: 0, penalidade: 0, bonusRacial: 0, pctNatural: '0%', valorAmpliado: 0, pctAmpliado: '0%', pontosGastos: 0, penalidadeManual: 0, penalidadeExtra: 0, bonusRacialManual: 0, bonusRacialExtra: 0 },
    int: { natural: 0, penalidade: 0, bonusRacial: 0, pctNatural: '0%', valorAmpliado: 0, pctAmpliado: '0%', pontosGastos: 0, penalidadeManual: 0, penalidadeExtra: 0, bonusRacialManual: 0, bonusRacialExtra: 0 },
    per: { natural: 0, penalidade: 0, bonusRacial: 0, pctNatural: '0%', valorAmpliado: 0, pctAmpliado: '0%', pontosGastos: 0, penalidadeManual: 0, penalidadeExtra: 0, bonusRacialManual: 0, bonusRacialExtra: 0 },
    will: { natural: 0, penalidade: 0, bonusRacial: 0, pctNatural: '0%', valorAmpliado: 0, pctAmpliado: '0%', pontosGastos: 0, penalidadeManual: 0, penalidadeExtra: 0, bonusRacialManual: 0, bonusRacialExtra: 0 },
    car: { natural: 0, penalidade: 0, bonusRacial: 0, pctNatural: '0%', valorAmpliado: 0, pctAmpliado: '0%', pontosGastos: 0, penalidadeManual: 0, penalidadeExtra: 0, bonusRacialManual: 0, bonusRacialExtra: 0 },
  },
  statusPoints: {
    vida: { valorFinal: 10, danoSofrido: 0 },
    heroicos: { valorFinal: 0, danoSofrido: 0 },
    magia: { valorFinal: 0, magiaExaurida: 0 },
    fe: { valorFinal: 0, feExaurida: 0 },
    psi: { valorFinal: 100, esforcoMental: 0, estadoMental: 'Saudável' },
    willPoints: { valorFinal: 10, esforcoMental: 0 },
  },
  protection: {
    ipCinetico: 0,
    ipBalistico: 0,
    ipEscudo: 0,
    ipPsiquico: 0,
    ipMagico: 0,
    durabilidadeArmadura: { atual: 0, total: 0 },
  },
  aprimoramentosPositivos: [
    "",
    "",
    "",
    "",
    ""
  ],
  aprimoramentosNegativos: [
    "",
    "",
    "",
    "",
    ""
  ],
  descricaoEfeitos: "",
  campaignGenres: {
    arkanun: false,
    trevas: true,
    invasao: false,
    supers: false,
    fantasia: false,
    terror: false,
    scifi: false,
    cyberpunk: false,
  },
  skills: [],
  treasure: { ouro: 0, prata: 0, bronze: 0 },
  items: ["", "", "", "", "", ""],
  background: '',
  alinhamento: 'Neutro',
  focusAllocation: {
    criar: 0,
    controlar: 0,
    entender: 0,
    caminhoNome: 'Luz',
    caminhoValor: 0
  }
});

const normalizeStatPoint = (rawPoint: any, defaultPoint: StatPoint): StatPoint => {
  if (rawPoint && typeof rawPoint === 'object') {
    return {
      ...defaultPoint,
      ...rawPoint,
      valorFinal: rawPoint.valorFinal !== null && rawPoint.valorFinal !== undefined 
        ? rawPoint.valorFinal 
        : defaultPoint.valorFinal,
      danoSofrido: rawPoint.danoSofrido !== null && rawPoint.danoSofrido !== undefined 
        ? rawPoint.danoSofrido 
        : (defaultPoint.danoSofrido ?? 0),
      magiaExaurida: rawPoint.magiaExaurida !== null && rawPoint.magiaExaurida !== undefined 
        ? rawPoint.magiaExaurida 
        : (defaultPoint.magiaExaurida ?? 0),
      feExaurida: rawPoint.feExaurida !== null && rawPoint.feExaurida !== undefined 
        ? rawPoint.feExaurida 
        : (defaultPoint.feExaurida ?? 0),
      esforcoMental: rawPoint.esforcoMental !== null && rawPoint.esforcoMental !== undefined 
        ? rawPoint.esforcoMental 
        : (defaultPoint.esforcoMental ?? 0),
      estadoMental: rawPoint.estadoMental || defaultPoint.estadoMental || 'Saudável',
    };
  }
  if (typeof rawPoint === 'number' || typeof rawPoint === 'string') {
    return {
      ...defaultPoint,
      valorFinal: rawPoint,
    };
  }
  return { ...defaultPoint };
};

const normalizeAttributeRow = (rawAttr: any, defaultAttr: AttributeRow): AttributeRow => {
  if (rawAttr && typeof rawAttr === 'object') {
    return {
      ...defaultAttr,
      ...rawAttr,
      natural: rawAttr.natural ?? defaultAttr.natural,
      penalidade: rawAttr.penalidade ?? defaultAttr.penalidade,
      bonusRacial: rawAttr.bonusRacial ?? defaultAttr.bonusRacial,
      pontosGastos: rawAttr.pontosGastos ?? defaultAttr.pontosGastos,
      penalidadeManual: rawAttr.penalidadeManual ?? defaultAttr.penalidadeManual ?? 0,
      penalidadeExtra: rawAttr.penalidadeExtra ?? defaultAttr.penalidadeExtra ?? 0,
      bonusRacialManual: rawAttr.bonusRacialManual ?? defaultAttr.bonusRacialManual ?? (rawAttr.bonusRacial ?? 0),
      bonusRacialExtra: rawAttr.bonusRacialExtra ?? defaultAttr.bonusRacialExtra ?? 0,
      valorAmpliado: rawAttr.valorAmpliado ?? defaultAttr.valorAmpliado ?? 0,
      pctNatural: rawAttr.pctNatural || defaultAttr.pctNatural || '0%',
      pctAmpliado: rawAttr.pctAmpliado || defaultAttr.pctAmpliado || '0%',
    };
  }
  return { ...defaultAttr };
};

export const normalizeCharacter = (raw: any): Character => {
  const base = DEFAULT_NEW_CHARACTER();
  if (!raw || typeof raw !== 'object') return base;

  const rawStatus = (raw.statusPoints && typeof raw.statusPoints === 'object') ? raw.statusPoints : {};
  const rawAttrs = (raw.attributes && typeof raw.attributes === 'object') ? raw.attributes : {};
  const rawProt = (raw.protection && typeof raw.protection === 'object') ? raw.protection : {};
  const rawTreasure = (raw.treasure && typeof raw.treasure === 'object') ? raw.treasure : {};

  return {
    ...base,
    ...raw,
    attributes: {
      con: normalizeAttributeRow(rawAttrs.con, base.attributes.con),
      for: normalizeAttributeRow(rawAttrs.for, base.attributes.for),
      des: normalizeAttributeRow(rawAttrs.des, base.attributes.des),
      agi: normalizeAttributeRow(rawAttrs.agi, base.attributes.agi),
      int: normalizeAttributeRow(rawAttrs.int, base.attributes.int),
      per: normalizeAttributeRow(rawAttrs.per, base.attributes.per),
      will: normalizeAttributeRow(rawAttrs.will, base.attributes.will),
      car: normalizeAttributeRow(rawAttrs.car, base.attributes.car),
    },
    statusPoints: {
      vida: normalizeStatPoint(rawStatus.vida, base.statusPoints.vida),
      heroicos: normalizeStatPoint(rawStatus.heroicos, base.statusPoints.heroicos),
      magia: normalizeStatPoint(rawStatus.magia, base.statusPoints.magia),
      fe: normalizeStatPoint(rawStatus.fe, base.statusPoints.fe),
      psi: normalizeStatPoint(rawStatus.psi, base.statusPoints.psi),
      willPoints: normalizeStatPoint(rawStatus.willPoints, base.statusPoints.willPoints),
    },
    protection: {
      ...base.protection,
      ...rawProt,
      durabilidadeArmadura: {
        ...base.protection.durabilidadeArmadura,
        ...(rawProt.durabilidadeArmadura || {}),
      },
    },
    treasure: {
      ouro: Number(rawTreasure.ouro) || 0,
      prata: Number(rawTreasure.prata) || 0,
      bronze: Number(rawTreasure.bronze) || 0,
    },
    aprimoramentosPositivos: Array.isArray(raw.aprimoramentosPositivos)
      ? raw.aprimoramentosPositivos
      : base.aprimoramentosPositivos,
    aprimoramentosNegativos: Array.isArray(raw.aprimoramentosNegativos)
      ? raw.aprimoramentosNegativos
      : base.aprimoramentosNegativos,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    spells: Array.isArray(raw.spells) ? raw.spells : [],
    items: Array.isArray(raw.items) ? raw.items : base.items,
    armors: Array.isArray(raw.armors) ? raw.armors : [],
    campaignGenres: {
      ...base.campaignGenres,
      ...(raw.campaignGenres || {}),
    },
  };
};

const getAttrSanityPenalty = (attrKey: keyof CharacterAttributes, char: Character): number => {
  const willPts = Number(char?.attributes?.will?.pontosGastos) || 0;
  const calculatedSanidadeVal = 100 + willPts;
  const loucura = calculatedSanidadeVal - (Number(char?.statusPoints?.psi?.esforcoMental) || 0);

  if (attrKey === 'int') {
    if (loucura >= 50 && loucura < 75) return 1;
    if (loucura >= 25 && loucura < 50) return 1;
    if (loucura >= 1 && loucura < 25) return 2;
  } else if (attrKey === 'will') {
    if (loucura >= 25 && loucura < 50) return 1;
    if (loucura >= 1 && loucura < 25) return 2;
  } else if (attrKey === 'car') {
    if (loucura >= 1 && loucura < 25) return 2;
  }
  return 0;
};

export default function CharacterEditorView({
  characterId,
  characters,
  onSave,
  onSilentUpdate,
  setActiveScreen,
  onDelete,
  userRole = 'player',
  onApprove,
  onReject,
  campaigns: propCampaigns,
  fieldErrors = {},
  onClearFieldErrors = () => {},
  onLevelUp,
  isLevelingUp = false,
}: CharacterEditorViewProps) {
  const [editedChar, setEditedChar] = useState<Character>(DEFAULT_NEW_CHARACTER());

  const renderFieldError = (fieldName: string) => {
    const errorMsg = fieldErrors[fieldName];
    if (!errorMsg) return null;
    return (
      <p className="text-primary text-sm font-medium leading-tight mt-1 text-left">
        {errorMsg}
      </p>
    );
  };

  // Fetch system rules from database API
  const { data: racasData = {} } = useQuery<Record<string, any>>({
    queryKey: ['system-rules', 'racas'],
    queryFn: async () => {
      const res = await api.get('/rules/racas');
      return res.data || {};
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: aprimoramentosData = {} } = useQuery<Record<string, any>>({
    queryKey: ['system-rules', 'aprimoramentos'],
    queryFn: async () => {
      const res = await api.get('/rules/aprimoramentos');
      return res.data || {};
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const aprimoramentosList: AprimoramentoJSONEntry[] = useMemo(() => {
    return Object.values(aprimoramentosData as Record<string, any>).map((item: any) => ({
      id: item.id || '',
      name: item.nome || item.name || item.id || '',
      tipo: item.tipo || 'POSITIVO',
      tem_niveis: !!item.tem_niveis,
      custo: item.custo,
      descricao: item.descricao,
      niveis: item.niveis,
    }));
  }, [aprimoramentosData]);

  const getEnhancementCost = (str: string, tipo: 'POSITIVO' | 'NEGATIVO') => {
    return getEnhancementCostUtil(str, tipo, aprimoramentosList);
  };

  // Fetch all campaigns user is attached to (as DM or player)
  const { data: serverUserCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ['campaigns-for-character'],
    queryFn: async () => {
      try {
        const response = await api.get<any[]>('/campaigns');
        return response.data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          dmEmail: c.dmEmail || '',
          players: c.players || [],
          subtitulo: c.subtitulo,
          universo: c.universo,
          lore: c.lore,
          ilustracao: c.ilustracao,
          inviteCode: c.inviteCode,
          isDm: c.isDm,
        }));
      } catch (e) {
        return [];
      }
    },
  });

  const availableCampaigns = propCampaigns && propCampaigns.length > 0 ? propCampaigns : serverUserCampaigns;
  const [originalChar, setOriginalChar] = useState<Character | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fichaAnimStatus, setFichaAnimStatus] = useState<'idle' | 'approving' | 'rejecting'>('idle');

  const lastSilentSavedRef = useRef<string>('');
  const loadedCharacterIdRef = useRef<string | null>(null);

  useEffect(() => {
    lastSilentSavedRef.current = '';
  }, [characterId]);

  // Extract session fields as a normalized string
  const getSessionFieldsString = (char: Character) => {
    if (!char) return '';
    try {
      const cleaned = cleanCharacterForSaving(char);
      const attributesSubset = Object.keys(cleaned.attributes).reduce((acc, k) => {
        const attr = cleaned.attributes[k as keyof CharacterAttributes];
        if (attr) {
          acc[k] = {
            bonusRacial: attr.bonusRacial,
            bonusRacialManual: attr.bonusRacialManual,
            bonusRacialExtra: attr.bonusRacialExtra,
            penalidade: attr.penalidade,
            penalidadeManual: attr.penalidadeManual,
            penalidadeExtra: attr.penalidadeExtra,
          };
        }
        return acc;
      }, {} as any);

      return JSON.stringify({
        items: cleaned.items || [],
        armors: cleaned.armors || [],
        statusPoints: cleaned.statusPoints,
        attributesSubset,
      });
    } catch (e) {
      return '';
    }
  };

  // Silently save session-level fields directly to parent state, preserving everything else
  const triggerSilentSave = (updatedLocalChar: Character) => {
    if (!onSilentUpdate || !characterId) return;

    // We find the parent's actual character object
    const match = characters.find(c => c.id === characterId);
    if (!match) return;

    const cleaned = cleanCharacterForSaving(updatedLocalChar);

    const newMainChar: Character = {
      ...match,
      items: JSON.parse(JSON.stringify(cleaned.items || [])),
      armors: JSON.parse(JSON.stringify(cleaned.armors || [])),
      statusPoints: JSON.parse(JSON.stringify(cleaned.statusPoints)),
      attributes: {
        ...match.attributes,
        con: { ...match.attributes.con, bonusRacial: cleaned.attributes.con.bonusRacial, bonusRacialManual: cleaned.attributes.con.bonusRacialManual, bonusRacialExtra: cleaned.attributes.con.bonusRacialExtra, penalidade: cleaned.attributes.con.penalidade, penalidadeManual: cleaned.attributes.con.penalidadeManual, penalidadeExtra: cleaned.attributes.con.penalidadeExtra },
        for: { ...match.attributes.for, bonusRacial: cleaned.attributes.for.bonusRacial, bonusRacialManual: cleaned.attributes.for.bonusRacialManual, bonusRacialExtra: cleaned.attributes.for.bonusRacialExtra, penalidade: cleaned.attributes.for.penalidade, penalidadeManual: cleaned.attributes.for.penalidadeManual, penalidadeExtra: cleaned.attributes.for.penalidadeExtra },
        des: { ...match.attributes.des, bonusRacial: cleaned.attributes.des.bonusRacial, bonusRacialManual: cleaned.attributes.des.bonusRacialManual, bonusRacialExtra: cleaned.attributes.des.bonusRacialExtra, penalidade: cleaned.attributes.des.penalidade, penalidadeManual: cleaned.attributes.des.penalidadeManual, penalidadeExtra: cleaned.attributes.des.penalidadeExtra },
        agi: { ...match.attributes.agi, bonusRacial: cleaned.attributes.agi.bonusRacial, bonusRacialManual: cleaned.attributes.agi.bonusRacialManual, bonusRacialExtra: cleaned.attributes.agi.bonusRacialExtra, penalidade: cleaned.attributes.agi.penalidade, penalidadeManual: cleaned.attributes.agi.penalidadeManual, penalidadeExtra: cleaned.attributes.agi.penalidadeExtra },
        int: { ...match.attributes.int, bonusRacial: cleaned.attributes.int.bonusRacial, bonusRacialManual: cleaned.attributes.int.bonusRacialManual, bonusRacialExtra: cleaned.attributes.int.bonusRacialExtra, penalidade: cleaned.attributes.int.penalidade, penalidadeManual: cleaned.attributes.int.penalidadeManual, penalidadeExtra: cleaned.attributes.int.penalidadeExtra },
        per: { ...match.attributes.per, bonusRacial: cleaned.attributes.per.bonusRacial, bonusRacialManual: cleaned.attributes.per.bonusRacialManual, bonusRacialExtra: cleaned.attributes.per.bonusRacialExtra, penalidade: cleaned.attributes.per.penalidade, penalidadeManual: cleaned.attributes.per.penalidadeManual, penalidadeExtra: cleaned.attributes.per.penalidadeExtra },
        will: { ...match.attributes.will, bonusRacial: cleaned.attributes.will.bonusRacial, bonusRacialManual: cleaned.attributes.will.bonusRacialManual, bonusRacialExtra: cleaned.attributes.will.bonusRacialExtra, penalidade: cleaned.attributes.will.penalidade, penalidadeManual: cleaned.attributes.will.penalidadeManual, penalidadeExtra: cleaned.attributes.will.penalidadeExtra },
        car: { ...match.attributes.car, bonusRacial: cleaned.attributes.car.bonusRacial, bonusRacialManual: cleaned.attributes.car.bonusRacialManual, bonusRacialExtra: cleaned.attributes.car.bonusRacialExtra, penalidade: cleaned.attributes.car.penalidade, penalidadeManual: cleaned.attributes.car.penalidadeManual, penalidadeExtra: cleaned.attributes.car.penalidadeExtra },
      }
    };

    if (match.isPendingDMReview && match.pendingChanges) {
      newMainChar.pendingChanges = {
        ...match.pendingChanges,
        items: JSON.parse(JSON.stringify(cleaned.items || [])),
        armors: JSON.parse(JSON.stringify(cleaned.armors || [])),
        statusPoints: JSON.parse(JSON.stringify(cleaned.statusPoints)),
        attributes: {
          ...match.pendingChanges.attributes,
          con: { ...match.pendingChanges.attributes.con, bonusRacial: cleaned.attributes.con.bonusRacial, bonusRacialManual: cleaned.attributes.con.bonusRacialManual, bonusRacialExtra: cleaned.attributes.con.bonusRacialExtra, penalidade: cleaned.attributes.con.penalidade, penalidadeManual: cleaned.attributes.con.penalidadeManual, penalidadeExtra: cleaned.attributes.con.penalidadeExtra },
          for: { ...match.pendingChanges.attributes.for, bonusRacial: cleaned.attributes.for.bonusRacial, bonusRacialManual: cleaned.attributes.for.bonusRacialManual, bonusRacialExtra: cleaned.attributes.for.bonusRacialExtra, penalidade: cleaned.attributes.for.penalidade, penalidadeManual: cleaned.attributes.for.penalidadeManual, penalidadeExtra: cleaned.attributes.for.penalidadeExtra },
          des: { ...match.pendingChanges.attributes.des, bonusRacial: cleaned.attributes.des.bonusRacial, bonusRacialManual: cleaned.attributes.des.bonusRacialManual, bonusRacialExtra: cleaned.attributes.des.bonusRacialExtra, penalidade: cleaned.attributes.des.penalidade, penalidadeManual: cleaned.attributes.des.penalidadeManual, penalidadeExtra: cleaned.attributes.des.penalidadeExtra },
          agi: { ...match.pendingChanges.attributes.agi, bonusRacial: cleaned.attributes.agi.bonusRacial, bonusRacialManual: cleaned.attributes.agi.bonusRacialManual, bonusRacialExtra: cleaned.attributes.agi.bonusRacialExtra, penalidade: cleaned.attributes.agi.penalidade, penalidadeManual: cleaned.attributes.agi.penalidadeManual, penalidadeExtra: cleaned.attributes.agi.penalidadeExtra },
          int: { ...match.pendingChanges.attributes.int, bonusRacial: cleaned.attributes.int.bonusRacial, bonusRacialManual: cleaned.attributes.int.bonusRacialManual, bonusRacialExtra: cleaned.attributes.int.bonusRacialExtra, penalidade: cleaned.attributes.int.penalidade, penalidadeManual: cleaned.attributes.int.penalidadeManual, penalidadeExtra: cleaned.attributes.int.penalidadeExtra },
          per: { ...match.pendingChanges.attributes.per, bonusRacial: cleaned.attributes.per.bonusRacial, bonusRacialManual: cleaned.attributes.per.bonusRacialManual, bonusRacialExtra: cleaned.attributes.per.bonusRacialExtra, penalidade: cleaned.attributes.per.penalidade, penalidadeManual: cleaned.attributes.per.penalidadeManual, penalidadeExtra: cleaned.attributes.per.penalidadeExtra },
          will: { ...match.pendingChanges.attributes.will, bonusRacial: cleaned.attributes.will.bonusRacial, bonusRacialManual: cleaned.attributes.will.bonusRacialManual, bonusRacialExtra: cleaned.attributes.will.bonusRacialExtra, penalidade: cleaned.attributes.will.penalidade, penalidadeManual: cleaned.attributes.will.penalidadeManual, penalidadeExtra: cleaned.attributes.will.penalidadeExtra },
          car: { ...match.attributes.car, bonusRacial: cleaned.attributes.car.bonusRacial, bonusRacialManual: cleaned.attributes.car.bonusRacialManual, bonusRacialExtra: cleaned.attributes.car.bonusRacialExtra, penalidade: cleaned.attributes.car.penalidade, penalidadeManual: cleaned.attributes.car.penalidadeManual, penalidadeExtra: cleaned.attributes.car.penalidadeExtra },
        }
      };
    }

    onSilentUpdate(newMainChar);
  };

  // Detect and silently save changes to session fields to prevent data loss
  useEffect(() => {
    if (!characterId || !editedChar || !onSilentUpdate) return;

    const currentStr = getSessionFieldsString(editedChar);
    if (!currentStr) return;

    if (!lastSilentSavedRef.current) {
      // Initialize with parent's matching values to avoid triggering silent save on initial mount
      const match = characters.find(c => c.id === characterId);
      if (match) {
        const compSource = (match.isPendingDMReview && match.pendingChanges) ? match.pendingChanges : match;
        lastSilentSavedRef.current = getSessionFieldsString(compSource);
      } else {
        lastSilentSavedRef.current = currentStr;
      }
      return;
    }

    if (currentStr === lastSilentSavedRef.current) {
      return;
    }

    lastSilentSavedRef.current = currentStr;
    triggerSilentSave(editedChar);
  }, [editedChar, characters, characterId, onSilentUpdate]);

  const handleApproveWithAnim = () => {
    if (!onApprove) return;
    setFichaAnimStatus('approving');
    setTimeout(() => {
      onApprove(characterId || editedChar.id);
      setFichaAnimStatus('idle');
    }, 1200);
  };

  const handleRejectWithAnim = () => {
    if (!onReject) return;
    setFichaAnimStatus('rejecting');
    setTimeout(() => {
      onReject(characterId || editedChar.id);
      setFichaAnimStatus('idle');
    }, 1200);
  };

  const isFieldChanged = (fieldPath: string): boolean => {
    if (userRole !== 'dm' || !originalChar || !originalChar.isPendingDMReview) return false;

    const parts = fieldPath.split('.');
    let origVal: any = originalChar;
    let currVal: any = editedChar;

    for (const part of parts) {
      if (origVal && typeof origVal === 'object') {
        origVal = origVal[part];
      } else {
        origVal = undefined;
      }

      if (currVal && typeof currVal === 'object') {
        currVal = currVal[part];
      } else {
        currVal = undefined;
      }
    }

    const norm = (v: any) => {
      if (v === null || v === undefined) return '';
      if (typeof v === 'string') return v.trim().toLowerCase();
      return String(v).trim().toLowerCase();
    };

    return norm(origVal) !== norm(currVal);
  };

  const highlightClass = (fieldPath: string, baseClass = "") => {
    if (isFieldChanged(fieldPath)) {
      return `${baseClass} ring-2 ring-amber-500/80 bg-amber-500/15 border-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]`;
    }
    return baseClass;
  };

  const isSectionChanged = (sectionKey: 'itens' | 'pericias' | 'magias' | 'aprimoramentos' | 'montaria' | 'familiar'): boolean => {
    if (userRole !== 'dm' || !originalChar || !originalChar.isPendingDMReview) return false;
    
    let origVal: any;
    let currVal: any;
    
    if (sectionKey === 'magias') {
      origVal = originalChar.spells || [];
      currVal = editedChar.spells || [];
    } else if (sectionKey === 'itens') {
      origVal = originalChar.items || [];
      currVal = editedChar.items || [];
    } else if (sectionKey === 'pericias') {
      origVal = originalChar.skills || [];
      currVal = editedChar.skills || [];
    } else if (sectionKey === 'aprimoramentos') {
      return JSON.stringify(originalChar.aprimoramentosPositivos) !== JSON.stringify(editedChar.aprimoramentosPositivos) ||
             JSON.stringify(originalChar.aprimoramentosNegativos) !== JSON.stringify(editedChar.aprimoramentosNegativos);
    } else if (sectionKey === 'montaria') {
      origVal = originalChar.montariaEspecial;
      currVal = editedChar.montariaEspecial;
    } else if (sectionKey === 'familiar') {
      origVal = originalChar.familiar;
      currVal = editedChar.familiar;
    } else {
      origVal = originalChar[sectionKey];
      currVal = editedChar[sectionKey];
    }
    
    return JSON.stringify(origVal) !== JSON.stringify(currVal);
  };

  const highlightSectionClass = (sectionKey: 'itens' | 'pericias' | 'magias' | 'aprimoramentos' | 'montaria' | 'familiar', baseClass = "") => {
    if (isSectionChanged(sectionKey)) {
      return `${baseClass} ring-2 ring-amber-500/80 bg-amber-500/5 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]`;
    }
    return baseClass;
  };

  const highlightDirectClass = (isChanged: boolean, baseClass = "", isSection = false) => {
    if (isChanged) {
      if (isSection) {
        return `${baseClass} ring-2 ring-amber-500/80 bg-amber-500/5 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]`;
      }
      return `${baseClass} border-amber-500 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50`;
    }
    return baseClass;
  };

  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false);
  const [enhancementModalType, setEnhancementModalType] = useState<'POSITIVO' | 'NEGATIVO'>('POSITIVO');
  const [enhancementSearchQuery, setEnhancementSearchQuery] = useState('');
  const [selectedEnhancement, setSelectedEnhancement] = useState<AprimoramentoJSONEntry | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<AprimoramentoNivel | null>(null);
  const [shakeSave, setShakeSave] = useState(false);
  const [customPortrait, setCustomPortrait] = useState('');
  const [showPortraitSelector, setShowPortraitSelector] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Perícias Modal states
  const [isPericiasModalOpen, setIsPericiasModalOpen] = useState(false);
  const [periciaSearchQuery, setPericiaSearchQuery] = useState('');
  const { data: mockPericias = [] } = useQuery<any[]>({
    queryKey: ['system-rules', 'pericias'],
    queryFn: async () => {
      const res = await api.get('/rules/pericias');
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
  const DEFAULT_LEVELUP_RULES = {
    "niveis_personagem": {
      "1": { "exp_necessaria": 0, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 0, "pontos_magia": 0, "focus": 0 },
      "2": { "exp_necessaria": 5, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 1, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "3": { "exp_necessaria": 15, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "4": { "exp_necessaria": 30, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "5": { "exp_necessaria": 50, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 1, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "6": { "exp_necessaria": 80, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "7": { "exp_necessaria": 120, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "8": { "exp_necessaria": 180, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 1, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "9": { "exp_necessaria": 250, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "10": { "exp_necessaria": 400, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "11": { "exp_necessaria": 550, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 1, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "12": { "exp_necessaria": 800, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "13": { "exp_necessaria": 1100, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "14": { "exp_necessaria": 1600, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 1, "pericias": 35, "pontos_magia": 1, "focus": 1 },
      "15": { "exp_necessaria": 2200, "pv_bonus": 1, "atributos": 1, "aprimoramentos": 0, "pericias": 35, "pontos_magia": 1, "focus": 1 }
    }
  };

  const { data: levelUpRules = DEFAULT_LEVELUP_RULES } = useQuery({
    queryKey: ['system-rules', 'levelup'],
    queryFn: async () => {
      const response = await api.get('/rules/levelup');
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
    initialData: DEFAULT_LEVELUP_RULES,
  });
  const [showLevelUpConfirmModal, setShowLevelUpConfirmModal] = useState(false);
  const [showCreatePericiaForm, setShowCreatePericiaForm] = useState(false);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [newPericiaName, setNewPericiaName] = useState('');
  const [newPericiaAttr, setNewPericiaAttr] = useState('des');
  const [newPericiaDesc, setNewPericiaDesc] = useState('');
  const [tempSkills, setTempSkills] = useState<SkillRow[]>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<'adicionar' | 'minhas'>('adicionar');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<string>('all');
  const [expandedCatalogSkill, setExpandedCatalogSkill] = useState<string | null>(null);
  const [expandedMySkill, setExpandedMySkill] = useState<string | null>(null);

  // Helpers for Biblioteca Enhancement
  const getBibliotecaLevel = (aprimoramentos: string[]): number | null => {
    const found = (aprimoramentos || []).find(s =>
      s && (
        s.toLowerCase().includes("biblioteca") ||
        s.toLowerCase() === "biblioteca"
      )
    );
    if (!found) return null;
    const match = found.match(/(?:Nível|Nivel)\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return 1;
  };

  const getBibliotecaSubgroupLimit = (level: number | null): number => {
    if (level === 1) return 2;
    if (level === 2) return 6;
    if (level === 3) return 10;
    if (level === 4) return 14;
    return 0;
  };

  const isLibrarySkillName = (name: string): boolean => {
    const norm = (name || '').toLowerCase().trim();
    return norm === "ciências" || norm === "ciências proibidas" || norm === "conhecimentos";
  };

  const hasCorpoMaleavel = (aprimoramentos: string[]): boolean => {
    return (aprimoramentos || []).some(s =>
      s && (s.toLowerCase().includes("corpo maleável") || s.toLowerCase().includes("corpo maleavel"))
    );
  };

  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
  const [has_pending_magic_enchant, setHasPendingMagicEnchant] = useState(false);
  const [isComoJogarModalOpen, setIsComoJogarModalOpen] = useState(false);
  const [isRegrasCriacaoModalOpen, setIsRegrasCriacaoModalOpen] = useState(false);
  const [isDotsMenuOpen, setIsDotsMenuOpen] = useState(false);
  const [modalPortraitUrl, setModalPortraitUrl] = useState('');
  
  // Grimório Spellbook states and handlers
  const [isGrimorioModalOpen, setIsGrimorioModalOpen] = useState(false);
  const [isFocusAllocationExpanded, setIsFocusAllocationExpanded] = useState(false);
  const [editingSpell, setEditingSpell] = useState<Partial<Spell> | null>(null);
  const [isAddingSpell, setIsAddingSpell] = useState(false);
  const [spellToDelete, setSpellToDelete] = useState<Spell | null>(null);

  // Focus allocation state hooks
  const [isFocusSubmodalOpen, setIsFocusSubmodalOpen] = useState(false);
  const [tempFocusCriar, setTempFocusCriar] = useState(0);
  const [tempFocusControlar, setTempFocusControlar] = useState(0);
  const [tempFocusEntender, setTempFocusEntender] = useState(0);
  const [tempFocusCaminhoNome, setTempFocusCaminhoNome] = useState('Luz');
  const [tempFocusCaminhoValor, setTempFocusCaminhoValor] = useState(0);
  const [tempCaminhos, setTempCaminhos] = useState<{ nome: string; valor: number }[]>([]);

  // Armor/Shields state hooks
  const [isArmadurasCollapsed, setIsArmadurasCollapsed] = useState(true);
  const [isMinhasArmadurasCollapsed, setIsMinhasArmadurasCollapsed] = useState(false);
  const [armaduraSearchQuery, setArmaduraSearchQuery] = useState('');

  // Companions and Animal Companion state hooks
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [tempNomeAnimal, setTempNomeAnimal] = useState('');
  const [tempTipoAnimal, setTempTipoAnimal] = useState('');
  const [tempCompanionAttributes, setTempCompanionAttributes] = useState({
    con: 0,
    for: 0,
    des: 0,
    agi: 0,
    int: 0,
    per: 0,
    will: 0,
    car: 0,
  });
  const [tempCompanionSkills, setTempCompanionSkills] = useState<CompanionSkill[]>([]);
  const [newCompSkillName, setNewCompSkillName] = useState('');
  const [newCompSkillAttr, setNewCompSkillAttr] = useState('for');
  const [newCompSkillPoints, setNewCompSkillPoints] = useState(0);

  // Montaria Especial state hooks
  const [isMontariaModalOpen, setIsMontariaModalOpen] = useState(false);
  const [tempNomeMontaria, setTempNomeMontaria] = useState('');
  const [tempAnimalMontariaId, setTempAnimalMontariaId] = useState('');
  const { data: montariaRule } = useQuery<{ montarias_base: any[] }>({
    queryKey: ['system-rules', 'montaria'],
    queryFn: async () => {
      const res = await api.get('/rules/montaria');
      return res.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
  const montariasBase = useMemo(() => {
    return montariaRule?.montarias_base && Array.isArray(montariaRule.montarias_base)
      ? montariaRule.montarias_base
      : [];
  }, [montariaRule]);

  // Familiar state hooks
  const [isFamiliarModalOpen, setIsFamiliarModalOpen] = useState(false);
  const [tempNomeFamiliar, setTempNomeFamiliar] = useState('');
  const [tempAnimalFamiliarId, setTempAnimalFamiliarId] = useState('');
  const [tempAnimalFamiliarNome, setTempAnimalFamiliarNome] = useState('');
  const [tempFamiliarAtributos, setTempFamiliarAtributos] = useState({
    CON: 0,
    FR: 0,
    DEX: 0,
    AGI: 0,
    INT: 0,
    WILL: 0,
    PER: 0,
    CAR: 0,
    PV: 0,
    IP: 0
  });
  const [tempFamiliarPericias, setTempFamiliarPericias] = useState<{ pericia: string; chance_acerto: number; dano: string }[]>([]);
  const [tempFamiliarHabilidades, setTempFamiliarHabilidades] = useState<{ habilidade: string; efeito: string }[]>([]);
  const { data: familiaresRule } = useQuery<{ familiares: Record<string, any> }>({
    queryKey: ['system-rules', 'familiares'],
    queryFn: async () => {
      const res = await api.get('/rules/familiares');
      return res.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
  const familiaresBase = useMemo(() => {
    if (familiaresRule && familiaresRule.familiares) {
      return Object.entries(familiaresRule.familiares).map(([id, item]: [string, any]) => ({
        id,
        ...item
      }));
    }
    return [];
  }, [familiaresRule]);

  // Familiar custom editing inputs
  const [newFamPericia, setNewFamPericia] = useState('');
  const [newFamChance, setNewFamChance] = useState(0);
  const [newFamDano, setNewFamDano] = useState('');
  const [newFamHabilidade, setNewFamHabilidade] = useState('');
  const [newFamEfeito, setNewFamEfeito] = useState('');

  // Companion Diff Modals state hooks
  const [isCompanionDiffModalOpen, setIsCompanionDiffModalOpen] = useState(false);
  const [isMontariaDiffModalOpen, setIsMontariaDiffModalOpen] = useState(false);
  const [isFamiliarDiffModalOpen, setIsFamiliarDiffModalOpen] = useState(false);

  // Inventory Items state hooks
  const { data: itensCatalog = [] } = useQuery<any[]>({
    queryKey: ['system-rules', 'itens'],
    queryFn: async () => {
      const res = await api.get('/rules/itens');
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const armadurasCatalog = useMemo(() => {
    return itensCatalog
      .filter((item: any) => item.categoria === "armadura" || item.categoria === "escudo")
      .map((item: any) => {
        const precoStr = item.preco !== undefined ? String(item.preco) : "0";
        const parsedPreco = parseInt(precoStr.replace(/\./g, ''), 10) || 0;
        return {
          nome: item.item || item.nome || "",
          slot: item.equipamento?.slot || "",
          ip: item.equipamento?.ip !== undefined ? Number(item.equipamento.ip) : 0,
          penalidade_dex: item.equipamento?.penalidade_dex !== undefined ? Number(item.equipamento.penalidade_dex) : 0,
          penalidade_agi: item.equipamento?.penalidade_agi !== undefined ? Number(item.equipamento.penalidade_agi) : 0,
          obs: item.equipamento?.obs || item.obs || "",
          preco_pp: parsedPreco,
          categoria: item.categoria
        };
      });
  }, [itensCatalog]);

  const modificadoresCatalog = useMemo(() => {
    return itensCatalog
      .filter((item: any) => item.categoria && item.categoria.toLowerCase().includes("modificador"))
      .map((item: any) => {
        const precoStr = item.preco !== undefined ? String(item.preco) : "0";
        const parsedPreco = parseInt(precoStr.replace(/\./g, ''), 10) || 0;
        return {
          nome: item.item || item.nome || "",
          modificador_dex: item.equipamento?.modificador_dex !== undefined ? Number(item.equipamento.modificador_dex) : 0,
          modificador_agi: item.equipamento?.modificador_agi !== undefined ? Number(item.equipamento.modificador_agi) : 0,
          preco_adicional_pp: parsedPreco,
          preco_pp: parsedPreco,
          descricao: item.descricao || "",
          efeito_dano: item.equipamento?.efeito_dano || "",
          efeito_dano_adicional: item.equipamento?.efeito_dano_adicional || "",
          categoria: item.categoria
        };
      });
  }, [itensCatalog]);
  const [isItensModalOpen, setIsItensModalOpen] = useState(false);
  const [openedFromCard, setOpenedFromCard] = useState<'armas' | 'armaduras' | 'itens' | null>(null);
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [activeItemCategory, setActiveItemCategory] = useState('all');
  const [addedItemsFeedback, setAddedItemsFeedback] = useState<Record<string, boolean>>({});
  const [isMagicActiveInModal, setIsMagicActiveInModal] = useState(false);
  const [isMalditoActiveInModal, setIsMalditoActiveInModal] = useState(false);

  const triggerItemAddedFeedback = (itemName: string) => {
    setAddedItemsFeedback((prev) => ({ ...prev, [itemName]: true }));
    setTimeout(() => {
      setAddedItemsFeedback((prev) => ({ ...prev, [itemName]: false }));
    }, 1000);
  };

  const getAcertoCriticoLevel = (aprimoramentos: string[]): number | null => {
    const found = (aprimoramentos || []).find(s =>
      s && (s.toLowerCase().includes("acerto crítico aprimorado") || s.toLowerCase().includes("acerto critico aprimorado"))
    );
    if (!found) return null;
    const match = found.match(/(?:Nível|Nivel)\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return 1;
  };

  const getArmaAmuletoMagicoLevel = (aprimoramentos: string[]): number | null => {
    const found = (aprimoramentos || []).find(s =>
      s && (s.toLowerCase().includes("arma ou amuleto mágico") || s.toLowerCase().includes("arma ou amuleto magico"))
    );
    if (!found) return null;
    const match = found.match(/(?:Nível|Nivel)\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return 1;
  };

  const getArmaAmuletoMalditoLevel = (aprimoramentos: string[]): number | null => {
    const found = (aprimoramentos || []).find(s =>
      s && (s.toLowerCase().includes("arma ou amuleto maldito") || s.toLowerCase().includes("arma ou amuleto maldit"))
    );
    if (!found) return null;
    const match = found.match(/(?:Nível|Nivel)\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return 1;
  };

  const getPontosHeroicosLevel = (aprimoramentos: string[]): number | null => {
    const found = (aprimoramentos || []).find(s =>
      s && (s.toLowerCase().includes("pontos heróicos") || s.toLowerCase().includes("pontos heroicos"))
    );
    if (!found) return null;
    const match = found.match(/(?:Nível|Nivel)\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return 1;
  };

  const hasPotencializarMagia = (aprimoramentos: string[]): boolean => {
    return (aprimoramentos || []).some(s =>
      s && (s.toLowerCase().includes("potencializar magia") || s.toLowerCase().includes("potencializar_magia"))
    );
  };

  const parseDurationString = (dur: string): { hh: number; mm: number; ss: number } => {
    const parts = (dur || '').split(':');
    if (parts.length === 3) {
      const hh = parseInt(parts[0], 10) || 0;
      const mm = parseInt(parts[1], 10) || 0;
      const ss = parseInt(parts[2], 10) || 0;
      return { hh, mm, ss };
    }
    return { hh: 0, mm: 0, ss: 0 };
  };

  const formatDuration = (hh: number, mm: number, ss: number): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  };

  const hasArmaPreferencialEnhancement = (aprimoramentos: string[]): boolean => {
    return (aprimoramentos || []).some(s =>
      s && (s.toLowerCase().includes("arma preferencial") || s.toLowerCase() === "arma_preferencial")
    );
  };

  const hasAcuideArmaEnhancement = (aprimoramentos: string[]): boolean => {
    return (aprimoramentos || []).some(s =>
      s && (
        s.toLowerCase().includes("acuide com arma") ||
        s.toLowerCase().includes("acuidade com arma") ||
        s.toLowerCase() === "acuide_arma" ||
        s.toLowerCase() === "acuidade_arma"
      )
    );
  };

  const getArmaduraHeroisLevel = (aprimoramentos: string[]): number | null => {
    const found = (aprimoramentos || []).find(s =>
      s && (
        s.toLowerCase().includes("armadura de heróis") ||
        s.toLowerCase().includes("armadura de herois") ||
        s.toLowerCase() === "armadura_herois"
      )
    );
    if (!found) return null;
    const match = found.match(/(?:Nível|Nivel)\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return 1;
  };

  const handleToggleArmaAmuletoMagicoOnItem = (itemIdx: number, level: number) => {
    setEditedChar(prev => {
      const updatedItems = prev.items ? [...prev.items] : [];
      const currentItem = updatedItems[itemIdx];
      if (typeof currentItem !== 'object' || !currentItem) return prev;
      
      const isCurrentlySelected = !!currentItem.hasArmaAmuletoMagico;
      
      const newItems = updatedItems.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          if (i === itemIdx) {
            return {
              ...item,
              hasArmaAmuletoMagico: !isCurrentlySelected,
              armaAmuletoMagicoLevel: !isCurrentlySelected ? level : undefined
            };
          } else {
            return {
              ...item,
              hasArmaAmuletoMagico: false,
              armaAmuletoMagicoLevel: undefined
            };
          }
        }
        return item;
      });
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleToggleArmaAmuletoMalditoOnItem = (itemIdx: number, level: number) => {
    setEditedChar(prev => {
      const updatedItems = prev.items ? [...prev.items] : [];
      const currentItem = updatedItems[itemIdx];
      if (typeof currentItem !== 'object' || !currentItem) return prev;
      
      const isCurrentlySelected = !!currentItem.hasArmaAmuletoMaldito;
      
      const newItems = updatedItems.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          if (i === itemIdx) {
            return {
              ...item,
              hasArmaAmuletoMaldito: !isCurrentlySelected,
              armaAmuletoMalditoLevel: !isCurrentlySelected ? level : undefined
            };
          } else {
            return {
              ...item,
              hasArmaAmuletoMaldito: false,
              armaAmuletoMalditoLevel: undefined
            };
          }
        }
        return item;
      });
      
      const hasAnySelected = newItems.some((i: any) => typeof i === 'object' && i !== null && i.hasArmaAmuletoMaldito);
      
      return {
        ...prev,
        items: newItems,
        has_pending_magic_enchant: !hasAnySelected
      };
    });
    setHasPendingMagicEnchant(prev => !prev);
  };

  const handleToggleArmaPreferencialOnWeapon = (itemIdx: number) => {
    const currentItem = editedChar.items ? editedChar.items[itemIdx] : null;
    if (typeof currentItem !== 'object' || !currentItem) return;

    if (currentItem.isCustom) {
      toast.error('Itens customizados não podem ser definidos como Arma Preferencial.');
      return;
    }

    const isCurrentlySelected = !!currentItem.hasArmaPreferencial;

    if (!isCurrentlySelected) {
      // Validate skill group and subgroup condizente
      const classification = {
        tipo: currentItem.tipo || getWeaponClassification(currentItem.item).tipo,
        subgrupo_arma: currentItem.subgrupo_arma || getWeaponClassification(currentItem.item).subgrupo_arma
      };

      const hasMatchingSkill = (editedChar.skills || []).some((s: any) => {
        const skillLower = (s.group || '').toLowerCase();
        const isMeleeSkill = skillLower.includes("armas brancas") && !skillLower.includes("longo alcance");
        const isRangeSkill = skillLower.includes("projetil") || skillLower.includes("projétil") || skillLower.includes("longo alcance");
        
        const matchesGroup = isMeleeSkill ? (classification.tipo === "corpo_a_corpo") : (classification.tipo === "longo_alcance");
        const matchesSubgroup = s.chosenSubgroup && classification.subgrupo_arma &&
          s.chosenSubgroup.toLowerCase().trim() === classification.subgrupo_arma.toLowerCase().trim();
          
        return matchesGroup && matchesSubgroup;
      });

      if (!hasMatchingSkill) {
        toast.error(`Você precisa ter a Perícia de Combate e o Subgrupo condizente com esta arma (${classification.subgrupo_arma}) para ativá-la como Arma Preferencial!`);
        return;
      }
    }

    setEditedChar(prev => {
      const updatedItems = prev.items ? [...prev.items] : [];
      const currentItemToUpdate = updatedItems[itemIdx];
      if (typeof currentItemToUpdate !== 'object' || !currentItemToUpdate) return prev;
      
      const isCurrentlySelectedVal = !!currentItemToUpdate.hasArmaPreferencial;
      
      const newItems = updatedItems.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          if (i === itemIdx) {
            return {
              ...item,
              hasArmaPreferencial: !isCurrentlySelectedVal
            };
          } else {
            return {
              ...item,
              hasArmaPreferencial: false
            };
          }
        }
        return item;
      });
      
      const newVinculo = !isCurrentlySelectedVal ? {
        id: "arma_preferencial" as const,
        arma_vinculada_id: currentItemToUpdate.id || ""
      } : undefined;
      
      return {
        ...prev,
        items: newItems,
        armaPreferencialVinculo: newVinculo
      };
    });
  };

  const handleToggleAcertoCriticoOnWeapon = (weaponIdx: number, level: number) => {
    setEditedChar(prev => {
      const updatedItems = prev.items ? [...prev.items] : [];
      const currentWeapon = updatedItems[weaponIdx];
      if (typeof currentWeapon !== 'object' || !currentWeapon) return prev;
      
      const isCurrentlySelected = !!currentWeapon.hasAcertoCritico;
      
      const newItems = updatedItems.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          if (i === weaponIdx) {
            return {
              ...item,
              hasAcertoCritico: !isCurrentlySelected,
              acertoCriticoLevel: !isCurrentlySelected ? level : undefined
            };
          } else {
            return {
              ...item,
              hasAcertoCritico: false,
              acertoCriticoLevel: undefined
            };
          }
        }
        return item;
      });
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleToggleAcuideArmaOnWeapon = (weaponIdx: number) => {
    setEditedChar(prev => {
      const updatedItems = prev.items ? [...prev.items] : [];
      const currentWeapon = updatedItems[weaponIdx];
      if (typeof currentWeapon !== 'object' || !currentWeapon) return prev;
      
      const isCurrentlySelected = !!currentWeapon.hasAcuideArma;
      
      const newItems = updatedItems.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          if (i === weaponIdx) {
            return {
              ...item,
              hasAcuideArma: !isCurrentlySelected
            };
          } else {
            return {
              ...item,
              hasAcuideArma: false
            };
          }
        }
        return item;
      });
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  // Custom Item Form states
  const [newCustomItemName, setNewCustomItemName] = useState('');
  const [newCustomItemPrice, setNewCustomItemPrice] = useState('');
  const [newCustomItemDesc, setNewCustomItemDesc] = useState('');
  const [newCustomItemCategory, setNewCustomItemCategory] = useState('objetos_comuns');

  const openFocusAllocation = () => {
    const alloc = editedChar.focusAllocation || { criar: 0, controlar: 0, entender: 0, caminhoNome: 'Luz', caminhoValor: 0 };
    setTempFocusCriar(Number(alloc.criar) || 0);
    setTempFocusControlar(Number(alloc.controlar) || 0);
    setTempFocusEntender(Number(alloc.entender) || 0);
    setTempFocusCaminhoNome(alloc.caminhoNome || 'Luz');
    setTempFocusCaminhoValor(Number(alloc.caminhoValor) || 0);
    
    let initialCaminhos = alloc.caminhos || [];
    if (initialCaminhos.length === 0) {
      initialCaminhos = [{ nome: alloc.caminhoNome || 'Luz', valor: Number(alloc.caminhoValor) || 0 }];
    }
    setTempCaminhos(initialCaminhos.map(c => ({ ...c })));
    setIsFocusSubmodalOpen(true);
  };

  const handleSaveFocusAllocation = () => {
    const primaryCaminho = tempCaminhos[0] || { nome: 'Luz', valor: 0 };
    setEditedChar(prev => ({
      ...prev,
      focusAllocation: {
        criar: tempFocusCriar,
        controlar: tempFocusControlar,
        entender: tempFocusEntender,
        caminhoNome: primaryCaminho.nome,
        caminhoValor: primaryCaminho.valor,
        caminhos: tempCaminhos.map(c => ({ ...c }))
      }
    }));
    toast.success('Focos alocados com sucesso!');
  };

  const getPathAffinityBadge = (pathName: string): { label: string; bgClass: string; textClass: string; borderClass: string } | null => {
    const classLower = (editedChar.classKit || '').toLowerCase().trim();
    const alignment = editedChar.alinhamento || 'Neutro';

    if (classLower === 'mago') {
      if (pathName === 'Arcano') {
        return { label: 'Canônico / Recomendado', bgClass: 'bg-purple-950/40', textClass: 'text-purple-400', borderClass: 'border-purple-800' };
      }
    } else if (classLower === 'paladino') {
      if (['Luz', 'Água'].includes(pathName)) {
        return { label: 'Canônico / Alinhado', bgClass: 'bg-amber-950/40', textClass: 'text-secondary', borderClass: 'border-amber-800' };
      }
    } else if (classLower === 'druida') {
      if (['Terra', 'Água', 'Ar', 'Animais', 'Plantas'].includes(pathName)) {
        return { label: 'Canônico / Alinhado', bgClass: 'bg-emerald-950/40', textClass: 'text-emerald-400', borderClass: 'border-emerald-800' };
      }
    } else if (classLower === 'clérigo' || classLower === 'clerigo') {
      if (alignment === 'Bondoso') {
        if (pathName === 'Luz') {
          return { label: 'Canônico / Alinhado', bgClass: 'bg-emerald-950/40', textClass: 'text-emerald-400', borderClass: 'border-emerald-800' };
        }
        if (pathName === 'Trevas') {
          return { label: 'Oposto / Desaconselhado', bgClass: 'bg-rose-950/40', textClass: 'text-rose-400', borderClass: 'border-rose-800' };
        }
      } else if (alignment === 'Maligno') {
        if (pathName === 'Trevas') {
          return { label: 'Canônico / Alinhado', bgClass: 'bg-emerald-950/40', textClass: 'text-emerald-400', borderClass: 'border-emerald-800' };
        }
        if (pathName === 'Luz') {
          return { label: 'Oposto / Desaconselhado', bgClass: 'bg-rose-950/40', textClass: 'text-rose-400', borderClass: 'border-rose-800' };
        }
      } else if (alignment === 'Neutro') {
        if (['Caos', 'Arcano'].includes(pathName)) {
          return { label: 'Canônico / Alinhado', bgClass: 'bg-blue-950/40', textClass: 'text-blue-400', borderClass: 'border-blue-800' };
        }
      }
    }
    return null;
  };

  const parseFocusString = (focusStr: string) => {
    const result: { criar: number; controlar: number; entender: number; caminhos: { [key: string]: number } } = {
      criar: 0,
      controlar: 0,
      entender: 0,
      caminhos: {}
    };
    
    if (!focusStr) return result;
    
    const cleaned = focusStr.toLowerCase();
    
    const criarMatch = cleaned.match(/criar\s*(\d+)/);
    if (criarMatch) result.criar = parseInt(criarMatch[1], 10);
    
    const controlarMatch = cleaned.match(/controlar\s*(\d+)/);
    if (controlarMatch) result.controlar = parseInt(controlarMatch[1], 10);
    
    const entenderMatch = cleaned.match(/entender\s*(\d+)/);
    if (entenderMatch) result.entender = parseInt(entenderMatch[1], 10);
    
    const paths = ['luz', 'trevas', 'água', 'fogo', 'terra', 'ar', 'humanos', 'animais', 'plantas', 'metais', 'arcano', 'caos'];
    paths.forEach(p => {
      const regex = new RegExp(`${p}\\s*(\\d+)`);
      const match = cleaned.match(regex);
      if (match) {
        const capName = p.charAt(0).toUpperCase() + p.slice(1);
        result.caminhos[capName] = parseInt(match[1], 10);
      }
    });
    
    return result;
  };

  const handleSaveSpell = () => {
    if (!editingSpell || !editingSpell.name || !editingSpell.name.trim()) {
      toast.error('O feitiço precisa de um nome.');
      return;
    }

    // Build the dynamic focus string
    const parts: string[] = [];
    if ((editingSpell.criar || 0) > 0) parts.push(`Criar ${editingSpell.criar}`);
    if ((editingSpell.controlar || 0) > 0) parts.push(`Controlar ${editingSpell.controlar}`);
    if ((editingSpell.entender || 0) > 0) parts.push(`Entender ${editingSpell.entender}`);
    if (editingSpell.caminhosValores) {
      Object.entries(editingSpell.caminhosValores).forEach(([nome, valor]) => {
        if ((Number(valor) || 0) > 0) {
          parts.push(`${nome} ${valor}`);
        }
      });
    }
    const calculatedFocusStr = parts.join(', ') || 'Nenhum';

    const isPotVal = hasPotencializarMagia(editedChar.aprimoramentosPositivos);

    // Cost amplification
    const baseCostStr = editingSpell.cost || '';
    let finalCostStr = baseCostStr;
    if (isPotVal) {
      const parsedCost = Number(baseCostStr) || 0;
      if (parsedCost > 0) {
        finalCostStr = String(Math.ceil(parsedCost * 1.5));
      }
    }

    // Range amplification
    const baseRangeStr = editingSpell.range || '';
    let finalRangeStr = baseRangeStr;
    if (isPotVal) {
      const parsedRange = Number(baseRangeStr) || 0;
      if (parsedRange > 0) {
        finalRangeStr = String(Math.ceil(parsedRange * 1.5));
      }
    }

    // Duration amplification
    const baseHH = Number(editingSpell.durationHH) || 0;
    const baseMM = Number(editingSpell.durationMM) || 0;
    const baseSS = Number(editingSpell.durationSS) || 0;

    let finalHH = baseHH;
    let finalMM = baseMM;
    let finalSS = baseSS;

    if (isPotVal) {
      const totalSeconds = (baseHH * 3600) + (baseMM * 60) + baseSS;
      if (totalSeconds > 0) {
        const finalTotalSeconds = Math.ceil(totalSeconds * 1.5);
        finalHH = Math.floor(finalTotalSeconds / 3600);
        const rem = finalTotalSeconds % 3600;
        finalMM = Math.floor(rem / 60);
        finalSS = rem % 60;
      }
    }

    const finalDurationStr = formatDuration(finalHH, finalMM, finalSS);

    setEditedChar(prev => {
      const spellsList = prev.spells ? [...prev.spells] : [];
      if (editingSpell.id) {
        const index = spellsList.findIndex(s => s.id === editingSpell.id);
        if (index !== -1) {
          spellsList[index] = {
            id: editingSpell.id,
            name: editingSpell.name || '',
            focus: calculatedFocusStr,
            cost: finalCostStr,
            baseCost: baseCostStr,
            range: finalRangeStr,
            baseRange: baseRangeStr,
            duration: finalDurationStr,
            durationHH: finalHH,
            durationMM: finalMM,
            durationSS: finalSS,
            baseDurationHH: baseHH,
            baseDurationMM: baseMM,
            baseDurationSS: baseSS,
            description: editingSpell.description || '',
            criar: editingSpell.criar || 0,
            controlar: editingSpell.controlar || 0,
            entender: editingSpell.entender || 0,
            caminhosValores: editingSpell.caminhosValores || {}
          };
        }
      } else {
        const newSpell: Spell = {
          id: `spell-${Date.now()}`,
          name: editingSpell.name || '',
          focus: calculatedFocusStr,
          cost: finalCostStr,
          baseCost: baseCostStr,
          range: finalRangeStr,
          baseRange: baseRangeStr,
          duration: finalDurationStr,
          durationHH: finalHH,
          durationMM: finalMM,
          durationSS: finalSS,
          baseDurationHH: baseHH,
          baseDurationMM: baseMM,
          baseDurationSS: baseSS,
          description: editingSpell.description || '',
          criar: editingSpell.criar || 0,
          controlar: editingSpell.controlar || 0,
          entender: editingSpell.entender || 0,
          caminhosValores: editingSpell.caminhosValores || {}
        };
        spellsList.push(newSpell);
      }
      return {
        ...prev,
        spells: spellsList
      };
    });

    setEditingSpell(null);
    setIsAddingSpell(false);
    
    toast.success('Feitiço escrito com sucesso.');
  };

  const handleStartEditSpell = (spell?: Spell) => {
    if (!spell) {
      // Adding new spell
      setIsAddingSpell(true);
      setEditingSpell({
        id: '',
        name: '',
        focus: '',
        cost: '',
        range: '',
        duration: '',
        durationHH: 0,
        durationMM: 0,
        durationSS: 0,
        description: '',
        criar: 0,
        controlar: 0,
        entender: 0,
        caminhosValores: {}
      });
    } else {
      // Editing existing spell
      setIsAddingSpell(false);
      let initialFields = {
        criar: spell.criar,
        controlar: spell.controlar,
        entender: spell.entender,
        caminhosValores: spell.caminhosValores
      };
      
      if (initialFields.criar === undefined && initialFields.controlar === undefined && initialFields.entender === undefined) {
        // Legacy spell, parse focus string
        const parsed = parseFocusString(spell.focus || '');
        initialFields = {
          criar: parsed.criar,
          controlar: parsed.controlar,
          entender: parsed.entender,
          caminhosValores: parsed.caminhos
        };
      }

      const editCost = spell.baseCost !== undefined ? spell.baseCost : spell.cost;
      const editRange = spell.baseRange !== undefined ? spell.baseRange : spell.range;
      
      let editHH = spell.baseDurationHH !== undefined ? spell.baseDurationHH : (spell.durationHH || 0);
      let editMM = spell.baseDurationMM !== undefined ? spell.baseDurationMM : (spell.durationMM || 0);
      let editSS = spell.baseDurationSS !== undefined ? spell.baseDurationSS : (spell.durationSS || 0);

      // If base fields are missing but duration is set, parse it
      if (spell.baseDurationHH === undefined && spell.baseDurationMM === undefined && spell.baseDurationSS === undefined && spell.duration) {
        const parsed = parseDurationString(spell.duration);
        editHH = parsed.hh;
        editMM = parsed.mm;
        editSS = parsed.ss;
      }
      
      setEditingSpell({
        ...spell,
        cost: editCost,
        range: editRange,
        durationHH: editHH,
        durationMM: editMM,
        durationSS: editSS,
        criar: initialFields.criar || 0,
        controlar: initialFields.controlar || 0,
        entender: initialFields.entender || 0,
        caminhosValores: initialFields.caminhosValores || {}
      });
    }
  };

  const handleDeleteSpell = (spellId: string) => {
    const spell = editedChar.spells?.find(s => s.id === spellId);
    if (spell) {
      setSpellToDelete(spell);
    }
  };

  const handleConfirmDeleteSpell = () => {
    if (!spellToDelete) return;
    setEditedChar(prev => {
      const spellsList = prev.spells ? prev.spells.filter(s => s.id !== spellToDelete.id) : [];
      return {
        ...prev,
        spells: spellsList
      };
    });
    setSpellToDelete(null);
    toast.success('Feitiço apagado do grimório.');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bgContentRef = useRef<HTMLDivElement>(null);

  const [portraitError, setPortraitError] = useState(false);
  const { data: regrasNovoPersonagemRule } = useQuery<{ markdown: string }>({
    queryKey: ['system-rules', 'regras_novo_personagem'],
    queryFn: async () => {
      const res = await api.get('/rules/regras_novo_personagem');
      return res.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
  const regrasMarkdown = regrasNovoPersonagemRule?.markdown || '# Guia de Criação de Personagem\nCarregando regras oficiais...';

  const { data: regrasJogoRule = [] } = useQuery<any[]>({
    queryKey: ['system-rules', 'regras_jogo'],
    queryFn: async () => {
      const res = await api.get('/rules/regras_jogo');
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const comoJogarIntro = useMemo(() => {
    if (Array.isArray(regrasJogoRule)) {
      const introObj = regrasJogoRule.find((item: any) => 'introdução_title' in item);
      if (introObj) {
        return {
          title: introObj.introdução_title,
          subtitle: introObj.introdução_subtitle,
        };
      }
    }
    return null;
  }, [regrasJogoRule]);

  const comoJogarItems = useMemo(() => {
    if (Array.isArray(regrasJogoRule)) {
      const items: { id: number; title: string; content: string }[] = [];
      for (let i = 1; i <= 6; i++) {
        const itemObj = regrasJogoRule.find((item: any) => `title${i}` in item);
        if (itemObj) {
          items.push({
            id: i,
            title: itemObj[`title${i}`],
            content: itemObj[`content${i}`],
          });
        }
      }
      return items;
    }
    return [];
  }, [regrasJogoRule]);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [focusedField, setFocusedField] = useState<{ attrKey: keyof CharacterAttributes, field: 'penalidade' | 'bonusRacial' } | null>(null);

  useEffect(() => {
    setPortraitError(false);
  }, [editedChar.portraitUrl]);



  const handleOpenCompanionAnimalModal = () => {
    const comp = editedChar.companionAnimal || {
      nomeAnimal: '',
      tipoAnimal: '',
      attributes: { con: 0, for: 0, des: 0, agi: 0, int: 0, per: 0, will: 0, car: 0 },
      skills: []
    };
    
    setTempNomeAnimal(comp.nomeAnimal || '');
    setTempTipoAnimal(comp.tipoAnimal || '');
    setTempCompanionAttributes({ ...comp.attributes });
    setTempCompanionSkills(comp.skills ? comp.skills.map(s => ({ ...s })) : []);
    
    setNewCompSkillName('');
    setNewCompSkillAttr('for');
    setNewCompSkillPoints(0);
    
    setIsCompanionModalOpen(true);
  };

  const handleSaveCompanionAnimal = () => {
    const companionL = Number(editedChar.level) || 1;
    const maxCompanionAttrs = 80 + (companionL - 1) * 5;
    const maxCompanionSkills = 50 + (companionL - 1) * 20;

    const totalPoints = Object.values(tempCompanionAttributes).reduce((a, b) => a + b, 0);
    if (totalPoints > maxCompanionAttrs) {
      toast.error(`Você distribuiu ${totalPoints} pontos de atributos. O limite máximo é de ${maxCompanionAttrs} pontos para o nível ${companionL}!`);
      return;
    }
    
    if (tempCompanionAttributes.int > 2) {
      toast.error("A Inteligência de um Companheiro Animal não pode ser superior a 2!");
      return;
    }

    const totalSkillPoints = tempCompanionSkills.reduce((sum, s) => sum + (Number(s.pontosGastos) || 0), 0);
    if (totalSkillPoints > maxCompanionSkills) {
      toast.error(`Você distribuiu ${totalSkillPoints} pontos de perícia. O limite máximo é de ${maxCompanionSkills} pontos para o nível ${companionL}!`);
      return;
    }
    
    setEditedChar(prev => ({
      ...prev,
      companionAnimal: {
        nomeAnimal: tempNomeAnimal.trim(),
        tipoAnimal: tempTipoAnimal.trim(),
        attributes: tempCompanionAttributes,
        skills: tempCompanionSkills
      }
    }));
    
    setIsCompanionModalOpen(false);
    toast.success("Ficha do Companheiro Animal salva com sucesso!");
  };

  const handleOpenMontariaModal = () => {
    const mont = editedChar.montariaEspecial || {
      nome: '',
      animalId: ''
    };
    
    setTempNomeMontaria(mont.nome || '');
    setTempAnimalMontariaId(mont.animalId || '');
    setIsMontariaModalOpen(true);
  };

  const handleSaveMontaria = () => {
    setEditedChar(prev => ({
      ...prev,
      montariaEspecial: {
        nome: tempNomeMontaria.trim(),
        animalId: tempAnimalMontariaId
      }
    }));
    setIsMontariaModalOpen(false);
    toast.success("Ficha da Montaria Especial salva com sucesso!");
  };

  const handleOpenFamiliarModal = () => {
    const fam = editedChar.familiar || {
      nome: '',
      animalId: '',
      animalNome: '',
      atributos: { CON: 0, FR: 0, DEX: 0, AGI: 0, INT: 0, WILL: 0, PER: 0, CAR: 0, PV: 0, IP: 0 },
      pericias: [],
      habilidades: []
    };
    
    setTempNomeFamiliar(fam.nome || '');
    setTempAnimalFamiliarId(fam.animalId || '');
    setTempAnimalFamiliarNome(fam.animalNome || '');
    setTempFamiliarAtributos(fam.atributos ? { ...fam.atributos } : {
      CON: 0, FR: 0, DEX: 0, AGI: 0, INT: 0, WILL: 0, PER: 0, CAR: 0, PV: 0, IP: 0
    });
    setTempFamiliarPericias(fam.pericias ? fam.pericias.map((p: any) => ({ ...p })) : []);
    
    const charL = Number(editedChar.level) || 1;
    const progressionAbilities = getFamiliarAbilitiesForLevel(charL);
    
    let loadedHabs = [...progressionAbilities];
    if (fam.habilidades) {
      fam.habilidades.forEach((h: any) => {
        const normName = habilitadeNameNormalize(h.habilidade);
        if (!loadedHabs.some(lh => habilitadeNameNormalize(lh.habilidade) === normName)) {
          loadedHabs.push({ ...h });
        }
      });
    }
    setTempFamiliarHabilidades(loadedHabs);
    
    setNewFamPericia('');
    setNewFamChance(0);
    setNewFamDano('');
    setNewFamHabilidade('');
    setNewFamEfeito('');
    
    setIsFamiliarModalOpen(true);
  };

  const handleSaveFamiliar = () => {
    if (tempAnimalFamiliarId === 'customizado') {
      const totalAttrPoints = (tempFamiliarAtributos.CON || 0) +
        (tempFamiliarAtributos.FR || 0) +
        (tempFamiliarAtributos.DEX || 0) +
        (tempFamiliarAtributos.AGI || 0) +
        (tempFamiliarAtributos.INT || 0) +
        (tempFamiliarAtributos.WILL || 0) +
        (tempFamiliarAtributos.PER || 0) +
        (tempFamiliarAtributos.CAR || 0);

      if (totalAttrPoints > 42) {
        toast.error(`Você distribuiu ${totalAttrPoints} pontos de atributos. O limite máximo para o familiar customizado é de 42 pontos!`);
        return;
      }

      const totalSkillPoints = tempFamiliarPericias.reduce((sum, p) => sum + (p.chance_acerto || 0), 0);
      if (totalSkillPoints > 25) {
        toast.error(`Você distribuiu ${totalSkillPoints} pontos de perícia. O limite máximo para o familiar customizado é de 25 pontos!`);
        return;
      }

      const customAbilities = tempFamiliarHabilidades.filter(h => !isBaseFamiliarAbility(h.habilidade));
      if (customAbilities.length > 1) {
        toast.error(`Você adicionou ${customAbilities.length} habilidades especiais customizadas. O limite máximo para o familiar customizado é de 1 habilidade customizada!`);
        return;
      }
    }

    const foundBase = familiaresBase.find(f => f.id === tempAnimalFamiliarId);
    setEditedChar(prev => ({
      ...prev,
      familiar: {
        nome: tempNomeFamiliar.trim(),
        animalId: tempAnimalFamiliarId,
        animalNome: tempAnimalFamiliarId === 'customizado' ? tempAnimalFamiliarNome.trim() : (foundBase?.animal || ''),
        atributos: {
          ...tempFamiliarAtributos,
          PV: tempAnimalFamiliarId === 'customizado' 
            ? Math.ceil(((tempFamiliarAtributos.CON || 0) + (tempFamiliarAtributos.FR || 0)) / 2)
            : tempFamiliarAtributos.PV
        },
        pericias: tempFamiliarPericias,
        habilidades: tempFamiliarHabilidades,
        bonus_arcano: tempAnimalFamiliarId === 'customizado' ? undefined : foundBase?.bonus_arcano
      }
    }));
    setIsFamiliarModalOpen(false);
    toast.success("Ficha do Familiar salva com sucesso!");
  };

  const handleUpdateCompanionSkill = (id: string, field: keyof CompanionSkill, value: any) => {
    setTempCompanionSkills(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleAddCompanionSkill = () => {
    const newSkill: CompanionSkill = {
      id: "comp_skill_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
      nome: '',
      atributo: 'for',
      pontosGastos: 0
    };
    
    setTempCompanionSkills(prev => [...prev, newSkill]);
  };

  const hasAcertoCriticoOnMount = useRef<boolean | null>(null);

  useEffect(() => {
    const currentHas = (editedChar.aprimoramentosPositivos || []).some(s =>
      s && (s.toLowerCase().includes("acerto crítico aprimorado") || s.toLowerCase().includes("acerto critico aprimorado"))
    );
    if (hasAcertoCriticoOnMount.current === null) {
      hasAcertoCriticoOnMount.current = currentHas;
      return;
    }
    if (currentHas && !hasAcertoCriticoOnMount.current) {
      toast.success("Acerto Crítico Aprimorado - Identifique no inventário qual arma receberá o aprimoramento!");
    }
    hasAcertoCriticoOnMount.current = currentHas;
  }, [editedChar.aprimoramentosPositivos]);

  useEffect(() => {
    const level = getAcertoCriticoLevel(editedChar.aprimoramentosPositivos);
    if (level === null) {
      const hasAny = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && i.hasAcertoCritico);
      if (hasAny) {
        setEditedChar(prev => {
          const clearedItems = (prev.items || []).map((item) => {
            if (typeof item === 'object' && item !== null && item.hasAcertoCritico) {
              return { ...item, hasAcertoCritico: false, acertoCriticoLevel: undefined };
            }
            return item;
          });
          return { ...prev, items: clearedItems };
        });
      }
    } else {
      const activeWeaponIdx = (editedChar.items || []).findIndex((i: any) => typeof i === 'object' && i !== null && i.hasAcertoCritico);
      if (activeWeaponIdx !== -1) {
        const activeWeapon = editedChar.items[activeWeaponIdx];
        if (activeWeapon.acertoCriticoLevel !== level) {
          setEditedChar(prev => {
            const updatedItems = (prev.items || []).map((item, i) => {
              if (i === activeWeaponIdx && typeof item === 'object' && item !== null) {
                return { ...item, acertoCriticoLevel: level };
              }
              return item;
            });
            return { ...prev, items: updatedItems };
          });
        }
      }
    }
  }, [editedChar.aprimoramentosPositivos]);

  const hasArmaAmuletoMagicoOnMount = useRef<boolean | null>(null);

  useEffect(() => {
    const currentHas = (editedChar.aprimoramentosPositivos || []).some(s =>
      s && (s.toLowerCase().includes("arma ou amuleto mágico") || s.toLowerCase().includes("arma ou amuleto magico"))
    );
    if (hasArmaAmuletoMagicoOnMount.current === null) {
      hasArmaAmuletoMagicoOnMount.current = currentHas;
      return;
    }
    if (currentHas && !hasArmaAmuletoMagicoOnMount.current) {
      toast.success("Arma ou Amuleto Mágico - Identifique no inventário qual arma ou item customizado receberá o aprimoramento!");
    }
    hasArmaAmuletoMagicoOnMount.current = currentHas;
  }, [editedChar.aprimoramentosPositivos]);

  useEffect(() => {
    const level = getArmaAmuletoMagicoLevel(editedChar.aprimoramentosPositivos);
    if (level === null) {
      const hasAny = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && i.hasArmaAmuletoMagico);
      if (hasAny) {
        setEditedChar(prev => {
          const clearedItems = (prev.items || []).map((item) => {
            if (typeof item === 'object' && item !== null && item.hasArmaAmuletoMagico) {
              return { ...item, hasArmaAmuletoMagico: false, armaAmuletoMagicoLevel: undefined };
            }
            return item;
          });
          return { ...prev, items: clearedItems };
        });
      }
    } else {
      const activeIdx = (editedChar.items || []).findIndex((i: any) => typeof i === 'object' && i !== null && i.hasArmaAmuletoMagico);
      if (activeIdx !== -1) {
        const activeItem = editedChar.items[activeIdx];
        if (activeItem.armaAmuletoMagicoLevel !== level) {
          setEditedChar(prev => {
            const updatedItems = (prev.items || []).map((item, i) => {
              if (i === activeIdx && typeof item === 'object' && item !== null) {
                return { ...item, armaAmuletoMagicoLevel: level };
              }
              return item;
            });
            return { ...prev, items: updatedItems };
          });
        }
      }
    }
  }, [editedChar.aprimoramentosPositivos]);

  const hasArmaAmuletoMalditoOnMount = useRef<boolean | null>(null);

  useEffect(() => {
    const currentHas = (editedChar.aprimoramentosNegativos || []).some(s =>
      s && (s.toLowerCase().includes("arma ou amuleto maldito") || s.toLowerCase().includes("arma ou amuleto maldit"))
    );
    if (hasArmaAmuletoMalditoOnMount.current === null) {
      hasArmaAmuletoMalditoOnMount.current = currentHas;
      return;
    }
    if (currentHas && !hasArmaAmuletoMalditoOnMount.current) {
      toast.warning("Arma ou Amuleto Maldito - Identifique no inventário qual arma ou item customizado receberá o aprimoramento");
      setHasPendingMagicEnchant(true);
      setEditedChar(prev => ({ ...prev, has_pending_magic_enchant: true }));
    }
    hasArmaAmuletoMalditoOnMount.current = currentHas;
  }, [editedChar.aprimoramentosNegativos]);

  useEffect(() => {
    const level = getArmaAmuletoMalditoLevel(editedChar.aprimoramentosNegativos);
    if (level === null) {
      const hasAny = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && i.hasArmaAmuletoMaldito);
      if (hasAny) {
        setEditedChar(prev => {
          const clearedItems = (prev.items || []).map((item) => {
            if (typeof item === 'object' && item !== null && item.hasArmaAmuletoMaldito) {
              return { ...item, hasArmaAmuletoMaldito: false, armaAmuletoMalditoLevel: undefined };
            }
            return item;
          });
          return { ...prev, items: clearedItems, has_pending_magic_enchant: false };
        });
        setHasPendingMagicEnchant(false);
      }
    } else {
      const activeIdx = (editedChar.items || []).findIndex((i: any) => typeof i === 'object' && i !== null && i.hasArmaAmuletoMaldito);
      if (activeIdx !== -1) {
        const activeItem = editedChar.items[activeIdx];
        if (activeItem.armaAmuletoMalditoLevel !== level) {
          setEditedChar(prev => {
            const updatedItems = (prev.items || []).map((item, i) => {
              if (i === activeIdx && typeof item === 'object' && item !== null) {
                return { ...item, armaAmuletoMalditoLevel: level };
              }
              return item;
            });
            return { ...prev, items: updatedItems };
          });
        }
      }
    }
  }, [editedChar.aprimoramentosNegativos]);

  const hasArmaPreferencialOnMount = useRef<boolean | null>(null);

  useEffect(() => {
    const currentHas = (editedChar.aprimoramentosPositivos || []).some(s =>
      s && (s.toLowerCase().includes("arma preferencial") || s.toLowerCase() === "arma_preferencial")
    );
    if (hasArmaPreferencialOnMount.current === null) {
      hasArmaPreferencialOnMount.current = currentHas;
      return;
    }
    if (currentHas && !hasArmaPreferencialOnMount.current) {
      toast.success("Arma preferêncial: Identifique no inventário qual arma receberá o aprimoramento.");
    }
    hasArmaPreferencialOnMount.current = currentHas;
  }, [editedChar.aprimoramentosPositivos]);

  useEffect(() => {
    const hasAP = hasArmaPreferencialEnhancement(editedChar.aprimoramentosPositivos);
    if (!hasAP) {
      const hasAny = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && i.hasArmaPreferencial);
      if (hasAny) {
        setEditedChar(prev => {
          const clearedItems = (prev.items || []).map((item) => {
            if (typeof item === 'object' && item !== null && item.hasArmaPreferencial) {
              return { ...item, hasArmaPreferencial: false };
            }
            return item;
          });
          return { ...prev, items: clearedItems };
        });
      }
    }
  }, [editedChar.aprimoramentosPositivos]);

  const hasAcuideArmaOnMount = useRef<boolean | null>(null);

  useEffect(() => {
    const currentHas = (editedChar.aprimoramentosPositivos || []).some(s =>
      s && (
        s.toLowerCase().includes("acuide com arma") ||
        s.toLowerCase().includes("acuidade com arma") ||
        s.toLowerCase() === "acuide_arma" ||
        s.toLowerCase() === "acuidade_arma"
      )
    );
    if (hasAcuideArmaOnMount.current === null) {
      hasAcuideArmaOnMount.current = currentHas;
      return;
    }
    if (currentHas && !hasAcuideArmaOnMount.current) {
      toast.success("Acuide com Arma - Identifique no inventário qual arma receberá o aprimoramento.");
    }
    hasAcuideArmaOnMount.current = currentHas;
  }, [editedChar.aprimoramentosPositivos]);

  useEffect(() => {
    const hasAcuide = hasAcuideArmaEnhancement(editedChar.aprimoramentosPositivos);
    if (!hasAcuide) {
      const hasAny = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && i.hasAcuideArma);
      if (hasAny) {
        setEditedChar(prev => {
          const clearedItems = (prev.items || []).map((item) => {
            if (typeof item === 'object' && item !== null && item.hasAcuideArma) {
              return { ...item, hasAcuideArma: false };
            }
            return item;
          });
          return { ...prev, items: clearedItems };
        });
      }
    }
  }, [editedChar.aprimoramentosPositivos]);

  const hasBibliotecaOnMount = useRef<boolean | null>(null);

  useEffect(() => {
    const currentHas = (editedChar.aprimoramentosPositivos || []).some(s =>
      s && (
        s.toLowerCase().includes("biblioteca") ||
        s.toLowerCase() === "biblioteca"
      )
    );
    if (hasBibliotecaOnMount.current === null) {
      hasBibliotecaOnMount.current = currentHas;
      return;
    }
    if (currentHas && !hasBibliotecaOnMount.current) {
      toast.success("Biblioteca - Você pode escolher mais de um subgrupo de conhecimento nas perícias Ciências Proibidas, Ciências e Conhecimentos.");
    }
    hasBibliotecaOnMount.current = currentHas;
  }, [editedChar.aprimoramentosPositivos]);

  useEffect(() => {
    const bibLevel = getBibliotecaLevel(editedChar.aprimoramentosPositivos);
    if (bibLevel === null) {
      // Clean up duplicate entries of "Ciências", "Ciências Proibidas", or "Conhecimentos"
      let hasDuplicates = false;
      const seenGroups = new Set<string>();
      for (const s of editedChar.skills || []) {
        const grp = (s?.group || '').toLowerCase().trim();
        if (grp && isLibrarySkillName(grp)) {
          if (seenGroups.has(grp)) {
            hasDuplicates = true;
            break;
          }
          seenGroups.add(grp);
        }
      }

      if (hasDuplicates) {
        setEditedChar(prev => {
          const keepSeen = new Set<string>();
          const cleanedSkills = (prev.skills || []).filter(s => {
            const grp = (s?.group || '').toLowerCase().trim();
            if (grp && isLibrarySkillName(grp)) {
              if (keepSeen.has(grp)) {
                return false; // remove duplicates
              }
              keepSeen.add(grp);
            }
            return true;
          });
          return { ...prev, skills: cleanedSkills };
        });
      }
    }
  }, [editedChar.aprimoramentosPositivos]);

  // Hydrate raw string items of editedChar with full item definitions from itensCatalog when it is loaded
  useEffect(() => {
    if (itensCatalog.length > 0 && editedChar && editedChar.items) {
      const hasStrings = editedChar.items.some(it => typeof it === 'string' && it.trim() !== '');
      if (hasStrings) {
        setEditedChar(prev => {
          if (!prev || !prev.items) return prev;
          const hydratedItems = prev.items.map(it => {
            if (typeof it === 'string' && it.trim() !== '') {
              const matched = itensCatalog.find(cat => (cat.item || '').toLowerCase() === it.trim().toLowerCase());
              if (matched) {
                return {
                  ...matched,
                  id: matched.id || "item_hydrated_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)
                };
              }
              // Attempt smart classification if not found in catalog
              const classified = classifyItemByName(it);
              if (classified) {
                return {
                  ...classified,
                  id: "item_classified_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)
                };
              }
            }
            return it;
          });
          return {
            ...prev,
            items: hydratedItems
          };
        });
      }
    }
  }, [itensCatalog, editedChar?.id]);

  // Dynamic sanity state, attributes penalty sync, and armor modifiers calculations
  useEffect(() => {
    const willPts = Number(editedChar.attributes?.will?.pontosGastos) || 0;
    const calculatedSanidadeVal = 100 + willPts;
    const loucura = calculatedSanidadeVal - (Number(editedChar.statusPoints?.psi?.esforcoMental) || 0);

    let mentalStatus = "Saudável";
    let intPenalty = 0;
    let willPenalty = 0;
    let carPenalty = 0;

    if (loucura >= 100) {
      mentalStatus = "Saudável";
    } else if (loucura >= 75) {
      mentalStatus = "Afetado";
    } else if (loucura >= 50) {
      mentalStatus = "Instável";
      intPenalty = 1;
    } else if (loucura >= 25) {
      mentalStatus = "Degenerado";
      intPenalty = 1;
      willPenalty = 1;
    } else if (loucura >= 1) {
      mentalStatus = "Louco";
      intPenalty = 2;
      willPenalty = 2;
      carPenalty = 2;
    } else {
      mentalStatus = "Suicida";
    }

    // Calculate equipped armors' penalties and IP additions
    const equippedArmors = editedChar.armors || [];
    let totalArmorDexPenalty = 0;
    let totalArmorAgiPenalty = 0;
    let totalArmorIpArmadura = 0;
    let totalArmorIpEscudo = 0;

    equippedArmors.forEach((item) => {
      if (item.isEquipped) {
        const isObraPrima = item.modificador === "Armadura/Escudo Obra-prima" || item.modificador === "Armadura Obra-prima" || item.modificador === "Escudo Obra-prima";
        const isEscudo = item.nome.toLowerCase().includes("escudo") || item.nome.toLowerCase().includes("broquel");
        
        // Final penalty for DES (DEX)
        const baseDexPen = Number(item.penalidade_dex) || 0;
        const dexPenReduction = isObraPrima ? 1 : 0;
        const finalDexPen = Math.min(0, baseDexPen + dexPenReduction);

        // Final penalty for AGI
        const baseAgiPen = Number(item.penalidade_agi) || 0;
        const agiPenReduction = isObraPrima ? 1 : 0;
        const finalAgiPen = Math.min(0, baseAgiPen + agiPenReduction);

        totalArmorDexPenalty += Math.abs(finalDexPen);
        totalArmorAgiPenalty += Math.abs(finalAgiPen);

        // IP calculations
        if (isEscudo) {
          totalArmorIpEscudo += Number(item.ip) || 0;
        } else {
          totalArmorIpArmadura += Number(item.ip) || 0;
        }
      }
    });

    const expectedIntPenalty = (Number(editedChar.attributes?.int?.penalidadeManual) || 0) + intPenalty + (Number(editedChar.attributes?.int?.penalidadeExtra) || 0);
    const expectedWillPenalty = (Number(editedChar.attributes?.will?.penalidadeManual) || 0) + willPenalty + (Number(editedChar.attributes?.will?.penalidadeExtra) || 0);
    const expectedCarPenalty = (Number(editedChar.attributes?.car?.penalidadeManual) || 0) + carPenalty + (Number(editedChar.attributes?.car?.penalidadeExtra) || 0);
    const expectedDesPenalty = (Number(editedChar.attributes?.des?.penalidadeManual) || 0) + totalArmorDexPenalty + (Number(editedChar.attributes?.des?.penalidadeExtra) || 0);
    const expectedAgiPenalty = (Number(editedChar.attributes?.agi?.penalidadeManual) || 0) + totalArmorAgiPenalty + (Number(editedChar.attributes?.agi?.penalidadeExtra) || 0);

    const baseIpPsiquico = editedChar.protection?.baseIpPsiquico !== undefined 
      ? Number(editedChar.protection.baseIpPsiquico) || 0 
      : Number(editedChar.protection?.ipPsiquico) || 0;

    const baseIpEscudo = editedChar.protection?.baseIpEscudo !== undefined 
      ? Number(editedChar.protection.baseIpEscudo) || 0 
      : Number(editedChar.protection?.ipEscudo) || 0;

    const expectedIpPsiquico = baseIpPsiquico + totalArmorIpArmadura;
    const expectedIpEscudo = baseIpEscudo + totalArmorIpEscudo;

    const currentIntPenalty = Number(editedChar.attributes?.int?.penalidade) || 0;
    const currentWillPenalty = Number(editedChar.attributes?.will?.penalidade) || 0;
    const currentCarPenalty = Number(editedChar.attributes?.car?.penalidade) || 0;
    const currentDesPenalty = Number(editedChar.attributes?.des?.penalidade) || 0;
    const currentAgiPenalty = Number(editedChar.attributes?.agi?.penalidade) || 0;
    const currentIpPsiquico = Number(editedChar.protection?.ipPsiquico) || 0;
    const currentIpEscudo = Number(editedChar.protection?.ipEscudo) || 0;
    const currentMentalStatus = editedChar.statusPoints?.psi?.estadoMental || '';

    const heroicosLevel = getPontosHeroicosLevel(editedChar.aprimoramentosPositivos);
    const charLevel = Number(editedChar.level) || 1;
    let expectedHeroicosValorFinal = Number(editedChar.statusPoints?.heroicos?.valorFinal) || 0;
    if (heroicosLevel !== null) {
      expectedHeroicosValorFinal = heroicosLevel * charLevel;
    }
    const currentHeroicosValorFinal = Number(editedChar.statusPoints?.heroicos?.valorFinal) || 0;

    const isPotencializarActive = hasPotencializarMagia(editedChar.aprimoramentosPositivos);
    const spellsNeedUpdate = (editedChar.spells || []).some(spell => {
      const baseCost = spell.baseCost !== undefined ? spell.baseCost : spell.cost;
      const numBaseCost = Number(baseCost) || 0;
      const expectedCost = isPotencializarActive && numBaseCost > 0 ? String(Math.ceil(numBaseCost * 1.5)) : baseCost;

      const baseRange = spell.baseRange !== undefined ? spell.baseRange : spell.range;
      const numBaseRange = Number(baseRange) || 0;
      const expectedRange = isPotencializarActive && numBaseRange > 0 ? String(Math.ceil(numBaseRange * 1.5)) : baseRange;

      let baseHH = spell.baseDurationHH !== undefined ? spell.baseDurationHH : (spell.durationHH || 0);
      let baseMM = spell.baseDurationMM !== undefined ? spell.baseDurationMM : (spell.durationMM || 0);
      let baseSS = spell.baseDurationSS !== undefined ? spell.baseDurationSS : (spell.durationSS || 0);

      if (spell.baseDurationHH === undefined && spell.baseDurationMM === undefined && spell.baseDurationSS === undefined && spell.duration) {
        const parsed = parseDurationString(spell.duration);
        baseHH = parsed.hh;
        baseMM = parsed.mm;
        baseSS = parsed.ss;
      }

      let expectedHH = baseHH;
      let expectedMM = baseMM;
      let expectedSS = baseSS;
      if (isPotencializarActive) {
        const totalSeconds = (baseHH * 3600) + (baseMM * 60) + baseSS;
        if (totalSeconds > 0) {
          const finalTotalSeconds = Math.ceil(totalSeconds * 1.5);
          expectedHH = Math.floor(finalTotalSeconds / 3600);
          const rem = finalTotalSeconds % 3600;
          expectedMM = Math.floor(rem / 60);
          expectedSS = rem % 60;
        }
      }
      const expectedDurationStr = formatDuration(expectedHH, expectedMM, expectedSS);

      return spell.cost !== expectedCost || 
             spell.range !== expectedRange || 
             spell.duration !== expectedDurationStr ||
             spell.baseCost === undefined ||
             spell.baseRange === undefined ||
             spell.baseDurationHH === undefined;
    });

    let skillsNeedUpdate = false;
    if (editedChar.skills && editedChar.skills.length > 0) {
      const expectedSkills = editedChar.skills.map(skill => {
        const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
          skill.group,
          skill.baseAttr,
          skill.chosenSubgroup,
          skill.subgrupos,
          editedChar.attributes
        );
        const isCombat = !!skill.requer_ataque_defesa;
        const obraPrimaSkillBonus = calculateObraPrimaBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items);
        const magicWeaponSkillBonus = calculateMagicWeaponBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items);
        const magicWeaponAtkDefBonus = Math.floor(magicWeaponSkillBonus / 2);
        const malditaWeaponPenalty = calculateMalditaWeaponPenaltyForSkill(skill.group, skill.chosenSubgroup, editedChar.items);
        const malditaWeaponPenaltyAtkDef = Math.floor(malditaWeaponPenalty / 2);
        const armaPreferencialBonus = calculateArmaPreferencialBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items, Number(editedChar.level) || 1);
        const corpoMaleavelBonus = calculateCorpoMaleavelBonus(skill.group, skill.chosenSubgroup, editedChar.aprimoramentosPositivos);
        const familiarBonus = calculateFamiliarSkillBonus(skill.group, skill.chosenSubgroup, resolvedAttrKey, editedChar.aprimoramentosPositivos, editedChar.familiar);
        const racialBonus = calculateRacialSkillBonus(skill.group, skill.chosenSubgroup, editedChar.race);
        const expectedTotal = isCombat
          ? `${(skill.atkGasto ?? 0) + attrVal + obraPrimaSkillBonus + magicWeaponAtkDefBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus + racialBonus - malditaWeaponPenaltyAtkDef}% / ${(skill.defGasto ?? 0) + attrVal + obraPrimaSkillBonus + magicWeaponAtkDefBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus + racialBonus - malditaWeaponPenaltyAtkDef}%`
          : `${attrVal + (Math.round(Number(skill.gasto)) || 0) + obraPrimaSkillBonus + magicWeaponSkillBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus + racialBonus - malditaWeaponPenalty}%`;
        return {
          ...skill,
          atributo: attrVal,
          total: expectedTotal
        };
      });
      skillsNeedUpdate = JSON.stringify(editedChar.skills) !== JSON.stringify(expectedSkills);
    }

    const syncHasFamiliares = (editedChar.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares"));
    const syncHasCoruja = syncHasFamiliares && (editedChar.familiar?.animalId?.toLowerCase() === 'coruja' || editedChar.familiar?.animalNome?.toLowerCase() === 'coruja');
    const syncHasVisaoPenumbra = (editedChar.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("visão na penumbra"));
    const penumbraNeedsUpdate = (syncHasCoruja && !syncHasVisaoPenumbra) || (!syncHasCoruja && syncHasVisaoPenumbra);

    const syncHasRato = syncHasFamiliares && (editedChar.familiar?.animalId?.toLowerCase() === 'rato' || editedChar.familiar?.animalNome?.toLowerCase() === 'rato');
    const conRow = editedChar.attributes.con;
    const conNatural = Math.max(0, Math.round(Number(conRow.natural)) || 0);
    const conPenalidade = Math.max(0, Math.round(Number(conRow.penalidade)) || 0);
    const conBonusRacial = Math.max(0, Math.round(Number(conRow.bonusRacial)) || 0);
    const expectedConPctAmpliado = syncHasRato
      ? `${10 + (conNatural - conPenalidade + conBonusRacial) * 4}%`
      : `${(conNatural - conPenalidade + conBonusRacial) * 4}%`;
    const expectedConPctNatural = syncHasRato
      ? `${10 + conNatural * 4}%`
      : `${conNatural * 4}%`;
    const conNeedsUpdate = conRow.pctAmpliado !== expectedConPctAmpliado || conRow.pctNatural !== expectedConPctNatural;

    const hasChanges = 
      currentIntPenalty !== expectedIntPenalty ||
      currentWillPenalty !== expectedWillPenalty ||
      currentCarPenalty !== expectedCarPenalty ||
      currentDesPenalty !== expectedDesPenalty ||
      currentAgiPenalty !== expectedAgiPenalty ||
      currentIpPsiquico !== expectedIpPsiquico ||
      currentIpEscudo !== expectedIpEscudo ||
      currentMentalStatus !== mentalStatus ||
      editedChar.protection.baseIpPsiquico === undefined ||
      editedChar.protection.baseIpEscudo === undefined ||
      (heroicosLevel !== null && currentHeroicosValorFinal !== expectedHeroicosValorFinal) ||
      spellsNeedUpdate ||
      skillsNeedUpdate ||
      penumbraNeedsUpdate ||
      conNeedsUpdate;

    if (hasChanges) {
      setEditedChar((prev) => {
        const updated = { ...prev };
        
        const isPotVal = hasPotencializarMagia(updated.aprimoramentosPositivos);
        if (updated.spells && updated.spells.length > 0) {
          updated.spells = updated.spells.map(spell => {
            const baseCost = spell.baseCost !== undefined ? spell.baseCost : spell.cost;
            const numBaseCost = Number(baseCost) || 0;
            const expectedCost = isPotVal && numBaseCost > 0 ? String(Math.ceil(numBaseCost * 1.5)) : baseCost;

            const baseRange = spell.baseRange !== undefined ? spell.baseRange : spell.range;
            const numBaseRange = Number(baseRange) || 0;
            const expectedRange = isPotVal && numBaseRange > 0 ? String(Math.ceil(numBaseRange * 1.5)) : baseRange;

            let baseHH = spell.baseDurationHH !== undefined ? spell.baseDurationHH : (spell.durationHH || 0);
            let baseMM = spell.baseDurationMM !== undefined ? spell.baseDurationMM : (spell.durationMM || 0);
            let baseSS = spell.baseDurationSS !== undefined ? spell.baseDurationSS : (spell.durationSS || 0);

            if (spell.baseDurationHH === undefined && spell.baseDurationMM === undefined && spell.baseDurationSS === undefined && spell.duration) {
              const parsed = parseDurationString(spell.duration);
              baseHH = parsed.hh;
              baseMM = parsed.mm;
              baseSS = parsed.ss;
            }

            let expectedHH = baseHH;
            let expectedMM = baseMM;
            let expectedSS = baseSS;
            if (isPotVal) {
              const totalSeconds = (baseHH * 3600) + (baseMM * 60) + baseSS;
              if (totalSeconds > 0) {
                const finalTotalSeconds = Math.ceil(totalSeconds * 1.5);
                expectedHH = Math.floor(finalTotalSeconds / 3600);
                const rem = finalTotalSeconds % 3600;
                expectedMM = Math.floor(rem / 60);
                expectedSS = rem % 60;
              }
            }
            const expectedDurationStr = formatDuration(expectedHH, expectedMM, expectedSS);

            return {
              ...spell,
              baseCost,
              cost: expectedCost,
              baseRange,
              range: expectedRange,
              baseDurationHH: baseHH,
              baseDurationMM: baseMM,
              baseDurationSS: baseSS,
              durationHH: expectedHH,
              durationMM: expectedMM,
              durationSS: expectedSS,
              duration: expectedDurationStr
            };
          });
        }

        const currentHeroicosLvl = getPontosHeroicosLevel(updated.aprimoramentosPositivos);
        const currentCharLvl = Number(updated.level) || 1;
        let finalHeroicosValorFinal = Number(updated.statusPoints?.heroicos?.valorFinal) || 0;
        if (currentHeroicosLvl !== null) {
          finalHeroicosValorFinal = currentHeroicosLvl * currentCharLvl;
        }

        updated.statusPoints = {
          ...updated.statusPoints,
          psi: {
            ...updated.statusPoints?.psi,
            estadoMental: mentalStatus,
          },
          heroicos: {
            ...updated.statusPoints?.heroicos,
            valorFinal: finalHeroicosValorFinal,
          },
        };

        updated.protection = {
          ...updated.protection,
          ipPsiquico: expectedIpPsiquico,
          ipEscudo: expectedIpEscudo,
          baseIpPsiquico: baseIpPsiquico,
          baseIpEscudo: baseIpEscudo,
        };

        const recalculateRowWithNewPenalty = (row: AttributeRow, newPenalty: number, rowAttrKey?: keyof CharacterAttributes): AttributeRow => {
          const naturalVal = Math.max(0, Math.round(Number(row.natural)) || 0);
          const bonusRacialVal = Math.max(0, Math.round(Number(row.bonusRacial)) || 0);
          const valorAmpliado = naturalVal - newPenalty + bonusRacialVal;
          let pctAmpliadoVal = (naturalVal - newPenalty + bonusRacialVal) * 4;

          const isRatoBonusActive = rowAttrKey === 'con' && 
            (updated.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares")) && 
            (updated.familiar?.animalId?.toLowerCase() === 'rato' || updated.familiar?.animalNome?.toLowerCase() === 'rato');

          if (isRatoBonusActive) {
            pctAmpliadoVal = 10 + pctAmpliadoVal;
          }

          return {
            ...row,
            penalidade: newPenalty,
            valorAmpliado,
            pctNatural: isRatoBonusActive ? `${10 + naturalVal * 4}%` : `${naturalVal * 4}%`,
            pctAmpliado: `${pctAmpliadoVal}%`,
          };
        };

        const isRatoBonusActiveForCon = (updated.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares")) && 
          (updated.familiar?.animalId?.toLowerCase() === 'rato' || updated.familiar?.animalNome?.toLowerCase() === 'rato');

        const updatedConRow = { ...updated.attributes.con };
        const conNat = Math.max(0, Math.round(Number(updatedConRow.natural)) || 0);
        const conPen = Math.max(0, Math.round(Number(updatedConRow.penalidade)) || 0);
        const conBon = Math.max(0, Math.round(Number(updatedConRow.bonusRacial)) || 0);
        updatedConRow.pctAmpliado = isRatoBonusActiveForCon
          ? `${10 + (conNat - conPen + conBon) * 4}%`
          : `${(conNat - conPen + conBon) * 4}%`;
        updatedConRow.pctNatural = isRatoBonusActiveForCon
          ? `${10 + conNat * 4}%`
          : `${conNat * 4}%`;

        updated.attributes = {
          ...updated.attributes,
          con: updatedConRow,
          int: recalculateRowWithNewPenalty(updated.attributes.int, expectedIntPenalty),
          will: recalculateRowWithNewPenalty(updated.attributes.will, expectedWillPenalty),
          car: recalculateRowWithNewPenalty(updated.attributes.car, expectedCarPenalty),
          des: recalculateRowWithNewPenalty(updated.attributes.des, expectedDesPenalty),
          agi: recalculateRowWithNewPenalty(updated.attributes.agi, expectedAgiPenalty),
        };

        const hasFamiliares = (updated.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares"));
        const hasCoruja = hasFamiliares && (updated.familiar?.animalId?.toLowerCase() === 'coruja' || updated.familiar?.animalNome?.toLowerCase() === 'coruja');
        const hasVisaoPenumbra = (updated.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("visão na penumbra"));

        if (hasCoruja && !hasVisaoPenumbra) {
          const arr = [...(updated.aprimoramentosPositivos || [])].filter(s => s && s.trim());
          if (!arr.includes("Visão na Penumbra")) {
            arr.push("Visão na Penumbra");
            updated.aprimoramentosPositivos = arr;
          }
        } else if (!hasCoruja && hasVisaoPenumbra) {
          updated.aprimoramentosPositivos = (updated.aprimoramentosPositivos || []).filter(s => s && !s.toLowerCase().includes("visão na penumbra"));
        }

        if (updated.skills && updated.skills.length > 0) {
          updated.skills = updated.skills.map(skill => {
            const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
              skill.group,
              skill.baseAttr,
              skill.chosenSubgroup,
              skill.subgrupos,
              updated.attributes
            );
            const isCombat = !!skill.requer_ataque_defesa;
            const obraPrimaSkillBonus = calculateObraPrimaBonusForSkill(skill.group, skill.chosenSubgroup, updated.items);
            const magicWeaponSkillBonus = calculateMagicWeaponBonusForSkill(skill.group, skill.chosenSubgroup, updated.items);
            const magicWeaponAtkDefBonus = Math.floor(magicWeaponSkillBonus / 2);
            const malditaWeaponPenalty = calculateMalditaWeaponPenaltyForSkill(skill.group, skill.chosenSubgroup, updated.items);
            const malditaWeaponPenaltyAtkDef = Math.floor(malditaWeaponPenalty / 2);
            const armaPreferencialBonus = calculateArmaPreferencialBonusForSkill(skill.group, skill.chosenSubgroup, updated.items, Number(updated.level) || 1);
            const corpoMaleavelBonus = calculateCorpoMaleavelBonus(skill.group, skill.chosenSubgroup, updated.aprimoramentosPositivos);
            const familiarBonus = calculateFamiliarSkillBonus(skill.group, skill.chosenSubgroup, resolvedAttrKey, updated.aprimoramentosPositivos, updated.familiar);
            const racialBonus = calculateRacialSkillBonus(skill.group, skill.chosenSubgroup, updated.race);
            return {
              ...skill,
              atributo: attrVal,
              total: isCombat
                ? `${(skill.atkGasto ?? 0) + attrVal + obraPrimaSkillBonus + magicWeaponAtkDefBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus + racialBonus - malditaWeaponPenaltyAtkDef}% / ${(skill.defGasto ?? 0) + attrVal + obraPrimaSkillBonus + magicWeaponAtkDefBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus + racialBonus - malditaWeaponPenaltyAtkDef}%`
                : `${attrVal + (Math.round(Number(skill.gasto)) || 0) + obraPrimaSkillBonus + magicWeaponSkillBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus + racialBonus - malditaWeaponPenalty}%`
            };
          });
        }

        return updated;
      });
    }
  }, [
    editedChar.attributes?.will?.pontosGastos,
    editedChar.statusPoints?.psi?.esforcoMental,
    editedChar.attributes?.int?.natural,
    editedChar.attributes?.will?.natural,
    editedChar.attributes?.car?.natural,
    editedChar.attributes?.des?.natural,
    editedChar.attributes?.agi?.natural,
    editedChar.attributes?.int?.bonusRacial,
    editedChar.attributes?.will?.bonusRacial,
    editedChar.attributes?.car?.bonusRacial,
    editedChar.attributes?.des?.bonusRacial,
    editedChar.attributes?.agi?.bonusRacial,
    editedChar.attributes?.int?.penalidadeManual,
    editedChar.attributes?.will?.penalidadeManual,
    editedChar.attributes?.car?.penalidadeManual,
    editedChar.attributes?.des?.penalidadeManual,
    editedChar.attributes?.agi?.penalidadeManual,
    editedChar.attributes?.int?.penalidadeExtra,
    editedChar.attributes?.will?.penalidadeExtra,
    editedChar.attributes?.car?.penalidadeExtra,
    editedChar.attributes?.des?.penalidadeExtra,
    editedChar.attributes?.agi?.penalidadeExtra,
    editedChar.protection?.ipPsiquico,
    editedChar.protection?.ipEscudo,
    editedChar.protection?.baseIpPsiquico,
    editedChar.protection?.baseIpEscudo,
    JSON.stringify(editedChar.armors || []),
    JSON.stringify(editedChar.items || []),
    JSON.stringify(editedChar.aprimoramentosPositivos || []),
    JSON.stringify(editedChar.aprimoramentosNegativos || []),
    JSON.stringify(editedChar.spells || []),
    JSON.stringify(editedChar.familiar),
    editedChar.level,
    editedChar.statusPoints?.heroicos?.valorFinal
  ]);

  // Lock status and save status state machine
  const [isLocked, setIsLocked] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isBgExpanded, setIsBgExpanded] = useState(false);
  const [bgHeight, setBgHeight] = useState<number | string>('auto');
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  const isNew = !characterId;
  const hasLeveledUp = originalChar ? (Number(editedChar.level) > Number(originalChar.level)) : false;

  // Core fields that can be changed when unlocked
  const isCoreLocked = !isNew && isLocked;

  // Level & XP fields (can be changed when unlocked)
  const isLevelLocked = !isNew && isLocked;

  const handleCampaignChange = (campaignIdStr: string) => {
    if (userRole === 'dm') return; // DM cannot change character campaign
    const val = campaignIdStr ? campaignIdStr : undefined;
    setEditedChar((prev) => {
      const updated = {
        ...prev,
        campaignId: val,
      };
      if (characterId && isLocked) {
        if (onSilentUpdate) {
          onSilentUpdate(updated);
        } else if (onSave) {
          onSave(updated);
        }
        toast.success(val ? 'Personagem vinculado à campanha com sucesso!' : 'Personagem desvinculado da campanha.');
      }
      return updated;
    });
  };

  // Sync modal portrait url with state
  // Calculations for Aprimoramentos
  const cleanAprimoramentosPositivos = (editedChar.aprimoramentosPositivos || []).filter(s => s && s.trim());
  const cleanAprimoramentosNegativos = (editedChar.aprimoramentosNegativos || []).filter(s => s && s.trim());
  
  const visibleSkills = (() => {
    if (userRole === 'dm' && originalChar && originalChar.isPendingDMReview) {
      const origSkills = originalChar.skills || [];
      const currSkills = editedChar.skills || [];
      
      const combined: Array<any & { diffStatus: 'added' | 'removed' | 'modified' | 'none' }> = [];
      
      currSkills.forEach(s => {
        const orig = origSkills.find(o => o.group === s.group && o.chosenSubgroup === s.chosenSubgroup);
        if (!orig) {
          combined.push({ ...s, diffStatus: 'added' });
        } else {
          const isModified = Number(orig.gasto) !== Number(s.gasto) || 
                             Number(orig.atkGasto) !== Number(s.atkGasto) || 
                             Number(orig.defGasto) !== Number(s.defGasto);
          combined.push({ ...s, diffStatus: isModified ? 'modified' : 'none' });
        }
      });
      
      origSkills.forEach(o => {
        const existsInCurr = currSkills.some(s => s.group === o.group && s.chosenSubgroup === o.chosenSubgroup);
        if (!existsInCurr) {
          combined.push({ ...o, diffStatus: 'removed' });
        }
      });
      
      return combined;
    }
    return (editedChar.skills || []).map(s => ({ ...s, diffStatus: 'none' as const }));
  })();

  const visiblePositives = (() => {
    const currList = (editedChar.aprimoramentosPositivos || []).filter(s => s && s.trim());
    if (userRole === 'dm' && originalChar && originalChar.isPendingDMReview) {
      const origList = (originalChar.aprimoramentosPositivos || []).filter(s => s && s.trim());
      
      const combined: Array<{ value: string; diffStatus: 'added' | 'removed' | 'none' }> = [];
      
      currList.forEach(item => {
        const exists = origList.includes(item);
        combined.push({ value: item, diffStatus: exists ? 'none' : 'added' });
      });
      
      origList.forEach(item => {
        const exists = currList.includes(item);
        if (!exists) {
          combined.push({ value: item, diffStatus: 'removed' });
        }
      });
      return combined;
    }
    return currList.map(s => ({ value: s, diffStatus: 'none' as const }));
  })();

  const visibleNegatives = (() => {
    const currList = (editedChar.aprimoramentosNegativos || []).filter(s => s && s.trim());
    if (userRole === 'dm' && originalChar && originalChar.isPendingDMReview) {
      const origList = (originalChar.aprimoramentosNegativos || []).filter(s => s && s.trim());
      
      const combined: Array<{ value: string; diffStatus: 'added' | 'removed' | 'none' }> = [];
      
      currList.forEach(item => {
        const exists = origList.includes(item);
        combined.push({ value: item, diffStatus: exists ? 'none' : 'added' });
      });
      
      origList.forEach(item => {
        const exists = currList.includes(item);
        if (!exists) {
          combined.push({ value: item, diffStatus: 'removed' });
        }
      });
      return combined;
    }
    return currList.map(s => ({ value: s, diffStatus: 'none' as const }));
  })();

  const visibleItems = (() => {
    const combined: Array<{ item: string | any; idx: number; diffStatus: 'added' | 'removed' | 'none' }> = [];
    
    if (userRole === 'dm' && originalChar && originalChar.isPendingDMReview) {
      const origList = originalChar.items || [];
      const currList = editedChar.items || [];
      
      currList.forEach((item, idx) => {
        const itemName = typeof item === 'object' ? item.item : item;
        const exists = origList.some(o => {
          const oName = typeof o === 'object' ? o.item : o;
          return oName === itemName;
        });
        
        combined.push({
          item,
          idx,
          diffStatus: exists ? 'none' : 'added'
        });
      });
      
      origList.forEach((item, idx) => {
        const itemName = typeof item === 'object' ? item.item : item;
        const existsInCurr = currList.some(c => {
          const cName = typeof c === 'object' ? c.item : c;
          return cName === itemName;
        });
        
        if (!existsInCurr) {
          combined.push({
            item,
            idx: -1, // indicating removed item
            diffStatus: 'removed'
          });
        }
      });
    } else {
      (editedChar.items || []).forEach((item, idx) => {
        combined.push({
          item,
          idx,
          diffStatus: 'none'
        });
      });
    }
    
    return combined;
  })();
  
  const calcHasFamiliares = cleanAprimoramentosPositivos.some(s => s && s.toLowerCase().includes("familiares"));
  const calcHasCoruja = calcHasFamiliares && (editedChar.familiar?.animalId?.toLowerCase() === 'coruja' || editedChar.familiar?.animalNome?.toLowerCase() === 'coruja');

  const selectedRaceName = editedChar.race || '';
  const raceObj = Object.values(racasData as Record<string, any>).find(r => 
    r.nome?.toLowerCase() === selectedRaceName.toLowerCase() ||
    r.id?.toLowerCase() === selectedRaceName.toLowerCase() ||
    (selectedRaceName.toLowerCase() === 'anão' && r.id === 'anao')
  );

  const aprimoramentoExtra = raceObj?.pontos_aprimoramento_extra || 0;
  const periciaExtra = raceObj?.pontos_pericia_extra || 0;

  // Calculate accumulated level-up bonuses
  const currentL = Number(editedChar.level) || 1;
  const nextL = currentL + 1;
  const rulesToUse = levelUpRules?.niveis_personagem || DEFAULT_LEVELUP_RULES.niveis_personagem;

  const xpNeededForNext = nextL <= 15 ? (rulesSource => {
    return rulesSource?.[String(nextL)]?.exp_necessaria ?? 0;
  })(rulesToUse) : null;
  const isReadyToLevelUp = xpNeededForNext !== null && (Number(editedChar.xp) || 0) >= xpNeededForNext;

  let extraAtributos = 0;
  let extraAprimoramentos = 0;
  let extraPericias = 0;
  let extraPvBonus = 0;
  let extraPmBonus = 0;
  let extraFocusBonus = 0;

  if (rulesToUse) {
    for (let i = 2; i <= currentL; i++) {
      const levelData = rulesToUse[String(i)];
      if (levelData) {
        extraAtributos += Number(levelData.atributos) || 0;
        extraAprimoramentos += Number(levelData.aprimoramentos) || 0;
        const levelPericias = levelData.pericias !== undefined 
          ? (Number(levelData.pericias) || 0) 
          : ((Number(levelData.pericias_mundanas) || 0) + (Number(levelData.pericias_misticas) || 0));
        extraPericias += levelPericias;
        extraPvBonus += Number(levelData.pv_bonus) || 0;
        extraPmBonus += Number(levelData.pontos_magia) || 0;
        extraFocusBonus += Number(levelData.focus) || 0;
      }
    }
  }

  const allowedAttributePoints = 101 + extraAtributos;
  const allowedAprimoramentosPoints = 5 + aprimoramentoExtra + extraAprimoramentos;

  const totalPositivasPoints = cleanAprimoramentosPositivos.reduce((sum, str) => {
    if (calcHasCoruja && str.toLowerCase().includes("visão na penumbra")) {
      return sum;
    }
    return sum + getEnhancementCost(str, 'POSITIVO').cost;
  }, 0);
  const totalNegativasPoints = cleanAprimoramentosNegativos.reduce((sum, str) => sum + getEnhancementCost(str, 'NEGATIVO').cost, 0);
  const negativeBenefitPoints = Math.min(totalNegativasPoints, 3);
  const remainingPointsValue = allowedAprimoramentosPoints - totalPositivasPoints + negativeBenefitPoints;

  // Calculations for Attributes points
  const totalSpentAttributePoints = (Object.keys(editedChar.attributes) as Array<keyof CharacterAttributes>).reduce(
    (sum, key) => sum + (Number(editedChar.attributes[key]?.natural) || 0),
    0
  );
  const remainingAttributePoints = allowedAttributePoints - totalSpentAttributePoints;

  // Calculations for Perícias (Skills) points based on age and intelligence
  const charAge = Number(editedChar.age) || 0;
  const charInt = Number(editedChar.attributes.int.valorAmpliado) || Number(editedChar.attributes.int.natural) || 0;
  const calculatedPointsRaw = (charAge * 10) + (charInt * 5);

  let calculatedPointsMax = calculatedPointsRaw;
  let showSkillsCapWarning = false;
  let showSkillsBalanceWarning = false;

  if (calculatedPointsRaw > 500) {
    showSkillsCapWarning = true;
    calculatedPointsMax = 500;
    showSkillsBalanceWarning = true;
  } else if (calculatedPointsRaw >= 400) {
    showSkillsBalanceWarning = true;
  }

  // Add race-specific extra skill points (e.g. +20 for Humanos)
  calculatedPointsMax += periciaExtra;

  // Sum of spent points across all skills
  const totalSpentSkillsPoints = (editedChar.skills || []).reduce((sum, skill) => {
    const freePoints = Number(skill.pontosGratis) || 0;
    const spent = Math.max(0, (Number(skill.gasto) || 0) - freePoints);
    return sum + spent;
  }, 0);

  const allowedSkillsPoints = calculatedPointsMax + extraPericias;
  const remainingSkillsPoints = allowedSkillsPoints - totalSpentSkillsPoints;

  const hasValidPortrait = editedChar.portraitUrl && editedChar.portraitUrl.trim() !== '' && !portraitError;

  // Companion Diff variables
  const isReviewMode = !!(userRole === 'dm' && originalChar && originalChar.isPendingDMReview);

  const origHasCompanionAnimal = !!(originalChar?.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("companheiro animal"));
  const currHasCompanionAnimal = !!(editedChar.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("companheiro animal"));

  const origHasMontaria = !!(originalChar?.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("montaria especial"));
  const currHasMontaria = !!(editedChar.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("montaria especial"));

  const origHasFamiliar = !!(originalChar?.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares"));
  const currHasFamiliar = !!(editedChar.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares"));

  const isCompAnimalAdded = isReviewMode && currHasCompanionAnimal && !origHasCompanionAnimal;
  const isCompAnimalRemoved = isReviewMode && !currHasCompanionAnimal && origHasCompanionAnimal;
  const isCompAnimalModified = isReviewMode && currHasCompanionAnimal && origHasCompanionAnimal && JSON.stringify(originalChar.companionAnimal) !== JSON.stringify(editedChar.companionAnimal);

  const isMontariaAdded = isReviewMode && currHasMontaria && !origHasMontaria;
  const isMontariaRemoved = isReviewMode && !currHasMontaria && origHasMontaria;
  const isMontariaModified = isReviewMode && currHasMontaria && origHasMontaria && JSON.stringify(originalChar.montariaEspecial) !== JSON.stringify(editedChar.montariaEspecial);

  const isFamiliarAdded = isReviewMode && currHasFamiliar && !origHasFamiliar;
  const isFamiliarRemoved = isReviewMode && !currHasFamiliar && origHasFamiliar;
  const isFamiliarModified = isReviewMode && currHasFamiliar && origHasFamiliar && JSON.stringify(originalChar.familiar) !== JSON.stringify(editedChar.familiar);

  const showCompanionAnimal = currHasCompanionAnimal || isCompAnimalRemoved;
  const showMontaria = currHasMontaria || isMontariaRemoved;
  const showFamiliar = currHasFamiliar || isFamiliarRemoved;

  const showCompanheirosSection = showCompanionAnimal || showMontaria || showFamiliar;

  // Grimorio / Focus Change detection variables
  const isGrimorioNew = isReviewMode && (
    ((!originalChar?.spells || originalChar.spells.length === 0) && (editedChar?.spells && editedChar.spells.length > 0)) ||
    (!originalChar?.focusAllocation && !!editedChar?.focusAllocation)
  );

  const isSpellsChanged = isReviewMode && isSectionChanged('magias');

  const isFocusChanged = isReviewMode && (
    JSON.stringify(originalChar?.focusAllocation) !== JSON.stringify(editedChar?.focusAllocation)
  );

  const isCriarChanged = isReviewMode && (Number(originalChar?.focusAllocation?.criar) || 0) !== (Number(editedChar?.focusAllocation?.criar) || 0);
  const isControlarChanged = isReviewMode && (Number(originalChar?.focusAllocation?.controlar) || 0) !== (Number(editedChar?.focusAllocation?.controlar) || 0);
  const isEntenderChanged = isReviewMode && (Number(originalChar?.focusAllocation?.entender) || 0) !== (Number(editedChar?.focusAllocation?.entender) || 0);

  const hasGrimorioOrFocusChanges = isReviewMode && (isGrimorioNew || isSpellsChanged || isFocusChanged);

  const isCaminhoChanged = (name: string, valor: number) => {
    if (!isReviewMode || !originalChar?.focusAllocation) return false;
    const origCaminhos = originalChar.focusAllocation.caminhos || [];
    const orig = origCaminhos.find((c: any) => c.nome === name);
    if (!orig) return true;
    return orig.valor !== valor;
  };

  const isSpellChanged = (spell: any): boolean => {
    if (!isReviewMode || !originalChar?.spells) return false;
    const origSpell = originalChar.spells.find((s: any) => s.id === spell.id);
    if (!origSpell) return true;
    return (
      origSpell.name !== spell.name ||
      origSpell.focus !== spell.focus ||
      origSpell.cost !== spell.cost ||
      origSpell.range !== spell.range ||
      origSpell.duration !== spell.duration ||
      origSpell.description !== spell.description
    );
  };

  const visibleSpells = (() => {
    const combined: Array<{ spell: any; diffStatus: 'added' | 'removed' | 'none' }> = [];
    
    if (isReviewMode) {
      const origList = originalChar?.spells || [];
      const currList = editedChar?.spells || [];
      
      currList.forEach((spell) => {
        const exists = origList.some(o => o.id === spell.id);
        combined.push({
          spell,
          diffStatus: exists ? 'none' : 'added'
        });
      });
      
      origList.forEach((spell) => {
        const existsInCurr = currList.some(c => c.id === spell.id);
        if (!existsInCurr) {
          combined.push({
            spell,
            diffStatus: 'removed'
          });
        }
      });
    } else {
      (editedChar?.spells || []).forEach((spell) => {
        combined.push({
          spell,
          diffStatus: 'none'
        });
      });
    }
    
    return combined;
  })();

  useEffect(() => {
    if (isPortraitModalOpen) {
      setModalPortraitUrl(editedChar.portraitUrl || '');
    }
  }, [isPortraitModalOpen, editedChar.portraitUrl]);

  // Sync background box height
  useEffect(() => {
    if (isLocked && (editedChar.background || '').length > 700) {
      if (isBgExpanded) {
        setBgHeight(bgContentRef.current?.scrollHeight || 'auto');
      } else {
        setBgHeight(160);
      }
    } else {
      setBgHeight('auto');
    }
  }, [isBgExpanded, editedChar.background, isLocked]);

  // Handle auto-expanding background textarea
  useEffect(() => {
    const textarea = bgTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [editedChar.background]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setModalPortraitUrl(base64String);
        handleDemographicChange('portraitUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean and parse fields to pure numbers before submitting or downloading
  const cleanCharacterForSaving = (char: Character): Character => {
    const finalChar = normalizeCharacter(char);

    // Attributes
    for (const key of Object.keys(finalChar.attributes) as Array<keyof CharacterAttributes>) {
      const attr = finalChar.attributes[key];
      if (!attr) continue;
      attr.natural = Math.max(0, Math.round(Number(attr.natural)) || 0);
      attr.penalidade = Math.max(0, Math.round(Number(attr.penalidade)) || 0);
      attr.bonusRacial = Math.max(0, Math.round(Number(attr.bonusRacial)) || 0);
      attr.pontosGastos = Math.max(0, Math.round(Number(attr.pontosGastos)) || 0);
      attr.penalidadeManual = Math.max(0, Math.round(Number(attr.penalidadeManual)) || 0);
      attr.penalidadeExtra = Math.max(0, Math.round(Number(attr.penalidadeExtra)) || 0);
      attr.bonusRacialManual = Math.max(0, Math.round(Number(attr.bonusRacialManual)) || 0);
      attr.bonusRacialExtra = Math.max(0, Math.round(Number(attr.bonusRacialExtra)) || 0);
    }

    // Status Points
    for (const key of Object.keys(finalChar.statusPoints) as Array<keyof Character['statusPoints']>) {
      const val = finalChar.statusPoints[key];
      if (!val) continue;
      val.valorFinal = Math.max(0, Math.round(Number(val.valorFinal)) || 0);
      if (val.danoSofrido !== undefined) val.danoSofrido = Math.max(0, Math.round(Number(val.danoSofrido)) || 0);
      if (val.magiaExaurida !== undefined) val.magiaExaurida = Math.max(0, Math.round(Number(val.magiaExaurida)) || 0);
      if (val.esforcoMental !== undefined) val.esforcoMental = Math.max(0, Math.round(Number(val.esforcoMental)) || 0);
      if (val.feExaurida !== undefined) val.feExaurida = Math.max(0, Math.round(Number(val.feExaurida)) || 0);
    }

    // Protection
    finalChar.protection.ipCinetico = Math.max(0, Math.round(Number(finalChar.protection?.ipCinetico)) || 0);
    finalChar.protection.ipBalistico = Math.max(0, Math.round(Number(finalChar.protection?.ipBalistico)) || 0);
    finalChar.protection.ipEscudo = Math.max(0, Math.round(Number(finalChar.protection?.ipEscudo)) || 0);
    finalChar.protection.ipPsiquico = Math.max(0, Math.round(Number(finalChar.protection?.ipPsiquico)) || 0);
    finalChar.protection.ipMagico = Math.max(0, Math.round(Number(finalChar.protection?.ipMagico)) || 0);
    if (!finalChar.protection.durabilidadeArmadura) {
      finalChar.protection.durabilidadeArmadura = { atual: 0, total: 0 };
    }
    finalChar.protection.durabilidadeArmadura.atual = Math.max(0, Math.round(Number(finalChar.protection.durabilidadeArmadura.atual)) || 0);
    finalChar.protection.durabilidadeArmadura.total = Math.max(0, Math.round(Number(finalChar.protection.durabilidadeArmadura.total)) || 0);

    // Skills
    finalChar.skills = (finalChar.skills || []).map((skill: any) => ({
      ...skill,
      atributo: Math.max(0, Math.round(Number(skill.atributo)) || 0),
      gasto: Math.max(0, Math.round(Number(skill.gasto)) || 0),
    }));

    // Treasure
    if (!finalChar.treasure) finalChar.treasure = { ouro: 0, prata: 0, bronze: 0 };
    finalChar.treasure.ouro = Math.max(0, Math.round(Number(finalChar.treasure.ouro)) || 0);
    finalChar.treasure.prata = Math.max(0, Math.round(Number(finalChar.treasure.prata)) || 0);
    finalChar.treasure.bronze = Math.max(0, Math.round(Number(finalChar.treasure.bronze)) || 0);

    return finalChar;
  };

  // Export character sheet as localized JSON
  const handleExportCharacter = () => {
    const finalChar = cleanCharacterForSaving(editedChar);
    const conPts = Number(finalChar.attributes?.con?.pontosGastos) || 0;
    const forPts = Number(finalChar.attributes?.for?.pontosGastos) || 0;
    if (finalChar.statusPoints?.vida) {
      finalChar.statusPoints.vida.valorFinal = Math.ceil((conPts + forPts) / 2);
    }

    const willPts = Number(finalChar.attributes?.will?.pontosGastos) || 0;
    if (finalChar.statusPoints?.psi) {
      finalChar.statusPoints.psi.valorFinal = 100 + willPts;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalChar, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const fileName = `${finalChar.name ? finalChar.name.toLowerCase().replace(/\s+/g, '_') : 'personagem'}_ficha.json`;
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmLevelUp = () => {
    if (userRole !== 'dm') {
      toast.error("Apenas o modo Mestre pode aprovar a evolução.");
      setShowLevelUpConfirmModal(false);
      return;
    }

    const nextLevel = (Number(editedChar.level) || 1) + 1;
    if (nextLevel > 15) {
      toast.error("O nível máximo permitido é 15!");
      setShowLevelUpConfirmModal(false);
      return;
    }

    // Obter o XP necessário para o próximo nível da tabela ou fallback
    const rulesSource = levelUpRules?.niveis_personagem || DEFAULT_LEVELUP_RULES.niveis_personagem;
    const reqXp = rulesSource?.[String(nextLevel)]?.exp_necessaria ?? 0;
    
    const currentXp = Number(editedChar.xp) || 0;
    const updatedXp = Math.max(currentXp, reqXp);
    const updated = {
      ...editedChar,
      level: nextLevel,
      xp: updatedXp,
      isPendingDMReview: false,
      pendingChanges: undefined
    };

    setEditedChar(updated);

    // Sync to parent list immediately so players and other views get updated
    const finalChar = cleanCharacterForSaving(updated);
    const conPts = Number(finalChar.attributes?.con?.pontosGastos) || 0;
    const forPts = Number(finalChar.attributes?.for?.pontosGastos) || 0;
    if (finalChar.statusPoints?.vida) {
      finalChar.statusPoints.vida.valorFinal = Math.ceil((conPts + forPts) / 2);
    }

    const willPts = Number(finalChar.attributes?.will?.pontosGastos) || 0;
    if (finalChar.statusPoints?.psi) {
      finalChar.statusPoints.psi.valorFinal = 100 + willPts;
    }

    if (onLevelUp && characterId) {
      onLevelUp(characterId, finalChar, () => {
        setShowLevelUpConfirmModal(false);
        setJustLeveledUp(false);
      });
    } else {
      if (onSilentUpdate) {
        onSilentUpdate(finalChar);
      } else if (onSave) {
        onSave(finalChar);
      }
      toast.success(`Personagem evoluído com sucesso para o Nível ${nextLevel}!`);
      setShowLevelUpConfirmModal(false);
      setJustLeveledUp(false);
    }
  };

  const handleConfirmDeleteCharacter = () => {
    if (onDelete && characterId) {
      onDelete(characterId);
      setActiveScreen('characters');
    }
    setIsDeleteConfirmOpen(false);
  };

  // Prominent interactive loading save handler
  const handleInteractiveSave = () => {
    const isNameInvalid = !editedChar.name || !editedChar.name.trim();
    // Validate sex selection, note that during editing it might have select options, and check if it is selected
    const isSexInvalid = !editedChar.sex || !editedChar.sex.trim() || editedChar.sex === 'Outro';
    const isRaceInvalid = !editedChar.race || !editedChar.race.trim() || editedChar.race === 'Outro';
    const isAgeInvalid = !editedChar.age || !editedChar.age.trim();
    const isClassInvalid = !editedChar.classKit || !editedChar.classKit.trim() || editedChar.classKit === 'Outro';

    const errors: string[] = [];
    if (isNameInvalid) errors.push('name');
    if (isSexInvalid) errors.push('sex');
    if (isRaceInvalid) errors.push('race');
    if (isAgeInvalid) errors.push('age');
    if (isClassInvalid) errors.push('classKit');

    const attrKeys: Array<keyof CharacterAttributes> = ['con', 'for', 'des', 'agi', 'int', 'per', 'will', 'car'];
    for (const key of attrKeys) {
      const val = editedChar.attributes[key]?.natural;
      if (val === undefined || val === null || val === "" || Number(val) <= 0) {
        errors.push(`attr-${key}`);
      }
    }

    // Validation for Attribute Points rule and max 18
    const totalSpentAttributePoints = (Object.keys(editedChar.attributes) as Array<keyof CharacterAttributes>).reduce(
      (sum, key) => sum + (Number(editedChar.attributes[key]?.natural) || 0),
      0
    );
    const remainingAttributePoints = allowedAttributePoints - totalSpentAttributePoints;

    if (remainingAttributePoints !== 0) {
      errors.push('attribute_points');
    }

    const hasAttrOver18 = (Object.keys(editedChar.attributes) as Array<keyof CharacterAttributes>).some(
      (key) => (Number(editedChar.attributes[key]?.natural) || 0) > 18
    );
    if (hasAttrOver18) {
      errors.push('attribute_over_18');
    }

    if (remainingPointsValue < 0) {
      errors.push('aprimoramentos_points');
    }

    if (remainingSkillsPoints < 0) {
      errors.push('skills_points');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShakeSave(true);
      
      const missingLabels: string[] = [];
      if (isNameInvalid) missingLabels.push("Nome");
      if (isSexInvalid) missingLabels.push("Sexo");
      if (isRaceInvalid) missingLabels.push("Raça");
      if (isAgeInvalid) missingLabels.push("Idade");
      if (isClassInvalid) missingLabels.push("Classe");
      
      let hasAttrError = false;
      for (const key of attrKeys) {
        const val = editedChar.attributes[key]?.natural;
        if (val === undefined || val === null || val === "" || Number(val) <= 0) {
          hasAttrError = true;
        }
      }
      if (hasAttrError) missingLabels.push("Atributos");
      
      if (remainingAttributePoints !== 0) {
        if (remainingAttributePoints < 0) {
          missingLabels.push("Você não possui mais pontos pra somar");
        } else {
          missingLabels.push(`Distribuir exatamente ${allowedAttributePoints} pontos de atributos (restam ${remainingAttributePoints} pts)`);
        }
      }

      if (hasAttrOver18) {
        missingLabels.push("Nenhum atributo pode ser maior que 18");
      }

      if (remainingPointsValue < 0) {
        missingLabels.push("Saldo de Aprimoramentos Negativo");
      }

      if (remainingSkillsPoints < 0) {
        missingLabels.push("Saldo de Perícias Negativo");
      }

      toast.error(`Corrija os campos para salvar: ${missingLabels.join(', ')}`);

      setTimeout(() => {
        setShakeSave(false);
      }, 500);

      return;
    }

    setValidationErrors([]);

    if (isNew) {
      setIsSaveConfirmOpen(true);
    } else {
      executeActualSave();
    }
  };

  const executeActualSave = () => {
    setSaveStatus('loading');
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => {
        const finalChar = cleanCharacterForSaving(editedChar);
        if (!finalChar.id) {
          finalChar.id = `char-${Date.now()}`;
        } else if (!isNew) {
          finalChar.isPendingDMReview = true;
        }
        const conPts = Number(finalChar.attributes?.con?.pontosGastos) || 0;
        const forPts = Number(finalChar.attributes?.for?.pontosGastos) || 0;
        if (finalChar.statusPoints?.vida) {
          finalChar.statusPoints.vida.valorFinal = Math.ceil((conPts + forPts) / 2);
        }

        const willPts = Number(finalChar.attributes?.will?.pontosGastos) || 0;
        if (finalChar.statusPoints?.psi) {
          finalChar.statusPoints.psi.valorFinal = 100 + willPts;
        }

        onSave(finalChar);
        setIsLocked(true);
        setSaveStatus('idle');
        toast.success('Crônica de alma selada com sucesso !');
      }, 1000); // 1s success visualization
    }, 1200); // At least 1 second loading (1.2s)
  };

  // Initialize form with character or default new sheet
  useEffect(() => {
    if (characterId) {
      const match = characters.find((c) => c.id === characterId);
      const isReviewStatusChanged = !!(match && originalChar && (originalChar.isPendingDMReview !== match.isPendingDMReview));
      const isLevelChanged = !!(match && originalChar && (Number(match.level) || 1) !== (Number(originalChar.level) || 1));
      
      if (characterId !== loadedCharacterIdRef.current || isReviewStatusChanged || isLevelChanged) {
        if (characterId !== loadedCharacterIdRef.current) {
          lastSilentSavedRef.current = null;
        }

        if (match && userRole === 'player') {
          if (characterId !== loadedCharacterIdRef.current) {
            // First access to the sheet: check localStorage seen states
            try {
              const storedStr = localStorage.getItem('character_seen_states');
              const states = storedStr ? JSON.parse(storedStr) : {};
              const storedState = states[characterId];
              
              if (storedState) {
                const currentL = Number(match.level) || 1;
                const storedL = Number(storedState.level) || 1;
                
                // Only trigger evolution notification if the level actually increased
                if (currentL > storedL) {
                  setJustLeveledUp(true);
                } else {
                  setJustLeveledUp(false);
                }

                // Update stored state
                states[characterId] = {
                  level: currentL,
                  isPendingDMReview: !!match.isPendingDMReview
                };
                localStorage.setItem('character_seen_states', JSON.stringify(states));
              } else {
                // Initialize seen state
                states[characterId] = {
                  level: Number(match.level) || 1,
                  isPendingDMReview: !!match.isPendingDMReview
                };
                localStorage.setItem('character_seen_states', JSON.stringify(states));
                setJustLeveledUp(false);
              }
            } catch (e) {
              console.error("Error reading/writing character_seen_states:", e);
              setJustLeveledUp(false);
            }
          } else if (originalChar) {
            // Live update while viewing the sheet: only trigger if level actually increased
            const levelIncreased = (Number(match.level) || 1) > (Number(originalChar.level) || 1);
            
            if (levelIncreased) {
              setJustLeveledUp(true);
            }
          }
        } else if (characterId !== loadedCharacterIdRef.current) {
          setJustLeveledUp(false);
        }

        if (match) {
          loadedCharacterIdRef.current = characterId;
          setOriginalChar(match);
          
          // Decide what to load into editedChar
          let sourceChar = match;
          if (userRole === 'dm') {
            // If DM is viewing a pending character, merge the proposed changes with the character metadata so they can inspect them
            if (match.isPendingDMReview && match.pendingChanges) {
              sourceChar = {
                ...match,
                ...match.pendingChanges,
                id: match.id,
                name: match.pendingChanges.name ?? match.name,
                race: match.pendingChanges.race ?? match.race,
                classKit: match.pendingChanges.classKit ?? match.classKit,
                level: match.pendingChanges.level ?? match.level,
                xp: match.pendingChanges.xp ?? match.xp,
                portraitUrl: match.pendingChanges.portraitUrl ?? match.portraitUrl,
                campaignId: match.campaignId,
                userId: match.userId,
                isPendingDMReview: true,
                pendingChanges: match.pendingChanges,
              };
            }
          } else {
            // If player is viewing, since we default to locked, show pre-edit (approved) data
            sourceChar = match;
          }

          // Deep copy and full normalization
          const copied = normalizeCharacter(sourceChar);
          // Make sure penalidadeManual is initialized for all attributes
          const willPts = Number(copied.attributes?.will?.pontosGastos) || 0;
          const calculatedSanidadeVal = 100 + willPts;
          const loucura = calculatedSanidadeVal - (Number(copied.statusPoints?.psi?.esforcoMental) || 0);

          let intSanityPenalty = 0;
          let willSanityPenalty = 0;
          let carSanityPenalty = 0;

          if (loucura >= 50 && loucura < 75) {
            intSanityPenalty = 1;
          } else if (loucura >= 25 && loucura < 50) {
            intSanityPenalty = 1;
            willSanityPenalty = 1;
          } else if (loucura >= 1 && loucura < 25) {
            intSanityPenalty = 2;
            willSanityPenalty = 2;
            carSanityPenalty = 2;
          }

          const keys: Array<keyof CharacterAttributes> = ['con', 'for', 'des', 'agi', 'int', 'per', 'will', 'car'];
          for (const k of keys) {
            const row = copied.attributes[k];
            let sanityPenalty = 0;
            if (k === 'int') sanityPenalty = intSanityPenalty;
            if (k === 'will') sanityPenalty = willSanityPenalty;
            if (k === 'car') sanityPenalty = carSanityPenalty;

            if (row.penalidadeManual === undefined) {
              row.penalidadeManual = Math.max(0, (Number(row.penalidade) || 0) - sanityPenalty);
            }
            if (row.penalidadeExtra === undefined) {
              row.penalidadeExtra = 0;
            }
            if (row.bonusRacialManual === undefined) {
              row.bonusRacialManual = Number(row.bonusRacial) || 0;
            }
            if (row.bonusRacialExtra === undefined) {
              row.bonusRacialExtra = 0;
            }
          }

          if (copied.items && Array.isArray(copied.items)) {
            copied.items = copied.items.map((it: any) => {
              if (it && typeof it === 'object') {
                return {
                  ...it,
                  id: it.id || "item_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
                };
              }
              return it;
            });
          }

          setEditedChar(copied);
          setIsLocked(true); // Default to locked for existing characters
        }
      }
    } else {
      if (loadedCharacterIdRef.current !== '__new__') {
        loadedCharacterIdRef.current = '__new__';
        setOriginalChar(null);
        setEditedChar(DEFAULT_NEW_CHARACTER());
        setIsLocked(false); // Default to unlocked for brand new characters
      }
    }
  }, [characterId, characters, userRole]);

  // Save seen state when leaving the screen or changing character
  useEffect(() => {
    return () => {
      if (characterId && userRole === 'player') {
        const match = characters.find(c => c.id === characterId);
        if (match) {
          try {
            const storedStr = localStorage.getItem('character_seen_states');
            const states = storedStr ? JSON.parse(storedStr) : {};
            states[characterId] = {
              level: Number(match.level) || 1,
              isPendingDMReview: !!match.isPendingDMReview
            };
            localStorage.setItem('character_seen_states', JSON.stringify(states));
          } catch (e) {
            console.error("Error saving seen state on unmount:", e);
          }
        }
      }
    };
  }, [characterId, userRole, characters]);

  // Handler for top-level demographic fields
  const handleDemographicChange = (field: keyof Character, value: any) => {
    if (field === 'level') return; // Ensure level change happens ONLY via the Level-UP button
    let finalValue = value;
    if (field === 'xp') {
      const cleaned = String(value).trim();
      if (cleaned === "") {
        finalValue = "";
      } else {
        const num = Number(cleaned);
        if (!isNaN(num)) {
          finalValue = Math.max(0, Math.round(num));
        } else {
          finalValue = 0;
        }
      }
    }

    if (field === 'race') {
      const newRaceName = value || '';
      const newRaceObj = Object.values(racasData as Record<string, any>).find(r => 
        r.nome?.toLowerCase() === newRaceName.toLowerCase() ||
        r.id?.toLowerCase() === newRaceName.toLowerCase() ||
        (newRaceName.toLowerCase() === 'anão' && r.id === 'anao')
      );

      setEditedChar((prev) => {
        const updatedAttributes = { ...prev.attributes };
        
        const keys: Array<keyof CharacterAttributes> = ['con', 'for', 'des', 'agi', 'int', 'per', 'will', 'car'];
        const keyMapping: Record<keyof CharacterAttributes, string> = {
          for: 'FOR',
          con: 'CON',
          des: 'DEX',
          agi: 'AGI',
          int: 'INT',
          per: 'PER',
          will: 'VON',
          car: 'CAR'
        };

        for (const k of keys) {
          const row = updatedAttributes[k];
          const jsonKey = keyMapping[k];
          const modVal = newRaceObj?.modificadores_atributos?.[jsonKey] || newRaceObj?.modificadores_atributos?.[jsonKey === 'VON' ? 'WILL' : 'VON'] || 0;

          const targetRow = { ...row };
          if (modVal > 0) {
            targetRow.bonusRacialManual = modVal;
            targetRow.bonusRacial = modVal;
            targetRow.bonusRacialExtra = 0;
            
            targetRow.penalidadeManual = 0;
            const sanityPenalty = getAttrSanityPenalty(k, { ...prev, race: newRaceName });
            targetRow.penalidade = sanityPenalty;
            targetRow.penalidadeExtra = 0;
          } else if (modVal < 0) {
            const absMod = Math.abs(modVal);
            targetRow.penalidadeManual = absMod;
            const sanityPenalty = getAttrSanityPenalty(k, { ...prev, race: newRaceName });
            targetRow.penalidade = absMod + sanityPenalty;
            targetRow.penalidadeExtra = 0;

            targetRow.bonusRacialManual = 0;
            targetRow.bonusRacial = 0;
            targetRow.bonusRacialExtra = 0;
          } else {
            targetRow.bonusRacialManual = 0;
            targetRow.bonusRacial = 0;
            targetRow.bonusRacialExtra = 0;

            targetRow.penalidadeManual = 0;
            const sanityPenalty = getAttrSanityPenalty(k, { ...prev, race: newRaceName });
            targetRow.penalidade = sanityPenalty;
            targetRow.penalidadeExtra = 0;
          }

          const naturalVal = Math.max(0, Math.round(Number(targetRow.natural)) || 0);
          const penalidadeVal = Math.max(0, Math.round(Number(targetRow.penalidade)) || 0);
          const bonusRacialVal = Math.max(0, Math.round(Number(targetRow.bonusRacial)) || 0);
          targetRow.valorAmpliado = naturalVal - penalidadeVal + bonusRacialVal;
          
          let pctAmpliadoVal = (naturalVal - penalidadeVal + bonusRacialVal) * 4;
          let pctNaturalVal = naturalVal * 4;
          
          const hasFamiliarEnhancement = (prev.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares"));
          const isRatoBonusActive = k === 'con' && hasFamiliarEnhancement && (prev.familiar?.animalId?.toLowerCase() === 'rato' || prev.familiar?.animalNome?.toLowerCase() === 'rato');

          if (isRatoBonusActive) {
            pctAmpliadoVal = 10 + pctAmpliadoVal;
            pctNaturalVal = 10 + pctNaturalVal;
          }

          targetRow.pctNatural = `${pctNaturalVal}%`;
          targetRow.pctAmpliado = `${pctAmpliadoVal}%`;

          updatedAttributes[k] = targetRow;
        }

        let updatedAprimoramentosPositivos = [...prev.aprimoramentosPositivos];
        const raceAprimoramentos = newRaceObj?.aprimoramentos || [];
        
        const prevRaceObj = Object.values(racasData as Record<string, any>).find(r => 
          r.nome?.toLowerCase() === prev.race?.toLowerCase() ||
          r.id?.toLowerCase() === prev.race?.toLowerCase() ||
          (prev.race?.toLowerCase() === 'anão' && r.id === 'anao')
        );
        const prevRaceAprimoramentos = prevRaceObj?.aprimoramentos || [];
        
        if (prevRaceAprimoramentos.length > 0) {
          updatedAprimoramentosPositivos = updatedAprimoramentosPositivos.filter(
            enh => !prevRaceAprimoramentos.includes(enh)
          );
        }

        for (const newEnh of raceAprimoramentos) {
          if (!updatedAprimoramentosPositivos.includes(newEnh)) {
            const emptyIdx = updatedAprimoramentosPositivos.findIndex(s => s === "");
            if (emptyIdx !== -1) {
              updatedAprimoramentosPositivos[emptyIdx] = newEnh;
            } else {
              updatedAprimoramentosPositivos.push(newEnh);
            }
          }
        }

        while (updatedAprimoramentosPositivos.length < 5) {
          updatedAprimoramentosPositivos.push("");
        }

        let updatedSkills = [...(prev.skills || [])];

        if (prevRaceObj?.pericias_iniciais_obrigatorias) {
          const prevMandatory = prevRaceObj.pericias_iniciais_obrigatorias;
          for (const skillName of Object.keys(prevMandatory)) {
            const subData = prevMandatory[skillName];
            for (const subName of Object.keys(subData)) {
              const idx = updatedSkills.findIndex(
                s => s.group?.toLowerCase() === skillName.toLowerCase() && s.chosenSubgroup?.toLowerCase() === subName.toLowerCase()
              );
              if (idx !== -1) {
                const existing = updatedSkills[idx];
                const mandatoryVal = Number(subData[subName]) || 0;
                if (Number(existing.gasto) <= mandatoryVal) {
                  updatedSkills = updatedSkills.filter((_, sIdx) => sIdx !== idx);
                } else {
                  updatedSkills[idx] = {
                    ...existing,
                    pontosGratis: 0,
                    gasto: Math.max(0, (Number(existing.gasto) || 0) - mandatoryVal)
                  };
                }
              }
            }
          }
        }

        if (newRaceObj?.pericias_iniciais_obrigatorias) {
          const newMandatory = newRaceObj.pericias_iniciais_obrigatorias;
          for (const skillName of Object.keys(newMandatory)) {
            const subData = newMandatory[skillName];
            for (const subName of Object.keys(subData)) {
              const val = subData[subName];

              const idx = updatedSkills.findIndex(
                s => s.group?.toLowerCase() === skillName.toLowerCase() && s.chosenSubgroup?.toLowerCase() === subName.toLowerCase()
              );

              if (idx !== -1) {
                const existing = updatedSkills[idx];
                updatedSkills[idx] = {
                  ...existing,
                  pontosGratis: val,
                  gasto: Math.max(val, Number(existing.gasto) || 0)
                };
              } else {
                const newSkill: SkillRow = {
                  group: skillName,
                  atributo: "int",
                  gasto: val,
                  pontosGratis: val,
                  total: `${val}%`,
                  chosenSubgroup: subName,
                  subgrupos: [{ nome: subName, atributo_subgrupo: null }]
                };
                updatedSkills.push(newSkill);
              }
            }
          }
        }

        updatedSkills = updatedSkills.map(s => {
          const nextRacialFree = getRacialFreePointsForSkill(s.group, s.chosenSubgroup, newRaceName, racasData);
          const nextGasto = Math.max(nextRacialFree, Number(s.gasto) || 0);
          
          const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
            s.group,
            s.baseAttr,
            s.chosenSubgroup,
            s.subgrupos,
            updatedAttributes
          );

          const finalAtk = s.requer_ataque_defesa ? Math.max(Math.round(nextRacialFree / 2), s.atkGasto ?? 0) : 0;
          const finalDef = s.requer_ataque_defesa ? Math.max(nextRacialFree - Math.round(nextRacialFree / 2), s.defGasto ?? 0) : 0;

          return {
            ...s,
            pontosGratis: nextRacialFree,
            gasto: nextGasto,
            pointsToInsert: nextGasto,
            atkGasto: finalAtk,
            defGasto: finalDef,
            atributo: attrVal,
            total: s.requer_ataque_defesa
              ? `${finalAtk + attrVal}% / ${finalDef + attrVal}%`
              : `${attrVal + nextGasto}%`
          };
        });

        return {
          ...prev,
          race: newRaceName,
          attributes: updatedAttributes,
          aprimoramentosPositivos: updatedAprimoramentosPositivos,
          skills: updatedSkills
        };
      });
      return;
    }

    setEditedChar((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  };

  const handleDemographicBlur = (field: 'level' | 'xp') => {
    setEditedChar((prev) => {
      let finalValue = prev[field];
      if (finalValue === undefined || finalValue === null || (finalValue as any) === "") {
        finalValue = field === 'level' ? 1 : 0;
      } else {
        const num = Number(finalValue);
        if (isNaN(num)) {
          finalValue = field === 'level' ? 1 : 0;
        } else {
          finalValue = Math.max(field === 'level' ? 1 : 0, Math.round(num));
        }
      }
      return {
        ...prev,
        [field]: finalValue as any,
      };
    });
  };

  // Helper to calculate percentages and natural values
  const recalculateAttributeRow = (row: AttributeRow, attrKey?: keyof CharacterAttributes): AttributeRow => {
    const naturalVal = Math.max(0, Math.round(Number(row.natural)) || 0);
    const penalidadeVal = Math.max(0, Math.round(Number(row.penalidade)) || 0);
    const bonusRacialVal = Math.max(0, Math.round(Number(row.bonusRacial)) || 0);
    const valorAmpliado = naturalVal - penalidadeVal + bonusRacialVal;
    
    // The calculation of % ampliado must be: (PONTOS GASTOS - PENALIDADE + BONUS RACIAL) * 4
    let pctAmpliadoVal = (naturalVal - penalidadeVal + bonusRacialVal) * 4;
    let pctNaturalVal = naturalVal * 4;

    const hasFamiliarEnhancement = (editedChar.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares"));
    const isRatoBonusActive = attrKey === 'con' && hasFamiliarEnhancement && (editedChar.familiar?.animalId?.toLowerCase() === 'rato' || editedChar.familiar?.animalNome?.toLowerCase() === 'rato');

    if (isRatoBonusActive) {
      pctAmpliadoVal = 10 + pctAmpliadoVal;
      pctNaturalVal = 10 + pctNaturalVal;
    }

    return {
      ...row,
      valorAmpliado,
      pctNatural: `${pctNaturalVal}%`,
      pctAmpliado: `${pctAmpliadoVal}%`,
    };
  };

  const getMinRacialBonus = (attrKey: keyof CharacterAttributes, charRace: string): number => {
    const raceObj = Object.values(racasData as Record<string, any>).find(r => 
      r.nome?.toLowerCase() === charRace?.toLowerCase() ||
      r.id?.toLowerCase() === charRace?.toLowerCase() ||
      (charRace?.toLowerCase() === 'anão' && r.id === 'anao')
    );
    if (!raceObj || !raceObj.modificadores_atributos) return 0;
    const keyMapping: Record<string, string> = {
      for: 'FOR', con: 'CON', des: 'DEX', agi: 'AGI',
      int: 'INT', per: 'PER', will: 'WILL', car: 'CAR'
    };
    const val = raceObj.modificadores_atributos[keyMapping[attrKey]] || 0;
    return Math.max(0, val);
  };

  const getMinRacialPenalty = (attrKey: keyof CharacterAttributes, charRace: string): number => {
    const raceObj = Object.values(racasData as Record<string, any>).find(r => 
      r.nome?.toLowerCase() === charRace?.toLowerCase() ||
      r.id?.toLowerCase() === charRace?.toLowerCase() ||
      (charRace?.toLowerCase() === 'anão' && r.id === 'anao')
    );
    if (!raceObj || !raceObj.modificadores_atributos) return 0;
    const keyMapping: Record<string, string> = {
      for: 'FOR', con: 'CON', des: 'DEX', agi: 'AGI',
      int: 'INT', per: 'PER', will: 'WILL', car: 'CAR'
    };
    const val = raceObj.modificadores_atributos[keyMapping[attrKey]] || 0;
    return Math.max(0, -val);
  };

  // Handler for nested attributes changes
  const handleAttributeChange = (attrKey: keyof CharacterAttributes, field: keyof AttributeRow, value: any) => {
    setEditedChar((prev) => {
      let finalValue = value;
      if (field === 'natural' || field === 'bonusRacial' || field === 'pontosGastos' || field === 'valorAmpliado' || field === 'penalidade') {
        const strVal = String(value).replace(/[^0-9]/g, '');
        if (strVal === "") {
          finalValue = strVal;
        } else {
          let numVal = Math.max(0, Math.round(Number(strVal)) || 0);
          if (field === 'natural' || field === 'pontosGastos') {
            let maxLimit = 18;
            if (attrKey === 'for' && hasCorpoMaleavel(prev.aprimoramentosPositivos)) {
              maxLimit = 12;
            }
            numVal = Math.min(maxLimit, numVal);
          }
          finalValue = numVal;
        }
      }

      const row = prev.attributes[attrKey];
      const targetRow = { ...row };

      if (field === 'natural') {
        targetRow.natural = finalValue;
        targetRow.pontosGastos = finalValue;
      } else if (field === 'pontosGastos') {
        targetRow.pontosGastos = finalValue;
        targetRow.natural = finalValue;
      } else if (field === 'bonusRacial') {
        const isEditingBase = !isCoreLocked;
        if (isEditingBase) {
          const manualBaseInputVal = finalValue === "" ? 0 : Number(finalValue);
          targetRow.bonusRacialManual = manualBaseInputVal;
          targetRow.bonusRacial = finalValue;
          targetRow.bonusRacialExtra = 0;
        } else {
          const typedTotal = finalValue === "" ? 0 : Number(finalValue);
          const minBonus = Number(row.bonusRacialManual) || 0;
          targetRow.bonusRacial = finalValue;
          targetRow.bonusRacialExtra = typedTotal - minBonus;
        }
      } else if (field === 'penalidade') {
        const sanityPenalty = getAttrSanityPenalty(attrKey, prev);
        const isEditingBase = !isCoreLocked;
        if (isEditingBase) {
          const manualBaseInputVal = finalValue === "" ? 0 : Number(finalValue);
          targetRow.penalidadeManual = manualBaseInputVal;
          targetRow.penalidade = finalValue === "" ? "" : (Number(finalValue) + sanityPenalty);
          targetRow.penalidadeExtra = 0;
        } else {
          const typedTotal = finalValue === "" ? 0 : Number(finalValue);
          const minPenalty = (Number(row.penalidadeManual) || 0) + sanityPenalty;
          targetRow.penalidade = finalValue;
          targetRow.penalidadeExtra = typedTotal - minPenalty;
        }
      } else {
        (targetRow as any)[field] = finalValue;
      }

      const updatedRow = recalculateAttributeRow(targetRow, attrKey);
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attrKey]: updatedRow,
        },
      };
    });
  };

  // Sanitizer on Blur to ensure empty or incomplete fields go back to integer 0
  const handleAttributeBlur = (attrKey: keyof CharacterAttributes, field: keyof AttributeRow) => {
    setEditedChar((prev) => {
      const row = prev.attributes[attrKey];
      const strVal = String(row[field]).trim();
      let finalValue = 0;
      const numVal = Math.round(Number(strVal));
      if (!isNaN(numVal)) {
        finalValue = Math.max(0, numVal);
        if (field === 'natural' || field === 'pontosGastos') {
          let maxLimit = 18;
          if (attrKey === 'for' && hasCorpoMaleavel(prev.aprimoramentosPositivos)) {
            maxLimit = 12;
          }
          finalValue = Math.min(maxLimit, finalValue);
        }
      } else {
        finalValue = 0;
      }

      const targetRow = { ...row };

      if (field === 'natural') {
        targetRow.natural = finalValue;
        targetRow.pontosGastos = finalValue;
      } else if (field === 'pontosGastos') {
        targetRow.pontosGastos = finalValue;
        targetRow.natural = finalValue;
      } else if (field === 'bonusRacial') {
        const isEditingBase = !isCoreLocked;
        const minRacialBonus = getMinRacialBonus(attrKey, prev.race);
        if (isEditingBase) {
          const clampedVal = Math.max(minRacialBonus, finalValue);
          targetRow.bonusRacialManual = clampedVal;
          targetRow.bonusRacial = clampedVal;
          targetRow.bonusRacialExtra = 0;
        } else {
          const minBonus = Math.max(minRacialBonus, Number(row.bonusRacialManual) || 0);
          const clampedTotal = Math.max(minBonus, finalValue);
          targetRow.bonusRacial = clampedTotal;
          targetRow.bonusRacialExtra = clampedTotal - minBonus;
        }
      } else if (field === 'penalidade') {
        const sanityPenalty = getAttrSanityPenalty(attrKey, prev);
        const isEditingBase = !isCoreLocked;
        const minRacialPenalty = getMinRacialPenalty(attrKey, prev.race);
        if (isEditingBase) {
          const clampedVal = Math.max(minRacialPenalty, finalValue);
          targetRow.penalidadeManual = clampedVal;
          targetRow.penalidade = clampedVal + sanityPenalty;
          targetRow.penalidadeExtra = 0;
        } else {
          const minPenalty = Math.max(minRacialPenalty, Number(row.penalidadeManual) || 0) + sanityPenalty;
          const clampedTotal = Math.max(minPenalty, finalValue);
          targetRow.penalidade = clampedTotal;
          targetRow.penalidadeExtra = clampedTotal - minPenalty;
        }
      } else {
        (targetRow as any)[field] = finalValue;
      }

      const updatedRow = recalculateAttributeRow(targetRow, attrKey);
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attrKey]: updatedRow,
        },
      };
    });
  };

  // Handler for statusPoints
  const handleStatusChange = (statusKey: keyof Character['statusPoints'], field: string, value: any) => {
    setEditedChar((prev) => {
      const normalized = normalizeCharacter(prev);
      let finalVal = value;
      if (field !== 'estadoMental') {
        const strVal = String(value).replace(/[^0-9]/g, '');
        if (strVal === "") {
          finalVal = "";
        } else {
          finalVal = Math.round(Number(strVal)) || 0;
        }
      }
      return {
        ...normalized,
        statusPoints: {
          ...normalized.statusPoints,
          [statusKey]: {
            ...(normalized.statusPoints?.[statusKey] || {}),
            [field]: finalVal,
          },
        },
      };
    });
  };

  const handleStatusBlur = (statusKey: keyof Character['statusPoints'], field: string) => {
    setEditedChar((prev) => {
      const normalized = normalizeCharacter(prev);
      if (field === 'estadoMental') return normalized;
      const currentVal = normalized.statusPoints?.[statusKey]?.[field as keyof StatPoint];
      const strVal = String(currentVal ?? '').trim();
      let finalValue = 0;
      const numVal = Math.round(Number(strVal));
      if (!isNaN(numVal)) {
        finalValue = Math.max(0, numVal);
      }
      return {
        ...normalized,
        statusPoints: {
          ...normalized.statusPoints,
          [statusKey]: {
            ...(normalized.statusPoints?.[statusKey] || {}),
            [field]: finalValue,
          },
        },
      };
    });
  };

  // Handler for protections
  const handleProtectionChange = (field: string, value: any) => {
    setEditedChar((prev) => {
      let finalVal = value;
      const strVal = String(value).replace(/[^0-9]/g, '');
      if (strVal === "") {
        finalVal = "";
      } else {
        finalVal = Math.max(0, Math.round(Number(strVal)) || 0);
      }
      
      const extra: any = {};
      if (field === 'ipPsiquico') extra.baseIpPsiquico = finalVal;
      if (field === 'ipEscudo') extra.baseIpEscudo = finalVal;

      return {
        ...prev,
        protection: {
          ...prev.protection,
          [field]: finalVal,
          ...extra,
        },
      };
    });
  };

  const handleProtectionBlur = (field: string) => {
    setEditedChar((prev) => {
      const currentVal = prev.protection[field as keyof Character['protection']];
      let finalValue = 0;
      const numVal = Math.round(Number(currentVal));
      if (!isNaN(numVal)) {
        finalValue = Math.max(0, numVal);
      }

      const extra: any = {};
      if (field === 'ipPsiquico') extra.baseIpPsiquico = finalValue;
      if (field === 'ipEscudo') extra.baseIpEscudo = finalValue;

      return {
        ...prev,
        protection: {
          ...prev.protection,
          [field]: finalValue,
          ...extra,
        },
      };
    });
  };

  const handleAddArmor = (item: any) => {
    setEditedChar((prev) => {
      const armors = prev.armors ? [...prev.armors] : [];
      armors.push({
        id: `armor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nome: item.nome,
        ip: Number(item.ip) || 0,
        penalidade_dex: Number(item.penalidade_dex) || 0,
        penalidade_agi: Number(item.penalidade_agi) || 0,
        isEquipped: false,
        modificador: "",
        obs: item.obs || "",
        slot: item.slot || "",
      });
      return {
        ...prev,
        armors,
      };
    });
    toast.success(`Adicionado ${item.nome} ao inventário.`);
  };

  const getItemSlot = (item: any) => {
    if (item.slot) return item.slot;
    
    // Fallback lookup in armadurasCatalog
    const found = armadurasCatalog.find((c) => c.nome === item.nome);
    if (found && found.slot) return found.slot;

    // Fallback heuristic based on names
    const nomeLower = (item.nome || "").toLowerCase();
    if (nomeLower.includes("escudo") || nomeLower.includes("broquel")) return "escudo";
    if (nomeLower.includes("elmo") || nomeLower.includes("capacete")) return "cabeca";
    if (nomeLower.includes("laudel") || nomeLower.includes("acolchoada") || nomeLower.includes("camisão") || nomeLower.includes("tecido")) return "base";
    return "torso";
  };

  const handleToggleEquipArmor = (id: string) => {
    let validationFailed = false;
    let errorMessage = "";

    setEditedChar((prev) => {
      const currentArmors = prev.armors || [];
      const targetItem = currentArmors.find((arm) => arm.id === id);
      if (!targetItem) return prev;

      const nextEquippedState = !targetItem.isEquipped;

      const armors = currentArmors.map((arm) => {
        if (arm.id === id) {
          return {
            ...arm,
            isEquipped: nextEquippedState,
          };
        }

        // Enforce equip limit rules ONLY if we are equipping the item
        if (nextEquippedState) {
          // Regra de Slots Corporais do Personagem:
          // O personagem só pode equipar um item por tipo de slot simultaneamente.
          // E ao tentar equipar um item com o mesmo slot já ocupado, desequipa o item anterior automaticamente.
          const targetSlot = getItemSlot(targetItem);
          const currentSlot = getItemSlot(arm);

          if (targetSlot && targetSlot === currentSlot) {
            return { ...arm, isEquipped: false };
          }
        }

        return arm;
      });

      return {
        ...prev,
        armors,
      };
    });

    if (validationFailed && errorMessage) {
      toast.error(errorMessage);
    }
  };

  const handleRemoveArmor = (id: string) => {
    setEditedChar((prev) => {
      const armors = prev.armors ? prev.armors.filter((arm) => arm.id !== id) : [];
      return {
        ...prev,
        armors,
      };
    });
  };

  const handleArmorModifierChange = (id: string, value: string) => {
    setEditedChar((prev) => {
      const armors = prev.armors ? prev.armors.map((arm) => {
        if (arm.id === id) {
          return {
            ...arm,
            modificador: value,
          };
        }
        return arm;
      }) : [];
      return {
        ...prev,
        armors,
      };
    });
  };

  const handleItemModifierChange = (indexInItems: number, value: string) => {
    setEditedChar((prev) => {
      const items = prev.items ? [...prev.items] : [];
      if (items[indexInItems]) {
        const itemObj = typeof items[indexInItems] === 'string'
          ? { item: items[indexInItems] }
          : { ...items[indexInItems] };
        itemObj.modificador = value;
        items[indexInItems] = itemObj;
      }
      return {
        ...prev,
        items,
      };
    });
  };

  const handleArmorDurability = (field: 'atual' | 'total', value: any) => {
    setEditedChar((prev) => {
      let finalVal = value;
      const strVal = String(value).replace(/[^0-9]/g, '');
      if (strVal === "") {
        finalVal = "";
      } else {
        finalVal = Math.max(0, Math.round(Number(strVal)) || 0);
      }
      return {
        ...prev,
        protection: {
          ...prev.protection,
          durabilidadeArmadura: {
            ...prev.protection.durabilidadeArmadura,
            [field]: finalVal,
          },
        },
      };
    });
  };

  const handleArmorDurabilityBlur = (field: 'atual' | 'total') => {
    setEditedChar((prev) => {
      const currentVal = prev.protection.durabilidadeArmadura[field];
      let finalValue = 0;
      const numVal = Math.round(Number(currentVal));
      if (!isNaN(numVal)) {
        finalValue = Math.max(0, numVal);
      }
      return {
        ...prev,
        protection: {
          ...prev.protection,
          durabilidadeArmadura: {
            ...prev.protection.durabilidadeArmadura,
            [field]: finalValue,
          },
        },
      };
    });
  };

  // Upgrades list handlers are now managed via the new interactive selection modal and direct array additions/removals.

  // New dynamic item management handlers
  const handleAddGeneralItem = (itemObj: any) => {
    // Weapon skills check
    if (itemObj && (itemObj.categoria === 'armas' || itemObj.categoria === 'arma')) {
      const skills = editedChar.skills || [];
      const hasArmasBrancas = skills.some(s => {
        const groupLower = (s.group || '').toLowerCase();
        const parentLower = (s.parentSkillName || '').toLowerCase();
        const weaponKeywords = [
          "armas brancas", "longo alcance", "espada", "arco", "besta", "machado", 
          "maça", "martelo", "adaga", "faca", "lança", "lanca", "alabarda", "foice", 
          "funda", "azagaia", "zarabatana", "arquaria", "punhal", "espadão", "espadao"
        ];
        return groupLower.includes("armas brancas") || 
               parentLower.includes("armas brancas") ||
               weaponKeywords.some(kw => groupLower.includes(kw));
      });
      if (!hasArmasBrancas) {
        toast.error("Pra utilizar uma arma, é necessário a perícia Armas Brancas ou Armas Brancas de Longo Alcance");
      }
    }

    const itemWithId = {
      ...itemObj,
      id: itemObj.id || "item_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
    };

    setEditedChar((prev) => {
      const items = prev.items ? [...prev.items] : [];
      const cleanItems = items.filter(i => i !== "");
      cleanItems.push(itemWithId);
      return {
        ...prev,
        items: cleanItems
      };
    });
    triggerItemAddedFeedback(itemObj.item);
    // If we already showed a warning toast, let's not override it immediately with success, or just let them show sequentially
    // Let's check if we showed the error toast, if so don't overwrite it immediately, but still do the feedback
    const isWeaponWarning = itemObj && (itemObj.categoria === 'armas' || itemObj.categoria === 'arma') && !(editedChar.skills || []).some(s => {
      const groupLower = (s.group || '').toLowerCase();
      const parentLower = (s.parentSkillName || '').toLowerCase();
      return groupLower.includes("armas brancas") || parentLower.includes("armas brancas");
    });

    if (!isWeaponWarning) {
      toast.success(`Adicionado "${itemObj.item}" ao inventário.`);
    }
  };

  const handleRemoveGeneralItem = (indexToRemove: number) => {
    setEditedChar((prev) => {
      const items = prev.items ? [...prev.items] : [];
      const newItems = items.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        items: newItems
      };
    });
    toast.success("Item removido.");
  };

  const handleMoveItem = (indexInItems: number, itemObj: any) => {
    if (!itemObj) return;

    if (itemObj.categoria === 'armas' || itemObj.categoria === 'arma') {
      // É uma Arma: move para o card ARMAS.
      setEditedChar((prev) => {
        const items = prev.items ? [...prev.items] : [];
        if (items[indexInItems]) {
          items[indexInItems] = {
            ...items[indexInItems],
            forcarEmItens: false
          };
        }
        return {
          ...prev,
          items
        };
      });
      toast.success(`Arma "${itemObj.item}" movida para o card de Armas.`);
    } else if (itemObj.categoria === 'armadura' || itemObj.categoria === 'escudo') {
      // É uma Armadura: move para o card ARMADURAS & ESCUDOS.
      setEditedChar((prev) => {
        const items = prev.items ? [...prev.items] : [];
        const newItems = items.filter((_, idx) => idx !== indexInItems);
        
        const armors = prev.armors ? [...prev.armors] : [];
        armors.push({
          id: `armor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nome: itemObj.item || itemObj.nome || "",
          slot: itemObj.equipamento?.slot || itemObj.slot || "Corpo",
          ip: itemObj.equipamento?.ip !== undefined ? Number(itemObj.equipamento.ip) : (Number(itemObj.ip) || 0),
          penalidade_dex: itemObj.equipamento?.penalidade_dex !== undefined ? Number(itemObj.equipamento.penalidade_dex) : (Number(itemObj.penalidade_dex) || 0),
          penalidade_agi: itemObj.equipamento?.penalidade_agi !== undefined ? Number(itemObj.equipamento.penalidade_agi) : (Number(itemObj.penalidade_agi) || 0),
          isEquipped: false,
          modificador: "",
          obs: itemObj.equipamento?.obs || itemObj.obs || "",
        });

        return {
          ...prev,
          items: newItems,
          armors
        };
      });
      toast.success(`Armadura "${itemObj.item}" movida para o card de Armaduras & Escudos.`);
    }
  };

  const handleMoveWeaponToMochila = (indexInItems: number) => {
    setEditedChar((prev) => {
      const items = prev.items ? [...prev.items] : [];
      if (items[indexInItems]) {
        items[indexInItems] = {
          ...items[indexInItems],
          forcarEmItens: true
        };
      }
      return {
        ...prev,
        items
      };
    });
    toast.success("Arma movida para a mochila (Outros Itens).");
  };

  const handleMoveArmorToMochila = (armorId: string) => {
    setEditedChar((prev) => {
      const armors = prev.armors ? prev.armors.filter((arm) => arm.id !== armorId) : [];
      const armorObj = prev.armors?.find((arm) => arm.id === armorId);
      const items = prev.items ? [...prev.items] : [];
      if (armorObj) {
        items.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          item: armorObj.nome,
          categoria: armorObj.slot === 'escudo' || (armorObj.nome || '').toLowerCase().includes('escudo') ? 'escudo' : 'armadura',
          forcarEmItens: true,
          descricao: armorObj.obs || '',
          slot: armorObj.slot,
          ip: armorObj.ip,
          penalidade_dex: armorObj.penalidade_dex,
          penalidade_agi: armorObj.penalidade_agi,
          modificador: armorObj.modificador,
        });
      }
      return {
        ...prev,
        armors,
        items
      };
    });
    toast.success("Armadura movida para a mochila (Outros Itens).");
  };

  const handleAddArmorFromModal = (catalogItem: any) => {
    const mappedArmor = {
      nome: catalogItem.item || catalogItem.nome || "",
      slot: catalogItem.equipamento?.slot || "",
      ip: catalogItem.equipamento?.ip !== undefined ? Number(catalogItem.equipamento.ip) : 0,
      penalidade_dex: catalogItem.equipamento?.penalidade_dex !== undefined ? Number(catalogItem.equipamento.penalidade_dex) : 0,
      penalidade_agi: catalogItem.equipamento?.penalidade_agi !== undefined ? Number(catalogItem.equipamento.penalidade_agi) : 0,
      obs: catalogItem.equipamento?.obs || catalogItem.obs || "",
    };
    handleAddArmor(mappedArmor);
    triggerItemAddedFeedback(catalogItem.item || catalogItem.nome || "");
  };

  // Items handler
  const handleItemChange = (index: number, val: string) => {
    setEditedChar((prev) => {
      const arr = prev.items ? [...prev.items] : ["", "", "", "", "", ""];
      while (arr.length <= index) {
        arr.push("");
      }
      arr[index] = val;
      return {
        ...prev,
        items: arr,
      };
    });
  };

  // Checkbox campaign genres handler
  const handleCampaignGenreChange = (key: keyof Character['campaignGenres'], val: boolean) => {
    setEditedChar((prev) => ({
      ...prev,
      campaignGenres: {
        ...prev.campaignGenres,
        [key]: val,
      },
    }));
  };

  // Automatically detect the base attribute associated with a skill or return the explicitly chosen baseAttr
  const getSkillAttributeKey = (groupName: string, baseAttr?: string): keyof CharacterAttributes => {
    if (baseAttr) {
      const lower = baseAttr.toLowerCase().trim();
      if (lower === 'dex') return 'des';
      if (['con', 'for', 'des', 'agi', 'int', 'per', 'will', 'car'].includes(lower)) {
        return lower as keyof CharacterAttributes;
      }
    }
    const name = (groupName || '').toLowerCase();
    if (name.includes('esgrima') || name.includes('briga') || name.includes('luta') || name.includes('força') || name.includes('atletismo')) {
      return 'for';
    }
    if (name.includes('arquaria') || name.includes('arremesso') || name.includes('arco') || name.includes('mira') || name.includes('pontaria') || name.includes('pistola') || name.includes('rifle') || name.includes('furto') || name.includes('artesanato') || name.includes('fechadura')) {
      return 'des';
    }
    if (name.includes('furtividade') || name.includes('esquiva') || name.includes('acrobacia') || name.includes('fuga') || name.includes('dança') || name.includes('pilotar') || name.includes('dirigir')) {
      return 'agi';
    }
    if (name.includes('ocultismo') || name.includes('alquimia') || name.includes('conhecimento') || name.includes('história') || name.includes('medicina') || name.includes('ciência') || name.includes('língua') || name.includes('computação')) {
      return 'int';
    }
    if (name.includes('rastrear') || name.includes('percepção') || name.includes('escutar') || name.includes('procurar') || name.includes('sentidos') || name.includes('sobrevivência')) {
      return 'per';
    }
    if (name.includes('vontade') || name.includes('concentração') || name.includes('meditação') || name.includes('resistência')) {
      return 'will';
    }
    if (name.includes('intimidação') || name.includes('lábia') || name.includes('sedução') || name.includes('persuasão') || name.includes('charme') || name.includes('diplomacia') || name.includes('negociação') || name.includes('empatia')) {
      return 'car';
    }
    return 'des'; // Default
  };

  const resolveSkillAttribute = (
    skillName: string,
    baseAttr: string | null | undefined,
    chosenSubgroup: string | undefined,
    subgroups: { nome: string; atributo_subgrupo: string | null }[] | undefined,
    attributes: CharacterAttributes
  ): { resolvedAttrKey: string | null; attrVal: number } => {
    // Check if "Acuide com Arma" is active on a weapon that matches this skill/subgroup
    const hasAcuide = (editedChar.aprimoramentosPositivos || []).some(s =>
      s && (
        s.toLowerCase().includes("acuide com arma") ||
        s.toLowerCase().includes("acuidade com arma") ||
        s.toLowerCase() === "acuide_arma" ||
        s.toLowerCase() === "acuidade_arma"
      )
    );

    let isAcuideWeaponActive = false;
    if (hasAcuide) {
      const skillLower = (skillName || '').toLowerCase();
      const isMeleeSkill = skillLower.includes("armas brancas") && !skillLower.includes("longo alcance");
      const isRangeSkill = skillLower.includes("projetil") || skillLower.includes("projétil") || skillLower.includes("longo alcance");
      
      if (isMeleeSkill || isRangeSkill) {
        const matchedWeapon = (editedChar.items || []).find(item => {
          if (typeof item !== 'object' || item === null) return false;
          if (item.categoria !== 'armas' && item.categoria !== 'arma') return false;
          if (!item.hasAcuideArma) return false;

          const classification = {
            tipo: item.tipo || getWeaponClassification(item.item).tipo,
            subgrupo_arma: item.subgrupo_arma || getWeaponClassification(item.item).subgrupo_arma
          };

          const matchesGroup = isMeleeSkill ? (classification.tipo === "corpo_a_corpo") : (classification.tipo === "longo_alcance");
          const matchesSubgroup = chosenSubgroup && classification.subgrupo_arma && 
            chosenSubgroup.toLowerCase().trim() === classification.subgrupo_arma.toLowerCase().trim();

          return matchesGroup && matchesSubgroup;
        });

        if (matchedWeapon) {
          isAcuideWeaponActive = true;
        }
      }
    }

    if (isAcuideWeaponActive) {
      const agiVal = attributes?.agi ? (Math.round(Number(attributes.agi.valorAmpliado)) || 0) : 0;
      const desVal = attributes?.des ? (Math.round(Number(attributes.des.valorAmpliado)) || 0) : 0;
      const forVal = attributes?.for ? (Math.round(Number(attributes.for.valorAmpliado)) || 0) : 0;

      const maxVal = Math.max(agiVal, desVal, forVal);
      let displayAttr = 'DEX';
      if (maxVal === agiVal) displayAttr = 'AGI';
      else if (maxVal === forVal) displayAttr = 'FOR';

      return { resolvedAttrKey: displayAttr, attrVal: maxVal };
    }

    let resolvedAttr: string | null = null;

    if (chosenSubgroup && subgroups && subgroups.length > 0) {
      const sub = subgroups.find(s => s.nome === chosenSubgroup);
      if (sub) {
        if (sub.atributo_subgrupo !== null) {
          resolvedAttr = sub.atributo_subgrupo;
        } else {
          resolvedAttr = baseAttr || null;
        }
      } else {
        resolvedAttr = baseAttr || null;
      }
    } else {
      resolvedAttr = baseAttr || null;
    }

    if (!resolvedAttr || resolvedAttr === "0" || resolvedAttr === "") {
      return { resolvedAttrKey: null, attrVal: 0 };
    }

    let lowerKey = resolvedAttr.toLowerCase().trim();
    if (lowerKey === 'dex') {
      lowerKey = 'des';
    }

    if (!['con', 'for', 'des', 'agi', 'int', 'per', 'will', 'car'].includes(lowerKey)) {
      lowerKey = getSkillAttributeKey(skillName, lowerKey);
    }

    const attrRow = attributes[lowerKey as keyof CharacterAttributes];
    const attrVal = attrRow ? (Math.round(Number(attrRow.valorAmpliado)) || 0) : 0;

    const displayAttr = lowerKey === 'des' ? 'DEX' : lowerKey.toUpperCase();

    return { resolvedAttrKey: displayAttr, attrVal };
  };

  // Skills table handler
  const handleSkillRowChange = (index: number, field: keyof SkillRow, value: any) => {
    setEditedChar((prev) => {
      const list = [...prev.skills];
      if (!list[index]) {
        list[index] = { group: '', atributo: 0, gasto: 0, total: '0%', baseAttr: 'des' };
      }
      
      let finalValue = value;
      if (field === 'gasto' || field === 'atributo') {
        const strVal = String(value).replace(/[^0-9]/g, '');
        if (strVal === "") {
          finalValue = "";
        } else {
          finalValue = Math.max(0, Math.round(Number(strVal)) || 0);
        }
      }
      
      const updatedRow = {
        ...list[index],
        [field]: finalValue,
      };

      const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
        updatedRow.group,
        updatedRow.baseAttr,
        updatedRow.chosenSubgroup,
        updatedRow.subgrupos,
        prev.attributes
      );
      updatedRow.atributo = attrVal;
      updatedRow.total = updatedRow.requer_ataque_defesa
        ? `${(updatedRow.atkGasto ?? 0) + attrVal}% / ${(updatedRow.defGasto ?? 0) + attrVal}%`
        : `${attrVal + (Math.round(Number(updatedRow.gasto)) || 0)}%`;

      list[index] = updatedRow;

      return {
        ...prev,
        skills: list,
      };
    });
  };

  const handleSkillRowBlur = (index: number, field: keyof SkillRow) => {
    setEditedChar((prev) => {
      const list = [...prev.skills];
      if (!list[index]) return prev;
      
      let finalValue = list[index][field];
      if (field === 'gasto' || field === 'atributo') {
        const numVal = Math.round(Number(list[index][field]));
        finalValue = !isNaN(numVal) ? Math.max(0, numVal) : 0;
      }
      
      const updatedRow = {
        ...list[index],
        [field]: finalValue,
      };

      const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
        updatedRow.group,
        updatedRow.baseAttr,
        updatedRow.chosenSubgroup,
        updatedRow.subgrupos,
        prev.attributes
      );
      updatedRow.atributo = attrVal;
      updatedRow.total = updatedRow.requer_ataque_defesa
        ? `${(updatedRow.atkGasto ?? 0) + attrVal}% / ${(updatedRow.defGasto ?? 0) + attrVal}%`
        : `${attrVal + (Math.round(Number(updatedRow.gasto)) || 0)}%`;

      list[index] = updatedRow;

      return {
        ...prev,
        skills: list,
      };
    });
  };

  // Open Perícias selection modal
  const handleOpenPericiasModal = () => {
    setIsPericiasModalOpen(true);
    setPericiaSearchQuery('');
    setShowCreatePericiaForm(false);
    setNewPericiaName('');
    setNewPericiaAttr('des');
    setNewPericiaDesc('');
    // Load existing skills into local temp state
    setTempSkills(editedChar.skills.map(s => {
      const periciaMeta = mockPericias.find(p => p.nome === s.group || p.nome === s.parentSkillName);
      const isZeroAttr = s.baseAttr === "0" || periciaMeta?.atributo_base === "0" || periciaMeta?.atributo_base === null;
      const subList = s.subgrupos ?? periciaMeta?.subgrupos ?? [];
      return {
        ...s,
        baseAttr: isZeroAttr ? "0" : (s.baseAttr || periciaMeta?.atributo_base?.toLowerCase() || 'des'),
        parentSkillName: s.parentSkillName || periciaMeta?.nome || s.group,
        subgrupos: subList,
        chosenSubgroup: s.chosenSubgroup ?? (subList.length > 0 ? subList[0].nome : undefined),
        requer_ataque_defesa: s.requer_ataque_defesa ?? periciaMeta?.requer_ataque_defesa ?? false,
        atkGasto: s.atkGasto ?? 0,
        defGasto: s.defGasto ?? 0,
        isCustomBuild: s.isCustomBuild ?? false,
        sliderVal: s.sliderVal ?? 50,
        pointsToInsert: s.pointsToInsert ?? (s.isCustomBuild ? 0 : (Number(s.gasto) || 0))
      };
    }));
  };

  // Add pre-defined skill to the temporary list
  const handleAddSelectedSkill = (nome: string, baseAttrKey: string) => {
    const isZeroAttr = baseAttrKey === '0' || baseAttrKey === null || baseAttrKey === undefined;
    const baseAttrLow = isZeroAttr ? '0' : baseAttrKey.toLowerCase();

    const bibliotecaLevel = getBibliotecaLevel(editedChar.aprimoramentosPositivos);
    const hasBiblioteca = bibliotecaLevel !== null;
    const isLibSkill = isLibrarySkillName(nome);

    if (!isLibSkill || !hasBiblioteca) {
      if (tempSkills.some(s => s.group.toLowerCase().trim() === nome.toLowerCase().trim())) {
        return;
      }
    } else {
      const maxSub = getBibliotecaSubgroupLimit(bibliotecaLevel);
      const currentSpecialCount = tempSkills.filter(s => isLibrarySkillName(s.group)).length;
      if (currentSpecialCount >= maxSub) {
        toast.error(`Biblioteca nível ${bibliotecaLevel} permite no máximo ${maxSub} subgrupos no total.`);
        return;
      }
    }

    const periciaMeta = mockPericias.find(p => p.nome === nome);
    const subList = periciaMeta?.subgrupos ?? [];

    // Find the first subgroup that is not yet added
    let defaultSub = subList.length > 0 ? subList[0].nome : undefined;
    if (isLibSkill && hasBiblioteca) {
      const alreadyChosenSubsForThisSkill = tempSkills
        .filter(s => s.group.toLowerCase().trim() === nome.toLowerCase().trim())
        .map(s => s.chosenSubgroup);
      const nextAvailableSub = subList.find(sub => !alreadyChosenSubsForThisSkill.includes(sub.nome || sub))?.nome;
      if (nextAvailableSub) {
        defaultSub = nextAvailableSub;
      }
    }

    const reqAtkDef = periciaMeta?.requer_ataque_defesa ?? false;

    const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
      nome,
      baseAttrLow === '0' ? null : baseAttrLow,
      defaultSub,
      subList,
      editedChar.attributes
    );

    const racialFree = getRacialFreePointsForSkill(nome, defaultSub, editedChar.race, racasData);
    const initialAtk = reqAtkDef ? Math.round(racialFree / 2) : 0;
    const initialDef = reqAtkDef ? racialFree - initialAtk : 0;

    setTempSkills((prev) => [
      ...prev,
      {
        group: nome,
        atributo: attrVal,
        gasto: racialFree,
        total: reqAtkDef
          ? `${initialAtk + attrVal}% / ${initialDef + attrVal}%`
          : `${attrVal + racialFree}%`,
        baseAttr: baseAttrLow,
        parentSkillName: nome,
        subgrupos: subList,
        chosenSubgroup: defaultSub,
        requer_ataque_defesa: reqAtkDef,
        isCustomBuild: false,
        sliderVal: 50,
        pointsToInsert: racialFree,
        atkGasto: initialAtk,
        defGasto: initialDef,
        pontosGratis: racialFree
      }
    ]);
  };

  // Create custom skill and add to the temporary list
  const handleCreateCustomSkill = () => {
    if (!newPericiaName || !newPericiaName.trim()) {
      toast.error('O nome da perícia é obrigatório.');
      return;
    }

    const name = newPericiaName.trim();
    if (tempSkills.some(s => s.group.toLowerCase().trim() === name.toLowerCase().trim())) {
      toast.error('Essa perícia já foi selecionada.');
      return;
    }

    const isZeroAttr = newPericiaAttr === '0';
    const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
      name,
      isZeroAttr ? null : newPericiaAttr,
      undefined,
      [],
      editedChar.attributes
    );

    setTempSkills((prev) => [
      ...prev,
      {
        group: name,
        atributo: attrVal,
        gasto: 0,
        total: `${attrVal}%`,
        baseAttr: newPericiaAttr,
        parentSkillName: name,
        subgrupos: [],
        chosenSubgroup: undefined,
        requer_ataque_defesa: false,
        isCustomBuild: false,
        sliderVal: 50,
        pointsToInsert: 0,
        atkGasto: 0,
        defGasto: 0
      }
    ]);

    // Reset create form
    setNewPericiaName('');
    setNewPericiaDesc('');
    setShowCreatePericiaForm(false);

    toast.success('Perícia personalizada criada com sucesso!');
  };

  // Update temporary skill row (gasto input change)
  const handleTempSkillGastoChange = (index: number, val: any) => {
    setTempSkills((prev) => {
      const list = [...prev];
      if (!list[index]) return prev;

      let finalValue = val;
      const strVal = String(val).replace(/[^0-9]/g, '');
      if (strVal === "") {
        finalValue = "";
      } else {
        finalValue = Math.max(0, Math.round(Number(strVal)) || 0);
      }

      const item = list[index];
      const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
        item.group,
        item.baseAttr,
        item.chosenSubgroup,
        item.subgrupos,
        editedChar.attributes
      );

      const minGasto = Number(item.pontosGratis) || 0;
      let nextGasto = Math.max(minGasto, Number(finalValue) || 0);
      let nextAtk = item.atkGasto ?? 0;
      let nextDef = item.defGasto ?? 0;

      if (item.requer_ataque_defesa) {
        if (!item.isCustomBuild) {
          const sliderVal = item.sliderVal ?? 50;
          nextAtk = Math.round(nextGasto * (sliderVal / 100));
          nextDef = nextGasto - nextAtk;
        }
      }

      list[index] = {
        ...item,
        gasto: nextGasto,
        pointsToInsert: nextGasto,
        atkGasto: nextAtk,
        defGasto: nextDef,
        atributo: attrVal,
        total: item.requer_ataque_defesa
          ? `${nextAtk + attrVal}% / ${nextDef + attrVal}%`
          : `${attrVal + nextGasto}%`
      };
      return list;
    });
  };

  // Remove temporary skill row
  const handleRemoveTempSkill = (index: number) => {
    setTempSkills((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Commit changes from temporary list to character skills
  const handleSavePericiasModal = () => {
    setEditedChar((prev) => ({
      ...prev,
      skills: tempSkills.map(s => {
        const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
          s.group,
          s.baseAttr,
          s.chosenSubgroup,
          s.subgrupos,
          prev.attributes
        );
        
        let finalGasto = Number(s.gasto) || 0;
        let finalAtk = s.atkGasto ?? 0;
        let finalDef = s.defGasto ?? 0;

        if (s.requer_ataque_defesa) {
          if (s.isCustomBuild) {
            finalGasto = finalAtk + finalDef;
          } else {
            finalGasto = Number(s.pointsToInsert) || 0;
            const sliderVal = s.sliderVal ?? 50;
            finalAtk = Math.round(finalGasto * (sliderVal / 100));
            finalDef = finalGasto - finalAtk;
          }
        }

        const nextRacialFree = getRacialFreePointsForSkill(s.group, s.chosenSubgroup, prev.race, racasData);
        const finalGastoClamped = Math.max(nextRacialFree, finalGasto);

        const totalVal = s.requer_ataque_defesa 
          ? `${finalAtk + attrVal}% / ${finalDef + attrVal}%`
          : `${attrVal + finalGastoClamped}%`;

        return {
          ...s,
          pontosGratis: nextRacialFree,
          gasto: finalGastoClamped,
          atributo: attrVal,
          total: totalVal,
          atkGasto: finalAtk,
          defGasto: finalDef,
        };
      })
    }));
    setIsPericiasModalOpen(false);
  };

  // Treasure tracker handler
  const handleTreasureChange = (key: 'ouro' | 'prata' | 'bronze', val: any) => {
    setEditedChar((prev) => {
      let finalVal = val;
      const strVal = String(val).replace(/[^0-9]/g, '');
      if (strVal === "") {
        finalVal = "";
      } else {
        finalVal = Math.max(0, Math.round(Number(strVal)) || 0);
      }
      return {
        ...prev,
        treasure: {
          ...prev.treasure,
          [key]: finalVal,
        },
      };
    });
  };

  const handleTreasureBlur = (key: 'ouro' | 'prata' | 'bronze') => {
    setEditedChar((prev) => {
      const currentVal = prev.treasure[key];
      let finalValue = 0;
      const numVal = Math.round(Number(currentVal));
      if (!isNaN(numVal)) {
        finalValue = Math.max(0, numVal);
      }
      return {
        ...prev,
        treasure: {
          ...prev.treasure,
          [key]: finalValue,
        },
      };
    });
  };

  // Save mechanism
  const triggerSave = () => {
    let finalChar = cleanCharacterForSaving(editedChar);
    // Assign a random ID if registering a new character
    if (!finalChar.id) {
      finalChar.id = `char-${Date.now()}`;
    }
    const conPts = Number(finalChar.attributes?.con?.pontosGastos) || 0;
    const forPts = Number(finalChar.attributes?.for?.pontosGastos) || 0;
    if (finalChar.statusPoints?.vida) {
      finalChar.statusPoints.vida.valorFinal = Math.ceil((conPts + forPts) / 2);
    }

    const willPts = Number(finalChar.attributes?.will?.pontosGastos) || 0;
    if (finalChar.statusPoints?.psi) {
      finalChar.statusPoints.psi.valorFinal = 100 + willPts;
    }

    onSave(finalChar);
  };

  const handleCustomPortraitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPortrait.trim()) {
      handleDemographicChange('portraitUrl', customPortrait.trim());
      setCustomPortrait('');
      setShowPortraitSelector(false);
    }
  };

  const conPts = Number(editedChar.attributes?.con?.pontosGastos) || 0;
  const forPts = Number(editedChar.attributes?.for?.pontosGastos) || 0;
  const calculatedHP = Math.ceil((conPts + forPts) / 2) + extraPvBonus;

  const willPts = Number(editedChar.attributes?.will?.pontosGastos) || 0;
  const calculatedSanidade = 100 + willPts;

  const isMagicCharacter = (() => {
    const MAGIC_CLASSES = ['mago', 'feiticeiro', 'bardo', 'clérigo', 'clerigo', 'druida', 'paladino', 'bruxo'];
    const classLower = (editedChar.classKit || '').toLowerCase().trim();
    if (MAGIC_CLASSES.includes(classLower)) {
      return true;
    }
    const PREDEFINED_CLASSES = [
      'bárbaro', 'barbaro', 'bardo', 'clérigo', 'clerigo', 'druida', 'feiticeiro', 'guerreiro', 'lutador / arqueiro', 'ladino', 'mago', 'bruxo', 'monge', 'paladino', 'ranger'
    ];
    const isPredefined = PREDEFINED_CLASSES.includes(classLower);
    if (!isPredefined || classLower === 'outro') {
      return !!editedChar.isMagic;
    }
    return false;
  })();

  // Initialize focus allocation temporary states when Grimório is opened
  useEffect(() => {
    if (isGrimorioModalOpen && isMagicCharacter) {
      const alloc = editedChar.focusAllocation || { criar: 0, controlar: 0, entender: 0, caminhoNome: 'Luz', caminhoValor: 0 };
      setTempFocusCriar(Number(alloc.criar) || 0);
      setTempFocusControlar(Number(alloc.controlar) || 0);
      setTempFocusEntender(Number(alloc.entender) || 0);
      setTempFocusCaminhoNome(alloc.caminhoNome || 'Luz');
      setTempFocusCaminhoValor(Number(alloc.caminhoValor) || 0);
      
      let initialCaminhos = alloc.caminhos || [];
      if (initialCaminhos.length === 0) {
        initialCaminhos = [{ nome: alloc.caminhoNome || 'Luz', valor: Number(alloc.caminhoValor) || 0 }];
      }
      setTempCaminhos(initialCaminhos.map(c => ({ ...c })));
    }
  }, [isGrimorioModalOpen, isMagicCharacter]);

  // Find current level of Poderes Mágicos
  const poderesMagicosLevel = (() => {
    for (const item of cleanAprimoramentosPositivos) {
      if (item.toLowerCase().includes('poderes mágicos') || item.toLowerCase().includes('poderes magicos')) {
        const match = item.match(/(?:Nível|Nivel)\s*(\d+)/i);
        if (match) return parseInt(match[1], 10);
        return 1;
      }
    }
    return 0;
  })();

  // Find current level of Pontos de Fé
  const pontosFeLevel = (() => {
    for (const item of cleanAprimoramentosPositivos) {
      if (item.toLowerCase().includes('pontos de fé') || item.toLowerCase().includes('pontos de fe')) {
        const match = item.match(/(?:Nível|Nivel)\s*(\d+)/i);
        if (match) return parseInt(match[1], 10);
        return 1;
      }
    }
    return 0;
  })();

  // Calculate bonuses
  let poderesMagicosFocusBonus = 0;
  let pmBonus = 0;
  if (poderesMagicosLevel === 1) { poderesMagicosFocusBonus = 2; pmBonus = 1; }
  else if (poderesMagicosLevel === 2) { poderesMagicosFocusBonus = 3; pmBonus = 2; }
  else if (poderesMagicosLevel === 3) { poderesMagicosFocusBonus = 5; pmBonus = 3; }
  else if (poderesMagicosLevel === 4) { poderesMagicosFocusBonus = 7; pmBonus = 5; }
  else if (poderesMagicosLevel === 5) { poderesMagicosFocusBonus = 9; pmBonus = 7; }

  let pontosFeFocusBonus = 0;
  if (pontosFeLevel === 1) { pontosFeFocusBonus = 1; }
  else if (pontosFeLevel === 2) { pontosFeFocusBonus = 2; }
  else if (pontosFeLevel === 3) { pontosFeFocusBonus = 3; }
  else if (pontosFeLevel === 4) { pontosFeFocusBonus = 5; }
  else if (pontosFeLevel === 5) { pontosFeFocusBonus = 7; }

  const baseFocusPoints = isMagicCharacter ? 1 : 0;
  const totalFocusPoints = baseFocusPoints + poderesMagicosFocusBonus + pontosFeFocusBonus + extraFocusBonus;

  // Derived Focus Allocation variables for the submodal
  const totalPathsTempFocus = tempCaminhos.reduce((sum, c) => sum + (Number(c.valor) || 0), 0);
  const currentTotalTempFocus = tempFocusCriar + tempFocusControlar + tempFocusEntender + totalPathsTempFocus;
  const isFocusAllocationOverspent = currentTotalTempFocus > totalFocusPoints;
  const hasAtLeastOneForm = tempFocusCriar > 0 || tempFocusControlar > 0 || tempFocusEntender > 0;
  const hasAtLeastOnePath = tempCaminhos.some(c => (Number(c.valor) || 0) > 0);
  const isFocusAllocationSaveDisabled = isFocusAllocationOverspent || !hasAtLeastOneForm || !hasAtLeastOnePath;

  const savedAlloc = editedChar.focusAllocation;
  const savedTotalForms = (Number(savedAlloc?.criar) || 0) + (Number(savedAlloc?.controlar) || 0) + (Number(savedAlloc?.entender) || 0);
  const savedCaminhos = savedAlloc?.caminhos || [];
  const savedTotalPaths = savedCaminhos.reduce((sum, c) => sum + (Number(c.valor) || 0), 0);
  const totalSavedFocus = savedTotalForms + savedTotalPaths;
  const isSavedAllocationValid = totalSavedFocus > 0 && totalSavedFocus <= totalFocusPoints && savedTotalForms > 0 && savedTotalPaths > 0;

  useEffect(() => {
    if (isGrimorioModalOpen) {
      setIsFocusAllocationExpanded(!isSavedAllocationValid);
    }
  }, [isGrimorioModalOpen, isSavedAllocationValid]);

  const intVal = Number(editedChar.attributes?.int?.valorAmpliado ?? 0) || 0;
  const willVal = Number(editedChar.attributes?.will?.valorAmpliado ?? 0) || 0;
  const perVal = Number(editedChar.attributes?.per?.valorAmpliado ?? 0) || 0;
  const calculatedMP = isMagicCharacter ? (intVal + willVal + perVal + pmBonus + extraPmBonus) : 0;

  // Sync calculated MP and Focus points back to character statusPoints
  useEffect(() => {
    if (!isMagicCharacter) return;
    
    const needsUpdate = 
      Number(editedChar.statusPoints?.magia?.valorFinal ?? 0) !== calculatedMP || 
      Number(editedChar.statusPoints?.fe?.valorFinal ?? 0) !== totalFocusPoints;

    if (needsUpdate) {
      setEditedChar(prev => {
        const normalized = normalizeCharacter(prev);
        return {
          ...normalized,
          statusPoints: {
            ...normalized.statusPoints,
            magia: {
              ...normalized.statusPoints.magia,
              valorFinal: calculatedMP
            },
            fe: {
              ...normalized.statusPoints.fe,
              valorFinal: totalFocusPoints
            }
          }
        };
      });
    }
  }, [isMagicCharacter, calculatedMP, totalFocusPoints, editedChar.statusPoints?.magia?.valorFinal, editedChar.statusPoints?.fe?.valorFinal]);

  // Inject default enhancements based on class selection
  useEffect(() => {
    if (isLocked) return; // Only when editing is unlocked or creating a new character
    
    const classLower = (editedChar.classKit || '').toLowerCase().trim();
    const isMagoFeiticeiroBruxoBardoDruida = ['mago', 'feiticeiro', 'bruxo', 'bardo', 'druida'].includes(classLower);
    const isPaladinoClerigo = ['paladino', 'clérigo', 'clerigo'].includes(classLower);

    setEditedChar(prev => {
      let updatedPositives = [...(prev.aprimoramentosPositivos || [])].filter(s => s && s.trim());
      let changed = false;

      if (isMagoFeiticeiroBruxoBardoDruida) {
        const hasPoderes = updatedPositives.some(s => s.toLowerCase().includes('poderes mágicos') || s.toLowerCase().includes('poderes magicos'));
        if (!hasPoderes) {
          // Remove Pontos de Fé to avoid conflict
          updatedPositives = updatedPositives.filter(s => !s.toLowerCase().includes('pontos de fé') && !s.toLowerCase().includes('pontos de fe'));
          updatedPositives.push("Poderes Mágicos Nível 1");
          changed = true;
        }
      } else if (isPaladinoClerigo) {
        const hasPontosFe = updatedPositives.some(s => s.toLowerCase().includes('pontos de fé') || s.toLowerCase().includes('pontos de fe'));
        if (!hasPontosFe) {
          // Remove Poderes Mágicos to avoid conflict
          updatedPositives = updatedPositives.filter(s => !s.toLowerCase().includes('poderes mágicos') && !s.toLowerCase().includes('poderes magicos'));
          updatedPositives.push("Pontos de Fé Nível 1");
          changed = true;
        }
      } else if (prev.isMagic) {
        const hasPoderes = updatedPositives.some(s => s.toLowerCase().includes('poderes mágicos') || s.toLowerCase().includes('poderes magicos'));
        const hasPontosFe = updatedPositives.some(s => s.toLowerCase().includes('pontos de fé') || s.toLowerCase().includes('pontos de fe'));
        if (!hasPoderes && !hasPontosFe) {
          updatedPositives.push("Poderes Mágicos Nível 1");
          changed = true;
        }
      }

      if (changed) {
        return {
          ...prev,
          aprimoramentosPositivos: updatedPositives
        };
      }
      return prev;
    });
  }, [editedChar.classKit, editedChar.isMagic, isLocked]);

  return (
    <div className="space-y-8 pb-32 max-w-7xl mx-auto px-1">

      {(editedChar.isPendingDMReview || characters.find((c) => c.id === characterId)?.isPendingDMReview) && userRole === 'dm' && (
        <div className={`transition-all duration-300 p-4 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border ${
          fichaAnimStatus === 'approving'
            ? 'bg-[#1b4332] border-[#52b788]'
            : fichaAnimStatus === 'rejecting'
            ? 'bg-[#591e1e] border-primary'
            : 'bg-[#3e2723] border-[#ffe082]'
        }`}>
          <div className="space-y-1">
            <h4 className={`font-serif text-base font-bold uppercase tracking-widest flex items-center gap-2 ${
              fichaAnimStatus === 'approving'
                ? 'text-green-300'
                : fichaAnimStatus === 'rejecting'
                ? 'text-red-300'
                : 'text-[#ffe082]'
            }`}>
              {fichaAnimStatus === 'approving' ? (
                <>
                  <span className="material-symbols-outlined text-green-400">check_circle</span>
                  Alterações Aprovadas
                </>
              ) : fichaAnimStatus === 'rejecting' ? (
                <>
                  <span className="material-symbols-outlined text-red-400">cancel</span>
                  Alterações Reprovadas
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-secondary animate-pulse">warning</span>
                  Análise de Alterações Pendente
                </>
              )}
            </h4>
            {fichaAnimStatus === 'idle' && (
              <p className="text-xs font-sans text-amber-200/80 leading-relaxed">
                O jogador enviou solicitações de alteração para esta ficha. Os campos alterados estão destacados em <span className="text-secondary font-bold underline decoration-dotted">Dourado / Amarelo</span> para facilitar sua identificação.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={fichaAnimStatus !== 'idle'}
              onClick={handleRejectWithAnim}
              className={`px-4 py-2 text-xs font-sans uppercase font-bold transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed ${
                fichaAnimStatus === 'approving'
                  ? 'bg-red-950/20 border-red-500/10 text-red-500/40'
                  : 'bg-red-700 hover:bg-red-800 text-white dark:bg-red-950/80 dark:hover:bg-red-900 dark:text-red-300 border border-red-500/40 shadow-sm'
              }`}
            >
              Rejeitar Mudanças
            </button>
            <button
              type="button"
              disabled={fichaAnimStatus !== 'idle'}
              onClick={handleApproveWithAnim}
              className={`px-4 py-2 text-xs font-sans uppercase font-bold transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed ${
                fichaAnimStatus === 'rejecting'
                  ? 'bg-green-950/20 border-green-500/10 text-green-500/40'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-green-950/80 dark:hover:bg-green-900 dark:text-green-300 border border-green-500/40 shadow-sm'
              }`}
            >
              Aprovar Ficha
            </button>
          </div>
        </div>
      )}

      {(editedChar.isPendingDMReview || characters.find((c) => c.id === characterId)?.isPendingDMReview) && userRole === 'player' && (
        <div className="bg-amber-950/20 border border-amber-500/30 p-4 text-left flex flex-col sm:flex-row sm:items-center gap-3.5 shadow-md">
          <span className="material-symbols-outlined text-amber-500 animate-pulse text-2xl shrink-0 self-start sm:self-center">pending_actions</span>
          <div className="space-y-1">
            <h4 className="font-serif text-sm text-secondary font-bold uppercase tracking-widest">
              Aguardando Aprovação do Mestre
            </h4>
            <p className="text-xs font-sans text-on-surface-variant/80 leading-relaxed">
              Você realizou alterações nesta ficha. Elas foram enviadas para o mestre e estão aguardando aprovação.
            </p>
          </div>
        </div>
      )}

      {/* Editor Main Header Bar */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low border border-outline-variant p-4">
        {/* Left Side: Title (Mobile only) and Left Aligned Actions (Tablet/PC) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto sm:justify-start">
          <h2 className="font-serif text-2xl text-on-surface font-medium sm:hidden">
            {characterId ? 'Editar Ficha' : 'Novo Personagem'}
          </h2>

          {/* Livro button (Como jogar / Regras de criação) - Left aligned on Tablet/PC */}
          <ActionButton
            type="button"
            onClick={() => isNew ? setIsRegrasCriacaoModalOpen(true) : setIsComoJogarModalOpen(true)}
            icon={BookOpen}
            label="Regras"
            variant="secondary"
            size="sm"
            title={isNew ? "Regras de criação" : "Como jogar"}
          />

          {/* Grimório button - Left aligned on Tablet/PC */}
          {isMagicCharacter && (
            <ActionButton
              type="button"
              onClick={() => setIsGrimorioModalOpen(true)}
              icon={BookMarked}
              label="Grimório"
              variant="blue"
              size="sm"
              title="Grimório de Feitiços"
              className={hasGrimorioOrFocusChanges ? "relative ring-2 ring-amber-500/80" : "relative"}
            >
              {hasGrimorioOrFocusChanges && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500 border-2 border-[#1c1b1b] rounded-full animate-pulse" />
              )}
            </ActionButton>
          )}

          {/* Botão de Edição - Left aligned on Tablet/PC - Only if character already exists */}
          {characterId && userRole !== 'dm' && (
            <ActionButton
              type="button"
              disabled={!!(editedChar?.isPendingDMReview || characters.find((c) => c.id === characterId)?.isPendingDMReview)}
              onClick={() => {
                if (editedChar?.isPendingDMReview || characters.find((c) => c.id === characterId)?.isPendingDMReview) {
                  return;
                }
                const nextLocked = !isLocked;
                setIsLocked(nextLocked);
                if (!nextLocked) {
                  // Unlocking: load pendingChanges merged with match
                  const match = characters.find((c) => c.id === characterId);
                  if (match) {
                    const toLoad = match.pendingChanges
                      ? {
                          ...match,
                          ...match.pendingChanges,
                          id: match.id,
                          name: match.pendingChanges.name ?? match.name,
                          race: match.pendingChanges.race ?? match.race,
                          classKit: match.pendingChanges.classKit ?? match.classKit,
                          level: match.pendingChanges.level ?? match.level,
                          xp: match.pendingChanges.xp ?? match.xp,
                          portraitUrl: match.portraitUrl,
                          campaignId: match.campaignId,
                          userId: match.userId,
                          isPendingDMReview: match.isPendingDMReview,
                          pendingChanges: match.pendingChanges,
                        }
                      : match;
                    setEditedChar(normalizeCharacter(toLoad));
                  }
                  toast.warning('Essas mudanças não são oficiais. O seu DM precisa analisar e validar.');
                } else {
                  // Locking: load match (approved)
                  const match = characters.find((c) => c.id === characterId);
                  if (match) {
                    setEditedChar(normalizeCharacter(match));
                  }
                }
              }}
              icon={!isLocked ? Unlock : Edit}
              label={
                (editedChar?.isPendingDMReview || characters.find((c) => c.id === characterId)?.isPendingDMReview)
                  ? 'Em Análise pelo Mestre'
                  : (!isLocked ? 'Bloquear Edição' : 'Editar Ficha')
              }
              variant={!isLocked ? 'primary' : 'secondary'}
              size="sm"
            />
          )}

          {/* Botão de Download - Left aligned on Tablet/PC - Only if character already exists */}
          {characterId && (
            <ActionButton
              type="button"
              onClick={handleExportCharacter}
              icon={Download}
              label="Download"
              variant="secondary"
              size="sm"
              title="Exportar Personagem"
            />
          )}

          {/* Campaign Selector on PC/Tablet (Menu Superior) */}
          <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/60 px-2.5 py-0.5 rounded-sm min-w-[210px] max-w-[280px]">
            <span className="material-symbols-outlined text-primary text-base shrink-0" title="Campanha">map</span>
            <div className="flex-1 min-w-0">
              <CustomSelect
                value={editedChar.campaignId || ''}
                onChange={(e) => handleCampaignChange(e.target.value)}
                placeholder="Sem Campanha"
                disabled={userRole === 'dm'}
                size="sm"
                variant="ghost"
                buttonClassName={`py-1 px-1 text-xs text-on-surface ${userRole === 'dm' ? 'opacity-80 cursor-not-allowed' : ''}`}
                options={[
                  { value: '', label: 'Sem Campanha' },
                  ...availableCampaigns.map((c) => ({
                    value: c.id,
                    label: c.name,
                    description: c.isDm ? 'Mestre' : (c.universo || 'Jogador')
                  }))
                ]}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Deletar Button (Far right on Tablet/PC) */}
        {characterId && userRole !== 'dm' && (
          <div className="flex sm:justify-end w-full sm:w-auto">
            <DeleteButton
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              label="Deletar"
              variant="danger"
              size="sm"
              title="Apagar Personagem"
            />
          </div>
        )}
      </div>

      {/* Banner de Evolução por XP */}
      {justLeveledUp && userRole === 'player' ? (
        <div className="mb-6 p-4 bg-emerald-950/90 border-2 border-emerald-500/70 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 rounded-none animate-fadeIn backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-2xl animate-bounce">celebration</span>
            <div className="text-left">
              <h4 className="font-serif text-sm text-emerald-400 uppercase tracking-wider font-bold">
                Seu personagem evoluiu!
              </h4>
              <p className="font-sans text-[11px] text-emerald-100/90 leading-relaxed">
                Edite a ficha pra ver seus pontos disponíveis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setJustLeveledUp(false);
              if (characterId && editedChar) {
                try {
                  const storedStr = localStorage.getItem('character_seen_states');
                  const states = storedStr ? JSON.parse(storedStr) : {};
                  states[characterId] = {
                    level: Number(editedChar.level) || 1,
                    isPendingDMReview: !!editedChar.isPendingDMReview
                  };
                  localStorage.setItem('character_seen_states', JSON.stringify(states));
                } catch (e) {
                  console.error("Error writing seen state on dismiss:", e);
                }
              }
            }}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none border border-emerald-400/50 shadow-md"
          >
            OK
          </button>
        </div>
      ) : isReadyToLevelUp ? (
        <div className="mb-6 p-4 bg-amber-950/90 border-2 border-amber-500/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 rounded-none animate-fadeIn backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl animate-bounce">arrow_circle_up</span>
            <div className="text-left">
              <h4 className="font-serif text-sm text-amber-300 uppercase tracking-wider font-bold">
                Pronto para Evoluir!
              </h4>
              <p className="font-sans text-[11px] text-amber-100/90 leading-relaxed">
                Este personagem atingiu o XP necessário para o <strong className="text-amber-300 font-bold">Nível {nextL}</strong> ({xpNeededForNext} XP)!
                {userRole === 'dm' 
                  ? " Como Mestre, você pode aprovar a evolução e liberar os novos pontos bônus."
                  : " Aguardando aprovação do Mestre para evoluir."}
              </p>
            </div>
          </div>
          {userRole === 'dm' && (
            <button
              type="button"
              onClick={() => setShowLevelUpConfirmModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-lime-500 text-black font-sans text-xs font-bold uppercase tracking-wider hover:bg-lime-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg border border-lime-300/60 shrink-0 rounded-none active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Aprovar Evolução</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Fieldset lock controller */}
      <div className="sheet-responsive-container space-y-8">
        <fieldset className="border-none p-0 m-0 disabled:opacity-95 space-y-8 block sheet-fieldset">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch items-start sheet-main-grid">
            {/* Left main columns: Demographics, Attributes & Secondary stats */}
            <div className="lg:col-span-8 space-y-8 bg-surface-container border border-outline-variant p-4 sm:p-6 md:p-8 parchment-texture sheet-left-col">
              {/* Section: Demographics */}
              <div className="grid grid-cols-12 gap-x-4 gap-y-6 sheet-block-basic-data">
            <div className={highlightClass('name', `col-span-12 border-b ${validationErrors.includes('name') || fieldErrors.name ? 'border-primary border-b-2 bg-primary/10 px-2' : 'border-outline-variant'} pb-1 flex flex-col transition-all duration-300 px-1`)}>
              <div className="flex items-baseline w-full">
                <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">NOME</label>
                <input maxLength={50}
                  type="text"
                  disabled={isCoreLocked}
                  value={editedChar.name ?? ''}
                  onChange={(e) => handleDemographicChange('name', e.target.value)}
                  placeholder=""
                  className={`w-full bg-transparent border-none p-0 font-serif text-primary text-xl font-bold focus:ring-0 outline-none disabled:opacity-75 ${(editedChar.name || '').length >= 50 ? '!text-red-500' : ''}`}
                />
              </div>
              {(editedChar.name || '').length >= 50 && (
                <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
                  Limite atingido (50)
                </div>
              )}
              {renderFieldError('name')}
            </div>

            <div className={highlightClass('sex', `col-span-12 sm:col-span-4 border-b ${validationErrors.includes('sex') ? 'border-red-500 border-b-2 bg-red-500/10 px-2' : 'border-outline-variant'} pb-1 flex flex-col justify-end min-h-11 transition-all duration-300 px-1`)}>
              <div className="flex items-baseline w-full">
                <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">SEXO</label>
                {isCoreLocked ? (
                  <input
                    type="text"
                    value={editedChar.sex ?? ''}
                    readOnly
                    disabled
                    className="w-full bg-transparent border-none p-0 text-on-surface font-sans text-sm focus:ring-0 outline-none"
                  />
                ) : (
                  <CustomSelect
                    value={['Masculino', 'Feminino'].includes(editedChar.sex) ? editedChar.sex : (editedChar.sex ? 'Outro' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Outro') {
                        handleDemographicChange('sex', 'Outro');
                      } else {
                        handleDemographicChange('sex', val);
                      }
                    }}
                    variant="sheet"
                    placeholder="Selecione..."
                    options={[
                      { value: "", label: "Selecione..." },
                      { value: "Masculino", label: "Masculino" },
                      { value: "Feminino", label: "Feminino" },
                      { value: "Outro", label: "Outro..." }
                    ]}
                  />
                )}
              </div>
              {!isCoreLocked && (editedChar.sex === 'Outro' || (editedChar.sex && !['Masculino', 'Feminino'].includes(editedChar.sex))) && (
                <>
                <>
<input maxLength={50}
                  type="text"
                  value={editedChar.sex === 'Outro' ? '' : editedChar.sex}
                  onChange={(e) => handleDemographicChange('sex', e.target.value)}
                  placeholder="Especifique o sexo..."
                  className={`w-full bg-transparent border-none p-0 text-amber-100 font-sans text-xs focus:ring-0 outline-none mt-1 border-b border-outline-variant/40 ${editedChar.sex?.length >= 50 ? '!text-red-500 !font-bold' : ''} ${editedChar.sex?.length >= 50 ? '!text-red-500' : ''}`}
                />
{editedChar.sex?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
              </>
              )}
            </div>

            <div className={highlightClass('race', `col-span-12 sm:col-span-8 border-b ${validationErrors.includes('race') ? 'border-red-500 border-b-2 bg-red-500/10 px-2' : 'border-outline-variant'} pb-1 flex flex-col justify-end min-h-11 transition-all duration-300 px-1`)}>
              <div className="flex items-baseline w-full">
                <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">RAÇA</label>
                {isCoreLocked ? (
                  <input
                    type="text"
                    value={editedChar.race ?? ''}
                    readOnly
                    disabled
                    className="w-full bg-transparent border-none p-0 text-on-surface font-sans text-sm focus:ring-0 outline-none"
                  />
                ) : (
                  <CustomSelect
                    value={['Humano', 'Anão', 'Elfo', 'Gnomo', 'Meio-Elfo', 'Halfling'].includes(editedChar.race) ? editedChar.race : (editedChar.race ? 'Outro' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Outro') {
                        handleDemographicChange('race', 'Outro');
                      } else {
                        handleDemographicChange('race', val);
                      }
                    }}
                    variant="sheet"
                    placeholder="Selecione..."
                    options={[
                      { value: "", label: "Selecione..." },
                      { value: "Humano", label: "Humano" },
                      { value: "Anão", label: "Anão" },
                      { value: "Elfo", label: "Elfo" },
                      { value: "Gnomo", label: "Gnomo" },
                      { value: "Meio-Elfo", label: "Meio-Elfo" },
                      { value: "Halfling", label: "Halfling" },
                      { value: "Outro", label: "Outro..." }
                    ]}
                  />
                )}
              </div>
              {!isCoreLocked && (editedChar.race === 'Outro' || (editedChar.race && !['Humano', 'Anão', 'Elfo', 'Gnomo', 'Meio-Elfo', 'Halfling'].includes(editedChar.race))) && (
                <>
<>
<input maxLength={50}
                  type="text"
                  value={editedChar.race === 'Outro' ? '' : (editedChar.race ?? '')}
                  onChange={(e) => handleDemographicChange('race', e.target.value)}
                  placeholder="Especifique a raça..."
                  className={`${(editedChar.race || '').length >= 50 ? '!text-red-500 !font-bold' : ''} w-full bg-transparent border-none p-0 text-amber-100 font-sans text-xs focus:ring-0 outline-none mt-1 border-b border-outline-variant/40 ${(editedChar.race || '').length >= 50 ? '!text-red-500' : ''}`}
                />
{(editedChar.race || '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
              </>
              )}
            </div>

            <div className={highlightClass('weight', "col-span-12 sm:col-span-4 border-b border-outline-variant pb-1 flex items-baseline px-1")}>
              <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">PESO</label>
              <input
                type="text"
                inputMode="numeric"
                disabled={isCoreLocked}
                value={editedChar.weight || ''}
                onChange={(e) => handleDemographicChange('weight', e.target.value.replace(/\D/g, ''))}
                placeholder=""
                className="w-full bg-transparent border-none p-0 text-on-surface font-mono text-sm focus:ring-0 outline-none"
              />
              
              <span className="text-[8px] font-sans font-bold text-outline uppercase tracking-wider">KILOS</span>
            </div>

            <div className={highlightClass('height', "col-span-12 sm:col-span-4 border-b border-outline-variant pb-1 flex items-baseline px-1")}>
              <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">ALTURA</label>
              <input
                type="text"
                inputMode="numeric"
                disabled={isCoreLocked}
                value={editedChar.height || ''}
                onChange={(e) => handleDemographicChange('height', e.target.value.replace(/\D/g, ''))}
                placeholder=""
                className="w-full bg-transparent border-none p-0 text-on-surface font-mono text-sm focus:ring-0 outline-none"
              />
              
              <span className="text-[8px] font-sans font-bold text-outline uppercase tracking-wider">METROS</span>
            </div>

            <div className={highlightClass('age', `col-span-12 sm:col-span-4 border-b ${validationErrors.includes('age') ? 'border-red-500 border-b-2 bg-red-500/10 px-2' : 'border-outline-variant'} pb-1 flex items-baseline transition-all duration-300 px-1`)}>
              <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">IDADE</label>
              <input
                type="text"
                inputMode="numeric"
                disabled={isCoreLocked}
                value={editedChar.age || ''}
                onChange={(e) => handleDemographicChange('age', e.target.value.replace(/\D/g, ''))}
                placeholder=""
                className="w-full bg-transparent border-none p-0 text-on-surface font-mono text-sm focus:ring-0 outline-none"
              />
              
            </div>

            <div className={highlightClass('classKit', `col-span-12 sm:col-span-6 border-b ${validationErrors.includes('classKit') ? 'border-red-500 border-b-2 bg-red-500/10 px-2' : 'border-outline-variant'} pb-1 flex flex-col justify-end min-h-11 transition-all duration-300 px-1`)}>
              <div className="flex items-baseline w-full">
                <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">CLASSE</label>
                {isCoreLocked ? (
                  <input
                    type="text"
                    value={editedChar.classKit ?? ''}
                    readOnly
                    disabled
                    className="w-full bg-transparent border-none p-0 text-on-surface font-sans text-sm focus:ring-0 outline-none"
                  />
                ) : (
                  <CustomSelect
                    value={['Bárbaro', 'Bardo', 'Clérigo', 'Druida', 'Feiticeiro', 'Guerreiro', 'Lutador / Arqueiro', 'Ladino', 'Mago', 'Bruxo', 'Monge', 'Paladino', 'Ranger'].includes(editedChar.classKit) ? editedChar.classKit : (editedChar.classKit ? 'Outro' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Outro') {
                        handleDemographicChange('classKit', 'Outro');
                      } else {
                        handleDemographicChange('classKit', val);
                      }
                    }}
                    variant="sheet"
                    placeholder="Selecione..."
                    options={[
                      { value: "", label: "Selecione..." },
                      { value: "Bárbaro", label: "Bárbaro" },
                      { value: "Bardo", label: "Bardo" },
                      { value: "Clérigo", label: "Clérigo" },
                      { value: "Druida", label: "Druida" },
                      { value: "Feiticeiro", label: "Feiticeiro" },
                      { value: "Guerreiro", label: "Guerreiro" },
                      { value: "Lutador / Arqueiro", label: "Lutador / Arqueiro" },
                      { value: "Ladino", label: "Ladino" },
                      { value: "Mago", label: "Mago" },
                      { value: "Bruxo", label: "Bruxo" },
                      { value: "Monge", label: "Monge" },
                      { value: "Paladino", label: "Paladino" },
                      { value: "Ranger", label: "Ranger" },
                      { value: "Outro", label: "Outro..." }
                    ]}
                  />
                )}
              </div>
              {!isCoreLocked && (editedChar.classKit === 'Outro' || (editedChar.classKit && !['Bárbaro', 'Bardo', 'Clérigo', 'Druida', 'Feiticeiro', 'Guerreiro', 'Lutador / Arqueiro', 'Ladino', 'Mago', 'Bruxo', 'Monge', 'Paladino', 'Ranger'].includes(editedChar.classKit))) && (
                <>
<>
<input maxLength={50}
                  type="text"
                  value={editedChar.classKit === 'Outro' ? '' : (editedChar.classKit ?? '')}
                  onChange={(e) => handleDemographicChange('classKit', e.target.value)}
                  placeholder="Especifique a classe..."
                  className={`w-full bg-transparent border-outline-variant/40 p-0 text-amber-100 font-sans text-xs focus:ring-0 outline-none mt-1 border-b ${(editedChar.classKit || '').length >= 50 ? '!text-red-500 !font-bold' : ''}`}
                />
{(editedChar.classKit || '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
</>
              )}

              {/* Checkbox "É mágico?" */}
              {!isCoreLocked && (editedChar.classKit === 'Outro' || (editedChar.classKit && !['Bárbaro', 'Bardo', 'Clérigo', 'Druida', 'Feiticeiro', 'Guerreiro', 'Lutador / Arqueiro', 'Ladino', 'Mago', 'Bruxo', 'Monge', 'Paladino', 'Ranger'].includes(editedChar.classKit))) && (
                <div className="flex items-center gap-2 mt-2 select-none">
                  <button
                    type="button"
                    disabled={isCoreLocked}
                    onClick={() => {
                      setEditedChar(prev => ({
                        ...prev,
                        isMagic: !prev.isMagic
                      }));
                    }}
                    className={`flex items-center justify-center w-4 h-4 border transition-colors ${
                      isCoreLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      editedChar.isMagic
                        ? 'bg-primary border-primary text-on-primary'
                        : 'border-outline-variant hover:border-primary bg-transparent'
                    }`}
                  >
                    {editedChar.isMagic && (
                      <span className="material-symbols-outlined text-[10px] font-extrabold">check</span>
                    )}
                  </button>
                  <span className="font-sans text-[9px] font-bold text-outline uppercase tracking-wider">
                    É mágico?
                  </span>
                </div>
              )}
            </div>

            <div className={highlightClass('alinhamento', `col-span-12 sm:col-span-6 border-b border-outline-variant pb-1 flex flex-col justify-end min-h-11 transition-all duration-300 px-1`)}>
              <div className="flex items-baseline w-full">
                <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">ALINHAMENTO</label>
                {isCoreLocked ? (
                  <input
                    type="text"
                    value={editedChar.alinhamento || 'Neutro'}
                    readOnly
                    disabled
                    className="w-full bg-transparent border-none p-0 text-on-surface font-sans text-sm focus:ring-0 outline-none"
                  />
                ) : (
                  <CustomSelect
                    value={editedChar.alinhamento || 'Neutro'}
                    onChange={(e) => handleDemographicChange('alinhamento', e.target.value)}
                    variant="sheet"
                    options={[
                      { value: "Bondoso", label: "Bondoso (Cura / Luz)" },
                      { value: "Neutro", label: "Neutro (Equilíbrio)" },
                      { value: "Maligno", label: "Maligno (Destruição / Trevas)" }
                    ]}
                  />
                )}
              </div>
            </div>

            <div className={highlightClass('level', `col-span-12 sm:col-span-6 border-b ${fieldErrors.level ? 'border-primary border-b-2 bg-primary/10' : 'border-outline-variant'} pb-1 flex flex-col justify-end min-h-11 px-1`)}>
              <div className="flex items-center w-full gap-2">
                <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">NÍVEL</label>
                <div className="flex-1 flex items-center justify-center relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    readOnly={true}
                    value={editedChar.level ?? 1}
                    className="w-full bg-transparent border-none p-0 text-primary font-mono text-sm text-center focus:ring-0 outline-none cursor-not-allowed"
                    title="O nível do personagem só pode ser alterado pelo botão Level-up"
                  />
                </div>
                {userRole === 'dm' && (
                  <button
                    type="button"
                    onClick={() => {
                      if ((Number(editedChar.level) || 1) >= 15) {
                        toast.error("Nível máximo (15) já atingido!");
                      } else {
                        setShowLevelUpConfirmModal(true);
                      }
                    }}
                    className="shrink-0 px-2 py-1 bg-lime-500 hover:bg-lime-400 border border-green-300/40 text-black font-sans text-[10px] font-bold rounded-sm flex items-center gap-1 transition-colors shadow-md cursor-pointer uppercase tracking-wider"
                    title="Aumentar Nível Manualmente (Mestre)"
                  >
                    <span className="material-symbols-outlined text-xs">arrow_upward</span>
                    <span>Level-up</span>
                  </button>
                )}
              </div>
              {renderFieldError('level')}
            </div>

            <div className={highlightClass('xp', `col-span-12 sm:col-span-6 border-b ${fieldErrors.xp ? 'border-primary border-b-2 bg-primary/10' : 'border-outline-variant'} pb-1 flex flex-col justify-end min-h-11 px-1`)}>
              <div className="flex items-baseline w-full">
                <label className="font-sans text-[10px] font-bold text-outline mr-3 shrink-0 uppercase tracking-widest">XP</label>
                <input maxLength={50}
                  type="text"
                  inputMode="numeric"
                  disabled={isLevelLocked}
                  value={editedChar.xp ?? 0}
                  onChange={(e) => handleDemographicChange('xp', e.target.value)}
                  onBlur={() => handleDemographicBlur('xp')}
                  className={`w-full bg-transparent border-none p-0 text-on-surface font-mono text-sm text-center focus:ring-0 outline-none ${String(editedChar.xp ?? '').length >= 50 ? '!text-red-500' : ''}`}
                />
              </div>
              {String(editedChar.xp ?? '').length >= 50 && (
                <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
                  Limite atingido (50)
                </div>
              )}
              {renderFieldError('xp')}
            </div>
          </div>

          {/* Section: Attributes Table */}
          <section className="space-y-4 pt-4 sheet-block-atributos">
            <h3 className="font-serif text-xl text-center text-primary tracking-widest uppercase">
              Atributos
            </h3>

            {!isLocked && (
              <div className="bg-surface-container border border-outline-variant/40 p-3.5 flex flex-col items-center justify-center gap-1.5 text-center max-w-sm mx-auto transition-all duration-300">
                <span className="text-[10px] uppercase tracking-widest text-outline-variant font-bold">
                  Distribuição de Atributos
                </span>
                <div className={`text-xl font-mono font-black tracking-wider transition-colors duration-300 ${remainingAttributePoints < 0 ? 'text-red-500 animate-pulse' : remainingAttributePoints === 0 ? 'text-green-400 font-bold' : 'text-secondary'}`}>
                  {remainingAttributePoints} pts restantes
                </div>
                {remainingAttributePoints < 0 ? (
                  <p className="text-xs text-red-500 font-bold uppercase animate-pulse transition-all duration-300">
                    Você não possui mais pontos pra somar
                  </p>
                ) : remainingAttributePoints > 0 ? (
                  <p className="text-[10px] text-outline-variant/80 font-sans">
                    Você deve distribuir exatamente {allowedAttributePoints} pontos. Restam {remainingAttributePoints} pts.
                  </p>
                ) : (
                  <p className="text-[10px] text-green-400 font-bold uppercase font-sans">
                    Pronto! Todos os {allowedAttributePoints} pontos foram distribuídos.
                  </p>
                )}
                <p className="text-[10px] text-outline-variant/50 font-sans">
                  Limite de 18 pontos por atributo.
                </p>
              </div>
            )}

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                <thead>
                  <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                    <th className="border border-outline-variant p-1 sm:p-2.5 text-left w-12 sm:w-36">
                      <span className="sm:hidden">ATR.</span>
                      <span className="hidden sm:inline">ATRIBUTO</span>
                    </th>
                    <th className="border border-outline-variant p-1 sm:p-2.5 w-10 sm:w-16">
                      <span className="sm:hidden">PTS.</span>
                      <span className="hidden sm:inline">PONTOS GASTOS</span>
                    </th>
                    <th className="border border-outline-variant p-1 sm:p-2.5 w-10 sm:w-16">
                      <span className="sm:hidden">PEN.</span>
                      <span className="hidden sm:inline">PENALIDADE</span>
                    </th>
                    <th className="border border-outline-variant p-1 sm:p-2.5 w-10 sm:w-16">
                      <span className="sm:hidden">BÔN.</span>
                      <span className="hidden sm:inline">BÔNUS</span>
                    </th>
                    <th className="border border-outline-variant p-1 sm:p-2.5 w-10 sm:w-16">
                      <span className="sm:hidden">%</span>
                      <span className="hidden sm:inline">% AMPLIADO</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center font-mono">
                  {(Object.keys(editedChar.attributes) as Array<keyof CharacterAttributes>).map((attrKey) => {
                    const row = editedChar.attributes[attrKey];
                    const labels: { [key: string]: string } = {
                      con: 'CONSTITUIÇÃO (CON)',
                      for: 'FORÇA (FOR)',
                      des: 'DESTREZA (DES)',
                      agi: 'AGILIDADE (AGI)',
                      int: 'INTELIGÊNCIA (INT)',
                      per: 'PERCEPÇÃO (PER)',
                      will: 'VONTADE (WILL)',
                      car: 'CARISMA (CAR)',
                    };

                    const mobileLabels: { [key: string]: string } = {
                      con: 'CON',
                      for: 'FOR',
                      des: 'DEX',
                      agi: 'AGI',
                      int: 'INT',
                      per: 'PER',
                      will: 'WILL',
                      car: 'CAR',
                    };

                    return (
                      <tr key={attrKey} className={highlightClass(`attributes.${attrKey}.natural`, highlightClass(`attributes.${attrKey}.penalidadeManual`, highlightClass(`attributes.${attrKey}.bonusRacialManual`, "hover:bg-surface-container-high/40 transition-colors")))}>
                        <td className="border border-outline-variant p-1 sm:p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-[11px] sm:text-xs">
                          <span className="sm:hidden">{mobileLabels[attrKey]}</span>
                          <span className="hidden sm:inline">{labels[attrKey]}</span>
                        </td>
                        
                        <td className={`border border-outline-variant p-0.5 transition-all duration-300 ${validationErrors.includes(`attr-${attrKey}`) || (remainingAttributePoints < 0 && !isLocked) ? 'bg-red-500/20 border-red-500' : ''}`}>
                          <>
<input maxLength={50}
                            type="text"
                            inputMode="numeric"
                            disabled={isCoreLocked}
                            value={row.natural ?? 0}
                            onChange={(e) => handleAttributeChange(attrKey, 'natural', e.target.value)}
                            onBlur={() => handleAttributeBlur(attrKey, 'natural')}
                            className={`w-full bg-transparent text-center border-none p-1 font-mono text-sm focus:ring-0 outline-none disabled:opacity-75 transition-colors duration-300 ${
                              remainingAttributePoints < 0 && !isLocked
                                ? '!text-red-500 !font-bold' 
                                : validationErrors.includes(`attr-${attrKey}`) 
                                  ? 'text-red-400 font-bold' 
                                  : 'text-on-surface'
                            } ${String(row.natural ?? '').length >= 50 ? '!text-red-500' : ''}`}
                          />
{String(row.natural ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
                        </td>

                        <td className="border border-outline-variant p-0.5">
                          <input
                            type="text"
                            disabled={isCoreLocked}
                            title={
                              (() => {
                                const sanity = getAttrSanityPenalty(attrKey, editedChar);
                                const base = Number(row.penalidadeManual) || 0;
                                const extra = Number(row.penalidadeExtra) || 0;
                                const parts = [];
                                if (base > 0) parts.push(`Base: -${base}`);
                                if (sanity > 0) parts.push(`Sanidade: -${sanity}`);
                                if (extra > 0) parts.push(`Extra: -${extra}`);
                                if (parts.length > 0) return parts.join(' | ');
                                return "Definir penalidade";
                              })()
                            }
                            value={
                              focusedField?.attrKey === attrKey && focusedField?.field === 'penalidade'
                                ? (row.penalidade === "" ? "" : String(row.penalidade))
                                : (row.penalidade === ""
                                  ? ""
                                  : (Number(row.penalidade) === 0
                                    ? "0"
                                    : `-${row.penalidade}`))
                            }
                            onFocus={() => setFocusedField({ attrKey, field: 'penalidade' })}
                            onChange={(e) => handleAttributeChange(attrKey, 'penalidade', e.target.value)}
                            onBlur={() => {
                              handleAttributeBlur(attrKey, 'penalidade');
                              setFocusedField(null);
                            }}
                            className="w-full bg-transparent text-center border-none p-1 text-on-surface font-mono text-sm focus:ring-0 outline-none disabled:opacity-75"
                          />
              
                        </td>

                        <td className="border border-outline-variant p-0.5">
                          <input
                            type="text"
                            disabled={isCoreLocked}
                            title={
                              (() => {
                                const base = Number(row.bonusRacialManual) || 0;
                                const extra = Number(row.bonusRacialExtra) || 0;
                                const parts = [];
                                if (base > 0) parts.push(`Base: +${base}`);
                                if (extra > 0) parts.push(`Extra: +${extra}`);
                                if (parts.length > 0) return parts.join(' | ');
                                return "Definir bônus";
                              })()
                            }
                            value={
                              focusedField?.attrKey === attrKey && focusedField?.field === 'bonusRacial'
                                ? (row.bonusRacial === "" ? "" : String(row.bonusRacial))
                                : (row.bonusRacial === ""
                                  ? ""
                                  : (Number(row.bonusRacial) === 0
                                    ? "0"
                                    : `+${row.bonusRacial}`))
                            }
                            onFocus={() => setFocusedField({ attrKey, field: 'bonusRacial' })}
                            onChange={(e) => handleAttributeChange(attrKey, 'bonusRacial', e.target.value)}
                            onBlur={() => {
                              handleAttributeBlur(attrKey, 'bonusRacial');
                              setFocusedField(null);
                            }}
                            className="w-full bg-transparent text-center border-none p-1 text-on-surface font-mono text-sm focus:ring-0 outline-none disabled:opacity-75"
                          />
              
                        </td>

                        <td className="border border-outline-variant p-1 sm:p-2 text-on-surface-variant font-bold text-[11px]">
                          {row.pctAmpliado}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-on-surface-variant opacity-60 italic text-center">
              * Nota: O % Ampliado é calculado automaticamente com base em Pontos gastos - Penalidade + Bônus.
            </p>
          </section>

          {/* Section: Status Points Grid (Health, Magic, Psi, etc.) */}
          <section className="space-y-4 pt-4 sheet-block-energias">
            <h3 className="font-serif text-xl text-center text-primary tracking-widest uppercase">
              Atributos Vitais
            </h3>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isMagicCharacter ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
              {/* Box 1: HP */}
              <div className="bg-surface-container-low p-4 border border-outline-variant flex flex-col justify-between space-y-3 min-h-[220px]">
                <div className="text-center font-serif text-xs font-bold tracking-widest text-red-500 border-b border-outline-variant/30 pb-2 uppercase">
                  VIDA
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <table className="w-full table-fixed text-[10px] font-sans border-collapse">
                    <colgroup>
                      <col className="w-[50%]" />
                      <col className="w-[50%]" />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td className="text-center text-outline font-bold uppercase py-1 select-none">TOTAL</td>
                        <td className="py-1">
                          <input
                            type="text"
                            readOnly
                            disabled
                            value={calculatedHP}
                            className="w-full bg-surface-container-lowest/50 text-center font-mono font-bold text-red-500 border border-outline-variant/30 py-0.5 outline-none text-xs rounded-none cursor-not-allowed select-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center text-outline font-bold uppercase py-1 select-none">DANO</td>
                        <td className="py-1">
                          <>
<input maxLength={50}
                            type="text"
                            inputMode="numeric"
                            disabled={isLocked}
                            value={editedChar.statusPoints?.vida?.danoSofrido ?? 0}
                            onChange={(e) => handleStatusChange('vida', 'danoSofrido', e.target.value)}
                            onBlur={() => handleStatusBlur('vida', 'danoSofrido')}
                            className={`w-full bg-surface-container-lowest text-center font-mono font-bold text-red-500 border border-outline-variant/50 py-0.5 focus:ring-1 focus:ring-primary outline-none text-xs rounded-none disabled:opacity-75 ${String(editedChar.statusPoints?.vida?.danoSofrido ?? '').length >= 50 ? '!text-red-500' : ''}`}
                          />
{String(editedChar.statusPoints?.vida?.danoSofrido ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                        </td>
                      </tr>
                      <tr className="">
                        <td className="text-center text-outline font-bold uppercase py-1.5 select-none">HP</td>
                        <td className="py-1.5">
                          <div className="w-full bg-surface-container-lowest/50 text-center font-mono font-bold text-red-500 py-0.5 border border-outline-variant/20 text-xs rounded-none">
                            {calculatedHP - (Number(editedChar.statusPoints?.vida?.danoSofrido) || 0)}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Box 2: MP */}
              {isMagicCharacter && (
                <div className="bg-surface-container-low p-4 border border-outline-variant flex flex-col justify-between space-y-3 min-h-[220px]">
                  <div className="text-center font-serif text-xs font-bold tracking-widest text-[#a2d2ff] border-b border-outline-variant/30 pb-2 uppercase">
                    MAGIA
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <table className="w-full table-fixed text-[10px] font-sans border-collapse">
                      <colgroup>
                        <col className="w-[50%]" />
                        <col className="w-[50%]" />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td className="text-center text-outline font-bold uppercase py-1 select-none">TOTAL</td>
                          <td className="py-1">
                            <input
                              type="text"
                              readOnly
                              disabled
                              value={editedChar.statusPoints?.magia?.valorFinal ?? 0}
                              className="w-full bg-surface-container-lowest/50 text-center font-mono font-bold text-[#a2d2ff] border border-outline-variant/30 py-0.5 outline-none text-xs rounded-none cursor-not-allowed select-none"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center text-outline font-bold uppercase py-1 select-none">GASTO</td>
                          <td className="py-1">
                            <>
<input maxLength={50}
                              type="text"
                              inputMode="numeric"
                              disabled={isLocked}
                              value={editedChar.statusPoints?.magia?.magiaExaurida ?? 0}
                              onChange={(e) => handleStatusChange('magia', 'magiaExaurida', e.target.value)}
                              onBlur={() => handleStatusBlur('magia', 'magiaExaurida')}
                              className={`w-full bg-surface-container-lowest text-center font-mono font-bold text-[#60a5fa] border border-outline-variant/30 py-0.5 focus:ring-1 focus:ring-[#a2d2ff] outline-none text-xs rounded-none disabled:opacity-75 ${String(editedChar.statusPoints?.magia?.magiaExaurida ?? '').length >= 50 ? '!text-red-500' : ''}`}
                            />
{String(editedChar.statusPoints?.magia?.magiaExaurida ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                          </td>
                        </tr>
                        <tr className="border- border-outline-variant/20">
                          <td className="text-center text-outline font-bold uppercase py-1.5 select-none">MP</td>
                          <td className="py-1.5">
                            <div className="w-full bg-surface-container-lowest/50 text-center font-mono font-bold text-[#a2d2ff] py-0.5 border border-outline-variant/20 text-xs rounded-none">
                              {(Number(editedChar.statusPoints?.magia?.valorFinal) || 0) - (Number(editedChar.statusPoints?.magia?.magiaExaurida) || 0)}
                            </div>
                          </td>
                        </tr>
                        <tr className="">
                          <td className="text-center text-outline font-bold uppercase py-1.5 select-none">FOCUS/FÉ</td>
                          <td className="py-1.5">
                            <div className="w-full bg-surface-container-lowest/50 text-center font-mono font-bold text-[#275fcf] py-0.5 border border-outline-variant/20 text-xs rounded-none">
                              {editedChar.statusPoints?.fe?.valorFinal ?? 0}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Box 3: Sanidade */}
              <div className="bg-surface-container-low p-4 border border-outline-variant flex flex-col justify-between space-y-3 min-h-[220px]">
                <div className="text-center font-serif text-xs font-bold tracking-widest text-[#ffcc00] border-b border-outline-variant/30 pb-2 uppercase">
                  SANIDADE
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <table className="w-full table-fixed text-[10px] font-sans border-collapse">
                    <colgroup>
                      <col className="w-[50%]" />
                      <col className="w-[50%]" />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td className="text-center text-outline font-bold uppercase py-1 select-none">TOTAL</td>
                        <td className="py-1">
                          <input
                            type="text"
                            readOnly
                            disabled
                            value={calculatedSanidade}
                            className="w-full bg-surface-container-lowest/50 text-center font-mono font-bold text-[#fef08a] border border-outline-variant/30 py-0.5 outline-none text-xs rounded-none cursor-not-allowed select-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center text-outline font-bold uppercase py-1 select-none">GASTO</td>
                        <td className="py-1">
                          <>
<input maxLength={50}
                            type="text"
                            inputMode="numeric"
                            disabled={isLocked}
                            value={editedChar.statusPoints?.psi?.esforcoMental ?? 0}
                            onChange={(e) => handleStatusChange('psi', 'esforcoMental', e.target.value)}
                            onBlur={() => handleStatusBlur('psi', 'esforcoMental')}
                            className={`w-full bg-surface-container-lowest text-center font-mono font-bold text-[#fef08a] border border-outline-variant/50 py-0.5 focus:ring-1 focus:ring-[#ffcc00] outline-none text-xs rounded-none disabled:opacity-75 ${String(editedChar.statusPoints?.psi?.esforcoMental ?? '').length >= 50 ? '!text-red-500' : ''}`}
                          />
{String(editedChar.statusPoints?.psi?.esforcoMental ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                        </td>
                      </tr>
                      <tr className="">
                        <td className="text-center text-outline font-bold uppercase py-1.5 select-none">LOUCURA</td>
                        <td className="py-1.5">
                          <div className="w-full bg-surface-container-lowest/50 text-center font-mono font-bold text-[#ffcc00] py-0.5 border border-outline-variant/20 text-xs rounded-none">
                            {calculatedSanidade - (Number(editedChar.statusPoints?.psi?.esforcoMental) || 0)}
                          </div>
                        </td>
                      </tr>
                      <tr className="">
                        <td className="text-center text-outline font-bold uppercase py-1 select-none">STATUS</td>
                        <td className="py-1">
                          <input
                            type="text"
                            disabled={true}
                            value={editedChar.statusPoints?.psi?.estadoMental || ''}
                            placeholder="Status"
                            className={`w-full bg-surface-container-lowest text-center font-mono text-[10px] font-bold ${
                              editedChar.statusPoints?.psi?.estadoMental === 'Saudável'
                                ? 'text-lime-400'
                                : editedChar.statusPoints?.psi?.estadoMental === 'Afetado'
                                ? 'text-yellow-200'
                                : editedChar.statusPoints?.psi?.estadoMental === 'Instável'
                                ? 'text-yellow-400'
                                : editedChar.statusPoints?.psi?.estadoMental === 'Degenerado'
                                ? 'text-orange-400'
                                : 'text-red-500'
                            } border border-outline-variant/50 py-0.5 outline-none rounded-none disabled:opacity-75 cursor-not-allowed select-none`}
                            title="Status calculado automaticamente a partir do valor de Loucura"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Box 4: Pts Heroicos */}
              <div className="bg-surface-container-low p-4 border border-outline-variant flex flex-col justify-between space-y-3 min-h-[220px]">
                <div className="text-center font-serif text-xs font-bold tracking-widest text-[#9c27b0] border-b border-outline-variant/30 pb-2 uppercase">
                  HEROÍSMO
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <table className="w-full table-fixed text-[10px] font-sans border-collapse">
                    <colgroup>
                      <col className="w-[50%]" />
              
                      <col className="w-[50%]" />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td className="text-center text-outline font-bold uppercase py-1 select-none">TOTAL</td>
                        <td className="py-1">
                          <>
<input maxLength={50}
                            type="text"
                            inputMode="numeric"
                            value={editedChar.statusPoints?.heroicos?.valorFinal ?? 0}
                            onChange={(e) => handleStatusChange('heroicos', 'valorFinal', e.target.value)}
                            onBlur={() => handleStatusBlur('heroicos', 'valorFinal')}
                            disabled={isLocked || getPontosHeroicosLevel(editedChar.aprimoramentosPositivos) !== null}
                            title={getPontosHeroicosLevel(editedChar.aprimoramentosPositivos) !== null ? "Valor calculado automaticamente a partir do aprimoramento Pontos Heróicos" : ""}
                            className={`w-full bg-surface-container-lowest text-center font-mono font-bold text-[#d8b4fe] border border-outline-variant/50 py-0.5 focus:ring-1 focus:ring-[#9c27b0] outline-none text-xs rounded-none disabled:opacity-50 cursor-not-allowed select-none ${String(editedChar.statusPoints?.heroicos?.valorFinal ?? '').length >= 50 ? '!text-red-500' : ''}`}
                          />
{String(editedChar.statusPoints?.heroicos?.valorFinal ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center text-outline font-bold uppercase py-1 select-none">GASTO</td>
                        <td className="py-1">
                          <>
<input maxLength={50}
                            type="text"
                            inputMode="numeric"
                            disabled={isLocked}
                            value={editedChar.statusPoints?.heroicos?.danoSofrido ?? 0}
                            onChange={(e) => handleStatusChange('heroicos', 'danoSofrido', e.target.value)}
                            onBlur={() => handleStatusBlur('heroicos', 'danoSofrido')}
                            className={`w-full bg-surface-container-lowest text-center font-mono font-bold text-[#d8b4fe] border border-outline-variant/50 py-0.5 focus:ring-1 focus:ring-[#9c27b0] outline-none text-xs rounded-none disabled:opacity-75 ${String(editedChar.statusPoints?.heroicos?.danoSofrido ?? '').length >= 50 ? '!text-red-500' : ''}`}
                          />
{String(editedChar.statusPoints?.heroicos?.danoSofrido ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                        </td>
                      </tr>
                      <tr className="">
                        <td className="text-center text-outline font-bold uppercase py-1.5 select-none">PH</td>
                        <td className="py-1.5">
                          <div className="w-full bg-surface-container-lowest/50 text-center font-mono font-bold text-[#9c27b0] py-0.5 border border-outline-variant/20 text-xs rounded-none">
                            {(Number(editedChar.statusPoints?.heroicos?.valorFinal) || 0) - (Number(editedChar.statusPoints?.heroicos?.danoSofrido) || 0)}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Protection Index - Armadura e Escudos */}
          <section className="space-y-4 pt-4 sheet-block-ip">
            <h3 className="font-serif text-xl text-center text-primary tracking-widest uppercase">
              Índice de Proteção (IP)
            </h3>
            
            {(() => {
              const heroisLevel = getArmaduraHeroisLevel(editedChar.aprimoramentosPositivos);
              const hasHerois = heroisLevel !== null;

              return (
                <div className={`grid ${hasHerois ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-3 sm:gap-4 max-w-2xl mx-auto bg-surface-container-low p-4 sm:p-6 border border-outline-variant`}>
                  {/* Card 0: IP NATURAL */}
                  {hasHerois && (
                    <div className="bg-surface-container-lowest p-3 border border-outline-variant flex flex-col justify-between items-center text-center space-y-2 h-24 animate-fadeIn">
                      <span className="text-[10px] font-sans font-bold tracking-wider text-primary uppercase">
                        IP NATURAL
                      </span>
                      <div className="w-full relative flex-1">
  <input
                        type="text"
                        disabled
                        value={heroisLevel}
                        className="w-full max-w-[80px] bg-surface-container text-primary text-center font-mono font-bold border border-outline-variant/60 py-1 text-xs rounded-none opacity-100 cursor-default"
                      />
  
</div>
              
                    </div>
                  )}

                  {/* Card 1: IP ESCUDO */}
                  <div className="bg-surface-container-lowest p-3 border border-outline-variant flex flex-col justify-between items-center text-center space-y-2 h-24">
                    <span className="text-[10px] font-sans font-bold tracking-wider text-primary uppercase">
                      IP ESCUDO
                    </span>
                    <>
<input maxLength={50}
                      type="text"
                      inputMode="numeric"
                      disabled={true} readOnly={true}
                      value={editedChar.protection.ipEscudo}
                      onChange={(e) => handleProtectionChange('ipEscudo', e.target.value)}
                      onBlur={() => handleProtectionBlur('ipEscudo')}
                      className={`w-full max-w-[80px] bg-surface-container text-on-surface text-center font-mono font-bold border border-outline-variant/60 py-1 focus:ring-1 focus:ring-primary outline-none text-xs rounded-none disabled:opacity-75 ${String(editedChar.protection.ipEscudo ?? '').length >= 50 ? '!text-red-500' : ''}`}
                    />
{String(editedChar.protection.ipEscudo ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                  </div>

                  {/* Card 2: IP ARMADURA */}
                  <div className="bg-surface-container-lowest p-3 border border-outline-variant flex flex-col justify-between items-center text-center space-y-2 h-24">
                    <span className="text-[10px] font-sans font-bold tracking-wider text-primary uppercase">
                      IP ARMADURA
                    </span>
                    <>
<input maxLength={50}
                      type="text"
                      inputMode="numeric"
                      disabled={true} readOnly={true}
                      value={editedChar.protection.ipPsiquico}
                      onChange={(e) => handleProtectionChange('ipPsiquico', e.target.value)}
                      onBlur={() => handleProtectionBlur('ipPsiquico')}
                      className={`w-full max-w-[80px] bg-surface-container text-on-surface text-center font-mono font-bold border border-outline-variant/60 py-1 focus:ring-1 focus:ring-primary outline-none text-xs rounded-none disabled:opacity-75 ${String(editedChar.protection.ipPsiquico ?? '').length >= 50 ? '!text-red-500' : ''}`}
                    />
{String(editedChar.protection.ipPsiquico ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                  </div>

                  {/* Card 3: IP MÁGICO */}
                  <div className="bg-surface-container-lowest p-3 border border-outline-variant flex flex-col justify-between items-center text-center space-y-2 h-24">
                    <span className="text-[10px] font-sans font-bold tracking-wider text-primary uppercase">
                      IP MÁGICO
                    </span>
                    <>
<input maxLength={50}
                      type="text"
                      inputMode="numeric"
                      disabled={true} readOnly={true}
                      value={editedChar.protection.ipMagico}
                      onChange={(e) => handleProtectionChange('ipMagico', e.target.value)}
                      onBlur={() => handleProtectionBlur('ipMagico')}
                      className={`w-full max-w-[80px] bg-surface-container text-[#4cc9f0] text-center font-mono font-bold border border-outline-variant/60 py-1 focus:ring-1 focus:ring-primary outline-none text-xs rounded-none disabled:opacity-75 ${String(editedChar.protection.ipMagico ?? '').length >= 50 ? '!text-red-500' : ''}`}
                    />
{String(editedChar.protection.ipMagico ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                  </div>
                </div>
              );
            })()}

            {/* Collapsible My Armors Section */}
            <div className="hidden mt-4 border border-outline-variant bg-surface-container-low p-4 rounded-none">
              <button
                type="button"
                onClick={() => setIsMinhasArmadurasCollapsed(!isMinhasArmadurasCollapsed)}
                className="w-full flex flex-col items-center justify-center text-primary hover:text-on-surface transition-colors"
              >
                <span className="font-serif text-sm tracking-wider uppercase font-bold flex items-center gap-2 text-center justify-center">
                  Armaduras & Escudos
                </span>
                <span className="text-xs font-mono text-primary mt-1 select-none">
                  {isMinhasArmadurasCollapsed ? "▼" : "▲"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {!isMinhasArmadurasCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      {!isLocked && (
                        <div className="bg-amber-500/10 border border-amber-500/30 text-secondary text-[11px] px-3 py-2 rounded-none mb-4 text-center flex items-center justify-center gap-1.5 font-sans font-medium">
                          <span>⚠️</span>
                          <span>Essas alterações não poderão ser alteradas depois de salvar a ficha.</span>
                        </div>
                      )}

                      {(editedChar.armors || []).length === 0 ? (
                        <p className="text-xs text-outline italic text-center py-4 bg-surface-container-lowest border border-outline-variant/30">
                          Nenhuma armadura ou escudo adicionado ainda. Use o catálogo abaixo para adquirir equipamentos.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {(editedChar.armors || []).map((item) => {
                            const isObraPrima = item.modificador === "Armadura/Escudo Obra-prima" || item.modificador === "Armadura Obra-prima" || item.modificador === "Escudo Obra-prima";
                            const finalDex = isObraPrima ? Math.min(0, (Number(item.penalidade_dex) || 0) + 1) : (Number(item.penalidade_dex) || 0);
                            const finalAgi = isObraPrima ? Math.min(0, (Number(item.penalidade_agi) || 0) + 1) : (Number(item.penalidade_agi) || 0);
                            
                            const isEscudoItem = item.slot === "escudo" || (item.nome || "").toLowerCase().includes("escudo") || (item.nome || "").toLowerCase().includes("broquel");
                            const armorMods = modificadoresCatalog.filter(mod => 
                              isEscudoItem ? mod.categoria === "modificadores_escudo" : mod.categoria === "modificadores_armadura"
                            );
                            
                            if (isLocked) {
                              // READ-ONLY VIEW MODE
                              return (
                                <div key={item.id} className={`p-4 border transition-all duration-200 relative ${
                                  item.isEquipped 
                                    ? 'border-green-500/30 bg-green-500/5' 
                                    : 'border-outline-variant/50 bg-surface-container-lowest'
                                }`}>
                                  {/* MOBILE ONLY READ-ONLY CARD */}
                                  <div className="sm:hidden space-y-2">
                                    {/* Row 1: nome_armadura      vestir|desvestir */}
                                    <div className="flex justify-between items-start gap-4">
                                      <span className={`text-sm font-bold text-left block flex-grow min-w-0 ${
                                        item.isEquipped ? 'text-green-400' : 'text-on-surface'
                                      }`}>
                                        {item.nome}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={isLocked}
                                        onClick={() => handleToggleEquipArmor(item.id)}
                                        className={`flex items-center justify-center h-8 w-8 shrink-0 active:scale-95 transition-all duration-150 border rounded-none outline-none ${
                                          isLocked 
                                            ? 'opacity-50 cursor-not-allowed pointer-events-none text-outline border-outline-variant/30 bg-surface-container-high/10' 
                                            : item.isEquipped 
                                              ? 'text-green-400 bg-green-500/10 border-green-500/30 hover:bg-green-500/25 cursor-pointer' 
                                              : 'text-outline bg-surface-container-high/40 border-outline-variant/30 hover:bg-surface-container-high hover:text-on-surface cursor-pointer'
                                        }`}
                                        title={item.isEquipped ? "Desvestir" : "Vestir"}
                                      >
                                        <Shirt className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Row 2: tipo: Torso */}
                                    <div className="text-left text-xs text-outline font-sans">
                                      Tipo: <span className="text-on-surface font-medium">{item.slot ? capitalizeFirstLetter(item.slot) : 'Corpo'}</span>
                                    </div>

                                    {/* Row 3: IP:N   DEX:N  AGI:N */}
                                    <div className="text-xs text-outline font-mono flex items-center justify-start gap-4 whitespace-nowrap overflow-hidden">
                                      <span>IP: <strong className="text-on-surface">{item.ip}</strong></span>
                                      <span>DEX: <strong className={finalDex < 0 ? "text-red-400" : ""}>{finalDex}</strong></span>
                                      <span>AGI: <strong className={finalAgi < 0 ? "text-red-400" : ""}>{finalAgi}</strong></span>
                                    </div>

                                    {item.modificador && (
                                      <p className="text-[10px] text-outline-variant italic text-left mt-1">
                                        Modificador: <span className="text-secondary/90 font-medium">{item.modificador}</span>
                                      </p>
                                    )}
                                    {item.obs && <p className="text-[10px] text-outline-variant italic text-left">Obs: {item.obs}</p>}
                                  </div>

                                  {/* PC AND TABLET READ-ONLY CARD */}
                                  <div className="hidden sm:block space-y-3">
                                    {/* Row 1: nome_armadura      vestir */}
                                    <div className="flex justify-between items-center gap-4 mb-1">
                                      <div className="text-left">
                                        <span className={`text-sm font-bold ${
                                          item.isEquipped ? 'text-green-400' : 'text-on-surface'
                                        }`}>
                                          {item.nome}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <button
                                          type="button"
                                          disabled={isLocked}
                                          onClick={() => handleToggleEquipArmor(item.id)}
                                          className={`h-8 w-8 flex items-center justify-center rounded-none transition-all duration-150 ${
                                            isLocked 
                                              ? 'opacity-50 cursor-not-allowed pointer-events-none bg-surface-container-high/10 text-outline' 
                                              : item.isEquipped 
                                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-secondary cursor-pointer' 
                                                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 cursor-pointer'
                                          }`}
                                          title={item.isEquipped ? "Desvestir" : "Vestir"}
                                        >
                                          <Shirt className="w-4 h-4 shrink-0" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Row 2: IP:N   DEX:N  AGI:N                    tipo_modificador */}
                                    <div className="flex justify-between items-center text-xs">
                                      <div className="w-1/2 text-left font-mono text-outline flex gap-4">
                                        <span>Tipo: <strong className="text-on-surface">{item.slot ? capitalizeFirstLetter(item.slot) : 'Corpo'}</strong></span>
                                        <span>IP: <strong className="text-on-surface">{item.ip}</strong></span>
                                        <span>DEX: <strong className={finalDex < 0 ? "text-red-400" : ""}>{finalDex}</strong></span>
                                        <span>AGI: <strong className={finalAgi < 0 ? "text-red-400" : ""}>{finalAgi}</strong></span>
                                      </div>
                                      <div className="w-1/2 text-right">
                                        {item.modificador ? (
                                          <span className="text-[11px] text-secondary font-sans italic font-medium">
                                            {item.modificador}
                                          </span>
                                        ) : (
                                          <span className="text-[11px] text-outline-variant font-sans italic">
                                            Nenhum Modificador
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {item.obs && <p className="text-[10px] text-outline-variant italic text-left mt-1">Obs: {item.obs}</p>}
                                  </div>
                                </div>
                              );
                            }

                            // INTERACTIVE EDIT MODE
                            return (
                              <div key={item.id} className={`p-4 border transition-all duration-200 relative ${
                                item.isEquipped 
                                  ? 'border-green-500/30 bg-green-500/5' 
                                  : 'border-outline-variant bg-surface-container'
                              }`}>
                                
                                {/* MOBILE ONLY VIEW (under sm breakpoint) */}
                                <div className="sm:hidden space-y-2">
                                  {/* Row 1: Name and Action buttons at top right */}
                                  <div className="flex justify-between items-start gap-4">
                                    <span className={`text-sm font-bold text-left block flex-grow min-w-0 ${
                                      item.isEquipped ? 'text-green-400' : 'text-on-surface'
                                    }`}>
                                      {item.nome}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        disabled={isLocked}
                                        onClick={() => handleToggleEquipArmor(item.id)}
                                        className={`h-8 w-8 flex items-center justify-center transition-all duration-150 border-0 outline-none rounded-none ${
                                          isLocked 
                                            ? 'opacity-50 cursor-not-allowed pointer-events-none bg-surface-container-high/10 text-outline' 
                                            : item.isEquipped 
                                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-secondary cursor-pointer' 
                                              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 cursor-pointer'
                                        }`}
                                        title={item.isEquipped ? "Desvestir" : "Vestir"}
                                      >
                                        <Shirt className="w-4 h-4 shrink-0" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveArmor(item.id)}
                                        className="bg-red-500/10 hover:bg-red-500/25 text-red-400 h-8 w-8 transition-colors flex items-center justify-center shrink-0 border-0 outline-none cursor-pointer"
                                        title="Remover"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Row 2: tipo: Torso */}
                                  <div className="text-left text-xs text-outline font-sans">
                                    Tipo: <span className="text-on-surface font-medium">{item.slot ? capitalizeFirstLetter(item.slot) : 'Corpo'}</span>
                                  </div>

                                  {/* Row 3: IP: N  DEX: N  AGI: N - left aligned! */}
                                  <div className="text-xs text-outline font-mono flex items-center justify-start gap-4 whitespace-nowrap overflow-hidden">
                                    <span>IP: <strong className="text-on-surface">{item.ip}</strong></span>
                                    <span>DEX: <strong className={finalDex < 0 ? "text-red-400" : ""}>{finalDex}</strong> {isObraPrima && <span className="text-green-400 text-[10px]">(-1)</span>}</span>
                                    <span>AGI: <strong className={finalAgi < 0 ? "text-red-400" : ""}>{finalAgi}</strong> {isObraPrima && <span className="text-green-400 text-[10px]">(-1)</span>}</span>
                                  </div>

                                  {item.obs && <p className="text-[10px] text-outline-variant italic text-left">Obs: {item.obs}</p>}

                                  {/* Just modifier select - left aligned/full-width! */}
                                  <div className="flex flex-col gap-1.5 items-start justify-start mt-2 w-full">
                                    <span className="text-[10px] font-bold text-outline font-sans uppercase tracking-wider">Modificador</span>
                                    <div className="w-full">
                                      <CustomSelect
                                        disabled={isLocked || userRole === 'dm'}
                                        value={item.modificador || ""}
                                        onChange={(e) => handleArmorModifierChange(item.id, e.target.value)}
                                        size="sm"
                                        variant="minimal"
                                        options={[
                                          { value: "", label: "Nenhum Modificador" },
                                          ...armorMods.map((mod) => ({
                                            value: mod.nome,
                                            label: mod.nome,
                                            description: mod.descricao
                                          }))
                                        ]}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* DESKTOP ONLY VIEW (sm and up) */}
                                <div className="hidden sm:block space-y-3">
                                  {/* Header: Name and Action buttons aligned vertically */}
                                  <div className="flex justify-between items-start gap-4 mb-2">
                                    <div className="text-left space-y-1 flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 items-center sm:items-start text-center sm:text-left">
                                        <span className={`text-sm font-bold ${
                                          item.isEquipped ? 'text-green-400' : 'text-on-surface'
                                        } block sm:inline`}>
                                          {item.nome}
                                        </span>
                                      </div>

                                      <div className="text-xs text-outline font-mono flex items-center justify-center sm:justify-start gap-3 sm:gap-4 flex-nowrap whitespace-nowrap overflow-hidden mt-1 sm:mt-0 w-full sm:w-auto">
                                        <span>Tipo: <strong className="text-on-surface">{item.slot ? capitalizeFirstLetter(item.slot) : 'Corpo'}</strong></span>
                                        <span>IP: <strong className="text-on-surface">{item.ip}</strong></span>
                                        <span>DEX: <strong className={finalDex < 0 ? "text-red-400" : ""}>{finalDex}</strong> {isObraPrima && <span className="text-green-400 text-[10px]"><span className="hidden sm:inline">(-1 Obra-prima)</span><span className="inline sm:hidden">(-1)</span></span>}</span>
                                        <span>AGI: <strong className={finalAgi < 0 ? "text-red-400" : ""}>{finalAgi}</strong> {isObraPrima && <span className="text-green-400 text-[10px]"><span className="hidden sm:inline">(-1 Obra-prima)</span><span className="inline sm:hidden">(-1)</span></span>}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-center">
                                      <button
                                        type="button"
                                        disabled={isLocked}
                                        onClick={() => handleToggleEquipArmor(item.id)}
                                        className={`h-8 w-8 flex items-center justify-center transition-all duration-150 border-0 outline-none rounded-none ${
                                          isLocked 
                                            ? 'opacity-50 cursor-not-allowed pointer-events-none bg-surface-container-high/10 text-outline' 
                                            : item.isEquipped 
                                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-secondary cursor-pointer' 
                                              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 cursor-pointer'
                                        }`}
                                        title={item.isEquipped ? "Desvestir" : "Vestir"}
                                      >
                                        <Shirt className="w-4 h-4 shrink-0" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveArmor(item.id)}
                                        className="bg-red-500/10 hover:bg-red-500/25 text-red-400 p-1.5 h-8 w-8 transition-colors flex items-center justify-center shrink-0 border-0 outline-none"
                                        title="Remover"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {item.obs && <p className="text-[10px] text-outline-variant italic mb-2">Obs: {item.obs}</p>}
                                  
                                  {/* Just modifier select */}
                                  <div className="flex items-center gap-1.5 mt-2 justify-center sm:justify-start">
                                    <span className="text-[10px] font-bold text-outline font-sans uppercase">Modificador:</span>
                                    <CustomSelect
                                      disabled={isLocked || userRole === 'dm'}
                                      value={item.modificador || ""}
                                      onChange={(e) => handleArmorModifierChange(item.id, e.target.value)}
                                      size="sm"
                                      variant="minimal"
                                      className="min-w-[160px]"
                                      options={[
                                        { value: "", label: "Nenhum Modificador" },
                                        ...armorMods.map((mod) => ({
                                          value: mod.nome,
                                          label: mod.nome,
                                          description: mod.descricao
                                        }))
                                      ]}
                                    />
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collapsible Catalog section */}
            {!isLocked && (
              <div className="hidden mt-4 border border-outline-variant bg-surface-container-low p-4 rounded-none">
                <button
                  type="button"
                  onClick={() => setIsArmadurasCollapsed(!isArmadurasCollapsed)}
                  className="w-full flex flex-col items-center justify-center text-primary hover:text-on-surface transition-colors"
                >
                  <span className="font-serif text-sm tracking-wider uppercase font-bold flex items-center gap-2 text-center justify-center">
                    Catálogo
                  </span>
                  <span className="text-xs font-mono text-primary mt-1 select-none">
                    {isArmadurasCollapsed ? "▼" : "▲"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {!isArmadurasCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-4">
                        {/* Available Catalog */}
                        <div className="border border-outline-variant p-3 bg-surface-container-lowest">
                          <h4 className="font-serif text-xs text-primary uppercase font-bold mb-2 tracking-wider text-center">
                            Armaduras e Escudos Disponíveis
                          </h4>
                          
                          <>
<input maxLength={50}
                            type="text"
                            value={armaduraSearchQuery}
                            onChange={(e) => setArmaduraSearchQuery(e.target.value)}
                            placeholder="Filtrar catálogo de armaduras/escudos por nome..."
                            className={`w-full bg-surface-container text-on-surface border border-outline-variant p-2 text-xs mb-3 focus:outline-none focus:ring-1 focus:ring-primary rounded-none ${armaduraSearchQuery?.length >= 50 ? '!text-red-500' : ''}`}
                          />
{armaduraSearchQuery?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              

                          {/* Limit visual to 5 items with scroll vertical */}
                          <div className="overflow-y-auto max-h-[220px] divide-y divide-outline-variant/40 pr-2 scrollbar-thin">
                            {armadurasCatalog.filter((arm) =>
                              arm.nome.toLowerCase().includes(armaduraSearchQuery.toLowerCase())
                            ).map((item, idx) => (
                              <div key={idx} className="py-2 flex justify-between items-center gap-2 sm:gap-4 overflow-hidden">
                                {/* MOBILE ONLY VIEW */}
                                <div className="sm:hidden text-left min-w-0 flex-1">
                                  <div className="text-xs font-bold text-on-surface leading-tight break-words pr-1">
                                    {item.nome}
                                  </div>
                                  <div className="text-[11px] text-outline font-mono mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5">
                                    <span>IP: <strong className="text-on-surface">{item.ip}</strong></span>
                                    <span>DEX: <strong className={item.penalidade_dex < 0 ? "text-red-400" : ""}>{item.penalidade_dex !== null ? item.penalidade_dex : "Esp."}</strong></span>
                                    <span>AGI: <strong className={item.penalidade_agi < 0 ? "text-red-400" : ""}>{item.penalidade_agi !== null ? item.penalidade_agi : "Esp."}</strong></span>
                                  </div>
                                  {item.obs && <p className="text-[10px] text-outline-variant italic mt-1 break-words" title={item.obs}>Obs: {item.obs}</p>}
                                </div>

                                {/* DESKTOP ONLY VIEW */}
                                <div className="hidden sm:block text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-row flex-nowrap">
                                    <span className="text-sm font-bold text-on-surface truncate" title={item.nome}>{item.nome}</span>
                                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 font-mono uppercase tracking-wider whitespace-nowrap shrink-0">
                                      IP: {item.ip}
                                    </span>
                                  </div>
                                  <div className="text-xs text-outline space-x-3 mt-0.5 font-mono">
                                    <span>DEX: <strong className={item.penalidade_dex < 0 ? "text-red-400" : ""}>{item.penalidade_dex !== null ? item.penalidade_dex : "Esp."}</strong></span>
                                    <span>AGI: <strong className={item.penalidade_agi < 0 ? "text-red-400" : ""}>{item.penalidade_agi !== null ? item.penalidade_agi : "Esp."}</strong></span>
                                  </div>
                                  {item.obs && <p className="text-[10px] text-outline-variant italic mt-1 truncate" title={item.obs}>Obs: {item.obs}</p>}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleAddArmor(item)}
                                  className="bg-primary/20 hover:bg-primary text-primary hover:text-on-surface transition-all text-xs font-mono py-1.5 px-2.5 sm:px-3 shrink-0"
                                >
                                  <span className="hidden sm:inline">+ Adicionar à Ficha</span>
                                  <span className="inline sm:hidden">+</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Section: Aprimoramentos */}
          <section className={highlightSectionClass('aprimoramentos', `space-y-4 pt-4 sheet-block-aprimoramentos ${validationErrors.includes('aprimoramentos_points') ? 'border border-red-500/50 bg-red-500/5 p-4' : ''} transition-all duration-300`)}>
            <h3 className="font-serif text-xl text-center text-primary tracking-widest uppercase">
              APRIMORAMENTOS
            </h3>

            {!isLocked && validationErrors.includes('aprimoramentos_points') && (
              <p className="text-center text-xs text-red-400 font-bold animate-pulse">
                Atenção: Você gastou mais pontos de aprimoramento do que o limite permitido (Saldo negativo)!
              </p>
            )}
            
            <div className="bg-surface-container p-4 sm:p-6 border border-outline-variant space-y-6">
              {/* Simplified Central Points Tracker */}
              {!isLocked && (
                <div className="bg-surface-container border border-outline-variant/40 p-3 flex flex-col items-center justify-center gap-1.5 text-center max-w-sm mx-auto">
                  <span className="text-[10px] uppercase tracking-widest text-outline-variant font-bold">Saldo de Aprimoramentos</span>
                  <div className={`text-xl font-mono font-black tracking-wider ${remainingPointsValue < 0 ? 'text-red-500 animate-pulse' : remainingPointsValue === 0 ? 'text-primary' : 'text-green-400'}`}>
                    {remainingPointsValue} pts
                  </div>
                  <p className="text-[10px] text-outline-variant/60 font-sans">
                    Começa com {5 + aprimoramentoExtra} pts ({5} base{aprimoramentoExtra > 0 ? ` + ${aprimoramentoExtra} da raça` : ''}) • Desvantagens dão até +3 pts
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column Positivos */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xs font-bold text-primary tracking-widest uppercase border-b border-outline-variant pb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      POSITIVOS
                    </span>
                    {!isLocked && (
                      <button
                        type="button"
                        disabled={remainingPointsValue <= 0}
                        onClick={() => {
                          setEnhancementModalType('POSITIVO');
                          setEnhancementSearchQuery('');
                          setSelectedEnhancement(null);
                          setIsEnhancementModalOpen(true);
                        }}
                        className={`p-1 transition-all flex items-center justify-center rounded ${
                          remainingPointsValue <= 0
                            ? 'text-outline-variant/30 bg-transparent cursor-not-allowed'
                            : 'text-primary hover:bg-primary/10 cursor-pointer'
                        }`}
                        title={remainingPointsValue <= 0 ? "Limite de vantagens atingido" : "Adicionar aprimoramento positivo"}
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    )}
                  </h4>

                  {!isLocked && remainingPointsValue <= 0 && (
                    <div className="bg-amber-950/20 border border-amber-500/30 text-secondary text-[10px] p-2 font-medium flex items-center gap-1.5 rounded-sm animate-pulse">
                      <span className="material-symbols-outlined text-xs text-secondary">warning</span>
                      <span>Você atingiu seu limite de vantagens (Saldo esgotado)</span>
                    </div>
                  )}

                  {visiblePositives.length === 0 ? (
                    <p className="text-[11px] text-outline-variant/40 italic py-2">Nenhum aprimoramento positivo adicionado.</p>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const renderHasFamiliares = (editedChar.aprimoramentosPositivos || []).some(s => s && s.toLowerCase().includes("familiares"));
                        const renderHasCoruja = renderHasFamiliares && (editedChar.familiar?.animalId?.toLowerCase() === 'coruja' || editedChar.familiar?.animalNome?.toLowerCase() === 'coruja');
                        
                        return visiblePositives.map((entry, idx) => {
                          const item = entry.value;
                          const isAdded = entry.diffStatus === 'added';
                          const isRemoved = entry.diffStatus === 'removed';
                          const info = getEnhancementCost(item, 'POSITIVO');
                          const isGratisPenumbra = renderHasCoruja && item.toLowerCase().includes("visão na penumbra");
                          
                          let containerClass = "border-b border-outline-variant/40 pb-2 flex items-start justify-between group gap-2";
                          if (isReviewMode && isAdded) {
                            containerClass = "p-2 border border-amber-500 border-2 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50 flex items-start justify-between group gap-2 rounded-sm";
                          } else if (isAdded) {
                            containerClass = "p-2 border border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30 flex items-start justify-between group gap-2 rounded-sm";
                          } else if (isRemoved) {
                            containerClass = "p-2 border border-red-500/30 bg-surface-container/15 opacity-75 flex items-start justify-between group gap-2 rounded-sm";
                          }

                          return (
                            <div key={idx} className={containerClass}>
                              <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-xs font-medium break-words ${isRemoved ? 'text-red-400 line-through' : (isReviewMode && isAdded) ? 'text-secondary font-bold' : isAdded ? 'text-emerald-400 font-bold' : 'text-on-surface'}`}>
                                    {info.name}
                                  </span>
                                  {isReviewMode && isAdded ? (
                                    <span className="text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                      Novo
                                    </span>
                                  ) : isAdded ? (
                                    <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                      Novo
                                    </span>
                                  ) : null}
                                  {isRemoved && (
                                    <span className="text-[8px] bg-surface-container/40 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                      Removido
                                    </span>
                                  )}
                                </div>
                                {info.level && (
                                  <span className={`text-[10px] font-bold ${isRemoved ? 'text-red-500/60 line-through' : 'text-primary'}`}>Nível {info.level}</span>
                                )}
                                {info.desc && (
                                  <span className={`text-[10px] italic leading-tight mt-0.5 break-words ${isRemoved ? 'text-red-500/40 line-through' : 'text-outline-variant/60'}`}>{info.desc}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs font-mono font-bold ${isRemoved ? 'text-red-400 line-through' : 'text-primary'}`}>
                                  {isGratisPenumbra ? "(Familiar)" : `-${info.cost} pts`}
                                </span>
                                {!isLocked && (
                                  <button
                                    type="button"
                                    disabled={isGratisPenumbra}
                                    onClick={() => {
                                      if (isGratisPenumbra) return;
                                      const arr = [...cleanAprimoramentosPositivos];
                                      const idxInArray = arr.indexOf(item);
                                      if (idxInArray !== -1) {
                                        arr.splice(idxInArray, 1);
                                        setEditedChar(prev => ({ ...prev, aprimoramentosPositivos: arr }));
                                      }
                                    }}
                                    className={`text-outline-variant hover:text-red-400 p-1 md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${isGratisPenumbra ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    title={isGratisPenumbra ? "Remover Familiar Coruja para retirar" : "Remover"}
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {/* Column Negativos */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xs font-bold text-primary tracking-widest uppercase border-b border-outline-variant pb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      NEGATIVOS
                    </span>
                    {!isLocked && (
                      <button
                        type="button"
                        disabled={totalNegativasPoints >= 3}
                        onClick={() => {
                          setEnhancementModalType('NEGATIVO');
                          setEnhancementSearchQuery('');
                          setSelectedEnhancement(null);
                          setIsEnhancementModalOpen(true);
                        }}
                        className={`p-1 transition-all flex items-center justify-center rounded ${
                          totalNegativasPoints >= 3
                            ? 'text-outline-variant/30 bg-transparent cursor-not-allowed'
                            : 'text-primary hover:bg-surface-container/10 cursor-pointer'
                        }`}
                        title={totalNegativasPoints >= 3 ? "Limite de desvantagens atingido" : "Adicionar aprimoramento negativo"}
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    )}
                  </h4>

                  {!isLocked && totalNegativasPoints >= 3 && (
                    <div className="bg-amber-950/20 border border-amber-500/30 text-secondary text-[10px] p-2 font-medium flex items-center gap-1.5 rounded-sm animate-pulse">
                      <span className="material-symbols-outlined text-xs text-secondary">warning</span>
                      <span>Você atingiu seu limite de desvantagens</span>
                    </div>
                  )}

                  {visibleNegatives.length === 0 ? (
                    <p className="text-[11px] text-outline-variant/40 italic py-2">Nenhum aprimoramento negativo adicionado.</p>
                  ) : (
                    <div className="space-y-3">
                      {visibleNegatives.map((entry, idx) => {
                        const item = entry.value;
                        const isAdded = entry.diffStatus === 'added';
                        const isRemoved = entry.diffStatus === 'removed';
                        const info = getEnhancementCost(item, 'NEGATIVO');

                        let containerClass = "border-b border-outline-variant/40 pb-2 flex items-start justify-between group gap-2";
                        if (isReviewMode && isAdded) {
                          containerClass = "p-2 border border-amber-500 border-2 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50 flex items-start justify-between group gap-2 rounded-sm";
                        } else if (isAdded) {
                          containerClass = "p-2 border border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30 flex items-start justify-between group gap-2 rounded-sm";
                        } else if (isRemoved) {
                          containerClass = "p-2 border border-red-500/30 bg-surface-container/15 opacity-75 flex items-start justify-between group gap-2 rounded-sm";
                        }

                        return (
                          <div key={idx} className={containerClass}>
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-xs font-medium break-words ${isRemoved ? 'text-red-400 line-through' : (isReviewMode && isAdded) ? 'text-secondary font-bold' : isAdded ? 'text-emerald-400 font-bold' : 'text-on-surface'}`}>
                                  {info.name}
                                </span>
                                {isReviewMode && isAdded ? (
                                  <span className="text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                    Novo
                                  </span>
                                ) : isAdded ? (
                                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                    Novo
                                  </span>
                                ) : null}
                                {isRemoved && (
                                  <span className="text-[8px] bg-surface-container/40 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                    Removido
                                  </span>
                                )}
                              </div>
                              {info.level && (
                                <span className={`text-[10px] font-bold ${isRemoved ? 'text-red-500/60 line-through' : 'text-primary'}`}>Nível {info.level}</span>
                              )}
                              {info.desc && (
                                <span className={`text-[10px] italic leading-tight mt-0.5 break-words ${isRemoved ? 'text-red-500/40 line-through' : 'text-outline-variant/60'}`}>{info.desc}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-mono font-bold ${isRemoved ? 'text-red-400 line-through' : 'text-primary'}`}>
                                +{info.cost} pts
                              </span>
                              {!isLocked && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = [...cleanAprimoramentosNegativos];
                                    const idxInArray = arr.indexOf(item);
                                    if (idxInArray !== -1) {
                                      arr.splice(idxInArray, 1);
                                      setEditedChar(prev => ({ ...prev, aprimoramentosNegativos: arr }));
                                    }
                                  }}
                                  className="text-outline-variant hover:text-red-400 p-1 md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                  title="Remover"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20">
                <label className="block text-[10px] font-sans font-bold tracking-widest text-outline uppercase mb-2">
                  Efeitos Adicionais
                </label>
                <>
<textarea maxLength={300}
                  value={editedChar.descricaoEfeitos}
                  onChange={(e) => handleDemographicChange('descricaoEfeitos', e.target.value)}
                  placeholder="Efeitos..."
                  disabled={isLocked}
                  className={`w-full h-24 bg-surface-container-lowest border border-outline-variant p-3 font-sans text-xs text-on-surface placeholder:text-outline-variant/40 focus:border-primary focus:ring-0 outline-none disabled:opacity-75 disabled:cursor-not-allowed ${editedChar.descricaoEfeitos?.length >= 300 ? '!text-red-500' : ''}`}
                />
{editedChar.descricaoEfeitos?.length >= 300 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (300)
      </div>
    )}
</>
              
              </div>
            </div>
          </section>

          {/* Versão Mobile do Bloco de Companheiros */}
          {(() => {
            if (!showCompanheirosSection) return null;
            
            return (
              <div className="block lg:hidden border-t border-outline-variant/20 pt-6 mt-6 sheet-block-companheiros-mobile">
                <h3 className="font-serif text-xl text-center text-primary tracking-widest uppercase mb-4">
                  Companheiros
                </h3>
                
                <div className="flex flex-col sm:flex-row justify-center items-stretch flex-wrap gap-6">
                  {/* Card 1: Companheiro Animal */}
                  {showCompanionAnimal && (
                    <button
                      type="button"
                      onClick={isCompAnimalModified ? () => setIsCompanionDiffModalOpen(true) : handleOpenCompanionAnimalModal}
                      className={`p-6 flex flex-col justify-between items-center text-center transition-all duration-300 min-h-[160px] w-full text-left relative overflow-hidden rounded-sm ${
                        isCompAnimalRemoved
                          ? 'bg-surface-container/40 border border-red-500/20'
                          : isCompAnimalAdded
                          ? 'bg-surface-container border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                          : isCompAnimalModified
                          ? 'bg-surface-container border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30 hover:bg-surface-container-low/40 cursor-pointer'
                          : 'bg-surface-container border border-outline-variant hover:bg-surface-container-low/40 hover:border-amber-500/50 cursor-pointer'
                      }`}
                    >
                      {/* Red Overlay for Removed */}
                      {isCompAnimalRemoved && (
                        <div className="absolute inset-0 bg-red-950/40 border border-red-500/50 flex flex-col items-center justify-center gap-2 pointer-events-auto z-20 cursor-not-allowed">
                          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded uppercase font-bold tracking-wider font-sans">
                            Removido
                          </span>
                        </div>
                      )}

                      {/* Status Badges */}
                      {isCompAnimalAdded && (
                        <span className="absolute top-2 right-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                          Adicionado
                        </span>
                      )}
                      {isCompAnimalModified && (
                        <span className="absolute top-2 right-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                          Modificado
                        </span>
                      )}

                      <div className="w-full">
                        <div className="flex items-center justify-center mb-3 border-b border-outline-variant/30 pb-2">
                          <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider text-center">
                            {editedChar.companionAnimal?.nomeAnimal || "Companheiro animal"}
                          </h4>
                        </div>
                        
                        <p className="text-xs text-on-surface-variant leading-relaxed text-center">
                          Seu fiel companheiro do reino animal
                        </p>
                        
                        {editedChar.companionAnimal?.tipoAnimal && (
                          <p className="text-[10px] font-mono text-outline italic mt-2 text-center uppercase tracking-wider">
                            {editedChar.companionAnimal.tipoAnimal}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-secondary">
                        {isCompAnimalModified ? (
                          <>
                            <span className="material-symbols-outlined text-[14px]">difference</span>
                            <span>Ver Alterações</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Gerenciar Ficha</span>
                          </>
                        )}
                      </div>
                    </button>
                  )}
                  
                  {/* Card 2: Montaria Especial */}
                  {showMontaria && (
                    <button
                      type="button"
                      onClick={isMontariaModified ? () => setIsMontariaDiffModalOpen(true) : handleOpenMontariaModal}
                      className={`p-6 flex flex-col justify-between items-center text-center transition-all duration-300 min-h-[160px] w-full text-left relative overflow-hidden rounded-sm ${
                        isMontariaRemoved
                          ? 'bg-surface-container/40 border border-red-500/20'
                          : isMontariaAdded
                          ? 'bg-surface-container border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                          : isMontariaModified
                          ? 'bg-surface-container border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30 hover:bg-surface-container-low/40 cursor-pointer'
                          : 'bg-surface-container border border-outline-variant hover:bg-surface-container-low/40 hover:border-amber-500/50 cursor-pointer'
                      }`}
                    >
                      {/* Red Overlay for Removed */}
                      {isMontariaRemoved && (
                        <div className="absolute inset-0 bg-red-950/40 border border-red-500/50 flex flex-col items-center justify-center gap-2 pointer-events-auto z-20 cursor-not-allowed">
                          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded uppercase font-bold tracking-wider font-sans">
                            Removido
                          </span>
                        </div>
                      )}

                      {/* Status Badges */}
                      {isMontariaAdded && (
                        <span className="absolute top-2 right-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                          Adicionado
                        </span>
                      )}
                      {isMontariaModified && (
                        <span className="absolute top-2 right-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                          Modificado
                        </span>
                      )}

                      <div className="w-full">
                        <div className="flex items-center justify-center mb-3 border-b border-outline-variant/30 pb-2">
                          <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider text-center">
                            {editedChar.montariaEspecial?.nome || "Montaria Especial"}
                          </h4>
                        </div>
                        
                        <p className="text-xs text-on-surface-variant leading-relaxed text-center">
                          Uma montaria única e extraordinária concedida através de seu aprimoramento.
                        </p>
                        
                        {editedChar.montariaEspecial?.animalId && (
                          <p className="text-[10px] font-mono text-outline italic mt-2 text-center uppercase tracking-wider">
                            {montariasBase.find(m => m.id === editedChar.montariaEspecial?.animalId)?.nome || "Montaria"}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-secondary">
                        {isMontariaModified ? (
                          <>
                            <span className="material-symbols-outlined text-[14px]">difference</span>
                            <span>Ver Alterações</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Gerenciar Ficha</span>
                          </>
                        )}
                      </div>
                    </button>
                  )}
                  
                  {/* Card 3: Familiares */}
                  {showFamiliar && (
                    <button
                      type="button"
                      onClick={isFamiliarModified ? () => setIsFamiliarDiffModalOpen(true) : handleOpenFamiliarModal}
                      className={`p-6 flex flex-col justify-between items-center text-center transition-all duration-300 min-h-[160px] w-full text-left relative overflow-hidden rounded-sm ${
                        isFamiliarRemoved
                          ? 'bg-surface-container/40 border border-red-500/20'
                          : isFamiliarAdded
                          ? 'bg-surface-container border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                          : isFamiliarModified
                          ? 'bg-surface-container border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30 hover:bg-surface-container-low/40 cursor-pointer'
                          : 'bg-surface-container border border-outline-variant hover:bg-surface-container-low/40 hover:border-amber-500/50 cursor-pointer'
                      }`}
                    >
                      {/* Red Overlay for Removed */}
                      {isFamiliarRemoved && (
                        <div className="absolute inset-0 bg-red-950/40 border border-red-500/50 flex flex-col items-center justify-center gap-2 pointer-events-auto z-20 cursor-not-allowed">
                          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded uppercase font-bold tracking-wider font-sans">
                            Removido
                          </span>
                        </div>
                      )}

                      {/* Status Badges */}
                      {isFamiliarAdded && (
                        <span className="absolute top-2 right-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                          Adicionado
                        </span>
                      )}
                      {isFamiliarModified && (
                        <span className="absolute top-2 right-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                          Modificado
                        </span>
                      )}

                      <div className="w-full">
                        <div className="flex items-center justify-center mb-3 border-b border-outline-variant/30 pb-2">
                          <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider text-center">
                            {editedChar.familiar?.nome || "Familiar"}
                          </h4>
                        </div>
                        
                        <p className="text-xs text-on-surface-variant leading-relaxed text-center">
                          Um ser mágico ligado à alma de seu mestre conjurador para servir como assistente e canalizador arcano.
                        </p>
                        
                        {editedChar.familiar?.animalNome && (
                          <p className="text-[10px] font-mono text-outline italic mt-2 text-center uppercase tracking-wider">
                            {editedChar.familiar.animalNome}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-secondary">
                        {isFamiliarModified ? (
                          <>
                            <span className="material-symbols-outlined text-[14px]">difference</span>
                            <span>Ver Alterações</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Gerenciar Ficha</span>
                          </>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right side static column: Image, Campaign settings, Perícias */}
        <div className="lg:col-span-4 space-y-8 flex flex-col h-full sheet-right-col">


          {/* Portrait Photo Section (Clickable) */}
          <div className="bg-surface-container border border-outline-variant p-5 space-y-4 sheet-block-picture">
            <div 
              onClick={() => {
                if (!isLocked) setIsPortraitModalOpen(true);
              }}
              className={`aspect-[4/5] bg-surface-container-lowest border border-outline-variant/60 relative overflow-hidden group rounded-none shadow-lg transition-all duration-500 ease-out ${
                isLocked ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] hover:border-primary hover:shadow-primary/10 hover:shadow-2xl'
              }`}
              title={isLocked ? undefined : "Clique para editar o retrato"}
            >
              {!hasValidPortrait ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4 bg-surface-container transition-colors duration-500 group-hover:bg-surface-container-high">
                  <div className="w-16 h-16 rounded-full bg-outline-variant/10 border border-outline-variant/30 flex items-center justify-center mb-1 transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary/5">
                    <span className="material-symbols-outlined text-primary text-4xl transition-transform duration-500 group-hover:scale-110">person</span>
                  </div>
                  <span className="text-[11px] font-sans font-bold tracking-wider text-outline uppercase transition-colors duration-500 group-hover:text-primary">
                    {!editedChar.portraitUrl ? "Adicionar Retrato" : "Retrato Indisponível"}
                  </span>
                  {!isLocked && (
                    <span className="text-[9px] text-outline-variant/60 font-sans italic transition-colors duration-500 group-hover:text-outline-variant">
                      Clique para definir
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <img
                    alt="Retrato da alma"
                    className="w-full h-full object-cover filter contrast-[1.05]  transition-all duration-700 opacity-95 group-hover:scale-105 group-hover:opacity-100"
                    source-alt="Portrait visual"
                    src={editedChar.portraitUrl}
                    onError={() => setPortraitError(true)}
                  />
                </>
              )}
            </div>
          </div>

          {/* Perícias (Skills) Tracker */}
          <section className={highlightSectionClass('pericias', "bg-surface-container border border-outline-variant p-3 sm:p-5 flex-grow lg:flex-1 h-auto lg:h-full flex flex-col min-h-0 lg:min-h-[500px] sheet-block-skills transition-all duration-300")}>
            <h3 className="font-serif text-lg text-center text-primary tracking-widest uppercase mb-4">
              Perícias
            </h3>

            {/* Caixa com o saldo de pontos das perícias */}
            {!isLocked && (
              <div className="bg-surface-container border border-outline-variant/40 p-3 mb-4 flex flex-col items-center justify-center gap-1.5 text-center max-w-sm mx-auto w-full">
                <span className="text-[10px] uppercase tracking-widest text-outline-variant font-bold">Saldo de Perícias</span>
                <div className={`text-xl font-mono font-black tracking-wider ${remainingSkillsPoints < 0 ? 'text-red-500 animate-pulse' : remainingSkillsPoints === 0 ? 'text-primary' : 'text-green-400'}`}>
                  {remainingSkillsPoints} / {allowedSkillsPoints} pts
                </div>
                <p className="text-[10px] text-outline-variant/60 font-sans leading-snug">
                  Base Nível 1: (Idade × 10) + (Inteligência × 5){periciaExtra > 0 ? ` + ${periciaExtra} da raça` : ''}
                  {currentL > 1 && ` | +${extraPericias} bônus por nível`}
                </p>
              </div>
            )}

            {/* Avisos de limite e balanceamento */}
            {!isLocked && showSkillsCapWarning && (
              <div className="bg-surface-container/20 border border-primary/30 text-primary text-[10px] p-2 font-medium flex items-center gap-1.5 rounded-sm mb-3 animate-pulse">
                <span className="material-symbols-outlined text-xs text-primary">warning</span>
                <span>Pontos limitados ao máximo de 500 permitido pelo livro.</span>
              </div>
            )}

            {!isLocked && showSkillsBalanceWarning && (
              <div className="bg-amber-950/20 border border-amber-500/30 text-secondary text-[10px] p-2 font-medium flex items-center gap-1.5 rounded-sm mb-3">
                <span className="material-symbols-outlined text-xs text-secondary">info</span>
                <span>Seu personagem pode estar desbalanceado. É necessária a análise do mestre.</span>
              </div>
            )}

            <div className="bg-surface-container-lowest border border-outline-variant/80 flex-grow flex flex-col justify-between overflow-x-hidden md:overflow-x-auto custom-scrollbar">
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-[10px] font-sans border-collapse table-fixed">
                  <thead>
                    <tr className="bg-surface-container-highest text-on-surface-variant font-bold tracking-widest uppercase border-b border-outline-variant text-[9px] sm:text-[10px]">
                      <th className="p-2 sm:p-2.5 px-2 sm:px-3 text-left w-[33%] sm:w-[35%]">Perícia</th>
                      <th className="p-2 sm:p-2.5 px-2 sm:px-3 text-right w-[67%] sm:w-[65%]">PTS. + ATR. = %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 font-mono">
                    {visibleSkills.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-outline-variant/50 text-xs italic font-sans animate-fade-in">
                          Nenhuma perícia distribuída.
                        </td>
                      </tr>
                    ) : (() => {
                      return visibleSkills.map((skill, idx) => {
                        const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
                          skill.group,
                          skill.baseAttr,
                          skill.chosenSubgroup,
                          skill.subgrupos,
                          editedChar.attributes
                        );
                        const isZeroAttr = resolvedAttrKey === null;
                        const isCombat = !!skill.requer_ataque_defesa;
                        const displayName = skill.chosenSubgroup || skill.group;

                        // Calculate Obra-Prima and Magic weapon skill bonuses
                        const obraPrimaSkillBonus = calculateObraPrimaBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items);
                        const magicWeaponSkillBonus = calculateMagicWeaponBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items);
                        const armaPreferencialBonus = calculateArmaPreferencialBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items, Number(editedChar.level) || 1);
                        const corpoMaleavelBonus = calculateCorpoMaleavelBonus(skill.group, skill.chosenSubgroup, editedChar.aprimoramentosPositivos);
                        const familiarBonus = calculateFamiliarSkillBonus(skill.group, skill.chosenSubgroup, resolvedAttrKey, editedChar.aprimoramentosPositivos, editedChar.familiar);
                        const racialSkillBonus = getRacialFreePointsForSkill(skill.group, skill.chosenSubgroup, editedChar.race, racasData);
                        const malditaWeaponPenalty = calculateMalditaWeaponPenaltyForSkill(skill.group, skill.chosenSubgroup, editedChar.items);
                        const malditaWeaponPenaltyAtkDef = Math.floor(malditaWeaponPenalty / 2);

                        const totalVal = attrVal + (Number(skill.gasto) || 0) + obraPrimaSkillBonus + magicWeaponSkillBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus - malditaWeaponPenalty;

                        const isRemoved = skill.diffStatus === 'removed';
                        const isAdded = skill.diffStatus === 'added';
                        const isModified = skill.diffStatus === 'modified';

                        return (
                          <tr 
                            key={idx} 
                            className={`transition-all ${
                              isRemoved 
                                ? 'bg-surface-container/15 text-red-400 line-through border border-primary/30 hover:bg-surface-container/25' 
                                : isAdded 
                                  ? 'bg-surface-container/15 ring-2 ring-emerald-500/50 hover:bg-surface-container/25' 
                                  : isModified 
                                    ? 'bg-surface-container/15 ring-2 ring-amber-500/50 hover:bg-surface-container/25' 
                                    : 'hover:bg-surface-container-high/10'
                            }`}
                          >
                            <td className={`p-2 sm:p-3 px-2 sm:px-3 text-left font-sans text-[11px] sm:text-xs font-bold whitespace-normal break-words ${isRemoved ? 'text-red-400/80' : 'text-on-surface'}`}>
                               {displayName}
                              {isAdded && (
                                <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 font-sans font-bold border border-emerald-500/30 px-1 py-0.5 uppercase tracking-widest rounded-sm">
                                  Novo
                                </span>
                              )}
                              {isModified && (
                                <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary font-sans font-bold border border-amber-500/30 px-1 py-0.5 uppercase tracking-widest rounded-sm">
                                  Editado
                                </span>
                              )}
                              {obraPrimaSkillBonus > 0 && (
                                <span className="ml-1.5 text-[10px] text-green-400 font-sans font-normal font-mono">
                                  (+10% Obra-prima)
                                </span>
                              )}
                              {magicWeaponSkillBonus > 0 && (
                                <span className="ml-1.5 text-[10px] text-cyan-400 font-sans font-normal font-mono">
                                  (+{magicWeaponSkillBonus}% Mágico)
                                </span>
                              )}
                              {armaPreferencialBonus > 0 && (
                                <span className="ml-1.5 text-[10px] text-primary font-sans font-normal font-mono">
                                  (+{armaPreferencialBonus}% Arma Preferencial)
                                </span>
                              )}
                              {corpoMaleavelBonus > 0 && (
                                <span className="ml-1.5 text-[10px] text-green-400 font-sans font-normal font-mono">
                                  (+10% Corpo Maleável)
                                </span>
                              )}
                              {familiarBonus > 0 && (
                                <span className="ml-1.5 text-[10px] text-green-400 font-sans font-normal font-mono">
                                  (+10% Familiar)
                                </span>
                              )}
                              {racialSkillBonus > 0 && (
                                <span className="ml-1.5 text-[10px] text-green-400 font-sans font-normal font-mono">
                                  (+{racialSkillBonus}% Raça)
                                </span>
                              )}
                              {malditaWeaponPenalty > 0 && (
                                <span className="ml-1.5 text-[10px] text-red-400 font-sans font-normal font-mono">
                                  (-{malditaWeaponPenalty}% Maldito)
                                </span>
                              )}
                            </td>
                            <td className="p-2 sm:p-3 px-2 sm:px-3 text-right font-mono text-[10px] sm:text-xs text-outline-variant whitespace-nowrap">
                              {isZeroAttr ? (
                                // Rule 3: Technical Zero Attribute Skill
                                <>
                                  <span className={`mr-1.5 sm:mr-2.5 ${isRemoved ? 'text-red-400/60 line-through' : 'text-on-surface/90'}`}>{skill.gasto}</span>
                                  <span className="text-outline-variant/60 mr-1.5 sm:mr-2.5">+</span>
                                  <span className={`mr-2 sm:mr-4 font-mono text-[9px] sm:text-xs uppercase ${isRemoved ? 'text-red-400/50 line-through' : 'text-on-surface/40'}`}>
                                    TÉC(0)
                                  </span>
                                  <span className={`font-bold text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 min-w-[30px] sm:min-w-[45px] inline-block text-center rounded-sm border ${
                                    isRemoved 
                                      ? 'text-red-500 bg-surface-container/10 border-primary/20 line-through' 
                                      : 'text-primary bg-surface-container/5 border-primary/20'
                                  }`}>
                                    {(Number(skill.gasto) || 0) + obraPrimaSkillBonus + magicWeaponSkillBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus - malditaWeaponPenalty}%
                                  </span>
                                </>
                              ) : isCombat ? (
                                // Rule 1: Combat Skill Display
                                <div className="inline-flex items-center justify-end flex-nowrap">
                                  <span className={isRemoved ? 'text-red-400/60 line-through' : 'text-on-surface/90'}>{skill.atkGasto ?? 0}/{skill.defGasto ?? 0}</span>
                                  <span className="text-outline-variant/50 mx-1">+</span>
                                  <span className={`font-mono text-[9px] sm:text-xs uppercase mr-1 ${isRemoved ? 'text-red-400/50 line-through' : 'text-on-surface'}`}>{resolvedAttrKey}({attrVal})</span>
                                  <span className={`font-bold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 inline-block text-center rounded-sm ml-1.5 border ${
                                    isRemoved 
                                      ? 'text-red-500 bg-surface-container/10 border-primary/20 line-through' 
                                      : 'text-primary bg-surface-container/5 border-primary/20'
                                  }`}>
                                    {(Number(skill.atkGasto ?? 0) + attrVal + obraPrimaSkillBonus + Math.floor(magicWeaponSkillBonus / 2) + Math.floor(armaPreferencialBonus / 2) + corpoMaleavelBonus + familiarBonus - malditaWeaponPenaltyAtkDef)}%/{(Number(skill.defGasto ?? 0) + attrVal + obraPrimaSkillBonus + Math.floor(magicWeaponSkillBonus / 2) + Math.floor(armaPreferencialBonus / 2) + corpoMaleavelBonus + familiarBonus - malditaWeaponPenaltyAtkDef)}%
                                  </span>
                                </div>
                              ) : (
                                // Standard Skill Row
                                <>
                                  <span className={`mr-1.5 sm:mr-2.5 ${isRemoved ? 'text-red-400/60 line-through' : 'text-on-surface/90'}`}>{skill.gasto}</span>
                                  <span className="text-outline-variant/60 mr-1.5 sm:mr-2.5">+</span>
                                  <span className={`mr-2 sm:mr-4 font-mono text-[9px] sm:text-xs uppercase ${isRemoved ? 'text-red-400/50 line-through' : 'text-on-surface'}`}>
                                    {resolvedAttrKey}({attrVal})
                                  </span>
                                  <span className={`font-bold text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 min-w-[30px] sm:min-w-[45px] inline-block text-center rounded-sm border ${
                                    isRemoved 
                                      ? 'text-red-500 bg-surface-container/10 border-primary/20 line-through' 
                                      : 'text-primary bg-surface-container/5 border-primary/20'
                                  }`}>
                                    {totalVal}%
                                  </span>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                    {/* Botão de Adicionar como uma linha dentro das perícias */}
                    {!isCoreLocked && (
                      <tr className="hover:bg-surface-container-high/10 transition-colors">
                        <td colSpan={2} className="p-3">
                          <button
                            type="button"
                            onClick={handleOpenPericiasModal}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-sans font-bold bg-surface-container/10 border border-dashed border-primary/30 hover:bg-surface-container/20 text-primary tracking-widest transition-all uppercase cursor-pointer rounded-none"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Gerenciar Perícias
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-2 border-t border-outline-variant/30 bg-surface-container flex justify-end items-center px-4">
                <span className="font-sans text-[9px] text-on-surface-variant/60 py-1.5">* Auto calculados</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Section: Companheiros List */}
      {(() => {
        if (!showCompanheirosSection) return null;
        
        return (
          <section className="bg-surface-container-low border border-outline-variant p-4 sm:p-6 max-w-7xl mx-auto mb-8 sheet-block-companheiros hidden lg:block">
            <div className="text-center mb-6">
              <h3 className="font-serif text-lg text-primary tracking-widest uppercase">
                Companheiros
              </h3>
            </div>
            
            <div className="flex flex-row justify-center items-stretch flex-wrap gap-6 max-w-4xl mx-auto">
              {/* Card 1: Companheiro Animal */}
              {showCompanionAnimal && (
                <button
                  type="button"
                  onClick={isCompAnimalModified ? () => setIsCompanionDiffModalOpen(true) : handleOpenCompanionAnimalModal}
                  className={`p-6 flex flex-col justify-between items-center text-center transition-all duration-300 min-h-[160px] w-[280px] text-left relative overflow-hidden rounded-sm ${
                    isCompAnimalRemoved
                      ? 'bg-surface-container/10 border border-red-500/20 opacity-75'
                      : isCompAnimalAdded
                      ? 'bg-emerald-950/20 border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                      : isCompAnimalModified
                      ? 'bg-amber-950/20 border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30 hover:bg-surface-container-low/40 cursor-pointer'
                      : 'bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low/40 hover:border-amber-500/50 cursor-pointer'
                  }`}
                >
                  {/* Red Overlay for Removed */}
                  {isCompAnimalRemoved && (
                    <div className="absolute inset-0 bg-red-950/80 border border-red-500/50 flex flex-col items-center justify-center gap-2 pointer-events-auto z-20 cursor-not-allowed">
                      <span className="text-[10px] bg-red-600 text-on-surface border border-red-500/30 px-2.5 py-1 uppercase font-bold tracking-wider font-sans">
                        [REMOVIDO]
                      </span>
                    </div>
                  )}

                  {/* Status Badges */}
                  {isCompAnimalAdded && (
                    <span className="absolute top-2 right-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                      Adicionado
                    </span>
                  )}
                  {isCompAnimalModified && (
                    <span className="absolute top-2 right-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                      Modificado
                    </span>
                  )}

                  <div className="w-full">
                    <div className="flex items-center justify-center mb-3 border-b border-outline-variant/30 pb-2">
                      <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider text-center">
                        {editedChar.companionAnimal?.nomeAnimal || "Companheiro animal"}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-on-surface-variant leading-relaxed text-center">
                      Seu fiel companheiro do reino animal
                    </p>
                    
                    {editedChar.companionAnimal?.tipoAnimal && (
                      <p className="text-[10px] font-mono text-outline italic mt-2 text-center uppercase tracking-wider">
                        {editedChar.companionAnimal.tipoAnimal}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-secondary">
                    {isCompAnimalModified ? (
                      <>
                        <span className="material-symbols-outlined text-[14px]">difference</span>
                        <span>Ver Alterações</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        <span>Gerenciar Ficha</span>
                      </>
                    )}
                  </div>
                </button>
              )}
              
              {/* Card 2: Montaria Especial */}
              {showMontaria && (
                <button
                  type="button"
                  onClick={isMontariaModified ? () => setIsMontariaDiffModalOpen(true) : handleOpenMontariaModal}
                  className={`p-6 flex flex-col justify-between items-center text-center transition-all duration-300 min-h-[160px] w-[280px] text-left relative overflow-hidden rounded-sm ${
                    isMontariaRemoved
                      ? 'bg-surface-container/10 border border-red-500/20 opacity-75'
                      : isMontariaAdded
                      ? 'bg-emerald-950/20 border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                      : isMontariaModified
                      ? 'bg-amber-950/20 border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30 hover:bg-surface-container-low/40 cursor-pointer'
                      : 'bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low/40 hover:border-amber-500/50 cursor-pointer'
                  }`}
                >
                  {/* Red Overlay for Removed */}
                  {isMontariaRemoved && (
                    <div className="absolute inset-0 bg-red-950/80 border border-red-500/50 flex flex-col items-center justify-center gap-2 pointer-events-auto z-20 cursor-not-allowed">
                      <span className="text-[10px] bg-red-600 text-on-surface border border-red-500/30 px-2.5 py-1 uppercase font-bold tracking-wider font-sans">
                        [REMOVIDO]
                      </span>
                    </div>
                  )}

                  {/* Status Badges */}
                  {isMontariaAdded && (
                    <span className="absolute top-2 right-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                      Adicionado
                    </span>
                  )}
                  {isMontariaModified && (
                    <span className="absolute top-2 right-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                      Modificado
                    </span>
                  )}

                  <div className="w-full">
                    <div className="flex items-center justify-center mb-3 border-b border-outline-variant/30 pb-2">
                      <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider text-center">
                        {editedChar.montariaEspecial?.nome || "Montaria Especial"}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-on-surface-variant leading-relaxed text-center">
                      Uma montaria única e extraordinária concedida através de seu aprimoramento.
                    </p>
                    
                    {editedChar.montariaEspecial?.animalId && (
                      <p className="text-[10px] font-mono text-outline italic mt-2 text-center uppercase tracking-wider">
                        {montariasBase.find(m => m.id === editedChar.montariaEspecial?.animalId)?.nome || "Montaria"}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-secondary">
                    {isMontariaModified ? (
                      <>
                        <span className="material-symbols-outlined text-[14px]">difference</span>
                        <span>Ver Alterações</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        <span>Gerenciar Ficha</span>
                      </>
                    )}
                  </div>
                </button>
              )}
              
              {/* Card 3: Familiares */}
              {showFamiliar && (
                <button
                  type="button"
                  onClick={isFamiliarModified ? () => setIsFamiliarDiffModalOpen(true) : handleOpenFamiliarModal}
                  className={`p-6 flex flex-col justify-between items-center text-center transition-all duration-300 min-h-[160px] w-[280px] text-left relative overflow-hidden rounded-sm ${
                    isFamiliarRemoved
                      ? 'bg-surface-container/10 border border-red-500/20 opacity-75'
                      : isFamiliarAdded
                      ? 'bg-emerald-950/20 border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                      : isFamiliarModified
                      ? 'bg-amber-950/20 border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30 hover:bg-surface-container-low/40 cursor-pointer'
                      : 'bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low/40 hover:border-amber-500/50 cursor-pointer'
                  }`}
                >
                  {/* Red Overlay for Removed */}
                  {isFamiliarRemoved && (
                    <div className="absolute inset-0 bg-red-950/80 border border-red-500/50 flex flex-col items-center justify-center gap-2 pointer-events-auto z-20 cursor-not-allowed">
                      <span className="text-[10px] bg-red-600 text-on-surface border border-red-500/30 px-2.5 py-1 uppercase font-bold tracking-wider font-sans">
                        [REMOVIDO]
                      </span>
                    </div>
                  )}

                  {/* Status Badges */}
                  {isFamiliarAdded && (
                    <span className="absolute top-2 right-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                      Adicionado
                    </span>
                  )}
                  {isFamiliarModified && (
                    <span className="absolute top-2 right-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                      Modificado
                    </span>
                  )}

                  <div className="w-full">
                    <div className="flex items-center justify-center mb-3 border-b border-outline-variant/30 pb-2">
                      <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider text-center">
                        {editedChar.familiar?.nome || "Familiar"}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-on-surface-variant leading-relaxed text-center">
                      Um ser mágico ligado à alma de seu mestre conjurador para servir como assistente e canalizador arcano.
                    </p>
                    
                    {editedChar.familiar?.animalNome && (
                      <p className="text-[10px] font-mono text-outline italic mt-2 text-center uppercase tracking-wider">
                        {editedChar.familiar.animalNome}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-secondary">
                    {isFamiliarModified ? (
                      <>
                        <span className="material-symbols-outlined text-[14px]">difference</span>
                        <span>Ver Alterações</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        <span>Gerenciar Ficha</span>
                      </>
                    )}
                  </div>
                </button>
              )}
            </div>
          </section>
        );
      })()}

      {/* Section: Itens List */}
      {(() => {
        const itemsWithIndices = visibleItems
          .filter(({ item }) => item !== "" && item !== null && item !== undefined);
        
        const armasFiltered = itemsWithIndices.filter(({ item }) => {
          if (typeof item === 'object') {
            if (item.forcarEmItens) return false;
            return item.categoria === 'armas' || item.categoria === 'arma';
          }
          return false;
        });

        const armadurasFiltered = itemsWithIndices.filter(({ item }) => {
          if (typeof item === 'object') {
            if (item.forcarEmItens) return false;
            return item.categoria === 'armadura' || item.categoria === 'escudo';
          }
          return false;
        });

        const outrosFiltered = itemsWithIndices.filter(({ item, diffStatus }) => {
          if (diffStatus === 'removed') return false;
          if (typeof item === 'string') return true;
          if (item && item.forcarEmItens) return true;
          return item.categoria !== 'armas' && item.categoria !== 'arma' && item.categoria !== 'armadura' && item.categoria !== 'escudo';
        });

        return (
          <section className={highlightSectionClass('itens', "bg-surface-container-low border border-outline-variant p-4 sm:p-6 max-w-7xl mx-auto mb-8 sheet-block-itens transition-all duration-300")}>
            <div className="text-center mb-6">
              <h3 className="font-serif text-lg text-primary tracking-widest uppercase">
                inventário
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Col 1: Armas */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-2">
                  <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                    Armas
                  </h4>
                   <button
                    type="button"
                    disabled={isLocked || userRole === 'dm'}
                    onClick={() => {
                      setActiveItemCategory('armas');
                      setOpenedFromCard('armas');
                      setIsItensModalOpen(true);
                    }}
                    className={`w-8 h-8 flex items-center justify-center transition-all text-lg font-bold border rounded-none shrink-0 ${
                      (isLocked || userRole === 'dm')
                        ? 'bg-outline-variant/5 text-outline-variant/40 border-outline-variant/20 cursor-not-allowed'
                        : 'bg-amber-500/10 hover:bg-amber-500/25 text-secondary hover:text-on-surface border-amber-500/30 cursor-pointer'
                    }`}
                    title="Adicionar Arma"
                  >
                    +
                  </button>
                </div>
                
                <div className="flex-grow space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {armasFiltered.length === 0 ? (
                    <p className="text-xs text-outline italic text-center py-6 border border-dashed border-outline-variant/20 bg-surface-container-low/20">
                      Nenhuma arma adicionada ainda.
                    </p>
                  ) : (
                    armasFiltered.map(({ item, idx, diffStatus }) => {
                      const wpnModifiers = modificadoresCatalog.filter(mod => mod.categoria === "modificadores_armas");
                      const weaponType = item.alcance ? "Arma de Longo Alcance" : "Armas Brancas";
                      const isRedHighlight = !!item.hasArmaAmuletoMaldito;
                      const isBlueHighlight = !!item.hasAcertoCritico || !!item.hasArmaAmuletoMagico || !!item.hasAcuideArma;
                      const isGoldHighlight = !!item.hasArmaPreferencial;
                      const isAdded = diffStatus === 'added';
                      const isRemoved = diffStatus === 'removed';

                      const origItem = originalChar?.items?.find((o: any) => {
                        const oName = typeof o === 'object' ? o.item : o;
                        return oName === item.item;
                      });
                      const isWeaponMoved = !!(isReviewMode && origItem && typeof origItem === 'object' && origItem.forcarEmItens === true && !item.forcarEmItens);
                      const isModifierChanged = !!(isReviewMode && item.modificador !== (origItem && typeof origItem === 'object' ? origItem.modificador : ""));

                      let highlightClass = isRedHighlight
                        ? 'border-red-500 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                        : isBlueHighlight 
                          ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                          : isGoldHighlight
                            ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            : 'border-outline-variant/50 bg-surface-container/60 hover:border-amber-500/30';

                      if (isAdded) {
                        highlightClass = 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30';
                      } else if (isRemoved) {
                        highlightClass = 'border-primary/30 bg-surface-container/15 opacity-75';
                      }

                      if (isReviewMode && (isAdded || isWeaponMoved)) {
                        highlightClass = 'border-amber-500 border-2 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50';
                      }

                      return (
                        <div key={idx} className={`p-3 border transition-all flex flex-col gap-2.5 w-full relative ${highlightClass}`}>
                          {/* Overlay for removed weapon */}
                          {isRemoved && (
                            <div className="absolute inset-0 bg-red-950/80 border border-red-500/50 flex flex-col items-center justify-center z-10 p-2 text-center">
                              <span className="bg-red-600 text-on-surface text-[10px] font-bold px-2 py-1 uppercase tracking-wider font-sans">
                                [REMOVIDO]
                              </span>
                            </div>
                          )}

                          {/* PC and Tablet header view (sm and up) */}
                          <div className="hidden sm:flex justify-between items-center w-full gap-2 text-left">
                            <span className={`text-sm font-bold font-sans truncate ${
                              isRemoved ? 'text-red-400 line-through' : (isReviewMode && (isAdded || isWeaponMoved)) ? 'text-secondary' : isAdded ? 'text-emerald-400' : 'text-on-surface'
                            }`}>
                              {item.item}
                              {isReviewMode && (isAdded || isWeaponMoved) ? (
                                <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                  {isAdded ? "Novo" : "Movido"}
                                </span>
                              ) : isAdded ? (
                                <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                  Novo
                                </span>
                              ) : null}
                              {isRemoved && (
                                <span className="ml-1.5 text-[8px] bg-surface-container/40 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                  Removido
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <CustomSelect
                                disabled={isLocked || userRole === 'dm' || isRemoved}
                                value={item.modificador || ""}
                                onChange={(e) => handleItemModifierChange(idx, e.target.value)}
                                size="sm"
                                variant="minimal"
                                className="min-w-[150px]"
                                options={[
                                  { value: "", label: "Sem Modificador" },
                                  ...wpnModifiers.map((mod) => ({
                                    value: mod.nome,
                                    label: mod.nome,
                                    description: mod.descricao
                                  }))
                                ]}
                              />
                              {!isLocked && userRole !== 'dm' && !isRemoved && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGeneralItem(idx)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 transition-all outline-none border-0 rounded-none cursor-pointer"
                                  title="Remover Arma"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Mobile header view (under sm breakpoint) */}
                          <div className="flex sm:hidden justify-between items-center w-full gap-2 text-left">
                            <span className={`text-sm font-bold font-sans truncate ${
                              isRemoved ? 'text-red-400 line-through' : (isReviewMode && (isAdded || isWeaponMoved)) ? 'text-secondary' : isAdded ? 'text-emerald-400' : 'text-on-surface'
                            }`}>
                              {item.item}
                              {isReviewMode && (isAdded || isWeaponMoved) ? (
                                <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                  {isAdded ? "Novo" : "Movido"}
                                </span>
                              ) : isAdded ? (
                                <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                  Novo
                                </span>
                              ) : null}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {!isLocked && userRole !== 'dm' && !isRemoved && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGeneralItem(idx)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 transition-all outline-none border-0 rounded-none cursor-pointer"
                                  title="Remover Arma"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                           {/* Categoria e preço */}
                          <div className="flex items-center gap-2 flex-wrap mt-0.5 text-[10px] font-mono text-outline text-left">
                            <span className="text-[9px] bg-surface-container/30 text-secondary border border-outline-variant/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                              Arma
                            </span>
                            {item.preco && (
                              <span className="text-[10px] text-secondary flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block shrink-0"></span> {item.preco} Prata
                              </span>
                            )}
                          </div>

                                          {/* Stats */}
                          {(item.dano !== undefined || item.penalidade !== undefined || item.alcance !== undefined) && (
                            <div className="text-[10px] font-mono text-outline flex gap-3 flex-wrap text-left">
                              {item.dano !== undefined && item.dano !== null && item.dano !== "" && (
                                <span>Dano: <strong className="text-on-surface">{item.dano}</strong></span>
                              )}
                              {item.penalidade !== undefined && item.penalidade !== null && item.penalidade !== "" && (
                                <span>Iniciativa: <strong className="text-secondary">{item.penalidade}</strong></span>
                              )}
                              {item.alcance !== undefined && item.alcance !== null && item.alcance !== "" && (
                                <span>Alcance: <strong className="text-on-surface">{item.alcance}</strong></span>
                              )}
                            </div>
                          )}

                          {/* Modificador for Mobile */}
                          <div className="flex sm:hidden flex-col gap-1 items-start justify-start mt-1 w-full text-left">
                            <span className="text-[10px] font-bold text-outline font-sans uppercase tracking-wider">Modificador</span>
                            <CustomSelect
                              disabled={isLocked || userRole === 'dm' || isRemoved}
                              value={item.modificador || ""}
                              onChange={(e) => handleItemModifierChange(idx, e.target.value)}
                              size="sm"
                              variant="minimal"
                              options={[
                                { value: "", label: "Sem Modificador" },
                                ...wpnModifiers.map((mod) => ({
                                  value: mod.nome,
                                  label: mod.nome,
                                  description: mod.descricao
                                }))
                              ]}
                            />
                          </div>

                          {/* Separator and Efeitos Section */}
                          <div className="border-t border-outline-variant/30 my-1.5" />
                          <div className="text-[10px] font-sans text-outline text-left space-y-1.5">
                            <span className="font-bold uppercase tracking-wider block text-on-surface-variant/70">Efeitos</span>
                            {(() => {
                              const acLevel = getAcertoCriticoLevel(editedChar.aprimoramentosPositivos);
                              const magicLevel = getArmaAmuletoMagicoLevel(editedChar.aprimoramentosPositivos);
                              const malditoLevel = getArmaAmuletoMalditoLevel(editedChar.aprimoramentosNegativos);
                              const hasAP = hasArmaPreferencialEnhancement(editedChar.aprimoramentosPositivos);
                              const hasAcuide = hasAcuideArmaEnhancement(editedChar.aprimoramentosPositivos);
                              
                              if (acLevel === null && magicLevel === null && malditoLevel === null && (!hasAP || item.isCustom) && (!hasAcuide || item.isCustom)) {
                                return <span className="text-[10px] text-outline-variant/50 italic">Nenhum efeito ativo</span>;
                              }

                              const renderAcertoCritico = () => {
                                if (acLevel === null) return null;
                                const isSelected = !!item.hasAcertoCritico;
                                const anySelected = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && !!i.hasAcertoCritico);
                                
                                if (isSelected) {
                                  const isAcertoCriticoAdded = !!(isReviewMode && item.hasAcertoCritico);
                                  const borderStyleClass = isAcertoCriticoAdded
                                    ? 'border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] bg-amber-500/5 text-amber-200'
                                    : 'bg-blue-500/10 border-blue-500 text-blue-300 hover:bg-blue-500/20';

                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleAcertoCriticoOnWeapon(idx, acLevel)}
                                      className={`w-full text-left p-1.5 border transition-all rounded-none flex items-center justify-between group/effect ${borderStyleClass} ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                                        Acerto Crítico Aprimorado - Nível {acLevel}
                                      </span>
                                      <span className="text-[8px] text-blue-400 font-bold bg-blue-500/10 px-1 py-0.5 border border-blue-500/30">
                                        Ativo
                                      </span>
                                    </button>
                                  );
                                } else if (!anySelected) {
                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleAcertoCriticoOnWeapon(idx, acLevel)}
                                      className={`w-full text-left p-1.5 bg-surface-container-high/30 border border-outline-variant hover:border-blue-500/50 text-outline hover:text-on-surface transition-all rounded-none flex items-center justify-between group/effect ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] uppercase tracking-wider">
                                        Acerto Crítico Aprimorado - Nível {acLevel}
                                      </span>
                                      <span className="text-[8px] text-outline-variant group-hover/effect:text-blue-400 font-mono">
                                        + Ativar
                                      </span>
                                    </button>
                                  );
                                }
                                return null;
                              };

                              const renderMagicAmuleto = () => {
                                if (magicLevel === null) return null;
                                const isSelected = !!item.hasArmaAmuletoMagico;
                                const anySelected = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && !!i.hasArmaAmuletoMagico);

                                if (isSelected) {
                                  const isMagicAdded = !!(isReviewMode && item.hasArmaAmuletoMagico);
                                  const borderStyleClass = isMagicAdded
                                    ? 'border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] bg-amber-500/5 text-amber-200'
                                    : 'bg-cyan-500/10 border-cyan-500 text-cyan-300 hover:bg-cyan-500/20';

                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleArmaAmuletoMagicoOnItem(idx, magicLevel)}
                                      className={`w-full text-left p-1.5 border transition-all rounded-none flex items-center justify-between group/effect ${borderStyleClass} ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                                        Arma ou Amuleto Mágico - Nível {magicLevel}
                                      </span>
                                      <span className="text-[8px] text-cyan-400 font-bold bg-cyan-500/10 px-1 py-0.5 border border-cyan-500/30">
                                        Ativo
                                      </span>
                                    </button>
                                  );
                                } else if (!anySelected) {
                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleArmaAmuletoMagicoOnItem(idx, magicLevel)}
                                      className={`w-full text-left p-1.5 bg-surface-container-high/30 border border-outline-variant hover:border-cyan-500/50 text-outline hover:text-on-surface transition-all rounded-none flex items-center justify-between group/effect ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] uppercase tracking-wider">
                                        Arma ou Amuleto Mágico - Nível {magicLevel}
                                      </span>
                                      <span className="text-[8px] text-outline-variant group-hover/effect:text-cyan-400 font-mono">
                                        + Ativar
                                      </span>
                                    </button>
                                  );
                                }
                                return null;
                              };

                              const renderArmaAmuletoMaldito = () => {
                                if (malditoLevel === null) return null;
                                const isSelected = !!item.hasArmaAmuletoMaldito;
                                const anySelected = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && !!i.hasArmaAmuletoMaldito);

                                if (isSelected) {
                                  const isMalditoAdded = !!(isReviewMode && item.hasArmaAmuletoMaldito);
                                  const borderStyleClass = isMalditoAdded
                                    ? 'border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] bg-amber-500/5 text-amber-200'
                                    : 'bg-red-500/10 border-red-500 text-red-300 hover:bg-red-500/20';

                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleArmaAmuletoMalditoOnItem(idx, malditoLevel)}
                                      className={`w-full text-left p-1.5 border transition-all rounded-none flex items-center justify-between group/effect ${borderStyleClass} ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                                        Arma ou Amuleto Maldito - Nível {malditoLevel}
                                      </span>
                                      <span className="text-[8px] text-red-400 font-bold bg-red-500/10 px-1 py-0.5 border border-red-500/30">
                                        Ativo
                                      </span>
                                    </button>
                                  );
                                } else if (!anySelected) {
                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleArmaAmuletoMalditoOnItem(idx, malditoLevel)}
                                      className={`w-full text-left p-1.5 bg-surface-container-high/30 border border-outline-variant hover:border-red-500/50 text-outline hover:text-on-surface transition-all rounded-none flex items-center justify-between group/effect ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] uppercase tracking-wider">
                                        Arma ou Amuleto Maldito - Nível {malditoLevel}
                                      </span>
                                      <span className="text-[8px] text-outline-variant group-hover/effect:text-red-400 font-mono">
                                        + Ativar
                                      </span>
                                    </button>
                                  );
                                }
                                return null;
                              };

                              const renderArmaPreferencial = () => {
                                const hasAP = hasArmaPreferencialEnhancement(editedChar.aprimoramentosPositivos);
                                if (!hasAP) return null;
                                if (item.isCustom) return null; // Avoid showing on customizable/custom items
                                const isSelected = !!item.hasArmaPreferencial;
                                const anySelected = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && !i.isCustom && !!i.hasArmaPreferencial);

                                if (isSelected) {
                                  const isPreferencialAdded = !!(isReviewMode && item.hasArmaPreferencial);
                                  const borderStyleClass = isPreferencialAdded
                                    ? 'border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] bg-amber-500/5 text-amber-200'
                                    : 'bg-amber-500/10 border-amber-500 text-secondary hover:bg-amber-500/20';

                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleArmaPreferencialOnWeapon(idx)}
                                      className={`w-full text-left p-1.5 border transition-all rounded-none flex items-center justify-between group/effect ${borderStyleClass} ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                                        Arma Preferencial
                                      </span>
                                      <span className="text-[8px] text-secondary font-bold bg-amber-500/10 px-1 py-0.5 border border-amber-500/30">
                                        Ativo
                                      </span>
                                    </button>
                                  );
                                } else if (!anySelected) {
                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleArmaPreferencialOnWeapon(idx)}
                                      className={`w-full text-left p-1.5 bg-surface-container-high/30 border border-outline-variant hover:border-amber-500/50 text-outline hover:text-on-surface transition-all rounded-none flex items-center justify-between group/effect ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] uppercase tracking-wider">
                                        Arma Preferencial
                                      </span>
                                      <span className="text-[8px] text-outline-variant group-hover/effect:text-secondary font-mono">
                                        + Ativar
                                      </span>
                                    </button>
                                  );
                                }
                                return null;
                              };

                              const renderAcuideArma = () => {
                                if (!hasAcuide) return null;
                                if (item.isCustom) return null;
                                const isSelected = !!item.hasAcuideArma;

                                if (isSelected) {
                                  const isAcuideAdded = !!(isReviewMode && item.hasAcuideArma);
                                  const borderStyleClass = isAcuideAdded
                                    ? 'border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] bg-amber-500/5 text-amber-200'
                                    : 'bg-cyan-500/10 border-cyan-500 text-cyan-300 hover:bg-cyan-500/20';

                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleAcuideArmaOnWeapon(idx)}
                                      className={`w-full text-left p-1.5 border transition-all rounded-none flex items-center justify-between group/effect ${borderStyleClass} ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                                        Acuide com Arma
                                      </span>
                                      <span className="text-[8px] text-cyan-400 font-bold bg-cyan-500/10 px-1 py-0.5 border border-cyan-500/30">
                                        Ativo
                                      </span>
                                    </button>
                                  );
                                } else {
                                  return (
                                    <button
                                      type="button"
                                      disabled={isLocked || userRole === 'dm'}
                                      onClick={() => handleToggleAcuideArmaOnWeapon(idx)}
                                      className={`w-full text-left p-1.5 bg-surface-container-high/30 border border-outline-variant hover:border-cyan-500/50 text-outline hover:text-on-surface transition-all rounded-none flex items-center justify-between group/effect ${(isLocked || userRole === 'dm') ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                                    >
                                      <span className="font-mono text-[9px] uppercase tracking-wider">
                                        Acuide com Arma
                                      </span>
                                      <span className="text-[8px] text-outline-variant group-hover/effect:text-cyan-400 font-mono">
                                        + Ativar
                                      </span>
                                    </button>
                                  );
                                }
                              };

                              const acNode = renderAcertoCritico();
                              const magicNode = renderMagicAmuleto();
                              const malditoNode = renderArmaAmuletoMaldito();
                              const apNode = renderArmaPreferencial();
                              const aaNode = renderAcuideArma();

                              if (!acNode && !magicNode && !malditoNode && !apNode && !aaNode) {
                                return <span className="text-[10px] text-outline-variant/50 italic">Nenhum efeito ativo</span>;
                              }

                              return (
                                <div className="space-y-1.5">
                                  {acNode}
                                  {magicNode}
                                  {malditoNode}
                                  {apNode}
                                  {aaNode}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Col 2: Armaduras & Escudos */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-2">
                  <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                    Armaduras & Escudos
                  </h4>
                  <button
                    type="button"
                    disabled={isLocked || userRole === 'dm'}
                    onClick={() => {
                      setActiveItemCategory('armadura');
                      setOpenedFromCard('armaduras');
                      setIsItensModalOpen(true);
                    }}
                    className={`w-8 h-8 flex items-center justify-center transition-all text-lg font-bold border rounded-none shrink-0 ${
                      (isLocked || userRole === 'dm')
                        ? 'bg-outline-variant/5 text-outline-variant/40 border-outline-variant/20 cursor-not-allowed'
                        : 'bg-amber-500/10 hover:bg-amber-500/25 text-secondary hover:text-on-surface border-amber-500/30 cursor-pointer'
                    }`}
                    title="Adicionar Proteção"
                  >
                    +
                  </button>
                </div>

                <div className="flex-grow space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {((isReviewMode ? [
                    ...(editedChar.armors || []),
                    ...(originalChar?.armors || []).filter((o: any) => !(editedChar.armors || []).some(c => c.nome === o.nome))
                  ] : (editedChar.armors || [])).length === 0 && armadurasFiltered.length === 0) ? (
                    <p className="text-xs text-outline italic text-center py-6 border border-dashed border-outline-variant/20 bg-surface-container-low/20">
                      Nenhuma armadura ou escudo.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const visibleArmors = (() => {
                          const combined: Array<{ armor: any; diffStatus: 'added' | 'removed' | 'none' | 'moved' }> = [];
                          const origArmors = originalChar?.armors || [];
                          const currArmors = editedChar.armors || [];

                          if (isReviewMode) {
                            currArmors.forEach((arm) => {
                              const existsInOrig = origArmors.some((o: any) => o.nome === arm.nome);
                              const isMoved = !!originalChar?.items?.some((o: any) => {
                                const oName = typeof o === 'object' ? o.item : o;
                                return oName === arm.nome;
                              });

                              const status = isMoved ? 'moved' : (existsInOrig ? 'none' : 'added');
                              combined.push({
                                armor: arm,
                                diffStatus: status
                              });
                            });

                            origArmors.forEach((origArm: any) => {
                              const existsInCurr = currArmors.some((c) => c.nome === origArm.nome);
                              if (!existsInCurr) {
                                combined.push({
                                  armor: origArm,
                                  diffStatus: 'removed'
                                });
                              }
                            });
                          } else {
                            currArmors.forEach((arm) => {
                              combined.push({
                                armor: arm,
                                diffStatus: 'none'
                              });
                            });
                          }
                          return combined;
                        })();

                        return visibleArmors.map(({ armor, diffStatus }) => {
                          const isObraPrima = armor.modificador === "Armadura/Escudo Obra-prima" || armor.modificador === "Armadura Obra-prima" || armor.modificador === "Escudo Obra-prima";
                          const finalDex = isObraPrima ? Math.min(0, (Number(armor.penalidade_dex) || 0) + 1) : (Number(armor.penalidade_dex) || 0);
                          const finalAgi = isObraPrima ? Math.min(0, (Number(armor.penalidade_agi) || 0) + 1) : (Number(armor.penalidade_agi) || 0);

                          const isEscudo = armor.slot === "escudo" || (armor.nome || "").toLowerCase().includes("escudo") || (armor.nome || "").toLowerCase().includes("broquel");
                          const categoryText = isEscudo ? "Escudo" : "Armadura";
                          const armorMods = modificadoresCatalog.filter(mod => 
                            isEscudo ? mod.categoria === "modificadores_escudo" : mod.categoria === "modificadores_armadura"
                          );

                          const isAdded = diffStatus === 'added';
                          const isRemoved = diffStatus === 'removed';
                          const isMoved = diffStatus === 'moved';

                          const origArmor = originalChar?.armors?.find((o: any) => o.nome === armor.nome);
                          const isModifierChanged = !!(isReviewMode && origArmor && armor.modificador !== origArmor.modificador);

                          let borderClass = armor.isEquipped 
                            ? 'border-green-500/30 bg-green-500/5' 
                            : 'border-outline-variant bg-surface-container/60';

                          if (isReviewMode && (isMoved || isAdded)) {
                            borderClass = 'border-amber-500 border-2 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50';
                          } else if (isMoved) {
                            borderClass = 'border-amber-500 border-2 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50';
                          } else if (isAdded) {
                            borderClass = 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30';
                          } else if (isRemoved) {
                            borderClass = 'border-primary/30 bg-surface-container/15 opacity-75';
                          }

                          return (
                            <div key={armor.id} className={`p-3 border transition-all duration-200 relative ${borderClass}`}>
                              {/* Overlay for removed armor */}
                              {isRemoved && (
                                <div className="absolute inset-0 bg-red-950/80 border border-red-500/50 flex flex-col items-center justify-center z-10 p-2 text-center">
                                  <span className="bg-red-600 text-on-surface text-[10px] font-bold px-2 py-1 uppercase tracking-wider font-sans">
                                    [REMOVIDO]
                                  </span>
                                </div>
                              )}

                              {/* MOBILE ONLY VIEW */}
                              <div className="sm:hidden space-y-2">
                                {/* Row 1: nome_armadura          vestir|desvestir  remover */}
                                <div className="flex justify-between items-start gap-4">
                                  <span className={`text-sm font-bold text-left block flex-grow min-w-0 ${
                                    armor.isEquipped ? 'text-green-400' : (isReviewMode && (isAdded || isMoved)) ? 'text-secondary font-bold' : 'text-on-surface'
                                  }`}>
                                    {armor.nome}
                                    {isReviewMode && (isAdded || isMoved) ? (
                                      <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                        {isAdded ? "Novo" : "Movido"}
                                      </span>
                                    ) : isAdded ? (
                                      <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                        Novo
                                      </span>
                                    ) : null}
                                    {isMoved && !isReviewMode && (
                                      <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                        Movido
                                      </span>
                                    )}
                                    {isRemoved && (
                                      <span className="ml-1.5 text-[8px] bg-surface-container/40 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                        Removido
                                      </span>
                                    )}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      disabled={userRole !== 'player'}
                                      onClick={() => handleToggleEquipArmor(armor.id)}
                                      className={`h-8 w-8 flex items-center justify-center transition-all duration-150 border rounded-none outline-none ${
                                        userRole !== 'player'
                                          ? 'opacity-50 cursor-not-allowed pointer-events-none border-outline-variant/30 text-outline' 
                                          : armor.isEquipped 
                                            ? 'bg-amber-500/15 border-amber-500/30 text-secondary hover:bg-amber-500/30 cursor-pointer' 
                                            : 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/30 cursor-pointer'
                                      }`}
                                      title={armor.isEquipped ? "Desvestir" : "Vestir"}
                                    >
                                      <Shirt className="w-4 h-4 shrink-0" />
                                    </button>
                                  </div>
                                </div>

                                {/* Row 2: Categoria */}
                                <div className="text-left text-[10px] font-mono text-outline">
                                  <span className="text-[9px] bg-surface-container/30 text-secondary border border-outline-variant/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                    {categoryText}
                                  </span>
                                </div>

                                {/* Row 3: tipo: Torso */}
                                <div className="text-left text-xs text-outline font-sans">
                                  Tipo: <span className="text-on-surface font-medium">{armor.slot ? capitalizeFirstLetter(armor.slot) : 'Corpo'}</span>
                                </div>

                                {/* Row 4: IP:N    DEX:N   AGI:N */}
                                <div className="text-xs text-outline font-mono flex items-center justify-start gap-4 whitespace-nowrap overflow-hidden">
                                  <span>IP: <strong className="text-on-surface">{armor.ip}</strong></span>
                                  <span>DEX: <strong className={finalDex < 0 ? "text-red-400" : ""}>{finalDex}</strong> {isObraPrima && <span className="text-green-400 text-[10px]">(-1)</span>}</span>
                                  <span>AGI: <strong className={finalAgi < 0 ? "text-red-400" : ""}>{finalAgi}</strong> {isObraPrima && <span className="text-green-400 text-[10px]">(-1)</span>}</span>
                                </div>

                                {/* Row 5: Modificador dropdown */}
                                <div className="flex flex-col gap-1 items-start justify-start mt-1 w-full text-left">
                                  <span className="text-[10px] font-bold text-outline font-sans uppercase tracking-wider">Modificador</span>
                                  <div className="flex items-center gap-2 w-full">
                                    <CustomSelect
                                      disabled={isLocked || userRole === 'dm'}
                                      value={armor.modificador || ""}
                                      onChange={(e) => handleArmorModifierChange(armor.id, e.target.value)}
                                      size="sm"
                                      variant="minimal"
                                      options={[
                                        { value: "", label: "Nenhum Modificador" },
                                        ...armorMods.map((mod) => ({
                                          value: mod.nome,
                                          label: mod.nome,
                                          description: mod.descricao
                                        }))
                                      ]}
                                    />
                                    {!isLocked && userRole !== 'dm' && !isRemoved && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveArmor(armor.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 transition-all outline-none border-0 rounded-none cursor-pointer shrink-0"
                                        title="Remover Armadura"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* DESKTOP ONLY VIEW */}
                              <div className="hidden sm:flex justify-between items-start gap-4">
                                <div className="text-left flex-grow space-y-1.5">
                                  <div className="flex justify-between items-center gap-4">
                                    <span className={`text-sm font-bold ${armor.isEquipped ? 'text-green-400' : (isReviewMode && (isAdded || isMoved)) ? 'text-secondary' : 'text-on-surface'}`}>
                                      {armor.nome}
                                      {isReviewMode && (isAdded || isMoved) ? (
                                        <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                          {isAdded ? "Novo" : "Movido"}
                                        </span>
                                      ) : isAdded ? (
                                        <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                          Novo
                                        </span>
                                      ) : null}
                                      {isMoved && !isReviewMode && (
                                        <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                          Movido
                                        </span>
                                      )}
                                      {isRemoved && (
                                        <span className="ml-1.5 text-[8px] bg-surface-container/40 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                          Removido
                                        </span>
                                      )}
                                    </span>
                                    {/* Modificador Select Dropdown inline on desktop */}
                                    <div className="shrink-0 flex items-center gap-2">
                                      <CustomSelect
                                        disabled={isLocked || userRole === 'dm'}
                                        value={armor.modificador || ""}
                                        onChange={(e) => handleArmorModifierChange(armor.id, e.target.value)}
                                        size="sm"
                                        variant="minimal"
                                        className="min-w-[150px]"
                                        options={[
                                          { value: "", label: "Nenhum Modificador" },
                                          ...armorMods.map((mod) => ({
                                            value: mod.nome,
                                            label: mod.nome,
                                            description: mod.descricao
                                          }))
                                        ]}
                                      />
                                      {!isLocked && userRole !== 'dm' && !isRemoved && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveArmor(armor.id)}
                                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 transition-all outline-none border-0 rounded-none cursor-pointer shrink-0"
                                          title="Remover Armadura"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-[10px] font-mono text-outline flex gap-2">
                                    <span className="text-[9px] bg-surface-container/30 text-secondary border border-outline-variant/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                      {categoryText}
                                    </span>
                                  </div>

                                  <div className="text-[10px] font-sans text-outline">
                                    Tipo: <span className="text-on-surface font-medium">{armor.slot ? capitalizeFirstLetter(armor.slot) : 'Corpo'}</span>
                                  </div>

                                  <div className="text-[10px] font-mono text-outline flex gap-3 flex-wrap">
                                    <span>IP: <strong className="text-on-surface">{armor.ip}</strong></span>
                                    <span>DEX: <strong className={finalDex < 0 ? "text-red-400" : ""}>{finalDex}</strong> {isObraPrima && <span className="text-green-400 text-[10px]">(-1)</span>}</span>
                                    <span>AGI: <strong className={finalAgi < 0 ? "text-red-400" : ""}>{finalAgi}</strong> {isObraPrima && <span className="text-green-400 text-[10px]">(-1)</span>}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1.5 shrink-0 self-center">
                                  <button
                                    type="button"
                                    disabled={userRole !== 'player'}
                                    onClick={() => handleToggleEquipArmor(armor.id)}
                                    className={`p-1.5 border rounded-none transition-all duration-150 outline-none flex items-center justify-center ${
                                      userRole !== 'player'
                                        ? 'opacity-50 cursor-not-allowed pointer-events-none border-outline-variant/30 text-outline' 
                                        : armor.isEquipped 
                                          ? 'bg-amber-500/15 border-amber-500/30 text-secondary hover:bg-amber-500/30 cursor-pointer' 
                                          : 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/30 cursor-pointer'
                                    }`}
                                    title={armor.isEquipped ? "Desvestir" : "Vestir"}
                                  >
                                    <Shirt className="w-4 h-4 shrink-0" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}

                      {armadurasFiltered.map(({ item, idx, diffStatus }) => {
                        const isAdded = diffStatus === 'added';
                        const isRemoved = diffStatus === 'removed';
                        let cardClass = "p-3 border transition-all flex justify-between items-start gap-2 relative";
                        if (isReviewMode && isAdded) {
                          cardClass += " border-amber-500 border-2 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50";
                        } else if (isAdded) {
                          cardClass += " border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30";
                        } else if (isRemoved) {
                          cardClass += " border-primary/30 bg-surface-container/15 opacity-75";
                        } else {
                          cardClass += " border-outline-variant/50 bg-surface-container/60 hover:border-amber-500/30";
                        }
                        return (
                          <div key={idx} className={cardClass}>
                            {/* Overlay for removed armadura/escudo from items list */}
                            {isRemoved && (
                              <div className="absolute inset-0 bg-red-950/80 border border-red-500/50 flex flex-col items-center justify-center z-10 p-2 text-center">
                                <span className="bg-red-600 text-on-surface text-[10px] font-bold px-2 py-1 uppercase tracking-wider font-sans">
                                  [REMOVIDO]
                                </span>
                              </div>
                            )}
                            <div className="text-left">
                              <p className={`text-sm font-bold font-sans ${isRemoved ? 'text-red-400 line-through' : (isReviewMode && isAdded) ? 'text-secondary' : isAdded ? 'text-emerald-400' : 'text-on-surface'}`}>
                                {item.item}
                                {isReviewMode && isAdded ? (
                                  <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                    Novo
                                  </span>
                                ) : isAdded ? (
                                  <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                    Novo
                                  </span>
                                ) : null}
                                {isRemoved && (
                                  <span className="ml-1.5 text-[8px] bg-surface-container/40 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                    Removido
                                  </span>
                                )}
                              </p>
                              {item.descricao && (
                                <p className={`text-[11px] italic mt-0.5 ${isRemoved ? 'text-red-400/80 line-through' : 'text-outline'}`}>{item.descricao}</p>
                              )}
                              {item.preco && (
                                <p className="text-[10px] text-outline font-mono mt-0.5 flex items-center gap-1">
                                  Preço: <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block shrink-0"></span> {item.preco} Prata
                                </p>
                              )}
                            </div>
                             {/* Hidden per request */}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Col 3: Outros Itens */}
              <div className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-2">
                  <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                    Itens
                  </h4>
                  <button
                    type="button"
                    disabled={(isLocked && userRole !== 'player') || userRole === 'dm'}
                    onClick={() => {
                      setActiveItemCategory('all');
                      setOpenedFromCard('itens');
                      setIsItensModalOpen(true);
                    }}
                    className={`w-8 h-8 flex items-center justify-center transition-all text-lg font-bold border rounded-none shrink-0 ${
                      ((isLocked && userRole !== 'player') || userRole === 'dm')
                        ? 'bg-outline-variant/5 text-outline-variant/40 border-outline-variant/20 cursor-not-allowed pointer-events-none'
                        : 'bg-amber-500/10 hover:bg-amber-500/25 text-secondary hover:text-on-surface border-amber-500/30 cursor-pointer'
                    }`}
                    title="Adicionar Itens"
                  >
                    +
                  </button>
                </div>

                <div className="flex-grow space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {outrosFiltered.length === 0 ? (
                    <p className="text-xs text-outline italic text-center py-6 border border-dashed border-outline-variant/20 bg-surface-container-low/20">
                      Nenhum item na mochila.
                    </p>
                  ) : (
                    outrosFiltered.map(({ item, idx, diffStatus }) => {
                      const name = typeof item === 'string' ? item : (item.item || '');
                      const desc = typeof item === 'object' ? item.descricao : '';
                      const category = typeof item === 'object' ? item.categoria : '';
                      const isMagicActive = typeof item === 'object' && item !== null && !!item.hasArmaAmuletoMagico;
                      const isMalditoActive = typeof item === 'object' && item !== null && !!item.hasArmaAmuletoMaldito;
                      const isAdded = diffStatus === 'added' && !isReviewMode;
                      const isRemoved = diffStatus === 'removed' && !isReviewMode;

                      let borderClass = isMalditoActive
                        ? 'border-red-500 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                        : isMagicActive
                          ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                          : 'border-outline-variant/50 bg-surface-container/60 hover:border-amber-500/30';

                      if (isAdded) {
                        borderClass = 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30';
                      } else if (isRemoved) {
                        borderClass = 'border-primary/30 bg-surface-container/15 opacity-75';
                      }

                      return (
                        <div key={idx} className={`p-3 border transition-all flex flex-col gap-2.5 w-full relative ${borderClass}`}>
                          {/* Overlay for removed item */}
                          {isRemoved && (
                            <div className="absolute inset-0 bg-red-950/80 border border-red-500/50 flex flex-col items-center justify-center z-10 p-2 text-center">
                              <span className="bg-red-600 text-on-surface text-[10px] font-bold px-2 py-1 uppercase tracking-wider font-sans">
                                [REMOVIDO]
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-start gap-2">
                            <div className="text-left flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <p className={`text-sm font-bold font-sans truncate ${
                                  isRemoved ? 'text-red-400 line-through' : isAdded ? 'text-emerald-400' : 'text-on-surface'
                                }`}>
                                  {name}
                                  {isAdded && (
                                    <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                      Novo
                                    </span>
                                  )}
                                  {isRemoved && (
                                    <span className="ml-1.5 text-[8px] bg-surface-container/40 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans no-underline inline-block">
                                      Removido
                                    </span>
                                  )}
                                </p>
                                {category && (
                                  <span className="text-[9px] bg-amber-500/10 text-secondary px-1 py-0.5 font-mono uppercase tracking-wider shrink-0">
                                    {category}
                                  </span>
                                )}
                              </div>
                              {desc && (
                                <p className={`text-[11px] italic mt-0.5 line-clamp-2 ${isRemoved ? 'text-red-400/80 line-through' : 'text-outline'}`}>{desc}</p>
                              )}
                              {typeof item === 'object' && item.preco && (
                                <p className="text-[10px] text-outline font-mono mt-0.5 flex items-center gap-1">
                                  Preço: <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block shrink-0"></span> {item.preco} Prata
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Botão Mover [seta_direita] - Oculto se isLocked ou isRemoved for true */}
                              {!isLocked && userRole !== 'dm' && !isRemoved && typeof item === 'object' && item !== null && item.forcarEmItens && (item.categoria === 'armas' || item.categoria === 'arma' || item.categoria === 'armadura' || item.categoria === 'escudo') && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveItem(idx, item)}
                                  className="text-secondary hover:text-secondary hover:bg-amber-500/10 p-1.5 transition-all outline-none border border-amber-500/30 rounded-none cursor-pointer shrink-0 flex items-center justify-center w-8 h-8 font-bold text-sm"
                                  title="Mover item para o card correspondente"
                                >
                                  →
                                </button>
                              )}
                              {(!isLocked || userRole === 'player') && userRole !== 'dm' && !isRemoved && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGeneralItem(idx)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 transition-all outline-none border-0 rounded-none cursor-pointer shrink-0"
                                  title="Remover Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Separator and Efeitos Section for Custom/General Item */}
                          {typeof item === 'object' && item !== null && !item.forcarEmItens && (() => {
                            const magicLevel = getArmaAmuletoMagicoLevel(editedChar.aprimoramentosPositivos);
                            const malditoLevel = getArmaAmuletoMalditoLevel(editedChar.aprimoramentosNegativos);
                            if (magicLevel === null && malditoLevel === null) return null;

                            const renderMagic = () => {
                              if (magicLevel === null) return null;
                              const isSelected = !!item.hasArmaAmuletoMagico;
                              const anySelected = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && !!i.hasArmaAmuletoMagico);
                              
                              if (isSelected) {
                                return (
                                  <button
                                    type="button"
                                    disabled={isLocked || userRole === 'dm'}
                                    onClick={() => handleToggleArmaAmuletoMagicoOnItem(idx, magicLevel)}
                                    className="w-full text-left p-1.5 bg-cyan-500/10 border border-cyan-500 text-cyan-300 transition-all rounded-none flex items-center justify-between group/effect hover:bg-cyan-500/20 disabled:pointer-events-none disabled:opacity-60"
                                  >
                                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                                      Arma ou Amuleto Mágico - Nível {magicLevel}
                                    </span>
                                    <span className="text-[8px] text-cyan-400 font-bold bg-cyan-500/10 px-1 py-0.5 border border-cyan-500/30">
                                      Ativo
                                    </span>
                                  </button>
                                );
                              } else if (!anySelected) {
                                return (
                                  <button
                                    type="button"
                                    disabled={isLocked || userRole === 'dm'}
                                    onClick={() => handleToggleArmaAmuletoMagicoOnItem(idx, magicLevel)}
                                    className="w-full text-left p-1.5 bg-surface-container-high/30 border border-outline-variant hover:border-cyan-500/50 text-outline hover:text-on-surface transition-all rounded-none flex items-center justify-between group/effect disabled:pointer-events-none disabled:opacity-60"
                                  >
                                    <span className="font-mono text-[9px] uppercase tracking-wider">
                                      Arma ou Amuleto Mágico - Nível {magicLevel}
                                    </span>
                                    <span className="text-[8px] text-outline-variant group-hover/effect:text-cyan-400 font-mono">
                                      + Ativar
                                    </span>
                                  </button>
                                );
                              }
                              return null;
                            };

                            const renderMaldito = () => {
                              if (malditoLevel === null) return null;
                              const isSelected = !!item.hasArmaAmuletoMaldito;
                              const anySelected = (editedChar.items || []).some((i: any) => typeof i === 'object' && i !== null && !!i.hasArmaAmuletoMaldito);

                              if (isSelected) {
                                return (
                                  <button
                                    type="button"
                                    disabled={isLocked || userRole === 'dm'}
                                    onClick={() => handleToggleArmaAmuletoMalditoOnItem(idx, malditoLevel)}
                                    className="w-full text-left p-1.5 bg-red-500/10 border border-red-500 text-red-300 transition-all rounded-none flex items-center justify-between group/effect hover:bg-red-500/20 disabled:pointer-events-none disabled:opacity-60"
                                  >
                                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                                      Arma ou Amuleto Maldito - Nível {malditoLevel}
                                    </span>
                                    <span className="text-[8px] text-red-400 font-bold bg-red-500/10 px-1 py-0.5 border border-red-500/30">
                                      Ativo
                                    </span>
                                  </button>
                                );
                              } else if (!anySelected) {
                                return (
                                  <button
                                    type="button"
                                    disabled={isLocked || userRole === 'dm'}
                                    onClick={() => handleToggleArmaAmuletoMalditoOnItem(idx, malditoLevel)}
                                    className="w-full text-left p-1.5 bg-surface-container-high/30 border border-outline-variant hover:border-red-500/50 text-outline hover:text-on-surface transition-all rounded-none flex items-center justify-between group/effect disabled:pointer-events-none disabled:opacity-60"
                                  >
                                    <span className="font-mono text-[9px] uppercase tracking-wider">
                                      Arma ou Amuleto Maldito - Nível {malditoLevel}
                                    </span>
                                    <span className="text-[8px] text-outline-variant group-hover/effect:text-red-400 font-mono">
                                      + Ativar
                                    </span>
                                  </button>
                                );
                              }
                              return null;
                            };

                            const magicNode = renderMagic();
                            const malditoNode = renderMaldito();

                            if (!magicNode && !malditoNode) return null;

                            return (
                              <div className="pt-1.5 border-t border-outline-variant/30 text-[10px] font-sans text-outline text-left space-y-1.5">
                                <span className="font-bold uppercase tracking-wider block text-on-surface-variant/70">Efeitos</span>
                                {magicNode}
                                {malditoNode}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Section: Treasure table */}
      <section className="bg-surface-container-low border border-outline-variant p-4 sm:p-6 max-w-7xl mx-auto mb-8 sheet-block-tesouro">
        <h3 className="font-serif text-lg text-center text-primary tracking-widest uppercase mb-4">
          Tesouro
        </h3>
        <div className="bg-surface-container-lowest border border-outline-variant overflow-x-auto">
          <table className="w-full text-[10px] font-sans border-collapse">
            <thead>
              <tr className="bg-surface-container-highest text-on-surface-variant font-bold tracking-widest uppercase">
                <th className="p-3 text-left">MOEDA</th>
                <th className="p-3 text-center w-48 border-l border-outline-variant">QUANTIDADE EM BOLSA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 font-mono text-sm">
              <tr className={highlightClass('treasure.ouro', "hover:bg-surface-container-high/40 transition-all duration-300")}>
                <td className="p-3 text-on-surface font-sans flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block"></span>
                  Ouro
                </td>
                <td className="border-l border-outline-variant p-1">
                  <>
<input maxLength={50}
                    type="text"
                    inputMode="numeric"
                    disabled={isLocked}
                    value={editedChar.treasure?.ouro ?? 0}
                    onChange={(e) => handleTreasureChange('ouro', e.target.value)}
                    onBlur={() => handleTreasureBlur('ouro')}
                    className={`w-full bg-transparent text-center border-none p-1 font-mono font-bold text-secondary text-sm focus:ring-0 outline-none disabled:opacity-75 ${String(editedChar.treasure?.ouro ?? '').length >= 50 ? '!text-red-500' : ''}`}
                  />
{String(editedChar.treasure?.ouro ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                </td>
              </tr>
              <tr className={highlightClass('treasure.prata', "hover:bg-surface-container-high/40 transition-all duration-300")}>
                <td className="p-3 text-on-surface font-sans flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block"></span>
                  Prata
                </td>
                <td className="border-l border-outline-variant p-1">
                  <>
<input maxLength={50}
                    type="text"
                    inputMode="numeric"
                    disabled={isLocked}
                    value={editedChar.treasure?.prata ?? 0}
                    onChange={(e) => handleTreasureChange('prata', e.target.value)}
                    onBlur={() => handleTreasureBlur('prata')}
                    className={`w-full bg-transparent text-center border-none p-1 font-mono font-bold text-secondary text-sm focus:ring-0 outline-none disabled:opacity-75 ${String(editedChar.treasure?.prata ?? '').length >= 50 ? '!text-red-500' : ''}`}
                  />
{String(editedChar.treasure?.prata ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                </td>
              </tr>
              <tr className={highlightClass('treasure.bronze', "hover:bg-surface-container-high/40 transition-all duration-300")}>
                <td className="p-3 text-on-surface font-sans flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-700 block"></span>
                  Bronze
                </td>
                <td className="border-l border-outline-variant p-1">
                  <>
<input maxLength={50}
                    type="text"
                    inputMode="numeric"
                    disabled={isLocked}
                    value={editedChar.treasure?.bronze ?? 0}
                    onChange={(e) => handleTreasureChange('bronze', e.target.value)}
                    onBlur={() => handleTreasureBlur('bronze')}
                    className={`w-full bg-transparent text-center border-none p-1 font-mono font-bold text-secondary text-sm focus:ring-0 outline-none disabled:opacity-75 ${String(editedChar.treasure?.bronze ?? '').length >= 50 ? '!text-red-500' : ''}`}
                  />
{String(editedChar.treasure?.bronze ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </fieldset>

      {/* Section: Background box */}
      <section className="bg-surface-container-low border border-outline-variant p-4 sm:p-6 max-w-7xl mx-auto sheet-block-background">
        <div className="relative mb-4 flex justify-between items-center min-h-[40px]">
          <div className="w-24"></div> {/* spacer to center the title */}
          <h3 className="font-serif text-lg text-center text-primary tracking-widest uppercase font-medium">
            Background
          </h3>
          <div className="w-24 flex justify-end">
            {!isLocked && (
              <button
                type="button"
                className="flex items-center justify-center p-1.5 border border-primary/30 bg-surface-container/5 hover:bg-surface-container/15 text-primary hover:border-primary transition-all cursor-pointer active:scale-95"
                title="Melhorar com Inteligência Artificial"
              >
                <span className="material-symbols-outlined text-[13px] text-primary">auto_awesome</span>
              </button>
            )}
          </div>
        </div>
        <div className={highlightClass('background', "bg-surface-container-lowest border border-outline-variant p-4 relative overflow-hidden transition-all duration-300")}>
          <motion.div
            animate={{ height: bgHeight }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div ref={bgContentRef}>
              {isLocked ? (
                <p className="w-full text-on-surface font-sans text-sm leading-relaxed whitespace-pre-wrap font-normal">
                  {editedChar.background || "Nenhum histórico registrado."}
                </p>
              ) : (
                <textarea
                  ref={bgTextareaRef}
                  disabled={isLocked}
                  rows={5}
                  value={editedChar.background || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditedChar((prev) => ({ ...prev, background: val }));
                  }}
                  placeholder="Escreva o história deste personagem..."
                  className="w-full bg-transparent border-none p-0 text-on-surface font-sans text-sm focus:ring-0 outline-none resize-none overflow-hidden placeholder:text-outline-variant/30 leading-relaxed font-normal"
                />
              
              )}
            </div>
          </motion.div>

          {/* Fade out on collapse */}
          {isLocked && (editedChar.background || '').length > 700 && !isBgExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-container-lowest to-transparent pointer-events-none" />
          )}
        </div>

        {isLocked && (editedChar.background || '').length > 700 && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setIsBgExpanded(!isBgExpanded)}
              className="flex items-center gap-1 text-xs font-sans font-bold text-primary uppercase tracking-wider hover:text-on-surface transition-colors cursor-pointer active:scale-95"
            >
              <span>{isBgExpanded ? 'Ver menos' : 'Ver mais'}</span>
              <span className="material-symbols-outlined text-sm transition-transform duration-200">
                {isBgExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>
          </div>
        )}
      </section>
    </div>

      {/* Standardized Circular Save Button - Placement right bottom */}
      {/* Floating Save Button - Visible ONLY on PC/Tablet (Kept exactly as original) */}
      {!isLocked && (
        <motion.button
          type="button"
          disabled={saveStatus !== 'idle'}
          onClick={handleInteractiveSave}
          animate={shakeSave ? { x: [-10, 10, -10, 10, -5, 5, -2, 2, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={`hidden sm:flex fixed right-6 w-14 h-14 z-50 rounded-full border items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(209,171,114,0.3)] hover:scale-105 active:scale-95 cursor-pointer
            ${characterId ? 'bottom-[96px] sm:bottom-6' : 'bottom-6'}
            ${
              saveStatus === 'idle'
                ? 'bg-primary border-primary/20 text-on-primary hover:bg-primary-container hover:text-on-primary-container'
                : saveStatus === 'loading'
                ? 'bg-surface-container/90 border-secondary text-secondary cursor-not-allowed'
                : 'bg-surface-container/90 border-green-500 text-green-500'
            }
          `}
          title="Selar Registro (Salvar)"
        >
          {saveStatus === 'idle' && (
            <span className="material-symbols-outlined text-lg">save</span>
          )}

          {saveStatus === 'loading' && (
            <span className="material-symbols-outlined text-lg animate-spin text-secondary">progress_activity</span>
          )}

          {saveStatus === 'success' && (
            <span className="material-symbols-outlined text-lg text-green-500 animate-pulse">done_all</span>
          )}
        </motion.button>
      )}


      {/* Right Floating Actions Container - Visible ONLY on Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 flex flex-col items-center gap-4 z-50">
        {/* Grimório Button - For Mobile (Only visible for magical characters) */}
        {isMagicCharacter && (
          <button
            type="button"
            onClick={() => setIsGrimorioModalOpen(true)}
            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(209,171,114,0.3)] hover:scale-105 active:scale-95 cursor-pointer ${
              hasGrimorioOrFocusChanges
                ? "bg-amber-500 border-amber-600 text-on-primary ring-4 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse"
                : "bg-[#93c5fd] border-[#93c5fd]/50 text-[#0a2540] hover:bg-[#bfdbfe]"
            }`}
            title="Grimório de Feitiços"
          >
            <span className="material-symbols-outlined text-xl">auto_stories</span>
          </button>
        )}

        {/* Book Icon Button - For Mobile (Always visible for game rules / creation rules) */}
        <button
          type="button"
          onClick={() => isNew ? setIsRegrasCriacaoModalOpen(true) : setIsComoJogarModalOpen(true)}
          className="w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(209,171,114,0.3)] hover:scale-105 active:scale-95 cursor-pointer bg-primary border-primary/20 text-on-primary hover:bg-primary-container hover:text-on-primary-container"
          title={isNew ? "Regras de criação" : "Como jogar"}
        >
          <span className="material-symbols-outlined text-xl">menu_book</span>
        </button>

        {/* 3-Dots Menu Button - For Mobile (Opções da Ficha) */}
        <button
          type="button"
          onClick={() => setIsDotsMenuOpen(true)}
          className="w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(209,171,114,0.3)] hover:scale-105 active:scale-95 cursor-pointer bg-primary border-primary/20 text-on-primary hover:bg-primary-container hover:text-on-primary-container"
          title="Opções da Ficha"
        >
          <span className="material-symbols-outlined text-xl">more_vert</span>
        </button>

        {/* Floating Save Button - For Mobile */}
        {!isLocked && (
          <button
            type="button"
            disabled={saveStatus !== 'idle'}
            onClick={handleInteractiveSave}
            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(209,171,114,0.3)] hover:scale-105 active:scale-95 cursor-pointer
              ${
                saveStatus === 'idle'
                  ? 'bg-primary border-primary/20 text-on-primary hover:bg-primary-container hover:text-on-primary-container'
                  : saveStatus === 'loading'
                  ? 'bg-surface-container/90 border-secondary text-secondary cursor-not-allowed'
                  : 'bg-surface-container/90 border-green-500 text-green-500'
              }
            `}
            title="Selar Registro (Salvar)"
          >
            {saveStatus === 'idle' && (
              <span className="material-symbols-outlined text-lg">save</span>
            )}

            {saveStatus === 'loading' && (
              <span className="material-symbols-outlined text-lg animate-spin text-secondary">progress_activity</span>
            )}

            {saveStatus === 'success' && (
              <span className="material-symbols-outlined text-lg text-green-500">done_all</span>
            )}
          </button>
        )}
      </div>

      {/* Little Modal/Popup for 3-Dots Options */}
      {isDotsMenuOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-xs w-full p-5 space-y-4 shadow-2xl relative flex flex-col rounded-none">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/50 pb-2">
              <h4 className="font-serif text-sm text-primary uppercase tracking-wider font-semibold">
                Opções da Ficha
              </h4>
              <button
                type="button"
                onClick={() => setIsDotsMenuOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-base"
              >
                close
              </button>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {/* Campaign Selector on Mobile (Opções da Ficha) */}
              <div className="flex flex-col gap-1.5 p-2.5 bg-surface-container-low border border-outline-variant/40">
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">map</span>
                  Campanha
                </label>
                <CustomSelect
                  value={editedChar.campaignId || ''}
                  onChange={(e) => handleCampaignChange(e.target.value)}
                  placeholder="Sem Campanha"
                  disabled={userRole === 'dm'}
                  size="sm"
                  variant="default"
                  buttonClassName={userRole === 'dm' ? 'opacity-80 cursor-not-allowed' : ''}
                  options={[
                    { value: '', label: 'Sem Campanha' },
                    ...availableCampaigns.map((c) => ({
                      value: c.id,
                      label: c.name,
                      description: c.isDm ? 'Mestre' : (c.universo || 'Jogador')
                    }))
                  ]}
                />
              </div>

              {/* Export/Download Option */}
              {characterId && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDotsMenuOpen(false);
                    handleExportCharacter();
                  }}
                  className="flex items-center gap-3 w-full p-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface hover:text-on-surface hover:border-primary transition-all text-xs font-sans font-bold uppercase tracking-wider rounded-none cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">file_download</span>
                  <span>Download (JSON)</span>
                </button>
              )}

              {/* Edit/Edition Option */}
              {userRole !== 'dm' && (
                <button
                  type="button"
                  disabled={!!(editedChar?.isPendingDMReview || characters.find((c) => c.id === characterId)?.isPendingDMReview)}
                  onClick={() => {
                    setIsDotsMenuOpen(false);
                    if (editedChar?.isPendingDMReview || characters.find((c) => c.id === characterId)?.isPendingDMReview) {
                      return;
                    }
                    const nextLocked = !isLocked;
                    setIsLocked(nextLocked);
                    if (!nextLocked) {
                      // Unlocking: load pendingChanges merged with match
                      const match = characters.find((c) => c.id === characterId);
                      if (match) {
                        const toLoad = match.pendingChanges
                          ? {
                              ...match,
                              ...match.pendingChanges,
                              id: match.id,
                              name: match.pendingChanges.name ?? match.name,
                              race: match.pendingChanges.race ?? match.race,
                              classKit: match.pendingChanges.classKit ?? match.classKit,
                              level: match.pendingChanges.level ?? match.level,
                              xp: match.pendingChanges.xp ?? match.xp,
                              portraitUrl: match.portraitUrl,
                              campaignId: match.campaignId,
                              userId: match.userId,
                              isPendingDMReview: match.isPendingDMReview,
                              pendingChanges: match.pendingChanges,
                            }
                          : match;
                        setEditedChar(normalizeCharacter(toLoad));
                      }
                      toast.warning('Essas mudanças não são oficiais. O seu DM precisa analisar e validar.');
                    } else {
                      // Locking: load match (approved)
                      const match = characters.find((c) => c.id === characterId);
                      if (match) {
                        setEditedChar(normalizeCharacter(match));
                      }
                    }
                  }}
                  className={`flex items-center justify-between w-full p-2.5 border transition-all text-xs font-sans font-bold uppercase tracking-wider rounded-none cursor-pointer active:scale-95 disabled:opacity-50 ${
                    !isLocked
                      ? 'bg-primary border-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:text-on-surface hover:border-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">
                      {!isLocked ? 'lock_open' : 'edit'}
                    </span>
                    <span>{!isLocked ? 'Bloquear Edição' : ' EDITAR FICHA'}</span>
                  </div>
                  {isLocked && (
                    <span className="material-symbols-outlined text-lg text-amber-500 animate-pulse">
                      warning
                    </span>
                  )}
                </button>
              )}

              {/* Delete Option */}
              {userRole !== 'dm' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDotsMenuOpen(false);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="flex items-center gap-3 w-full p-2.5 bg-[#9e1b1b] border border-primary/30 text-on-surface hover:bg-red-700 transition-all text-xs font-sans font-bold uppercase tracking-wider rounded-none cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  <span>Deletar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Como Jogar Modal */}
      {isComoJogarModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-3xl w-full p-6 md:p-8 space-y-4 shadow-2xl relative flex flex-col rounded-none max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
                <h3 className="font-serif text-base text-primary uppercase tracking-wider font-semibold">
                  Como Jogar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComoJogarModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            {/* Modal Body */}
            <div className="text-on-surface text-sm font-sans leading-relaxed text-on-surface-variant overflow-y-auto pr-2 flex-1 space-y-5 custom-scrollbar">
              {/* Introduction - Non-collapsible */}
              {comoJogarIntro && (
                <div className="bg-surface-container-high border-l-4 border-primary p-4 space-y-2">
                  <h4 className="font-serif text-base text-primary uppercase tracking-wide font-medium">
                    {comoJogarIntro.title}
                  </h4>
                  <div className="text-xs text-on-surface-variant/90 leading-relaxed">
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-on-surface font-semibold" {...props} />,
                      }}
                    >
                      {comoJogarIntro.subtitle}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Collapsible Items */}
              <div className="space-y-2.5">
                {comoJogarItems.map((item) => {
                  const isOpen = !!openItems[item.id];
                  return (
                    <div
                      key={item.id}
                      className="border border-outline-variant/30 bg-surface-container"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenItems(prev => ({
                            ...prev,
                            [item.id]: !prev[item.id]
                          }));
                        }}
                        className="w-full flex items-center justify-between p-3.5 text-left font-serif text-xs sm:text-sm text-primary uppercase tracking-wider font-semibold hover:bg-surface-container-high transition-colors cursor-pointer select-none"
                      >
                        <span>{item.title}</span>
                        <span className={`material-symbols-outlined text-lg text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden border-t border-outline-variant/15 bg-surface-container/30"
                          >
                            <div className="p-4 text-on-surface-variant/95 leading-relaxed text-xs">
                              <ReactMarkdown
                                components={{
                                  h1: ({node, ...props}) => <h1 className="font-serif text-sm text-primary uppercase tracking-wider mt-4 mb-2 border-b border-outline-variant/20 pb-1" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="font-serif text-xs text-primary uppercase tracking-wide mt-3 mb-1.5" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="font-serif text-[11px] text-primary uppercase tracking-wider mt-3 mb-1" {...props} />,
                                  h4: ({node, ...props}) => <h4 className="font-sans text-xs text-primary font-bold mt-2.5 mb-1" {...props} />,
                                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2 pl-1" {...props} />,
                                  li: ({node, ...props}) => <li className="inline-block w-full list-item" {...props} />,
                                  strong: ({node, ...props}) => <strong className="text-on-surface font-semibold" {...props} />,
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary pl-3 my-2.5 italic text-outline-variant/80 bg-black/20 py-1 pr-2" {...props} />,
                                  hr: ({node, ...props}) => <hr className="border-outline-variant/20 my-3" {...props} />,
                                }}
                              >
                                {item.content}
                              </ReactMarkdown>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regras de Criação Modal */}
      {isRegrasCriacaoModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-lg w-full p-6 space-y-4 shadow-2xl relative flex flex-col rounded-none max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
                <h3 className="font-serif text-base text-primary uppercase tracking-wider font-semibold">
                  Guia de Criação de Personagem
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRegrasCriacaoModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            {/* Modal Body */}
            <div className="text-on-surface text-sm font-sans leading-relaxed text-on-surface-variant max-h-[70vh] sm:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="font-serif text-sm text-primary uppercase tracking-wider mt-4 mb-2 border-b border-outline-variant/20 pb-1" {...props} />,
                  h2: ({node, ...props}) => <h2 className="font-serif text-xs text-primary uppercase tracking-wide mt-4 mb-1" {...props} />,
                  h3: ({node, ...props}) => <h3 className="font-sans text-xs text-primary font-bold mt-3 mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="font-sans text-[11px] text-on-surface-variant/90 leading-relaxed mb-3" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1.5 mb-3 pl-2" {...props} />,
                  li: ({node, ...props}) => <li className="font-sans text-[11px] text-on-surface-variant/80" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-on-surface font-bold" {...props} />,
                  hr: ({node, ...props}) => <hr className="border-outline-variant/20 my-4" {...props} />,
                }}
              >
                {regrasMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Grimório Modal */}
      {isGrimorioModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-2xl w-full md:h-[85vh] md:max-h-[85vh] p-6 space-y-4 shadow-2xl relative flex flex-col rounded-none max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-950/80 border border-blue-800/60 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-400 text-xl">auto_stories</span>
                </div>
                <h3 className="font-serif text-base text-primary uppercase tracking-wider font-semibold">
                  Grimório de Feitiços
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGrimorioModalOpen(false);
                  setEditingSpell(null);
                  setIsAddingSpell(false);
                }}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 min-h-0">

              {/* Focus/Fé Allocation Embedded Form inside Grimório Modal */}
              {isMagicCharacter && (
                <div className="bg-surface-container border border-outline-variant/60 p-4 space-y-4">
                  {/* Collapsible Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setIsFocusAllocationExpanded(!isFocusAllocationExpanded)}
                    className="w-full flex justify-between items-center text-left focus:outline-none cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#4cc9f0] text-sm group-hover:scale-110 transition-transform">bolt</span>
                      <h4 className="font-serif text-xs text-primary uppercase tracking-wider font-semibold group-hover:text-on-surface transition-colors">
                        Distribuição de Focus / Fé
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 select-none">
                      <div className="font-mono text-[10px] text-on-surface-variant">
                        Total: <strong className={isFocusAllocationOverspent ? "text-red-400" : "text-[#4cc9f0]"}>{currentTotalTempFocus} / {totalFocusPoints}</strong> pontos
                      </div>
                      <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors text-sm">
                        {isFocusAllocationExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </button>

                  {isFocusAllocationExpanded && (
                    <div className="space-y-4 pt-3 border-t border-outline-variant/20 animate-fadeIn">
                      <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                        Distribua seus pontos de Focus e Fé entre as Formas e Caminhos. O somatório não pode exceder seus pontos totais.
                      </p>

                      {/* Forms Numeric Stepper / Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* CRIAR */}
                        <div className={highlightDirectClass(isCriarChanged, 'p-3 sm:p-2.5 flex flex-row sm:flex-col items-center justify-between gap-3 sm:gap-2 rounded-sm border transition-all bg-surface-container border-outline-variant/40')}>
                          <span className="font-sans text-[10px] sm:text-[9px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                            <span>CRIAR</span>
                            {isCriarChanged && (
                              <span className="text-[8px] text-amber-500 font-mono font-bold lowercase normal-case tracking-normal">
                                (antes: {Number(originalChar?.focusAllocation?.criar) || 0})
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2 sm:gap-1.5">
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => setTempFocusCriar(prev => Math.max(0, prev - 1))}
                              className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-sm sm:text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              disabled={isLocked}
                              value={tempFocusCriar}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setTempFocusCriar(isNaN(val) ? 0 : Math.max(0, val));
                              }}
                              className="w-12 h-9 sm:w-10 sm:h-7 text-center bg-surface-container border border-outline-variant/60 text-on-surface font-mono text-sm sm:text-xs font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                            />
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => setTempFocusCriar(prev => prev + 1)}
                              className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-sm sm:text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* CONTROLAR */}
                        <div className={highlightDirectClass(isControlarChanged, 'p-3 sm:p-2.5 flex flex-row sm:flex-col items-center justify-between gap-3 sm:gap-2 rounded-sm border transition-all bg-surface-container border-outline-variant/40')}>
                          <span className="font-sans text-[10px] sm:text-[9px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                            <span>CONTROLAR</span>
                            {isControlarChanged && (
                              <span className="text-[8px] text-amber-500 font-mono font-bold lowercase normal-case tracking-normal">
                                (antes: {Number(originalChar?.focusAllocation?.controlar) || 0})
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2 sm:gap-1.5">
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => setTempFocusControlar(prev => Math.max(0, prev - 1))}
                              className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-sm sm:text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              disabled={isLocked}
                              value={tempFocusControlar}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setTempFocusControlar(isNaN(val) ? 0 : Math.max(0, val));
                              }}
                              className="w-12 h-9 sm:w-10 sm:h-7 text-center bg-surface-container border border-outline-variant/60 text-on-surface font-mono text-sm sm:text-xs font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                            />
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => setTempFocusControlar(prev => prev + 1)}
                              className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-sm sm:text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* ENTENDER */}
                        <div className={highlightDirectClass(isEntenderChanged, 'p-3 sm:p-2.5 flex flex-row sm:flex-col items-center justify-between gap-3 sm:gap-2 rounded-sm border transition-all bg-surface-container border-outline-variant/40')}>
                          <span className="font-sans text-[10px] sm:text-[9px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                            <span>ENTENDER</span>
                            {isEntenderChanged && (
                              <span className="text-[8px] text-amber-500 font-mono font-bold lowercase normal-case tracking-normal">
                                (antes: {Number(originalChar?.focusAllocation?.entender) || 0})
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2 sm:gap-1.5">
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => setTempFocusEntender(prev => Math.max(0, prev - 1))}
                              className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-sm sm:text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              disabled={isLocked}
                              value={tempFocusEntender}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setTempFocusEntender(isNaN(val) ? 0 : Math.max(0, val));
                              }}
                              className="w-12 h-9 sm:w-10 sm:h-7 text-center bg-surface-container border border-outline-variant/60 text-on-surface font-mono text-sm sm:text-xs font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                            />
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => setTempFocusEntender(prev => prev + 1)}
                              className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-sm sm:text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Caminhos list section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-1">
                          <h5 className="font-serif text-[10px] text-primary uppercase tracking-wider font-bold">Caminhos de Focus</h5>
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => {
                                const alreadyChosen = tempCaminhos.map(c => c.nome);
                                const ALL_FOCUS_PATHS = ['Luz', 'Trevas', 'Água', 'Fogo', 'Terra', 'Ar', 'Humanos', 'Animais', 'Plantas', 'Metais', 'Arcano', 'Caos'];
                                const nextAvailable = ALL_FOCUS_PATHS.find(p => !alreadyChosen.includes(p));
                                if (nextAvailable) {
                                  setTempCaminhos(prev => [...prev, { nome: nextAvailable, valor: 0 }]);
                                }
                              }}
                              disabled={tempCaminhos.length >= 12}
                              className="flex items-center gap-1 px-2.5 py-1 text-[9px] border border-[#4cc9f0]/40 text-[#4cc9f0] hover:bg-surface-container/10 hover:border-[#4cc9f0] transition-colors uppercase font-bold cursor-pointer disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-xs">add</span>
                              <span>caminho</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(() => {
                            const list: Array<{ nome: string; valor: number; diffStatus: 'added' | 'removed' | 'edited' | 'none'; idx: number }> = [];
                            
                            // Add all from tempCaminhos
                            tempCaminhos.forEach((c, i) => {
                              let diffStatus: 'added' | 'removed' | 'edited' | 'none' = 'none';
                              if (isReviewMode && originalChar?.focusAllocation?.caminhos) {
                                const orig = originalChar.focusAllocation.caminhos.find((o: any) => o.nome === c.nome);
                                if (!orig) {
                                  diffStatus = 'added';
                                } else if (orig.valor !== c.valor) {
                                  diffStatus = 'edited';
                                }
                              }
                              list.push({ ...c, diffStatus, idx: i });
                            });
                            
                            // Add removed ones
                            if (isReviewMode && originalChar?.focusAllocation?.caminhos) {
                              originalChar.focusAllocation.caminhos.forEach((orig: any) => {
                                const exists = tempCaminhos.some(c => c.nome === orig.nome);
                                if (!exists) {
                                  list.push({
                                    nome: orig.nome,
                                    valor: orig.valor,
                                    diffStatus: 'removed',
                                    idx: -1
                                  });
                                }
                              });
                            }

                            return list.map((caminho) => {
                              const ALL_FOCUS_PATHS = ['Luz', 'Trevas', 'Água', 'Fogo', 'Terra', 'Ar', 'Humanos', 'Animais', 'Plantas', 'Metais', 'Arcano', 'Caos'];
                              // For selecting other paths, exclude those currently chosen (excluding this one)
                              const otherChosen = tempCaminhos.filter((_, i) => i !== caminho.idx).map(c => c.nome);
                              const availablePaths = ALL_FOCUS_PATHS.filter(p => !otherChosen.includes(p));
                              
                              const isAdded = caminho.diffStatus === 'added';
                              const isRemoved = caminho.diffStatus === 'removed';
                              const isEdited = caminho.diffStatus === 'edited';

                              let borderBgClass = 'bg-surface-container border-outline-variant/40';
                              if (isAdded) {
                                borderBgClass = 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30';
                              } else if (isRemoved) {
                                borderBgClass = 'border-red-500/30 bg-surface-container/15 opacity-75';
                              } else if (isEdited) {
                                borderBgClass = highlightDirectClass(true, 'bg-surface-container border-outline-variant/40');
                              }

                              return (
                                <div key={caminho.nome} className={`p-3 space-y-2 relative rounded-sm border transition-all ${borderBgClass}`}>
                                  {/* Delete button (only if not locked, has > 1 pathways, and not a removed path item) */}
                                  {tempCaminhos.length > 1 && !isLocked && !isRemoved && (
                                    <button
                                      type="button"
                                      onClick={() => setTempCaminhos(prev => prev.filter((_, i) => i !== caminho.idx))}
                                      className="absolute top-2 right-2 text-on-surface-variant hover:text-rose-400 transition-colors cursor-pointer"
                                      title="Remover Caminho"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">delete</span>
                                    </button>
                                  )}

                                  {/* Overlay for removed path */}
                                  {isRemoved && (
                                    <div className="absolute inset-0 bg-red-950/85 border border-red-500/50 flex flex-col items-center justify-center z-10 p-2 text-center rounded-sm">
                                      <span className="bg-red-600 text-on-surface text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider font-sans rounded-sm">
                                        [REMOVIDO]
                                      </span>
                                      <span className="text-[10px] text-on-surface/70 mt-1 font-mono font-bold">
                                        {caminho.nome}: {caminho.valor}
                                      </span>
                                    </div>
                                  )}

                                  {/* Badges for added / edited paths */}
                                  {isAdded && (
                                    <span className="absolute top-2 right-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                      Adicionado
                                    </span>
                                  )}
                                  {isEdited && (
                                    <span className="absolute top-2 right-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">
                                      Alterado
                                    </span>
                                  )}

                                  <div className="flex flex-col gap-2">
                                    {/* Dropdown Select Path */}
                                    <div className="flex flex-col gap-1">
                                      <label className="font-sans text-[9px] font-bold text-outline uppercase tracking-wider">Caminho Escolhido</label>
                                      <CustomSelect
                                        disabled={isLocked || isRemoved}
                                        value={caminho.nome}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setTempCaminhos(prev => prev.map((c, i) => i === caminho.idx ? { ...c, nome: val } : c));
                                        }}
                                        variant="parchment"
                                        size="sm"
                                        options={availablePaths.map(p => ({
                                          value: p,
                                          label: p
                                        }))}
                                      />
                                    </div>

                                    {/* Numeric input Path Level */}
                                    <div className="flex items-center justify-between gap-3 mt-1">
                                      <div className="flex flex-col">
                                        <label className="font-sans text-[10px] sm:text-[9px] font-bold text-outline uppercase tracking-wider">Nível</label>
                                        {isEdited && (
                                          <span className="text-[8px] text-amber-500 font-mono font-semibold select-none leading-none mt-0.5">
                                            Antes: {(() => {
                                              const orig = originalChar?.focusAllocation?.caminhos?.find((o: any) => o.nome === caminho.nome);
                                              return orig ? orig.valor : 0;
                                            })()}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 sm:gap-1.5">
                                        <button
                                          type="button"
                                          disabled={isLocked || isRemoved}
                                          onClick={() => setTempCaminhos(prev => prev.map((c, i) => i === caminho.idx ? { ...c, valor: Math.max(0, c.valor - 1) } : c))}
                                          className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-sm sm:text-xs font-bold cursor-pointer disabled:opacity-50"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={isLocked || isRemoved}
                                          value={caminho.valor}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            setTempCaminhos(prev => prev.map((c, i) => i === caminho.idx ? { ...c, valor: isNaN(val) ? 0 : Math.max(0, val) } : c));
                                          }}
                                          className="w-12 h-9 sm:w-10 sm:h-7 text-center bg-surface-container border border-outline-variant/60 text-on-surface font-mono text-sm sm:text-xs font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                                        />
                                        <button
                                          type="button"
                                          disabled={isLocked || isRemoved}
                                          onClick={() => setTempCaminhos(prev => prev.map((c, i) => i === caminho.idx ? { ...c, valor: caminho.valor + 1 } : c))}
                                          className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center bg-surface-container border border-outline-variant hover:border-primary text-on-surface text-sm sm:text-xs font-bold cursor-pointer disabled:opacity-50"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Path Affinity Display */}
                                  {(() => {
                                    const badge = getPathAffinityBadge(caminho.nome);
                                    if (badge) {
                                      return (
                                        <div className={`p-1.5 border flex items-center justify-between gap-2 ${badge.bgClass} ${badge.borderClass} text-[8px] mt-1`}>
                                          <span className="font-sans text-on-surface-variant font-bold uppercase tracking-wider">Afinidade:</span>
                                          <span className={`px-1 py-0.2 font-sans font-bold uppercase tracking-widest border ${badge.textClass} ${badge.borderClass}`}>
                                            {badge.label.replace('Canônico / ', '')}
                                          </span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Warning Messages and Save Buttons */}
                      <div className="pt-1.5 space-y-2">
                        {isFocusAllocationOverspent && (
                          <div className="p-2 bg-red-950/40 border border-red-800 text-red-400 font-sans text-[11px] flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>Pontos excedidos! Você distribuiu {currentTotalTempFocus} de {totalFocusPoints} pontos.</span>
                          </div>
                        )}
                        {!isFocusAllocationOverspent && (!hasAtLeastOneForm || !hasAtLeastOnePath) && (
                          <div className="p-2 bg-amber-950/40 border border-amber-800 text-[#ffe082] font-sans text-[11px] flex items-center gap-2 leading-relaxed">
                            <span className="material-symbols-outlined text-sm">info</span>
                            <span>Selecione pelo menos uma Forma (Criar/Controlar/Entender) e um Caminho.</span>
                          </div>
                        )}

                        {!isLocked && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={isFocusAllocationSaveDisabled}
                              onClick={handleSaveFocusAllocation}
                              className={`px-4 py-1.5 text-xs font-sans uppercase font-bold transition-colors rounded-none ${
                                isFocusAllocationSaveDisabled
                                  ? 'bg-surface-container text-on-surface/30 border border-transparent cursor-not-allowed select-none'
                                  : 'bg-surface-container/20 border border-[#4cc9f0]/40 text-[#4cc9f0] hover:bg-[#4cc9f0] hover:text-on-primary cursor-pointer'
                              }`}
                            >
                              Salvar Distribuição
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form View (Adding/Editing Spell) */}
              {(isAddingSpell || editingSpell !== null) ? (
                <div className="space-y-4 p-4 bg-surface-container-low border border-outline-variant/40">
                  <h4 className="font-serif text-xs text-primary uppercase tracking-wider font-semibold">
                    {editingSpell?.id ? 'Editar Feitiço' : 'Inscrição de Novo Feitiço'}
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nome do Feitiço */}
                    <div className="col-span-1 sm:col-start-1 sm:row-start-1 flex flex-col gap-1">
                      <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest">
                        Nome do Feitiço
                      </label>
                      <>
                      <input maxLength={50}
                        type="text"
                        value={editingSpell?.name || ''}
                        onChange={(e) => setEditingSpell(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Bola de Fogo"
                        className={`w-full bg-surface-container border border-outline-variant/60 p-2 text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary outline-none ${editingSpell?.name?.length >= 50 ? '!text-red-500' : ''}`}
                      />
                      {editingSpell?.name?.length >= 50 && (
                        <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
                          Limite atingido (50)
                        </div>
                      )}
                      </>
              
                    </div>

                    {/* Forma & Caminho with Granular Fields & Limits Validation */}
                    <div className="col-span-1 sm:col-start-2 sm:row-start-1 sm:row-span-4 flex flex-col gap-2">
                      <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest border-b border-outline-variant/30 pb-1">
                        Forma & Caminho
                      </label>
                      <div className="space-y-2 bg-surface-container border border-outline-variant/40 p-3">
                        {/* CRIAR */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="font-sans text-xs font-medium text-on-surface uppercase">CRIAR</span>
                            <span className="font-mono text-[9px] text-outline">Limite Alocado: {editedChar.focusAllocation?.criar || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingSpell(prev => {
                                const current = Number(prev?.criar) || 0;
                                return { ...prev, criar: Math.max(0, current - 1) };
                              })}
                              className="w-6 h-6 flex items-center justify-center bg-surface-container border border-outline-variant/60 text-on-surface text-xs cursor-pointer hover:border-primary"
                            >
                              -
                            </button>
                            <span className="font-mono text-sm font-bold w-6 text-center">{editingSpell?.criar || 0}</span>
                            <button
                              type="button"
                              onClick={() => setEditingSpell(prev => {
                                const current = Number(prev?.criar) || 0;
                                const max = Number(editedChar.focusAllocation?.criar) || 0;
                                return { ...prev, criar: Math.min(max, current + 1) };
                              })}
                              className="w-6 h-6 flex items-center justify-center bg-surface-container border border-outline-variant/60 text-on-surface text-xs cursor-pointer hover:border-primary"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* CONTROLAR */}
                        <div className="flex items-center justify-between gap-4 border-t border-outline-variant/20 pt-2">
                          <div className="flex flex-col">
                            <span className="font-sans text-xs font-medium text-on-surface uppercase">CONTROLAR</span>
                            <span className="font-mono text-[9px] text-outline">Limite Alocado: {editedChar.focusAllocation?.controlar || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingSpell(prev => {
                                const current = Number(prev?.controlar) || 0;
                                return { ...prev, controlar: Math.max(0, current - 1) };
                              })}
                              className="w-6 h-6 flex items-center justify-center bg-surface-container border border-outline-variant/60 text-on-surface text-xs cursor-pointer hover:border-primary"
                            >
                              -
                            </button>
                            <span className="font-mono text-sm font-bold w-6 text-center">{editingSpell?.controlar || 0}</span>
                            <button
                              type="button"
                              onClick={() => setEditingSpell(prev => {
                                const current = Number(prev?.controlar) || 0;
                                const max = Number(editedChar.focusAllocation?.controlar) || 0;
                                return { ...prev, controlar: Math.min(max, current + 1) };
                              })}
                              className="w-6 h-6 flex items-center justify-center bg-surface-container border border-outline-variant/60 text-on-surface text-xs cursor-pointer hover:border-primary"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* ENTENDER */}
                        <div className="flex items-center justify-between gap-4 border-t border-outline-variant/20 pt-2">
                          <div className="flex flex-col">
                            <span className="font-sans text-xs font-medium text-on-surface uppercase">ENTENDER</span>
                            <span className="font-mono text-[9px] text-outline">Limite Alocado: {editedChar.focusAllocation?.entender || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingSpell(prev => {
                                const current = Number(prev?.entender) || 0;
                                return { ...prev, entender: Math.max(0, current - 1) };
                              })}
                              className="w-6 h-6 flex items-center justify-center bg-surface-container border border-outline-variant/60 text-on-surface text-xs cursor-pointer hover:border-primary"
                            >
                              -
                            </button>
                            <span className="font-mono text-sm font-bold w-6 text-center">{editingSpell?.entender || 0}</span>
                            <button
                              type="button"
                              onClick={() => setEditingSpell(prev => {
                                const current = Number(prev?.entender) || 0;
                                const max = Number(editedChar.focusAllocation?.entender) || 0;
                                return { ...prev, entender: Math.min(max, current + 1) };
                              })}
                              className="w-6 h-6 flex items-center justify-center bg-surface-container border border-outline-variant/60 text-on-surface text-xs cursor-pointer hover:border-primary"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Caminhos */}
                        {(() => {
                          const alloc = editedChar.focusAllocation;
                          const allocatedCaminhosList = alloc?.caminhos && alloc.caminhos.length > 0
                            ? alloc.caminhos
                            : [{ nome: alloc?.caminhoNome || 'Luz', valor: alloc?.caminhoValor || 0 }];

                          return allocatedCaminhosList.map((cam, idx) => {
                            const currentVal = Number(editingSpell?.caminhosValores?.[cam.nome]) || 0;
                            return (
                              <div key={idx} className="flex items-center justify-between gap-4 border-t border-outline-variant/20 pt-2">
                                <div className="flex flex-col">
                                  <span className="font-sans text-xs font-medium text-[#4cc9f0] uppercase">{cam.nome}</span>
                                  <span className="font-mono text-[9px] text-outline">Limite Alocado: {cam.valor}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingSpell(prev => {
                                      const currentCaminhos = prev?.caminhosValores ? { ...prev.caminhosValores } : {};
                                      const currentVal = Number(currentCaminhos[cam.nome]) || 0;
                                      currentCaminhos[cam.nome] = Math.max(0, currentVal - 1);
                                      return { ...prev, caminhosValores: currentCaminhos };
                                    })}
                                    className="w-6 h-6 flex items-center justify-center bg-surface-container border border-outline-variant/60 text-on-surface text-xs cursor-pointer hover:border-primary"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-sm font-bold w-6 text-center">{currentVal}</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSpell(prev => {
                                      const currentCaminhos = prev?.caminhosValores ? { ...prev.caminhosValores } : {};
                                      const currentVal = Number(currentCaminhos[cam.nome]) || 0;
                                      const max = Number(cam.valor) || 0;
                                      currentCaminhos[cam.nome] = Math.min(max, currentVal + 1);
                                      return { ...prev, caminhosValores: currentCaminhos };
                                    })}
                                    className="w-6 h-6 flex items-center justify-center bg-surface-container border border-outline-variant/60 text-on-surface text-xs cursor-pointer hover:border-primary"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Custo em PM */}
                    <div className="col-span-1 sm:col-start-1 sm:row-start-2 flex flex-col gap-1">
                      <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest">
                        Custo em PM
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingSpell?.cost || ''}
                        onChange={(e) => setEditingSpell(prev => ({ ...prev, cost: e.target.value }))}
                        placeholder="Ex: 3"
                        className="w-full bg-surface-container border border-outline-variant/60 p-2 text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    {/* Alcance (metros) */}
                    <div className="col-span-1 sm:col-start-1 sm:row-start-3 flex flex-col gap-1">
                      <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest">
                        Alcance (metros)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editingSpell?.range || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : String(parseInt(e.target.value, 10) || 0);
                          setEditingSpell(prev => ({ ...prev, range: val }));
                        }}
                        placeholder="Ex: 30"
                        className="w-full bg-surface-container border border-outline-variant/60 p-2 text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    {/* Duração (HH:MM:SS) */}
                    <div className="col-span-1 sm:col-start-1 sm:row-start-4 flex flex-col gap-1">
                      <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest">
                        Duração
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-sans text-[8px] font-semibold text-outline/70 text-center uppercase tracking-wider">Horas</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="HH"
                            value={editingSpell?.durationHH !== undefined ? editingSpell.durationHH : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0;
                              setEditingSpell(prev => ({ ...prev, durationHH: val }));
                            }}
                            className="w-full bg-surface-container border border-outline-variant/60 p-2 text-center text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-sans text-[8px] font-semibold text-outline/70 text-center uppercase tracking-wider">Minutos</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="MM"
                            value={editingSpell?.durationMM !== undefined ? editingSpell.durationMM : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0;
                              setEditingSpell(prev => ({ ...prev, durationMM: val }));
                            }}
                            className="w-full bg-surface-container border border-outline-variant/60 p-2 text-center text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-sans text-[8px] font-semibold text-outline/70 text-center uppercase tracking-wider">Segundos</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="SS"
                            value={editingSpell?.durationSS !== undefined ? editingSpell.durationSS : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0;
                              setEditingSpell(prev => ({ ...prev, durationSS: val }));
                            }}
                            className="w-full bg-surface-container border border-outline-variant/60 p-2 text-center text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descrição / Efeito */}
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
                      <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-widest">
                        Efeito / Descrição
                      </label>
                      <>
                      <textarea maxLength={300}
                        value={editingSpell?.description || ''}
                        onChange={(e) => setEditingSpell(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o efeito mágico e as regras do feitiço..."
                        rows={4}
                        className={`w-full bg-surface-container border border-outline-variant/60 p-2 text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary outline-none resize-none ${editingSpell?.description?.length >= 300 ? '!text-red-500' : ''}`}
                      />
                      {editingSpell?.description?.length >= 300 && (
                        <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
                          Limite atingido (300)
                        </div>
                      )}
                      </>
              
                    </div>
                  </div>

                  {/* Actions for Form */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSpell(null);
                        setIsAddingSpell(false);
                      }}
                      className="px-4 py-2 border border-outline-variant text-on-surface hover:text-on-surface hover:border-white transition-colors cursor-pointer text-xs font-sans uppercase font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSpell}
                      className="px-4 py-2 bg-primary border border-primary/20 text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer text-xs font-sans uppercase font-bold"
                    >
                      SALVAR
                    </button>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {/* Header/Controls */}
                  <div className="flex justify-between items-center">
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      Gerencie as magias, preces e rituais conhecidos por seu personagem.
                    </p>
                    {!isLocked && isSavedAllocationValid && (
                      <button
                        type="button"
                        onClick={() => handleStartEditSpell()}
                        className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all cursor-pointer text-xs font-sans uppercase font-bold"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span className="hidden sm:inline">Escrever Feitiço</span>
                      </button>
                    )}
                  </div>
 
                  {/* Spells Grid */}
                  {(!visibleSpells || visibleSpells.length === 0) ? (
                    <div className="text-center py-12 border border-dashed border-outline-variant/40 bg-surface-container-low/30 space-y-3">
                      <span className="material-symbols-outlined text-4xl text-outline/40">auto_stories</span>
                      <p className="font-serif italic text-sm text-primary/70">
                        O grimório está em branco. Nenhuma runa ou feitiço foi escrito ainda.
                      </p>
                      {!isLocked && isSavedAllocationValid && (
                        <button
                          type="button"
                          onClick={() => handleStartEditSpell()}
                          className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-on-primary transition-colors text-xs font-sans uppercase font-bold cursor-pointer"
                        >
                          Escrever Primeiro Feitiço
                        </button>
                      )}
                      {!isLocked && !isSavedAllocationValid && (
                        <p className="font-sans text-xs text-secondary">
                          Configure e salve a distribuição de Focus / Fé acima para poder inscrever feitiços.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visibleSpells.map(({ spell, diffStatus }) => {
                        const spellEdited = isReviewMode && diffStatus === 'none' && isSpellChanged(spell);
                        const isAdded = diffStatus === 'added';
                        const isRemoved = diffStatus === 'removed';

                        let borderBgClass = 'bg-surface-container-low border-outline-variant/60';
                        if (spellEdited) {
                          borderBgClass = highlightDirectClass(true, 'bg-surface-container-low border-outline-variant/60', true);
                        } else if (isAdded) {
                          borderBgClass = 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/80';
                        } else if (isRemoved) {
                          borderBgClass = 'border-red-500/30 bg-surface-container/15 opacity-75';
                        }

                        return (
                          <div
                            key={spell.id}
                            className={`p-4 flex flex-col justify-between hover:border-primary/50 transition-all group relative overflow-hidden border ${borderBgClass}`}
                          >
                            <div>
                              {/* Overlay for removed spell */}
                              {isRemoved && (
                                <div className="absolute inset-0 bg-red-950/85 border border-red-500/50 flex flex-col items-center justify-center z-10 p-4 text-center">
                                  <span className="bg-red-600 text-on-surface text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider font-sans rounded-sm">
                                    [REMOVIDO]
                                  </span>
                                  <span className="text-xs text-on-surface font-serif font-bold mt-2">
                                    {spell.name}
                                  </span>
                                  <span className="text-[10px] text-on-surface/75 font-mono mt-1">
                                    Foco: {spell.focus} | Custo: {spell.cost} PM
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-serif text-sm text-primary font-semibold tracking-wide flex flex-wrap items-center gap-1.5">
                                  {spell.name}
                                  {spellEdited && (
                                    <span className="inline-flex items-center gap-0.5 bg-amber-500 text-on-primary px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-widest rounded-sm">
                                      Alterada
                                    </span>
                                  )}
                                  {isAdded && (
                                    <span className="inline-flex items-center gap-0.5 bg-emerald-500 text-on-primary px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-widest rounded-sm">
                                      Adicionada
                                    </span>
                                  )}
                                </h5>
                                
                                {/* Edit & Delete Controls for Spell */}
                                {!isLocked && !isRemoved && (
                                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditSpell(spell)}
                                      className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-sm"
                                      title="Editar feitiço"
                                    >
                                      edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSpell(spell.id)}
                                      className="text-primary hover:text-red-500 transition-colors cursor-pointer material-symbols-outlined text-sm"
                                      title="Excluir feitiço"
                                    >
                                      delete
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Magic Details tags */}
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-on-surface-variant/80 mb-3 border-b border-outline-variant/20 pb-2">
                                {spell.focus && <span>Foco: <strong className="text-on-surface">{spell.focus}</strong></span>}
                                {spell.cost && <span>Custo: <strong className="text-[#ffe082]">{spell.cost}</strong></span>}
                                {spell.range && <span>Alcance: <strong className="text-on-surface">{spell.range}</strong></span>}
                                {spell.duration && <span>Dur: <strong className="text-on-surface">{spell.duration}</strong></span>}
                              </div>

                              {/* Description text */}
                              <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed whitespace-pre-wrap mt-2">
                                {spell.description || <span className="italic opacity-50">Sem descrição adicional...</span>}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Spell Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!spellToDelete}
        onClose={() => setSpellToDelete(null)}
        onConfirm={handleConfirmDeleteSpell}
        title="Apagar Feitiço"
        description="Você tem certeza que deseja apagar este feitiço do grimório? Essa ação não pode ser desfeita."
        itemPreview={
          spellToDelete ? (
            <span className="font-mono text-sm text-primary font-bold">
              {spellToDelete.name}
            </span>
          ) : undefined
        }
        confirmText="Apagar"
      />

      {/* Portrait Custom Modal */}
      {isPortraitModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-sm w-full p-6 space-y-6 shadow-2xl relative flex flex-col rounded-none">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/50 pb-3">
              <h3 className="font-serif text-base text-primary uppercase tracking-wider font-semibold">
                Editar Retrato
              </h3>
              <button
                type="button"
                onClick={() => setIsPortraitModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            {/* Modal Portrait Image View */}
            <div className="aspect-[4/5] max-h-[260px] bg-surface-container border border-outline-variant/60 relative overflow-hidden mx-auto shadow-inner rounded-none w-full">
              {!modalPortraitUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4 bg-surface-container-low">
                  <span className="material-symbols-outlined text-primary text-3xl">upload</span>
                  <span className="text-[11px] font-sans font-bold tracking-wider text-outline uppercase">
                    Sem imagem definida
                  </span>
                </div>
              ) : (
                <>
                  <img
                    alt="Previa do Retrato"
                    className="w-full h-full object-cover filter contrast-[1.05]"
                    src={modalPortraitUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent"></div>
                </>
              )}
              
              {/* Edit Icon (Pencil) overlay representing edit state */}
              <div className="absolute right-3 bottom-3 bg-surface-container/90 text-primary border border-primary/50 w-8 h-8 flex items-center justify-center shadow-md z-10 rounded-none">
                <span className="material-symbols-outlined text-sm">edit</span>
              </div>
            </div>

            {/* Action Buttons: Upload and Link */}
            <div className="space-y-4">
              <div className="flex gap-2">
                {/* Upload Action */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 border border-outline-variant text-[11px] font-sans font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:border-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer rounded-none bg-surface-container-low"
                  title="Upload de imagem local"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  <span>Upload</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Link Action Indicator */}
                <div
                  className="flex-1 py-1.5 px-3 border border-primary/40 text-[11px] font-sans font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-1.5 rounded-none bg-primary-container bg-opacity-5 cursor-default select-none"
                >
                  <span className="material-symbols-outlined text-sm text-primary">link</span>
                  <span>Link de Rede</span>
                </div>
              </div>

              {/* Space below for the input link */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">link</span>
                  Insira a URL da Imagem Abaixo:
                </label>
                <>
<input maxLength={50}
                  type="url"
                  value={modalPortraitUrl}
                  onChange={(e) => {
                    setModalPortraitUrl(e.target.value);
                    handleDemographicChange('portraitUrl', e.target.value);
                  }}
                  placeholder="Cole a URL da Imagem personalizada..."
                  className={`w-full bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2.5 placeholder:text-outline-variant/30 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none ${modalPortraitUrl?.length >= 50 ? '!text-red-500' : ''}`}
                />
{modalPortraitUrl?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              </div>
            </div>

            {/* Finalize button */}
            <button
              type="button"
              onClick={() => setIsPortraitModalOpen(false)}
              className="w-full py-2.5 bg-primary-container text-on-primary-container font-sans text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-primary/30 rounded-none text-center"
            >
              Confirmar Retrato
            </button>
          </div>
        </div>
      )}

      {/* Enhancements Selection Modal */}
      {isEnhancementModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-lg w-full p-6 space-y-4 shadow-2xl relative flex flex-col rounded-none max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/50 pb-3">
              <h3 className="font-serif text-sm text-primary uppercase tracking-wider font-semibold">
                Adicionar Aprimoramento {enhancementModalType === 'POSITIVO' ? 'Positivo' : 'Negativo'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEnhancementModalOpen(false);
                  setSelectedEnhancement(null);
                  setEnhancementSearchQuery('');
                }}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans font-bold text-outline uppercase tracking-wider">
                Digite para buscar aprimoramentos:
              </label>
              <>
<input maxLength={50}
                type="text"
                autoFocus
                value={enhancementSearchQuery}
                onChange={(e) => {
                  setEnhancementSearchQuery(e.target.value);
                  setSelectedEnhancement(null);
                }}
                placeholder="Ex: Ambidestria, Alergia..."
                className={`w-full bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2.5 placeholder:text-outline-variant/30 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none ${enhancementSearchQuery?.length >= 50 ? '!text-red-500' : ''}`}
              />
{enhancementSearchQuery?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[400px] pr-1 space-y-3">
              {selectedEnhancement ? (
                // Selected enhancement details & levels selection
                <div className="space-y-4">
                  <div className="bg-surface-container p-3 border border-outline-variant/40">
                    <h4 className="text-sm font-bold text-on-surface mb-1">{selectedEnhancement.name}</h4>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 bg-surface-container font-mono tracking-wider font-bold text-outline">
                      {selectedEnhancement.tipo}
                    </span>
                    
                    {!selectedEnhancement.tem_niveis && selectedEnhancement.descricao && (
                      <p className="text-xs text-outline-variant mt-2 leading-relaxed">
                        {selectedEnhancement.descricao}
                      </p>
                    )}
                  </div>

                  {selectedEnhancement.tem_niveis && selectedEnhancement.niveis ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-sans font-bold text-outline uppercase tracking-wider block">
                        Selecione o Nível Desejado:
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedEnhancement.niveis.map((lvl) => (
                          <button
                            type="button"
                            key={lvl.nivel}
                            onClick={() => {
                              setSelectedLevel(lvl);
                            }}
                            className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between rounded-none ${
                              selectedLevel?.nivel === lvl.nivel
                                ? 'border-primary bg-primary/10'
                                : 'border-outline-variant/30 bg-surface-container-high hover:border-outline-variant/80'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full mb-1">
                              <span className="text-xs font-bold text-on-surface">Nível {lvl.nivel}</span>
                              <span className="text-xs font-mono text-primary font-bold">
                                {enhancementModalType === 'POSITIVO' ? '-' : '+'}{lvl.custo} pts
                              </span>
                            </div>
                            <span className="text-[10px] text-outline-variant leading-tight">
                              {lvl.descricao}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-2.5 px-3 bg-surface-container border border-outline-variant/20">
                      <span className="text-xs text-outline">Custo único:</span>
                      <span className="text-sm font-mono text-primary font-bold">
                        {enhancementModalType === 'POSITIVO' ? '-' : '+'}{selectedEnhancement.custo} pts
                      </span>
                    </div>
                  )}

                  {/* Add action */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEnhancement(null)}
                      className="flex-1 py-2 border border-outline-variant text-[11px] font-sans font-bold uppercase tracking-wider text-outline hover:text-on-surface transition-colors cursor-pointer rounded-none bg-transparent"
                    >
                      Voltar à lista
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        let nameToSave = selectedEnhancement.name;
                        if (selectedEnhancement.tem_niveis && selectedLevel) {
                          nameToSave = `${selectedEnhancement.name} (Nível ${selectedLevel.nivel})`;
                        }
                        
                        if (nameToSave.toLowerCase().includes("corpo maleável") || nameToSave.toLowerCase().includes("corpo maleavel")) {
                          const currentFor = Number(editedChar.attributes.for.pontosGastos) || 0;
                          if (currentFor >= 13) {
                            toast.error("Sua Força deverá ser reduzida para 12 ou menos para adquirir este aprimoramento.");
                            return;
                          }
                        }
                        
                        if (nameToSave.toLowerCase().includes("montaria especial")) {
                          const hasPontosFe = (editedChar.aprimoramentosPositivos || []).some(s =>
                            s && (s.toLowerCase().includes('pontos de fé') || s.toLowerCase().includes('pontos de fe'))
                          );
                          if (!hasPontosFe) {
                            toast.error("É necessária a adição do atributo Pontos de Fé");
                            return;
                          }
                        }

                        if (nameToSave.toLowerCase().includes("familiares")) {
                          const hasPoderesMagicos = (editedChar.aprimoramentosPositivos || []).some(s =>
                            s && (s.toLowerCase().includes('poderes mágicos') || s.toLowerCase().includes('poderes magicos'))
                          );
                          if (!hasPoderesMagicos) {
                            toast.error("É necessária a adição do atributo Poderes Mágicos");
                            return;
                          }
                        }
                        
                        if (enhancementModalType === 'POSITIVO') {
                          const arr = [...(editedChar.aprimoramentosPositivos || [])].filter(s => s && s.trim());
                          if (!arr.includes(nameToSave)) {
                            arr.push(nameToSave);
                            setEditedChar(prev => ({ ...prev, aprimoramentosPositivos: arr }));
                            const isSpecialEnh = nameToSave.toLowerCase().includes("familiares") || nameToSave.toLowerCase().includes("acerto crítico aprimorado") ||
                                                 nameToSave.toLowerCase().includes("acerto critico aprimorado") ||
                                                 nameToSave.toLowerCase().includes("arma ou amuleto") ||
                                                 nameToSave.toLowerCase().includes("arma preferencial") ||
                                                 nameToSave.toLowerCase().includes("acuide com arma") ||
                                                 nameToSave.toLowerCase().includes("acuidade com arma") ||
                                                 nameToSave.toLowerCase().includes("equipamento inicial") ||
                                                 nameToSave.toLowerCase().includes("montaria especial") ||
                                                 nameToSave.toLowerCase().includes("companheiro animal");
                            if (nameToSave.toLowerCase().includes("equipamento inicial")) {
                              if (userRole === 'player') {
                                toast.success("Equipamento Inicial - Fale com o mestre qual bem de alta qualidade você deseja inserir logo no começo.");
                              } else {
                                toast.success(`Aprimoramento Positivo adicionado: ${nameToSave}`);
                              }
                            } else if (nameToSave.toLowerCase().includes("familiares")) {
                              if (userRole === 'player') {
                                toast.success("Familiares - preencha a ficha do seu Familiar");
                              } else {
                                toast.success(`Aprimoramento Positivo adicionado: ${nameToSave}`);
                              }
                            } else if (nameToSave.toLowerCase().includes("montaria especial")) {
                              if (userRole === 'player') {
                                toast.success("Montaria Especial - preencha a ficha da sua Montaria Especial");
                              } else {
                                toast.success(`Aprimoramento Positivo adicionado: ${nameToSave}`);
                              }
                            } else if (nameToSave.toLowerCase().includes("companheiro animal")) {
                              if (userRole === 'player') {
                                toast.success("Companheiro Animal - preencha a ficha do seu companheiro animal");
                              } else {
                                toast.success(`Aprimoramento Positivo adicionado: ${nameToSave}`);
                              }
                            } else if (!isSpecialEnh) {
                              toast.success(`Aprimoramento Positivo adicionado: ${nameToSave}`);
                            }
                          }
                        } else {
                          const arr = [...(editedChar.aprimoramentosNegativos || [])].filter(s => s && s.trim());
                          if (!arr.includes(nameToSave)) {
                            arr.push(nameToSave);
                            setEditedChar(prev => ({ ...prev, aprimoramentosNegativos: arr }));
                            toast.warning(`Aprimoramento Negativo adicionado: ${nameToSave}`);
                          }
                        }
                        
                        setSelectedEnhancement(null);
                        setEnhancementSearchQuery('');
                      }}
                      className="flex-1 py-2 bg-primary text-on-primary font-sans text-[11px] font-bold uppercase tracking-wider hover:brightness-110 cursor-pointer rounded-none border border-transparent"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              ) : (
                // Search list results
                <div className="space-y-2">
                  {(() => {
                    const filtered = aprimoramentosList.filter((item) => {
                      if (item.tipo !== enhancementModalType) return false;
                      if (!enhancementSearchQuery.trim()) return true;
                      return item.name.toLowerCase().includes(enhancementSearchQuery.toLowerCase());
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-xs text-outline-variant/40 italic">
                          Nenhum aprimoramento correspondente encontrado.
                        </div>
                      );
                    }

                    return filtered.map((item) => {
                      const minCost = item.tem_niveis && item.niveis 
                        ? Math.min(...item.niveis.map(n => n.custo))
                        : item.custo;
                      const maxCost = item.tem_niveis && item.niveis
                        ? Math.max(...item.niveis.map(n => n.custo))
                        : item.custo;
                      
                      const costDisplay = item.tem_niveis
                        ? `${minCost}-${maxCost}`
                        : `${minCost}`;

                      const isAlreadyChosen = (enhancementModalType === 'POSITIVO' 
                        ? cleanAprimoramentosPositivos 
                        : cleanAprimoramentosNegativos
                      ).some(chosen => {
                        return chosen === item.name || chosen.startsWith(item.name + ' (') || chosen.startsWith(item.name + ' (Nível');
                      });

                      return (
                        <button
                          type="button"
                          key={item.id}
                          disabled={isAlreadyChosen}
                          onClick={() => {
                            if (isAlreadyChosen) return;
                            setSelectedEnhancement(item);
                            if (item.tem_niveis && item.niveis) {
                              setSelectedLevel(item.niveis[0]);
                            } else {
                              setSelectedLevel(null);
                            }
                          }}
                          className={`w-full p-3 text-left border transition-all flex items-start justify-between gap-4 rounded-none ${
                            isAlreadyChosen
                              ? 'border-outline-variant/10 bg-surface-container opacity-40 cursor-not-allowed'
                              : 'border-outline-variant/20 hover:border-primary/50 hover:bg-primary/5 bg-surface-container-high cursor-pointer group'
                          }`}
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold block truncate ${isAlreadyChosen ? 'text-outline-variant' : 'text-on-surface group-hover:text-primary transition-colors'}`}>
                                {item.name}
                              </span>
                              {isAlreadyChosen && (
                                <span className="text-[8px] bg-outline-variant/20 text-outline px-1.5 py-0.5 rounded-sm font-sans font-bold uppercase tracking-wider shrink-0">
                                  Já Escolhido
                                </span>
                              )}
                            </div>
                            {!item.tem_niveis && item.descricao && (
                              <p className="text-[10px] text-outline-variant/80 line-clamp-2 leading-tight">
                                {item.descricao}
                              </p>
                            )}
                            {item.tem_niveis && (
                              <span className="text-[9px] uppercase tracking-wider font-bold text-outline-variant/60 block">
                                Possui {item.niveis?.length} níveis
                              </span>
                            )}
                          </div>
                          <span className={`text-xs font-mono font-bold shrink-0 ${isAlreadyChosen ? 'text-outline-variant/50' : 'text-primary'}`}>
                            {enhancementModalType === 'POSITIVO' ? '-' : '+'}{costDisplay} pts
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Perícias Selection & Creation Modal */}
      {isPericiasModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-5xl w-full p-4 md:p-8 shadow-2xl relative flex flex-col rounded-none h-[92vh] max-h-[92vh] md:h-auto md:max-h-[92vh]">
            
            {/* Modal Header - FIRST Element */}
            <div className="flex flex-col gap-3 pb-3 border-b border-outline-variant/50 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                  <h3 className="font-serif text-sm text-primary uppercase tracking-wider font-semibold">
                    Perícias
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPericiasModalOpen(false);
                    setPericiaSearchQuery('');
                  }}
                  className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  close
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Mobile ONLY) - SECOND Element */}
            <div className="flex md:hidden border border-outline-variant/30 bg-surface-container p-1 rounded-none shrink-0 mb-3 mt-3">
              <button
                type="button"
                onClick={() => setActiveMobileTab('adicionar')}
                className={`flex-1 py-2 text-center font-sans text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] flex items-center justify-center ${
                  activeMobileTab === 'adicionar'
                    ? 'bg-primary text-on-primary font-black'
                    : 'text-outline hover:text-on-surface font-normal'
                }`}
              >
                Adicionar Perícias
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileTab('minhas')}
                className={`flex-1 py-2 text-center font-sans text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] flex items-center justify-center ${
                  activeMobileTab === 'minhas'
                    ? 'bg-primary text-on-primary font-black'
                    : 'text-outline hover:text-on-surface font-normal'
                }`}
              >
                Minhas Perícias ({tempSkills.length})
              </button>
            </div>

            {/* Dual Column / Responsive Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden min-h-0 flex-grow py-3">
              
              {/* Column 1: Catalog & Creation */}
              <div className={`md:col-span-5 flex flex-col space-y-4 min-h-0 ${activeMobileTab === 'adicionar' ? 'flex' : 'hidden md:flex'}`}>
                <h4 className="hidden md:flex text-[10px] font-sans font-bold text-outline-variant uppercase tracking-widest border-b border-outline-variant/30 pb-1 items-center gap-1.5 shrink-0">
                  <span className="material-symbols-outlined text-xs">search</span>
                  1. Buscar ou Criar Perícias
                </h4>

                {showCreatePericiaForm ? (
                  /* Create Skill Form */
                  <div className="space-y-4 border border-primary/20 p-4 bg-surface-container animate-fadeIn flex flex-col min-h-0">
                    <div className="flex justify-between items-center shrink-0">
                      <h4 className="text-xs font-serif text-primary uppercase tracking-wider font-bold">Criar Perícia Personalizada</h4>
                      <button 
                        type="button"
                        onClick={() => setShowCreatePericiaForm(false)}
                        className="text-[10px] text-outline-variant hover:text-on-surface underline font-sans min-h-[32px] px-2 flex items-center"
                      >
                        Cancelar
                      </button>
                    </div>
                    
                    {/* Nome */}
                    <div className="space-y-1 shrink-0">
                      <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Nome *</label>
                      <>
<input maxLength={50}
                        type="text"
                        value={newPericiaName}
                        onChange={(e) => setNewPericiaName(e.target.value)}
                        placeholder="Ex: Alquimia Proibida..."
                        className={`w-full bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 placeholder:text-outline-variant/30 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none min-h-[44px] ${newPericiaName?.length >= 50 ? '!text-red-500' : ''}`}
                      />
{newPericiaName?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                    </div>

                    {/* Atributo Base */}
                    <div className="space-y-1 shrink-0">
                      <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Atributo Base</label>
                      <CustomSelect
                        value={newPericiaAttr}
                        onChange={(e) => setNewPericiaAttr(e.target.value)}
                        variant="parchment"
                        options={[
                          { value: "con", label: "CON (Constituição)" },
                          { value: "for", label: "FOR (Força)" },
                          { value: "des", label: "DES (Destreza)" },
                          { value: "agi", label: "AGI (Agilidade)" },
                          { value: "int", label: "INT (Inteligência)" },
                          { value: "per", label: "PER (Percepção)" },
                          { value: "will", label: "WILL (Força de Vontade)" },
                          { value: "car", label: "CAR (Carisma)" }
                        ]}
                      />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-1 flex-grow flex flex-col min-h-0">
                      <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Descrição</label>
                      <>
<textarea maxLength={300}
                        value={newPericiaDesc}
                        onChange={(e) => setNewPericiaDesc(e.target.value)}
                        placeholder="Descreva o propósito e regras de uso desta perícia..."
                        rows={3}
                        className={`w-full flex-grow bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 placeholder:text-outline-variant/30 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none resize-none min-h-[60px] ${newPericiaDesc?.length >= 300 ? '!text-red-500' : ''}`}
                      />
{newPericiaDesc?.length >= 300 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (300)
      </div>
    )}
</>
              
                    </div>

                    <div className="flex gap-2 pt-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowCreatePericiaForm(false)}
                        className="flex-1 py-2 border border-outline-variant text-[10px] font-sans font-bold uppercase tracking-wider text-outline hover:text-on-surface transition-colors cursor-pointer rounded-none bg-transparent min-h-[44px]"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateCustomSkill}
                        className="flex-1 py-2 bg-primary hover:bg-surface-container/90 text-on-primary font-sans text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none border border-transparent min-h-[44px]"
                      >
                        Criar e Adicionar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Search & List View */
                  <div className="flex flex-col space-y-3 min-h-0 flex-grow h-full">
                    {/* Filtros (search + tags) - Mobile ONLY collapsible filters */}
                    <div className="block md:hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="w-full flex items-center justify-between px-3 py-1.5 bg-surface-container border border-outline-variant/30 text-[10px] font-sans font-bold uppercase tracking-wider text-primary hover:text-on-surface transition-all min-h-[32px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[13px]">filter_list</span>
                          <span>Busca & Filtros</span>
                          {catalogFilter !== 'all' && (
                            <span className="bg-primary text-on-primary text-[8px] px-1.5 py-0.2 rounded-full font-sans font-black uppercase">
                              {catalogFilter}
                            </span>
                          )}
                          {periciaSearchQuery.trim() && (
                            <span className="bg-white/10 text-on-surface text-[8px] px-1.5 py-0.2 rounded-full font-sans">
                              Ativa
                            </span>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-xs transition-transform duration-200" style={{ transform: showMobileFilters ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          expand_more
                        </span>
                      </button>

                      {showMobileFilters && (
                        <div className="p-2 border-x border-b border-outline-variant/20 bg-surface-container/70 space-y-2 mt-0.5 animate-fadeIn">
                          {/* Mobile Search input */}
                          <div className="relative">
                            <>
<input maxLength={50}
                              type="text"
                              value={periciaSearchQuery}
                              onChange={(e) => setPericiaSearchQuery(e.target.value)}
                              placeholder="Filtrar por nome de perícia..."
                              className={`w-full bg-surface-container border border-outline-variant text-[11px] text-on-surface px-2.5 py-1.5 placeholder:text-outline-variant/30 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none pl-8 min-h-[32px] ${periciaSearchQuery?.length >= 50 ? '!text-red-500' : ''}`}
                            />
{periciaSearchQuery?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline-variant/50 text-[13px]">
                              search
                            </span>
                          </div>

                          {/* Mobile Filter Tags */}
                          <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto custom-scrollbar">
                            {[
                              { id: 'all', label: 'Todos' },
                              { id: 'combate', label: 'Combate' },
                              { id: 'conhecimento', label: 'Conhecimento' },
                              { id: 'magia', label: 'Magia' },
                              { id: 'ladinagem', label: 'Ladinagem' },
                              { id: 'ofício', label: 'Ofício' },
                              { id: 'sobrevivência', label: 'Sobrevivência' },
                            ].map((pill) => (
                              <button
                                key={pill.id}
                                type="button"
                                onClick={() => {
                                  setCatalogFilter(pill.id);
                                }}
                                className={`px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded-full transition-all border min-h-[24px] whitespace-nowrap cursor-pointer flex items-center justify-center ${
                                  catalogFilter === pill.id
                                    ? 'bg-primary border-transparent text-on-primary font-black'
                                    : 'bg-transparent border-outline-variant/30 text-outline hover:border-outline-variant/80 hover:text-on-surface'
                                }`}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Search Input (Desktop ONLY) */}
                    <div className="hidden md:block relative shrink-0">
                      <>
<input maxLength={50}
                        type="text"
                        value={periciaSearchQuery}
                        onChange={(e) => setPericiaSearchQuery(e.target.value)}
                        placeholder="Filtrar por nome de perícia..."
                        className={`w-full bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 placeholder:text-outline-variant/30 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none pl-9 min-h-[44px] ${periciaSearchQuery?.length >= 50 ? '!text-red-500' : ''}`}
                      />
{periciaSearchQuery?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline-variant/50 text-base">
                        search
                      </span>
                    </div>

                    {/* Action: Toggle Create Custom Skill */}
                    <button
                      type="button"
                      onClick={() => setShowCreatePericiaForm(true)}
                      className="w-full py-1.5 max-md:py-1 border border-dashed border-primary/30 hover:border-primary/60 bg-surface-container/5 hover:bg-surface-container/10 text-[10px] font-sans text-primary uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 rounded-none cursor-pointer shrink-0 min-h-[32px] md:min-h-[44px]"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                      Criar perícia personalizada
                    </button>

                    {/* Filtros Rápidos (Desktop ONLY) */}
                    <div className="hidden md:flex flex-wrap gap-1.5 pb-2 shrink-0 border-b border-outline-variant/15">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'combate', label: 'Combate' },
                        { id: 'conhecimento', label: 'Conhecimento' },
                        { id: 'magia', label: 'Magia' },
                        { id: 'ladinagem', label: 'Ladinagem' },
                        { id: 'ofício', label: 'Ofício' },
                        { id: 'sobrevivência', label: 'Sobrevivência' },
                      ].map((pill) => (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setCatalogFilter(pill.id)}
                          className={`px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full transition-all border min-h-[32px] whitespace-nowrap cursor-pointer flex items-center justify-center ${
                            catalogFilter === pill.id
                              ? 'bg-primary border-transparent text-on-primary font-black'
                              : 'bg-transparent border-outline-variant/40 text-outline hover:border-outline-variant/80 hover:text-on-surface'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {/* Main Scrollable Content Area */}
                    <div className="flex-grow overflow-y-auto min-h-[250px] max-md:max-h-none max-md:flex-grow max-md:min-h-0 md:max-h-[50vh] pr-1 space-y-2 custom-scrollbar">
                      {(() => {
                        const filtered = mockPericias.filter((item) => {
                          if (periciaSearchQuery.trim() && !item.nome.toLowerCase().includes(periciaSearchQuery.toLowerCase())) {
                            return false;
                          }
                          if (catalogFilter === 'all') return true;
                          return item.tag?.toLowerCase().trim() === catalogFilter.toLowerCase().trim();
                        });

                        const bibliotecaLevel = getBibliotecaLevel(editedChar.aprimoramentosPositivos);
                        const maxSubgroups = getBibliotecaSubgroupLimit(bibliotecaLevel);
                        const currentSpecialCount = tempSkills.filter(s => isLibrarySkillName(s.group)).length;

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-10 text-xs text-outline-variant/40 italic">
                              Nenhuma perícia encontrada para os filtros aplicados.
                            </div>
                          );
                        }

                        return filtered.map((item) => {
                          const isAlreadyChosen = (() => {
                            if (isLibrarySkillName(item.nome) && bibliotecaLevel !== null) {
                              if (currentSpecialCount >= maxSubgroups) return true;
                              const subList = item.subgrupos ?? [];
                              const addedSubgroupsForThisSkill = tempSkills
                                .filter(s => s.group.toLowerCase().trim() === item.nome.toLowerCase().trim())
                                .map(s => s.chosenSubgroup);
                              const allAdded = subList.every(sub => addedSubgroupsForThisSkill.includes(sub.nome || sub));
                              if (allAdded) return true;
                              return false;
                            }
                            return tempSkills.some(
                              (chosen) => chosen.group.toLowerCase().trim() === item.nome.toLowerCase().trim()
                            );
                          })();
                          const isExpanded = expandedCatalogSkill === item.nome;

                          return (
                            <div
                              key={item.nome}
                              className={`border transition-all flex flex-col rounded-none ${
                                isAlreadyChosen
                                  ? 'border-outline-variant/10 bg-surface-container opacity-40'
                                  : 'border-outline-variant/20 bg-surface-container-high hover:border-primary/30'
                              }`}
                            >
                              {/* Card Closed Header */}
                              <div
                                onClick={() => {
                                  if (isAlreadyChosen) return;
                                  setExpandedCatalogSkill(isExpanded ? null : item.nome);
                                }}
                                className={`flex items-center justify-between p-2.5 md:p-3 select-none min-h-[38px] md:min-h-[44px] ${
                                  !isAlreadyChosen ? 'cursor-pointer hover:bg-primary/5' : 'cursor-not-allowed'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${isAlreadyChosen ? 'text-outline-variant' : 'text-on-surface'}`}>
                                      {item.nome}
                                    </span>
                                    {isAlreadyChosen && (
                                      <span className="text-[7px] bg-outline-variant/20 text-outline px-1.5 py-0.5 rounded-sm font-sans font-bold uppercase tracking-wider">
                                        Adicionada
                                      </span>
                                    )}
                                  </div>
                                  {item.atributo_base !== '0' && (
                                    <span className="text-[8px] font-mono text-outline-variant uppercase tracking-wider block">
                                      {item.atributo_base}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {!isAlreadyChosen && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddSelectedSkill(item.nome, item.atributo_base);
                                      }}
                                      className="bg-primary hover:bg-surface-container/90 text-on-primary px-2.5 md:px-3 py-1 md:py-1.5 text-[8px] md:text-[9px] font-bold uppercase tracking-wider transition-colors rounded-none border border-transparent flex items-center gap-1 min-h-[32px] md:min-h-[44px] min-w-[70px] md:min-w-[80px] justify-center cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[10px] md:text-[11px] font-bold">add</span>
                                      Adicionar
                                    </button>
                                  )}
                                  {!isAlreadyChosen && (
                                    <span className="material-symbols-outlined text-outline-variant/60 text-sm transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                      expand_more
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Card Content (Description) */}
                              {isExpanded && !isAlreadyChosen && item.descricao && (
                                <div className="px-3 pb-3 border-t border-outline-variant/10 pt-2 bg-surface-container/60 animate-fadeIn">
                                  <p className="text-[10px] text-outline-variant/80 leading-relaxed font-sans">
                                    {item.descricao}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2: Points Distribution */}
              <div className={`md:col-span-7 flex flex-col space-y-4 min-h-0 md:border-l border-outline-variant/30 md:pl-6 ${activeMobileTab === 'minhas' ? 'flex' : 'hidden md:flex'}`}>
                <h4 className="hidden md:flex text-[10px] font-sans font-bold text-outline-variant uppercase tracking-widest border-b border-outline-variant/30 pb-1 items-center gap-1.5 shrink-0">
                  <span className="material-symbols-outlined text-xs">edit_note</span>
                  2. Distribuir Pontos
                </h4>

                {/* Compact & Simple Score Banner */}
                {(() => {
                  const tempTotalSpent = tempSkills.reduce((sum, s) => {
                    const freePoints = Number(s.pontosGratis) || 0;
                    const spent = Math.max(0, (Number(s.gasto) || 0) - freePoints);
                    return sum + spent;
                  }, 0);
                  const tempRemaining = calculatedPointsMax - tempTotalSpent;

                  const bibliotecaLevel = getBibliotecaLevel(editedChar.aprimoramentosPositivos);
                  const maxSubgroups = getBibliotecaSubgroupLimit(bibliotecaLevel);
                  const currentSpecialCount = tempSkills.filter(s => isLibrarySkillName(s.group)).length;

                  return (
                    <div className="bg-surface-container border border-outline-variant/40 p-2.5 flex justify-between items-center gap-2 text-xs shrink-0 rounded-none">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-wider text-outline-variant font-bold block">Pontos de perícia</span>
                          <span className={`text-sm font-mono font-black ${tempRemaining < 0 ? 'text-red-500 animate-pulse' : tempRemaining === 0 ? 'text-primary' : 'text-green-400'}`}>
                            {tempRemaining}  /  {calculatedPointsMax}
                          </span>
                        </div>
                        {bibliotecaLevel !== null && (
                          <div className="flex flex-col border-l border-outline-variant/30 pl-4">
                            <span className="text-[8px] uppercase tracking-wider text-cyan-400 font-bold block">Subgrupos Biblioteca</span>
                            <span className={`text-sm font-mono font-black ${currentSpecialCount > maxSubgroups ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                              {currentSpecialCount}  /  {maxSubgroups}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-[8px] text-outline-variant/40 font-mono">
                        <span>Fórmula: (Idade × 10) + (INT × 5)</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Selected Skills Collapsible Cards Container */}
                <div className="flex-grow overflow-y-auto border border-outline-variant/30 bg-surface-container/40 custom-scrollbar min-h-[250px] max-md:max-h-none max-md:flex-grow max-md:min-h-0 md:max-h-[50vh] p-2 space-y-2">
                  {tempSkills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-outline-variant/50 text-xs italic font-sans gap-2 py-12">
                      <span className="material-symbols-outlined text-3xl text-outline-variant/20 animate-pulse">list_alt</span>
                      <span>Selecione perícias na lista de catálogo para distribuir pontos aqui.</span>
                    </div>
                  ) : (
                    tempSkills.map((skill, idx) => {
                      const { resolvedAttrKey, attrVal } = resolveSkillAttribute(
                        skill.group,
                        skill.baseAttr,
                        skill.chosenSubgroup,
                        skill.subgrupos,
                        editedChar.attributes
                      );
                      const isZeroAttr = resolvedAttrKey === null;
                      const isCombat = !!skill.requer_ataque_defesa;

                      // Calculated totals
                      const obraPrimaBonus = calculateObraPrimaBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items);
                      const magicWeaponBonus = calculateMagicWeaponBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items);
                      const magicWeaponAtkDefBonus = Math.floor(magicWeaponBonus / 2);
                      const armaPreferencialBonus = calculateArmaPreferencialBonusForSkill(skill.group, skill.chosenSubgroup, editedChar.items, Number(editedChar.level) || 1);
                      const armaPreferencialAtkDefBonus = Math.floor(armaPreferencialBonus / 2);
                      const corpoMaleavelBonus = calculateCorpoMaleavelBonus(skill.group, skill.chosenSubgroup, editedChar.aprimoramentosPositivos);
                      const familiarBonus = calculateFamiliarSkillBonus(skill.group, skill.chosenSubgroup, resolvedAttrKey, editedChar.aprimoramentosPositivos, editedChar.familiar);
                      const tempRacialBonus = getRacialFreePointsForSkill(skill.group, skill.chosenSubgroup, editedChar.race, racasData);
                      const totalVal = attrVal + (Number(skill.gasto) || 0) + obraPrimaBonus + magicWeaponBonus + armaPreferencialBonus + corpoMaleavelBonus + familiarBonus;
                      const totalAtk = attrVal + (Number(skill.atkGasto) || 0) + obraPrimaBonus + magicWeaponAtkDefBonus + armaPreferencialAtkDefBonus + corpoMaleavelBonus + familiarBonus;
                      const totalDef = attrVal + (Number(skill.defGasto) || 0) + obraPrimaBonus + magicWeaponAtkDefBonus + armaPreferencialAtkDefBonus + corpoMaleavelBonus + familiarBonus;

                      const tempTotalSpent = tempSkills.reduce((sum, s) => {
                        const freePoints = Number(s.pontosGratis) || 0;
                        const spent = Math.max(0, (Number(s.gasto) || 0) - freePoints);
                        return sum + spent;
                      }, 0);
                      const tempRemaining = calculatedPointsMax - tempTotalSpent;

                      const isMySkillExpanded = expandedMySkill === skill.group + (skill.chosenSubgroup || '');

                      return (
                        <div
                          key={idx}
                          className="border border-outline-variant/20 bg-surface-container-high hover:border-primary/20 transition-all flex flex-col rounded-none"
                        >
                          {/* Closed Card Header */}
                          <div
                            onClick={() => {
                              setExpandedMySkill(isMySkillExpanded ? null : skill.group + (skill.chosenSubgroup || ''));
                            }}
                            className="flex items-center justify-between p-2.5 md:p-3 cursor-pointer select-none min-h-[38px] md:min-h-[44px] hover:bg-white/5"
                          >
                            <div className="flex flex-col max-w-[50%]">
                              {skill.subgrupos && skill.subgrupos.length > 0 ? (
                                // Subgroup Selector inside closed card
                                <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                                  <span className="font-bold text-on-surface text-xs whitespace-normal break-words">
                                    {skill.group}
                                  </span>
                                  <span className="text-outline-variant/50 text-xs">→</span>
                                  <CustomSelect
                                    value={skill.chosenSubgroup || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempSkills(prev => {
                                        const list = [...prev];
                                        const { resolvedAttrKey: nextAttrKey, attrVal: nextAttrVal } = resolveSkillAttribute(
                                          list[idx].group,
                                          list[idx].baseAttr,
                                          val,
                                          list[idx].subgrupos,
                                          editedChar.attributes
                                        );
                                        const nextRacialFree = getRacialFreePointsForSkill(list[idx].group, val, editedChar.race, racasData);
                                        const nextGasto = Math.max(nextRacialFree, Number(list[idx].gasto) || 0);
                                        const nextAtk = list[idx].requer_ataque_defesa ? Math.max(Math.round(nextRacialFree / 2), list[idx].atkGasto ?? 0) : 0;
                                        const nextDef = list[idx].requer_ataque_defesa ? Math.max(nextRacialFree - Math.round(nextRacialFree / 2), list[idx].defGasto ?? 0) : 0;

                                        list[idx] = { 
                                          ...list[idx], 
                                          chosenSubgroup: val,
                                          atributo: nextAttrVal,
                                          pontosGratis: nextRacialFree,
                                          gasto: nextGasto,
                                          pointsToInsert: nextGasto,
                                          atkGasto: nextAtk,
                                          defGasto: nextDef,
                                          total: list[idx].requer_ataque_defesa
                                            ? `${nextAtk + nextAttrVal}% / ${nextDef + nextAttrVal}%`
                                            : `${nextAttrVal + nextGasto}%`
                                        };
                                        return list;
                                      });
                                    }}
                                    variant="minimal"
                                    size="sm"
                                    options={skill.subgrupos
                                      .filter(sub => {
                                        return !(isLibrarySkillName(skill.group) && tempSkills.some((s, sIdx) =>
                                          sIdx !== idx &&
                                          s.group.toLowerCase().trim() === skill.group.toLowerCase().trim() &&
                                          s.chosenSubgroup === sub.nome
                                        ));
                                      })
                                      .map(sub => ({ value: sub.nome, label: sub.nome }))
                                    }
                                  />
                                </div>
                              ) : (
                                <span className="font-bold text-on-surface text-xs whitespace-normal break-words">
                                  {skill.group}
                                </span>
                              )}
                              
                              {resolvedAttrKey ? (
                                <span className="text-[8px] font-mono text-outline-variant uppercase tracking-wider block mt-0.5">
                                  {resolvedAttrKey}
                                  {familiarBonus > 0 && ` (+${familiarBonus}% Familiar)`}
                                  {corpoMaleavelBonus > 0 && ` (+10% Corpo Maleável)`}
                                  {obraPrimaBonus > 0 && ` (+10% Obra-prima)`}
                                  {magicWeaponBonus > 0 && ` (+${magicWeaponBonus}% Mágico)`}
                                  {armaPreferencialBonus > 0 && ` (+${armaPreferencialBonus}% Arma Preferencial)`}
                                  {tempRacialBonus > 0 && ` (+${tempRacialBonus}% Raça)`}
                                </span>
                              ) : (
                                <span className="text-[8px] font-mono text-red-400 uppercase tracking-wider block mt-0.5">
                                  TÉCNICA
                                  {familiarBonus > 0 && ` (+${familiarBonus}% Familiar)`}
                                  {corpoMaleavelBonus > 0 && ` (+10% Corpo Maleável)`}
                                  {obraPrimaBonus > 0 && ` (+10% Obra-prima)`}
                                  {magicWeaponBonus > 0 && ` (+${magicWeaponBonus}% Mágico)`}
                                  {armaPreferencialBonus > 0 && ` (+${armaPreferencialBonus}% Arma Preferencial)`}
                                  {tempRacialBonus > 0 && ` (+${tempRacialBonus}% Raça)`}
                                </span>
                              )}
                            </div>

                            {/* Total value display and delete button */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                {isCombat ? (
                                  <span className="text-xs font-mono font-black text-primary">
                                    {totalAtk}% ATK / {totalDef}% DEF
                                  </span>
                                ) : (
                                  <span className="text-sm font-mono font-black text-primary">
                                    {totalVal}%
                                  </span>
                                )}
                              </div>

                              {/* Remove/Delete Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTempSkill(idx);
                                }}
                                className="text-outline-variant hover:text-red-400 p-1.5 transition-all cursor-pointer inline-flex items-center justify-center min-h-[34px] md:min-h-[44px] min-w-[34px] md:min-w-[44px] rounded-none"
                                title="Remover Perícia"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>

                              <span className="material-symbols-outlined text-outline-variant/60 text-sm transition-transform duration-200" style={{ transform: isMySkillExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                expand_more
                              </span>
                            </div>
                          </div>

                          {/* Expanded Card Body */}
                          {isMySkillExpanded && (
                            <div className="p-3 bg-surface-container/80 border-t border-outline-variant/15 space-y-4 animate-fadeIn">
                              {isCombat ? (
                                // Combat skill view
                                <div className="space-y-4">
                                  {/* Mode Selector and points inputs */}
                                  <div className="flex flex-col gap-3">
                                    {/* Points distribution */}
                                    {!skill.isCustomBuild ? (
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-[9px] font-sans font-bold text-outline-variant uppercase tracking-wider">Pontos Totais para Distribuir:</span>
                                        <div className="flex items-center">
                                          <button
                                            type="button"
                                            disabled={Number(skill.pointsToInsert) <= 0}
                                            onClick={() => {
                                              const currentVal = Number(skill.pointsToInsert) || 0;
                                              if (currentVal > 0) {
                                                handleTempSkillGastoChange(idx, currentVal - 1);
                                              }
                                            }}
                                            className="w-11 h-11 bg-surface-container hover:bg-white/10 active:bg-white/20 border border-outline-variant/60 flex items-center justify-center text-on-surface disabled:opacity-30 disabled:pointer-events-none text-lg font-bold min-w-[44px] min-h-[44px] transition-colors rounded-l-md cursor-pointer"
                                          >
                                            -
                                          </button>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            value={skill.pointsToInsert ?? ''}
                                            onChange={(e) => {
                                              handleTempSkillGastoChange(idx, e.target.value);
                                            }}
                                            className="w-20 h-11 bg-surface-container text-center border-y border-outline-variant/60 text-sm text-on-surface font-mono focus:border-primary focus:ring-0 outline-none rounded-none"
                                            placeholder="0"
                                          />
              
                                          <button
                                            type="button"
                                            disabled={tempRemaining <= 0}
                                            onClick={() => {
                                              if (tempRemaining > 0) {
                                                const currentVal = Number(skill.pointsToInsert) || 0;
                                                handleTempSkillGastoChange(idx, currentVal + 1);
                                              }
                                            }}
                                            className="w-11 h-11 bg-surface-container hover:bg-white/10 active:bg-white/20 border border-outline-variant/60 flex items-center justify-center text-on-surface disabled:opacity-30 disabled:pointer-events-none text-lg font-bold min-w-[44px] min-h-[44px] transition-colors rounded-r-md cursor-pointer"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-4">
                                        {/* ATK spent input */}
                                        <div className="flex flex-col gap-1 flex-1">
                                          <span className="text-[9px] font-sans font-bold text-outline-variant uppercase tracking-wider text-center">ATAQUE (Pontos)</span>
                                          <div className="flex items-center justify-center">
                                            <button
                                              type="button"
                                              disabled={Number(skill.atkGasto) <= 0}
                                              onClick={() => {
                                                const val = Math.max(0, (Number(skill.atkGasto) || 0) - 1);
                                                const currentDef = Number(skill.defGasto) || 0;
                                                setTempSkills(prev => {
                                                  const list = [...prev];
                                                  list[idx] = {
                                                    ...list[idx],
                                                    atkGasto: val,
                                                    gasto: val + currentDef,
                                                    total: `${val + attrVal}% / ${currentDef + attrVal}%`
                                                  };
                                                  return list;
                                                });
                                              }}
                                              className="w-10 h-10 bg-surface-container hover:bg-white/10 active:bg-white/20 border border-outline-variant/60 flex items-center justify-center text-on-surface disabled:opacity-30 disabled:pointer-events-none text-sm font-bold min-w-[40px] min-h-[40px]"
                                            >
                                              -
                                            </button>
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              value={skill.atkGasto ?? 0}
                                              onChange={(e) => {
                                                const val = Math.max(0, Math.round(Number(e.target.value.replace(/[^0-9]/g, ''))) || 0);
                                                setTempSkills(prev => {
                                                  const list = [...prev];
                                                  const currentDef = Number(list[idx].defGasto) || 0;
                                                  list[idx] = {
                                                    ...list[idx],
                                                    atkGasto: val,
                                                    gasto: val + currentDef,
                                                    total: `${val + attrVal}% / ${currentDef + attrVal}%`
                                                  };
                                                  return list;
                                                });
                                              }}
                                              className="w-12 h-10 bg-surface-container text-center border-y border-outline-variant/60 text-xs text-on-surface font-mono focus:border-primary focus:ring-0 outline-none rounded-none"
                                            />
              
                                            <button
                                              type="button"
                                              disabled={tempRemaining <= 0}
                                              onClick={() => {
                                                if (tempRemaining > 0) {
                                                  const val = (Number(skill.atkGasto) || 0) + 1;
                                                  const currentDef = Number(skill.defGasto) || 0;
                                                  setTempSkills(prev => {
                                                    const list = [...prev];
                                                    list[idx] = {
                                                      ...list[idx],
                                                      atkGasto: val,
                                                      gasto: val + currentDef,
                                                      total: `${val + attrVal}% / ${currentDef + attrVal}%`
                                                    };
                                                    return list;
                                                  });
                                                }
                                              }}
                                              className="w-10 h-10 bg-surface-container hover:bg-white/10 active:bg-white/20 border border-outline-variant/60 flex items-center justify-center text-on-surface disabled:opacity-30 disabled:pointer-events-none text-sm font-bold min-w-[40px] min-h-[40px]"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>

                                        {/* DEF spent input */}
                                        <div className="flex flex-col gap-1 flex-1">
                                          <span className="text-[9px] font-sans font-bold text-outline-variant uppercase tracking-wider text-center">DEFESA (Pontos)</span>
                                          <div className="flex items-center justify-center">
                                            <button
                                              type="button"
                                              disabled={Number(skill.defGasto) <= 0}
                                              onClick={() => {
                                                const val = Math.max(0, (Number(skill.defGasto) || 0) - 1);
                                                const currentAtk = Number(skill.atkGasto) || 0;
                                                setTempSkills(prev => {
                                                  const list = [...prev];
                                                  list[idx] = {
                                                    ...list[idx],
                                                    defGasto: val,
                                                    gasto: currentAtk + val,
                                                    total: `${currentAtk + attrVal}% / ${val + attrVal}%`
                                                  };
                                                  return list;
                                                });
                                              }}
                                              className="w-10 h-10 bg-surface-container hover:bg-white/10 active:bg-white/20 border border-outline-variant/60 flex items-center justify-center text-on-surface disabled:opacity-30 disabled:pointer-events-none text-sm font-bold min-w-[40px] min-h-[40px]"
                                            >
                                              -
                                            </button>
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              value={skill.defGasto ?? 0}
                                              onChange={(e) => {
                                                const val = Math.max(0, Math.round(Number(e.target.value.replace(/[^0-9]/g, ''))) || 0);
                                                setTempSkills(prev => {
                                                  const list = [...prev];
                                                  const currentAtk = Number(list[idx].atkGasto) || 0;
                                                  list[idx] = {
                                                    ...list[idx],
                                                    defGasto: val,
                                                    gasto: currentAtk + val,
                                                    total: `${currentAtk + attrVal}% / ${val + attrVal}%`
                                                  };
                                                  return list;
                                                });
                                              }}
                                              className="w-12 h-10 bg-surface-container text-center border-y border-outline-variant/60 text-xs text-on-surface font-mono focus:border-primary focus:ring-0 outline-none rounded-none"
                                            />
              
                                            <button
                                              type="button"
                                              disabled={tempRemaining <= 0}
                                              onClick={() => {
                                                if (tempRemaining > 0) {
                                                  const val = (Number(skill.defGasto) || 0) + 1;
                                                  const currentAtk = Number(skill.atkGasto) || 0;
                                                  setTempSkills(prev => {
                                                    const list = [...prev];
                                                    list[idx] = {
                                                      ...list[idx],
                                                      defGasto: val,
                                                      gasto: currentAtk + val,
                                                      total: `${currentAtk + attrVal}% / ${val + attrVal}%`
                                                    };
                                                    return list;
                                                  });
                                                }
                                              }}
                                              className="w-10 h-10 bg-surface-container hover:bg-white/10 active:bg-white/20 border border-outline-variant/60 flex items-center justify-center text-on-surface disabled:opacity-30 disabled:pointer-events-none text-sm font-bold min-w-[40px] min-h-[40px]"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Slider Control (Simple mode only) */}
                                  {!skill.isCustomBuild && (
                                    <div className="space-y-1.5 bg-surface-container p-2.5 border border-outline-variant/10">
                                      <div className="flex justify-between items-center text-[10px] font-mono text-outline-variant">
                                        <span>ATK: {skill.sliderVal ?? 50}%</span>
                                        <span>DEF: {100 - (skill.sliderVal ?? 50)}%</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={skill.sliderVal ?? 50}
                                        onChange={(e) => {
                                          const sVal = parseInt(e.target.value, 10);
                                          setTempSkills(prev => {
                                            const list = [...prev];
                                            const item = list[idx];
                                            const totalPts = Number(item.pointsToInsert) || 0;
                                            const atk = Math.round(totalPts * (sVal / 100));
                                            const def = totalPts - atk;
                                            list[idx] = {
                                              ...item,
                                              sliderVal: sVal,
                                              atkGasto: atk,
                                              defGasto: def,
                                              total: `${atk + attrVal}% / ${def + attrVal}%`
                                            };
                                            return list;
                                          });
                                        }}
                                        className="w-full accent-[#ffb4ac] h-1.5 bg-surface-container rounded-lg cursor-pointer"
                                      />
                                    </div>
                                  )}

                                  {/* Checkbox "Custom build" and summary */}
                                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/10">
                                    <label className="flex items-center gap-2 text-xs text-outline-variant cursor-pointer min-h-[44px]">
                                      <input
                                        type="checkbox"
                                        checked={!!skill.isCustomBuild}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setTempSkills(prev => {
                                            const list = [...prev];
                                            const item = list[idx];
                                            const nextItem = { ...item, isCustomBuild: checked };
                                            if (checked) {
                                              nextItem.gasto = (Number(nextItem.atkGasto) || 0) + (Number(nextItem.defGasto) || 0);
                                            } else {
                                              const pts = Number(nextItem.pointsToInsert) || 0;
                                              nextItem.gasto = pts;
                                              const sVal = nextItem.sliderVal ?? 50;
                                              nextItem.atkGasto = Math.round(pts * (sVal / 100));
                                              nextItem.defGasto = pts - nextItem.atkGasto;
                                            }
                                            nextItem.total = `${(nextItem.atkGasto ?? 0) + attrVal}% / ${(nextItem.defGasto ?? 0) + attrVal}%`;
                                            list[idx] = nextItem;
                                            return list;
                                          });
                                        }}
                                        className="accent-[#ffb4ac] h-5 w-5 cursor-pointer"
                                      />
                                      Custom build (distribuição manual)
                                    </label>

                                    {resolvedAttrKey ? (
                                      <div className="text-[10px] text-outline-variant/75 font-sans leading-relaxed bg-surface-container/40 p-2 border border-outline-variant/10">
                                        Cálculo: Atributo {resolvedAttrKey} ({attrVal}) + Gasto (ATK: {skill.atkGasto ?? 0} / DEF: {skill.defGasto ?? 0}){obraPrimaBonus > 0 ? " + Obra-prima (+10%)" : ""}{magicWeaponAtkDefBonus > 0 ? ` + Mágico (+${magicWeaponAtkDefBonus}%)` : ""}{armaPreferencialBonus > 0 ? ` + Arma Preferencial (+${Math.floor(armaPreferencialBonus / 2)}%)` : ""}{corpoMaleavelBonus > 0 ? " + Corpo Maleável (+10%)" : ""}{tempRacialBonus > 0 ? ` + Raça (+${tempRacialBonus}%)` : ""} = <span className="text-primary font-bold">{totalAtk}% ATK / {totalDef}% DEF</span>
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-outline-variant/75 font-sans leading-relaxed bg-surface-container/40 p-2 border border-outline-variant/10">
                                        Cálculo: Perícia Técnica (0) + Gasto (ATK: {skill.atkGasto ?? 0} / DEF: {skill.defGasto ?? 0}){obraPrimaBonus > 0 ? " + Obra-prima (+10%)" : ""}{magicWeaponAtkDefBonus > 0 ? ` + Mágico (+${magicWeaponAtkDefBonus}%)` : ""}{armaPreferencialBonus > 0 ? ` + Arma Preferencial (+${Math.floor(armaPreferencialBonus / 2)}%)` : ""}{corpoMaleavelBonus > 0 ? " + Corpo Maleável (+10%)" : ""}{tempRacialBonus > 0 ? ` + Raça (+${tempRacialBonus}%)` : ""} = <span className="text-primary font-bold">{totalAtk}% ATK / {totalDef}% DEF</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                // Common skill view
                                <div className="space-y-3">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-sans font-bold text-outline-variant uppercase tracking-wider">Distribuir Pontos:</span>
                                    <div className="flex items-center justify-start">
                                      <button
                                        type="button"
                                        disabled={Number(skill.gasto) <= 0}
                                        onClick={() => {
                                          const currentVal = Number(skill.gasto) || 0;
                                          if (currentVal > 0) {
                                            handleTempSkillGastoChange(idx, currentVal - 1);
                                          }
                                        }}
                                        className="w-11 h-11 bg-surface-container hover:bg-white/10 active:bg-white/20 border border-outline-variant/60 flex items-center justify-center text-on-surface disabled:opacity-30 disabled:pointer-events-none text-lg font-bold min-w-[44px] min-h-[44px] transition-colors rounded-l-md cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <>
<input maxLength={50}
                                        type="text"
                                        inputMode="numeric"
                                        value={skill.gasto}
                                        onChange={(e) => handleTempSkillGastoChange(idx, e.target.value)}
                                        className={`w-20 h-11 bg-surface-container text-center border-y border-outline-variant/60 text-sm text-on-surface font-mono focus:border-primary focus:ring-0 outline-none rounded-none ${String(skill.gasto ?? '').length >= 50 ? '!text-red-500' : ''}`}
                                        placeholder="0"
                                      />
{String(skill.gasto ?? '').length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                                      <button
                                        type="button"
                                        disabled={tempRemaining <= 0}
                                        onClick={() => {
                                          if (tempRemaining > 0) {
                                            const currentVal = Number(skill.gasto) || 0;
                                            handleTempSkillGastoChange(idx, currentVal + 1);
                                          }
                                        }}
                                        className="w-11 h-11 bg-surface-container hover:bg-white/10 active:bg-white/20 border border-outline-variant/60 flex items-center justify-center text-on-surface disabled:opacity-30 disabled:pointer-events-none text-lg font-bold min-w-[44px] min-h-[44px] transition-colors rounded-r-md cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {resolvedAttrKey ? (
                                    <div className="text-[10px] text-outline-variant/75 font-sans leading-relaxed pt-2 border-t border-outline-variant/10">
                                      Cálculo: Atributo {resolvedAttrKey} ({attrVal}) + Pontos Gastos ({Number(skill.gasto) || 0}){obraPrimaBonus > 0 ? " + Obra-prima (+10%)" : ""}{magicWeaponBonus > 0 ? ` + Mágico (+${magicWeaponBonus}%)` : ""}{armaPreferencialBonus > 0 ? ` + Arma Preferencial (+${armaPreferencialBonus}%)` : ""}{corpoMaleavelBonus > 0 ? " + Corpo Maleável (+10%)" : ""}{tempRacialBonus > 0 ? ` + Raça (+${tempRacialBonus}%)` : ""} = <span className="text-primary font-bold">{totalVal}%</span>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-outline-variant/75 font-sans leading-relaxed pt-2 border-t border-outline-variant/10">
                                      Cálculo: Perícia Técnica (0) + Pontos Gastos ({Number(skill.gasto) || 0}){obraPrimaBonus > 0 ? " + Obra-prima (+10%)" : ""}{magicWeaponBonus > 0 ? ` + Mágico (+${magicWeaponBonus}%)` : ""}{armaPreferencialBonus > 0 ? ` + Arma Preferencial (+${armaPreferencialBonus}%)` : ""}{corpoMaleavelBonus > 0 ? " + Corpo Maleável (+10%)" : ""}{tempRacialBonus > 0 ? ` + Raça (+${tempRacialBonus}%)` : ""} = <span className="text-primary font-bold">{totalVal}%</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Points Alert/Warning */}
                {(() => {
                  const tempTotalSpent = tempSkills.reduce((sum, s) => {
                    const freePoints = Number(s.pontosGratis) || 0;
                    const spent = Math.max(0, (Number(s.gasto) || 0) - freePoints);
                    return sum + spent;
                  }, 0);
                  const tempRemaining = calculatedPointsMax - tempTotalSpent;
                  if (tempRemaining < 0) {
                    return (
                      <div className="bg-surface-container/20 border border-red-500/30 text-red-400 text-[10px] p-2.5 font-medium flex items-center gap-1.5 rounded-sm animate-pulse shrink-0">
                        <span className="material-symbols-outlined text-xs text-red-400">warning</span>
                        <span>Saldo de pontos excedido! Você gastou {Math.abs(tempRemaining)} pontos extras.</span>
                      </div>
                    );
                  }
                  return null;
                })()}

              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="flex justify-end pt-4 border-t border-outline-variant/40 shrink-0">
              <SaveButton
                onClick={handleSavePericiasModal}
                label="Salvar Distribuição"
                className="w-full md:w-auto min-h-[38px] md:min-h-[44px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {isSaveConfirmOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-md w-full p-6 space-y-6 shadow-2xl relative flex flex-col rounded-none">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="font-serif text-sm text-primary uppercase tracking-wider font-semibold">
                Confirmar Criação de Personagem
              </h3>
              <button
                type="button"
                onClick={() => setIsSaveConfirmOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>
            
            <p className="text-xs text-outline-variant leading-relaxed text-center">
              Essas informações não poderão ser alteradas até que o personagem suba de nível. Deseja salvar?
            </p>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSaveConfirmOpen(false)}
                className="flex-1 py-2.5 border border-outline-variant text-xs font-sans font-bold uppercase tracking-widest text-outline hover:text-on-surface hover:border-white transition-colors cursor-pointer rounded-none bg-transparent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSaveConfirmOpen(false);
                  executeActualSave();
                }}
                className="flex-1 py-2.5 bg-primary text-on-primary font-sans text-xs font-bold uppercase tracking-widest hover:brightness-110 cursor-pointer rounded-none border border-transparent"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDeleteCharacter}
        title="Deletar Personagem"
        description="Você tem certeza que deseja deletar esse personagem? Essa ação não pode ser desfeita."
        itemPreview={
          <span className="font-mono text-sm text-primary-container font-bold">
            {editedChar.name || 'Personagem'}
          </span>
        }
        confirmText="Deletar"
      />

      {/* Level-Up Confirmation Modal */}
      {showLevelUpConfirmModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-sm w-full p-6 space-y-6 shadow-2xl relative rounded-none flex flex-col text-left">
            <div className="text-center space-y-3">
              <span className="material-symbols-outlined text-4xl animate-bounce shimmer-icon inline-block">arrow_circle_up</span>
              <h3 className="font-serif text-lg text-on-surface uppercase tracking-wider">Confirmar Evolução</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Você tem certeza que deseja evoluir este personagem para o <strong>Nível {nextL}</strong>?
              </p>
              <div className="bg-surface-container p-3 border border-outline-variant/30 text-left space-y-2 rounded-none font-sans text-[11px] leading-relaxed text-on-surface-variant/90">
                <p className="font-bold text-secondary uppercase tracking-widest text-[9px] mb-1">Novos Pontos & Bônus:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {(() => {
                    const nextRules = rulesToUse?.[String(nextL)] || DEFAULT_LEVELUP_RULES.niveis_personagem[String(nextL)];
                    if (!nextRules) return <li>Nível não encontrado</li>;
                    return (
                      <>
                        {Number(nextRules.atributos) > 0 && <li>+{nextRules.atributos} Ponto de Atributo</li>}
                        {Number(nextRules.aprimoramentos) > 0 && <li>+{nextRules.aprimoramentos} Ponto de Aprimoramento</li>}
                        {Number(nextRules.pericias_mundanas) > 0 && <li>+{nextRules.pericias_mundanas} Pontos de Perícias Mundanas</li>}
                        {Number(nextRules.pericias_misticas) > 0 && <li>+{nextRules.pericias_misticas} Pontos de Perícias Místicas</li>}
                        {Number(nextRules.pv_bonus) > 0 && <li>+{nextRules.pv_bonus} PV (Vida Máxima)</li>}
                        {Number(nextRules.pontos_magia) > 0 && <li>+{nextRules.pontos_magia} PM (Magia Máxima)</li>}
                        {Number(nextRules.focus) > 0 && <li>+{nextRules.focus} Ponto de Focus (Grimório)</li>}
                      </>
                    );
                  })()}
                </ul>
              </div>
              <p className="font-mono text-sm text-secondary font-bold bg-surface-container-low py-1.5 px-3 border border-outline-variant/30 inline-block">
                {editedChar.name || 'Personagem'}
              </p>
            </div>
            
            <div className="flex gap-3 pt-2 justify-center">
              <button
                type="button"
                onClick={() => setShowLevelUpConfirmModal(false)}
                className="flex-1 py-2.5 border border-outline-variant text-xs font-sans font-bold uppercase tracking-wider text-outline hover:text-on-surface hover:border-white transition-colors cursor-pointer rounded-none bg-transparent"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLevelingUp}
                onClick={handleConfirmLevelUp}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border border-primary/30 rounded-none flex items-center justify-center gap-1.5"
              >
                {isLevelingUp ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    <span>Evoluindo...</span>
                  </>
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Itens Selection Modal */}
      {isItensModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-5xl w-full p-4 md:p-8 shadow-2xl relative flex flex-col rounded-none h-[92vh] max-h-[92vh] md:h-auto md:max-h-[92vh]">
            
            {/* Modal Header - FIRST Element */}
            <div className="flex flex-col gap-3 pb-3 border-b border-outline-variant/50 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">backpack</span>
                  <h3 className="font-serif text-sm text-primary uppercase tracking-wider font-semibold">
                    Itens & Equipamentos
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsItensModalOpen(false);
                    setItemSearchQuery('');
                  }}
                  className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  close
                </button>
              </div>
            </div>

            {/* Search and Action Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 shrink-0">
              {/* Search Field */}
              <div className="md:col-span-8 relative">
                <>
<input maxLength={50}
                  type="text"
                  placeholder="Pesquisar item pelo nome..."
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className={`w-full bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 placeholder:text-outline-variant/30 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none pl-9 min-h-[44px] ${itemSearchQuery?.length >= 50 ? '!text-red-500' : ''}`}
                />
{itemSearchQuery?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline-variant/50 text-base">
                  search
                </span>
              </div>
              
              {/* Custom Item Trigger Button */}
              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMagicActiveInModal(false);
                    setIsCustomItemModalOpen(true);
                  }}
                  className="w-full py-1.5 border border-dashed border-primary/30 hover:border-primary/60 bg-surface-container/5 hover:bg-surface-container/10 text-[10px] font-sans text-primary uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 rounded-none cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  Criar Item Customizado
                </button>
              </div>
            </div>

            {/* Categories Navigation Badges / Pills */}
            {openedFromCard === 'itens' ? (
              <div className="flex gap-1.5 overflow-x-auto py-3 select-none border-b border-outline-variant/20 shrink-0">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'roupa', label: 'Roupas' },
                  { key: 'comida_bebida', label: 'Mercado' },
                  { key: 'alquimia_pocoes', label: 'Alquimia' },
                  { key: 'transporte', label: 'Transporte' },
                  { key: 'objetos_comuns', label: 'Objetos' },
                  { key: 'animais', label: 'Animais' },
                  { key: 'arreios_armaduras_montaria', label: 'Montaria' },
                  { key: 'armas', label: 'Armas' },
                  { key: 'armadura', label: 'Armaduras' }
                ].map((cat) => {
                  const isActive = activeItemCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveItemCategory(cat.key)}
                      className={`px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-wider transition-all border min-h-[32px] cursor-pointer rounded-none flex items-center justify-center whitespace-nowrap ${
                        isActive
                          ? 'bg-primary border-transparent text-on-primary font-black'
                          : 'bg-transparent border-outline-variant/30 text-outline hover:text-on-surface hover:border-outline-variant/80'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-1.5 py-3 border-b border-outline-variant/20 shrink-0 select-none">
                <span className="px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-wider bg-primary border-transparent text-on-primary font-black flex items-center justify-center h-[32px]">
                  {openedFromCard === 'armas' ? 'Filtro Travado: Armas' : 'Filtro Travado: Armaduras & Escudos'}
                </span>
              </div>
            )}

            {/* Catalog Scrollable Body (Expanded to fill space completely) */}
            <div className="flex-grow overflow-y-auto mt-4 pr-1 space-y-2 custom-scrollbar min-h-[250px] md:max-h-[55vh]">
              {(() => {
                const filteredCatalog = itensCatalog.filter(item => {
                  if (item.categoria && item.categoria.toLowerCase().includes("modificador")) {
                    return false;
                  }
                  
                  let matchesCategory = false;
                  if (openedFromCard === 'armas') {
                    matchesCategory = item.categoria === 'armas';
                  } else if (openedFromCard === 'armaduras') {
                    matchesCategory = item.categoria === 'armadura' || item.categoria === 'escudo';
                  } else {
                    matchesCategory = activeItemCategory === 'all' || item.categoria === activeItemCategory;
                  }

                  const matchesSearch = !itemSearchQuery || (item.item || '').toLowerCase().includes(itemSearchQuery.toLowerCase());
                  return matchesCategory && matchesSearch;
                });

                if (filteredCatalog.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-outline-variant/50 text-xs italic font-sans gap-2 py-12">
                      <span className="material-symbols-outlined text-3xl text-outline-variant/20 animate-pulse">search_off</span>
                      <span>Nenhum item encontrado com os filtros selecionados.</span>
                    </div>
                  );
                }

                return filteredCatalog.map((item, idx) => {
                  const isArmor = item.categoria === 'armadura' || item.categoria === 'escudo';
                  const itemName = item.item || '';
                  const isAddedJustNow = !!addedItemsFeedback[itemName];
                  return (
                    <div
                      key={idx}
                      className={`p-3 transition-all duration-300 flex justify-between items-center gap-4 border ${
                        isAddedJustNow
                          ? 'border-green-500/60 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                          : 'bg-surface-container/40 border-outline-variant/30 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="text-left flex-1 min-w-0">
                        {/* Line 1: Nome */}
                        <div className="text-left">
                          <span className="font-bold text-on-surface text-sm font-sans block">
                            {item.item}
                          </span>
                        </div>
                        
                        {/* Line 2: Categoria, Preço, Adicionado feedback */}
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-[9px] bg-surface-container/30 text-secondary border border-outline-variant/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                            {item.categoria}
                          </span>
                          {item.preco && (
                            <span className="text-[10px] font-mono text-secondary flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block shrink-0"></span> {item.preco} Prata
                            </span>
                          )}
                          {isAddedJustNow && (
                            <span className="text-[10px] font-mono text-green-400 font-bold animate-bounce flex items-center gap-1">
                              ✓ +1 Adicionado!
                            </span>
                          )}
                        </div>

                        {item.descricao && (
                          <p className="text-xs text-outline-variant/75 font-sans mt-1 leading-relaxed">
                            {item.descricao}
                          </p>
                        )}

                        {/* If weapon details exist */}
                        {(item.dano !== undefined || item.penalidade !== undefined || item.alcance !== undefined) && (
                          <div className="mt-1.5 text-[10px] font-mono text-outline flex gap-3 flex-wrap">
                            {item.dano !== undefined && item.dano !== null && item.dano !== "" && (
                              <span>Dano: <strong className="text-on-surface">{item.dano}</strong></span>
                            )}
                            {item.penalidade !== undefined && item.penalidade !== null && item.penalidade !== "" && (
                              <span>Iniciativa: <strong className="text-secondary">{item.penalidade}</strong></span>
                            )}
                            {item.alcance !== undefined && item.alcance !== null && item.alcance !== "" && (
                              <span>Alcance: <strong className="text-on-surface">{item.alcance}</strong></span>
                            )}
                          </div>
                        )}

                        {item.dano_penalidade_alcance && !item.dano && !item.penalidade && !item.alcance && (
                          <div className="mt-1 text-[10px] font-mono text-outline">
                            Dano/Pen./Alcance: <strong className="text-on-surface">{item.dano_penalidade_alcance}</strong>
                          </div>
                        )}

                        {/* If armor equipment details exist */}
                        {item.equipamento && (
                          <div className="mt-1.5 space-y-1">
                            {item.equipamento.slot && (
                              <div className="text-[10px] font-sans text-outline">
                                Tipo: <span className="text-on-surface font-medium">{capitalizeFirstLetter(item.equipamento.slot)}</span>
                              </div>
                            )}
                            <div className="text-[10px] font-mono text-outline flex gap-3 flex-wrap">
                              {item.equipamento.ip !== undefined && <span>IP: <strong className="text-on-surface">{item.equipamento.ip}</strong></span>}
                              {item.equipamento.penalidade_dex !== undefined && <span>DEX: <strong className="text-red-400">{item.equipamento.penalidade_dex}</strong></span>}
                              {item.equipamento.penalidade_agi !== undefined && <span>AGI: <strong className="text-red-400">{item.equipamento.penalidade_agi}</strong></span>}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (openedFromCard === 'itens') {
                            handleAddGeneralItem({ ...item, forcarEmItens: true });
                          } else {
                            if (isArmor) {
                              handleAddArmorFromModal(item);
                            } else {
                              handleAddGeneralItem(item);
                            }
                          }
                        }}
                        className={`p-2 font-bold transition-all flex items-center justify-center shrink-0 w-11 h-11 rounded-none cursor-pointer border ${
                          isAddedJustNow
                            ? 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30'
                            : 'bg-amber-500/10 hover:bg-amber-500/30 text-secondary hover:text-on-surface border-amber-500/30'
                        }`}
                        title="Adicionar ao inventário"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {isAddedJustNow ? 'done' : 'add'}
                        </span>
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Submodal: Custom Item Form */}
      {isCustomItemModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-surface-container-high border border-outline-variant max-w-lg w-full p-6 shadow-2xl relative flex flex-col rounded-none gap-4">
            
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-base">construction</span>
                <h3 className="font-serif text-sm uppercase tracking-wider font-semibold">
                  Criar Item Customizado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomItemModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            <div className="space-y-4">
              {/* Field: Nome */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-bold text-outline uppercase tracking-wider">
                  Nome do Item <span className="text-red-400">*</span>
                </label>
                <>
<input maxLength={50}
                  type="text"
                  required
                  placeholder="Ex: Espada de Ferro Antiga, Poção de Cura"
                  value={newCustomItemName}
                  onChange={(e) => setNewCustomItemName(e.target.value)}
                  className={`w-full h-11 bg-surface-container border border-outline-variant/60 px-3 text-xs text-on-surface focus:border-primary focus:ring-0 outline-none rounded-none font-sans ${newCustomItemName?.length >= 50 ? '!text-red-500' : ''}`}
                />
{newCustomItemName?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
              </div>

              {/* Row: Preço & Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: Preço */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-sans font-bold text-outline uppercase tracking-wider">
                    Preço (moedas)
                  </label>
                  <>
<input maxLength={50}
                    type="text"
                    placeholder="Ex: 50, 1.200"
                    value={newCustomItemPrice}
                    onChange={(e) => setNewCustomItemPrice(e.target.value)}
                    className={`w-full h-11 bg-surface-container border border-outline-variant/60 px-3 text-xs text-on-surface focus:border-primary focus:ring-0 outline-none rounded-none font-sans ${newCustomItemPrice?.length >= 50 ? '!text-red-500' : ''}`}
                  />
{newCustomItemPrice?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                </div>

                {/* Field: Categoria */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-sans font-bold text-outline uppercase tracking-wider">
                    Categoria
                  </label>
                  <CustomSelect
                    value={newCustomItemCategory}
                    onChange={(e) => setNewCustomItemCategory(e.target.value)}
                    variant="parchment"
                    options={[
                      { value: "objetos_comuns", label: "Objetos (Geral)" },
                      { value: "armas", label: "Armas" },
                      { value: "armadura", label: "Armaduras & Escudos" },
                      { value: "roupa", label: "Roupas" },
                      { value: "comida_bebida", label: "Mercado" },
                      { value: "alquimia_pocoes", label: "Alquimia" },
                      { value: "transporte", label: "Transporte" },
                      { value: "animais", label: "Animais" },
                      { value: "arreios_armaduras_montaria", label: "Montaria" }
                    ]}
                  />
                </div>
              </div>

              {/* Field: Descrição */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-bold text-outline uppercase tracking-wider">
                  Descrição / Observações
                </label>
                <>
<textarea maxLength={300}
                  placeholder="Descreva as propriedades ou efeitos do item..."
                  value={newCustomItemDesc}
                  onChange={(e) => setNewCustomItemDesc(e.target.value)}
                  className={`w-full h-24 bg-surface-container border border-outline-variant/60 p-3 text-xs text-on-surface focus:border-primary focus:ring-0 outline-none rounded-none font-sans resize-none ${newCustomItemDesc?.length >= 300 ? '!text-red-500' : ''}`}
                />
{newCustomItemDesc?.length >= 300 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (300)
      </div>
    )}
</>
              
              </div>

              {/* Efeitos Ativos (Mágico e Maldito) */}
              {(() => {
                const magicLevel = getArmaAmuletoMagicoLevel(editedChar.aprimoramentosPositivos);
                const malditoLevel = getArmaAmuletoMalditoLevel(editedChar.aprimoramentosNegativos);
                if (magicLevel === null && malditoLevel === null) return null;
                return (
                  <div className="flex flex-col gap-2 p-3 bg-surface-container/40 border border-outline-variant/30 text-left">
                    <span className="text-[10px] font-sans font-bold text-outline uppercase tracking-wider block">
                      Efeitos Ativos Disponíveis
                    </span>
                    {magicLevel !== null && (
                      <button
                        type="button"
                        onClick={() => setIsMagicActiveInModal(!isMagicActiveInModal)}
                        className={`w-full text-left p-1.5 border transition-all cursor-pointer rounded-none flex items-center justify-between group/effect ${
                          isMagicActiveInModal 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 hover:bg-cyan-500/20' 
                            : 'bg-surface-container-high/30 border-outline-variant hover:border-cyan-500/50 text-outline hover:text-on-surface'
                        }`}
                      >
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                          Arma ou Amuleto Mágico - Nível {magicLevel}
                        </span>
                        <span className={`text-[8px] font-bold font-mono px-1 py-0.5 border ${
                          isMagicActiveInModal 
                            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' 
                            : 'text-outline-variant group-hover/effect:text-cyan-400 border-transparent'
                        }`}>
                          {isMagicActiveInModal ? 'Ativo' : '+ Ativar'}
                        </span>
                      </button>
                    )}
                    {malditoLevel !== null && (
                      <button
                        type="button"
                        onClick={() => setIsMalditoActiveInModal(!isMalditoActiveInModal)}
                        className={`w-full text-left p-1.5 border transition-all cursor-pointer rounded-none flex items-center justify-between group/effect ${
                          isMalditoActiveInModal 
                            ? 'bg-red-500/10 border-red-500 text-red-300 hover:bg-red-500/20' 
                            : 'bg-surface-container-high/30 border-outline-variant hover:border-red-500/50 text-outline hover:text-on-surface'
                        }`}
                      >
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                          Arma ou Amuleto Maldito - Nível {malditoLevel}
                        </span>
                        <span className={`text-[8px] font-bold font-mono px-1 py-0.5 border ${
                          isMalditoActiveInModal 
                            ? 'text-red-400 bg-red-500/10 border-red-500/30' 
                            : 'text-outline-variant group-hover/effect:text-red-400 border-transparent'
                        }`}>
                          {isMalditoActiveInModal ? 'Ativo' : '+ Ativar'}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomItemModalOpen(false)}
                className="flex-1 py-2.5 border border-outline-variant text-xs font-sans font-bold uppercase tracking-widest text-outline hover:text-on-surface hover:border-white transition-colors cursor-pointer bg-transparent rounded-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newCustomItemName.trim()) {
                    toast.error('O nome do item é obrigatório.');
                    return;
                  }

                  const magicLevel = getArmaAmuletoMagicoLevel(editedChar.aprimoramentosPositivos);
                  const malditoLevel = getArmaAmuletoMalditoLevel(editedChar.aprimoramentosNegativos);

                  if (isMagicActiveInModal) {
                    setEditedChar(prev => {
                      const clearedItems = (prev.items || []).map(it => {
                        if (typeof it === 'object' && it !== null) {
                          return { ...it, hasArmaAmuletoMagico: false, armaAmuletoMagicoLevel: undefined };
                        }
                        return it;
                      });
                      return { ...prev, items: clearedItems };
                    });
                  }

                  if (isMalditoActiveInModal) {
                    setEditedChar(prev => {
                      const clearedItems = (prev.items || []).map(it => {
                        if (typeof it === 'object' && it !== null) {
                          return { ...it, hasArmaAmuletoMaldito: false, armaAmuletoMalditoLevel: undefined };
                        }
                        return it;
                      });
                      return { ...prev, items: clearedItems, has_pending_magic_enchant: false };
                    });
                    setHasPendingMagicEnchant(false);
                  }

                   const customItem = {
                    item: newCustomItemName,
                    preco: newCustomItemPrice || undefined,
                    descricao: newCustomItemDesc || undefined,
                    categoria: newCustomItemCategory,
                    equipamento: {
                      slot: "Corpo",
                      ip: 0,
                      penalidade_dex: 0,
                      penalidade_agi: 0,
                      obs: newCustomItemDesc || ""
                    },
                    isCustom: true,
                    hasArmaAmuletoMagico: isMagicActiveInModal,
                    armaAmuletoMagicoLevel: isMagicActiveInModal && magicLevel !== null ? magicLevel : undefined,
                    hasArmaAmuletoMaldito: isMalditoActiveInModal,
                    armaAmuletoMalditoLevel: isMalditoActiveInModal && malditoLevel !== null ? malditoLevel : undefined,
                    hasArmaPreferencial: false,
                    forcarEmItens: openedFromCard === 'itens' ? true : undefined
                  };

                  if (openedFromCard === 'itens') {
                    handleAddGeneralItem(customItem);
                  } else {
                    if (newCustomItemCategory === 'armadura') {
                      handleAddArmorFromModal(customItem);
                    } else {
                      handleAddGeneralItem(customItem);
                    }
                  }

                  // Reset
                  setNewCustomItemName('');
                  setNewCustomItemPrice('');
                  setNewCustomItemDesc('');
                  setNewCustomItemCategory('objetos_comuns');
                  setIsMagicActiveInModal(false);
                  setIsMalditoActiveInModal(false);
                  setIsCustomItemModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:brightness-110 text-on-primary font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-none border border-transparent"
              >
                Salvar Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodal: Companion Animal Sheet */}
      <Modal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
        title={tempNomeAnimal.trim() || "Companheiro animal"}
        icon={<PawPrint className="w-5 h-5 text-primary shrink-0" />}
        maxWidth="max-w-3xl"
        footer={
          (!isLocked && userRole === 'player') ? (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleSaveCompanionAnimal}
                className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-[11px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none border-none"
              >
                Salvar Ficha
              </button>
            </div>
          ) : undefined
        }
      >
        <fieldset disabled={isLocked} className="space-y-4 text-left">
              {/* Fields: Nome and Animal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0 bg-surface-container p-3 border border-outline-variant/30">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Nome</label>
                <>
<input maxLength={50}
                  type="text"
                  placeholder="Ex: Rex, Ghost..."
                  value={tempNomeAnimal}
                  onChange={(e) => setTempNomeAnimal(e.target.value)}
                  className={`bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none min-h-[36px] ${tempNomeAnimal?.length >= 50 ? '!text-red-500' : ''}`}
                />
{tempNomeAnimal?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Animal</label>
                <>
<input maxLength={50}
                  type="text"
                  placeholder="Ex: Lobo, Falcão, Pantera..."
                  value={tempTipoAnimal}
                  onChange={(e) => setTempTipoAnimal(e.target.value)}
                  className={`bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none min-h-[36px] ${tempTipoAnimal?.length >= 50 ? '!text-red-500' : ''}`}
                />
{tempTipoAnimal?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
              </div>
            </div>

            {/* Distribution Bar */}
            <div className="bg-surface-container border border-outline-variant/40 p-3 flex flex-col items-center justify-center gap-1 text-center shrink-0">
              {(() => {
                const companionL = Number(editedChar.level) || 1;
                const maxCompanionAttrs = 80 + (companionL - 1) * 5;
                const totalPoints = Object.values(tempCompanionAttributes).reduce((a, b) => a + b, 0);
                const remaining = maxCompanionAttrs - totalPoints;
                return (
                  <>
                    <div className={`text-lg font-mono font-black tracking-wider transition-colors duration-300 ${remaining < 0 ? 'text-red-500 animate-pulse' : remaining === 0 ? 'text-green-400 font-bold' : 'text-secondary'}`}>
                      {remaining}/{maxCompanionAttrs} Total
                    </div>
                    {remaining < 0 ? (
                      <p className="text-[10px] text-red-500 font-bold uppercase animate-pulse">
                        Você ultrapassou o limite de {maxCompanionAttrs} pontos!
                      </p>
                    ) : (
                      <p className="text-[9px] text-outline-variant/60 font-sans">
                        Pontos base: 80 + 5 pontos adicionais por nível além do 1º (Nível do personagem: {companionL})
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Attributes Table */}
            <div className="overflow-x-auto custom-scrollbar shrink-0">
              <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                <thead>
                  <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                    <th className="border border-outline-variant p-2 text-left">Atributo</th>
                    <th className="border border-outline-variant p-2 w-36">Pontos Gastos</th>
                  </tr>
                </thead>
                <tbody className="text-center font-mono">
                  {(['con', 'for', 'des', 'agi', 'int', 'per', 'will', 'car'] as const).map((attrKey) => {
                    const labels: { [key: string]: { full: string; short: string } } = {
                      con: { full: 'CONSTITUIÇÃO (CON)', short: 'CON' },
                      for: { full: 'FORÇA (FOR)', short: 'FOR' },
                      des: { full: 'DESTREZA (DES)', short: 'DES' },
                      agi: { full: 'AGILIDADE (AGI)', short: 'AGI' },
                      int: { full: 'INTELIGÊNCIA (INT)', short: 'INT' },
                      per: { full: 'PERCEPÇÃO (PER)', short: 'PER' },
                      will: { full: 'VONTADE (WILL)', short: 'WILL' },
                      car: { full: 'CARISMA (CAR)', short: 'CAR' },
                    };
                    const value = tempCompanionAttributes[attrKey];
                    
                    const handleValueChange = (newVal: number) => {
                      if (isNaN(newVal)) newVal = 0;
                      newVal = Math.max(0, newVal);
                      if (attrKey === 'int' && newVal > 2) {
                        newVal = 2;
                      }
                      setTempCompanionAttributes(prev => ({
                        ...prev,
                        [attrKey]: newVal
                      }));
                    };

                    return (
                      <tr key={attrKey} className="hover:bg-surface-container-high/40 transition-colors">
                        <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs">
                          <span className="hidden sm:inline">{labels[attrKey].full}</span>
                          <span className="inline sm:hidden">{labels[attrKey].short}</span>
                          {attrKey === 'int' && (
                            <span className="text-[10px] text-amber-500 font-sans block font-normal">
                              Max. 2
                            </span>
                          )}
                        </td>
                        <td className="border border-outline-variant p-1">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleValueChange(value + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400 transition-all font-bold rounded-none cursor-pointer"
                            >
                              +
                            </button>
                            <span className="text-on-surface text-sm font-bold w-6 text-center">{value}</span>
                            <button
                              type="button"
                              onClick={() => handleValueChange(value - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 transition-all font-bold rounded-none cursor-pointer"
                            >
                              -
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Perícias Section */}
            <div className="border-t border-outline-variant/30 pt-4 shrink-0 flex flex-col min-h-0">
              {(() => {
                const companionL = Number(editedChar.level) || 1;
                const maxCompanionSkills = 50 + (companionL - 1) * 20;
                const totalSkillPoints = tempCompanionSkills.reduce((sum, s) => sum + (Number(s.pontosGastos) || 0), 0);
                const remainingSkillPoints = maxCompanionSkills - totalSkillPoints;
                
                return (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                          Perícias do Companheiro
                        </h4>
                        <span className={`text-[11px] font-mono font-bold ${remainingSkillPoints < 0 ? 'text-red-400 animate-pulse' : 'text-secondary'}`}>
                          ({remainingSkillPoints}/{maxCompanionSkills} Pts)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCompanionSkill}
                        className="w-8 h-8 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg cursor-pointer transition-all rounded-none border-none"
                        title="Adicionar Perícia"
                      >
                        +
                      </button>
                    </div>

                    {/* Table of skills - No horizontal scroll on mobile */}
                    <div className="border border-outline-variant/30 flex-grow min-h-0">
                      {tempCompanionSkills.length === 0 ? (
                        <p className="text-xs text-outline italic text-center py-6 border border-dashed border-outline-variant/20 bg-surface-container-low/20">
                          Nenhuma perícia adicionada ainda. Clique no botão [+] para criar.
                        </p>
                      ) : (
                        <table className="w-full text-[10px] font-sans border-collapse">
                          <thead>
                            <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                              <th className="border border-outline-variant p-2 text-left">
                                <span className="hidden sm:inline">Perícia</span>
                                <span className="inline sm:hidden">Per.</span>
                              </th>
                              <th className="border border-outline-variant p-2 sm:w-16 w-11">
                                <span className="hidden sm:inline">Pontos</span>
                                <span className="inline sm:hidden">Pts</span>
                              </th>
                              <th className="border border-outline-variant p-2 sm:w-24 w-12">
                                <span className="hidden sm:inline">Atributo</span>
                                <span className="inline sm:hidden">Atr</span>
                              </th>
                              <th className="border border-outline-variant p-2 sm:w-14 w-10">
                                <span className="hidden sm:inline">TOTAL %</span>
                                <span className="inline sm:hidden">%</span>
                              </th>
                              {!isLocked && <th className="p-1 w-10 bg-transparent border-none"></th>}
                            </tr>
                          </thead>
                          <tbody className="text-center font-mono">
                            {tempCompanionSkills.map((skill, sIdx) => {
                              const attrVal = tempCompanionAttributes[skill.atributo as keyof typeof tempCompanionAttributes] || 0;
                              const total = (Number(skill.pontosGastos) || 0) + attrVal;
                              return (
                                <tr key={skill.id || sIdx} className="hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/20">
                                  <td className="border-r border-outline-variant/20 p-1 text-left">
                                    <>
<textarea maxLength={300}
                                      value={skill.nome}
                                      placeholder="Ex: Mordida, Rastrear..."
                                      onChange={(e) => handleUpdateCompanionSkill(skill.id, 'nome', e.target.value)}
                                      rows={1}
                                      className={`w-full bg-transparent border-none p-1 font-sans text-xs text-on-surface focus:ring-0 outline-none placeholder:text-outline-variant/40 resize-none h-11 sm:h-7 leading-tight block overflow-hidden ${skill.nome?.length >= 300 ? '!text-red-500' : ''}`}
                                    />
{skill.nome?.length >= 300 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (300)
      </div>
    )}
</>
              
                                  </td>
                                  <td className="border-r border-outline-variant/20 p-1">
                                    <input
                                      type="number"
                                      min="0"
                                      value={skill.pontosGastos}
                                      onChange={(e) => handleUpdateCompanionSkill(skill.id, 'pontosGastos', parseInt(e.target.value) || 0)}
                                      className="w-full bg-transparent border-none p-0.5 sm:p-1 font-mono text-center text-xs text-on-surface focus:ring-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                  </td>
                                  <td className="border-r border-outline-variant/20 p-1">
                                    <CustomSelect
                                      value={skill.atributo}
                                      onChange={(e) => handleUpdateCompanionSkill(skill.id, 'atributo', e.target.value)}
                                      size="sm"
                                      variant="minimal"
                                      options={[
                                        { value: "con", label: "CON" },
                                        { value: "for", label: "FOR" },
                                        { value: "des", label: "DES" },
                                        { value: "agi", label: "AGI" },
                                        { value: "int", label: "INT" },
                                        { value: "per", label: "PER" },
                                        { value: "will", label: "WIL" },
                                        { value: "car", label: "CAR" }
                                      ]}
                                    />
                                  </td>
                                  <td className={`${!isLocked ? 'border-r border-outline-variant/20' : ''} p-1 text-center`}>
                                    <span className="text-primary font-bold text-[10px] sm:text-xs">
                                      {total}%
                                    </span>
                                  </td>
                                  {!isLocked && (
                                    <td className="p-1 border-none bg-transparent">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTempCompanionSkills(prev => prev.filter(s => s.id !== skill.id));
                                        }}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 transition-all outline-none border-0 rounded-none cursor-pointer flex items-center justify-center mx-auto"
                                        title="Remover Perícia"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
        </fieldset>
      </Modal>

      {/* Submodal: Montaria Especial Sheet */}
      <Modal
        isOpen={isMontariaModalOpen}
        onClose={() => setIsMontariaModalOpen(false)}
        title={tempNomeMontaria.trim() || "Montaria Especial"}
        icon={<PawPrint className="w-5 h-5 text-primary shrink-0" />}
        maxWidth="max-w-3xl"
        footer={
          (!isLocked && userRole === 'player') ? (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleSaveMontaria}
                className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-[11px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none border-none text-center"
              >
                Salvar Ficha
              </button>
            </div>
          ) : undefined
        }
      >
        <fieldset disabled={isLocked} className="space-y-4 text-left">
              {/* Fields: Nome and Animal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0 bg-surface-container p-3 border border-outline-variant/30">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Nome</label>
                <>
<input maxLength={50}
                  type="text"
                  placeholder="Ex: Alípio, Tornado..."
                  value={tempNomeMontaria}
                  onChange={(e) => setTempNomeMontaria(e.target.value)}
                  className={`bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none min-h-[36px] ${tempNomeMontaria?.length >= 50 ? '!text-red-500' : ''}`}
                />
{tempNomeMontaria?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Animal</label>
                <CustomSelect
                  value={tempAnimalMontariaId}
                  onChange={(e) => setTempAnimalMontariaId(e.target.value)}
                  variant="parchment"
                  options={[
                    { value: "", label: "Selecione uma montaria..." },
                    ...montariasBase.map((m) => ({
                      value: m.id,
                      label: `${m.nome} (${m.categoria})`
                    }))
                  ]}
                />
              </div>
            </div>

            {(() => {
              const selectedMontariaData = montariasBase.find(m => m.id === tempAnimalMontariaId);
              if (!selectedMontariaData) {
                return (
                  <p className="text-xs text-outline italic text-center py-6 border border-dashed border-outline-variant/20 bg-surface-container-low/20">
                    Selecione o tipo de animal da sua montaria acima para carregar a ficha.
                  </p>
                );
              }

              const charL = Number(editedChar.level) || 1;
              const { band, pv_bonus, ip_bonus, fr_bonus, int_bonus, especiais: progressionSpecs } = getMontariaProgressionForLevel(charL);

              return (
                <>
                  {/* Progression Info Card */}
                  <div className="bg-surface-container-high border border-outline-variant p-3 text-left space-y-2 shrink-0 rounded-none">
                    <div className="flex justify-between items-center border-b border-outline-variant/40 pb-1.5">
                      <span className="text-xs font-serif text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-secondary shrink-0" />
                        Progresso de Evolução da Montaria (Nível {charL})
                      </span>
                      <span className="text-[10px] font-mono text-on-surface bg-outline-variant px-2 py-0.5 uppercase tracking-widest font-bold">
                        Faixa {band}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-outline-variant">
                          <span>Bônus de Vida (PV):</span>
                          <span className="font-bold text-green-400">+{pv_bonus} PV</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-outline-variant">
                          <span>Bônus de IP Natural:</span>
                          <span className="font-bold text-green-400">+{ip_bonus} IP</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-outline-variant">
                          <span>Bônus de Força (FR):</span>
                          <span className="font-bold text-green-400">+{fr_bonus} FR</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-outline-variant">
                          <span>Bônus de Inteligência (INT):</span>
                          <span className="font-bold text-green-400">+{int_bonus} INT</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status: PV and IP */}
                  <div className="grid grid-cols-2 gap-4 shrink-0 bg-surface-container p-3 border border-outline-variant/30 text-center font-mono">
                    <div className="bg-surface-container border border-outline-variant/40 p-2">
                      <span className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider block">Pontos de Vida (PV)</span>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-green-400">
                          {(selectedMontariaData.pv_base || 0) + pv_bonus}
                        </span>
                        {pv_bonus > 0 && (
                          <span className="text-[9px] text-green-400 font-sans">
                            (Base {selectedMontariaData.pv_base || 0} + {pv_bonus} Evolução)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-surface-container border border-outline-variant/40 p-2">
                      <span className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider block">Índice de Proteção (IP)</span>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-secondary">
                          {(selectedMontariaData.ip_base || 0) + ip_bonus}
                        </span>
                        {ip_bonus > 0 && (
                          <span className="text-[9px] text-green-400 font-sans">
                            (Base {selectedMontariaData.ip_base || 0} + {ip_bonus} Evolução)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attributes Table */}
                  <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3 shrink-0">
                    <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                      Atributos da Montaria
                    </h4>
                    <div className="overflow-x-auto custom-scrollbar shrink-0">
                      <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                        <thead>
                          <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                            <th className="border border-outline-variant p-2 text-left">Atributo</th>
                            <th className="border border-outline-variant p-2 w-20">Base</th>
                            <th className="border border-outline-variant p-2 w-24">Bônus Evolução</th>
                            <th className="border border-outline-variant p-2 w-20">Total</th>
                          </tr>
                        </thead>
                        <tbody className="text-center font-mono">
                          {(['CON', 'FR', 'DEX', 'AGI', 'INT', 'PER', 'WILL', 'CAR'] as const).map((key) => {
                            const baseVal = selectedMontariaData.atributos?.[key] ?? 0;
                            let bonus = 0;
                            if (key === 'FR') {
                              bonus = fr_bonus;
                            } else if (key === 'INT') {
                              bonus = int_bonus;
                            }
                            const totalVal = baseVal + bonus;

                            const labelMap: { [key: string]: { full: string; short: string } } = {
                              CON: { full: "CONSTITUIÇÃO (CON)", short: "CON" },
                              FR: { full: "FORÇA (FR)", short: "FR" },
                              DEX: { full: "DESTREZA (DEX)", short: "DEX" },
                              AGI: { full: "AGILIDADE (AGI)", short: "AGI" },
                              INT: { full: "INTELIGÊNCIA (INT)", short: "INT" },
                              WILL: { full: "VONTADE (WILL)", short: "WILL" },
                              PER: { full: "PERCEPÇÃO (PER)", short: "PER" },
                              CAR: { full: "CARISMA (CAR)", short: "CAR" }
                            };
                            const labels = labelMap[key] || { full: key, short: key };
                            return (
                              <tr key={key} className="hover:bg-surface-container-high/40 transition-colors">
                                <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs">
                                  <span className="hidden sm:inline">{labels.full}</span>
                                  <span className="inline sm:hidden">{labels.short}</span>
                                </td>
                                <td className="border border-outline-variant p-2 text-on-surface-variant/80 text-sm font-bold">
                                  {baseVal}
                                </td>
                                <td className="border border-outline-variant p-2 text-green-400 text-sm font-bold">
                                  {bonus > 0 ? `+${bonus}` : '-'}
                                </td>
                                <td className="border border-outline-variant p-2 text-on-surface text-sm font-bold bg-surface-container-high">
                                  {totalVal}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Attacks Table */}
                  <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3 shrink-0">
                    <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                      Ataques da Montaria
                    </h4>
                    {selectedMontariaData.ataques && selectedMontariaData.ataques.length > 0 ? (
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                          <thead>
                            <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                              <th className="border border-outline-variant p-2 text-left">Ataque</th>
                              <th className="border border-outline-variant p-2">Perícia (%)</th>
                              <th className="border border-outline-variant p-2">Dano</th>
                            </tr>
                          </thead>
                          <tbody className="text-center font-mono">
                            {selectedMontariaData.ataques.map((atk: any, aIdx: number) => (
                              <tr key={aIdx} className="hover:bg-surface-container-high/40 transition-colors">
                                <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs">
                                  {atk.nome}
                                </td>
                                <td className="border border-outline-variant p-2 text-on-surface text-sm font-bold">
                                  {atk.pericia_porcentagem}%
                                </td>
                                <td className="border border-outline-variant p-2 text-secondary text-sm font-bold">
                                  {atk.dano_formula}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-outline-variant/60 italic">Nenhum ataque cadastrado.</p>
                    )}
                  </div>

                  {/* Special Abilities Section */}
                  <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3 shrink-0 text-left">
                    <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                      Habilidades Especiais Ativas
                    </h4>
                    {(() => {
                      const combinedSpecs: { nome: string; efeito: string }[] = [];
                      const addedNorms = new Set<string>();

                      // Add progression specials
                      progressionSpecs.forEach(esp => {
                        const norm = habilitadeNameNormalize(esp);
                        addedNorms.add(norm);
                        combinedSpecs.push({
                          nome: esp,
                          efeito: getMontariaAbilityDescription(esp)
                        });
                      });

                      // Add animal base specials if not already added
                      (selectedMontariaData.especiais || []).forEach((esp: string) => {
                        const norm = habilitadeNameNormalize(esp);
                        if (!addedNorms.has(norm)) {
                          addedNorms.add(norm);
                          combinedSpecs.push({
                            nome: esp,
                            efeito: getMontariaAbilityDescription(esp) || "Habilidade especial da criatura base."
                          });
                        }
                      });

                      if (combinedSpecs.length === 0) {
                        return <p className="text-xs text-outline-variant/60 italic">Nenhuma habilidade especial cadastrada.</p>;
                      }

                      return (
                        <div className="grid grid-cols-1 gap-2">
                          {combinedSpecs.map((spec, sIdx) => (
                            <div key={sIdx} className="bg-surface-container border border-outline-variant/30 p-3 text-xs">
                              <span className="font-serif text-secondary font-bold uppercase tracking-wider block mb-1">
                                {spec.nome}
                              </span>
                              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                                {spec.efeito}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </>
              );
            })()}
        </fieldset>
      </Modal>

      {/* Submodal: Familiar Sheet */}
      <Modal
        isOpen={isFamiliarModalOpen}
        onClose={() => setIsFamiliarModalOpen(false)}
        title={tempNomeFamiliar.trim() || "Familiar de Conjurador"}
        icon={<PawPrint className="w-5 h-5 text-primary shrink-0" />}
        maxWidth="max-w-3xl"
        footer={
          (!isLocked && userRole === 'player') ? (
            <div className="flex justify-end w-full">
              <button
                type="button"
                disabled={!tempAnimalFamiliarId || (tempAnimalFamiliarId === 'customizado' && !tempAnimalFamiliarNome.trim())}
                onClick={handleSaveFamiliar}
                className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none border-none text-center"
              >
                Salvar Ficha do Familiar
              </button>
            </div>
          ) : undefined
        }
      >
        <fieldset disabled={isLocked} className="space-y-4 text-left">
              {/* Fields: Nome and Animal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0 bg-surface-container p-3 border border-outline-variant/30">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Nome do Familiar</label>
                <>
<input maxLength={50}
                  type="text"
                  placeholder="Ex: Salem, Pywacket..."
                  value={tempNomeFamiliar}
                  onChange={(e) => setTempNomeFamiliar(e.target.value)}
                  className={`bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none min-h-[36px] ${tempNomeFamiliar?.length >= 50 ? '!text-red-500' : ''}`}
                />
{tempNomeFamiliar?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
              </div>
              
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Animal / Tipo</label>
                <CustomSelect
                  value={tempAnimalFamiliarId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTempAnimalFamiliarId(val);
                    const charL = Number(editedChar.level) || 1;
                    const progressionAbilities = getFamiliarAbilitiesForLevel(charL);

                    if (val === 'customizado') {
                      setTempAnimalFamiliarNome('');
                      setTempFamiliarAtributos({
                        CON: 0, FR: 0, DEX: 0, AGI: 0, INT: 0, WILL: 0, PER: 0, CAR: 0, PV: 0, IP: 0
                      });
                      setTempFamiliarPericias([]);
                      setTempFamiliarHabilidades(progressionAbilities);
                      toast.warning('Atenção ao Balanceamento! Consulte o mestre em caso de dúvidas');
                    } else {
                      const found = familiaresBase.find(f => f.id === val);
                      if (found) {
                        setTempAnimalFamiliarNome(found.animal || '');
                        setTempFamiliarAtributos({
                          CON: found.atributos?.CON ?? 0,
                          FR: found.atributos?.FR ?? 0,
                          DEX: found.atributos?.DEX ?? 0,
                          AGI: found.atributos?.AGI ?? 0,
                          INT: found.atributos?.INT ?? 0,
                          WILL: found.atributos?.WILL ?? 0,
                          PER: found.atributos?.PER ?? 0,
                          CAR: found.atributos?.CAR ?? 0,
                          PV: found.atributos?.PV ?? 0,
                          IP: found.atributos?.IP ?? 0
                        });
                        setTempFamiliarPericias((found.pericias || []).map((p: any) => ({
                          pericia: p.pericia || '',
                          chance_acerto: p.chance_acerto ?? 0,
                          dano: p.dano || ''
                        })));

                        // Merge progression abilities and the animal's unique base abilities
                        let activeHabs = [...progressionAbilities];
                        const foundHabs = found.habilidades || [];
                        foundHabs.forEach((h: any) => {
                          const normName = habilitadeNameNormalize(h.habilidade);
                          const exists = activeHabs.some(ah => 
                            habilitadeNameNormalize(ah.habilidade) === normName
                          );
                          if (!exists) {
                            activeHabs.push({
                              habilidade: h.habilidade || '',
                              efeito: h.efeito || ''
                            });
                          }
                        });
                        setTempFamiliarHabilidades(activeHabs);
                      }
                    }
                  }}
                  variant="parchment"
                  options={[
                    { value: "", label: "Selecione um familiar..." },
                    ...familiaresBase.map((f) => ({
                      value: f.id,
                      label: f.animal
                    })),
                    { value: "customizado", label: "Criar Familiar Customizado" }
                  ]}
                />
              </div>
            </div>

            {tempAnimalFamiliarId === 'customizado' && (
              <div className="flex flex-col gap-1 text-left bg-surface-container p-3 border border-outline-variant/30 shrink-0">
                <label className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider">Espécie do Animal Customizado</label>
                <>
<input maxLength={50}
                  type="text"
                  placeholder="Ex: Corvo, Serpente, Mini-Dragão..."
                  value={tempAnimalFamiliarNome}
                  onChange={(e) => setTempAnimalFamiliarNome(e.target.value)}
                  className={`bg-surface-container border border-outline-variant text-xs text-on-surface px-3 py-2 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none min-h-[36px] ${tempAnimalFamiliarNome?.length >= 50 ? '!text-red-500' : ''}`}
                />
{tempAnimalFamiliarNome?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
              </div>
            )}

            {!tempAnimalFamiliarId ? (
              <p className="text-xs text-outline italic text-center py-6 border border-dashed border-outline-variant/20 bg-surface-container-low/20">
                Selecione o tipo de familiar acima para carregar a ficha.
              </p>
            ) : (
              <>
                {/* Progression Info Card */}
                {(() => {
                  const charL = Number(editedChar.level) || 1;
                  const { band, ip_natural_bonus, int_bonus, especiais } = getFamiliarProgressionForLevel(charL);
                  return (
                    <div className="bg-surface-container-high border border-outline-variant p-3 text-left space-y-2 shrink-0 rounded-none">
                      <div className="flex justify-between items-center border-b border-outline-variant/40 pb-1.5">
                        <span className="text-xs font-serif text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-secondary shrink-0" />
                          Progresso de Evolução do Familiar (Nível {charL})
                        </span>
                        <span className="text-[10px] font-mono text-on-surface bg-outline-variant px-2 py-0.5 uppercase tracking-widest font-bold">
                          Faixa {band}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-outline-variant">
                            <span>Bônus de Inteligência:</span>
                            <span className="font-bold text-green-400">+{int_bonus} INT (Sobrescreve)</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-outline-variant">
                            <span>Bônus de IP Natural:</span>
                            <span className="font-bold text-green-400">+{ip_natural_bonus} IP (Sobrescreve)</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-outline block uppercase tracking-wider font-bold">Habilidades Ativas:</span>
                          <div className="flex flex-wrap gap-1">
                            {especiais.map((esp, idx) => (
                              <span key={idx} className="bg-amber-500/10 text-secondary border border-amber-500/20 text-[9px] px-1.5 py-0.5 rounded-none font-sans font-bold">
                                {esp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Stats: PV and IP */}
                <div className="grid grid-cols-2 gap-4 shrink-0 bg-surface-container p-3 border border-outline-variant/30 text-center font-mono">
                  <div className="bg-surface-container border border-outline-variant/40 p-2">
                    <span className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider block">Pontos de Vida (PV)</span>
                    {tempAnimalFamiliarId === 'customizado' ? (
                      <span className="text-lg font-bold text-green-400">
                        {Math.ceil(((tempFamiliarAtributos.CON || 0) + (tempFamiliarAtributos.FR || 0)) / 2)}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-green-400">{tempFamiliarAtributos.PV}</span>
                    )}
                  </div>
                  <div className="bg-surface-container border border-outline-variant/40 p-2">
                    <span className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider block">Índice de Proteção (IP)</span>
                    {tempAnimalFamiliarId === 'customizado' ? (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setTempFamiliarAtributos(prev => ({ ...prev, IP: Math.max(0, prev.IP - 1) }))}
                          className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-400 font-bold border border-red-500/20 cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="text-base font-bold text-secondary w-12 text-center">{tempFamiliarAtributos.IP}</span>
                        <button
                          type="button"
                          onClick={() => setTempFamiliarAtributos(prev => ({ ...prev, IP: prev.IP + 1 }))}
                          className="w-6 h-6 flex items-center justify-center bg-green-500/10 text-green-400 font-bold border border-green-500/20 cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>
                    ) : (() => {
                      const charL = Number(editedChar.level) || 1;
                      const { ip_natural_bonus } = getFamiliarProgressionForLevel(charL);
                      const baseIP = tempFamiliarAtributos.IP ?? 0;
                      return (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-lg font-bold text-secondary">
                            {baseIP + ip_natural_bonus}
                          </span>
                          {ip_natural_bonus > 0 && (
                            <span className="text-[9px] text-green-400 font-sans">
                              (Base {baseIP} + {ip_natural_bonus} Evolução)
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Attributes Table */}
                <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3 shrink-0">
                  <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                    Atributos do Familiar
                  </h4>
                  {tempAnimalFamiliarId === 'customizado' && (() => {
                    const totalAttrPoints = (tempFamiliarAtributos.CON || 0) +
                      (tempFamiliarAtributos.FR || 0) +
                      (tempFamiliarAtributos.DEX || 0) +
                      (tempFamiliarAtributos.AGI || 0) +
                      (tempFamiliarAtributos.INT || 0) +
                      (tempFamiliarAtributos.WILL || 0) +
                      (tempFamiliarAtributos.PER || 0) +
                      (tempFamiliarAtributos.CAR || 0);
                    return (
                      <div className="flex justify-between items-center text-xs font-sans text-secondary font-bold bg-amber-500/10 p-2 border border-amber-500/25">
                        <span>Pontos de Atributo Distribuídos:</span>
                        <span>{totalAttrPoints} / 42</span>
                      </div>
                    );
                  })()}
                  <div className="overflow-x-auto custom-scrollbar shrink-0">
                    <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                      <thead>
                        <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                          <th className="border border-outline-variant p-2 text-left">Atributo</th>
                          {tempAnimalFamiliarId === 'customizado' ? (
                            <th className="border border-outline-variant p-2 w-36">Valor</th>
                          ) : (
                            <>
                              <th className="border border-outline-variant p-2 w-20">Base</th>
                              <th className="border border-outline-variant p-2 w-24">Bônus Evolução</th>
                              <th className="border border-outline-variant p-2 w-20">Total</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="text-center font-mono">
                        {(['CON', 'FR', 'DEX', 'AGI', 'INT', 'WILL', 'PER', 'CAR'] as const).map((key) => {
                          const baseVal = tempFamiliarAtributos[key] ?? 0;
                          const charL = Number(editedChar.level) || 1;
                          const { int_bonus } = getFamiliarProgressionForLevel(charL);
                          
                          // Determine bonus for this attribute
                          let bonus = 0;
                          if (key === 'INT') {
                            bonus = int_bonus;
                          }
                          const totalVal = baseVal + bonus;

                          const labelMap: { [key: string]: { full: string; short: string } } = {
                            CON: { full: "CONSTITUIÇÃO (CON)", short: "CON" },
                            FR: { full: "FORÇA (FR)", short: "FR" },
                            DEX: { full: "DESTREZA (DEX)", short: "DEX" },
                            AGI: { full: "AGILIDADE (AGI)", short: "AGI" },
                            INT: { full: "INTELIGÊNCIA (INT)", short: "INT" },
                            WILL: { full: "VONTADE (WILL)", short: "WILL" },
                            PER: { full: "PERCEPÇÃO (PER)", short: "PER" },
                            CAR: { full: "CARISMA (CAR)", short: "CAR" }
                          };
                          const labels = labelMap[key] || { full: key, short: key };
                          
                          const handleValueChange = (newVal: number) => {
                            newVal = Math.max(0, newVal);
                            setTempFamiliarAtributos(prev => ({ ...prev, [key]: newVal }));
                          };

                          return (
                            <tr key={key} className="hover:bg-surface-container-high/40 transition-colors">
                              <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs">
                                <span className="hidden sm:inline">{labels.full}</span>
                                <span className="inline sm:hidden">{labels.short}</span>
                              </td>
                              {tempAnimalFamiliarId === 'customizado' ? (
                                <td className="border border-outline-variant p-1">
                                  <div className="flex items-center justify-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleValueChange(baseVal + 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400 transition-all font-bold rounded-none cursor-pointer text-xs"
                                    >
                                      +
                                    </button>
                                    <span className="text-on-surface text-sm font-bold w-6 text-center">{baseVal}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleValueChange(baseVal - 1)}
                                      className="w-7 h-7 flex items-center justify-center bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 transition-all font-bold rounded-none cursor-pointer text-xs"
                                    >
                                      -
                                    </button>
                                  </div>
                                </td>
                              ) : (
                                <>
                                  <td className="border border-outline-variant p-1 text-on-surface-variant/80 text-sm font-bold">
                                    {baseVal}
                                  </td>
                                  <td className="border border-outline-variant p-1 text-green-400 text-sm font-bold">
                                    {bonus > 0 ? `+${bonus}` : '-'}
                                  </td>
                                  <td className="border border-outline-variant p-1 text-on-surface text-sm font-bold bg-surface-container-high">
                                    {totalVal}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Perícias / Attacks Table */}
                <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3 shrink-0">
                  <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                    Perícias e Combate
                  </h4>
                  {tempAnimalFamiliarId === 'customizado' && (() => {
                    const totalSkillPoints = tempFamiliarPericias.reduce((sum, p) => sum + (p.chance_acerto || 0), 0);
                    return (
                      <div className="flex justify-between items-center text-xs font-sans text-secondary font-bold bg-amber-500/10 p-2 border border-amber-500/25">
                        <span>Pontos de Perícia Distribuídos:</span>
                        <span>{totalSkillPoints} / 25</span>
                      </div>
                    );
                  })()}
                  {tempFamiliarPericias.length > 0 ? (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                        <thead>
                          <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                            <th className="border border-outline-variant p-2 text-left">Perícia / Ataque</th>
                            <th className="border border-outline-variant p-2">Chance de Acerto (%)</th>
                            <th className="border border-outline-variant p-2">Dano</th>
                            {tempAnimalFamiliarId === 'customizado' && (
                              <th className="border border-outline-variant p-2 w-12">Remover</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="text-center font-mono">
                          {tempFamiliarPericias.map((p, pIdx) => (
                            <tr key={pIdx} className="hover:bg-surface-container-high/40 transition-colors">
                              <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs">
                                {p.pericia}
                              </td>
                              <td className="border border-outline-variant p-2 text-on-surface text-sm font-bold">
                                {p.chance_acerto}%
                              </td>
                              <td className="border border-outline-variant p-2 text-secondary text-sm font-bold">
                                {p.dano || '-'}
                              </td>
                              {tempAnimalFamiliarId === 'customizado' && (
                                <td className="border border-outline-variant p-1">
                                  <button
                                    type="button"
                                    onClick={() => setTempFamiliarPericias(prev => prev.filter((_, idx) => idx !== pIdx))}
                                    className="text-red-500 hover:text-red-300 transition-colors material-symbols-outlined text-sm font-bold cursor-pointer"
                                  >
                                    delete
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-outline-variant/60 italic">Nenhuma perícia ou ataque cadastrado.</p>
                  )}

                  {/* Add Custom Attack Form */}
                  {tempAnimalFamiliarId === 'customizado' && (
                    <div className="bg-surface-container p-3 border border-outline-variant/30 space-y-2 mt-2 text-left">
                      <h5 className="text-[10px] text-primary uppercase font-bold tracking-wider">Adicionar Ataque / Perícia</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <>
<input maxLength={50}
                          type="text"
                          placeholder="Perícia (Ex: Mordida, Furtividade)"
                          value={newFamPericia}
                          onChange={(e) => setNewFamPericia(e.target.value)}
                          className={`bg-surface-container border border-outline-variant text-[11px] text-on-surface px-2.5 py-1.5 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none ${newFamPericia?.length >= 50 ? '!text-red-500' : ''}`}
                        />
{newFamPericia?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                        <input
                          type="number"
                          placeholder="Acerto % (Ex: 40)"
                          value={newFamChance || ''}
                          onChange={(e) => setNewFamChance(Math.max(0, Number(e.target.value)))}
                          className="bg-surface-container border border-outline-variant text-[11px] text-on-surface px-2.5 py-1.5 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none"
                        />
                        <>
<input maxLength={50}
                          type="text"
                          placeholder="Fórmula de Dano (Ex: 1d4, 1d6-1)"
                          value={newFamDano}
                          onChange={(e) => setNewFamDano(e.target.value)}
                          className={`bg-surface-container border border-outline-variant text-[11px] text-on-surface px-2.5 py-1.5 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none ${newFamDano?.length >= 50 ? '!text-red-500' : ''}`}
                        />
{newFamDano?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newFamPericia.trim()) return;
                          setTempFamiliarPericias(prev => [...prev, {
                            pericia: newFamPericia.trim(),
                            chance_acerto: newFamChance,
                            dano: newFamDano.trim()
                          }]);
                          setNewFamPericia('');
                          setNewFamChance(0);
                          setNewFamDano('');
                        }}
                        className="w-full py-1.5 bg-primary/20 hover:bg-primary/30 text-primary font-bold text-[10px] uppercase tracking-wider border border-primary/30 transition-all rounded-none cursor-pointer"
                      >
                        + Adicionar Linha de Perícia
                      </button>
                    </div>
                  )}
                </div>

                {/* Special Abilities Section */}
                <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3 shrink-0">
                  <h4 className="font-serif text-sm text-primary font-bold uppercase tracking-wider">
                    Habilidades Especiais / Vantagens
                  </h4>
                  {tempFamiliarHabilidades.length > 0 ? (
                    <div className="space-y-2">
                      {tempFamiliarHabilidades.map((h, hIdx) => (
                        <div key={hIdx} className="p-2.5 bg-surface-container border border-outline-variant/30 flex justify-between items-start gap-4 text-left">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-secondary block">
                              {h.habilidade} {isBaseFamiliarAbility(h.habilidade) && <span className="text-[9px] text-outline font-normal font-sans tracking-wide">(Base)</span>}
                            </span>
                            <p className="text-[10px] text-outline-variant leading-relaxed">{h.efeito}</p>
                          </div>
                          {tempAnimalFamiliarId === 'customizado' && !isBaseFamiliarAbility(h.habilidade) && (
                            <button
                              type="button"
                              onClick={() => setTempFamiliarHabilidades(prev => prev.filter((_, idx) => idx !== hIdx))}
                              className="text-red-500 hover:text-red-300 transition-colors material-symbols-outlined text-sm font-bold cursor-pointer shrink-0"
                            >
                              delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-outline-variant/60 italic">Nenhuma habilidade especial cadastrada.</p>
                  )}

                  {/* Add Custom Ability Form */}
                  {tempAnimalFamiliarId === 'customizado' && (() => {
                    const customAbilities = tempFamiliarHabilidades.filter(h => !isBaseFamiliarAbility(h.habilidade));
                    const hasCustomAbility = customAbilities.length >= 1;

                    return (
                      <div className="bg-surface-container p-3 border border-outline-variant/30 space-y-2 mt-2 text-left">
                        <h5 className="text-[10px] text-primary uppercase font-bold tracking-wider">
                          Adicionar Habilidade Especial / Vantagem Customizada (Máx: 1)
                        </h5>
                        {hasCustomAbility ? (
                          <p className="text-xs text-secondary/90 italic">
                            Você já adicionou 1 habilidade customizada. Remova-a acima para poder criar uma nova.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <>
<input maxLength={50}
                                type="text"
                                placeholder="Nome da Habilidade (Ex: Sopro de Gelo)"
                                value={newFamHabilidade}
                                onChange={(e) => setNewFamHabilidade(e.target.value)}
                                className={`bg-surface-container border border-outline-variant text-[11px] text-on-surface px-2.5 py-1.5 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none min-h-[36px] ${newFamHabilidade?.length >= 50 ? '!text-red-500' : ''}`}
                              />
{newFamHabilidade?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                              <>
<input maxLength={50}
                                type="text"
                                placeholder="Descrição do Efeito (Ex: Causa 1d6 de dano de frio)"
                                value={newFamEfeito}
                                onChange={(e) => setNewFamEfeito(e.target.value)}
                                className={`bg-surface-container border border-outline-variant text-[11px] text-on-surface px-2.5 py-1.5 focus:ring-1 focus:ring-primary outline-none focus:border-primary rounded-none min-h-[36px] ${newFamEfeito?.length >= 50 ? '!text-red-500' : ''}`}
                              />
{newFamEfeito?.length >= 50 && (
      <div className="w-full text-right text-[10px] text-red-500 font-bold animate-pulse mt-0.5 pr-1">
        Limite atingido (50)
      </div>
    )}
</>
              
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (!newFamHabilidade.trim()) return;
                                setTempFamiliarHabilidades(prev => [
                                  ...prev,
                                  {
                                    habilidade: newFamHabilidade.trim(),
                                    efeito: newFamEfeito.trim()
                                  }
                                ]);
                                setNewFamHabilidade('');
                                setNewFamEfeito('');
                              }}
                              className="w-full py-1.5 bg-primary/20 hover:bg-primary/30 text-primary font-bold text-[10px] uppercase tracking-wider border border-primary/30 transition-all rounded-none cursor-pointer"
                            >
                              + Adicionar Habilidade Customizada
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

        </fieldset>
      </Modal>

      {/* Secondary Diff Modal: Companion Animal Review */}
      {isCompanionDiffModalOpen && (() => {
        const origComp = originalChar?.companionAnimal;
        const currComp = editedChar?.companionAnimal;

        const compNameChanged = origComp?.nomeAnimal !== currComp?.nomeAnimal;
        const compTypeChanged = origComp?.tipoAnimal !== currComp?.tipoAnimal;

        const compSkillsDiff = (() => {
          const origSkills = origComp?.skills || [];
          const currSkills = currComp?.skills || [];
          const combined: Array<any & { oldPontosGastos?: number; oldAtributo?: string; diffStatus: 'added' | 'removed' | 'modified' | 'none' }> = [];
          
          currSkills.forEach(curr => {
            const orig = origSkills.find(o => o.nome?.toLowerCase() === curr.nome?.toLowerCase() || o.id === curr.id);
            if (!orig) {
              combined.push({ ...curr, diffStatus: 'added' });
            } else if (orig.pontosGastos !== curr.pontosGastos || orig.atributo !== curr.atributo) {
              combined.push({ ...curr, oldPontosGastos: orig.pontosGastos, oldAtributo: orig.atributo, diffStatus: 'modified' });
            } else {
              combined.push({ ...curr, diffStatus: 'none' });
            }
          });
          
          origSkills.forEach(orig => {
            const exists = currSkills.some(c => c.nome?.toLowerCase() === orig.nome?.toLowerCase() || c.id === orig.id);
            if (!exists) {
              combined.push({ ...orig, diffStatus: 'removed' });
            }
          });
          
          return combined;
        })();

        return (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-surface-container border border-amber-500 max-w-3xl w-full p-4 md:p-6 shadow-2xl relative flex flex-col rounded-none h-[90vh] max-h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto custom-scrollbar gap-4 text-left">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30 shrink-0">
                <div className="flex items-center gap-2 text-secondary">
                  <PawPrint className="w-5 h-5 shrink-0 text-secondary" />
                  <h3 className="font-serif text-sm uppercase tracking-wider font-semibold">
                    Revisão de Alterações - {currComp?.nomeAnimal || "Companheiro animal"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompanionDiffModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  close
                </button>
              </div>

              {/* General Fields Diff */}
              <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                <h4 className="font-serif text-xs text-primary font-bold uppercase tracking-wider">Identificação</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className={`p-2 border rounded-sm ${compNameChanged ? 'bg-amber-500/10 border-amber-500/50' : 'bg-surface-container/50 border-outline-variant/20'}`}>
                    <span className="text-[10px] text-outline uppercase block font-bold mb-1">Nome</span>
                    {compNameChanged ? (
                      <span className="font-mono text-on-surface">
                        <span className="text-red-400 line-through mr-1">{origComp?.nomeAnimal || "(Vazio)"}</span>
                        <span className="text-secondary font-bold">→ {currComp?.nomeAnimal || "(Vazio)"}</span>
                      </span>
                    ) : (
                      <span className="font-mono text-on-surface/90">{currComp?.nomeAnimal || "(Vazio)"}</span>
                    )}
                  </div>
                  <div className={`p-2 border rounded-sm ${compTypeChanged ? 'bg-amber-500/10 border-amber-500/50' : 'bg-surface-container/50 border-outline-variant/20'}`}>
                    <span className="text-[10px] text-outline uppercase block font-bold mb-1">Animal</span>
                    {compTypeChanged ? (
                      <span className="font-mono text-on-surface">
                        <span className="text-red-400 line-through mr-1">{origComp?.tipoAnimal || "(Vazio)"}</span>
                        <span className="text-secondary font-bold">→ {currComp?.tipoAnimal || "(Vazio)"}</span>
                      </span>
                    ) : (
                      <span className="font-mono text-on-surface/90">{currComp?.tipoAnimal || "(Vazio)"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Attributes Diff Table */}
              <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                <h4 className="font-serif text-xs text-primary font-bold uppercase tracking-wider">Atributos</h4>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                    <thead>
                      <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                        <th className="border border-outline-variant p-2 text-left">Atributo</th>
                        <th className="border border-outline-variant p-2 w-36">Pontos</th>
                      </tr>
                    </thead>
                    <tbody className="text-center font-mono">
                      {(['con', 'for', 'des', 'agi', 'int', 'per', 'will', 'car'] as const).map((attrKey) => {
                        const labels: { [key: string]: string } = {
                          con: 'CONSTITUIÇÃO (CON)',
                          for: 'FORÇA (FOR)',
                          des: 'DESTREZA (DES)',
                          agi: 'AGILIDADE (AGI)',
                          int: 'INTELIGÊNCIA (INT)',
                          per: 'PERCEPÇÃO (PER)',
                          will: 'VONTADE (WILL)',
                          car: 'CARISMA (CAR)'
                        };
                        const origVal = origComp?.attributes?.[attrKey] ?? 0;
                        const currVal = currComp?.attributes?.[attrKey] ?? 0;
                        const isChanged = origVal !== currVal;

                        return (
                          <tr key={attrKey} className={`hover:bg-surface-container-high/40 transition-colors ${isChanged ? 'bg-amber-500/5' : ''}`}>
                            <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs">
                              {labels[attrKey]}
                            </td>
                            <td className={`border border-outline-variant p-2 text-on-surface font-bold ${isChanged ? 'text-secondary bg-amber-500/5' : ''}`}>
                              {isChanged ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className="text-red-400 line-through">{origVal}</span>
                                  <span>→</span>
                                  <span className="text-secondary">{currVal}</span>
                                </div>
                              ) : (
                                <span>{currVal}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Companion Skills Diff Table */}
              <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                <h4 className="font-serif text-xs text-primary font-bold uppercase tracking-wider">Perícias e Ataques</h4>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                    <thead>
                      <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                        <th className="border border-outline-variant p-2 text-left">Perícia</th>
                        <th className="border border-outline-variant p-2 w-24">Pontos Gastos</th>
                        <th className="border border-outline-variant p-2 w-24">Atributo</th>
                        <th className="border border-outline-variant p-2 w-24">Total %</th>
                      </tr>
                    </thead>
                    <tbody className="text-center font-mono">
                      {compSkillsDiff.map((skill, sIdx) => {
                        const attrVal = currComp?.attributes?.[skill.atributo as keyof typeof currComp.attributes] || 0;
                        const totalVal = (Number(skill.pontosGastos) || 0) + attrVal;

                        let rowBg = '';
                        let textClass = 'text-on-surface/90';
                        let badge = null;

                        if (skill.diffStatus === 'added') {
                          rowBg = 'bg-emerald-500/10 border-emerald-500/20';
                          textClass = 'text-emerald-300';
                          badge = <span className="ml-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded font-sans uppercase">Novo</span>;
                        } else if (skill.diffStatus === 'modified') {
                          rowBg = 'bg-amber-500/10 border-amber-500/20';
                          textClass = 'text-secondary';
                          badge = <span className="ml-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded font-sans uppercase">Editado</span>;
                        } else if (skill.diffStatus === 'removed') {
                          rowBg = 'bg-red-500/5 border-red-500/10 opacity-60';
                          textClass = 'text-red-400 line-through';
                          badge = <span className="ml-2 text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1 py-0.5 rounded font-sans uppercase">Removido</span>;
                        }

                        return (
                          <tr key={skill.id || sIdx} className={`hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/20 ${rowBg} ${textClass}`}>
                            <td className="border-r border-outline-variant/20 p-2 text-left font-sans font-bold flex items-center">
                              <span>{skill.nome}</span>
                              {badge}
                            </td>
                            <td className="border-r border-outline-variant/20 p-2">
                              {skill.diffStatus === 'modified' && skill.oldPontosGastos !== skill.pontosGastos ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-red-400 line-through">{skill.oldPontosGastos}</span>
                                  <span>→</span>
                                  <span className="text-secondary font-bold">{skill.pontosGastos}</span>
                                </div>
                              ) : (
                                <span>{skill.pontosGastos}</span>
                              )}
                            </td>
                            <td className="border-r border-outline-variant/20 p-2 uppercase">
                              {skill.diffStatus === 'modified' && skill.oldAtributo !== skill.atributo ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-red-400 line-through">{skill.oldAtributo}</span>
                                  <span>→</span>
                                  <span className="text-secondary font-bold">{skill.atributo}</span>
                                </div>
                              ) : (
                                <span>{skill.atributo}</span>
                              )}
                            </td>
                            <td className="p-2 font-bold text-xs">
                              {totalVal}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex gap-3 pt-4 border-t border-outline-variant/30 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsCompanionDiffModalOpen(false)}
                  className="w-full py-2.5 bg-amber-500 hover:brightness-110 text-on-primary font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-none border border-transparent text-center"
                >
                  Fechar Revisão
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Secondary Diff Modal: Montaria Especial Review */}
      {isMontariaDiffModalOpen && (() => {
        const origMont = originalChar?.montariaEspecial;
        const currMont = editedChar?.montariaEspecial;

        const montNameChanged = origMont?.nome !== currMont?.nome;
        const montTypeChanged = origMont?.animalId !== currMont?.animalId;

        const selectedMontariaData = montariasBase.find(m => m.id === currMont?.animalId);
        const oldMontariaData = montariasBase.find(m => m.id === origMont?.animalId);

        return (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-surface-container border border-amber-500 max-w-3xl w-full p-4 md:p-6 shadow-2xl relative flex flex-col rounded-none h-[90vh] max-h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto custom-scrollbar gap-4 text-left">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30 shrink-0">
                <div className="flex items-center gap-2 text-secondary">
                  <PawPrint className="w-5 h-5 shrink-0 text-secondary" />
                  <h3 className="font-serif text-sm uppercase tracking-wider font-semibold">
                    Revisão de Alterações - {currMont?.nome || "Montaria Especial"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMontariaDiffModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  close
                </button>
              </div>

              {/* General Fields Diff */}
              <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                <h4 className="font-serif text-xs text-primary font-bold uppercase tracking-wider">Identificação</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className={`p-2 border rounded-sm ${montNameChanged ? 'bg-amber-500/10 border-amber-500/50' : 'bg-surface-container/50 border-outline-variant/20'}`}>
                    <span className="text-[10px] text-outline uppercase block font-bold mb-1">Nome</span>
                    {montNameChanged ? (
                      <span className="font-mono text-on-surface">
                        <span className="text-red-400 line-through mr-1">{origMont?.nome || "(Vazio)"}</span>
                        <span className="text-secondary font-bold">→ {currMont?.nome || "(Vazio)"}</span>
                      </span>
                    ) : (
                      <span className="font-mono text-on-surface/90">{currMont?.nome || "(Vazio)"}</span>
                    )}
                  </div>
                  <div className={`p-2 border rounded-sm ${montTypeChanged ? 'bg-amber-500/10 border-amber-500/50' : 'bg-surface-container/50 border-outline-variant/20'}`}>
                    <span className="text-[10px] text-outline uppercase block font-bold mb-1">Tipo da Montaria</span>
                    {montTypeChanged ? (
                      <span className="font-mono text-on-surface">
                        <span className="text-red-400 line-through mr-1">{oldMontariaData?.nome || "(Vazio)"}</span>
                        <span className="text-secondary font-bold">→ {selectedMontariaData?.nome || "(Vazio)"}</span>
                      </span>
                    ) : (
                      <span className="font-mono text-on-surface/90">{selectedMontariaData?.nome || "(Vazio)"}</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedMontariaData && (
                <>
                  {/* Status base diff */}
                  <div className="grid grid-cols-2 gap-4 shrink-0 bg-surface-container p-3 border border-outline-variant/30 text-center font-mono text-xs">
                    <div className={`bg-surface-container border p-2 rounded-sm ${selectedMontariaData.pv_base !== oldMontariaData?.pv_base ? 'border-amber-500 bg-amber-500/5' : 'border-outline-variant/20'}`}>
                      <span className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider block">PV Base</span>
                      {selectedMontariaData.pv_base !== oldMontariaData?.pv_base ? (
                        <div className="flex items-center justify-center gap-1 text-sm font-bold">
                          <span className="text-red-400 line-through">{oldMontariaData?.pv_base || 0}</span>
                          <span className="text-secondary">→ {selectedMontariaData.pv_base || 0}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-green-400">{selectedMontariaData.pv_base || 0}</span>
                      )}
                    </div>
                    <div className={`bg-surface-container border p-2 rounded-sm ${selectedMontariaData.ip_base !== oldMontariaData?.ip_base ? 'border-amber-500 bg-amber-500/5' : 'border-outline-variant/20'}`}>
                      <span className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider block">IP Base</span>
                      {selectedMontariaData.ip_base !== oldMontariaData?.ip_base ? (
                        <div className="flex items-center justify-center gap-1 text-sm font-bold">
                          <span className="text-red-400 line-through">{oldMontariaData?.ip_base || 0}</span>
                          <span className="text-secondary">→ {selectedMontariaData.ip_base || 0}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-secondary">{selectedMontariaData.ip_base || 0}</span>
                      )}
                    </div>
                  </div>

                  {/* Attributes table diff */}
                  <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                    <h4 className="font-serif text-xs text-primary font-bold uppercase tracking-wider">Atributos</h4>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                        <thead>
                          <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                            <th className="border border-outline-variant p-2 text-left">Atributo</th>
                            <th className="border border-outline-variant p-2 w-36">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="text-center font-mono">
                          {(['CON', 'FR', 'DEX', 'AGI', 'INT', 'PER', 'WILL', 'CAR'] as const).map((key) => {
                            const origVal = oldMontariaData?.atributos?.[key] ?? 0;
                            const currVal = selectedMontariaData.atributos?.[key] ?? 0;
                            const isChanged = origVal !== currVal;

                            const labelMap: { [key: string]: string } = {
                              CON: 'CONSTITUIÇÃO (CON)',
                              FR: 'FORÇA (FR)',
                              DEX: 'DESTREZA (DEX)',
                              AGI: 'AGILIDADE (AGI)',
                              INT: 'INTELIGÊNCIA (INT)',
                              WILL: 'VONTADE (WILL)',
                              PER: 'PERCEPÇÃO (PER)',
                              CAR: 'CARISMA (CAR)'
                            };

                            return (
                              <tr key={key} className={`hover:bg-surface-container-high/40 transition-colors ${isChanged ? 'bg-amber-500/5' : ''}`}>
                                <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs">
                                  {labelMap[key] || key}
                                </td>
                                <td className={`border border-outline-variant p-2 text-on-surface font-bold ${isChanged ? 'text-secondary bg-amber-500/5' : ''}`}>
                                  {isChanged ? (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <span className="text-red-400 line-through">{origVal}</span>
                                      <span>→</span>
                                      <span className="text-secondary">{currVal}</span>
                                    </div>
                                  ) : (
                                    <span>{currVal}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Close Button */}
              <div className="flex gap-3 pt-4 border-t border-outline-variant/30 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsMontariaDiffModalOpen(false)}
                  className="w-full py-2.5 bg-amber-500 hover:brightness-110 text-on-primary font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-none border border-transparent text-center"
                >
                  Fechar Revisão
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Secondary Diff Modal: Familiar de Conjurador Review */}
      {isFamiliarDiffModalOpen && (() => {
        const origFam = originalChar?.familiar;
        const currFam = editedChar?.familiar;

        const famNameChanged = origFam?.nome !== currFam?.nome;
        const famTypeChanged = (origFam?.animalId !== currFam?.animalId) || (origFam?.animalNome !== currFam?.animalNome);

        // Attributes list: 'CON', 'FR', 'DEX', 'AGI', 'INT', 'WILL', 'PER', 'CAR'
        const familiarPericiasDiff = (() => {
          const origSkills = origFam?.pericias || [];
          const currSkills = currFam?.pericias || [];
          const combined: Array<any & { oldChance?: number; oldDano?: string; diffStatus: 'added' | 'removed' | 'modified' | 'none' }> = [];
          
          currSkills.forEach(curr => {
            const orig = origSkills.find(o => o.pericia?.toLowerCase() === curr.pericia?.toLowerCase());
            if (!orig) {
              combined.push({ ...curr, diffStatus: 'added' });
            } else if (orig.chance_acerto !== curr.chance_acerto || orig.dano !== curr.dano) {
              combined.push({ ...curr, oldChance: orig.chance_acerto, oldDano: orig.dano, diffStatus: 'modified' });
            } else {
              combined.push({ ...curr, diffStatus: 'none' });
            }
          });
          
          origSkills.forEach(orig => {
            const exists = currSkills.some(c => c.pericia?.toLowerCase() === orig.pericia?.toLowerCase());
            if (!exists) {
              combined.push({ ...orig, diffStatus: 'removed' });
            }
          });
          
          return combined;
        })();

        const familiarHabilidadesDiff = (() => {
          const origHabs = origFam?.habilidades || [];
          const currHabs = currFam?.habilidades || [];
          const combined: Array<any & { oldEfeito?: string; diffStatus: 'added' | 'removed' | 'modified' | 'none' }> = [];
          
          currHabs.forEach(curr => {
            const orig = origHabs.find(h => h.habilidade?.toLowerCase() === curr.habilidade?.toLowerCase());
            if (!orig) {
              combined.push({ ...curr, diffStatus: 'added' });
            } else if (orig.efeito !== curr.efeito) {
              combined.push({ ...curr, oldEfeito: orig.efeito, diffStatus: 'modified' });
            } else {
              combined.push({ ...curr, diffStatus: 'none' });
            }
          });
          
          origHabs.forEach(orig => {
            const exists = currHabs.some(c => c.habilidade?.toLowerCase() === orig.habilidade?.toLowerCase());
            if (!exists) {
              combined.push({ ...orig, diffStatus: 'removed' });
            }
          });
          
          return combined;
        })();

        return (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-surface-container border border-amber-500 max-w-3xl w-full p-4 md:p-6 shadow-2xl relative flex flex-col rounded-none h-[90vh] max-h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto custom-scrollbar gap-4 text-left">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30 shrink-0">
                <div className="flex items-center gap-2 text-secondary">
                  <PawPrint className="w-5 h-5 shrink-0 text-secondary" />
                  <h3 className="font-serif text-sm uppercase tracking-wider font-semibold">
                    Revisão de Alterações - {currFam?.nome || "Familiar de Conjurador"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFamiliarDiffModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  close
                </button>
              </div>

              {/* General Fields Diff */}
              <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                <h4 className="font-serif text-xs text-primary font-bold uppercase tracking-wider">Identificação</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className={`p-2 border rounded-sm ${famNameChanged ? 'bg-amber-500/10 border-amber-500/50' : 'bg-surface-container/50 border-outline-variant/20'}`}>
                    <span className="text-[10px] text-outline uppercase block font-bold mb-1">Nome</span>
                    {famNameChanged ? (
                      <span className="font-mono text-on-surface">
                        <span className="text-red-400 line-through mr-1">{origFam?.nome || "(Vazio)"}</span>
                        <span className="text-secondary font-bold">→ {currFam?.nome || "(Vazio)"}</span>
                      </span>
                    ) : (
                      <span className="font-mono text-on-surface/90">{currFam?.nome || "(Vazio)"}</span>
                    )}
                  </div>
                  <div className={`p-2 border rounded-sm ${famTypeChanged ? 'bg-amber-500/10 border-amber-500/50' : 'bg-surface-container/50 border-outline-variant/20'}`}>
                    <span className="text-[10px] text-outline uppercase block font-bold mb-1">Animal / Tipo</span>
                    {famTypeChanged ? (
                      <span className="font-mono text-on-surface">
                        <span className="text-red-400 line-through mr-1">{(origFam?.animalId === 'customizado' ? origFam?.animalNome : familiaresBase.find(f => f.id === origFam?.animalId)?.animal) || "(Vazio)"}</span>
                        <span className="text-secondary font-bold">→ {(currFam?.animalId === 'customizado' ? currFam?.animalNome : familiaresBase.find(f => f.id === currFam?.animalId)?.animal) || "(Vazio)"}</span>
                      </span>
                    ) : (
                      <span className="font-mono text-on-surface/90">{(currFam?.animalId === 'customizado' ? currFam?.animalNome : familiaresBase.find(f => f.id === currFam?.animalId)?.animal) || "(Vazio)"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status base diff */}
              <div className="grid grid-cols-2 gap-4 shrink-0 bg-surface-container p-3 border border-outline-variant/30 text-center font-mono text-xs">
                <div className={`bg-surface-container border p-2 rounded-sm ${currFam?.atributos?.PV !== origFam?.atributos?.PV ? 'border-amber-500 bg-amber-500/5' : 'border-outline-variant/20'}`}>
                  <span className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider block">PV Base</span>
                  {currFam?.atributos?.PV !== origFam?.atributos?.PV ? (
                    <div className="flex items-center justify-center gap-1 text-sm font-bold">
                      <span className="text-red-400 line-through">{origFam?.atributos?.PV || 0}</span>
                      <span className="text-secondary">→ {currFam?.atributos?.PV || 0}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-green-400">{currFam?.atributos?.PV || 0}</span>
                  )}
                </div>
                <div className={`bg-surface-container border p-2 rounded-sm ${currFam?.atributos?.IP !== origFam?.atributos?.IP ? 'border-amber-500 bg-amber-500/5' : 'border-outline-variant/20'}`}>
                  <span className="text-[9px] font-sans font-bold text-outline uppercase tracking-wider block">IP Base</span>
                  {currFam?.atributos?.IP !== origFam?.atributos?.IP ? (
                    <div className="flex items-center justify-center gap-1 text-sm font-bold">
                      <span className="text-red-400 line-through">{origFam?.atributos?.IP || 0}</span>
                      <span className="text-secondary">→ {currFam?.atributos?.IP || 0}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-secondary">{currFam?.atributos?.IP || 0}</span>
                  )}
                </div>
              </div>

              {/* Attributes table diff */}
              <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                <h4 className="font-serif text-xs text-primary font-bold uppercase tracking-wider">Atributos</h4>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                    <thead>
                      <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                        <th className="border border-outline-variant p-2 text-left">Atributo</th>
                        <th className="border border-outline-variant p-2 w-36">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="text-center font-mono">
                      {(['CON', 'FR', 'DEX', 'AGI', 'INT', 'WILL', 'PER', 'CAR'] as const).map((key) => {
                        const origVal = origFam?.atributos?.[key] ?? 0;
                        const currVal = currFam?.atributos?.[key] ?? 0;
                        const isChanged = origVal !== currVal;

                        const labelMap: { [key: string]: string } = {
                          CON: 'CONSTITUIÇÃO (CON)',
                          FR: 'FORÇA (FR)',
                          DEX: 'DESTREZA (DEX)',
                          AGI: 'AGILIDADE (AGI)',
                          INT: 'INTELIGÊNCIA (INT)',
                          WILL: 'VONTADE (WILL)',
                          PER: 'PERCEPÇÃO (PER)',
                          CAR: 'CARISMA (CAR)'
                        };

                        return (
                          <tr key={key} className={`hover:bg-surface-container-high/40 transition-colors ${isChanged ? 'bg-amber-500/5' : ''}`}>
                            <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs">
                              {labelMap[key] || key}
                            </td>
                            <td className={`border border-outline-variant p-2 text-on-surface font-bold ${isChanged ? 'text-secondary bg-amber-500/5' : ''}`}>
                              {isChanged ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className="text-red-400 line-through">{origVal}</span>
                                  <span>→</span>
                                  <span className="text-secondary">{currVal}</span>
                                </div>
                              ) : (
                                <span>{currVal}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pericias Diff */}
              <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                <h4 className="font-serif text-xs text-primary font-bold uppercase tracking-wider font-bold">Perícias e Combate</h4>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[10px] font-sans border-collapse border border-outline-variant">
                    <thead>
                      <tr className="bg-surface-container-highest text-center text-on-surface-variant font-bold tracking-widest uppercase scale-y-95">
                        <th className="border border-outline-variant p-2 text-left">Perícia / Ataque</th>
                        <th className="border border-outline-variant p-2 w-28">Chance de Acerto</th>
                        <th className="border border-outline-variant p-2 w-28">Dano</th>
                      </tr>
                    </thead>
                    <tbody className="text-center font-mono">
                      {familiarPericiasDiff.map((p, pIdx) => {
                        let rowBg = '';
                        let textClass = 'text-on-surface/90';
                        let badge = null;

                        if (p.diffStatus === 'added') {
                          rowBg = 'bg-emerald-500/10 border-emerald-500/20';
                          textClass = 'text-emerald-300';
                          badge = <span className="ml-2 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded font-sans uppercase">Novo</span>;
                        } else if (p.diffStatus === 'modified') {
                          rowBg = 'bg-amber-500/10 border-amber-500/20';
                          textClass = 'text-secondary';
                          badge = <span className="ml-2 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded font-sans uppercase">Editado</span>;
                        } else if (p.diffStatus === 'removed') {
                          rowBg = 'bg-red-500/5 border-red-500/10 opacity-60';
                          textClass = 'text-red-400 line-through';
                          badge = <span className="ml-2 text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1 py-0.5 rounded font-sans uppercase">Removido</span>;
                        }

                        return (
                          <tr key={pIdx} className={`hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/20 ${rowBg} ${textClass}`}>
                            <td className="border border-outline-variant p-2 bg-surface-container-lowest text-left text-primary font-bold font-serif text-xs flex items-center">
                              <span>{p.pericia}</span>
                              {badge}
                            </td>
                            <td className="border border-outline-variant p-2 text-sm font-bold">
                              {p.diffStatus === 'modified' && p.oldChance !== p.chance_acerto ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-red-400 line-through">{p.oldChance}%</span>
                                  <span>→</span>
                                  <span className="text-secondary font-bold">{p.chance_acerto}%</span>
                                </div>
                              ) : (
                                <span>{p.chance_acerto}%</span>
                              )}
                            </td>
                            <td className="border border-outline-variant p-2 text-sm font-bold">
                              {p.diffStatus === 'modified' && p.oldDano !== p.dano ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-red-400 line-through">{p.oldDano || '-'}</span>
                                  <span>→</span>
                                  <span className="text-secondary font-bold">{p.dano || '-'}</span>
                                </div>
                              ) : (
                                <span>{p.dano || '-'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Habilidades Diff */}
              <div className="bg-surface-container p-4 border border-outline-variant/30 space-y-3">
                <h4 className="font-serif text-xs text-primary uppercase font-bold tracking-wider">Habilidades Especiais / Vantagens</h4>
                <div className="space-y-2 text-xs">
                  {familiarHabilidadesDiff.map((h, hIdx) => {
                    let containerClass = 'p-2.5 bg-surface-container border border-outline-variant/30 flex justify-between items-start gap-4 text-left';
                    let badge = null;

                    if (h.diffStatus === 'added') {
                      containerClass = 'p-2.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex justify-between items-start gap-4 text-left';
                      badge = <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">Adicionado</span>;
                    } else if (h.diffStatus === 'modified') {
                      containerClass = 'p-2.5 bg-amber-500/10 border border-amber-500/40 text-secondary flex justify-between items-start gap-4 text-left';
                      badge = <span className="ml-1.5 text-[8px] bg-amber-500/20 text-secondary border border-amber-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">Modificado</span>;
                    } else if (h.diffStatus === 'removed') {
                      containerClass = 'p-2.5 bg-red-500/5 border border-red-500/10 opacity-50 text-red-400 line-through flex justify-between items-start gap-4 text-left';
                      badge = <span className="ml-1.5 text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1 py-0.5 rounded uppercase font-bold tracking-wider font-sans">Removido</span>;
                    }

                    return (
                      <div key={hIdx} className={containerClass}>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-secondary block flex items-center gap-1.5">
                            <span>{h.habilidade}</span>
                            {badge}
                          </span>
                          {h.diffStatus === 'modified' ? (
                            <div className="space-y-1 text-[10px]">
                              <p className="text-red-400 line-through">Anterior: {h.oldEfeito}</p>
                              <p className="text-secondary">Atual: {h.efeito}</p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-outline-variant leading-relaxed">{h.efeito}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex gap-3 pt-4 border-t border-outline-variant/30 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsFamiliarDiffModalOpen(false)}
                  className="w-full py-2.5 bg-amber-500 hover:brightness-110 text-on-primary font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-none border border-transparent text-center"
                >
                  Fechar Revisão
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
