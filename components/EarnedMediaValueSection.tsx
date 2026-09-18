import type { Platform } from "@/lib/types";
import { PLATFORM_COLORS, PLATFORM_LABELS, PLATFORMS, formatCompactNumber } from "@/lib/data";
import { Card } from "@/components/Card";
import { DonutChart } from "@/components/charts/DonutChart";

export function EarnedMediaValueSection({
  byChannel,
  total,
}: {
  byChannel: Record<string, { value: number; avgValue: number }>;
  total: { value: number; avgValue: number };
}) {
  const donutData = PLATFORMS.filter((pl) => byChannel[pl]?.value).map((pl: Platform) => ({
    name: PLATFORM_LABELS[pl],
    value: byChannel[pl].value,
    color: PLATFORM_COLORS[pl],
  }));

  if (!donutData.length) return null;

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-foreground sm:text-xl">Earned media value</h2>
      <p className="mb-3 text-sm text-muted">
        The estimated equivalent ad-spend value of this period&rsquo;s organic reach, engagement and
        follower growth, by channel.
      </p>
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <DonutChart data={donutData} height={180} centerLabel="Total EMV" />
          <div className="min-w-[220px] flex-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="py-1.5 font-semibold">Channel</th>
                  <th className="py-1.5 text-right font-semibold">EMV</th>
                  <th className="py-1.5 text-right font-semibold">Avg. EMV / post</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORMS.filter((pl) => byChannel[pl]?.value).map((pl) => (
                  <tr key={pl} className="border-t border-border/70">
                    <td className="py-2 font-medium text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[pl] }}
                        />
                        {PLATFORM_LABELS[pl]}
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold text-foreground">
                      {formatCompactNumber(byChannel[pl].value)}
                    </td>
                    <td className="py-2 text-right text-muted">
                      {formatCompactNumber(byChannel[pl].avgValue)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-surface-alt/60">
                  <td className="py-2 font-semibold text-foreground">Total</td>
                  <td className="py-2 text-right font-bold text-foreground">
                    {formatCompactNumber(total.value)}
                  </td>
                  <td className="py-2 text-right font-medium text-muted">
                    {formatCompactNumber(total.avgValue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
