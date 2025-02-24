import { MemberSignIn } from "./MemberSignInCard";
import useMediaQuery from "@/helper/useMediaQuery";
import { MemberInformation } from "@/models/Event";
import { MemberModel } from "@/models/Member";

interface AttendanceSuggested {
  disabled: boolean;
  suggested: MemberModel[];
  searchInputLength: number;
  create: () => void;
  action: (memberInfo: MemberInformation) => void;
  edit: (memberInfo: MemberInformation) => void;
  loadAnimation: boolean;
}

export default function AttendanceSuggested({
  disabled,
  suggested,
  searchInputLength,
  create,
  action,
  edit,
  loadAnimation,
}: AttendanceSuggested) {
  const mobile = useMediaQuery("(max-width: 768px)");
  return (
    <div className="z-20 bg-white">
      {(!mobile || suggested.length > 0 || searchInputLength > 0) && (
        <div className="flex items-center justify-between mx-4 mb-2 mt-2">
          <p className="text-gray-500 text-[10px] font-light align-middle">
            SEARCH RESULTS
          </p>
          <button
            type="button"
            className="text-center text-gray-700 text-[10px] rounded-lg font-light py-1.5 px-1.5 bg-green-200 hover:bg-green-300 active:bg-green-300"
            onClick={create}
          >
            CREATE MEMBER
          </button>
        </div>
      )}
      {suggested.map((member) => {
        return (
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
            triggerAddAnimation={loadAnimation}
          />
        );
      })}
    </div>
  );
}
