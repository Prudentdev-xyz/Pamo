import { KINDS } from "@/lib/contract";

/** Anytime or Goal. */
export function KindBadge({ kind }: { kind: number }) {
  return (
    <span className="shrink-0 rounded-sm border border-grey-line px-2 py-0.5 text-caption font-semibold">{KINDS[kind]}</span>
  );
}
