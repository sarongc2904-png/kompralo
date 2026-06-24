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

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !user?.email) return err('No autorizado.', 401);

  if (!(await canManageInvitation(id, user.id, user.email))) return err('Acceso denegado.', 403);

  const svc = createServiceRoleSupabaseClient();
  const { data, error } = await svc
    .from('guest_passes')
    .select('*')
    .eq('invitation_id', id)
    .order('created_at', { ascending: false });

  if (error) return err('Error al obtener pases.', 500);
  return NextResponse.json({ passes: (data ?? []).map(mapRow) });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !user?.email) return err('No autorizado.', 401);

  if (!(await canManageInvitation(id, user.id, user.email))) return err('Acceso denegado.', 403);

  let body: unknown;
  try { body = await request.json(); } catch { return err('Cuerpo inválido.', 400); }
  const d = body as Record<string, unknown>;

  const guestName    = typeof d.guestName    === 'string' ? d.guestName.trim() : '';
  const allowedGuests = Number(d.allowedGuests);
  const phone        = typeof d.phone === 'string' ? d.phone.trim() || null : null;

  if (!guestName)                                                    return err('guest_name es requerido.', 422);
  if (!Number.isFinite(allowedGuests) || allowedGuests < 1 || allowedGuests > 20)
                                                                     return err('allowedGuests debe ser 1–20.', 422);

  const passToken = crypto.randomUUID();
  const svc = createServiceRoleSupabaseClient();

  const { data: row, error } = await svc
    .from('guest_passes')
    .insert({ invitation_id: id, guest_name: guestName, phone, allowed_guests: allowedGuests, pass_token: passToken, status: 'pending' })
    .select()
    .single();

  if (error || !row) return err('Error al crear pase.', 500);
  return NextResponse.json({ pass: mapRow(row) }, { status: 201 });
}
