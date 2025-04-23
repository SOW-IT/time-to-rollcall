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
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import Tag from "./Tag";
import { EventModel } from "@/models/Event";
import Loader from "../Loader";
import DeleteConfirmation from "../DeleteConfirmation";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { universityIds } from "@/models/University";
import GroupBadge from "./GroupBadge";

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
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  updating: boolean;
}) {
  const newEvent = submitEventForm.id === "placeholder";
  const [editTag, setEditTag] = useState<TagModel | null>(null);

  function incrementStep() {
    setSelectedIndex((prevIndex) => prevIndex + 1);
  }
  const isCampus = Object.values(universityIds).includes(groupId);
  return (
    <>
      {deleteConfirmationIsOpen !== undefined &&
        closeDeleteConfirmationModal &&
        deleteEvent &&
        updatingDelete !== undefined && (
          <DeleteConfirmation
            name={submitEventForm.name}
            description={submitEventForm.name + " will be deleted forever"}
            isOpen={deleteConfirmationIsOpen}
            closeModal={closeDeleteConfirmationModal}
            confirm={deleteEvent}
            updating={updatingDelete}
          />
        )}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 overflow-hidden"
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
                <DialogPanel className="rounded-t-3xl bg-white p-4 text-center shadow-xl">
                  <div
                    className="absolute right-2 top-2 p-2 cursor-pointer"
                    onClick={closeModal}
                  >
                    <XMarkIcon className="w-6 h-6 text-black hover:text-gray-600 active:text-gray-600" />
                  </div>
                  {!newEvent && (
                    <div
                      className="absolute left-2 top-2 p-2 cursor-pointer"
                      onClick={openDeleteConfirmationModal}
                    >
                      <TrashIcon className="w-6 h-6 text-red-600 hover:text-red-800 active:text-red-800" />
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
                      {isCampus && (
                        <Tab
                          className={({ selected }) =>
                            selected
                              ? "h-1 w-12 rounded-xl bg-blue-500"
                              : "h-1 w-12 rounded-xl bg-blue-100"
                          }
                          disabled={!submitEventForm.name}
                        />
                      )}
                      <Tab
                        className={({ selected }) =>
                          selected
                            ? "h-1 w-12 rounded-xl bg-blue-500"
                            : "h-1 w-12 rounded-xl bg-blue-100"
                        }
                        disabled={!submitEventForm.name}
                      />
                    </TabList>
                    <TabPanels className="mt-3 h-60">
                      <TabPanel>
                        <ul>
                          <DialogTitle
                            as="h3"
                            className="text-xl font-medium leading-6 text-gray-900"
                          >
                            {newEvent ? "Create" : "Edit"} Your event.
                          </DialogTitle>
                          <p className="mt-3 px-12 text-sm text-gray-500">
                            Name your event. This will be the name displayed for
                            everyone but it can always be changed later.
                          </p>
                          <input
                            type="text"
                            autoFocus
                            className="mt-11 mb-12 w-full rounded-none resize-none text-center border-b border-blue-gray-200 border-t-0 bg-transparent pt-4 font-sans text-md font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:border-t-0 focus:outline-0"
                            placeholder="Awesome Event"
                            value={submitEventForm.name ?? ""}
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
                          <p className="my-2 text-xs font-light text-gray-400">
                            Select Tags
                          </p>
                          <div className="flex flex-wrap justify-center max-h-32 overflow-auto">
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
                                className="rounded-3xl border-transparent border-2 text-center bg-white px-2 py-1 mt-2 text-md font-medium text-black"
                                value={editTag.name ?? ""}
                                onChange={(e) =>
                                  setEditTag({
                                    ...editTag,
                                    name: e.target.value,
                                  })
                                }
                                autoFocus
                                onBlur={() => {
                                  setEditTag(null);
                                  if (editTag.name.length > 0) {
                                    addTag(groupId, editTag).then((tag) => {
                                      setSubmitEventForm({
                                        ...submitEventForm,
                                        tags: submitEventForm.tags.concat(tag),
                                      });
                                    });
                                  }
                                }}
                                onKeyDown={async (event) => {
                                  if (event.key === "Enter") {
                                    setEditTag(null);
                                    addTag(groupId, editTag).then((tag) => {
                                      setSubmitEventForm({
                                        ...submitEventForm,
                                        tags: submitEventForm.tags.concat(tag),
                                      });
                                    });
                                  }
                                }}
                              />
                            ) : (
                              <button
                                type="button"
                                className="rounded-3xl border-transparent border-2 bg-blue-200 px-3 py-1 mt-2 text-md text-center font-medium text-blue-900"
                                onClick={() => setEditTag(InitTag)}
                              >
                                New Tag
                              </button>
                            )}
                          </div>
                        </ul>
                      </TabPanel>
                      {isCampus && (
                        <TabPanel>
                          <ul>
                            <DialogTitle
                              as="h3"
                              className="text-xl font-medium leading-6 text-gray-900"
                            >
                              Collaborate with other campuses?
                            </DialogTitle>
                            <p className="my-2 text-xs font-light text-gray-400">
                              Select other Campuses to collaborate with
                            </p>
                            {Object.entries(universityIds).map(
                              ([campus, id], index) => (
                                <div key={index} className="gap-2 my-2">
                                  <GroupBadge
                                    disabled={id === groupId}
                                    campus={campus}
                                    selected={
                                      submitEventForm.collaboration?.includes(
                                        id
                                      ) ?? false
                                    }
                                    className="px-4 text-base"
                                    onClick={() =>
                                      setSubmitEventForm({
                                        ...submitEventForm,
                                        collaboration:
                                          submitEventForm.collaboration
                                            ? submitEventForm.collaboration?.includes(
                                                id
                                              )
                                              ? submitEventForm.collaboration?.filter(
                                                  (c) => c !== id
                                                )
                                              : submitEventForm.collaboration?.concat(
                                                  id
                                                )
                                            : [id],
                                      })
                                    }
                                  />
                                </div>
                              )
                            )}
                          </ul>
                        </TabPanel>
                      )}
                      <TabPanel>
                        <ul>
                          <DialogTitle
                            as="h3"
                            className="text-xl font-medium leading-6 text-gray-900"
                          >
                            Set the day and time.
                          </DialogTitle>
                          <div className="flex flex-wrap mt-16 mb-6 justify-between items-center">
                            <p className="text-xs">Start Time</p>
                            <input
                              className="border-2 border-transparent"
                              type="datetime-local"
                              value={convertToDateTimeLocalString(
                                submitEventForm.dateStart
                              )}
                              onChange={(event) => {
                                let dateStart = new Date(event.target.value);
                                setSubmitEventForm({
                                  ...submitEventForm,
                                  dateStart,
                                  dateEnd:
                                    submitEventForm.dateEnd < dateStart
                                      ? new Date(dateStart.getTime() + 7200000)
                                      : submitEventForm.dateEnd,
                                });
                              }}
                            />
                          </div>
                          <div className="flex flex-wrap mb-16 justify-between items-center">
                            <p className="text-xs">End Time</p>
                            <input
                              className={
                                submitEventForm.dateEnd <
                                submitEventForm.dateStart
                                  ? "border-2 border-red-500 rounded"
                                  : "border-2 border-transparent"
                              }
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
                            : selectedIndex === (isCampus ? 2 : 1)
                            ? false
                            : selectedIndex === (isCampus ? 3 : 2)
                            ? !submitEventForm.dateStart ||
                              !submitEventForm.dateEnd ||
                              submitEventForm.dateEnd <
                                submitEventForm.dateStart
                            : false
                        }
                        className="inline-flex w-full mt-4 justify-center rounded-3xl border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={
                          !newEvent
                            ? submitEvent
                            : selectedIndex === (isCampus ? 3 : 2)
                            ? submitEvent
                            : incrementStep
                        }
                      >
                        {newEvent
                          ? selectedIndex === (isCampus ? 3 : 2)
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
