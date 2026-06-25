/**
 * Stripe webhook endpoint.
 *
 * Configure in Stripe Dashboard → Webhooks:
 *   URL: https://<your-domain>/api/webhook/stripe
 *   Events to listen for:
 *     - checkout.session.completed
 *     - checkout.session.expired
 *     - payment_intent.payment_failed
 *
 * The handler is idempotent — duplicate webhook deliveries are safe.
 */

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe';
import { SupabaseOrderRepository } from '@/domain/orders';
import type { CreateOrderInput } from '@/domain/orders';
import type { ProductId } from '@/domain/products';
import { parsePlanId, resolvePurchasedPlanId } from '@/domain/plans/types';
import { SupabaseInvitationRepository } from '@/domain/invitations/supabase.repository';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail } from '@/lib/resend';
import { createInvitationAccessToken } from '@/lib/access/createInvitationAccessToken';
import { getResendClient, getFromEmail } from '@/lib/resend/resend';
import { buildUnsubscribeUrl } from '@/lib/email/unsubscribe-token';
import WelcomePostPayment, { subject as welcomeSubject } from '@/lib/email/templates/welcome-post-payment';

function ok()  { return NextResponse.json({ received: true }, { status: 200 }); }
function fail() { return NextResponse.json({ received: false }, { status: 400 }); }

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch (err) {
    console.error('[webhook/stripe] signature verification failed:', err);
    return fail();
  }

  const supabase        = createServiceRoleSupabaseClient();
  const orderRepo       = new SupabaseOrderRepository(supabase);
  const invitationRepo  = new SupabaseInvitationRepository(supabase);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[webhook/stripe] checkout.session.completed received — session=%s', session.id);

        const rawPlanId = session.metadata?.plan_id ?? session.metadata?.planId;
        const planResolution = resolvePurchasedPlanId(rawPlanId, session.amount_total);
        const planId = planResolution.planId;
        if (planResolution.error) {
          console.error(
            '[webhook/stripe] plan resolution warning — session=%s source=%s: %s',
            session.id,
            planResolution.source,
            planResolution.error,
          );
        }

        const rawProductId = session.metadata?.product_id ?? session.metadata?.productId;
        const metadataProductId = parsePlanId(rawProductId);
        const productId: ProductId = planId;
        if (!metadataProductId || metadataProductId !== planId) {
          console.error(
            '[webhook/stripe] missing/unknown/mismatched product metadata — session=%s product=%s plan=%s; using canonical product=%s',
            session.id,
            rawProductId ?? 'missing',
            planId,
            productId,
          );
        }

        const invitationId    = session.metadata?.invitationId ?? null;
        const customerEmail   = session.customer_details?.email
          ?? session.customer_email
          ?? null;
        const customerName    = session.customer_details?.name  ?? null;
        const paymentIntent   = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null;

        // Owner identity embedded at checkout time by /api/checkout/route.ts.
        // ownerEmail is the Auth user's email; may differ from customerEmail (Stripe payment email).
        const ownerUserId = session.metadata?.ownerUserId ?? null;
        const ownerEmail  = session.metadata?.ownerEmail  ?? customerEmail;

        console.log('[Webhook] session id:', session.id);
        console.log('[Webhook] payment email:', customerEmail);
        console.log('[Webhook] owner email:', ownerEmail);
        console.log('[Webhook] owner user id:', ownerUserId);
        console.log('[Webhook] plan id:', planId);

        // ── 1. Create or update order (idempotent) ──────────────────────────

        let order = await orderRepo.getBySessionId(session.id);

        if (order) {
          console.log('[webhook/stripe] order reused — session=%s status=%s', session.id, order.status);
          if (order.status !== 'paid') {
            await orderRepo.updateStatus(session.id, 'paid', paymentIntent ?? undefined);
            // Re-fetch so we have the latest row (including email columns).
            order = await orderRepo.getBySessionId(session.id);
          }
        } else {
          const orderInput: CreateOrderInput = {
            stripeSessionId:       session.id,
            stripePaymentIntentId: paymentIntent,
            productId,
            planId,
            amountTotal:   session.amount_total ?? 0,
            currency:      session.currency ?? 'mxn',
            status:        'paid',
            invitationId,
            customerEmail,
            customerName,
            ownerUserId,
          };
          order = await orderRepo.create(orderInput);
          console.log('[webhook/stripe] order created — session=%s productId=%s', session.id, productId);
        }

        // ── 2. Resolve final invitation id ─────────────────────────────────
        // If metadata had invitationId → activate it.
        // If not → auto-create a blank invitation (idempotent: reuse order.invitationId if set).

        let finalInvitationId: string | null = invitationId ?? order?.invitationId ?? null;

        if (invitationId) {
          // Existing flow: invitation was pre-selected at checkout.
          try {
            await invitationRepo.activateAfterPayment({
              invitationId,
              planId,
              stripeSessionId: session.id,
              customerEmail:   customerEmail ?? undefined,
            });
            console.log('[webhook/stripe] invitation %s activated — planId=%s', invitationId, planId);
          } catch (activateErr) {
            console.error('[webhook/stripe] activateAfterPayment failed (invitation=%s):', invitationId, activateErr);
          }
        } else if (customerEmail) {
          // Auto-create flow: no invitation was linked at checkout time.
          // Idempotency: if order.invitationId is already set (e.g. previous webhook delivery), reuse it.
          if (!finalInvitationId) {
            try {
              const { invitationId: newId } = await invitationRepo.createFromPaidOrder({
                planId,
                customerEmail,
                customerName,
                stripeSessionId: session.id,
                ownerUserId,
              });
              finalInvitationId = newId;

              await orderRepo.attachInvitationToOrder({
                stripeSessionId: session.id,
                invitationId:    newId,
              });
              console.log('[webhook/stripe] auto-created invitation %s for %s', newId, customerEmail);
            } catch (createErr) {
              console.error('[webhook/stripe] createFromPaidOrder failed (session=%s):', session.id, createErr);
            }
          } else {
            console.log('[webhook/stripe] reusing existing invitationId=%s (session=%s)', finalInvitationId, session.id);
          }
        }

        // ── 3. Send confirmation email (idempotent via confirmation_email_sent_at) ──

        // Email goes to ownerEmail (the Auth user's email) when available,
        // otherwise falls back to the Stripe payment email.
        const emailRecipient = ownerEmail ?? customerEmail;
        if (!emailRecipient) {
          console.warn('[webhook/stripe] skipping email — no recipient email (session=%s)', session.id);
          break;
        }

        // Re-fetch order so email guard reflects any updates from step 1.
        const freshOrder = await orderRepo.getBySessionId(session.id);

        // Skip if already sent (duplicate webhook delivery).
        if (freshOrder?.confirmationEmailSentAt) {
          console.log('[webhook/stripe] email already sent at %s — skipping (session=%s)', freshOrder.confirmationEmailSentAt, session.id);
          break;
        }

        try {
          if (!finalInvitationId || !freshOrder) {
            throw new Error('Invitation or order is not ready for customer access.');
          }

          const appUrlValue = process.env.NEXT_PUBLIC_APP_URL?.trim();
          if (!appUrlValue) {
            throw new Error('NEXT_PUBLIC_APP_URL is required to create the access link.');
          }
          const appUrl = new URL(appUrlValue);
          if (appUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
            throw new Error('NEXT_PUBLIC_APP_URL must use HTTPS in production.');
          }

          // ── 3a. Generate access-token link (fallback, 7-day cookie) ─────────
          const { rawToken } = await createInvitationAccessToken({
            invitationId: finalInvitationId,
            orderId: freshOrder.id,
            customerEmail: emailRecipient,
          });
          const accessUrl = new URL('/access/consume', appUrl);
          accessUrl.searchParams.set('token', rawToken);

          // ── 3b. Create/invite Supabase Auth user and get password-setup link ─
          // The invite link lets the customer create a password once and then use
          // email+password to log in on subsequent visits.
          let inviteUrl: string | null = null;
          try {
            const setPasswordUrl = new URL('/auth/set-password', appUrl);

            const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
              type: 'invite',
              email: emailRecipient,
              options: { redirectTo: setPasswordUrl.toString() },
            });

            if (linkError) {
              console.warn('[webhook/stripe] generateLink failed (non-fatal, session=%s):', session.id, linkError.message);
            } else {
              inviteUrl = linkData?.properties?.action_link ?? null;
              console.log('[webhook/stripe] invite link generated for %s', emailRecipient);
            }
          } catch (inviteErr) {
            console.warn('[webhook/stripe] generateLink threw (non-fatal, session=%s):', session.id, inviteErr);
          }

          const loginUrl = new URL('/login', appUrl).toString();

          await sendOrderConfirmationEmail({
            to:           emailRecipient,
            customerName,
            planId,
            amountTotal:  session.amount_total,
            currency:     session.currency,
            accessUrl:    accessUrl.toString(),
            inviteUrl,
            loginUrl,
          });
          await orderRepo.markConfirmationEmailSent(session.id);
          console.log('[webhook/stripe] confirmation email sent to %s (session=%s)', emailRecipient, session.id);
          console.log('[Webhook] email sent:', emailRecipient, '| order:', freshOrder.id, '| invitation:', finalInvitationId);

          // ── 3c. Email marketing: mark lead as customer + send welcome email ──
          try {
            await supabase.from('email_leads').upsert(
              { email: emailRecipient, status: 'customer', source: 'post_payment', name: customerName ?? undefined },
              { onConflict: 'email' },
            );
            const appUrlForMarketing = process.env.NEXT_PUBLIC_APP_URL ?? '';
            const unsubUrl = buildUnsubscribeUrl(emailRecipient);
            await getResendClient().emails.send({
              from:    getFromEmail(),
              to:      emailRecipient,
              subject: welcomeSubject,
              react:   WelcomePostPayment({
                name:           customerName ?? undefined,
                dashboardUrl:   `${appUrlForMarketing}/dashboard`,
                plan:           planId,
                unsubscribeUrl: unsubUrl,
              }),
            });
          } catch (marketingErr) {
            // Non-fatal: confirmation email already sent; just log
            console.error('[webhook/stripe] marketing welcome email failed (session=%s):', session.id, marketingErr);
          }
        } catch (emailErr) {
          const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
          console.error('[webhook/stripe] email failed (session=%s):', session.id, msg);
          try {
            await orderRepo.markConfirmationEmailFailed(session.id, msg);
          } catch (markErr) {
            console.error('[webhook/stripe] markConfirmationEmailFailed also failed:', markErr);
          }
          // Do NOT re-throw — Stripe must receive 200 regardless of email failure.
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const rawProductId = session.metadata?.product_id ?? session.metadata?.productId;
        if (!rawProductId) break;

        const existing = await orderRepo.getBySessionId(session.id);
        if (existing && existing.status === 'pending') {
          await orderRepo.updateStatus(session.id, 'failed');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        // Look up by payment_intent id is not directly indexed; skip for now.
        // The checkout.session.expired event covers most failure scenarios.
        console.log('[webhook/stripe] payment_intent.payment_failed:', pi.id);
        break;
      }

      default:
        // Unhandled event type — ignore.
        break;
    }
  } catch (err) {
    console.error('[webhook/stripe] handler error:', err);
    // Return 200 so Stripe does not retry on application errors.
    // Log the failure for investigation.
  }

  return ok();
}
