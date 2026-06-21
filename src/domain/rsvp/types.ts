export type RSVPAttendance = 'yes' | 'no' | 'maybe';

export type RSVPStatus = 'pending' | 'confirmed' | 'cancelled';

export interface RSVPResponse {
  id: string;
  invitationId: string;
  name: string;
  phone?: string;
  attendance: RSVPAttendance;
  guestCount: number;
  message?: string;
  status: RSVPStatus;
  passToken?: string;
  passCreatedAt?: string;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RSVPSubmissionInput {
  invitationId: string;
  name: string;
  phone?: string;
  attendance: RSVPAttendance;
  guestCount: number;
  message?: string;
}

export type RSVPSubmissionResult =
  | { success: true; response: RSVPResponse }
  | { success: false; error: string };
