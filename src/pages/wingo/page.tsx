import { useState, useEffect, useCallback } from "react";
import { useCountdown } from "@/hooks/use-countdown.ts";
import { GAME_MODES, wingoColor } from "@/lib/gameTypes.ts";
import { fetchResults, placeBet, fetchMyBets, type RawGameResult, type RawBetResult } from "@/lib/api.ts";
import CountdownTimer from "@/components/CountdownTimer.tsx";
import WingoBall from "@/components/WingoBall.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const MODES = GAME_MODES.wingo;
const BET_AMOUNTS = [10, 50, 100, 500, 1000];

type BetSelection =
  | { type: "color"; value: string }
  | { type: "number"; value: number }
  | { type: "size"; value: string };

const COLOR_CONFIG = [
  { value: "green", label: "Green", bg: "bg-green-500 hover:bg-green-600" },
  { value: "violet", label: "Violet", bg: "bg-purple-500 hover:bg-purple-600" },
  { value: "red", label: "Red", bg: "bg-red-500 hover:bg-red-600" },
];

export default function WingoGame() {
  const [modeIdx, setModeIdx] = useState(0);
  const mode = MODES[modeIdx];
  const { display, progress, periodId } = useCountdown("wingo", mode.typeId);
  const [results, setResults] = useState<RawGameResult[]>([]);
  const [myBets, setMyBets] = useState<RawBetResult[]>([]);
  const [selection, setSelection] = useState<BetSelection | null>(null);
  const [amount, setAmount] = useState(100);
  const [placing, setPlacing] = useState(false);

  const loadResults = useCallback(async () => {
    try { const data = await fetchResults("wingo", mode.typeId); setResults(data); } catch { /* skip */ }
  }, [mode.typeId]);

  const loadMyBets = useCallback(async () => {
    try { const data = await fetchMyBets("wingo", mode.typeId); setMyBets(data); } catch { /* skip */ }
  }, [mode.typeId]);

  useEffect(() => { loadResults(); loadMyBets(); }, [loadResults, loadMyBets]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (periodId) { loadResults(); loadMyBets(); } }, [periodId]);

  async function handleBet() {
    if (!selection) return toast.error("Please select a bet");
    setPlacing(true);
    try {
      await placeBet("wingo", { typeId: mode.typeId, betType: selection.type, betValue: String(selection.value), amount });
      toast.success("Bet placed!"); setSelection(null); await loadMyBets();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to place bet"); } finally { setPlacing(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {MODES.map((m, i) => (
          <button key={m.typeId} onClick={() => setModeIdx(i)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer",
              i === modeIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            {m.label}
          </button>
        ))}
      </div>
      <Card><CardContent className="py-6 flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Time Remaining</p>
        <CountdownTimer display={display} progress={progress} periodId={periodId} />
      </CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Recent Results</CardTitle></CardHeader>
        <CardContent><div className="flex gap-2 flex-wrap">
          {results.slice(0, 10).map((r, i) => (
            <motion.div key={r.periodId + i} initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <WingoBall number={Number(r.number ?? 0)} size="sm" />
            </motion.div>
          ))}
          {results.length === 0 && <p className="text-xs text-muted-foreground">No results yet</p>}
        </div></CardContent>
      </Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Place Your Bet</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {COLOR_CONFIG.map((c) => (
              <button key={c.value} onClick={() => setSelection({ type: "color", value: c.value })}
                className={cn("py-3 rounded-lg text-white font-bold transition-all cursor-pointer", c.bg,
                  selection?.type === "color" && selection.value === c.value && "ring-2 ring-white ring-offset-2 ring-offset-card scale-105")}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i).map((n) => {
              const colors = wingoColor(n);
              return (
                <button key={n} onClick={() => setSelection({ type: "number", value: n })}
                  className={cn("aspect-square rounded-full flex items-center justify-center font-bold text-white cursor-pointer transition-all",
                    colors.includes("red") && !colors.includes("violet") && "bg-red-500",
                    colors.includes("green") && !colors.includes("violet") && "bg-green-500",
                    colors.includes("violet") && colors.includes("red") && "bg-gradient-to-br from-red-500 to-purple-500",
                    colors.includes("violet") && colors.includes("green") && "bg-gradient-to-br from-green-500 to-purple-500",
                    selection?.type === "number" && selection.value === n && "ring-2 ring-white ring-offset-2 ring-offset-card scale-110")}>
                  {n}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["big", "small"].map((s) => (
              <button key={s} onClick={() => setSelection({ type: "size", value: s })}
                className={cn("py-2 rounded-lg font-bold text-white transition-all cursor-pointer",
                  s === "big" ? "bg-orange-500 hover:bg-orange-600" : "bg-sky-500 hover:bg-sky-600",
                  selection?.type === "size" && selection.value === s && "ring-2 ring-white ring-offset-2 ring-offset-card scale-105")}>
                {s === "big" ? "Big" : "Small"}
              </button>
            ))}
          </div>
          <div><p className="text-xs text-muted-foreground mb-2">Bet Amount</p>
            <div className="flex gap-2 flex-wrap">
              {BET_AMOUNTS.map((a) => (
                <button key={a} onClick={() => setAmount(a)}
                  className={cn("px-3 py-1 rounded-md text-sm font-semibold border transition-all cursor-pointer",
                    amount === a ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary")}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence>
            {selection && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <Button className="w-full" size="lg" onClick={handleBet} disabled={placing}>
                  {placing ? "Placing..." : `Bet ₹${amount} on ${selection.type}: ${selection.value}`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      {myBets.length > 0 && (
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">My Bets</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">
            {myBets.slice(0, 10).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                <div className="flex gap-2 items-center">
                  <span className="text-muted-foreground capitalize">{b.bet_type}:</span>
                  <span className="font-semibold">{b.bet_value}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <span>₹{b.amount}</span>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                    b.status === "won" && "bg-green-500/20 text-green-400",
                    b.status === "lost" && "bg-red-500/20 text-red-400",
                    b.status === "pending" && "bg-yellow-500/20 text-yellow-400")}>
                    {b.status === "won" ? `+₹${b.win_amount}` : b.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div></CardContent>
        </Card>
      )}
    </div>
  );
}
