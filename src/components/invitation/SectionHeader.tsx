import type { Theme } from '@/domain/themes/types';
import React from 'react';
import { EditableText } from '@/components/visual-editor/EditableText';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  theme: Theme;
  className?: string;
  editablePreview?: boolean;
  eyebrowFieldPath?: string;
  titleFieldPath?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  theme,
  className = '',
  editablePreview = false,
  eyebrowFieldPath,
  titleFieldPath,
}: SectionHeaderProps) {
  const showEyebrow = eyebrow || (editablePreview && eyebrowFieldPath);
  const canEditEyebrow = editablePreview && !!eyebrowFieldPath;
  const canEditTitle = editablePreview && !!titleFieldPath;

  return (
    <div data-section-header="" className={`text-center mb-12 select-none ${className}`}>
      {showEyebrow && (
        <p
          className={`text-[11px] sm:text-[13px] uppercase tracking-[0.35em] mb-4 ${theme.accentText} ${theme.bodyFont}`}
          style={{ color: 'var(--v2-color-accent, inherit)', opacity: 0.9 }}
        >
          {canEditEyebrow ? (
            <EditableText
              value={eyebrow ?? ''}
              fieldPath={eyebrowFieldPath!}
              isEditable
              placeholder="Subtítulo decorativo…"
            />
          ) : (
            eyebrow
          )}
        </p>
      )}
      <h3
        className={`font-normal leading-snug tracking-wide ${theme.headingFont} ${theme.bodyText}`}
        style={{
          fontFamily: 'var(--v2-font-heading, inherit)',
          fontSize: 'clamp(2rem, 4vw + 0.5rem, 2.85rem)',
          fontWeight: 'var(--v2-font-heading-weight, 400)',
          color: 'var(--v2-color-text-primary, inherit)',
        }}
      >
        {canEditTitle ? (
          <EditableText
            value={title}
            fieldPath={titleFieldPath!}
            isEditable
            placeholder="Título de sección…"
          />
        ) : (
          title
        )}
      </h3>
      {subtitle && (
        <p
          className={`text-base sm:text-lg mt-2 max-w-md mx-auto italic font-light ${theme.bodyFont}`}
          style={{ color: 'var(--v2-color-text-secondary, inherit)' }}
        >
          {subtitle}
        </p>
      )}

      {/* Ornamental Divider */}
      <div
        className="flex items-center justify-center mt-6 text-amber-800/40"
        style={{ color: 'var(--v2-divider-color, var(--v2-color-accent, inherit))' }}
      >
        <svg className="w-32 h-4" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="8" x2="48" y2="8" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
          <path d="M60 3 L64 8 L60 13 L56 8 Z" fill="currentColor" fillOpacity="0.8" />
          <circle cx="52" cy="8" r="1.5" fill="currentColor" fillOpacity="0.5" />
          <circle cx="68" cy="8" r="1.5" fill="currentColor" fillOpacity="0.5" />
          <line x1="72" y1="8" x2="120" y2="8" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
        </svg>
      </div>
    </div>
  );
}
