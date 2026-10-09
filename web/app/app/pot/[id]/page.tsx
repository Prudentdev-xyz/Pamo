"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useConnection, useReadContracts } from "wagmi";
import { SaveSteps } from "@/components/SaveSteps";
import { StepButton } from "@/components/StepButton";
import { explorerAddress } from "@/lib/chain";
import { fallbackPotName, KIND_GOAL, KINDS, PAMO_SAVINGS, pamoSavingsAbi, TIERS } from "@/lib/contract";
import { formatUsdc, parseUsdc, shortAddress } from "@/lib/format";
import { depositToPot, withdrawAllFromPot, withdrawFromPot } from "@/lib/tx";
import { useStep } from "@/lib/useStep";
import { useUsdcBalance } from "@/lib/useUsdcBalance";

const pamo = { address: PAMO_SAVINGS, abi: pamoSavingsAbi } as const;

export default function PotDetail() {
  const params = useParams<{ id: string }>();
  const id = /^\d+$/.test(params.id) ? BigInt(params.id) : null;
  const { address } = useConnection();

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

  return (
    <div className="space-y-6">
      {back}
      <section>
        <h1 className="text-2xl font-bold">{fallbackPotName(pot.kind, id)}</h1>
        <p className="text-sm">
          {KINDS[pot.kind]} · {TIERS[pot.tier]} · vault{" "}
          <a href={explorerAddress(pot.vault)} target="_blank" rel="noreferrer" className="underline">
            {shortAddress(pot.vault)}
          </a>
        </p>
        <p className="mt-3 text-4xl font-bold tabular-nums">{formatUsdc(value)}</p>
        <p className="mt-1 tabular-nums">
          Put in: {formatUsdc(pot.principal)} · Earned: {formatUsdc(earned)}
        </p>
      </section>

      <AddMoney id={id} />
      <Withdraw id={id} value={value} locked={!unlocked} lockReason={lockReason(pot)} />
    </div>
  );
}

function lockReason(pot: { kind: number; target: bigint; unlockAt: bigint }) {
  if (pot.kind !== KIND_GOAL) return "";
  const date = new Date(Number(pot.unlockAt) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `Unlocks when you reach ${formatUsdc(pot.target)} or on ${date}.`;
}

function AddMoney({ id }: { id: bigint }) {
  const balance = useUsdcBalance();
  const [amountText, setAmountText] = useState("");
  const amount = parseUsdc(amountText);

  let problem: string | null = null;
  if (amountText.trim() !== "" && amount === null) problem = "Enter an amount in USDC, with up to 6 decimals.";
  else if (amount !== null && balance.data !== undefined && amount > balance.data)
    problem = `You have ${formatUsdc(balance.data)} in your wallet.`;

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
          className="mt-1 block w-full rounded border border-black px-3 py-2 tabular-nums"
        />
      </label>
      {problem && (
        <p role="alert" className="text-sm">
          {problem}
        </p>
      )}
      <SaveSteps
        amount={problem ? null : amount}
        save={async (onSent) => {
          if (amount !== null) await depositToPot(id, amount, onSent);
        }}
        onSaved={() => setAmountText("")}
      />
    </section>
  );
}

function Withdraw({
  id,
  value,
  locked,
  lockReason,
}: {
  id: bigint;
  value: bigint;
  locked: boolean;
  lockReason: string;
}) {
  const queryClient = useQueryClient();
  const part = useStep();
  const all = useStep();
  const [amountText, setAmountText] = useState("");
  const amount = parseUsdc(amountText);
  const busy = part.step.status === "pending" || all.step.status === "pending";
  const empty = value === 0n;

  let problem: string | null = null;
  if (amountText.trim() !== "" && amount === null) problem = "Enter an amount in USDC, with up to 6 decimals.";
  else if (amount !== null && amount > value) problem = `This pot holds ${formatUsdc(value)}.`;

  async function onWithdraw() {
    if (amount === null) return;
    all.reset();
    // Taking the whole value goes through withdrawAll, so no dust is left behind.
    const result = await part.run((onSent) =>
      amount >= value ? withdrawAllFromPot(id, onSent) : withdrawFromPot(id, amount, onSent),
    );
    if (!result.ok) return;
    setAmountText("");
    await queryClient.invalidateQueries();
  }

  async function onWithdrawAll() {
    part.reset();
    const result = await all.run((onSent) => withdrawAllFromPot(id, onSent));
    if (result.ok) await queryClient.invalidateQueries();
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
              onChange={(e) => setAmountText(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="mt-1 block w-full rounded border border-black px-3 py-2 tabular-nums"
            />
          </label>
          {problem && (
            <p role="alert" className="text-sm">
              {problem}
            </p>
          )}
          <StepButton step={part.step} disabled={amount === null || !!problem || busy} onClick={onWithdraw}>
            Withdraw
          </StepButton>
          <StepButton step={all.step} disabled={busy} onClick={onWithdrawAll}>
            Withdraw all
          </StepButton>
          <p className="text-sm">The USDC goes straight back to your wallet.</p>
        </>
      )}
    </section>
  );
}
