import { describe, it, expect } from "vitest";
import {
  University,
  getUniversityKey,
  universityIds,
  universityNames,
} from "./University";

describe("getUniversityKey", () => {
  it("returns the enum key for a known university value", () => {
    expect(getUniversityKey(University.UNSW)).toBe("UNSW");
    expect(getUniversityKey(University.USYD)).toBe("USYD");
  });

  it("returns undefined for an unknown value", () => {
    expect(getUniversityKey("Hogwarts")).toBeUndefined();
  });

  it("returns undefined when no value is provided", () => {
    expect(getUniversityKey(undefined)).toBeUndefined();
  });
});

describe("universityIds / universityNames", () => {
  it("are consistent inverse mappings for every id", () => {
    for (const [name, id] of Object.entries(universityIds)) {
      // universityNames maps the id back to the matching University enum value.
      expect(universityNames[id]).toBe(name);
    }
  });

  it("maps every id back to a defined university", () => {
    for (const id of Object.values(universityIds)) {
      expect(universityNames[id]).toBeDefined();
    }
  });
});
