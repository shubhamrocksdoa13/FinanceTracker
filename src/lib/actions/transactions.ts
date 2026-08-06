"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTransactionSchema } from "@/lib/validations/transaction";

export type TransactionActionState =
  | { error?: string; success?: boolean }
  | undefined;

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const userId = session.user.id;

  const parsed = createTransactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId"),
    date: formData.get("date"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { type, amount, categoryId, date, note } = parsed.data;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) return { error: "Invalid category" };

  await prisma.transaction.create({
    data: {
      userId,
      type,
      amount,
      categoryId,
      date: new Date(date),
      note,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

// Return type is void, not an error object: it's bound directly into a
// <form action> (see the delete button in the transactions list), and that
// slot's type only accepts void | Promise<void>.
export async function deleteTransaction(transactionId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const userId = session.user.id;

  // Scope the delete to the caller's own row so a forged id can't touch
  // another user's transaction. A no-op count (already deleted, or not
  // owned by this user) is treated the same as success.
  await prisma.transaction.deleteMany({
    where: { id: transactionId, userId },
  });

  revalidatePath("/", "layout");
}
