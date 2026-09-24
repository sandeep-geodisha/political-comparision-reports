import raw from "@/data/politicians.json";
import supplementRaw from "@/data/pdf_supplement.json";
import type { PdfSupplement, PdfSupplementData, Platform, Politician, PoliticiansData } from "./types";

const data = raw as unknown as PoliticiansData;
const supplement = supplementRaw as unknown as PdfSupplementData;

export const PLATFORMS: Platform[] = ["facebook", "instagram", "twitter"];

export const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "Twitter",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: "#4f6bed",
  instagram: "#e1306c",
  twitter: "#38bdf8",
};

export function getPoliticians(): Politician[] {
  return data.politicians;
}

export function getPolitician(id: string): Politician | undefined {
  return data.politicians.find((p) => p.id === id);
}

export function getPdfSupplement(id: string): PdfSupplement | undefined {
  return supplement.politicians[id];
}

/** Platforms with a tracked profile for this politician (not just zero activity). */
export function trackedPlatforms(p: Politician): Platform[] {
  return PLATFORMS.filter((pl) => p.profiles.some((profile) => profile.platform === pl));
}

/** Platforms tracked for at least one politician in the set but missing for this one. */
export function untrackedPlatforms(p: Politician, allInSet: Politician[]): Platform[] {
  const mine = new Set(trackedPlatforms(p));
  const trackedAnywhere = new Set(allInSet.flatMap((x) => trackedPlatforms(x)));
  return PLATFORMS.filter((pl) => trackedAnywhere.has(pl) && !mine.has(pl));
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + (b || 0), 0);
}

export function totalFollowers(p: Politician): number {
  return sum(PLATFORMS.map((pl) => p.audience.followersByPlatform[pl]?.Followers ?? 0));
}

export function totalPosts(p: Politician): number {
  return sum(PLATFORMS.map((pl) => p.posts.totalByPlatform[pl]?.Posts ?? 0));
}

export function totalEngagement(p: Politician): number {
  return sum(PLATFORMS.map((pl) => p.engagement.totalByPlatform[pl]?.Engagement ?? 0));
}

export function totalViews(p: Politician): number {
  return sum(PLATFORMS.map((pl) => p.views.totalByPlatform[pl]?.Views ?? 0));
}

export function totalVideoViews(p: Politician): number {
  return sum(
    PLATFORMS.map((pl) => p.videoViews.totalByPlatform[pl]?.["Video Views"] ?? 0)
  );
}

export function avgEngagementRate(p: Politician): number {
  const rates = PLATFORMS.map((pl) => {
    const v = p.engagement.rateByPlatform[pl]?.["Engagement rate"];
    return typeof v === "number" ? v : 0;
  }).filter((v) => v > 0);
  if (!rates.length) return 0;
  return rates.reduce((a, b) => a + b, 0) / rates.length;
}

export function engagementRatePerFollowerPct(p: Politician): number {
  const followers = totalFollowers(p);
  if (!followers) return 0;
  return (totalEngagement(p) / followers) * 100;
}

/**
 * Builds a merged daily series across the given politicians for a given metric bucket.
 * Only sums platforms whose daily breakdown is reliable for that metric (see
 * isDailySeriesReliable) — some platform/metric combinations are only reported
 * as period totals by the source, with no trustworthy daily split.
 */
export function buildDailySeries(
  politicians: Politician[],
  metric: "posts" | "engagement" | "views" | "videoViews"
) {
  if (!politicians.length) return [];
  const dates = politicians[0].posts.dates;
  return dates.map((date, i) => {
    const row: Record<string, string | number> = { date };
    for (const p of politicians) {
      const perPlatform = reliablePlatformsFor(p, metric).map(
        (pl) => p[metric].dailyByPlatform[pl]?.[i] ?? 0
      );
      row[p.id] = sum(perPlatform);
    }
    return row;
  });
}

const TOTAL_LABEL: Record<"posts" | "engagement" | "views" | "videoViews", string> = {
  posts: "Posts",
  engagement: "Engagement",
  views: "Views",
  videoViews: "Video Views",
};

/**
 * The source export's daily-by-day breakdown doesn't always account for the
 * full period total on every platform (a known gap in the underlying data,
 * not a parsing bug — see scripts/import_politicians.py's cross-check).
 * A platform's daily series is "reliable" only when it sums to the
 * platform's reported total for that metric.
 */
export function isDailySeriesReliable(
  p: Politician,
  metric: "posts" | "engagement" | "views" | "videoViews",
  platform: Platform
): boolean {
  const daily = p[metric].dailyByPlatform[platform];
  if (!daily) return true;
  const total = p[metric].totalByPlatform[platform]?.[TOTAL_LABEL[metric]];
  if (typeof total !== "number") return true;
  return sum(daily) === total;
}

/** Platforms whose daily breakdown for this metric can be trusted (sums to the reported total). */
export function reliablePlatformsFor(
  p: Politician,
  metric: "posts" | "engagement" | "views" | "videoViews"
): Platform[] {
  return PLATFORMS.filter((pl) => isDailySeriesReliable(p, metric, pl));
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(
    n
  );
}

