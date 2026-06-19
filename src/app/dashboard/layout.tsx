import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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

const NAV_LINKS = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/dashboard/invitations', label: 'Invitaciones' },
  { href: '/dashboard/rsvps', label: 'RSVPs' },
  { href: '/dashboard/features', label: 'Features' },
  { href: '/', label: '<- Ver sitio' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const adminMode = isAdminMode();

  if (!adminMode) {
    const user = await getSessionUser();
    if (!user) {
      const headersList = await headers();
      const pathname = headersList.get('x-pathname') ?? '/dashboard';
      redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }

  return (
    <DashboardShell adminMode={adminMode} navLinks={NAV_LINKS}>
      {children}
    </DashboardShell>
  );
}
