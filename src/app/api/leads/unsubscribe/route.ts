import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe-token';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    return NextResponse.redirect(new URL('/unsubscribed?error=missing', req.url));
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(new URL('/unsubscribed?error=invalid', req.url));
  }

  const supabase = createServiceRoleSupabaseClient();
  await supabase.from('email_leads')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('email', email);

  return NextResponse.redirect(new URL('/unsubscribed', req.url));
}
