"use client";
import Loader from "@/components/Loader";
import Topbar from "@/components/Topbar";
import AttendanceSearchBar from "@/components/event/AttendanceSearchBar";
import AttendanceSignedIn from "@/components/event/AttendanceSignedIn";
import AttendanceSuggested from "@/components/event/AttendanceSuggested";
import AttendanceFilterBar, {
  FilterState,
} from "@/components/event/AttendanceFilterBar";
import AttendanceFilterDrawer from "@/components/event/AttendanceFilterDrawer";
import LiveBadge from "@/components/event/LiveBadge";
import EditMember from "@/components/members/EditMember";
import { currentYearStr, getSOWYear, inBetween } from "@/helper/Time";
import { promiseToast } from "@/helper/Toast";
import {
  EventContext,
  GroupContext,
  MetadataContext,
  UserContext,
} from "@/lib/context";
import {
  addMemberToEvent,
  removeMemberFromEvent,
  updateEventMembers,
} from "@/lib/events";
import { createMember, deleteMember, updateMember } from "@/lib/members";
import { EventId, MemberInformation } from "@/models/Event";
import { GroupId } from "@/models/Group";
import { InitMember, MemberModel } from "@/models/Member";
import { MetadataSelectModel } from "@/models/Metadata";
import { universityIds } from "@/models/University";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Draggable from "gsap/dist/Draggable";
import { useContext, useEffect, useState, useMemo } from "react";

import { FunnelIcon } from "@heroicons/react/24/outline";
import { useMembersListener } from "@/lib/hooks";
import { searchNamesPhonetically } from "@/helper/searchQuery";

gsap.registerPlugin(Draggable, useGSAP);

export default function Event({
  params,
}: {
  params: { groupId: GroupId; year: string; eventId: EventId };
}) {
  const { groupId, year, eventId } = params;
  const [searchActive, setSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const metadata = useContext(MetadataContext);
  const event = useContext(EventContext);
  const group = useContext(GroupContext);
  const user = useContext(UserContext);
  const sowYearStr = event ? getSOWYear(event.dateStart).toString() : undefined;
  const members = useMembersListener(user, sowYearStr, groupId);
  const [loading, setLoading] = useState(true);
  const [membersNotSignedIn, setMembersNotSignedIn] = useState<MemberModel[]>(
    []
  );
  const [membersSignedIn, setMembersSignedIn] = useState<MemberInformation[]>(
    []
  );

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

  // Filter state management
  const [filterState, setFilterState] = useState<FilterState>({
    metadataFilters: {},
    sortBy: "name",
    sortDirection: "asc",
    sortMetadataField: undefined,
  });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Search query state for debounced search input
  const [searchQuery, setSearchQuery] = useState<string>("");

  const dietaryRequirements = metadata?.find(
    (m) => m.key === "Dietary Requirements" && m.type === "select"
  ) as MetadataSelectModel | undefined;

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const campus = metadata?.find(
    (m) => m.key === "Campus" && m.type === "select"
  ) as MetadataSelectModel | undefined;

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  // Filter change handlers
  const handleFilterChange = (metadataId: string, value: string) => {
    setFilterState((prev) => ({
      ...prev,
      metadataFilters: {
        ...prev.metadataFilters,
        [metadataId]: value,
      },
    }));
  };

  const handleSortChange = (
    sortBy: "name" | "metadata" | "signInTime",
    direction: "asc" | "desc",
    metadataField?: string
  ) => {
    setFilterState((prev) => ({
      ...prev,
      sortBy,
      sortDirection: direction,
      sortMetadataField: metadataField,
    }));
  };

  const handleClearAllFilters = () => {
    setFilterState({
      metadataFilters: {},
      sortBy: "name",
      sortDirection: "asc",
      sortMetadataField: undefined,
    });
    setSearchQuery("");
    setSearchInput("");
  };

  // Apply filters to data
  const applyFilters = <
    T extends { member?: { metadata?: any }; metadata?: any }
  >(
    data: T[]
  ): T[] => {
    if (!metadata || Object.keys(filterState.metadataFilters).length === 0) {
      return data;
    }

    return data.filter((item) => {
      const member = "member" in item && item.member ? item.member : item;

      return Object.entries(filterState.metadataFilters).every(
        ([metadataId, filterValue]) => {
          if (filterValue === "All") return true;

          const metadataField = metadata.find((m) => m.id === metadataId);
          if (!metadataField || metadataField.type !== "select") return true;

          const selectMetadata = metadataField as MetadataSelectModel;
          const memberValue = member?.metadata?.[metadataId];
          if (filterValue === "Unselected") {
            return !memberValue;
          }

          // Find the metadata value by matching the display value
          const metadataValueId = Object.entries(selectMetadata.values).find(
            ([_, value]) => value === filterValue
          )?.[0];
          return memberValue === metadataValueId;
        }
      );
    });
  };

  // Apply search filter by name for MemberModel[] (not signed in)
  const applySearchFilter = (
    data: MemberModel[],
    query: string
  ): MemberModel[] => {
    if (!query || query.length === 0) return data;
    return data.filter((member) => searchNamesPhonetically(query, member.name));
  };

  // Apply search filter by name for MemberInformation[] (signed in)
  const applySearchFilterSignedIn = (
    data: MemberInformation[],
    query: string
  ): MemberInformation[] => {
    if (!query || query.length === 0) return data;
    return data.filter((memberInfo) =>
      searchNamesPhonetically(query, memberInfo.member.name)
    );
  };

  // Apply sorting to filtered data
  const applySorting = <
    T extends {
      member?: { name: string; metadata?: any };
      name?: string;
      signInTime?: Date;
    }
  >(
    data: T[]
  ): T[] => {
    if (!data.length) return data;

    const sortedData = [...data];

    switch (filterState.sortBy) {
      case "name":
        sortedData.sort((a, b) => {
          const nameA = (
            "member" in a && a.member ? a.member.name : a.name || ""
          ).toLowerCase();
          const nameB = (
            "member" in b && b.member ? b.member.name : b.name || ""
          ).toLowerCase();
          return filterState.sortDirection === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });
        break;

      case "metadata":
        if (filterState.sortMetadataField) {
          const metadataField = metadata?.find(
            (m) => m.key === filterState.sortMetadataField
          );
          if (metadataField && metadataField.type === "select") {
            const selectMetadata = metadataField as MetadataSelectModel;
            sortedData.sort((a, b) => {
              const memberA = "member" in a && a.member ? a.member : a;
              const memberB = "member" in b && b.member ? b.member : b;

              if (!memberA || !memberB) return 0;

              // Type assertion to ensure metadata property exists
              const memberAMetadata = (memberA as any).metadata;
              const memberBMetadata = (memberB as any).metadata;

              const valueA = memberAMetadata?.[selectMetadata.id];
              const valueB = memberBMetadata?.[selectMetadata.id];

              const displayA = valueA
                ? selectMetadata.values[valueA] || valueA
                : "";
              const displayB = valueB
                ? selectMetadata.values[valueB] || valueB
                : "";

              return filterState.sortDirection === "asc"
                ? displayA.localeCompare(displayB)
                : displayB.localeCompare(displayA);
            });
          }
        }
        break;

      case "signInTime":
        sortedData.sort((a, b) => {
          if (
            !("signInTime" in a) ||
            !("signInTime" in b) ||
            !a.signInTime ||
            !b.signInTime
          )
            return 0;

          const timeA = a.signInTime.getTime();
          const timeB = b.signInTime.getTime();

          return filterState.sortDirection === "asc"
            ? timeA - timeB
            : timeB - timeA;
        });
        break;
    }

    return sortedData;
  };

  // Apply filters and sorting with useMemo for performance
  const filteredAndSortedMembersNotSignedIn = useMemo(() => {
    if (!membersNotSignedIn) return [];

    // Step 1: Apply search filter
    const searchFiltered = applySearchFilter(membersNotSignedIn, searchQuery);

    // Step 2: Apply metadata filters
    const metadataFiltered = applyFilters<MemberModel>(searchFiltered);

    // Step 3: Apply sorting
    return applySorting<MemberModel>(metadataFiltered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membersNotSignedIn, searchQuery, filterState, metadata]);

  // Calculate index for not signed in members based on search results
  const index = useMemo(() => {
    if (!membersNotSignedIn) return 0;
    const searchFiltered = applySearchFilter(membersNotSignedIn, searchQuery);
    return searchFiltered.length;
  }, [membersNotSignedIn, searchQuery]);

  // Calculate index for signed in members based on search results
  const indexSignedIn = useMemo(() => {
    if (!membersSignedIn) return 0;
    const searchFiltered = applySearchFilterSignedIn(
      membersSignedIn,
      searchQuery
    );
    return searchFiltered.length;
  }, [membersSignedIn, searchQuery]);

  const filteredAndSortedMembersSignedIn = useMemo(() => {
    if (!membersSignedIn) return [];

    // Step 1: Apply search filter
    const searchFiltered = applySearchFilterSignedIn(
      membersSignedIn,
      searchQuery
    );

    // Step 2: Apply metadata filters
    const metadataFiltered = applyFilters<MemberInformation>(searchFiltered);

    // Step 3: Apply sorting
    return applySorting<MemberInformation>(metadataFiltered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membersSignedIn, searchQuery, filterState, metadata]);

  async function editMember() {
    setUpdating(true);
    if (selectedMemberInfo.member.id === "placeholder") {
      const newMember = await createMember(
        campus && selectedMemberInfo.member.metadata
          ? universityIds[
              campus.values[selectedMemberInfo.member.metadata[campus.id]]
            ] ?? params.groupId
          : params.groupId,
        selectedMemberInfo.member,
        user?.id
      );
      await promiseToast<void>(
        addMemberToEvent(groupId, eventId, newMember.docRef),
        "Creating and Adding Member...",
        "Member Created and Added!",
        "Could not create and added member."
      );
    } else {
      await promiseToast<void>(
        updateMember(
          selectedMemberInfo.member.docRef,
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
          (m) => m.member.docRef.path === selectedMemberInfo.member.docRef.path
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
    // Update the time every minute
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (event && members !== null) {
      let membersNotSignedIn =
        members
          ?.sort((a, b) => a.name.localeCompare(b.name))
          .filter(
            (m) =>
              !event?.members?.some(
                (signedIn) => signedIn.member.docRef.path === m.docRef.path
              )
          ) ?? [];
      let membersSignedIn =
        (event.members
          ?.sort((a, b) => a.member.name.localeCompare(b.member.name))
          .map((mi) => ({
            ...mi,
            member: members?.find(
              (m) => m.docRef.path === mi.member.docRef.path
            ),
          }))
          .filter((mi) => mi.member !== undefined) as MemberInformation[]) ??
        [];

      // Set the base data without search filtering
      setMembersNotSignedIn(membersNotSignedIn);
      setMembersSignedIn(membersSignedIn);

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
        setSearchQuery(searchInput);
      } else if (prevSearchActive && searchInput.length === 0) {
        setSearchQuery("");
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
          (msi) =>
            msi.member.docRef.path === selectedMemberInfo.member.docRef.path
        )
      ) {
        await promiseToast<void>(
          removeMemberFromEvent(
            groupId,
            eventId,
            event.members?.find(
              (m) =>
                m.member.docRef.path === selectedMemberInfo.member.docRef.path
            )
          ),
          `Removing ${selectedMemberInfo.member.name}...`,
          `${selectedMemberInfo.member.name} Removed!`,
          `Could not remove ${selectedMemberInfo.member.name}.`
        );
      }
      await promiseToast<void>(
        deleteMember(selectedMemberInfo.member.docRef),
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

  const [mergeMemberIsOpen, setMergeMemberIsOpen] = useState(false);

  function closeMergeMemberModal() {
    openModal();
    setMergeMemberIsOpen(false);
  }

  function openMergeMemberModal() {
    closeModal();
    setMergeMemberIsOpen(true);
  }

  return (
    <>
      {!toggleEdit && (
        <div className="fixed top-0 bottom-0 right-0 left-0 opacity-10 bg-gray-400 z-40" />
      )}
      <Topbar
        year={year}
        groupId={params.groupId}
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
            mergeMemberIsOpen={mergeMemberIsOpen}
            openMergeMemberModal={openMergeMemberModal}
            closeMergeMemberModal={closeMergeMemberModal}
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
          <AttendanceFilterBar
            filterState={filterState}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onClearAll={handleClearAllFilters}
            onToggleMobileDrawer={toggleFilterDrawer}
          />
          <AttendanceSearchBar
            disabled={!toggleEdit}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
          <div className="md:grid md:grid-cols-2 md:grid-flow-row z-30">
            <div className="w-full">
              <AttendanceSuggested
                disabled={!toggleEdit}
                suggested={filteredAndSortedMembersNotSignedIn.slice(0, index)}
                filteredCount={
                  filteredAndSortedMembersNotSignedIn.slice(0, index).length
                }
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
                    event.members?.some(
                      (m) => m.member.docRef.path === member.docRef.path
                    )
                      ? (() => {
                          throw new Error(
                            `${member.name} is already a member of the event.`
                          );
                        })()
                      : addMemberToEvent(groupId, eventId, member.docRef),
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
                signedIn={filteredAndSortedMembersSignedIn.slice(
                  0,
                  indexSignedIn
                )}
                filteredCount={
                  filteredAndSortedMembersSignedIn.slice(0, indexSignedIn)
                    .length
                }
                mobileFilterButton={
                  <div className="flex items-center justify-between">
                    <button
                      onClick={toggleFilterDrawer}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <FunnelIcon className="w-4 h-4" />
                      Filters
                    </button>
                    <span className="text-xs text-gray-500">
                      {
                        Object.values(filterState.metadataFilters).filter(
                          (v) => v !== "All"
                        ).length
                      }{" "}
                      active
                    </span>
                  </div>
                }
                totalAttendance={event.members?.length ?? 0}
                action={(memberInfo: MemberInformation) => {
                  const { member } = memberInfo;
                  promiseToast<void>(
                    removeMemberFromEvent(
                      groupId,
                      eventId,
                      event.members?.find(
                        (m) => m.member.docRef.path === member.docRef.path
                      )
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

      {/* Mobile Filter Drawer */}
      <AttendanceFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearAll={handleClearAllFilters}
      />
    </>
  );
}
