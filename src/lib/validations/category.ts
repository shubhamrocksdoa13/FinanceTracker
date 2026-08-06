import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  type: z.enum(["INCOME", "EXPENSE"]),
  parentCategoryId: z.string().min(1).nullable(),
});
