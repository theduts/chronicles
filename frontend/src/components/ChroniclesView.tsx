import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Calendar, MapPin, Eye, BookOpen, Clock, Heart, Edit3, Trash2, Upload } from 'lucide-react';
import CustomSelect from './CustomSelect';
import Modal from './Modal';
import { AddButton, SaveButton } from './ActionButtons';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ImageWithFallback from './ImageWithFallback';

const toRoman = (num: number): string => {
  const lookup: [string, number][] = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let roman = '';
  let n = num;
  for (const [letter, value] of lookup) {
    while (n >= value) {
      roman += letter;
      n -= value;
    }
  }
  return roman || 'I';
};

interface ChronicleSession {
  id: string;
  session: string; // e.g. "SESSÃO I"
  title: string;
  location: string;
  date: string;
  desc: string;
  fullText: string;
  image: string;
  danger: 'Baixo' | 'Médio' | 'Alto' | 'Extremo';
  majorEvent: string;
}

const INITIAL_CHRONICLES: ChronicleSession[] = [
  {
    id: 'chronicle-1',
    session: 'SESSÃO I',
    title: 'A Queda de Aethelgard',
    location: 'REINO EM CHAMAS',
    date: '20 de Março, 1542',
    desc: 'Uma crônica de fogo e traição que mudou o curso da história humana no continente de Occultus, guardada sob pergaminhos profanos.',
    fullText: 'O céu cobriu-se de escuro e brasas quando as catapultas romperam os muros orientais de Aethelgard. Enquanto chamas devoravam os antigos salões, os heróis se depararam com um dilema impossível: as chaves secretas do Grimório Arcano jaziam trancadas nos cofres em chamas, cercadas pela infantaria inimiga, enquanto o povoado gritava por ajuda na ala norte. Decididos, Malphas usou de suas artes de trevas para despistar os guardas, permitindo que o grupo resgatasse dezenas de refugiados, mas o preço foi alto: o rito sob as cinzas rúnicas foi completado pelo inimigo...',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E',
    danger: 'Extremo',
    majorEvent: 'Invasão e destruição do império oriental de Aethelgard'
  },
  {
    id: 'chronicle-2',
    session: 'SESSÃO II',
    title: 'Sussurros da Névoa',
    location: 'FLORESTA DE OCCULTUS',
    date: '28 de Março, 1542',
    desc: 'Adentrando a densa névoa eterna de Occultus, os heróis depararam-se com visões bizarras do passado e precisaram decifrar ritos antigos.',
    fullText: 'A travessia pela floresta nunca fora tão traiçoeira. Uma névoa densa demais para ser natural cobriu os caminhos, sussurrando segredos enterrados e traumas antigos de cada aventureiro. Quando todos já estavam à beira da loucura devido às alucinações de entes perdidos, um portal rúnico composto de pedras de obsidian se ergueu. Através de um complexo enigma de espelhos de luz rúnica projetada por magia elemental, o grupo desvendou que o verdadeiro perigo não era a névoa, mas a projeção de suas próprias mentes fragmentadas...',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApHZvY37Hs1hVLXx0XzG8rFUpHmP5wdHVCSCCkr16Rkz56fZNUIdTmgjbdiL8LJbmVM-nzqyfxDiBeEq-Aq-7ztUz4lZFoyfOgRqQFO4URtVRZvdQAe9T9bOPd3j5nPVWjZ58FrCTHu9omekQxSbMiZ2lIiU2Kd2FA9yjC69WUd9WLm4-idR4gIcZWkYBpB5Y73Hb8uzeEInjO55GfBBHyBGY-DNkIatnnsmXy6HoodYkElB1O758CwNr4QDk6EAljAprNw0EhNKU',
    danger: 'Médio',
    majorEvent: 'Abertura do Portal de Obsidian elemental'
  },
  {
    id: 'chronicle-3',
    session: 'SESSÃO III',
    title: 'O Enigma de Obsidian',
    location: 'CRIPTA PROFANA',
    date: '05 de Abril, 1542',
    desc: 'O resgate desesperado dentro da cripta esquecida e o primeiro encontro direto com o misterioso Pacto da Serpente de Sangue.',
    fullText: 'Nos confins subterrâneos da cripta profana, onde o ar fedia a enxofre e magia estagnada, os heróis confrontaram os acólitos do Pacto da Serpente. Em meio a lutas desesperadas sobre passarelas estreitas de pedra, o inimigo desencadeou uma armadilha tóxica que selou as saídas. Com astúcia e sacrifício físico, o guerreiro Malphas aguentou o impacto direto de uma lâmina envenenada rúnica, garantindo tempo para que o mago conjurasse uma explosão de dispersão arcana. O grupo conseguiu escapar com o artefato de obsidian, porém a infecção agora corre em suas veias...',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH02OPokynjplaAoYJ5Dh_mYVv9kxVNgs9GieyHtShVvopAbzKMJG-C8c0yhJgCROG1bkCaS9w-7iasUIrTnJf-DfK2cDZg9b8zP_2IGFOpWJsMHtB2HMKnXtSJr6FZlGrARVDI14wQPtIELkJghHXYacTrlRJCaNWT_KyDyr6cCK4LOGIie2DVGGnFf_w6KO5wCvw0oNAh407zMeCt5yO9NPob94UWsBR3ygCWTnxapKIeLuSQOUwOQE-NFsCdo-SJM4I25nHctk',
    danger: 'Alto',
    majorEvent: 'Recuperação do Amuleto Sagrado e envenenamento'
  },
  {
    id: 'chronicle-4',
    session: 'SESSÃO IV',
    title: 'O Pacto de Cinzas',
    location: 'MONTANHA RÚNICA',
    date: '12 de Abril, 1542',
    desc: 'Buscando uma cura para a infecção arcana, o bando ascende o Pico das Lamentações em busca do Altar Rúnico Ancestral.',
    fullText: 'As nevascas cortantes do Pico das Lamentações quase congelaram os corações dos heróis. No topo congelado, o altar cintilava sob a pálida luz luar. Para purificar o sangue infectado de Malphas, Garrick sacrificou suas próprias bênçãos de proteção contra o fogo, tecendo uma ponte espiritual rúnica. Sob a vigília das estátuas que sussurravam escárnios, uma entidade de pura brasa ancestral manifestou-se, exigindo juramentos de sangue. A infecção foi contida, mas as cinzas agora residem em suas almas.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E',
    danger: 'Alto',
    majorEvent: 'Purificação em cinzas do sangue corrompido'
  },
  {
    id: 'chronicle-5',
    session: 'SESSÃO V',
    title: 'A Praga Silenciosa',
    location: 'TAVERNA DO VELHO GALDOR',
    date: '19 de Abril, 1542',
    desc: 'O retorno à civilização é cortado por uma epidemia sombria na taverna da vila rústica sob a luz carmesim.',
    fullText: 'A Taverna do Velho Galdor não era mais o porto seguro que lembravam. Seus frequentadores jaziam caídos, com as veias brilhando em luz carmesim. Investigando os fundos, Elaris encontrou o poço d\'água local selado com runas corrompidas do Pacto da Serpente de Sangue. Enquanto o grupo preparava um elixir de ervas puritana rúnica sob ataque constante de camponeses ensandecidos pela febre, a besta bípede imunda do esgoto atacou a estalagem. O dia foi salvo pela contenção do poço, mas a peste alasta-se pelas cercanias.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E',
    danger: 'Baixo',
    majorEvent: 'Descoberta do plano de infecção e peste das runas carmesins'
  },
  {
    id: 'chronicle-6',
    session: 'SESSÃO VI',
    title: 'O Grimório Libertado',
    location: 'ESTRADA DA PONTE DE FERRO',
    date: '26 de Abril, 1542',
    desc: 'Em perseguição ao livro levitante de feitiços de Necromancia, os aventureiros armam uma emboscada letal à beira do abismo.',
    fullText: 'O Grimório Fugitivo flutuava como uma ave de couro e dentes, rasgando o próprio ar com sussurros em dialeto Abissal. No arco estreito da Estrada da Ponte de Ferro, o grupo construiu uma teia de correntes e âncoras rúnicas. Quando as sombras goblins de emboscada caíram sobre o bando, a ponte tornou-se um palco de chamas e fúria física. Elaris disparou uma flecha aprisionadora infundida com essência alquímica, capturando o livro instantes antes dele desaparecer em um abismo de desfiladeiro. O livro agora urge em murmúrios aprisionado no baú de Garrick.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH02OPokynjplaAoYJ5Dh_mYVv9kxVNgs9GieyHtShVvopAbzKMJG-C8c0yhJgCROG1bkCaS9w-7iasUIrTnJf-DfK2cDZg9b8zP_2IGFOpWJsMHtB2HMKnXtSJr6FZlGrARVDI14wQPtIELkJghHXYacTrlRJCaNWT_KyDyr6cCK4LOGIie2DVGGnFf_w6KO5wCvw0oNAh407zMeCt5yO9NPob94UWsBR3ygCWTnxapKIeLuSQOUwOQE-NFsCdo-SJM4I25nHctk',
    danger: 'Alto',
    majorEvent: 'Aprisionamento do Grimório de Necromancia Proibido'
  },
  {
    id: 'chronicle-7',
    session: 'SESSÃO VII',
    title: 'O Banquete dos Condenados',
    location: 'CORTE DE FERRO',
    date: '03 de Maio, 1542',
    desc: 'Infiltremos a corte imperial de máscaras na colina rúnica para desvencilhar quem é o traidor corruptor de Aethelgard.',
    fullText: 'Vestidos com veludo de farsa e máscaras de bronze rúnico, os aventureiros entraram no solar de inverno de Lorde Sterling. No grande salão rúnico iluminado por lareiras imponentes, a nobreza dançava fingindo ignorar o declínio do mundo. Através de sussurros, roubos silenciosos de cartas secretas e pura perícia de intriga de Elaris, a farsa foi desfeita: Lorde Sterling era a cabeça do Pacto da Serpente na província, usando o sangue dos refugiados de Aethelgard para comprar sua própria longevidade. O desfecho violento que se seguiu deixou a corte em cinzas e o grupo como fugitivos da lei imperial.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApHZvY37Hs1hVLXx0XzG8rFUpHmP5wdHVCSCCkr16Rkz56fZNUIdTmgjbdiL8LJbmVM-nzqyfxDiBeEq-Aq-7ztUz4lZFoyfOgRqQFO4URtVRZvdQAe9T9bOPd3j5nPVWjZ58FrCTHu9omekQxSbMiZ2lIiU2Kd2FA9yjC69WUd9WLm4-idR4gIcZWkYBpB5Y73Hb8uzeEInjO55GfBBHyBGY-DNkIatnnsmXy6HoodYkElB1O758CwNr4QDk6EAljAprNw0EhNKU',
    danger: 'Extremo',
    majorEvent: 'Queda do Lorde Sterling e fuga como renegados do Império'
  }
];

interface ChroniclesViewProps {
  userRole?: 'player' | 'dm';
  onNavigateToHistory?: () => void;
}

export default function ChroniclesView({ userRole = 'player', onNavigateToHistory }: ChroniclesViewProps) {
  const [chronicles, setChronicles] = useState<ChronicleSession[]>(() => {
    try {
      const saved = localStorage.getItem('daemon_chronicles_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_CHRONICLES;
    } catch (e) {
      console.error('Error parsing chronicles from localStorage:', e);
      return INITIAL_CHRONICLES;
    }
  });

  const [search, setSearch] = useState('');
  const [selectedChronicle, setSelectedChronicle] = useState<ChronicleSession | null>(null);
  const [showLoreModal, setShowLoreModal] = useState(false);
  
  // New Chronicle Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newFullText, setNewFullText] = useState('');
  const [newImage, setNewImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E');

  // Success Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit/Delete State
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<Partial<ChronicleSession>>({});
  const [chronicleToDelete, setChronicleToDelete] = useState<ChronicleSession | null>(null);

  const hasChanges = isEditing && selectedChronicle && (
    editingData.title !== selectedChronicle.title ||
    editingData.location !== selectedChronicle.location ||
    editingData.date !== selectedChronicle.date ||
    editingData.majorEvent !== selectedChronicle.majorEvent ||
    editingData.fullText !== selectedChronicle.fullText ||
    editingData.image !== selectedChronicle.image
  );

  const handleSaveEdit = () => {
    if (!selectedChronicle || !hasChanges) return;
    
    const updated = {
      ...selectedChronicle,
      ...editingData,
      desc: editingData.fullText && editingData.fullText.length > 200 
        ? `${editingData.fullText.slice(0, 197)}...` 
        : (editingData.fullText || selectedChronicle.desc)
    } as ChronicleSession;

    setChronicles(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedChronicle(updated);
    setIsEditing(false);
    setToastMessage(`A crônica "${updated.title}" foi atualizada.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [pendingMoveDirection, setPendingMoveDirection] = useState<'forward' | 'backward' | null>(null);

  const handleMoveChronicle = (direction: 'forward' | 'backward') => {
    if (!selectedChronicle) return;
    setPendingMoveDirection(direction);
  };

  const confirmMoveChronicle = () => {
    if (!selectedChronicle || !pendingMoveDirection) return;
    
    setChronicles(prev => {
      const idx = prev.findIndex(c => c.id === selectedChronicle.id);
      if (idx === -1) return prev;
      
      const newArr = [...prev];
      if (pendingMoveDirection === 'forward' && idx < prev.length - 1) { 
        const temp = newArr[idx];
        newArr[idx] = newArr[idx + 1];
        newArr[idx + 1] = temp;
      } else if (pendingMoveDirection === 'backward' && idx > 0) { 
        const temp = newArr[idx];
        newArr[idx] = newArr[idx - 1];
        newArr[idx - 1] = temp;
      } else {
        return prev;
      }

      const reindexed = newArr.map((c, i) => ({ ...c, session: `SESSÃO ${toRoman(i + 1)}` }));
      
      const updatedItem = reindexed.find(c => c.id === selectedChronicle.id);
      if (updatedItem) {
        setTimeout(() => {
          setSelectedChronicle(updatedItem);
          if (isEditing) {
              setEditingData(prevData => ({ ...prevData, session: updatedItem.session }));
          }
        }, 0);
      }

      return reindexed;
    });
    setPendingMoveDirection(null);
  };

  const handleDeleteConfirm = () => {
    if (chronicleToDelete) {
      setChronicles(prev => {
        const filtered = prev.filter(c => c.id !== chronicleToDelete.id);
        return filtered.map((c, idx) => ({ ...c, session: `SESSÃO ${toRoman(idx + 1)}` }));
      });
      setToastMessage(`A crônica "${chronicleToDelete.title}" foi apagada dos registros.`);
      setTimeout(() => setToastMessage(null), 3000);
      setChronicleToDelete(null);
      if (selectedChronicle?.id === chronicleToDelete.id) {
        setSelectedChronicle(null);
        setIsEditing(false);
      }
    }
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('daemon_chronicles_list', JSON.stringify(chronicles));
  }, [chronicles]);

  const autoSessionLabel = `SESSÃO ${toRoman(chronicles.length + 1)}`;

  const handleCreateChronicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLocation || !newDate || !newFullText) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const derivedDesc = newFullText.length > 200 ? `${newFullText.slice(0, 197)}...` : newFullText;

    const newChronicle: ChronicleSession = {
      id: `chronicle-${Date.now()}`,
      session: autoSessionLabel,
      title: newTitle,
      location: newLocation.toUpperCase(),
      date: newDate,
      desc: derivedDesc,
      fullText: newFullText,
      image: newImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E',
      danger: 'Médio',
      majorEvent: 'Relato de aventura'
    };

    setChronicles((prev) => [...prev, newChronicle]);
    setShowCreateModal(false);
    
    // Clear Form Fields
    setNewTitle('');
    setNewLocation('');
    setNewDate('');
    setNewFullText('');
    setNewImage('https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E');
    
    // Toast confirmation
    setToastMessage(`A crônica "${newTitle}" foi registrada nos tomos.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // handleDeleteChronicle removed as chronicles are no longer deletable via the cards

  // Filter implementation
  const filteredChronicles = chronicles.filter((chronicle) => {
    const matchesSearch = 
      chronicle.title.toLowerCase().includes(search.toLowerCase()) ||
      chronicle.desc.toLowerCase().includes(search.toLowerCase()) ||
      chronicle.session.toLowerCase().includes(search.toLowerCase()) ||
      chronicle.location.toLowerCase().includes(search.toLowerCase()) ||
      chronicle.fullText.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  const reversedChronicles = [...filteredChronicles].reverse();

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-1 animate-fadeIn text-on-surface">
      {/* Visual background overlays */}
      <div className="absolute right-10 top-20 w-80 h-80 bg-primary-container/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Toast Notification */}
      {toastMessage && (
        <div id="chronicle-toast" className="fixed top-20 right-4 sm:right-8 bg-primary-container text-on-primary-container px-4 sm:px-6 py-3 sm:py-4 font-sans text-xs font-bold uppercase tracking-widest shadow-2xl border border-primary z-[999] animate-bounce max-w-[90vw] text-center">
          {toastMessage}
        </div>
      )}

      {/* Header section with styling integrated */}
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 shrink-0 relative z-10">
        <div>
          <h3 className="font-serif text-3xl md:text-4xl text-on-surface font-medium">
            Crônicas
          </h3>
          <p className="font-sans text-xs text-on-surface-variant/70 mt-1 max-w-lg">
            Os registros de sua mesa de jogo, acompanhando a evolução dos atos, combates e perigos que forjaram o destino de sua party.
          </p>
        </div>

        {userRole === 'dm' && (
          <div className="hidden md:flex justify-end shrink-0">
            <AddButton
              onClick={() => setShowCreateModal(true)}
              label="Registrar Crônica"
            />
          </div>
        )}
      </div>

      {/* Floating Add Button for Mobile */}
      {userRole === 'dm' && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="md:hidden fixed bottom-[-8px] right-6 w-14 h-14 bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center shadow-2xl border border-primary/50 z-40 cursor-pointer"
          title="Registrar Crônica"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      )}

      {/* História - Lore Card */}
      <div 
        id="campaign-lore-card" 
        onClick={() => {
          if (onNavigateToHistory) {
            onNavigateToHistory();
          } else {
            setShowLoreModal(true);
          }
        }}
        className="relative w-full bg-surface-container border border-outline-variant parchment-texture shadow-2xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:border-primary/60 hover:bg-surface-container relative z-10 min-h-[180px] sm:min-h-[200px] cursor-pointer"
      >
        {/* Lore Cover Illustration banner */}
        <div className="w-full md:w-1/3 h-40 sm:h-48 md:h-auto relative overflow-hidden shrink-0">
          <ImageWithFallback
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E"
            alt="Lore de Occultus"
            className="w-full h-full object-cover dark:brightness-75 transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Lore Text Content */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col justify-center space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-5 h-5 text-primary animate-pulse shrink-0" />
              <h4 className="font-serif text-lg sm:text-xl md:text-2xl text-on-surface font-medium tracking-wide group-hover:text-primary transition-colors truncate">
                História: O Crepúsculo de Occultus
              </h4>
            </div>
            
            <div className="flex items-center gap-1.5 text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-mono font-bold tracking-widest shrink-0">
              <span>LER MAIS</span>
              <span className="material-symbols-outlined text-[10px] animate-bounce-horizontal">arrow_forward</span>
            </div>
          </div>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed text-justify">
            O continente de <strong>Occultus</strong> amarga sob a sombra do <strong>Pacto da Serpente de Sangue</strong> desde a queda de <em>Aethelgard</em>. Forças profanas rastejam livremente através de florestas eternas de névoa e criptas antigas. No limiar da loucura, heróis enfrentam não apenas criaturas abomináveis, mas o declínio de sua própria sanidade sob a pálida lua rúnica. <em>Clique para desvendar o relato ancestral completo da campanha.</em>
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-[10px] font-mono text-on-surface-variant/60">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              Cenário: Fantasia Sombria / Terror Daemon
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Atos I a III Ativos</span>
          </div>
        </div>
      </div>

      {/* Search and Filters utility bar */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        {/* Search Input */}
        <div className="flex-1 flex items-center bg-surface-container-low border border-outline-variant px-3.5 sm:px-4 py-2.5 focus-within:border-primary transition-all relative">
          <Search className="w-4 h-4 text-on-surface-variant/70 mr-2.5 shrink-0" />
          <input
            type="text"
            maxLength={50}
            placeholder="Pesquisar crônicas por título, local, relatos, segredos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="`${newTitle.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} bg-transparent border-none outline-none text-xs w-full  placeholder:-variant/40 font-sans min-w-0 pr-12`"
          />
          <div className={`absolute right-8 text-[9px] font-mono ${search.length >= 50 ? 'text-red-500' : 'text-on-surface-variant/50'}`}>
            {search.length}/50
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-on-surface-variant/60 hover:text-on-surface text-xs font-bold ml-2 cursor-pointer shrink-0"
            >
              LIMPAR
            </button>
          )}
        </div>
      </div>

      {/* Grid containing Cards layout matching the design patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        {reversedChronicles.length === 0 ? (
          <div className="col-span-full text-center py-16 sm:py-24 bg-surface-container-low border border-dashed border-outline-variant parchment-texture flex flex-col items-center justify-center p-4">
            <span className="material-symbols-outlined text-5xl sm:text-6xl text-on-surface-variant opacity-30 mb-4 animate-pulse">
              auto_stories
            </span>
            <h4 className="font-serif text-lg sm:text-xl text-on-surface">Nenhum Registro Encontrado</h4>
            <p className="font-sans text-xs text-on-surface-variant max-w-sm mt-2 leading-relaxed">
              Não existem registros de crônicas rúnicas que correspondam aos filtros de pesquisa selecionados no momento.
            </p>
          </div>
        ) : (
          reversedChronicles.map((chronicle) => {
            return (
              <div
                key={chronicle.id}
                onClick={() => setSelectedChronicle(chronicle)}
                className="group relative bg-surface-container border border-outline-variant hover:border-primary/60 transition-all duration-300 flex flex-col justify-between parchment-texture shadow-2xl overflow-hidden cursor-pointer h-auto min-h-[400px] sm:h-[440px]"
              >
                {/* Banner Thumbnail Treatment */}
                <div className="h-36 sm:h-40 relative overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={chronicle.image}
                    alt={chronicle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    fallbackText={chronicle.title}
                  />
                  
                  {/* Absolute Badge Session Overlays */}
                  <div className="absolute top-3 left-3 bg-black/70 border border-[#dd9281]/40 px-2 py-1">
                    <span className="font-mono text-[9px] font-bold text-[#dd9281] tracking-widest">{chronicle.session}</span>
                  </div>

                  {/* Hover book read symbol indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 border border-[#fbb1a9]/40 p-2 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#fbb1a9] text-sm">auto_stories</span>
                  </div>
                </div>

                {/* Content body layout */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Location line header */}
                    <div className="flex items-center gap-1.5 text-on-surface-variant/60 text-[9px] font-bold tracking-widest uppercase mb-1.5">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{chronicle.location}</span>
                    </div>

                    <h4 className="font-serif text-base sm:text-lg text-on-surface font-bold tracking-wide group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {chronicle.title}
                    </h4>

                    {/* Brief description */}
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                      {chronicle.desc}
                    </p>
                  </div>

                  {/* Highlights section inside card */}
                  <div className="border-t border-outline-variant/30 pt-3 mt-auto space-y-2">
                    <div className="flex items-start gap-1.5 justify-start text-left">
                      <span className="font-sans text-[9px] font-bold text-primary tracking-widest uppercase shrink-0 mt-0.5">Missão:</span>
                      <span className="font-sans text-[10px] text-on-surface-variant/80 italic line-clamp-1">{chronicle.majorEvent}</span>
                    </div>

                    {/* Footer specs of card list */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant/50 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary/70 shrink-0" />
                        <span>{chronicle.date}</span>
                      </div>

                      <div className="flex items-center gap-1 text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                        <span className="font-sans text-[9px] font-bold tracking-widest uppercase">LER MAIS</span>
                        <BookOpen className="w-3 h-3 shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Reader Detail Modal with overlay animation matching the dashboard */}
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
              className="bg-surface-container border border-outline-variant max-w-2xl w-full max-h-[85vh] flex flex-col justify-start relative select-text shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedChronicle(null);
                    setIsEditing(false);
                  }}
                  className="text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9]"
                  title="Fechar"
                >
                  <span className="material-symbols-outlined text-sm text-[#fbb1a9]">close</span>
                </button>
                {userRole === 'dm' && (
                  <>
                    {isEditing && (
                      <>
                        <button
                          onClick={() => handleMoveChronicle('backward')}
                          className="text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9]"
                          title="Mover para trás no tempo"
                        >
                          <span className="material-symbols-outlined text-sm text-[#fbb1a9]">arrow_back</span>
                        </button>
                        <button
                          onClick={() => handleMoveChronicle('forward')}
                          className="text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9]"
                          title="Mover para frente no tempo"
                        >
                          <span className="material-symbols-outlined text-sm text-[#fbb1a9]">arrow_forward</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                        } else {
                          setEditingData(selectedChronicle);
                          setIsEditing(true);
                        }
                      }}
                      className={`text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border ${isEditing ? 'border-[#fbb1a9] bg-black/60' : 'border-[#fbb1a9]/30 hover:border-[#fbb1a9]'}`}
                      title={isEditing ? 'Cancelar Edição' : 'Editar'}
                    >
                      <span className="material-symbols-outlined text-sm text-[#fbb1a9]">edit</span>
                    </button>
                    <button
                      onClick={() => setChronicleToDelete(selectedChronicle)}
                      className="text-[#fbb1a9] hover:text-red-400 transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-red-400"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-sm text-[#fbb1a9]">delete</span>
                    </button>
                    {isEditing && (
                      <button
                        onClick={handleSaveEdit}
                        className={`transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/50 hover:border-[#fbb1a9] ${!hasChanges ? 'text-[#fbb1a9]/40 opacity-50 cursor-not-allowed' : 'text-[#fbb1a9] hover:text-[#fbb1a9]'}`}
                        disabled={!hasChanges}
                        title="Salvar Alterações"
                      >
                        <span className="material-symbols-outlined text-sm text-[#fbb1a9]">save</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Cover Banner inside reader detail modal */}
              <div className="h-44 shrink-0 relative overflow-hidden">
                <ImageWithFallback
                  src={isEditing ? (editingData.image || selectedChronicle.image) : selectedChronicle.image}
                  alt={isEditing ? editingData.title : selectedChronicle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  fallbackText={isEditing ? editingData.title : selectedChronicle.title}
                />
                <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-surface-container dark:via-surface-container/40 to-transparent"></div>
                
                {isEditing && (
                  <div className="absolute top-4 left-6 flex items-center gap-2 bg-black/60 border border-outline-variant/30 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest shrink-0">CAPA:</span>
                    <label className="text-on-surface-variant hover:text-on-surface flex items-center cursor-pointer transition-colors shrink-0 px-2 border-r border-outline-variant/30" title="Upload Imagem">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setEditingData(prev => ({ ...prev, image: reader.result as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <div className="w-full">
              <input
                        type="text"
                        maxLength={500}
                        placeholder="URL da imagem..."
                        value={editingData.image?.startsWith('data:') ? '' : (editingData.image || '')}
                        onChange={(e) => setEditingData(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full bg-white/95 text-zinc-900 placeholder:text-zinc-500 font-sans text-xs border border-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary w-40 min-w-[120px]"
                      />
              <div className={`text-right mt-1 text-[9px] font-mono ${(editingData.image && !editingData.image.startsWith('data:') ? editingData.image.length : 0) >= 500 ? 'text-red-500' : 'text-zinc-400'}`}>
                {editingData.image && !editingData.image.startsWith('data:') ? editingData.image.length : 0}/500
              </div>
            </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-6 right-20">
                  {isEditing ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="relative w-full max-w-[200px]">
                          <input
                            type="text"
                            maxLength={50}
                            value={editingData.location || ''}
                            onChange={(e) => setEditingData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="LOCALIZAÇÃO"
                            className="font-mono text-[9px] tracking-widest text-on-surface font-bold block uppercase bg-black/40 border border-outline-variant/30 px-2 py-1 w-full pr-12"
                          />
                          <div className={`absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono ${(editingData.location || '').length >= 50 ? 'text-red-500' : 'text-on-surface-variant/70'}`}>
                            {(editingData.location || '').length}/50
                          </div>
                        </div>
                        <span className="font-mono text-[9px] tracking-widest text-on-surface font-bold block uppercase">• {selectedChronicle.session}</span>
                      </div>
                      <div className="w-full">
              <input
                          type="text"
                          maxLength={50}
                          value={editingData.title || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Título da Sessão"
                          className="font-serif text-2xl md:text-3xl text-on-surface font-bold leading-tight bg-black/40 border border-outline-variant/30 px-2 py-1 w-full"
                        />
              <div className={`text-right mt-1 text-[9px] font-mono ${(editingData.title || '').length >= 50 ? 'text-red-500' : 'text-on-surface-variant/70'}`}>
                {(editingData.title || '').length}/50
              </div>
            </div>
                    </div>
                  ) : (
                    <>
                      <span className="font-mono text-[9px] tracking-widest text-on-surface font-bold block uppercase">
                        {selectedChronicle.location} • {selectedChronicle.session}
                      </span>
                      <h4 className="font-serif text-2xl md:text-3xl text-on-surface font-bold leading-tight mt-1">
                        {selectedChronicle.title}
                      </h4>
                    </>
                  )}
                </div>
              </div>

              {/* Reader detailed text area */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pb-2 border-b border-outline-variant/30">
                  <span className="text-primary font-bold tracking-widest">RELATO COMPLETO DE SESSÃO</span>
                  {isEditing ? (
                    <div className="mr-12 sm:mr-16 relative">
                      <input
                        type="text"
                        maxLength={50}
                        value={editingData.date || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev, date: e.target.value }))}
                        placeholder="Data"
                        className="bg-surface-container border border-outline-variant/30 px-2 py-1 text-right w-36 pr-10 focus:border-primary focus:outline-none"
                      />
                      <div className={`absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono ${(editingData.date || '').length >= 50 ? 'text-red-500' : 'text-on-surface-variant/70'}`}>
                        {(editingData.date || '').length}/50
                      </div>
                    </div>
                  ) : (
                    <span>{selectedChronicle.date}</span>
                  )}
                </div>
                
                {/* Visual metadata breakdown stats */}
                <div className="bg-surface-container px-4 py-3 border border-outline-variant/20 text-left flex flex-col gap-1">
                  <span className="block font-sans text-[8px] text-on-surface-variant/50 font-bold tracking-widest uppercase">Missão</span>
                  {isEditing ? (
                    <div className="relative w-full">
                      <input
                        type="text"
                        maxLength={50}
                        value={editingData.majorEvent || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev, majorEvent: e.target.value }))}
                        placeholder="Missão / Evento Principal"
                        className="font-sans text-xs text-on-surface font-bold mt-0.5 block bg-black/40 border border-outline-variant/30 px-3 py-1.5 w-full pr-12 focus:border-primary focus:outline-none"
                      />
                      <div className={`absolute right-2 top-1/2 -translate-y-1/2 mt-[1px] text-[8px] font-mono font-normal ${(editingData.majorEvent || '').length >= 50 ? 'text-red-500' : 'text-on-surface-variant/70'}`}>
                        {(editingData.majorEvent || '').length}/50
                      </div>
                    </div>
                  ) : (
                    <span className="font-sans text-xs text-on-surface font-bold mt-0.5 block">{selectedChronicle.majorEvent}</span>
                  )}
                </div>

                {/* Dropcap paragraph story text styled beautifully */}
                {isEditing ? (
                  <textarea
                    value={editingData.fullText || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev, fullText: e.target.value }))}
                    placeholder="Diário de relato detalhado..."
                    className="w-full font-serif text-sm md:text-base leading-relaxed text-on-surface bg-surface-container border border-outline-variant/30 p-4 min-h-[200px] custom-scrollbar focus:border-primary focus:outline-none resize-y"
                  />
                ) : (
                  <p className="font-serif text-base leading-relaxed text-on-surface select-text first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-2">
                    {selectedChronicle.fullText}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lore Detail Modal */}
      <AnimatePresence>
        {showLoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowLoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface-container border border-outline-variant max-w-2xl w-full max-h-[85vh] flex flex-col justify-start relative select-text shadow-2xl parchment-texture"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoreModal(false)}
                className="absolute top-4 right-4 text-[#fbb1a9] hover:text-[#fbb1a9] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-black/40 border border-[#fbb1a9]/30 hover:border-[#fbb1a9] z-10"
              >
                <span className="material-symbols-outlined text-sm text-[#fbb1a9]">close</span>
              </button>

              {/* Cover Banner */}
              <div className="h-44 shrink-0 relative overflow-hidden">
                <ImageWithFallback
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApaoQQsXhFuJ7cnHYim1KAq_ihU2Sf_xG5CGjFEPgNbhiuPsddO96GWeZbOWMENEh5vNo9hBtlfWmRgQPhRtv5jxPFTbN5uyXeZ4upiymyfffad_QDcNvScGlT_8wY0rCE3FfRShqdcJQVPTHEmOYoVObV49PN2V5LgIncvPaxsJSorBU3jFWhZDeZkimJ5F3OBeN8ZV3Dio3Kby7oJK-Ey4wbx3Y_eayiVvFs8RKdviqwJ42g3eL3IbehJn2PWPa2cpxK4qYGy4E"
                  alt="Lore de Occultus"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-surface-container via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 pl-6 bg-[#F5F2EB]/20 dark:bg-transparent backdrop-blur-sm dark:backdrop-blur-none">
                  <span className="font-mono text-[9px] tracking-widest text-primary font-bold block uppercase">
                    CODEX ANCESTRAL • LORE DA CAMPANHA
                  </span>
                  <h4 className="font-serif text-2xl md:text-3xl text-on-surface font-bold leading-tight mt-1">
                    O Crepúsculo de Occultus
                  </h4>
                </div>
              </div>

              {/* Reader detailed text area */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-left">
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pb-2 border-b border-outline-variant/30">
                  <span className="text-primary font-bold tracking-widest">COSMOLOGIA & MITOLOGIA</span>
                  <span className="text-amber-500/80 font-bold">DAEMON RPG</span>
                </div>
                
                {/* Visual metadata breakdown stats */}
                <div className="grid grid-cols-2 gap-4 bg-surface-container px-4 py-3 border border-outline-variant/20 text-left">
                  <div>
                    <span className="block font-sans text-[8px] text-on-surface-variant/50 font-bold tracking-widest uppercase">Nome da Campanha</span>
                    <span className="font-sans text-xs text-on-surface font-bold mt-0.5 block">O Crepúsculo de Occultus</span>
                  </div>
                  <div>
                    <span className="block font-sans text-[8px] text-on-surface-variant/50 font-bold tracking-widest uppercase">Mestre do Jogo (DM)</span>
                    <span className="font-sans text-xs text-on-surface font-bold mt-0.5 block">Mestre Murilo Dutra</span>
                  </div>
                </div>

                {/* Full history text */}
                <div className="space-y-4 font-serif text-sm md:text-base leading-relaxed text-on-surface select-text">
                  <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-2 text-justify">
                    O continente de <strong>Occultus</strong>, outrora banhado pela pálida luz divina e protegido por imponentes e inquebráveis muralhas rúnicas, agora amarga sob a sombra enigmática e insidiosa do <strong>Pacto da Serpente de Sangue</strong>. Desde a fatídica queda de <em>Aethelgard</em> — o bastião oriental da humanidade que ruiu sob catapultas de chamas mágicas e ritos profanos —, as forças do abismo rastejam livremente através de florestas eternas de névoa, pântanos ácidos e criptas outrora esquecidas pela civilização.
                  </p>
                  <p className="text-justify">
                    Diários perdidos de antigos sacerdotes revelam rituais sombrios, infecções arcanas que pulsam lentamente nos poços das vilas sob a pálida luz rúnica do céu noturno, e grimórios banidos de necromancia que clamam e sussurram por libertação nos sonhos dos mortais. No limiar da loucura que assola a mente de quem adentra estas terras, guerreiros honrados, patrulheiros da névoa e sacerdotes das sombras se unem em uma resistência desesperada. Eles enfrentam não apenas as bestas abomináveis do submundo, mas também o declínio inexorável de sua própria sanidade.
                  </p>
                  <p className="text-justify">
                    Dizem os rumores antigos que o Pacto foi selado nos salões inferiores da fortaleza de <em>Obsidian</em>, onde o sangue de reis traidores foi derramado para despertar uma divindade primordial adormecida nas entranhas da terra. Agora, os deuses parecem surdos às preces rúnicas, e o destino deste mundo jaz escrito em pergaminhos de cinza e brasa. O futuro aguarda que a fagulha derradeira da força de vontade de bravos aventureiros resista ao juízo final, selando as fendas abissais ou sucumbindo de vez à corrupção eterna.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creation/Registration Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Registrar Nova Crônica"
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        maxWidth="max-w-xl"
        onSubmit={handleCreateChronicle}
        footer={
          <div className="flex justify-end w-full">
            <SaveButton
              type="submit"
              label="Salvar"
              variant="primary-ghost"
            />
          </div>
        }
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Registre uma nova sessão da crônica para o diário da campanha.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto-incremental Session field */}
            <div>
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Sessão</label>
              <input
                type="text"
                readOnly
                disabled
                value={autoSessionLabel}
                className="w-full bg-surface-container/50 border border-outline-variant text-primary font-bold text-sm px-3.5 py-2.5 opacity-80 cursor-not-allowed rounded-none"
              />
            </div>

            {/* Title */}
            <div>
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Título da Sessão *</label>
              <div className="w-full">
              <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. O Guardião das Trevas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none"
                />
              {newTitle.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Localização *</label>
              <div className="w-full">
              <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. CATACUMBAS DE ARKANUN"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="`${newLocation.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {newLocation.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
            </div>

            {/* Date */}
            <div>
              <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Data de Aventura *</label>
              <div className="w-full">
              <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. 10 de Maio, 1542"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="`${newDate.length >= 50 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                />
              {newDate.length >= 50 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (50)
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Banner Image URL + Upload */}
          <div>
            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
              Ilustração da Crônica
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="w-full">
              <input
                    type="text"
                    maxLength={500}
                    placeholder="https://exemplo.com/imagem.jpg ou faça upload"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="`${newImage.length >= 500 ? '!text-red-500 focus:!text-red-500 !font-bold' : 'text-on-surface'} w-full bg-surface-container border border-outline-variant  text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none`"
                  />
              {newImage.length >= 500 && (
                <div className="text-right mt-1 text-[10px] font-medium text-red-500/80">
                  Limite atingido (500)
                </div>
              )}
            </div>
                <label className="bg-surface-container border border-outline-variant hover:border-primary text-on-surface-variant hover:text-on-surface px-4 py-2.5 flex items-center gap-2 cursor-pointer text-xs font-bold uppercase transition-all shrink-0">
                  <Upload className="w-4 h-4 text-primary" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setNewImage(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {newImage && (
                <div className="relative w-full h-28 border border-outline-variant overflow-hidden bg-black/40">
                  <ImageWithFallback
                    src={newImage}
                    alt="Pré-visualização da Ilustração"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 border border-outline-variant px-2 py-0.5 text-[9px] font-mono font-bold text-primary">
                    Pré-visualização
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Text area */}
          <div>
            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Diário de Relato Detalhado *</label>
            <textarea
              required
              rows={6}
              placeholder="e.g. Diário completo documentando toda a jornada detalhada para o mestre e os jogadores..."
              value={newFullText}
              onChange={(e) => setNewFullText(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant text-on-surface text-sm px-3.5 py-2.5 focus:outline-none focus:border-primary rounded-none custom-scrollbar"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!chronicleToDelete}
        onClose={() => setChronicleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Apagar Crônica"
        description="Tem certeza que deseja apagar este relato dos tomos? Esta ação não poderá ser desfeita."
        itemPreview={chronicleToDelete ? `${chronicleToDelete.session}: ${chronicleToDelete.title}` : undefined}
      />

      <ConfirmDeleteModal
        isOpen={!!pendingMoveDirection}
        onClose={() => setPendingMoveDirection(null)}
        onConfirm={confirmMoveChronicle}
        title="Alterar Cronologia"
        description="Isso vai mexer na cronologia das sessões! Tem certeza que deseja continuar?"
        cancelText="Cancelar"
        confirmText="Confirmar"
      />
    </div>
  );
}
