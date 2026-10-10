import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { config } from "./config.js";
import { publicClient } from "./chain.js";
import { getIndexedBlock, startIndexer } from "./indexer.js";
import { owners, pots } from "./routes/activity.js";
import { quotes } from "./routes/quotes.js";
import { vaults } from "./routes/vaults.js";

const app = express();
app.set("trust proxy", 1); // one proxy hop on Railway and Render
app.use(cors({ origin: config.allowedOrigin }));
app.use(express.json({ limit: "10kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/api/health", async (_req, res) => {
  // indexedBlock stays null while the indexer is off or has not finished its first batch.
  const indexed = getIndexedBlock();
  const indexedBlock = indexed === null ? null : Number(indexed);
  try {
    const chainBlock = await publicClient.getBlockNumber();
    res.json({ ok: true, chainId: config.chainId, indexedBlock, chainBlock: Number(chainBlock) });
  } catch {
    res.status(503).json({ ok: false, chainId: config.chainId, indexedBlock, chainBlock: null });
  }
});

app.use("/api/vaults", vaults);
app.use("/api/quotes", quotes);
app.use("/api/owners", owners);
app.use("/api/pots", pots);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Malformed JSON and anything a route did not catch: answer plainly, never crash.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof err === "object" && err !== null && "status" in err && typeof err.status === "number" ? err.status : 500;
  if (status >= 500) console.error("Unhandled error:", err);
  res.status(status).json({ error: status >= 500 ? "Something went wrong" : "Invalid request" });
});

app.listen(config.port, () => {
  console.log(`Pamo server on :${config.port} (chain ${config.chainId})`);
  startIndexer();
});
