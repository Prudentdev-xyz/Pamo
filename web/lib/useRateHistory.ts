"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRateHistory, type TierKey } from "./api";

/** A tier's rate over the last week, from the 10-minute snapshots. */
export function useRateHistory(tier: TierKey) {
  return useQuery({
    queryKey: ["rate-history", tier],
    queryFn: () => fetchRateHistory(tier),
    staleTime: 10 * 60_000,
    retry: 1,
  });
}
