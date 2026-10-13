import type { ActivityItem } from "@/lib/api";
import { explorerTx } from "@/lib/chain";
import { formatDate, formatUsdc } from "@/lib/format";
import { SavedIcon, WithdrewIcon } from "./Icon";

/** The latest saves and withdrawals across every pot. Each row opens its transaction on the explorer. */
export function RecentActivity({ activity, potName }: { activity: ActivityItem[]; potName: (potId: string) => string }) {
  return (
    <section className="lg:rounded-card lg:border lg:border-grey-line lg:px-6 lg:pt-5 lg:pb-2">
      <h2 className="pb-2 text-body font-bold">Recent activity</h2>
      {activity.length === 0 ? (
        <p className="pb-4 text-label text-grey-text">No activity yet. Your saves and withdrawals will show here.</p>
      ) : (
        <ul>
          {activity.map((item) => {
            const saved = item.type === "deposit";
            return (
              <li key={`${item.txHash}-${item.potId}-${item.type}`} className="border-t border-grey-line first:border-t-0 lg:first:border-t">
                <a
                  href={explorerTx(item.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${saved ? "Saved" : "Withdrew"} ${formatUsdc(BigInt(item.assets))}, ${potName(item.potId)}, ${formatDate(item.at)}. View on explorer`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-sm px-2 py-3 text-black transition-[background-color] duration-150 ease-out hover:bg-grey-surface"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-grey-line">
                      {saved ? <SavedIcon size={16} /> : <WithdrewIcon size={16} />}
                    </span>
                    <span className="grid min-w-0 gap-0.5">
                      <b className="text-label font-semibold">{saved ? "Saved" : "Withdrew"}</b>
                      <span className="truncate text-caption text-grey-text">{potName(item.potId)}</span>
                    </span>
                  </span>
                  <span className="grid shrink-0 gap-0.5 text-right">
                    <b className="text-label font-semibold tabular-nums">
                      {saved ? "+" : "−"}
                      {formatUsdc(BigInt(item.assets))}
                    </b>
                    <span className="text-caption text-grey-text">{formatDate(item.at)}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
