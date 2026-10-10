import Link from "next/link";
import { fallbackPotName, KIND_GOAL, KINDS, TIERS } from "@/lib/contract";
import { formatUsdc } from "@/lib/format";
import { GoalProgress } from "./GoalProgress";

export interface PotCardData {
  id: bigint;
  pot: { kind: number; tier: number; principal: bigint; target: bigint; unlockAt: bigint };
  value: bigint;
  unlocked: boolean;
}

/** One pot on the dashboard. `name` comes from the indexer and is missing while the backend is down. */
export function PotCard({ id, pot, value, unlocked, name }: PotCardData & { name?: string | null }) {
  const earned = value > pot.principal ? value - pot.principal : 0n;
  return (
    <Link href={`/app/pot/${id}`} className="block rounded border border-black px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">{name || fallbackPotName(pot.kind, id)}</span>
        <span className="font-semibold tabular-nums">{formatUsdc(value)}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3 text-sm">
        <span>
          {KINDS[pot.kind]} · {TIERS[pot.tier]}
        </span>
        <span className="tabular-nums">Earned {formatUsdc(earned)}</span>
      </div>
      {pot.kind === KIND_GOAL && (
        <div className="mt-2">
          <GoalProgress value={value} target={pot.target} unlockAt={pot.unlockAt} unlocked={unlocked} compact />
        </div>
      )}
    </Link>
  );
}
