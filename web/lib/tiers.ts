import { TIER_KEYS, TIERS } from "./contract";

/** Plain-English notes for the three portfolios. Each one is a USDC lending vault, never a stock or a fund. */
export const TIER_INFO = [
  {
    risk: "The most cautious of the three. It usually pays the lowest rate.",
  },
  {
    risk: "A middle path between Calm and Bold.",
  },
  {
    risk: "Takes more lending risk for a higher rate. The rate moves more from day to day.",
  },
].map((info, i) => ({ ...info, index: i, label: TIERS[i]!, key: TIER_KEYS[i]!, level: i + 1 }));

export const LENDING_NOTE =
  "All three are USDC lending vaults: your USDC is lent to borrowers and earns interest. Rates change daily, and a vault can run short on cash to withdraw.";
