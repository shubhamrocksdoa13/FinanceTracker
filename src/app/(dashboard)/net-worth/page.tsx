import Link from "next/link";
import { auth } from "@/auth";
import {
  getAssets,
  getNetWorthForPeriod,
  type NetWorthPoint,
} from "@/lib/data/assets";
import { getTransactions, getTransactionTotals } from "@/lib/data/transactions";
import { deleteAsset } from "@/lib/actions/assets";
import { AddAssetForm } from "@/components/assets/AddAssetForm";
import { NetWorthChart } from "@/components/assets/NetWorthChart";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";
import { formatCurrency, dateFormatter } from "@/lib/format";
import { resolvePeriod, todayDateOnly, type PeriodSearchParams } from "@/lib/period";
import { monthLabel } from "@/lib/date-range";

function signed(amount: number, currency: string) {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(amount), currency)}`;
}

export default async function NetWorthPage({
  searchParams,
}: {
  searchParams: Promise<PeriodSearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session!.user.id;
  const currency = session!.user.currency;

  const period = resolvePeriod(params);
  const today = todayDateOnly();
  // "Live" = the selected month is genuinely still in progress (today falls
  // inside it) — never true for a past month, a future month, or a custom
  // range, so the "so far" adjustment only ever applies to the real present.
  const isLive =
    !period.isCustomRange &&
    today.getTime() >= period.range.from.getTime() &&
    today.getTime() <= period.range.to.getTime();
  const periodEnd = isLive ? today : period.range.to;

  const assets = await getAssets(userId);
  const { netWorthAtStart, netWorthAtEnd, pointsInRange } = await getNetWorthForPeriod(
    userId,
    period.range
  );

  const periodTransactions = await getTransactions(userId, period.range);
  const periodTotals = getTransactionTotals(periodTransactions);

  // This month's income/expense hasn't been folded into any asset balance
  // yet, but it's still yours — so the live figure counts it, and will keep
  // moving until the month closes out and you record an updated balance.
  const netWorthNow = netWorthAtEnd + (isLive ? periodTotals.net : 0);
  const progress = netWorthNow - netWorthAtStart;

  // Chart: a baseline point at the period start, the asset updates in
  // between, and a trailing point carrying the (possibly live) end figure —
  // so the line always reads "where you started" to "where you are now."
  const chartPointsRaw: NetWorthPoint[] = [{ date: period.range.from, netWorth: netWorthAtStart }];
  for (const p of pointsInRange) {
    if (p.date.getTime() !== period.range.from.getTime()) {
      chartPointsRaw.push(p);
    }
  }
  const last = chartPointsRaw[chartPointsRaw.length - 1];
  if (last.date.getTime() !== periodEnd.getTime() || last.netWorth !== netWorthNow) {
    chartPointsRaw.push({ date: periodEnd, netWorth: netWorthNow });
  }
  const chartPoints = chartPointsRaw.map((p) => ({
    date: p.date.toISOString(),
    netWorth: p.netWorth,
  }));

  const transactionsHref = period.isCustomRange
    ? `/transactions?from=${params.from}&to=${params.to}`
    : `/transactions?month=${period.selectedMonth}`;
  const periodNoun = period.isCustomRange ? "this range" : monthLabel(period.selectedMonth);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Net Worth</h1>
        <p className="mt-2 text-foreground/60">
          Snapshot balances across your accounts, investments, and loans.
        </p>
      </div>

      <PeriodSwitcher
        basePath="/net-worth"
        selectedMonth={period.selectedMonth}
        isCustomRange={period.isCustomRange}
        rangeFrom={period.range.from}
        rangeTo={period.range.to}
        customFromParam={params.from}
        customToParam={params.to}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-foreground/60">
            Net Worth <span className="text-foreground/40">as of {dateFormatter.format(periodEnd)}</span>
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              netWorthNow < 0 ? "text-red-500" : ""
            }`}
          >
            {formatCurrency(netWorthNow, currency)}
          </p>
          {isLive && (
            <p className="mt-1 text-xs text-foreground/40">
              Includes {periodNoun}&apos;s activity so far — still moving.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-foreground/60">
            Progress <span className="text-foreground/40">in {periodNoun}</span>
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              progress > 0 ? "text-emerald-600" : progress < 0 ? "text-red-500" : ""
            }`}
          >
            {signed(progress, currency)}
          </p>
          <p className="mt-1 text-xs text-foreground/40">
            vs {formatCurrency(netWorthAtStart, currency)} at the start
          </p>
        </div>

        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-foreground/60">
              {isLive ? "Left this month" : `Income − expense (${periodNoun})`}
            </p>
            <Link
              href={transactionsHref}
              className="text-xs text-foreground/40 hover:text-foreground"
            >
              View transactions
            </Link>
          </div>
          <p
            className={`mt-1 text-2xl font-semibold ${
              periodTotals.net < 0 ? "text-red-500" : ""
            }`}
          >
            {formatCurrency(periodTotals.net, currency)}
          </p>
          <p className="mt-1 text-xs text-foreground/40">
            {formatCurrency(periodTotals.income, currency)} in −{" "}
            {formatCurrency(periodTotals.expense, currency)} out
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 text-sm font-medium text-foreground/70">
          Net worth over time
        </h2>
        <NetWorthChart points={chartPoints} currency={currency} />
      </div>

      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 text-sm font-medium text-foreground/70">
          Add balance
        </h2>
        <AddAssetForm />
      </div>

      {assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/10 p-8 text-center text-foreground/60 dark:border-white/10">
          No balances yet. Add one above — enter loans or cards owed as a
          negative number.
        </div>
      ) : (
        <>
          {/* Mobile: a compact list, not a squeezed table — six columns
              never fit 375px without wrapping cell text mid-word. */}
          <div className="divide-y divide-black/5 rounded-lg border border-black/10 sm:hidden dark:divide-white/5 dark:border-white/10">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{asset.name}</p>
                  <p className="truncate text-xs text-foreground/50">
                    {asset.kind} · {dateFormatter.format(asset.asOfDate)}
                    {asset.note ? ` · ${asset.note}` : ""}
                  </p>
                </div>
                <span
                  className={`whitespace-nowrap font-medium ${
                    Number(asset.balance) < 0 ? "text-red-500" : ""
                  }`}
                >
                  {formatCurrency(Number(asset.balance), currency)}
                </span>
                <form action={deleteAsset.bind(null, asset.id)}>
                  <button
                    type="submit"
                    className="p-1 text-foreground/40 hover:text-red-500"
                    aria-label={`Delete ${asset.name}`}
                  >
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-black/10 sm:block dark:border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-foreground/60 dark:border-white/10">
                  <th className="px-4 py-3 font-medium">As of</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 text-right font-medium">Balance</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-black/5 last:border-0 dark:border-white/5"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-foreground/70">
                      {dateFormatter.format(asset.asOfDate)}
                    </td>
                    <td className="px-4 py-3">{asset.name}</td>
                    <td className="px-4 py-3 text-foreground/60">{asset.kind}</td>
                    <td className="px-4 py-3 text-foreground/60">
                      {asset.note ?? "—"}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                        Number(asset.balance) < 0 ? "text-red-500" : ""
                      }`}
                    >
                      {formatCurrency(Number(asset.balance), currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteAsset.bind(null, asset.id)}>
                        <button
                          type="submit"
                          className="text-foreground/40 hover:text-red-500"
                          aria-label={`Delete ${asset.name}`}
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
