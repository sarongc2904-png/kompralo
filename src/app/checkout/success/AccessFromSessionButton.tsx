'use client';

import { useState } from 'react';

type AccessFromSessionButtonProps = {
  sessionId?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export function AccessFromSessionButton({
  sessionId,
  className,
  style,
  children,
}: AccessFromSessionButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    if (!sessionId) {
      console.error('[AccessFromSessionButton] missing sessionId; falling back to /login');
      window.location.href = '/login';
      return;
    }

    setPending(true);
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
        return;
      }
      console.error('[AccessFromSessionButton] access endpoint failed; falling back to /login', {
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (error) {
      console.error('[AccessFromSessionButton] access request threw; falling back to /login', error);
    }

    window.location.href = '/login';
  }

  return (
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
      {pending ? 'Accediendo…' : children}
    </button>
  );
}
