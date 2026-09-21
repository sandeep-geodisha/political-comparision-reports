"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactNumber } from "@/lib/data";
import { SortedTooltipContent } from "./SortedTooltip";

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

function truncateLabel(label: string, maxChars: number): string {
  return label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label;
}

export function BarComparisonChart({
  data,
  xKey,
  series,
  height = 260,
  horizontal = false,
  maxBarSize = 36,
  yAxisWidth = 110,
  yAxisMaxChars = 16,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: BarSeries[];
  height?: number;
  horizontal?: boolean;
  maxBarSize?: number;
  yAxisWidth?: number;
  yAxisMaxChars?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 8, left: horizontal ? 16 : 0, bottom: 0 }}
          barGap={4}
          barCategoryGap={data.length <= 2 ? "20%" : "10%"}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(v) => formatCompactNumber(v)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={{ fontSize: 11, fill: "#475569" }}
                tickFormatter={(v: string) => truncateLabel(v, yAxisMaxChars)}
                width={yAxisWidth}
                axisLine={false}
                tickLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={{ stroke: "#eef0f5" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(v) => formatCompactNumber(v)}
                width={40}
                axisLine={false}
                tickLine={false}
              />
            </>
          )}
          <Tooltip cursor={{ fill: "#f8fafc" }} content={<SortedTooltipContent />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[6, 6, 6, 6]} maxBarSize={maxBarSize} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
