import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { requireInvitationWriteAccess, WRITE_ACCESS_DENIED_MESSAGE } from '@/lib/access/requireInvitationWriteAccess';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const svc = createServiceRoleSupabaseClient();

  const { data: invitation, error: fetchError } = await svc
    .from('invitations')
    .select('id, status, user_id, customer_email')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !invitation) {
    return NextResponse.json({ error: 'Invitación no encontrada.' }, { status: 404 });
  }

  // Dual gate: Auth owner/admin OR scoped access cookie — the publish button
  // lives in the cookie-accessible editor, so auth-only locked out
  // cookie-only customers.
  const access = await requireInvitationWriteAccess(id, invitation);

  if (!access.authorized) {
    return NextResponse.json({ error: WRITE_ACCESS_DENIED_MESSAGE }, { status: 403 });
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
