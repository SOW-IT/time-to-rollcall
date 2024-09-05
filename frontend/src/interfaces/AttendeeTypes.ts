export type AttendeeId = string;

export interface Attendee {
  id: AttendeeId;
  firstName: string;
  lastName: string;
  email?: string;
}
