"use client";
import Loader from "@/components/Loader";
import Topbar from "@/components/Topbar";
import AttendanceSearchBar from "@/components/event/AttendanceSearchBar";
import AttendanceSignedIn from "@/components/event/AttendanceSignedIn";
import AttendanceSuggested from "@/components/event/AttendanceSuggested";
import LiveBadge from "@/components/event/LiveBadge";
import EditMember from "@/components/members/EditMember";
import { currentYearStr, inBetween } from "@/helper/Time";
import { promiseToast } from "@/helper/Toast";
import {
  EventContext,
  GroupContext,
  MembersContext,
  MetadataContext,
} from "@/lib/context";
import {
  addMemberToEvent,
  removeMemberFromEvent,
  updateEventMembers,
} from "@/lib/events";
import { firestore } from "@/lib/firebase";
import { createMember, deleteMember, updateMember } from "@/lib/members";
import { EventId, MemberInformation } from "@/models/Event";
import { GroupId } from "@/models/Group";
import { InitMember, MemberModel } from "@/models/Member";
import { MetadataSelectModel } from "@/models/Metadata";
import { universityIds } from "@/models/University";
import { useGSAP } from "@gsap/react";
import { doc } from "firebase/firestore";
import gsap from "gsap";
import Draggable from "gsap/dist/Draggable";
import { useContext, useEffect, useState } from "react";
import {
  searchForMemberByName,
  searchForMemberInformationByName,
} from "services/attendanceService";

gsap.registerPlugin(Draggable, useGSAP);

const MAX_INDEX = 10;

export default function Event({
  params,
}: {
  params: { groupId: GroupId; year: string; eventId: EventId };
}) {
  const { groupId, year, eventId } = params;
  const [searchActive, setSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const metadata = useContext(MetadataContext);
  const group = useContext(GroupContext);
  const event = useContext(EventContext);
  const members = useContext(MembersContext);
  const [loading, setLoading] = useState(true);
  const [membersNotSignedIn, setMembersNotSignedIn] = useState<MemberModel[]>(
    []
  );
  const [membersSignedIn, setMembersSignedIn] = useState<MemberInformation[]>(
    []
  );
  const [index, setIndex] = useState<number>(0);
  const [indexSignedIn, setIndexSignedIn] = useState<number>(0);
  const [loadAnimation, setLoadAnimation] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedMemberInfo, setSelectedMemberInfo] =
    useState<MemberInformation>({
      member: InitMember(""),
      signInTime: new Date(),
    });
  const [previousSignInTime, setPreviousSignInTime] = useState<
    Date | undefined
  >(new Date());
  const [toggleEdit, setToggleEdit] = useState(true);
  const [time, setTime] = useState(new Date());
  const dietaryRequirements = metadata?.find(
    (m) => m.key === "Dietary Requirements" && m.type === "select"
  ) as MetadataSelectModel | undefined;

  useEffect(() => {
    // Update the time every minute
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const campus = metadata?.find(
    (m) => m.key === "Campus" && m.type === "select"
  ) as MetadataSelectModel | undefined;

  async function editMember() {
    setUpdating(true);
    if (selectedMemberInfo.member.id === "placeholder") {
      const newMember = await createMember(
        campus && selectedMemberInfo.member.metadata
          ? universityIds[
              campus.values[selectedMemberInfo.member.metadata[campus.id]]
            ] ?? params.groupId
          : params.groupId,
        selectedMemberInfo.member
      );
      await promiseToast<void>(
        addMemberToEvent(
          groupId,
          eventId,
          doc(
            firestore,
            "groups",
            campus && selectedMemberInfo.member.metadata
              ? universityIds[
                  campus.values[selectedMemberInfo.member.metadata[campus.id]]
                ] ?? params.groupId
              : params.groupId,
            "members",
            currentYearStr,
            "members",
            newMember.id
          )
        ),
        "Creating and Adding Member...",
        "Member Created and Added!",
        "Could not create and added member."
      );
    } else {
      await promiseToast<void>(
        updateMember(
          selectedMemberInfo.member.docRef ??
            doc(
              firestore,
              "groups",
              params.groupId,
              "members",
              currentYearStr,
              "members",
              selectedMemberInfo.member.id
            ),
          selectedMemberInfo.member
        ),
        "Updating Member...",
        "Member Updated!",
        "Could not update member."
      );
      if (
        previousSignInTime !== selectedMemberInfo.signInTime &&
        event?.members
      ) {
        const index = event.members.findIndex(
          (m) => m.member.id === selectedMemberInfo.member.id
        );
        if (index !== -1) {
          await promiseToast<void>(
            updateEventMembers(groupId, eventId, [
              ...event.members.slice(0, index),
              selectedMemberInfo,
              ...event.members.slice(index + 1),
            ]),
            "Updating Sign in time...",
            "Sign in time Updated!",
            "Could not update sign in time."
          );
        }
      }
    }
    setUpdating(false);
    closeModal();
  }

  useEffect(() => {
    if (event && members !== null) {
      let membersNotSignedIn =
        members
          ?.sort((a, b) => a.name.localeCompare(b.name))
          .filter(
            (m) =>
              !event?.members?.some((signedIn) => signedIn.member.id === m.id)
          ) ?? [];
      let membersSignedIn =
        (event.members
          ?.sort((a, b) => a.member.name.localeCompare(b.member.name))
          .map((mi) => ({
            ...mi,
            member: members?.find((m) => m.id === mi.member.id),
          }))
          .filter((mi) => mi.member !== undefined) as MemberInformation[]) ??
        [];
      if (searchInput.length > 0) {
        setLoadAnimation(true);
        const { suggested, notSuggested } = searchForMemberByName(
          membersNotSignedIn,
          searchInput
        );
        setMembersNotSignedIn(suggested.concat(notSuggested));
        setIndex(Math.min(MAX_INDEX, suggested.length));
        const { suggested: signedIn, notSuggested: signedInNotSuggested } =
          searchForMemberInformationByName(membersSignedIn, searchInput);
        setMembersSignedIn(signedIn.concat(signedInNotSuggested));
        setIndexSignedIn(signedIn.length);
      } else {
        setMembersNotSignedIn(membersNotSignedIn);
        setMembersSignedIn(membersSignedIn);
        setIndexSignedIn(membersSignedIn.length);
      }

      if (loading) {
        setLoading(false);
        setToggleEdit(time < event.dateEnd);
      }
    }
    // eslint-disable-next-line
  }, [members, event]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let prevSearchActive = searchActive;
      setSearchActive(searchInput.length > 0);
      if (searchInput.length > 0) {
        setLoadAnimation(false);
        const { suggested, notSuggested } = searchForMemberByName(
          membersNotSignedIn,
          searchInput
        );
        setMembersNotSignedIn(suggested.concat(notSuggested));
        setIndex(Math.min(MAX_INDEX, suggested.length));
        const { suggested: signedIn, notSuggested: signedInNotSuggested } =
          searchForMemberInformationByName(membersSignedIn, searchInput);
        setMembersSignedIn(signedIn.concat(signedInNotSuggested));
        setIndexSignedIn(signedIn.length);
      } else if (prevSearchActive && searchInput.length === 0) {
        setIndex(0);
        setIndexSignedIn(membersSignedIn.length);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line
  }, [searchInput]);

  async function deleteMemberIn() {
    setUpdatingDelete(true);
    if (params.groupId && event && selectedMemberInfo.member) {
      if (
        membersSignedIn.find(
          (msi) => msi.member.id === selectedMemberInfo.member.id
        )
      ) {
        await promiseToast<void>(
          removeMemberFromEvent(
            groupId,
            eventId,
            event.members?.find(
              (m) => m.member.id === selectedMemberInfo.member.id
            )
          ),
          `Removing ${selectedMemberInfo.member.name}...`,
          `${selectedMemberInfo.member.name} Removed!`,
          `Could not remove ${selectedMemberInfo.member.name}.`
        );
      }
      await promiseToast<void>(
        deleteMember(
          campus && selectedMemberInfo.member.metadata
            ? universityIds[
                campus.values[selectedMemberInfo.member.metadata[campus.id]]
              ] ?? params.groupId
            : params.groupId,
          selectedMemberInfo.member.id
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

  return (
    <>
      {!toggleEdit && (
        <div className="fixed top-0 bottom-0 right-0 left-0 opacity-10 bg-gray-400 z-40" />
      )}
      <Topbar
        year={year}
        setToggleEdit={
          event && time > event.dateEnd ? setToggleEdit : undefined
        }
        toggleEdit={toggleEdit}
      />
      {loading ? (
        <div className="flex justify-center items-center my-24">
          <Loader show />
        </div>
      ) : event ? (
        <>
          <EditMember
            isOpen={isOpen}
            closeModal={closeModal}
            member={selectedMemberInfo.member}
            setMember={(member) =>
              setSelectedMemberInfo({ ...selectedMemberInfo, member })
            }
            submit={editMember}
            updating={updating}
            deleteConfirmationIsOpen={deleteConfirmationIsOpen}
            openDeleteConfirmationModal={openDeleteConfirmationModal}
            closeDeleteConfirmationModal={closeDeleteConfirmationModal}
            deleteMember={deleteMemberIn}
            updatingDelete={updatingDelete}
            signInTime={selectedMemberInfo.signInTime}
            updateSignInTime={(signInTime) =>
              setSelectedMemberInfo({ ...selectedMemberInfo, signInTime })
            }
          />
          <div
            className={
              "flex mx-4 mb-3 justify-between items-start" +
              (time > event.dateEnd ? " pt-4" : "")
            }
          >
            <h1 className="text-2xl">{event.name}</h1>
            {inBetween(event.dateStart, time, event.dateEnd) && <LiveBadge />}
            {time < event.dateStart && (
              <p className="text-xs font-medium text-gray-400">NOT YET</p>
            )}
            {time > event.dateEnd && (
              <p className="text-xs font-medium text-gray-600">ENDED</p>
            )}
          </div>
          <AttendanceSearchBar
            disabled={!toggleEdit}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
          <div className="md:grid md:grid-cols-2 md:grid-flow-row z-30">
            <div className="w-full">
              <AttendanceSuggested
                disabled={!toggleEdit}
                suggested={membersNotSignedIn.slice(0, index)}
                searchInputLength={searchInput.length}
                loadAnimation={loadAnimation}
                create={() => {
                  setSelectedMemberInfo({
                    member: InitMember(
                      searchInput,
                      metadata?.find(
                        (m) => m.key === "campus" && m.type === "select"
                      )?.id,
                      Object.entries(
                        (
                          metadata?.find(
                            (m) => m.key === "campus" && m.type === "select"
                          ) as MetadataSelectModel | undefined
                        )?.values ?? {}
                      ).find(([_, v]) => v === group?.name)?.[0]
                    ),
                    signInTime: new Date(),
                  });
                  openModal();
                }}
                action={(memberInfo: MemberInformation) => {
                  const { member } = memberInfo;
                  promiseToast<void>(
                    event.members?.some((m) => m.member.id === member.id)
                      ? (() => {
                          throw new Error(
                            `${member.name} is already a member of the event.`
                          );
                        })()
                      : addMemberToEvent(
                          groupId,
                          eventId,
                          member.docRef ??
                            doc(
                              firestore,
                              "groups",
                              campus && selectedMemberInfo.member.metadata
                                ? universityIds[
                                    campus.values[
                                      selectedMemberInfo.member.metadata[
                                        campus.id
                                      ]
                                    ]
                                  ] ?? params.groupId
                                : params.groupId,
                              "members",
                              currentYearStr,
                              "members",
                              member.id
                            )
                        ),
                    `Adding ${member.name}...`,
                    `${member.name} Added!`,
                    `Could not add ${member.name}.`
                  );
                }}
                edit={(memberInfo: MemberInformation) => {
                  setSelectedMemberInfo(memberInfo);
                  openModal();
                }}
              />
              {searchInput.length === 0 &&
                (!event || !event.members || event.members.length === 0) && (
                  <div className="text-center my-6 mt-8 text-gray-500">
                    {!toggleEdit
                      ? "Click the pencil icon on the top right to enable editing!"
                      : "Start searching members to add them!"}
                  </div>
                )}
            </div>
            <div className="w-full">
              <AttendanceSignedIn
                disabled={!toggleEdit}
                signedIn={membersSignedIn.slice(0, indexSignedIn)}
                dietary={() =>
                  dietaryRequirements &&
                  setMembersSignedIn((msi) =>
                    msi.sort((a, _) =>
                      a.member.metadata?.[dietaryRequirements.id] ? -1 : 1
                    )
                  )
                }
                totalAttendance={event.members?.length ?? 0}
                action={(memberInfo: MemberInformation) => {
                  const { member } = memberInfo;
                  promiseToast<void>(
                    removeMemberFromEvent(
                      groupId,
                      eventId,
                      event.members?.find((m) => m.member.id === member.id)
                    ),
                    `Removing ${member.name}...`,
                    `${member.name} Removed!`,
                    `Could not remove ${member.name}.`
                  );
                }}
                edit={(memberInfo: MemberInformation) => {
                  setSelectedMemberInfo(memberInfo);
                  setPreviousSignInTime(memberInfo.signInTime);
                  openModal();
                }}
              />
            </div>
          </div>
          <div className="flex flex-col fixed z-40 bottom-0 w-full">
            <button
              type="button"
              disabled={params.year !== currentYearStr}
              className={`text-gray-700 text-sm py-4 px-1.5 w-full font-light text-center disabled:cursor-not-allowed ${
                params.year === currentYearStr
                  ? "bg-green-200 active:bg-green-300"
                  : "bg-gray-200"
              }`}
              onClick={() => {
                if (toggleEdit) {
                  setSelectedMemberInfo({
                    member: InitMember(
                      searchInput,
                      metadata?.find(
                        (m) => m.key === "campus" && m.type === "select"
                      )?.id,
                      Object.entries(
                        (
                          metadata?.find(
                            (m) => m.key === "campus" && m.type === "select"
                          ) as MetadataSelectModel | undefined
                        )?.values ?? {}
                      ).find(([_, v]) => v === group?.name)?.[0]
                    ),
                    signInTime: new Date(),
                  });
                  openModal();
                } else {
                  setToggleEdit(true);
                }
              }}
            >
              {toggleEdit ? "Create and Add New Member" : "Enable Editing"}
            </button>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
