"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { Address } from "viem";
import { useConnection, useReadContracts } from "wagmi";
import { ActivityList } from "@/components/ActivityList";
import { GoalProgress } from "@/components/GoalProgress";
import { ReviewSheet } from "@/components/ReviewSheet";
import { SaveSteps } from "@/components/SaveSteps";
import { StepButton } from "@/components/StepButton";
import { explorerAddress } from "@/lib/chain";
import { fallbackPotName, KIND_GOAL, KINDS, PAMO_SAVINGS, pamoSavingsAbi, TIER_KEYS, TIERS } from "@/lib/contract";
import { formatDate, formatUsdc, parseUsdc, shortAddress, usdcInputValue } from "@/lib/format";
import { depositToPot, withdrawAllFromPot, withdrawFromPot } from "@/lib/tx";
import { usePotInfo } from "@/lib/usePotInfo";
import { useSaveReview, useWithdrawReview } from "@/lib/useReview";
import { useStep } from "@/lib/useStep";
import { useUsdcBalance } from "@/lib/useUsdcBalance";
import { useVaults } from "@/lib/useVaults";

const pamo = { address: PAMO_SAVINGS, abi: pamoSavingsAbi } as const;
const fieldClass = "mt-1 block w-full rounded border border-black px-3 py-2 tabular-nums";

export default function PotDetail() {
  const params = useParams<{ id: string }>();
  const id = /^\d+$/.test(params.id) ? BigInt(params.id) : null;
  const { address } = useConnection();
  const info = usePotInfo();
  const vaults = useVaults();

  const reads = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...pamo, functionName: "getPot", args: [id ?? 0n] },
      { ...pamo, functionName: "potValue", args: [id ?? 0n] },
      { ...pamo, functionName: "isUnlocked", args: [id ?? 0n] },
    ],
    query: { enabled: id !== null },
  });

  const back = (
    <Link href="/app" className="text-sm underline">
      Back
    </Link>
  );

  if (id === null) return <div>{back}<p className="mt-4">No such pot.</p></div>;
  if (reads.isPending) return <p>Loading…</p>;
  if (reads.isError) {
    return (
      <div>
        {back}
        <p role="alert" className="mt-4">
          Could not read this pot from Arc.{" "}
          <button type="button" onClick={() => reads.refetch()} className="underline">
            Try again
          </button>
        </p>
      </div>
    );
  }

  const [pot, value, unlocked] = reads.data;
  if (pot.owner.toLowerCase() !== address?.toLowerCase()) {
    return <div>{back}<p className="mt-4">This pot belongs to another wallet.</p></div>;
  }

  const earned = value > pot.principal ? value - pot.principal : 0n;
  const isGoal = pot.kind === KIND_GOAL;
  const tierVault = vaults.data?.tiers[TIER_KEYS[pot.tier]!];
  const vaultName = tierVault?.vaultAddress.toLowerCase() === pot.vault.toLowerCase() ? tierVault.name : shortAddress(pot.vault);

  return (
    <div className="space-y-6">
      {back}
      <section>
        <h1 className="text-2xl font-bold">{info.byId.get(id.toString())?.name || fallbackPotName(pot.kind, id)}</h1>
        <p className="text-sm">
          {KINDS[pot.kind]} · {TIERS[pot.tier]} · vault{" "}
          <a href={explorerAddress(pot.vault)} target="_blank" rel="noreferrer" className="underline">
            {vaultName}
          </a>
        </p>
        <p className="mt-3 text-4xl font-bold tabular-nums">{formatUsdc(value)}</p>
        <p className="mt-1 tabular-nums">
          Put in: {formatUsdc(pot.principal)} · Earned: {formatUsdc(earned)}
        </p>
        {isGoal && (
          <div className="mt-3">
            <GoalProgress value={value} target={pot.target} unlockAt={pot.unlockAt} unlocked={unlocked} />
          </div>
        )}
      </section>

      <AddMoney id={id} tier={pot.tier} vault={pot.vault} />
      <Withdraw
        id={id}
        pot={pot}
        value={value}
        locked={!unlocked}
        lockReason={
          isGoal ? `Unlocks when you reach ${formatUsdc(pot.target)} or on ${formatDate(Number(pot.unlockAt) * 1000)}.` : ""
        }
      />
      <ActivityList potId={id} />
    </div>
  );
}

function AddMoney({ id, tier, vault }: { id: bigint; tier: number; vault: Address }) {
  const balance = useUsdcBalance();
  const [amountText, setAmountText] = useState("");
  const amount = parseUsdc(amountText);

  let problem: string | null = null;
  if (amountText.trim() !== "" && amount === null) problem = "Enter an amount in USDC, with up to 6 decimals.";
  else if (amount !== null && balance.data !== undefined && amount > balance.data)
    problem = `You have ${formatUsdc(balance.data)} in your wallet.`;

  const valid = problem ? null : amount;
  const review = useSaveReview({
    tier,
    amount: valid,
    pot: { id, vault },
    estimateGas: (client, account) =>
      client.estimateContractGas({ ...pamo, functionName: "deposit", args: [id, valid ?? 0n], account }),
  });

  return (
    <section className="space-y-3 border-t border-black pt-4">
      <h2 className="font-semibold">Add money</h2>
      <label className="block">
        <span className="text-sm">
          Amount in USDC{balance.data !== undefined && ` (you have ${formatUsdc(balance.data)})`}
        </span>
        <input
          value={amountText}
          onChange={(e) => setAmountText(e.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          className={fieldClass}
        />
      </label>
      {problem && (
        <p role="alert" className="text-sm">
          {problem}
        </p>
      )}
      {valid !== null && (
        <ReviewSheet title="Review your saving" rows={review.rows} warnings={review.warnings}>
          <SaveSteps
            amount={valid}
            beforeSend={review.refresh}
            save={async (onSent) => {
              await depositToPot(id, valid, onSent);
            }}
            onSaved={() => setAmountText("")}
          />
        </ReviewSheet>
      )}
    </section>
  );
}

function Withdraw({
  id,
  pot,
  value,
  locked,
  lockReason,
}: {
  id: bigint;
  pot: { vault: Address; shares: bigint };
  value: bigint;
  locked: boolean;
  lockReason: string;
}) {
  const queryClient = useQueryClient();
  const withdrawing = useStep();
  const [amountText, setAmountText] = useState("");
  const [recheckProblem, setRecheckProblem] = useState<string | null>(null);
  const amount = parseUsdc(amountText);
  const empty = value === 0n;

  let problem: string | null = null;
  if (amountText.trim() !== "" && amount === null) problem = "Enter an amount in USDC, with up to 6 decimals.";
  else if (amount !== null && amount > value) problem = `This pot holds ${formatUsdc(value)}.`;

  const valid = problem || locked ? null : amount;
  const review = useWithdrawReview({ id, pot, value, amount: valid });
  const blocked = review.blocked ?? recheckProblem;

  async function onWithdraw() {
    if (valid === null) return;
    setRecheckProblem(null);
    // The quote is read again right before the wallet opens: the vault's cash can change.
    const stillShort = await review.recheck().catch(() => null);
    if (stillShort) return setRecheckProblem(stillShort);
    // Taking the whole value goes through withdrawAll, so no dust is left behind.
    const result = await withdrawing.run((onSent) =>
      valid >= value ? withdrawAllFromPot(id, onSent) : withdrawFromPot(id, valid, onSent),
    );
    if (!result.ok) return;
    setAmountText("");
    await queryClient.invalidateQueries();
  }

  return (
    <section className="space-y-3 border-t border-black pt-4">
      <h2 className="font-semibold">Withdraw</h2>
      {locked ? (
        <p>{lockReason}</p>
      ) : empty ? (
        <p>This pot is empty.</p>
      ) : (
        <>
          <label className="block">
            <span className="text-sm">Amount in USDC (this pot holds {formatUsdc(value)})</span>
            <input
              value={amountText}
              onChange={(e) => {
                setAmountText(e.target.value);
                setRecheckProblem(null);
                withdrawing.reset();
              }}
              inputMode="decimal"
              placeholder="0.00"
              className={fieldClass}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setAmountText(usdcInputValue(value));
              setRecheckProblem(null);
              withdrawing.reset();
            }}
            className="text-sm underline"
          >
            Withdraw all
          </button>
          {problem && (
            <p role="alert" className="text-sm">
              {problem}
            </p>
          )}
          {valid !== null && (
            <ReviewSheet title="Review your withdrawal" rows={review.rows} warnings={review.warnings}>
              {blocked && (
                <p role="alert" className="mb-2 text-sm">
                  {blocked}
                </p>
              )}
              <StepButton step={withdrawing.step} disabled={!!blocked} onClick={onWithdraw}>
                Withdraw
              </StepButton>
              <p className="mt-2 text-sm">The USDC goes straight back to your wallet.</p>
            </ReviewSheet>
          )}
        </>
      )}
    </section>
  );
}
