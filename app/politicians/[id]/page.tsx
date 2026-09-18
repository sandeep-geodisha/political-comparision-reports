import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  PLATFORMS,
  formatCompactNumber,
  getPdfSupplement,
  getPolitician,
  getPoliticians,
} from "@/lib/data";
import { colorForId } from "@/lib/colors";
import { Avatar } from "@/components/Avatar";
import { Card, StatTile } from "@/components/Card";
import { ChangeBadge } from "@/components/ChangeBadge";
import { DonutChart } from "@/components/charts/DonutChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { TopPostsTable } from "@/components/TopPostsTable";
import { InsightsCard } from "@/components/InsightsCard";
import { ContentPillarsSection } from "@/components/ContentPillarsSection";
import { EarnedMediaValueSection } from "@/components/EarnedMediaValueSection";

export function generateStaticParams() {
  return getPoliticians().map((p) => ({ id: p.id }));
}

export default async function PoliticianPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const politician = getPolitician(id);
  if (!politician) notFound();

  const allIds = getPoliticians().map((p) => p.id);
  const color = colorForId(politician.id, allIds);
  const supplement = getPdfSupplement(politician.id);

  const followersDonut = PLATFORMS.map((pl) => ({
    name: PLATFORM_LABELS[pl],
    value: politician.audience.followersByPlatform[pl]?.Followers ?? 0,
    color: PLATFORM_COLORS[pl],
  })).filter((d) => d.value > 0);

  const engagementDonut = PLATFORMS.map((pl) => ({
    name: PLATFORM_LABELS[pl],
    value: politician.engagement.totalByPlatform[pl]?.Engagement ?? 0,
    color: PLATFORM_COLORS[pl],
  })).filter((d) => d.value > 0);

  const postsSeries = politician.posts.dates.map((date, i) => {
    const row: Record<string, string | number> = { date: date.slice(0, 6) };
    for (const pl of PLATFORMS) {
      row[pl] = politician.posts.dailyByPlatform[pl]?.[i] ?? 0;
    }
    return row;
  });

  const engagementSeries = politician.posts.dates.map((date, i) => {
    const row: Record<string, string | number> = { date: date.slice(0, 6) };
    for (const pl of PLATFORMS) {
      row[pl] = politician.engagement.dailyByPlatform[pl]?.[i] ?? 0;
    }
    return row;
  });

  const viewsSeries = politician.posts.dates.map((date, i) => {
    const row: Record<string, string | number> = { date: date.slice(0, 6) };
    for (const pl of PLATFORMS) {
      row[pl] = politician.views.dailyByPlatform[pl]?.[i] ?? 0;
    }
    return row;
  });

  const platformSeries = PLATFORMS.filter(
    (pl) => (politician.posts.totalByPlatform[pl]?.Posts ?? 0) > 0
  ).map((pl) => ({ key: pl, label: PLATFORM_LABELS[pl], color: PLATFORM_COLORS[pl] }));

  const kpiOrder = [
    {
      key: "Posts",
      label: "Posts published",
      hint: "Total posts published across all platforms this period",
      accent: "#6366f1",
      metric: politician.kpis["Posts"],
    },
    {
      key: "Engagement",
      label: "Total engagement",
      hint: "Likes, comments, shares and reactions combined, across all platforms",
      accent: "#ec4899",
      metric: politician.kpis["Engagement"],
    },
    {
      key: "Fans Count",
      label: "Total followers",
      hint: "Combined follower count across all platforms",
      accent: "#0ea5e9",
      metric: politician.kpis["Fans Count"],
    },
    {
      key: "New Followers",
      label: "New followers",
      hint: "Net new followers gained this period, across all platforms",
      accent: "#22c55e",
      metric: supplement?.keyMetrics.brandGrowthOfFollowers,
    },
    {
      key: "Likes",
      label: "Total likes",
      hint: "Total likes and reactions received across all platforms this period",
      accent: "#f43f5e",
      metric: supplement?.keyMetrics.brandLikes,
    },
    {
      key: "Comments",
      label: "Total comments",
      hint: "Total comments received across all platforms this period",
      accent: "#8b5cf6",
      metric: supplement?.keyMetrics.brandComments,
    },
    {
      key: "Avg Posts / Day",
      label: "Avg. posts / day",
      hint: "Average number of posts published per day this period",
      accent: "#f59e0b",
      metric: politician.kpis["Avg Posts / Day"],
    },
    {
      key: "Avg Engagement",
      label: "Avg. engagement / post",
      hint: "Average engagement received per post this period",
      accent: "#10b981",
      metric: politician.kpis["Avg Engagement"],
    },
    {
      key: "Total Video Views",
      label: "Video views",
      hint: "Total views on video content across all platforms",
      accent: "#a855f7",
      metric: politician.kpis["Total Video Views"],
    },
    {
      key: "Total Impressions",
      label: "Impressions",
      hint: "Total number of times posts were shown to viewers, across all platforms",
      accent: "#14b8a6",
      metric: politician.kpis["Total Impressions"],
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <Link href="/" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground sm:text-sm">
          ← Back to overview
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar name={politician.name} color={color} size={52} ring />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {politician.name}
              </h1>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">{politician.dateRange}</p>
            </div>
          </div>
          <Link
            href={`/compare?ids=${politician.id}`}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-brand/30 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:text-sm"
          >
            Compare this politician
          </Link>
        </div>
      </div>

      {supplement && (
        <InsightsCard summary={supplement.insightsSummary} observations={supplement.observations} />
      )}

      <div>
        <h2 className="mb-3 text-lg font-bold text-foreground sm:text-xl">Social profiles</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {politician.profiles.map((profile) => (
            <Card key={profile.platform}>
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: PLATFORM_COLORS[profile.platform] }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: PLATFORM_COLORS[profile.platform] }}
                  />
                  {PLATFORM_LABELS[profile.platform]}
                </span>
                <span className="truncate text-xs text-muted">@{profile.handle}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-bold text-foreground">{formatCompactNumber(profile.followers)}</p>
                  <p className="text-[11px] text-muted">Followers</p>
                </div>
                <div className="border-x border-border">
                  <p className="font-bold text-foreground">{formatCompactNumber(profile.engagement)}</p>
                  <p className="text-[11px] text-muted">Engagement</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{profile.posts}</p>
                  <p className="text-[11px] text-muted">Posts</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">
          Key performance indicators
        </h2>
        <p className="mb-3 text-sm text-muted">
          Combined totals across Facebook, Instagram and Twitter for {politician.dateRange}.
          Badges show the change vs. the previous period of the same length.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {kpiOrder.map(({ key, label, hint, accent, metric }) => {
            if (!metric) return null;
            return (
              <StatTile
                key={key}
                label={label}
                hint={hint}
                value={formatCompactNumber(metric.current)}
                change={<ChangeBadge value={metric.changePct} />}
                accent={accent}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Audience by platform" subtitle="Followers distribution">
          <div className="flex flex-wrap items-center gap-6">
            <DonutChart data={followersDonut} height={180} centerLabel="Followers" />
            <div className="flex flex-1 flex-col gap-2 min-w-[140px]">
              {followersDonut.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="flex-1 text-muted">{d.name}</span>
                  <span className="font-semibold text-foreground">{formatCompactNumber(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card title="Engagement by platform" subtitle="Total engagement distribution">
          <div className="flex flex-wrap items-center gap-6">
            <DonutChart data={engagementDonut} height={180} centerLabel="Engagement" />
            <div className="flex flex-1 flex-col gap-2 min-w-[140px]">
              {engagementDonut.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="flex-1 text-muted">{d.name}</span>
                  <span className="font-semibold text-foreground">{formatCompactNumber(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Posts over time" subtitle="Daily posts per channel">
        <TrendChart data={postsSeries} series={platformSeries} />
      </Card>

      <Card title="Engagement over time" subtitle="Daily engagement per channel">
        <TrendChart data={engagementSeries} series={platformSeries} />
      </Card>

      <Card title="Views over time" subtitle="Daily views per channel">
        <TrendChart data={viewsSeries} series={platformSeries} />
      </Card>

      <div>
        <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">Top posts</h2>
        <p className="mb-3 text-sm text-muted">
          The best-performing individual posts this period, ranked by engagement.
        </p>
        <Card padded={false} className="p-3 sm:p-4">
          <TopPostsTable posts={politician.topPosts} />
        </Card>
      </div>

      {supplement && <ContentPillarsSection pillars={supplement.contentPillars} />}

      {supplement && (
        <EarnedMediaValueSection
          byChannel={supplement.earnedMediaValue.byChannel}
          total={supplement.earnedMediaValue.total}
        />
      )}
    </div>
  );
}
