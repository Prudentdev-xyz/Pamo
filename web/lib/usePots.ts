"use client";

import { useConnection, useReadContract } from "wagmi";
import { PAMO_SAVINGS, pamoSavingsAbi } from "./contract";

/** Every pot the connected wallet owns, with its live value, in one read from the chain. */
export function usePots() {
  const { address } = useConnection();
  return useReadContract({
    address: PAMO_SAVINGS,
    abi: pamoSavingsAbi,
    functionName: "getPots",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}
