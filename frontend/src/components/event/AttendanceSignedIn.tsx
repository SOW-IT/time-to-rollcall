import { useContext, useState } from "react";
import { MemberSignIn } from "./MemberSignInCard";
import { MemberInformation } from "@/models/Event";
import { MetadataContext } from "@/lib/context";
import { MetadataSelectModel } from "@/models/Metadata";

interface AttendanceSignedInProps {
  disabled: boolean;
  signedIn?: MemberInformation[];
  dietary: () => void;
  totalAttendance: number;
  action: (memberInfo: MemberInformation) => void;
  edit: (memberInfo: MemberInformation) => void;
}

export default function AttendanceSignedIn({
  disabled,
  signedIn,
  dietary,
  totalAttendance,
  action,
  edit,
}: AttendanceSignedInProps) {
  return (
    <div className="mt-2 bg-white mb-12">
      <div className="flex items-center mx-4 mb-2 gap-2">
        <p className="text-gray-500 text-[10px] font-light align-middle">
          SIGNED IN
        </p>
        <p className="cursor-pointer" onClick={() => dietary()}>
          Dietary
        </p>
        <div className="ml-auto py-1.5 px-1.5 rounded-lg bg-gray-200">
          <p className="text-[10px] font-light">
            ATTENDANCE: {totalAttendance}
          </p>
        </div>
      </div>
      {signedIn?.map((memberInfo) => {
        return (
          <MemberSignIn
            disabled={disabled}
            key={memberInfo.member.id}
            memberInfo={memberInfo}
            dragConfig={{
              draggable: true,
              dragType: "DELETE",
              action,
              edit,
            }}
            refreshDependency={signedIn}
            triggerAddAnimation
          />
        );
      })}
    </div>
  );
}
