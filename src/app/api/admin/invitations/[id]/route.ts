/**
 * GET  /api/admin/invitations/[id]  — full invitation row
 * PATCH /api/admin/invitations/[id] — plan_id | status | soft_delete | restore | reassign_to_user_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute, createAdminAuditLog, isReservedSlug } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { normalizePlanId } from '@/domain/plans/types';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const VALID_STATUSES = new Set([
  'draft', 'preview', 'pending_payment', 'paid', 'published', 'paused', 'cancelled', 'archived', 'deleted',
]);

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  const { id } = await params;
  const svc = createServiceRoleSupabaseClient();

  const { data, error } = await svc
    .from('invitations')
    .select('*, invitation_content(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) return err(error.message, 500);
  if (!data) return err('Not found', 404);

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  const { id } = await params;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return err('Invalid JSON'); }

  const svc = createServiceRoleSupabaseClient();
  const now = new Date().toISOString();

  // Fetch current state for audit log
  const { data: current } = await svc
    .from('invitations')
    .select('id, slug, plan_id, status, user_id, deleted_at')
    .eq('id', id)
    .maybeSingle();

  if (!current) return err('Invitation not found', 404);

  const patch: Record<string, unknown> = { updated_at: now };
  const auditAfter: Record<string, unknown> = {};

  // ─── Change plan ─────────────────────────────────────────────────────────────
  if ('plan_id' in body) {
    const newPlan = normalizePlanId(body.plan_id as string);
    patch.plan_id = newPlan;
    auditAfter.plan_id = newPlan;
  }

  // ─── Change status ───────────────────────────────────────────────────────────
  if ('status' in body) {
    const newStatus = body.status as string;
    if (!VALID_STATUSES.has(newStatus)) return err(`Invalid status. Valid: ${[...VALID_STATUSES].join(', ')}`);
    patch.status = newStatus;
    auditAfter.status = newStatus;
  }

  // ─── Soft delete ─────────────────────────────────────────────────────────────
  if (body.soft_delete === true) {
    if (current.deleted_at) return err('Invitation is already deleted');
    patch.deleted_at = now;
    patch.deleted_by  = admin.userId;
    patch.status      = 'deleted';
    auditAfter.deleted_at = now;
    auditAfter.status     = 'deleted';
  }

  // ─── Restore ─────────────────────────────────────────────────────────────────
  if (body.restore === true) {
    if (!current.deleted_at) return err('Invitation is not deleted');
    patch.deleted_at = null;
    patch.deleted_by  = null;
    patch.status      = 'paid';
    auditAfter.deleted_at = null;
    auditAfter.status     = 'paid';
  }

  // ─── Reassign ownership ──────────────────────────────────────────────────────
  if ('reassign_to_user_id' in body) {
    const newOwner = typeof body.reassign_to_user_id === 'string' ? body.reassign_to_user_id.trim() : null;
    patch.user_id = newOwner;
    auditAfter.user_id = newOwner;
  }

  // ─── Slug change ─────────────────────────────────────────────────────────────
  if (typeof body.slug === 'string') {
    const newSlug = body.slug.trim();
    if (!newSlug) return err('Slug cannot be empty');
    if (isReservedSlug(newSlug)) return err(`"${newSlug}" is a reserved slug`);
    const { data: collision } = await svc.from('invitations').select('id').eq('slug', newSlug).maybeSingle();
    if (collision && collision.id !== id) return err(`Slug "${newSlug}" is already taken`);
    patch.slug = newSlug;
    auditAfter.slug = newSlug;
  }

  if (Object.keys(patch).length === 1) return err('No changes specified');

  const { error: updateErr } = await svc.from('invitations').update(patch).eq('id', id);
  if (updateErr) return err(updateErr.message, 500);

  await createAdminAuditLog({
    adminUserId:  admin.id,
    adminEmail:   admin.email,
    action:       'invitation.update',
    entityType:   'invitation',
    entityId:     id,
    before:       { plan_id: current.plan_id, status: current.status, user_id: current.user_id, slug: current.slug, deleted_at: current.deleted_at },
    after:        auditAfter,
  });

  return NextResponse.json({ success: true });
}
