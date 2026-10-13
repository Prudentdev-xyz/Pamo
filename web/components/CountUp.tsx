"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { countUp } from "@/motion/countUp";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A number that counts up from zero on first load and from the old value after a change.
 * `final` is the exact text it ends on, and what screen readers get from the start.
 */
export function CountUp({ value, format, final }: { value: number; format: (n: number) => string; final: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    const stop = countUp(ref.current, { from: previous.current, to: value, format, final });
    previous.current = value;
    return stop;
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
