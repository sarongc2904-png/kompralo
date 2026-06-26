import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { canManageInvitation } from '@/lib/invitations/can-manage';

type Params = { params: Promise<{ id: string }> };

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>) {
  return {
    id:            row.id,
    invitationId:  row.invitation_id,
    guestName:     row.guest_name,
    phone:         row.phone ?? undefined,
    allowedGuests: row.allowed_guests,
    passToken:     row.pass_token,
    status:        row.status as string,
    checkedInAt:   row.checked_in_at ?? undefined,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !user?.email) return err('No autorizado.', 401);

  if (!(await canManageInvitation(id, user.id, user.email))) return err('Acceso denegado.', 403);

  // Accept full pass URL or raw token
  const rawToken = req.nextUrl.searchParams.get('token') ?? '';
  const token = rawToken.includes('/pass/')
    ? (rawToken.split('/pass/').pop() ?? '').split('?')[0].trim()
    : rawToken.trim();

  if (!token) return err('Token requerido.', 400);

  const svc = createServiceRoleSupabaseClient();
  const { data: row, error } = await svc
    .from('guest_passes')
    .select('*')
    .eq('pass_token', token)
    .single();

  if (error || !row) return err('Pase no encontrado.', 404);
  if (row.invitation_id !== id) return err('Este pase no pertenece a esta invitación.', 403);

  return NextResponse.json({ pass: mapRow(row) });
}
