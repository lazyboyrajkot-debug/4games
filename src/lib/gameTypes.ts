// Game logic mirroring api-server/src/lib/gameTypes.ts (client-side, no crypto)

export type GameType = "wingo" | "k3" | "fiveD";

export type GameMode = {
  typeId: number;
  label: string;
  seconds: number;
};

export const GAME_MODES: Record<GameType, GameMode[]> = {
  wingo: [
    { typeId: 1, label: "1 Min", seconds: 60 },
    { typeId: 2, label: "3 Min", seconds: 180 },
    { typeId: 3, label: "5 Min", seconds: 300 },
    { typeId: 4, label: "10 Min", seconds: 600 },
  ],
  k3: [
    { typeId: 9, label: "1 Min", seconds: 60 },
    { typeId: 10, label: "3 Min", seconds: 180 },
    { typeId: 11, label: "5 Min", seconds: 300 },
  ],
  fiveD: [
    { typeId: 13, label: "1 Min", seconds: 60 },
    { typeId: 14, label: "3 Min", seconds: 180 },
    { typeId: 15, label: "5 Min", seconds: 300 },
  ],
};

export function currentPeriod(gameType: GameType, typeId: number) {
  const modeList = GAME_MODES[gameType];
  const mode = modeList.find((m) => m.typeId === typeId) ?? modeList[0];
  const totalSeconds = mode.seconds;
  const now = Math.floor(Date.now() / 1000);
  const slot = Math.floor(now / totalSeconds);
  const periodId = `${gameType}-${typeId}-${slot}`;
  const secondsLeft = totalSeconds - (now % totalSeconds);
  return { periodId, secondsLeft, totalSeconds };
}

export function wingoSize(n: number) {
  return n >= 5 ? "Big" : "Small";
}

export function wingoColor(n: number): string[] {
  if (n === 0) return ["red", "violet"];
  if (n === 5) return ["green", "violet"];
  if ([2, 4, 6, 8].includes(n)) return ["red"];
  return ["green"];
}

export function k3Sum(result: string) {
  return result.split(",").reduce((a, b) => a + Number(b), 0);
}

export function k3Size(sum: number) {
  if (sum >= 11) return "Big";
  if (sum <= 10) return "Small";
  return "---";
}

export function k3Parity(sum: number) {
  return sum % 2 === 0 ? "Even" : "Odd";
}

export type FormattedResult = {
  periodId: string;
  createdAt?: string;
  number?: string;
  size?: string;
  colors?: string[];
  dice?: number[];
  sum?: number;
  parity?: string;
  digits?: string[];
  result?: string;
};

export function formatResult(gameType: GameType, result: string, periodId: string): FormattedResult {
  if (gameType === "wingo") {
    const n = Number(result);
    return {
      periodId,
      number: result,
      size: wingoSize(n),
      colors: wingoColor(n),
    };
  }
  if (gameType === "k3") {
    const dice = result.split(",").map(Number);
    const sum = dice.reduce((a, b) => a + b, 0);
    return {
      periodId,
      dice,
      sum,
      size: k3Size(sum),
      parity: k3Parity(sum),
    };
  }
  return {
    periodId,
    digits: result.split(""),
    result,
  };
}
