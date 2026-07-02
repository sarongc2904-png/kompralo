/**
 * POST /api/admin/invitations/[id]/send-access-email
 * Sends (or re-sends) the access email for an invitation.
 * Uses the same logic as recover-purchase without touching Stripe.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute, createAdminAuditLog, getAppUrl } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createInvitationAccessToken } from '@/lib/access/createInvitationAccessToken';
import { sendOrderConfirmationEmail } from '@/lib/resend';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  const { id } = await params;
  const svc = createServiceRoleSupabaseClient();

  // Fetch invitation + linked order
  const { data: inv } = await svc
    .from('invitations')
    .select('id, plan_id, customer_email, status, deleted_at')
    .eq('id', id)
    .maybeSingle();

  if (!inv) return err('Invitation not found', 404);
  if (inv.deleted_at) return err('Cannot send email to a deleted invitation');

  const emailTo: string | null = inv.customer_email;
  if (!emailTo) return err('Invitation has no customer_email');

  // Get most recent paid order for the invitation
  const { data: orders } = await svc
    .from('orders')
    .select('id, stripe_session_id, customer_name, amount_total, currency')
    .eq('invitation_id', id)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1);

  const order = orders?.[0] ?? null;
  const orderId = order?.id ?? null;

  if (!orderId) return err('No paid order found for this invitation. Create one first.');

  const appUrl = getAppUrl();
  const appUrlObj = new URL(appUrl);

  try {
    const { rawToken } = await createInvitationAccessToken({
      invitationId: id,
      orderId,
      customerEmail: emailTo,
    });

    const accessUrl = new URL('/access/consume', appUrlObj);
    accessUrl.searchParams.set('token', rawToken);

    // Attempt to generate a password-setup link (non-fatal).
    // 'invite' fails once the auth user exists, so fall back to 'recovery'.
    // Route through our /auth/confirm (server-side verifyOtp + user_id link).
    let inviteUrl: string | null = null;
    try {
      const setPasswordUrl = new URL('/auth/set-password', appUrlObj);

      let linkData = null;
      let linkType: 'invite' | 'recovery' = 'invite';
      const inviteAttempt = await svc.auth.admin.generateLink({
        type: 'invite',
        email: emailTo,
        options: { redirectTo: setPasswordUrl.toString() },
      });
      if (inviteAttempt.error || !inviteAttempt.data?.properties) {
        linkType = 'recovery';
        const recoveryAttempt = await svc.auth.admin.generateLink({
          type: 'recovery',
          email: emailTo,
        });
        linkData = recoveryAttempt.data;
      } else {
        linkData = inviteAttempt.data;
      }

      const hashedToken = linkData?.properties?.hashed_token ?? null;
      if (hashedToken) {
        const confirmUrl = new URL('/auth/confirm', appUrlObj);
        confirmUrl.searchParams.set('token_hash', hashedToken);
        confirmUrl.searchParams.set('type', linkType);
        confirmUrl.searchParams.set('next', '/auth/set-password');
        confirmUrl.searchParams.set('email', emailTo);
        inviteUrl = confirmUrl.toString();
      } else {
        inviteUrl = linkData?.properties?.action_link ?? null;
      }
    } catch { /* non-fatal */ }

    await sendOrderConfirmationEmail({
      to:           emailTo,
      customerName: order?.customer_name ?? null,
      planId:       inv.plan_id as 'basic' | 'premium' | 'deluxe',
      amountTotal:  order?.amount_total ?? null,
      currency:     order?.currency ?? null,
      accessUrl:    accessUrl.toString(),
      inviteUrl,
      loginUrl:     new URL('/login', appUrlObj).toString(),
    });

    await createAdminAuditLog({
      adminUserId: admin.id,
      adminEmail:  admin.email,
      action:      'invitation.send_access_email',
      entityType:  'invitation',
      entityId:    id,
      after:       { emailTo, orderId },
    });

    return NextResponse.json({ success: true, emailSentTo: emailTo });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`Email failed: ${msg}`, 502);
  }
}
