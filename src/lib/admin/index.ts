/**
 * Admin helpers for KOMPRALO dashboard.
 * All functions that touch admin_users use createServiceRoleSupabaseClient
 * to bypass RLS (no permissive policy on admin_users).
 *
 * SERVER-ONLY: do not import from 'use client' files.
 * For URL/message helpers safe in client components, import from '@/lib/admin/urls'.
 */

import 'server-only';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';

// Re-export URL helpers so server components can keep using '@/lib/admin'.
export {
  getAppUrl,
  publicUrl,
  previewUrl,
  editorUrl,
  clientDashboardUrl,
  adminInvitationUrl,
  whatsappClientMessage,
  whatsappGuestsMessage,
} from '@/lib/admin/urls';

export interface AdminUser {
  id: string;
  userId: string;
  email: string;
  role: 'admin' | 'superadmin';
}

// ─── Session helpers ──────────────────────────────────────────────────────────

async function getCurrentAuthUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Verifies the current request is from an admin.
 * Throws a redirect to /login if not authenticated,
 * or renders "not authorized" if authenticated but not admin.
 * Use in Server Components and Server Actions (not API routes).
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentAuthUser();
  if (!user) {
    // Redirect to login, preserving the current path so the admin returns here after login.
    const hdrs = await headers();
    const currentPath = hdrs.get('x-pathname') ?? '/admin';
    const safeRedirect = currentPath.startsWith('/') ? currentPath : '/admin';
    redirect(`/login?redirect=${encodeURIComponent(safeRedirect)}`);
  }

  const svc = createServiceRoleSupabaseClient();
  const { data } = await svc
    .from('admin_users')
    .select('id, user_id, email, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) {
    // Authenticated but not an admin — send to cliente, not back to login (avoids loop).
    redirect('/cliente');
  }

  return {
    id:     data.id,
    userId: data.user_id,
    email:  data.email,
    role:   data.role as 'admin' | 'superadmin',
  };
}

/**
 * Returns the admin user for API route handlers, or null if not admin.
 * Does NOT throw — caller must return a 403 response.
 */
export async function getAdminUserForApiRoute(): Promise<AdminUser | null> {
  try {
    const user = await getCurrentAuthUser();
    if (!user) return null;

    const svc = createServiceRoleSupabaseClient();
    const { data } = await svc
      .from('admin_users')
      .select('id, user_id, email, role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) return null;

    return {
      id:     data.id,
      userId: data.user_id,
      email:  data.email,
      role:   data.role as 'admin' | 'superadmin',
    };
  } catch {
    return null;
  }
}

/**
 * Quick boolean check — use when you just need to know, not to block.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  try {
    const svc = createServiceRoleSupabaseClient();
    const { data } = await svc
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Returns true if the given user can edit the given invitation.
 * Admin bypasses ownership check.
 */
export async function canEditInvitation(
  userId: string,
  invitationUserId: string | null,
): Promise<boolean> {
  if (userId === invitationUserId) return true;
  return isAdminUser(userId);
}

// ─── Audit log ────────────────────────────────────────────────────────────────

export interface CreateAuditLogParams {
  adminUserId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export async function createAdminAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const svc = createServiceRoleSupabaseClient();
    await svc.from('admin_audit_logs').insert({
      admin_user_id: params.adminUserId,
      admin_email:   params.adminEmail,
      action:        params.action,
      entity_type:   params.entityType,
      entity_id:     params.entityId   ?? null,
      before:        params.before     ?? null,
      after:         params.after      ?? null,
      metadata:      params.metadata   ?? null,
    });
  } catch (e) {
    console.error('[Admin] createAdminAuditLog failed:', e);
  }
}

// ─── Slug utilities ───────────────────────────────────────────────────────────

export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'auth', 'login', 'cliente', 'dashboard', 'preview',
  'pass', 'entrada', 'invitaciones', 'invitacion', 'modelos', 'pricing',
  'checkout', 'success', 'cancel', 'i', 'error', 'not-found',
  '_next', 'favicon.ico',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim());
}

export function generateBaseSlug(category: string, namePart = ''): string {
  const catMap: Record<string, string> = {
    wedding:      'boda',
    baptism:      'bautizo',
    'baby-shower': 'baby-shower',
    birthday:     'cumple',
  };
  const cat = catMap[category] ?? category;
  const name = namePart
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
  const random = Math.random().toString(36).slice(2, 7);
  return name ? `${cat}-${name}-${random}` : `${cat}-${random}`;
}

export async function generateUniqueSlug(
  category: string,
  namePart: string,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateBaseSlug(category, namePart);
    if (isReservedSlug(slug)) continue;

    const svc = createServiceRoleSupabaseClient();
    const { data } = await svc
      .from('invitations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) return slug;
  }
  // Fallback with timestamp
  return `invitacion-${Date.now().toString(36)}`;
}

