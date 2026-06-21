/**
 * GET /api/admin/invitations/[id]/orders
 * Returns all orders linked to an invitation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return err('Unauthorized', 403);

  const { id } = await params;
  const svc = createServiceRoleSupabaseClient();

  const { data, error } = await svc
    .from('orders')
    .select('*')
    .eq('invitation_id', id)
    .order('created_at', { ascending: false });

  if (error) return err(error.message, 500);

  return NextResponse.json(data ?? []);
}
