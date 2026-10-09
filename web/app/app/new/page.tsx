"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SaveSteps } from "@/components/SaveSteps";
import { KIND_ANYTIME, TIER_KEYS, TIERS } from "@/lib/contract";
import { formatApy, formatUsdc, parseUsdc } from "@/lib/format";
import { openPot } from "@/lib/tx";
import { useUsdcBalance } from "@/lib/useUsdcBalance";
import { useVaults } from "@/lib/useVaults";

const MAX_NAME_BYTES = 64;

// Phase 3 version: one form for an Anytime Vault. The stepper and Goal pots come in Phase 4.
export default function NewPot() {
  const router = useRouter();
  const balance = useUsdcBalance();
  const vaults = useVaults();
  const [name, setName] = useState("");
  const [tier, setTier] = useState(0);
  const [amountText, setAmountText] = useState("");
  const newId = useRef<bigint | null>(null);

  const amount = parseUsdc(amountText);
  const nameTooLong = new TextEncoder().encode(name.trim()).length > MAX_NAME_BYTES;
  const overBalance = amount !== null && balance.data !== undefined && amount > balance.data;

  let problem: string | null = null;
  if (amountText.trim() !== "" && amount === null) problem = "Enter an amount in USDC, with up to 6 decimals.";
  else if (overBalance) problem = `You have ${formatUsdc(balance.data!)} in your wallet.`;
  else if (nameTooLong) problem = "That name is too long.";

  return (
    <div className="space-y-5">
      <Link href="/app" className="text-sm underline">
        Back
      </Link>
      <h1 className="text-2xl font-bold">New Anytime Vault</h1>
      <p>Save USDC and take it out whenever you want.</p>

      <label className="block">
        <span className="text-sm">Name (optional). Names are public on Arc.</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rainy day"
          className="mt-1 block w-full rounded border border-black px-3 py-2"
        />
      </label>

      <fieldset>
        <legend className="text-sm">Portfolio (a USDC lending vault)</legend>
        <div className="mt-1 space-y-1">
          {TIERS.map((label, i) => {
            const vault = vaults.data?.tiers[TIER_KEYS[i]!];
            return (
              <label key={label} className="flex items-center gap-2">
                <input type="radio" name="tier" checked={tier === i} onChange={() => setTier(i)} />
                <span className="font-semibold">{label}</span>
                {vault && <span className="text-sm tabular-nums">{formatApy(vault.apy)} APY today, changes daily</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

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
          if (amount === null) return;
          newId.current = await openPot(
            { kind: KIND_ANYTIME, tier, target: 0n, unlockAt: 0n, name: name.trim(), amount },
            onSent,
          );
        }}
        onSaved={() => router.push(newId.current !== null ? `/app/pot/${newId.current}` : "/app")}
      />
    </div>
  );
}
