"use client";

import { useReadContract } from "wagmi";
import { PAMO_SAVINGS, pamoSavingsAbi } from "./contract";

/** True while new savings are paused. Withdrawals keep working through a pause. */
export function usePaused() {
  return useReadContract({ address: PAMO_SAVINGS, abi: pamoSavingsAbi, functionName: "paused" });
}
