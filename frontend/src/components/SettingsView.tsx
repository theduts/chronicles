import React, { useState } from 'react';
import { Character, Note } from '../types';
import { User, Mail, Lock, Sun, Moon, X, Check, Shield, AlertTriangle, HelpCircle } from 'lucide-react';
import Toggle from './Toggle';

interface SettingsViewProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  notes: Note[];
  user: { name: string; email: string; role?: 'player' | 'dm' };
  onUpdateUser: (user: { name: string; email: string; role?: 'player' | 'dm' }) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export default function SettingsView({
  isOpen,
  onClose,
  characters,
  notes,
  user,
  onUpdateUser,
  isDarkMode,
  setIsDarkMode,
}: SettingsViewProps) {
  // Read theme and settings directly from localStorage or default

  const [gamemasterName, setGamemasterName] = useState(() => {
    return localStorage.getItem('daemon_gm_name') || 'Murilo Dutra';
  });

  const [activeSystem, setActiveSystem] = useState(() => {
    return localStorage.getItem('daemon_active_system') || 'Daemon RPG Standard';
  });

  // Secondary modal for editing user info
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempEmail, setTempEmail] = useState(user.email);
  const [tempPassword, setTempPassword] = useState('••••••••');
  
  // Confirmation state
  const [isConfirmingChange, setIsConfirmingChange] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  // Handle auto-saving GM Name
  const handleGMNameChange = (val: string) => {
    setGamemasterName(val);
    localStorage.setItem('daemon_gm_name', val);
  };

  // Handle auto-saving System
  const handleSystemChange = (val: string) => {
    setActiveSystem(val);
    localStorage.setItem('daemon_active_system', val);
  };

  // Handle toggling visual theme
  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Triggered when user attempts to save changes in the secondary modal
  const handleSaveUserClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmingChange(true);
  };

  // Final confirmation to apply changes
  const handleConfirmUserChange = () => {
    onUpdateUser({
      name: tempName,
      email: tempEmail,
      role: user.role,
    });
    setIsConfirmingChange(false);
    setIsEditUserOpen(false);
    
    // Show visual confirmation toast
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm backdrop-blur-md z-[500] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
      
      {/* Toast de Sucesso */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 bg-surface-container-highest text-primary px-6 py-4 font-sans text-xs font-bold uppercase tracking-widest shadow-2xl border border-primary z-[700] flex items-center gap-3 animate-slideDown">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Alterações de credenciais aplicadas e confirmadas!</span>
        </div>
      )}

      {/* Main Settings Modal Box */}
      <div 
        id="settings-modal"
        className="bg-surface-container border border-outline-variant max-w-4xl w-full relative p-6 md:p-8 flex flex-col max-h-[90vh] shadow-2xl overflow-y-auto custom-scrollbar parchment-texture animate-scaleIn"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer w-10 h-10 flex items-center justify-center border border-outline-variant/30 hover:border-primary/50 bg-black/40"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-outline-variant pb-6 mb-8 pr-12">
          <h2 className="font-serif text-3xl text-on-surface font-medium flex items-center gap-2">
            Configurações do Sistema
          </h2>
        </div>

        {/* Modal Body Scroll Content */}
        <div className="space-y-8 flex-1">
          
          {/* Grid Layout: Configs + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (8 cols): Interactive Controls */}
            <div className="lg:col-span-7 space-y-8">

              {/* Subsection: Aparência Visual (Theme Toggle) */}
              <section className="space-y-4 bg-surface-container-low border border-outline-variant/40 p-5 rounded-none">
                <h4 className="font-serif text-base text-primary tracking-widest uppercase flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4.5 h-4.5 text-primary" /> : <Sun className="w-4.5 h-4.5 text-primary" />}
                  TEMA
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Escolha entre dia e noite
                </p>
                
                <div className="flex items-center gap-4 pt-1">
                  
                  {/* Custom Toggle Switch */}
                  <Toggle
                    checked={isDarkMode}
                    onChange={handleToggleTheme}
                    size="lg"
                    iconOn={<Moon className="w-3.5 h-3.5" />}
                    iconOff={<Sun className="w-3.5 h-3.5" />}
                    label={isDarkMode ? 'Noite' : 'Dia'}
                  />
                </div>
              </section>

              {/* Subsection: Dados Cadastrais / Alterar Dados */}
              <section className="space-y-4 bg-surface-container-low border border-outline-variant/40 p-5 rounded-none">
                <h4 className="font-serif text-base text-primary tracking-widest uppercase flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-primary" />
                  Dados de Identidade de Jogador
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-outline-variant/20">
                    <span className="text-outline">Jogador:</span>
                    <span className="text-on-surface font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-outline-variant/20">
                    <span className="text-outline">Identidade (Email):</span>
                    <span className="text-on-surface font-medium truncate max-w-[180px] sm:max-w-xs">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-outline">Chave de Entrada:</span>
                    <span className="text-on-surface font-mono">••••••••</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setTempName(user.name);
                      setTempEmail(user.email);
                      setTempPassword('••••••••');
                      setIsEditUserOpen(true);
                    }}
                    className="w-full bg-surface-container hover:bg-primary-container border border-primary/40 hover:border-primary text-primary hover:text-on-surface font-sans text-xs font-bold py-2.5 tracking-widest uppercase transition-all duration-150 cursor-pointer"
                  >
                    Alterar Dados de Identidade
                  </button>
                </div>
              </section>

            </div>

            {/* Right Column (5 cols): Dynamic Statistics Resume */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container-low border border-outline-variant/40 p-5 rounded-none space-y-5 h-full">
                <span className="font-sans text-[10px] text-primary tracking-widest font-bold uppercase block border-b border-outline-variant/30 pb-2">
                  Selo de Status e Atividade
                </span>

                {/* Big Stat Numbers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background border border-outline-variant/40 p-3 text-center">
                    <span className="block font-serif text-3xl text-on-surface font-bold">{characters.length}</span>
                    <span className="font-sans text-[9px] text-outline font-bold uppercase tracking-wider">Personagens</span>
                  </div>
                  <div className="bg-background border border-outline-variant/40 p-3 text-center">
                    <span className="block font-serif text-3xl text-on-surface font-bold">2</span>
                    <span className="font-sans text-[9px] text-outline font-bold uppercase tracking-wider">Campanhas Ativas</span>
                  </div>
                </div>

                {/* Auxiliary Stats */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-outline-variant/15">
                    <span className="text-on-surface-variant">Anotações Escritas:</span>
                    <span className="text-on-surface font-mono font-bold">{notes.length}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-outline-variant/15">
                    <span className="text-on-surface-variant">Último Rito Escrito:</span>
                    <span className="text-on-surface font-medium max-w-[120px] truncate" title={notes[0]?.meta || "Nenhum"}>
                      {notes[0]?.meta || "Nenhum"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-on-surface-variant">Sistema de Regras:</span>
                    <span className="text-primary font-bold font-sans text-[10px] tracking-wider uppercase truncate max-w-[140px]">{activeSystem}</span>
                  </div>
                </div>

                {/* History of Character Sheet Reviews */}
                <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                  <span className="font-sans text-[9px] text-primary tracking-widest font-bold uppercase block mb-1">
                    Histórico de Pedidos de Análise
                  </span>

                  {characters.length === 0 ? (
                    <p className="text-[11px] text-on-surface-variant italic">Nenhum personagem sob os selos de análise.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                      {characters.map((char) => {
                        const isPending = char.isPendingDMReview;
                        return (
                          <div 
                            key={char.id} 
                            className="bg-background/60 border border-outline-variant/20 p-2 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <span className="font-serif text-xs text-on-surface block font-semibold truncate">{char.name}</span>
                              <span className="font-sans text-[9px] text-on-surface-variant/70 block uppercase tracking-wider">{char.race} • Nível {char.level}</span>
                            </div>
                            <div className="flex items-center shrink-0">
                              {isPending ? (
                                <span className="bg-secondary-container text-on-secondary-container text-[8px] font-bold font-sans uppercase px-2 py-0.5 tracking-wider border border-secondary">
                                  Pendente
                                </span>
                              ) : (
                                <span className="bg-tertiary-container text-on-tertiary-container text-[8px] font-bold font-sans uppercase px-2 py-0.5 tracking-wider border border-tertiary flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5 shrink-0" />
                                  Aprovada
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ================= SECONDARY MODAL: ALTERAR DADOS DO USUÁRIO ================= */}
      {isEditUserOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant max-w-md w-full p-6 shadow-2xl relative">
            
            {/* Secondary Header */}
            <h3 className="font-serif text-xl text-primary font-bold uppercase tracking-wider mb-2">
              Alterar Credenciais
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mb-6 pb-2 border-b border-outline-variant/20">
              Altere os selos fundamentais do seu usuário do clã Daemon.
            </p>

            {/* Input Form */}
            <form onSubmit={handleSaveUserClick} className="space-y-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-wider">
                  Nome do Jogador
                </label>
                <div className="relative border-b border-outline-variant focus-within:border-primary transition-colors py-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-outline-variant shrink-0" />
                  <input
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-transparent border-none text-on-surface text-sm p-0 focus:ring-0 outline-none"
                    placeholder="Nome"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-wider">
                  Endereço de Email
                </label>
                <div className="relative border-b border-outline-variant focus-within:border-primary transition-colors py-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-outline-variant shrink-0" />
                  <input
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full bg-transparent border-none text-on-surface text-sm p-0 focus:ring-0 outline-none"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[10px] font-bold text-outline uppercase tracking-wider">
                  Palavra-Chave (Nova Senha)
                </label>
                <div className="relative border-b border-outline-variant focus-within:border-primary transition-colors py-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-outline-variant shrink-0" />
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full bg-transparent border-none text-on-surface text-sm p-0 focus:ring-0 outline-none"
                    placeholder="Digite a nova senha"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="px-4 py-2 border border-outline text-on-surface text-[10px] uppercase font-sans font-bold hover:bg-surface-container-high cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary text-[10px] uppercase font-sans font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                >
                  Confirmar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= TERTIARY DIALOG: PEDIDO DE CONFIRMAÇÃO ================= */}
      {isConfirmingChange && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[650] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container border border-primary/50 max-w-sm w-full p-6 shadow-2xl relative text-center space-y-4">
            <div className="w-12 h-12 bg-primary-container border border-primary text-primary mx-auto flex items-center justify-center rounded-full">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            
            <h4 className="font-serif text-lg text-on-surface font-bold uppercase tracking-wider">
              Selo de Confirmação
            </h4>
            
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Você tem absoluta certeza de que deseja atualizar suas credenciais de jogador? 
              Seus dados de login serão imediatamente modificados sob o livro de registro.
            </p>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setIsConfirmingChange(false)}
                className="px-4 py-2 border border-outline text-primary-container/80 text-[10px] uppercase font-sans font-bold hover:bg-surface-container-high cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUserChange}
                className="px-5 py-2 bg-primary text-on-primary text-[10px] uppercase font-sans font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
              >
                Sim, Selar Dados
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
