import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { canWriteInvitation } from '@/lib/auth/invitation-ownership';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let sessionUserId: string | null = null;
  let sessionEmail: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    sessionUserId = user?.id ?? null;
    sessionEmail  = user?.email ?? null;
  } catch {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  if (!sessionUserId) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const svc = createServiceRoleSupabaseClient();

  const { data: invitation, error: fetchError } = await svc
    .from('invitations')
    .select('id, status, user_id, customer_email')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !invitation) {
    return NextResponse.json({ error: 'Invitación no encontrada.' }, { status: 404 });
  }

  const canPublish = await canWriteInvitation(invitation, {
    id: sessionUserId,
    email: sessionEmail,
  });

  if (!canPublish) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  if (invitation.status === 'deleted' || invitation.status === 'archived') {
    return NextResponse.json(
      { error: 'No se puede publicar una invitación eliminada o archivada.' },
      { status: 400 },
    );
  }

  const { error: updateError } = await svc
    .from('invitations')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json(
      { error: `Error al publicar: ${updateError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
