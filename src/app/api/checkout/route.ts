import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getProductById } from '@/domain/products';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Cuerpo de la solicitud inválido.', 400);
  }

  if (!body || typeof body !== 'object') {
    return errorResponse('Cuerpo de la solicitud inválido.', 400);
  }

  const data = body as Record<string, unknown>;

  const productId    = typeof data.productId    === 'string' ? data.productId.trim()    : '';
  const invitationId = typeof data.invitationId === 'string' ? data.invitationId.trim() : undefined;
  const customerEmail = typeof data.customerEmail === 'string' ? data.customerEmail.trim() : undefined;

  if (!productId) {
    return errorResponse('productId es requerido.', 422);
  }

  if (!getProductById(productId)) {
    return errorResponse(`Producto no encontrado: ${productId}`, 404);
  }

  // Read the authenticated session so ownership is embedded in Stripe metadata.
  // This lets the webhook assign the invitation to the correct Auth user even
  // when the buyer uses a different email in the Stripe checkout form.
  let ownerUserId: string | undefined;
  let ownerEmail: string | undefined;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id)    ownerUserId = user.id;
    if (user?.email) ownerEmail  = user.email;
    console.log('[Checkout] session user id:', ownerUserId ?? 'none (guest)');
    console.log('[Checkout] session email:', ownerEmail ?? 'none (guest)');
  } catch {
    // Non-fatal — guest checkout is allowed.
  }

  const origin = requireOrigin(request);

  try {
    const result = await createCheckoutSession({
      productId,
      invitationId,
      customerEmail: customerEmail ?? ownerEmail,
      ownerUserId,
      ownerEmail,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  `${origin}/checkout/cancel`,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err) {
    console.error('[checkout] createCheckoutSession error:', err);
    return errorResponse('Error al crear la sesión de pago.', 500);
  }
}
