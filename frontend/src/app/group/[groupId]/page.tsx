"use client";
import AuthCheck from "@/components/AuthCheck";
import Botbar from "@/components/Botbar";
import Event from "@/components/Event";
import CreateEvent from "@/components/CreateEvent";
import { Filter, InitFilter } from "@/helper/Filter";
import { GroupContext, UserContext } from "@/lib/context";
import { getEvents, submitEvent } from "@/lib/events";
import { EventModel, InitSubmitEvent, SubmitEventModel } from "@/models/Event";
import { useContext, useEffect, useState } from "react";
import { GroupId } from "@/models/Group";
import { addGroupToUserGroups } from "@/lib/users";
import { TagModel } from "@/models/Tag";

export default function Group({ params }: { params: { groupId: GroupId } }) {
  const user = useContext(UserContext);
  const [group, setGroup] = useContext(GroupContext);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [showedEvents, setShowedEvents] = useState<EventModel[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [filter, setFilter] = useState<Filter>(InitFilter);

  const [submitEventForm, setSubmitEventForm] =
    useState<SubmitEventModel>(InitSubmitEvent);

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  function createEvent() {
    submitEvent(group.id, submitEventForm).then((submittedEvent) => {
      let newEvents = [submittedEvent].concat(events);
      setEvents(newEvents);
      setShowedEvents(filter.sort(newEvents));
      setSelectedIndex(0);
    });
    setSubmitEventForm(InitSubmitEvent);
    closeModal();
  }

  useEffect(() => {
    if (user?.id && (!user.groups || !user.groups.includes(params.groupId))) {
      addGroupToUserGroups(user.id, params.groupId);
    }
    getEvents(params.groupId).then((events) => {
      setEvents(events);
      setShowedEvents(events);
    });
  }, [user, params.groupId]);

  return (
    <AuthCheck>
      {group && (
        <CreateEvent
          groupId={group.id}
          tags={group.tags}
          setTags={(tags: TagModel[]) => setGroup({ ...group, tags })}
          isOpen={isOpen}
          closeModal={closeModal}
          submitEventForm={submitEventForm}
          setSubmitEventForm={setSubmitEventForm}
          createEvent={createEvent}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      )}
      <div className="p-12"></div>
      {showedEvents.map((event, i) => (
        <div key={i}>
          <hr className="my-4 h-[1px] border-t-0 bg-neutral-300" />
          <Event event={event} groupId={params.groupId} />
        </div>
      ))}
      <hr className="my-4 h-[1px] border-t-0 bg-neutral-300" />
      <h1 className="mt-96">SOW-416: TODO Group settings</h1>
      <h1>TODO: Sort by tags</h1>
      <div className="p-2">
        <div className="flex items-center justify-between">
          {filter.name === "Tag" &&
            group &&
            group.tags &&
            group.tags.map((tag, i) => (
              <button key={i} onClick={() => {}}>
                {tag.name}
              </button>
            ))}
        </div>
      </div>
      <Botbar
        filter={filter}
        filterEvents={(f) => {
          setShowedEvents(f.sort(events));
          setFilter(f);
        }}
        openModal={openModal}
      />
    </AuthCheck>
  );
}
