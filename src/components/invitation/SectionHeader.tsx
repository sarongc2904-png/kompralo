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
          className={`uppercase mb-4 ${theme.bodyFont}`}
          style={{ fontSize: 10, letterSpacing: '4px', color: 'var(--v2-color-accent, #c9a84c)' }}
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
          fontFamily: 'var(--v2-font-heading, serif)',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 400,
          color: 'var(--v2-color-text-primary, #2c1810)',
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

      {/* Gold separator */}
      <div style={{ width: 40, height: 1, background: 'var(--v2-color-accent, #c9a84c)', margin: '8px auto 0' }} />
    </div>
  );
}
