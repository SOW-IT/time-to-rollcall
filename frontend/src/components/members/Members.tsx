"use client";
import { MemberModel } from "@/models/Member";
import { MemberCardMemo } from "./MemberCard";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface MembersProps {
  members: MemberModel[];
  action: (member: MemberModel) => void;
  disabled?: boolean;
}

export default function Members({ members, action, disabled }: MembersProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: members.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();

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
        {/* Performance indicator */}
        {/* <div className="ml-2 py-1 px-2 rounded-lg bg-blue-100">
          <p className="text-[10px] font-light text-blue-600">
            VIRTUAL: {items.length} of {members.length}
          </p>
        </div> */}
      </div>
      <div
        ref={parentRef}
        className="h-[calc(100vh-350px)] overflow-auto border border-gray-200"
        style={{
          contain: "strict",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {items.map((virtualRow) => {
            const member = members[virtualRow.index];
            if (!member) return null;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MemberCardMemo
                  member={member}
                  action={() => !disabled && action(member)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
