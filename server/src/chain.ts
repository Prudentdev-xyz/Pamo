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
  "struct Pot { address owner; uint8 kind; uint8 tier; bool unlocked; uint64 unlockAt; address vault; uint256 shares; uint256 principal; uint256 target; }",
  "function vaultFor(uint8 tier) view returns (address)",
  "function getPot(uint256 id) view returns (Pot)",
  "function potValue(uint256 id) view returns (uint256)",
  "function isUnlocked(uint256 id) view returns (bool)",
  "event PotOpened(uint256 indexed id, address indexed owner, uint8 kind, uint8 tier, address vault, uint256 target, uint64 unlockAt, string name)",
  "event Deposited(uint256 indexed id, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdrawn(uint256 indexed id, address indexed owner, uint256 assets, uint256 shares)",
  "event TierVaultSet(uint8 indexed tier, address vault)",
]);

/** The ERC-4626 views Pamo reads. Shares use the vault's own decimals, so never assume 18. */
export const vaultAbi = parseAbi([
  "function decimals() view returns (uint8)",
  "function previewDeposit(uint256 assets) view returns (uint256)",
  "function previewWithdraw(uint256 assets) view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
]);

export const USDC_DECIMALS = 6;

export const KINDS = ["anytime", "goal"] as const;
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
