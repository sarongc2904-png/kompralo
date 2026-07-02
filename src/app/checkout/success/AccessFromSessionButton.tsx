'use client';

import { useState } from 'react';

type AccessFromSessionButtonProps = {
  sessionId?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

// The Stripe webhook that creates orders/invitations can lag behind the
// redirect to /checkout/success. These errors mean "not ready yet", not
// "no access" — retry instead of dumping a password-less first-time
// customer on /login.
const RETRYABLE_ERRORS = new Set(['order_not_found', 'invitation_not_ready', 'order_not_paid']);
// 4 reintentos, ventana total de 15s antes de mostrar el aviso.
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000];

const NOT_READY_NOTICE =
  'Tu invitación aún se está preparando. Espera unos segundos y vuelve a intentar, ' +
  'o abre el enlace que te enviamos por correo.';

export function AccessFromSessionButton({
  sessionId,
  className,
  style,
  children,
}: AccessFromSessionButtonProps) {
  const [pending, setPending] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function requestAccess(): Promise<'ok' | 'retry' | 'login'> {
    try {
      const response = await fetch('/api/access/from-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        accessUrl?: string;
        error?: string;
      };

      if (response.ok && data.success && data.accessUrl?.startsWith('/access/consume?token=')) {
        window.location.href = data.accessUrl;
        return 'ok';
      }
      if ((data.error && RETRYABLE_ERRORS.has(data.error)) || response.status >= 500) {
        return 'retry';
      }
      return 'login';
    } catch {
      // Network hiccup — worth retrying before giving up.
      return 'retry';
    }
  }

  async function handleClick() {
    if (pending) return;
    if (!sessionId) {
      window.location.href = '/login';
      return;
    }

    setPending(true);
    setNotice(null);

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      const result = await requestAccess();
      if (result === 'ok') return; // navigating to /access/consume
      if (result === 'login') {
        window.location.href = '/login';
        return;
      }
      if (attempt < RETRY_DELAYS_MS.length) {
        setRetrying(true);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      }
    }

    setNotice(NOT_READY_NOTICE);
    setRetrying(false);
    setPending(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
      <button
        type="button"
        className={className}
        onClick={handleClick}
        disabled={pending}
        style={{
          ...style,
          border: 'none',
          cursor: pending ? 'wait' : 'pointer',
          opacity: pending ? 0.72 : style?.opacity,
        }}
      >
        {pending ? (retrying ? 'Preparando tu invitación…' : 'Accediendo…') : children}
      </button>
      {notice && (
        <p style={{ fontSize: '.78rem', color: '#6B4A35', margin: 0, maxWidth: '20rem', lineHeight: 1.5 }}>
          {notice}
        </p>
      )}
    </div>
  );
}
