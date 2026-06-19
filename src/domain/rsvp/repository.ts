import type { IRSVPRepository } from '@/domain/rsvp/repository.types';
import type { RSVPResponse, RSVPSubmissionInput, RSVPSubmissionResult } from '@/domain/rsvp/types';
import { SupabaseRSVPRepository } from '@/domain/rsvp/supabase.repository';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@supabase/supabase-js';

// ─── Local repository (fallback) ─────────────────────────────────────────────

function generateId(): string {
  return `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class LocalRSVPRepository implements IRSVPRepository {
  private store: RSVPResponse[] = [];

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[LocalRSVPRepository] WARNING: running without Supabase in production. ' +
          'RSVP data will be lost on restart. Set NEXT_PUBLIC_SUPABASE_URL and ' +
          'NEXT_PUBLIC_SUPABASE_ANON_KEY to activate Supabase.',
      );
    }
  }

  async submit(input: RSVPSubmissionInput): Promise<RSVPSubmissionResult> {
    const now = new Date().toISOString();
    const response: RSVPResponse = {
      id: generateId(),
      invitationId: input.invitationId,
      name: input.name,
      phone: input.phone,
      attendance: input.attendance,
      guestCount: input.guestCount,
      message: input.message,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.store.push(response);
    return { success: true, response };
  }

  async listByInvitationId(invitationId: string): Promise<RSVPResponse[]> {
    return this.store.filter((r) => r.invitationId === invitationId);
  }

  async countByInvitationId(invitationId: string): Promise<number> {
    return this.store.filter((r) => r.invitationId === invitationId).length;
  }
}

// ─── Fallback-aware repository ────────────────────────────────────────────────

class FallbackRSVPRepository implements IRSVPRepository {
  constructor(
    private readonly primary: IRSVPRepository,
    private readonly fallback: IRSVPRepository,
  ) {}

  async submit(input: RSVPSubmissionInput): Promise<RSVPSubmissionResult> {
    try {
      const result = await this.primary.submit(input);
      console.log('[Supabase] rsvp.submit() OK — id: %s', result.success ? result.response.id : 'error');
      return result;
    } catch (err) {
      console.warn('[Fallback Local] rsvp.submit() — Supabase error:', err);
      return this.fallback.submit(input);
    }
  }

  async listByInvitationId(invitationId: string): Promise<RSVPResponse[]> {
    try {
      const result = await this.primary.listByInvitationId(invitationId);
      console.log('[Supabase] rsvp.listByInvitationId(%s) — %d rows', invitationId, result.length);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] rsvp.listByInvitationId(%s) — Supabase error:', invitationId, err);
      return this.fallback.listByInvitationId(invitationId);
    }
  }

  async countByInvitationId(invitationId: string): Promise<number> {
    try {
      const result = await this.primary.countByInvitationId(invitationId);
      console.log('[Supabase] rsvp.countByInvitationId(%s) — %d', invitationId, result);
      return result;
    } catch (err) {
      console.warn('[Fallback Local] rsvp.countByInvitationId(%s) — Supabase error:', invitationId, err);
      return this.fallback.countByInvitationId(invitationId);
    }
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

function buildRSVPRepository(): IRSVPRepository {
  const env = tryGetSupabaseEnv();

  if (!env) {
    console.log('[Fallback Local] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set — using local RSVP repository.');
    return new LocalRSVPRepository();
  }

  const supabaseClient = createClient(env.url, env.anonKey);
  const supabase = new SupabaseRSVPRepository(supabaseClient);
  const local = new LocalRSVPRepository();
  console.log('[Supabase] rsvpRepository initialized — primary: Supabase, fallback: Local');
  return new FallbackRSVPRepository(supabase, local);
}

export const rsvpRepository: IRSVPRepository = buildRSVPRepository();
