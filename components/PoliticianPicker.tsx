"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Politician } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { colorForId } from "@/lib/colors";

export function PoliticianPicker({
  politicians,
  selectedIds,
}: {
  politicians: Politician[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allIds = politicians.map((p) => p.id);

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length) params.set("ids", next.join(","));
    else params.delete("ids");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="relative">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 sm:flex-wrap sm:overflow-visible">
        {politicians.map((p) => {
          const active = selectedIds.includes(p.id);
          const color = colorForId(p.id, allIds);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all " +
                (active
                  ? "border-transparent text-white shadow-sm"
                  : "border-border bg-surface text-muted hover:border-slate-300 hover:text-foreground")
              }
              style={
                active
                  ? { background: `linear-gradient(135deg, ${color}, ${color}cc)` }
                  : undefined
              }
            >
              <Avatar name={p.name} color={active ? "rgba(255,255,255,0.3)" : color} size={20} />
              {p.name}
              {active && <span className="ml-0.5 text-xs opacity-80">✕</span>}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent sm:hidden" />
    </div>
  );
}
