"use client";
import Topbar from "@/components/Topbar";
import { Path } from "@/helper/Path";
import { UserContext } from "@/lib/context";
import { firestore } from "@/lib/firebase";
import { useGroupsListener } from "@/lib/hooks";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function GroupAdmin() {
  const user = useContext(UserContext);
  const groups = useGroupsListener(user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user?.role !== "admin") {
        router.push(Path.Group);
      }
    }
    // eslint-disable-next-line
  }, [user]);

  const removeMembersFromEventGroup = async (groupId: string) => {
    console.log("Working on group: " + groupId);
    const events = await getDocs(
      collection(firestore, "groups", groupId, "events")
    );
    for (const event of events.docs) {
      console.log("Working on event: " + event.data().name);
      const data = event.data();
      if (data.members) {
        console.log("Member count: " + data.members.length);
        const updatedMembers = [];
        for (const m of data.members) {
          const memb = await getDoc(m.member);
          if (memb.exists()) {
            updatedMembers.push(m);
          }
        }
        await updateDoc(doc(firestore, "groups", groupId, "events", event.id), {
          members: updatedMembers,
        });
        console.log("Member count after removal: " + updatedMembers.length);
      }
    }
    console.log("Finish group: " + groupId);
  };

  const removeMembersFromEvent = async () => {
    groups?.map((g) => removeMembersFromEventGroup(g.id));
  };

  const addOrderToMetadata = async () => {
    console.log("start");
    // await changeMembersForGroup("ccSgQTXvLRnin0OjwvRM");
    // for (const group of groups ?? []) {
    //   const mds = await getMetadatas(group.id);
    //   let index = 1;
    //   for (const md of mds) {
    //     await updateMetadata(group.id, { ...md, order: index });
    //     ++index;
    //   }
    // }
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
            onClick={() => addOrderToMetadata()}
          >
            Change Members
          </button>
          <button
            type="button"
            className="p-2 bg-slate-200"
            onClick={() => removeMembersFromEvent()}
          >
            Remove Members that don't exist
          </button>
        </div>
      </>
    )
  );
}
