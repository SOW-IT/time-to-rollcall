import { describe, it, expect } from "vitest";
import {
  sameDay,
  inBetween,
  toddMonYYYY,
  convertToDateTimeLocalString,
  getSOWYear,
  allowedYears,
  currentYear,
} from "./Time";

describe("sameDay", () => {
  it("returns true for two dates on the same calendar day", () => {
    expect(
      sameDay(new Date(2026, 5, 16, 9, 0), new Date(2026, 5, 16, 23, 59))
    ).toBe(true);
  });

  it("returns false when the day differs", () => {
    expect(sameDay(new Date(2026, 5, 16), new Date(2026, 5, 17))).toBe(false);
  });

  it("returns false when the month differs but day number matches", () => {
    expect(sameDay(new Date(2026, 4, 16), new Date(2026, 5, 16))).toBe(false);
  });

  it("returns false when the year differs", () => {
    expect(sameDay(new Date(2025, 5, 16), new Date(2026, 5, 16))).toBe(false);
  });
});

describe("inBetween", () => {
  const start = new Date(2026, 0, 1, 10, 0);
  const end = new Date(2026, 0, 1, 12, 0);

  it("returns true when the date is strictly between start and end", () => {
    expect(inBetween(start, new Date(2026, 0, 1, 11, 0), end)).toBe(true);
  });

  it("is exclusive of the start boundary", () => {
    expect(inBetween(start, start, end)).toBe(false);
  });

  it("is exclusive of the end boundary", () => {
    expect(inBetween(start, end, end)).toBe(false);
  });

  it("returns false when the date is before start", () => {
    expect(inBetween(start, new Date(2026, 0, 1, 9, 0), end)).toBe(false);
  });

  it("returns false when the date is after end", () => {
    expect(inBetween(start, new Date(2026, 0, 1, 13, 0), end)).toBe(false);
  });
});

describe("toddMonYYYY", () => {
  it("formats a date as 'D Mon YYYY'", () => {
    // 16 June 2026
    expect(toddMonYYYY(new Date(2026, 5, 16))).toBe("16 Jun 2026");
  });
});

describe("convertToDateTimeLocalString", () => {
  it("produces a zero-padded datetime-local string", () => {
    expect(convertToDateTimeLocalString(new Date(2026, 0, 5, 3, 7))).toBe(
      "2026-01-05T03:07"
    );
  });

  it("pads two-digit components correctly", () => {
    expect(convertToDateTimeLocalString(new Date(2026, 11, 25, 17, 45))).toBe(
      "2026-12-25T17:45"
    );
  });
});

describe("getSOWYear", () => {
  it("returns the calendar year for dates before October", () => {
    // September (month index 8) -> same year
    expect(getSOWYear(new Date(2026, 8, 30))).toBe(2026);
  });

  it("rolls into the next SOW year from October onwards", () => {
    // October (month index 9) -> next year
    expect(getSOWYear(new Date(2025, 9, 1))).toBe(2026);
    expect(getSOWYear(new Date(2025, 11, 31))).toBe(2026);
  });

  it("treats January as the same calendar year", () => {
    expect(getSOWYear(new Date(2026, 0, 1))).toBe(2026);
  });
});

describe("allowedYears", () => {
  it("includes every year from 2024 to the current year inclusive", () => {
    const expected: number[] = [];
    for (let y = 2024; y <= currentYear; ++y) expected.push(y);
    expect(allowedYears()).toEqual(expected);
  });

  it("starts at 2024 and ends at the current year", () => {
    const years = allowedYears();
    expect(years[0]).toBe(2024);
    expect(years[years.length - 1]).toBe(currentYear);
  });
});
