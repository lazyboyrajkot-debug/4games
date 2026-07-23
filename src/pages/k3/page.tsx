import { useState, useEffect, useCallback } from "react";
import { useCountdown } from "@/hooks/use-countdown.ts";
import { GAME_MODES, k3Size, k3Parity } from "@/lib/gameTypes.ts";
import { fetchResults, placeBet, fetchMyBets, type RawGameResult, type RawBetResult } from "@/lib/api.ts";
import CountdownTimer from "@/components/CountdownTimer.tsx";
import DiceFace from "@/components/DiceFace.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const MODES = GAME_MODES.k3;
const BET_AMOUNTS = [10, 50, 100, 500, 1000];

type BetSelection =
  | { type: "sum"; value: number }
  | { type: "size"; value: string }
  | { type: "parity"; value: string };

export default function K3Game() {
  const [modeIdx, setModeIdx] = useState(0);
  const mode = MODES[modeIdx];
  const { display, progress, periodId } = useCountdown("k3", mode.typeId);
  const [results, setResults] = useState<RawGameResult[]>([]);
  const [myBets, setMyBets] = useState<RawBetResult[]>([]);
  const [selection, setSelection] = useState<BetSelection | null>(null);
  const [amount, setAmount] = useState(100);
  const [placing, setPlacing] = useState(false);

  const loadResults = useCallback(async () => {
    try { const data = await fetchResults("k3", mode.typeId); setResults(data); } catch { /* skip */ }
  }, [mode.typeId]);
  const loadMyBets = useCallback(async () => {
    try { const data = await fetchMyBets("k3", mode.typeId); setMyBets(data); } catch { /* skip */ }
  }, [mode.typeId]);

  useEffect(() => { loadResults(); loadMyBets(); }, [loadResults, loadMyBets]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (periodId) { loadResults(); loadMyBets(); } }, [periodId]);

  async function handleBet() {
    if (!selection) return toast.error("Please select a bet");
    setPlacing(true);
    try {
      await placeBet("k3", { typeId: mode.typeId, betType: selection.type, betValue: String(selection.value), amount });
      toast.success("Bet placed!"); setSelection(null); await loadMyBets();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } finally { setPlacing(false); }
  }

  const latestResult = results[0];
  const latestDice = latestResult?.dice ?? latestResult?.result?.split(",").map(Number) ?? [];

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
      <Card><CardContent className="py-6 flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Time Remaining</p>
        <CountdownTimer display={display} progress={progress} periodId={periodId} />
        {latestDice.length > 0 && (
          <div className="flex gap-3 items-center">
            <span className="text-xs text-muted-foreground">Last:</span>
            {latestDice.map((d, i) => <DiceFace key={i} value={d} size="md" />)}
            <span className="text-sm font-bold ml-1">Sum: {latestDice.reduce((a, b) => a + b, 0)}</span>
          </div>
        )}
      </CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Recent Results</CardTitle></CardHeader>
        <CardContent><div className="space-y-2">
          {results.slice(0, 8).map((r, i) => {
            const dice = r.dice ?? r.result?.split(",").map(Number) ?? [];
            const sum = r.sum ?? dice.reduce((a, b) => a + b, 0);
            return (
              <div key={r.periodId + i} className="flex items-center gap-3 py-1 border-b border-border last:border-0">
                <div className="flex gap-1">{dice.map((d, di) => <DiceFace key={di} value={d} size="sm" />)}</div>
                <span className="font-bold text-sm">{sum}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", k3Size(sum) === "Big" ? "bg-orange-500/20 text-orange-400" : "bg-sky-500/20 text-sky-400")}>{k3Size(sum)}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", k3Parity(sum) === "Odd" ? "bg-purple-500/20 text-purple-400" : "bg-pink-500/20 text-pink-400")}>{k3Parity(sum)}</span>
              </div>
            );
          })}
          {results.length === 0 && <p className="text-xs text-muted-foreground">No results yet</p>}
        </div></CardContent>
      </Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Place Your Bet</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { type: "size" as const, value: "big", label: "Big", cls: "bg-orange-500 hover:bg-orange-600" },
              { type: "size" as const, value: "small", label: "Small", cls: "bg-sky-500 hover:bg-sky-600" },
              { type: "parity" as const, value: "odd", label: "Odd", cls: "bg-purple-500 hover:bg-purple-600" },
              { type: "parity" as const, value: "even", label: "Even", cls: "bg-pink-500 hover:bg-pink-600" },
            ].map((btn) => (
              <button key={btn.value} onClick={() => setSelection({ type: btn.type, value: btn.value })}
                className={cn("py-3 rounded-lg text-white font-bold transition-all cursor-pointer text-sm", btn.cls,
                  selection?.type === btn.type && selection.value === btn.value && "ring-2 ring-white ring-offset-2 ring-offset-card scale-105")}>
                {btn.label}
              </button>
            ))}
          </div>
          <div><p className="text-xs text-muted-foreground mb-2">Bet on Sum (3-18)</p>
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: 16 }, (_, i) => i + 3).map((s) => (
                <button key={s} onClick={() => setSelection({ type: "sum", value: s })}
                  className={cn("aspect-square rounded-md text-xs font-bold cursor-pointer transition-all flex items-center justify-center",
                    selection?.type === "sum" && selection.value === s ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted")}>
                  {s}
                </button>
              ))}
            </div>
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
                <div className="flex gap-2 items-center"><span className="text-muted-foreground capitalize">{b.bet_type}:</span><span className="font-semibold">{b.bet_value}</span></div>
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
