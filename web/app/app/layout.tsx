"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { chain } from "@/lib/chain";
import { formatUsdc, shortAddress } from "@/lib/format";
import { useUsdcBalance } from "@/lib/useUsdcBalance";
import { useVaults } from "@/lib/useVaults";

// Guards that wrap every /app route (Architecture §8.3).
export default function AppLayout({ children }: { children: ReactNode }) {
  const { address, chainId, status } = useConnection();
  const { disconnect } = useDisconnect();
  const balance = useUsdcBalance();
  const vaults = useVaults();

  const onArc = chainId === chain.id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-3">
        <div className="flex items-center gap-4">
          <Link href="/app" aria-label="Pamo" className="text-xl font-bold">
            Pamọ́
          </Link>
          <Link href="/portfolios" className="text-sm underline">
            Portfolios
          </Link>
          <Link href="/calculator" className="text-sm underline">
            Calculator
          </Link>
        </div>
        {address && (
          <div className="flex items-center gap-3 text-sm">
            {onArc && balance.data !== undefined && <span>In wallet: {formatUsdc(balance.data)}</span>}
            <span>{shortAddress(address)}</span>
            <button type="button" onClick={() => disconnect()} className="underline">
              Disconnect
            </button>
          </div>
        )}
      </header>

      {vaults.isError && (
        <p role="status" className="mt-3 border border-black px-3 py-2 text-sm">
          Live rates unavailable. Saving and withdrawing still work.
        </p>
      )}

      <main className="py-6">
        {status === "connecting" || status === "reconnecting" ? (
          <p>Loading…</p>
        ) : !address ? (
          <ConnectWallet />
        ) : !onArc ? (
          <SwitchToArc />
        ) : (
          children
        )}
      </main>
    </div>
  );
}

function ConnectWallet() {
  const connectors = useConnectors();
  const { connect, isPending, error } = useConnect();
  return (
    <section>
      <h1 className="text-2xl font-bold">Connect your wallet</h1>
      <p className="mt-1">Pamo never holds your keys. You sign every saving and every withdrawal.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            type="button"
            disabled={isPending}
            onClick={() => connect({ connector, chainId: chain.id })}
            className="rounded border border-black px-4 py-2 font-semibold disabled:opacity-40"
          >
            {connector.name === "Injected" ? "Browser wallet" : connector.name}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm">
          Could not connect. Open your wallet and try again.
        </p>
      )}
    </section>
  );
}

function SwitchToArc() {
  const { switchChain, isPending, error } = useSwitchChain();
  return (
    <section>
      <h1 className="text-2xl font-bold">Pamo runs on Arc</h1>
      <p className="mt-1">Your wallet is on another network.</p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchChain({ chainId: chain.id })}
        className="mt-4 rounded border border-black bg-black px-4 py-2 font-semibold text-white disabled:opacity-40"
      >
        {isPending ? "Check your wallet…" : `Switch to ${chain.name}`}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm">
          Could not switch. Add {chain.name} in your wallet (chain ID {chain.id}, RPC {chain.rpcUrls.default.http[0]})
          and try again.
        </p>
      )}
    </section>
  );
}
