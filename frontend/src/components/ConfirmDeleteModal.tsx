import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  itemPreview?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Excluir Item',
  description = 'Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.',
  itemPreview,
  cancelText = 'Cancelar',
  confirmText = 'Remover',
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface-container border border-red-500/40 max-w-sm w-full p-6 space-y-6 shadow-2xl relative rounded-none"
          >
            <div className="text-center space-y-3">
              <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
              <h3 className="font-serif text-lg text-on-surface uppercase tracking-wider">{title}</h3>
              
              {typeof description === 'string' ? (
                 <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                   {description}
                 </p>
              ) : (
                 description
              )}

              {itemPreview && (
                <div className="font-sans text-xs text-on-surface-variant italic bg-surface-container-highest/40 p-3 border border-primary/20 max-w-full truncate text-left mt-4">
                  {itemPreview}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 border border-primary/30 text-[11px] font-sans font-bold uppercase tracking-wider text-primary hover:text-on-surface hover:border-on-surface transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-red-800 hover:bg-red-700 text-on-surface text-[11px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border border-red-500/50 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
