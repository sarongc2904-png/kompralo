'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUserForApiRoute } from '@/lib/admin';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

async function patchInvitation(id: string, body: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUserForApiRoute();
  if (!admin) return { success: false, error: 'No autorizado' };

  const svc = createServiceRoleSupabaseClient();
  const now = new Date().toISOString();

  if (body.soft_delete) {
    const { error } = await svc
      .from('invitations')
      .update({ deleted_at: now, status: 'deleted' })
      .eq('id', id)
      .is('deleted_at', null);
    if (error) return { success: false, error: error.message };
  } else if (body.restore) {
    const { error } = await svc
      .from('invitations')
      .update({ deleted_at: null, status: 'paid' })
      .eq('id', id)
      .not('deleted_at', 'is', null);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/admin/invitations');
  return { success: true };
}

export async function softDeleteInvitation(id: string) {
  return patchInvitation(id, { soft_delete: true });
}

export async function restoreInvitation(id: string) {
  return patchInvitation(id, { restore: true });
}
