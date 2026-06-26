import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { canManageInvitation } from '@/lib/invitations/can-manage';

type Params = { params: Promise<{ id: string; passId: string }> };

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>) {
  return {
    id:            row.id,
    invitationId:  row.invitation_id,
    guestName:     row.guest_name,
    allowedGuests: row.allowed_guests,
    passToken:     row.pass_token,
    status:        row.status as string,
    checkedInAt:   row.checked_in_at ?? undefined,
    updatedAt:     row.updated_at,
  };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { id, passId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !user?.email) return err('No autorizado.', 401);

  if (!(await canManageInvitation(id, user.id, user.email))) return err('Acceso denegado.', 403);

  const svc = createServiceRoleSupabaseClient();

  const { data: current } = await svc
    .from('guest_passes')
    .select('id, invitation_id, status, checked_in_at, guest_name')
    .eq('id', passId)
    .single();

  if (!current || current.invitation_id !== id) return err('Pase no encontrado.', 404);

  // Idempotent: already checked in — return current state without writing again
  if (current.checked_in_at || current.status === 'used') {
    const { data: fresh } = await svc.from('guest_passes').select('*').eq('id', passId).single();
    return NextResponse.json({ pass: mapRow(fresh!), alreadyCheckedIn: true });
  }

  const now = new Date().toISOString();
  const { data: row, error } = await svc
    .from('guest_passes')
    .update({ checked_in_at: now, status: 'used', updated_at: now })
    .eq('id', passId)
    .select()
    .single();

  if (error || !row) return err('Error al registrar entrada.', 500);
  return NextResponse.json({ pass: mapRow(row), alreadyCheckedIn: false }, { status: 200 });
}
