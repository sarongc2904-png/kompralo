'use client';

import Link from 'next/link';
import type { VirtualAssistantMessage, AssistantSuggestedAction } from './types';

interface AssistantMessageProps {
  message: VirtualAssistantMessage;
  onAction: (action: AssistantSuggestedAction) => void;
}

export function AssistantMessage({ message, onAction }: AssistantMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      style={{
        display:    'flex',
        flexDirection: 'column',
        alignItems: isAssistant ? 'flex-start' : 'flex-end',
        marginBottom: '12px',
      }}
    >
      {/* Bubble */}
      <div
        style={{
          maxWidth:     '85%',
          padding:      '10px 14px',
          borderRadius: isAssistant ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
          background:   isAssistant ? '#F5F0EB' : '#1A1410',
          color:        isAssistant ? '#1A1410' : '#F5EDD8',
          fontSize:     '0.8125rem',
          lineHeight:   1.55,
          whiteSpace:   'pre-wrap',
          wordBreak:    'break-word',
          boxShadow:    '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        {message.content}
      </div>

      {/* Suggested actions */}
      {isAssistant && message.suggestedActions && message.suggestedActions.length > 0 && (
        <div
          style={{
            display:   'flex',
            flexWrap:  'wrap',
            gap:       '6px',
            marginTop: '8px',
            maxWidth:  '90%',
          }}
        >
          {message.suggestedActions.map((a) =>
            a.href ? (
              <Link
                key={a.label}
                href={a.href}
                style={{
                  display:         'inline-block',
                  padding:         '5px 12px',
                  background:      'transparent',
                  border:          '1px solid #C5A880',
                  borderRadius:    '2rem',
                  fontSize:        '0.75rem',
                  color:           '#1A1410',
                  textDecoration:  'none',
                  cursor:          'pointer',
                  whiteSpace:      'nowrap',
                  transition:      'background 0.12s',
                }}
              >
                {a.label}
              </Link>
            ) : (
              <button
                key={a.label}
                onClick={() => onAction(a)}
                style={{
                  display:         'inline-block',
                  padding:         '5px 12px',
                  background:      'transparent',
                  border:          '1px solid #C5A880',
                  borderRadius:    '2rem',
                  fontSize:        '0.75rem',
                  color:           '#1A1410',
                  cursor:          'pointer',
                  whiteSpace:      'nowrap',
                  transition:      'background 0.12s',
                }}
              >
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
