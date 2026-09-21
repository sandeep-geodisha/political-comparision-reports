import {
  PLATFORM_LABELS,
  PLATFORMS,
  formatCompactNumber,
  getPdfSupplement,
  getPoliticians,
  totalViews,
} from "@/lib/data";
import { buildComparisonNarrative } from "@/lib/analytics";
import { colorForId } from "@/lib/colors";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { PoliticianPicker } from "@/components/PoliticianPicker";
import { BarComparisonChart } from "@/components/charts/BarComparisonChart";
import { InsightsCard } from "@/components/InsightsCard";
import { FieldRankingsCard } from "@/components/FieldRankingsCard";
import { MomentumEfficiencySection } from "@/components/MomentumEfficiencySection";
import { PlatformStrategySection } from "@/components/PlatformStrategySection";

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

  const kpiRows = [
    { key: "Posts", label: "Posts published", hint: "Total posts published across all platforms this period" },
    {
      key: "Engagement",
      label: "Total engagement",
      hint: "Likes, comments, shares and reactions combined, across all platforms",
    },
    { key: "Fans Count", label: "Total followers", hint: "Combined follower count across all platforms" },
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
                subtitle="Social media performance only: reach, engagement and content strategy. Not a prediction of electoral standing."
                summary={narrative}
                observations={[]}
              />

              <FieldRankingsCard politicians={selected} colors={colors} />
            </>
          )}

          <Card
            title="Side-by-side profile"
            subtitle="Every tracked metric, compared column by column."
            padded={false}
            className="overflow-hidden"
          >
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-alt text-left text-[11px] uppercase tracking-wide text-muted">
                      <th className="sticky left-0 z-10 min-w-[150px] whitespace-nowrap bg-surface-alt px-5 py-4 font-semibold backdrop-blur">
                        Metric
                      </th>
                      {selected.map((p) => (
                        <th key={p.id} className="min-w-[120px] px-5 py-4 font-semibold">
                          <span className="inline-flex items-center gap-2 normal-case text-foreground">
                            <Avatar name={p.name} color={colors[p.id]} size={24} />
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
                        className={"border-b border-border/60 last:border-0 " + (i % 2 === 1 ? "bg-surface-alt/50" : "")}
                      >
                        <td
                          title={row.hint}
                          className="sticky left-0 z-10 min-w-[150px] whitespace-nowrap bg-inherit px-5 py-4 font-medium text-muted"
                        >
                          {row.label}
                        </td>
                        {selected.map((p) => {
                          const kpi = p.kpis[row.key];
                          return (
                            <td key={p.id} className="px-5 py-4">
                              <span className="font-semibold text-foreground">
                                {kpi ? formatCompactNumber(kpi.current) : "—"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="bg-brand-light/30">
                      <td
                        title="Total content views across all platforms this period"
                        className="sticky left-0 z-10 min-w-[150px] whitespace-nowrap bg-brand-light/60 px-5 py-4 font-semibold text-foreground backdrop-blur"
                      >
                        Total views
                      </td>
                      {selected.map((p) => (
                        <td key={p.id} className="px-5 py-4 font-bold text-brand-dark">
                          {formatCompactNumber(totalViews(p))}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              {selected.length > 1 && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent sm:hidden" />
              )}
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
