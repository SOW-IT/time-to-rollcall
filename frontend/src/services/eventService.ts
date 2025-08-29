import { firestore } from "@/lib/firebase";
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { Attendee, AttendeeId } from "interfaces/AttendeeTypes";
import { Event, EventId, GroupId } from "interfaces/EventTypes";

export async function getEventById(groupId: GroupId, eventId: EventId) {
    const snapshot = await getDoc(
        doc(firestore, "groups", groupId, "events", eventId)
    );
    const fetchedEvent = snapshot.data() as Event;
    fetchedEvent.eventId = eventId;
    fetchedEvent.groupId = groupId;
    return fetchedEvent;
}

export async function getAttendeeById(attendeeId: AttendeeId) {
    const snapshot = await getDoc(doc(firestore, "users", attendeeId));
    const fetchedAttendee = snapshot.data() as Attendee;
    fetchedAttendee.id = attendeeId;
    return fetchedAttendee;
}

export async function getAttendanceList(
    groupId: GroupId,
    eventId: EventId
): Promise<Attendee[]> {
    const fetchedEvent = await getEventById(groupId, eventId);
    const attendanceList: Attendee[] = [];
    fetchedEvent.attendees.forEach(async (attendeeId) => {
        attendanceList.push(await getAttendeeById(attendeeId));
    });
    return attendanceList;
}

export async function setAttendeeGoing(
    groupId: GroupId,
    eventId: EventId,
    attendeeId: AttendeeId
) {
    await updateDoc(doc(firestore, "groups", groupId, "events", eventId), {
        attendees: arrayUnion(attendeeId),
    });
    // updateDoc(doc(firestore, "users", attendeeId, groupId), {
    //     eventId: true,
    // });
}

export async function addAttendeeGoing(
    groupId: GroupId,
    eventId: EventId,
    firstName: string,
    lastName: string
): Promise<Attendee> {
    const newAttendee = {
        firstName: firstName,
        lastName: lastName,
    } as Attendee;
    addDoc(collection(firestore, "users"), newAttendee).then((attendee) => {
        setAttendeeGoing(groupId, eventId, attendee.id);
        newAttendee.id = attendee.id;
    });
    return newAttendee;
}

export async function removeAttendeeGoing(
    groupId: GroupId,
    eventId: EventId,
    attendeeId: AttendeeId
) {
    await updateDoc(doc(firestore, "groups", groupId, "events", eventId), {
        attendees: arrayRemove(attendeeId),
    });
    // updateDoc(doc(firestore, "Attendee", attendeeId, groupId), {
    //     eventId: deleteField(),
    // });
}
