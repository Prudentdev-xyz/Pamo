import { Router } from "express";
import { z } from "zod";
import { db } from "../supabase.js";
import { address, parse, uint } from "../validate.js";

export const owners = Router();
export const pots = Router();

const UNAVAILABLE = { error: "History is unavailable right now" };

// numeric columns are read as text: share amounts do not fit in a JavaScript number.
const POT_COLUMNS = "id, owner, name, kind, tier, vault, target::text, unlock_at, opened_tx, opened_block";

interface PotRow {
  id: number;
  owner: string;
  name: string | null;
  kind: string;
  tier: string;
  vault: string;
  target: string | null;
  unlock_at: string | null;
  opened_tx: string;
  opened_block: number;
}

const toPot = (row: PotRow) => ({
  id: String(row.id),
  owner: row.owner,
  name: row.name,
  kind: row.kind,
  tier: row.tier,
  vault: row.vault,
  target: row.target,
  unlockAt: row.unlock_at,
  openedTx: row.opened_tx,
  openedBlock: row.opened_block,
});

const activityQuery = z.object({
  potId: uint.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

owners.get("/:address/activity", async (req, res) => {
  const owner = parse(address, req.params.address, res);
  if (!owner) return;
  const query = parse(activityQuery, req.query, res);
  if (!query) return;
  if (!db) return void res.status(503).json(UNAVAILABLE);

  let select = db
    .from("activity")
    .select("pot_id, type, assets::text, shares::text, tx_hash, log_index, block, at")
    .eq("owner", owner)
    .order("block", { ascending: false })
    .order("log_index", { ascending: false })
    .limit(query.limit);
  if (query.potId !== undefined) select = select.eq("pot_id", query.potId.toString());

  const { data, error } = await select;
  if (error) {
    console.error("GET activity failed:", error.message);
    return void res.status(503).json(UNAVAILABLE);
  }
  res.json(
    (data as unknown as { pot_id: number; type: string; assets: string; shares: string; tx_hash: string; block: number; at: string }[]).map(
      (row) => ({
        potId: String(row.pot_id),
        type: row.type,
        assets: row.assets,
        shares: row.shares,
        txHash: row.tx_hash,
        block: row.block,
        at: row.at,
      }),
    ),
  );
});

// Every pot one owner opened, for the names on the dashboard.
owners.get("/:address/pots", async (req, res) => {
  const owner = parse(address, req.params.address, res);
  if (!owner) return;
  if (!db) return void res.status(503).json(UNAVAILABLE);

  const { data, error } = await db.from("pots").select(POT_COLUMNS).eq("owner", owner).order("id");
  if (error) {
    console.error("GET owner pots failed:", error.message);
    return void res.status(503).json(UNAVAILABLE);
  }
  res.json((data as unknown as PotRow[]).map(toPot));
});

pots.get("/:id", async (req, res) => {
  const id = parse(uint, req.params.id, res);
  if (id === undefined) return;
  if (!db) return void res.status(503).json(UNAVAILABLE);

  const { data, error } = await db.from("pots").select(POT_COLUMNS).eq("id", id.toString()).maybeSingle();
  if (error) {
    console.error("GET pot failed:", error.message);
    return void res.status(503).json(UNAVAILABLE);
  }
  if (!data) return void res.status(404).json({ error: "No such pot" });
  res.json(toPot(data as unknown as PotRow));
});
