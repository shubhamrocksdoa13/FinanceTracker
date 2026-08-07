import Link from "next/link";
import {
  monthKey,
  monthLabel,
  monthShortLabel,
  shiftMonthKey,
  recentMonthKeys,
} from "@/lib/date-range";
import { dateFormatter } from "@/lib/format";

const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/15";

const MONTH_STRIP_SIZE = 6;

/**
 * Month prev/next + quick-jump pills + a custom date-range form, shared by
 * Transactions and Net Worth. Fully server-rendered (Links + a GET form) —
 * no client JS needed to switch periods.
 */
export function PeriodSwitcher({
  basePath,
  selectedMonth,
  isCustomRange,
  rangeFrom,
  rangeTo,
  customFromParam,
  customToParam,
}: {
  basePath: string;
  selectedMonth: string;
  isCustomRange: boolean;
  rangeFrom: Date;
  rangeTo: Date;
  customFromParam?: string;
  customToParam?: string;
}) {
  const currentMonth = monthKey(new Date());
  const months = recentMonthKeys(MONTH_STRIP_SIZE, currentMonth);

  return (
    <div className="flex flex-col gap-4">
      {isCustomRange ? (
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">
            {dateFormatter.format(rangeFrom)} – {dateFormatter.format(rangeTo)}
          </span>
          <Link
            href={basePath}
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            Back to monthly view
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href={`${basePath}?month=${shiftMonthKey(selectedMonth, -1)}`}
            aria-label="Previous month"
            className="rounded-md border border-black/10 px-2 py-1 text-sm hover:border-black/20 dark:border-white/15 dark:hover:border-white/30"
          >
            ‹
          </Link>
          <span className="text-lg font-semibold">{monthLabel(selectedMonth)}</span>
          <Link
            href={`${basePath}?month=${shiftMonthKey(selectedMonth, 1)}`}
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
            href={`${basePath}?month=${m}`}
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
        action={basePath}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10"
      >
        <label className="flex flex-col gap-1 text-sm">
          From
          <input
            name="from"
            type="date"
            required
            defaultValue={customFromParam ?? ""}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          To
          <input
            name="to"
            type="date"
            required
            defaultValue={customToParam ?? ""}
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
  );
}
