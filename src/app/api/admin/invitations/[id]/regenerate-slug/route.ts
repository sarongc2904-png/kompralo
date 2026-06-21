/**
 * POST /api/admin/invitations/[id]/regenerate-slug
 * Generates a new unique slug for an invitation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute, createAdminAuditLog, generateUniqueSlug, publicUrl } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  const { id } = await params;
  const svc = createServiceRoleSupabaseClient();

  const { data: inv } = await svc
    .from('invitations')
    .select('id, slug, category, customer_email, deleted_at')
    .eq('id', id)
    .maybeSingle();

  if (!inv) return err('Invitation not found', 404);
  if (inv.deleted_at) return err('Cannot regenerate slug for a deleted invitation');

  const oldSlug = inv.slug as string;
  const category = (inv.category as string) ?? 'wedding';
  const namePart = (inv.customer_email as string ?? '').split('@')[0];

  const newSlug = await generateUniqueSlug(category, namePart);

  const { error: updateErr } = await svc
    .from('invitations')
    .update({ slug: newSlug, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateErr) return err(updateErr.message, 500);

  await createAdminAuditLog({
    adminUserId: admin.id,
    adminEmail:  admin.email,
    action:      'invitation.regenerate_slug',
    entityType:  'invitation',
    entityId:    id,
    before:      { slug: oldSlug },
    after:       { slug: newSlug },
  });

  return NextResponse.json({ success: true, oldSlug, newSlug, newPublicUrl: publicUrl(newSlug) });
}
