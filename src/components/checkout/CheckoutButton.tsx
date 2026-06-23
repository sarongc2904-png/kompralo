'use client';

import { useState } from 'react';
import type { ProductId } from '@/domain/products';

export type CheckoutButtonProps = {
  productId: ProductId;
  invitationId?: string;
  className?: string;
  label?: string;
  'data-event'?: string;
};

type State = 'idle' | 'loading' | 'error';

export function CheckoutButton({
  productId,
  invitationId,
  className,
  label = 'Comprar',
  'data-event': dataEvent,
}: CheckoutButtonProps) {
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleClick() {
    setState('loading');
    setErrorMsg(null);

    let data: unknown;

    try {
      const body: Record<string, string> = { productId };
      if (invitationId) body.invitationId = invitationId;

      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      data = await res.json();

      if (!res.ok) {
        const msg =
          data && typeof data === 'object' && 'error' in data
            ? String((data as Record<string, unknown>).error)
            : `Error del servidor (${res.status})`;
        throw new Error(msg);
      }
    } catch (err) {
      if (err instanceof TypeError) {
        // Network failure (no connection, CORS, etc.)
        setErrorMsg('Sin conexión. Verifica tu red e intenta de nuevo.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Error inesperado.');
      }
      setState('error');
      return;
    }

    // Validate the response shape before redirecting.
    if (
      !data ||
      typeof data !== 'object' ||
      !('url' in data) ||
      typeof (data as Record<string, unknown>).url !== 'string'
    ) {
      setErrorMsg('Respuesta inválida del servidor. Intenta de nuevo.');
      setState('error');
      return;
    }

    const { url } = data as { url: string };

    // Redirect to Stripe Checkout — this navigates away, no need to reset state.
    window.location.href = url;
  }

  return (
    <span className="inline-flex flex-col items-stretch gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'loading'}
        className={className}
        data-event={dataEvent}
        style={
          !className
            ? {
                display:       'inline-flex',
                alignItems:    'center',
                justifyContent:'center',
                gap:           '0.375rem',
                padding:       '0.625rem 1.5rem',
                borderRadius:  '0.5rem',
                fontSize:      '0.875rem',
                fontWeight:    600,
                letterSpacing: '0.03em',
                background:    state === 'loading' ? '#3D2B1A' : '#1A1410',
                color:         '#F5F3F0',
                border:        'none',
                cursor:        state === 'loading' ? 'not-allowed' : 'pointer',
                opacity:       state === 'loading' ? 0.7 : 1,
                transition:    'opacity 0.15s, background 0.15s',
                whiteSpace:    'nowrap',
              }
            : undefined
        }
        aria-busy={state === 'loading'}
      >
        {state === 'loading' ? (
          <>
            <span
              style={{
                display:      'inline-block',
                width:        '0.875rem',
                height:       '0.875rem',
                border:       '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation:    'spin 0.6s linear infinite',
              }}
              aria-hidden="true"
            />
            Procesando…
          </>
        ) : (
          label
        )}
      </button>

      {state === 'error' && errorMsg && (
        <span
          style={{
            fontSize:   '0.75rem',
            lineHeight: 1.4,
            color:      '#C62828',
            paddingTop: '0.125rem',
          }}
          role="alert"
        >
          {errorMsg}
        </span>
      )}

      {/* Keyframe for the spinner — injected once per component mount */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
