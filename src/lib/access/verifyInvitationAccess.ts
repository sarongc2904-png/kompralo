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

// Signature + shape check WITHOUT the expiry check — the merge below needs to
// identify an invitation's previous entry even after it expired, to replace it.
function decodeVerifiedEntry(value: string): AccessCookiePayload | null {
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
      typeof payload.exp !== 'number'
    ) {
      return null;
    }

    return payload as AccessCookiePayload;
  } catch {
    return null;
  }
}

function parseAccessCookie(value: string): AccessCookiePayload | null {
  const payload = decodeVerifiedEntry(value);
  if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// The cookie holds a JSON array of signed entries (one per invitation) so a
// multi-cart customer keeps access to all N invitations at once. Legacy
// cookies hold a single bare `payload.signature` entry.
function readCookieEntries(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string')
      : [];
  } catch {
    return raw ? [raw] : []; // backward compat con cookie string plano
  }
}

/**
 * Appends a fresh entry for `invitationId` to the existing cookie value.
 * Entries for other invitations are never pruned — each validates its own
 * exp at read time. Only a previous entry for this same invitation is
 * replaced, so re-consuming a link refreshes instead of duplicating.
 */
export function mergeInvitationAccessCookieValue(params: {
  existingCookieValue: string | undefined;
  invitationId: string;
  expiresAt: Date;
}): { value: string; maxAgeSeconds: number } {
  const newEntry = createInvitationAccessCookieValue({
    invitationId: params.invitationId,
    expiresAt: params.expiresAt,
  });

  const kept = params.existingCookieValue
    ? readCookieEntries(params.existingCookieValue).filter(
        (entry) => decodeVerifiedEntry(entry)?.invitationId !== params.invitationId,
      )
    : [];
  const entries = [...kept, newEntry];

  // Cookie lifetime = furthest expiry among entries, so adding a short-lived
  // entry never shortens the life of the others.
  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxExp = entries.reduce(
    (max, entry) => Math.max(max, decodeVerifiedEntry(entry)?.exp ?? 0),
    Math.floor(params.expiresAt.getTime() / 1000),
  );

  return { value: JSON.stringify(entries), maxAgeSeconds: Math.max(0, maxExp - nowSeconds) };
}

export async function verifyInvitationAccess(invitationId: string): Promise<boolean> {
  try {
    const cookieValue = (await cookies()).get(INVITATION_ACCESS_COOKIE)?.value;
    if (!cookieValue) return false;
    return readCookieEntries(cookieValue).some(
      (entry) => parseAccessCookie(entry)?.invitationId === invitationId,
    );
  } catch {
    return false;
  }
}

