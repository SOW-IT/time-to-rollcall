import { MemberModel } from "@/models/Member";
import {
  MetadataInputModel,
  MetadataSelectModel,
} from "@/models/Metadata";
import { updateMember, deleteMember } from "@/lib/members";
import {
  collection,
  DocumentReference,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { universityIds } from "@/models/University";
import { currentSOWYear } from "@/helper/Time";

export interface MergeConflict {
  field: string;
  label: string;
  primaryValue: string;
  selectedValue: string;
}

export type ConflictResolutions = {
  [key: string]: "primary" | "selected";
};

/**
 * Detect conflicting fields between two members.
 */
export function detectConflicts(
  primaryMember: MemberModel,
  selectedMember: MemberModel,
  metadata?: (MetadataInputModel | MetadataSelectModel)[] | null,
): MergeConflict[] {
  const conflicts: MergeConflict[] = [];

  // check name conflict
  if (
    primaryMember.name &&
    selectedMember.name &&
    primaryMember.name !== selectedMember.name
  ) {
    conflicts.push({
      field: "name",
      label: "Name",
      primaryValue: primaryMember.name,
      selectedValue: selectedMember.name,
    });
  }

  // Check email conflict
  if (
    primaryMember.email &&
    selectedMember.email &&
    primaryMember.email !== selectedMember.email
  ) {
    conflicts.push({
      field: "email",
      label: "Email",
      primaryValue: primaryMember.email,
      selectedValue: selectedMember.email,
    });
  }

  // Check metadata conflicts
  if (metadata) {
    metadata.forEach((m) => {
      const primaryValue = primaryMember.metadata?.[m.id];
      const selectedValue = selectedMember.metadata?.[m.id];

      if (primaryValue && selectedValue && primaryValue !== selectedValue) {
        conflicts.push({
          field: `metadata.${m.id}`,
          label: m.key,
          primaryValue: getMetadataDisplayValue(m, primaryValue),
          selectedValue: getMetadataDisplayValue(m, selectedValue),
        });
      }
    });
  }

  return conflicts;
}

/**
 * Build a merged member from primary + selected, applying conflict resolutions
 * and filling in empty fields from the selected member.
 */
export function buildMergedMember(
  primaryMember: MemberModel,
  selectedMember: MemberModel,
  conflictResolutions: ConflictResolutions,
  metadata?: (MetadataInputModel | MetadataSelectModel)[] | null,
): MemberModel {
  const mergedMember = {
    ...primaryMember,
  };

  // Apply resolved conflicts
  Object.keys(conflictResolutions).forEach((field) => {
    const choice = conflictResolutions[field];
    if (field === "name") {
      mergedMember.name =
        choice === "primary" ? primaryMember.name : selectedMember.name;
    } else if (field === "email") {
      mergedMember.email =
        choice === "primary" ? primaryMember.email : selectedMember.email;
    } else if (field.startsWith("metadata.")) {
      const metadataId = field.replace("metadata.", "");
      if (!mergedMember.metadata) mergedMember.metadata = {};

      const selectedValue =
        choice === "primary"
          ? primaryMember.metadata?.[metadataId]
          : selectedMember.metadata?.[metadataId];

      if (selectedValue !== undefined) {
        mergedMember.metadata[metadataId] = selectedValue;
      }
    }
  });

  // Merge non-conflict metadata fields from selected member
  if (selectedMember.metadata && metadata) {
    if (!mergedMember.metadata) mergedMember.metadata = {};

    metadata.forEach((m) => {
      const primaryValue = primaryMember.metadata?.[m.id];
      const selectedValue = selectedMember.metadata?.[m.id];

      // If primary is empty but selected has a value, use selected value
      if (!primaryValue && selectedValue && mergedMember.metadata) {
        mergedMember.metadata[m.id] = selectedValue;
      }
    });
  }

  // Merge email if primary is empty but selected has one
  if (!mergedMember.email && selectedMember.email) {
    mergedMember.email = selectedMember.email;
  }

  return mergedMember;
}

/**
 * Replace secondary member references with primary in an event's member list.
 * If both are present, the secondary is removed (primary stays).
 * If only secondary is present, it is replaced with primary using secondary's sign-in time.
 */
function replaceDuplicateMembers(
  members: { member: DocumentReference; signInTime: Timestamp }[] | undefined,
  primaryMemberRef: DocumentReference,
  secondaryMemberRef: DocumentReference,
): {
  changed: boolean;
  members: { member: DocumentReference; signInTime: Timestamp }[];
} {
  if (!members || members.length === 0)
    return { changed: false, members: [] };

  const primaryPath = primaryMemberRef.path;
  const secondaryPath = secondaryMemberRef.path;

  const hasPrimary = members.some((m) => m.member.path === primaryPath);
  const hasSecondary = members.some((m) => m.member.path === secondaryPath);

  if (!hasSecondary) {
    // Secondary not in this event — no changes needed
    return { changed: false, members };
  }

  // Remove secondary member from the list
  let filtered = members.filter((m) => m.member.path !== secondaryPath);

  // If only secondary was present (not primary), add primary member
  if (!hasPrimary) {
    const secondaryEntry = members.find(
      (m) => m.member.path === secondaryPath,
    );
    filtered.push({
      member: primaryMemberRef,
      signInTime: secondaryEntry?.signInTime || Timestamp.now(),
    });
  }

  return { changed: true, members: filtered };
}

/**
 * Get the SOW year date boundaries.
 * SOW year N runs from Oct 1 of year N-1 to Sep 30 of year N.
 */
function getSOWYearBoundaries(): { start: Date; end: Date } {
  const sowYear = currentSOWYear;
  const start = new Date(sowYear - 1, 9, 1); // Oct 1 of previous year
  const end = new Date(sowYear, 8, 30, 23, 59, 59, 999); // Sep 30 end of day
  return { start, end };
}

/**
 * Execute the full merge: update primary member, replace references in all
 * events within the current SOW year across all groups, then delete secondary.
 */
export async function mergeMembers(
  primaryMemberRef: DocumentReference,
  secondaryMemberRef: DocumentReference,
  mergedMember: MemberModel,
): Promise<void> {
  // Update primary member with merged data
  await updateMember(primaryMemberRef, mergedMember);

  const { start, end } = getSOWYearBoundaries();
  const startTimestamp = Timestamp.fromDate(start);
  const endTimestamp = Timestamp.fromDate(end);

  // Iterate all groups and replace secondary member references in events
  const groupIds = Object.values(universityIds);

  for (const groupId of groupIds) {
    const eventsQuery = query(
      collection(firestore, "groups", groupId, "events"),
      where("dateStart", ">=", startTimestamp),
      where("dateStart", "<=", endTimestamp),
    );

    const events = await getDocs(eventsQuery);

    for (const e of events.docs) {
      const result = replaceDuplicateMembers(
        e.data().members,
        primaryMemberRef,
        secondaryMemberRef,
      );

      // Only write if the member list actually changed
      if (result.changed) {
        await updateDoc(doc(firestore, "groups", groupId, "events", e.id), {
          members: result.members,
        });
      }
    }
  }

  // Delete secondary member
  await deleteMember(secondaryMemberRef);
}

/**
 * Get display value for a metadata field (resolves select labels).
 */
export function getMetadataDisplayValue(
  metadataItem: MetadataInputModel | MetadataSelectModel,
  value: string,
): string {
  if (metadataItem.type === "select") {
    return (metadataItem as MetadataSelectModel).values[value] || value;
  }
  return value;
}
