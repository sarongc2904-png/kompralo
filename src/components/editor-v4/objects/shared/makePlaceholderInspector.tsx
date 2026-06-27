'use client';

import type { InspectorProps } from '../../core/editor-types';

/**
 * Factory for placeholder section inspectors.
 * Each section gets its own named component so React DevTools and
 * InspectorManager's humanLabel() show the correct section name.
 */
export function makePlaceholderInspector(label: string) {
  function Inspector({ isMobileSheet }: InspectorProps) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!isMobileSheet && (
          <div style={{ height: 1, background: 'rgba(200,167,93,0.15)' }} />
        )}
        <p style={{ fontSize: 13, color: '#9B8878', lineHeight: 1.6, margin: 0 }}>
          {label} — próximamente
        </p>
      </div>
    );
  }
  Inspector.displayName = label.replace(/\s/g, '') + 'Inspector';
  return Inspector;
}
