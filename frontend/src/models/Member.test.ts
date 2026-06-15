import { describe, it, expect } from "vitest";
import { compareMetadata, getYearString } from "./Member";

describe("getYearString", () => {
  it("maps numeric year codes to ordinal labels", () => {
    expect(getYearString("1")).toBe("1st Year • ");
    expect(getYearString("2")).toBe("2nd Year • ");
    expect(getYearString("3")).toBe("3rd Year • ");
    expect(getYearString("4")).toBe("4th Year • ");
    expect(getYearString("5")).toBe("5th Year • ");
    expect(getYearString("6+")).toBe("6th Year+ • ");
  });

  it("returns an empty string for unknown or missing codes", () => {
    expect(getYearString(undefined)).toBe("");
    expect(getYearString("7")).toBe("");
    expect(getYearString("")).toBe("");
  });
});

describe("compareMetadata", () => {
  it("treats two undefined metadata objects as equal", () => {
    expect(compareMetadata(undefined, undefined)).toBe(true);
  });

  it("treats one undefined and one defined object as unequal", () => {
    expect(compareMetadata(undefined, { a: "1" })).toBe(false);
    expect(compareMetadata({ a: "1" }, undefined)).toBe(false);
  });

  it("returns true for objects with identical keys and values", () => {
    expect(compareMetadata({ a: "1", b: "2" }, { a: "1", b: "2" })).toBe(true);
  });

  it("is order independent", () => {
    expect(compareMetadata({ a: "1", b: "2" }, { b: "2", a: "1" })).toBe(true);
  });

  it("returns false when a value differs", () => {
    expect(compareMetadata({ a: "1" }, { a: "2" })).toBe(false);
  });

  it("returns false when the number of keys differs", () => {
    expect(compareMetadata({ a: "1" }, { a: "1", b: "2" })).toBe(false);
  });

  it("treats two empty objects as equal", () => {
    expect(compareMetadata({}, {})).toBe(true);
  });
});
