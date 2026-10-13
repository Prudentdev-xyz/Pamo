import { formatCount, formatUsdcNumber, usdcToNumber } from "@/lib/format";
import { Card } from "./Card";
import { CountUp } from "./CountUp";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// An amount is never cut short, so a long one steps down a size to stay on one line.
function totalSize(length: number) {
  if (length <= 11) return "text-display lg:text-balance";
  if (length <= 14) return "text-h1 lg:text-display";
  return "text-h2 lg:text-h1";
}

/** Total saved, earned so far and the number of pots, at the top of the dashboard. */
export function DashboardStats({
  totalSaved,
  earned,
  goals,
  anytime,
}: {
  totalSaved: bigint;
  earned: bigint;
  goals: number;
  anytime: number;
}) {
  const total = formatUsdcNumber(totalSaved);
  const earnedText = formatUsdcNumber(earned);
  // Side by side on a phone, each small card has room for about nine figures.
  const wide = earnedText.length > 9;
  const small = `${wide ? "col-span-2 xl:col-span-1" : ""} grid min-w-0 content-start gap-1 p-4 lg:p-6`;
  return (
    <div className="grid grid-cols-2 gap-3 lg:gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
      <Card className="col-span-2 grid min-w-0 content-start gap-1 p-5 lg:p-6 xl:col-span-1">
        <span className="text-label text-grey-text">Total saved</span>
        <span className={`font-bold tracking-[-0.02em] tabular-nums ${totalSize(total.length)}`}>
          <CountUp value={usdcToNumber(totalSaved)} format={formatCount} final={total} />{" "}
          <span className="text-body font-normal tracking-normal text-grey-text lg:text-h3">USDC</span>
        </span>
        <span className="text-caption text-grey-text">Across {plural(goals + anytime, "pot", "pots")}</span>
      </Card>
      <Card className={small}>
        <span className="text-label text-grey-text">Earned so far</span>
        <span className={`font-bold text-green tabular-nums lg:leading-14 ${earnedText.length > 12 ? "text-h3 lg:text-h2" : "text-h2 lg:text-h1"}`}>
          +<CountUp value={usdcToNumber(earned)} format={formatCount} final={earnedText} />{" "}
          <span className="text-label font-semibold lg:text-body">USDC</span>
        </span>
        <span className="text-caption text-grey-text">Since your first save</span>
      </Card>
      <Card className={small}>
        <span className="text-label text-grey-text">Pots</span>
        <span className="text-h2 font-bold tabular-nums lg:text-h1 lg:leading-14">
          <CountUp value={goals + anytime} format={(n) => Math.round(n).toString()} final={(goals + anytime).toString()} />
        </span>
        <span className="text-caption text-grey-text">
          {plural(goals, "goal", "goals")}, {anytime} anytime
        </span>
      </Card>
    </div>
  );
}
