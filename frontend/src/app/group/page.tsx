"use client";
import AuthCheck from "@/components/AuthCheck";
import GroupBadge from "@/components/event/GroupBadge";
import EditGroup from "@/components/group/EditGroup";
import { Path } from "@/helper/Path";
import { UserContext } from "@/lib/context";
import { createGroup } from "@/lib/groups";
import { useGroupsData } from "@/lib/hooks";
import { GroupModel, InitGroup } from "@/models/Group";
import { getUniversityKey, University } from "@/models/University";
import Link from "next/link";
import { useContext, useState } from "react";

export default function Groups() {
  const user = useContext(UserContext);
  const groups = useGroupsData(user);
  const [group, setGroup] = useState<GroupModel>(InitGroup);

  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function createGroupIn() {
    setUpdating(true);
    if (user && group) {
      await createGroup(user, group, []);
    }
    setUpdating(false);
    closeModal();
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <AuthCheck>
      <div className="mx-6">
        <h1 className="text-2xl mt-6 mb-3">Your Groups</h1>
        <div className="flex flex-wrap gap-2 my-4">
          {groups?.map((group, i) =>
            getUniversityKey(group.name as University) ? (
              <Link key={i} href={`${Path.Group}/${group.id}`}>
                <GroupBadge
                  campus={group.name as University}
                  className="px-4"
                />
              </Link>
            ) : (
              <Link
                key={i}
                href={`${Path.Group}/${group.id}`}
                className="bg-gray-900 rounded-full py-1 px-4 text-white font-light text-center"
              >
                {group.name}
              </Link>
            )
          )}
        </div>
        <EditGroup
          isOpen={isOpen}
          closeModal={closeModal}
          group={group}
          setGroup={setGroup}
          submit={createGroupIn}
          updating={updating}
        />
        <button
          className="bg-blue-100 rounded-full py-1 px-4 font-light text-center"
          onClick={openModal}
        >
          Create New Group +
        </button>
      </div>
    </AuthCheck>
  );
}
