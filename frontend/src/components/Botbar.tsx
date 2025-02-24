"use client";

import { Filter, filters, newestFilter } from "@/helper/Filter";
import { TagId, TagModel } from "@/models/Tag";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import Tag from "./event/Tag";

export default function Botbar({
  tags,
  filter,
  filteredTags,
  filterEventsByTags,
  filterEvents,
  openModal,
  tagsOpen,
  setTagsOpen,
}: {
  tags: TagModel[];
  filter: Filter;
  filteredTags: TagId[];
  filterEventsByTags: (tagIds: TagId[]) => void;
  filterEvents: (f: Filter) => void;
  openModal: () => void;
  tagsOpen: boolean;
  setTagsOpen: (to: boolean) => void;
}) {
  return (
    <nav className="flex justify-center h-full">
      <div className="fixed z-10 h-12 w-full max-w-max px-3 bottom-2">
        <div className="h-full flex items-center">
          <div className="bg-gray-200 bg-opacity-70 backdrop-blur-lg rounded-full grid w-full grid-cols-4 px-2">
            {filters.map((f, i) => (
              <button
                key={i}
                className={
                  "inline-flex flex-col items-center justify-center px-3 py-3 my-1 h-8 rounded-full " +
                  (filter.name === f.name ? "bg-white" : "")
                }
                onClick={() =>
                  filterEvents(filter.name === f.name ? newestFilter : f)
                }
              >
                {f.name}
              </button>
            ))}
            <button
              className={
                "inline-flex flex-col items-center justify-center px-3 py-3 my-1 h-8 rounded-full " +
                (tagsOpen || filteredTags.length > 0 ? "bg-white" : "")
              }
              onClick={() => {
                setTagsOpen(!tagsOpen);
              }}
            >
              Tags
            </button>
          </div>
          {tagsOpen && (
            <div
              className="absolute right-10 bottom-12 z-10 mt-2 w-32 origin-bottom rounded-md bg-transparent focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
            >
              <div role="none">
                {tags.map((t, i) => (
                  <Tag
                    key={i}
                    className="block w-32 "
                    selected={filteredTags.includes(t.id)}
                    tag={t}
                    onClick={() => {
                      if (filteredTags.includes(t.id)) {
                        filterEventsByTags(
                          filteredTags.filter((tag) => tag !== t.id)
                        );
                      } else {
                        filterEventsByTags([...filteredTags, t.id]);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <PlusCircleIcon
            className="w-14 h-14 text-gray-500 cursor-pointer hover:text-black active:text-black"
            onClick={openModal}
          />
        </div>
      </div>
    </nav>
  );
}
