import Link from "next/link";
import { auth } from "@/auth";
import { getAssets, getNetWorth } from "@/lib/data/assets";
import { getTransactions, getTransactionTotals } from "@/lib/data/transactions";
import { deleteAsset } from "@/lib/actions/assets";
import { AddAssetForm } from "@/components/assets/AddAssetForm";
import { formatCurrency, dateFormatter } from "@/lib/format";
import { monthKey, monthLabel, monthRange } from "@/lib/date-range";

export default async function NetWorthPage() {
  const session = await auth();
  const userId = session!.user.id;
  const currency = session!.user.currency;

  const assets = await getAssets(userId);
  const netWorth = getNetWorth(assets);

  const thisMonth = monthKey(new Date());
  const thisMonthTransactions = await getTransactions(
    userId,
    monthRange(thisMonth)
  );
  const thisMonthTotals = getTransactionTotals(thisMonthTransactions);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Net Worth</h1>
        <p className="mt-2 text-foreground/60">
          Snapshot balances across your accounts, investments, and loans.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-foreground/60">Net Worth</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              netWorth < 0 ? "text-red-500" : ""
            }`}
          >
            {formatCurrency(netWorth, currency)}
          </p>
        </div>

        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-foreground/60">
              Left this month ({monthLabel(thisMonth)})
            </p>
            <Link
              href={`/transactions?month=${thisMonth}`}
              className="text-xs text-foreground/40 hover:text-foreground"
            >
              View transactions
            </Link>
          </div>
          <p
            className={`mt-1 text-2xl font-semibold ${
              thisMonthTotals.net < 0 ? "text-red-500" : ""
            }`}
          >
            {formatCurrency(thisMonthTotals.net, currency)}
          </p>
          <p className="mt-1 text-xs text-foreground/40">
            {formatCurrency(thisMonthTotals.income, currency)} in −{" "}
            {formatCurrency(thisMonthTotals.expense, currency)} out
          </p>
        </div>
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
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
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
      )}
    </div>
  );
}
