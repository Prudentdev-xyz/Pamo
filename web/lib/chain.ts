import { defineChain } from "viem";

export const arc = defineChain({
  id: 5042,
  name: "Arc",
  // The native gas view of USDC is 18 dp. Amounts shown to users come from the ERC-20 interface (6 dp).
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.arc.io"] } },
  blockExplorers: { default: { name: "Arc Explorer", url: "https://explorer.arc.io" } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
});

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.io"] } },
  blockExplorers: { default: { name: "Arc Explorer", url: "https://explorer.testnet.arc.io" } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
  testnet: true,
});

/** The chain this build runs against: testnet during the build, mainnet for the release. */
export const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "5042" ? arc : arcTestnet;

export const explorerTx = (hash: string) => `${chain.blockExplorers.default.url}/tx/${hash}`;
export const explorerAddress = (address: string) => `${chain.blockExplorers.default.url}/address/${address}`;
