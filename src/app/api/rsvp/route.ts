import { NextRequest, NextResponse } from 'next/server';
import { rsvpRepository } from '@/domain/rsvp';
import type { RSVPSubmissionInput } from '@/domain/rsvp';
import { invitationRepository } from '@/domain/invitations';
import { createRateLimiter } from '@/lib/rate-limit/in-memory';

const rsvpRateLimit = createRateLimiter({ limit: 10, windowMs: 60_000 });

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const rl = rsvpRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rl.resetAt),
        },
      },
    );
  }

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

  const invitationId = typeof data.invitationId === 'string' ? data.invitationId.trim() : '';
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const attendance = data.attendance;
  const guestCount = Number(data.guestCount);

  if (!invitationId) {
    return errorResponse('invitationId es requerido.', 422);
  }

  if (!name) {
    return errorResponse('name es requerido.', 422);
  }

  if (attendance !== 'yes' && attendance !== 'no' && attendance !== 'maybe') {
    return errorResponse('attendance debe ser "yes", "no" o "maybe".', 422);
  }

  if (!Number.isFinite(guestCount) || guestCount < 0) {
    return errorResponse('guestCount debe ser un número >= 0.', 422);
  }

  // Validate that the invitation exists before persisting the RSVP.
  const invitation = await invitationRepository.getById(invitationId);
  if (!invitation) {
    return errorResponse('Invitación no encontrada.', 404);
  }

  const input: RSVPSubmissionInput = {
    invitationId,
    name,
    attendance,
    guestCount,
    phone: typeof data.phone === 'string' ? data.phone.trim() || undefined : undefined,
    message: typeof data.message === 'string' ? data.message.trim() || undefined : undefined,
  };

  const result = await rsvpRepository.submit(input);

  if (!result.success) {
    return errorResponse(result.error, 500);
  }

  const passToken = result.response.passToken;
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const passUrl   = passToken ? `${appUrl}/pass/${passToken}` : undefined;

  return NextResponse.json({ ...result, passUrl }, { status: 201 });
}
