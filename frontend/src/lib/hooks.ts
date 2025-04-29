import {
  auth,
  convertCollectionToJavascript,
  convertToJavascript,
  firestore,
} from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { addGroupToUserGroups, removeGroupFromUserGroups } from "./users";
import { User } from "@/models/User";
import { GroupModel } from "@/models/Group";
import { MemberModel } from "@/models/Member";
import { EventModel } from "@/models/Event";
import { useRouter } from "next/navigation";
import { Path } from "@/helper/Path";
import {
  collection,
  doc,
  documentId,
  Firestore,
  FirestoreError,
  onSnapshot,
  orderBy,
  query,
  QueryFieldFilterConstraint,
  QueryOrderByConstraint,
  where,
} from "firebase/firestore";
import { MetadataModel } from "@/models/Metadata";
import { University, universityIds } from "@/models/University";

export function useUserListener() {
  const [userAuth, loadingAuth] = useAuthState(auth);

  const id = userAuth?.uid || "placeholder";
  const { data: userData } = useFirestoreDoc<User>(
    firestore,
    "users",
    id,
    !loadingAuth
  );

  return userData ? ({ ...userAuth, ...userData, id } as User) : userData;
}

export function useGroupListener(
  user: User | null | undefined,
  groupId: string
) {
  const router = useRouter();
  const onBeforeFetch = async () => {
    if (user && !user.groups?.includes(groupId)) {
      await addGroupToUserGroups(groupId, user?.id);
    }
  };

  const onAfterFetch = async (data: GroupModel | null | undefined) => {
    if (data === undefined && user) {
      removeGroupFromUserGroups(groupId, user?.id).then(() =>
        router.push(Path.Group)
      );
    }
  };

  const { data: group } = useFirestoreDoc<GroupModel>(
    firestore,
    "groups",
    groupId,
    user !== null,
    onBeforeFetch,
    onAfterFetch
  );

  return group;
}

export function useGroupsListener(user: User | null | undefined) {
  const { data: groups } = useFirestoreCol<GroupModel>(
    firestore,
    "groups",
    user !== null,
    undefined,
    undefined,
    undefined,
    undefined,
    where(documentId(), "in", user?.groups ?? ["placeholder"])
  );

  return groups;
}

export function useMembersListener(
  user: User | null | undefined,
  year: string,
  groupId?: string
) {
  const { data: members } = useFirestoreCol<MemberModel>(
    firestore,
    `groups/${groupId}/members/${year}/members`,
    user !== null && groupId && user?.groups?.includes(groupId) ? true : false,
    orderBy("name", "asc")
  );
  const { data: members1 } = useFirestoreCol<MemberModel>(
    firestore,
    `groups/${universityIds[University.USYD]}/members/${year}/members`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.USYD] &&
      universityIds[University.USYD]
      ? true
      : false,
    orderBy("name", "asc")
  );
  const { data: members2 } = useFirestoreCol<MemberModel>(
    firestore,
    `groups/${universityIds[University.UTS]}/members/${year}/members`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.UTS] &&
      universityIds[University.UTS]
      ? true
      : false,
    orderBy("name", "asc")
  );
  const { data: members3 } = useFirestoreCol<MemberModel>(
    firestore,
    `groups/${universityIds[University.UNSW]}/members/${year}/members`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.UNSW] &&
      universityIds[University.UNSW]
      ? true
      : false,
    orderBy("name", "asc")
  );
  const { data: members4 } = useFirestoreCol<MemberModel>(
    firestore,
    `groups/${universityIds[University.MACQ]}/members/${year}/members`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.MACQ] &&
      universityIds[University.MACQ]
      ? true
      : false,
    orderBy("name", "asc")
  );
  const { data: members5 } = useFirestoreCol<MemberModel>(
    firestore,
    `groups/${universityIds[University.SOW]}/members/${year}/members`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.SOW] &&
      universityIds[University.SOW]
      ? true
      : false,
    orderBy("name", "asc")
  );
  return members
    ?.concat(members1 ?? [])
    .concat(members2 ?? [])
    .concat(members3 ?? [])
    .concat(members4 ?? [])
    .concat(members5 ?? []);
}

export function useMetadataListener(
  user: User | null | undefined,
  groupId?: string
) {
  const { data: metadata } = useFirestoreCol<MetadataModel>(
    firestore,
    `groups/${groupId}/metadata`,
    user !== null && groupId && user?.groups?.includes(groupId) ? true : false,
    orderBy("order", "asc")
  );
  return metadata;
}

export function useTagsListener(
  user: User | null | undefined,
  groupId?: string
) {
  const { data: tags } = useFirestoreCol<MemberModel>(
    firestore,
    `groups/${groupId}/tags`,
    user !== null && groupId && user?.groups?.includes(groupId) ? true : false
  );
  return tags;
}

export function useEventsListener(
  user: User | null | undefined,
  year: string,
  groupId?: string
) {
  const { data: events } = useFirestoreCol<EventModel>(
    firestore,
    `groups/${groupId}/events`,
    user !== null && groupId && user?.groups?.includes(groupId) ? true : false,
    orderBy("dateEnd", "desc"),
    undefined,
    undefined,
    "members",
    where("dateStart", ">=", new Date(`${year}-01-01`)),
    where("dateStart", "<=", new Date(`${Number(year) + 1}-01-01`))
  );
  const { data: events1 } = useFirestoreCol<EventModel>(
    firestore,
    `groups/${universityIds[University.USYD]}/events`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.USYD] &&
      universityIds[University.USYD]
      ? true
      : false,
    orderBy("dateEnd", "desc"),
    undefined,
    undefined,
    "members",
    where("dateStart", ">=", new Date(`${year}-01-01`)),
    where("dateStart", "<=", new Date(`${Number(year) + 1}-01-01`)),
    where("collaboration", "array-contains", groupId)
  );
  const { data: events2 } = useFirestoreCol<EventModel>(
    firestore,
    `groups/${universityIds[University.UNSW]}/events`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.UNSW] &&
      universityIds[University.UNSW]
      ? true
      : false,
    orderBy("dateEnd", "desc"),
    undefined,
    undefined,
    "members",
    where("dateStart", ">=", new Date(`${year}-01-01`)),
    where("dateStart", "<=", new Date(`${Number(year) + 1}-01-01`)),
    where("collaboration", "array-contains", groupId)
  );
  const { data: events3 } = useFirestoreCol<EventModel>(
    firestore,
    `groups/${universityIds[University.UTS]}/events`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.UTS] &&
      universityIds[University.UTS]
      ? true
      : false,
    orderBy("dateEnd", "desc"),
    undefined,
    undefined,
    "members",
    where("dateStart", ">=", new Date(`${year}-01-01`)),
    where("dateStart", "<=", new Date(`${Number(year) + 1}-01-01`)),
    where("collaboration", "array-contains", groupId)
  );
  const { data: events4 } = useFirestoreCol<EventModel>(
    firestore,
    `groups/${universityIds[University.MACQ]}/events`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.MACQ] &&
      universityIds[University.MACQ]
      ? true
      : false,
    orderBy("dateEnd", "desc"),
    undefined,
    undefined,
    "members",
    where("dateStart", ">=", new Date(`${year}-01-01`)),
    where("dateStart", "<=", new Date(`${Number(year) + 1}-01-01`)),
    where("collaboration", "array-contains", groupId)
  );
  const { data: events5 } = useFirestoreCol<EventModel>(
    firestore,
    `groups/${universityIds[University.SOW]}/events`,
    user !== null &&
      Object.values(universityIds).includes(groupId ?? "") &&
      groupId !== universityIds[University.SOW] &&
      universityIds[University.SOW]
      ? true
      : false,
    orderBy("dateEnd", "desc"),
    undefined,
    undefined,
    "members",
    where("dateStart", ">=", new Date(`${year}-01-01`)),
    where("dateStart", "<=", new Date(`${Number(year) + 1}-01-01`)),
    where("collaboration", "array-contains", groupId)
  );
  return events
    ?.concat(
      events1?.map((e) => ({
        ...e,
        groupId: universityIds[University.USYD],
      })) ?? []
    )
    .concat(
      events2?.map((e) => ({
        ...e,
        groupId: universityIds[University.UNSW],
      })) ?? []
    )
    .concat(
      events3?.map((e) => ({ ...e, groupId: universityIds[University.UTS] })) ??
        []
    )
    .concat(
      events4?.map((e) => ({
        ...e,
        groupId: universityIds[University.MACQ],
      })) ?? []
    )
    .concat(
      events5?.map((e) => ({
        ...e,
        groupId: universityIds[University.SOW],
      })) ?? []
    )
    .sort((a, b) => (a.dateStart < b.dateStart ? 1 : -1));
}

export function useEventListener(
  user: User | null | undefined,
  groupId: string,
  eventId: string
) {
  const { data: event } = useFirestoreDoc<EventModel>(
    firestore,
    `groups/${groupId}/events`,
    eventId,
    user !== null,
    async () => {
      if (user && !user.groups?.includes(groupId)) {
        await addGroupToUserGroups(groupId, user?.id);
      }
    }
  );

  return event;
}

const useFirestoreCol = <T>(
  db: Firestore,
  col: string,
  trigger: boolean,
  orderBy?: QueryOrderByConstraint,
  onBeforeFetch?: () => Promise<void>,
  onAfterFetch?: (data: T[] | null) => void,
  dontHandleField?: string,
  ...constraints: QueryFieldFilterConstraint[]
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (onBeforeFetch) {
        await onBeforeFetch();
      }
      const docRef =
        constraints && orderBy
          ? query(collection(db, col), ...constraints, orderBy)
          : constraints
          ? query(collection(db, col), ...constraints)
          : orderBy
          ? query(collection(db, col), orderBy)
          : collection(db, col);

      const unsubscribe = onSnapshot(
        docRef,
        async (document) => {
          const colData = (await convertCollectionToJavascript(
            document.docs,
            dontHandleField
          )) as T[];
          if (colData.length === 0) {
            setData([]);
            setLoading(false);
            if (onAfterFetch) {
              onAfterFetch([]);
            }
          } else {
            setData(colData);
            setLoading(false);
            if (onAfterFetch) {
              onAfterFetch(colData);
            }
          }
        },
        (error) => {
          setError(error);
          setData([]);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    };

    if (trigger) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [db, col, trigger]);

  return { data, loading, error };
};

const useFirestoreDoc = <T>(
  db: Firestore,
  collection: string,
  docId: string,
  trigger: boolean,
  onBeforeFetch?: () => Promise<void>,
  onAfterFetch?: (data: T | null | undefined) => void
) => {
  const [data, setData] = useState<T | null | undefined>(null);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (onBeforeFetch) {
        await onBeforeFetch();
      }
      const docRef = doc(db, collection, docId);
      const unsubscribe = onSnapshot(
        docRef,
        async (document) => {
          if (document.exists()) {
            const docData = await convertToJavascript(document);
            setData(docData as T);
            if (onAfterFetch) {
              onAfterFetch(docData as T);
            }
          } else {
            setData(undefined);
            if (onAfterFetch) {
              onAfterFetch(undefined);
            }
          }
        },
        (error) => {
          setError(error);
          setData(undefined);
        }
      );
      return () => unsubscribe();
    };

    if (trigger) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [db, collection, docId, trigger]);

  return { data, error };
};
