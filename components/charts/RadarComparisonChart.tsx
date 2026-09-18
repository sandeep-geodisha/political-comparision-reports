"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { SortedTooltipContent } from "./SortedTooltip";

export interface RadarSeries {
  key: string;
  label: string;
  color: string;
}

export function RadarComparisonChart({
  data,
  series,
  height = 340,
}: {
  data: Record<string, string | number>[];
  series: RadarSeries[];
  height?: number;
}) {
  return (
    <div className="mx-auto" style={{ width: "100%", maxWidth: height * 1.3, height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="68%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="#eef0f5" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#475569" }} />
          <PolarRadiusAxis tick={{ fontSize: 9, fill: "#94a3b8" }} angle={30} axisLine={false} />
          <Tooltip content={<SortedTooltipContent formatValue={(v) => `${v}%`} />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
          {series.map((s) => (
            <Radar
              key={s.key}
              name={s.label}
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.18}
              strokeWidth={2.25}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
