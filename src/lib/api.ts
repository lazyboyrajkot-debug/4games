// API client for games backend
const BASE_URL: string = import.meta.env.VITE_API_URL ?? "";

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token") ?? "";
  const res = await fetch(`${BASE_URL}/api/games${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<unknown>;
}

export type PeriodInfo = {
  periodId: string;
  secondsLeft: number;
  totalSeconds: number;
};

export type RawBetResult = {
  id: string;
  game_type: string;
  type_id: number;
  period_id: string;
  bet_type: string;
  bet_value: string;
  amount: number;
  status: "pending" | "won" | "lost";
  win_amount: number;
  created_at: string;
};

export type RawGameResult = {
  periodId: string;
  createdAt: string;
  number?: string;
  size?: string;
  result?: string;
  sum?: number;
  dice?: number[];
  digits?: string[];
};

export async function fetchPeriod(gameType: string, typeId: number): Promise<PeriodInfo> {
  return apiFetch(`/${gameType}/period?typeId=${typeId}`) as Promise<PeriodInfo>;
}

export async function fetchResults(gameType: string, typeId: number, limit = 20): Promise<RawGameResult[]> {
  const data = await apiFetch(`/${gameType}/results?typeId=${typeId}&limit=${limit}`) as { data: RawGameResult[] };
  return data.data ?? [];
}

export async function fetchMyBets(gameType: string, typeId: number): Promise<RawBetResult[]> {
  const data = await apiFetch(`/${gameType}/my-bets?typeId=${typeId}`) as { data: RawBetResult[] };
  return data.data ?? [];
}

export type PlaceBetPayload = {
  typeId: number;
  betType: string;
  betValue: string;
  amount: number;
};

export async function placeBet(gameType: string, payload: PlaceBetPayload): Promise<RawBetResult> {
  return apiFetch(`/${gameType}/bet`, {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<RawBetResult>;
}
