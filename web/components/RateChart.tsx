"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TierKey } from "@/lib/api";
import { formatApy, formatDateTime } from "@/lib/format";
import { useRateHistory } from "@/lib/useRateHistory";

/** A tier's rate over the last week. History builds up from the day the indexer starts. */
export function RateChart({ tier }: { tier: TierKey }) {
  const history = useRateHistory(tier);

  if (history.isPending) return <p className="text-sm">Loading rate history…</p>;
  if (history.isError) return <p className="text-sm">Rate history is unavailable right now.</p>;
  if (history.data.length < 2) return <p className="text-sm">Rate history is still building up. Check back later.</p>;

  const points = history.data.map((point) => ({ at: new Date(point.at).getTime(), apy: point.apy }));
  return (
    <div className="h-28" aria-label="APY over the last 7 days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="at" type="number" domain={["dataMin", "dataMax"]} hide />
          <YAxis domain={["auto", "auto"]} tickFormatter={formatApy} width={56} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(apy) => [formatApy(Number(apy)), "APY"]} labelFormatter={(at) => formatDateTime(Number(at))} />
          <Line type="monotone" dataKey="apy" stroke="#0A0A0A" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
