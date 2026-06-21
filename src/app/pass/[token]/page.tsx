import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import PassCard from './PassCard';
import GuestPassCard from './GuestPassCard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const svc = createServiceRoleSupabaseClient();

  const { data: gp } = await svc.from('guest_passes').select('guest_name').eq('pass_token', token).single();
  if (gp) return { title: `Pase de ${gp.guest_name} — Kompralo` };

  const { data: rsvp } = await svc.from('rsvp_responses').select('name').eq('pass_token', token).single();
  if (rsvp) return { title: `Pase de ${rsvp.name} — Kompralo` };

  return { title: 'Pase de entrada — Kompralo' };
}

export default async function PassPage({ params }: Props) {
  const { token } = await params;
  const svc = createServiceRoleSupabaseClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const passUrl = `${appUrl}/pass/${token}`;

  // Check guest_passes first
  const { data: gp } = await svc
    .from('guest_passes')
    .select('id, guest_name, allowed_guests, pass_token, status, checked_in_at, invitation_id')
    .eq('pass_token', token)
    .single();

  if (gp) {
    const { data: inv } = await svc
      .from('invitations')
      .select('title, event_date')
      .eq('id', gp.invitation_id)
      .single();

    return (
      <GuestPassCard
        passId={gp.id}
        invitationId={gp.invitation_id}
        guestName={gp.guest_name}
        allowedGuests={gp.allowed_guests}
        passToken={token}
        passUrl={passUrl}
        status={gp.status}
        checkedInAt={gp.checked_in_at ?? null}
        eventTitle={inv?.title ?? 'Mi evento'}
        eventDate={inv?.event_date ?? null}
      />
    );
  }

  // Fall back to rsvp_responses pass
  const { data: rsvp } = await svc
    .from('rsvp_responses')
    .select('id, name, phone, attendance, guest_count, pass_token, pass_created_at, checked_in_at, invitation_id')
    .eq('pass_token', token)
    .single();

  if (!rsvp) notFound();

  const { data: inv } = await svc
    .from('invitations')
    .select('title, subtitle, event_date, event_time, category')
    .eq('id', rsvp.invitation_id)
    .single();

  return (
    <PassCard
      guestName={rsvp.name}
      attendance={rsvp.attendance}
      guestCount={Number(rsvp.guest_count ?? 0)}
      eventTitle={inv?.title ?? 'Mi evento'}
      eventDate={inv?.event_date ?? null}
      passToken={token}
      passUrl={passUrl}
      checkedInAt={rsvp.checked_in_at ?? null}
    />
  );
}
