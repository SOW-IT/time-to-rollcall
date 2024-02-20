import { Timestamp } from "firebase/firestore";
import { AttendeeId } from "./AttendeeTypes";

export type EventId = string;

export type GroupId = string;

export interface Event {
    groupId: GroupId;
    eventId: EventId;
    name: string;
    dateStart: Timestamp;
    dateEnd: Timestamp;
    tags: string[];
    attendees: AttendeeId[];
}
