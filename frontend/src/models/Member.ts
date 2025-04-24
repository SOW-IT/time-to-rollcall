import { DocumentReference } from "firebase/firestore";
import { MetadataId, MetadataValueId } from "./Metadata";

export interface MemberMetadataModel {
  [key: MetadataId]: MetadataValueId | string;
}

export type MemberId = string;

export interface MemberModel {
  docRef?: DocumentReference;
  id: MemberId;
  name: string;
  email?: string;
  metadata?: MemberMetadataModel;
}

export const InitMember = (
  name: string,
  metadataKey?: MetadataId,
  metadataValue?: MetadataValueId | string
): MemberModel => {
  return {
    id: "placeholder",
    name,
    metadata:
      metadataKey && metadataValue
        ? { [metadataKey]: metadataValue }
        : undefined,
  };
};

export const getYearString = (year?: string) => {
  switch (year) {
    case "1":
      return "1st Year • ";
    case "2":
      return "2nd Year • ";
    case "3":
      return "3rd Year • ";
    case "4":
      return "4th Year • ";
    case "5":
      return "5th Year • ";
    case "6+":
      return "6th Year+ • ";
    default:
      return "";
  }
};

export function compareMetadata(
  obj1?: { [key: MetadataId]: MetadataValueId | string },
  obj2?: { [key: MetadataId]: MetadataValueId | string }
): boolean {
  if (obj1 === undefined && obj2 === undefined) return true;
  if (obj1 === undefined || obj2 === undefined) return false;
  // Get the keys of both objects
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  // Check if the number of keys is different
  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  // Check if keys and values are equal
  for (let key of obj1Keys) {
    // Check if the key exists in the second object and the values are equal
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  // If all keys and values are the same, return true
  return true;
}
