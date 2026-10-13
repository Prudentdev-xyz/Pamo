"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { countUp } from "@/motion/countUp";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A number that counts up from zero on first load and from the old value after a change.
 * `final` is the exact text it ends on, and what screen readers get from the start.
 */
export function CountUp({
  value,
  format,
  final,
  from = 0,
}: {
  value: number;
  format: (n: number) => string;
  final: string;
  /** Where the first count starts: the last value the user saw, when the screen was away for a while. */
  from?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // The count in progress. It is keyed on its target, so running the effect twice for the same value
  // (as React does in development) starts from the same place and never skips the count.
  const run = useRef<{ from: number; to: number } | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    if (!run.current || run.current.to !== value) run.current = { from: run.current ? run.current.to : from, to: value };
    return countUp(ref.current, { from: run.current.from, to: value, format, final });
    // `format` is left out: it is a new function on every render and never changes what the value is.
  }, [value, final]);

  return (
    <>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
    </>
  );
}
