"use client";
import Botbar from "@/components/Botbar";
import Loader from "@/components/Loader";
import Topbar from "@/components/Topbar";
import EditEvent from "@/components/event/EditEvent";
import EventComponent from "@/components/event/EventComponent";
import Export from "@/components/group/Export";
import { Filter, InitFilter } from "@/helper/Filter";
import { GroupPath, Path } from "@/helper/Path";
import { allowedYears, currentYearStr, inBetween } from "@/helper/Time";
import { promiseToast } from "@/helper/Toast";
import { EventsContext, GroupContext, TagsContext } from "@/lib/context";
import { deleteEvent, submitEvent, updateEvent } from "@/lib/events";
import { EventModel, InitEvent } from "@/models/Event";
import { GroupId } from "@/models/Group";
import { TagId } from "@/models/Tag";
import { universityColours, universityNames } from "@/models/University";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { ArrowDownTrayIcon, CheckIcon } from "@heroicons/react/16/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Group({
  params,
}: {
  params: { groupId: GroupId; year: string };
}) {
  const group = useContext(GroupContext);
  const tags = useContext(TagsContext);
  const events = useContext(EventsContext);
  const [showedEvents, setShowedEvents] = useState<EventModel[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [filter, setFilter] = useState<Filter>(InitFilter);
  const [filteredTags, setFilteredTags] = useState<TagId[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [submitEventForm, setSubmitEventForm] = useState<EventModel>(InitEvent);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenExport, setIsOpenExport] = useState(false);

  function openExportModal() {
    setIsOpenExport(true);
  }

  function closeExportModal() {
    setIsOpenExport(false);
  }

  function openModal() {
    setSelectedIndex(0);
    setUpdating(false);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  async function deleteEventIn() {
    setUpdatingDelete(true);
    if (group && submitEventForm) {
      await promiseToast<void>(
        deleteEvent(group.id, submitEventForm.id),
        "Deleting Event...",
        "Event Deleted!",
        "Could not delete event."
      );
    }
    setIsOpen(false);
    setDeleteConfirmationIsOpen(false);
  }

  const [updatingDelete, setUpdatingDelete] = useState(false);
  const [deleteConfirmationIsOpen, setDeleteConfirmationIsOpen] =
    useState(false);

  function closeDeleteConfirmationModal() {
    setDeleteConfirmationIsOpen(false);
    openModal();
  }

  function openDeleteConfirmationModal() {
    closeModal();
    setUpdatingDelete(false);
    setDeleteConfirmationIsOpen(true);
  }

  const router = useRouter();

  async function editEvent() {
    setUpdating(true);
    if (submitEventForm.id === "placeholder") {
      const submittedEvent = await promiseToast<EventModel>(
        submitEvent(params.groupId, submitEventForm),
        "Creating event...",
        "Event Created!",
        "Could not create event."
      );
      const happeningNow = submitEventForm
        ? inBetween(
            submitEventForm.dateStart,
            new Date(),
            submitEventForm.dateEnd
          )
        : false;
      if (happeningNow) {
        router.push(
          `${Path.Group}/${params.groupId}/${params.year}/${GroupPath.Event}/${submittedEvent.id}`
        );
      } else {
        closeModal();
      }
    } else {
      await promiseToast<void>(
        updateEvent(params.groupId, submitEventForm),
        "Updating event...",
        "Event Updated!",
        "Could not update event."
      );
      closeModal();
    }
  }

  useEffect(() => {
    if (group && events) {
      setSubmitEventForm(InitEvent(group?.name));
      setShowedEvents(
        events.sort(
          (a, b) =>
            (b.dateEnd ? b.dateEnd : b.dateStart).valueOf() -
            (a.dateEnd ? a.dateEnd : a.dateStart).valueOf()
        )
      );
      setLoading(false);
    }
  }, [group, events, params.groupId]);

  const years =
    params.year === currentYearStr
      ? allowedYears().slice(0, -1)
      : allowedYears();

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const disabled = currentYearStr !== params.year;
  return (
    <>
      <Topbar year={params.year} />
      {loading ? (
        <div className="flex justify-center items-center my-24">
          <Loader show />
        </div>
      ) : (
        <>
          {group && tags !== null && (
            <Export
              groupId={params.groupId}
              isOpen={isOpenExport}
              closeModal={closeExportModal}
              tags={tags}
            />
          )}
          {!disabled && group && tags !== null && (
            <EditEvent
              groupId={group.id}
              tags={tags}
              isOpen={isOpen}
              closeModal={closeModal}
              submitEventForm={submitEventForm}
              setSubmitEventForm={setSubmitEventForm}
              deleteConfirmationIsOpen={deleteConfirmationIsOpen}
              openDeleteConfirmationModal={openDeleteConfirmationModal}
              closeDeleteConfirmationModal={closeDeleteConfirmationModal}
              deleteEvent={deleteEventIn}
              updatingDelete={updatingDelete}
              submitEvent={editEvent}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              updating={updating}
            />
          )}
          <div className="flex justify-between mx-4 mt-3">
            <h1 className="text-2xl">Events</h1>
            <button
              type="button"
              onClick={openExportModal}
              className="flex justify-end gap-2 items-center text-center text-gray-700 hover:text-black active:text-black text-sm rounded-lg py-2 px-2 bg-gray-200"
            >
              <ArrowDownTrayIcon className="cursor-pointer w-6 h-6 text-gray-500" />
              <p>EXPORT MULTIPLE</p>
            </button>
          </div>
          <div className="flex justify-end mx-4 mt-2 mb-5">
            <Listbox
              value={params.year}
              onChange={(value) =>
                router.push(Path.Group + "/" + params.groupId + "/" + value)
              }
            >
              <div className="flex justify-between">
                <ListboxButton
                  disabled={years.length === 0}
                  className="flex justify-between items-center appearance-none rounded-lg bg-white/5 text-left text-lg font-semibold focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 text-gray-600 hover:text-black active:text-black"
                >
                  {params.year === currentYearStr ? "Past Years" : "View Years"}
                  <ChevronDownIcon
                    className="pointer-events-none w-6 h-6 text-gray-600"
                    aria-hidden="true"
                  />
                </ListboxButton>
              </div>
              <ListboxOptions
                anchor="bottom"
                transition
                className="rounded-xl border border-white/5 bg-gray-100 p-1 focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
              >
                {years.map((year, j) => (
                  <ListboxOption
                    key={j}
                    value={year}
                    className="group flex justify-between cursor-pointer items-center gap-2 rounded-lg py-1.5 px-3 select-none"
                  >
                    <div className="text-lg font-semibold">{year}</div>
                    <CheckIcon
                      className="invisible size-4 group-data-[selected]:visible right-4 w-5 h-5 text-black"
                      aria-hidden="true"
                    />
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>
          {group &&
            showedEvents.map((event, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: event.groupId
                    ? `rgba(${hexToRgb(
                        universityColours[universityNames[event.groupId]]
                      )}, 0.2)` // 0.3 for light opacity
                    : "",
                }}
              >
                <hr className="h-[1px] border-t-0 bg-neutral-300" />
                <div
                  className="cursor-pointer px-4 py-6"
                  onClick={() =>
                    router.push(
                      `${Path.Group}/${event.groupId ?? group.id}/${
                        params.year
                      }/event/${event.id}${
                        event.groupId ? "?fromGroupId=" + group.id : ""
                      }`
                    )
                  }
                >
                  <EventComponent
                    collabUnis={
                      event.collaboration
                        ? event.collaboration
                            .map((gId) => universityNames[gId])
                            .concat(
                              event.groupId
                                ? [universityNames[event.groupId]]
                                : []
                            )
                        : []
                    }
                    event={event}
                    showButton
                    disabled={
                      disabled || event.groupId
                        ? event.groupId !== group.id
                        : false
                    }
                    openModal={() => {
                      setSubmitEventForm(event);
                      openModal();
                    }}
                  />
                </div>
              </div>
            ))}
          {showedEvents.length > 0 && (
            <hr className="h-[1px] border-t-0 bg-neutral-300" />
          )}
          <div className="py-16" />
          <Botbar
            filter={filter}
            filterEvents={(f) => {
              setShowedEvents(f.sort(events ?? [], filteredTags));
              setFilter(f);
            }}
            filteredTags={filteredTags}
            filterEventsByTags={(tagIds: TagId[]) => {
              setShowedEvents(
                tagIds.length > 0
                  ? events?.filter((e) =>
                      tagIds.every((tagId) =>
                        e.tags.map((t) => t.id).includes(tagId)
                      )
                    ) ?? []
                  : events ?? []
              );
              setFilteredTags(tagIds);
            }}
            openModal={() => {
              setSubmitEventForm(InitEvent(group?.name));
              openModal();
            }}
            tags={tags ?? []}
            tagsOpen={tagsOpen}
            setTagsOpen={setTagsOpen}
          />
        </>
      )}
    </>
  );
}
