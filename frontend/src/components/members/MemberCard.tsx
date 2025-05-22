"use client";
import { getYearString, MemberModel } from "@/models/Member";
import Image from "next/image";
import { FC, memo, useContext } from "react";
import WOMAN_FACE_SVG from "../../../public/face-woman-profile.svg";
import MAN_SVG from "../../../public/man-profile.svg";
import GroupBadge from "../event/GroupBadge";
import { MetadataContext } from "@/lib/context";
import { MetadataSelectModel } from "@/models/Metadata";

export const MemberCardMemo: FC<MemberCardProps> = memo(
  ({ ...props }) => {
    return <MemberCard {...props} />;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.member.id === nextProps.member.id &&
      prevProps.member.name === nextProps.member.name &&
      prevProps.member.metadata === nextProps.member.metadata
    );
  }
);
MemberCardMemo.displayName = "MemberCardMemo";

export interface MemberCardProps {
  member: MemberModel;
  action: () => void;
}

function MemberCard({ member, action }: MemberCardProps) {
  const metadata = useContext(MetadataContext);
  const role = metadata?.find(
    (m) => m.key === "Role" && m.type === "select"
  ) as MetadataSelectModel | undefined;
  const year = metadata?.find(
    (m) => m.key === "Year" && m.type === "select"
  ) as MetadataSelectModel | undefined;
  const campus = metadata?.find(
    (m) => m.key === "Campus" && m.type === "select"
  ) as MetadataSelectModel | undefined;
  const gender = metadata?.find(
    (m) => m.key === "Gender" && m.type === "select"
  ) as MetadataSelectModel | undefined;

  return (
    <div
      className={`relative z-30 overflow-hidden cursor-pointer flex h-20 w-full px-4 items-center active:bg-gray-100`}
      onClick={action}
    >
      <Image
        src={
          gender && member.metadata?.[gender.id]
            ? gender.values?.[member.metadata?.[gender.id]] === "Male"
              ? MAN_SVG
              : WOMAN_FACE_SVG
            : WOMAN_FACE_SVG
        }
        height={0}
        width={0}
        alt="woman-face"
        className="h-7 w-7 mr-4"
      />
      <div>
        <h3 className="font-light mb-2">{member.name}</h3>
        <p className={"text-xs text-gray-500 font-extralight"}>
          {year && member.metadata?.[year.id]
            ? getYearString(year.values?.[member.metadata?.[year.id]]) ??
              getYearString(member.metadata?.[year.id])
            : ""}
          {role && member.metadata?.[role.id]
            ? role.values?.[member.metadata?.[role.id]] ??
              member.metadata?.[role.id]
            : "Member"}
        </p>
      </div>
      <div className="ml-auto">
        <GroupBadge
          campus={
            campus &&
            member.metadata?.[campus.id] &&
            campus.values?.[member.metadata?.[campus.id]]
          }
          className="w-14 text-sm"
        />
      </div>
    </div>
  );
}
