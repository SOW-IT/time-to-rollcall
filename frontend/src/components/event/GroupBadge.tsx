import {
  getUniversityKey,
  University,
  universityColours,
} from "@/models/University";

export default function GroupBadge({
  campus,
  className,
}: {
  campus?: string;
  className?: string;
}) {
  const universityKey = getUniversityKey(campus);
  return universityKey ? (
    <p
      className={`rounded-full py-1 px-1 bg-black text-white font-light text-center ${className}`}
      style={{ backgroundColor: universityColours[campus ?? University.UTS] }}
    >
      {universityKey}
    </p>
  ) : (
    <p
      className={`rounded-full py-1 px-1 bg-slate-300 text-white font-light text-center w-14 text-sm`}
    >
      OTHER
    </p>
  );
}
