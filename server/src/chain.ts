import { createPublicClient, defineChain, http, parseAbi } from "viem";
import { config } from "./config.js";

const isMainnet = config.chainId === 5042;

export const arc = defineChain({
  id: config.chainId,
  name: isMainnet ? "Arc" : "Arc Testnet",
  // The native gas view of USDC is 18 dp. Amounts shown to users come from the ERC-20 interface (6 dp).
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [config.rpcUrl] } },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: isMainnet ? "https://explorer.arc.io" : "https://explorer.testnet.arc.io",
    },
  },
});

/** The Earn Kit's name for the chain this server runs against. */
export const earnChain = isMainnet ? "Arc" : "Arc_Testnet";

export const publicClient = createPublicClient({ chain: arc, transport: http(config.rpcUrl) });

export const pamoSavingsAbi = parseAbi([
  "function vaultFor(uint8 tier) view returns (address)",
  "event PotOpened(uint256 indexed id, address indexed owner, uint8 kind, uint8 tier, address vault, uint256 target, uint64 unlockAt, string name)",
  "event Deposited(uint256 indexed id, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdrawn(uint256 indexed id, address indexed owner, uint256 assets, uint256 shares)",
  "event TierVaultSet(uint8 indexed tier, address vault)",
]);

export const TIERS = ["calm", "steady", "bold"] as const;
export type TierName = (typeof TIERS)[number];

/** The vault each tier points at right now, read from the contract. */
export async function readTierVaults(): Promise<Record<TierName, `0x${string}`>> {
  const [calm, steady, bold] = await Promise.all(
    TIERS.map((_, tier) =>
      publicClient.readContract({
        address: config.pamoSavings,
        abi: pamoSavingsAbi,
        functionName: "vaultFor",
        args: [tier],
      }),
    ),
  );
  return { calm: calm!, steady: steady!, bold: bold! };
}
