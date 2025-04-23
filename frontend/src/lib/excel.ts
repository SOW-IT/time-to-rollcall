import ExcelJS from "exceljs";
import { TagModel } from "@/models/Tag";
import { MetadataModel, MetadataSelectModel } from "@/models/Metadata";
import { saveAs } from "file-saver";
import { toddMMYYYY, sameDay, hoursAndMinutes } from "@/helper/Time";
import { MemberMetadataModel } from "@/models/Member";
import { EventModel } from "@/models/Event";
import { getEvent } from "./events";
import { GroupId } from "@/models/Group";

async function addEventToWorkbook(
  workbook: ExcelJS.Workbook,
  event: EventModel,
  metadata?: MetadataModel[]
) {
  const worksheet = workbook.addWorksheet(event.name);
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
    // "Notes",
    ...(metadata?.map((md) => md.key) ?? []),
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
    // { key: "notes", width: 35 },
  ].concat(metadata ? metadata.map((md) => ({ key: md.id, width: 30 })) : []);

  event.members?.map((info) =>
    worksheet.addRow({
      signInTime: info.signInTime ? toddMMYYYY(info.signInTime) : "",
      name: info.member.name,
      email: info.member.email,
      notes: info.notes,
      ...metadata?.reduce((acc, md) => {
        acc[md.id] =
          md.type === "input"
            ? info.member.metadata?.[md.id] ?? ""
            : (md as MetadataSelectModel).values[
                info.member.metadata?.[md.id] ?? ""
              ];
        return acc;
      }, {} as MemberMetadataModel),
    })
  );
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
