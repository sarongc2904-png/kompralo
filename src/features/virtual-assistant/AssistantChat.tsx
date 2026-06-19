'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { VirtualAssistantMessage, AssistantSuggestedAction } from './types';
import { AssistantMessage } from './AssistantMessage';
import { AssistantInput } from './AssistantInput';

interface AssistantChatProps {
  messages: VirtualAssistantMessage[];
  input: string;
  isLoading?: boolean;
  onInputChange: (value: string) => void;
  onSend: (text: string) => void;
  onClose: () => void;
  onAction: (action: AssistantSuggestedAction) => void;
}

export function AssistantChat({
  messages,
  input,
  isLoading = false,
  onInputChange,
  onSend,
  onClose,
  onAction,
}: AssistantChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        position:     'fixed',
        bottom:       '92px',
        right:        '16px',
        zIndex:       1040,
        width:        'clamp(300px, calc(100vw - 32px), 380px)',
        maxHeight:    'min(600px, 70vh)',
        background:   '#FFFFFF',
        borderRadius: '14px',
        boxShadow:    '0 8px 40px rgba(26,20,16,0.18)',
        border:       '1px solid #E8E2DA',
        display:      'flex',
        flexDirection: 'column',
        overflow:     'hidden',
        fontFamily:   'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background:  '#1A1410',
          padding:     '14px 16px',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'space-between',
          flexShrink:  0,
        }}
      >
        <div>
          <p
            style={{
              margin:        0,
              fontSize:      '0.875rem',
              fontWeight:    700,
              color:         '#F5EDD8',
              letterSpacing: '0.02em',
            }}
          >
            Asistente KOMPRALO
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#9B8878' }}>
            Te ayudo a elegir y editar tu invitación
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar asistente virtual"
          style={{
            background:    'transparent',
            border:        'none',
            color:         '#9B8878',
            fontSize:      '1.125rem',
            cursor:        'pointer',
            padding:       '4px 8px',
            borderRadius:  '6px',
            lineHeight:    1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages list */}
      <div
        style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '14px 14px 4px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#D4C9BC transparent',
        }}
      >
        {messages.map((msg) => (
          <AssistantMessage key={msg.id} message={msg} onAction={onAction} />
        ))}
        {isLoading && (
          <p
            style={{
              margin: '4px 0 10px',
              color: '#9B8878',
              fontSize: '0.75rem',
            }}
          >
            Escribiendo...
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <AssistantInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        disabled={isLoading}
      />
    </motion.div>
  );
}
