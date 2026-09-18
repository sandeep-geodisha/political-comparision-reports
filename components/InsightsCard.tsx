import { Card } from "@/components/Card";

export function InsightsCard({
  summary,
  observations,
}: {
  summary: string[];
  observations: string[];
}) {
  if (!summary.length && !observations.length) return null;

  return (
    <Card
      title="Key insights"
      subtitle="Auto-generated summary of this period's performance"
      className="border-brand/20 bg-gradient-to-br from-brand-light/40 via-surface to-surface"
    >
      <div className="flex flex-col gap-2.5 text-sm leading-relaxed text-foreground/90">
        {summary.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {observations.length > 0 && (
        <div className="mt-5 rounded-xl border border-brand/15 bg-brand-light/30 p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.6.6 1 1.4 1 2.3v.2h6v-.2c0-.9.4-1.7 1-2.3A6 6 0 0012 3z" />
            </svg>
            Recommended next steps
          </p>
          <ul className="flex flex-col gap-2 text-sm text-foreground/85">
            {observations.map((obs, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
