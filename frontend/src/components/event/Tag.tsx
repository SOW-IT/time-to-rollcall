import { TagModel } from "@/models/Tag";
type ColourClass = {
  bgDisabled: string;
  bg: string;
  fill: string;
  bgSelected: string;
  hex: string;
};

type ColourClasses = {
  [key: string]: ColourClass;
};
export const colourClasses: ColourClasses = {
  gray: {
    bgDisabled: "bg-gray-100 border-gray-100 text-gray-500",
    bg: "bg-gray-100 border-gray-100 text-gray-500 hover:bg-gray-300 hover:border-gray-600 hover:text-gray-900 active:bg-gray-300 active:border-gray-600 active:text-gray-900",
    fill: "fill-gray-400",
    bgSelected: "bg-gray-300 border-gray-600 text-gray-900",
    hex: "#6B7280", // text-gray-500
  },
  red: {
    bgDisabled: "bg-red-100 border-red-100 text-red-500",
    bg: "bg-red-100 border-red-100 text-red-500 hover:bg-red-300 hover:border-red-600 hover:text-red-900 active:bg-red-300 active:border-red-600 active:text-red-900",
    fill: "fill-red-400",
    bgSelected: "bg-red-300 border-red-600 text-red-900",
    hex: "#EF4444", // text-red-500
  },
  orange: {
    bgDisabled: "bg-orange-100 border-orange-100 text-orange-500",
    bg: "bg-orange-100 border-orange-100 text-orange-500 hover:bg-orange-300 hover:border-orange-600 hover:text-orange-900 active:bg-orange-300 active:border-orange-600 active:text-orange-900",
    fill: "fill-orange-400",
    bgSelected: "bg-orange-300 border-orange-600 text-orange-900",
    hex: "#F97316", // text-orange-500
  },
  amber: {
    bgDisabled: "bg-amber-100 border-amber-100 text-amber-500",
    bg: "bg-amber-100 border-amber-100 text-amber-500 hover:bg-amber-300 hover:border-amber-600 hover:text-amber-900 active:bg-amber-300 active:border-amber-600 active:text-amber-900",
    fill: "fill-amber-400",
    bgSelected: "bg-amber-300 border-amber-600 text-amber-900",
    hex: "#F59E0B", // text-amber-500
  },
  yellow: {
    bgDisabled: "bg-yellow-100 border-yellow-100 text-yellow-500",
    bg: "bg-yellow-100 border-yellow-100 text-yellow-500 hover:bg-yellow-300 hover:border-yellow-600 hover:text-yellow-900 active:bg-yellow-300 active:border-yellow-600 active:text-yellow-900",
    fill: "fill-yellow-400",
    bgSelected: "bg-yellow-300 border-yellow-600 text-yellow-900",
    hex: "#EAB308", // text-yellow-500
  },
  lime: {
    bgDisabled: "bg-lime-100 border-lime-100 text-lime-500",
    bg: "bg-lime-100 border-lime-100 text-lime-500 hover:bg-lime-300 hover:border-lime-600 hover:text-lime-900 active:bg-lime-300 active:border-lime-600 active:text-lime-900",
    fill: "fill-lime-400",
    bgSelected: "bg-lime-300 border-lime-600 text-lime-900",
    hex: "#84CC16", // text-lime-500
  },
  green: {
    bgDisabled: "bg-green-100 border-green-100 text-green-500",
    bg: "bg-green-100 border-green-100 text-green-500 hover:bg-green-300 hover:border-green-600 hover:text-green-900 active:bg-green-300 active:border-green-600 active:text-green-900",
    fill: "fill-green-400",
    bgSelected: "bg-green-300 border-green-600 text-green-900",
    hex: "#22C55E", // text-green-500
  },
  emerald: {
    bgDisabled: "bg-emerald-100 border-emerald-100 text-emerald-500",
    bg: "bg-emerald-100 border-emerald-100 text-emerald-500 hover:bg-emerald-300 hover:border-emerald-600 hover:text-emerald-900 active:bg-emerald-300 active:border-emerald-600 active:text-emerald-900",
    fill: "fill-emerald-400",
    bgSelected: "bg-emerald-300 border-emerald-600 text-emerald-900",
    hex: "#10B981", // text-emerald-500
  },
  teal: {
    bgDisabled: "bg-teal-100 border-teal-100 text-teal-500",
    bg: "bg-teal-100 border-teal-100 text-teal-500 hover:bg-teal-300 hover:border-teal-600 hover:text-teal-900 active:bg-teal-300 active:border-teal-600 active:text-teal-900",
    fill: "fill-teal-400",
    bgSelected: "bg-teal-300 border-teal-600 text-teal-900",
    hex: "#14B8A6", // text-teal-500
  },
  cyan: {
    bgDisabled: "bg-cyan-100 border-cyan-100 text-cyan-500",
    bg: "bg-cyan-100 border-cyan-100 text-cyan-500 hover:bg-cyan-300 hover:border-cyan-600 hover:text-cyan-900 active:bg-cyan-300 active:border-cyan-600 active:text-cyan-900",
    fill: "fill-cyan-400",
    bgSelected: "bg-cyan-300 border-cyan-600 text-cyan-900",
    hex: "#06B6D4", // text-cyan-500
  },
  blue: {
    bgDisabled: "bg-blue-100 border-blue-100 text-blue-500",
    bg: "bg-blue-100 border-blue-100 text-blue-500 hover:bg-blue-300 hover:border-blue-600 hover:text-blue-900 active:bg-blue-300 active:border-blue-600 active:text-blue-900",
    fill: "fill-blue-400",
    bgSelected: "bg-blue-300 border-blue-600 text-blue-900",
    hex: "#3B82F6", // text-blue-500
  },
  indigo: {
    bgDisabled: "bg-indigo-100 border-indigo-100 text-indigo-500",
    bg: "bg-indigo-100 border-indigo-100 text-indigo-500 hover:bg-indigo-300 hover:border-indigo-600 hover:text-indigo-900 active:bg-indigo-300 active:border-indigo-600 active:text-indigo-900",
    fill: "fill-indigo-400",
    bgSelected: "bg-indigo-300 border-indigo-600 text-indigo-900",
    hex: "#6366F1", // text-indigo-500
  },
  violet: {
    bgDisabled: "bg-violet-100 border-violet-100 text-violet-500",
    bg: "bg-violet-100 border-violet-100 text-violet-500 hover:bg-violet-300 hover:border-violet-600 hover:text-violet-900 active:bg-violet-300 active:border-violet-600 active:text-violet-900",
    fill: "fill-violet-400",
    bgSelected: "bg-violet-300 border-violet-600 text-violet-900",
    hex: "#8B5CF6", // text-violet-500
  },
  purple: {
    bgDisabled: "bg-purple-100 border-purple-100 text-purple-500",
    bg: "bg-purple-100 border-purple-100 text-purple-500 hover:bg-purple-300 hover:border-purple-600 hover:text-purple-900 active:bg-purple-300 active:border-purple-600 active:text-purple-900",
    fill: "fill-purple-400",
    bgSelected: "bg-purple-300 border-purple-600 text-purple-900",
    hex: "#A855F7", // text-purple-500
  },
  fuchsia: {
    bgDisabled: "bg-fuchsia-100 border-fuchsia-100 text-fuchsia-500",
    bg: "bg-fuchsia-100 border-fuchsia-100 text-fuchsia-500 hover:bg-fuchsia-300 hover:border-fuchsia-600 hover:text-fuchsia-900 active:bg-fuchsia-300 active:border-fuchsia-600 active:text-fuchsia-900",
    fill: "fill-fuchsia-400",
    bgSelected: "bg-fuchsia-300 border-fuchsia-600 text-fuchsia-900",
    hex: "#D946EF", // text-fuchsia-500
  },
  pink: {
    bgDisabled: "bg-pink-100 border-pink-100 text-pink-500",
    bg: "bg-pink-100 border-pink-100 text-pink-500 hover:bg-pink-300 hover:border-pink-600 hover:text-pink-900 active:bg-pink-300 active:border-pink-600 active:text-pink-900",
    fill: "fill-pink-400",
    bgSelected: "bg-pink-300 border-pink-600 text-pink-900",
    hex: "#EC4899", // text-pink-500
  },
  rose: {
    bgDisabled: "bg-rose-100 border-rose-100 text-rose-500",
    bg: "bg-rose-100 border-rose-100 text-rose-500 hover:bg-rose-300 hover:border-rose-600 hover:text-rose-900 active:bg-rose-300 active:border-rose-600 active:text-rose-900",
    fill: "fill-rose-400",
    bgSelected: "bg-rose-300 border-rose-600 text-rose-900",
    hex: "#F43F5E", // text-rose-500
  },
};

export const getColourClasses = (colour?: keyof ColourClasses) => {
  return colour ? colourClasses[colour] : colourClasses.blue;
};

export default function Tag({
  tag,
  selected,
  disabled,
  onClick,
  className,
}: {
  tag: TagModel;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) {
  const { bg, bgSelected, bgDisabled } = getColourClasses(tag.colour);

  return (
    <button
      type="button"
      disabled={disabled}
      className={`rounded-3xl border-2 px-2 py-1 mr-2 my-1 text-xs font-medium ${
        selected ? bgSelected : disabled ? bgDisabled : bg
      } ${className}`}
      onClick={onClick}
    >
      {tag.name}
    </button>
  );
}
