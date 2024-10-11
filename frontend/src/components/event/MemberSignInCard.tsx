"use client";
import { useGSAP } from "@gsap/react";
import { ArrowRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import { MemberModel } from "@/models/Member";
import gsap from "gsap";
import Draggable from "gsap/dist/Draggable";
import Image from "next/image";
import { useEffect, useRef } from "react";
import WOMAN_FACE_PNG from "../../../public/face-woman-profile.png";
import GroupBadge from "./GroupBadge";

export type DragType = "DELETE" | "ADD";

export interface DragConfig {
  draggable: boolean;
  dragType: DragType;
  action: (member: MemberModel) => void;
  end: (member: MemberModel) => void;
}

interface MemberSignInCard {
  member: MemberModel;
  selected?: boolean;
  onSelection?: (member: MemberModel) => void;
  dragConfig?: DragConfig;
  refreshDependency?: MemberModel[];
  triggerAddAnimation?: boolean;
}

export default function MemberSignInCard({
  member,
  selected,
  onSelection,
  dragConfig,
  refreshDependency,
  triggerAddAnimation,
}: MemberSignInCard) {
  const id = member.id;
  const frontId = id + "Front";
  const backId = id + "Back";

  const frontRef = useRef();
  const backRef = useRef();
  const positionX = useRef<number>();
  // const windowWidth = window.innerWidth;
  const dragEnabled = dragConfig !== undefined && dragConfig.draggable === true;

  useEffect(() => {
    if (triggerAddAnimation)
      gsap.from(frontRef.current, { height: 0, duration: 0.3 });
  }, []);
  useGSAP(() => {
    // Draggable.create(`#${id}`);
    // gsapRef.current = Draggable.create(`#${frontId}`, {
    Draggable.create(frontRef.current, {
      type: "x",
      bounds: {},
      onDragStart: function (e) {
        positionX.current = e.pageX;
      },
      onDragEnd: function (e) {
        if (positionX.current - e.pageX > screen.width / 2) {
          const timeline = gsap.timeline({
            onStart: () => {
              dragConfig?.action(member);
            },
            onComplete: () => {
              dragConfig?.end(member);
            },
          });
          timeline.to(
            frontRef.current,
            {
              x: -screen.width,
              y: 0,
              duration: 0.3,
            },
            "start"
          );
          timeline.to(
            backRef.current,
            {
              height: 0,
              duration: 0.3,
              // clearProps: "x,height", // reset css styles
            },
            "start"
          );
        } else {
          gsap.to(`#${frontId}`, {
            x: 0,
            y: 0,
            duration: 0.3,
          });
        }
      },
    });
  }, [refreshDependency]);

  return (
    <div className="relative overflow-hidden" id={id} key={id} ref={backRef}>
      <div
        className={`flex h-20 items-center relative z-30 px-6 ${
          selected ? "bg-gray-100" : "bg-white"
        }`}
        id={frontId}
        ref={frontRef}
        onClick={() => {
          // onSelection(member);
        }}
      >
        <Image
          src={WOMAN_FACE_PNG}
          height={0}
          width={0}
          alt="woman-face"
          className="h-7 w-7 mr-4"
        />
        <div>
          <h3 className="font-light mb-2">{member.name}</h3>
          <p className="text-xs text-gray-500 font-thin">
            2nd Year • Student Leader
          </p>
        </div>
        <div className="ml-auto">
          <GroupBadge />
        </div>
      </div>
      {dragEnabled ? (
        dragConfig.dragType == "ADD" ? (
          <div className="z-10" id={backId}>
            <div className="bg-blue-600 h-20 top-0 w-full absolute z-10 flex justify-center items-center">
              <ArrowRightIcon className="h-5 ml-auto mr-8 text-white" />
            </div>
          </div>
        ) : (
          <div className="bg-red-600 h-20 top-0 w-full absolute z-10 flex justify-center items-center">
            <TrashIcon className="h-5 ml-auto mr-8 text-white" />
          </div>
        )
      ) : (
        <></>
      )}
    </div>
  );
}
