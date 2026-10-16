import React from 'react';
import { ReviewTicketChanges, ReviewTicketStatus } from '../types';

type Leaf = { last: unknown; new: unknown };
type Modification = 'ADICAO' | 'REMOCAO' | 'ALTERACAO';

interface DiffRow {
  key: string;
  /** Chave de nível superior do payload (ex.: "attributes") e o segundo nível, para ordenação. */
  top: string;
  sub: string;
  field: string;
  mod: Modification;
  original: string;
  proposed: string;
}

const isLeaf = (node: unknown): node is Leaf =>
  !!node && typeof node === 'object' && 'last' in node && 'new' in node;

const isEmpty = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length === 0);

const ATTRIBUTE_LABELS: Record<string, string> = {
  con: 'CON', for: 'FOR', des: 'DES', agi: 'AGI', int: 'INT', per: 'PER', will: 'VON', car: 'CAR',
};

// Seções na ordem em que aparecem na ficha; dentro de cada uma, os campos seguem a ordem listada.
const SECTIONS: { title: string; keys: string[] }[] = [
  { title: 'Dados base', keys: ['name', 'sex', 'race', 'weight', 'height', 'age', 'classKit', 'alinhamento', 'level', 'xp'] },
  { title: 'Atributos', keys: ['attributes', 'statusPoints', 'protection'] },
  { title: 'Magia', keys: ['isMagic', 'focusAllocation', 'spells', 'has_pending_magic_enchant'] },
  { title: 'Perícias', keys: ['skills'] },
  { title: 'Aprimoramentos', keys: ['aprimoramentosPositivos', 'aprimoramentosNegativos', 'descricaoEfeitos'] },
  { title: 'Companheiros', keys: ['companionAnimal', 'montariaEspecial', 'familiar'] },
  { title: 'Inventário', keys: ['armaPreferencialVinculo', 'armors', 'items'] },
  { title: 'Tesouro', keys: ['treasure'] },
  { title: 'Background', keys: ['background'] },
];
const OTHER_SECTION = 'Outros';

// Campos que não passam por aprovação do Mestre e, portanto, não entram no resumo.
const HIDDEN_FIELDS = ['portraitUrl'];

const sectionIndexOf = (top: string): number => {
  const i = SECTIONS.findIndex((sec) => sec.keys.includes(top));
  return i === -1 ? SECTIONS.length : i;
};
const sectionTitleOf = (top: string): string => SECTIONS[sectionIndexOf(top)]?.title ?? OTHER_SECTION;

const ATTRIBUTE_ORDER = ['for', 'con', 'des', 'agi', 'int', 'per', 'will', 'car'];
const STATUS_ORDER = ['vida', 'heroicos', 'magia', 'fe', 'psi', 'willPoints'];

/** Posição relativa dentro da seção: ordem da ficha para chaves de nível superior e sub-blocos conhecidos. */
function rankOf(row: DiffRow): [number, number, number] {
  const sec = sectionIndexOf(row.top);
  const keys = sec < SECTIONS.length ? SECTIONS[sec].keys : [];
  const topRank = keys.includes(row.top) ? keys.indexOf(row.top) : 0;
  const order = row.top === 'attributes' ? ATTRIBUTE_ORDER : row.top === 'statusPoints' ? STATUS_ORDER : [];
  const subRank = order.includes(row.sub) ? order.indexOf(row.sub) : 0;
  return [sec, topRank, subRank];
}

// Listas cujos filhos são itens identificados por nome (perícias, magias...).
const KEYED_LISTS = ['skills', 'spells', 'items', 'armors'];

// Rótulos por nome de campo (qualquer nível); campos desconhecidos são "humanizados".
const FIELD_LABELS: Record<string, string> = {
  name: 'Nome', race: 'Raça', classKit: 'Classe / Kit', level: 'Nível', xp: 'XP', portraitUrl: 'Retrato',
  sex: 'Sexo', weight: 'Peso', height: 'Altura', age: 'Idade',
  attributes: 'Atributos', statusPoints: 'Pontos de status', protection: 'Proteção', treasure: 'Tesouro',
  aprimoramentosPositivos: 'Aprimoramento positivo', aprimoramentosNegativos: 'Aprimoramento negativo',
  descricaoEfeitos: 'Descrição dos efeitos', campaignGenres: 'Gêneros da campanha',
  skills: 'Perícia', spells: 'Magia', items: 'Item', armors: 'Armadura', background: 'Histórico',
  isMagic: 'Personagem mágico', has_pending_magic_enchant: 'Encantamento mágico pendente',
  alinhamento: 'Alinhamento', focusAllocation: 'Alocação de foco',
  armaPreferencialVinculo: 'Arma preferencial', companionAnimal: 'Animal companheiro',
  montariaEspecial: 'Montaria especial', familiar: 'Familiar',
  natural: 'natural', penalidade: 'penalidade', bonusRacial: 'bônus racial', pctNatural: '% natural',
  valorAmpliado: 'valor ampliado', pctAmpliado: '% ampliado', pontosGastos: 'pontos gastos',
  penalidadeManual: 'penalidade manual', penalidadeExtra: 'penalidade extra',
  bonusRacialManual: 'bônus racial manual', bonusRacialExtra: 'bônus racial extra',
  vida: 'Vida', heroicos: 'Pontos heroicos', magia: 'Magia', fe: 'Fé', psi: 'Psi', willPoints: 'Pontos de vontade',
  valorFinal: 'valor final', danoSofrido: 'dano sofrido', magiaExaurida: 'magia exaurida',
  esforcoMental: 'esforço mental', feExaurida: 'fé exaurida', estadoMental: 'estado mental',
  ipCinetico: 'IP cinético', ipBalistico: 'IP balístico', ipEscudo: 'IP escudo', ipPsiquico: 'IP psíquico',
  ipMagico: 'IP mágico', durabilidadeArmadura: 'Durabilidade da armadura', atual: 'atual', total: 'total',
  baseIpPsiquico: 'IP psíquico base', baseIpEscudo: 'IP escudo base',
  ouro: 'ouro', prata: 'prata', bronze: 'bronze',
  gasto: 'gasto', atributo: 'atributo', atkGasto: 'gasto em ataque', defGasto: 'gasto em defesa',
  chosenSubgroup: 'subgrupo escolhido', pontosGratis: 'pontos grátis', sliderVal: 'ajuste', cost: 'custo',
};

const humanize = (key: string): string =>
  FIELD_LABELS[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();

const IGNORED_ITEM_FIELDS = ['name', 'group', 'chosenSubgroup', 'id', 'subgrupos', 'pointsToInsert'];

/** Resumo legível de um item de lista (perícia, magia, armadura...) em uma linha. */
function summarizeItem(item: Record<string, unknown>): string {
  const title = [item.name ?? item.group, item.chosenSubgroup ? `(${item.chosenSubgroup})` : null]
    .filter(Boolean)
    .join(' ');
  const details = Object.entries(item)
    .filter(([k, v]) => !IGNORED_ITEM_FIELDS.includes(k) && !isEmpty(v) && typeof v !== 'object')
    .map(([k, v]) => `${humanize(k)} ${formatScalar(v)}`);
  return [title, details.join(', ')].filter(Boolean).join(' — ') || '—';
}

function formatScalar(value: unknown): string {
  if (isEmpty(value)) return '—';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.map(formatScalar).join(', ');
  if (typeof value === 'object') return summarizeItem(value as Record<string, unknown>);
  return String(value);
}

const modOf = (last: unknown, next: unknown): Modification =>
  isEmpty(last) ? 'ADICAO' : isEmpty(next) ? 'REMOCAO' : 'ALTERACAO';

function leafRows(field: string, key: string, leaf: Leaf): DiffRow[] {
  const [top = '', sub = ''] = key.split('/');
  const lastArr = Array.isArray(leaf.last) ? leaf.last : [];
  const newArr = Array.isArray(leaf.new) ? leaf.new : [];
  const isTextList = (arr: unknown[]) => arr.every((v) => typeof v === 'string');

  // Listas de textos (ex.: aprimoramentos): uma linha por item adicionado/removido.
  if ((Array.isArray(leaf.last) || Array.isArray(leaf.new)) && isTextList(lastArr) && isTextList(newArr)) {
    const added = newArr.filter((v) => !lastArr.includes(v));
    const removed = lastArr.filter((v) => !newArr.includes(v));
    return [
      ...added.map((v, i): DiffRow => ({ key: `${key}+${i}`, top, sub, field, mod: 'ADICAO', original: '—', proposed: String(v) })),
      ...removed.map((v, i): DiffRow => ({ key: `${key}-${i}`, top, sub, field, mod: 'REMOCAO', original: String(v), proposed: '—' })),
    ];
  }

  return [{ key, top, sub, field, mod: modOf(leaf.last, leaf.new), original: formatScalar(leaf.last), proposed: formatScalar(leaf.new) }];
}

function flatten(changes: ReviewTicketChanges | undefined, path: string[] = [], keyPath: string[] = []): DiffRow[] {
  if (!changes) return [];
  return Object.entries(changes).flatMap(([segment, node]) => {
    const parent = keyPath[keyPath.length - 1];
    const keys = [...keyPath, segment];

    let label: string;
    if (parent && KEYED_LISTS.includes(parent)) {
      // Filho de lista por chave: o segmento é o nome do item ("Perícia: Idiomas (Anões)").
      label = `${humanize(parent)}: ${segment}`;
    } else if (parent === 'attributes') {
      label = ATTRIBUTE_LABELS[segment] ?? segment.toUpperCase();
    } else {
      label = humanize(segment);
    }

    // Para itens de lista, o rótulo da própria lista é substituído pelo "Tipo: Nome".
    const nextPath = parent && KEYED_LISTS.includes(parent) ? [...path.slice(0, -1), label] : [...path, label];

    if (isLeaf(node)) return leafRows(nextPath.join(' › '), keys.join('/'), node);
    return flatten(node as ReviewTicketChanges, nextPath, keys);
  });
}

const MOD_STYLES: Record<Modification, { label: string; className: string }> = {
  ADICAO: { label: 'Adição', className: 'text-emerald-700 dark:text-emerald-300' },
  REMOCAO: { label: 'Remoção', className: 'text-red-700 dark:text-red-300' },
  ALTERACAO: { label: 'Alteração', className: 'text-amber-700 dark:text-amber-300' },
};

export function ReviewTicketDiff({ changes }: { changes?: ReviewTicketChanges }) {
  const rows = flatten(changes)
    .filter((row) => !HIDDEN_FIELDS.includes(row.top))
    .map((row, index) => ({ row, index, rank: rankOf(row) }))
    .sort((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1] || a.rank[2] - b.rank[2] || a.index - b.index)
    .map(({ row }) => row);

  if (rows.length === 0) {
    return <p className="text-caption text-on-surface-variant italic">Nenhuma alteração registrada neste pedido.</p>;
  }

  const groups = rows.reduce<{ title: string; rows: DiffRow[] }[]>((acc, row) => {
    const title = sectionTitleOf(row.top);
    const last = acc[acc.length - 1];
    if (last && last.title === title) last.rows.push(row);
    else acc.push({ title, rows: [row] });
    return acc;
  }, []);

  return (
    <>
      {/* md+: tabela */}
      <div className="hidden md:block border border-outline-variant/30">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="font-sans text-micro uppercase tracking-wider text-on-surface-variant bg-surface-container-high">
              <th className="px-3 py-2 font-bold">Campo</th>
              <th className="px-3 py-2 font-bold">Mod.</th>
              <th className="px-3 py-2 font-bold">Original</th>
              <th className="px-3 py-2 font-bold">Proposto</th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.title} className="divide-y divide-outline-variant/20">
              <tr className="bg-surface-container-high">
                <th colSpan={4} className="px-3 py-1.5 text-left font-serif text-xs uppercase tracking-widest text-primary">
                  {group.title}
                </th>
              </tr>
              {group.rows.map((row) => {
                const mod = MOD_STYLES[row.mod];
                return (
                  <tr key={row.key} className="align-top">
                    <td className="px-3 py-2 font-sans font-bold text-on-surface break-words">{row.field}</td>
                    <td className={`px-3 py-2 font-sans font-bold uppercase tracking-wider whitespace-nowrap ${mod.className}`}>{mod.label}</td>
                    <td className="px-3 py-2 text-on-surface-variant break-words">{row.original}</td>
                    <td className={`px-3 py-2 font-semibold break-words ${row.mod === 'REMOCAO' ? 'text-on-surface-variant' : mod.className}`}>{row.proposed}</td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>

      {/* < md: cartões empilhados */}
      <div className="md:hidden space-y-4">
        {groups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h5 className="font-serif text-xs uppercase tracking-widest text-primary border-b border-outline-variant/40 pb-1">
              {group.title}
            </h5>
            {group.rows.map((row) => {
              const mod = MOD_STYLES[row.mod];
              return (
                <div key={row.key} className="border border-outline-variant/30 bg-surface-container-low p-3 space-y-1.5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-sans font-bold text-on-surface break-words min-w-0">{row.field}</span>
                    <span className={`font-sans text-micro font-bold uppercase tracking-wider whitespace-nowrap ${mod.className}`}>{mod.label}</span>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <span className="font-sans text-micro uppercase tracking-wider text-on-surface-variant">Original</span>
                    <span className="text-on-surface-variant break-words">{row.original}</span>
                    <span className="font-sans text-micro uppercase tracking-wider text-on-surface-variant">Proposto</span>
                    <span className={`font-semibold break-words ${row.mod === 'REMOCAO' ? 'text-on-surface-variant' : mod.className}`}>{row.proposed}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

const STATUS_STYLES: Record<ReviewTicketStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-secondary-container text-on-secondary-container border-secondary' },
  APPROVED: { label: 'Aprovada', className: 'bg-tertiary-container text-on-tertiary-container border-tertiary' },
  REJECTED: { label: 'Rejeitada', className: 'bg-red-950/60 text-red-200 border-red-500/60' },
};

export function ReviewTicketStatusBadge({ status }: { status: ReviewTicketStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span className={`text-micro font-bold font-sans uppercase px-2 py-0.5 tracking-wider border ${className}`}>
      {label}
    </span>
  );
}

export const formatTicketDate = (iso?: string | null): string =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
