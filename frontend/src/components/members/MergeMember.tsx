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
import { Fragment, useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { MemberModel } from "@/models/Member";

export default function MergeMember({
  isOpen,
  closeModal,
  name,
  members,
}: {
  isOpen: boolean;
  closeModal: () => void;
  name: string;
  members: MemberModel[];
}) {
  const [selectedMember, setSelectedMember] = useState<MemberModel | null>(
    null
  );

  const handleMerge = () => {
    if (!selectedMember) return;

    // TODO: Implement merge logic here
    console.log("Merging member:", selectedMember.id, "into", name);
    closeModal();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={() => {
          closeModal();
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
              <DialogPanel className="rounded-t-3xl bg-white p-4 pb-20 shadow-xl">
                <div
                  className="absolute left-2 top-2 p-2 cursor-pointer"
                  onClick={() => {
                    closeModal();
                  }}
                >
                  <ArrowLeftIcon className="w-6 h-6 text-gray-600 hover:text-black active:text-black" />
                </div>
                <DialogTitle
                  as="h3"
                  className="text-xl text-center font-medium leading-6 text-gray-900"
                >
                  Merge Member
                </DialogTitle>
                <div className="mt-4 px-12">
                  <p className="text-sm text-center">
                    <strong>Current Member:</strong> {name}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Select a member to merge with. All attendance records and
                    data from the selected member will be transferred to the
                    current member, and the selected member will be deleted.
                  </p>
                </div>

                <div className="my-4 mt-6 px-12">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Member to Merge
                  </label>
                  <Listbox value={selectedMember} onChange={setSelectedMember}>
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
                                      selected ? "font-medium" : "font-normal"
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

                <div className="flex justify-center fixed bottom-4 left-0 right-0 px-4">
                  <button
                    type="button"
                    onClick={handleMerge}
                    disabled={!selectedMember}
                    className="rounded-3xl border border-transparent bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Merge Member
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
