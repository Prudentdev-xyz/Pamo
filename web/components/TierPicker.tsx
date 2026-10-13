"use client";

import { motion } from "motion/react";
import type { VaultsResponse } from "@/lib/api";
import { formatApy, formatEstimate } from "@/lib/format";
import { TIER_INFO } from "@/lib/tiers";
import { spring } from "@/motion/tokens";
import { TickIcon } from "./Icon";
import { LevelMark } from "./TierChip";

/** Calm, Steady or Bold, each with its live rate and a plain-English note. */
export function TierPicker({
  value,
  onChange,
  vaults,
  paused = false,
}: {
  value: number;
  onChange: (tier: number) => void;
  vaults: VaultsResponse | undefined;
  /** New savings are paused: the cards stay readable but cannot be picked. */
  paused?: boolean;
}) {
  return (
    <fieldset disabled={paused}>
      <legend className="sr-only">Choose a portfolio</legend>
      <div className="grid gap-3 lg:grid-cols-3">
        {TIER_INFO.map((tier) => {
          const vault = vaults?.tiers[tier.key];
          const selected = value === tier.index;
          // The vault itself reports when it is not working normally.
          const unwell = !!vault && vault.status.toLowerCase() !== "active";
          return (
            <label
              key={tier.key}
              className={`relative flex flex-col gap-2.5 rounded-card border border-grey-line p-5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-green ${
                paused ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="tier"
                checked={selected}
                onChange={() => onChange(tier.index)}
                className="sr-only"
              />
              {/* One outline shared by the three cards, so it glides to the card that is picked. */}
              {selected && (
                <motion.span
                  layoutId="tier-outline"
                  aria-hidden="true"
                  transition={spring}
                  className="pointer-events-none absolute -inset-px rounded-card border-2 border-black"
                />
              )}
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2.5 text-body font-bold">
                  <LevelMark tier={tier.index} />
                  {tier.label}
                </span>
                {paused || unwell ? (
                  <span className="rounded-sm bg-caution-fill px-2 py-1 text-caption font-semibold text-caution">
                    {paused ? "Paused" : "Not working normally"}
                  </span>
                ) : selected ? (
                  <TickIcon size={24} variant="Bold" />
                ) : (
                  <span aria-hidden="true" className="m-0.5 size-5 rounded-full border-[1.5px] border-grey-line" />
                )}
              </span>
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-h2 font-bold tabular-nums">{vault ? formatApy(vault.apy) : "Rate unavailable"}</span>
                {vault && <span className="text-caption text-grey-text">APY today, changes daily</span>}
              </span>
              <span className="text-label text-grey-text">{tier.risk}</span>
              {vault && (
                <span className="mt-auto flex flex-wrap justify-between gap-x-3 border-t border-grey-line pt-2.5 text-caption">
                  <span className="text-grey-text">Cash available now</span>
                  <b className="font-semibold tabular-nums">{formatEstimate(Number(vault.liquidity))}</b>
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
