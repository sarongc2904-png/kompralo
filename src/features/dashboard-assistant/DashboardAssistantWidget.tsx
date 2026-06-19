'use client';

import { useEffect, useState } from 'react';
import { DashboardAssistantPanel } from './DashboardAssistantPanel';
import type { DashboardAssistantEventType } from './types';

type DashboardAssistantWidgetProps = {
  enabledForPlan: boolean;
  eventType?: DashboardAssistantEventType;
  pathname?: string;
};

export function DashboardAssistantWidget({
  enabledForPlan,
  eventType = 'wedding',
  pathname,
}: DashboardAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!enabledForPlan) return null;

  return (
    <>
      {isOpen && (
        <DashboardAssistantPanel
          eventType={eventType}
          pathname={pathname}
          onClose={() => setIsOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? 'Cerrar asistente de textos' : 'Abrir asistente de textos'}
        style={{
          position: 'fixed',
          right: '18px',
          bottom: '22px',
          zIndex: 1050,
          border: '1px solid #C5A880',
          background: '#1A1410',
          color: '#F5EDD8',
          borderRadius: '999px',
          padding: '11px 15px',
          boxShadow: '0 10px 28px rgba(26,20,16,0.26)',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontWeight: 700,
          letterSpacing: '0',
          lineHeight: 1,
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        {isOpen ? 'Cerrar' : 'Ayuda para textos'}
      </button>
    </>
  );
}
