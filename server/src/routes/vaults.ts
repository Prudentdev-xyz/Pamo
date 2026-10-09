import { Router } from "express";
import { getTierVaults } from "../earn.js";

export const vaults = Router();

vaults.get("/", async (_req, res) => {
  try {
    res.json(await getTierVaults());
  } catch (err) {
    console.error("GET /api/vaults failed:", err);
    res.status(502).json({ error: "Live rates unavailable right now" });
  }
});
