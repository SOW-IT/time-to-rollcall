import { describe, it, expect } from "vitest";
import {
  detectConflicts,
  buildMergedMember,
  getMetadataDisplayValue,
  ConflictResolutions,
} from "./merge";
import { MemberModel } from "@/models/Member";
import {
  MetadataInputModel,
  MetadataSelectModel,
} from "@/models/Metadata";

const m = (overrides: Partial<MemberModel>): MemberModel =>
  ({ id: "id", name: "Name", ...overrides }) as MemberModel;

const selectMeta: MetadataSelectModel = {
  id: "campus",
  key: "Campus",
  type: "select",
  order: 0,
  values: { unsw: "UNSW", usyd: "USYD" },
};

const inputMeta: MetadataInputModel = {
  id: "phone",
  key: "Phone",
  type: "input",
  order: 1,
};

describe("getMetadataDisplayValue", () => {
  it("resolves select values to their labels", () => {
    expect(getMetadataDisplayValue(selectMeta, "unsw")).toBe("UNSW");
  });

  it("falls back to the raw value when a select label is missing", () => {
    expect(getMetadataDisplayValue(selectMeta, "unknown")).toBe("unknown");
  });

  it("returns the value unchanged for input fields", () => {
    expect(getMetadataDisplayValue(inputMeta, "0400")).toBe("0400");
  });
});

describe("detectConflicts", () => {
  it("detects a name conflict", () => {
    const conflicts = detectConflicts(
      m({ name: "Alice" }),
      m({ name: "Alicia" })
    );
    expect(conflicts).toContainEqual({
      field: "name",
      label: "Name",
      primaryValue: "Alice",
      selectedValue: "Alicia",
    });
  });

  it("does not report a conflict when names are equal", () => {
    const conflicts = detectConflicts(m({ name: "Bob" }), m({ name: "Bob" }));
    expect(conflicts).toHaveLength(0);
  });

  it("ignores fields where one side is empty", () => {
    const conflicts = detectConflicts(
      m({ name: "Bob", email: "bob@x.com" }),
      m({ name: "Bob" })
    );
    expect(conflicts).toHaveLength(0);
  });

  it("detects an email conflict", () => {
    const conflicts = detectConflicts(
      m({ email: "a@x.com" }),
      m({ email: "b@x.com" })
    );
    expect(conflicts.some((c) => c.field === "email")).toBe(true);
  });

  it("detects metadata conflicts and resolves display values", () => {
    const conflicts = detectConflicts(
      m({ metadata: { campus: "unsw" } }),
      m({ metadata: { campus: "usyd" } }),
      [selectMeta]
    );
    expect(conflicts).toContainEqual({
      field: "metadata.campus",
      label: "Campus",
      primaryValue: "UNSW",
      selectedValue: "USYD",
    });
  });
});

describe("buildMergedMember", () => {
  it("keeps the primary value when the conflict resolves to 'primary'", () => {
    const resolutions: ConflictResolutions = { name: "primary" };
    const merged = buildMergedMember(
      m({ name: "Alice" }),
      m({ name: "Alicia" }),
      resolutions
    );
    expect(merged.name).toBe("Alice");
  });

  it("takes the selected value when the conflict resolves to 'selected'", () => {
    const resolutions: ConflictResolutions = { name: "selected" };
    const merged = buildMergedMember(
      m({ name: "Alice" }),
      m({ name: "Alicia" }),
      resolutions
    );
    expect(merged.name).toBe("Alicia");
  });

  it("fills an empty primary email from the selected member", () => {
    const merged = buildMergedMember(
      m({ email: undefined }),
      m({ email: "b@x.com" }),
      {}
    );
    expect(merged.email).toBe("b@x.com");
  });

  it("does not overwrite a populated primary email", () => {
    const merged = buildMergedMember(
      m({ email: "a@x.com" }),
      m({ email: "b@x.com" }),
      {}
    );
    expect(merged.email).toBe("a@x.com");
  });

  it("fills empty primary metadata from the selected member", () => {
    const merged = buildMergedMember(
      m({ metadata: {} }),
      m({ metadata: { campus: "usyd" } }),
      {},
      [selectMeta]
    );
    expect(merged.metadata?.campus).toBe("usyd");
  });

  it("applies a resolved metadata conflict", () => {
    const resolutions: ConflictResolutions = { "metadata.campus": "selected" };
    const merged = buildMergedMember(
      m({ metadata: { campus: "unsw" } }),
      m({ metadata: { campus: "usyd" } }),
      resolutions,
      [selectMeta]
    );
    expect(merged.metadata?.campus).toBe("usyd");
  });
});
