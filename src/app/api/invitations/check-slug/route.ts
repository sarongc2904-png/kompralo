import { type NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug      = searchParams.get('slug')?.toLowerCase().trim() ?? '';
  const excludeId = searchParams.get('excludeId') ?? '';

  if (!slug || slug.length < 3 || !SLUG_RE.test(slug)) {
    return NextResponse.json({ available: false, reason: 'invalid' });
  }

  try {
    const svc = createServiceRoleSupabaseClient();
    let query = svc
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug);
    if (excludeId) query = query.neq('id', excludeId);
    const { count } = await query;
    return NextResponse.json({ available: count === 0 });
  } catch {
    return NextResponse.json({ available: true });
  }
}
