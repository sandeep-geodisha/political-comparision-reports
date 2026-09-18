import type { Politician } from "@/lib/types";
import { dominantPlatform, platformShares, whitespaceOpportunity } from "@/lib/analytics";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";

export function PlatformStrategySection({
  politicians,
  colors,
}: {
  politicians: Politician[];
  colors: Record<string, string>;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">Platform strategy</h2>
      <p className="mb-3 text-sm text-muted">
        Where each campaign concentrates its audience, and the biggest whitespace gap versus the
        strongest rival on that platform.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {politicians.map((p) => {
          const shares = platformShares(p);
          const dominant = dominantPlatform(p);
          const rivals = politicians.filter((x) => x.id !== p.id);
          const gap = whitespaceOpportunity(p, rivals);
          const concentrated = dominant.followerSharePct >= 60;

          return (
            <Card key={p.id}>
              <div className="flex items-center gap-2.5">
                <Avatar name={p.name} color={colors[p.id]} size={28} />
                <p className="font-semibold text-foreground">{p.name}</p>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {shares
                  .filter((s) => s.followerSharePct > 0)
                  .sort((a, b) => b.followerSharePct - a.followerSharePct)
                  .map((s) => (
                    <div key={s.platform} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: PLATFORM_COLORS[s.platform] }}
                      />
                      <span className="w-16 shrink-0 text-xs text-muted">
                        {PLATFORM_LABELS[s.platform]}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/50">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.followerSharePct}%`,
                            backgroundColor: PLATFORM_COLORS[s.platform],
                          }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs font-semibold text-foreground">
                        {s.followerSharePct.toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>

              {concentrated && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.18A2 2 0 004 21h16a2 2 0 001.89-2.96L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span>
                    {Math.round(dominant.followerSharePct)}% of the audience is concentrated on{" "}
                    {PLATFORM_LABELS[dominant.platform]} — a single-platform disruption (algorithm
                    change, account issue) would hit this campaign hardest.
                  </span>
                </div>
              )}

              {gap && (
                <div className="mt-2 flex items-start gap-2 rounded-xl border border-brand/20 bg-brand-light/40 px-3 py-2.5 text-xs text-foreground/85">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                  <span>
                    <strong>Whitespace on {PLATFORM_LABELS[gap.platform]}:</strong> only{" "}
                    {Math.round(gap.politicianFollowerSharePct)}% of this campaign&rsquo;s audience is
                    there, versus {Math.round(gap.bestRivalFollowerSharePct)}% for {gap.bestRivalName}
                    — room to grow where a rival has already proven the platform works.
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
