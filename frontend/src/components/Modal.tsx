import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g., 'max-w-md', 'max-w-2xl', 'max-w-4xl'
  borderColor?: string;
  onSubmit?: (e: React.FormEvent) => void;
  bodyClassName?: string;
  headerRight?: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
  hideCloseButton?: boolean;
  zIndex?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = 'max-w-2xl',
  borderColor = 'border-outline-variant',
  onSubmit,
  bodyClassName = 'space-y-4 flex-1 overflow-y-auto custom-scrollbar px-1 sm:px-2',
  headerRight,
  className = '',
  hideHeader = false,
  hideCloseButton = false,
  zIndex = 'z-[999]',
}: ModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const Container = onSubmit ? motion.form : motion.div;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`fixed inset-0 bg-black/60 backdrop-blur-md ${zIndex} flex items-center justify-center p-2 sm:p-4 overflow-hidden`}
          onClick={(e) => {
            // Close on backdrop click if click target is backdrop
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <Container
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            {...(onSubmit ? { onSubmit: onSubmit as React.FormEventHandler } : {})}
            className={`bg-surface-container border ${borderColor} w-full ${maxWidth} p-3 sm:p-6 space-y-3 sm:space-y-6 shadow-2xl relative max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden ${className}`}
          >
            {/* Floating close button if hideHeader */}
            {hideHeader && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 text-on-surface-variant hover:text-on-surface bg-black/70 hover:bg-black/90 transition-colors p-1.5 rounded-full cursor-pointer border border-outline-variant/40"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Header */}
            {!hideHeader && (
              <div className="flex justify-between items-center border-b border-outline-variant pb-2.5 sm:pb-4 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {icon && <div className="shrink-0 flex items-center justify-center">{icon}</div>}
                  <h3 className="font-serif text-base sm:text-lg text-on-surface uppercase tracking-wider truncate">
                    {title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {headerRight}
                  {!hideCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1 -mr-1 rounded hover:bg-white/5"
                      aria-label="Fechar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Body */}
            <div className={bodyClassName}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-outline-variant shrink-0 w-full">
                {footer}
              </div>
            )}
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
