"use client";
import { MemberSignIn } from "./MemberSignInCard";
import useMediaQuery from "@/helper/useMediaQuery";
import { MemberInformation } from "@/models/Event";
import { MemberModel } from "@/models/Member";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface AttendanceSuggested {
  disabled: boolean;
  suggested: MemberModel[];
  filteredCount: number;
  searchInputLength: number;
  create: () => void;
  action: (memberInfo: MemberInformation) => void;
  edit: (memberInfo: MemberInformation) => void;
  loadAnimation: boolean;
}

export default function AttendanceSuggested({
  disabled,
  suggested,
  filteredCount,
  searchInputLength,
  create,
  action,
  edit,
  loadAnimation,
}: AttendanceSuggested) {
  const mobile = useMediaQuery("(max-width: 768px)");
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: suggested.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Height of each member sign-in card
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="z-20 bg-white mb-2">
      {(!mobile || suggested.length > 0 || searchInputLength > 0) && (
        <div className="flex items-center justify-between mx-4 mb-2 mt-2">
          <p className="text-gray-500 text-[10px] font-light align-middle">
            SEARCH RESULTS
          </p>
          <div className="flex items-center gap-2">
            {/* Performance indicator */}
            {/* <div className="py-1 px-2 rounded-lg bg-blue-100">
              <p className="text-[10px] font-light text-blue-600">
                VIRTUAL: {items.length} of {suggested.length}
              </p>
            </div> */}
            {filteredCount !== undefined && (
              <div className="py-1.5 px-1.5 rounded-lg bg-gray-200">
                <p className="text-[10px] font-light text-gray-700">
                  CURRENT: {filteredCount}
                </p>
              </div>
            )}
            <button
              type="button"
              className="text-center text-gray-700 text-[10px] rounded-lg font-light py-1.5 px-1.5 bg-green-200 hover:bg-green-300 active:bg-green-300"
              onClick={create}
            >
              CREATE MEMBER
            </button>
          </div>
        </div>
      )}

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
            const member = suggested[virtualRow.index];
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
                <MemberSignIn
                  disabled={disabled}
                  key={member.id}
                  memberInfo={{ member }}
                  dragConfig={{
                    draggable: true,
                    dragType: "ADD",
                    action,
                    edit,
                  }}
                  refreshDependency={suggested.map((member) => ({ member }))}
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
