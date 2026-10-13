"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { use, useEffect, useReducer, useState } from "react";
import { useConnection } from "wagmi";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { DateField } from "@/components/DateField";
import { Field } from "@/components/Field";
import { BackIcon, CopyIcon, LockIcon, TickIcon, UnlockIcon } from "@/components/Icon";
import { KindBadge } from "@/components/KindBadge";
import { ReviewSheet } from "@/components/ReviewSheet";
import { SavedScreen } from "@/components/SavedScreen";
import { SaveSteps } from "@/components/SaveSteps";
import { Stepper } from "@/components/Stepper";
import { TierChip } from "@/components/TierChip";
import { TierPicker } from "@/components/TierPicker";
import { chain } from "@/lib/chain";
import { KIND_ANYTIME, KIND_GOAL, MAX_NAME_BYTES, PAMO_SAVINGS, pamoSavingsAbi, TIER_KEYS, TIERS } from "@/lib/contract";
import { formatApy, formatDate, formatEstimate, formatUsdc, parseUsdc, shortAddress, usdcInputValue, usdcToNumber } from "@/lib/format";
import { earliestUnlockDate, initialNewPot, newPotReducer, newPotSteps, unlockAtFromDate } from "@/lib/newPot";
import { LENDING_NOTE } from "@/lib/tiers";
import { openPot } from "@/lib/tx";
import { usePaused } from "@/lib/usePaused";
import { useSaveReview } from "@/lib/useReview";
import { useUsdcBalance } from "@/lib/useUsdcBalance";
import { useVaults } from "@/lib/useVaults";
import { duration, ease } from "@/motion/tokens";

const KINDS = [
  { kind: KIND_ANYTIME, label: "Anytime Vault", line: "Save USDC and take it out whenever you want.", Glyph: UnlockIcon },
  {
    kind: KIND_GOAL,
    label: "Goal Vault",
    line: "Save toward a target. It stays locked until you reach the target or the date you pick.",
    Glyph: LockIcon,
  },
];

const HEADINGS = {
  type: ["What kind of pot?", "You can make as many pots as you like."],
  goal: ["Name your goal", "Set what you are saving for and when it unlocks."],
  tier: ["Choose a portfolio", LENDING_NOTE],
  amount: ["How much to save?", "Start with any amount. You can add more later."],
} as const;

// Network fees are paid in USDC, so Max holds this much back: several times what an Allow and a Save cost.
const FEE_RESERVE = 100_000n; // 0.10 USDC

// Where to send someone who needs USDC: the faucet while Pamo runs on a test network.
const GET_USDC = chain.testnet
  ? { href: "https://faucet.circle.com", label: "Get test USDC from the faucet" }
  : { href: "https://docs.arc.io/arc-chain", label: "Read the Arc guide" };

// The new pot flow as a state machine (Architecture §8.2): type → goal details → portfolio → amount → review → saved.
export default function NewPot({ searchParams }: { searchParams: Promise<{ kind?: string | string[] }> }) {
  const { kind } = use(searchParams);
  const [state, dispatch] = useReducer(
    newPotReducer,
    kind === "goal" ? KIND_GOAL : kind === "anytime" ? KIND_ANYTIME : undefined,
    initialNewPot,
  );
  const { address } = useConnection();
  const balance = useUsdcBalance();
  const vaults = useVaults();
  const paused = usePaused().data === true;
  // The kind is only a highlight until Continue is pressed. It starts set when the page opened for one kind.
  const [picked, setPicked] = useState<number | null>(state.screen === "type" ? null : state.kind);
  const [copied, setCopied] = useState(false);

  const isGoal = state.kind === KIND_GOAL;
  const name = state.name.trim();
  const nameBytes = new TextEncoder().encode(name).length;
  const nameTooLong = nameBytes > MAX_NAME_BYTES;
  const target = parseUsdc(state.targetText);
  const unlockAt = unlockAtFromDate(state.unlockDate);
  const amount = parseUsdc(state.amountText);

  let goalProblem: string | null = null;
  if (name === "") goalProblem = "Give your goal a name.";
  else if (nameTooLong) goalProblem = "That name is too long.";
  else if (target === null) goalProblem = "Enter a target in USDC, with up to 6 decimals.";
  else if (unlockAt === null || unlockAt <= BigInt(Math.floor(Date.now() / 1000))) goalProblem = "Pick an unlock date in the future.";

  const overBalance = amount !== null && balance.data !== undefined && amount > balance.data;
  // While the amount is more than the wallet holds, the balance is re-read, so new USDC shows up without a reload.
  const refetchBalance = balance.refetch;
  useEffect(() => {
    if (!overBalance) return;
    const timer = setInterval(() => refetchBalance(), 10_000);
    return () => clearInterval(timer);
  }, [overBalance, refetchBalance]);

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

  const maxText = balance.data !== undefined && balance.data > FEE_RESERVE ? usdcInputValue(balance.data - FEE_RESERVE) : null;

  const steps = newPotSteps(state);
  // The review opens over the amount step, so the two share one screen underneath.
  const shown = state.screen === "review" ? "amount" : state.screen;
  // Steps slide in the direction of travel: forward from the right, back from the left.
  const [travel, setTravel] = useState({ index: steps.current, direction: 1 });
  const direction = steps.current === travel.index ? travel.direction : steps.current > travel.index ? 1 : -1;
  if (steps.current !== travel.index) setTravel({ index: steps.current, direction });

  const tierVault = vaults.data?.tiers[TIER_KEYS[state.tier]!] ?? null;
  const potLabel = name || (isGoal ? "your Goal Vault" : "your Anytime Vault");

  if (state.screen === "success" && amount !== null) {
    return (
      <SavedScreen
        amount={amount}
        potName={potLabel}
        tierName={TIERS[state.tier]!}
        apy={tierVault ? formatApy(tierVault.apy) : null}
        potHref={state.potId !== null ? `/app/pot/${state.potId}` : null}
        dashboardHref={state.potId !== null ? `/app?new=${state.potId}` : "/app"}
      />
    );
  }
  if (shown === "success") return null;

  const next =
    shown === "type"
      ? { label: "Continue", disabled: picked === null || paused, run: () => picked !== null && dispatch({ type: "chooseKind", kind: picked }) }
      : shown === "goal"
        ? { label: "Continue", disabled: !!goalProblem || paused, run: () => dispatch({ type: "next" }) }
        : shown === "tier"
          ? { label: "Continue", disabled: paused, run: () => dispatch({ type: "next" }) }
          : { label: "Review", disabled: !!amountProblem || paused, run: () => dispatch({ type: "next" }) };

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the address is still on screen to copy by hand.
    }
  };

  const [heading, lead] = HEADINGS[shown];

  return (
    <div className="mx-auto grid w-full max-w-220 grid-cols-[minmax(0,1fr)] gap-6">
      <div className="grid gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: "back" })}
            disabled={shown === "type"}
            aria-label="Back"
            className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-grey-line text-label font-semibold transition-[background-color] duration-150 ease-out hover:bg-grey-surface disabled:invisible lg:pr-4 lg:pl-3"
          >
            <BackIcon size={18} />
            <span className="hidden lg:inline">Back</span>
          </button>
          <p className="grid justify-items-center gap-0.5">
            <b className="text-label font-semibold tabular-nums">
              Step {steps.current + 1} of {steps.titles.length}
            </b>
            <span className="text-caption text-grey-text">
              {shown === "type" && picked === null ? "New pot" : (shown === "type" ? picked === KIND_GOAL : isGoal) ? "New Goal Vault" : "New Anytime Vault"}
            </span>
          </p>
          <Link
            href="/app"
            className="flex h-11 min-w-11 items-center justify-end text-label font-semibold text-grey-text transition-[color] duration-150 ease-out hover:text-black"
          >
            Cancel
          </Link>
        </div>
        <Stepper titles={steps.titles} current={steps.current} />
      </div>

      {paused && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration.base, ease }}>
          <Banner tone="caution">
            <b className="block font-semibold">New savings are paused</b>
            Money already saved can still be withdrawn. Try again later.
          </Banner>
        </motion.div>
      )}

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={shown}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ opacity: 0, x: 32 * dir }),
            center: { opacity: 1, x: 0 },
            exit: (dir: number) => ({ opacity: 0, x: -32 * dir }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: duration.base, ease }}
          className="grid grid-cols-[minmax(0,1fr)] gap-6"
        >
          <div className="grid gap-2">
            <h1 className="text-h1 font-bold tracking-[-0.03em] lg:text-balance">{heading}</h1>
            <p className="max-w-160 text-body text-grey-text">{lead}</p>
          </div>

          {shown === "type" && (
            <fieldset>
              <legend className="sr-only">Kind of pot</legend>
              <div className="grid gap-3 lg:grid-cols-2">
                {KINDS.map(({ kind: value, label, line, Glyph }) => {
                  const selected = picked === value;
                  return (
                    <label
                      key={value}
                      className={`grid cursor-pointer gap-3.5 rounded-card border p-5.5 transition-[border-color,box-shadow] duration-150 ease-out hover:border-black has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-green ${
                        selected ? "border-black shadow-[inset_0_0_0_1px_var(--color-black)]" : "border-grey-line"
                      }`}
                    >
                      <input type="radio" name="kind" checked={selected} onChange={() => setPicked(value)} className="sr-only" />
                      <span className="flex items-center justify-between">
                        <span className="flex size-12 items-center justify-center rounded-full border border-grey-line">
                          <Glyph size={22} />
                        </span>
                        {selected ? (
                          <TickIcon size={26} variant="Bold" />
                        ) : (
                          <span aria-hidden="true" className="m-0.5 size-5.5 rounded-full border-[1.5px] border-grey-line" />
                        )}
                      </span>
                      <b className="text-h3 font-bold tracking-[-0.01em]">{label}</b>
                      <span className="text-label text-grey-text">{line}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {shown === "goal" && (
            <div className="grid max-w-140 gap-5.5">
              <Field
                label="What are you saving for?"
                name="goal-name"
                value={state.name}
                onChange={(e) => dispatch({ type: "set", field: "name", value: e.target.value })}
                placeholder="New laptop"
                autoComplete="off"
                invalid={nameTooLong}
                hint="Names are public. Leave out anything private."
                aside={`${nameBytes}/${MAX_NAME_BYTES}`}
              />
              <Field
                label="Target in USDC"
                name="target"
                value={state.targetText}
                onChange={(e) => dispatch({ type: "set", field: "targetText", value: e.target.value })}
                inputMode="decimal"
                placeholder="500.00"
                autoComplete="off"
                suffix="USDC"
                className="text-h3 font-semibold tabular-nums"
              />
              <DateField
                label="Unlock date"
                min={earliestUnlockDate()}
                value={state.unlockDate}
                onChange={(value) => dispatch({ type: "set", field: "unlockDate", value })}
                hint="The goal unlocks when you reach the target or on this date, whichever comes first. There is no early withdrawal before that."
              />
              {goalProblem && (state.name !== "" || state.targetText !== "" || state.unlockDate !== "") && (
                <p role="alert" className="text-label font-semibold text-error">
                  {goalProblem}
                </p>
              )}
            </div>
          )}

          {shown === "tier" && (
            <div className="grid gap-4">
              <TierPicker value={state.tier} onChange={(tier) => dispatch({ type: "setTier", tier })} vaults={vaults.data} paused={paused} />
              <p className="text-label text-grey-text">A pot keeps the portfolio it opens with.</p>
            </div>
          )}

          {shown === "amount" && (
            <div className="grid max-w-140 grid-cols-[minmax(0,1fr)] gap-4">
              <div className="flex flex-wrap gap-2">
                {name && (
                  <span className="max-w-full truncate rounded-sm border border-grey-line px-2 py-0.5 text-caption font-semibold">{name}</span>
                )}
                <KindBadge kind={state.kind} />
                <TierChip tier={state.tier} />
              </div>
              <label
                className={`grid grid-cols-[minmax(0,1fr)] gap-2.5 rounded-card border p-5 transition-[border-color,box-shadow] duration-150 ease-out focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-green lg:p-7 ${
                  overBalance
                    ? "border-error shadow-[inset_0_0_0_1px_var(--color-error)]"
                    : state.amountText
                      ? "border-black"
                      : "border-grey-line"
                }`}
              >
                <span className="text-label text-grey-text">You save</span>
                <span className="flex items-baseline gap-2.5">
                  <input
                    value={state.amountText}
                    onChange={(e) => dispatch({ type: "set", field: "amountText", value: e.target.value })}
                    name="amount"
                    inputMode="decimal"
                    placeholder="0.00"
                    autoComplete="off"
                    size={1}
                    aria-label="Amount to save in USDC"
                    aria-invalid={overBalance || undefined}
                    // A long amount steps down a size, so every digit stays in view.
                    className={`min-w-0 flex-1 bg-transparent font-bold tracking-[-0.03em] tabular-nums outline-none placeholder:text-grey-muted ${
                      state.amountText.length > 9 ? "text-h2 lg:text-display" : "text-display lg:text-balance"
                    }`}
                  />
                  <span className="text-h3 font-semibold text-grey-text">USDC</span>
                </span>
                <span className="flex flex-wrap items-center justify-between gap-2 border-t border-grey-line pt-2.5 text-label text-grey-text tabular-nums">
                  {balance.data !== undefined ? `In your wallet: ${formatUsdc(balance.data)}` : "Reading your wallet…"}
                  {maxText && (
                    <button
                      type="button"
                      aria-label={`Save the most you can, keeping ${formatUsdc(FEE_RESERVE)} for network fees`}
                      onClick={() => dispatch({ type: "set", field: "amountText", value: maxText })}
                      className="rounded-sm bg-mint px-3 py-1.5 text-caption font-semibold text-green transition-[background-color,transform] duration-150 ease-out hover:bg-grey-line active:scale-[0.97]"
                    >
                      Max
                    </button>
                  )}
                </span>
              </label>
              {maxText !== null && state.amountText === maxText && (
                <p className="text-caption text-grey-text">Max keeps {formatUsdc(FEE_RESERVE)} back for network fees.</p>
              )}

              {!isGoal && (
                <Field
                  label="Name (optional)"
                  name="pot-name"
                  value={state.name}
                  onChange={(e) => dispatch({ type: "set", field: "name", value: e.target.value })}
                  placeholder="Rainy day"
                  autoComplete="off"
                  invalid={nameTooLong}
                  hint="Names are public. Leave out anything private."
                  aside={`${nameBytes}/${MAX_NAME_BYTES}`}
                />
              )}

              {amountProblem && state.amountText.trim() !== "" ? (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: duration.fast }}
                  className="text-label font-semibold text-error"
                >
                  {overBalance ? `That is more than the ${formatUsdc(balance.data!)} in your wallet.` : amountProblem}
                </motion.p>
              ) : isGoal && amount !== null && target !== null && amount >= target ? (
                <p className="text-label text-grey-text">Saving this much reaches your target, so this goal unlocks straight away.</p>
              ) : (
                amount !== null &&
                tierVault && (
                  <p className="text-label text-grey-text tabular-nums">
                    In 1 year: about {formatEstimate(usdcToNumber(amount) * (1 + tierVault.apy))} at {formatApy(tierVault.apy)} APY
                    today. Estimate, not a promise.
                  </p>
                )
              )}

              {overBalance && address && (
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: duration.base, ease }}
                  className="grid gap-3.5 rounded-card bg-grey-surface p-5"
                >
                  <h2 className="text-body font-bold">How to get USDC on {chain.name}</h2>
                  <ol className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 gap-y-2.5 text-label">
                    <b className="font-semibold">1</b>
                    <li className="col-start-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      Copy your wallet address:
                      <button
                        type="button"
                        onClick={copyAddress}
                        className="inline-flex items-center gap-1.5 rounded-sm border border-grey-line bg-white px-2 py-1 font-semibold tabular-nums transition-[border-color] duration-150 ease-out hover:border-black"
                      >
                        {copied ? <TickIcon size={16} className="text-green" /> : <CopyIcon size={16} />}
                        {copied ? "Copied" : shortAddress(address)}
                      </button>
                    </li>
                    <b className="font-semibold">2</b>
                    <li className="col-start-2">
                      Send USDC to it on the {chain.name} network, from an exchange or wallet that supports it.
                    </li>
                    <b className="font-semibold">3</b>
                    <li className="col-start-2">Come back here. Your balance updates by itself.</li>
                  </ol>
                  <a href={GET_USDC.href} target="_blank" rel="noreferrer" className="text-label font-semibold text-green underline hover:text-green-pressed">
                    {GET_USDC.label}
                  </a>
                </motion.section>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="sticky bottom-0 -mx-4 border-t border-grey-line bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] lg:static lg:mx-0 lg:flex lg:justify-end lg:border-0 lg:p-0">
        <Button size="lg" disabled={next.disabled} onClick={next.run} className="w-full lg:w-auto lg:min-w-44">
          {next.label}
        </Button>
      </div>

      <AnimatePresence>
        {state.screen === "review" && amount !== null && (
          <ReviewSheet
            key="review"
            title="Review your saving"
            onClose={() => dispatch({ type: "back" })}
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
        )}
      </AnimatePresence>
    </div>
  );
}
