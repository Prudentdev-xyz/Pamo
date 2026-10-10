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

export interface EarnDepositQuote {
  /** USDC per share, as a decimal string. */
  sharePrice: string;
  apy: number;
  /** Fees taken from the deposit itself. Empty when there are none. */
  fees: { symbol: string; amount: string }[];
}

const QUOTE_TIMEOUT_MS = 4_000;

/**
 * The Earn Kit's deposit quote for one wallet and vault, or null when it cannot give one.
 * It only quotes a wallet that holds the amount, so a null here is normal (Architecture §11, #4).
 */
export async function getEarnDepositQuote(owner: string, vaultAddress: string, amount: string): Promise<EarnDepositQuote | null> {
  // The kit only asks this adapter who the wallet is. It can never sign: this server holds no keys.
  const readOnly = async () => {
    throw new Error("read-only adapter");
  };
  const adapter = { getAddress: async () => owner, validateChainSupport: async () => {}, prepare: readOnly, waitForTransaction: readOnly };

  let timer: NodeJS.Timeout | undefined;
  try {
    const quote = await Promise.race([
      kit.getDepositQuote({
        from: { adapter: adapter as never, chain: earnChain },
        vaultAddress,
        amount,
        ...(config.circleApiKey ? { config: { apiKey: config.circleApiKey } } : {}),
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timed out")), QUOTE_TIMEOUT_MS);
      }),
    ]);
    return {
      sharePrice: String(quote.sharePrice),
      apy: quote.currentApy,
      fees: quote.fees.map((f) => ({ symbol: f.symbol, amount: f.amount })),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
