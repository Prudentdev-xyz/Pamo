"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatApy, formatEstimate } from "@/lib/format";
import { growth } from "@/lib/growth";
import { TIER_INFO } from "@/lib/tiers";
import { useVaults } from "@/lib/useVaults";

const fieldClass = "mt-1 block w-full rounded border border-black px-3 py-2 tabular-nums";

/** Zero for an empty field, null for anything that is not a plain amount. */
function parseAmount(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return /^\d+(\.\d{1,6})?$/.test(trimmed) ? Number(trimmed) : null;
}

/** What savings could grow to at today's live rate. Pure maths in the browser: no wallet needed. */
export function Calculator() {
  const vaults = useVaults();
  const [startText, setStartText] = useState("100");
  const [monthlyText, setMonthlyText] = useState("50");
  const [months, setMonths] = useState(12);
  const [tier, setTier] = useState(0);

  const start = parseAmount(startText);
  const monthly = parseAmount(monthlyText);
  const info = TIER_INFO[tier]!;
  const apy = vaults.data?.tiers[info.key]?.apy ?? null;
  const result = start !== null && monthly !== null && apy !== null ? growth(start, monthly, months, apy) : null;

  const points = result
    ? [{ month: 0, balance: start!, putIn: start! }].concat(
        result.points.map((balance, i) => ({ month: i + 1, balance, putIn: start! + monthly! * (i + 1) })),
      )
    : [];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm">Starting amount in USDC</span>
          <input value={startText} onChange={(e) => setStartText(e.target.value)} inputMode="decimal" className={fieldClass} />
        </label>
        <label className="block">
          <span className="text-sm">Monthly top-up in USDC</span>
          <input value={monthlyText} onChange={(e) => setMonthlyText(e.target.value)} inputMode="decimal" className={fieldClass} />
        </label>
      </div>

      <label className="block">
        <span className="text-sm">
          For {months} {months === 1 ? "month" : "months"}
        </span>
        <input
          type="range"
          min={1}
          max={60}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </label>

      <fieldset>
        <legend className="text-sm">Portfolio (a USDC lending vault)</legend>
        <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
          {TIER_INFO.map((t) => {
            const rate = vaults.data?.tiers[t.key]?.apy;
            return (
              <label key={t.key} className="flex items-center gap-2">
                <input type="radio" name="calculator-tier" checked={tier === t.index} onChange={() => setTier(t.index)} />
                <span className="font-semibold">{t.label}</span>
                <span className="text-sm tabular-nums">{rate !== undefined ? formatApy(rate) : "unavailable"}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {start === null || monthly === null ? (
        <p role="alert" className="text-sm">
          Enter amounts in USDC, with up to 6 decimals.
        </p>
      ) : vaults.isPending ? (
        <p>Loading today's rates…</p>
      ) : !result ? (
        <p role="status">Live rates unavailable, so there is nothing to estimate from right now.</p>
      ) : (
        <section className="space-y-3">
          <div>
            <p className="text-sm">Projected balance (estimate)</p>
            <p className="text-4xl font-bold tabular-nums" aria-live="polite">
              {formatEstimate(result.final)}
            </p>
          </div>
          <dl className="grid gap-2 tabular-nums sm:grid-cols-3">
            <div>
              <dt className="text-sm">Total put in</dt>
              <dd className="font-semibold">{formatEstimate(result.putIn)}</dd>
            </div>
            <div>
              <dt className="text-sm">Estimated interest</dt>
              <dd className="font-semibold">{formatEstimate(result.interest)}</dd>
            </div>
            <div>
              <dt className="text-sm">{info.label} APY today</dt>
              <dd className="font-semibold">{formatApy(apy!)}, changes daily</dd>
            </div>
          </dl>
          <div className="h-56" aria-label="Projected balance by month">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#0A0A0A" strokeOpacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis width={64} tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                <Tooltip
                  formatter={(value, name) => [formatEstimate(Number(value)), name === "balance" ? "Projected balance" : "Put in"]}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Line type="monotone" dataKey="putIn" stroke="#0A0A0A" strokeOpacity={0.4} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="balance" stroke="#0A0A0A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm">Estimate at today's rate. Not a promise.</p>
        </section>
      )}
    </div>
  );
}
