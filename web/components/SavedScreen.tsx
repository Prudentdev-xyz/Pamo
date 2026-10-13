"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatCount, formatUsdcNumber, usdcToNumber } from "@/lib/format";
import { duration, ease } from "@/motion/tokens";
import { CountUp } from "./CountUp";

/** The one green screen: shown once a save has confirmed. The check draws itself, then the amount counts up. */
export function SavedScreen({
  amount,
  potName,
  tierName,
  apy,
  potHref,
  dashboardHref,
}: {
  amount: bigint;
  potName: string;
  tierName: string;
  /** Today's rate as "4.20%", or null when live rates are unavailable. */
  apy: string | null;
  potHref: string | null;
  dashboardHref: string;
}) {
  const reduce = useReducedMotion();
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => first.current?.focus(), []);

  // Rendered on the body, so it covers the page whatever is animating around it.
  return createPortal(
    <motion.section
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration.base, ease }}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-green p-6 text-white lg:left-65"
    >
      <div className="grid w-full max-w-110 justify-items-center gap-4 text-center">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-22 lg:size-28">
          <circle cx="32" cy="32" r="29" />
          <motion.path
            d="M20 33l8 8 16-17"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: duration.slow, ease, delay: 0.1 }}
          />
        </svg>
        <h1 className="mt-2 text-h1 font-bold tracking-[-0.03em] lg:text-balance">Saved</h1>
        <p className="text-h1 font-bold tabular-nums">
          <CountUp value={usdcToNumber(amount)} format={formatCount} final={formatUsdcNumber(amount)} /> USDC
        </p>
        <p className="text-body">
          into {potName} · {tierName}.{apy ? ` Earning at ${apy} APY today, which changes daily.` : ""}
        </p>
        <div className="mt-4 grid w-full gap-3">
          {potHref && (
            <Link
              ref={first}
              href={potHref}
              className="flex h-13 items-center justify-center rounded-full bg-white text-body font-semibold text-black transition-[opacity,transform] duration-150 ease-out select-none hover:opacity-90 active:scale-[0.97] focus-visible:outline-white"
            >
              View pot
            </Link>
          )}
          <Link
            href={dashboardHref}
            className="flex h-11 items-center justify-center text-label font-semibold text-white underline focus-visible:outline-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </motion.section>,
    document.body,
  );
}
