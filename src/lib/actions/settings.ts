"use server";

import { revalidatePath } from "next/cache";
import { auth, unstable_update } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/settings";

export type SettingsActionState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const userId = session.user.id;

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    currency: formData.get("currency"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, currency } = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: { name, currency },
  });

  // Push the change into the JWT so it's reflected without a re-login.
  await unstable_update({ user: { name, currency } });

  revalidatePath("/", "layout");
  return { success: true };
}
