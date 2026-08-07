import { auth } from "@/auth";
import { getTransactions, getTransactionTotals } from "@/lib/data/transactions";
import { deleteTransaction } from "@/lib/actions/transactions";
import { formatCurrency, dateFormatter } from "@/lib/format";
import { resolvePeriod, type PeriodSearchParams } from "@/lib/period";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<PeriodSearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session!.user.id;
  const currency = session!.user.currency;

  const period = resolvePeriod(params);
  const transactions = await getTransactions(userId, period.range);
  const totals = getTransactionTotals(transactions);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="mt-2 text-foreground/60">
          Everything you&apos;ve logged, most recent first.
        </p>
      </div>

      <PeriodSwitcher
        basePath="/transactions"
        selectedMonth={period.selectedMonth}
        isCustomRange={period.isCustomRange}
        rangeFrom={period.range.from}
        rangeTo={period.range.to}
        customFromParam={params.from}
        customToParam={params.to}
      />

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
        <>
          {/* Mobile: a compact list, not a squeezed table — five columns
              never fit 375px without wrapping cell text mid-word. */}
          <div className="divide-y divide-black/5 rounded-lg border border-black/10 sm:hidden dark:divide-white/5 dark:border-white/10">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{tx.category.name}</p>
                  <p className="truncate text-xs text-foreground/50">
                    {dateFormatter.format(tx.date)}
                    {tx.note ? ` · ${tx.note}` : ""}
                  </p>
                </div>
                <span
                  className={`whitespace-nowrap font-medium ${
                    tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(Number(tx.amount), currency)}
                </span>
                <form action={deleteTransaction.bind(null, tx.id)}>
                  <button
                    type="submit"
                    className="p-1 text-foreground/40 hover:text-red-500"
                    aria-label={`Delete transaction on ${dateFormatter.format(tx.date)}`}
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
        </>
      )}
    </div>
  );
}
