"use client";

import type { TierKey } from "@/lib/api";
import { formatApy } from "@/lib/format";
import { useRateHistory } from "@/lib/useRateHistory";

const WIDTH = 300;
const HEIGHT = 56;

/** A portfolio's rate over the last week, as one quiet line. It shows the rate, never earnings. */
export function RateChart({ tier, label = "Rate, last 7 days" }: { tier: TierKey; label?: string }) {
  const history = useRateHistory(tier);
  const points = history.data ?? [];
  const ready = points.length >= 2;

  const rates = points.map((point) => point.apy);
  const low = Math.min(...rates);
  const high = Math.max(...rates);
  const times = points.map((point) => new Date(point.at).getTime());
  const first = times[0] ?? 0;
  const span = (times[times.length - 1] ?? 0) - first || 1;
  // A rate that never moved draws as a level line through the middle.
  const y = (apy: number) => (high === low ? HEIGHT / 2 : 48 - ((apy - low) / (high - low)) * 42);
  const path = points
    .map((point, i) => `${i ? "L" : "M"}${(((times[i]! - first) / span) * WIDTH).toFixed(1)} ${y(point.apy).toFixed(1)}`)
    .join(" ");
  const range = high === low ? formatApy(low) : `${formatApy(low)} to ${formatApy(high)}`;

  return (
    <div className="grid gap-2">
      <p className="flex justify-between gap-3 text-caption text-grey-text">
        <span>{label}</span>
        {ready && <span className="tabular-nums">{range}</span>}
      </p>
      {history.isPending ? (
        <div role="status" aria-label="Loading rate history" className="h-14 animate-pulse rounded-sm bg-grey-surface motion-reduce:animate-none" />
      ) : ready ? (
        <svg
          role="img"
          aria-label={high === low ? `The rate stayed at ${range} over the last 7 days` : `The rate moved from ${range} over the last 7 days`}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="block h-14 w-full"
        >
          <path d={`M0 52H${WIDTH}`} className="stroke-grey-line" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path
            d={path}
            fill="none"
            className="stroke-black"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <p className="flex h-14 items-center justify-center rounded-sm bg-grey-surface px-3 text-center text-caption text-grey-text">
          {history.isError ? "Rate history unavailable" : "Rate history is still building up"}
        </p>
      )}
    </div>
  );
}
