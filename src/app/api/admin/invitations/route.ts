/**
 * POST /api/admin/invitations
 * Create an invitation manually (no Stripe required).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute, createAdminAuditLog, generateUniqueSlug, isReservedSlug, publicUrl, editorUrl, clientDashboardUrl } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { normalizePlanId } from '@/domain/plans/types';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const VALID_CATEGORIES = new Set(['wedding', 'baptism', 'baby-shower', 'birthday']);
const VALID_STATUSES   = new Set(['draft', 'paid', 'published']);

export async function POST(request: NextRequest) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return err('Invalid JSON'); }

  const customerEmail  = typeof body.customer_email  === 'string' ? body.customer_email.trim()  : '';
  const customerName   = typeof body.customer_name   === 'string' ? body.customer_name.trim()   : null;
  const category       = typeof body.category        === 'string' ? body.category               : 'wedding';
  const ownerUserId    = typeof body.owner_user_id   === 'string' && body.owner_user_id.trim() ? body.owner_user_id.trim() : null;
  const requestedSlug  = typeof body.slug            === 'string' ? body.slug.trim()            : '';
  const createOrder    = body.create_order !== false;

  if (!customerEmail) return err('customer_email is required');
  if (!VALID_CATEGORIES.has(category)) return err(`Invalid category. Valid: ${[...VALID_CATEGORIES].join(', ')}`);

  const statusInput = typeof body.status === 'string' ? body.status : 'paid';
  if (!VALID_STATUSES.has(statusInput)) return err(`Invalid status. Valid: ${[...VALID_STATUSES].join(', ')}`);

  const planId = normalizePlanId(typeof body.plan_id === 'string' ? body.plan_id : 'premium');

  // Resolve slug
  let slug: string;
  if (requestedSlug) {
    if (isReservedSlug(requestedSlug)) return err(`"${requestedSlug}" is a reserved slug.`);
    const svc = createServiceRoleSupabaseClient();
    const { data: existing } = await svc.from('invitations').select('id').eq('slug', requestedSlug).maybeSingle();
    if (existing) return err(`Slug "${requestedSlug}" is already taken.`);
    slug = requestedSlug;
  } else {
    slug = await generateUniqueSlug(category, customerName ?? '');
  }

  const svc = createServiceRoleSupabaseClient();
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
      theme_id:       'champagne',
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

  // 2. Insert invitation_content
  const { error: contentErr } = await svc.from('invitation_content').insert({
    invitation_id:        invitationId,
    protagonists:         [],
    event_time:           '',
    location:             { venueName: '', address: '', googleMapsLink: '', wazeLink: '' },
    hero:                 { emotionalPhrase: '', imageUrl: '', eventLabel: '' },
    story:                { slides: [] },
    gallery:              { images: [] },
    timeline:             [],
    itinerary:            [],
    dress_code:           { type: '', description: '', suggestions: '' },
    gift_registry:        { items: [] },
    music:                { audioUrl: '' },
    final_message:        { quote: '¡Los esperamos!' },
    parents:              [],
    padrinos:             [],
    hotels:               [],
    social:               { hashtag: '' },
    rsvp_whatsapp_number: '',
    updated_at:           now,
  });

  if (contentErr) return err(`DB error (content): ${contentErr.message}`, 500);

  // 3. Optional manual order
  let orderId: string | null = null;
  if (createOrder) {
    const fakeSessionId = `admin_manual_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const { data: orderRow } = await svc.from('orders').insert({
      stripe_session_id: fakeSessionId,
      product_id:        planId,
      plan_id:           planId,
      amount_total:      0,
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
    after:        { slug, category, planId, status: statusInput, customerEmail, orderId },
  });

  return NextResponse.json({
    invitationId,
    slug,
    orderId,
    publicLink:          publicUrl(slug),
    editorLink:          editorUrl(invitationId),
    clientDashboardLink: clientDashboardUrl(invitationId),
  });
}
