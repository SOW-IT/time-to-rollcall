import ExcelJS from "exceljs";
import { TagModel } from "@/models/Tag";
import { MetadataModel, MetadataSelectModel } from "@/models/Metadata";
import { saveAs } from "file-saver";
import { toddMMYYYY, sameDay, hoursAndMinutes } from "@/helper/Time";
import { MemberMetadataModel } from "@/models/Member";
import { EventModel } from "@/models/Event";
import { getEvent } from "./events";
import { GroupId } from "@/models/Group";

function zipLongest<U, T extends any[][]>(
  filler: U,
  ...arrays: T
): { [I in keyof T]: T[I] extends (infer V)[] ? V | U : never }[] {
  const maxLength = Math.max(...arrays.map((arr) => arr.length));
  return Array.from({ length: maxLength }, (_, i) =>
    arrays.map((arr) => (i < arr.length ? arr[i] : filler))
  ) as any;
}

async function addEventToWorkbook(
  workbook: ExcelJS.Workbook,
  event: EventModel,
  metadata?: MetadataModel[]
) {
  const invalidChars = /[*?:\\\/[\]]/g;
  const worksheet = workbook.addWorksheet(event.name.replace(invalidChars, ""));
  // Add event details at the top
  worksheet.addRow(["Name", event.name]);
  worksheet.addRow([
    "Date",
    `${toddMMYYYY(event.dateStart)}${
      sameDay(event.dateStart, event.dateEnd)
        ? " - " + hoursAndMinutes(event.dateEnd)
        : " - " + toddMMYYYY(event.dateEnd)
    }`,
  ]);
  worksheet.addRow(["Tags", event.tags.map((t) => t.name).join(", ")]);
  worksheet.addRow(["Total Attendance", event.members?.length ?? 0]);
  worksheet.mergeCells("B1", "C1");
  worksheet.mergeCells("B2", "C2");
  worksheet.mergeCells("B3", "C3");
  worksheet.mergeCells("B4", "C4");
  for (let i = 1; i <= 4; i++) {
    const row = worksheet.getRow(i);
    row.font = { bold: true, name: "Calibri", size: 12 };
    row.alignment = { vertical: "middle", horizontal: "left" };
  }
  worksheet.addRow([]);
  worksheet.getRow(5).values = [
    "Sign In",
    "Name",
    "Email",
    ...(metadata?.map((md) => md.key) ?? []),
    "",
    "Metadata",
    "Value",
    "Count",
  ];

  const headerRow = worksheet.getRow(5);
  headerRow.font = { name: "Calibri", bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "ADD8E6" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  });
  headerRow.height = 40;

  worksheet.columns = [
    { key: "signInTime", width: 20 },
    { key: "name", width: 20 },
    { key: "email", width: 35 },
    ...(metadata ? metadata.map((md) => ({ key: md.id, width: 30 })) : []),
    { key: "numbers", width: 20 },
    { key: "metadata", width: 20 },
    { key: "value", width: 35 },
    { key: "count", width: 10 },
  ];

  const mdNumbers = metadata
    ?.filter((md) => md.type === "select")
    .flatMap((md) =>
      Object.entries((md as MetadataSelectModel).values)
        .map(([k, v], i) => ({
          metadata: i === 0 ? md.key : "",
          value: v,
          count: event.members?.filter((m) => m.member.metadata?.[md.id] === k)
            .length,
        }))
        .concat([{ metadata: "", value: "", count: undefined }])
    );

  for (const [mdn, em] of zipLongest(
    null,
    mdNumbers ?? [],
    event.members ?? []
  )) {
    worksheet.addRow({
      signInTime: em?.signInTime ? toddMMYYYY(em?.signInTime) : "",
      name: em?.member.name,
      email: em?.member.email,
      notes: em?.notes,
      ...metadata?.reduce((acc, md) => {
        acc[md.id] =
          md.type === "input"
            ? em?.member.metadata?.[md.id] ?? ""
            : (md as MetadataSelectModel).values[
                em?.member.metadata?.[md.id] ?? ""
              ];
        return acc;
      }, {} as MemberMetadataModel),
      metadata: mdn?.metadata,
      value: mdn?.value,
      count: mdn?.count,
    });
  }
}

export async function downloadEventsToExcel(
  groupId: GroupId,
  events: EventModel[],
  tags: TagModel[],
  metadata?: MetadataModel[]
) {
  if (events) {
    const filtered =
      tags.length > 0
        ? events.filter((e) =>
            e.tags.some((t) => tags.map((it) => it.name).includes(t.name))
          )
        : events;
    const workbook = new ExcelJS.Workbook();
    for (const f of filtered) {
      const event = await getEvent(f.groupId ?? groupId, f.id);
      addEventToWorkbook(workbook, event, metadata);
    }
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      if (tags.length === 0) {
        saveAs(blob, `Attendance_All.xlsx`);
      } else {
        saveAs(blob, `Attendance_[${tags.map((t) => t.name).join(", ")}].xlsx`);
      }
    });
  }
}

export async function downloadEventToExcel(
  event: EventModel,
  metadata?: MetadataModel[]
) {
  const workbook = new ExcelJS.Workbook();
  addEventToWorkbook(workbook, event, metadata);
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Attendance_[${event.name}].xlsx`);
  });
}
