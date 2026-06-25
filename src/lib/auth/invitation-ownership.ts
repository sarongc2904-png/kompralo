import 'server-only';
import { isAdminUser } from '@/lib/admin';

export interface InvitationOwnershipRow {
  user_id?: string | null;
  customer_email?: string | null;
}

export interface InvitationSessionUser {
  id: string;
  email?: string | null;
}

export async function canWriteInvitation(
  invitation: InvitationOwnershipRow,
  user: InvitationSessionUser,
): Promise<boolean> {
  const sessionEmail = user.email?.toLowerCase() ?? null;
  const ownerEmail = invitation.customer_email?.toLowerCase() ?? null;

  if (invitation.user_id && invitation.user_id === user.id) return true;
  if (ownerEmail && sessionEmail && ownerEmail === sessionEmail) return true;

  return isAdminUser(user.id, user.email);
}
