import { convertToDateTimeLocalString } from "@/helper/Time";
import { addTag } from "@/lib/tags";
import { GroupId } from "@/models/Group";
import { InitTag, TagModel } from "@/models/Tag";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import Tag from "./Tag";
import { EventModel } from "@/models/Event";
import Loader from "../Loader";
import DeleteEvent from "./DeleteEvent";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function EditEvent({
  groupId,
  tags,
  isOpen,
  closeModal,
  deleteConfirmationIsOpen,
  openDeleteConfirmationModal,
  closeDeleteConfirmationModal,
  submitEventForm,
  setSubmitEventForm,
  submitEvent,
  deleteEvent,
  updatingDelete,
  selectedIndex,
  setSelectedIndex,
  updating,
}: {
  groupId: GroupId;
  tags?: TagModel[];
  isOpen: boolean;
  closeModal: () => void;
  deleteConfirmationIsOpen?: boolean;
  openDeleteConfirmationModal?: () => void;
  closeDeleteConfirmationModal?: () => void;
  submitEventForm: EventModel;
  setSubmitEventForm: (event: EventModel) => void;
  submitEvent: () => void;
  deleteEvent?: () => void;
  updatingDelete?: boolean;
  selectedIndex: number;
  setSelectedIndex: (i: number) => void;
  updating: boolean;
}) {
  const newEvent = submitEventForm.id === "placeholder";
  const [editTag, setEditTag] = useState<TagModel | null>(null);

  function incrementStep() {
    setSelectedIndex(selectedIndex + 1);
  }
  return (
    <>
      {deleteConfirmationIsOpen !== undefined &&
        closeDeleteConfirmationModal &&
        deleteEvent &&
        updatingDelete !== undefined && (
          <DeleteEvent
            name={submitEventForm.name}
            isOpen={deleteConfirmationIsOpen}
            closeModal={closeDeleteConfirmationModal}
            confirm={deleteEvent}
            updating={updatingDelete}
          />
        )}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 w-full"
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
                <DialogPanel className="rounded-t-3xl bg-white p-6 text-center shadow-xl">
                  <div
                    className="absolute right-4 top-4 p-2 cursor-pointer"
                    onClick={closeModal}
                  >
                    <XMarkIcon className="w-6 h-6 text-black" />
                  </div>
                  {!newEvent && (
                    <div
                      className="absolute left-4 top-4 p-2 cursor-pointer"
                      onClick={openDeleteConfirmationModal}
                    >
                      <TrashIcon className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  <TabGroup
                    selectedIndex={selectedIndex}
                    onChange={setSelectedIndex}
                  >
                    <TabList className="flex justify-center space-x-2 rounded-xl p-1.5">
                      <Tab
                        className={({ selected }) =>
                          selected
                            ? "h-1 w-12 rounded-xl bg-blue-500"
                            : "h-1 w-12 rounded-xl bg-blue-100"
                        }
                      />
                      <Tab
                        className={({ selected }) =>
                          selected
                            ? "h-1 w-12 rounded-xl bg-blue-500"
                            : "h-1 w-12 rounded-xl bg-blue-100"
                        }
                        disabled={!submitEventForm.name}
                      />
                      <Tab
                        className={({ selected }) =>
                          selected
                            ? "h-1 w-12 rounded-xl bg-blue-500"
                            : "h-1 w-12 rounded-xl bg-blue-100"
                        }
                        disabled={!submitEventForm.name}
                      />
                    </TabList>
                    <TabPanels className="mt-3">
                      <TabPanel>
                        <ul>
                          <DialogTitle
                            as="h3"
                            className="text-xl font-medium leading-6 text-gray-900"
                          >
                            {newEvent ? "Create" : "Edit"} Your event.
                          </DialogTitle>
                          <p className="mt-2 px-12 text-sm text-gray-500">
                            Start by naming your event. This will be the name
                            displayed for everyone but it can always be changed
                            later.
                          </p>
                          <input
                            type="text"
                            autoFocus
                            className="my-11 w-full rounded-none resize-none text-center border-b border-blue-gray-200 border-t-0 bg-transparent pt-4 font-sans text-md font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:border-t-0 focus:outline-0"
                            placeholder="Awesome Event"
                            value={submitEventForm.name}
                            onChange={(event) =>
                              setSubmitEventForm({
                                ...submitEventForm,
                                name: event.target.value,
                              })
                            }
                            onKeyDown={(event) =>
                              event.key === "Enter" &&
                              submitEventForm.name.length > 0 &&
                              incrementStep()
                            }
                          />
                        </ul>
                      </TabPanel>
                      <TabPanel>
                        <ul>
                          <DialogTitle
                            as="h3"
                            className="text-xl font-medium leading-6 text-gray-900"
                          >
                            Categorise your event.
                          </DialogTitle>
                          <p className="mt-2 px-8 text-sm text-gray-500">
                            Attach relevant tags make it easier to organise your
                            events into categories.
                          </p>
                          <p className="mt-7 mb-1 text-xs font-light text-gray-400">
                            Add Tags
                          </p>
                          <div className="flex flex-wrap justify-center">
                            {tags?.map((t, i) => (
                              <Tag
                                key={i}
                                tag={t}
                                selected={submitEventForm.tags
                                  .map((t) => t.id)
                                  .includes(t.id)}
                                onClick={() =>
                                  setSubmitEventForm({
                                    ...submitEventForm,
                                    tags: submitEventForm.tags
                                      .map((t) => t.id)
                                      .includes(t.id)
                                      ? submitEventForm.tags
                                          .slice(
                                            0,
                                            submitEventForm.tags
                                              .map((t) => t.id)
                                              .indexOf(t.id)
                                          )
                                          .concat(
                                            submitEventForm.tags.slice(
                                              submitEventForm.tags
                                                .map((t) => t.id)
                                                .indexOf(t.id) + 1
                                            )
                                          )
                                      : submitEventForm.tags.concat(t),
                                  })
                                }
                              />
                            ))}
                          </div>
                          <div className="flex justify-center">
                            {editTag?.id === "placeholder" ? (
                              <input
                                type="text"
                                placeholder="Roadtrip"
                                style={{
                                  width: `${editTag.name.length + 3}ch`,
                                  minWidth: "112px",
                                }}
                                className="rounded-3xl border-transparent border-2 text-center bg-white px-2 py-1 mx-1 my-1 text-md font-medium text-black"
                                value={editTag.name}
                                onChange={(e) =>
                                  setEditTag({
                                    ...editTag,
                                    name: e.target.value,
                                  })
                                }
                                autoFocus
                                onBlur={() => {
                                  editTag.name.length > 0
                                    ? addTag(groupId, editTag).then((tag) => {
                                        setSubmitEventForm({
                                          ...submitEventForm,
                                          tags: submitEventForm.tags.concat(
                                            tag
                                          ),
                                        });
                                        setEditTag(null);
                                      })
                                    : setEditTag(null);
                                }}
                                onKeyDown={(event) =>
                                  event.key === "Enter" &&
                                  addTag(groupId, editTag).then((tag) => {
                                    setSubmitEventForm({
                                      ...submitEventForm,
                                      tags: submitEventForm.tags.concat(tag),
                                    });
                                    setEditTag(null);
                                  })
                                }
                              />
                            ) : (
                              <button
                                type="button"
                                className="rounded-3xl border-transparent border-2 bg-blue-200 px-3 py-1 mx-1 my-1 text-md font-medium text-blue-900"
                                onClick={() => setEditTag(InitTag)}
                              >
                                Create Tag
                              </button>
                            )}
                          </div>
                        </ul>
                      </TabPanel>
                      <TabPanel>
                        <ul>
                          <DialogTitle
                            as="h3"
                            className="text-xl font-medium leading-6 text-gray-900"
                          >
                            Set the day and time.
                          </DialogTitle>
                          <div className="flex flex-wrap mt-16 mb-4 justify-between items-center">
                            <p className="text-xs">Start Time</p>
                            <input
                              type="datetime-local"
                              value={convertToDateTimeLocalString(
                                submitEventForm.dateStart
                              )}
                              onChange={(event) => {
                                setSubmitEventForm({
                                  ...submitEventForm,
                                  dateStart: new Date(event.target.value),
                                });
                              }}
                            />
                          </div>
                          <div className="flex flex-wrap mb-16 justify-between items-center">
                            <p className="text-xs">End Time</p>
                            <input
                              type="datetime-local"
                              value={convertToDateTimeLocalString(
                                submitEventForm.dateEnd
                              )}
                              onChange={(event) =>
                                setSubmitEventForm({
                                  ...submitEventForm,
                                  dateEnd: new Date(event.target.value),
                                })
                              }
                              min={convertToDateTimeLocalString(
                                submitEventForm.dateStart
                              )}
                            />
                          </div>
                        </ul>
                      </TabPanel>
                    </TabPanels>
                    {updating ? (
                      <div className="flex justify-center items-center">
                        <Loader show />
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          selectedIndex === 0
                            ? !submitEventForm.name
                            : selectedIndex === 1
                            ? false
                            : selectedIndex === 2
                            ? !submitEventForm.dateStart ||
                              !submitEventForm.dateEnd
                            : false
                        }
                        className="inline-flex w-full mt-4 justify-center rounded-3xl border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={
                          !newEvent
                            ? submitEvent
                            : selectedIndex === 2
                            ? submitEvent
                            : incrementStep
                        }
                      >
                        {newEvent
                          ? selectedIndex === 2
                            ? "Create event"
                            : "Next"
                          : "Save"}
                      </button>
                    )}
                  </TabGroup>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
