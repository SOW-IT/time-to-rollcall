import {
  getUniversityKey,
  University,
  universityColours,
} from "@/models/University";
import { MouseEventHandler } from "react";

export default function GroupBadge({
  disabled,
  campus,
  className,
  onClick,
  selected,
}: {
  disabled?: boolean;
  campus?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLParagraphElement>;
  selected?: boolean;
}) {
  const universityKey = getUniversityKey(campus);
  return universityKey ? (
    <p
      className={`rounded-full py-1 px-1 bg-black select-none text-white font-light text-center ${
        !disabled ? "cursor-pointer" : ""
      } ${className} ${
        !disabled && selected !== undefined && !selected ? "opacity-40" : ""
      }`}
      style={{ backgroundColor: universityColours[campus ?? University.UTS] }}
      onClick={!disabled ? onClick : () => {}}
    >
      {universityKey}
    </p>
  ) : (
    <p
      className={`rounded-full py-1 px-1 bg-slate-300 text-white font-light text-center w-14 text-sm`}
      onClick={!disabled ? onClick : () => {}}
    >
      OTHER
    </p>
  );
}
