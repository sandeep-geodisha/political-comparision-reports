import type { ContentPillar } from "@/lib/types";
import { PLATFORM_COLORS, PLATFORM_LABELS, formatCompactNumber } from "@/lib/data";
import { Card } from "@/components/Card";
import { BarComparisonChart } from "@/components/charts/BarComparisonChart";

export function ContentPillarsSection({ pillars }: { pillars: ContentPillar[] }) {
  if (!pillars.length) return null;

  const chartData = pillars.map((p) => ({ name: p.name, posts: p.posts }));

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">
        Top content pillars
      </h2>
      <p className="mb-3 text-sm text-muted">
        How this period&rsquo;s posts break down by content theme, ranked by post volume.
      </p>
      <Card>
        <BarComparisonChart
          data={chartData}
          xKey="name"
          series={[{ key: "posts", label: "Posts", color: "#6366f1" }]}
          horizontal
          height={Math.max(160, pillars.length * 56)}
        />
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-3 py-2.5 font-semibold sm:px-4">Content pillar</th>
                <th className="px-3 py-2.5 text-right font-semibold sm:px-4">Posts</th>
                <th className="px-3 py-2.5 text-right font-semibold sm:px-4">Engagement</th>
                <th
                  className="px-3 py-2.5 text-right font-semibold sm:px-4"
                  title="Average engagement rate for posts in this content pillar"
                >
                  Avg. eng. rate
                </th>
                <th className="px-3 py-2.5 text-right font-semibold sm:px-4">Top channel</th>
              </tr>
            </thead>
            <tbody>
              {pillars.map((p, i) => (
                <tr
                  key={p.name}
                  className={
                    "border-b border-border/70 last:border-0 " + (i % 2 === 1 ? "bg-surface-alt/60" : "")
                  }
                >
                  <td className="px-3 py-2.5 font-medium text-foreground sm:px-4">{p.name}</td>
                  <td className="px-3 py-2.5 text-right sm:px-4">{p.posts}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground sm:px-4">
                    {formatCompactNumber(p.engagement)}
                  </td>
                  <td className="px-3 py-2.5 text-right sm:px-4">{p.avgEngagementRate.toFixed(2)}%</td>
                  <td className="px-3 py-2.5 text-right sm:px-4">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium"
                      style={{ color: PLATFORM_COLORS[p.topChannel] }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: PLATFORM_COLORS[p.topChannel] }}
                      />
                      {PLATFORM_LABELS[p.topChannel]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
