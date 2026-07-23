import { useEffect, useRef, useState } from "react";
import { currentPeriod, type GameType } from "@/lib/gameTypes.ts";

export function useCountdown(gameType: GameType, typeId: number) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [periodId, setPeriodId] = useState("");
  const prevPeriodId = useRef("");

  useEffect(() => {
    function tick() {
      const p = currentPeriod(gameType, typeId);
      setSecondsLeft(p.secondsLeft);
      setTotalSeconds(p.totalSeconds);
      if (p.periodId !== prevPeriodId.current) {
        prevPeriodId.current = p.periodId;
        setPeriodId(p.periodId);
      }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [gameType, typeId]);

  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return { secondsLeft, totalSeconds, progress, periodId, display: `${mm}:${ss}` };
}
