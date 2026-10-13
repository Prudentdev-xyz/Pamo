"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { formatCount, formatUsdc, formatUsdcNumber, usdcToNumber } from "@/lib/format";
import { duration, ease } from "@/motion/tokens";
import { CountUp } from "./CountUp";

const primaryClass =
  "flex h-13 w-full items-center justify-center rounded-full bg-white text-body font-semibold text-black transition-[opacity,transform] duration-150 ease-out select-none hover:opacity-90 active:scale-[0.97] focus-visible:outline-white";

/**
 * The one green screen: shown once a save or a withdrawal has confirmed.
 * The check draws itself, then the amount counts up.
 */
export function SavedScreen({
  title = "Saved",
  amount,
  line,
  holds,
  viewPot,
  dashboardHref,
}: {
  /** "Saved" or "Withdrawn". */
  title?: string;
  amount: bigint;
  /** One sentence under the amount: where the money went. */
  line: ReactNode;
  /** What the pot is worth now, when that is known. */
  holds?: { potName: string; value: bigint } | null;
  /** "View pot": a link to the pot, or a way back to it when it is already on this page. */
  viewPot: string | (() => void) | null;
  dashboardHref: string;
}) {
  const reduce = useReducedMotion();
  const first = useRef<HTMLElement>(null);
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
        <h1 className="mt-2 text-h1 font-bold tracking-[-0.03em] lg:text-balance">{title}</h1>
        <p className="text-h1 font-bold tabular-nums">
          <CountUp value={usdcToNumber(amount)} format={formatCount} final={formatUsdcNumber(amount)} /> USDC
        </p>
        <p className="text-body">{line}</p>
        {holds && (
          <p className="grid gap-0.5 rounded-card border border-white/40 px-5.5 py-3.5">
            <span className="text-caption">{holds.potName} now holds</span>
            <b className="text-h2 font-bold tabular-nums">{formatUsdc(holds.value)}</b>
          </p>
        )}
        <div className="mt-4 grid w-full gap-3">
          {typeof viewPot === "string" ? (
            <Link ref={first as React.RefObject<HTMLAnchorElement>} href={viewPot} className={primaryClass}>
              View pot
            </Link>
          ) : (
            viewPot && (
              <button ref={first as React.RefObject<HTMLButtonElement>} type="button" onClick={viewPot} className={primaryClass}>
                View pot
              </button>
            )
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
