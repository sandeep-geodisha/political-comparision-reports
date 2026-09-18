export type Platform = "facebook" | "instagram" | "twitter";

export interface BrandProfile {
  handle: string;
  platform: Platform;
  followers: number;
  engagement: number;
  engagementRatePerFollower: number;
  posts: number;
}

export interface Kpi {
  current: number;
  previous: number;
  changePct: number | null;
}

export interface PlatformFollowers {
  Followers: number;
  "Followers diff. percent vs previous period": number;
}

export interface PlatformFollowersDiff {
  "Followers diff": number;
  "Followers growth percent vs previous period": number;
}

export interface PlatformTotal {
  [label: string]: number;
}

export interface TopPost {
  page: string;
  link: string;
  date: string;
  type: string;
  engagement: number;
  engagementRate: number | null;
}

export interface ChangeMetric {
  current: number;
  changePct: number | null;
}

export interface ContentPillar {
  name: string;
  posts: number;
  engagement: number;
  avgEngagementRate: number;
  topChannel: Platform;
}

export interface EarnedMediaValueEntry {
  value: number;
  avgValue: number;
}

export interface PdfSupplement {
  keyMetrics: {
    brandComments: ChangeMetric;
    brandLikes: ChangeMetric;
    brandGrowthOfFollowers: ChangeMetric;
  };
  insightsSummary: string[];
  observations: string[];
  contentPillars: ContentPillar[];
  earnedMediaValue: {
    byChannel: Record<string, EarnedMediaValueEntry>;
    total: EarnedMediaValueEntry;
  };
}

export interface Politician {
  id: string;
  name: string;
  sourceFile: string;
  dateRange: string;
  profiles: BrandProfile[];
  kpis: Record<string, Kpi>;
  audience: {
    followersByPlatform: Record<string, PlatformFollowers>;
    followersDiffByPlatform: Record<string, PlatformFollowersDiff>;
  };
  posts: {
    dates: string[];
    dailyByPlatform: Record<string, number[]>;
    totalByPlatform: Record<string, PlatformTotal>;
  };
  engagement: {
    dailyByPlatform: Record<string, number[]>;
    totalByPlatform: Record<string, PlatformTotal>;
    rateByPlatform: Record<string, PlatformTotal>;
  };
  views: {
    dailyByPlatform: Record<string, number[]>;
    totalByPlatform: Record<string, PlatformTotal>;
  };
  videoViews: {
    dailyByPlatform: Record<string, number[]>;
    totalByPlatform: Record<string, PlatformTotal>;
  };
  topPosts: TopPost[];
}

export interface PoliticiansData {
  politicians: Politician[];
}

export interface PdfSupplementData {
  politicians: Record<string, PdfSupplement>;
}
