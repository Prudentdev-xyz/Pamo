import type { ReactNode } from "react";
import type { ReviewRow } from "@/lib/useReview";

/** What is about to happen, shown before the wallet opens. Warnings sit above the buttons, never after them. */
export function ReviewSheet({
  title,
  rows,
  warnings = [],
  children,
}: {
  title: string;
  rows: ReviewRow[];
  warnings?: string[];
  children?: ReactNode;
}) {
  return (
    <section className="rounded border border-black">
      <h3 className="border-b border-black px-4 py-2 font-semibold">{title}</h3>
      <dl className="px-4 py-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 py-1">
            <dt className="shrink-0 text-sm">{row.label}</dt>
            <dd className="text-right tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
      {warnings.length > 0 && (
        <ul role="status" className="space-y-1 border-t border-black px-4 py-2 text-sm">
          {warnings.map((warning) => (
            <li key={warning}>⚠ {warning}</li>
          ))}
        </ul>
      )}
      {children && <div className="border-t border-black px-4 py-3">{children}</div>}
    </section>
  );
}
