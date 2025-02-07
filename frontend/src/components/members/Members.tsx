import { MemberModel } from "@/models/Member";
import { MemberCardMemo } from "./MemberCard";

interface MembersProps {
  members: MemberModel[];
  action: (member: MemberModel) => void;
  disabled?: boolean;
}

export default function Members({ members, action, disabled }: MembersProps) {
  return (
    <div className="bg-white pb-16">
      <div className="flex items-center mx-4 mb-2">
        <p className="text-gray-500 text-[10px] font-light align-middle">
          MEMBERS
        </p>
        <div className="ml-auto py-1.5 px-1.5 rounded-lg bg-gray-200">
          <p className="text-[10px] font-light">
            TOTAL: {members?.length ?? 0}
          </p>
        </div>
      </div>
      {members.map((member) => {
        return (
          <MemberCardMemo
            key={member.id}
            member={member}
            action={() => !disabled && action(member)}
          />
        );
      })}
    </div>
  );
}
