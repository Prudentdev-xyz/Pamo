import { TIERS } from "@/lib/contract";

/** Three bars with one, two or three filled in green. Always shown beside the tier's name. */
export function LevelMark({ tier, size = "md" }: { tier: number; size?: "sm" | "md" | "lg" }) {
  const heights =
    size === "sm" ? ["h-1.25", "h-1.75", "h-2.5"] : size === "lg" ? ["h-2.25", "h-3.25", "h-4.5"] : ["h-1.5", "h-2.25", "h-3"];
  return (
    <span aria-hidden="true" className={`inline-flex items-end ${size === "lg" ? "gap-0.75" : "gap-0.5"}`}>
      {heights.map((height, i) => (
        <span key={height} className={`rounded-[1px] ${size === "lg" ? "w-1.25" : "w-0.75"} ${height} ${i <= tier ? "bg-green" : "bg-grey-line"}`} />
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
