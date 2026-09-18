"use client";

import { formatCompactNumber } from "@/lib/data";

interface TooltipPayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

export function SortedTooltipContent({
  active,
  payload,
  label,
  formatValue = (v) => formatCompactNumber(v),
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  formatValue?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  const sorted = [...payload].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));

  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-[0_8px_24px_-8px_rgba(15,23,42,0.15)]">
      {label !== undefined && (
        <p className="mb-1.5 text-[11px] font-semibold text-foreground">{label}</p>
      )}
      <div className="flex flex-col gap-1">
        {sorted.map((entry, i) => (
          <div key={`${entry.dataKey}-${i}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-foreground">
              {formatValue(Number(entry.value) || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
