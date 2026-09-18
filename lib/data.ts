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

/** Builds a merged daily series across the given politicians for a given metric bucket. */
export function buildDailySeries(
  politicians: Politician[],
  metric: "posts" | "engagement" | "views" | "videoViews"
) {
  if (!politicians.length) return [];
  const dates = politicians[0].posts.dates;
  return dates.map((date, i) => {
    const row: Record<string, string | number> = { date };
    for (const p of politicians) {
      const perPlatform = PLATFORMS.map((pl) => p[metric].dailyByPlatform[pl]?.[i] ?? 0);
      row[p.id] = sum(perPlatform);
    }
    return row;
  });
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(
    n
  );
}

export function formatSignedPct(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export const RANK_METRICS = [
  { key: "followers", label: "Total Followers", fn: totalFollowers },
  { key: "engagement", label: "Total Engagement", fn: totalEngagement },
  { key: "posts", label: "Total Posts", fn: totalPosts },
  { key: "views", label: "Total Views", fn: totalViews },
  { key: "videoViews", label: "Total Video Views", fn: totalVideoViews },
  { key: "engagementRate", label: "Avg Engagement Rate", fn: avgEngagementRate },
] as const;

export type RankMetricKey = (typeof RANK_METRICS)[number]["key"];
