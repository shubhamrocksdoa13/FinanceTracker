import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  note: z
    .string()
    .trim()
    .max(500, "Note is too long")
    .optional()
    .transform((v) => (v ? v : undefined)),
});
