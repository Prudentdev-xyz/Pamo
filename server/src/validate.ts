import type { Response } from "express";
import { z } from "zod";

export const address = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "expected a 0x address")
  .transform((a) => a.toLowerCase() as `0x${string}`);

/** A pot id or an amount in integer units, sent as a string so nothing is lost to rounding. */
export const uint = z
  .string()
  .regex(/^\d{1,40}$/, "expected a whole number")
  .transform((n) => BigInt(n));

export const positiveUint = uint.refine((n) => n > 0n, "expected an amount above zero");

export const tier = z.enum(["calm", "steady", "bold"]);

/** Answers 400 with the first problem and returns undefined when the input is not valid. */
export function parse<T extends z.ZodType>(schema: T, input: unknown, res: Response): z.output<T> | undefined {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  res.status(400).json({ error: issue ? `${issue.path.join(".") || "input"}: ${issue.message}` : "Invalid input" });
  return undefined;
}
