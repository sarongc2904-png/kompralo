/**
 * PATCH /api/admin/orders/[id] — corrige el customer_email de una orden.
 * Propaga el nuevo email a la invitación vinculada (si la orden tiene una).
 * Requiere sesión admin. Registra audit log.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute, createAdminAuditLog } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RouteContext { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  const { id } = await params;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return err('Invalid JSON'); }

  const rawEmail = typeof body.customer_email === 'string' ? body.customer_email.trim() : '';
  if (!rawEmail) return err('customer_email es requerido');
  if (rawEmail.length > 254 || !EMAIL_RE.test(rawEmail)) return err('Correo inválido');
  const newEmail = rawEmail.toLowerCase();

  const svc = createServiceRoleSupabaseClient();

  const { data: order } = await svc
    .from('orders')
    .select('id, customer_email, invitation_id')
    .eq('id', id)
    .maybeSingle();
  if (!order) return err('Orden no encontrada', 404);

  const { error: updErr } = await svc
    .from('orders')
    .update({ customer_email: newEmail, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (updErr) return err(updErr.message, 500);

  // Propagar a la invitación vinculada.
  let invitationEmailBefore: string | null = null;
  if (order.invitation_id) {
    const { data: inv } = await svc
      .from('invitations')
      .select('customer_email')
      .eq('id', order.invitation_id)
      .maybeSingle();
    invitationEmailBefore = inv?.customer_email ?? null;
    await svc
      .from('invitations')
      .update({ customer_email: newEmail, updated_at: new Date().toISOString() })
      .eq('id', order.invitation_id);
  }

  await createAdminAuditLog({
    adminUserId: admin.id,
    adminEmail:  admin.email,
    action:      'order.update',
    entityType:  'order',
    entityId:    id,
    before:      { customer_email: order.customer_email, invitation_customer_email: invitationEmailBefore },
    after:       { customer_email: newEmail, invitation_id: order.invitation_id },
    metadata:    { field: 'customer_email' },
  });

  return NextResponse.json({ success: true, customer_email: newEmail });
}
