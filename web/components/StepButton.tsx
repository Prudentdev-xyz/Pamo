"use client";

import type { ReactNode } from "react";
import { explorerTx } from "@/lib/chain";
import type { Step } from "@/lib/useStep";

/** One onchain button with its own pending state, explorer link and error. */
export function StepButton({
  step,
  disabled,
  onClick,
  children,
}: {
  step: Step;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const pending = step.status === "pending";
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || pending}
        className="rounded border border-black bg-black px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? (step.hash ? "Confirming…" : "Check your wallet…") : children}
      </button>
      {step.hash && (
        <a href={explorerTx(step.hash)} target="_blank" rel="noreferrer" className="ml-3 text-sm underline">
          View on explorer
        </a>
      )}
      {step.status === "error" && (
        <p role="alert" className="mt-2 text-sm">
          {step.error}
        </p>
      )}
    </div>
  );
}
