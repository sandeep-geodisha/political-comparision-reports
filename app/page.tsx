import Link from "next/link";
import {
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  PLATFORMS,
  RANK_METRICS,
  formatCompactNumber,
  getPoliticians,
  totalEngagement,
  totalFollowers,
  totalPosts,
} from "@/lib/data";
import { colorForId } from "@/lib/colors";
import { Avatar } from "@/components/Avatar";
import { Card, StatTile } from "@/components/Card";
import { ChangeBadge } from "@/components/ChangeBadge";
import { RankingsTable } from "@/components/RankingsTable";

export default function OverviewPage() {
  const politicians = getPoliticians();
  const ids = politicians.map((p) => p.id);

  const totals = {
    politicians: politicians.length,
    followers: politicians.reduce((a, p) => a + totalFollowers(p), 0),
    engagement: politicians.reduce((a, p) => a + totalEngagement(p), 0),
    posts: politicians.reduce((a, p) => a + totalPosts(p), 0),
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Social media performance across all tracked politicians ·{" "}
            <span className="font-medium text-foreground/80">{politicians[0]?.dateRange}</span>
          </p>
        </div>
        <Link
          href="/compare"
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Compare politicians
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Politicians tracked"
          value={String(totals.politicians)}
          accent="#6366f1"
          hint="Number of politicians with social media data in this dashboard"
        />
        <StatTile
          label="Combined followers"
          value={formatCompactNumber(totals.followers)}
          accent="#0ea5e9"
          hint="Sum of Facebook, Instagram and Twitter followers, across all politicians"
        />
        <StatTile
          label="Combined engagement"
          value={formatCompactNumber(totals.engagement)}
          accent="#ec4899"
          hint="Sum of likes, comments and shares across all platforms and politicians, this period"
        />
        <StatTile
          label="Combined posts"
          value={formatCompactNumber(totals.posts)}
          accent="#10b981"
          hint="Total posts published across all platforms and politicians, this period"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">Politicians</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {politicians.map((p) => {
            const color = colorForId(p.id, ids);
            const posts = p.kpis["Posts"];
            const engagement = p.kpis["Engagement"];
            return (
              <Link key={p.id} href={`/politicians/${p.id}`} className="group block">
                <div
                  className="h-full overflow-hidden rounded-2xl border bg-surface shadow-[0_1px_1px_rgba(15,23,42,0.03),0_16px_32px_-16px_rgba(15,23,42,0.16)] ring-1 ring-black/[0.02] transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_24px_40px_-16px_rgba(15,23,42,0.28)]"
                  style={{ borderColor: `${color}30` }}
                >
                  <div
                    className="h-2 w-full"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
                  />
                  <div
                    className="p-4 sm:p-5"
                    style={{ background: `linear-gradient(160deg, ${color}10, transparent 55%)` }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} color={color} size={44} />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">{p.name}</p>
                        <p className="truncate text-xs text-muted">
                          {p.profiles.map((pr) => PLATFORM_LABELS[pr.platform]).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border/70 bg-surface-alt/70 p-3 text-center">
                      <div>
                        <p className="text-base font-bold text-foreground sm:text-lg">
                          {formatCompactNumber(totalFollowers(p))}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-muted">Followers</p>
                      </div>
                      <div className="border-x border-border">
                        <p className="text-base font-bold text-foreground sm:text-lg">
                          {formatCompactNumber(engagement?.current ?? 0)}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-muted">Engagement</p>
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground sm:text-lg">
                          {formatCompactNumber(posts?.current ?? 0)}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-muted">Posts</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] uppercase tracking-wide text-muted/80">
                      Followers by platform
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {PLATFORMS.map((pl) => {
                        const followers = p.audience.followersByPlatform[pl]?.Followers;
                        if (!followers) return null;
                        return (
                          <span
                            key={pl}
                            title={`${PLATFORM_LABELS[pl]} followers`}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: PLATFORM_COLORS[pl] }}
                            />
                            {PLATFORM_LABELS[pl]} {formatCompactNumber(followers)}
                          </span>
                        );
                      })}
                      <span className="ml-auto" title="Engagement change vs. the previous period">
                        <ChangeBadge value={engagement?.changePct} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">Rankings</h2>
        <p className="mb-3 text-sm text-muted">
          All politicians side by side. Click a column to sort, or a row to open that profile.
        </p>
        <Card padded={false} className="overflow-hidden p-3 sm:p-4">
          <RankingsTable politicians={politicians} />
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-foreground sm:text-xl">Leaderboard by metric</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {RANK_METRICS.map((metric) => {
            const sorted = [...politicians].sort((a, b) => metric.fn(b) - metric.fn(a));
            const max = metric.fn(sorted[0]) || 1;
            return (
              <Card key={metric.key} title={metric.label}>
                <div className="flex flex-col gap-3.5">
                  {sorted.map((p, i) => {
                    const value = metric.fn(p);
                    const pct = Math.max(4, (value / max) * 100);
                    const color = colorForId(p.id, ids);
                    return (
                      <div key={p.id}>
                        <div className="mb-1.5 flex items-center justify-between text-xs sm:text-sm">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <span
                              className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {i + 1}
                            </span>
                            {p.name}
                          </span>
                          <span className="font-semibold text-muted">
                            {metric.key === "engagementRate"
                              ? `${value.toFixed(2)}%`
                              : formatCompactNumber(value)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt ring-1 ring-inset ring-border/60">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${color}, ${color}99)`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
