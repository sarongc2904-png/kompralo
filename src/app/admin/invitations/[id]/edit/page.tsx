import { requireAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';

interface Props { params: Promise<{ id: string }> }

/**
 * Admin edit — verifies admin role then redirects to the existing editor.
 * The dashboard editor already has ADMIN_ACCESS_ENABLED bypass for ownership.
 * Admin RLS policies (from admin_migration.sql) allow the anon client to
 * read and update any invitation when the admin is logged in.
 */
export default async function AdminEditInvitationPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  redirect(`/dashboard/invitations/${id}/edit?from=admin`);
}
