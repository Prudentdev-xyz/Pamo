"use client";

import { motion } from "motion/react";
import { Banner } from "@/components/Banner";
import { ButtonLink } from "@/components/Button";
import { CountUp } from "@/components/CountUp";
import { DashboardStats } from "@/components/DashboardStats";
import { ArrowCircleIcon } from "@/components/Icon";
import { LiveDot } from "@/components/LiveDot";
import { MonthlyChart } from "@/components/MonthlyChart";
import { PotCard } from "@/components/PotCard";
import { RecentActivity } from "@/components/RecentActivity";
import { LevelMark } from "@/components/TierChip";
import { fallbackPotName, KIND_GOAL, TIER_KEYS, TIERS } from "@/lib/contract";
import { formatApy, formatDate } from "@/lib/format";
import { useOwnerActivity, usePotInfo } from "@/lib/usePotInfo";
import { usePots } from "@/lib/usePots";
import { useVaults } from "@/lib/useVaults";
import { list, rise } from "@/motion/variants";

const RECENT = 5;

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const vaults = useVaults();
  const info = usePotInfo();
  const activity = useOwnerActivity();
  const pots = usePots();
  const now = new Date();

  if (pots.isPending) return <DashboardLoading />;
  if (pots.isError) {
    return (
      <Banner tone="error">
        Could not read your savings.{" "}
        <button type="button" onClick={() => pots.refetch()} className="font-semibold underline underline-offset-[3px]">
          Try again
        </button>
      </Banner>
    );
  }

  const totalSaved = pots.data.reduce((sum, p) => sum + p.value, 0n);
  const totalPutIn = pots.data.reduce((sum, p) => sum + p.pot.principal, 0n);
  // A fresh deposit is worth a micro-USDC less than what was put in, so earned never shows below zero.
  const earned = totalSaved > totalPutIn ? totalSaved - totalPutIn : 0n;
  const goals = pots.data.filter((p) => p.pot.kind === KIND_GOAL).length;
  const anytime = pots.data.length - goals;
  const hasPots = pots.data.length > 0;

  const potName = (potId: string) => {
    const name = info.byId.get(potId)?.name;
    if (name) return name;
    const view = pots.data.find((p) => p.id.toString() === potId);
    return view ? fallbackPotName(view.pot.kind, view.id) : `Pot #${potId}`;
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:gap-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="grid gap-0.5 lg:flex lg:items-baseline lg:gap-4">
          <h1 className="text-h2 font-bold tracking-[-0.02em] lg:text-h1">{greeting(now.getHours())}</h1>
          <p className="text-label text-grey-text lg:text-body">
            {now.toLocaleDateString("en-US", { weekday: "short" })}, {formatDate(now)}
          </p>
        </div>
        {hasPots && (
          <div className="hidden gap-3 lg:flex">
            <NewPotActions />
          </div>
        )}
      </div>

      {hasPots ? (
        <>
          <DashboardStats totalSaved={totalSaved} earned={earned} goals={goals} anytime={anytime} />
          <div className="grid gap-2.5 lg:hidden">
            <NewPotActions size="lg" />
          </div>
        </>
      ) : (
        <motion.div
          variants={rise}
          initial="hidden"
          animate="visible"
          className="grid justify-items-center gap-3 rounded-card border border-dashed border-grey-line px-5 py-9 text-center lg:py-18"
        >
          <h2 className="text-h2 font-bold tracking-[-0.02em] lg:text-h1">Nothing saved yet.</h2>
          <p className="text-body text-grey-text">Start with any amount.</p>
          <div className="mt-3 grid w-full gap-2.5 lg:flex lg:w-auto lg:gap-3">
            <NewPotActions size="lg" />
          </div>
        </motion.div>
      )}

      <section className="grid grid-cols-[minmax(0,1fr)] gap-2.5 lg:gap-3.5">
        <h2 className="text-body font-bold lg:text-h3">Today’s rates</h2>
        <ul className="-mx-4 flex [scrollbar-width:none] gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0">
          {TIERS.map((tier, i) => {
            const vault = vaults.data?.tiers[TIER_KEYS[i]!];
            // After a failed refresh the last rate stays on screen, in grey, so a stale number never looks live.
            const live = !!vault && !vaults.isError;
            return (
              <li
                key={tier}
                className="relative grid min-w-40 shrink-0 gap-1.5 rounded-card border border-grey-line p-3.5 lg:min-w-0 lg:p-4 xl:flex xl:items-center xl:justify-between xl:gap-3 xl:px-5"
              >
                <span className="inline-flex items-center gap-2 text-label font-bold lg:gap-2.5 lg:text-body">
                  <LevelMark tier={i} />
                  {tier}
                </span>
                <span className="grid gap-1 xl:justify-items-end xl:gap-0.5">
                  <span className={`text-h2 font-bold tabular-nums ${live ? "text-black" : "text-grey-text"}`}>
                    {!vault ? (
                      vaults.isPending ? (
                        <span className="inline-block h-6 w-16 animate-pulse rounded-sm bg-grey-surface align-middle" />
                      ) : (
                        <span className="text-body">Unavailable</span>
                      )
                    ) : live ? (
                      <CountUp value={vault.apy * 100} format={(n) => `${n.toFixed(2)}%`} final={formatApy(vault.apy)} />
                    ) : (
                      formatApy(vault.apy)
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-caption text-grey-text">
                    <LiveDot live={live} />
                    {live ? "APY today, changes daily" : vault ? "Last known, not live" : "Rate not available"}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {hasPots && (
        <>
          <section className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:gap-3.5">
            <h2 className="text-body font-bold lg:text-h3">Your pots</h2>
            <motion.ul variants={list} initial="hidden" animate="visible" className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3">
              {pots.data.map((view) => (
                <motion.li key={view.id.toString()} variants={rise} className="min-w-0">
                  <PotCard {...view} name={info.byId.get(view.id.toString())?.name} />
                </motion.li>
              ))}
            </motion.ul>
          </section>

          {activity.data ? (
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-2 xl:gap-4">
              <MonthlyChart activity={activity.data} />
              <RecentActivity activity={activity.data.slice(0, RECENT)} potName={potName} />
            </div>
          ) : (
            activity.isError && (
              <p role="status" className="text-label text-grey-text">
                Your history is unavailable right now. Your savings are not affected.
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}

/** The two ways to start a pot. The Anytime Vault is the screen's one green button. */
function NewPotActions({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <>
      <ButtonLink href="/app/new?kind=anytime" size={size} className="lg:order-2">
        New Anytime Vault
      </ButtonLink>
      <ButtonLink href="/app/new?kind=goal" size={size} variant="outline">
        New Goal
        <ArrowCircleIcon />
      </ButtonLink>
    </>
  );
}

function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading your savings" className="grid animate-pulse gap-5 lg:gap-7">
      <div className="h-10 w-56 rounded-sm bg-grey-surface" />
      <div className="h-32 rounded-card bg-grey-surface" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-44 rounded-card bg-grey-surface" />
        <div className="h-44 rounded-card bg-grey-surface" />
      </div>
    </div>
  );
}
