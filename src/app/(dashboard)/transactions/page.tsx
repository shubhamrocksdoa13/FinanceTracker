import Link from "next/link";
import { auth } from "@/auth";
import { getTransactions, getTransactionTotals } from "@/lib/data/transactions";
import { deleteTransaction } from "@/lib/actions/transactions";
import { formatCurrency, dateFormatter } from "@/lib/format";
import {
  monthKey,
  monthLabel,
  monthShortLabel,
  monthRange,
  shiftMonthKey,
  recentMonthKeys,
} from "@/lib/date-range";

const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/15";

const MONTH_STRIP_SIZE = 6;

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session!.user.id;
  const currency = session!.user.currency;

  const currentMonth = monthKey(new Date());

  const customFrom = parseDate(params.from);
  const customTo = parseDate(params.to);
  const isCustomRange = Boolean(customFrom && customTo);

  const selectedMonth = !isCustomRange && params.month ? params.month : currentMonth;

  const range = isCustomRange
    ? customFrom!.getTime() <= customTo!.getTime()
      ? { from: customFrom!, to: customTo! }
      : { from: customTo!, to: customFrom! }
    : monthRange(selectedMonth);

  const transactions = await getTransactions(userId, range);
  const totals = getTransactionTotals(transactions);
  const months = recentMonthKeys(MONTH_STRIP_SIZE, currentMonth);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="mt-2 text-foreground/60">
          Everything you&apos;ve logged, most recent first.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {isCustomRange ? (
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">
              {dateFormatter.format(range.from)} – {dateFormatter.format(range.to)}
            </span>
            <Link
              href="/transactions"
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              Back to monthly view
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href={`/transactions?month=${shiftMonthKey(selectedMonth, -1)}`}
              aria-label="Previous month"
              className="rounded-md border border-black/10 px-2 py-1 text-sm hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
            >
              ‹
            </Link>
            <span className="text-lg font-semibold">
              {monthLabel(selectedMonth)}
            </span>
            <Link
              href={`/transactions?month=${shiftMonthKey(selectedMonth, 1)}`}
              aria-label="Next month"
              className="rounded-md border border-black/10 px-2 py-1 text-sm hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
            >
              ›
            </Link>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {months.map((m) => (
            <Link
              key={m}
              href={`/transactions?month=${m}`}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                !isCustomRange && m === selectedMonth
                  ? "bg-emerald-600 text-white"
                  : "border border-black/10 text-foreground/70 hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
              }`}
            >
              {monthShortLabel(m)}
            </Link>
          ))}
        </div>

        <form
          method="get"
          action="/transactions"
          className="flex flex-wrap items-end gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10"
        >
          <label className="flex flex-col gap-1 text-sm">
            From
            <input
              name="from"
              type="date"
              required
              defaultValue={params.from ?? ""}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            To
            <input
              name="to"
              type="date"
              required
              defaultValue={params.to ?? ""}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Apply range
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-foreground/60">Income</p>
          <p className="mt-1 text-lg font-semibold text-emerald-600">
            {formatCurrency(totals.income, currency)}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-foreground/60">Expense</p>
          <p className="mt-1 text-lg font-semibold text-red-500">
            {formatCurrency(totals.expense, currency)}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-foreground/60">Net</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(totals.net, currency)}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/10 p-8 text-center text-foreground/60 dark:border-white/10">
          No transactions in this range.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-foreground/60 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/5"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-foreground/70">
                    {dateFormatter.format(tx.date)}
                  </td>
                  <td className="px-4 py-3">{tx.category.name}</td>
                  <td className="px-4 py-3 text-foreground/60">
                    {tx.note ?? "—"}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                      tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(Number(tx.amount), currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteTransaction.bind(null, tx.id)}>
                      <button
                        type="submit"
                        className="text-foreground/40 hover:text-red-500"
                        aria-label={`Delete transaction on ${dateFormatter.format(tx.date)}`}
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
      )}
    </div>
  );
}
