import { EarnKit } from "@circle-fin/earn-kit";
import { config } from "./config.js";
import { earnChain, readTierVaults, TIERS, type TierName } from "./chain.js";

const CACHE_MS = 60_000;

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
  tiers: Record<TierName, TierVault | null>;
}

const kit = new EarnKit();
let cache: { at: number; data: VaultsResponse } | undefined;
let inFlight: Promise<VaultsResponse> | undefined;

async function load(): Promise<VaultsResponse> {
  const [tierVaults, explored] = await Promise.all([
    readTierVaults(),
    kit.exploreVaults({
      chain: earnChain,
      pageSize: 500,
      ...(config.circleApiKey ? { config: { apiKey: config.circleApiKey } } : {}),
    }),
  ]);

  const byAddress = new Map(explored.vaults.map((v) => [v.vaultAddress.toLowerCase(), v]));
  const tiers = {} as Record<TierName, TierVault | null>;
  for (const tier of TIERS) {
    const v = byAddress.get(tierVaults[tier].toLowerCase());
    tiers[tier] = v
      ? {
          vaultAddress: v.vaultAddress,
          name: v.name,
          curator: v.manager?.name ?? null,
          apy: v.currentApy,
          apy7d: v.apyProfile?.d7 ?? null,
          fees: {
            performance: v.fee?.performance ?? null,
            management: v.fee?.management ?? null,
          },
          liquidity: v.liquidity,
          totalDeposits: v.totalDeposits,
          status: v.status,
          warnings: (v.riskSignals?.warnings ?? []).map((w) => w.type),
        }
      : null; // the Earn Kit does not list this vault
  }
  return { asOf: new Date().toISOString(), tiers };
}

/** Live data for the three tier vaults, cached for 60 seconds. */
export async function getTierVaults(): Promise<VaultsResponse> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  inFlight ??= load()
    .then((data) => {
      cache = { at: Date.now(), data };
      return data;
    })
    .finally(() => {
      inFlight = undefined;
    });
  return inFlight;
}
