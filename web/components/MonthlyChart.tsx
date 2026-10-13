"use client";

import { motion } from "motion/react";
import type { ActivityItem } from "@/lib/api";
import { formatUsdc } from "@/lib/format";
import { duration, ease } from "@/motion/tokens";
import { Card } from "./Card";

const MONTHS = 6;
const monthName = (date: Date) => date.toLocaleDateString("en-US", { month: "short" });

/** What the owner put in during each of the last six months, summed from their saves. */
export function monthlySaves(activity: ActivityItem[], now = new Date()) {
  const months = Array.from({ length: MONTHS }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    return { start, total: 0n };
  });
  for (const item of activity) {
    if (item.type !== "deposit") continue;
    const at = new Date(item.at);
    const month = months.find((m) => m.start.getFullYear() === at.getFullYear() && m.start.getMonth() === at.getMonth());
    if (month) month.total += BigInt(item.assets);
  }
  return months;
}

/** "Put in by month": six bars, the current month in green with its amount. */
export function MonthlyChart({ activity }: { activity: ActivityItem[] }) {
  const months = monthlySaves(activity);
  const max = months.reduce((top, m) => (m.total > top ? m.total : top), 0n);
  if (max === 0n) return null;
  const first = months[0]!.start;
  const last = months[MONTHS - 1]!.start;

  return (
    <Card className="grid gap-4 p-5 lg:gap-5 lg:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <h2 className="text-body font-bold">Put in by month</h2>
        <p className="text-caption text-grey-text">
          From your saves, {monthName(first)} to {monthName(last)} {last.getFullYear()}
        </p>
      </div>
      <ul className="grid h-40 grid-cols-6 items-end gap-2.5 lg:h-50 lg:gap-5 lg:px-2">
        {months.map((month, i) => {
          const current = i === MONTHS - 1;
          // Bar heights are whole percentages of the tallest month; the exact amount is in the text.
          // A month with any saving keeps a sliver, so it never reads as empty.
          const height = Number((month.total * 100n) / max);
          return (
            <li key={month.start.toISOString()} className="flex h-full flex-col items-center justify-end gap-1.5">
              <span className="sr-only">
                {monthName(month.start)}: {formatUsdc(month.total)}
              </span>
              {current && month.total > 0n && (
                <motion.span
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: duration.base, ease, delay: 0.9 }}
                  className="self-end text-caption font-semibold whitespace-nowrap tabular-nums"
                >
                  {formatUsdc(month.total)}
                </motion.span>
              )}
              <div aria-hidden="true" className="w-full max-w-11 overflow-hidden rounded-t-sm rounded-b-[2px]" style={{ height: `${height}%`, minHeight: month.total > 0n ? 2 : 0 }}>
                <motion.div
                  className={`h-full w-full ${current ? "bg-green" : "bg-grey-line"}`}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: duration.slow, ease, delay: 0.3 + i * 0.04 }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <ul aria-hidden="true" className="grid grid-cols-6 gap-2.5 border-t border-black pt-2 lg:gap-5 lg:px-2">
        {months.map((month, i) => (
          <li
            key={month.start.toISOString()}
            className={`text-center text-caption ${i === MONTHS - 1 ? "font-semibold text-black" : "text-grey-text"}`}
          >
            {monthName(month.start)}
          </li>
        ))}
      </ul>
    </Card>
  );
}
