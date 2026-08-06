"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAssetSchema } from "@/lib/validations/asset";

export type AssetActionState = { error?: string; success?: boolean } | undefined;

export async function createAsset(
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const userId = session.user.id;

  const parsed = createAssetSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    balance: formData.get("balance"),
    asOfDate: formData.get("asOfDate"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, kind, balance, asOfDate, note } = parsed.data;

  await prisma.asset.create({
    data: {
      userId,
      name,
      kind,
      balance,
      asOfDate: new Date(asOfDate),
      note,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

// void return: bound directly into a <form action> (the delete button in
// the net-worth list), whose action slot only accepts void | Promise<void>.
export async function deleteAsset(assetId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const userId = session.user.id;

  await prisma.asset.deleteMany({
    where: { id: assetId, userId },
  });

  revalidatePath("/", "layout");
}
