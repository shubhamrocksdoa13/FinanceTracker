import { prisma } from "@/lib/prisma";
import type { Asset } from "@/generated/prisma/client";

/** Most recently updated first, for the Net Worth list. */
export async function getAssets(userId: string): Promise<Asset[]> {
  return prisma.asset.findMany({
    where: { userId },
    orderBy: [{ asOfDate: "desc" }, { createdAt: "desc" }],
  });
}

/** Sum of all balances; liabilities are stored as negative balances. */
export function getNetWorth(assets: Pick<Asset, "balance">[]): number {
  return assets.reduce((sum, a) => sum + Number(a.balance), 0);
}
