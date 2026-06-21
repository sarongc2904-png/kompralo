/**
 * GET /api/admin/users/lookup-by-email?email=...
 * Looks up an auth.users entry by email. Used by the admin invitation form
 * to pre-fill Owner User ID before creating an invitation manually.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserForApiRoute } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? '';
  if (!email) return NextResponse.json({ error: 'email param required' }, { status: 400 });

  const svc = createServiceRoleSupabaseClient();
  const { data: listData, error } = await svc.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    return NextResponse.json({ error: 'Error al consultar auth.users' }, { status: 500 });
  }

  const match = (listData?.users ?? []).find(u => u.email?.toLowerCase() === email);

  if (match) {
    return NextResponse.json({ found: true, userId: match.id, email: match.email });
  }

  return NextResponse.json({
    found: false,
    userId: null,
    message: 'No existe usuario Auth con este email. La invitación se creará sin owner, pero con customer_email.',
  });
}
