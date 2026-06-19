import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getProductById } from '@/domain/products';

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

  const origin = requireOrigin(request);

  try {
    const result = await createCheckoutSession({
      productId,
      invitationId,
      customerEmail,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  `${origin}/checkout/cancel`,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err) {
    console.error('[checkout] createCheckoutSession error:', err);
    return errorResponse('Error al crear la sesión de pago.', 500);
  }
}
