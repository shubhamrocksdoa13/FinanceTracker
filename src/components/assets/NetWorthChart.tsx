"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export type NetWorthChartPoint = { date: string; netWorth: number };

const LINE_COLOR = "#059669"; // emerald-600, matching the app's accent throughout

function formatTick(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function ChartTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: { payload: NetWorthChartPoint }[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-black/10 bg-background px-3 py-2 shadow-sm dark:border-white/15">
      {/* Value leads, label follows — the reader has the date, wants the number. */}
      <p className="text-sm font-semibold text-foreground">
        {formatCurrency(point.netWorth, currency)}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground/60">
        <span
          className="inline-block h-0.5 w-3 rounded-full"
          style={{ backgroundColor: LINE_COLOR }}
        />
        {formatTick(point.date)}
      </p>
    </div>
  );
}

export function NetWorthChart({
  points,
  currency,
}: {
  points: NetWorthChartPoint[];
  currency: string;
}) {
  // Fixed pixel height via inline style, not a Tailwind h-* class: Recharts'
  // ResponsiveContainer measures its parent's height at render time, and
  // needs that to be non-zero synchronously — an explicit style avoids any
  // dependency on the CSS pipeline having already applied by then.
  const chartHeight = 224;

  if (points.length < 2) {
    return (
      <div
        style={{ height: chartHeight }}
        className="flex items-center justify-center rounded-lg border border-dashed border-black/10 text-center text-sm text-foreground/50 dark:border-white/10"
      >
        Add balances on at least two different dates to see your net worth
        trend.
      </div>
    );
  }

  return (
    <div style={{ height: chartHeight }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.22} />
              <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            tick={{ fill: "var(--chart-axis-text)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v: number) => formatCurrency(v, currency).replace(/\.00$/, "")}
            tick={{ fill: "var(--chart-axis-text)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            content={<ChartTooltip currency={currency} />}
            cursor={{ stroke: "var(--chart-grid)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke={LINE_COLOR}
            strokeWidth={2}
            fill="url(#netWorthFill)"
            dot={false}
            activeDot={{ r: 4, stroke: "var(--background)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
