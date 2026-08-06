import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/lib/format";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  currency: z.enum(SUPPORTED_CURRENCIES),
});
