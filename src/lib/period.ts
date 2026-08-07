import { monthKey, monthRange } from "@/lib/date-range";

export type Period = {
  range: { from: Date; to: Date };
  /** The effective month key ("YYYY-MM"). Meaningful only when !isCustomRange. */
  selectedMonth: string;
  isCustomRange: boolean;
};

export type PeriodSearchParams = { month?: string; from?: string; to?: string };

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Today's date at UTC midnight, matching how @db.Date columns come back from Prisma. */
export function todayDateOnly(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

/**
 * Shared by Transactions and Net Worth: a custom `from`/`to` range takes
 * precedence over `month`, which defaults to the current month when absent.
 */
export function resolvePeriod(params: PeriodSearchParams): Period {
  const currentMonth = monthKey(new Date());
  const customFrom = parseDate(params.from);
  const customTo = parseDate(params.to);
  const isCustomRange = Boolean(customFrom && customTo);

  if (isCustomRange) {
    const range =
      customFrom!.getTime() <= customTo!.getTime()
        ? { from: customFrom!, to: customTo! }
        : { from: customTo!, to: customFrom! };
    return { range, selectedMonth: currentMonth, isCustomRange: true };
  }

  const selectedMonth = params.month || currentMonth;
  return { range: monthRange(selectedMonth), selectedMonth, isCustomRange: false };
}
