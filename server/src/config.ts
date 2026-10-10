import "dotenv/config";
import { z } from "zod";

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "expected a 0x address");

// An empty value in .env means "not set".
const optional = <T extends z.ZodType>(inner: T) => z.preprocess((v) => (v === "" ? undefined : v), inner.optional());

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CHAIN_ID: z.coerce.number().pipe(z.union([z.literal(5042), z.literal(5042002)])),
  ARC_RPC_URL: z.url(),
  PAMO_SAVINGS_ADDRESS: address,
  CIRCLE_API_KEY: optional(z.string()),
  ALLOWED_ORIGIN: z.string().default("http://localhost:3000"),
  // The indexer and the history routes need all three. Without them the rest of the server still runs.
  SUPABASE_URL: optional(z.url()),
  SUPABASE_SERVICE_KEY: optional(z.string()),
  PAMO_SAVINGS_DEPLOY_BLOCK: optional(z.coerce.bigint().nonnegative()),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

export const config = {
  port: parsed.data.PORT,
  chainId: parsed.data.CHAIN_ID,
  rpcUrl: parsed.data.ARC_RPC_URL,
  pamoSavings: parsed.data.PAMO_SAVINGS_ADDRESS as `0x${string}`,
  circleApiKey: parsed.data.CIRCLE_API_KEY,
  allowedOrigin: parsed.data.ALLOWED_ORIGIN,
  supabaseUrl: parsed.data.SUPABASE_URL,
  supabaseServiceKey: parsed.data.SUPABASE_SERVICE_KEY,
  deployBlock: parsed.data.PAMO_SAVINGS_DEPLOY_BLOCK,
};
