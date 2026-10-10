"use client";

import { useQuery } from "@tanstack/react-query";
import { formatUnits, type Address, type PublicClient } from "viem";
import { useConnection, useReadContract, useReadContracts } from "wagmi";
import { fetchDepositQuote, fetchWithdrawQuote } from "./api";
import { erc20Abi, PAMO_SAVINGS, pamoSavingsAbi, TIER_KEYS, TIERS, USDC, USDC_DECIMALS, vaultAbi } from "./contract";
import { formatApy, formatEstimate, formatNetworkFee, formatShares, formatUsdc, shortAddress } from "./format";
import { estimateNetworkFee } from "./tx";
import { useDebounced } from "./useDebounced";
import { useVaults } from "./useVaults";
import { warningMessage } from "./warnings";

export interface ReviewRow {
  label: string;
  value: string;
}

const UNAVAILABLE = "Unavailable right now";

const feePercent = (fee: number | null) => (fee === null ? "not reported" : `${(fee * 100).toFixed(2)}%`);

/**
 * Everything the "Review your saving" screen shows (Build Guide §6).
 * Shares come from the vault itself; the rate, fees and warnings come from Express.
 * When Express is down the review still shows the chain's numbers and saving still works.
 */
export function useSaveReview(input: {
  tier: number;
  /** Null until the form holds a valid amount. */
  amount: bigint | null;
  /** Set when adding to an existing pot, which keeps the vault it was opened in. */
  pot?: { id: bigint; vault: Address };
  /** Gas for the save itself, for the network fee line. */
  estimateGas: (client: PublicClient, account: Address) => Promise<bigint>;
}) {
  const { address } = useConnection();
  const amount = useDebounced(input.amount);
  const vaults = useVaults();
  const enabled = !!address && amount !== null;

  const tierVault = useReadContract({
    address: PAMO_SAVINGS,
    abi: pamoSavingsAbi,
    functionName: "vaultFor",
    args: [input.tier],
    query: { enabled: !input.pot },
  });
  const vault = input.pot?.vault ?? tierVault.data;

  const preview = useReadContracts({
    allowFailure: false,
    contracts: [
      { address: vault, abi: vaultAbi, functionName: "decimals" },
      { address: vault, abi: vaultAbi, functionName: "previewDeposit", args: [amount ?? 0n] },
    ],
    query: { enabled: enabled && !!vault },
  });

  const quote = useQuery({
    queryKey: ["deposit-quote", address, input.tier, input.pot?.id.toString(), amount?.toString()],
    queryFn: () =>
      fetchDepositQuote({ owner: address!, tier: TIER_KEYS[input.tier]!, amount: amount!, potId: input.pot?.id }),
    enabled,
    staleTime: 15_000,
    retry: 0,
  });

  const allowance = useReadContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, PAMO_SAVINGS] : undefined,
    query: { enabled: !!address },
  });
  const allowed = amount !== null && allowance.data !== undefined && allowance.data >= amount;

  const fee = useQuery({
    queryKey: ["save-fee", address, input.tier, input.pot?.id.toString(), amount?.toString()],
    queryFn: () => estimateNetworkFee((client) => input.estimateGas(client, address!)),
    enabled: enabled && allowed,
    staleTime: 15_000,
  });

  const tierData = vaults.data?.tiers[TIER_KEYS[input.tier]!] ?? null;
  // An existing pot may sit in a vault its tier no longer points at, so only trust tier data for the same vault.
  const vaultInfo = tierData && vault && tierData.vaultAddress.toLowerCase() === vault.toLowerCase() ? tierData : null;
  const apy = quote.data?.apy ?? vaultInfo?.apy ?? null;
  const fees = quote.data?.vaultFees ?? vaultInfo?.fees ?? null;
  const vaultName = quote.data?.vaultName ?? vaultInfo?.name ?? (vault ? shortAddress(vault) : "…");

  const rows: ReviewRow[] = [];
  if (amount !== null) {
    rows.push({ label: "You save", value: formatUsdc(amount) });
    rows.push({ label: "Into", value: `${TIERS[input.tier]} · ${vaultName}` });
    rows.push({ label: "APY today", value: apy === null ? UNAVAILABLE : `${formatApy(apy)} (changes daily)` });
    rows.push({
      label: "Vault fees",
      value: fees ? `performance ${feePercent(fees.performance)} · management ${feePercent(fees.management)}` : UNAVAILABLE,
    });

    if (preview.data) {
      const [decimals, shares] = preview.data;
      // The share price falls out of the preview when Express cannot supply it.
      const price =
        quote.data?.sharePrice ??
        (shares > 0n ? (Number(formatUnits(amount, USDC_DECIMALS)) / Number(formatUnits(shares, decimals))).toFixed(6) : null);
      rows.push({
        label: "You receive",
        value: `${formatShares(shares, decimals)} shares${price ? ` (1 share = ${Number(price).toFixed(4)} USDC)` : ""}`,
      });
    } else {
      rows.push({ label: "You receive", value: preview.isError ? UNAVAILABLE : "…" });
    }

    rows.push({
      label: "Network fee",
      value: !allowed
        ? "Available after allowing"
        : fee.data
          ? formatNetworkFee(fee.data)
          : fee.isPending
            ? "…"
            : UNAVAILABLE,
    });
    if (apy !== null) {
      const inOneYear = Number(formatUnits(amount, USDC_DECIMALS)) * (1 + apy);
      rows.push({ label: "In 1 year (est.)", value: `~${formatEstimate(inOneYear)} (estimate, not a promise)` });
    }
  }

  const codes = quote.data ? quote.data.warnings : quote.isError ? ["VAULT_DATA_UNAVAILABLE"] : [];

  return {
    rows,
    warnings: [...new Set(codes)].map(warningMessage),
    /** Re-reads the quote and the preview. Called right before the wallet opens. */
    refresh: async () => {
      await Promise.all([quote.refetch(), preview.refetch()]);
    },
  };
}

/**
 * Everything the "Review your withdrawal" screen shows.
 * The Earn Kit cannot quote a Pamo withdrawal, so Express builds this from the chain and the vault's liquidity.
 */
export function useWithdrawReview(input: {
  id: bigint;
  pot: { vault: Address; shares: bigint };
  /** What the pot is worth now. */
  value: bigint;
  amount: bigint | null;
}) {
  const { address } = useConnection();
  const amount = useDebounced(input.amount);
  const enabled = !!address && amount !== null && amount <= input.value;
  const takesAll = amount !== null && amount >= input.value;

  const quote = useQuery({
    queryKey: ["withdraw-quote", address, input.id.toString(), amount?.toString()],
    queryFn: () => fetchWithdrawQuote({ owner: address!, potId: input.id, amount: amount! }),
    enabled,
    staleTime: 15_000,
    retry: 0,
  });

  const preview = useReadContracts({
    allowFailure: false,
    contracts: [
      { address: input.pot.vault, abi: vaultAbi, functionName: "decimals" },
      { address: input.pot.vault, abi: vaultAbi, functionName: "previewWithdraw", args: [amount ?? 0n] },
    ],
    query: { enabled },
  });

  const fee = useQuery({
    queryKey: ["withdraw-fee", address, input.id.toString(), amount?.toString()],
    queryFn: () =>
      estimateNetworkFee((client) =>
        takesAll
          ? client.estimateContractGas({ address: PAMO_SAVINGS, abi: pamoSavingsAbi, functionName: "withdrawAll", args: [input.id], account: address! })
          : client.estimateContractGas({ address: PAMO_SAVINGS, abi: pamoSavingsAbi, functionName: "withdraw", args: [input.id, amount!], account: address! }),
      ),
    enabled,
    staleTime: 15_000,
  });

  const liquidity = quote.data?.liquidity ? BigInt(quote.data.liquidity) : null;
  const max = quote.data ? BigInt(quote.data.maxWithdrawable) : null;

  const rows: ReviewRow[] = [];
  if (amount !== null && enabled) {
    rows.push({ label: "You withdraw", value: formatUsdc(amount) });
    if (preview.data) {
      const [decimals, shares] = preview.data;
      // Taking the whole value redeems every share the pot holds.
      rows.push({ label: "Shares redeemed", value: formatShares(takesAll ? input.pot.shares : shares, decimals) });
    } else {
      rows.push({ label: "Shares redeemed", value: preview.isError ? UNAVAILABLE : "…" });
    }
    rows.push({ label: "Withdrawal fee", value: formatUsdc(BigInt(quote.data?.withdrawalFee ?? "0")) });
    rows.push({
      label: "Available now",
      value: liquidity !== null ? `up to ${formatUsdc(liquidity)} in this vault` : quote.isPending ? "…" : UNAVAILABLE,
    });
    rows.push({ label: "Left in this pot", value: formatUsdc(takesAll ? 0n : input.value - amount) });
    rows.push({ label: "Network fee", value: fee.data ? formatNetworkFee(fee.data) : fee.isPending ? "…" : UNAVAILABLE });
  }

  // The vault cannot pay this much right now: say so before the button, and keep it disabled.
  const blocked =
    amount !== null && liquidity !== null && max !== null && amount > liquidity
      ? `The vault is short on cash right now. Try up to ${formatUsdc(max)}.`
      : null;

  const codes = quote.data
    ? quote.data.warnings.filter((code) => !["LOW_LIQUIDITY", "EXCEEDS_VALUE", "GOAL_LOCKED"].includes(code))
    : quote.isError
      ? ["VAULT_DATA_UNAVAILABLE"]
      : [];

  return {
    rows,
    warnings: [...new Set(codes)].map(warningMessage),
    blocked,
    /** Re-reads the quote right before the wallet opens. Returns the reason if the vault can no longer pay. */
    recheck: async (): Promise<string | null> => {
      const fresh = await quote.refetch();
      const cash = fresh.data?.liquidity ? BigInt(fresh.data.liquidity) : null;
      return amount !== null && cash !== null && amount > cash
        ? `The vault is short on cash right now. Try up to ${formatUsdc(BigInt(fresh.data!.maxWithdrawable))}.`
        : null;
    },
  };
}
