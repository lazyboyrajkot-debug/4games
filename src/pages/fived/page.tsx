import { useState, useEffect, useCallback } from "react";
import { useCountdown } from "@/hooks/use-countdown.ts";
import { GAME_MODES } from "@/lib/gameTypes.ts";
import { fetchResults, placeBet, fetchMyBets, type RawGameResult, type RawBetResult } from "@/lib/api.ts";
import CountdownTimer from "@/components/CountdownTimer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const MODES = GAME_MODES.fiveD;
const BET_AMOUNTS = [10, 50, 100, 500, 1000];
const POSITIONS = ["A", "B", "C", "D", "E"] as const;
type Position = (typeof POSITIONS)[number];

type BetSelection = { position: Position; mode: "digit" | "size" | "parity"; value: string; };

const POSITION_COLORS: Record<Position, string> = {
  A: "bg-red-500", B: "bg-orange-500", C: "bg-yellow-500", D: "bg-green-500", E: "bg-blue-500",
};

export default function FiveDGame() {
  const [modeIdx, setModeIdx] = useState(0);
  const mode = MODES[modeIdx];
  const { display, progress, periodId } = useCountdown("fiveD", mode.typeId);
  const [results, setResults] = useState<RawGameResult[]>([]);
  const [myBets, setMyBets] = useState<RawBetResult[]>([]);
  const [selectedPos, setSelectedPos] = useState<Position>("A");
  const [selection, setSelection] = useState<BetSelection | null>(null);
  const [amount, setAmount] = useState(100);
  const [placing, setPlacing] = useState(false);

  const loadResults = useCallback(async () => {
    try { const data = await fetchResults("fiveD", mode.typeId); setResults(data); } catch { /* skip */ }
  }, [mode.typeId]);
  const loadMyBets = useCallback(async () => {
    try { const data = await fetchMyBets("fiveD", mode.typeId); setMyBets(data); } catch { /* skip */ }
  }, [mode.typeId]);

  useEffect(() => { loadResults(); loadMyBets(); }, [loadResults, loadMyBets]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (periodId) { loadResults(); loadMyBets(); } }, [periodId]);

  function selectBet(betMode: "digit" | "size" | "parity", value: string) {
    setSelection({ position: selectedPos, mode: betMode, value });
  }

  async function handleBet() {
    if (!selection) return toast.error("Please select a bet");
    let betType = `position_${selection.position.toLowerCase()}`;
    if (selection.mode !== "digit") betType += `_${selection.mode}`;
    setPlacing(true);
    try {
      await placeBet("fiveD", { typeId: mode.typeId, betType, betValue: selection.value, amount });
      toast.success("Bet placed!"); setSelection(null); await loadMyBets();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } finally { setPlacing(false); }
  }

  const latestDigits = results[0]?.digits ?? results[0]?.result?.split("") ?? [];

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
        {latestDigits.length === 5 && (
          <div className="flex gap-2">
            {POSITIONS.map((p, i) => (
              <div key={p} className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{p}</span>
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-lg", POSITION_COLORS[p])}>
                  {latestDigits[i]}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Recent Results</CardTitle></CardHeader>
        <CardContent><div className="space-y-2 overflow-x-auto">
          {results.slice(0, 8).map((r, i) => {
            const digits = r.digits ?? r.result?.split("") ?? [];
            return (
              <div key={r.periodId + i} className="flex items-center gap-2 py-1 border-b border-border last:border-0">
                {POSITIONS.map((p, pi) => (
                  <div key={p} className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground">{p}</span>
                    <span className={cn("w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold", POSITION_COLORS[p])}>{digits[pi] ?? "-"}</span>
                  </div>
                ))}
                <span className="text-xs text-muted-foreground ml-2 font-mono">{digits.join("")}</span>
              </div>
            );
          })}
          {results.length === 0 && <p className="text-xs text-muted-foreground">No results yet</p>}
        </div></CardContent>
      </Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Place Your Bet</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><p className="text-xs text-muted-foreground mb-2">Select Position</p>
            <div className="flex gap-2">
              {POSITIONS.map((p) => (
                <button key={p} onClick={() => { setSelectedPos(p); setSelection(null); }}
                  className={cn("w-10 h-10 rounded-lg font-bold text-white transition-all cursor-pointer", POSITION_COLORS[p],
                    selectedPos === p ? "ring-2 ring-white ring-offset-2 ring-offset-card scale-110" : "opacity-60")}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div><p className="text-xs text-muted-foreground mb-2">Digit (0-9)</p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => i).map((n) => (
                <button key={n} onClick={() => selectBet("digit", String(n))}
                  className={cn("aspect-square rounded-lg font-bold text-sm cursor-pointer transition-all",
                    selection?.mode === "digit" && selection.value === String(n) && selection.position === selectedPos ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { mode: "size" as const, value: "big", label: "Big", cls: "bg-orange-500 hover:bg-orange-600" },
              { mode: "size" as const, value: "small", label: "Small", cls: "bg-sky-500 hover:bg-sky-600" },
              { mode: "parity" as const, value: "odd", label: "Odd", cls: "bg-purple-500 hover:bg-purple-600" },
              { mode: "parity" as const, value: "even", label: "Even", cls: "bg-pink-500 hover:bg-pink-600" },
            ].map((btn) => (
              <button key={btn.value} onClick={() => selectBet(btn.mode, btn.value)}
                className={cn("py-3 rounded-lg text-white font-bold transition-all cursor-pointer text-sm", btn.cls,
                  selection?.mode === btn.mode && selection.value === btn.value && selection.position === selectedPos && "ring-2 ring-white ring-offset-2 ring-offset-card scale-105")}>
                {btn.label}
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
                  {placing ? "Placing..." : `Bet ₹${amount} on ${selection.position} ${selection.mode}: ${selection.value}`}
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
                <div className="flex gap-2 items-center"><span className="text-muted-foreground">{b.bet_type}:</span><span className="font-semibold">{b.bet_value}</span></div>
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
