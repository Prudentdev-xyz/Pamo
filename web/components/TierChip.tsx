import { TIERS } from "@/lib/contract";

/** Three bars with one, two or three filled in green. Always shown beside the tier's name. */
export function LevelMark({ tier, size = "md" }: { tier: number; size?: "sm" | "md" }) {
  const heights = size === "sm" ? ["h-1.25", "h-1.75", "h-2.5"] : ["h-1.5", "h-2.25", "h-3"];
  return (
    <span aria-hidden="true" className="inline-flex items-end gap-0.5">
      {heights.map((height, i) => (
        <span key={height} className={`w-0.75 rounded-[1px] ${height} ${i <= tier ? "bg-green" : "bg-grey-line"}`} />
      ))}
    </span>
  );
}

/** Calm, Steady or Bold: the name and its level mark on a mint fill. */
export function TierChip({ tier }: { tier: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-mint px-2 py-1 text-caption font-semibold">
      <LevelMark tier={tier} size="sm" />
      {TIERS[tier]}
    </span>
  );
}
