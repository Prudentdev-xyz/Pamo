"use client";

import { motion, useReducedMotion } from "motion/react";

/** A slow pulse beside a rate that is live. Grey and still when the rate is the last known one. */
export function LiveDot({ live }: { live: boolean }) {
  const reduce = useReducedMotion();
  if (!live) return <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-grey-muted" />;
  // A loop is decoration, so it stops with reduced motion on.
  if (reduce) return <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-green" />;
  return (
    <motion.span
      aria-hidden="true"
      className="size-1.5 shrink-0 rounded-full bg-green"
      animate={{ opacity: [1, 0.35, 1] }}
      transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
    />
  );
}
