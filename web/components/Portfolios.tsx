"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { explorerAddress } from "@/lib/chain";
import { formatApy, formatEstimate } from "@/lib/format";
import { LENDING_NOTE, TIER_INFO } from "@/lib/tiers";
import { useVaults } from "@/lib/useVaults";
import { warningMessage } from "@/lib/warnings";
import { fade, list, rise } from "@/motion/variants";
import { Banner } from "./Banner";
import { Blank } from "./Blank";
import { Card } from "./Card";
import { ArrowRightIcon, ExternalIcon, WarningIcon } from "./Icon";
import { LiveDot } from "./LiveDot";
import { RateChart } from "./RateChart";
import { LevelMark } from "./TierChip";

const feePercent = (fee: number | null) => (fee === null ? "not reported" : `${(fee * 100).toFixed(2)}%`);

const rowClass = "flex items-center justify-between gap-3 border-b border-grey-line py-3 text-label";
const skeleton = "animate-pulse rounded-sm bg-grey-surface motion-reduce:animate-none";

/** Calm, Steady and Bold side by side, with live data for each. They are USDC lending vaults, never stocks or funds. */
export function Portfolios() {
  const vaults = useVaults();
  const loading = vaults.isPending;

  return (
    <div className="grid gap-4">
      {vaults.isError && (
        <motion.div variants={fade} initial="hidden" animate="visible">
          <Banner>
            <b className="font-semibold">Live rates unavailable right now.</b>{" "}
            <span className="text-grey-text">Saving and withdrawing still work. Rates show again as soon as they load.</span>
          </Banner>
        </motion.div>
      )}
      <motion.div variants={list} initial="hidden" animate="visible" className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
        {TIER_INFO.map((tier) => {
          const vault = vaults.data?.tiers[tier.key];
          // The vault itself reports when it is not working normally.
          const unwell = !!vault && vault.status.toLowerCase() !== "active";
          const hasFees = !!vault && (vault.fees.performance !== null || vault.fees.management !== null);
          return (
            <motion.section key={tier.key} variants={rise} aria-labelledby={`portfolio-${tier.key}`} className="min-w-0">
              <Card className="flex h-full flex-col gap-5.5 p-5.5 lg:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h2 id={`portfolio-${tier.key}`} className="inline-flex items-center gap-3 text-h2 font-bold tracking-[-0.01em]">
                    <LevelMark tier={tier.index} size="lg" />
                    {tier.label}
                  </h2>
                  <span className="text-caption text-grey-text">Level {tier.level} of 3</span>
                </div>

                <div className="grid gap-2">
                  {loading ? (
                    <div role="status" aria-label={`Loading the ${tier.label} rate`} className="grid gap-2">
                      <span className={`h-14 w-44 ${skeleton}`} />
                      <span className={`h-5 w-38 ${skeleton}`} />
                    </div>
                  ) : vault ? (
                    <>
                      <span className="text-balance leading-14 font-bold tracking-[-0.03em] tabular-nums">{formatApy(vault.apy)}</span>
                      <span className="flex items-center gap-2 text-label text-grey-text">
                        <LiveDot live />
                        APY today, changes daily
                      </span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true" className="text-balance leading-14 font-bold text-grey-muted">
                        <Blank />
                      </span>
                      <span className="flex items-center gap-2 text-label text-grey-text">
                        <LiveDot live={false} />
                        Live rate unavailable
                      </span>
                    </>
                  )}
                </div>

                <dl className="border-t border-grey-line">
                  <div className={rowClass}>
                    <dt className="shrink-0 text-grey-text">Run by</dt>
                    <dd className="min-w-0 text-right font-semibold [overflow-wrap:anywhere]">
                      {loading ? <span className={`block h-4 w-24 ${skeleton}`} /> : vault ? (vault.curator ?? "Not reported") : <Blank />}
                    </dd>
                  </div>
                  <div className={rowClass}>
                    <dt className="shrink-0 text-grey-text">Cash available now</dt>
                    <dd className="text-right font-semibold tabular-nums">
                      {loading ? <span className={`block h-4 w-24 ${skeleton}`} /> : vault ? formatEstimate(Number(vault.liquidity)) : <Blank />}
                    </dd>
                  </div>
                  {vault && (
                    <div className={rowClass}>
                      <dt className="shrink-0 text-grey-text">Vault</dt>
                      <dd className="min-w-0 text-right">
                        <a
                          href={explorerAddress(vault.vaultAddress)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${vault.name}, view on explorer`}
                          className="inline-flex items-center gap-1.5 font-semibold text-green underline [overflow-wrap:anywhere] hover:text-green-pressed"
                        >
                          {vault.name}
                          <ExternalIcon size={16} className="shrink-0" />
                        </a>
                      </dd>
                    </div>
                  )}
                  {hasFees && (
                    <div className={rowClass}>
                      <dt className="shrink-0 text-grey-text">Vault fees</dt>
                      <dd className="min-w-0 text-right font-semibold">
                        performance {feePercent(vault.fees.performance)} · management {feePercent(vault.fees.management)}
                      </dd>
                    </div>
                  )}
                </dl>

                <p className="text-body">{tier.risk}</p>

                {vault && (unwell || vault.warnings.length > 0) && (
                  <ul className="grid gap-2 rounded-sm bg-caution-fill px-3 py-2.5 text-label text-caution">
                    {unwell && !vault.warnings.includes("VAULT_NOT_ACTIVE") && (
                      <li className="flex gap-2">
                        <WarningIcon size={18} className="mt-px shrink-0" />
                        {warningMessage("VAULT_NOT_ACTIVE")}
                      </li>
                    )}
                    {vault.warnings.map((code) => (
                      <li key={code} className="flex gap-2">
                        <WarningIcon size={18} className="mt-px shrink-0" />
                        {warningMessage(code)}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto grid gap-5.5">
                  <RateChart tier={tier.key} />
                  <Link
                    href={`/app/new?tier=${tier.key}`}
                    className="group flex h-13 items-center justify-between rounded-full border-[1.5px] border-black bg-white pr-1.5 pl-5.5 text-body font-semibold transition-[background-color,transform] duration-150 ease-out hover:bg-grey-surface active:scale-[0.97] active:bg-mint"
                  >
                    Save in {tier.label}
                    <span className="flex size-10 items-center justify-center rounded-full bg-black text-white">
                      <ArrowRightIcon size={18} />
                    </span>
                  </Link>
                </div>
              </Card>
            </motion.section>
          );
        })}
      </motion.div>
      <p className="text-caption text-grey-text">{LENDING_NOTE}</p>
    </div>
  );
}
