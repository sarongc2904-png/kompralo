'use client';

import type { KeyboardEvent } from 'react';

interface AssistantInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function AssistantInput({ value, onChange, onSend, disabled = false }: AssistantInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  }

  return (
    <div
      style={{
        display:       'flex',
        gap:           '8px',
        padding:       '12px 14px',
        borderTop:     '1px solid #E8E2DA',
        background:    '#FFFFFF',
        borderRadius:  '0 0 14px 14px',
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Escribe tu mensaje"
        placeholder={disabled ? 'Escribiendo...' : 'Escribe tu mensaje...'}
        style={{
          flex:         1,
          padding:      '8px 12px',
          border:       '1px solid #D4C9BC',
          borderRadius: '8px',
          fontSize:     '0.8125rem',
          color:        '#1A1410',
          background:   disabled ? '#F3EFE8' : '#FAFAF8',
          outline:      'none',
          fontFamily:   'system-ui, sans-serif',
        }}
      />
      <button
        onClick={() => onSend(value)}
        aria-label="Enviar mensaje"
        disabled={disabled || !value.trim()}
        style={{
          padding:      '8px 14px',
          background:   !disabled && value.trim() ? '#1A1410' : '#D4C9BC',
          color:        !disabled && value.trim() ? '#F5EDD8' : '#9B8878',
          borderRadius: '8px',
          border:       'none',
          fontSize:     '0.8125rem',
          fontWeight:   600,
          cursor:       !disabled && value.trim() ? 'pointer' : 'not-allowed',
          transition:   'background 0.15s',
          whiteSpace:   'nowrap',
          flexShrink:   0,
        }}
      >
        Enviar
      </button>
    </div>
  );
}
