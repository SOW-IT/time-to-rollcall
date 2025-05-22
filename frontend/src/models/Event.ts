import { GroupId } from "./Group";
import { MemberModel } from "./Member";
import { TagModel } from "./Tag";
import { University } from "./University";

export type EventId = string;

export interface EventModel {
  groupId?: GroupId;
  id: EventId;
  name: string;
  tags: TagModel[];
  dateStart: Date;
  dateEnd: Date;
  members?: MemberInformation[];
  collaboration?: GroupId[];
}

export interface MemberInformation {
  member: MemberModel;
  signInTime?: Date;
  notes?: string;
}

export const InitEvent = (campus?: string): EventModel => {
  if (!campus) {
    return {
      id: "placeholder",
      name: "",
      tags: [],
      dateStart: new Date(),
      dateEnd: new Date(new Date().getTime() + 7200000),
    };
  }
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

  let daysUntilWeeklyMeeting =
    (campus === University.UNSW || campus === University.MACQ ? 3 : 2) -
    dayOfWeek; // 3 is Wednesday

  // If today is after Wednesday (Thursday or later), get next Wednesday
  if (daysUntilWeeklyMeeting < 0) {
    daysUntilWeeklyMeeting += 7;
  }

  // Get next Wednesday's date
  const nextWeeklyMeetingDay = new Date(today);
  nextWeeklyMeetingDay.setDate(today.getDate() + daysUntilWeeklyMeeting);

  // Set the time for 5 PM (17:00)
  const dateStart = new Date(nextWeeklyMeetingDay);
  dateStart.setHours(campus === University.UTS ? 16 : 17, 0, 0, 0); // 17:00:00

  // Set the time for 7 PM (19:00)
  const dateEnd = new Date(nextWeeklyMeetingDay);
  dateEnd.setHours(campus === University.UTS ? 18 : 19, 0, 0, 0); // 19:00:00

  return {
    id: "placeholder",
    name: "",
    tags: [],
    dateStart,
    dateEnd,
  };
};
