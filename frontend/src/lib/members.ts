import { currentSOWYearStr } from "@/helper/Time";
import { convertToFirestore, firestore } from "@/lib/firebase";
import { GroupId } from "@/models/Group";
import { MemberId, MemberModel } from "@/models/Member";
import { UserId } from "@/models/User";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  setDoc,
} from "firebase/firestore";

export async function createMember(
  groupId: GroupId,
  member: MemberModel,
  userId?: UserId
) {
  const ref = await addDoc(
    collection(
      firestore,
      "groups",
      groupId,
      "members",
      currentSOWYearStr,
      "members"
    ),
    convertMemberToDocument(member, userId)
  );
  return { ...member, id: ref.id, docRef: ref } as MemberModel;
}

export async function updateMember(
  docRef: DocumentReference,
  member: MemberModel
) {
  await setDoc(docRef, convertMemberToDocument(member));
}

export async function deleteMember(docRef?: DocumentReference) {
  if (!docRef) {
    return Promise.reject("Document reference is missing");
  }
  await deleteDoc(docRef);
}

function convertMemberToDocument(member: MemberModel, userId?: UserId) {
  const { metadata, ...memberWithoutId } = member;
  if (metadata) {
    return {
      ...convertToFirestore(memberWithoutId),
      metadata,
      createdBy: userId,
    };
  }
  return convertToFirestore(memberWithoutId);
}

export function convertMemberIdToReference(
  groupId: GroupId,
  memberId: MemberId
) {
  return doc(
    firestore,
    "groups",
    groupId,
    "members",
    currentSOWYearStr,
    "members",
    memberId
  );
}
