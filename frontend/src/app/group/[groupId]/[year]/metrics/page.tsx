"use client";
import Tag, { getColourClasses } from "@/components/event/Tag";
import Topbar from "@/components/Topbar";
import { Path } from "@/helper/Path";
import { allowedYears, currentYearStr } from "@/helper/Time";
import { EventsContext, TagsContext } from "@/lib/context";
import { GroupId } from "@/models/Group";
import { TagModel } from "@/models/Tag";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function Metrics({
  params,
}: {
  params: { groupId: GroupId; year: string };
}) {
  const events = useContext(EventsContext);
  const tags = useContext(TagsContext);
  const [metricByTag, setMetricByTag] = useState<{
    [tagName: string]: {
      attendance: { name: string; Attendance: number }[];
      average?: { name: string; Average: number; colour?: string };
    };
  }>({});
  const [maxNumber, setMaxNumber] = useState(0);

  useEffect(() => {
    if (tags && events) {
      let maxNumber = 0;
      let eventsByTag: {
        [tagName: string]: {
          attendance: { name: string; Attendance: number }[];
          average?: { name: string; Average: number; colour?: string };
        };
      } = {};
      for (const tag of tags) {
        eventsByTag[tag.name] = { attendance: [] };
      }
      for (const event of events) {
        const attendanceNumbers = event.members?.length ?? 0;
        if (maxNumber < attendanceNumbers) {
          maxNumber = attendanceNumbers;
        }

        for (const tag of event.tags) {
          if (eventsByTag[tag.name]) {
            eventsByTag[tag.name].attendance.unshift({
              name: event.name,
              Attendance: attendanceNumbers,
            });
          }
        }
      }
      for (const tag of tags) {
        eventsByTag[tag.name].average = {
          name: tag.name,
          colour: tag.colour,
          Average:
            eventsByTag[tag.name].attendance.reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.Attendance,
              0
            ) / eventsByTag[tag.name].attendance.length,
        };
      }
      setMetricByTag(eventsByTag);
      setMaxNumber(maxNumber);
    }
  }, [tags, events]);

  const router = useRouter();

  const years =
    params.year === currentYearStr
      ? allowedYears().slice(0, -1)
      : allowedYears();

  return (
    <>
      <Topbar year={params.year} />
      <div className="mx-4">
        <div className="flex justify-between items-center mt-3 mb-10">
          <h1 className="text-2xl">Metrics</h1>
          <div className="flex justify-end">
            <Listbox
              value={params.year}
              onChange={(value) =>
                router.push(Path.Group + "/" + params.groupId + "/" + value)
              }
            >
              <div className="flex justify-between">
                <ListboxButton
                  disabled={years.length === 0}
                  className="flex justify-between items-center appearance-none rounded-lg bg-white/5 text-left text-lg font-semibold focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 text-gray-600"
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
                className="rounded-xl border border-white/5 bg-gray-100 p-1 focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 data-[selected]:bg-gray-200 data-[focus]:bg-gray-200"
              >
                {years.map((year, j) => (
                  <ListboxOption
                    key={j}
                    value={year}
                    className="group flex justify-between cursor-pointer items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
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
        </div>
        <h1 className="text-xl">Average attendance by Tag</h1>
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.values(metricByTag).map((m) => m.average)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar type="monotone" dataKey="Average">
                {Object.values(metricByTag)
                  .map((m) => m.average)
                  .map((e, i) => (
                    <Cell
                      key={i}
                      fill={
                        e?.colour ? getColourClasses(e.colour).hex : "#3B82F6"
                      }
                    />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {Object.entries(metricByTag).map(([tName, m], i) => {
          const tag = tags?.find((t) => t.name === tName) as TagModel;
          return (
            <div key={i}>
              <Tag tag={tag} disabled />
              <div style={{ width: "100%", height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={m.attendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, maxNumber]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Attendance"
                      stroke={
                        tag.colour
                          ? getColourClasses(tag.colour).hex
                          : "#3B82F6"
                      }
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
