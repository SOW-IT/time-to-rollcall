import { User as AuthUser } from "firebase/auth";
import { GroupId } from "./Group";

export type UserId = string;

export interface User extends AuthUser {
  id: UserId;
  email: string;
  displayName: string | null;
  role?: string;
  groups?: GroupId[];
}
