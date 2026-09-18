import { Fragment } from "react";
import {
  PLATFORM_LABELS,
  PLATFORMS,
  avgEngagementRate,
  buildDailySeries,
  formatCompactNumber,
  getPdfSupplement,
  getPoliticians,
  totalEngagement,
  totalFollowers,
  totalPosts,
  totalVideoViews,
  totalViews,
} from "@/lib/data";
import { colorForId } from "@/lib/colors";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { ChangeBadge } from "@/components/ChangeBadge";
import { PoliticianPicker } from "@/components/PoliticianPicker";
import { TrendChart } from "@/components/charts/TrendChart";
import { BarComparisonChart } from "@/components/charts/BarComparisonChart";
import { RadarComparisonChart } from "@/components/charts/RadarComparisonChart";

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

  const maxFollowers = Math.max(...selected.map(totalFollowers), 1);
  const maxEngagement = Math.max(...selected.map(totalEngagement), 1);
  const maxPosts = Math.max(...selected.map(totalPosts), 1);
  const maxViews = Math.max(...selected.map(totalViews), 1);
  const maxVideoViews = Math.max(...selected.map(totalVideoViews), 1);
  const maxRate = Math.max(...selected.map(avgEngagementRate), 1);

  const radarData = [
    { metric: "Followers", ...Object.fromEntries(selected.map((p) => [p.id, Math.round((totalFollowers(p) / maxFollowers) * 100)])) },
    { metric: "Engagement", ...Object.fromEntries(selected.map((p) => [p.id, Math.round((totalEngagement(p) / maxEngagement) * 100)])) },
    { metric: "Posts", ...Object.fromEntries(selected.map((p) => [p.id, Math.round((totalPosts(p) / maxPosts) * 100)])) },
    { metric: "Views", ...Object.fromEntries(selected.map((p) => [p.id, Math.round((totalViews(p) / maxViews) * 100)])) },
    { metric: "Video Views", ...Object.fromEntries(selected.map((p) => [p.id, Math.round((totalVideoViews(p) / maxVideoViews) * 100)])) },
    { metric: "Eng. Rate", ...Object.fromEntries(selected.map((p) => [p.id, Math.round((avgEngagementRate(p) / maxRate) * 100)])) },
  ];

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
                    <th className="sticky left-0 z-10 bg-surface-alt px-4 py-3 font-semibold backdrop-blur">
                      Metric
                    </th>
                    {selected.map((p) => (
                      <th key={p.id} className="px-4 py-3 font-semibold">
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
                        className="sticky left-0 z-10 bg-inherit px-4 py-3 font-medium text-muted"
                      >
                        {row.label}
                      </td>
                      {selected.map((p) => {
                        const kpi = p.kpis[row.key];
                        return (
                          <td key={p.id} className="px-4 py-3">
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
                      className="sticky left-0 z-10 bg-brand-light/60 px-4 py-3 font-semibold text-foreground backdrop-blur"
                    >
                      Total followers
                    </td>
                    {selected.map((p) => (
                      <td key={p.id} className="px-4 py-3 font-bold text-foreground">
                        {formatCompactNumber(totalFollowers(p))}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/70">
                    <td
                      title="Total content views across all platforms this period"
                      className="sticky left-0 z-10 bg-inherit px-4 py-3 font-semibold text-foreground"
                    >
                      Total views
                    </td>
                    {selected.map((p) => (
                      <td key={p.id} className="px-4 py-3 font-bold text-foreground">
                        {formatCompactNumber(totalViews(p))}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-brand-light/30">
                    <td
                      title="Average engagement rate across platforms — engagement as a share of followers"
                      className="sticky left-0 z-10 bg-brand-light/60 px-4 py-3 font-semibold text-foreground backdrop-blur"
                    >
                      Avg. engagement rate
                    </td>
                    {selected.map((p) => (
                      <td key={p.id} className="px-4 py-3 font-bold text-brand-dark">
                        {avgEngagementRate(p).toFixed(2)}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {selected.length > 1 && (
            <Card
              title="Overall performance radar"
              subtitle="Each axis normalized to the top performer (100%) among selected politicians"
            >
              <RadarComparisonChart data={radarData} series={barSeriesDefs} />
            </Card>
          )}

          <Card title="Followers by platform" subtitle="Compare audience distribution across channels">
            <BarComparisonChart data={followersByPlatformData} xKey="platform" series={barSeriesDefs} />
          </Card>

          {hasEmv && (
            <Card
              title="Earned media value"
              subtitle="Estimated equivalent ad-spend value of this period's organic performance"
            >
              <BarComparisonChart data={emvData} xKey="metric" series={barSeriesDefs} horizontal height={140} />
            </Card>
          )}

          <Card title="Posts over time" subtitle="Daily post volume, combined across channels">
            <TrendChart data={postsSeries} series={trendSeriesDefs} />
          </Card>

          <Card title="Engagement over time" subtitle="Daily engagement, combined across channels">
            <TrendChart data={engagementSeries} series={trendSeriesDefs} />
          </Card>

          <Card title="Views over time" subtitle="Daily views, combined across channels">
            <TrendChart data={viewsSeries} series={trendSeriesDefs} />
          </Card>

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
                  <Card key={pl} title={PLATFORM_LABELS[pl]} padded={false} className="overflow-hidden">
                    <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_3rem_4rem] gap-x-3 gap-y-2.5 px-4 pb-4 pt-1 sm:px-5">
                      <span className="col-span-1" />
                      <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Followers
                      </span>
                      <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Posts
                      </span>
                      <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Engagement
                      </span>
                      {rows.map((r) => (
                        <Fragment key={r.id}>
                          <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                            <Avatar name={r.name} color={colors[r.id]} size={22} />
                            <span className="truncate">{r.name}</span>
                          </span>
                          <span className="self-center text-right text-sm font-semibold text-foreground">
                            {formatCompactNumber(r.followers)}
                          </span>
                          <span className="self-center text-right text-sm font-semibold text-foreground">
                            {r.posts}
                          </span>
                          <span className="self-center text-right text-sm font-semibold text-foreground">
                            {formatCompactNumber(r.engagement)}
                          </span>
                        </Fragment>
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
