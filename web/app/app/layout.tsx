"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { ChainStatus } from "@/components/ChainStatus";
import { AddIcon, CalculatorIcon, HomeIcon, MenuIcon, PortfoliosIcon, WalletIcon, WarningIcon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/MobileMenu";
import { LevelMark } from "@/components/TierChip";
import { WalletChip } from "@/components/WalletChip";
import { chain } from "@/lib/chain";
import { fallbackPotName } from "@/lib/contract";
import { formatUsdc } from "@/lib/format";
import { usePotInfo } from "@/lib/usePotInfo";
import { usePots } from "@/lib/usePots";
import { useUsdcBalance } from "@/lib/useUsdcBalance";
import { useVaults } from "@/lib/useVaults";
import { fade, rise } from "@/motion/variants";

const NAV = [
  { href: "/app", label: "Dashboard", Glyph: HomeIcon },
  { href: "/portfolios", label: "Portfolios", Glyph: PortfoliosIcon },
  { href: "/calculator", label: "Calculator", Glyph: CalculatorIcon },
];

const rowClass =
  "flex h-11 items-center gap-3 rounded-sm px-3 text-label transition-[background-color] duration-150 ease-out hover:bg-grey-surface";

// Guards that wrap every /app route (Architecture §8.3).
export default function AppLayout({ children }: { children: ReactNode }) {
  const { address, chainId, status } = useConnection();
  const { disconnect } = useDisconnect();
  const balance = useUsdcBalance();
  const vaults = useVaults();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // The server cannot know the wallet, so the first paint waits instead of flashing the connect screen.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onArc = chainId === chain.id;
  const loading = !mounted || status === "connecting" || status === "reconnecting";

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-black px-5 py-3 text-label font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh w-65 shrink-0 flex-col gap-8 overflow-y-auto border-r border-grey-line px-4 pt-7 pb-6 lg:flex">
        <Link href="/app" className="px-3 text-black">
          <Logo className="h-7.5 w-auto" />
        </Link>
        <nav aria-label="Main" className="grid gap-1">
          {NAV.map(({ href, label, Glyph }) => {
            const here = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={here ? "page" : undefined}
                className={`${rowClass} ${here ? "bg-grey-surface font-semibold text-black" : "text-grey-text"}`}
              >
                <Glyph variant={here ? "Bold" : "Linear"} />
                {label}
              </Link>
            );
          })}
        </nav>
        <SidebarPots connected={!!address && onArc} pathname={pathname} />
        <div className="mt-auto grid gap-3">
          {loading ? null : address ? (
            <>
              <div className="flex items-center justify-between gap-2 px-1">
                <WalletChip address={address} onArc={onArc} onDisconnect={() => disconnect()} />
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="text-caption font-semibold text-grey-text transition-[color] duration-150 ease-out hover:text-black"
                >
                  Disconnect
                </button>
              </div>
              {onArc && balance.data !== undefined && (
                <p className="flex flex-wrap justify-between gap-x-2 px-2 text-caption">
                  <span className="text-grey-text">In wallet</span>
                  <span className="font-semibold tabular-nums">{formatUsdc(balance.data)}</span>
                </p>
              )}
              {!onArc && (
                <p className="flex items-center gap-1.5 px-2 text-caption font-semibold text-caution">
                  <WarningIcon size={16} />
                  Wrong network
                </p>
              )}
            </>
          ) : (
            <p className="px-2 text-caption text-grey-text">No wallet connected.</p>
          )}
          <div className="border-t border-grey-line px-2 pt-3">
            <ChainStatus />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="box-content flex h-15 shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)] lg:hidden">
          <Link href="/app" className="text-black">
            <Logo className="h-7 w-auto" />
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => setMenuOpen(true)}
            className="flex size-11 items-center justify-center rounded-full border border-grey-line transition-[background-color] duration-150 ease-out hover:bg-grey-surface"
          >
            <MenuIcon />
          </button>
        </header>

        <main id="main" className="mx-auto grid w-full grid-cols-[minmax(0,1fr)] max-w-295 flex-1 content-start gap-5 px-4 pt-2 pb-10 lg:gap-7 lg:px-12 lg:pt-9 lg:pb-16">
          {vaults.isError && (
            <motion.div variants={fade} initial="hidden" animate="visible">
              <Banner>
                <b className="font-semibold">Live rates unavailable.</b>{" "}
                <span className="text-grey-text">Saving and withdrawing still work.</span>
              </Banner>
            </motion.div>
          )}
          {loading ? <ShellLoading /> : !address ? <ConnectWallet /> : !onArc ? <SwitchToArc /> : children}
        </main>

        <footer className="px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] lg:hidden">
          <ChainStatus />
        </footer>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        address={address}
        balance={onArc ? balance.data : undefined}
        onDisconnect={() => {
          disconnect();
          setMenuOpen(false);
        }}
      />
    </div>
  );
}

/** The owner's pots in the sidebar, each with its tier's level mark. */
function SidebarPots({ connected, pathname }: { connected: boolean; pathname: string }) {
  const pots = usePots();
  const info = usePotInfo();
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-1">
      <h2 className="px-3 pb-1 text-caption font-semibold text-grey-text">Your pots</h2>
      {!connected ? (
        <p className="px-3 text-label text-grey-text">Connect to see your pots.</p>
      ) : !pots.data ? null : pots.data.length === 0 ? (
        <p className="px-3 text-label text-grey-text">No pots yet.</p>
      ) : (
        pots.data.map(({ id, pot }) => {
          const href = `/app/pot/${id}`;
          const here = pathname === href;
          return (
            <Link
              key={id.toString()}
              href={href}
              aria-current={here ? "page" : undefined}
              className={`${rowClass} min-w-0 justify-between text-black ${here ? "bg-mint font-semibold hover:bg-mint" : ""}`}
            >
              <span title={info.byId.get(id.toString())?.name || fallbackPotName(pot.kind, id)} className="min-w-0 truncate">
                {info.byId.get(id.toString())?.name || fallbackPotName(pot.kind, id)}
              </span>
              <span className="shrink-0">
                <LevelMark tier={pot.tier} />
              </span>
            </Link>
          );
        })
      )}
      {connected && (
        <Link
          href="/app/new"
          aria-current={pathname === "/app/new" ? "page" : undefined}
          className={`${rowClass} text-black ${pathname === "/app/new" ? "bg-mint font-semibold hover:bg-mint" : ""}`}
        >
          <AddIcon size={18} />
          New pot
        </Link>
      )}
    </div>
  );
}

function ShellLoading() {
  return (
    <div role="status" aria-label="Loading" className="grid animate-pulse gap-5 lg:gap-7">
      <div className="h-10 w-56 rounded-sm bg-grey-surface" />
      <div className="h-32 rounded-card bg-grey-surface" />
      <div className="h-24 rounded-card bg-grey-surface" />
    </div>
  );
}

/** The centred block both guards share: wallet mark, heading, one line, one green button. */
function Guard({ caution, title, body, action, foot }: { caution?: string; title: string; body: string; action: ReactNode; foot: string }) {
  return (
    <div className="flex lg:min-h-[70dvh] lg:items-center lg:justify-center">
      <motion.section
        variants={rise}
        initial="hidden"
        animate="visible"
        className="grid w-full max-w-120 justify-items-start gap-5 px-2 pt-16 lg:px-0 lg:pt-0"
      >
        <span className="flex size-14 items-center justify-center rounded-full border border-grey-line lg:size-16">
          <WalletIcon size={26} />
        </span>
        {caution && (
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-caution-fill px-2.5 py-1.5 text-caption font-semibold text-caution">
            <WarningIcon size={16} />
            {caution}
          </span>
        )}
        <h1 className="text-h1 font-bold tracking-[-0.02em] lg:text-balance lg:tracking-[-0.03em]">{title}</h1>
        <p className="text-body text-grey-text">{body}</p>
        {action}
        <p className="text-label text-grey-text">
          {foot}{" "}
          <Link href="/portfolios" className="text-green underline hover:text-green-pressed">
            Portfolios
          </Link>{" "}
          and the{" "}
          <Link href="/calculator" className="text-green underline hover:text-green-pressed">
            Calculator
          </Link>{" "}
          work without a wallet.
        </p>
      </motion.section>
    </div>
  );
}

function ConnectWallet() {
  const connectors = useConnectors();
  const { connect, isPending, error } = useConnect();
  return (
    <Guard
      title="Connect your wallet"
      body="Pamo reads your pots from your wallet address. Nothing moves until you confirm it in your wallet."
      foot="No wallet yet?"
      action={
        <div className="grid w-full gap-3 lg:w-auto">
          <div className="grid gap-2.5 lg:flex lg:flex-wrap">
            {connectors.map((connector, i) => (
              <Button
                key={connector.uid}
                size="lg"
                // One green button per screen: any further wallet is an outline.
                variant={i === 0 ? "primary" : "outline"}
                disabled={isPending}
                onClick={() => connect({ connector, chainId: chain.id })}
              >
                {isPending ? "Check your wallet…" : connectors.length === 1 ? "Connect wallet" : connector.name}
              </Button>
            ))}
          </div>
          {error && (
            <p role="alert" className="text-label text-error">
              Could not connect. Open your wallet and try again.
            </p>
          )}
        </div>
      }
    />
  );
}

function SwitchToArc() {
  const { switchChain, isPending, error } = useSwitchChain();
  return (
    <Guard
      caution="Wrong network"
      title={`Pamo is currently on ${chain.name}`}
      body={`Your wallet is on a different network. Switch to ${chain.name} to see and use your pots.`}
      foot="Your pots are safe."
      action={
        <div className="grid w-full gap-3 lg:w-auto">
          <Button size="lg" disabled={isPending} onClick={() => switchChain({ chainId: chain.id })} className="lg:justify-self-start">
            {isPending ? "Check your wallet…" : `Switch to ${chain.name}`}
          </Button>
          {error && (
            <p role="alert" className="text-label text-error">
              Could not switch. Add {chain.name} in your wallet (chain ID {chain.id}, RPC {chain.rpcUrls.default.http[0]}) and try
              again.
            </p>
          )}
        </div>
      }
    />
  );
}
