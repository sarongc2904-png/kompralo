export const invitationStatuses = [
  'draft',
  'preview',
  'pending_payment',
  'paid',
  'published',
  'archived',
  'deleted',
] as const;

export type InvitationStatus = (typeof invitationStatuses)[number];

export function isPublicInvitationStatus(status: InvitationStatus): boolean {
  return status === 'published';
}

export function isPreviewableInvitationStatus(status: InvitationStatus): boolean {
  return status !== 'deleted';
}
