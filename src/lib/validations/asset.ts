import { z } from "zod";

/** Free-text but constrained to a fixed set so the net-worth grouping stays clean. */
export const ASSET_KINDS = [
  "Cash",
  "Bank Account",
  "Investment",
  "Property",
  "Loan / Liability",
  "Other",
] as const;

export const createAssetSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  kind: z.enum(ASSET_KINDS),
  // Liabilities are entered as negative balances so the net-worth sum stays
  // a single addition rather than a subtraction with sign-tracking per row.
  balance: z.coerce.number(),
  asOfDate: z.string().min(1, "Date is required"),
  note: z
    .string()
    .trim()
    .max(500, "Note is too long")
    .optional()
    .transform((v) => (v ? v : undefined)),
});
