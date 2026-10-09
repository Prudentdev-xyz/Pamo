"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVaults } from "./api";

/** Live tier rates from Express. The app keeps working when this fails. */
export function useVaults() {
  return useQuery({ queryKey: ["vaults"], queryFn: fetchVaults, staleTime: 60_000, refetchInterval: 60_000, retry: 1 });
}
