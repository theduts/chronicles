import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Note } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ActionButton, SaveButton, AddButton, DeleteButton } from './ActionButtons';

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

interface NotesViewProps {
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onAddNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export default function NotesView({
  notes,
  onSaveNote,
  onAddNote,
  onDeleteNote,
}: NotesViewProps) {

  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isNewNote, setIsNewNote] = useState<boolean>(false);
  const [editorFontSize, setEditorFontSize] = useState<number>(15);

  const editorRef = useRef<HTMLDivElement>(null);



  // Populate editorRef when activeNote opens
  useEffect(() => {
    if (activeNote && editorRef.current) {
      editorRef.current.innerHTML = activeNote.content || '';
    }
  }, [activeNote?.id]);

  const handleCreateNewNote = () => {
    const newId = `note-${Date.now()}`;
    const timestamp = formatDate(new Date());
    const newNote: Note = {
      id: newId,
      meta: timestamp,
      content: '',
      saveBtnId: `save-${newId}`,
    };
    setIsNewNote(true);
    setActiveNote(newNote);
  };

  const handleOpenExistingNote = (note: Note) => {
    setIsNewNote(false);
    setActiveNote(note);
  };

  const handleDeleteConfirm = () => {
    if (!noteToDelete) return;
    onDeleteNote(noteToDelete.id);
    if (activeNote?.id === noteToDelete.id) {
      setActiveNote(null);
      setIsNewNote(false);
    }
    setNoteToDelete(null);
    toast.success('Anotação removida');
  };

  const handleSaveActiveNote = () => {
    if (!activeNote) return;
    const currentHtml = editorRef.current ? editorRef.current.innerHTML : activeNote.content;
    const cleanText = getCleanText(currentHtml).trim();

    if (cleanText.length === 0) {
      if (isNewNote) {
        toast.warning('Anotações sem texto não serão salvas');
        setActiveNote(null);
        setIsNewNote(false);
        return;
      }
    }

    const updatedNote: Note = {
      ...activeNote,
      content: currentHtml,
    };

    if (isNewNote) {
      onAddNote(updatedNote);
    } else {
      onSaveNote(updatedNote);
    }

    setActiveNote(null);
    setIsNewNote(false);
    toast.success('Anotação salva!');
  };

  const handleCloseModal = () => {
    if (!activeNote) return;

    const currentHtml = editorRef.current ? editorRef.current.innerHTML : activeNote.content;
    const cleanText = getCleanText(currentHtml).trim();

    if (isNewNote && cleanText.length === 0) {
      toast.warning('Anotações sem texto não serão salvas');
    }

    setActiveNote(null);
    setIsNewNote(false);
  };

  // Rich text editor command helpers
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, val);
    }
  };

  const handleIncreaseFont = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand('fontSize', false, '5');
    } else {
      setEditorFontSize((prev) => Math.min(28, prev + 2));
    }
  };

  const handleDecreaseFont = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand('fontSize', false, '2');
    } else {
      setEditorFontSize((prev) => Math.max(12, prev - 2));
    }
  };

  // Handle paste to strip external HTML formatting and force local plain text formatting
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Helper to strip HTML tags for clean text snippets if needed
  const getCleanText = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-1">


      {/* Header action panel */}
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 shrink-0 relative z-10">
        <div>
          <h3 className="font-serif text-3xl md:text-4xl text-on-surface font-medium">
            Diário de Aventuras
          </h3>
          <p className="font-sans text-xs text-on-surface-variant/70 mt-1 max-w-lg">
            Mesa de Anotações e Relatos das aventuras
          </p>
        </div>

        <div className="hidden md:flex justify-end shrink-0">
          <AddButton
            onClick={handleCreateNewNote}
            label="Nova anotação"
          />
        </div>
      </div>

      {/* Grid of Square Note Cards */}
      {notes.length === 0 ? (
        <div className="text-center py-24 bg-surface-container/80 border border-dashed border-primary/30 rounded-lg p-8">
          <span className="material-symbols-outlined text-6xl text-primary/40 mb-4">
            menu_book
          </span>
          <h4 className="font-serif text-2xl text-on-surface">Nenhum Relato Gravado</h4>
          <p className="font-sans text-xs text-on-surface-variant max-w-xs mx-auto mt-2">
            Sua mesa está vazia. Clique em "Nova anotação" para registrar suas crônicas e descobertas.
          </p>
          <div className="mt-6 flex justify-center">
            <AddButton
              onClick={handleCreateNewNote}
              label="Criar primeira anotação"
              variant="secondary"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {notes.map((note) => {
            const hasContent = note.content && note.content.trim().length > 0;
            return (
              <div
                key={note.id}
                onClick={() => handleOpenExistingNote(note)}
                style={{
                  backgroundColor: '#d8c4a2',
                  backgroundImage: `url('/images/fundo_notas.webp')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                className="aspect-square w-full rounded-md border border-primary/30 hover:border-primary transition-all p-5 shadow-2xl flex flex-col justify-between relative group cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:-translate-y-1 duration-200 overflow-hidden"
              >
                {/* Note Top Bar */}
                <div className="flex justify-between items-center pb-2 border-b border-primary/20">
                  <span className="font-mono text-[10px] text-[#1e1b1a] font-bold tracking-wider uppercase">
                    {note.meta}
                  </span>
                </div>

                {/* Note Preview Body */}
                <div className="flex-1 my-3 overflow-y-auto text-xs md:text-sm text-[#1e1b1a] leading-relaxed font-sans custom-scrollbar pr-1">
                  {hasContent ? (
                    <div
                      className="prose max-w-none text-xs [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_*]:!bg-transparent [&_*]:!text-[#1e1b1a] text-[#1e1b1a]"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  ) : (
                    <span className="text-[#1e1b1a]/70 italic text-xs">
                      Anotação sem conteúdo. Clique para escrever...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add Button for Mobile */}
      <button
        onClick={handleCreateNewNote}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center shadow-2xl border border-primary/50 z-40 cursor-pointer"
        title="Nova anotação"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {/* Note Full Content & Editing Modal */}
      {activeNote && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-[900] backdrop-blur-md p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container border border-primary/40 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl rounded-none relative"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-surface-container border-b border-primary/20">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                <div>
                  <h3 className="font-serif text-lg text-on-surface font-bold uppercase tracking-wider">
                    {isNewNote ? 'Nova Anotação' : 'Editar Anotação'}
                  </h3>
                  <p className="font-mono text-[10px] text-primary/70">{activeNote.meta}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1"
                title="Fechar sem salvar"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Editing Menu Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 px-6 py-2.5 bg-surface-container border-b border-primary/20 text-on-surface text-xs">
              {/* Bold */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('bold')}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer"
                title="Negrito (Bold)"
              >
                <span className="material-symbols-outlined text-lg">format_bold</span>
              </button>

              {/* Italic */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('italic')}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer"
                title="Itálico"
              >
                <span className="material-symbols-outlined text-lg">format_italic</span>
              </button>

              {/* Underline */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('underline')}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer"
                title="Sublinhado"
              >
                <span className="material-symbols-outlined text-lg">format_underlined</span>
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('strikeThrough')}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer"
                title="Tachado"
              >
                <span className="material-symbols-outlined text-lg">strikethrough_s</span>
              </button>

              <div className="h-4 w-[1px] bg-primary/20 mx-1" />

              {/* Font Size + */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleIncreaseFont}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer flex items-center gap-0.5"
                title="Aumentar Fonte"
              >
                <span className="material-symbols-outlined text-lg">text_increase</span>
              </button>

              {/* Font Size - */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleDecreaseFont}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer flex items-center gap-0.5"
                title="Diminuir Fonte"
              >
                <span className="material-symbols-outlined text-lg">text_decrease</span>
              </button>

              <div className="h-4 w-[1px] bg-primary/20 mx-1" />

              {/* Bullet List */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('insertUnorderedList')}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer"
                title="Lista com marcadores"
              >
                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
              </button>

              {/* Alignments */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('justifyLeft')}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer"
                title="Alinhar à esquerda"
              >
                <span className="material-symbols-outlined text-lg">format_align_left</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('justifyCenter')}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer"
                title="Centralizar"
              >
                <span className="material-symbols-outlined text-lg">format_align_center</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('justifyRight')}
                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded text-sm transition-colors cursor-pointer"
                title="Alinhar à direita"
              >
                <span className="material-symbols-outlined text-lg">format_align_right</span>
              </button>

              <div className="h-4 w-[1px] bg-primary/20 mx-1" />

              {/* Clear format */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd('removeFormat')}
                className="p-1.5 hover:bg-primary/20 hover:text-red-400 rounded text-sm transition-colors cursor-pointer"
                title="Limpar Formatação"
              >
                <span className="material-symbols-outlined text-lg">format_clear</span>
              </button>
            </div>

            {/* Editable Content Area */}
            <div className="p-6 flex-1 overflow-y-auto bg-surface-container">
              <div
                ref={editorRef}
                contentEditable={true}
                onPaste={handlePaste}
                data-placeholder="Escreva sua anotação aqui..."
                style={{ fontSize: `${editorFontSize}px` }}
                className="min-h-[300px] w-full outline-none text-on-surface leading-relaxed font-sans focus:ring-0 custom-scrollbar p-3 bg-surface-container border border-primary/20 rounded caret-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_*]:!bg-transparent [&_*]:!text-on-surface empty:before:content-[attr(data-placeholder)] empty:before:text-on-surface-variant/50 empty:before:pointer-events-none"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className={`px-6 py-4 bg-surface-container border-t border-primary/20 flex items-center w-full ${!isNewNote ? 'justify-between' : 'justify-end'}`}>
              {!isNewNote && (
                <DeleteButton
                  type="button"
                  onClick={() => setNoteToDelete(activeNote)}
                  label="Excluir"
                  variant="danger-ghost"
                />
              )}
              <SaveButton
                type="button"
                onClick={handleSaveActiveNote}
                label="Salvar"
                variant="primary-ghost"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Anotação"
        description="Tem certeza de que deseja remover esta anotação? Esta ação não pode ser desfeita."
        itemPreview={
          noteToDelete
            ? `${getCleanText(noteToDelete.content).substring(0, 50) || 'Anotação sem texto'}...`
            : undefined
        }
      />
    </div>
  );
}

