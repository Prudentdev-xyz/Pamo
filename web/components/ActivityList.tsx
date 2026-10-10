"use client";

import { explorerTx } from "@/lib/chain";
import { formatDateTime, formatUsdc } from "@/lib/format";
import { useActivity } from "@/lib/usePotInfo";

/** A pot's deposits and withdrawals, read from contract events by the indexer. */
export function ActivityList({ potId }: { potId: bigint }) {
  const activity = useActivity(potId);
  return (
    <section className="space-y-2 border-t border-black pt-4">
      <h2 className="font-semibold">Activity</h2>
      {activity.isPending ? (
        <p className="text-sm">Loading…</p>
      ) : activity.isError ? (
        <p className="text-sm">History is unavailable right now. Your savings are not affected.</p>
      ) : activity.data.length === 0 ? (
        <p className="text-sm">Nothing here yet. New activity shows up within a few seconds.</p>
      ) : (
        <ul className="divide-y divide-black/20">
          {activity.data.map((item) => (
            <li key={`${item.txHash}-${item.block}-${item.type}-${item.assets}`} className="flex items-baseline justify-between gap-3 py-2">
              <span>
                <span className="font-semibold">{item.type === "deposit" ? "Added" : "Withdrew"}</span>{" "}
                <span className="text-sm">{formatDateTime(item.at)}</span>
              </span>
              <span className="text-right tabular-nums">
                {item.type === "deposit" ? "+" : "−"}
                {formatUsdc(BigInt(item.assets))}{" "}
                <a href={explorerTx(item.txHash)} target="_blank" rel="noreferrer" className="text-sm underline">
                  View
                </a>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
