import { FIELD_METRICS, rankByMetric } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/data";
import type { Politician } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";

function formatValue(value: number, format: "compact" | "percent"): string {
  return format === "percent" ? `${value.toFixed(2)}%` : formatCompactNumber(value);
}

export function FieldRankingsCard({
  politicians,
  colors,
}: {
  politicians: Politician[];
  colors: Record<string, string>;
}) {
  return (
    <Card
      title="Field rankings"
      subtitle="Each metric ranked independently, straight from the reported totals — no blended score."
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {FIELD_METRICS.map((metric) => {
          const rows = rankByMetric(politicians, metric.fn);
          return (
            <div key={metric.key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {metric.label}
              </p>
              <div className="flex flex-col gap-2.5">
                {rows.map((row) => (
                  <div key={row.politicianId}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-muted">
                          {row.rank}
                        </span>
                        <Avatar name={row.name} color={colors[row.politicianId]} size={20} />
                        {row.name}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatValue(row.value, metric.format)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(3, row.pctOfLeader)}%`,
                          backgroundColor: colors[row.politicianId],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
