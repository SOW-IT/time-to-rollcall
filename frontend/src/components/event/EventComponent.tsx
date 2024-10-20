import { EventModel } from "@/models/Event";
import { hoursAndMinutes, inBetween, sameDay, toddMMYYYY } from "@/helper/Time";
import LiveBadge from "./LiveBadge";
import Tag from "./Tag";
import { useState, useEffect } from "react";

export default function EventComponent({
  event,
  openModal,
  showButton,
}: {
  event: EventModel;
  openModal?: () => void;
  showButton?: boolean;
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);
  const happeningNow = event
    ? inBetween(event.dateStart, time, event.dateEnd)
    : false;
  const before = event ? time < event.dateStart : false;
  const after = time > event.dateEnd;
  return (
    <>
      <div className="flex items-center w-full h-min">
        <p className="text-gray-500 text-xs font-medium">
          {toddMMYYYY(event.dateStart)}
          {sameDay(event.dateStart, event.dateEnd)
            ? " - " + hoursAndMinutes(event.dateEnd)
            : " - " + toddMMYYYY(event.dateEnd)}
        </p>
        <div className="flex ml-auto">
          {happeningNow && <LiveBadge />}
          {before && (
            <p className="text-xs font-medium text-gray-500">NOT YET</p>
          )}
          {after && <p className="text-xs font-medium text-gray-500">ENDED</p>}
        </div>
      </div>
      <div className="pt-3 pb-6">
        <div className="flex flex-wrap justify-start mb-3">
          {event.tags?.map((t, i) => (
            <Tag key={i} tag={t} disabled />
          ))}
        </div>
        <h1
          className={
            happeningNow ? "text-2xl font-semibold" : "text-lg font-semibold"
          }
        >
          {event.name}
        </h1>
      </div>
      {happeningNow && showButton && <div className="py-6" />}
      {showButton && (
        <div className="flex items-center justify-between">
          {happeningNow ? (
            <button
              type="button"
              disabled
              className="text-gray-900 bg-gray-200 rounded-md font-medium text-xs p-1.5"
            >
              ATTENDANCE: {event.members?.length ?? 0}
            </button>
          ) : (
            <p className="text-gray-900 font-medium text-xs">
              ATTENDANCE: {event.members?.length ?? 0}
            </p>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openModal?.();
            }}
            className="rounded-3xl text-sm p-1 px-3 bg-white border-2 border-gray-600 text-gray-600 hover:bg-gray-300"
          >
            Edit
          </button>
        </div>
      )}
    </>
  );
}
