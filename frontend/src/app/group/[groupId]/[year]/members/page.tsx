"use client";
import Loader from "@/components/Loader";
import Topbar from "@/components/Topbar";
import AttendanceSearchBar from "@/components/event/AttendanceSearchBar";
import AttendanceFilterBar, {
  MembersFilterState,
} from "@/components/event/AttendanceFilterBar";
import AttendanceFilterDrawer from "@/components/event/AttendanceFilterDrawer";
import EditMember from "@/components/members/EditMember";
import Members from "@/components/members/Members";
import { currentYearStr } from "@/helper/Time";
import { promiseToast } from "@/helper/Toast";
import {
  GroupContext,
  MembersContext,
  MetadataContext,
  UserContext,
} from "@/lib/context";
import { createMember, deleteMember, updateMember } from "@/lib/members";
import { GroupId } from "@/models/Group";
import { InitMember, MemberModel } from "@/models/Member";
import { MetadataSelectModel } from "@/models/Metadata";
import { universityIds } from "@/models/University";
import { useContext, useEffect, useState, useMemo } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/16/solid";
import { searchNamesPhonetically } from "@/helper/searchQuery";

export default function GroupMember({
  params,
}: {
  params: { groupId: GroupId; year: string };
}) {
  const [searchActive, setSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const members = useContext(MembersContext);
  const group = useContext(GroupContext);
  const user = useContext(UserContext);
  const metadata = useContext(MetadataContext);
  const [selectedMember, setSelectedMember] = useState<MemberModel>(
    InitMember("")
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Filter state management
  const [filterState, setFilterState] = useState<MembersFilterState>({
    metadataFilters: {},
    sortBy: "name",
    sortDirection: "asc",
    sortMetadataField: undefined,
  });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setLoading(false);
  }, [members]);

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

  const campus = metadata?.find(
    (m) => m.key === "Campus" && m.type === "select"
  ) as MetadataSelectModel | undefined;

  // Apply search filter by name
  const applySearchFilter = (
    data: MemberModel[],
    query: string
  ): MemberModel[] => {
    if (!query || query.length === 0) return data;
    return data.filter((member) => searchNamesPhonetically(query, member.name));
  };

  // Filter and sort logic functions
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
    // Only allow name and metadata for members page
    if (sortBy === "signInTime") return;

    setFilterState((prev) => ({
      ...prev,
      sortBy: sortBy as "name" | "metadata",
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

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  // Apply filters to data
  const applyFilters = (data: MemberModel[]): MemberModel[] => {
    if (!metadata || Object.keys(filterState.metadataFilters).length === 0) {
      return data;
    }

    return data.filter((member) => {
      return Object.entries(filterState.metadataFilters).every(
        ([metadataId, filterValue]) => {
          if (filterValue === "All") return true;

          const metadataField = metadata.find((m) => m.id === metadataId);
          if (!metadataField || metadataField.type !== "select") return true;

          const selectMetadata = metadataField as MetadataSelectModel;
          const memberValue = member.metadata?.[metadataId];

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

  // Apply sorting to filtered data
  const applySorting = (data: MemberModel[]): MemberModel[] => {
    if (!data.length) return data;

    const sortedData = [...data];

    switch (filterState.sortBy) {
      case "name":
        sortedData.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
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
              const valueA = a.metadata?.[selectMetadata.id];
              const valueB = b.metadata?.[selectMetadata.id];

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
    }

    return sortedData;
  };

  // Apply filters and sorting with useMemo for performance
  const filteredAndSortedMembers = useMemo(() => {
    if (!members) return [];

    // Step 1: Apply search filter
    const searchFiltered = applySearchFilter(members, searchQuery);

    // Step 2: Apply metadata filters
    const metadataFiltered = applyFilters(searchFiltered);

    // Step 3: Apply sorting
    return applySorting(metadataFiltered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, searchQuery, filterState, metadata]);

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
            selectedMember,
            user?.id
          ),
          "Creating Member...",
          "Member Created!",
          "Could not create member."
        );
      } else {
        await promiseToast<void>(
          updateMember(selectedMember.docRef, selectedMember),
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
        deleteMember(selectedMember.docRef),
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
      <Topbar groupId={params.groupId} year={params.year} />
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
          mergeMemberIsOpen={mergeMemberIsOpen}
          openMergeMemberModal={openMergeMemberModal}
          closeMergeMemberModal={closeMergeMemberModal}
          deleteMember={deleteMemberIn}
          updatingDelete={updatingDelete}
        />
      )}
      <div className="flex justify-between items-center mx-4  mt-3 mb-16">
        <h1 className="text-2xl">Members</h1>
        <Popover className="relative">
          <PopoverButton>
            <QuestionMarkCircleIcon className="cursor-pointer w-6 h-6 text-gray-500" />
          </PopoverButton>
          <PopoverPanel
            anchor="bottom"
            transition
            className="flex origin-top flex-col transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0"
          >
            <p className="italic text-xs backdrop-blur-sm">
              User data for the next serving term can be changed from October
              1st.
            </p>
          </PopoverPanel>
        </Popover>
      </div>

      {/* Filter and Sort UI */}
      <AttendanceFilterBar
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearAll={handleClearAllFilters}
        onToggleMobileDrawer={toggleFilterDrawer}
        showSignInTime={false}
      />

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
            members={filteredAndSortedMembers}
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

      {/* Mobile Filter Drawer */}
      <AttendanceFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearAll={handleClearAllFilters}
        showSignInTime={false}
      />
    </>
  );
}
