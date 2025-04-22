"use client";
import Topbar from "@/components/Topbar";
import { Path } from "@/helper/Path";
import { UserContext } from "@/lib/context";
import { firestore } from "@/lib/firebase";
import { useMembersListener } from "@/lib/hooks";
import { convertMemberIdToReference } from "@/lib/members";
import {
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function GroupAdmin() {
  const user = useContext(UserContext);
  const router = useRouter();
  const members = useMembersListener(user, "2025", "ccSgQTXvLRnin0OjwvRM");

  useEffect(() => {
    if (user) {
      if (user?.role !== "admin") {
        router.push(Path.Group);
      }
    }
    // eslint-disable-next-line
  }, [user]);

  const universityIds = {
    1: "ccSgQTXvLRnin0OjwvRM",
    2: "CZHRnKJ8SDnfMIw64WJu",
    3: "MUSmSaufEfgdJUX4Kx4G",
    4: "wrsDV3XfwQB4RD7BxKD2",
  };

  const replaceMember = (
    from: DocumentReference,
    to: DocumentReference,
    members?: { member: DocumentReference; signInTime: Timestamp }[]
  ) => {
    return members?.map((m) =>
      m.member.id === from.id ? { member: to, signInTime: m.signInTime } : m
    );
  };

  const removeDuplicateMembers = (
    members?: { member: DocumentReference; signInTime: Timestamp }[]
  ) => {
    if (!members || members.length === 0) return [];

    const seen = new Map<
      string,
      { member: DocumentReference; signInTime: Timestamp }
    >();
    for (const entry of members) {
      const path = entry.member.path;
      if (!seen.has(path)) {
        seen.set(path, entry);
      }
    }

    return Array.from(seen.values());
  };

  const combineSameName = async () => {
    if (members) {
      for (const member of members) {
        const sameNames = members.filter((m) => m.name === member.name);
        if (sameNames.length > 1) {
          console.log("Duplicate member:", member.name);
          const chosenPerson = sameNames.reduce((max, current) =>
            (current.metadata?.length ?? 0) > (max.metadata?.length ?? 0)
              ? current
              : max
          );
          const others = sameNames.filter((m) => m.id !== chosenPerson.id);

          console.log(
            "Others:",
            sameNames.map((sn) => sn.id)
          );
          console.log("Chosen:", chosenPerson.id);

          for (const other of others) {
            for (const groupId of [
              "ccSgQTXvLRnin0OjwvRM",
              "CZHRnKJ8SDnfMIw64WJu",
              "MUSmSaufEfgdJUX4Kx4G",
              "wrsDV3XfwQB4RD7BxKD2",
            ]) {
              const events = await getDocs(
                collection(firestore, "groups", groupId, "events")
              );
              for (const e of events.docs) {
                console.log(
                  "Updating Event Doc for member: ",
                  chosenPerson.name,
                  e.data().name
                );
                await updateDoc(
                  doc(firestore, "groups", groupId, "events", e.id),
                  {
                    members: replaceMember(
                      other.docRef ??
                        convertMemberIdToReference(groupId, other.id),
                      chosenPerson.docRef ??
                        convertMemberIdToReference(groupId, chosenPerson.id),
                      e.data().members
                    ),
                  }
                );
              }
            }
            await deleteDoc(
              other.docRef ??
                convertMemberIdToReference("ccSgQTXvLRnin0OjwvRM", other.id)
            );
          }
        }
      }
    }
    console.log("done");
  };

  const move = async (groupId: string, otherUnisList: string[]) => {
    console.log("start", groupId);
    const otherCampuses = await getDocs(
      query(
        collection(firestore, "groups", groupId, "members", "2025", "members"),
        where("metadata.wOoTm2Vtr1geLVZMh0Kl", "in", otherUnisList)
      )
    );
    console.log(otherCampuses.docs);
    for (const d of otherCampuses.docs) {
      console.log("Searching original uni for: ", d.data().name);
      const originalUniId =
        universityIds[
          (d.data().metadata?.["wOoTm2Vtr1geLVZMh0Kl"] ??
            "5") as keyof typeof universityIds
        ];
      if (originalUniId) {
        console.log("Original Uni Exists: ", d.data().name);
        const originalMember = await getDoc(
          doc(
            firestore,
            "groups",
            originalUniId,
            "members",
            "2025",
            "members",
            d.id
          )
        );
        if (originalMember.exists()) {
          console.log("Original Member Exists: ", d.data().name);
          const events = await getDocs(
            collection(firestore, "groups", groupId, "events")
          );
          for (const e of events.docs) {
            console.log(
              "Updating Event Doc for member: ",
              d.data().name,
              e.data().name
            );
            await updateDoc(doc(firestore, "groups", groupId, "events", e.id), {
              members: replaceMember(
                convertMemberIdToReference(groupId, d.id),
                convertMemberIdToReference(originalUniId, originalMember.id),
                e.data().members
              ),
            });
          }
        } else {
          const originalMembers = await getDocs(
            query(
              collection(
                firestore,
                "groups",
                originalUniId,
                "members",
                "2025",
                "members"
              ),
              where("name", "==", d.data().name)
            )
          );
          if (originalMembers.size == 1) {
            console.log("Original Member Exists by Name: ", d.data().name);
            for (const omd of originalMembers.docs) {
              const events = await getDocs(
                collection(firestore, "groups", groupId, "events")
              );
              for (const e of events.docs) {
                console.log(
                  "Updating Event Doc for member: ",
                  d.data().name,
                  e.data().name
                );
                await updateDoc(
                  doc(firestore, "groups", groupId, "events", e.id),
                  {
                    members: replaceMember(
                      convertMemberIdToReference(groupId, d.id),
                      convertMemberIdToReference(originalUniId, omd.id),
                      e.data().members
                    ),
                  }
                );
              }
            }
          } else {
            console.log(
              "Original Member Doesn't Exist, adding to Uni: ",
              d.data().name
            );
            await setDoc(
              doc(
                firestore,
                "groups",
                originalUniId,
                "members",
                "2025",
                "members",
                d.id
              ),
              d.data()
            );
            const events = await getDocs(
              collection(firestore, "groups", groupId, "events")
            );
            for (const e of events.docs) {
              console.log(
                "Updating Event Doc for member: ",
                d.data().name,
                e.data().name
              );
              await updateDoc(
                doc(firestore, "groups", groupId, "events", e.id),
                {
                  members: replaceMember(
                    convertMemberIdToReference(groupId, d.id),
                    convertMemberIdToReference(originalUniId, d.id),
                    e.data().members
                  ),
                }
              );
            }
          }
        }
      }
      console.log("Deleting member from current campus: ", d.data().name);
      await deleteDoc(
        doc(firestore, "groups", groupId, "members", "2025", "members", d.id)
      );
    }
    console.log("end");
  };

  const removeDuplicates = async () => {
    for (const groupId of [
      "ccSgQTXvLRnin0OjwvRM",
      "CZHRnKJ8SDnfMIw64WJu",
      "MUSmSaufEfgdJUX4Kx4G",
      "wrsDV3XfwQB4RD7BxKD2",
    ]) {
      const events = await getDocs(
        collection(firestore, "groups", groupId, "events")
      );
      for (const e of events.docs) {
        console.log("Updating Event Doc: ", e.data().name);
        await updateDoc(doc(firestore, "groups", groupId, "events", e.id), {
          members: removeDuplicateMembers(e.data().members),
        });
      }
    }
  };

  return (
    user && (
      <>
        <Topbar />
        <div className="mx-4">
          <h1 className="text-2xl text-gray-700 mb-4">Admin Page</h1>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => move("ccSgQTXvLRnin0OjwvRM", ["2", "3", "4"])}
          >
            Move UNSW
          </button>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => move("CZHRnKJ8SDnfMIw64WJu", ["1", "3", "4"])}
          >
            Move MACQ
          </button>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => move("MUSmSaufEfgdJUX4Kx4G", ["1", "2", "4"])}
          >
            Move USYD
          </button>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => move("wrsDV3XfwQB4RD7BxKD2", ["1", "2", "3"])}
          >
            Move UTS
          </button>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => move("T4qzZ5X3pGqJgJ8CMOtk", ["1", "2", "3", "4"])}
          >
            Move SOW
          </button>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => combineSameName()}
          >
            Combine Same Name
          </button>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => removeDuplicates()}
          >
            Remove Duplicates
          </button>
        </div>
      </>
    )
  );
}
