/**
 * Month-key helpers ("YYYY-MM") used to drive the Transactions month
 * switcher and the Net Worth "left this month" figure.
 *
 * Transaction.date is a Postgres `@db.Date` column, so Prisma reads it back
 * as a UTC-midnight Date with no time-of-day component. Every function here
 * works in UTC to match that representation — mixing in local-timezone math
 * would shift entries near a month boundary into the wrong month.
 */

export function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}

export function monthLabel(key: string): string {
  const { year, month } = parseMonthKey(key);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function monthShortLabel(key: string): string {
  const { year, month } = parseMonthKey(key);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

/** Inclusive first/last-day-of-month range for the given month key. */
export function monthRange(key: string): { from: Date; to: Date } {
  const { year, month } = parseMonthKey(key);
  return {
    from: new Date(Date.UTC(year, month - 1, 1)),
    to: new Date(Date.UTC(year, month, 0)),
  };
}

export function shiftMonthKey(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  return monthKey(new Date(Date.UTC(year, month - 1 + delta, 1)));
}

/** `count` month keys in ascending order, ending at `endKey`. */
export function recentMonthKeys(count: number, endKey: string): string[] {
  return Array.from({ length: count }, (_, i) =>
    shiftMonthKey(endKey, i - (count - 1))
  );
}
