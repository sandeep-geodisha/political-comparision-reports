import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-border/80 bg-surface shadow-[0_1px_1px_rgba(15,23,42,0.03),0_16px_32px_-16px_rgba(15,23,42,0.16)] ring-1 ring-black/[0.02] " +
        (padded ? "p-4 sm:p-6 " : "") +
        className
      }
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-foreground sm:text-base">{title}</h3>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-muted sm:text-sm">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  change,
  accent,
  icon,
  hint,
}: {
  label: string;
  value: string;
  change?: ReactNode;
  accent?: string;
  icon?: ReactNode;
  hint?: string;
}) {
  const color = accent ?? "var(--brand)";
  return (
    <div
      title={hint}
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-4 shadow-[0_1px_1px_rgba(15,23,42,0.03),0_12px_28px_-14px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-16px_rgba(15,23,42,0.22)] sm:p-5"
      style={{ borderTopWidth: 3, borderTopColor: color }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.10] transition-transform duration-300 group-hover:scale-125"
        style={{ background: color }}
      />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-muted sm:text-xs">
          {label}
        </p>
        {icon ??
          (hint && (
            <span className="shrink-0 text-muted/60" aria-hidden>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 16v-5" />
                <path strokeLinecap="round" d="M12 8h.01" />
              </svg>
            </span>
          ))}
      </div>
      <div className="relative mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {value}
        </span>
        {change}
      </div>
    </div>
  );
}
