"use client";

import { useState } from "react";
import type { PdfSupplement, TopPost } from "@/lib/types";
import { formatCompactNumber } from "@/lib/data";
import { Card } from "@/components/Card";
import { PostEmbedModal } from "@/components/PostEmbedModal";

export function InstagramSupplementSection({
  supplement,
  politicianName,
}: {
  supplement: NonNullable<PdfSupplement["instagramSupplement"]>;
  politicianName: string;
}) {
  const [activePost, setActivePost] = useState<TopPost | null>(null);

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">Instagram (separate source)</h2>
      <p className="mb-3 text-sm text-muted">
        Manually sourced for @{supplement.handle}, covering {supplement.dateRange}.
      </p>
      <Card className="border-amber-200 bg-amber-50/40">
        <div className="flex items-start gap-2 text-xs text-amber-800">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.18A2 2 0 004 21h16a2 2 0 001.89-2.96L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{supplement.note}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
          <div className="rounded-xl bg-surface-alt/70 px-3 py-3">
            <p className="text-lg font-bold text-foreground">{formatCompactNumber(supplement.followers)}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">Followers</p>
          </div>
          <div className="rounded-xl bg-surface-alt/70 px-3 py-3">
            <p className="text-lg font-bold text-foreground">{supplement.posts}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">Posts</p>
          </div>
          <div className="rounded-xl bg-surface-alt/70 px-3 py-3">
            <p className="text-lg font-bold text-foreground">{formatCompactNumber(supplement.views)}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">Views</p>
          </div>
          <div className="rounded-xl bg-surface-alt/70 px-3 py-3">
            <p className="text-lg font-bold text-foreground">{supplement.avgPostsPerDay.toFixed(2)}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">Avg posts / day</p>
          </div>
          <div className="rounded-xl bg-surface-alt/70 px-3 py-3">
            <p className="text-lg font-bold text-foreground">{formatCompactNumber(supplement.avgViewsPerPost)}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">Avg views / post</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Engagement (unverified)</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{formatCompactNumber(supplement.engagement.total)}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted">Total engagement</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{formatCompactNumber(supplement.engagement.avgPerPost)}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted">Avg engagement / post</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-amber-800/90">{supplement.engagement.caveat}</p>
        </div>

        {supplement.topPosts.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Top posts</p>
            <div className="flex flex-col divide-y divide-border/70 overflow-hidden rounded-xl border border-border">
              {supplement.topPosts.map((post) => (
                <button
                  key={post.link}
                  type="button"
                  onClick={() =>
                    setActivePost({
                      page: politicianName,
                      link: post.link,
                      date: post.date,
                      type: post.type,
                      engagement: post.engagement,
                      engagementRate: null,
                    })
                  }
                  className="flex items-center justify-between gap-3 bg-surface px-3 py-2.5 text-left text-sm hover:bg-surface-alt/60"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="whitespace-nowrap text-xs text-muted">{post.date}</span>
                    <span className="truncate rounded-full bg-brand-light/60 px-2 py-0.5 text-[11px] font-medium capitalize text-brand-dark">
                      {post.type.replace(/_/g, " ")}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-foreground">
                    {formatCompactNumber(post.engagement)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {activePost && <PostEmbedModal post={activePost} onClose={() => setActivePost(null)} />}
    </div>
  );
}
