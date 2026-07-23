import { cn } from "@/lib/utils.ts";

const DICE_DOTS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

type Props = {
  value: number;
  size?: "sm" | "md" | "lg";
};

export default function DiceFace({ value, size = "md" }: Props) {
  const dots = DICE_DOTS[value] ?? [];
  const sizeClass = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14" }[size];
  const dotSize = { sm: 3, md: 4, lg: 5 }[size];

  return (
    <div
      className={cn(
        "relative rounded-lg bg-white shadow-md border border-border",
        sizeClass
      )}
    >
      {dots.map(([cx, cy], i) => (
        <div
          key={i}
          className="absolute bg-gray-800 rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            left: `${cx}%`,
            top: `${cy}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
