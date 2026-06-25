'use client';

import { useState, useEffect } from 'react';

export function ExitIntentModal({ plan }: { plan?: string }) {
  const [show,      setShow]      = useState(false);
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('exit_shown')) return;

    let mouseTimer: ReturnType<typeof setTimeout>;

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20) {
        clearTimeout(mouseTimer);
        mouseTimer = setTimeout(() => setShow(true), 300);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) setShow(true);
    };

    // Only attach listeners after 30s to avoid triggering on fast page visitors
    const readyTimer = setTimeout(() => {
      document.addEventListener('mouseleave', onMouseLeave);
      document.addEventListener('visibilitychange', onVisibilityChange);
    }, 30_000);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(mouseTimer);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  function handleClose() {
    setShow(false);
    sessionStorage.setItem('exit_shown', '1');
  }

  async function handleSave() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/leads/exit-intent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), plan }),
      });
      setSuccess(true);
      sessionStorage.setItem('exit_shown', '1');
    } finally {
      setLoading(false);
    }
  }

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(13,10,7,0.55)',
          zIndex: 9998, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        background: '#FAF7F2', borderRadius: 12,
        padding: '36px 32px', maxWidth: 400, width: 'calc(100vw - 32px)',
        boxShadow: '0 24px 80px rgba(13,10,7,0.3)',
        border: '1px solid #EAD7A3',
      }}>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B4A35', lineHeight: 1 }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 32 }}>🎁</span>
          <h2 style={{ margin: '8px 0 4px', fontSize: '1.25rem', fontWeight: 700, color: '#0D0A07', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
            Espera... antes de irte
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1A1612', lineHeight: 1.55 }}>
            Guarda tu plan y te avisamos si hay una oferta especial. Sin spam, solo lo importante.
          </p>
        </div>

        {success ? (
          <p style={{ textAlign: 'center', color: '#15803D', fontWeight: 600, fontSize: '0.9375rem', margin: 0 }}>
            ✓ ¡Listo! Te avisamos si hay una oferta.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="tu@email.com"
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #EAD7A3', fontSize: 14, background: '#fff', color: '#0D0A07', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !email.trim()}
              style={{
                padding: '12px', borderRadius: 8, border: 'none',
                background: loading ? '#555' : '#0D0A07',
                color: '#F1E3C8', fontSize: '0.9375rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Guardando…' : 'Guardar mi lugar'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              style={{ background: 'none', border: 'none', padding: '4px 0', fontSize: 13, color: '#6B4A35', cursor: 'pointer', textDecoration: 'underline' }}
            >
              No, gracias
            </button>
          </div>
        )}
      </div>
    </>
  );
}
