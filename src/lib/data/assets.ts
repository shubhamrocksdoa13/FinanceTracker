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

export type NetWorthPoint = { date: Date; netWorth: number };

/**
 * Net worth over time, for the trend chart. Each Asset row is a snapshot
 * balance for a named account as of a date (there's no update-in-place —
 * re-entering a balance for "HDFC Savings" just adds a new row), so a point
 * is produced each time any account's balance changes: the latest known
 * balance per account name is tracked and re-summed as of every date seen,
 * in chronological order. Two rows sharing a name are treated as the same
 * account over time, not two accounts.
 */
export async function getNetWorthHistory(userId: string): Promise<NetWorthPoint[]> {
  const assets = await prisma.asset.findMany({
    where: { userId },
    orderBy: { asOfDate: "asc" },
    select: { name: true, balance: true, asOfDate: true },
  });

  const latestBalanceByName = new Map<string, number>();
  const points: NetWorthPoint[] = [];
  let i = 0;
  while (i < assets.length) {
    const date = assets[i].asOfDate;
    // Apply every entry recorded on this same date before taking a snapshot,
    // so same-day edits collapse into one point instead of several.
    while (i < assets.length && assets[i].asOfDate.getTime() === date.getTime()) {
      latestBalanceByName.set(assets[i].name, Number(assets[i].balance));
      i++;
    }
    const netWorth = Array.from(latestBalanceByName.values()).reduce(
      (sum, balance) => sum + balance,
      0
    );
    points.push({ date, netWorth });
  }
  return points;
}

export type NetWorthPeriodSummary = {
  /** Net worth immediately before the period began (its baseline). */
  netWorthAtStart: number;
  /** Net worth as of the last asset update within the period (netWorthAtStart if none). */
  netWorthAtEnd: number;
  /** Asset-driven history points that fall inside (from, to]. */
  pointsInRange: NetWorthPoint[];
};

/**
 * Net worth scoped to a period — the baseline going in, where it ended up,
 * and the points in between — for the Net Worth page's month/range view.
 * `netWorthAtEnd` deliberately excludes anything dated after `range.to`, so
 * viewing a past month doesn't leak in balances recorded since.
 */
export async function getNetWorthForPeriod(
  userId: string,
  range: { from: Date; to: Date }
): Promise<NetWorthPeriodSummary> {
  const history = await getNetWorthHistory(userId);

  let netWorthAtStart = 0;
  const pointsInRange: NetWorthPoint[] = [];
  for (const point of history) {
    if (point.date.getTime() < range.from.getTime()) {
      netWorthAtStart = point.netWorth;
    } else if (point.date.getTime() <= range.to.getTime()) {
      pointsInRange.push(point);
    }
  }

  const netWorthAtEnd =
    pointsInRange.length > 0
      ? pointsInRange[pointsInRange.length - 1].netWorth
      : netWorthAtStart;

  return { netWorthAtStart, netWorthAtEnd, pointsInRange };
}
