import { cn } from "@/lib/utils.ts";
import { motion, AnimatePresence } from "motion/react";

type Props = {
  display: string;
  progress: number;
  periodId: string;
};

export default function CountdownTimer({ display, progress, periodId }: Props) {
  const [mm, ss] = display.split(":");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        <Digit value={mm ?? "00"} />
        <span className="text-3xl font-bold text-foreground">:</span>
        <Digit value={ss ?? "00"} />
      </div>
      <div className="w-full max-w-xs h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>
      <p className="text-xs text-muted-foreground font-mono">{periodId}</p>
    </div>
  );
}

function Digit({ value }: { value: string }) {
  return (
    <div className="flex gap-0.5">
      {value.split("").map((d, i) => (
        <AnimatePresence mode="popLayout" key={i}>
          <motion.span
            key={d + i}
            className={cn(
              "w-8 h-12 flex items-center justify-center",
              "bg-secondary rounded-md text-2xl font-bold tabular-nums text-foreground"
            )}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {d}
          </motion.span>
        </AnimatePresence>
      ))}
    </div>
  );
}
