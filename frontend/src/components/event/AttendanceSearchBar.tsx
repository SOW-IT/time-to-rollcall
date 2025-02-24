import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface AttendanceSearchBarProps {
  disabled: boolean;
  searchInput: string;
  setSearchInput: (input: string) => void;
}

export default function AttendanceSearchBar({
  disabled,
  searchInput,
  setSearchInput,
}: AttendanceSearchBarProps) {
  return (
    <div className="flex w-full border-y-[1px] py-2 px-4 border-gray-300 items-center hover:text-black active:text-black">
      <MagnifyingGlassIcon className="w-6 h-6 mr-2 text-gray-500 hover:text-black active:text-black" />
      <input
        disabled={disabled}
        value={searchInput ?? ""}
        placeholder={
          !disabled ? "Search members" : "Click the pencil icon to edit!"
        }
        className="w-full placeholder:text-sm placeholder:font-thin placeholder:align-middle outline-none bg-white"
        onChange={(e) => {
          setSearchInput(e.target.value);
        }}
      />
      <button
        className="ml-2"
        type="button"
        onClick={() => !disabled && setSearchInput("")}
      >
        <XCircleIcon
          className={
            "w-7 h-7 text-gray-500 hover:text-black active:text-black "
          }
        />
      </button>
    </div>
  );
}
