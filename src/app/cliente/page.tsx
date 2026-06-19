import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SupabaseOrderRepository } from '@/domain/orders';
import type { Order } from '@/domain/orders';
import { createServiceRoleSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Mis invitaciones — Kompralo' };

const planLabels: Record<string, string> = {
  basic:    'Basic',
  gold:     'Premium',
  platinum: 'Deluxe',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  paid:    'Pagado',
  failed:  'Fallido',
  refunded:'Reembolsado',
};

function formatPrice(centavos: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style:    'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(centavos / 100);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(iso));
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

async function getSessionEmail(): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

async function fetchOrders(email: string): Promise<Order[]> {
  try {
    const supabase   = createServiceRoleSupabaseClient();
    const orderRepo  = new SupabaseOrderRepository(supabase);
    return await orderRepo.findByCustomerEmail(email);
  } catch {
    return [];
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmailSearchForm({ currentEmail }: { currentEmail?: string }) {
  return (
    <form
      method="get"
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}
    >
      <input
        type="email"
        name="email"
        defaultValue={currentEmail}
        placeholder="correo@ejemplo.com"
        required
        style={{
          padding:      '0.625rem 1rem',
          border:       '1px solid #D4C9BC',
          borderRadius: '0.5rem',
          fontSize:     '0.875rem',
          color:        '#1A1410',
          background:   '#FFFFFF',
          width:        '18rem',
          maxWidth:     '100%',
        }}
      />
      <button
        type="submit"
        style={{
          padding:      '0.625rem 1.25rem',
          background:   '#1A1410',
          color:        '#F5F3F0',
          borderRadius: '0.5rem',
          fontSize:     '0.875rem',
          fontWeight:   600,
          border:       'none',
          cursor:       'pointer',
        }}
      >
        Ver mis órdenes
      </button>
    </form>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColor: Record<string, string> = {
    pending:  '#9B8878',
    paid:     '#2E7D32',
    failed:   '#C62828',
    refunded: '#7B5EA7',
  };

  return (
    <div
      style={{
        background:   '#FFFFFF',
        border:       '1px solid #E8E2DA',
        borderRadius: '0.75rem',
        padding:      '1.5rem',
        marginBottom: '1rem',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#1A1410' }}>
            Plan {planLabels[order.planId] ?? order.planId}
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B5B4E' }}>
            {formatPrice(order.amountTotal, order.currency)} · {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          style={{
            padding:      '0.25rem 0.75rem',
            borderRadius: '2rem',
            fontSize:     '0.75rem',
            fontWeight:   600,
            color:        statusColor[order.status] ?? '#6B5B4E',
            background:   `${statusColor[order.status] ?? '#6B5B4E'}18`,
          }}
        >
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      {/* Email confirmation status */}
      <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: order.confirmationEmailSentAt ? '#2E7D32' : '#9B8878' }}>
        {order.confirmationEmailSentAt
          ? `Correo de confirmación enviado el ${formatDate(order.confirmationEmailSentAt)}`
          : 'Correo de confirmación pendiente'}
      </p>

      {/* Action */}
      {order.invitationId && (
        <Link
          href={`/dashboard/invitations/${order.invitationId}/edit`}
          style={{
            display:        'inline-block',
            padding:        '0.5rem 1.25rem',
            background:     '#C5A880',
            color:          '#1A1410',
            borderRadius:   '0.5rem',
            fontSize:       '0.8125rem',
            fontWeight:     600,
            textDecoration: 'none',
          }}
        >
          Editar invitación →
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function ClientePage({ searchParams }: Props) {
  const { email: emailParam } = await searchParams;
  const sessionEmail = await getSessionEmail();
  const adminMode = isAdminMode();

  if (!sessionEmail && !adminMode) {
    redirect('/login?redirect=/cliente');
  }

  // Authenticated session always wins. Query email is only a local/admin fallback.
  const adminEmail = adminMode ? emailParam?.trim() : undefined;
  const trimmedEmail = sessionEmail ?? adminEmail;
  const isAuthenticated = !!sessionEmail;
  const isAdminEmailFallback = !isAuthenticated && adminMode;

  const hasValidEmail = trimmedEmail && isValidEmail(trimmedEmail);
  const orders = hasValidEmail ? await fetchOrders(trimmedEmail) : [];

  return (
    <main
      style={{
        minHeight:     '100dvh',
        background:    '#F5F0EB',
        padding:       '3rem 1rem',
        fontFamily:    'var(--font-inter, system-ui, sans-serif)',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#1A1410', margin: '0 0 0.5rem' }}>
            Mis invitaciones
          </h1>
          <p style={{ color: '#6B5B4E', fontSize: '0.9rem', margin: 0 }}>
            Consulta las invitaciones asociadas a tu cuenta.
          </p>
        </div>

        {/* Admin/dev email lookup — disabled in production mode */}
        {isAdminEmailFallback && (
          <>
            <p
              style={{
                textAlign: 'center',
                color: '#9B8878',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}
            >
              Modo admin/dev: vista por email habilitada.
            </p>
            <EmailSearchForm currentEmail={trimmedEmail} />
          </>
        )}

        {/* Authenticated identity badge */}
        {isAuthenticated && (
          <p style={{ textAlign: 'center', color: '#6B5B4E', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Mostrando órdenes de <strong>{trimmedEmail}</strong>
          </p>
        )}

        {/* Results */}
        {!trimmedEmail && (
          <p style={{ textAlign: 'center', color: '#9B8878', fontSize: '0.9rem' }}>
            Inicia sesion para ver tus ordenes.
          </p>
        )}

        {trimmedEmail && !hasValidEmail && (
          <p style={{ textAlign: 'center', color: '#C62828', fontSize: '0.875rem' }}>
            Correo electrónico inválido. Verifica e intenta de nuevo.
          </p>
        )}

        {hasValidEmail && orders.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9B8878', fontSize: '0.9rem' }}>
            No encontramos órdenes para <strong>{trimmedEmail}</strong>.
          </p>
        )}

        {hasValidEmail && orders.length > 0 && (
          <>
            <p style={{ color: '#6B5B4E', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              {orders.length} {orders.length === 1 ? 'orden encontrada' : 'órdenes encontradas'} para{' '}
              <strong>{trimmedEmail}</strong>
            </p>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </>
        )}
      </div>
    </main>
  );
}
