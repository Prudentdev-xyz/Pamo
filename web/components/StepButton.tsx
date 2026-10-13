"use client";

import type { ReactNode } from "react";
import { explorerTx } from "@/lib/chain";
import type { Step } from "@/lib/useStep";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

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
    <div className="grid gap-2">
      <Button size="lg" onClick={onClick} disabled={disabled} pending={pending} className="w-full">
        {pending && <Spinner />}
        {pending ? (step.hash ? "Confirming…" : "Check your wallet…") : children}
      </Button>
      {step.hash && pending && (
        <p className="text-center text-caption text-grey-text">
          Waiting for confirmation.{" "}
          <a href={explorerTx(step.hash)} target="_blank" rel="noreferrer" className="font-semibold text-green underline">
            View on explorer
          </a>
        </p>
      )}
      {step.status === "error" && (
        <p role="alert" className="text-label text-error">
          {step.error}
        </p>
      )}
    </div>
  );
}
