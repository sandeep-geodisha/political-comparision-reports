import type { Politician } from "@/lib/types";
import { dominantPlatform, platformShares, whitespaceOpportunity } from "@/lib/analytics";
import { PLATFORM_COLORS, PLATFORM_LABELS, untrackedPlatforms } from "@/lib/data";
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
          const missing = untrackedPlatforms(p, politicians);
          const rawGap = whitespaceOpportunity(p, rivals);
          const gap = rawGap && missing.includes(rawGap.platform) ? null : rawGap;
          const concentrated = Math.round(dominant.followerSharePct) >= 60;

          return (
            <Card key={p.id}>
              <div className="flex items-center gap-2.5">
                <Avatar name={p.name} color={colors[p.id]} size={28} />
                <p className="font-semibold text-foreground">{p.name}</p>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {shares
                  .sort((a, b) => b.followerSharePct - a.followerSharePct)
                  .map((s) => {
                    const negligible = s.followerSharePct < 1;
                    return (
                      <div
                        key={s.platform}
                        className={"flex items-center gap-2" + (negligible ? " opacity-40" : "")}
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: negligible ? "#cbd5e1" : PLATFORM_COLORS[s.platform] }}
                        />
                        <span className="w-16 shrink-0 text-xs text-muted">
                          {PLATFORM_LABELS[s.platform]}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/50">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(negligible ? 1.5 : 0, s.followerSharePct)}%`,
                              backgroundColor: negligible ? "#cbd5e1" : PLATFORM_COLORS[s.platform],
                            }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs font-semibold text-foreground">
                          {s.followerSharePct < 1 && s.followerSharePct > 0
                            ? "<1%"
                            : `${s.followerSharePct.toFixed(0)}%`}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {concentrated && missing.length === 0 && (
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

              {missing.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-xs text-muted">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" d="M12 16v-5" />
                    <path strokeLinecap="round" d="M12 8h.01" />
                  </svg>
                  <span>
                    <strong className="text-foreground">
                      {missing.map((pl) => PLATFORM_LABELS[pl]).join(" and ")} not tracked:
                    </strong>{" "}
                    no Socialinsider data is available for this profile, so the shares above reflect
                    only {shares
                      .filter((s) => s.followerSharePct > 0)
                      .map((s) => PLATFORM_LABELS[s.platform])
                      .join(" and ")}
                    , not a deliberate concentration strategy.
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
                    there, versus {Math.round(gap.bestRivalFollowerSharePct)}% for {gap.bestRivalName} —
                    room to grow where a rival has already proven the platform works.
                  </span>
                </div>
              )}

              {!concentrated && !gap && missing.length === 0 && (
                <div className="mt-2 flex items-start gap-2 rounded-xl border border-positive/20 bg-positive-bg px-3 py-2.5 text-xs text-positive">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>
                    <strong>Well-diversified:</strong> no single platform dominates the audience,
                    and there&rsquo;s no clear gap versus a rival&rsquo;s strongest platform —
                    a healthier spread of risk than a concentrated strategy.
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
