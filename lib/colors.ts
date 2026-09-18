const PALETTE = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#3b82f6", "#ef4444"];

export function colorForIndex(i: number): string {
  return PALETTE[i % PALETTE.length];
}

export function colorForId(id: string, allIds: string[]): string {
  const i = allIds.indexOf(id);
  return colorForIndex(i < 0 ? 0 : i);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
