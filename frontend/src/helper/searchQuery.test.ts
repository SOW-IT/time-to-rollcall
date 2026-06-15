import { describe, it, expect } from "vitest";
import { searchNamesPhonetically } from "./searchQuery";

describe("searchNamesPhonetically", () => {
  it("matches a case-insensitive substring", () => {
    expect(searchNamesPhonetically("john", "John Smith")).toBe(true);
    expect(searchNamesPhonetically("SMITH", "John Smith")).toBe(true);
  });

  it("matches an empty query against any name", () => {
    expect(searchNamesPhonetically("", "John Smith")).toBe(true);
  });

  it("returns false when the query is not contained in the name", () => {
    expect(searchNamesPhonetically("jane", "John Smith")).toBe(false);
  });

  it("matches partial fragments anywhere in the name", () => {
    expect(searchNamesPhonetically("hn sm", "John Smith")).toBe(true);
  });
});
