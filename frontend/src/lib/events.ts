import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  where,
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import {
  convertCollectionToJavascript,
  convertToFirestore,
  convertToJavascript,
  firestore,
} from "@/lib/firebase";
import { EventId, EventModel, MemberInformation } from "@/models/Event";
import { GroupId } from "@/models/Group";
import { convertTagIdToReference } from "./tags";
import { convertMemberIdToReference } from "./members";
import { TagModel } from "@/models/Tag";

export async function getEventsAsc(groupId: GroupId) {
  const events = await getDocs(
    query(
      collection(firestore, "groups", groupId, "events"),
      orderBy("dateStart", "asc"),
      orderBy("dateEnd", "asc")
    )
  );
  return (await convertCollectionToJavascript(events.docs)) as EventModel[];
}

export async function getEventsDesc(groupId: GroupId) {
  const events = await getDocs(
    query(
      collection(firestore, "groups", groupId, "events"),
      orderBy("dateEnd", "desc"),
      orderBy("dateStart", "desc")
    )
  );
  return (await convertCollectionToJavascript(events.docs)) as EventModel[];
}

export async function getEventsByTag(groupId: GroupId, tags: TagModel[]) {
  if (tags.length === 0) {
    return getEventsAsc(groupId);
  }
  const events = await getDocs(
    query(
      collection(firestore, "groups", groupId, "events"),
      where(
        "tags",
        "array-contains-any",
        tags.map((t) => doc(firestore, "groups", groupId, "tags", t.id))
      ),
      orderBy("dateStart", "asc"),
      orderBy("dateEnd", "asc")
    )
  );
  return (await convertCollectionToJavascript(events.docs)) as EventModel[];
}

export async function getEvent(groupId: GroupId, eventId: EventId) {
  const event = await getDoc(
    doc(firestore, "groups", groupId, "events", eventId)
  );
  return (await convertToJavascript(event)) as EventModel;
}

export async function submitEvent(groupId: GroupId, event: EventModel) {
  const { tags, ...eventWithoutTags } = event;
  const addedDoc = await addDoc(
    collection(firestore, "groups", groupId, "events"),
    {
      ...convertToFirestore(eventWithoutTags),
      tags: tags.map((t) => doc(firestore, "groups", groupId, "tags", t.id)),
    }
  );
  return { ...event, id: addedDoc.id };
}

export async function updateEvent(groupId: GroupId, event: EventModel) {
  await updateDoc(
    doc(firestore, "groups", groupId, "events", event.id),
    convertEventToDocument(groupId, event)
  );
}

export async function deleteEvent(groupId: GroupId, eventId: EventId) {
  await deleteDoc(doc(firestore, "groups", groupId, "events", eventId));
}

function convertEventToDocument(groupId: GroupId, event: EventModel) {
  const { tags, members, ...eventWithoutId } = event;
  return {
    ...convertToFirestore(eventWithoutId),
    tags: tags.map((t) => convertTagIdToReference(groupId, t.id)),
    members:
      members?.map((m) => ({
        ...m,
        member: convertMemberIdToReference(groupId, m.member.id),
      })) ?? [],
  };
}

export async function updateEventMembers(
  groupId: GroupId,
  eventId: EventId,
  members: MemberInformation[]
) {
  await updateDoc(doc(firestore, "groups", groupId, "events", eventId), {
    members:
      members?.map((m) => ({
        ...m,
        member: m.member.docRef,
      })) ?? [],
  });
}

export async function addMemberToEvent(
  groupId: GroupId,
  eventId: EventId,
  memberDocRef: DocumentReference
) {
  await updateDoc(doc(firestore, "groups", groupId, "events", eventId), {
    members: arrayUnion({
      member: memberDocRef,
      signInTime: new Date(),
    }),
  });
}

export async function removeMemberFromEvent(
  groupId: GroupId,
  eventId: EventId,
  memberInfo?: MemberInformation
) {
  memberInfo &&
    memberInfo.signInTime &&
    (await updateDoc(doc(firestore, "groups", groupId, "events", eventId), {
      members: arrayRemove({
        ...memberInfo,
        member: memberInfo.member.docRef,
        signInTime: Timestamp.fromDate(memberInfo.signInTime),
      }),
    }));
}
