import { formatSignedPct } from "@/lib/data";

export function ChangeBadge({ value }: { value: number | null | undefined }) {
  const isUp = typeof value === "number" && value > 0;
  const isDown = typeof value === "number" && value < 0;
  return (
    <span
      title="Change vs. the previous period of the same length"
      className={
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold sm:text-xs " +
        (isUp
          ? "bg-positive-bg text-positive"
          : isDown
            ? "bg-negative-bg text-negative"
            : "bg-slate-100 text-muted")
      }
    >
      {isUp ? "▲" : isDown ? "▼" : ""} {formatSignedPct(value)}
    </span>
  );
}
