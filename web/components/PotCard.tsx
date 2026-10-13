import Link from "next/link";
import { fallbackPotName, KIND_GOAL } from "@/lib/contract";
import { formatUsdc, formatUsdcNumber } from "@/lib/format";
import { GoalProgress } from "./GoalProgress";
import { KindBadge } from "./KindBadge";
import { TierChip } from "./TierChip";

export interface PotCardData {
  id: bigint;
  pot: { kind: number; tier: number; principal: bigint; target: bigint; unlockAt: bigint };
  value: bigint;
  unlocked: boolean;
}

/** One pot on the dashboard. `name` comes from the indexer and is missing while the backend is down. */
export function PotCard({ id, pot, value, unlocked, name }: PotCardData & { name?: string | null }) {
  const earned = value > pot.principal ? value - pot.principal : 0n;
  const isGoal = pot.kind === KIND_GOAL;
  const title = name || fallbackPotName(pot.kind, id);
  return (
    <Link
      href={`/app/pot/${id}`}
      className="grid h-full grid-cols-[minmax(0,1fr)] content-start gap-4 rounded-card border border-grey-line bg-white p-5 transition-[border-color] duration-150 ease-out hover:border-black"
    >
      <div className="flex items-center justify-between gap-2">
        <span title={title} className="min-w-0 truncate text-body font-bold">
          {title}
        </span>
        <KindBadge kind={pot.kind} />
      </div>
      <div className="grid min-w-0 gap-0.5">
        <span className="text-h2 font-bold tabular-nums">
          {formatUsdcNumber(value)} <span className="text-label font-normal text-grey-text">USDC</span>
        </span>
        <span className="text-label text-grey-text tabular-nums">
          {isGoal ? `of ${formatUsdc(pot.target)}` : "Take it out anytime"}
        </span>
      </div>
      {isGoal && <GoalProgress value={value} target={pot.target} unlockAt={pot.unlockAt} unlocked={unlocked} compact />}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-grey-line pt-3">
        <TierChip tier={pot.tier} />
        <span className="text-label font-semibold text-green tabular-nums">+{formatUsdc(earned)} earned</span>
      </div>
    </Link>
  );
}
