import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Character, Note, ActiveScreen } from '../types';
import ImageWithFallback from './ImageWithFallback';
import { useIsDark, getChronicleFallbackImage } from '../hooks/useIsDark';
import { toRoman, formatDisplayDate, type ChronicleSession } from './ChroniclesView';
import { useChroniclesQuery } from '../hooks/useChroniclesMutations';

interface DashboardViewProps {
  characters: Character[];
  notes: Note[];
  setActiveScreen: (screen: ActiveScreen) => void;
  setCharacterUnderEditId: (id: string | null) => void;
  userRole?: 'player' | 'dm';
  onApproveCharacter?: (id: string) => void;
  activeCampaign?: any;
  campaignId?: string;
}

export default function DashboardView({
  characters,
  notes,
  setActiveScreen,
  setCharacterUnderEditId,
  userRole = 'player',
  onApproveCharacter,
  activeCampaign,
  campaignId,
}: DashboardViewProps) {
  const [paraX, setParaX] = useState(0);
  const [paraY, setParaY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isDark = useIsDark();

  const effectiveCampaignId = activeCampaign?.id || campaignId;
  const { data: dbChronicles = [] } = useChroniclesQuery(effectiveCampaignId);

  // Local fallback state (used when offline or without active campaignId)
  const [localChronicles] = useState<ChronicleSession[]>(() => {
    try {
      const saved = localStorage.getItem('daemon_chronicles_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && c.id && !c.id.startsWith('chronicle-'));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Source of truth: Server state when effectiveCampaignId is present (Rule 9)
  const chronicles: ChronicleSession[] = React.useMemo(() => {
    if (!effectiveCampaignId) return localChronicles;
    return dbChronicles.map((c) => ({
      id: c.id,
      session: `SESSÃO ${toRoman(c.sessionNumber)}`,
      rawSessionNumber: c.sessionNumber,
      title: c.title,
      location: c.location || '',
      date: formatDisplayDate(c.sessionDate),
      desc: c.narrative && c.narrative.length > 200 ? `${c.narrative.slice(0, 197)}...` : c.narrative,
      fullText: c.narrative,
      image: (c as any).illustrationUrl || (c as any).ilustration_url || (c as any).illustration_url || '',
      danger: 'Médio',
      majorEvent: c.mission || 'Relato de aventura'
    }));
  }, [effectiveCampaignId, dbChronicles, localChronicles]);

  const [selectedChronicle, setSelectedChronicle] = useState<ChronicleSession | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [allFeedbacks, setAllFeedbacks] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('fichanator_feedbacks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const latestChronicle = chronicles.length > 0 ? chronicles[chronicles.length - 1] : null;

  const slides = [
    {
      welcome: activeCampaign?.universo || "Bem vindo, aventureiro",
      title: activeCampaign?.name || "História",
      subtitle: activeCampaign?.subtitulo || "Os contos incríveis e fantásticos",
      description: activeCampaign?.lore || "Os mares ecoam os bradares dos antigos. A terra clama o sangue daqueles que se acovardam. Levantem vossas espadas e assoprem a poeira de seus grimórios! A aventura esta ao passo de quem busca pelo que vale a pena morrer por.",
      image: activeCampaign?.ilustracao || activeCampaign?.illustrationUrl || activeCampaign?.ilustration_url || "/images/history.webp",
    },
    {
      welcome: latestChronicle ? latestChronicle.session : "Resumo da Sessão",
      title: latestChronicle ? latestChronicle.title : "No último capítulo...",
      subtitle: latestChronicle?.location ? `Em ${latestChronicle.location}` : "Um relato escrito em tinta e sangue",
      description: latestChronicle ? (latestChronicle.desc || latestChronicle.fullText) : "Acompanhe o que aconteceu na última sessão através dos relatos dos bardos poetas que contarão suas histórias e crônicas de geração em geração que hão de vir.",
      image: latestChronicle?.image || getChronicleFallbackImage(isDark),
    },
    {
      welcome: "",
      title: "Quadro de contratos",
      subtitle: "",
      description: "Viajantes, mercenários, assassinos e vagabundos. Procurando dinheiro extra? Nós temos trabalhos!",
      image: isDark ? "/images/contract_board - escuro.webp" : "/images/contract_board - claro.webp",
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const activeSlide = slides[currentSlide];

  const handleMouseMove = (e: React.MouseEvent) => {
    const amount = 15;
    const x = (e.clientX / window.innerWidth - 0.5) * amount;
    const y = (e.clientY / window.innerHeight - 0.5) * amount;
    setParaX(x);
    setParaY(y);
  };

  const bannerShadowStyle: React.CSSProperties = {
    color: '#ffffff',
    textShadow: '0 0 10px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 0, 0, 0.5)',
  };

  const glassmorphismStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 20px',
    color: '#ffffff',
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    borderRadius: '12px',
    boxShadow: '0 0 15px 10px rgba(0, 0, 0, 0.3)',
  };

  return (
    <div className="space-y-12 pb-24" onMouseMove={handleMouseMove}>
      {/* Hero Welcome Section - forced dark mode text styling for carousel readability */}
      <section className="dark relative w-full min-h-[580px] shrink-0 border-b border-outline-variant transition-all duration-300">
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={activeSlide.image}
              alt={activeSlide.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 scale-[1.08] dark:mix-blend-luminosity"
              style={{
                transform: `scale(1.1) translate(${paraX}px, ${paraY}px)`,
                backgroundColor: isDark ? '#3b2f17' : '#d8c4a2',
              }}
            />
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {currentSlide > 0 && (
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-2 sm:-left-5 max-sm:top-auto max-sm:bottom-14 max-sm:translate-y-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-surface hover:bg-surface-container-highest text-on-surface hover:text-on-surface rounded-full shadow-lg z-40 transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-[#8C7A65]/20"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentSlide < slides.length - 1 && (
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-2 sm:-right-5 max-sm:top-auto max-sm:bottom-14 max-sm:translate-y-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-surface hover:bg-surface-container-highest text-on-surface hover:text-on-surface rounded-full shadow-lg z-40 transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-[#8C7A65]/20"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div className="relative min-h-[580px] flex flex-col justify-center sm:justify-end items-center sm:items-start p-8 md:p-12 z-20 pt-24 text-center sm:text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl pointer-events-auto w-full flex flex-col items-center sm:items-start p-2 sm:p-4 rounded-xl"
            >
              <div
                style={glassmorphismStyle}
                className="mb-6 flex flex-col items-center sm:items-start text-white"
              >
                {activeSlide.welcome && (
                  <span className="font-sans text-xs font-bold tracking-[0.2em] block mb-3 uppercase text-amber-200/90">
                    {activeSlide.welcome}
                  </span>
                )}
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-2 leading-tight font-bold">
                  {activeSlide.title}
                </h1>
                {activeSlide.subtitle && (
                  <div className="font-serif text-lg md:text-xl text-amber-200/90 italic mb-4 font-semibold tracking-wider font-medium">
                    {activeSlide.subtitle}
                  </div>
                )}
                <p
                  className="font-sans text-sm md:text-base text-white/90 max-w-xl leading-relaxed opacity-90 mx-auto sm:mx-0 line-clamp-3"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeSlide.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center sm:justify-start items-center">
                {currentSlide === 0 && (
                  <button
                    onClick={handleNextSlide}
                    className="px-6 py-3 bg-primary text-on-primary font-sans text-xs font-bold uppercase tracking-wider transition-all hover:bg-primary/90 active:scale-95 duration-150 cursor-pointer border border-transparent shadow-md"
                  >
                    CONTINUAR AVENTURA
                  </button>
                )}
                
                {currentSlide === 2 ? (
                  <button
                    onClick={() => setActiveScreen('campaign_history')}
                    className="px-6 py-3 bg-black/30 hover:bg-black/50 text-white border border-white/40 font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-95 duration-150 backdrop-blur-md cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    title="Vasculhar Contratos na História"
                  >
                    <span className="text-white">VASCULHAR CONTRATOS</span>
                    <span className="material-symbols-outlined text-xs text-white">search</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveScreen('chronicles')}
                    className="px-6 py-3 bg-black/30 hover:bg-black/50 text-white border border-white/40 font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-95 duration-150 backdrop-blur-md cursor-pointer shadow-md"
                  >
                    LER REGISTROS
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-12 h-1 transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'bg-primary w-16' : 'bg-surface-container hover:bg-[#6A6A6A]'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Epic Artwork Gallery / Netflix Style Chronicles Row */}
      <section className="px-0 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col mb-8 px-6 sm:px-0 text-center sm:text-left">
          <h3 className="font-serif text-2xl md:text-3xl text-on-surface font-medium">
            Crônicas
          </h3>
          <p className="font-sans text-xs text-on-surface-variant/70 mt-1">
            Histórico das Sessões
          </p>
        </div>

        {/* Horizontal Netflix-style scrollable queue */}
        <div className="relative">
          {chronicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container border border-dashed border-outline-variant text-center max-w-2xl mx-auto">
              <BookOpen className="w-12 h-12 text-outline-variant mb-4" />
              <h4 className="text-on-surface font-serif text-xl mb-2">Nenhuma crônica registrada</h4>
              <p className="text-on-surface-variant text-xs mb-6 max-w-md">
                As páginas desta campanha ainda estão em branco. Comece a documentar as aventuras para que elas ecoem pela eternidade.
              </p>
              {userRole === 'dm' && (
                <button
                  onClick={() => setActiveScreen('chronicles')}
                  className="px-6 py-3 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Criar a Primeira Crônica
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory custom-scrollbar pt-1">
              {[...chronicles].reverse().map((chronicle) => (
                <div
                  key={chronicle.id}
                  onClick={() => setSelectedChronicle(chronicle)}
                  className="w-[220px] sm:w-[320px] md:w-[380px] lg:w-[425px] shrink-0 snap-start relative overflow-hidden group h-[320px] sm:h-[240px] md:h-[260px] lg:h-[290px] border border-outline-variant hover:border-primary/60 transition-all duration-300 cursor-pointer rounded-sm"
                >
                  <ImageWithFallback
                    alt={chronicle.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={chronicle.image || getChronicleFallbackImage(isDark)}
                    fallbackText={chronicle.title}
                  />

                  {/* Hover book read symbol indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 border border-[#fbb1a9]/40 p-2 rounded-full flex items-center justify-center z-20">
                    <span className="material-symbols-outlined text-[#fbb1a9] text-sm">auto_stories</span>
                  </div>

                  {/* Bottom Content with Liquid Glass and Fade Out top */}
                  <div 
                    className="absolute bottom-0 left-0 p-4 sm:p-5 pt-16 w-full flex flex-col justify-end z-10"
                    style={{
                      background: 'rgba(20, 20, 22, 0.65)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      maskImage: 'linear-gradient(to top, black 75%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to top, black 75%, transparent 100%)',
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1">
                      <span className="text-micro sm:text-micro font-mono tracking-widest font-bold text-[#dd9281]">
                        {chronicle.session}
                      </span>
                      <span className="text-white/60 text-micro sm:text-micro">•</span>
                      <span className="text-micro sm:text-micro font-sans font-bold tracking-widest text-[#dd9281]/80 uppercase">
                        {chronicle.location}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm sm:text-lg text-white font-semibold group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-1 drop-shadow-md">
                      {chronicle.title}
                    </h4>
                    <p className="text-white/90 text-micro sm:text-caption mt-1 line-clamp-4 sm:line-clamp-2 leading-relaxed font-sans font-medium drop-shadow">
                      {chronicle.desc}
                    </p>
                  </div>
                </div>
              ))}

              {/* 4th Card: "Ver todas as crônicas" */}
              <div
                onClick={() => setActiveScreen('chronicles')}
                className="w-[220px] sm:w-[320px] md:w-[380px] lg:w-[425px] shrink-0 snap-start relative overflow-hidden group h-[320px] sm:h-[240px] md:h-[260px] lg:h-[290px] border border-dashed border-outline-variant hover:border-primary transition-all duration-300 cursor-pointer bg-surface-container flex flex-col items-center justify-center p-4 sm:p-6 text-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-outline-variant group-hover:border-primary/50 flex items-center justify-center mb-4 transition-colors bg-surface-container-low duration-300">
                  <span className="material-symbols-outlined text-primary text-lg sm:text-xl font-bold group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <h4 className="font-serif text-sm sm:text-lg text-on-surface font-bold tracking-wider group-hover:text-primary transition-colors">
                  Ver todas as Crônicas
                </h4>
                <p className="text-on-surface-variant/60 text-micro sm:text-caption mt-1 max-w-[140px] sm:max-w-[200px] font-sans">
                  Acesse as sessões passadas
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Updates section */}
      <section className="px-0 sm:px-6 md:px-12 max-w-2xl mx-auto w-full">
        <div className="bg-surface-container border-y sm:border border-outline-variant p-6 flex flex-col parchment-texture">
          <h5 className="font-sans text-micro text-on-surface-variant font-bold tracking-widest mb-6 uppercase text-center sm:text-left">
            UPDATES MESSAGES
          </h5>

          <div className="flex-1 space-y-6">
            <div className="flex gap-4 group hover:bg-surface-container-high/45 p-2 transition-all">
              <div className="w-10 h-10 bg-surface-container-high shrink-0 flex items-center justify-center border border-outline-variant">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  campaign
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface font-serif">
                  Release note
                </p>
                <p className="text-caption text-on-surface-variant mt-1 font-sans leading-relaxed">
                  Olá aventureiro! Bem vindo ao Chronicles. Espero que goste do site! Sinta-se a vontade pra dar feedbacks!
                </p>
                <span className="text-micro text-on-surface-variant/50 font-mono mt-1 block uppercase">
                  ONTEM
                </span>
              </div>
            </div>
          </div>

          {showFeedbackForm ? (
            <div className="mt-6 pt-4 border-t border-outline-variant/30 space-y-3">
              {feedbackSent ? (
                <p className="text-xs text-primary font-medium text-center py-2 font-mono">
                  Obrigado pelo seu feedback! Ele foi registrado com sucesso.
                </p>
              ) : (
                <>
                  <div className="w-full">
              <textarea
                      maxLength={300}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Deixe seu feedback aqui..."
                      className="`${feedbackText.length >= 300 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full h-20 bg-background border border-outline-variant p-2 text-xs  focus:outline-none focus:border-primary resize-none font-sans`"
                    />
              {feedbackText.length >= 300 && (
                <div className="text-right mt-1 text-micro font-medium text-red-500/80">
                  Limite atingido (300)
                </div>
              )}
            </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-3 py-1 border border-outline text-on-surface text-micro uppercase font-bold hover:bg-surface-container-high cursor-pointer font-sans"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (feedbackText.trim()) {
                          setFeedbackSent(true);
                          const existingFeedbacks = JSON.parse(localStorage.getItem('fichanator_feedbacks') || '[]');
                          const entry = { text: feedbackText, date: new Date().toISOString() };
                          existingFeedbacks.push(entry);
                          localStorage.setItem('fichanator_feedbacks', JSON.stringify(existingFeedbacks));
                          setAllFeedbacks(existingFeedbacks);
                          setTimeout(() => {
                            setFeedbackSent(false);
                            setFeedbackText("");
                            setShowFeedbackForm(false);
                          }, 2500);
                        }
                      }}
                      className="px-3 py-1 bg-primary text-on-primary text-micro uppercase font-bold hover:bg-surface-container-highest hover:text-on-surface cursor-pointer font-sans"
                    >
                      Enviar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
               onClick={() => setShowFeedbackForm(true)}
               className="mt-6 px-4 py-1.5 border border-outline text-on-surface font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#e5e2e1] hover:text-background transition-all cursor-pointer w-fit mx-auto"
            >
              Feedback
            </button>
          )}
        </div>
      </section>

      {/* Chronicle Details Reader Modal */}
      <AnimatePresence>
        {selectedChronicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedChronicle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface-container border border-outline-variant max-w-2xl w-full max-h-[85vh] flex flex-col justify-start relative select-text"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedChronicle(null)}
                className="absolute top-4 right-4 text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9] z-10"
              >
                <span className="material-symbols-outlined text-sm text-[#fbb1a9]">close</span>
              </button>

              <div className="h-44 shrink-0 relative overflow-hidden">
                <ImageWithFallback
                  src={selectedChronicle.image}
                  alt={selectedChronicle.title}
                  className="w-full h-full object-cover"
                  fallbackText={selectedChronicle.title}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none opacity-80"></div>
                <div 
                  className="absolute bottom-0 left-0 right-0 p-4 pl-6 pt-16 flex flex-col justify-end z-10"
                  style={{
                    background: 'rgba(20, 20, 22, 0.65)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    maskImage: 'linear-gradient(to top, black 70%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 70%, transparent 100%)',
                  }}
                >
                  <span className="font-mono text-micro tracking-widest text-white/90 font-bold block uppercase drop-shadow-md">
                    {selectedChronicle.location} • {selectedChronicle.session}
                  </span>
                  <h4 className="font-serif text-2xl md:text-3xl text-white font-bold leading-tight mt-1 drop-shadow-lg">
                    {selectedChronicle.title}
                  </h4>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pb-2 border-b border-outline-variant/30">
                  <span className="text-primary font-bold">RELATO DE AVENTURA</span>
                  <span>{selectedChronicle.date}</span>
                </div>
                <p className="font-serif text-base leading-relaxed text-on-surface select-text first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-2">
                  {selectedChronicle.fullText}
                </p>
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedChronicle(null);
                      setActiveScreen('chronicles');
                    }}
                    className="px-4 py-2 bg-transparent border border-outline-variant text-micro uppercase font-sans font-bold text-on-surface hover:text-primary hover:border-primary transition-colors cursor-pointer"
                  >
                    Ver todas as Crônicas
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
