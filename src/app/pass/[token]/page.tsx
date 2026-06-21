import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import PassCard from './PassCard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const svc = createServiceRoleSupabaseClient();
  const { data } = await svc
    .from('rsvp_responses')
    .select('name')
    .eq('pass_token', token)
    .single();

  if (!data) return { title: 'Pase de entrada — Kompralo' };
  return { title: `Pase de ${data.name} — Kompralo` };
}

export default async function PassPage({ params }: Props) {
  const { token } = await params;

  const svc = createServiceRoleSupabaseClient();

  const { data: rsvp } = await svc
    .from('rsvp_responses')
    .select('id, name, phone, attendance, guest_count, pass_token, pass_created_at, checked_in_at, invitation_id')
    .eq('pass_token', token)
    .single();

  if (!rsvp) {
    notFound();
  }

  const { data: inv } = await svc
    .from('invitations')
    .select('title, subtitle, event_date, event_time, category')
    .eq('id', rsvp.invitation_id)
    .single();

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const passUrl = `${appUrl}/pass/${token}`;

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
