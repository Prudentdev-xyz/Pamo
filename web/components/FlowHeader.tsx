import Link from "next/link";
import { BackIcon } from "./Icon";

/** The bar at the top of a step-by-step flow: back, where you are, and a way out. */
export function FlowHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  cancel,
}: {
  title: string;
  subtitle: string;
  /** Leave out on the first step: the button keeps its space but is hidden. */
  onBack?: () => void;
  backLabel?: string;
  /** Where Cancel goes: a page, or an action on this one. */
  cancel: string | (() => void);
}) {
  const cancelClass =
    "flex h-11 min-w-11 items-center justify-end text-label font-semibold text-grey-text transition-[color] duration-150 ease-out hover:text-black";
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!onBack}
        aria-label={backLabel}
        className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-grey-line text-label font-semibold transition-[background-color] duration-150 ease-out hover:bg-grey-surface disabled:invisible lg:pr-4 lg:pl-3"
      >
        <BackIcon size={18} />
        <span className="hidden lg:inline">{backLabel}</span>
      </button>
      <p className="grid min-w-0 justify-items-center gap-0.5">
        <b className="text-label font-semibold tabular-nums">{title}</b>
        <span className="max-w-full truncate text-caption text-grey-text">{subtitle}</span>
      </p>
      {typeof cancel === "string" ? (
        <Link href={cancel} className={cancelClass}>
          Cancel
        </Link>
      ) : (
        <button type="button" onClick={cancel} className={cancelClass}>
          Cancel
        </button>
      )}
    </div>
  );
}
