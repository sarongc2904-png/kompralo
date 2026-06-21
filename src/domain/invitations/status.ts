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
  // 'paid' = payment confirmed, invitation active — should be publicly accessible.
  // 'published' = explicitly published (same as paid in practice; no separate publish step in UI).
  return status === 'published' || status === 'paid';
}

export function isPreviewableInvitationStatus(status: InvitationStatus): boolean {
  return status !== 'deleted';
}
