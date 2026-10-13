"use client";

import { motion } from "motion/react";
import { explorerTx } from "@/lib/chain";
import { formatDateTime, formatUsdc } from "@/lib/format";
import { useActivity } from "@/lib/usePotInfo";
import { list, rise } from "@/motion/variants";
import { Banner } from "./Banner";
import { SavedIcon, WithdrewIcon } from "./Icon";

/** A pot's deposits and withdrawals, read from contract events by the indexer. */
export function ActivityList({ potId }: { potId: bigint }) {
  const activity = useActivity(potId);
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-1">
      <h2 className="pb-1.5 text-h3 font-bold tracking-[-0.01em]">Activity</h2>
      {activity.isPending ? (
        <div role="status" aria-label="Loading activity" className="grid animate-pulse gap-2">
          <div className="h-14 rounded-sm bg-grey-surface" />
          <div className="h-14 rounded-sm bg-grey-surface" />
        </div>
      ) : activity.isError ? (
        <Banner tone="error">
          <b className="block font-semibold">Activity can’t load right now.</b>
          The figures above are read straight from the chain, so they are up to date. Saving and withdrawing still work.{" "}
          <button type="button" onClick={() => activity.refetch()} className="mt-1 block font-semibold underline underline-offset-[3px]">
            Try again
          </button>
        </Banner>
      ) : activity.data.length === 0 ? (
        <p className="text-label text-grey-text">Nothing here yet. New activity shows up within a few seconds.</p>
      ) : (
        <motion.ul variants={list} initial="hidden" animate="visible">
          {activity.data.map((item) => {
            const saved = item.type === "deposit";
            return (
              <motion.li
                key={`${item.txHash}-${item.block}-${item.type}-${item.assets}`}
                variants={rise}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-grey-line py-3"
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-grey-line">
                  {saved ? <SavedIcon size={18} /> : <WithdrewIcon size={18} />}
                </span>
                <span className="grid gap-px">
                  <b className="text-label font-semibold">{saved ? "Saved" : "Withdrew"}</b>
                  <span className="text-caption text-grey-text">{formatDateTime(item.at)}</span>
                </span>
                <span className="grid justify-items-end gap-px">
                  <b className="text-label font-semibold tabular-nums">
                    {saved ? "+" : "−"}
                    {formatUsdc(BigInt(item.assets))}
                  </b>
                  <a
                    href={explorerTx(item.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-caption font-semibold text-green underline hover:text-green-pressed"
                  >
                    View on explorer
                  </a>
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </section>
  );
}
