import { BaseError, ContractFunctionRevertedError, parseEventLogs, parseGwei, UserRejectedRequestError } from "viem";
import type { Hash, TransactionReceipt } from "viem";
import { getPublicClient, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { chain } from "./chain";
import { erc20Abi, pamoSavingsAbi, PAMO_SAVINGS, USDC } from "./contract";
import { wagmiConfig } from "./wagmi";

/** Called once the wallet has sent the transaction, before it is confirmed. */
export type OnSent = (hash: Hash) => void;

// Arc silently drops transactions that offer less than 20 Gwei.
const MIN_FEE_PER_GAS = parseGwei("20");

async function fees() {
  const estimate = await getPublicClient(wagmiConfig, { chainId: chain.id })
    .estimateFeesPerGas()
    .catch(() => null);
  const maxFeePerGas =
    estimate?.maxFeePerGas && estimate.maxFeePerGas > MIN_FEE_PER_GAS ? estimate.maxFeePerGas : MIN_FEE_PER_GAS;
  const tip = estimate?.maxPriorityFeePerGas ?? 0n;
  return { maxFeePerGas, maxPriorityFeePerGas: tip < maxFeePerGas ? tip : maxFeePerGas };
}

// A write resolves when the transaction is sent, not confirmed, so every action waits for the receipt.
async function confirm(hash: Hash, onSent?: OnSent): Promise<TransactionReceipt> {
  onSent?.(hash);
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: chain.id });
  if (receipt.status !== "success") throw new Error("The transaction failed. Nothing was moved.");
  return receipt;
}

/** Allows PamoSavings to take exactly `amount` USDC, never more. */
export async function allowUsdc(amount: bigint, onSent?: OnSent) {
  const hash = await writeContract(wagmiConfig, {
    address: USDC,
    abi: erc20Abi,
    functionName: "approve",
    args: [PAMO_SAVINGS, amount],
    chainId: chain.id,
    ...(await fees()),
  });
  return confirm(hash, onSent);
}

/** Opens a pot with its first deposit and returns the new pot's id. */
export async function openPot(
  pot: { kind: number; tier: number; target: bigint; unlockAt: bigint; name: string; amount: bigint },
  onSent?: OnSent,
): Promise<bigint> {
  const hash = await writeContract(wagmiConfig, {
    address: PAMO_SAVINGS,
    abi: pamoSavingsAbi,
    functionName: "openPot",
    args: [pot.kind, pot.tier, pot.target, pot.unlockAt, pot.name, pot.amount],
    chainId: chain.id,
    ...(await fees()),
  });
  const receipt = await confirm(hash, onSent);
  const [opened] = parseEventLogs({ abi: pamoSavingsAbi, eventName: "PotOpened", logs: receipt.logs });
  if (!opened) throw new Error("The pot opened, but its number could not be read. Check your dashboard.");
  return opened.args.id;
}

export async function depositToPot(id: bigint, amount: bigint, onSent?: OnSent) {
  const hash = await writeContract(wagmiConfig, {
    address: PAMO_SAVINGS,
    abi: pamoSavingsAbi,
    functionName: "deposit",
    args: [id, amount],
    chainId: chain.id,
    ...(await fees()),
  });
  return confirm(hash, onSent);
}

export async function withdrawFromPot(id: bigint, amount: bigint, onSent?: OnSent) {
  const hash = await writeContract(wagmiConfig, {
    address: PAMO_SAVINGS,
    abi: pamoSavingsAbi,
    functionName: "withdraw",
    args: [id, amount],
    chainId: chain.id,
    ...(await fees()),
  });
  return confirm(hash, onSent);
}

export async function withdrawAllFromPot(id: bigint, onSent?: OnSent) {
  const hash = await writeContract(wagmiConfig, {
    address: PAMO_SAVINGS,
    abi: pamoSavingsAbi,
    functionName: "withdrawAll",
    args: [id],
    chainId: chain.id,
    ...(await fees()),
  });
  return confirm(hash, onSent);
}

const REVERT_MESSAGES: Record<string, string> = {
  GoalLocked: "This goal is still locked.",
  AmountExceedsValue: "That is more than this pot holds.",
  NothingToWithdraw: "This pot is empty.",
  NotPotOwner: "This pot belongs to another wallet.",
  ZeroAmount: "Enter an amount above zero.",
  NameTooLong: "That name is too long.",
  TierNotSet: "This portfolio is not available right now.",
  InvalidGoal: "A goal needs a target and an unlock date in the future.",
  EnforcedPause: "New savings are paused right now. Withdrawals still work.",
};

/** A plain-English reason for a failed step. */
export function txErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) return "Cancelled. Nothing was moved.";
    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const known = revert.data?.errorName && REVERT_MESSAGES[revert.data.errorName];
      if (known) return known;
      // The vault refused: on a withdrawal that almost always means it cannot pay right now.
      return "The vault is short on cash right now. Try a smaller amount or try again later.";
    }
    return error.shortMessage;
  }
  return error instanceof Error ? error.message : "Something went wrong. Nothing was moved.";
}
