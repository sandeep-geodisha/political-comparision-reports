import type { FieldContentPillar } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/data";
import { Card } from "@/components/Card";

export function ContentStrategyComparisonSection({
  pillars,
  colors,
}: {
  pillars: FieldContentPillar[];
  colors: Record<string, string>;
}) {
  if (!pillars.length) return null;

  const maxAvg = Math.max(...pillars.map((p) => p.avgEngagementPerPost), 1);

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">
        Content strategy across the field
      </h2>
      <p className="mb-3 text-sm text-muted">
        Content themes ranked by average engagement per post, field-wide — showing which themes
        perform best regardless of how many candidates use them, and who is (and isn&rsquo;t)
        investing in each.
      </p>
      <Card>
        <div className="flex flex-col gap-4">
          {pillars.map((pillar) => {
            const lowSample = pillar.totalPosts < 10;
            return (
            <div key={pillar.name} className="rounded-xl border border-border/70 bg-surface-alt/50 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="flex items-center gap-1.5 font-semibold text-foreground">
                  {pillar.name}
                  {lowSample && (
                    <span
                      className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                      title={`Only ${pillar.totalPosts} posts field-wide — this average is based on a small sample and may not be reliable`}
                    >
                      small sample
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {formatCompactNumber(pillar.avgEngagementPerPost)} avg. engagement/post ·{" "}
                  {pillar.totalPosts} posts field-wide · {formatCompactNumber(pillar.totalEngagement)}{" "}
                  total engagement
                </p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark"
                  style={{ width: `${(pillar.avgEngagementPerPost / maxAvg) * 100}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {pillar.byPolitician
                  .sort((a, b) => b.engagement - a.engagement)
                  .map((bp) => (
                    <span
                      key={bp.politicianId}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: colors[bp.politicianId] }}
                      />
                      <span className="font-medium text-foreground">{bp.name}</span>
                      <span className="text-muted">
                        {bp.posts} {bp.posts === 1 ? "post" : "posts"}
                      </span>
                    </span>
                  ))}
              </div>
            </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
