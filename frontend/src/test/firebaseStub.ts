/**
 * Test-only stub for `@/lib/firebase`.
 *
 * The real module initialises a Firebase app (and Auth/Firestore/Storage) at
 * import time, which is undesirable in unit tests. This stub provides the same
 * named exports used across the codebase without performing any network or SDK
 * initialisation. Pure logic under test never calls into these values.
 */

export const firebaseConfig = {};
export const auth = {} as any;
export const googleAuthProvider = {} as any;
export const microsoftProvider = {} as any;
export const firestore = {} as any;
export const storage = {} as any;
export const STATE_CHANGED = "state_changed";

export function convertToFirestore(data: { id: string; docRef?: unknown }) {
  const { id, docRef, ...rest } = data as Record<string, unknown>;
  return rest;
}

export async function convertToJavascript() {
  return undefined;
}

export async function convertCollectionToJavascript() {
  return [];
}
