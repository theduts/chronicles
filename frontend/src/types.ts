export interface AttributeRow {
  natural: number | string;
  penalidade: number | string;
  bonusRacial: number | string;
  pctNatural: string;
  valorAmpliado: number;
  pctAmpliado: string;
  pontosGastos: number | string;
  penalidadeManual?: number | string;
  penalidadeExtra?: number | string;
  bonusRacialManual?: number | string;
  bonusRacialExtra?: number | string;
}

export interface CharacterAttributes {
  con: AttributeRow;
  for: AttributeRow;
  des: AttributeRow;
  agi: AttributeRow;
  int: AttributeRow;
  per: AttributeRow;
  will: AttributeRow;
  car: AttributeRow;
}

export interface StatPoint {
  valorFinal: number | string;
  danoSofrido?: number | string;
  magiaExaurida?: number | string;
  esforcoMental?: number | string;
  feExaurida?: number | string;
  estadoMental?: string;
}

export interface SkillRow {
  group: string;
  atributo: number | string;
  gasto: number | string;
  total: string;
  baseAttr?: string;
  parentSkillName?: string;
  chosenSubgroup?: string;
  subgrupos?: { nome: string; atributo_subgrupo: string | null }[];
  requer_ataque_defesa?: boolean;
  atkGasto?: number;
  defGasto?: number;
  isCustomBuild?: boolean;
  sliderVal?: number;
  pointsToInsert?: number | string;
  pontosGratis?: number;
}

export interface Character {
  id: string;
  name: string;
  sex: string;
  race: string;
  weight: string;
  height: string;
  age: string;
  classKit: string;
  level: number;
  xp: number;
  portraitUrl: string;
  attributes: CharacterAttributes;
  statusPoints: {
    vida: StatPoint;
    heroicos: StatPoint;
    magia: StatPoint;
    fe: StatPoint;
    psi: StatPoint;
    willPoints: StatPoint;
  };
  protection: {
    ipCinetico: number | string;
    ipBalistico: number | string;
    ipEscudo: number | string;
    ipPsiquico: number | string;
    ipMagico: number | string;
    durabilidadeArmadura: {
      atual: number | string;
      total: number | string;
    };
    baseIpPsiquico?: number | string;
    baseIpEscudo?: number | string;
  };
  aprimoramentosPositivos: string[];
  aprimoramentosNegativos: string[];
  descricaoEfeitos: string;
  campaignGenres: {
    arkanun: boolean;
    trevas: boolean;
    invasao: boolean;
    supers: boolean;
    fantasia: boolean;
    terror: boolean;
    scifi: boolean;
    cyberpunk: boolean;
  };
  skills: SkillRow[];
  treasure: {
    ouro: number | string;
    prata: number | string;
    bronze: number | string;
  };
  items?: (string | any)[];
  background?: string;
  isPendingDMReview?: boolean;
  pendingChanges?: any;
  isMagic?: boolean;
  has_pending_magic_enchant?: boolean;
  spells?: Spell[];
  alinhamento?: string;
  focusAllocation?: FocusAllocation;
  armors?: EquippedArmor[];
  armaPreferencialVinculo?: ArmaPreferencialVinculo;
  companionAnimal?: CompanionAnimal;
  montariaEspecial?: MontariaEspecial;
  familiar?: Familiar;
}

export interface Familiar {
  nome?: string;
  animalId?: string; // empty/blank or "custom" for personalized
  animalNome?: string; // used for custom or pre-set animal name
  atributos?: {
    CON: number;
    FR: number;
    DEX: number;
    AGI: number;
    INT: number;
    WILL: number;
    PER: number;
    CAR: number;
    PV: number;
    IP: number;
  };
  pericias?: { pericia: string; chance_acerto: number; dano: string }[];
  habilidades?: { habilidade: string; efeito: string }[];
  isCustom?: boolean;
  bonus_arcano?: {
    tipo: string;
    campo_comparacao: string;
    chave: string;
    parent_grupo?: string;
    valor: number;
    condicao: string;
  };
}

export interface MontariaEspecial {
  nome?: string;
  animalId?: string;
}

export interface CompanionSkill {
  id: string;
  nome: string;
  atributo: string;
  pontosGastos: number;
}

export interface CompanionAnimal {
  nomeAnimal?: string;
  tipoAnimal?: string;
  attributes: {
    con: number;
    for: number;
    des: number;
    agi: number;
    int: number;
    per: number;
    will: number;
    car: number;
  };
  skills: CompanionSkill[];
}

export interface ArmaPreferencialVinculo {
  id: "arma_preferencial";
  arma_vinculada_id: string;
}

export interface EquippedArmor {
  id: string;
  nome: string;
  ip: number;
  penalidade_dex: number;
  penalidade_agi: number;
  isEquipped: boolean;
  modificador?: string;
  obs?: string;
  slot?: string;
}

export interface FocusAllocation {
  criar: number;
  controlar: number;
  entender: number;
  caminhoNome: string;
  caminhoValor: number;
  caminhos?: { nome: string; valor: number }[];
}

export interface Spell {
  id: string;
  name: string;
  focus: string;
  cost: string;
  baseCost?: string;
  range: string;
  baseRange?: string;
  duration: string;
  durationHH?: number;
  durationMM?: number;
  durationSS?: number;
  baseDurationHH?: number;
  baseDurationMM?: number;
  baseDurationSS?: number;
  description: string;
  criar?: number;
  controlar?: number;
  entender?: number;
  caminhosValores?: { [caminhoNome: string]: number };
}

export interface Note {
  id: string;
  meta: string; // timestamp Format: dd/mm/aaaa - hh:mm
  content: string;
  saveBtnId: string;
}

export interface Campaign {
  id: string;
  name: string;
  dmEmail: string;
  players: string[];
  subtitulo?: string;
  universo?: 'Medieval' | 'Cyberpunk' | 'Cthullu' | 'Outro';
  lore?: string;
  ilustracao?: string; // image link or base64
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export type ActiveScreen = 'login' | 'signup' | 'dashboard' | 'characters' | 'character_editor' | 'notes' | 'settings' | 'chronicles' | 'npcs' | 'bestiary' | 'campaigns' | 'campaign_history';
