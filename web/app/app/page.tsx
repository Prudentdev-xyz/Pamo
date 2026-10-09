"use client";

import Link from "next/link";
import { useConnection, useReadContract } from "wagmi";
import { fallbackPotName, KIND_GOAL, KINDS, PAMO_SAVINGS, pamoSavingsAbi, TIER_KEYS, TIERS } from "@/lib/contract";
import { formatApy, formatUsdc } from "@/lib/format";
import { useVaults } from "@/lib/useVaults";

export default function Dashboard() {
  const { address } = useConnection();
  const vaults = useVaults();
  const pots = useReadContract({
    address: PAMO_SAVINGS,
    abi: pamoSavingsAbi,
    functionName: "getPots",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (pots.isPending) return <p>Loading your savings…</p>;
  if (pots.isError) {
    return (
      <p role="alert">
        Could not read your savings from Arc.{" "}
        <button type="button" onClick={() => pots.refetch()} className="underline">
          Try again
        </button>
      </p>
    );
  }

  const totalSaved = pots.data.reduce((sum, p) => sum + p.value, 0n);
  const totalPutIn = pots.data.reduce((sum, p) => sum + p.pot.principal, 0n);
  // A fresh deposit is worth a micro-USDC less than what was put in, so earned never shows below zero.
  const earned = totalSaved > totalPutIn ? totalSaved - totalPutIn : 0n;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm">Total saved</p>
        <p className="text-4xl font-bold tabular-nums">{formatUsdc(totalSaved)}</p>
        <p className="mt-1 tabular-nums">Earned so far: {formatUsdc(earned)}</p>
      </section>

      {vaults.data && (
        <section>
          <p className="text-sm">APY today, changes daily</p>
          <ul className="mt-1 flex flex-wrap gap-x-6 gap-y-1 tabular-nums">
            {TIERS.map((tier, i) => {
              const vault = vaults.data.tiers[TIER_KEYS[i]!];
              return (
                <li key={tier}>
                  {tier}: {vault ? formatApy(vault.apy) : "unavailable"}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Link
        href="/app/new"
        className="inline-block rounded border border-black bg-black px-4 py-2 font-semibold text-white"
      >
        New Anytime Vault
      </Link>

      <section>
        <h2 className="font-semibold">Your pots</h2>
        {pots.data.length === 0 ? (
          <p className="mt-2">Nothing saved yet. Start with any amount.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {pots.data.map(({ id, pot, value, unlocked }) => (
              <li key={id.toString()}>
                <Link href={`/app/pot/${id}`} className="block rounded border border-black px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{fallbackPotName(pot.kind, id)}</span>
                    <span className="font-semibold tabular-nums">{formatUsdc(value)}</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-3 text-sm">
                    <span>
                      {KINDS[pot.kind]} · {TIERS[pot.tier]}
                      {pot.kind === KIND_GOAL && (unlocked ? " · unlocked" : " · locked")}
                    </span>
                    <span className="tabular-nums">
                      Earned {formatUsdc(value > pot.principal ? value - pot.principal : 0n)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
