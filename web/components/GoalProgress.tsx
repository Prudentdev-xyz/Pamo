import { formatDate, formatUsdc } from "@/lib/format";

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
    <div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label="Progress toward the goal"
        className="h-2 w-full rounded border border-black"
      >
        <div className="h-full bg-black" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-sm tabular-nums">
        {formatUsdc(value)} of {formatUsdc(target)} ({percent.toFixed(0)}%) ·{" "}
        {unlocked ? "unlocked" : compact ? `unlocks ${date}` : `unlocks when you reach ${formatUsdc(target)} or on ${date}`}
      </p>
    </div>
  );
}
