"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useConnection, useReadContract } from "wagmi";
import { explorerTx } from "@/lib/chain";
import { erc20Abi, PAMO_SAVINGS, USDC } from "@/lib/contract";
import { formatUsdc } from "@/lib/format";
import { allowUsdc, type OnSent } from "@/lib/tx";
import { useStep } from "@/lib/useStep";
import { duration, ease } from "@/motion/tokens";
import { Banner } from "./Banner";
import { Button } from "./Button";
import { TickIcon } from "./Icon";
import { Spinner } from "./Spinner";

type RowState = "todo" | "active" | "pending" | "done";

const CANCELLED = "Cancelled. Nothing was moved.";

/**
 * The two steps of every save: Allow, then Save. One button, which is the step that is next.
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
  // Covers the moment between the Allow confirming and the new allowance being read, so Allow cannot be sent twice.
  const [syncing, setSyncing] = useState(false);

  const allowance = useReadContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, PAMO_SAVINGS] : undefined,
    query: { enabled: !!address },
  });

  const ready = amount !== null && allowance.data !== undefined;
  const needsAllow = ready && allowance.data < amount;
  const allowing = allow.step.status === "pending" || syncing;
  const savingNow = saving.step.status === "pending";
  const busy = allowing || savingNow;

  async function onAllow() {
    if (amount === null) return;
    saving.reset();
    const result = await allow.run(async (onSent) => {
      await beforeSend?.().catch(() => {});
      const receipt = await allowUsdc(amount, onSent);
      // Set before the step reports done, so there is no moment when Allow could be pressed again.
      setSyncing(true);
      return receipt;
    });
    try {
      if (result.ok) await allowance.refetch();
    } finally {
      setSyncing(false);
    }
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

  const allowed = ready && !needsAllow;
  const first: RowState = allowing ? "pending" : allowed ? "done" : "active";
  const second: RowState = savingNow ? "pending" : allowed && !allowing ? "active" : "todo";
  const onFirst = !allowed || allowing;
  const active = onFirst ? allow.step : saving.step;
  const error = saving.step.status === "error" ? saving.step.error : allow.step.status === "error" ? allow.step.error : null;
  const amountText = amount !== null ? formatUsdc(amount) : "your USDC";

  return (
    <div className="grid gap-4">
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration.base, ease }}>
          <Banner tone="error">
            <b className="block font-semibold">{error}</b>
            {error === CANCELLED && "You turned down the request in your wallet. Try again when you are ready."}
          </Banner>
        </motion.div>
      )}

      <ol className="rounded-card border border-grey-line px-3.5 py-1.5">
        <StepRow
          state={first}
          number={1}
          title="Step 1 of 2: Allow Pamo to use your USDC"
          sub={`Lets Pamo move exactly ${amountText}, and no more.`}
        />
        <StepRow state={second} number={2} title="Step 2 of 2: Save" sub={`Moves ${amountText} into this pot.`} divided />
      </ol>

      <Button size="lg" className="w-full" disabled={!ready} pending={busy} onClick={onFirst ? onAllow : onSave}>
        {busy ? (
          <>
            <Spinner />
            {active.hash || syncing ? "Confirming…" : "Check your wallet…"}
          </>
        ) : onFirst ? (
          amount !== null ? `Allow ${formatUsdc(amount)}` : "Allow USDC"
        ) : (
          "Save"
        )}
      </Button>

      {busy && active.hash && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.fast }}
          className="text-center text-caption text-grey-text"
        >
          Waiting for confirmation.{" "}
          <a href={explorerTx(active.hash)} target="_blank" rel="noreferrer" className="font-semibold text-green underline">
            View on explorer
          </a>
        </motion.p>
      )}
    </div>
  );
}

function StepRow({ state, number, title, sub, divided }: { state: RowState; number: number; title: string; sub: string; divided?: boolean }) {
  return (
    <motion.li
      animate={{ opacity: state === "todo" ? 0.45 : 1 }}
      transition={{ duration: duration.base, ease, delay: state === "active" && number === 2 ? duration.base : 0 }}
      className={`flex items-center gap-3 py-2.5 ${divided ? "border-t border-grey-line" : ""}`}
    >
      <span className="flex size-7 shrink-0 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state === "done" ? "done" : state === "pending" ? "pending" : "number"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
            className="flex items-center justify-center"
          >
            {state === "done" ? (
              <TickIcon size={28} variant="Bold" className="text-green" />
            ) : state === "pending" ? (
              <Spinner />
            ) : (
              <span
                className={`flex size-7 items-center justify-center rounded-full text-caption font-bold ${
                  state === "active" ? "bg-black text-white" : "border-[1.5px] border-grey-line text-grey-text"
                }`}
              >
                {number}
              </span>
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="grid min-w-0 gap-px">
        <b className="text-label font-semibold">
          {title}
          {state === "done" && <span className="sr-only">, done</span>}
        </b>
        <span className="text-caption text-grey-text">{sub}</span>
      </span>
    </motion.li>
  );
}
