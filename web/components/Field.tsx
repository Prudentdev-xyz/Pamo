import { useId, type InputHTMLAttributes, type ReactNode } from "react";

/**
 * One labelled input. The border turns black once it holds a value and red when it has a problem.
 * The text is 16 px or larger, so phones do not zoom the page on focus.
 */
export function Field({
  label,
  hint,
  aside,
  suffix,
  invalid = false,
  className = "",
  ...input
}: {
  label: string;
  /** A line under the field. */
  hint?: ReactNode;
  /** Sits at the right of the hint line, e.g. a character count. */
  aside?: ReactNode;
  /** Sits inside the field at the right, e.g. "USDC". */
  suffix?: ReactNode;
  invalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const filled = input.value !== undefined && input.value !== "";
  const line = invalid ? "border-error" : filled ? "border-black" : "border-grey-line";
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-label font-semibold">
        {label}
      </label>
      <div
        className={`flex h-14 items-center gap-2 rounded-sm border bg-white px-4 transition-[border-color] duration-150 ease-out focus-within:border-black focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-green ${line}`}
      >
        <input
          {...input}
          id={id}
          size={1}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-grey-muted ${className}`}
        />
        {suffix && (
          <span aria-hidden="true" className="shrink-0 text-label font-semibold text-grey-text">
            {suffix}
          </span>
        )}
      </div>
      {(hint || aside) && (
        <p className="flex justify-between gap-3 text-caption text-grey-text">
          <span id={`${id}-hint`}>{hint}</span>
          {aside && <span className="shrink-0 tabular-nums">{aside}</span>}
        </p>
      )}
    </div>
  );
}
