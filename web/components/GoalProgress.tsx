"use client";

import { motion } from "motion/react";
import { formatDate, formatUsdc } from "@/lib/format";
import { duration, ease } from "@/motion/tokens";

/** How far a goal pot is toward its target, and when it unlocks. */
export function GoalProgress({
  value,
  target,
  unlockAt,
  unlocked,
  compact = false,
}: {
  value: bigint;
  target: bigint;
  /** Unix seconds. */
  unlockAt: bigint;
  unlocked: boolean;
  /** The one-line version for dashboard cards. */
  compact?: boolean;
}) {
  const percent = target > 0n ? Math.min(100, Number((value * 10000n) / target) / 100) : 0;
  const date = formatDate(Number(unlockAt) * 1000);
  return (
    <div className="grid gap-2">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label="Progress toward the goal"
        className="h-1.5 w-full overflow-hidden rounded-full bg-grey-line"
      >
        {/* The fill is full width and slides in from the left, so only transform animates. */}
        <motion.div
          // At 0% the fill is hidden outright, so no sliver of green shows at the edge.
          className={`h-full w-full rounded-full bg-green ${percent === 0 ? "invisible" : ""}`}
          initial={{ x: "-100%" }}
          animate={{ x: `${percent - 100}%` }}
          transition={{ duration: duration.slow, ease, delay: duration.base }}
        />
      </div>
      <p className="text-caption text-grey-text tabular-nums">
        {compact ? (
          <>
            {percent.toFixed(0)}% of goal · {unlocked ? "unlocked" : `unlocks ${date}`}
          </>
        ) : (
          <>
            {formatUsdc(value)} of {formatUsdc(target)} ({percent.toFixed(0)}%) ·{" "}
            {unlocked ? "unlocked" : `unlocks when you reach ${formatUsdc(target)} or on ${date}`}
          </>
        )}
      </p>
    </div>
  );
}
