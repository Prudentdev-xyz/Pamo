import type { ReactNode } from "react";

/** A white card with a hairline border. Cards never nest. */
export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-card border border-grey-line bg-white ${className}`}>{children}</div>;
}
