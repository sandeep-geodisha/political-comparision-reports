import type { Politician } from "@/lib/types";
import { biggestEngagementSpike, engagementPerFollowerPct, engagementPerPost } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";

export function MomentumEfficiencySection({
  politicians,
  colors,
}: {
  politicians: Politician[];
  colors: Record<string, string>;
}) {
  const rows = politicians.map((p) => ({
    p,
    spike: biggestEngagementSpike(p),
    engPerPost: engagementPerPost(p),
    engPerFollower: engagementPerFollowerPct(p),
  }));

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">Content efficiency</h2>
      <p className="mb-3 text-sm text-muted">
        How much engagement each campaign earns per post and per follower   a read on content
        quality that doesn&rsquo;t just reward posting more.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {rows.map(({ p, spike, engPerPost, engPerFollower }) => (
          <Card key={p.id}>
            <div className="flex items-center gap-2.5">
              <Avatar name={p.name} color={colors[p.id]} size={28} />
              <p className="font-semibold text-foreground">{p.name}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 text-center">
              <div
                className="rounded-lg bg-surface-alt/70 p-2.5"
                title="Total engagement this period divided by total posts this period"
              >
                <p className="text-sm font-bold text-foreground">{formatCompactNumber(engPerPost)}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted">Eng. / post</p>
              </div>
              <div
                className="rounded-lg bg-surface-alt/70 p-2.5"
                title="Total engagement this period as a percentage of total followers"
              >
                <p className="text-sm font-bold text-foreground">{engPerFollower.toFixed(2)}%</p>
                <p className="text-[10px] uppercase tracking-wide text-muted">Eng. / follower</p>
              </div>
            </div>

            {spike && (
              <div className="mt-3 rounded-xl border border-border/70 bg-surface-alt/50 p-3 text-xs">
                <p className="font-semibold text-foreground">
                  Highest-engagement day: {spike.date.replace(/^(\d+) (\w+) .*/, "$1 $2")}
                </p>
                <p className="mt-0.5 text-muted">
                  {formatCompactNumber(spike.value)} engagements that day vs. a{" "}
                  {formatCompactNumber(spike.dailyAverage)} daily average ({Math.round(spike.vsAverage)}%
                  higher)
                  {spike.matchingTopPost && (
                    <>
                      {" "}
                        driven by a{" "}
                      <a
                        href={spike.matchingTopPost.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand hover:underline"
                      >
                        {spike.matchingTopPost.type}
                      </a>{" "}
                      post ({formatCompactNumber(spike.matchingTopPost.engagement)} engagements)
                    </>
                  )}
                  .
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
