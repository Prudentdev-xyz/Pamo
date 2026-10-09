"use client";

import { useConnection, useReadContract } from "wagmi";
import { erc20Abi, USDC } from "./contract";

/** The connected wallet's USDC, read from the ERC-20 contract (6 dp), never the native balance. */
export function useUsdcBalance() {
  const { address } = useConnection();
  return useReadContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}
