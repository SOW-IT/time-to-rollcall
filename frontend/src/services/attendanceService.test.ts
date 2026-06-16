import { describe, it, expect } from "vitest";
import {
  searchForMemberByName,
  searchForMemberInformationByName,
} from "./attendanceService";
import { MemberModel } from "@/models/Member";
import { MemberInformation } from "@/models/Event";

const member = (name: string): MemberModel =>
  ({ id: name, name }) as unknown as MemberModel;

describe("searchForMemberByName", () => {
  const members = [member("John Smith"), member("Jane Doe"), member("Bob Jones")];

  it("partitions members into suggested (matching) and notSuggested", () => {
    const { suggested, notSuggested } = searchForMemberByName(members, "j");
    // case-insensitive substring: matches "John", "Jane", "Jones"
    expect(suggested.map((m) => m.name)).toEqual([
      "John Smith",
      "Jane Doe",
      "Bob Jones",
    ]);
    expect(notSuggested).toEqual([]);
  });

  it("is case-insensitive", () => {
    const { suggested } = searchForMemberByName(members, "SMITH");
    expect(suggested.map((m) => m.name)).toEqual(["John Smith"]);
  });

  it("puts everything in suggested for an empty query", () => {
    const { suggested, notSuggested } = searchForMemberByName(members, "");
    expect(suggested).toHaveLength(3);
    expect(notSuggested).toHaveLength(0);
  });

  it("puts non-matches in notSuggested", () => {
    const { suggested, notSuggested } = searchForMemberByName(members, "doe");
    expect(suggested.map((m) => m.name)).toEqual(["Jane Doe"]);
    expect(notSuggested.map((m) => m.name)).toEqual([
      "John Smith",
      "Bob Jones",
    ]);
  });
});

describe("searchForMemberInformationByName", () => {
  const infos: MemberInformation[] = [
    { member: member("John Smith") },
    { member: member("Jane Doe") },
  ];

  it("partitions member information by the nested member name", () => {
    const { suggested, notSuggested } = searchForMemberInformationByName(
      infos,
      "jane"
    );
    expect(suggested.map((i) => i.member.name)).toEqual(["Jane Doe"]);
    expect(notSuggested.map((i) => i.member.name)).toEqual(["John Smith"]);
  });
});
