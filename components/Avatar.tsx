import type { CSSProperties } from "react";
import { initials } from "@/lib/colors";

export function Avatar({
  name,
  color,
  size = 40,
  ring = false,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className={
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm " +
        (ring ? "ring-4" : "")
      }
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        ...(ring ? ({ ["--tw-ring-color" as string]: `${color}22` } as CSSProperties) : {}),
      }}
    >
      {initials(name)}
    </div>
  );
}
