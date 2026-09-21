"use client";

import { useMemo, useState } from "react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  hint?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  sortValue?: (row: T) => number | string;
  render: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

export interface FilterChip {
  key: string;
  label: string;
}

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterChips,
  activeFilter,
  onFilterChange,
  pageSize = 10,
  initialSortKey,
  initialSortAsc = false,
  emptyMessage = "No results found.",
  rowHref,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterChips?: FilterChip[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;
  pageSize?: number;
  initialSortKey?: string;
  initialSortAsc?: boolean;
  emptyMessage?: string;
  rowHref?: (row: T) => string | undefined;
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [asc, setAsc] = useState(initialSortAsc);
  const [page, setPage] = useState(1);

  const search = searchValue !== undefined ? searchValue : internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const withVals = rows.map((r) => ({ r, v: col.sortValue!(r) }));
    withVals.sort((a, b) => {
      if (typeof a.v === "string" || typeof b.v === "string") {
        return String(a.v).localeCompare(String(b.v));
      }
      return (a.v as number) - (b.v as number);
    });
    if (!asc) withVals.reverse();
    return withVals.map((x) => x.r);
  }, [rows, sortKey, asc, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  function toggleSort(col: DataTableColumn<T>) {
    if (!col.sortable) return;
    if (sortKey === col.key) setAsc(!asc);
    else {
      setSortKey(col.key);
      setAsc(false);
    }
    setPage(1);
  }

  const showToolbar = onSearchChange !== undefined || filterChips?.length;

  return (
    <div className="flex flex-col gap-3">
      {showToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange !== undefined && (
            <div className="relative w-full sm:max-w-xs">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder ?? "Search…"}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          )}
          {filterChips && filterChips.length > 0 && (
            <div className="relative sm:shrink-0">
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:overflow-visible sm:pb-0">
                {filterChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => {
                      onFilterChange?.(chip.key);
                      setPage(1);
                    }}
                    className={
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors " +
                      (activeFilter === chip.key
                        ? "bg-foreground text-white"
                        : "bg-slate-100 text-muted hover:bg-slate-200")
                    }
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-surface to-transparent sm:hidden" />
            </div>
          )}
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-sm sm:min-w-[520px]">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-left text-[11px] uppercase tracking-wide text-muted">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col)}
                    title={col.hint}
                    className={
                      "whitespace-nowrap px-3 py-2.5 font-semibold sm:px-4 " +
                      (col.sortable ? "cursor-pointer select-none hover:text-foreground" : "") +
                      (col.align === "right" ? " text-right" : "") +
                      (col.hideOnMobile ? " hidden sm:table-cell" : "")
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        <span className="text-brand">{asc ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, i) => {
                  const href = rowHref?.(row);
                  return (
                    <tr
                      key={getRowKey(row)}
                      className={
                        "border-b border-border/70 last:border-0 " +
                        (i % 2 === 1 ? "bg-surface-alt/60" : "") +
                        (href ? " cursor-pointer hover:bg-brand-light/40" : "hover:bg-slate-50")
                      }
                      onClick={
                        href
                          ? () => {
                              window.location.href = href;
                            }
                          : undefined
                      }
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={
                            "px-3 py-2.5 text-foreground sm:px-4 " +
                            (col.align === "right" ? "text-right" : "") +
                            (col.hideOnMobile ? " hidden sm:table-cell" : "")
                          }
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-surface to-transparent sm:hidden" />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-xs text-muted sm:text-sm">
          <span>
            Page {clampedPage} of {totalPages} · {sorted.length} results
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={clampedPage === 1}
              className="rounded-lg border border-border px-2.5 py-1 font-medium text-foreground disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={clampedPage === totalPages}
              className="rounded-lg border border-border px-2.5 py-1 font-medium text-foreground disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
