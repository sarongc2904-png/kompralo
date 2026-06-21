/**
 * Supabase implementation of IRSVPRepository.
 *
 * NOT ACTIVE — rsvpRepository in repository.ts still points to
 * LocalRSVPRepository. Swap in FASE 6C once the schema is applied
 * and environment variables are set.
 *
 * Expected table: `rsvp_responses`
 * Expected columns (snake_case):
 *   id (uuid, generated), invitation_id (uuid FK → invitations.id),
 *   name (text), phone (text, nullable), attendance (text: yes/no/maybe),
 *   guest_count (int), message (text, nullable),
 *   status (text: pending/confirmed/cancelled, default 'pending'),
 *   created_at (timestamptz, default now()), updated_at (timestamptz, default now())
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IRSVPRepository } from '@/domain/rsvp/repository.types';
import type {
  RSVPResponse,
  RSVPSubmissionInput,
  RSVPSubmissionResult,
} from '@/domain/rsvp/types';
import type { Database } from '@/lib/supabase/types';

// ─── Row type ────────────────────────────────────────────────────────────────
// TODO: replace with generated type from `supabase gen types`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseRSVPRow = Record<string, any>;

// ─── Adapter ─────────────────────────────────────────────────────────────────

export function mapRSVPRowToRSVPResponse(row: SupabaseRSVPRow): RSVPResponse {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    name: row.name,
    phone: row.phone ?? undefined,
    attendance: row.attendance,
    guestCount: row.guest_count,
    message: row.message ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class SupabaseRSVPRepository implements IRSVPRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async submit(input: RSVPSubmissionInput): Promise<RSVPSubmissionResult> {
    // Pre-generate the id so we can return it without a subsequent SELECT.
    // A SELECT after INSERT with the anon key is blocked by rsvp_select_owner
    // (which requires auth.uid() = invitation owner).
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const { error } = await this.supabase
      .from('rsvp_responses')
      .insert({
        id,
        invitation_id: input.invitationId,
        name: input.name,
        phone: input.phone ?? null,
        attendance: input.attendance,
        guest_count: input.guestCount,
        message: input.message ?? null,
        status: 'pending',
      });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      response: {
        id,
        invitationId: input.invitationId,
        name: input.name,
        phone: input.phone,
        attendance: input.attendance,
        guestCount: input.guestCount,
        message: input.message,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
    };
  }

  async listByInvitationId(invitationId: string): Promise<RSVPResponse[]> {
    const { data, error } = await this.supabase
      .from('rsvp_responses')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapRSVPRowToRSVPResponse);
  }

  async countByInvitationId(invitationId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('rsvp_responses')
      .select('*', { count: 'exact', head: true })
      .eq('invitation_id', invitationId);

    if (error || count === null) return 0;
    return count;
  }
}
