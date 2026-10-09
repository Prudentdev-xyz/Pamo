"use client";

import { useCallback, useState } from "react";
import type { Hash } from "viem";
import { txErrorMessage, type OnSent } from "./tx";

export interface Step {
  status: "idle" | "pending" | "done" | "error";
  /** Set once the wallet has sent the transaction. */
  hash?: Hash;
  error?: string;
}

export type StepResult<T> = { ok: true; value: T } | { ok: false };

/** Loading, success and error state for one onchain button. Each button gets its own. */
export function useStep() {
  const [step, setStep] = useState<Step>({ status: "idle" });

  const run = useCallback(async <T,>(action: (onSent: OnSent) => Promise<T>): Promise<StepResult<T>> => {
    setStep({ status: "pending" });
    try {
      const value = await action((hash) => setStep({ status: "pending", hash }));
      setStep((s) => ({ status: "done", hash: s.hash }));
      return { ok: true, value };
    } catch (error) {
      setStep((s) => ({ status: "error", hash: s.hash, error: txErrorMessage(error) }));
      return { ok: false };
    }
  }, []);

  const reset = useCallback(() => setStep({ status: "idle" }), []);

  return { step, run, reset };
}
