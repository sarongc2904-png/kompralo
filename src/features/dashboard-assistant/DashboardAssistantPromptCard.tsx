'use client';

import type { DashboardAssistantPromptOption } from './types';

interface DashboardAssistantPromptCardProps {
  option: DashboardAssistantPromptOption;
  disabled?: boolean;
  onSelect: (option: DashboardAssistantPromptOption) => void;
}

export function DashboardAssistantPromptCard({
  option,
  disabled = false,
  onSelect,
}: DashboardAssistantPromptCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option)}
      disabled={disabled}
      aria-label={`Generar texto: ${option.label}`}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '11px 12px',
        borderRadius: '10px',
        border: '1px solid #E8E2DA',
        background: disabled ? '#F3EFE8' : '#FFFFFF',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
      }}
      onMouseEnter={(event) => {
        if (disabled) return;
        event.currentTarget.style.borderColor = '#C5A880';
        event.currentTarget.style.background = '#FCFAF6';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = '#E8E2DA';
        event.currentTarget.style.background = disabled ? '#F3EFE8' : '#FFFFFF';
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#1A1410',
          lineHeight: 1.25,
        }}
      >
        {option.label}
      </span>
      <span
        style={{
          display: 'block',
          marginTop: '3px',
          fontSize: '0.75rem',
          color: '#7C6A5C',
          lineHeight: 1.35,
        }}
      >
        {option.description}
      </span>
    </button>
  );
}
