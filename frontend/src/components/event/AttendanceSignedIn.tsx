"use client";
import { useRef } from "react";
import { MemberSignIn } from "./MemberSignInCard";
import { MemberInformation } from "@/models/Event";
import { useVirtualizer } from "@tanstack/react-virtual";
import useMediaQuery from "@/helper/useMediaQuery";

interface AttendanceSignedInProps {
  disabled: boolean;
  signedIn?: MemberInformation[];
  totalAttendance: number;
  filteredCount?: number;
  mobileFilterButton?: React.ReactNode;
  action: (memberInfo: MemberInformation) => void;
  edit: (memberInfo: MemberInformation) => void;
}

export default function AttendanceSignedIn({
  disabled,
  signedIn,
  totalAttendance,
  filteredCount,
  mobileFilterButton,
  action,
  edit,
}: AttendanceSignedInProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const mobile = useMediaQuery("(max-width: 768px)");

  const virtualizer = useVirtualizer({
    count: signedIn?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Height of each member sign-in card
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="mt-2 bg-white mb-12">
      {/* Mobile Filter Button - positioned above SIGNED IN text */}
      {mobileFilterButton && mobile && (
        <div className="mx-4 mb-2">{mobileFilterButton}</div>
      )}
      <div className="flex items-center mx-4 mb-2 gap-2">
        <p className="text-gray-500 text-[10px] font-light align-middle">
          SIGNED IN
        </p>
        <div className="ml-auto flex items-center gap-2">
          {/* Performance indicator */}
          {/* <div className="py-1 px-2 rounded-lg bg-blue-100">
            <p className="text-[10px] font-light text-blue-600">
              VIRTUAL: {items.length} of {signedIn?.length || 0}
            </p>
          </div> */}
          {filteredCount !== undefined && (
            <div className="py-1.5 px-1.5 rounded-lg bg-gray-200">
              <p className="text-[10px] font-light text-gray-700">
                CURRENT: {filteredCount}
              </p>
            </div>
          )}
          <div className="py-1.5 px-1.5 rounded-lg bg-gray-200">
            <p className="text-[10px] font-light text-gray-700">
              ATTENDANCE: {totalAttendance}
            </p>
          </div>
        </div>
      </div>

      {/* Virtualized list container */}
      <div
        ref={parentRef}
        className="h-[calc(100vh-265px)] overflow-auto"
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
            const memberInfo = signedIn?.[virtualRow.index];
            if (!memberInfo) return null;

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
                  triggerAddAnimation={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
