import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { GroupModel } from "@/models/Group";
import Loader from "../Loader";
import { InitTag, TagModel } from "@/models/Tag";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { colourClasses, getColourClasses } from "../event/Tag";
import DeleteConfirmation from "../event/DeleteEvent";

export default function EditGroup({
  isOpen,
  closeModal,
  group,
  setGroup,
  tags,
  setTags,
  setDeleteTags,
  submit,
  updating,
}: {
  isOpen: boolean;
  closeModal: () => void;
  group: GroupModel;
  tags?: TagModel[] | null;
  setTags?: (tags: TagModel[]) => void;
  setDeleteTags?: Dispatch<SetStateAction<TagModel[]>>;
  setGroup: (group: GroupModel) => void;
  submit: () => void;
  updating: boolean;
}) {
  const newGroup = group?.id === "placeholder";
  const [deleteTag, setDeleteTag] = useState<TagModel | null>(null);
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  return (
    <>
      <DeleteConfirmation
        name={deleteTag?.name ?? "Tag"}
        isOpen={deleteConfirmationIsOpen}
        closeModal={() => setDeleteConfirmationIsOpen(false)}
        confirm={() => {
          if (tags && setTags && deleteTag && setDeleteTags) {
            setTags([...tags.filter((t) => t.id !== deleteTag.id)]);
            setDeleteConfirmationIsOpen(false);
          }
        }}
        updating={false}
      />
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 w-full"
          onClose={closeModal}
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
          <div className="fixed inset-0">
            <div className="absolute w-full bottom-0">
              <TransitionChild
                enter="transition ease-in-out duration-300 transform"
                enterFrom="transform translate-y-full"
                enterTo="transform translate-y-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="transform translate-y-0"
                leaveTo="transform translate-y-full"
              >
                <DialogPanel className="rounded-t-3xl bg-white p-6 shadow-xl">
                  <div
                    className="absolute right-4 top-4 p-2 cursor-pointer"
                    onClick={closeModal}
                  >
                    <XMarkIcon className="w-6 h-6 text-black" />
                  </div>
                  <DialogTitle
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 text-center"
                  >
                    {newGroup ? "Create New Group" : "Edit Group"}
                  </DialogTitle>
                  <div className="my-4">
                    <p className="text-sm text-gray-900">Name</p>
                    <input
                      type="text"
                      autoFocus
                      className="w-full rounded-none resize-none border-t-0 bg-transparent font-sans text-lg font-semibold text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:border-t-0 focus:outline-0"
                      placeholder="Group Name"
                      value={group.name}
                      onChange={(e) =>
                        setGroup({
                          ...group,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  {tags !== null && tags !== undefined && setTags && (
                    <div className="my-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-900">Tags</p>
                        <button
                          type="button"
                          className="rounded-3xl border-transparent border-2 bg-blue-200 px-3 py-1 mx-1 my-1 text-xs font-light text-blue-900"
                          onClick={() => setTags([...tags, InitTag])}
                        >
                          Create Tag
                        </button>
                      </div>
                      <div className="flex flex-wrap h-32 border-t-gray-200 border-b-gray-200 border-2 border-l-0 border-r-0 overflow-auto">
                        {tags.map((t, i) => (
                          <div
                            className="flex w-full justify-between items-center"
                            key={i}
                          >
                            <input
                              autoFocus={t.name === ""}
                              id={i.toString()}
                              type="text"
                              className="w-full rounded-none resize-none border-t-0 bg-transparent font-sans text-lg font-semibold text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:border-t-0 focus:outline-0"
                              placeholder="Roadtrip"
                              value={t.name}
                              onChange={(e) => {
                                setTags([
                                  ...tags.slice(0, i),
                                  { ...t, name: e.target.value },
                                  ...tags.slice(i + 1),
                                ]);
                              }}
                            />
                            <Listbox
                              value={t.colour ?? "blue"}
                              onChange={(colour) =>
                                setTags([
                                  ...tags.slice(0, i),
                                  { ...t, colour },
                                  ...tags.slice(i + 1),
                                ])
                              }
                            >
                              <ListboxButton>
                                <svg
                                  height="40"
                                  width="40"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    r="15"
                                    cx="20"
                                    cy="20"
                                    className={getColourClasses(t.colour).fill}
                                  />
                                </svg>
                              </ListboxButton>
                              <ListboxOptions
                                anchor="top"
                                transition
                                className="h-52 rounded-xl border border-white/5 bg-gray-100 p-1 focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
                              >
                                {Object.entries(colourClasses).map(
                                  ([colour, clz], i) => (
                                    <ListboxOption
                                      key={i}
                                      value={colour}
                                      onClick={() =>
                                        setTags([
                                          ...tags.slice(
                                            0,
                                            tags.map((t) => t.id).indexOf(t.id)
                                          ),
                                          { ...t, colour },
                                          ...tags.slice(
                                            tags
                                              .map((t) => t.id)
                                              .indexOf(t.id) + 1
                                          ),
                                        ])
                                      }
                                      className="group flex justify-between cursor-default items-center rounded-lg px-2 select-none data-[focus]:bg-white/10"
                                    >
                                      <svg
                                        height="40"
                                        width="40"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <circle
                                          r="15"
                                          cx="20"
                                          cy="20"
                                          className={clz.fill}
                                        />
                                      </svg>
                                    </ListboxOption>
                                  )
                                )}
                              </ListboxOptions>
                            </Listbox>
                            <div
                              className="p-2 cursor-pointer"
                              onClick={() => {
                                if (t.id !== "placeholder") {
                                  setDeleteTag(t);
                                  setDeleteConfirmationIsOpen(true);
                                }
                              }}
                            >
                              <TrashIcon
                                className={
                                  "w-6 h-6 " +
                                  (t.id === "placeholder"
                                    ? "text-gray-200"
                                    : "text-red-600")
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* <div className="my-4">
                  <p className="text-sm text-gray-900">TODO: Metadata Edit in Group</p>
                  <p className="text-sm text-gray-900">TODO: Scroll load for many members</p>
                  <p className="text-sm text-gray-900">TODO: members automate going onto new year</p>
                  <p className="text-sm text-gray-900">TODO: Non-select metadata fields</p>
                  <p className="text-sm text-gray-900">TODO: bottom fixed position not working in iphone</p>
                </div> */}
                  {updating ? (
                    <div className="flex justify-center items-center">
                      <Loader show />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!group.name || tags?.some((t) => !t.name)}
                      className="inline-flex w-full mt-4 justify-center rounded-3xl border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={submit}
                    >
                      {newGroup ? "Create" : "Update"}
                    </button>
                  )}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
