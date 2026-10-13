import type { ReactNode } from "react";
import { InfoIcon, WarningIcon } from "./Icon";

type Tone = "info" | "caution" | "error";

const tones: Record<Tone, string> = {
  info: "bg-grey-surface text-black",
  caution: "bg-caution-fill text-caution",
  error: "bg-error-fill text-error",
};

/** A slim note above the content. Status colours report a problem and never decorate. */
export function Banner({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  const Glyph = tone === "info" ? InfoIcon : WarningIcon;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-card px-4 py-3 text-label ${tones[tone]}`}>
      <Glyph className={`mt-px shrink-0 ${tone === "info" ? "text-grey-text" : ""}`} />
      <p className="min-w-0">{children}</p>
    </div>
  );
}
