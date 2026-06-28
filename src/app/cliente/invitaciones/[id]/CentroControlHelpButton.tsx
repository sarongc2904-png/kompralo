'use client';

import React, { useState } from 'react';
import { CentroControlHelpModal } from './CentroControlHelpModal';

export function CentroControlHelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button
        id="centro-control-help-btn"
        type="button"
        onClick={() => setShowHelp(true)}
        aria-label="Guía del Centro de Control"
        title="Guía del Centro de Control"
        style={{
          width: 28, height: 28,
          borderRadius: '50%',
          border: '1.5px solid #E5D2A8',
          background: 'transparent',
          color: '#7A6A5B',
          fontSize: 13, fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'border-color .15s, color .15s',
        }}
        onMouseEnter={e => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = '#C9A84C';
          btn.style.color = '#C9A84C';
        }}
        onMouseLeave={e => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = '#E5D2A8';
          btn.style.color = '#7A6A5B';
        }}
      >
        ?
      </button>

      {showHelp && (
        <CentroControlHelpModal onClose={() => setShowHelp(false)} />
      )}
    </>
  );
}
