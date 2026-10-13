import type { ReactNode } from "react";

/**
 * The large amount field shared by every save and withdrawal.
 * A long amount steps down a size, so every digit stays in view.
 */
export function AmountCard({
  label,
  value,
  onChange,
  invalid = false,
  footer,
  max,
}: {
  /** "You save", "You add", "You withdraw". */
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  /** The line under the amount, e.g. the wallet balance. */
  footer: ReactNode;
  /** Shows a Max button that fills this amount in. `hint` says what Max does, for screen readers. */
  max?: { value: string; hint: string } | null;
}) {
  return (
    <label
      className={`grid grid-cols-[minmax(0,1fr)] gap-2.5 rounded-card border p-5 transition-[border-color,box-shadow] duration-150 ease-out focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-green lg:p-7 ${
        invalid ? "border-error shadow-[inset_0_0_0_1px_var(--color-error)]" : value ? "border-black" : "border-grey-line"
      }`}
    >
      <span className="text-label text-grey-text">{label}</span>
      <span className="flex items-baseline gap-2.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          name="amount"
          inputMode="decimal"
          placeholder="0.00"
          autoComplete="off"
          size={1}
          aria-label={`${label}, amount in USDC`}
          aria-invalid={invalid || undefined}
          className={`min-w-0 flex-1 bg-transparent font-bold tracking-[-0.03em] tabular-nums outline-none placeholder:text-grey-muted ${
            value.length > 9 ? "text-h2 lg:text-display" : "text-display lg:text-balance"
          }`}
        />
        <span className="text-h3 font-semibold text-grey-text">USDC</span>
      </span>
      <span className="flex flex-wrap items-center justify-between gap-2 border-t border-grey-line pt-2.5 text-label text-grey-text tabular-nums">
        {footer}
        {max && (
          <button
            type="button"
            aria-label={max.hint}
            onClick={() => onChange(max.value)}
            className="rounded-sm bg-mint px-3 py-1.5 text-caption font-semibold text-green transition-[background-color,transform] duration-150 ease-out hover:bg-grey-line active:scale-[0.97]"
          >
            Max
          </button>
        )}
      </span>
    </label>
  );
}
