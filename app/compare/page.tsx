import {
  PLATFORM_LABELS,
  PLATFORMS,
  avgEngagementRate,
  buildDailySeries,
  formatCompactNumber,
  getPdfSupplement,
  getPoliticians,
  isDailySeriesReliable,
  totalFollowers,
  totalViews,
} from "@/lib/data";
import { buildComparisonNarrative, fieldContentPillars } from "@/lib/analytics";
import { colorForId } from "@/lib/colors";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { ChangeBadge } from "@/components/ChangeBadge";
import { PoliticianPicker } from "@/components/PoliticianPicker";
import { TrendChart } from "@/components/charts/TrendChart";
import { BarComparisonChart } from "@/components/charts/BarComparisonChart";
import { InsightsCard } from "@/components/InsightsCard";
import { FieldRankingsCard } from "@/components/FieldRankingsCard";
import { MomentumEfficiencySection } from "@/components/MomentumEfficiencySection";
import { PlatformStrategySection } from "@/components/PlatformStrategySection";
import { ContentStrategyComparisonSection } from "@/components/ContentStrategyComparisonSection";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const politicians = getPoliticians();
  const allIds = politicians.map((p) => p.id);

  const requestedIds = ids ? ids.split(",").filter(Boolean) : [];
  const selected = requestedIds.length
    ? politicians.filter((p) => requestedIds.includes(p.id))
    : politicians;

  const colors = Object.fromEntries(selected.map((p) => [p.id, colorForId(p.id, allIds)]));

  const postsSeries = buildDailySeries(selected, "posts").map((row) => ({
    ...row,
    date: String(row.date).slice(0, 6),
  }));
  const engagementSeries = buildDailySeries(selected, "engagement").map((row) => ({
    ...row,
    date: String(row.date).slice(0, 6),
  }));
  const viewsSeries = buildDailySeries(selected, "views").map((row) => ({
    ...row,
    date: String(row.date).slice(0, 6),
  }));
  const viewsUnreliableByPolitician = selected
    .map((p) => ({
      name: p.name,
      platforms: PLATFORMS.filter(
        (pl) =>
          (p.posts.totalByPlatform[pl]?.Posts ?? 0) > 0 && !isDailySeriesReliable(p, "views", pl)
      ),
    }))
    .filter((x) => x.platforms.length > 0);

  const trendSeriesDefs = selected.map((p) => ({ key: p.id, label: p.name, color: colors[p.id] }));
  const barSeriesDefs = selected.map((p) => ({ key: p.id, label: p.name, color: colors[p.id] }));

  const followersByPlatformData = PLATFORMS.map((pl) => {
    const row: Record<string, string | number> = { platform: PLATFORM_LABELS[pl] };
    for (const p of selected) {
      row[p.id] = p.audience.followersByPlatform[pl]?.Followers ?? 0;
    }
    return row;
  });

  const supplements = Object.fromEntries(selected.map((p) => [p.id, getPdfSupplement(p.id)]));
  const hasEmv = selected.some((p) => supplements[p.id]);
  const emvData = [
    {
      metric: "Total EMV",
      ...Object.fromEntries(
        selected.map((p) => [p.id, supplements[p.id]?.earnedMediaValue.total.value ?? 0])
      ),
    },
  ];

  const narrative = selected.length > 1 ? buildComparisonNarrative(selected) : [];
  const fieldPillars = selected.length > 1 ? fieldContentPillars(selected) : [];

  const kpiRows = [
    { key: "Posts", label: "Posts published", hint: "Total posts published across all platforms this period" },
    {
      key: "Engagement",
      label: "Total engagement",
      hint: "Likes, comments, shares and reactions combined, across all platforms",
    },
    { key: "Fans Count", label: "Total followers", hint: "Combined follower count across all platforms" },
    {
      key: "Avg Posts / Day",
      label: "Avg. posts / day",
      hint: "Average number of posts published per day this period",
    },
    {
      key: "Avg Engagement",
      label: "Avg. engagement / post",
      hint: "Average engagement received per post this period",
    },
    {
      key: "Total Video Views",
      label: "Video views",
      hint: "Total views on video content across all platforms",
    },
    {
      key: "Total Impressions",
      label: "Impressions",
      hint: "Total number of times posts were shown to viewers, across all platforms",
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Compare politicians
        </h1>
        <p className="mt-1 text-sm text-muted">
          Select two or more politicians to compare their social media performance side by side.
        </p>
      </div>

      <Card padded className="!p-3 sm:!p-4">
        <PoliticianPicker politicians={politicians} selectedIds={selected.map((p) => p.id)} />
      </Card>

      {selected.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">Select at least one politician above to see a comparison.</p>
        </Card>
      ) : (
        <>
          {selected.length > 1 && (
            <>
              <InsightsCard
                title="Analyst summary"
                subtitle="Social media performance only — reach, engagement and content strategy. Not a prediction of electoral standing."
                summary={narrative}
                observations={[]}
              />

              <FieldRankingsCard politicians={selected} colors={colors} />
            </>
          )}

          <Card
            title="Side-by-side profile"
            subtitle="Each metric's badge shows the change vs. the previous period of the same length."
            padded={false}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-alt text-left text-[11px] uppercase tracking-wide text-muted">
                    <th className="sticky left-0 z-10 min-w-[140px] whitespace-nowrap bg-surface-alt px-4 py-3.5 font-semibold backdrop-blur">
                      Metric
                    </th>
                    {selected.map((p) => (
                      <th key={p.id} className="min-w-[110px] px-4 py-3.5 font-semibold">
                        <span className="inline-flex items-center gap-2 normal-case text-foreground">
                          <Avatar name={p.name} color={colors[p.id]} size={22} />
                          <span className="truncate">{p.name}</span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kpiRows.map((row, i) => (
                    <tr
                      key={row.key}
                      className={"border-b border-border/70 last:border-0 " + (i % 2 === 1 ? "bg-surface-alt/60" : "")}
                    >
                      <td
                        title={row.hint}
                        className="sticky left-0 z-10 min-w-[140px] whitespace-nowrap bg-inherit px-4 py-3.5 font-medium text-muted"
                      >
                        {row.label}
                      </td>
                      {selected.map((p) => {
                        const kpi = p.kpis[row.key];
                        return (
                          <td key={p.id} className="px-4 py-3.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {kpi ? formatCompactNumber(kpi.current) : "—"}
                              </span>
                              {kpi && <ChangeBadge value={kpi.changePct} />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-b border-border/70 bg-brand-light/30">
                    <td
                      title="Combined follower count across all platforms"
                      className="sticky left-0 z-10 min-w-[140px] whitespace-nowrap bg-brand-light/60 px-4 py-3.5 font-semibold text-foreground backdrop-blur"
                    >
                      Total followers
                    </td>
                    {selected.map((p) => (
                      <td key={p.id} className="px-4 py-3.5 font-bold text-foreground">
                        {formatCompactNumber(totalFollowers(p))}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/70">
                    <td
                      title="Total content views across all platforms this period"
                      className="sticky left-0 z-10 min-w-[140px] whitespace-nowrap bg-inherit px-4 py-3.5 font-semibold text-foreground"
                    >
                      Total views
                    </td>
                    {selected.map((p) => (
                      <td key={p.id} className="px-4 py-3.5 font-bold text-foreground">
                        {formatCompactNumber(totalViews(p))}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-brand-light/30">
                    <td
                      title="Average engagement rate across platforms — engagement as a share of followers"
                      className="sticky left-0 z-10 min-w-[140px] whitespace-nowrap bg-brand-light/60 px-4 py-3.5 font-semibold text-foreground backdrop-blur"
                    >
                      Avg. engagement rate
                    </td>
                    {selected.map((p) => (
                      <td key={p.id} className="px-4 py-3.5 font-bold text-brand-dark">
                        {avgEngagementRate(p).toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {selected.length > 1 && <MomentumEfficiencySection politicians={selected} colors={colors} />}

          <Card title="Followers by platform" subtitle="Compare audience distribution across channels">
            <BarComparisonChart data={followersByPlatformData} xKey="platform" series={barSeriesDefs} />
          </Card>

          {selected.length > 1 && <PlatformStrategySection politicians={selected} colors={colors} />}

          {hasEmv && (
            <Card
              title="Earned media value"
              subtitle="Estimated equivalent ad-spend value of this period's organic performance"
            >
              <BarComparisonChart
                data={emvData}
                xKey="metric"
                series={barSeriesDefs}
                horizontal
                height={Math.max(140, selected.length * 44 + 60)}
                maxBarSize={28}
              />
            </Card>
          )}

          <Card title="Posts over time" subtitle="Daily post volume, combined across channels">
            <TrendChart data={postsSeries} series={trendSeriesDefs} />
          </Card>

          <Card title="Engagement over time" subtitle="Daily engagement, combined across channels">
            <TrendChart data={engagementSeries} series={trendSeriesDefs} />
          </Card>

          <Card title="Views over time" subtitle="Daily views, combined across channels">
            {viewsUnreliableByPolitician.length > 0 && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
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
                  Daily view data isn&rsquo;t fully reported by the source for some platforms, so
                  they&rsquo;re excluded here to avoid understating totals:{" "}
                  {viewsUnreliableByPolitician
                    .map((x) => `${x.name} (${x.platforms.map((pl) => PLATFORM_LABELS[pl]).join(", ")})`)
                    .join("; ")}
                  . See Total Views for accurate figures.
                </span>
              </div>
            )}
            <TrendChart data={viewsSeries} series={trendSeriesDefs} />
          </Card>

          {selected.length > 1 && (
            <ContentStrategyComparisonSection pillars={fieldPillars} colors={colors} />
          )}

          <div>
            <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">Per-channel breakdown</h2>
            <p className="mb-3 text-sm text-muted">
              How each politician performs on each individual platform.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {PLATFORMS.map((pl) => {
                const rows = selected.map((p) => ({
                  id: p.id,
                  name: p.name,
                  followers: p.audience.followersByPlatform[pl]?.Followers ?? 0,
                  posts: p.posts.totalByPlatform[pl]?.Posts ?? 0,
                  engagement: p.engagement.totalByPlatform[pl]?.Engagement ?? 0,
                }));
                const hasData = rows.some((r) => r.followers || r.posts || r.engagement);
                if (!hasData) return null;
                return (
                  <Card key={pl} title={PLATFORM_LABELS[pl]}>
                    <div className="flex flex-col divide-y divide-border/70">
                      {rows.map((r) => (
                        <div key={r.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
                            <Avatar name={r.name} color={colors[r.id]} size={22} />
                            <span className="truncate">{r.name}</span>
                          </span>
                          <div className="grid grid-cols-3 gap-2 rounded-lg bg-surface-alt/70 px-3 py-2 text-center">
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {formatCompactNumber(r.followers)}
                              </p>
                              <p className="text-[10px] uppercase tracking-wide text-muted">Followers</p>
                            </div>
                            <div className="border-x border-border">
                              <p className="text-sm font-bold text-foreground">{r.posts}</p>
                              <p className="text-[10px] uppercase tracking-wide text-muted">Posts</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {formatCompactNumber(r.engagement)}
                              </p>
                              <p className="text-[10px] uppercase tracking-wide text-muted">Engagement</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
