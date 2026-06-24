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
    id:             row.id,
    invitationId:   row.invitation_id,
    guestName:      row.guest_name,
    phone:          row.phone ?? undefined,
    allowedGuests:  row.allowed_guests,
    passToken:      row.pass_token,
    status:         row.status as string,
    rsvpResponseId: row.rsvp_response_id ?? undefined,
    checkedInAt:    row.checked_in_at ?? undefined,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id, passId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !user?.email) return err('No autorizado.', 401);

  if (!(await canManageInvitation(id, user.id, user.email))) return err('Acceso denegado.', 403);

  let body: unknown;
  try { body = await request.json(); } catch { return err('Cuerpo inválido.', 400); }
  const d = body as Record<string, unknown>;

  const guestName    = typeof d.guestName === 'string' ? d.guestName.trim() : '';
  const allowedGuests = Number(d.allowedGuests);
  const phone        = typeof d.phone === 'string' ? d.phone.trim() || null : null;

  if (!guestName || guestName.length < 2) return err('El nombre debe tener al menos 2 caracteres.', 422);
  if (!Number.isFinite(allowedGuests) || allowedGuests < 1 || allowedGuests > 20)
    return err('Personas permitidas debe ser entre 1 y 20.', 422);

  const svc = createServiceRoleSupabaseClient();

  const { data: current } = await svc
    .from('guest_passes')
    .select('invitation_id, allowed_guests, status, rsvp_response_id')
    .eq('id', passId)
    .single();

  if (!current || current.invitation_id !== id) return err('Pase no encontrado.', 404);

  // Guard: if the pass already has a confirmed RSVP, do not reduce allowed_guests below confirmed total.
  if (current.rsvp_response_id && current.status === 'confirmed') {
    const { data: rsvpRow } = await svc
      .from('rsvp_responses')
      .select('guest_count')
      .eq('id', current.rsvp_response_id)
      .single();

    if (rsvpRow) {
      // guests_count = companions; total = guests_count + 1
      const confirmedTotal = Number(rsvpRow.guest_count ?? 0) + 1;
      if (allowedGuests < confirmedTotal) {
        return err(
          `Este invitado ya confirmó ${confirmedTotal} persona${confirmedTotal !== 1 ? 's' : ''}. ` +
          `No puedes bajar el límite a ${allowedGuests}. Ajusta primero la confirmación o usa un límite mayor.`,
          422,
        );
      }
    }
  }

  const { data: row, error } = await svc
    .from('guest_passes')
    .update({ guest_name: guestName, phone, allowed_guests: allowedGuests, updated_at: new Date().toISOString() })
    .eq('id', passId)
    .select()
    .single();

  if (error || !row) return err('Error al actualizar pase.', 500);
  return NextResponse.json({ pass: mapRow(row) });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, passId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !user?.email) return err('No autorizado.', 401);

  if (!(await canManageInvitation(id, user.id, user.email))) return err('Acceso denegado.', 403);

  const svc = createServiceRoleSupabaseClient();

  const { data: current } = await svc
    .from('guest_passes')
    .select('invitation_id, status')
    .eq('id', passId)
    .single();

  if (!current || current.invitation_id !== id) return err('Pase no encontrado.', 404);

  // Guard: only pending passes can be deleted.
  if (current.status !== 'pending') {
    return err(
      `No puedes eliminar un pase con estado "${current.status}". ` +
      `Solo se pueden eliminar pases pendientes.`,
      409,
    );
  }

  const { error } = await svc.from('guest_passes').delete().eq('id', passId);
  if (error) return err('Error al eliminar pase.', 500);
  return NextResponse.json({ success: true });
}
