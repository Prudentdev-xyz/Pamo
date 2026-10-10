import { Router } from "express";
import { z } from "zod";
import { getTierVaults } from "../earn.js";
import { db } from "../supabase.js";
import { parse, tier } from "../validate.js";

export const vaults = Router();

vaults.get("/", async (_req, res) => {
  try {
    res.json(await getTierVaults());
  } catch (err) {
    console.error("GET /api/vaults failed:", err);
    res.status(502).json({ error: "Live rates unavailable right now" });
  }
});

const historyQuery = z.object({
  tier,
  days: z.coerce.number().int().min(1).max(90).default(7),
});

// Rate history from the 10-minute snapshots, oldest first.
vaults.get("/history", async (req, res) => {
  const query = parse(historyQuery, req.query, res);
  if (!query) return;
  if (!db) return void res.status(503).json({ error: "Rate history is unavailable right now" });

  const since = new Date(Date.now() - query.days * 86_400_000).toISOString();
  const { data, error } = await db
    .from("vault_snapshots")
    .select("at, apy, liquidity::text")
    .eq("tier", query.tier)
    .gte("at", since)
    .order("at", { ascending: false })
    .limit(1000);
  if (error) {
    console.error("GET /api/vaults/history failed:", error.message);
    return void res.status(503).json({ error: "Rate history is unavailable right now" });
  }
  res.json(
    (data as unknown as { at: string; apy: number; liquidity: string | null }[])
      .reverse()
      .map((row) => ({ at: row.at, apy: Number(row.apy), liquidity: row.liquidity })),
  );
});
