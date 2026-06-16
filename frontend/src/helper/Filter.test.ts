import { describe, it, expect } from "vitest";
import { newestFilter, filters, InitFilter } from "./Filter";
import { EventModel } from "@/models/Event";
import { TagModel } from "@/models/Tag";

const tag = (id: string, name = id): TagModel => ({ id, name });

const event = (
  name: string,
  dateStart: Date,
  dateEnd: Date,
  tags: TagModel[] = []
): EventModel => ({
  id: name,
  name,
  tags,
  dateStart,
  dateEnd,
});

const oldestFilter = filters.find((f) => f.name === "Oldest")!;
const liveFilter = filters.find((f) => f.name === "Live")!;

describe("filters registry", () => {
  it("exposes Newest, Oldest and Live filters", () => {
    expect(filters.map((f) => f.name)).toEqual(["Newest", "Oldest", "Live"]);
  });

  it("defaults to the Newest filter", () => {
    expect(InitFilter).toBe(newestFilter);
  });
});

describe("newestFilter", () => {
  it("sorts events by end date, most recent first", () => {
    const a = event("a", new Date(2026, 0, 1), new Date(2026, 0, 2));
    const b = event("b", new Date(2026, 0, 3), new Date(2026, 0, 4));
    const sorted = newestFilter.sort([a, b], []);
    expect(sorted.map((e) => e.name)).toEqual(["b", "a"]);
  });
});

describe("oldestFilter", () => {
  it("sorts events by end date, earliest first", () => {
    const a = event("a", new Date(2026, 0, 1), new Date(2026, 0, 2));
    const b = event("b", new Date(2026, 0, 3), new Date(2026, 0, 4));
    const sorted = oldestFilter.sort([b, a], []);
    expect(sorted.map((e) => e.name)).toEqual(["a", "b"]);
  });
});

describe("tag filtering", () => {
  it("only keeps events that contain every requested tag", () => {
    const t1 = tag("1");
    const t2 = tag("2");
    const both = event("both", new Date(2026, 0, 1), new Date(2026, 0, 2), [
      t1,
      t2,
    ]);
    const onlyOne = event("onlyOne", new Date(2026, 0, 1), new Date(2026, 0, 2), [
      t1,
    ]);
    const sorted = newestFilter.sort([both, onlyOne], ["1", "2"]);
    expect(sorted.map((e) => e.name)).toEqual(["both"]);
  });
});

describe("liveFilter", () => {
  it("keeps only events that are currently happening", () => {
    const now = Date.now();
    const live = event(
      "live",
      new Date(now - 3600_000),
      new Date(now + 3600_000)
    );
    const past = event(
      "past",
      new Date(now - 7200_000),
      new Date(now - 3600_000)
    );
    const future = event(
      "future",
      new Date(now + 3600_000),
      new Date(now + 7200_000)
    );
    const sorted = liveFilter.sort([live, past, future], []);
    expect(sorted.map((e) => e.name)).toEqual(["live"]);
  });
});
