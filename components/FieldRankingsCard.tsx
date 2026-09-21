import type { ReactNode } from "react";
import { FIELD_METRICS, rankByMetric } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/data";
import type { Politician } from "@/lib/types";

const RANK_MEDAL = ["#eab308", "#94a3b8", "#b45309"];

const METRIC_ORDER = ["followers", "views", "posts", "engagementPerPost", "engagement"];

const METRIC_ACCENT: Record<string, string> = {
  followers: "#6366f1",
  engagement: "#ec4899",
  engagementPerPost: "#f59e0b",
  views: "#0ea5e9",
  posts: "#a855f7",
};

const METRIC_ICON: Record<string, ReactNode> = {
  followers: (
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  ),
  engagement: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
  engagementPerPost: <path d="M12 20V10M18 20V4M6 20v-4" />,
  views: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  posts: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
};

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
  const ordered = METRIC_ORDER.map((key) => FIELD_METRICS.find((m) => m.key === key))
    .filter((m): m is (typeof FIELD_METRICS)[number] => m !== undefined)
    .map((metric) => ({ metric, rows: rankByMetric(politicians, metric.fn) }));

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">Field rankings</h2>
      <p className="mb-3 text-sm text-muted">
        Each metric ranked independently, straight from the reported totals — no blended score.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ordered.map(({ metric, rows }) => {
          const accent = METRIC_ACCENT[metric.key] ?? "#6366f1";
          const leader = rows[0];
          return (
            <div
              key={metric.key}
              className="overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-[0_1px_1px_rgba(15,23,42,0.03),0_16px_32px_-16px_rgba(15,23,42,0.16)] ring-1 ring-black/[0.02]"
            >
              <div
                className="h-1.5 w-full"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
              />
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      {METRIC_ICON[metric.key]}
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{metric.label}</p>
                    {leader && (
                      <p className="truncate text-xs text-muted">
                        {leader.name} leads at {formatValue(leader.value, metric.format)}
                      </p>
                    )}
                  </div>
                </div>
                {"hint" in metric && metric.hint && (
                  <p className="mt-2 text-[11px] leading-snug text-muted">{metric.hint}</p>
                )}

                <div className="mt-4 flex flex-col gap-3">
                  {rows.map((row) => (
                    <div key={row.politicianId}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: RANK_MEDAL[row.rank - 1] ?? "#cbd5e1" }}
                          >
                            {row.rank}
                          </span>
                          <span className="truncate">{row.name}</span>
                        </span>
                        <span className="shrink-0 font-semibold text-foreground">
                          {formatValue(row.value, metric.format)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt ring-1 ring-inset ring-border/60">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(4, row.pctOfLeader)}%`,
                            background: `linear-gradient(90deg, ${colors[row.politicianId]}, ${colors[row.politicianId]}99)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
