import { db } from "../config/firebase";
import { onSchedule } from "firebase-functions/scheduler";

export const rolloverUsers = onSchedule(
  { timeZone: "Australia/Sydney", schedule: "0 22 5 10 *", timeoutSeconds: 120, region: "australia-southeast1" },
  async () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const groups = await db.collection("groups").get();
    for (const group of groups.docs) {
      const lastYearMembers = await db
        .collection("groups")
        .doc(group.id)
        .collection("members")
        .doc(lastYear.toString())
        .collection("members")
        .get();
      for (const lym of lastYearMembers.docs) {
        const metadata = lym.data().metadata;
        const mdId = "U65Ey0liZ6OeVqSusDtN";
        if (metadata) {
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
