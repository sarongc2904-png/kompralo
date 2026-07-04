import 'server-only';

import { stripe } from '@/lib/stripe';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export interface OrphanSession {
  sessionId: string;
  amountTotal: number | null;
  currency: string | null;
  customerEmail: string | null;
  created: number; // epoch seconds
  paymentIntent: string | null;
  livemode: boolean;
}

export interface OrphanScanResult {
  windowDays: number;
  scannedPaid: number;
  orphans: OrphanSession[];
}

/**
 * Huérfano = sesión de Stripe PAGADA sin fila en `orders`.
 *
 * - Solo `payment_status === 'paid'` (ignora abandonadas/expiradas).
 * - Solo `livemode === true` — una sesión de test (cs_test) NUNCA cuenta como
 *   huérfano, aunque la key configurada fuera de test. Huérfano = dinero real
 *   que pagó y no generó orden.
 * - Ventana limitada (default 45 días) para no arrastrar historia.
 */
export async function findOrphanSessions(windowDays = 45): Promise<OrphanScanResult> {
  const since = Math.floor(Date.now() / 1000) - windowDays * 24 * 60 * 60;

  const paid: OrphanSession[] = [];
  let startingAfter: string | undefined;
  // Cap de paginación (10 × 100 = 1000 sesiones) — más que suficiente por ventana.
  for (let page = 0; page < 10; page++) {
    const res = await stripe.checkout.sessions.list({
      created: { gte: since },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    for (const s of res.data) {
      if (s.payment_status !== 'paid' || !s.livemode) continue;
      paid.push({
        sessionId:     s.id,
        amountTotal:   s.amount_total,
        currency:      s.currency,
        customerEmail: s.customer_details?.email ?? s.customer_email ?? null,
        created:       s.created,
        paymentIntent: typeof s.payment_intent === 'string' ? s.payment_intent : (s.payment_intent?.id ?? null),
        livemode:      s.livemode,
      });
    }
    if (!res.has_more) break;
    startingAfter = res.data[res.data.length - 1]?.id;
    if (!startingAfter) break;
  }

  // ¿Cuáles session ids ya tienen orden?
  const svc = createServiceRoleSupabaseClient();
  const existing = new Set<string>();
  const ids = paid.map((s) => s.sessionId);
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    if (chunk.length === 0) break;
    const { data } = await svc.from('orders').select('stripe_session_id').in('stripe_session_id', chunk);
    (data ?? []).forEach((o: { stripe_session_id: string }) => existing.add(o.stripe_session_id));
  }

  const orphans = paid
    .filter((s) => !existing.has(s.sessionId))
    .sort((a, b) => b.created - a.created);

  return { windowDays, scannedPaid: paid.length, orphans };
}
