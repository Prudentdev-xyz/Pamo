"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useConnection, useReadContract } from "wagmi";
import { erc20Abi, PAMO_SAVINGS, USDC } from "@/lib/contract";
import { formatUsdc } from "@/lib/format";
import { allowUsdc, type OnSent } from "@/lib/tx";
import { useStep } from "@/lib/useStep";
import { StepButton } from "./StepButton";

/**
 * The two steps of every save: Allow, then Save. Only one button is active at a time.
 * `save` sends the saving itself (openPot or deposit); `onSaved` runs after it confirms.
 */
export function SaveSteps({
  amount,
  save,
  onSaved,
  beforeSend,
}: {
  /** Null until the form holds a valid amount. */
  amount: bigint | null;
  save: (onSent: OnSent) => Promise<void>;
  onSaved?: () => void;
  /** Runs right before the wallet opens, to refresh what the review shows. */
  beforeSend?: () => Promise<void>;
}) {
  const { address } = useConnection();
  const queryClient = useQueryClient();
  const allow = useStep();
  const saving = useStep();

  const allowance = useReadContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, PAMO_SAVINGS] : undefined,
    query: { enabled: !!address },
  });

  const ready = amount !== null && allowance.data !== undefined;
  const needsAllow = ready && allowance.data < amount;
  const busy = allow.step.status === "pending" || saving.step.status === "pending";

  async function onAllow() {
    if (amount === null) return;
    saving.reset();
    const result = await allow.run(async (onSent) => {
      await beforeSend?.().catch(() => {});
      return allowUsdc(amount, onSent);
    });
    if (result.ok) await allowance.refetch();
  }

  async function onSave() {
    const result = await saving.run(async (onSent) => {
      await beforeSend?.().catch(() => {});
      return save(onSent);
    });
    if (!result.ok) return;
    await queryClient.invalidateQueries();
    onSaved?.();
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm">Step 1 of 2</p>
        <StepButton step={allow.step} disabled={!needsAllow || busy} onClick={onAllow}>
          {ready && !needsAllow ? "Allowed" : amount !== null ? `Allow ${formatUsdc(amount)}` : "Allow USDC"}
        </StepButton>
        <p className="mt-1 text-sm">Allow Pamo to use exactly this amount of your USDC, and no more.</p>
      </div>
      <div>
        <p className="text-sm">Step 2 of 2</p>
        <StepButton step={saving.step} disabled={!ready || needsAllow || busy} onClick={onSave}>
          Save
        </StepButton>
      </div>
    </div>
  );
}
