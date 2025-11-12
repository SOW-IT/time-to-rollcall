import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { Fragment, useContext, useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronUpDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { MemberModel } from "@/models/Member";
import { MetadataContext } from "@/lib/context";
import { MetadataSelectModel } from "@/models/Metadata";
import { updateMember } from "@/lib/members";

export default function MergeMember({
  isOpen,
  closeModal,
  members,
  primaryMember,
}: {
  isOpen: boolean;
  closeModal: () => void;
  members: MemberModel[];
  primaryMember: MemberModel;
}) {
  const metadata = useContext(MetadataContext);
  const [selectedMember, setSelectedMember] = useState<MemberModel | null>(
    null
  );
  const [confirmName, setConfirmName] = useState("");
  const [showConflicts, setShowConflicts] = useState(false);
  const [conflictResolutions, setConflictResolutions] = useState<{
    [key: string]: "primary" | "selected";
  }>({});

  // When the selected member and primary have conflicting fields
  const detectConflicts = () => {
    if (!selectedMember) return [];

    const conflicts: Array<{
      field: string;
      label: string;
      primaryValue: any;
      selectedValue: any;
    }> = [];

    // Check email conflict
    if (
      primaryMember.email &&
      selectedMember.email &&
      primaryMember.email !== selectedMember.email
    ) {
      conflicts.push({
        field: "email",
        label: "Email",
        primaryValue: primaryMember.email,
        selectedValue: selectedMember.email,
      });
    }

    // Check metadata conflicts
    if (metadata) {
      metadata.forEach((m) => {
        const primaryValue = primaryMember.metadata?.[m.id];
        const selectedValue = selectedMember.metadata?.[m.id];

        if (primaryValue && selectedValue && primaryValue !== selectedValue) {
          conflicts.push({
            field: `metadata.${m.id}`,
            label: m.key,
            primaryValue: getMetadataDisplayValue(m, primaryValue),
            selectedValue: getMetadataDisplayValue(m, selectedValue),
          });
        }
      });
    }

    return conflicts;
  };

  const handleConflict = () => {
    const conflicts = detectConflicts();

    if (conflicts.length > 0) {
      // Initialize conflict resolutions to primary by default
      const initialResolutions: { [key: string]: "primary" | "selected" } = {};
      conflicts.forEach((conflict) => {
        initialResolutions[conflict.field] = "primary";
      });
      setConflictResolutions(initialResolutions);
      setShowConflicts(true);
    } else {
      // No conflicts, proceed with merge
      handleMerge();
    }
  };

  const handleMerge = async () => {
    if (!selectedMember) return;

    try {
      const mergedMember = {
        ...primaryMember,
      };
      // Apply resolved conflict
      Object.keys(conflictResolutions).forEach((field) => {
        const choice = conflictResolutions[field];

        if (field === "email") {
          // Handle email field
          mergedMember.email =
            choice === "primary" ? primaryMember.email : selectedMember.email;
        } else if (field.startsWith("metadata.")) {
          // Handle metadata fields
          const metadataId = field.replace("metadata.", "");
          if (!mergedMember.metadata) mergedMember.metadata = {};

          const selectedValue =
            choice === "primary"
              ? primaryMember.metadata?.[metadataId]
              : selectedMember.metadata?.[metadataId];

          // Only assign if value exists
          if (selectedValue !== undefined) {
            mergedMember.metadata[metadataId] = selectedValue;
          }
        }
      });
      // update primary information
      updateMember(primaryMember.docRef, mergedMember);

      // TODO: merge attendance for event

      //TODO: delete secondary event
    } catch (error) {
      console.error("Error merging member:", error);
    } finally {
      closeModal();
      setShowConflicts(false);
      setConfirmName("");
      setConflictResolutions({});
    }
  };
  // clear conflicts if back is clicked
  const handleBack = () => {
    setShowConflicts(false);
    setConflictResolutions({});
  };

  const getMetadataDisplayValue = (metadataItem: any, value: string) => {
    if (metadataItem.type === "select") {
      return (metadataItem as MetadataSelectModel).values[value] || value;
    }
    return value;
  };

  const conflicts = selectedMember ? detectConflicts() : [];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={() => {
          closeModal();
          setShowConflicts(false);
          setConfirmName("");
        }}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>
        <div className="fixed inset-0 flex justify-center">
          <div className="fixed max-md:w-full md:w-[600px] bottom-0">
            <TransitionChild
              enter="transition ease-in-out duration-300 transform"
              enterFrom="transform translate-y-full"
              enterTo="transform translate-y-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="transform translate-y-0"
              leaveTo="transform translate-y-full"
            >
              <DialogPanel className="rounded-t-3xl bg-white p-4 pb-20 shadow-xl overflow-auto max-h-[90vh]">
                <div
                  className="absolute left-2 top-2 p-2 cursor-pointer"
                  onClick={() => {
                    if (showConflicts) {
                      handleBack();
                    } else {
                      closeModal();
                      setConfirmName("");
                    }
                  }}
                >
                  <ArrowLeftIcon className="w-6 h-6 text-gray-600 hover:text-black active:text-black" />
                </div>
                <DialogTitle
                  as="h3"
                  className="text-xl text-center font-medium leading-6 text-gray-900"
                >
                  {showConflicts ? "Resolve Conflicts" : "Merge Member"}
                </DialogTitle>

                {!showConflicts ? (
                  <>
                    <div className="mt-4 px-12">
                      <p className="text-sm text-center">
                        <strong>Primary Member:</strong> {primaryMember.name}
                      </p>
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        Select a member to merge with. All attendance records
                        and data from the selected member will be transferred to
                        the primary member, and the selected member will be
                        deleted.
                      </p>
                    </div>

                    <div className="my-4 mt-6 px-12">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Member to Merge
                      </label>
                      <Listbox
                        value={selectedMember}
                        onChange={setSelectedMember}
                      >
                        <div className="relative">
                          <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <span className="block truncate">
                              {selectedMember
                                ? selectedMember.name
                                : "-- Choose a member --"}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </span>
                          </ListboxButton>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {members.map((member) => (
                                <ListboxOption
                                  key={member.id}
                                  value={member}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? "bg-red-100 text-red-900"
                                        : "text-gray-900"
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected
                                            ? "font-medium"
                                            : "font-normal"
                                        }`}
                                      >
                                        {member.name}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600">
                                          <CheckIcon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                          />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>

                    {selectedMember && (
                      <div className="mt-6 px-12">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                              Primary Member
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Name:</strong> {primaryMember.name}
                            </p>
                            {primaryMember.email && (
                              <p className="text-sm mb-2">
                                <strong>Email:</strong> {primaryMember.email}
                              </p>
                            )}
                            {metadata &&
                              metadata.map((m) => {
                                const value = primaryMember.metadata?.[m.id];
                                if (!value) return null;
                                return (
                                  <p key={m.id} className="text-sm mb-2">
                                    <strong>{m.key}:</strong>{" "}
                                    {getMetadataDisplayValue(m, value)}
                                  </p>
                                );
                              })}
                          </div>

                          <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                            <p className="text-sm font-semibold text-red-900 mb-2">
                              Selected Member (will be deleted)
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Name:</strong> {selectedMember.name}
                            </p>
                            {selectedMember.email && (
                              <p className="text-sm mb-2">
                                <strong>Email:</strong> {selectedMember.email}
                              </p>
                            )}
                            {metadata &&
                              metadata.map((m) => {
                                const value = selectedMember.metadata?.[m.id];
                                if (!value) return null;
                                return (
                                  <p key={m.id} className="text-sm mb-2">
                                    <strong>{m.key}:</strong>{" "}
                                    {getMetadataDisplayValue(m, value)}
                                  </p>
                                );
                              })}
                          </div>
                        </div>

                        {conflicts.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                              <span className="inline-flex items-center gap-1">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                {conflicts.length} field conflict
                                {conflicts.length > 1 ? "s" : ""} detected. You
                                will choose which values to keep after
                                confirmation.
                              </span>
                            </p>
                          </div>
                        )}

                        <div className="flex flex-col items-center w-full mt-2">
                          <p className="text-gray-500 text-sm">
                            To confirm merge, type &quot;{selectedMember.name}
                            &quot; in the box below
                          </p>
                          <input
                            type="text"
                            autoFocus
                            className="text-center border-2 rounded-md border-red-500 px-3 py-1"
                            placeholder={selectedMember.name}
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center fixed bottom-4 left-0 right-0 px-4">
                      <button
                        type="button"
                        onClick={handleConflict}
                        disabled={
                          selectedMember
                            ? confirmName !== selectedMember.name
                            : true
                        }
                        className="rounded-3xl border border-transparent bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {conflicts.length > 0
                          ? "Continue to Conflicts"
                          : "Merge Member"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-4 px-12">
                      <p className="text-sm text-gray-700 text-center mb-4">
                        The following fields have different values. Choose which
                        value to keep for the merged member.
                      </p>

                      <div className="space-y-4">
                        {conflicts.map((conflict) => (
                          <div
                            key={conflict.field}
                            className="border border-gray-200 rounded-lg p-4 bg-white"
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-3">
                              {conflict.label}
                            </p>
                            <div className="space-y-2">
                              <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={conflict.field}
                                  checked={
                                    conflictResolutions[conflict.field] ===
                                    "primary"
                                  }
                                  onChange={() =>
                                    setConflictResolutions({
                                      ...conflictResolutions,
                                      [conflict.field]: "primary",
                                    })
                                  }
                                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Keep from {primaryMember.name}
                                  </p>
                                  <p className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1 mt-1">
                                    {conflict.primaryValue}
                                  </p>
                                </div>
                              </label>

                              <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={conflict.field}
                                  checked={
                                    conflictResolutions[conflict.field] ===
                                    "selected"
                                  }
                                  onChange={() =>
                                    setConflictResolutions({
                                      ...conflictResolutions,
                                      [conflict.field]: "selected",
                                    })
                                  }
                                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Keep from {selectedMember?.name}
                                  </p>
                                  <p className="text-sm text-gray-600 bg-red-50 rounded px-2 py-1 mt-1">
                                    {conflict.selectedValue}
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center fixed bottom-4 left-0 right-0 px-4">
                      <button
                        type="button"
                        onClick={handleMerge}
                        className="rounded-3xl border border-transparent bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
                      >
                        Complete Merge
                      </button>
                    </div>
                  </>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
