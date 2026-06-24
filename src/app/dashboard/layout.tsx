import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyInvitationAccess } from '@/lib/access/verifyInvitationAccess';
import { DashboardShell } from './DashboardShell';

function isAdminMode(): boolean {
  return process.env.ADMIN_ACCESS_ENABLED === 'true';
}

async function getSessionUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

const ADMIN_NAV_LINKS = [
  { href: '/dashboard',              label: 'Inicio' },
  { href: '/dashboard/invitations',  label: 'Invitaciones' },
  { href: '/dashboard/rsvps',        label: 'RSVPs' },
  { href: '/dashboard/features',     label: 'Features' },
  { href: '/',                       label: '<- Ver sitio' },
];

// Customers should only access their own edit page (reached from /cliente).
// They must not be able to list all invitations or see other customers' data.
const CUSTOMER_NAV_LINKS = [
  { href: '/cliente', label: '<- Mis invitaciones' },
  { href: '/',        label: '<- Ver sitio' },
];

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const adminMode = isAdminMode();

  if (!adminMode) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') ?? '/dashboard';
    const user = await getSessionUser();
    console.log('[dashLayout] pathname=%s hasUser=%s userId=%s', pathname, !!user, user?.id ?? 'null');
    const editMatch = pathname.match(/^\/dashboard\/invitations\/([^/]+)\/edit\/?$/);
    const hasScopedAccess = !user && editMatch
      ? await verifyInvitationAccess(decodeURIComponent(editMatch[1]))
      : false;

    if (!user && !hasScopedAccess) {
      console.log('[dashLayout] no session → redirect to login from %s', pathname);
      redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }

  const navLinks = adminMode ? ADMIN_NAV_LINKS : CUSTOMER_NAV_LINKS;

  return (
    <DashboardShell adminMode={adminMode} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
