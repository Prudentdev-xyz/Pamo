"use client";

import { motion } from "motion/react";
import { formatDate, formatUsdc } from "@/lib/format";
import { duration, ease, spring } from "@/motion/tokens";
import { LockIcon, UnlockIcon } from "./Icon";

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

  const bar = (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label="Progress toward the goal"
      className={`w-full overflow-hidden rounded-full bg-grey-line ${compact ? "h-1.5" : "h-2"}`}
    >
      {/* The fill is full width and slides in from the left, so only transform animates. */}
      <motion.div
        // At 0% the fill is hidden outright, so no sliver of green shows at the edge.
        className={`h-full w-full rounded-full bg-green ${percent === 0 ? "invisible" : ""}`}
        initial={{ x: "-100%" }}
        animate={{ x: `${percent - 100}%` }}
        // On the pot's own page the bar springs to its new width after a save or a withdrawal.
        transition={compact ? { duration: duration.slow, ease, delay: duration.base } : spring}
      />
    </div>
  );

  if (compact) {
    return (
      <div className="grid gap-2">
        {bar}
        <p className="text-caption text-grey-text tabular-nums">
          {percent.toFixed(0)}% of goal · {unlocked ? "unlocked" : `unlocks ${date}`}
        </p>
      </div>
    );
  }

  const Glyph = unlocked ? UnlockIcon : LockIcon;
  return (
    <div className="grid gap-2.5">
      <p className="flex flex-wrap justify-between gap-x-3 text-label">
        <b className="font-semibold">{Math.floor(percent)}% of goal</b>
        <span className="text-grey-text tabular-nums">
          {formatUsdc(value)} of {formatUsdc(target)}
        </span>
      </p>
      {bar}
      <p className="flex items-start gap-2 text-label text-grey-text">
        <Glyph size={16} className="mt-0.5 shrink-0" />
        {!unlocked
          ? `Unlocks when you reach ${formatUsdc(target)} or on ${date}`
          : value >= target
            ? "Target reached. This pot is unlocked."
            : "This pot is unlocked."}
      </p>
    </div>
  );
}
