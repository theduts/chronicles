import React, { useState, useEffect } from 'react';
import { ScrollText, Coins, Gift } from 'lucide-react';
import Modal from './Modal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CustomSelect from './CustomSelect';
import { SaveButton, DeleteButton } from './ActionButtons';
import {
  Contract,
  ContractCurrency,
  ContractStatus,
  useContractsQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useDeleteContractMutation,
} from '../hooks/useContractMutations';

interface ContractsTabProps {
  campaignId?: string;
  isDmUser: boolean;
  searchTerm: string;
  isCreating: boolean;
  onCloseCreate: () => void;
}

const STATUS_LABEL: Record<ContractStatus, string> = {
  AVAILABLE: 'Disponível',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
};

const STATUS_BADGE: Record<ContractStatus, string> = {
  AVAILABLE: 'border-primary/40 text-primary bg-primary/10',
  IN_PROGRESS: 'border-amber-500/40 text-amber-500 bg-amber-500/10',
  COMPLETED: 'border-outline-variant text-on-surface-variant bg-surface-container-high',
};

const CURRENCY_LABEL: Record<ContractCurrency, string> = {
  PO: 'Ouro',
  PP: 'Prata',
  PB: 'Bronze',
};

const CURRENCY_COLOR: Record<ContractCurrency, string> = {
  PO: 'text-[#f5be38]',
  PP: 'text-[#cbd5e1]',
  PB: 'text-[#cd7f32]',
};

export function formatReward(c: Contract): string {
  const parts: string[] = [];
  if (c.hasReward && c.rewardValue && c.currency) parts.push(`${c.rewardValue} ${c.currency}`);
  if (c.rewardItem?.trim()) parts.push(c.rewardItem.trim());
  return parts.length > 0 ? parts.join(' + ') : 'A combinar';
}

export default function ContractsTab({ campaignId, isDmUser, searchTerm, isCreating, onCloseCreate }: ContractsTabProps) {
  const { data: contracts = [] } = useContractsQuery(campaignId);
  const createMutation = useCreateContractMutation(campaignId);
  const updateMutation = useUpdateContractMutation(campaignId);
  const deleteMutation = useDeleteContractMutation(campaignId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ContractStatus>('AVAILABLE');
  const [toNegotiate, setToNegotiate] = useState(false);
  const [rewardValue, setRewardValue] = useState('');
  const [currency, setCurrency] = useState<ContractCurrency>('PO');
  const [rewardItem, setRewardItem] = useState('');

  const selected = contracts.find((c) => c.id === selectedId) || null;
  const isOpen = isCreating || !!selected;

  // Load form state whenever the modal opens for a contract or for a new draft
  useEffect(() => {
    if (isCreating) {
      setTitle('');
      setDescription('');
      setStatus('AVAILABLE');
      setToNegotiate(false);
      setRewardValue('');
      setCurrency('PO');
      setRewardItem('');
    } else if (selected) {
      setTitle(selected.title || '');
      setDescription(selected.description || '');
      setStatus(selected.status || 'AVAILABLE');
      setToNegotiate(!selected.hasReward);
      setRewardValue(selected.rewardValue ? String(selected.rewardValue) : '');
      setCurrency((selected.currency as ContractCurrency) || 'PO');
      setRewardItem(selected.rewardItem || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreating, selectedId]);

  const closeModal = () => {
    if (isCreating) onCloseCreate();
    setSelectedId(null);
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const amount = parseInt(rewardValue, 10);
    const hasCoins = !toNegotiate && !isNaN(amount) && amount > 0;
    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      status,
      hasReward: hasCoins,
      rewardValue: hasCoins ? amount : 0,
      currency: hasCoins ? currency : null,
      rewardItem: toNegotiate ? '' : rewardItem.trim(),
    };

    if (isCreating) {
      createMutation.mutate(payload, { onSuccess: closeModal });
    } else if (selected) {
      updateMutation.mutate({ id: selected.id, payload }, { onSuccess: closeModal });
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteMutation.mutate(selected.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setSelectedId(null);
      },
    });
  };

  const q = searchTerm.toLowerCase();
  const filtered = contracts.filter(
    (c) => c.title.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const inputClass =
    'w-full bg-surface-container border border-outline-variant text-on-surface text-xs px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none';
  const labelClass = 'font-sans text-micro font-bold text-on-surface-variant uppercase tracking-widest mb-1 block';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map((contract) => (
          <div
            key={contract.id}
            onClick={() => setSelectedId(contract.id)}
            className={`bg-surface-container border border-outline-variant p-4 sm:p-5 parchment-texture space-y-3 hover:border-primary transition-all cursor-pointer group flex flex-col justify-between relative ${
              contract.status === 'COMPLETED' ? 'opacity-70' : ''
            }`}
          >
            <div className="space-y-3">
              <span className={`inline-block text-micro font-bold uppercase tracking-wider px-2 py-0.5 border ${STATUS_BADGE[contract.status]}`}>
                {STATUS_LABEL[contract.status] || contract.status}
              </span>
              <h4 className="font-serif text-lg text-on-surface font-medium group-hover:text-primary transition-colors">
                {contract.title}
              </h4>
              {contract.description && (
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed line-clamp-4">
                  {contract.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/30">
              <Coins className={`w-4 h-4 shrink-0 ${contract.hasReward && contract.currency ? CURRENCY_COLOR[contract.currency] : 'text-zinc-500'}`} />
              <span className="font-mono text-xs font-bold text-on-surface truncate">{formatReward(contract)}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center font-sans text-xs text-on-surface-variant/70 py-10">
            {contracts.length === 0 ? 'Nenhum contrato publicado no mural.' : 'Nenhum contrato encontrado.'}
          </p>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={isCreating ? 'Novo Contrato' : isDmUser ? 'Editar Contrato' : selected?.title || 'Detalhes do Contrato'}
        icon={<ScrollText className="w-5 h-5 text-primary" />}
        maxWidth="max-w-2xl"
        zIndex="z-[1050]"
        bodyClassName={isDmUser ? 'space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2' : 'space-y-4 text-xs font-sans'}
        onSubmit={isDmUser ? handleSave : undefined}
        footer={
          isDmUser ? (
            <div className={`flex items-center w-full ${selected ? 'justify-between' : 'justify-end'}`}>
              {selected && (
                <DeleteButton onClick={() => setShowDeleteConfirm(true)} label="Remover" variant="danger-ghost" />
              )}
              <SaveButton type="submit" label="Salvar" variant="primary-ghost" disabled={isSaving} />
            </div>
          ) : null
        }
      >
        {selected && !isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            <div className="bg-surface-container border border-outline-variant/60 p-3.5 flex flex-wrap items-center justify-between gap-2">
              <span className={`text-micro font-bold uppercase tracking-wider px-2 py-0.5 border ${STATUS_BADGE[selected.status]}`}>
                {STATUS_LABEL[selected.status] || selected.status}
              </span>
              <span className="flex items-center gap-2 font-mono text-sm font-bold text-on-surface">
                <Coins className={`w-4 h-4 ${selected.hasReward && selected.currency ? CURRENCY_COLOR[selected.currency] : 'text-zinc-500'}`} />
                {formatReward(selected)}
              </span>
            </div>
            <div>
              <h5 className={labelClass}>Descrição</h5>
              <p className="font-sans text-xs text-on-surface leading-relaxed bg-surface-container border border-outline-variant/40 p-3.5 rounded-none select-text whitespace-pre-line">
                {selected.description || 'Sem descrição.'}
              </p>
            </div>
          </div>
        )}

        {isOpen && isDmUser && (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelClass}>Nome do Contrato *</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: O Resgate da Princesa"
                  className={inputClass}
                />
                {title.length >= 50 && (
                  <div className="text-right mt-1 text-micro font-medium text-red-500/80">Limite atingido (50)</div>
                )}
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <CustomSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContractStatus)}
                  variant="parchment"
                  options={[
                    { value: 'AVAILABLE', label: STATUS_LABEL.AVAILABLE },
                    { value: 'IN_PROGRESS', label: STATUS_LABEL.IN_PROGRESS },
                    { value: 'COMPLETED', label: STATUS_LABEL.COMPLETED },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Descrição</label>
              <textarea
                rows={4}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo, o contratante e as condições..."
                className={`${inputClass} resize-none custom-scrollbar`}
              />
              {description.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">Limite atingido (300)</div>
              )}
            </div>

            <div className="border-t border-outline-variant/30 pt-4 space-y-3">
              <h4 className="font-serif text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-2">
                <Gift className="w-3.5 h-3.5" /> Pagamento
              </h4>
              <label className="relative flex items-center gap-3 cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  checked={toNegotiate}
                  onChange={(e) => setToNegotiate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border border-primary/50 bg-surface-container flex items-center justify-center transition-all peer-checked:border-primary peer-checked:bg-primary/20">
                  <div className={`w-2.5 h-2.5 bg-primary transition-transform ${toNegotiate ? 'scale-100' : 'scale-0'}`} />
                </div>
                <span className="text-on-surface text-xs">A combinar (definir valor posteriormente)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`${labelClass} ${toNegotiate ? 'opacity-40' : ''}`}>Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    disabled={toNegotiate}
                    value={rewardValue}
                    onChange={(e) => setRewardValue(e.target.value)}
                    placeholder="Ex: 50"
                    className={`${inputClass} disabled:opacity-40`}
                  />
                </div>
                <div>
                  <label className={`${labelClass} ${toNegotiate ? 'opacity-40' : ''}`}>Tipo de Moeda</label>
                  <CustomSelect
                    disabled={toNegotiate}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as ContractCurrency)}
                    variant="parchment"
                    options={[
                      { value: 'PO', label: CURRENCY_LABEL.PO },
                      { value: 'PP', label: CURRENCY_LABEL.PP },
                      { value: 'PB', label: CURRENCY_LABEL.PB },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className={`${labelClass} ${toNegotiate ? 'opacity-40' : ''}`}>Item / Favor (opcional)</label>
                <input
                  type="text"
                  maxLength={100}
                  disabled={toNegotiate}
                  value={rewardItem}
                  onChange={(e) => setRewardItem(e.target.value)}
                  placeholder="Ex: Espada +1, favor do Barão..."
                  className={`${inputClass} disabled:opacity-40`}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        title="Confirmar Remoção de Contrato"
        description="Tem certeza de que deseja remover este contrato? Esta ação não pode ser desfeita."
        itemPreview={<span className="font-serif text-sm text-on-surface font-bold">{selected?.title || 'este contrato'}</span>}
      />
    </>
  );
}
