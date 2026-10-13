"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { formatApy, formatCount } from "@/lib/format";
import { growth } from "@/lib/growth";
import { useVaults } from "@/lib/useVaults";
import { Blank } from "../Blank";
import { CountUp } from "../CountUp";
import { LiveDot } from "../LiveDot";

/** The live Steady rate under the hero. The line keeps its place while the rate loads and says so when it cannot. */
export function HeroRate() {
  const vaults = useVaults();
  const steady = vaults.data?.tiers.steady;
  return (
    <p className="flex min-h-5 items-center gap-2 text-label text-grey-text">
      {steady ? (
        <>
          <LiveDot live />
          <span>
            Today, Steady pays <b className="font-semibold text-black tabular-nums">{formatApy(steady.apy)} APY</b>. Changes daily.
          </span>
        </>
      ) : vaults.isPending ? null : (
        <>
          <LiveDot live={false} />
          <span>Live rates unavailable right now.</span>
        </>
      )}
    </p>
  );
}

const START = 500;
const MONTHLY = 100;
const MONTHS = 12;

/** The calculator's example on the landing page, worked out at today's Steady rate. It counts up when it scrolls into view. */
export function TeaserBalance() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const vaults = useVaults();
  const apy = vaults.data?.tiers.steady?.apy;
  const final = apy === undefined ? null : growth(START, MONTHLY, MONTHS, apy).final;

  return (
    <div ref={ref} className="grid gap-5">
      <p className="text-label text-grey-text">
        {formatCount(START)} USDC to start, {formatCount(MONTHLY)} USDC a month, {MONTHS} months in Steady
        {apy !== undefined && <> at {formatApy(apy)} APY today</>}
      </p>
      <p className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-display font-bold tracking-[-0.03em] tabular-nums lg:text-balance">
          {final === null ? (
            <span className="text-grey-muted">
              <Blank />
            </span>
          ) : inView ? (
            <CountUp value={final} format={formatCount} final={formatCount(final)} />
          ) : (
            // Holds the number's place until it is seen.
            <span className="invisible">{formatCount(final)}</span>
          )}
        </span>
        <span className="text-h3 font-semibold text-grey-text">USDC</span>
      </p>
      <p className="text-label text-grey-text">
        {final === null && !vaults.isPending ? "Live rates unavailable right now. " : ""}Estimate at today's rate. Not a promise.
      </p>
    </div>
  );
}

const whole = (n: number) => Math.round(n).toString();

/** A card's big figure. It counts to its value when the card scrolls into view. */
export function CardFigure({ value, from }: { value: number; from: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <span ref={ref} aria-hidden="true" className="text-hero font-bold tracking-[-0.05em] text-green-bright tabular-nums">
      {inView ? <CountUp value={value} format={whole} final={whole(value)} from={from} /> : <span className="invisible">{whole(value)}</span>}
    </span>
  );
}
