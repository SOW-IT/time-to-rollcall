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
import DeleteConfirmation from "../DeleteConfirmation";

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
        description={
          (deleteTag?.name ?? "Tag") +
          " will be deleted forever and removed from all events"
        }
        isOpen={deleteConfirmationIsOpen}
        closeModal={() => setDeleteConfirmationIsOpen(false)}
        confirm={() => {
          if (tags && setTags && deleteTag && setDeleteTags) {
            setDeleteTags((prevTags) => prevTags.concat(deleteTag));
            setTags(tags.filter((t) => t.id !== deleteTag.id));
            setDeleteConfirmationIsOpen(false);
            setDeleteTag(null);
          }
        }}
        updating={false}
      />
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-hidden"
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
                <DialogPanel className="rounded-t-3xl bg-white pt-4 pb-0 shadow-xl">
                  <div
                    className="absolute right-2 top-2 p-2 cursor-pointer"
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
                  <div className="overflow-auto max-h-[70vh] pb-10 px-4">
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
                            className="rounded-3xl border-transparent border-2 bg-black px-3 py-1 mx-1 my-1 text-xs font-light text-white"
                            onClick={() => setTags([...tags, InitTag])}
                          >
                            Create Tag
                          </button>
                        </div>
                        <div className="flex flex-wrap h-32 overflow-auto border-t-gray-200 border-b-gray-200 border-2 border-l-0 border-r-0">
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
                                      className={
                                        getColourClasses(t.colour).fill
                                      }
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
                                              tags
                                                .map((t) => t.id)
                                                .indexOf(t.id)
                                            ),
                                            { ...t, colour },
                                            ...tags.slice(
                                              tags
                                                .map((t) => t.id)
                                                .indexOf(t.id) + 1
                                            ),
                                          ])
                                        }
                                        className="group flex justify-between cursor-pointer items-center rounded-lg px-2 select-none data-[focus]:bg-white/10"
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
                  </div>
                  {updating ? (
                    <div className="bottom-2 w-full absolute flex justify-center items-center">
                      <Loader show />
                    </div>
                  ) : (
                    <div className="flex justify-center w-full bottom-2 absolute z-50 ">
                      <button
                        type="button"
                        disabled={!group.name || tags?.some((t) => !t.name)}
                        className="mt-4 rounded-3xl border border-transparent bg-black px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={submit}
                      >
                        {newGroup ? "Create" : "Update"}
                      </button>
                    </div>
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
