"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { formatCompactNumber } from "@/lib/data";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  height = 220,
  centerLabel,
}: {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const outerRadius = height / 2 - 8;
  const innerRadius = outerRadius * 0.62;
  return (
    <div className="relative shrink-0" style={{ width: height, height }}>
      <PieChart width={height} height={height}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx={height / 2}
          cy={height / 2}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          cornerRadius={6}
          isAnimationActive={false}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const n = Number(value) || 0;
            return [
              `${formatCompactNumber(n)} (${total ? ((n / total) * 100).toFixed(1) : 0}%)`,
              name,
            ];
          }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 12,
            border: "1px solid #e6e9f0",
            boxShadow: "0 8px 24px -8px rgba(15,23,42,0.15)",
            padding: "8px 12px",
          }}
        />
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-foreground sm:text-lg">
          {formatCompactNumber(total)}
        </span>
        {centerLabel && <span className="text-[10px] text-muted">{centerLabel}</span>}
      </div>
    </div>
  );
}
