'use client';

import { motion } from 'framer-motion';

interface AssistantBubbleProps {
  isOpen: boolean;
  onClick: () => void;
}

export function AssistantBubble({ isOpen, onClick }: AssistantBubbleProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={isOpen ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      style={{
        position:        'fixed',
        bottom:          '24px',
        right:           '24px',
        zIndex:          1050,
        width:           '56px',
        height:          '56px',
        borderRadius:    '50%',
        background:      '#1A1410',
        border:          '2px solid #C5A880',
        boxShadow:       '0 4px 20px rgba(26,20,16,0.35)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        cursor:          'pointer',
        outline:         'none',
        transition:      'background 0.15s',
      }}
    >
      <span
        style={{ fontSize: '22px', lineHeight: 1, userSelect: 'none' }}
        aria-hidden="true"
      >
        {isOpen ? '✕' : '💬'}
      </span>
    </motion.button>
  );
}
