import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, plan } = body as { email?: string; plan?: string };

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();

  await supabase.from('email_leads').upsert(
    {
      email,
      plan_interest: plan ?? null,
      source:        'exit_intent',
      metadata:      { exit_intent_at: new Date().toISOString() },
    },
    { onConflict: 'email' },
  );

  // Email will be sent by the hourly cron — not immediately
  return NextResponse.json({ success: true });
}
