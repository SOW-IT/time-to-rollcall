"use client";
import { useContext } from "react";
import { MetadataContext } from "@/lib/context";
import { MetadataSelectModel } from "@/models/Metadata";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import useMediaQuery from "@/helper/useMediaQuery";

export interface FilterState {
  metadataFilters: {
    [metadataId: string]: string;
  };
  sortBy: "name" | "metadata" | "signInTime";
  sortDirection: "asc" | "desc";
  sortMetadataField?: string;
}

// Extended interface for members page (without signInTime)
export interface MembersFilterState {
  metadataFilters: {
    [metadataId: string]: string;
  };
  sortBy: "name" | "metadata";
  sortDirection: "asc" | "desc";
  sortMetadataField?: string;
}

interface AttendanceFilterBarProps {
  filterState: FilterState | MembersFilterState;
  onFilterChange: (metadataId: string, value: string) => void;
  onSortChange: (
    sortBy: FilterState["sortBy"] | MembersFilterState["sortBy"],
    direction: "asc" | "desc",
    metadataField?: string
  ) => void;
  onClearAll: () => void;
  onToggleMobileDrawer: () => void;
  showSignInTime?: boolean;
}

export default function AttendanceFilterBar({
  filterState,
  onFilterChange,
  onSortChange,
  onClearAll,
  onToggleMobileDrawer,
  showSignInTime = true,
}: AttendanceFilterBarProps) {
  const metadata = useContext(MetadataContext);
  const mobile = useMediaQuery("(max-width: 768px)");

  // Get all select-type metadata fields
  const selectMetadata =
    (metadata?.filter((m) => m.type === "select") as MetadataSelectModel[]) ||
    [];

  // Get available sort options
  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "metadata", label: "Metadata" },
    ...(showSignInTime ? [{ value: "signInTime", label: "Sign-in Time" }] : []),
  ];

  if (mobile) {
    return (
      <div className="flex items-center justify-between mx-4 mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMobileDrawer}
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
        <button
          onClick={onClearAll}
          className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1"
        >
          Clear All
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Filters & Sort</h3>
        <button
          onClick={onClearAll}
          className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 bg-white rounded border"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Metadata Filters */}
        {selectMetadata.map((meta) => (
          <div key={meta.id} className="flex items-center gap-2">
            <label className="text-xs text-gray-600 whitespace-nowrap">
              {meta.key}:
            </label>
            <Listbox
              value={filterState.metadataFilters[meta.id] || "All"}
              onChange={(value) => onFilterChange(meta.id, value)}
            >
              <ListboxButton className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-w-[100px]">
                {filterState.metadataFilters[meta.id] || "All"}
                <ChevronDownIcon className="w-3 h-3" />
              </ListboxButton>
              <ListboxOptions
                anchor="top"
                transition
                className="rounded-lg border border-gray-200 bg-white p-1 focus:outline-none z-50"
              >
                <ListboxOption
                  value="All"
                  className="group flex cursor-pointer items-center rounded-md px-2 py-1.5 text-xs select-none data-[focus]:bg-gray-100"
                >
                  All
                </ListboxOption>
                <ListboxOption
                  value="Unselected"
                  className="group flex cursor-pointer items-center rounded-md px-2 py-1.5 text-xs select-none data-[focus]:bg-gray-100"
                >
                  Unselected
                </ListboxOption>
                {Object.entries(meta.values).map(([id, value]) => (
                  <ListboxOption
                    key={id}
                    value={value}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-1.5 text-xs select-none data-[focus]:bg-gray-100"
                  >
                    {value}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>
        ))}

        {/* Sort Controls */}
        <div className="flex items-center gap-2 ml-4">
          <label className="text-xs text-gray-600 whitespace-nowrap">
            Sort by:
          </label>
          <Listbox
            value={filterState.sortBy}
            onChange={(value) =>
              onSortChange(
                value,
                filterState.sortDirection,
                filterState.sortMetadataField
              )
            }
          >
            <ListboxButton className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-w-[100px]">
              {
                sortOptions.find((opt) => opt.value === filterState.sortBy)
                  ?.label
              }
              <ChevronDownIcon className="w-3 h-3" />
            </ListboxButton>
            <ListboxOptions
              anchor="top"
              transition
              className="rounded-lg border border-gray-200 bg-white p-1 focus:outline-none z-50"
            >
              {sortOptions.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  className="group flex cursor-pointer items-center rounded-md px-2 py-1.5 text-xs select-none data-[focus]:bg-gray-100"
                >
                  {option.label}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>

          {/* Sort Direction */}
          <button
            onClick={() =>
              onSortChange(
                filterState.sortBy,
                filterState.sortDirection === "asc" ? "desc" : "asc",
                filterState.sortMetadataField
              )
            }
            className="px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {filterState.sortDirection === "asc" ? "↑" : "↓"}
          </button>
        </div>

        {/* Metadata Field for Sorting (when sortBy is "metadata") */}
        {filterState.sortBy === "metadata" && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 whitespace-nowrap">
              Field:
            </label>
            <Listbox
              value={filterState.sortMetadataField || ""}
              onChange={(value) =>
                onSortChange(
                  filterState.sortBy,
                  filterState.sortDirection,
                  value
                )
              }
            >
              <ListboxButton className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-w-[100px]">
                {filterState.sortMetadataField || "Select field"}
                <ChevronDownIcon className="w-3 h-3" />
              </ListboxButton>
              <ListboxOptions
                anchor="top"
                transition
                className="rounded-lg border border-gray-200 bg-white p-1 focus:outline-none z-50"
              >
                {selectMetadata.map((meta) => (
                  <ListboxOption
                    key={meta.id}
                    value={meta.key}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-1.5 text-xs select-none data-[focus]:bg-gray-100"
                  >
                    {meta.key}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>
        )}
      </div>
    </div>
  );
}
