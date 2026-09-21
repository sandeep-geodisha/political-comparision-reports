import {
  PLATFORMS,
  PLATFORM_LABELS,
  reliablePlatformsFor,
  totalEngagement,
  totalFollowers,
  totalPosts,
  totalViews,
} from "./data";
import type { Platform, Politician } from "./types";

// ---------------------------------------------------------------------------
// Efficiency metrics — standard digital-campaign ratios. Each is a direct
// division of two reported totals, nothing inferred or weighted.
// ---------------------------------------------------------------------------

export function engagementPerPost(p: Politician): number {
  const posts = totalPosts(p);
  return posts > 0 ? totalEngagement(p) / posts : 0;
}

export function viewsPerPost(p: Politician): number {
  const posts = totalPosts(p);
  return posts > 0 ? totalViews(p) / posts : 0;
}

export function engagementPerFollowerPct(p: Politician): number {
  const followers = totalFollowers(p);
  return followers > 0 ? (totalEngagement(p) / followers) * 100 : 0;
}

function sumArr(vals: number[]): number {
  return vals.reduce((a, b) => a + (b || 0), 0);
}

// ---------------------------------------------------------------------------
// Biggest single-day engagement spike — a factual observation ("this day was
// N% above this candidate's own daily average"), tied to the specific post
// where a match exists. Not a score, not a judgment call.
// ---------------------------------------------------------------------------

export interface EngagementSpike {
  date: string;
  value: number;
  dailyAverage: number;
  vsAverage: number;
  matchingTopPost?: { page: string; type: string; engagement: number; link: string };
}

export function biggestEngagementSpike(p: Politician): EngagementSpike | null {
  const platforms = reliablePlatformsFor(p, "engagement");
  const dates = p.posts.dates;
  const daily = dates.map((date, i) => ({
    date,
    value: sumArr(platforms.map((pl) => p.engagement.dailyByPlatform[pl]?.[i] ?? 0)),
  }));
  if (!daily.length) return null;
  const mean = sumArr(daily.map((d) => d.value)) / daily.length;
  const top = daily.reduce((max, d) => (d.value > max.value ? d : max), daily[0]);
  if (top.value <= 0 || mean === 0) return null;

  // Top-posts dates are formatted like "10 Sep"; daily-series dates like "10 September 2026".
  const shortDate = formatShortDate(top.date);
  const matchingTopPost = p.topPosts.find((tp) => tp.date === shortDate);

  return {
    date: top.date,
    value: top.value,
    dailyAverage: mean,
    vsAverage: (top.value / mean - 1) * 100,
    matchingTopPost: matchingTopPost
      ? {
          page: matchingTopPost.page,
          type: matchingTopPost.type,
          engagement: matchingTopPost.engagement,
          link: matchingTopPost.link,
        }
      : undefined,
  };
}

function formatShortDate(fullDate: string): string {
  const [day, month] = fullDate.split(" ");
  return `${day} ${month.slice(0, 3)}`;
}

// ---------------------------------------------------------------------------
// Platform strategy — audience and engagement concentration by channel.
// Plain percentages, no scoring.
// ---------------------------------------------------------------------------

export interface PlatformShare {
  platform: Platform;
  followerSharePct: number;
  engagementSharePct: number;
}

export function platformShares(p: Politician): PlatformShare[] {
  const followers = totalFollowers(p);
  const engagement = totalEngagement(p);
  return PLATFORMS.map((pl) => ({
    platform: pl,
    followerSharePct: followers > 0 ? ((p.audience.followersByPlatform[pl]?.Followers ?? 0) / followers) * 100 : 0,
    engagementSharePct:
      engagement > 0 ? ((p.engagement.totalByPlatform[pl]?.Engagement ?? 0) / engagement) * 100 : 0,
  }));
}

/** The single platform holding the largest share of a politician's audience. */
export function dominantPlatform(p: Politician): PlatformShare {
  const shares = platformShares(p);
  return shares.reduce((max, s) => (s.followerSharePct > max.followerSharePct ? s : max), shares[0]);
}

export interface WhitespaceOpportunity {
  platform: Platform;
  politicianFollowerSharePct: number;
  bestRivalName: string;
  bestRivalFollowerSharePct: number;
  gap: number;
}

/**
 * A platform where this politician holds under 25% of their audience while
 * at least one rival holds 35%+ of theirs there — a concrete, named gap
 * rather than an abstract ranking. Thresholds are fixed and stated in the UI,
 * not tuned per candidate.
 */
export function whitespaceOpportunity(p: Politician, rivals: Politician[]): WhitespaceOpportunity | null {
  if (!rivals.length) return null;
  const myShares = Object.fromEntries(platformShares(p).map((s) => [s.platform, s.followerSharePct]));

  let best: WhitespaceOpportunity | null = null;
  for (const pl of PLATFORMS) {
    const mine = myShares[pl] ?? 0;
    if (mine >= 25) continue;
    for (const rival of rivals) {
      const rivalShare = platformShares(rival).find((s) => s.platform === pl)?.followerSharePct ?? 0;
      if (rivalShare < 35) continue;
      const gap = rivalShare - mine;
      if (!best || gap > best.gap) {
        best = {
          platform: pl,
          politicianFollowerSharePct: mine,
          bestRivalName: rival.name,
          bestRivalFollowerSharePct: rivalShare,
          gap,
        };
      }
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Field-wide ranking — for a chosen metric, who's #1/#2/#3, with the actual
// value and the gap to the leader. No blending across metrics.
// ---------------------------------------------------------------------------

export interface FieldRankingRow {
  politicianId: string;
  name: string;
  value: number;
  rank: number;
  pctOfLeader: number;
}

export function rankByMetric(
  politicians: Politician[],
  valueFn: (p: Politician) => number
): FieldRankingRow[] {
  const withValues = politicians.map((p) => ({ p, value: valueFn(p) }));
  withValues.sort((a, b) => b.value - a.value);
  const leaderValue = withValues[0]?.value || 1;
  return withValues.map((x, i) => ({
    politicianId: x.p.id,
    name: x.p.name,
    value: x.value,
    rank: i + 1,
    pctOfLeader: leaderValue > 0 ? (x.value / leaderValue) * 100 : 0,
  }));
}

export const FIELD_METRICS = [
  { key: "followers", label: "Total followers", fn: totalFollowers, format: "compact" as const },
  { key: "engagement", label: "Total engagement", fn: totalEngagement, format: "compact" as const },
  {
    key: "engagementPerPost",
    label: "Engagement per post",
    fn: engagementPerPost,
    format: "compact" as const,
    hint: "Average likes, comments, shares and reactions on a single post (total engagement divided by total posts)",
  },
  { key: "views", label: "Total views", fn: totalViews, format: "compact" as const },
  { key: "posts", label: "Total posts", fn: totalPosts, format: "compact" as const },
] as const;

// ---------------------------------------------------------------------------
// Narrative summary — every sentence states a specific number pulled
// directly from the metrics above. No composite scores, no "leads/wins"
// framing beyond what a single named metric actually shows.
// ---------------------------------------------------------------------------

export function buildComparisonNarrative(politicians: Politician[]): string[] {
  if (politicians.length < 2) return [];
  const paragraphs: string[] = [];

  const byFollowers = rankByMetric(politicians, totalFollowers);
  const byEngPerPost = rankByMetric(politicians, engagementPerPost);
  const byEngPerFollower = rankByMetric(politicians, engagementPerFollowerPct);

  paragraphs.push(
    `${byFollowers[0].name} has the largest combined audience at ${Math.round(byFollowers[0].value).toLocaleString()} followers` +
      (byFollowers.length > 1
        ? `, ahead of ${byFollowers
            .slice(1)
            .map((r) => `${r.name} (${Math.round(r.value).toLocaleString()})`)
            .join(" and ")}.`
        : ".")
  );

  if (byEngPerPost[0].politicianId !== byFollowers[0].politicianId) {
    paragraphs.push(
      `A bigger audience doesn't mean better content performance. ${byEngPerPost[0].name} earns the most ` +
        `engagement per post in the field at ${Math.round(byEngPerPost[0].value).toLocaleString()}, even though ` +
        `${byFollowers[0].name} has more followers.`
    );
  }

  paragraphs.push(
    `${byEngPerFollower[0].name} has the highest engagement per follower at ` +
      `${byEngPerFollower[0].value.toFixed(2)}%. This shows how actively an audience interacts, ` +
      `regardless of its size.`
  );

  const spikes = politicians
    .map((p) => ({ p, spike: biggestEngagementSpike(p) }))
    .filter((x): x is { p: Politician; spike: EngagementSpike } => x.spike !== null)
    .sort((a, b) => b.spike.vsAverage - a.spike.vsAverage);
  if (spikes.length) {
    const top = spikes[0];
    const postNote = top.spike.matchingTopPost
      ? `, driven by a ${top.spike.matchingTopPost.type} post that alone drew ` +
        `${top.spike.matchingTopPost.engagement.toLocaleString()} engagements`
      : "";
    paragraphs.push(
      `${top.p.name}'s single highest engagement day in the period was ${top.spike.date}, ` +
        `${Math.round(top.spike.vsAverage)}% above their own daily average${postNote}.`
    );
  }

  const dominants = politicians.map((p) => ({ p, dom: dominantPlatform(p) }));
  const allSamePlatform = dominants.every((d) => d.dom.platform === dominants[0].dom.platform);
  if (!allSamePlatform) {
    const platformList = dominants
      .map(
        (d) =>
          `${d.p.name} on ${PLATFORM_LABELS[d.dom.platform]} (${Math.round(d.dom.followerSharePct)}% of their audience)`
      )
      .join(", ");
    paragraphs.push(`Each campaign concentrates on a different platform: ${platformList}.`);
  }

  return paragraphs;
}
