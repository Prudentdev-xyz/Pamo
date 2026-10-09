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
  liquidity: string;
  totalDeposits: string;
  status: string;
  warnings: string[];
}

export interface VaultsResponse {
  asOf: string;
  tiers: Record<TierKey, TierVault | null>;
}

export async function fetchVaults(): Promise<VaultsResponse> {
  const res = await fetch(`${API_URL}/api/vaults`);
  if (!res.ok) throw new Error(`GET /api/vaults returned ${res.status}`);
  return res.json();
}
