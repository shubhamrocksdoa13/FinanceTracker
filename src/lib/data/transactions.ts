import { prisma } from "@/lib/prisma";
import type { Transaction, Category } from "@/generated/prisma/client";

export type TransactionWithCategory = Transaction & { category: Category };

export type DateRange = { from: Date; to: Date };

/** Most recent transactions first, for the list view. Optionally scoped to an inclusive date range. */
export async function getTransactions(
  userId: string,
  range?: DateRange
): Promise<TransactionWithCategory[]> {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(range ? { date: { gte: range.from, lte: range.to } } : {}),
    },
    include: { category: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export type TransactionTotals = {
  income: number;
  expense: number;
  net: number;
};

/** Sums across the given transactions, for the summary row. */
export function getTransactionTotals(
  transactions: Pick<Transaction, "type" | "amount">[]
): TransactionTotals {
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    const amount = Number(tx.amount);
    if (tx.type === "INCOME") income += amount;
    else expense += amount;
  }
  return { income, expense, net: income - expense };
}
