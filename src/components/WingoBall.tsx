import { cn } from "@/lib/utils.ts";
import { wingoColor } from "@/lib/gameTypes.ts";

type Props = {
  number: number;
  size?: "sm" | "md" | "lg";
};

const COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  violet: "bg-purple-500",
};

export default function WingoBall({ number, size = "md" }: Props) {
  const colors = wingoColor(number);
  const isMulti = colors.length > 1;

  const sizeClass = {
    sm: "w-7 h-7 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  }[size];

  if (isMulti) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white shadow-md",
          sizeClass
        )}
        style={{
          background: `linear-gradient(135deg, ${colors[0] === "red" ? "#ef4444" : "#22c55e"} 50%, #a855f7 50%)`,
        }}
      >
        {number}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shadow-md",
        COLOR_CLASSES[colors[0]] ?? "bg-muted",
        sizeClass
      )}
    >
      {number}
    </div>
  );
}
