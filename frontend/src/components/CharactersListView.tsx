import React, { useState, useEffect } from 'react';
import PageHeader from './common/PageHeader';
import { Character, ActiveScreen, Campaign } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { AddButton } from './ActionButtons';
import CustomSelect from './CustomSelect';
import { CharacterCardSkeleton } from './ui/Skeleton';

function CharacterCardPortrait({ url, name }: { url?: string; name: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  if (!url || url.trim() === '' || error) {
    return (
      <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center gap-2 border-b border-outline-variant/30 relative">
        <div className="w-16 h-16 rounded-full bg-outline-variant/10 border border-outline-variant/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-4xl">person</span>
        </div>
        <span className="text-micro font-sans font-bold tracking-wider text-outline-variant/60 uppercase">
          Sem Retrato
        </span>
      </div>
    );
  }

  return (
    <>
      <img
        alt={`Retrato de ${name}`}
        className="w-full h-full object-cover portrait-group- group-hover:scale-105 transition-all duration-500"
        src={url}
        onError={() => setError(true)}
      />
    </>
  );
}

interface CharactersListViewProps {
  characters: Character[];
  setActiveScreen: (screen: ActiveScreen) => void;
  setCharacterUnderEditId: (id: string | null) => void;
  onDeleteCharacter: (id: string) => void;
  userRole?: 'player' | 'dm';
  onApproveCharacter?: (id: string) => void;
  onRejectCharacter?: (id: string) => void;
  campaigns?: Campaign[];
  isLoading?: boolean;
}

export default function CharactersListView({
  characters,
  setActiveScreen,
  setCharacterUnderEditId,
  onDeleteCharacter,
  userRole = 'player',
  onApproveCharacter,
  onRejectCharacter,
  campaigns = [],
  isLoading = false,
}: CharactersListViewProps) {
  const [characterToDelete, setCharacterToDelete] = useState<{ id: string; name: string } | null>(null);
  const [animatingId, setAnimatingId] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');
  
  const triggerApprove = (id: string) => {
    setAnimatingId({ id, type: 'approve' });
    setTimeout(() => {
      onApproveCharacter?.(id);
      setAnimatingId(null);
    }, 1000);
  };

  const triggerReject = (id: string) => {
    setAnimatingId({ id, type: 'reject' });
    setTimeout(() => {
      onRejectCharacter?.(id);
      setAnimatingId(null);
    }, 1000);
  };

  const handleAddNewCharacter = () => {
    setCharacterUnderEditId(null); // Indicates creating a new character
    setActiveScreen('character_editor');
  };

  const handleEditCharacter = (id: string) => {
    // If the card is currently animating, do not open editor to avoid double clicks
    if (animatingId?.id === id) return;
    setCharacterUnderEditId(id);
    setActiveScreen('character_editor');
  };

  const filteredCharacters = characters.filter((char) => {
    if (userRole === 'dm' && selectedCampaignFilter !== 'all') {
      return String(char.campaignId) === selectedCampaignFilter;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-24 relative font-sans">
      <PageHeader
        title={userRole === 'dm' ? 'Personagens da Campanha' : 'Meus Personagens'}
        subtitle={
          userRole === 'dm'
            ? 'Personagens registrados para as campanhas sob sua regência'
            : 'Fichas de heróis criadas para suas jornadas no sistema Daemon'
        }
        actions={
          <>
            {/* DM Campaign Filter */}
            {userRole === 'dm' && (
              <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/60 px-3 py-1.5 rounded-sm w-full sm:w-auto min-w-[220px]">
                <span className="material-symbols-outlined text-primary text-base shrink-0">filter_alt</span>
                <div className="flex-1 min-w-0">
                  <CustomSelect
                    value={selectedCampaignFilter}
                    onChange={(e) => setSelectedCampaignFilter(e.target.value)}
                    size="sm"
                    variant="ghost"
                    buttonClassName="py-0.5 px-1 text-xs text-on-surface font-sans"
                    options={[
                      { value: 'all', label: 'Todas as Campanhas' },
                      ...campaigns.map((c) => ({
                        value: c.id,
                        label: c.name,
                        description: c.universo
                      }))
                    ]}
                  />
                </div>
              </div>
            )}

            {userRole !== 'dm' && (
              <div className="hidden md:block">
                <AddButton
                  onClick={handleAddNewCharacter}
                  label="Novo personagem"
                />
              </div>
            )}
          </>
        }
      />

      {/* Grid of Characters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <CharacterCardSkeleton key={i} />
          ))
        ) : filteredCharacters.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 bg-surface-container-low border border-outline-variant/40 p-8 space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline-variant/60">groups</span>
            <h3 className="font-serif text-lg text-on-surface font-semibold">Nenhum dado encontrado</h3>
            <p className="text-xs text-on-surface-variant font-sans">
              Não conseguimos carregar os dados. Verifique sua conexão e tente novamente.
            </p>
          </div>
        ) : (
          filteredCharacters.map((char) => (
          <div
            key={char.id}
            className={`group relative bg-surface-container transition-all duration-300 flex flex-col h-[480px] cursor-pointer overflow-hidden ${
              animatingId?.id === char.id ? 'animate-subtle-tremor' : ''
            } ${
              char.isPendingDMReview && animatingId?.id !== char.id
                ? 'border-amber-pulsing'
                : 'border border-outline-variant hover:border-primary/50'
            }`}
            onClick={() => handleEditCharacter(char.id)}
          >
            {/* Approval / Rejection Card Overlay */}
            {animatingId?.id === char.id && (
              <div
                className={`absolute inset-0 z-30 border-2 flex items-center justify-center overflow-hidden pointer-events-none ${
                  animatingId.type === 'approve' ? 'animate-overlay-approve' : 'animate-overlay-reject'
                }`}
              >
                <div className="bg-surface-container/95 border border-white/10 px-4 py-2.5 flex items-center gap-2 shadow-2xl scale-110">
                  {animatingId.type === 'approve' ? (
                    <>
                      <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-green-400">Aprovado</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-red-400">Reprovado</span>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Grayscale hoverable portrait wrapper */}
            <div className="relative w-full h-[320px] overflow-hidden">
              <CharacterCardPortrait url={char.portraitUrl} name={char.name} />

              {/* Level Overlaid Badge */}
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#9e1b1b] text-on-primary text-micro font-mono font-bold px-2.5 py-1 uppercase tracking-widest">
                  Level {char.level}
                </span>
              </div>

              {/* Warning Badge for Pending DM Review */}
              {char.isPendingDMReview && (
                <div 
                  className="absolute top-4 right-4 bg-surface-container/90 border border-amber-500 text-amber-500 rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-lg animate-pulse"
                  title="Alterações em análise pelo mestre"
                >
                  <span className="material-symbols-outlined text-base">warning</span>
                </div>
              )}
            </div>

            {/* Title Content Area */}
            <div className="p-6 flex flex-col flex-grow bg-surface-container-low justify-between">
              <div>
                <h3 className="font-serif text-lg md:text-xl text-on-surface mb-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                  {char.name}
                </h3>
                <p className="font-sans text-micro font-bold text-primary uppercase tracking-widest mt-1">
                  {char.race} • {char.classKit}
                </p>
              </div>

              {/* Approve / Reject buttons on card if pending review and user is DM */}
              {char.isPendingDMReview && userRole === 'dm' && (
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={animatingId !== null}
                    onClick={() => triggerApprove(char.id)}
                    className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-800 dark:hover:bg-emerald-700 dark:text-white border border-emerald-800/30 text-micro font-sans font-bold uppercase tracking-wider transition-all cursor-pointer text-center shadow-sm active:scale-[0.98] disabled:opacity-40"
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    disabled={animatingId !== null}
                    onClick={() => triggerReject(char.id)}
                    className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white dark:bg-rose-800 dark:hover:bg-rose-700 dark:text-white border border-red-800/30 text-micro font-sans font-bold uppercase tracking-wider transition-all cursor-pointer text-center shadow-sm active:scale-[0.98] disabled:opacity-40"
                  >
                    Reprovar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      </div>

      {/* Floating Mobile Creation Button */}
      {userRole !== 'dm' && (
        <button
          onClick={handleAddNewCharacter}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center shadow-[0_4px_20px_rgba(209,171,114,0.3)] border border-primary/20 hover:scale-105 active:scale-95 duration-150 z-40 cursor-pointer"
          title="Novo Personagem"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!characterToDelete}
        onClose={() => setCharacterToDelete(null)}
        onConfirm={() => {
          if (characterToDelete) onDeleteCharacter(characterToDelete.id);
          setCharacterToDelete(null);
        }}
        title="Deletar Personagem"
        description="Você tem certeza que deseja deletar esse personagem?"
        itemPreview={
          <span className="font-mono text-sm text-primary-container font-bold">
            {characterToDelete?.name}
          </span>
        }
        confirmText="Deletar"
      />
    </div>
  );
}
