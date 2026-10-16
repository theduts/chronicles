import React from 'react';
import { motion } from 'motion/react';

interface ModalOverlayProps {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

/**
 * Backdrop padrão para modais ad-hoc: fade-in/fade-out igual ao <Modal />.
 * Deve ser renderizado dentro de <AnimatePresence> para animar a saída.
 * O painel filho recebe a animação de entrada via a classe `modal-overlay` (index.css).
 */
export default function ModalOverlay({ className = '', onClick, children }: ModalOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={`modal-overlay ${className}`}
    >
      {children}
    </motion.div>
  );
}
