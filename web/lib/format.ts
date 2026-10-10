import { formatUnits, parseUnits } from "viem";
import { USDC_DECIMALS } from "./contract";

/** "120.50 USDC" from a 6-decimal amount. Shows 2 decimals, more only when they are needed. */
export function formatUsdc(amount: bigint): string {
  const n = Number(formatUnits(amount, USDC_DECIMALS));
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`;
}

/** A plain decimal string for an input field, e.g. "120.5". */
export const usdcInputValue = (amount: bigint) => formatUnits(amount, USDC_DECIMALS);

/** Parses what the user typed. Returns null unless it is a positive amount with at most 6 decimals. */
export function parseUsdc(input: string): bigint | null {
  const text = input.trim();
  if (!/^\d+(\.\d{1,6})?$/.test(text)) return null;
  const amount = parseUnits(text, USDC_DECIMALS);
  return amount > 0n ? amount : null;
}

/** 0.0448 becomes "4.48%". */
export const formatApy = (apy: number) => `${(apy * 100).toFixed(2)}%`;

export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/** Vault shares in the vault's own decimals, shown to at most 4 places. */
export function formatShares(shares: bigint, decimals: number): string {
  return Number(formatUnits(shares, decimals)).toLocaleString("en-US", { maximumFractionDigits: 4 });
}

/** A projected amount, which is a plain number and never exact: "1,234.56 USDC". */
export const formatEstimate = (usdc: number) =>
  `${usdc.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;

/** A network fee, which Arc charges in USDC with 18 decimals. */
export function formatNetworkFee(fee: bigint): string {
  const n = Number(formatUnits(fee, 18));
  return `~${n.toLocaleString("en-US", { maximumSignificantDigits: 2 })} USDC`;
}

/** "Oct 30, 2026" */
export const formatDate = (date: Date | string | number) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "Oct 30, 2026, 2:15 PM" */
export const formatDateTime = (date: Date | string | number) =>
  new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
