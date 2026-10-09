import "dotenv/config";
import { z } from "zod";

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "expected a 0x address");

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CHAIN_ID: z.coerce.number().pipe(z.union([z.literal(5042), z.literal(5042002)])),
  ARC_RPC_URL: z.url(),
  PAMO_SAVINGS_ADDRESS: address,
  CIRCLE_API_KEY: z.string().optional(),
  ALLOWED_ORIGIN: z.string().default("http://localhost:3000"),
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
  circleApiKey: parsed.data.CIRCLE_API_KEY || undefined,
  allowedOrigin: parsed.data.ALLOWED_ORIGIN,
};
