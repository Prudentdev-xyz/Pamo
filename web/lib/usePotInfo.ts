"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "wagmi";
import { fetchActivity, fetchOwnerPots, type PotInfo } from "./api";

/** Pot names from the indexer, by pot id. Empty while the backend is down: screens fall back to "Anytime Vault #12". */
export function usePotInfo() {
  const { address } = useConnection();
  const query = useQuery({
    queryKey: ["pot-info", address],
    queryFn: () => fetchOwnerPots(address!),
    enabled: !!address,
    retry: 1,
  });
  const byId = new Map<string, PotInfo>((query.data ?? []).map((pot) => [pot.id, pot]));
  return { ...query, byId };
}

/** One pot's deposits and withdrawals, newest first. */
export function useActivity(potId: bigint | null) {
  const { address } = useConnection();
  return useQuery({
    queryKey: ["activity", address, potId?.toString()],
    queryFn: () => fetchActivity(address!, potId!),
    enabled: !!address && potId !== null,
    retry: 1,
    // The indexer reads new events every 5 seconds.
    refetchInterval: 10_000,
  });
}
