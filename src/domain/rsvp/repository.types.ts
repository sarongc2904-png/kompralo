import type { RSVPResponse, RSVPSubmissionInput, RSVPSubmissionResult } from '@/domain/rsvp/types';

export interface IRSVPRepository {
  submit(input: RSVPSubmissionInput): Promise<RSVPSubmissionResult>;
  listByInvitationId(invitationId: string): Promise<RSVPResponse[]>;
  countByInvitationId(invitationId: string): Promise<number>;
}
