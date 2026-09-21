"use client";

import { useMemo, useState } from "react";
import type { TopPost } from "@/lib/types";
import { formatCompactNumber } from "@/lib/data";
import { DataTable, type DataTableColumn, type FilterChip } from "@/components/DataTable";
import { PostEmbedModal } from "@/components/PostEmbedModal";

const TYPE_COLORS: Record<string, string> = {
  reel: "#ec4899",
  image: "#6366f1",
  photo: "#6366f1",
  video: "#f59e0b",
  carousel_album: "#10b981",
};

export function TopPostsTable({ posts }: { posts: TopPost[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activePost, setActivePost] = useState<TopPost | null>(null);

  const types = useMemo(() => Array.from(new Set(posts.map((p) => p.type))), [posts]);
  const chips: FilterChip[] = [
    { key: "all", label: "All types" },
    ...types.map((t) => ({ key: t, label: t.replace(/_/g, " ") })),
  ];

  const filtered = posts.filter((post) => {
    if (typeFilter !== "all" && post.type !== typeFilter) return false;
    if (search && !post.page.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: DataTableColumn<TopPost>[] = [
    {
      key: "date",
      label: "Date",
      hint: "Date the post was published",
      sortable: true,
      sortValue: (p) => p.date,
      render: (p) => <span className="whitespace-nowrap text-muted">{p.date}</span>,
    },
    {
      key: "page",
      label: "Account",
      hint: "The social media account the post was published from",
      sortable: true,
      sortValue: (p) => p.page,
      render: (p) => <span className="font-medium">{p.page}</span>,
      hideOnMobile: true,
    },
    {
      key: "engagement",
      label: "Engagement",
      hint: "Total likes, comments and shares this post received",
      sortable: true,
      align: "right",
      sortValue: (p) => p.engagement,
      render: (p) => <span className="font-bold text-foreground">{formatCompactNumber(p.engagement)}</span>,
    },
    {
      key: "type",
      label: "Post type",
      hint: "The format of the post — image, video, reel, etc.",
      sortable: true,
      sortValue: (p) => p.type,
      render: (p) => (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize"
          style={{
            backgroundColor: `${TYPE_COLORS[p.type] ?? "#94a3b8"}1a`,
            color: TYPE_COLORS[p.type] ?? "#64748b",
          }}
        >
          {p.type.replace(/_/g, " ")}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "engagementRate",
      label: "Engagement rate",
      hint: "Engagement as a share of the account's followers",
      sortable: true,
      align: "right",
      sortValue: (p) => p.engagementRate ?? 0,
      render: (p) => (p.engagementRate != null ? `${p.engagementRate.toFixed(2)}%` : "—"),
      hideOnMobile: true,
    },
    {
      key: "link",
      label: "Post",
      hint: "Watch or view this post without leaving the page",
      align: "right",
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActivePost(p);
          }}
          className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-brand hover:text-brand-dark hover:underline"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          View
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        rows={filtered}
        columns={columns}
        getRowKey={(p) => p.link}
        searchPlaceholder="Search by page…"
        searchValue={search}
        onSearchChange={setSearch}
        filterChips={chips}
        activeFilter={typeFilter}
        onFilterChange={setTypeFilter}
        initialSortKey="engagement"
        pageSize={8}
      />
      {activePost && <PostEmbedModal post={activePost} onClose={() => setActivePost(null)} />}
    </>
  );
}
