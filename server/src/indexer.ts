import { getAbiItem } from "viem";
import { config } from "./config.js";
import { KINDS, pamoSavingsAbi, publicClient, TIERS } from "./chain.js";
import { getTierVaults } from "./earn.js";
import { db } from "./supabase.js";

// The RPC refuses getLogs ranges over 9,999 blocks (Architecture §11, #6).
const BATCH = 9_000n;
const POLL_MS = 5_000;
const SNAPSHOT_MS = 10 * 60_000;

const events = [
  getAbiItem({ abi: pamoSavingsAbi, name: "PotOpened" }),
  getAbiItem({ abi: pamoSavingsAbi, name: "Deposited" }),
  getAbiItem({ abi: pamoSavingsAbi, name: "Withdrawn" }),
] as const;

let indexedBlock: bigint | null = null;

/** The last block written to the database, or null while the indexer is off. */
export const getIndexedBlock = () => indexedBlock;

async function readCursor(start: bigint): Promise<bigint> {
  const { data, error } = await db!.from("indexer_state").select("last_block").eq("id", 1).maybeSingle();
  if (error) throw new Error(`indexer_state read failed: ${error.message}`);
  return data ? BigInt(data.last_block) : start - 1n;
}

/** Reads one batch of events into the database. Returns true once it has reached the chain head. */
async function step(cursor: bigint): Promise<{ cursor: bigint; caughtUp: boolean }> {
  const latest = await publicClient.getBlockNumber();
  const from = cursor + 1n;
  if (from > latest) return { cursor, caughtUp: true };
  const to = latest < from + BATCH ? latest : from + BATCH;

  const logs = await publicClient.getLogs({
    address: config.pamoSavings,
    events,
    fromBlock: from,
    toBlock: to,
    strict: true,
  });
  logs.sort((a, b) => (a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber < b.blockNumber ? -1 : 1));

  // Activity rows carry the block's time, which the log itself does not.
  const times = new Map<bigint, string>();
  await Promise.all(
    [...new Set(logs.filter((l) => l.eventName !== "PotOpened").map((l) => l.blockNumber))].map(async (blockNumber) => {
      const block = await publicClient.getBlock({ blockNumber });
      times.set(blockNumber, new Date(Number(block.timestamp) * 1000).toISOString());
    }),
  );

  const pots = [];
  const activity = [];
  for (const log of logs) {
    if (log.eventName === "PotOpened") {
      const { id, owner, kind, tier, vault, target, unlockAt, name } = log.args;
      const isGoal = KINDS[kind] === "goal";
      pots.push({
        id: id.toString(),
        owner: owner.toLowerCase(),
        kind: KINDS[kind],
        tier: TIERS[tier],
        vault: vault.toLowerCase(),
        name: name.trim() || null,
        target: isGoal ? target.toString() : null,
        unlock_at: isGoal ? new Date(Number(unlockAt) * 1000).toISOString() : null,
        opened_tx: log.transactionHash,
        opened_block: Number(log.blockNumber),
      });
    } else {
      const { id, owner, assets, shares } = log.args;
      activity.push({
        tx_hash: log.transactionHash,
        log_index: log.logIndex,
        pot_id: id.toString(),
        owner: owner.toLowerCase(),
        type: log.eventName === "Deposited" ? "deposit" : "withdraw",
        assets: assets.toString(),
        shares: shares.toString(),
        block: Number(log.blockNumber),
        at: times.get(log.blockNumber)!,
      });
    }
  }

  // Pots first: activity rows point at them. Both writes are safe to repeat.
  if (pots.length > 0) {
    const { error } = await db!.from("pots").upsert(pots, { onConflict: "id" });
    if (error) throw new Error(`pots write failed: ${error.message}`);
  }
  if (activity.length > 0) {
    const { error } = await db!
      .from("activity")
      .upsert(activity, { onConflict: "tx_hash,log_index", ignoreDuplicates: true });
    if (error) throw new Error(`activity write failed: ${error.message}`);
  }
  // Arc finality is instant, so there is no reorg handling: once a block is read it stays read.
  const { error } = await db!.from("indexer_state").upsert({ id: 1, last_block: Number(to) }, { onConflict: "id" });
  if (error) throw new Error(`indexer_state write failed: ${error.message}`);

  if (logs.length > 0) console.log(`indexer: blocks ${from}-${to}, ${pots.length} pots, ${activity.length} activity rows`);
  return { cursor: to, caughtUp: to === latest };
}

async function snapshot() {
  try {
    const { tiers } = await getTierVaults();
    const at = new Date().toISOString();
    const rows = TIERS.flatMap((tier) => {
      const v = tiers[tier];
      return v
        ? [{ at, tier, vault: v.vaultAddress.toLowerCase(), apy: v.apy, liquidity: v.liquidity, total_deposits: v.totalDeposits, status: v.status }]
        : [];
    });
    if (rows.length === 0) return;
    const { error } = await db!.from("vault_snapshots").insert(rows);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("indexer: rate snapshot failed:", err instanceof Error ? err.message : err);
  }
}

/** Starts the event indexer and the 10-minute rate snapshots. Does nothing without Supabase. */
export function startIndexer() {
  if (!db) {
    console.log("indexer: off (SUPABASE_URL and SUPABASE_SERVICE_KEY are not set)");
    return;
  }
  if (config.deployBlock === undefined) {
    console.error("indexer: off (PAMO_SAVINGS_DEPLOY_BLOCK is not set)");
    return;
  }
  const start = config.deployBlock;
  let cursor: bigint | null = null;

  const tick = async () => {
    let delay = POLL_MS;
    try {
      cursor ??= await readCursor(start);
      const result = await step(cursor);
      cursor = result.cursor;
      indexedBlock = cursor;
      if (!result.caughtUp) delay = 0; // still catching up: read the next batch straight away
    } catch (err) {
      console.error("indexer:", err instanceof Error ? err.message : err);
    }
    setTimeout(tick, delay);
  };

  void tick();
  void snapshot();
  setInterval(snapshot, SNAPSHOT_MS);
  console.log(`indexer: on, from block ${start}`);
}
