import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

/**
 * Returns true if userId/email is authorized to manage this invitation's guest passes.
 * Authorization order:
 * 1. invitation.user_id === userId  (direct auth owner)
 * 2. invitation.customer_email === email  (case-insensitive)
 * 3. A paid order for invitation_id with customer_email === email exists
 */
export async function canManageInvitation(
  invitationId: string,
  userId: string,
  email: string,
): Promise<boolean> {
  const svc = createServiceRoleSupabaseClient();
  const emailLower = email.toLowerCase();

  const { data: inv } = await svc
    .from('invitations')
    .select('user_id, customer_email')
    .eq('id', invitationId)
    .single();

  if (!inv) return false;
  if (inv.user_id && inv.user_id === userId) return true;
  if (typeof inv.customer_email === 'string' && inv.customer_email.toLowerCase() === emailLower) return true;

  const { count } = await svc
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('invitation_id', invitationId)
    .eq('status', 'paid')
    .ilike('customer_email', emailLower);

  return (count ?? 0) > 0;
}
