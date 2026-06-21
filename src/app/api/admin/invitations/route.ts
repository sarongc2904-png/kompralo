/**
 * POST /api/admin/invitations
 * Create an invitation manually (no Stripe required).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute, createAdminAuditLog, generateUniqueSlug, isReservedSlug, publicUrl, editorUrl, clientDashboardUrl } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { buildDefaultInvitationContentForSupabase } from '@/domain/invitations/defaultContent';
import { normalizePlanId } from '@/domain/plans/types';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_CATEGORIES = new Set(['wedding', 'baptism', 'baby-shower', 'birthday']);
const VALID_STATUSES   = new Set(['draft', 'paid', 'published']);
const PLAN_AMOUNTS: Record<string, number> = { basic: 49900, premium: 89900, deluxe: 149900 };

export async function POST(request: NextRequest) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return err('Invalid JSON'); }

  const customerEmail  = typeof body.customer_email  === 'string' ? body.customer_email.trim()  : '';
  const customerName   = typeof body.customer_name   === 'string' ? body.customer_name.trim()   : null;
  const category       = typeof body.category        === 'string' ? body.category               : 'wedding';
  const ownerUserIdRaw = typeof body.owner_user_id   === 'string' ? body.owner_user_id.trim()   : '';
  const requestedSlug  = typeof body.slug            === 'string' ? body.slug.trim()             : '';
  const createOrder    = body.create_order !== false;

  if (!customerEmail) return err('customer_email is required');
  if (!VALID_CATEGORIES.has(category)) return err(`Invalid category. Valid: ${[...VALID_CATEGORIES].join(', ')}`);

  const statusInput = typeof body.status === 'string' ? body.status : 'paid';
  if (!VALID_STATUSES.has(statusInput)) return err(`Invalid status. Valid: ${[...VALID_STATUSES].join(', ')}`);

  const planId = normalizePlanId(typeof body.plan_id === 'string' ? body.plan_id : 'gold');

  // Validate owner_user_id format before any DB call
  if (ownerUserIdRaw && !UUID_RE.test(ownerUserIdRaw)) {
    return err('Owner User ID debe ser un UUID válido de Supabase Auth o dejarse vacío.');
  }

  const svc = createServiceRoleSupabaseClient();

  // If a UUID was provided, verify it actually exists in auth.users
  if (ownerUserIdRaw) {
    const { data: authCheck, error: authCheckErr } = await svc.auth.admin.getUserById(ownerUserIdRaw);
    if (authCheckErr || !authCheck?.user) {
      return err(
        'Ese Owner User ID no existe en Supabase Auth. Déjalo vacío o usa un UUID real de auth.users.',
        400,
      );
    }
  }

  let ownerUserId: string | null = ownerUserIdRaw || null;

  // Auto-resolve user_id from email when owner_user_id was not provided
  if (!ownerUserId) {
    // 1. Try auth.users directly by email
    const { data: listData } = await svc.auth.admin.listUsers({ perPage: 1000 });
    const authMatch = (listData?.users ?? []).find(
      u => u.email?.toLowerCase() === customerEmail.toLowerCase(),
    );
    if (authMatch) {
      ownerUserId = authMatch.id;
    } else {
      // 2. Fallback: check existing invitations with this email that already have a user_id
      const { data: invMatch } = await svc
        .from('invitations')
        .select('user_id')
        .ilike('customer_email', customerEmail)
        .not('user_id', 'is', null)
        .limit(1)
        .maybeSingle();
      if (invMatch?.user_id) {
        ownerUserId = invMatch.user_id as string;
      } else {
        // 3. Fallback: check existing orders
        const { data: orderMatch } = await svc
          .from('orders')
          .select('owner_user_id')
          .ilike('customer_email', customerEmail)
          .not('owner_user_id', 'is', null)
          .limit(1)
          .maybeSingle();
        if (orderMatch?.owner_user_id) {
          ownerUserId = orderMatch.owner_user_id as string;
        }
      }
    }
  }

  // Resolve slug
  let slug: string;
  if (requestedSlug) {
    if (isReservedSlug(requestedSlug)) return err(`"${requestedSlug}" is a reserved slug.`);
    const { data: existing } = await svc.from('invitations').select('id').eq('slug', requestedSlug).maybeSingle();
    if (existing) return err(`Slug "${requestedSlug}" is already taken.`);
    slug = requestedSlug;
  } else {
    slug = await generateUniqueSlug(category, customerName ?? '');
  }

  const now = new Date().toISOString();

  // 1. Insert invitation
  const { data: invRow, error: invErr } = await svc
    .from('invitations')
    .insert({
      user_id:        ownerUserId,
      slug,
      category,
      variant:        'couple',
      template_id:    'kompralo-master-wedding-v1',
      plan_id:        planId,
      status:         statusInput,
      theme_id:       'ivory-editorial',
      title:          'Mi invitación digital',
      subtitle:       '',
      customer_email: customerEmail,
      created_at:     now,
      updated_at:     now,
    })
    .select('id')
    .single();

  if (invErr || !invRow) return err(`DB error (invitation): ${invErr?.message ?? 'no data'}`, 500);
  const invitationId: string = invRow.id;

  // 2. Insert invitation_content with default content from final approved template
  const defaultContent = buildDefaultInvitationContentForSupabase(invitationId);
  const { error: contentErr } = await svc.from('invitation_content').insert(defaultContent);

  if (contentErr) return err(`DB error (content): ${contentErr.message}`, 500);

  // 3. Optional manual order
  let orderId: string | null = null;
  if (createOrder) {
    const fakeSessionId = `admin_manual_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const { data: orderRow } = await svc.from('orders').insert({
      stripe_session_id: fakeSessionId,
      product_id:        planId,
      plan_id:           planId,
      amount_total:      PLAN_AMOUNTS[planId] ?? 0,
      currency:          'mxn',
      status:            'paid',
      invitation_id:     invitationId,
      customer_email:    customerEmail,
      customer_name:     customerName,
      owner_user_id:     ownerUserId,
      metadata:          { source: 'admin_manual_creation', admin_email: admin.email },
      created_at:        now,
      updated_at:        now,
    }).select('id').single();
    orderId = orderRow?.id ?? null;
  }

  // 4. Audit log
  await createAdminAuditLog({
    adminUserId:  admin.id,
    adminEmail:   admin.email,
    action:       'invitation.create',
    entityType:   'invitation',
    entityId:     invitationId,
    after:        { slug, category, planId, status: statusInput, customerEmail, ownerUserId, orderId },
  });

  return NextResponse.json({
    invitationId,
    slug,
    orderId,
    ownerUserId,
    publicLink:          publicUrl(slug),
    editorLink:          editorUrl(invitationId),
    clientDashboardLink: clientDashboardUrl(invitationId),
  });
}
