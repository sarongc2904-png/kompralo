/**
 * POST /api/admin/recovery
 * Admin-authenticated wrapper around the recover-purchase logic.
 * Requires admin session (NOT x-admin-secret).
 *
 * Body: { stripe_session_id: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute, createAdminAuditLog } from '@/lib/admin';

function err(msg: string, status = 400) {
  return NextResponse.json({ success: false, error: msg }, { status });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  let body: unknown;
  try { body = await request.json(); } catch { return err('Invalid JSON'); }

  const stripeSessionId = (body as Record<string, unknown>).stripe_session_id;
  if (typeof stripeSessionId !== 'string' || !stripeSessionId.startsWith('cs_')) {
    return err('stripe_session_id is required and must start with cs_');
  }

  // Delegate to the existing recovery endpoint using the RECOVERY_ADMIN_SECRET
  const recoverySecret = process.env.RECOVERY_ADMIN_SECRET;
  if (!recoverySecret) {
    return err('RECOVERY_ADMIN_SECRET env var not configured', 500);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? '';
  if (!appUrl) return err('NEXT_PUBLIC_APP_URL not configured', 500);

  let result: Response;
  try {
    result = await fetch(`${appUrl}/api/admin/recover-purchase`, {
      method:  'POST',
      headers: {
        'Content-Type':   'application/json',
        'x-admin-secret': recoverySecret,
      },
      body: JSON.stringify({ stripe_session_id: stripeSessionId }),
    });
  } catch (e) {
    return err(`Fetch to recover-purchase failed: ${e instanceof Error ? e.message : String(e)}`, 502);
  }

  const data = await result.json();

  if (result.ok) {
    await createAdminAuditLog({
      adminUserId: admin.id,
      adminEmail:  admin.email,
      action:      'recovery.triggered',
      entityType:  'order',
      entityId:    data.orderId ?? null,
      after:       { stripeSessionId, invitationId: data.invitationId, emailSentTo: data.emailSentTo },
    });
  }

  return NextResponse.json(data, { status: result.status });
}
