"use client";

import type { VaultsResponse } from "@/lib/api";
import { formatApy, formatEstimate } from "@/lib/format";
import { LENDING_NOTE, TIER_INFO } from "@/lib/tiers";

/** Calm, Steady or Bold, each with its live rate and a plain-English note. */
export function TierPicker({
  value,
  onChange,
  vaults,
}: {
  value: number;
  onChange: (tier: number) => void;
  vaults: VaultsResponse | undefined;
}) {
  return (
    <fieldset>
      <legend className="font-semibold">Choose a portfolio</legend>
      <p className="mt-1 text-sm">{LENDING_NOTE}</p>
      <div className="mt-3 space-y-2">
        {TIER_INFO.map((tier) => {
          const vault = vaults?.tiers[tier.key];
          return (
            <label
              key={tier.key}
              className={`block cursor-pointer rounded border px-4 py-3 ${value === tier.index ? "border-2 border-black" : "border-black"}`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-2">
                  <input type="radio" name="tier" checked={value === tier.index} onChange={() => onChange(tier.index)} />
                  <span className="font-semibold">{tier.label}</span>
                  <span className="text-sm">Level {tier.level} of 3</span>
                </span>
                <span className="tabular-nums">{vault ? `${formatApy(vault.apy)} APY today, changes daily` : "Rate unavailable"}</span>
              </span>
              <span className="mt-1 block text-sm">{tier.risk}</span>
              {vault && (
                <span className="mt-1 block text-sm tabular-nums">
                  {vault.name} · {formatEstimate(Number(vault.liquidity))} available to withdraw
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
