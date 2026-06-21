import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  // 1. Verify auth
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return err('No autorizado.', 401);

  // 2. Parse body
  let body: unknown;
  try { body = await request.json(); } catch { return err('Cuerpo inválido.', 400); }
  const { rsvpMode } = body as Record<string, unknown>;

  if (rsvpMode !== 'open' && rsvpMode !== 'passes_only') {
    return err('Modo inválido. Usa "open" o "passes_only".', 422);
  }

  // 3. Verify ownership + update
  const svc = createServiceRoleSupabaseClient();

  const { data: inv } = await svc
    .from('invitations')
    .select('id')
    .eq('id', id)
    .eq('customer_email', user.email)
    .single();

  if (!inv) return err('Invitación no encontrada.', 404);

  const { error } = await svc
    .from('invitations')
    .update({ rsvp_mode: rsvpMode, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return err('Error al guardar el modo.', 500);

  return NextResponse.json({ success: true, rsvpMode });
}
