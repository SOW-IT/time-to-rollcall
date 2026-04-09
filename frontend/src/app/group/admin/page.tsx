"use client";
import Topbar from "@/components/Topbar";
import { Path } from "@/helper/Path";
import { UserContext } from "@/lib/context";
import { firestore } from "@/lib/firebase";
import {
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function GroupAdmin() {
  const user = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user?.role !== "admin") {
        router.push(Path.Group);
      }
    }
    // eslint-disable-next-line
  }, [user]);

  const removeDuplicateMembers = (
    members?: { member: DocumentReference; signInTime: Timestamp }[],
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

  const removeDuplicates = async () => {
    for (const groupId of [
      "ccSgQTXvLRnin0OjwvRM",
      "CZHRnKJ8SDnfMIw64WJu",
      "MUSmSaufEfgdJUX4Kx4G",
      "wrsDV3XfwQB4RD7BxKD2",
    ]) {
      const events = await getDocs(
        collection(firestore, "groups", groupId, "events"),
      );
      for (const e of events.docs) {
        console.log("Updating Event Doc: ", e.data().name);
        await updateDoc(doc(firestore, "groups", groupId, "events", e.id), {
          members: removeDuplicateMembers(e.data().members),
        });
      }
    }
  };

  const removeStray = async () => {
    console.log("start");
    for (const groupId of [
      "ccSgQTXvLRnin0OjwvRM",
      "CZHRnKJ8SDnfMIw64WJu",
      "MUSmSaufEfgdJUX4Kx4G",
      "wrsDV3XfwQB4RD7BxKD2",
    ]) {
      console.log(groupId);
      const events = await getDocs(
        collection(firestore, "groups", groupId, "events"),
      );
      for (const e of events.docs) {
        for (const member of e.data().members) {
          const d = await getDoc(member.member);
          if (!d.exists()) {
            console.log("Removing:", member.member);
            await updateDoc(doc(firestore, "groups", groupId, "events", e.id), {
              members: e
                .data()
                .members.filter(
                  (m: { member: DocumentReference }) =>
                    m.member !== member.member,
                ),
            });
          }
        }
      }
    }
    console.log("end");
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
            onClick={() => removeDuplicates()}
          >
            Remove Duplicates
          </button>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => removeStray()}
          >
            Remove Stray
          </button>
        </div>
      </>
    )
  );
}
