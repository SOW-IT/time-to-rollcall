"use client";
import Loader from "@/components/Loader";
import Topbar from "@/components/Topbar";
import AttendanceSearchBar from "@/components/event/AttendanceSearchBar";
import EditMember from "@/components/members/EditMember";
import Members from "@/components/members/Members";
import { currentYearStr } from "@/helper/Time";
import { promiseToast } from "@/helper/Toast";
import { GroupContext, MembersContext, MetadataContext } from "@/lib/context";
import { firestore } from "@/lib/firebase";
import { createMember, deleteMember, updateMember } from "@/lib/members";
import { GroupId } from "@/models/Group";
import { InitMember, MemberModel } from "@/models/Member";
import { MetadataSelectModel } from "@/models/Metadata";
import { University, universityIds } from "@/models/University";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { doc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { searchForMemberByName } from "services/attendanceService";

export default function GroupMember({
  params,
}: {
  params: { groupId: GroupId; year: string };
}) {
  const [searchActive, setSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const members = useContext(MembersContext);
  const group = useContext(GroupContext);
  const metadata = useContext(MetadataContext);
  const [selectedMember, setSelectedMember] = useState<MemberModel>(
    InitMember("")
  );
  const [membersShown, setMembersShown] = useState<MemberModel[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLoading(false);
    setMembersShown(members ?? []);
  }, [members]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let prevSearchActive = searchActive;
      setSearchActive(searchInput.length > 0);
      if (searchInput.length > 0) {
        const { suggested } = searchForMemberByName(members ?? [], searchInput);
        setMembersShown(suggested);
        setCampusFilter("Unselected");
      } else if (prevSearchActive && searchInput.length === 0) {
        setMembersShown(members ?? []);
        setCampusFilter("Unselected");
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line
  }, [searchInput]);

  const campus = metadata?.find(
    (m) => m.key === "Campus" && m.type === "select"
  ) as MetadataSelectModel | undefined;

  const [campusFilter, setCampusFilter] = useState<University | "Unselected">(
    "Unselected"
  );
  useEffect(() => {
    if (campusFilter === "Unselected") {
      setMembersShown(members ?? []);
    } else {
      setMembersShown(
        campus && members
          ? members.filter(
              (m) =>
                m.metadata &&
                campus.values[m.metadata[campus.id]] === campusFilter
            )
          : []
      );
    }
    // eslint-disable-next-line
  }, [campusFilter]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  async function editMember() {
    setUpdating(true);
    selectedMember.name = selectedMember.name.trim();
    if (selectedMember) {
      if (selectedMember.id === "placeholder") {
        await promiseToast<MemberModel>(
          createMember(
            campus && selectedMember.metadata
              ? universityIds[
                  campus.values[selectedMember.metadata[campus.id]]
                ] ?? params.groupId
              : params.groupId,
            selectedMember
          ),
          "Creating Member...",
          "Member Created!",
          "Could not create member."
        );
      } else {
        await promiseToast<void>(
          updateMember(
            selectedMember.docRef ??
              doc(
                firestore,
                "groups",
                params.groupId,
                "members",
                currentYearStr,
                "members",
                selectedMember.id
              ),
            selectedMember
          ),
          "Updating Member...",
          "Member Updated!",
          "Could not create member."
        );
      }
    }
    setUpdating(false);
    closeModal();
    setSearchInput("");
  }

  async function deleteMemberIn() {
    setUpdatingDelete(true);
    if (group && selectedMember) {
      await promiseToast<void>(
        deleteMember(
          campus && selectedMember.metadata
            ? universityIds[
                campus.values[selectedMember.metadata[campus.id]]
              ] ?? params.groupId
            : params.groupId,
          selectedMember.id
        ),
        "Deleting Member...",
        "Member Deleted!",
        "Could not delete member."
      );
    }
    setIsOpen(false);
    setDeleteConfirmationIsOpen(false);
  }

  const [updatingDelete, setUpdatingDelete] = useState(false);
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);
  function closeDeleteConfirmationModal() {
    setUpdating(false);
    openModal();
    setDeleteConfirmationIsOpen(false);
  }

  function openDeleteConfirmationModal() {
    setUpdatingDelete(false);
    closeModal();
    setDeleteConfirmationIsOpen(true);
  }

  const disabled = currentYearStr !== params.year;

  if (loading) {
    return (
      <div className="flex justify-center items-center my-24">
        <Loader show />
      </div>
    );
  }
  return (
    <>
      <Topbar year={params.year} />
      {!disabled && (
        <EditMember
          isOpen={isOpen}
          closeModal={closeModal}
          member={selectedMember}
          setMember={setSelectedMember}
          submit={editMember}
          updating={updating}
          deleteConfirmationIsOpen={deleteConfirmationIsOpen}
          openDeleteConfirmationModal={openDeleteConfirmationModal}
          closeDeleteConfirmationModal={closeDeleteConfirmationModal}
          deleteMember={deleteMemberIn}
          updatingDelete={updatingDelete}
        />
      )}
      <h1 className="mx-4 mt-3 text-2xl mb-16">Members</h1>
      <p>Filter Campus:</p>
      <Listbox
        value={campusFilter}
        onChange={(filter) => setCampusFilter(filter)}
      >
        <ListboxButton>{campusFilter ?? "Unselected"}</ListboxButton>
        <ListboxOptions
          anchor="top"
          transition
          className="rounded-xl border border-white/5 bg-gray-100 p-1 focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
        >
          {Object.keys(universityIds)
            .concat("Unselected")
            .map((uni, i) => (
              <ListboxOption
                key={i}
                value={uni}
                onClick={() => setCampusFilter(uni as University)}
                className="group flex justify-between cursor-pointer items-center rounded-lg px-2 select-none data-[focus]:bg-white/10 data-[selected]:bg-gray-200 data-[focus]:bg-gray-200"
              >
                {uni}
              </ListboxOption>
            ))}
        </ListboxOptions>
      </Listbox>
      <div className="relative">
        <div className="mb-2">
          <AttendanceSearchBar
            disabled={false}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        </div>
        <div className="z-20 w-full">
          <Members
            members={membersShown ?? []}
            disabled={disabled}
            action={(member: MemberModel) => {
              setSelectedMember(member);
              openModal();
            }}
          />
        </div>
      </div>
      {!disabled && (
        <button
          type="button"
          className="fixed z-40 bottom-0 flex justify-center text-center text-gray-700 text-sm py-4 px-1.5 w-full rounded-lg bg-green-100 font-light active:bg-green-300"
          onClick={() => {
            setSelectedMember(
              InitMember(
                searchInput,
                metadata?.find((m) => m.key === "Campus" && m.type === "select")
                  ?.id,
                Object.entries(
                  (
                    metadata?.find(
                      (m) => m.key === "Campus" && m.type === "select"
                    ) as MetadataSelectModel | undefined
                  )?.values ?? {}
                ).find(([_, v]) => v === group?.name)?.[0]
              )
            );
            openModal();
          }}
        >
          Create New Member
        </button>
      )}
    </>
  );
}
