/**
 * POST /api/admin/orders/[id]/access-link — genera un link de acceso NUEVO
 * (token de 7 días) para la invitación de la orden, SIN enviar email. Devuelve
 * la URL para copiar. Requiere sesión admin. Registra audit log.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute, createAdminAuditLog, getAppUrl } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createInvitationAccessToken } from '@/lib/access/createInvitationAccessToken';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  const { id } = await params;
  const svc = createServiceRoleSupabaseClient();

  const { data: order } = await svc
    .from('orders')
    .select('id, invitation_id, customer_email')
    .eq('id', id)
    .maybeSingle();
  if (!order) return err('Orden no encontrada', 404);
  if (!order.invitation_id) return err('La orden no tiene invitación vinculada');
  if (!order.customer_email) return err('La orden no tiene customer_email');

  // La invitación no debe estar eliminada (su acceso debe seguir revocado).
  const { data: inv } = await svc
    .from('invitations')
    .select('id, status')
    .eq('id', order.invitation_id)
    .maybeSingle();
  if (!inv || inv.status === 'deleted') return err('La invitación no existe o está eliminada');

  let rawToken: string;
  let expiresAt: Date;
  try {
    ({ rawToken, expiresAt } = await createInvitationAccessToken({
      invitationId:  order.invitation_id,
      orderId:       order.id,
      customerEmail: order.customer_email,
    }));
  } catch (e) {
    return err(`No se pudo crear el token: ${e instanceof Error ? e.message : String(e)}`, 500);
  }

  const accessUrl = new URL('/access/consume', getAppUrl());
  accessUrl.searchParams.set('token', rawToken);

  await createAdminAuditLog({
    adminUserId: admin.id,
    adminEmail:  admin.email,
    action:      'order.access_link',
    entityType:  'order',
    entityId:    id,
    after:       { invitationId: order.invitation_id, expiresAt: expiresAt.toISOString() },
    metadata:    { sentEmail: false },
  });

  return NextResponse.json({ url: accessUrl.toString(), expiresAt: expiresAt.toISOString() });
}
