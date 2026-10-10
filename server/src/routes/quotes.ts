import { Router } from "express";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { z } from "zod";
import { config } from "../config.js";
import { pamoSavingsAbi, publicClient, TIERS, USDC_DECIMALS, vaultAbi } from "../chain.js";
import { getEarnDepositQuote, getTierVaults, type TierVault } from "../earn.js";
import { address, parse, positiveUint, tier, uint } from "../validate.js";

export const quotes = Router();

const pamo = { address: config.pamoSavings, abi: pamoSavingsAbi } as const;

/** Earn Kit data for a vault, when it is one of the three tier vaults and the kit is reachable. */
async function vaultData(vault: string): Promise<TierVault | null> {
  const { tiers } = await getTierVaults();
  return TIERS.map((t) => tiers[t]).find((v) => v?.vaultAddress.toLowerCase() === vault.toLowerCase()) ?? null;
}

/** USDC the vault can pay out right now, in integer units, or null when unknown. */
const liquidityOf = (data: TierVault | null) => (data ? parseUnits(data.liquidity, USDC_DECIMALS) : null);

const depositBody = z.object({
  owner: address,
  tier,
  /** USDC in integer units (6 dp). */
  amount: positiveUint,
  /** Set when adding to an existing pot, which keeps the vault it was opened in. */
  potId: uint.optional(),
});

// Fees, share price and warnings for the "Review your saving" screen.
quotes.post("/deposit", async (req, res) => {
  const body = parse(depositBody, req.body, res);
  if (!body) return;

  try {
    let vault: `0x${string}`;
    if (body.potId !== undefined) {
      const pot = await publicClient.readContract({ ...pamo, functionName: "getPot", args: [body.potId] });
      if (pot.owner.toLowerCase() !== body.owner) return void res.status(404).json({ error: "No such pot for this wallet" });
      vault = pot.vault;
    } else {
      vault = await publicClient.readContract({ ...pamo, functionName: "vaultFor", args: [TIERS.indexOf(body.tier)] });
      if (vault === zeroAddress) return void res.status(404).json({ error: "This portfolio is not available right now" });
    }

    const erc4626 = { address: vault, abi: vaultAbi } as const;
    const decimals = await publicClient.readContract({ ...erc4626, functionName: "decimals" });
    const [expectedShares, oneShare, data, earn] = await Promise.all([
      publicClient.readContract({ ...erc4626, functionName: "previewDeposit", args: [body.amount] }),
      publicClient.readContract({ ...erc4626, functionName: "convertToAssets", args: [10n ** BigInt(decimals)] }),
      vaultData(vault).catch(() => null),
      getEarnDepositQuote(body.owner, vault, formatUnits(body.amount, USDC_DECIMALS)),
    ]);

    const liquidity = liquidityOf(data);
    const warnings = [...(data?.warnings ?? [])];
    if (!data) warnings.push("VAULT_DATA_UNAVAILABLE");
    else if (data.status !== "active") warnings.push("VAULT_NOT_ACTIVE");
    // Money saved now could not all come straight back out.
    if (liquidity !== null && liquidity < body.amount) warnings.push("LOW_LIQUIDITY");

    res.json({
      // "earn-kit": Circle quoted this wallet. "chain": read from the vault itself.
      source: earn ? "earn-kit" : "chain",
      vault,
      vaultName: data?.name ?? null,
      sharePrice: earn?.sharePrice ?? formatUnits(oneShare, USDC_DECIMALS),
      apy: earn?.apy ?? data?.apy ?? null,
      vaultFees: data?.fees ?? null,
      fees: earn?.fees ?? [],
      // Shares Pamo's own deposit would receive, in the vault's share units.
      expectedShares: expectedShares.toString(),
      shareDecimals: decimals,
      liquidity: liquidity?.toString() ?? null,
      warnings,
    });
  } catch (err) {
    console.error("POST /api/quotes/deposit failed:", err instanceof Error ? err.message : err);
    res.status(502).json({ error: "Quote unavailable right now" });
  }
});

const withdrawBody = z.object({
  owner: address,
  potId: uint,
  /** USDC in integer units (6 dp). */
  amount: positiveUint,
});

// The Earn Kit cannot quote a Pamo withdrawal: it only sees positions opened through the kit, and
// PamoSavings holds the shares (Architecture §11, #4). So this is built from the chain and the vault's liquidity.
quotes.post("/withdraw", async (req, res) => {
  const body = parse(withdrawBody, req.body, res);
  if (!body) return;

  try {
    const pot = await publicClient.readContract({ ...pamo, functionName: "getPot", args: [body.potId] });
    if (pot.owner.toLowerCase() !== body.owner) return void res.status(404).json({ error: "No such pot for this wallet" });

    const erc4626 = { address: pot.vault, abi: vaultAbi } as const;
    const [value, unlocked, decimals, data] = await Promise.all([
      publicClient.readContract({ ...pamo, functionName: "potValue", args: [body.potId] }),
      publicClient.readContract({ ...pamo, functionName: "isUnlocked", args: [body.potId] }),
      publicClient.readContract({ ...erc4626, functionName: "decimals" }),
      vaultData(pot.vault).catch(() => null),
    ]);

    // Taking the whole value redeems every share, as withdrawAll does.
    const sharesToRedeem =
      body.amount >= value
        ? pot.shares
        : await publicClient.readContract({ ...erc4626, functionName: "previewWithdraw", args: [body.amount] });

    const liquidity = liquidityOf(data);
    const payable = liquidity !== null && liquidity < value ? liquidity : value;

    const warnings: string[] = [];
    if (!unlocked) warnings.push("GOAL_LOCKED");
    if (body.amount > value) warnings.push("EXCEEDS_VALUE");
    if (liquidity === null) warnings.push("VAULT_DATA_UNAVAILABLE");
    else if (body.amount > liquidity) warnings.push("LOW_LIQUIDITY");

    res.json({
      vault: pot.vault,
      value: value.toString(),
      unlocked,
      sharesToRedeem: sharesToRedeem.toString(),
      shareDecimals: decimals,
      // A direct ERC-4626 redeem carries no Circle withdrawal fee.
      withdrawalFee: "0",
      liquidity: liquidity?.toString() ?? null,
      maxWithdrawable: (unlocked ? payable : 0n).toString(),
      warnings,
    });
  } catch (err) {
    console.error("POST /api/quotes/withdraw failed:", err instanceof Error ? err.message : err);
    res.status(502).json({ error: "Quote unavailable right now" });
  }
});
