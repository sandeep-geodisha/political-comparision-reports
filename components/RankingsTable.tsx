"use client";

import { useState } from "react";
import type { Politician } from "@/lib/types";
import {
  avgEngagementRate,
  formatCompactNumber,
  totalEngagement,
  totalFollowers,
  totalPosts,
  totalViews,
} from "@/lib/data";
import { colorForId } from "@/lib/colors";
import { Avatar } from "@/components/Avatar";
import { DataTable, type DataTableColumn } from "@/components/DataTable";

interface Row {
  p: Politician;
  followers: number;
  engagement: number;
  posts: number;
  views: number;
  rate: number;
}

export function RankingsTable({ politicians }: { politicians: Politician[] }) {
  const [search, setSearch] = useState("");
  const ids = politicians.map((p) => p.id);

  const rows: Row[] = politicians
    .map((p) => ({
      p,
      followers: totalFollowers(p),
      engagement: totalEngagement(p),
      posts: totalPosts(p),
      views: totalViews(p),
      rate: avgEngagementRate(p),
    }))
    .filter((r) => r.p.name.toLowerCase().includes(search.toLowerCase()));

  const columns: DataTableColumn<Row>[] = [
    {
      key: "name",
      label: "Politician",
      sortable: true,
      sortValue: (r) => r.p.name,
      render: (r) => (
        <span className="flex items-center gap-2.5 font-medium text-foreground">
          <Avatar name={r.p.name} color={colorForId(r.p.id, ids)} size={26} />
          <span className="truncate">{r.p.name}</span>
        </span>
      ),
    },
    {
      key: "followers",
      label: "Followers",
      hint: "Combined followers across Facebook, Instagram and Twitter",
      sortable: true,
      align: "right",
      sortValue: (r) => r.followers,
      render: (r) => <span className="font-semibold">{formatCompactNumber(r.followers)}</span>,
    },
    {
      key: "engagement",
      label: "Engagement",
      hint: "Combined likes, comments and shares across all platforms this period",
      sortable: true,
      align: "right",
      sortValue: (r) => r.engagement,
      render: (r) => formatCompactNumber(r.engagement),
      hideOnMobile: true,
    },
    {
      key: "posts",
      label: "Posts",
      hint: "Total posts published across all platforms this period",
      sortable: true,
      align: "right",
      sortValue: (r) => r.posts,
      render: (r) => formatCompactNumber(r.posts),
      hideOnMobile: true,
    },
    {
      key: "views",
      label: "Views",
      hint: "Total content views across all platforms this period",
      sortable: true,
      align: "right",
      sortValue: (r) => r.views,
      render: (r) => formatCompactNumber(r.views),
      hideOnMobile: true,
    },
    {
      key: "rate",
      label: "Avg. Engagement Rate",
      hint: "Average engagement rate across platforms — engagement as a share of followers",
      sortable: true,
      align: "right",
      sortValue: (r) => r.rate,
      render: (r) => <span className="font-semibold text-brand-dark">{r.rate.toFixed(2)}%</span>,
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowKey={(r) => r.p.id}
      searchPlaceholder="Search politicians…"
      searchValue={search}
      onSearchChange={setSearch}
      initialSortKey="followers"
      rowHref={(r) => `/politicians/${r.p.id}`}
      pageSize={10}
    />
  );
}
