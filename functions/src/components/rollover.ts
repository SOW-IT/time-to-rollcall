import { db } from "../config/firebase";
import { onSchedule } from "firebase-functions/scheduler";

export const rolloverUsers = onSchedule(
  { timeZone: "Australia/Sydney", schedule: "0 0 1 10 *", timeoutSeconds: 120, region: "australia-southeast1" },
  async () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const groups = await db.collection("groups").get();
    for (const group of groups.docs) {
      console.log(group.data().name);
      const currentYearMembers = await db
        .collection("groups")
        .doc(group.id)
        .collection("members")
        .doc(currentYear.toString())
        .collection("members")
        .get();
      for (const lym of currentYearMembers.docs) {
        await db
          .collection("groups")
          .doc(group.id)
          .collection("members")
          .doc(nextYear.toString())
          .collection("members")
          .doc(lym.id)
          .set(lym.data());
      }
    }
  }
);

export const rolloverUsersYear = onSchedule(
  { timeZone: "Australia/Sydney", schedule: "0 0 1 1 *", timeoutSeconds: 120, region: "australia-southeast1" },
  async () => {
    const currentYear = new Date().getFullYear();

    const groups = await db.collection("groups").get();
    for (const group of groups.docs) {
      console.log(group.data().name);
      const currentYearMembers = await db
        .collection("groups")
        .doc(group.id)
        .collection("members")
        .doc(currentYear.toString())
        .collection("members")
        .get();
      for (const lym of currentYearMembers.docs) {
        const metadata = lym.data().metadata;
        const mdId = "U65Ey0liZ6OeVqSusDtN";
        if (metadata && mdId in metadata) {
          if (metadata[mdId] !== "6") {
            metadata[mdId] = (Number(metadata[mdId]) + 1).toString();
          }
        }
        await db
          .collection("groups")
          .doc(group.id)
          .collection("members")
          .doc(currentYear.toString())
          .collection("members")
          .doc(lym.id)
          .set({ ...lym.data(), metadata });
      }
    }
  }
);
