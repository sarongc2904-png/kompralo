'use client';

import type { DashboardAssistantPromptOption } from './types';

interface DashboardAssistantPromptCardProps {
  option: DashboardAssistantPromptOption;
  disabled?: boolean;
  isSelected?: boolean;
  isGenerating?: boolean;
  onSelect: (option: DashboardAssistantPromptOption) => void;
}

export function DashboardAssistantPromptCard({
  option,
  disabled = false,
  isSelected = false,
  isGenerating = false,
  onSelect,
}: DashboardAssistantPromptCardProps) {
  const isActiveGenerating = isSelected && isGenerating;
  const isActiveDone = isSelected && !isGenerating;

  const borderColor = isActiveGenerating
    ? '#C5A880'
    : isActiveDone
      ? '#C5A880'
      : '#E8E2DA';

  const bgColor = isSelected
    ? '#FDF8F2'
    : disabled
      ? '#F3EFE8'
      : '#FFFFFF';

  return (
    <button
      type="button"
      onClick={() => onSelect(option)}
      disabled={disabled}
      aria-label={`Generar texto: ${option.label}`}
      aria-pressed={isSelected}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '11px 13px',
        borderRadius: '10px',
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '8px',
      }}
      onMouseEnter={(event) => {
        if (disabled || isSelected) return;
        event.currentTarget.style.borderColor = '#C5A880';
        event.currentTarget.style.background = '#FCFAF6';
      }}
      onMouseLeave={(event) => {
        if (disabled || isSelected) return;
        event.currentTarget.style.borderColor = '#E8E2DA';
        event.currentTarget.style.background = '#FFFFFF';
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
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
      </span>

      {/* CTA label */}
      <span
        style={{
          flexShrink: 0,
          fontSize: '0.7rem',
          fontWeight: 700,
          color: isActiveGenerating ? '#C5A880' : '#9B8878',
          letterSpacing: '0.03em',
          paddingTop: '2px',
          whiteSpace: 'nowrap',
        }}
      >
        {isActiveGenerating ? 'Generando…' : isActiveDone ? '✓' : 'Generar →'}
      </span>
    </button>
  );
}
