"use client";

import Link from "next/link";
import { use, useReducer } from "react";
import { ReviewSheet } from "@/components/ReviewSheet";
import { SaveSteps } from "@/components/SaveSteps";
import { Stepper } from "@/components/Stepper";
import { TierPicker } from "@/components/TierPicker";
import { KIND_ANYTIME, KIND_GOAL, MAX_NAME_BYTES, PAMO_SAVINGS, pamoSavingsAbi, TIERS } from "@/lib/contract";
import { formatDate, formatUsdc, parseUsdc } from "@/lib/format";
import { earliestUnlockDate, initialNewPot, newPotReducer, newPotSteps, unlockAtFromDate } from "@/lib/newPot";
import { openPot } from "@/lib/tx";
import { useSaveReview } from "@/lib/useReview";
import { useUsdcBalance } from "@/lib/useUsdcBalance";
import { useVaults } from "@/lib/useVaults";

const fieldClass = "mt-1 block w-full rounded border border-black px-3 py-2";
const primaryClass = "rounded border border-black bg-black px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40";

// The new pot flow as a state machine (Architecture §8.2): type → goal details → portfolio → amount → review → saved.
export default function NewPot({ searchParams }: { searchParams: Promise<{ kind?: string | string[] }> }) {
  const { kind } = use(searchParams);
  const [state, dispatch] = useReducer(
    newPotReducer,
    kind === "goal" ? KIND_GOAL : kind === "anytime" ? KIND_ANYTIME : undefined,
    initialNewPot,
  );
  const balance = useUsdcBalance();
  const vaults = useVaults();

  const isGoal = state.kind === KIND_GOAL;
  const name = state.name.trim();
  const nameTooLong = new TextEncoder().encode(name).length > MAX_NAME_BYTES;
  const target = parseUsdc(state.targetText);
  const unlockAt = unlockAtFromDate(state.unlockDate);
  const amount = parseUsdc(state.amountText);

  let goalProblem: string | null = null;
  if (name === "") goalProblem = "Give your goal a name.";
  else if (nameTooLong) goalProblem = "That name is too long.";
  else if (target === null) goalProblem = "Enter a target in USDC, with up to 6 decimals.";
  else if (unlockAt === null || unlockAt <= BigInt(Math.floor(Date.now() / 1000))) goalProblem = "Pick an unlock date in the future.";

  let amountProblem: string | null = null;
  if (amount === null) amountProblem = "Enter an amount in USDC, with up to 6 decimals.";
  else if (balance.data !== undefined && amount > balance.data) amountProblem = `You have ${formatUsdc(balance.data)} in your wallet.`;
  else if (nameTooLong) amountProblem = "That name is too long.";

  const potArgs = {
    kind: state.kind,
    tier: state.tier,
    target: isGoal ? (target ?? 0n) : 0n,
    unlockAt: isGoal ? (unlockAt ?? 0n) : 0n,
    name,
    amount: amount ?? 0n,
  };

  const review = useSaveReview({
    tier: state.tier,
    amount: state.screen === "review" ? amount : null,
    estimateGas: (client, account) =>
      client.estimateContractGas({
        address: PAMO_SAVINGS,
        abi: pamoSavingsAbi,
        functionName: "openPot",
        args: [potArgs.kind, potArgs.tier, potArgs.target, potArgs.unlockAt, potArgs.name, potArgs.amount],
        account,
      }),
  });

  const steps = newPotSteps(state);
  const back = (
    <button type="button" onClick={() => dispatch({ type: "back" })} className="rounded border border-black px-4 py-2 font-semibold">
      Back
    </button>
  );

  return (
    <div className="space-y-5">
      <Link href="/app" className="text-sm underline">
        Cancel
      </Link>
      <h1 className="text-2xl font-bold">{state.screen === "type" ? "Start saving" : isGoal ? "New Goal Vault" : "New Anytime Vault"}</h1>
      <Stepper titles={steps.titles} current={steps.current} />

      {state.screen === "type" && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "chooseKind", kind: KIND_ANYTIME })}
            className="block w-full rounded border border-black px-4 py-3 text-left"
          >
            <span className="font-semibold">Anytime Vault</span>
            <span className="mt-1 block text-sm">Save USDC and take it out whenever you want.</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "chooseKind", kind: KIND_GOAL })}
            className="block w-full rounded border border-black px-4 py-3 text-left"
          >
            <span className="font-semibold">Goal Vault</span>
            <span className="mt-1 block text-sm">
              Save toward a target. It stays locked until you reach the target or the date you pick.
            </span>
          </button>
        </div>
      )}

      {state.screen === "goal" && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm">What are you saving for? Names are public on Arc.</span>
            <input
              value={state.name}
              onChange={(e) => dispatch({ type: "set", field: "name", value: e.target.value })}
              placeholder="New laptop"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-sm">Target in USDC</span>
            <input
              value={state.targetText}
              onChange={(e) => dispatch({ type: "set", field: "targetText", value: e.target.value })}
              inputMode="decimal"
              placeholder="500.00"
              className={`${fieldClass} tabular-nums`}
            />
          </label>
          <label className="block">
            <span className="text-sm">Unlock date</span>
            <input
              type="date"
              min={earliestUnlockDate()}
              value={state.unlockDate}
              onChange={(e) => dispatch({ type: "set", field: "unlockDate", value: e.target.value })}
              className={fieldClass}
            />
          </label>
          <p className="text-sm">
            The goal unlocks when you reach the target or on this date, whichever comes first. There is no early
            withdrawal before that.
          </p>
          {goalProblem && (state.name !== "" || state.targetText !== "" || state.unlockDate !== "") && (
            <p role="alert" className="text-sm">
              {goalProblem}
            </p>
          )}
          <div className="flex gap-2">
            {back}
            <button type="button" disabled={!!goalProblem} onClick={() => dispatch({ type: "next" })} className={primaryClass}>
              Next
            </button>
          </div>
        </div>
      )}

      {state.screen === "tier" && (
        <div className="space-y-4">
          <TierPicker value={state.tier} onChange={(tier) => dispatch({ type: "setTier", tier })} vaults={vaults.data} />
          <p className="text-sm">A pot keeps the portfolio it opens with.</p>
          <div className="flex gap-2">
            {back}
            <button type="button" onClick={() => dispatch({ type: "next" })} className={primaryClass}>
              Next
            </button>
          </div>
        </div>
      )}

      {state.screen === "amount" && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm">
              Amount in USDC{balance.data !== undefined && ` (you have ${formatUsdc(balance.data)})`}
            </span>
            <input
              value={state.amountText}
              onChange={(e) => dispatch({ type: "set", field: "amountText", value: e.target.value })}
              inputMode="decimal"
              placeholder="0.00"
              className={`${fieldClass} tabular-nums`}
            />
          </label>
          {!isGoal && (
            <label className="block">
              <span className="text-sm">Name (optional). Names are public on Arc.</span>
              <input
                value={state.name}
                onChange={(e) => dispatch({ type: "set", field: "name", value: e.target.value })}
                placeholder="Rainy day"
                className={fieldClass}
              />
            </label>
          )}
          {isGoal && amount !== null && target !== null && amount >= target && (
            <p className="text-sm">Saving this much reaches your target, so this goal unlocks straight away.</p>
          )}
          {amountProblem && state.amountText.trim() !== "" && (
            <p role="alert" className="text-sm">
              {amountProblem}
            </p>
          )}
          <div className="flex gap-2">
            {back}
            <button type="button" disabled={!!amountProblem} onClick={() => dispatch({ type: "next" })} className={primaryClass}>
              Review
            </button>
          </div>
        </div>
      )}

      {state.screen === "review" && amount !== null && (
        <div className="space-y-4">
          <ReviewSheet
            title="Review your saving"
            rows={[
              ...(isGoal && target !== null && unlockAt !== null
                ? [
                    { label: "Goal", value: name },
                    { label: "Target", value: formatUsdc(target) },
                    { label: "Unlocks", value: `at ${formatUsdc(target)} or on ${formatDate(Number(unlockAt) * 1000)}` },
                  ]
                : name
                  ? [{ label: "Name", value: name }]
                  : []),
              ...review.rows,
            ]}
            warnings={review.warnings}
          >
            <SaveSteps
              amount={amount}
              beforeSend={review.refresh}
              save={async (onSent) => {
                const id = await openPot(potArgs, onSent);
                dispatch({ type: "saved", potId: id });
              }}
            />
          </ReviewSheet>
          {back}
        </div>
      )}

      {state.screen === "success" && amount !== null && (
        <section role="status" className="space-y-3 rounded border border-black px-4 py-3">
          <h2 className="font-semibold">Saved</h2>
          <p>
            {formatUsdc(amount)} is now in {name || (isGoal ? "your Goal Vault" : "your Anytime Vault")}, in the{" "}
            {TIERS[state.tier]} portfolio.
          </p>
          <div className="flex flex-wrap gap-2">
            {state.potId !== null && (
              <Link href={`/app/pot/${state.potId}`} className={primaryClass}>
                View this pot
              </Link>
            )}
            <Link href="/app" className="rounded border border-black px-4 py-2 font-semibold">
              Back to dashboard
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
