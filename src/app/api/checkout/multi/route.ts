import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { CartItem } from '@/components/cart/MultiEventCart';

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function requireOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  const host   = request.headers.get('host');
  if (origin) return origin;
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${proto}://${host}`;
}

// Allowed plan prices in centavos — validated server-side to prevent tampering.
const PLAN_PRICES: Record<string, number> = {
  basic:   49900,
  premium: 89900,
  deluxe:  149900,
};

const PLAN_NAMES: Record<string, string> = {
  basic:   'Plan Basic',
  premium: 'Plan Premium',
  deluxe:  'Plan Deluxe',
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Cuerpo de la solicitud inválido.', 400);
  }

  const { items } = body as { items?: CartItem[] };

  if (!Array.isArray(items) || items.length === 0) {
    return errorResponse('El carrito está vacío.', 422);
  }

  if (items.length > 20) {
    return errorResponse('Máximo 20 items por pedido.', 422);
  }

  // Validate each item and build canonical line items using server-side prices
  const lineItems = [];
  const cartSummary: string[] = [];
  // v2 format consumed by the webhook to create one order+invitation per item:
  // "eventType:plan|eventType:plan" (eventType is the catalog id, not the label).
  const cartV2: string[] = [];

  for (const item of items) {
    if (!item.plan || !(item.plan in PLAN_PRICES)) {
      return errorResponse(`Plan inválido: ${item.plan}`, 422);
    }
    if (!item.eventLabel || typeof item.eventLabel !== 'string') {
      return errorResponse('Tipo de evento inválido.', 422);
    }
    const eventType = typeof item.eventType === 'string' && /^[a-z-]{1,24}$/.test(item.eventType)
      ? item.eventType
      : 'boda';

    const price = PLAN_PRICES[item.plan];
    const name  = `${item.eventIcon ?? ''} ${item.eventLabel} — ${PLAN_NAMES[item.plan]}`.trim();

    lineItems.push({
      quantity: 1,
      price_data: {
        currency:     'mxn',
        unit_amount:  price,
        product_data: { name },
      },
    });

    cartSummary.push(`${item.eventLabel}:${item.plan}`);
    cartV2.push(`${eventType}:${item.plan}`);
  }

  // Read authenticated session for ownership metadata
  let ownerUserId: string | undefined;
  let ownerEmail:  string | undefined;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id)    ownerUserId = user.id;
    if (user?.email) ownerEmail  = user.email;
  } catch { /* guest checkout allowed */ }

  const origin = requireOrigin(request);

  try {
    const session = await stripe.checkout.sessions.create({
      mode:       'payment',
      line_items: lineItems,
      metadata: {
        cart_type:      'multi',
        cart_items:     cartSummary.join('|').slice(0, 500), // Stripe metadata max 500 chars per value
        cart_items_v2:  cartV2.join('|').slice(0, 500),      // webhook parses this (max 20 items ≈ 300 chars)
        item_count:     String(items.length),
        ...(ownerUserId ? { ownerUserId } : {}),
        ...(ownerEmail  ? { ownerEmail  } : {}),
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/invitaciones#planes`,
      ...(ownerEmail ? { customer_email: ownerEmail } : {}),
    });

    if (!session.url) throw new Error('Stripe no devolvió URL de pago.');

    return NextResponse.json({ success: true, sessionId: session.id, url: session.url }, { status: 201 });
  } catch (err) {
    console.error('[checkout/multi] error:', err);
    return errorResponse('Error al crear la sesión de pago.', 500);
  }
}
