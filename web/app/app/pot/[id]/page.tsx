"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Address } from "viem";
import { useConnection, useReadContracts } from "wagmi";
import { ActivityList } from "@/components/ActivityList";
import { AmountCard } from "@/components/AmountCard";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CountUp } from "@/components/CountUp";
import { FlowHeader } from "@/components/FlowHeader";
import { GoalProgress } from "@/components/GoalProgress";
import { BackIcon, ExternalIcon } from "@/components/Icon";
import { KindBadge } from "@/components/KindBadge";
import { LiveDot } from "@/components/LiveDot";
import { RateChart } from "@/components/RateChart";
import { ReviewSheet } from "@/components/ReviewSheet";
import { SavedScreen } from "@/components/SavedScreen";
import { SaveSteps } from "@/components/SaveSteps";
import { StepButton } from "@/components/StepButton";
import { TierChip } from "@/components/TierChip";
import { chain, explorerAddress } from "@/lib/chain";
import { fallbackPotName, KIND_GOAL, PAMO_SAVINGS, pamoSavingsAbi, TIER_KEYS, TIERS } from "@/lib/contract";
import {
  formatApy,
  formatCount,
  formatDate,
  formatEstimate,
  formatUsdc,
  formatUsdcNumber,
  parseUsdc,
  shortAddress,
  usdcInputValue,
  usdcToNumber,
} from "@/lib/format";
import { depositToPot, FEE_RESERVE, withdrawAllFromPot, withdrawFromPot } from "@/lib/tx";
import { usePaused } from "@/lib/usePaused";
import { usePotInfo } from "@/lib/usePotInfo";
import { useSaveReview, useWithdrawReview } from "@/lib/useReview";
import { useStep } from "@/lib/useStep";
import { useUsdcBalance } from "@/lib/useUsdcBalance";
import { useVaults } from "@/lib/useVaults";
import { duration, ease } from "@/motion/tokens";

const pamo = { address: PAMO_SAVINGS, abi: pamoSavingsAbi } as const;

/** What the page is showing: the pot, one of its two flows, or the screen after a transaction confirms. */
type View =
  | { kind: "detail" }
  | { kind: "add" }
  | { kind: "withdraw" }
  | { kind: "done"; mode: "add" | "withdraw"; amount: bigint };

const backLink = (
  <Link
    href="/app"
    className="flex h-11 items-center gap-2 justify-self-start rounded-full border border-grey-line pr-4 pl-3 text-label font-semibold text-black transition-[background-color] duration-150 ease-out hover:bg-grey-surface"
  >
    <BackIcon size={18} />
    Dashboard
  </Link>
);

export default function PotDetail() {
  const params = useParams<{ id: string }>();
  const id = /^\d+$/.test(params.id) ? BigInt(params.id) : null;
  const { address } = useConnection();
  const info = usePotInfo();
  const vaults = useVaults();
  const paused = usePaused().data === true;
  const [view, setView] = useState<View>({ kind: "detail" });
  // The value last shown on the pot's own screen, so it counts from there after a transaction.
  const seen = useRef(0);

  const reads = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...pamo, functionName: "getPot", args: [id ?? 0n] },
      { ...pamo, functionName: "potValue", args: [id ?? 0n] },
      { ...pamo, functionName: "isUnlocked", args: [id ?? 0n] },
    ],
    query: { enabled: id !== null },
  });

  const value = reads.data?.[1];
  useEffect(() => {
    if (view.kind === "detail" && value !== undefined) seen.current = usdcToNumber(value);
  }, [view.kind, value]);

  if (id === null) return <Problem>No such pot.</Problem>;
  if (reads.isPending) return <PotLoading />;
  if (reads.isError) {
    return (
      <Problem tone="error">
        Could not read this pot.{" "}
        <button type="button" onClick={() => reads.refetch()} className="font-semibold underline underline-offset-[3px]">
          Try again
        </button>
      </Problem>
    );
  }

  const [pot, potValue, unlocked] = reads.data;
  if (pot.owner.toLowerCase() !== address?.toLowerCase()) return <Problem>This pot belongs to another wallet.</Problem>;

  const earned = potValue > pot.principal ? potValue - pot.principal : 0n;
  const isGoal = pot.kind === KIND_GOAL;
  const empty = potValue === 0n;
  const tierVault = vaults.data?.tiers[TIER_KEYS[pot.tier]!];
  // A pot keeps the vault it opened in, so the tier's live data only applies while it still points there.
  const vaultInfo = tierVault?.vaultAddress.toLowerCase() === pot.vault.toLowerCase() ? tierVault : null;
  const vaultName = vaultInfo?.name ?? shortAddress(pot.vault);
  const potName = info.byId.get(id.toString())?.name || fallbackPotName(pot.kind, id);
  const tierName = TIERS[pot.tier]!;
  const lockReason = isGoal ? `Locked until ${formatUsdc(pot.target)} or ${formatDate(Number(pot.unlockAt) * 1000)}, whichever comes first.` : "";
  const valueText = formatUsdcNumber(potValue);

  if (view.kind === "done") {
    return (
      <SavedScreen
        title={view.mode === "add" ? "Saved" : "Withdrawn"}
        amount={view.amount}
        line={
          view.mode === "add"
            ? `into ${potName} · ${tierName}.${vaultInfo ? ` Earning at ${formatApy(vaultInfo.apy)} APY today, which changes daily.` : ""}`
            : `Sent to your wallet${address ? `, ${shortAddress(address)}` : ""}.`
        }
        holds={{ potName, value: potValue }}
        viewPot={() => setView({ kind: "detail" })}
        dashboardHref="/app"
      />
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={view.kind}
        // The pot's screen comes back from the left; a flow arrives from the right.
        initial={{ opacity: 0, x: view.kind === "detail" ? -24 : 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: view.kind === "detail" ? -24 : 24 }}
        transition={{ duration: duration.base, ease }}
        className="grid grid-cols-[minmax(0,1fr)]"
      >
        {view.kind === "add" && (
          <AddMoney
            id={id}
            tier={pot.tier}
            vault={pot.vault}
            potName={potName}
            value={potValue}
            apy={vaultInfo?.apy ?? null}
            paused={paused}
            onBack={() => setView({ kind: "detail" })}
            onDone={(amount) => setView({ kind: "done", mode: "add", amount })}
          />
        )}
        {view.kind === "withdraw" && (
          <Withdraw
            id={id}
            pot={pot}
            value={potValue}
            potName={potName}
            cash={vaultInfo ? parseUsdc(vaultInfo.liquidity) : null}
            onBack={() => setView({ kind: "detail" })}
            onDone={(amount) => setView({ kind: "done", mode: "withdraw", amount })}
          />
        )}
        {view.kind === "detail" && (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-7">
            {backLink}
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-x-14">
              <div className="grid grid-cols-[minmax(0,1fr)] gap-7">
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="mr-1.5 min-w-0 text-h2 font-bold tracking-[-0.02em] break-words lg:text-h1">{potName}</h1>
                    <KindBadge kind={pot.kind} />
                    <TierChip tier={pot.tier} />
                  </div>
                  <p className="flex flex-wrap items-baseline gap-x-3">
                    <span
                      className={`font-bold tracking-[-0.03em] tabular-nums ${
                        valueText.length > 11 ? "text-h1 lg:text-display" : "text-display lg:text-balance"
                      }`}
                    >
                      <CountUp value={usdcToNumber(potValue)} format={formatCount} final={valueText} from={seen.current} />
                    </span>
                    <span className="text-h3 font-semibold text-grey-text">USDC</span>
                  </p>
                  <dl className="flex flex-wrap gap-x-10 gap-y-3">
                    <div className="grid gap-0.5">
                      <dt className="text-caption text-grey-text">Put in</dt>
                      <dd className="text-h3 font-bold tabular-nums">{formatUsdc(pot.principal)}</dd>
                    </div>
                    <div className="grid gap-0.5">
                      <dt className="text-caption text-grey-text">Earned</dt>
                      <dd className="text-h3 font-bold text-green tabular-nums">+{formatUsdc(earned)}</dd>
                    </div>
                  </dl>
                </div>

                {isGoal && !empty && (
                  <GoalProgress value={potValue} target={pot.target} unlockAt={pot.unlockAt} unlocked={unlocked} />
                )}

                {empty && (
                  <div className="grid gap-1 rounded-card bg-grey-surface px-5 py-4.5">
                    <b className="text-body font-bold">This pot is empty.</b>
                    <p className="text-label text-grey-text">The pot stays here. Add money whenever you like.</p>
                  </div>
                )}

                {paused && <PausedNote />}

                <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
                  <Button size="lg" disabled={paused} onClick={() => setView({ kind: "add" })}>
                    Add money
                  </Button>
                  <Button size="lg" variant="outline" disabled={!unlocked || empty} onClick={() => setView({ kind: "withdraw" })}>
                    Withdraw
                  </Button>
                  {(!unlocked || empty) && (
                    <p className="text-label text-grey-text sm:flex-[1_1_12rem]">
                      {empty ? "Nothing to withdraw. This pot is empty." : lockReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 md:items-start xl:row-span-2 xl:grid-cols-[minmax(0,1fr)]">
                <Card className="px-5 py-1">
                  <dl>
                    <div className="flex items-center justify-between gap-3 py-3.5 text-label">
                      <dt className="text-grey-text">Portfolio</dt>
                      <dd>
                        <TierChip tier={pot.tier} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-grey-line py-3.5 text-label">
                      <dt className="shrink-0 text-grey-text">Vault</dt>
                      <dd className="grid justify-items-end gap-0.5 text-right">
                        <span className="font-semibold">{vaultName}</span>
                        <a
                          href={explorerAddress(pot.vault)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-caption font-semibold text-green underline hover:text-green-pressed"
                        >
                          View on explorer
                          <ExternalIcon size={12} />
                        </a>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-grey-line py-3.5 text-label">
                      <dt className="text-grey-text">APY today</dt>
                      <dd className="inline-flex items-center gap-2 font-semibold tabular-nums">
                        {vaultInfo ? (
                          <>
                            <LiveDot live={!vaults.isError} />
                            {formatApy(vaultInfo.apy)} · changes daily
                          </>
                        ) : (
                          <span className="font-normal text-grey-text">Unavailable right now</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </Card>
                <Card className="grid gap-3 p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-label font-bold">{tierName} rate</h2>
                    <span className="text-caption text-grey-text">Last 7 days</span>
                  </div>
                  <RateChart tier={TIER_KEYS[pot.tier]!} />
                  <p className="text-caption text-grey-text">This is the vault’s rate, not your earnings.</p>
                </Card>
              </div>

              <ActivityList potId={id} />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/** A flow's own screen: header, heading, the form, and the Review button pinned to the bottom on phones. */
function Flow({
  title,
  potName,
  heading,
  lead,
  onBack,
  canReview,
  onReview,
  children,
}: {
  title: string;
  potName: string;
  heading: string;
  lead: string;
  onBack: () => void;
  canReview: boolean;
  onReview: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-140 grid-cols-[minmax(0,1fr)] gap-6">
      <FlowHeader title={title} subtitle={potName} onBack={onBack} backLabel="Pot" cancel={onBack} />
      <div className="grid gap-2 lg:pt-6">
        <h1 className="text-h1 font-bold tracking-[-0.03em] lg:text-balance">{heading}</h1>
        <p className="text-body text-grey-text">{lead}</p>
      </div>
      {children}
      <div className="sticky bottom-0 -mx-4 border-t border-grey-line bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] lg:static lg:mx-0 lg:flex lg:justify-end lg:border-0 lg:p-0">
        <Button size="lg" disabled={!canReview} onClick={onReview} className="w-full lg:w-auto lg:min-w-44">
          Review
        </Button>
      </div>
    </div>
  );
}

/** A problem with an amount: what is wrong, and what to do about it. */
function AmountProblem({ message, help }: { message: string; help?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration.base, ease }}>
      <Banner tone="error">
        <b className="block font-semibold">{message}</b>
        {help}
      </Banner>
    </motion.div>
  );
}

function AddMoney({
  id,
  tier,
  vault,
  potName,
  value,
  apy,
  paused,
  onBack,
  onDone,
}: {
  id: bigint;
  tier: number;
  vault: Address;
  potName: string;
  value: bigint;
  /** Today's rate for this pot's vault, or null when live rates are unavailable. */
  apy: number | null;
  /** New savings are paused: nothing can be added until that ends. */
  paused: boolean;
  onBack: () => void;
  onDone: (amount: bigint) => void;
}) {
  const { address } = useConnection();
  const balance = useUsdcBalance();
  const [amountText, setAmountText] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const amount = parseUsdc(amountText);
  const overBalance = amount !== null && balance.data !== undefined && amount > balance.data;

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

  const maxText = balance.data !== undefined && balance.data > FEE_RESERVE ? usdcInputValue(balance.data - FEE_RESERVE) : null;

  return (
    <Flow
      title="Add money"
      potName={potName}
      heading="How much do you want to add?"
      lead={`Into ${potName} · ${TIERS[tier]}${apy !== null ? `, at ${formatApy(apy)} APY today. The rate changes daily.` : "."}`}
      onBack={onBack}
      canReview={valid !== null && !paused}
      onReview={() => setReviewing(true)}
    >
      {paused && <PausedNote />}
      <AmountCard
        label="You add"
        value={amountText}
        onChange={setAmountText}
        invalid={!!problem}
        footer={balance.data !== undefined ? `In your wallet: ${formatUsdc(balance.data)}` : "Reading your wallet…"}
        max={maxText ? { value: maxText, hint: `Add the most you can, keeping ${formatUsdc(FEE_RESERVE)} for network fees` } : null}
      />
      {problem ? (
        <AmountProblem
          message={overBalance ? `That is more than the ${formatUsdc(balance.data!)} in your wallet.` : problem}
          help={overBalance && address ? `Send USDC to ${shortAddress(address)} on ${chain.name}, then come back.` : undefined}
        />
      ) : (
        valid !== null && (
          <p className="text-label text-grey-text tabular-nums">
            {maxText !== null && amountText === maxText && `Max keeps ${formatUsdc(FEE_RESERVE)} back for network fees. `}
            {potName} would hold {formatUsdc(value + valid)}.
            {apy !== null && ` Estimate for 1 year at today’s rate: +${formatEstimate(usdcToNumber(valid) * apy)}, not a promise.`}
          </p>
        )
      )}

      <AnimatePresence>
        {reviewing && valid !== null && (
          <ReviewSheet key="review" title="Review your saving" rows={review.rows} warnings={review.warnings} onClose={() => setReviewing(false)}>
            <SaveSteps
              amount={valid}
              beforeSend={review.refresh}
              save={async (onSent) => {
                await depositToPot(id, valid, onSent);
              }}
              onSaved={() => onDone(valid)}
            />
          </ReviewSheet>
        )}
      </AnimatePresence>
    </Flow>
  );
}

function Withdraw({
  id,
  pot,
  value,
  potName,
  cash,
  onBack,
  onDone,
}: {
  id: bigint;
  pot: { vault: Address; shares: bigint };
  value: bigint;
  potName: string;
  /** USDC the vault can pay out right now, when that is known. */
  cash: bigint | null;
  onBack: () => void;
  onDone: (amount: bigint) => void;
}) {
  const { address } = useConnection();
  const queryClient = useQueryClient();
  const withdrawing = useStep();
  const [amountText, setAmountText] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [recheckProblem, setRecheckProblem] = useState<string | null>(null);
  const amount = parseUsdc(amountText);
  const overValue = amount !== null && amount > value;

  let problem: string | null = null;
  if (amountText.trim() !== "" && amount === null) problem = "Enter an amount in USDC, with up to 6 decimals.";
  else if (amount !== null && amount > value) problem = `This pot holds ${formatUsdc(value)}.`;

  const valid = problem ? null : amount;
  const review = useWithdrawReview({ id, pot, value, amount: valid });
  const blocked = review.blocked ?? recheckProblem;
  // The most that can leave right now: everything in the pot, unless the vault is short on cash.
  const available = cash !== null && cash < value ? cash : value;

  const setAmount = (text: string) => {
    setAmountText(text);
    setRecheckProblem(null);
    withdrawing.reset();
  };

  async function onWithdraw() {
    if (valid === null) return;
    setRecheckProblem(null);
    // The quote is read again right before the wallet opens: the vault's cash can change.
    const stillShort = await review.recheck().catch(() => null);
    if (stillShort) {
      setReviewing(false);
      return setRecheckProblem(stillShort);
    }
    // Taking the whole value goes through withdrawAll, so no dust is left behind.
    const result = await withdrawing.run((onSent) =>
      valid >= value ? withdrawAllFromPot(id, onSent) : withdrawFromPot(id, valid, onSent),
    );
    if (!result.ok) return;
    await queryClient.invalidateQueries();
    onDone(valid);
  }

  return (
    <Flow
      title="Withdraw"
      potName={potName}
      heading="How much do you want to withdraw?"
      lead={`From ${potName}. It goes back to your wallet${address ? `, ${shortAddress(address)}` : ""}.`}
      onBack={onBack}
      canReview={valid !== null && !blocked}
      onReview={() => setReviewing(true)}
    >
      <AmountCard
        label="You withdraw"
        value={amountText}
        onChange={setAmount}
        invalid={!!problem || !!blocked}
        footer={`Available now: ${formatUsdc(available)}`}
        max={{ value: usdcInputValue(available), hint: `Withdraw the most available now, ${formatUsdc(available)}` }}
      />
      {problem ? (
        <AmountProblem
          message={overValue ? `That is more than the ${formatUsdc(value)} in this pot.` : problem}
          help={overValue ? "Use Max to take out everything." : undefined}
        />
      ) : blocked ? (
        <AmountProblem message={blocked} help="Your money is still in the pot. The vault frees up cash as borrowers repay." />
      ) : (
        valid !== null && (
          <p className="text-label text-grey-text tabular-nums">
            {potName} would hold {formatUsdc(valid >= value ? 0n : value - valid)} after this.
          </p>
        )
      )}

      <AnimatePresence>
        {reviewing && valid !== null && !blocked && (
          <ReviewSheet key="review" title="Review your withdrawal" rows={review.rows} warnings={review.warnings} onClose={() => setReviewing(false)}>
            <StepButton step={withdrawing.step} onClick={onWithdraw}>
              Withdraw
            </StepButton>
            <p className="text-center text-caption text-grey-text">The USDC goes straight back to your wallet.</p>
          </ReviewSheet>
        )}
      </AnimatePresence>
    </Flow>
  );
}

/** New savings are paused across Pamo. Withdrawing is never paused. */
function PausedNote() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration.base, ease }}>
      <Banner tone="caution">
        <b className="block font-semibold">New savings are paused</b>
        Money already saved can still be withdrawn. Try adding again later.
      </Banner>
    </motion.div>
  );
}

/** The pot could not be shown: a way back, and why. */
function Problem({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  return (
    <div className="grid gap-5">
      {backLink}
      <Banner tone={tone}>{children}</Banner>
    </div>
  );
}

function PotLoading() {
  return (
    <div role="status" aria-label="Loading this pot" className="grid animate-pulse gap-7">
      <div className="h-11 w-36 rounded-full bg-grey-surface" />
      <div className="h-10 w-64 rounded-sm bg-grey-surface" />
      <div className="h-16 w-80 max-w-full rounded-sm bg-grey-surface" />
      <div className="h-40 rounded-card bg-grey-surface" />
    </div>
  );
}
