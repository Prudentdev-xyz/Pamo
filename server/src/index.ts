import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { config } from "./config.js";
import { publicClient } from "./chain.js";
import { vaults } from "./routes/vaults.js";

const app = express();
app.set("trust proxy", 1); // one proxy hop on Railway and Render
app.use(cors({ origin: config.allowedOrigin }));
app.use(express.json({ limit: "10kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/api/health", async (_req, res) => {
  try {
    const chainBlock = await publicClient.getBlockNumber();
    // indexedBlock is filled in once the indexer exists (Phase 4).
    res.json({ ok: true, chainId: config.chainId, indexedBlock: null, chainBlock: Number(chainBlock) });
  } catch {
    res.status(503).json({ ok: false, chainId: config.chainId, indexedBlock: null, chainBlock: null });
  }
});

app.use("/api/vaults", vaults);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(config.port, () => {
  console.log(`Pamo server on :${config.port} (chain ${config.chainId})`);
});
