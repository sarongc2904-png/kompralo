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
          <p style={{ color: '#9B8878', fontSize: '0.875rem', margin: '0 0 2rem' }}>
            También te enviamos un correo con el acceso a tu invitación.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {order.invitationId && (
              <Link
                href={`/dashboard/invitations/${order.invitationId}/edit`}
                style={{
                  display:        'inline-block',
                  padding:        '0.625rem 1.5rem',
                  background:     '#C5A880',
                  color:          '#1A1410',
                  borderRadius:   '0.5rem',
                  fontSize:       '0.875rem',
                  fontWeight:     600,
                  textDecoration: 'none',
                }}
              >
                Editar invitación →
              </Link>
            )}
            {order.customerEmail && (
              <Link
                href={`/cliente?email=${encodeURIComponent(order.customerEmail)}`}
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
            )}
            <Link
              href="/dashboard"
              style={{
                display:        'inline-block',
                padding:        '0.625rem 1.5rem',
                background:     '#1A1410',
                color:          '#F5F3F0',
                borderRadius:   '0.5rem',
                fontSize:       '0.875rem',
                fontWeight:     600,
                textDecoration: 'none',
              }}
            >
              Ir al dashboard
            </Link>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: '#6B5B4E', fontSize: '1rem', lineHeight: 1.6, maxWidth: '30rem', margin: '0 0 0.5rem' }}>
            Tu invitación está siendo procesada.
          </p>
          <p style={{ color: '#9B8878', fontSize: '0.875rem', margin: '0 0 2rem' }}>
            También te enviamos un correo con el acceso a tu invitación.
          </p>
          <Link
            href="/dashboard"
            style={{
              display:        'inline-block',
              padding:        '0.625rem 1.5rem',
              background:     '#1A1410',
              color:          '#F5F3F0',
              borderRadius:   '0.5rem',
              fontSize:       '0.875rem',
              fontWeight:     600,
              textDecoration: 'none',
            }}
          >
            Ir al dashboard
          </Link>
        </>
      )}
    </main>
  );
}
