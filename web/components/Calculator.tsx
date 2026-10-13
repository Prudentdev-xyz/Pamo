"use client";

import { useMemo, useState } from "react";
import { formatApy, formatCount } from "@/lib/format";
import { growth } from "@/lib/growth";
import { TIER_INFO } from "@/lib/tiers";
import { useDebounced } from "@/lib/useDebounced";
import { useVaults } from "@/lib/useVaults";
import { Banner } from "./Banner";
import { ButtonLink } from "./Button";
import { Card } from "./Card";
import { CountUp } from "./CountUp";
import { Field } from "./Field";
import { GrowthCurve } from "./GrowthCurve";
import { LiveDot } from "./LiveDot";
import { LevelMark } from "./TierChip";

const MAX_MONTHS = 60;
const AMOUNT_HINT = "Use numbers only, with up to 6 decimals.";

/** Zero for an empty field, null for anything that is not a plain amount. */
function parseAmount(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return /^\d+(\.\d{1,6})?$/.test(trimmed) ? Number(trimmed) : null;
}

// An amount is never cut short, so a long one steps down a size to stay on one line.
function balanceSize(length: number) {
  if (length <= 10) return "text-display lg:text-balance";
  if (length <= 13) return "text-h1 lg:text-display";
  return "text-h2 lg:text-h1";
}

const monthsText = (months: number) => `${months} ${months === 1 ? "month" : "months"}`;

/** What savings could grow to at today's live rate. Pure maths in the browser: no wallet needed. */
export function Calculator() {
  const vaults = useVaults();
  const [startText, setStartText] = useState("100");
  const [monthlyText, setMonthlyText] = useState("50");
  const [months, setMonths] = useState(12);
  const [tier, setTier] = useState(0);

  const start = parseAmount(startText);
  const monthly = parseAmount(monthlyText);
  const info = TIER_INFO[tier]!;
  const apy = vaults.data?.tiers[info.key]?.apy ?? null;
  const result = useMemo(
    () => (start !== null && monthly !== null && apy !== null ? growth(start, monthly, months, apy) : null),
    [start, monthly, months, apy],
  );
  // The figures wait for the inputs to settle, then count to the new value. The curve follows at once.
  const settled = useDebounced(result, 250);
  const figures = result ? (settled ?? result) : null;

  const balance = result ? [start!, ...result.points] : [];
  const putIn = result ? balance.map((_, i) => start! + monthly! * i) : [];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,27.5rem)_minmax(0,1fr)]">
      <Card className="grid gap-6 p-5.5 lg:p-7">
        <Field
          label="Starting amount"
          suffix="USDC"
          value={startText}
          onChange={(e) => setStartText(e.target.value)}
          inputMode="decimal"
          autoComplete="off"
          maxLength={16}
          placeholder="0.00"
          invalid={start === null}
          hint={start === null ? AMOUNT_HINT : undefined}
          className="text-h3 font-semibold tabular-nums"
        />
        <Field
          label="Monthly top-up"
          suffix="USDC"
          value={monthlyText}
          onChange={(e) => setMonthlyText(e.target.value)}
          inputMode="decimal"
          autoComplete="off"
          maxLength={16}
          placeholder="0.00"
          invalid={monthly === null}
          hint={monthly === null ? AMOUNT_HINT : undefined}
          className="text-h3 font-semibold tabular-nums"
        />

        <div className="grid gap-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="calculator-months" className="text-label font-semibold">
              Months
            </label>
            <span aria-hidden="true" className="text-h3 font-semibold tabular-nums">
              {monthsText(months)}
            </span>
          </div>
          <input
            id="calculator-months"
            type="range"
            min={1}
            max={MAX_MONTHS}
            step={1}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            aria-valuetext={monthsText(months)}
            className="-my-2 h-11 w-full cursor-pointer accent-green"
          />
          <div aria-hidden="true" className="flex justify-between text-caption text-grey-text tabular-nums">
            <span>1</span>
            <span>20</span>
            <span>40</span>
            <span>{MAX_MONTHS}</span>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2.5 text-label font-semibold">Portfolio</legend>
          <div className="grid grid-cols-3 gap-2">
            {TIER_INFO.map((t) => {
              const rate = vaults.data?.tiers[t.key]?.apy;
              const selected = tier === t.index;
              return (
                <label
                  key={t.key}
                  className={`grid min-h-19 min-w-0 cursor-pointer content-start gap-1.5 rounded-card border p-2 min-[360px]:p-3 transition-[background-color,border-color] duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-green ${
                    selected ? "border-black bg-mint" : "border-grey-line bg-white hover:bg-grey-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="calculator-tier"
                    checked={selected}
                    onChange={() => setTier(t.index)}
                    className="sr-only"
                  />
                  <span className="inline-flex items-center gap-1.5 text-label font-bold min-[360px]:gap-2">
                    <LevelMark tier={t.index} size="sm" />
                    {t.label}
                  </span>
                  <span className="text-caption text-grey-text tabular-nums">
                    {rate !== undefined ? `${formatApy(rate)} APY` : vaults.isPending ? "Loading…" : "Rate unavailable"}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2.5 flex items-center gap-2 text-caption text-grey-text">
            <LiveDot live={apy !== null} />
            {apy !== null
              ? `${info.label} at ${formatApy(apy)} APY today, changes daily`
              : vaults.isPending
                ? "Loading today's rates…"
                : "Live rate unavailable"}
          </p>
        </fieldset>
      </Card>

      <Card className="grid min-w-0 gap-6 p-5.5 lg:p-7">
        <div className="grid gap-2.5">
          <span className="text-label text-grey-text">Projected balance in {monthsText(months)}</span>
          {figures ? (
            <>
              <p aria-live="polite" className="flex flex-wrap items-baseline gap-x-3">
                <span className={`font-bold tracking-[-0.03em] tabular-nums ${balanceSize(formatCount(figures.final).length)}`}>
                  <CountUp value={figures.final} format={formatCount} final={formatCount(figures.final)} from={figures.final} />
                </span>
                <span className="text-h3 font-semibold text-grey-text">USDC</span>
              </p>
              <dl className="flex flex-wrap gap-x-10 gap-y-3 pt-1.5">
                <div className="grid gap-0.5">
                  <dt className="text-caption text-grey-text">Total put in</dt>
                  <dd className="text-h3 font-semibold tabular-nums">
                    <CountUp value={figures.putIn} format={formatCount} final={formatCount(figures.putIn)} from={figures.putIn} /> USDC
                  </dd>
                </div>
                <div className="grid gap-0.5">
                  <dt className="text-caption text-grey-text">Estimated interest</dt>
                  <dd className="text-h3 font-semibold text-green tabular-nums">
                    +<CountUp value={figures.interest} format={formatCount} final={formatCount(figures.interest)} from={figures.interest} /> USDC
                  </dd>
                </div>
              </dl>
            </>
          ) : vaults.isPending ? (
            <div role="status" aria-label="Loading today's rates" className="grid gap-4">
              <span className="h-12 w-56 max-w-full animate-pulse rounded-sm bg-grey-surface motion-reduce:animate-none lg:h-14" />
              <span className="h-12 w-64 max-w-full animate-pulse rounded-sm bg-grey-surface motion-reduce:animate-none" />
            </div>
          ) : (
            <p aria-hidden="true" className="text-display font-bold text-grey-muted lg:text-balance">
              —
            </p>
          )}
        </div>

        {result ? (
          <div className="grid gap-2">
            <GrowthCurve balance={balance} putIn={putIn} />
            <div className="flex items-center justify-between gap-2 text-caption whitespace-nowrap text-grey-text">
              <span>Today</span>
              <span aria-hidden="true" className="flex gap-2.5 min-[360px]:gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3.5 bg-black" />
                  Balance
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 border-t-[1.5px] border-dashed border-grey-text-dark" />
                  Put in
                </span>
              </span>
              <span className="tabular-nums">Month {months}</span>
            </div>
          </div>
        ) : vaults.isPending ? (
          <div className="h-40 animate-pulse rounded-sm bg-grey-surface motion-reduce:animate-none lg:h-55" />
        ) : apy === null ? (
          <Banner>
            <b className="font-semibold">Live rates unavailable right now.</b>{" "}
            <span className="text-grey-text">There is nothing to estimate from until they load. Saving and withdrawing still work.</span>
          </Banner>
        ) : (
          <Banner>Enter the amounts in USDC to see the estimate.</Banner>
        )}

        <p className="border-t border-grey-line pt-4 text-label text-grey-text">Estimate at today's rate. Not a promise.</p>
        <ButtonLink href={`/app/new?tier=${info.key}`} size="lg" className="w-full justify-self-start lg:w-auto">
          Start this pot
        </ButtonLink>
      </Card>
    </div>
  );
}
