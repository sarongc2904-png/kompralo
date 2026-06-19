import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const INVITATION_ACCESS_COOKIE = 'kompralo_access';
export const INVITATION_ACCESS_PURPOSE = 'customer_invitation_access';

type AccessCookiePayload = {
  version: 1;
  invitationId: string;
  purpose: typeof INVITATION_ACCESS_PURPOSE;
  exp: number;
};

function getAccessSecret(): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ACCESS_TOKEN_SECRET must contain at least 32 characters.');
  }
  return secret;
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getAccessSecret())
    .update(encodedPayload, 'utf8')
    .digest('base64url');
}

export function createInvitationAccessCookieValue(params: {
  invitationId: string;
  expiresAt: Date;
}): string {
  const payload: AccessCookiePayload = {
    version: 1,
    invitationId: params.invitationId,
    purpose: INVITATION_ACCESS_PURPOSE,
    exp: Math.floor(params.expiresAt.getTime() / 1000),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function parseAccessCookie(value: string): AccessCookiePayload | null {
  const [encodedPayload, suppliedSignature, extra] = value.split('.');
  if (!encodedPayload || !suppliedSignature || extra) return null;

  const expectedSignature = signPayload(encodedPayload);
  const expected = Buffer.from(expectedSignature, 'utf8');
  const supplied = Buffer.from(suppliedSignature, 'utf8');
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as Partial<AccessCookiePayload>;

    if (
      payload.version !== 1 ||
      payload.purpose !== INVITATION_ACCESS_PURPOSE ||
      typeof payload.invitationId !== 'string' ||
      payload.invitationId.length === 0 ||
      payload.invitationId.length > 128 ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload as AccessCookiePayload;
  } catch {
    return null;
  }
}

export async function verifyInvitationAccess(invitationId: string): Promise<boolean> {
  try {
    const cookieValue = (await cookies()).get(INVITATION_ACCESS_COOKIE)?.value;
    if (!cookieValue) return false;
    const payload = parseAccessCookie(cookieValue);
    return payload?.invitationId === invitationId;
  } catch {
    return false;
  }
}

