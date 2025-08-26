"use client";
import { useContext } from "react";
import { MetadataContext } from "@/lib/context";
import { MetadataSelectModel } from "@/models/Metadata";
import { FilterState, MembersFilterState } from "./AttendanceFilterBar";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface AttendanceFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState | MembersFilterState;
  onFilterChange: (metadataId: string, value: string) => void;
  onSortChange: (
    sortBy: FilterState["sortBy"] | MembersFilterState["sortBy"],
    direction: "asc" | "desc",
    metadataField?: string
  ) => void;
  onClearAll: () => void;
  showSignInTime?: boolean;
}

export default function AttendanceFilterDrawer({
  isOpen,
  onClose,
  filterState,
  onFilterChange,
  onSortChange,
  onClearAll,
  showSignInTime = true,
}: AttendanceFilterDrawerProps) {
  const metadata = useContext(MetadataContext);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Filters & Sort
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Metadata Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Metadata Filters
              </h4>
              <div className="space-y-4">
                {selectMetadata.map((meta) => (
                  <div key={meta.id}>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      {meta.key}
                    </label>
                    <Listbox
                      value={filterState.metadataFilters[meta.id] || "All"}
                      onChange={(value) => onFilterChange(meta.id, value)}
                    >
                      <ListboxButton className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        {filterState.metadataFilters[meta.id] || "All"}
                        <ChevronDownIcon className="w-4 h-4" />
                      </ListboxButton>
                      <ListboxOptions
                        anchor="top"
                        transition
                        className="rounded-lg border border-gray-200 bg-white p-1 focus:outline-none z-50 w-full"
                      >
                        <ListboxOption
                          value="All"
                          className="group flex cursor-pointer items-center rounded-md px-3 py-2 text-sm select-none data-[focus]:bg-gray-100"
                        >
                          All
                        </ListboxOption>
                        <ListboxOption
                          value="Unselected"
                          className="group flex cursor-pointer items-center rounded-md px-3 py-2 text-sm select-none data-[focus]:bg-gray-100"
                        >
                          Unselected
                        </ListboxOption>
                        {Object.entries(meta.values).map(([id, value]) => (
                          <ListboxOption
                            key={id}
                            value={value}
                            className="group flex cursor-pointer items-center rounded-md px-3 py-2 text-sm select-none data-[focus]:bg-gray-100"
                          >
                            {value}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </Listbox>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort Controls */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Sort Options
              </h4>
              <div className="space-y-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Sort by
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
                    <ListboxButton className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      {
                        sortOptions.find(
                          (opt) => opt.value === filterState.sortBy
                        )?.label
                      }
                      <ChevronDownIcon className="w-4 h-4" />
                    </ListboxButton>
                    <ListboxOptions
                      anchor="top"
                      transition
                      className="rounded-lg border border-gray-200 bg-white p-1 focus:outline-none z-50 w-full"
                    >
                      {sortOptions.map((option) => (
                        <ListboxOption
                          key={option.value}
                          value={option.value}
                          className="group flex cursor-pointer items-center rounded-md px-3 py-2 text-sm select-none data-[focus]:bg-gray-100"
                        >
                          {option.label}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Listbox>
                </div>

                {/* Sort Direction */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Direction
                  </label>
                  <button
                    onClick={() =>
                      onSortChange(
                        filterState.sortBy,
                        filterState.sortDirection === "asc" ? "desc" : "asc",
                        filterState.sortMetadataField
                      )
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                  >
                    {filterState.sortDirection === "asc"
                      ? "↑ Ascending"
                      : "↓ Descending"}
                  </button>
                </div>

                {/* Metadata Field for Sorting */}
                {filterState.sortBy === "metadata" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Metadata Field
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
                      <ListboxButton className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        {filterState.sortMetadataField || "Select field"}
                        <ChevronDownIcon className="w-4 h-4" />
                      </ListboxButton>
                      <ListboxOptions
                        anchor="top"
                        transition
                        className="rounded-lg border border-gray-200 bg-white p-1 focus:outline-none z-50 w-full"
                      >
                        {selectMetadata.map((meta) => (
                          <ListboxOption
                            key={meta.id}
                            value={meta.key}
                            className="group flex cursor-pointer items-center rounded-md px-3 py-2 text-sm select-none data-[focus]:bg-gray-100"
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
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onClearAll}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
