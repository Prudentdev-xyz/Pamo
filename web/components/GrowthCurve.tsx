"use client";

import { motion, useReducedMotion } from "motion/react";
import { formatEstimate } from "@/lib/format";
import { duration, ease } from "@/motion/tokens";

const WIDTH = 600;
const HEIGHT = 220;
const BASE = 216;

/**
 * The projected balance month by month, over the dashed line of what was put in.
 * The balance draws in from the left once, on first view. After that it follows the inputs at once.
 */
export function GrowthCurve({ balance, putIn }: { balance: number[]; putIn: number[] }) {
  const reduce = useReducedMotion();
  const months = balance.length - 1;
  const top = Math.max(balance[months] ?? 0, 1);
  const x = (i: number) => (months ? (i / months) * WIDTH : 0).toFixed(1);
  const y = (value: number) => (BASE - (value / top) * 200).toFixed(1);
  const line = (values: number[]) => values.map((value, i) => `${i ? "L" : "M"}${x(i)} ${y(value)}`).join(" ");
  const putLine = line(putIn);
  const frame = { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, preserveAspectRatio: "none" as const };

  return (
    <div
      role="img"
      aria-label={`Projected balance by month: from ${formatEstimate(balance[0] ?? 0)} today to ${formatEstimate(balance[months] ?? 0)} in month ${months}`}
      className="relative h-40 lg:h-55"
    >
      <motion.svg
        {...frame}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.slow, ease }}
        className="absolute inset-0 size-full overflow-visible"
      >
        <path d={`M0 4H${WIDTH}M0 110H${WIDTH}M0 ${BASE}H${WIDTH}`} className="stroke-grey-line" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={`${putLine} L${WIDTH} ${BASE} L0 ${BASE} Z`} className="fill-grey-surface" />
        <path d={putLine} fill="none" className="stroke-grey-text-dark" strokeWidth="1.25" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      </motion.svg>
      {/* With reduced motion on the line fades in instead of drawing. */}
      <motion.svg
        {...frame}
        aria-hidden="true"
        initial={reduce ? { opacity: 0 } : { clipPath: "inset(-8px 100% -8px -8px)" }}
        animate={reduce ? { opacity: 1 } : { clipPath: "inset(-8px -8px -8px -8px)" }}
        transition={{ duration: duration.slow, ease }}
        className="absolute inset-0 size-full overflow-visible"
      >
        <path
          d={line(balance)}
          fill="none"
          className="stroke-black"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
    </div>
  );
}
