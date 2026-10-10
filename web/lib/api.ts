import { TIER_KEYS } from "./contract";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type TierKey = (typeof TIER_KEYS)[number];

export interface TierVault {
  vaultAddress: string;
  name: string;
  curator: string | null;
  /** Net APY today as a decimal: 0.0448 is 4.48%. */
  apy: number;
  apy7d: number | null;
  fees: { performance: number | null; management: number | null };
  /** USDC available to withdraw right now, as a decimal string. */
  liquidity: string;
  totalDeposits: string;
  status: string;
  warnings: string[];
}

export interface VaultsResponse {
  asOf: string;
  tiers: Record<TierKey, TierVault | null>;
}

export interface RatePoint {
  at: string;
  apy: number;
  liquidity: string | null;
}

/** Amounts are integer units as strings: USDC has 6 decimals, shares have `shareDecimals`. */
export interface DepositQuote {
  /** "earn-kit": Circle quoted this wallet. "chain": read from the vault itself. */
  source: "earn-kit" | "chain";
  vault: string;
  vaultName: string | null;
  /** USDC per share, as a decimal string. */
  sharePrice: string;
  apy: number | null;
  vaultFees: { performance: number | null; management: number | null } | null;
  fees: { symbol: string; amount: string }[];
  expectedShares: string;
  shareDecimals: number;
  liquidity: string | null;
  warnings: string[];
}

export interface WithdrawQuote {
  vault: string;
  value: string;
  unlocked: boolean;
  sharesToRedeem: string;
  shareDecimals: number;
  withdrawalFee: string;
  liquidity: string | null;
  maxWithdrawable: string;
  warnings: string[];
}

/** What the indexer knows about a pot. The name only exists here: it lives in an event, not in contract storage. */
export interface PotInfo {
  id: string;
  owner: string;
  name: string | null;
  kind: "anytime" | "goal";
  tier: TierKey;
  vault: string;
  target: string | null;
  unlockAt: string | null;
  openedTx: string;
  openedBlock: number;
}

export interface ActivityItem {
  potId: string;
  type: "deposit" | "withdraw";
  assets: string;
  shares: string;
  txHash: string;
  block: number;
  at: string;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} returned ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} returned ${res.status}`);
  return res.json();
}

export const fetchVaults = () => get<VaultsResponse>("/api/vaults");

export const fetchRateHistory = (tier: TierKey) => get<RatePoint[]>(`/api/vaults/history?tier=${tier}`);

export const fetchDepositQuote = (input: { owner: string; tier: TierKey; amount: bigint; potId?: bigint }) =>
  post<DepositQuote>("/api/quotes/deposit", {
    owner: input.owner,
    tier: input.tier,
    amount: input.amount.toString(),
    ...(input.potId !== undefined ? { potId: input.potId.toString() } : {}),
  });

export const fetchWithdrawQuote = (input: { owner: string; potId: bigint; amount: bigint }) =>
  post<WithdrawQuote>("/api/quotes/withdraw", {
    owner: input.owner,
    potId: input.potId.toString(),
    amount: input.amount.toString(),
  });

export const fetchOwnerPots = (owner: string) => get<PotInfo[]>(`/api/owners/${owner}/pots`);

export const fetchActivity = (owner: string, potId: bigint) =>
  get<ActivityItem[]>(`/api/owners/${owner}/activity?potId=${potId}&limit=50`);
