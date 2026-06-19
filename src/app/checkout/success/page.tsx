import type { Metadata } from 'next';
import Link from 'next/link';
import { SupabaseOrderRepository } from '@/domain/orders';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Pago exitoso — Kompralo' };

// ─── Order lookup (best-effort — never throws to the user) ───────────────────

interface OrderSummary {
  planId:        string;
  invitationId:  string | null;
  amountTotal:   number;
  currency:      string;
  customerEmail: string | null;
}

async function tryGetOrder(sessionId: string | undefined): Promise<OrderSummary | null> {
  if (!sessionId) return null;
  try {
    const supabase   = createServiceRoleSupabaseClient();
    const orderRepo  = new SupabaseOrderRepository(supabase);
    const order      = await orderRepo.getBySessionId(sessionId);
    if (!order) return null;
    return {
      planId:        order.planId,
      invitationId:  order.invitationId,
      amountTotal:   order.amountTotal,
      currency:      order.currency,
      customerEmail: order.customerEmail,
    };
  } catch {
    return null;
  }
}

function formatPrice(centavos: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style:    'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(centavos / 100);
}

const planLabels: Record<string, string> = {
  basic:    'Basic',
  gold:     'Premium',
  platinum: 'Deluxe',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const order = await tryGetOrder(session_id);

  return (
    <main
      style={{
        minHeight:      '100dvh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#F5F0EB',
        padding:        '2rem 1rem',
        fontFamily:     'var(--font-inter, system-ui, sans-serif)',
        textAlign:      'center',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>🎉</div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1410', margin: '0 0 0.5rem' }}>
        ¡Pago recibido!
      </h1>

      {order ? (
        <>
          <p style={{ color: '#6B5B4E', fontSize: '1rem', lineHeight: 1.6, maxWidth: '28rem', margin: '0 0 0.5rem' }}>
            Plan <strong>{planLabels[order.planId] ?? order.planId}</strong> activado por{' '}
            <strong>{formatPrice(order.amountTotal, order.currency)}</strong>.
          </p>

          {/* Magic link instruction */}
          <div
            style={{
              margin:       '1rem auto 1.75rem',
              maxWidth:     '26rem',
              background:   '#FDF8F2',
              border:       '1px solid #E8E2DA',
              borderRadius: '0.75rem',
              padding:      '1rem 1.25rem',
              textAlign:    'left',
            }}
          >
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 700, color: '#1A1410' }}>
              📧 Revisa tu correo
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6B5B4E', lineHeight: 1.55 }}>
              {order.customerEmail
                ? <>Te enviamos un enlace de acceso a <strong>{order.customerEmail}</strong>. Ábrelo para editar tu invitación.</>
                : 'Te enviamos un enlace de acceso a tu correo. Ábrelo para editar tu invitación.'}
            </p>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/login"
              style={{
                display:        'inline-block',
                padding:        '0.625rem 1.5rem',
                background:     '#1A1410',
                color:          '#F5EDD8',
                borderRadius:   '0.5rem',
                fontSize:       '0.875rem',
                fontWeight:     600,
                textDecoration: 'none',
              }}
            >
              Iniciar sesión →
            </Link>
            <Link
              href="/cliente"
              style={{
                display:        'inline-block',
                padding:        '0.625rem 1.5rem',
                background:     '#FFFFFF',
                color:          '#1A1410',
                borderRadius:   '0.5rem',
                fontSize:       '0.875rem',
                fontWeight:     600,
                textDecoration: 'none',
                border:         '1px solid #D4C9BC',
              }}
            >
              Ver mis invitaciones
            </Link>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: '#6B5B4E', fontSize: '1rem', lineHeight: 1.6, maxWidth: '30rem', margin: '0 0 0.5rem' }}>
            Tu invitación está siendo procesada.
          </p>

          {/* Magic link instruction */}
          <div
            style={{
              margin:       '1rem auto 1.75rem',
              maxWidth:     '26rem',
              background:   '#FDF8F2',
              border:       '1px solid #E8E2DA',
              borderRadius: '0.75rem',
              padding:      '1rem 1.25rem',
              textAlign:    'left',
            }}
          >
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 700, color: '#1A1410' }}>
              📧 Revisa tu correo
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6B5B4E', lineHeight: 1.55 }}>
              Te enviamos un enlace de acceso. Ábrelo para editar tu invitación y compartirla con tus invitados.
            </p>
          </div>

          <Link
            href="/login"
            style={{
              display:        'inline-block',
              padding:        '0.625rem 1.5rem',
              background:     '#1A1410',
              color:          '#F5EDD8',
              borderRadius:   '0.5rem',
              fontSize:       '0.875rem',
              fontWeight:     600,
              textDecoration: 'none',
            }}
          >
            Iniciar sesión →
          </Link>
        </>
      )}
    </main>
  );
}
